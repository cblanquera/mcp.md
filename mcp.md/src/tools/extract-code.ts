//modules
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import * as z from 'zod';
//src
import JsonlStore from '../JsonlStore.js';
import { toMcpText } from '../helpers.js';

export const FENCE = /```([a-zA-Z0-9+_\-]*)\n([\s\S]*?)```/g;

export const schema = {
  ids: z.array(z.string()).optional().describe(
    `Specific section IDs to extract code from.
     Example: ["coding:docs/guide.md#2.1"]`
  ),
  topic: z.string().optional().describe(
    `Topic name (required if extracting by document). Example: "coding"`
  ),
  document: z.string().optional().describe(
    `Document path (required if extracting by document). Example: "docs/coding/Typescript-Style-Guide.md"`
  ),
  sections: z.array(z.string()).optional().describe(
    `Optional filter: section IDs or heading paths to limit extraction within the document.`
  )
};

export const info = {
  title: 'Extract Codeblocks',
  description: 'Extract fenced code blocks (```lang ... ``` ) from sections or a document.',
  inputSchema: schema
};

export function register(server: McpServer, store: JsonlStore) {
  server.registerTool('extract_codeblocks', info, async args => {
    //get zod params
    const params = z.object(schema).refine(
      ({ ids, topic, document }) => {
        return (ids && ids.length) || (topic && document);
      },
      { message: 'Provide either ids[] or (topic + document).' }
    ).parse(args);
    //extract variables from params
    const { ids, topic, document, sections } = params;
    //will be used to form the final result set
    let sources: { id: string; text: string; path: string[] }[] = [];
    //if AI gave us IDs
    if (ids && ids.length) {
      //get all the sections from all the ids
      const sectionsById = store.getSectionsByIds(ids);
      sources = sectionsById.map(section => ({ 
        id: section.id, 
        text: section.text, 
        path: section.sectionPath 
      }));
    //no ids were given
    } else {
      //get sections from the document
      const meta = store.getDocumentMeta(topic!, document!, sections);
      sources = (meta?.sections || []).map(section => ({ 
        id: section.id, 
        text: section.text, 
        path: section.sectionPath 
      }));
    }
    //now form the code blocks
    const blocks = sources.flatMap(src => {
      const matches: { 
        id: string,
        language: string | null,
        code: string,
        section_path: string[] 
      }[] = [];
      let match: RegExpExecArray | null;
      while ((match = FENCE.exec(src.text)) !== null) {
        matches.push({
          id: src.id,
          language: (match[1] || '').trim() || null,
          code: match[2],
          section_path: src.path
        });
      }
      return matches;
    });

    return toMcpText({ count: blocks.length, blocks });
  });
};
