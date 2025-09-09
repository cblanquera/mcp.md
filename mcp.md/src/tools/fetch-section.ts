//modules
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import * as z from 'zod';
//src
import JsonlStore from '../JsonlStore.js';
import { toMcpText } from '../helpers.js';

export const schema = {
  ids: z.array(z.string()).min(1).describe(
    `One or more section identifiers.
     Example: ["coding:docs/guide.md#2.1"]`
  ),

  expand: z.object({
    before: z.number().int().min(0).max(5).default(0).describe(
      `Number of preceding sections to include (0–5).
       Examples: 1, 2`
    ),
    after: z.number().int().min(0).max(5).default(0).describe(
      `Number of following sections to include (0–5).
       Examples: 1, 3`
    ),
  }).optional().describe(
    `Optional neighborhood expansion to add nearby sections.`
  )
};

export const info = { 
  title: 'Fetch Section', 
  description: 'Fetch one or more sections by id, optionally with neighbors.', 
  inputSchema: schema 
};

export function register(server: McpServer, store: JsonlStore) {
  server.registerTool('fetch_section', info, async args => {
    //extract variables from zod params
    const { ids, expand } = z.object(schema).parse(args);
    const sections = store.getSectionsByIds(ids, expand);
    return toMcpText(sections);
  });
};
