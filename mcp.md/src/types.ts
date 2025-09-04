export type Input = { 
  topic: string,
  paths: string[],
  rank: number
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
  rule?: 'MUST' | 'SHOULD' | 'MUST NOT',
  text: string,
  tags: string[],
  data: Record<string, any>
};
export type Chunk = RawChunk & {
  rank?: number,
  embedding: number[]
};

export type Logger = (type: string, message: string) => Promise<void>;