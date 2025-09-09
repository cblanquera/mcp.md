//node
import fs from 'node:fs';
import path from 'node:path';
//modules
import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import matter from 'gray-matter';
import yaml from 'js-yaml';
//src
import type { 
  Input,
  Config,
  RawChunk, 
  Chunk
} from './types.js';
import type JsonlStore from './JsonlStore.js';

export const RULES = /\b(MUST NOT|MUST|SHOULD)\b/;
export const config: Record<string, Config> = {};

//--------------------------------------------------------------------//
// General Helpers

/**
 * Ensures the specified directory exists, creating it recursively 
 * if necessary.
 */
export function ensureDir(dirPath: string) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};


//--------------------------------------------------------------------//
// Server Helpers

//export async function embed() { [see below] }

/**
 * Retrieves information from the context-pack.yaml file.
 */
export function getConfig(cwd: string) {
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
  //if config is not already loaded
  if (!config[cwd]) {
    //determine config path
    const configPath = path.join(cwd, 'config.yml');
    //if path doesnt exist
    if (!fs.existsSync(configPath)) {
      //throw error
      throw new Error(`Could not find config.yml at ${configPath}`);
    }
    //load the config
    config[cwd] = yaml.load(fs.readFileSync(configPath, 'utf-8')) as Config;
    //set defaults
    config[cwd].output = config[cwd].output || 'database';
    config[cwd].batch_size = config[cwd].batch_size || 64;
    config[cwd].embedding_model = config[cwd].embedding_model || 'local';
  }
  //either way, return the config
  return config[cwd];
};

//--------------------------------------------------------------------//
// Store Helpers

//export function getConfig(cwd: string) { [see above] }

/**
 * Append a line to a JSONL file and return {offset,length}. We keep 
 * offsets so we can read a line back without loading the whole file.
 */
export function appendJson(filepath: string, object: unknown) {
  ensureDir(path.dirname(filepath));
  const serialized = JSON.stringify(object) + '\n';
  const offset = fs.existsSync(filepath) ? fs.statSync(filepath).size : 0;
  fs.appendFileSync(filepath, serialized, 'utf8');
  return { path: filepath, offset, length: Buffer.byteLength(serialized) };
};

/**
 * Generator for each chunk given the workspace and inputs.
 */
export async function *chunks(
  store: JsonlStore, 
  cwd: string,
  inputs: Input[], 
  size: number
) {  
  //ingest each repo
  for (const { topic, paths, rank } of inputs) {
    //find all markdown files in the repo
    const chunks: RawChunk[] = [];
    for ( const [ root, files ] of glob(cwd, paths).entries()) {
      chunks.push(...files
        //filter out any files starting with `.` (these are private)
        .filter(pathname => !path.basename(pathname).startsWith('.'))
        //make absolute to relative to root
        .map(pathname => pathname.substring(root.length + 1))
        //create the chunks
        .flatMap(pathname => toChunks(topic, root, pathname))
      );
    }
    //purge any existing chunks for this topic
    store.purge(topic);
    //embed in batches and insert into the store
    for (let i = 0; i < chunks.length; i += size) {
      const batch = chunks.slice(i, i + size);
      const embeds = await embed(batch.map(b => b.text));
      for (let j = 0; j < batch.length; j++) {
        const chunk: Chunk = {
          ...batch[j],
          rank,
          embedding: embeds[j]
        };
        yield { 
          chunk, 
          stats: { 
            current: i + j + 1, 
            total: chunks.length 
          } 
        };
      }
    }
  }
};

/**
 * Generates embeddings for an array of input texts using a remote API.
 */
