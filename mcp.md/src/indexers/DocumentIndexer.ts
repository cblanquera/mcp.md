//node
import path from 'node:path';
//src
import type { Chunk, DocumentEntry } from '../types.js';
import AbstractIndexer from './AbstractIndexer.js';
import { loadJson, saveJson } from '../helpers.js';

export default class DocumentIndexer extends AbstractIndexer<DocumentEntry> {
  /**
   * Loads the document index from disk.
   */
  public static load(storage: string) {
    const indexer = new DocumentIndexer();
    const index = path.join(storage, 'index', 'documents.json');
    const data = loadJson<Record<string, DocumentEntry>>(index, {});
    Object.entries(data).forEach(([key, value]) => {
      indexer.set(key, value);
    });
    return indexer;
  }

  /**
   * Index a chunk by its ID.
   */
  public index(chunk: Chunk) {
    const key = `${chunk.topic}:${chunk.path}`;
    if (!this.has(key)) {
      //determine corpus
      const corpus = chunk.tags.includes('ruleset') 
        ? 'ruleset' 
        : 'knowledge';
      //add to indexer
      this.set(`${chunk.topic}:${chunk.path}`, {
        topic: chunk.topic,
        tags: chunk.tags,
        corpus,
        sections: [ { id: chunk.id, section_path: chunk.headings } ]
      });
      return this;
    }

    const entry = this.get(key)!;
    //add tags
    chunk.tags.forEach(tag => {
      if (!entry.tags.includes(tag)) {
        entry.tags.push(tag);
      }
    });
    //add section
    entry.sections.push({ id: chunk.id, section_path: chunk.headings });
    //make sure the order of sections are correct after each push
    entry.sections.sort(
      (a, b) => (a.section_path.join('.') || '').localeCompare(
        b.section_path.join('.') || '', 
        undefined, 
        { numeric: true }
      )
    );
    return this;
  }

  /**
   * Saves the index to disk as JSON.
   */
  public async save(storage: string) {
    const index = path.join(storage, 'index', 'documents.json');
    const entries = Array.from(this.entries());
    saveJson(index, Object.fromEntries(entries));
    return this;
  }
};