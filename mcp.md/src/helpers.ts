//node
import fs from 'node:fs';
import path from 'node:path';
//modules
import matter from 'gray-matter';
import yaml from 'js-yaml';
//src
import type { RawChunk, Config } from './types.js';

export const RULES = /\b(MUST NOT|MUST|SHOULD)\b/;
export const config: Record<string, Config> = {};

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
 * Ensures the specified directory exists, creating it recursively if necessary.
 */
export async function ensureDir(dirPath: string) {
  //Create the directory and all parent directories if they do not exist
  await fs.promises.mkdir(dirPath, { recursive: true });
};

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

/**
 * Retrieves information from the package.json file.
 */
export function getPackageInfo(): any {
  const dirname = path.dirname(__dirname);
  const info = path.join(dirname, 'package.json');
  if (!fs.existsSync(info)) {
    throw new Error(`Could not find package.json at ${info}`);
  }
  return JSON.parse(fs.readFileSync(info, 'utf-8'));
};

/**
 * Returns a list of all .md files in the given root directory
 * that match the provided glob patterns.
 * (super-tiny glob: only ** / *.md and *.md)
 */
export function glob(root: string, patterns: string[]) {
  const out: string[] = [];
  //walks the given directory recursively returning all .md files
  function walk(dir: string) {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) walk(p);
      else if (e.isFile() && e.name.endsWith('.md')) out.push(p);
    }
  }
  //start walking for each pattern's base path
  patterns.forEach(p => {
    const base = p.includes('**') ? p.split('**')[0] : '';
    walk(path.join(root, base));
  });
  //return the collected .md files
  return out;
}

/**
 * Checks if the build directory contains any JSONL files.
 */
export function synced(build: string) {
  try { 
    return fs.readdirSync(build).some(file => file.endsWith('.jsonl')); 
  } catch { 
    return false; 
  }
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
}

/**
 * Converts a Markdown file into an array of chunks.
 * ex. ** / lib.md → [ { id: 'lib:lib.md#0', ... }, ... ]
 */
export function toChunks(
  //ex. reactus
  topic: string,
  //ex. /file/to/reactus
  fileRoot: string,
  //ex. /docs/to/reactus/lib.md
  pathname: string,
) {
  //read the markdown file
  const raw = fs.readFileSync(fileRoot + pathname, 'utf8');
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
  pathname.split('/').slice(1).forEach(name => {
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
  for (const line of lines) {
    //check for headers
    const headers = line.match(/^(#{1,6})\s+(.*)$/);
    if (headers) {
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
    current.push(line);
  }
  flush();
  return chunks;
}
