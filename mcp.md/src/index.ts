export type {
  Input,
  Config,
  RawChunk,
  Chunk,
  Logger
} from './types.js';

export {
  //general helpers
  ensureDir,
  //server helpers
  getConfig,
  //store helpers
  appendJson,
  cosineSimilarity,
  dotProduct,
  vectorNorm,
  chunks,
  embed,
  glob,
  loadJsonl,
  loadJson,
  resolvePath,
  tagify,
  toChunks,
  saveJson,
} from './helpers.js'

export {
  searchContextShape,
  getContextShape,
  dependencyGraphShape,
  buildBriefShape,
  registerSearchContext,
  registerGetContext,
  registerGetTags,
  registerDependencyGraph,
  registerBuildBrief
} from './server.js';

import * as templates from './templates.js';

import serve from './server.js';
import JsonlStore from './JsonlStore.js';
import AbstractIndexer from './indexers/AbstractIndexer.js';
import IdIndexer from './indexers/IdIndexer.js';
import DocumentIndexer from './indexers/DocumentIndexer.js';
import TagIndexer from './indexers/TagIndexer.js';
import EmbeddingIndexer from './indexers/EmbeddingIndexer.js';
import terminal from './terminal.js';

export {
  serve,
  JsonlStore,
  AbstractIndexer,
  IdIndexer,
  DocumentIndexer,
  TagIndexer,
  EmbeddingIndexer,
  terminal,
  templates
};

