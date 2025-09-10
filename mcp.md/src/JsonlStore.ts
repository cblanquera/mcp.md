//node
import fs from 'node:fs';
import path from 'node:path';
//src
import type { Chunk, Logger } from './types.js';
import IndexManager from './indexers/IndexManager.js';
import IdIndexer from './indexers/IdIndexer.js';
import DocumentIndexer from './indexers/DocumentIndexer.js';
import TagIndexer from './indexers/TagIndexer.js';
import EmbeddingIndexer from './indexers/EmbeddingIndexer.js';
import { 
  appendJson,
  getConfig, 
  loadJsonl,
  resolvePath, 
  chunks,
  tagify,
  embed
} from './helpers.js';

export default class JsonlStore {
  /**
   * Ingests all Markdown files in the specified workspace.
   */
  public static async ingest(cwd: string, log?: Logger) {
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
    const idIndexer = new IdIndexer();
    //create a document indexer
    const documentIndexer = new DocumentIndexer();
    //create a tag indexer
    const tagIndexer = new TagIndexer();
    //create row id to index in embedding.bin indexer
    const embeddingIndexer = new EmbeddingIndexer();
    //get all topics
    const topics = inputs.map(input => input.topic);
    //initialize the store
    const store = new JsonlStore(storage, topics);
    for await (const { chunk, stats } of chunks(store, cwd, inputs, size)) {
      const position = store.insert(chunk.topic, chunk);
      const headings = chunk.headings.join(' → ');
      const section = chunk.section.indexOf('.') > -1 
        ? chunk.section.substring(chunk.section.indexOf('.') + 1) + ' '
        : '';
      const message = `${section}${headings}: ${stats.current} / ${stats.total}`;
      log && log('info', `Inserted ${message}`);
      if (stats.current === stats.total) {
        log && log('success', `Ingested ${chunk.topic}: ${stats.total} chunks`);
      }
      //this is where we all all the indexers...
      idIndexer.index(chunk, position);
      documentIndexer.index(chunk);
      tagIndexer.index(chunk);
      embeddingIndexer.index(chunk);
    }
    //save all the indexers
    idIndexer.save(storage);
    documentIndexer.save(storage);
    tagIndexer.save(storage);
    embeddingIndexer.save(storage);
    //done
    log && log('success', 'Ingestion complete!');
  }

  //The folder where jsonl files are stored
  public readonly storage: string;
  public readonly index: IndexManager;
  //topic names cache (instead of the store guessing from files)
  protected _topics: string[];
  //topics data cache
  protected _data = new Map<string, Chunk[]>();

  /**
   * Returns a list of topics
   */
  public get topics() {
    return [ ...this._topics ];
  }

  /**
   * Sets the project config.
   */
  public constructor(storage: string, topics: string[]) {
    this.storage = storage;
    this._topics = topics;
    this.index = new IndexManager(storage);
    if (!fs.existsSync(this.storage)) {
      fs.mkdirSync(this.storage, { recursive:true });
    }
  }

