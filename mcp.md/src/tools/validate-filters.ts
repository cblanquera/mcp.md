//modules
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import * as z from 'zod';
//src
import JsonlStore from '../JsonlStore.js';
import { toMcpText } from '../helpers.js';

export type Args = z.infer<typeof args>;

export const schema = {
  topics: z.array(z.string()).optional().describe(
    'Topics to validate against the indexed corpus.'
  ),
  include_tags: z.array(z.string()).optional().describe(
    'Tags proposed for OR filter; will be validated against known tags.'
  ),
  require_tags: z.array(z.string()).optional().describe(
    'Tags proposed for AND filter; will be validated against known tags.'
  ),
  exclude_tags: z.array(z.string()).optional().describe(
    'Tags proposed for NOT filter; will be validated against known tags.'
  ),
  suggest_on_missing: z.boolean().default(true).describe(
    'If true, include tag suggestions for anything not found.'
  )
};

export const args = z.object(schema);

export const info = {
  title: 'Validate Filters',
  description: 'Sanity-check topics and tags before running a search; '
    + 'suggest alternatives for missing items.',
  inputSchema: schema
};

export async function handler(args: Args, store: JsonlStore) {
  //get zod params
  const params = z.object(schema).parse(args);
  //extract variables from params
  const {
    topics,
    include_tags: includeTags,
    require_tags: requireTags,
    exclude_tags: excludeTags,
    suggest_on_missing: suggestOnMissing
  } = params;

  const knownTopics = new Set(store.topics);
  const knownTags = new Set(store.index.tags.map((_, tag) => tag));

  const validateList = (list?: string[]) => {
    const ok: string[] = [];
    const missing: string[] = [];
    (list || []).forEach(t => (knownTags.has(t) ? ok : missing).push(t));
    return { ok, missing };
  };

  const topicOk: string[] = [];
  const topicMissing: string[] = [];
  (topics || []).forEach(t => (knownTopics.has(t) 
    ? topicOk 
    : topicMissing).push(t));

  const validIncluded = validateList(includeTags);
  const validRequired = validateList(requireTags);
  const validExcluded = validateList(excludeTags);

  const suggestions: Record<string, string[]> = {};
  if (suggestOnMissing) {
    const want = Array.from(new Set([
      ...validIncluded.missing, 
      ...validRequired.missing, 
      ...validExcluded.missing
    ]));
    if (want.length) {
      const sugg = store.suggestTags(want, { limitPerPhrase: 5 });
      want.forEach((w, i) => { suggestions[w] = sugg[i] || []; });
    }
  }

  return toMcpText({
    topics: { ok: topicOk, missing: topicMissing },
    include_tags: validIncluded,
    require_tags: validRequired,
    exclude_tags: validExcluded,
    suggestions: suggestOnMissing ? suggestions : undefined
  });
};

export function register(server: McpServer, store: JsonlStore) {
  server.registerTool('validate_filters', info, args => handler(args, store));
};
