//modules
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import * as z from 'zod';
//src
import JsonlStore from '../JsonlStore.js';
import { toMcpText } from '../helpers.js';

export const schema = {
  query: z.string().optional().describe(
    `Substring filter to match tags (case-insensitive).
     Examples: "plugin", "auth"`
  ),

  limit: z.number().int().min(1).max(500).default(200).describe(
    `Maximum number of tags to return (1–500).
     Examples: 50, 100`
  )
};

export const info = { 
  title: 'List Tags', 
  description: 'Return tags with counts.', 
  inputSchema: schema 
};

export function register(server: McpServer, store: JsonlStore) {
  server.registerTool('list_tags', info, async args => {
    const { query, limit } = z.object(schema).parse(args);
    return toMcpText({ tags: store.searchTags({ query, limit }) });
  });
};

