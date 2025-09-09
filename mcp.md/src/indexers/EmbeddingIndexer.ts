//node
import fs from 'node:fs';
import path from 'node:path';
//src
import type { Chunk, EmbeddingsIndex } from '../types.js';
import AbstractIndexer from './AbstractIndexer.js';
import { loadJson, saveJson } from '../helpers.js';

export default class EmbeddingIndexer extends AbstractIndexer<number> {
  /**
   * Loads the document index from disk.
   */
  public static load(storage: string) {
    //create new indexer
    const indexer = new EmbeddingIndexer();
    //load the embeddings
    const index = path.join(storage, 'index', 'embeddings.json');
    const data = loadJson<EmbeddingsIndex|null>(index, null);
    //if no embeddings found
    if (!data) {
      //just return the indexer
      return indexer;
    }
    //extract data
    const { dimensions, rows, map } = data;
    //add the map to the indexer
    Object.entries(map).forEach(
      ([ id, row ]) => indexer.set(id, row)
    );
    //look for embeddings.bin
    const bin = path.join(storage, 'index', 'embeddings.bin');
    if (!fs.existsSync(bin) || dimensions === 0 || rows === 0) {
      return indexer;
    }
    //get the buffer from the bin file
    const buffer = fs.readFileSync(bin);
    //convert to float32
    const float32 = new Float32Array(
      buffer.buffer, 
      buffer.byteOffset, 
      buffer.byteLength / 4
    );
    //sanity: float length must match dim * rows
    const expected = dimensions * rows;
    const total = float32.length;
    //determine actual row count
    const safeRows = expected > 0 && expected <= total 
      ? rows 
      : Math.floor(total / (dimensions || 1));
    //for each row
    for (let row = 0; row < safeRows; row++) {
      //add to vectors
      const start = row * dimensions;
      const end = start + dimensions;
      indexer.vectors.push(Array.from(float32.slice(start, end)));
    }
    return indexer;
  }

  //this is what will be saved to embeddings.bin
  //ex. [[vector numbers...], [vector numbers...], ...]
  protected _vectors: number[][] = [];

  /**
   * Returns the vectors array.
   */
  public get vectors() {
    return this._vectors;
  }

  /**
   * Adds an embedding vector to the vectors array.
   */
  public embed(vector: number[]) {
    this._vectors.push(vector);
    return this;
  }
  
  /**
   * Index a chunk by its ID.
   */
  public index(chunk: Chunk) {
    this.set(chunk.id, this._vectors.length);
    this.embed(chunk.embedding);
    return this;
  }

  /**
   * Saves the index to disk as JSON.
   */
  public async save(storage: string) {
    //determine the json path
    const index = path.join(storage, 'index', 'embeddings.json');
    //Write embeddings.bin (Float32Array)
    //need to get length for each vector (it's usuall all the same length)
    const dimensions = this._vectors[0]?.length || 0;
    //No vectors yet? Write empty metadata and return.
    if (dimensions === 0 || this._vectors.length === 0) {
      saveJson(index, { dimensions: 0, rows: 0, map: {} });
      return this;
    }
    //byte offset for each vector
    const buffer = Buffer.allocUnsafe(this._vectors.length * dimensions * 4);
    //offset in bytes
    let offset = 0;
    //for each embedding vector
    for (const vector of this._vectors) {
      //convert to float32 array
      const float32 = new Float32Array(vector);
      //convert to bytes and copy to buffer at offset
      Buffer.from(float32.buffer).copy(buffer, offset);
      //increment offset by the bytes length
      offset += float32.byteLength;
    }
    //write the index mapping to embeddings.json
    saveJson(index, {
      dimensions,
      rows: this._vectors.length,
      map: Object.fromEntries(this.entries())
    });
    //now you can write the buffer to a binary file
    const bin = path.join(storage, 'index', 'embeddings.bin');
    fs.writeFileSync(bin, buffer);
    return this;
  }
};