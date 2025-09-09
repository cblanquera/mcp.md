//modules
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import * as z from 'zod';
//src
import JsonlStore from '../JsonlStore.js';
import { toMcpText } from '../helpers.js';

export const schema = {
  id: z.string().describe(
    `The source section identifier to find related content for.`
  ),
  strategy: z.enum(['tags', 'document']).default('tags').describe(
    `Relationship heuristic:
     - "tags": sections sharing tags
     - "document": neighbors within same document`
  ),
  limit: z.number().int().min(1).max(25).default(10).describe(
    `Max number of related sections to return.`
  )
};

export const info = {
  title: 'List Related',
  description: 'Find related sections by shared tags or by same-document neighborhood.',
  inputSchema: schema
};

export function register(server: McpServer, store: JsonlStore) {
  server.registerTool('list_related', info, async args => {
    //extract variables from zod params
    const { id, strategy, limit } = z.object(schema).parse(args);
    //get the entry given the id
    const entry = store.index.ids.get(id);
    //if no entry
    if (!entry) {
      //error out
      return toMcpText({ id, error: 'not_found' });
    }
    //if AI wants documents, then same document neighbors via TOC
    if (strategy === 'document') {
      //form the keyname
      const key = `${entry.topic}:${entry.document}`;
      //get the document
      const document = store.index.documents.get(key);
      //if no document, then just return an empty set
      if (!document) return toMcpText({ id, related: [] });
      //get the index
      const index = document.sections.findIndex(
        section => section.id === id
      );
      //determine start and end
      const start = Math.max(0, index - limit);
      const end = Math.min(document.sections.length, index + 1 + limit);
      //clean up for related
      const related = document.sections
        .slice(start, end)
        .filter(section => section.id !== id)
        .map(section => {
          const entry = store.index.ids.get(section.id)!;
          return { 
            id: section.id, 
            topic: entry.topic, 
            document: entry.document, 
            section_path: section.section_path 
          };
        });

      return toMcpText({ id, strategy: 'document', related });
    }

    //tag-based: union postings, score by shared tag count
    const tags = store.index.tags; // Map<string, string[]>
    const baseTags = new Set(entry.tags);
    const candidateScores = new Map<string, number>();

    for (const tag of baseTags) {
      const ids = tags.get(tag) || [];
      for (const currentId of ids) {
        if (currentId === id) continue;
        candidateScores.set(
          currentId, 
          (candidateScores.get(currentId) || 0) + 1
        );
      }
    }
    //clean up for related
    const related = Array.from(candidateScores.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([id]) => {
        const entry = store.index.ids.get(id)!;
        return { 
          id, 
          topic: entry.topic, 
          document: entry.document, 
          score: candidateScores.get(id), 
          section: entry.section 
        };
      });

    return toMcpText({ id, strategy: 'tags', related });
  });
};
