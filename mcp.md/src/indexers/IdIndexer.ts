//node
import path from 'node:path';
//src
import type { Chunk, Position, IdEntry } from '../types.js';
import AbstractIndexer from './AbstractIndexer.js';
import { loadJson, saveJson } from '../helpers.js';

export default class IdIndexer extends AbstractIndexer<IdEntry> {
  /**
   * Loads the document index from disk.
   */
  public static load(storage: string) {
    const indexer = new IdIndexer();
    const index = path.join(storage, 'index', 'ids.json');
    const data = loadJson<Record<string, IdEntry>>(index, {});
    Object.entries(data).forEach(([key, value]) => {
      indexer.set(key, value);
    });
    return indexer;
  }

  /**
   * Index a chunk by its ID.
   */
  public index(chunk: Chunk,  position: Position) {
    //determine corpus
    const corpus = chunk.tags.includes('ruleset') 
      ? 'ruleset' 
      : 'knowledge';
    //add to indexer
    this.set(chunk.id, {
      database: position.path,
      offset: position.offset,
      length: position.length,
      topic: chunk.topic,
      document: chunk.path,
      section: chunk.section,
      headings: chunk.headings,
      tags: chunk.tags,
      rank: chunk.rank,
      corpus
    });
    return this;
  }

  /**
   * Saves the index to disk as JSON.
   */
  public async save(storage: string) {
    const index = path.join(storage, 'index', 'ids.json');
    const entries = Array.from(this.entries());
    saveJson(index, Object.fromEntries(entries));
    return this;
  }
};