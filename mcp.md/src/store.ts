//node
import fs from 'node:fs';
import path from 'node:path';
//src
import type { Chunk, Logger } from './types.js';
import { embed, glob, getConfig, toChunks } from './helpers.js';

/**
 * Calculates the Euclidean norm (magnitude) of a vector.
 */
export function vectorNorm(vector: number[]): number {
  return Math.sqrt(vector.reduce((sum, value) => sum + value * value, 0));
}

/**
 * Calculates the dot product of two vectors.
 */
export function dotProduct(vectorA: number[], vectorB: number[]): number {
  return vectorA.reduce((sum, value, index) => sum + value * vectorB[index], 0);
}

/**
 * Calculates the cosine similarity between two vectors.
 */
export function cosineSimilarity(vectorA: number[], vectorB: number[]): number {
  const normA = vectorNorm(vectorA);
  const normB = vectorNorm(vectorB);
  return dotProduct(vectorA, vectorB) / (normA * normB || 1);
}

/**
 * Ingests all Markdown files in the specified workspace.
 */
export async function ingest(cwd: string, log?: Logger) {
  //example config
  // input:
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
  const { inputs, output, batch_size } = getConfig(cwd);
  //determine output storage path
  const storage = !output.startsWith('/') 
    ? path.join(cwd, output) 
    : output;

  //initialize the store
  const store = new JsonlStore(storage);
  const tags = new Set<string>(['ruleset', 'knowledge base']);
  //ingest each repo
  for (const { topic, paths, rank } of inputs) {
    //find all markdown files in the repo
    const files = glob(cwd, paths);
    //get raw chunks data
    const rawChunks = files
      //filter out any files starting with `.` (these are private)
      .filter(pathname => !path.basename(pathname).startsWith('.'))
      //change from absolute to relative paths
      .map(pathname => pathname.substring(cwd.length))
      //create the chunks
      .flatMap(pathname => toChunks(topic, cwd, pathname));
    //add all tags to the set
    rawChunks.forEach(chunk => chunk.tags.forEach(tag => tags.add(tag)));
    //purge any existing chunks for this topic
    store.purge(topic);
    //embed in batches and insert into the store
    for (let i = 0; i < rawChunks.length; i += batch_size) {
      const batch = rawChunks.slice(i, i + batch_size);
      const embs = await embed(batch.map(b => b.text));
      log && log(
        'info', 
        `Embedded ${rawChunks[i].path} ${i}-${i + batch.length} / ${rawChunks.length}`
      );
      batch.forEach((batch, j) => {
        const chunk: Chunk = {
          ...batch,
          rank,
          embedding: embs[j]
        };
        store.insert(topic, chunk);
      });
    }
    log && log('success', `Ingested ${topic}: ${rawChunks.length} chunks`);
  }
  //save the tags to tags.json
  tags.delete('');
  tags.delete('readme');
  fs.writeFileSync(
    path.join(output, 'tags.json'), 
    JSON.stringify(Array.from(tags), null, 2)
  );
}

export default class JsonlStore {
  //The root directory for the JSONL files.
  public readonly url: string;
  //tag list
  protected _tags?: string[];

  /**
   * Sets the root directory for the JSONL files.
   */
  public constructor(url: string) {
    this.url = url;
    if (!fs.existsSync(url)) {
      fs.mkdirSync(url, { recursive:true });
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
    return path.join(this.url, `${topic}.jsonl`); 
  }

  /**
   * Inserts a chunk of data to the JSONL file for a specific topic.
   */
  public insert(topic: string, chunk: Chunk) {
    fs.appendFileSync(
      this.fileFor(topic), 
      JSON.stringify(chunk) + '\n', 
      'utf8'
    );
    return this;
  }

  /**
   * Reads the JSONL file for a specific topic.
   */
  public load(topic?: string): Chunk[] {
    if (topic) return this._readFile(this.fileFor(topic));
    // read all
    const files = fs.readdirSync(this.url).filter(f => f.endsWith('.jsonl'));
    return files.flatMap(f => this._readFile(path.join(this.url, f)));
  }

  /**
   * Purges (empties) the JSONL file for a specific topic.
   */
  public purge(topic: string) {
    const file = this.fileFor(topic);
    if (fs.existsSync(file)) {
      fs.writeFileSync(file, '');
    }
    return this;
  }

  /**
   * Searches for chunks that match the query embedding.
   */
  public search(
    query: number[], 
    options: { 
      topic?: string,
      must?: boolean,
      tags?: string[],
      take: number
    }
  ) {
    const { topic, must, tags, take } = options;
    const contexts = this.load(topic);
    const scored = contexts
      .filter(context => !must || context.rule === 'MUST')
      .filter(context => !tags?.length || tags.some(t => context.tags.includes(t)))
      .map(context => ({
        context, 
        score: cosineSimilarity(query, context.embedding)
      }));

    // Optional: boost upstream deps via dependency_rank
    scored.forEach(scoring => {
      if (typeof scoring.context.rank === 'number') {
        scoring.score *= (1 + (0.1 * (1 / (scoring.context.rank || 1))));
      }
    });

    return scored
      .sort((a, b) => b.score-a.score)
      .slice(0, take)
      .map(scoring => scoring.context);
  }

  /**
   * Gets the list of tags.
   */
  public tags(query?: string) {
    if (!this._tags) {
      this._tags = this._readFile<string>(
        path.join(this.url, 'index-tags.json')
      );
    }
    if (query) {
      return this._tags.filter(tag => tag.includes(query));
    }
    return this._tags;
  }

  /**
   * Reads a JSONL file and returns an array of chunks.
   */
  private _readFile<T = Chunk>(filepath: string): T[] {
    if (!fs.existsSync(filepath)) return [];
    return fs
      .readFileSync(filepath, 'utf8')
      .split('\n')
      .filter(Boolean)
      .map(l => JSON.parse(l));
  }
};
