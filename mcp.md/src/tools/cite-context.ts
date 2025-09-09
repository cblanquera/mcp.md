//modules
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import * as z from 'zod';
//src
import JsonlStore from '../JsonlStore.js';
import { toMcpText } from '../helpers.js';

export const schema = {
  ids: z.array(z.string()).min(1).describe(
    `Section identifiers to cite.
     Example: ["coding:docs/guide.md#2.1"]`
  )
};

export const info = {
  title: 'Cite',
  description: 'Resolve section IDs into citation metadata (topic, document, section path).',
  inputSchema: schema
};

export function register(server: McpServer, store: JsonlStore) {
  server.registerTool('cite', info, async args => {
    //extract variables from zod params
    const { ids } = z.object(schema).parse(args);

    const citations = ids.map(id => {
      const pointer = store.index.ids.get(id);
      const chunk = store.get(id);
      return pointer && chunk ? {
        id,
        topic: pointer.topic,
        document: pointer.document,
        anchor: pointer.section,
        section_path: chunk.headings,
        tags: pointer.tags
      } : { id, error: 'not_found' };
    });

    return toMcpText({ citations });
  });
};
