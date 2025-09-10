//modules
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
//src
import JsonlStore from '../JsonlStore.js';
import { toMcpText } from '../helpers.js';

export const schema = {};

export const info = {
  title: 'List Topics',
  description: 'Return available topics discovered at ingest.',
  inputSchema: schema,
};

export async function handler(store: JsonlStore) {
  return toMcpText({ topics: store.topics });
};

export function register(server: McpServer, store: JsonlStore) {
  server.registerTool('list_topics', info, () => handler(store));
};