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
    + '\nExamples: "plugin system", "unit testing"'
  ),

  snippet_only: z.boolean().optional().describe(
    'If true, prefer returning code snippets (fenced code blocks) over prose. '
    + '\nExamples: true, false'
    + '\nDefault: false'
  ),

  mode: z.enum(['simple','semantic','hybrid']).optional().describe(
    'Search strategy:'
    + '\n - "simple"   → keyword only '
    + '\n - "semantic" → embedding only '
    + '\n - "hybrid"   → combine both '
    + '\nExamples: "simple", "semantic", "hybrid"'
    + '\nDefault: "hybrid"'
  ),

  limit: z.number().int().min(1).max(50).optional().describe(
    'Maximum number of results to return (1-50).'
    + '\nExamples: 5, 10, 20'
    + '\nDefault: 10'
  ),

  cursor: z.string().optional().describe(
    'Opaque pagination cursor from a previous call.'
    + '\nExample: "eyJvZmZzZXQiOjEwfQ=="'
  )
};

export const args = z.object(schema);

export const info = { 
  title: 'Search Context', 
  description: 'General search over the corpus with '
    + 'lexical/semantic/hybrid modes.', 
  inputSchema: schema 
};

export async function handler(args: Args, store: JsonlStore) {
  const params = z.object(schema).parse(args);
  const {
    query,
    snippet_only: snippetOnly = false,
    mode = 'hybrid',
    cursor,
    limit = 10
  } = params;
  const result = await store.search(query, {
    snippetOnly,
    mode,
    limit,
    cursor
  });
  return toMcpText(result);
};

export function register(server: McpServer, store: JsonlStore) {
  server.registerTool('search_context', info, args => handler(args, store));
};
