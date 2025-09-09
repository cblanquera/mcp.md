//modules
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import * as z from 'zod';
//src
import JsonlStore from '../JsonlStore.js';
import { toMcpText } from '../helpers.js';

export const schema = {
  topic: z.string().describe(
    `The topic that contains the target document.
     Example: "coding"`
  ),
  document: z.string().describe(
    `The document path (relative to the topic root).
     Example: "docs/coding/Coding-Standards.md"`
  )
};

export const info = { 
  title: 'List Sections', 
  description: 'Table of contents for a document.', 
  inputSchema: schema 
};

export function register(server: McpServer, store: JsonlStore) {
  server.registerTool('list_sections', info, async args => {
      const { topic, document } = z.object(schema).parse(args);
      return toMcpText({ 
        sections: store.getDocumentSections(topic, document) 
      });
    }
  );
};