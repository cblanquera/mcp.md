//modules
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import * as z from 'zod';
//src
import JsonlStore from '../JsonlStore.js';
import { toMcpText } from '../helpers.js';

export const schema = {
  query: z.string().describe(
    `Plain-text query to search for.
     Examples: "mocking framework", "React hooks"`
  ),

  topics: z.array(z.string()).optional().describe(
    `Restrict search to one or more topics.
     Examples: ["testing"], ["coding"]`
  ),

  includeTags: z.array(z.string()).optional().describe(
    `Results must include at least one of these tags (OR).
     Example: ["chai","assertion"]`
  ),

  requireTags: z.array(z.string()).optional().describe(
    `Results must include all of these tags (AND).
     Example: ["jest","mock"]`
  ),

  excludeTags: z.array(z.string()).optional().describe(
    `Exclude results containing any of these tags (NOT).
     Example: ["deprecated","legacy"]`
  ),

  snippetOnly: z.boolean().default(false).describe(
    `If true, prefer code snippets.
     Example: true`
  ),

  mode: z.enum(['simple','semantic','hybrid']).default('hybrid').describe(
    `Search mode:
     - "simple": keyword
     - "semantic": embedding
     - "hybrid": both
     Example: "hybrid"`
  ),

  limit: z.number().int().min(1).max(50).default(10).describe(
    `Maximum number of results to return.
     Examples: 10, 25`
  ),

  cursor: z.string().optional().describe(
    `Pagination cursor from a previous response.
     Example: "eyJvZmZzZXQiOjIw"}`
  )
};

export const info = { 
  title: 'Search (Tag Filtered)', 
  description: 'Search with OR/AND/NOT tag filters and optional topic scope.', 
  inputSchema: schema 
};

export function register(server: McpServer, store: JsonlStore) {
  server.registerTool('search_by_tags', info, async args => {
    const params = z.object(schema).parse(args);
    const result = await store.search(params.query, params);
    return toMcpText(result);
  });
};
