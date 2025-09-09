export type RuleType = 'MUST' | 'SHOULD' | 'MAY' | 'MUST NOT';
export type Corpus = 'knowledge' | 'ruleset';

export type Input = { 
  topic: string,
  paths: string[],
  rank?: number
};
export type Config = { 
  name: string,
  version: string,
  inputs: Input[],
  output: string,
  batch_size: number,
  openai_host?: string,
  openai_key?: string,
  embedding_model: string,
  budgets: { 
    max_chunk_tokens: number, 
    overlap_tokens: number 
  } 
};

export type RawChunk = {
  id: string,
  topic: string,
  path: string,
  section: string,
  headings: string[],
  rule?: RuleType,
  text: string,
  tags: string[],
  data: Record<string, any>
};
export type Chunk = RawChunk & {
  rank?: number,
  embedding: number[]
};

export type Logger = (type: string, message: string) => Promise<void>;

export type Position = { path: string, offset: number, length: number };

export type IdEntry = {
  //Topic file containing the JSONL line (e.g., "coding.jsonl")
  database: string,
  //Byte offset of the line in the JSONL file
  offset: number,
  //Byte length of the line in the JSONL file
  length: number,
  //Optional denormalized data for fast filtering
  topic: string,
  //document-relative path
  document: string,
  headings: string[],
  //e.g., "2.1.3"
  section: string,
  tags: string[],
  rank?: number,
  corpus: Corpus
};
export type DocumentEntry = {
  //Optional denormalized data for fast filtering
  topic: string,
  //union of all tags in document
  tags: string[],
  //dominant corpus (first section wins if mixed)
  corpus: Corpus
  //Minimal TOC with enough info to answer listSections quickly
  sections: Array<{ id: string; section_path: string[] }>
};
export type EmbeddingsIndex = {
  dimensions: number,
  rows: number,
  map: Record<string, number>
};

export type ChecklistItem = {
  id: string,
  rule: RuleType | null,
  title: string,
  topic: string | undefined,
  document: string | undefined,
  section: string | undefined
};

export type DiffContext = {
  cosine?: number,
  left: {
    id: string,
    headings: string[],
    rule: RuleType | null,
    length: number
  },
  right: {
    id: string,
    headings: string[],
    rule: RuleType | null,
    length: number
  },
  hints?: {
    rule_changed: boolean;
    heading_changed: boolean;
    length_delta: number;
  }
};