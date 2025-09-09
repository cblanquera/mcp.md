//modules
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import * as z from 'zod';
//src
import JsonlStore from '../JsonlStore.js';
import { toMcpText } from '../helpers.js';

export const schema = {
  topic: z.string().describe(
    `The topic that contains the target document.
     Example: "documenting"`
  ),

  document: z.string().describe(
    `The document path (relative to the topic root) to fetch.
     Example: "docs/documenting/Documentation-Style-Guide.md"`
  ),

  sections: z.array(z.string()).optional().describe(
    `Optional list of section ids (e.g., "1.2") or heading paths (e.g., "Introduction > Purpose") to fetch.
     Entire doc is returned if omitted.
     Examples: ["1.2"], ["Introduction > Purpose"]`
  )
};

export const info = { 
  title: 'Fetch Document', 
  description: 'Get whole doc (or selected sections) with text.', 
  inputSchema: schema 
};

export function register(server: McpServer, store: JsonlStore) {
  server.registerTool('fetch_document', info, async args => {
    //extract variables from zod params
    const { topic, document, sections } = z.object(schema).parse(args);
    const meta = store.getDocumentMeta(topic, document, sections) 
      ?? { meta: null, sections: [] };
    return toMcpText(meta);
  });
};
