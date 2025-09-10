//modules
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import * as z from 'zod';
//src
import JsonlStore from '../JsonlStore.js';
import { toMcpText } from '../helpers.js';

export type Args = z.infer<typeof args>;

export const schema = {
  phrases: z.array(z.string()).min(1).describe(
    'Free-text phrases to map to known tags. '
    + '\nExamples: ["plugin system","auth","style guide"]'
  ),
  namespaces: z.array(z.string()).optional().describe(
    'Optional tag namespaces/prefixes to constrain suggestions (prefix match).'
  ),
  limit_per_phrase: z.number().int().min(1).max(10).optional().describe(
    'Max suggestions per phrase.'
  )
};

export const args = z.object(schema);

export const info = {
  title: 'Search Tags',
  description: 'Suggest tags that match the given phrases, optionally '
    + 'constrained by namespaces.',
  inputSchema: schema
};

export async function handler(args: Args, store: JsonlStore) {
  const params = z.object(schema).parse(args);
  const { 
    phrases, 
    namespaces, 
    limit_per_phrase: limitPerPhrase = 5
  } = params;
  const suggestions = store.suggestTags(phrases, {
    namespaces,
    limitPerPhrase
  });
  return toMcpText({ suggestions });
};

export function register(server: McpServer, store: JsonlStore) {
  server.registerTool('search_tags', info, args => handler(args, store));
};
