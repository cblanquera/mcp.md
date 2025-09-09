//modules
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import * as z from 'zod';
//src
import JsonlStore from '../JsonlStore.js';
import { toMcpText } from '../helpers.js';

export const schema = {
  query: z.string().describe(
    `Plain-text query to search for.
     Examples: "plugin system", "unit testing"`
  ),

  snippetOnly: z.boolean().default(false).describe(
    `If true, prefer returning code snippets (fenced code blocks) over prose.
     Examples: true, false`
  ),

  mode: z.enum(['simple','semantic','hybrid']).default('hybrid').describe(
    `Search strategy:
     - "simple"   → keyword only
     - "semantic" → embedding only
     - "hybrid"   → combine both
     Examples: "simple", "semantic", "hybrid"`
  ),

  limit: z.number().int().min(1).max(50).default(10).describe(
    `Maximum number of results to return (1–50).
     Examples: 5, 10, 20`
  ),

  cursor: z.string().optional().describe(
    `Opaque pagination cursor from a previous call.
     Example: "eyJvZmZzZXQiOjEwfQ=="`
  )
};

export const info = { 
  title: 'Search Context', 
  description: 'General search over the corpus with lexical/semantic/hybrid modes.', 
  inputSchema: schema 
};

export function register(server: McpServer, store: JsonlStore) {
  server.registerTool('search_context', info, async args => {
    const params = z.object(schema).parse(args);
    const result = await store.search(params.query, params);
    return toMcpText(result);
  });
};