export async function embed(
  texts: string[], 
  options?: {
    model?: string,
    token?: string,
    host?: string
  }
): Promise<number[][]> {
  const { model = 'local', token, host } = options || {};
  if (model === 'local') {
    //This transpiles to require() in cjs...
    //const { pipeline } = await import('@xenova/transformers');
    const { pipeline } = await new Function(
      "return import('@xenova/transformers')"
    )();
    const pipe = await pipeline(
      'feature-extraction', 
      'Xenova/all-MiniLM-L6-v2'
    );
    return Promise.all(texts.map(async t => {
      const e = await pipe(t, { pooling: 'mean', normalize: true });
      return Array.from(e.data);
    }));
  } else if (!host || !token) {
    throw new Error(`Missing host or token for embedding API`);
  }
  //get embeddings (openrouter doesn't have an endpoint for this)
  const response = await fetch(`${host}/embeddings`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ input: texts, model })
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch embeddings: ${response.statusText}`);
  }
  const json = await response.json();
  return json.data.map((d: any) => d.embedding);
};

/**
 * Returns a list of all .md files in the given root directory
 * that match the provided glob patterns.
 * (super-tiny glob: only ** / *.md and *.md)
 */
export function glob(root: string, paths: string[]) {
  const files = new Map<string, string[]>();
  //walks the given directory recursively returning all .md files
  function walk(cwd: string, folder: string) {
    for (const entity of fs.readdirSync(folder, { withFileTypes: true })) {
      const pathname = path.join(folder, entity.name);
      if (entity.isDirectory()) walk(cwd, pathname);
      else if (entity.isFile() && entity.name.endsWith('.md')) {
        //if theres no entry for this cwd yet
        if (!files.has(cwd)) {
          //create one
          files.set(cwd, []);
        }
        //now add the file to the list
        files.get(cwd)?.push(pathname);
      }
    }
  }
  //start walking for each pattern's base path
  paths.forEach(folder => {
    const current = !folder.startsWith('/') ? path.join(root, folder) : folder
    walk(current, current);
  });
  //return the collected .md files
  return files;
};

/**
 * Reads a JSON file and returns the parsed object, or a default value
 */
export function loadJson<T = unknown>(filename: string, defaultValue: T) {
  if (!fs.existsSync(filename)) {
    return defaultValue;
  }
  const raw = fs.readFileSync(filename, 'utf8');
  try {
    return JSON.parse(raw) as T;
  } catch {
    return defaultValue;
  }
};

/**
 * Reads a JSONL file and returns an array of chunks.
 */
export function loadJsonl<T = Chunk>(filepath: string): T[] {
  if (!fs.existsSync(filepath)) return [];
  return fs
    .readFileSync(filepath, 'utf8')
    .split('\n')
    .filter(Boolean)
    .map(l => JSON.parse(l));
};

/**
 * Figures out the absolute path for a given pathname.
 */
export function resolvePath(pathname: string, cwd: string) {
  return !pathname.startsWith('/') 
    ? path.join(cwd, pathname) 
    : pathname;
};

/**
 * Converts a phrase into a tag-friendly format.
 */
export function tagify(phrase: string) {
  if (phrase.endsWith('.md')) {
    phrase = phrase.slice(0, -3);
  }
  return phrase
    .replace(/[-_]/g, ' ')
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .toLowerCase()
    .trim();
};

/**
 * Converts a Markdown file into an array of chunks.
 * ex. ** / lib.md → [ { id: 'lib:lib.md#0', ... }, ... ]
 * Used by: ingest (indexers)
 */
export function toChunks(
  //ex. reactus
  topic: string,
  //ex. /file/to/reactus
  fileRoot: string,
  //ex. docs/to/reactus/lib.md
  pathname: string,
) {
  //read the markdown file
  const raw = fs.readFileSync(path.join(fileRoot, pathname), 'utf8');
  //YAML front-matter → data
  const { content, data } = matter(raw); 
  //split content into lines
  const lines = content.split('\n');

  const chunks: RawChunk[] = [];
  let current: string[] = [];
  let headings: string[] = [];
  let sectionId = 100;
  const sectionMap: number[] = [];
  //collect all tags for per repo
  const topicTags = new Set([ topic ]);
  //add tags from pathname
  pathname.split('/').forEach(name => {
    const tag = tagify(name)
    if (tag) topicTags.add(tag);
  });

  //flushes the current chunk
  const flush = () => {
    //create the chunk
    const text = current.join('\n').trim();
    if (!text) return;
    //determine the rule level
    const rule = text.match(RULES)?.[1] as RawChunk['rule'];
    const section = sectionMap.join('.');
    //create a set of all chunk tags
    const tags = new Set([...topicTags]);
    tags.add(rule ? 'ruleset': 'knowledge base')
    //add headings to chunk tags
    headings.forEach(heading => tags.add(tagify(heading)));
    //push the chunk
    chunks.push({
      id: sectionMap.length 
        ? `${topic}:${pathname}#${section}`
        : `${topic}:${pathname}#${sectionId++}`,
      topic,
      path: pathname,
      section,
      headings: [ ...headings ],
      rule,
      text,
      tags: [ ...tags ],
      data
    });
    current = [];
  };

  //process each line
  let inCode: string | false = false;
  for (const line of lines) {
    //check for headers
    const headers = line.match(/^(#{1,6})\s+(.*)$/);
    if (headers && !inCode) {
      //flush the current chunk
      flush();
      //...next see if the headers changed...
      //ex. ###
      const level = headers[1].length;
      //ex. 1.1. My Heading
      const title = headers[2].trim().replace(/^([0-9]+\.)+\s+/, '').trim();
      headings = headings.slice(0, level-1);
      headings[level-1] = title;
      if (level > sectionMap.length) {
        sectionMap.push(1);
      } else if (level === sectionMap.length) {
        sectionMap[level - 1]++;
      } else {
        while (sectionMap.length > level) sectionMap.pop();
        sectionMap[level - 1]++;
      }
      continue;
    }
    //we need to case for markdown in code...
    const code = line.match(/(\`{3,})/);
    if (code) {
      if (!inCode) {
        inCode = code[1];
      } else if (inCode === code[1]) {
        inCode = false;
      }
    }
    current.push(line);
  }
  flush();
  return chunks;
};

/**
 * Write JSON pretty (stable), ensuring parent dir exists.
 */
export function saveJson(filename: string, data: unknown) {
  ensureDir(path.dirname(filename));
  fs.writeFileSync(filename, JSON.stringify(data, null, 2), 'utf8');
};

//--------------------------------------------------------------------//
// MCP Helpers

export function cosine(a: number[], b: number[]) {
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) { dot += a[i]*b[i]; na += a[i]*a[i]; nb += b[i]*b[i]; }
  return dot / ((Math.sqrt(na) * Math.sqrt(nb)) || 1);
};

export function stripFences(text: string) {
  return text.replace(/```[\s\S]*?```/g, '').trim();
};

export function toChecklistItem(store: JsonlStore, id: string) {
  const chunk = store.get(id);
  const pointer = store.index.ids.get(id);
  return {
    id,
    rule: chunk?.rule || null,
    title: (chunk?.headings || []).join(' > '),
    topic: pointer?.topic,
    document: pointer?.document,
    section: pointer?.section,
  };
};

export function toMarkdown(sections: Array<{ id: string; section_path: string[]; text: string }>) {
  const lines: string[] = [];
  for (const s of sections) {
    const h = s.section_path.length ? s.section_path[s.section_path.length - 1] : s.id;
    lines.push(`### ${h}`);
    lines.push('');
    lines.push(s.text);
    lines.push('');
  }
  return lines.join('\n');
};

/**
 * Formats the given object to what MCP wants to return from tools
 */
export function toMcpText<T>(results: T): CallToolResult {
  return {
    content: [{ 
      type: 'text', 
      text: JSON.stringify(results, null, 2) 
    }]
  };
};