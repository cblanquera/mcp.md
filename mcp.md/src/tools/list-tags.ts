//modules
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import * as z from 'zod';
//src
import JsonlStore from '../JsonlStore.js';
import { toMcpText } from '../helpers.js';

export type Args = z.infer<typeof args>;

export const schema = {
  query: z.string().optional().describe(
    'Substring filter to match tags (case-insensitive). '
    + '\nExamples: "plugin", "auth"'
  ),

  limit: z.number().int().min(1).max(500).optional().describe(
    'Maximum number of tags to return (1-500). '
    + '\nExamples: 50, 100'
  )
};

export const args = z.object(schema);

export const info = { 
  title: 'List Tags', 
  description: 'Return tags with counts.', 
  inputSchema: schema 
};

export async function handler(args: Args, store: JsonlStore) {
  const { query, limit = 200 } = z.object(schema).parse(args);
  return toMcpText({ tags: store.searchTags({ query, limit }) });
};

export function register(server: McpServer, store: JsonlStore) {
  server.registerTool('list_tags', info, args => handler(args, store));
};

