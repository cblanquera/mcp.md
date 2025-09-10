//modules
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import * as z from 'zod';
//src
import JsonlStore from '../JsonlStore.js';
import { toMcpText } from '../helpers.js';

export type Args = z.infer<typeof args>;

export const schema = {
  topic: z.string().describe(
    'The topic that contains the target document. '
    + '\nExample: "coding"'
  ),
  document: z.string().describe(
    'The document path (relative to the topic root). '
    + '\nExample: "docs/coding/Coding-Standards.md"'
  )
};

export const args = z.object(schema);

export const info = { 
  title: 'List Sections', 
  description: 'Table of contents for a document.', 
  inputSchema: schema 
};

export async function handler(args: Args, store: JsonlStore) {
  const { topic, document } = z.object(schema).parse(args);
  return toMcpText({ 
    sections: store.getDocumentSections(topic, document) 
  });
};

export function register(server: McpServer, store: JsonlStore) {
  server.registerTool('list_sections', info, args => handler(args, store));
};