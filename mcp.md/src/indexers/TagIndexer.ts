//node
import path from 'node:path';
//src
import type { Chunk } from '../types.js';
import AbstractIndexer from './AbstractIndexer.js';
import { loadJson, saveJson } from '../helpers.js';

export default class TagIndexer extends AbstractIndexer<string[]> {
  /**
   * Loads the document index from disk.
   */
  public static load(storage: string) {
    const indexer = new TagIndexer();
    const index = path.join(storage, 'index', 'tags.json');
    const data = loadJson<Record<string, string[]>>(index, {});
    Object.entries(data).forEach(([key, value]) => {
      indexer.set(key, value);
    });
    return indexer;
  }

  /**
   * Index a chunk by its tags.
   */
  public index(chunk: Chunk) {
    const ignore = [ 'readme' ];
    chunk.tags.forEach(tag => {
      tag = tag.trim();
      if (!tag || ignore.includes(tag)) return;
      if (!this.has(tag)) {
        this.set(tag, []);
      }
      const tags = this.get(tag)!;
      if (!tags.includes(chunk.id)) {
        tags.push(chunk.id);
      }
    });
    return this;
  }

  /**
   * Saves the index to disk as JSON.
   */
  public async save(storage: string) {
    const index = path.join(storage, 'index', 'tags.json');
    const entries = Array.from(this.entries());
    saveJson(index, Object.fromEntries(entries));
    return this;
  }
};