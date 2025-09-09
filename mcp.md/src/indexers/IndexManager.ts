import IdIndexer from './IdIndexer.js';
import DocumentIndexer from './DocumentIndexer.js';
import TagIndexer from './TagIndexer.js';
import EmbeddingIndexer from './EmbeddingIndexer.js';

export default class IndexManager {
  //storage path
  public readonly storage: string;
  //id cache
  protected _ids?: IdIndexer;
  //document cache(topic:path => DocumentEntry)
  protected _documents?: DocumentIndexer;
  //tag cache (tag => [ids])
  protected _tags?: TagIndexer;
  //embedding cache (id => row # in embeddings.bin)
  protected _embeddings?: EmbeddingIndexer;

  /**
   * Returns the ID indexer.
   */
  public get ids() {
    if (!this._ids) {
      this._ids = IdIndexer.load(this.storage);
    }
    return this._ids;
  }

  /**
   * Returns the Document indexer.
   */
  public get documents() {
    if (!this._documents) {
      this._documents = DocumentIndexer.load(this.storage);
    }
    return this._documents;
  }

  /**
   * Returns the Tag indexer.
   */
  public get tags() {
    if (!this._tags) {
      this._tags = TagIndexer.load(this.storage);
    }
    return this._tags;
  }

  /**
   * Returns the Embedding indexer.
   */
  public get embeddings() {
    if (!this._embeddings) {
      this._embeddings = EmbeddingIndexer.load(this.storage);
    }
    return this._embeddings;
  }

  /**
   * Sets the storage path
   */
  public constructor(storage: string) {
    this.storage = storage;
  }
}