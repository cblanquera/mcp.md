//node
import fs from 'node:fs';
import path from 'node:path';
//src
import type { Chunk, Logger } from './types.js';
import Store from './store.js';
import IdIndexer from './indexers/IdIndexer.js';
import DocumentIndexer from './indexers/DocumentIndexer.js';
import TagIndexer from './indexers/TagIndexer.js';
import EmbeddingIndexer from './indexers/EmbeddingIndexer.js';
import { 
  appendJson,
  cosineSimilarity,
  getConfig, 
  loadJsonl,
  loadJson,
  resolvePath, 
  chunks,
} from './helpers.js';

export default class JsonlStore {
  /**
   * Ingests all Markdown files in the specified workspace.
   */
  public async ingest(cwd: string, log?: Logger) {
    //example config
    // inputs:
    //   - topic: coding
    //     paths: [ "docs/coding/**/*.md" ]
    //     rank: 10
    //   - topic: documenting
    //     paths: [ "docs/documenting/**/*.md" ]
    //     rank: 10
    //   - topic: testing
    //     paths: [ "docs/testing/**/*.md" ]
    //     rank: 10
    // output: "database"
    // batch_size: 64
    // openai_host: "https://api.openai.com/v1"
    // openai_key: "sk-xxx"
    // embedding_model: "local"
    // budgets:
    //   max_chunk_tokens: 400
    //   overlap_tokens: 32
    const { inputs, output, batch_size: size } = getConfig(cwd);
    //determine output storage path
    const storage = resolvePath(output, cwd);
    //create an id indexer
    const idIndexer = new IdIndexer(storage);
    //create a document indexer
    const documentIndexer = new DocumentIndexer(storage);
    //create a tag indexer
    const tagIndexer = new TagIndexer(storage);
    //create row id to index in embedding.bin indexer
    const embeddingIndexer = new EmbeddingIndexer(storage);
    //get all topics
    const topics = inputs.map(input => input.topic);
    //initialize the store
    const store = new Store(storage, topics);
    for await (const { chunk, stats } of chunks(store, cwd, inputs, size)) {
      const position = store.insert(chunk.topic, chunk);
      if (stats.current === stats.total) {
        log && log('success', `Ingested ${chunk.topic}: ${stats.total} chunks`);
      } else {
        const headings = chunk.headings.join(' → ');
        const message = `${headings}: ${stats.current} / ${stats.total}`;
        log && log('info', `Inserting ${message}`);
      }
      //this is where we all all the indexers...
      idIndexer.index(chunk, position);
      documentIndexer.index(chunk);
      tagIndexer.index(chunk);
      embeddingIndexer.index(chunk);
    }
    //save all the indexers
    idIndexer.save();
    documentIndexer.save();
    tagIndexer.save();
    embeddingIndexer.save();
    //done
    log && log('success', 'Ingestion complete!');
  }

  //The folder where jsonl files are stored
  public readonly storage: string;
  //topic names cache
  protected _topics: string[];
  //tag list cache
  protected _tags: Record<string, string[]> = {};
  //topics data cache
  protected _data = new Map<string, Chunk[]>();

  /**
   * Sets the project config.
   */
  public constructor(storage: string, topics: string[]) {
    this.storage = storage;
    this._topics = topics;
    if (!fs.existsSync(this.storage)) {
      fs.mkdirSync(this.storage, { recursive:true });
    }
  }

  /**
   * Drops the JSONL file for a specific topic.
   */
  public drop(topic: string) {
    const file = this.fileFor(topic);
    if (fs.existsSync(file)) {
      fs.unlinkSync(file);
    }
    return this;
  }

  /**
   * Gets the file path for a specific topic.
   */
  public fileFor(topic: string) { 
    return path.join(this.storage, `${topic}.jsonl`); 
  }

  /**
   * Inserts a chunk of data to the JSONL file for a specific topic.
   */
  public insert(topic: string, chunk: Chunk) {
    return appendJson(this.fileFor(topic), chunk);
  }

  /**
   * Reads the JSONL file for a specific topic.
   */
  public load(topic?: string) {
    //if they want to load a specific topic
    if (topic) {
      //if we haven't cached it yet, read and cache it
      if (!this._data.has(topic)) {
        this._data.set(topic, loadJsonl(this.fileFor(topic)));
      }
      //return the cached topic
      return this._data.get(topic)!;
    }
    //just load all topics
    this._topics.forEach(topic => this.load(topic));
    return Array.from(this._data.values()).flat();
  }

  /**
   * Purges (empties) the JSONL file for a specific topic.
   */
  public purge(topic: string) {
    const file = this.fileFor(topic);
    if (fs.existsSync(file)) {
      fs.writeFileSync(file, '');
    }
    //clear the cache
    this._data.set(topic, []);
    return this;
  }

  /**
   * Searches for chunks that match the query embedding.
   */
  public search(options: { 
    query?: number[],
    topic?: string,
    must?: boolean,
    should?: boolean,
    may?: boolean,
    optionalTags?: string[],
    requiredTags?: string[],
    take?: number
  }) {
    const { 
      query, 
      topic, 
      must, 
      should, 
      may, 
      optionalTags, 
      requiredTags, 
      take 
    } = options;
    const contexts = this.load(topic);
    const rules: string[] = [];
    if (must) rules.push('MUST');
    if (should) rules.push('SHOULD');
    if (may) rules.push('MAY');
    const scored = contexts
      .filter(context => !rules.length 
        || rules.includes(context.rule || '')
      )
      .filter(context => !optionalTags?.length 
        || optionalTags.some(tag => context.tags.includes(tag))
      )
      .filter(context => !requiredTags?.length 
        || requiredTags.every(tag => context.tags.includes(tag))
      )
      .map(context => ({
        context, 
        score: query ? cosineSimilarity(query, context.embedding) : 0
      }));

    // Optional: boost upstream deps via rank
    scored.forEach(scoring => {
      if (typeof scoring.context.rank === 'number') {
        scoring.score *= (1 + (0.1 * (1 / (scoring.context.rank || 1))));
      }
    });

    if (!take) {
      return scored
        .sort((a, b) => b.score-a.score)
        .map(scoring => scoring.context);
    }

    return scored
      .sort((a, b) => b.score-a.score)
      .slice(0, take)
      .map(scoring => scoring.context);
  }

  /**
   * Gets the list of tags.
   */
  public tags(query?: string) {
    if (!this._tags.size) {
      //get all the tags
      const index = path.join(this.storage, 'index', 'tags.json')
      this._tags = loadJson<Record<string, string[]>>(index, {});
    }
    if (query) {
      return Object.keys(this._tags).filter(tag => tag.includes(query));
    }
    return this._tags;
  }
};