  //--------------------------------------------------------------------//
  // Basic Store Operations

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
   * Gets a chunk by its ID.
   */
  public get(id: string) {
    //get IdEntry from id indexer
    const entry = this.index.ids.get(id);
    if (!entry) return null;
    //open the file (get the pointer)
    const pointer = fs.openSync(entry.database, 'r');
    try {
      //create a buffer to hold the data
      const buffer = Buffer.allocUnsafe(entry.length);
      //read specific data from the database file
      fs.readSync(pointer, buffer, 0, entry.length, entry.offset);
      //return it as a Chunk
      return JSON.parse(buffer.toString('utf8')) as Chunk;
    } finally {
      //close the file pointer
      fs.closeSync(pointer);
    }
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
  public async search(
    query: string, 
    options: {
      topics?: string[],
      includeTags?: string[],
      requireTags?: string[],
      excludeTags?: string[],
      snippetOnly?: boolean,
      mode?: 'simple' | 'semantic' | 'hybrid',
      limit?: number,
      cursor?: string,
      embeddingOptions?: { 
        model?: string, 
        token?: string,
        host?: string 
      }
    }
  ) {
    //extract options
    const {
      topics, 
      includeTags, 
      requireTags, 
      excludeTags, 
      snippetOnly = false,
      mode = 'hybrid',
      limit = 10,
      cursor,
      embeddingOptions
    } = options || {};
    //1. Candidate id set seeded by tags/topics (using postings lists 
    // where possible)
    let candidateIds: Set<string> | null = null;

    //Topic filter: reduce to ids that belong to these topics
    if (topics?.length) {
      candidateIds = new Set<string>();
      for (const [_, entry] of this.index.documents.entries()) {
        if (topics.includes(entry.topic)) {
          entry.sections.forEach(section => candidateIds!.add(section.id));
        }
      }
    }

    //Tag include (OR)
    if (includeTags?.length) {
      const includeSet = new Set<string>();
      for (const tag of includeTags) {
        const tags = this.index.tags.get(tag) || [];
        tags.forEach(id => includeSet.add(id));
      }
      candidateIds = candidateIds 
        ? new Set([ ...candidateIds ].filter(id => includeSet.has(id))) 
        : includeSet;
    }
    //Tag require (AND)
    if (requireTags?.length) {
      for (const tag of requireTags) {
        const idsForTag = new Set(this.index.tags.get(tag) || []);
        candidateIds = candidateIds 
          ? new Set([...candidateIds].filter(id => idsForTag.has(id))) 
          : idsForTag;
      }
    }
    //Tag exclude (NOT)
    if (excludeTags?.length) {
      const excludeSet = new Set<string>();
      for (const tag of excludeTags) {
        const tags = this.index.tags.get(tag) || [];
        tags.forEach(id => excludeSet.add(id));
      }
      candidateIds = candidateIds
        ? new Set([...candidateIds].filter(id => !excludeSet.has(id)))
        : new Set(Object.keys(this.index.ids).filter(id => !excludeSet.has(id)));
    }

    //If still null, default to all ids (rare; consider requiring at 
    //least a topic or a tag for large corpora)
    if (!candidateIds) {
      candidateIds = new Set(this.index.ids.keys());
    }

    //2. Prepare query embedding once (if not simple mode)
    let queryEmbedding: number[] | undefined;
    if (mode !== 'simple') {
      [ queryEmbedding ] = await embed([ query ], embeddingOptions);
    }
    const queryLower = query.toLowerCase();

    //3. Score candidates: semantic (fast via embeddings.bin) + optional 
    //lexical (requires reading minimal text)
    const embeddings = this.index.embeddings;
    const vectors = embeddings.vectors;
    const dimensions = vectors[0]?.length || 0;

    const scored: { id: string; score: number; language?: string }[] = [];

    for (const id of candidateIds) {
      const index = embeddings.get(id);
      if (index == null) continue;
      const vector = vectors[index];

      // semantic score
      let score = 0;
      if (mode !== 'simple' && queryEmbedding) {
        // Convert queryEmbedding to Float32Array for faster dot product
        const q = new Float32Array(queryEmbedding);
        // cosineSimilarity on typed arrays
        let dot = 0, normA = 0, normB = 0;
        for (let i = 0; i < dimensions; i++) {
          const a = q[i], b = vector[i];
          dot += a * b; normA += a * a; normB += b * b;
        }
        score += dot / (Math.sqrt(normA) * Math.sqrt(normB) || 1);
      }

      // optional lexical score (read only the single line)
      if (mode !== 'semantic') {
        const chunk = this.get(id);
        if (chunk) {
          if (chunk.text.toLowerCase().includes(queryLower)) {
            score += 0.5;
          }
          for (const heading of chunk.headings) {
            if (heading.toLowerCase().includes(queryLower)) { 
              score += 0.25; 
              break; 
            }
          }
          // small code bias for snippetOnly
          if (snippetOnly && /```/.test(chunk.text)) {
            score += 0.2;
          }
        }
      }

      scored.push({ id, score });
    }

    scored.sort((a, b) => b.score - a.score);

    //4. Pagination (offset cursor)
    const take = Math.max(1, Math.min(50, limit));
    const offset = cursor 
      ? parseInt(Buffer.from(cursor, 'base64').toString('utf8'), 10) || 0 
      : 0;
    const page = scored.slice(offset, offset + take);
    const nextOffset = offset + page.length;
    const nextCursor = nextOffset < scored.length 
      ? Buffer.from(String(nextOffset), 'utf8').toString('base64') 
      : undefined;

    //5. Map to hits with light denorm
    const hits = page.map(row => {
      const pointer = this.index.ids.get(row.id)!;
      const chunk = this.get(row.id);
      return {
        id: row.id,
        topic: pointer.topic,
        document: pointer.document,
        sectionPath: chunk?.headings || [],
        tags: pointer.tags,
        snippet: chunk?.text || '',
        language: chunk && /```([a-zA-Z0-9+_-]+)/.exec(chunk.text)?.[1],
        score: row.score,
        corpus: pointer.corpus
      };
    });

    return { hits, nextCursor };
  }

  //--------------------------------------------------------------------//
  // Index Operations

  /** 
   * Fetch an entire document or a subset of sections by ids or by 
   * heading-paths.
   */
  public getDocumentMeta(topic: string, document: string, sections?: string[]) {
    //get document entry from index
    const entry = this.index.documents.get(`${topic}:${document}`);
    //if no entry, return null
    if (!entry) return null;
    //determine the selected sections (by default all sections)
    const selected = sections && sections.length
      ? entry.sections.filter(
        section => sections.includes(section.id)
          || sections.includes(
            section.section_path.join(' > ')
          )
      )
      : entry.sections;

    const sectionsWithText = selected.map(section => {
      const chunk = this.get(section.id);
      return {
        id: section.id,
        sectionPath: section.section_path,
        text: chunk?.text || '',
        tags: chunk?.tags || []
      };
    });

    return {
      meta: { 
        topic: entry.topic, 
        document: document, 
        corpus: entry.corpus, 
        tags: entry.tags 
      },
      sections: sectionsWithText
    };
  }

  /**
   * Retrieves the sections of a document.
   */
  public getDocumentSections(topic: string, document: string) {
    const key = `${topic}:${document}`;
    const entry = this.index.documents.get(key);
    return entry ? entry.sections : [];
  }

  /**
   * Fetch specific section(s) by id; small neighborhood expansion can 
   * be done using the precomputed TOC.
   */
  public getSectionsByIds(
    ids: string[], 
    expand?: { before?: number; after?: number }
  ) {
    const sections: { 
      id: string,
      sectionPath: string[],
      text: string,
      tags: string[] 
    }[] = [];

    for (const id of ids) {
      //get the IdEntry from the index
      const pointer = this.index.ids.get(id);
      //if no pointer, skip
      if (!pointer) continue;
      //get the chunk from the store
      const row = this.get(id);
      //if no chunk, skip
      if (!row) continue;
      //add the main section
      sections.push({ 
        id: row.id, 
        sectionPath: row.headings, 
        text: row.text, 
        tags: row.tags 
      });
      //if no expansion, skip
      if (!expand || (!expand.before && !expand.after)) continue;
      //determine the document key
      const key = `${pointer.topic}:${pointer.document}`;
      //get the document entry from the index
      const document = this.index.documents.get(key);
      //if no document found, skip
      if (!document) continue;
      //find the index of the section in the document
      const index = document.sections.findIndex(
        section => section.id === id
      );
      //determine the start index for expansion
      const start = Math.max(0, index - (expand.before || 0));
      //determine the end index for expansion
      const end = Math.min(
        document.sections.length, 
        index + 1 + (expand.after || 0)
      );
      //for each neighboring section, add it to the results
      //skip the main section (we already added it)
      for (let i = start; i < end; i++) {
        //get the neighboring section
        const neighbor = document.sections[i];
        //skip self
        if (neighbor.id === id) continue;
        //get the chunk for the neighboring section
        const relative = this.get(neighbor.id);
        //if no chunk found, skip
        if (!relative) continue;
        //add the neighboring section
        sections.push({
          id: relative.id,
          sectionPath: relative.headings,
          text: relative.text,
          tags: relative.tags
        });
      }
    }

    return sections;
  }

  /**
   * Retrieves documents from the index.
   */
  public searchDocuments(options?: {
    topics?: string[],
    includeTags?: string[],
    requireTags?: string[],
    excludeTags?: string[],
    corpus?: 'knowledge' | 'ruleset',
    sort?: 'title' | 'sections' | 'topic',
    order?: 'asc' | 'desc',
    limit?: number
    cursor?: string
  }) {
    const { 
      topics, 
      includeTags, 
      requireTags, 
      excludeTags, 
      sort = 'title', 
      corpus,
      order,
      limit = 50,
      cursor
    } = options || {};
    //get documents from index
    const documents = Array.from(this.index.documents.entries())
      .filter(([ _, entry]) => {
        // corpus filter
        if (corpus && entry.corpus !== corpus) return false;
        // topic filter
        if (topics?.length 
          && !topics.includes(entry.topic)
        ) return false;
        // tags OR/AND/NOT filters
        if (includeTags?.length 
          && !includeTags.some(tag => entry.tags.includes(tag))
        ) return false;
        if (requireTags?.length 
          && !requireTags.every(tag => entry.tags.includes(tag))
        ) return false;
        if (excludeTags?.length 
          && excludeTags.some(tag => entry.tags.includes(tag))
        ) return false;
        return true;
      })
      .sort((a, b) => {
        const direction = order === 'desc' ? -1 : 1;
        switch (sort) {
          case 'sections':
            return direction * (a[1].sections.length - b[1].sections.length);
          case 'topic':
            return direction * a[1].topic.localeCompare(b[1].topic);
          default:
            return direction * a[0].localeCompare(b[0]);
        }
      })
      .map(([ document, entry]) => ({ ...entry, document }));
    const maxLimit = Math.max(1, Math.min(500, limit));
    const offset = cursor 
      ? parseInt(Buffer.from(cursor, 'base64').toString('utf8'), 10) || 0 
      : 0;
    const results = documents.slice(offset, offset + maxLimit);
    const nextOffset = offset + results.length;
    const nextCursor = nextOffset < documents.length 
      ? Buffer.from(String(nextOffset), 'utf8').toString('base64') 
      : undefined;
    return { documents: results, nextCursor };
  }

  /** 
   * List available tags with counts. Supports simple query filtering 
   * and limiting.
   */
  public searchTags(options?: { query?: string, limit?: number }) {
    //get options
    const { query, limit } = options || {};
    const tags = this.index.tags
      //get all tags with counts
      .map<[ string, number ]>((ids, tag) => [ tag, ids.length ])
      //if query, filter by query
      .filter(([ tag ]) => !query 
        || tag.toLowerCase().includes(query.toLowerCase())
      )
      //sort by number of ids (desc)
      .sort((a, b) => b[1] - a[1])
      //only tags
      .map(([ tag ]) => tag);
    //limit results
    return limit ? tags.slice(0, limit) : tags;
  }

  /**
   * Suggest tags based on existing tags in the index.
   */
  public suggestTags(
    phrases: string[], 
    options?: { namespaces?: string[]; limitPerPhrase?: number }
  ) {
    //get options
    const { namespaces, limitPerPhrase = 5 } = options || {};
    //determine limit
    const limit = Math.max(1, Math.min(10, limitPerPhrase));
    //for each phrase, get matching tags
    return phrases.map(phrase => {
      //tagify phrases
      const needle = tagify(phrase);
      //get matching tags
      let candidates = this.searchTags().filter(
        tag => tag.includes(needle)
      );
      //if namespaces
      if (namespaces?.length) {
        //filter by namespaces (prefixes)
        candidates = candidates.filter(
          tag => namespaces!.some(name => tag.startsWith(name))
        );
      }
      return candidates.slice(0, limit);
    });
  }
};
