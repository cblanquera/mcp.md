//modules
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import * as z from 'zod';
//src
import JsonlStore from '../JsonlStore.js';
import { toMcpText } from '../helpers.js';

export type Args = z.infer<typeof args>;

export const schema = {
  query: z.string().describe(
    'Plain-text query to search for. '
    + '\nExamples: "mocking framework", "React hooks"'
  ),

  topics: z.array(z.string()).optional().describe(
    'Restrict search to one or more topics. '
    + '\nExamples: ["testing"], ["coding"]'
  ),

  include_tags: z.array(z.string()).optional().describe(
    'Results must include at least one of these tags (OR). '
    + '\nExample: ["chai","assertion"]'
  ),

  require_tags: z.array(z.string()).optional().describe(
    'Results must include all of these tags (AND). '
    + '\nExample: ["jest","mock"]'
  ),

  exclude_tags: z.array(z.string()).optional().describe(
    'Exclude results containing any of these tags (NOT). '
    + '\nExample: ["deprecated","legacy"]'
  ),

  snippet_only: z.boolean().optional().describe(
    'If true, prefer code snippets. '
    + '\nExample: true'
  ),

  mode: z.enum(['simple','semantic','hybrid']).optional().describe(
    'Search mode: '
    + '\n - "simple": keyword '
    + '\n - "semantic": embedding '
    + '\n - "hybrid": both '
    + '\nExample: "hybrid"'
  ),

  limit: z.number().int().min(1).max(50).optional().describe(
    'Maximum number of results to return. '
    + '\nExamples: 10, 25'
  ),

  cursor: z.string().optional().describe(
    'Pagination cursor from a previous response. '
    + '\nExample: "eyJvZmZzZXQiOjIw"'
  )
};

export const args = z.object(schema);

export const info = { 
  title: 'Search (Tag Filtered)', 
  description: 'Search with OR/AND/NOT tag filters and optional '
    + 'topic scope.', 
  inputSchema: schema 
};

export async function handler(args: Args, store: JsonlStore) {
  const params = z.object(schema).parse(args);
  const {
    query,
    topics,
    include_tags: includeTags, 
    require_tags: requireTags, 
    exclude_tags: excludeTags, 
    snippet_only: snippetOnly = false,
    mode = 'hybrid',
    limit = 10,
    cursor
  } = params;
  const result = await store.search(query, {
    topics,
    includeTags,
    requireTags,
    excludeTags,
    snippetOnly,
    mode,
    limit,
    cursor
  });
  return toMcpText(result);
};

export function register(server: McpServer, store: JsonlStore) {
  server.registerTool('search_by_tags', info, args => handler(args, store));
};
