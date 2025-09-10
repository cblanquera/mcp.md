//modules
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import * as z from 'zod';
//src
import JsonlStore from '../JsonlStore.js';
import { toMcpText, stripFences } from '../helpers.js';

export type Args = z.infer<typeof args>;

export const schema = {
  ids: z.array(z.string()).optional().describe(
    'Section IDs to collect and return for summarization.'
  ),
  topic: z.string().optional().describe(
    'Topic of the document to gather from (required if gathering by document).'
  ),
  document: z.string().optional().describe(
    'Document path to gather from (required if gathering by document).'
  ),
  sections: z.array(z.string()).optional().describe(
    'Subset of sections (IDs or "A > B" paths) to gather within the document.'
  ),
  max_chars: z.number().int().min(500).max(200000).optional().describe(
    'Soft cap on returned characters; tool will truncate at paragraph boundaries.'
    + '\nMinimum: 500'
    + '\nMaximum: 200000'
    + '\nDefault: 12000'
  ),
  strip_code: z.boolean().optional().describe(
    'If true, remove fenced code blocks from the returned context.'
  ),
  include_meta: z.boolean().optional().describe(
    'If true, include meta (id, sectionPath, tags) alongside text.'
  )
};

export const args = z.object(schema);

export const info = {
  title: 'Summarize Context (Gather)',
  description: 'Gather and clean context for the agent to summarize. '
    + 'This tool aggregates text; it does not perform the summary.',
  inputSchema: schema
};

export async function handler(args: Args, store: JsonlStore) {
  //get zod params
  const params = z.object(schema).refine(
    ({ ids, topic, document }) => {
      return (ids && ids.length) || (topic && document);
    },
    { message: 'Provide either ids[] or (topic + document).' }
  ).parse(args);
  //extract variables from params
  const {
    ids, 
    topic, 
    document,
    sections,
    max_chars: maxChars = 12000,
    strip_code: stripCode = true,
    include_meta: includeMeta = true
  } = params;

  let snippets: { 
    id: string,
    section_path: string[], 
    text: string,
    tags: string[] 
  }[] = [];

  if (ids?.length) {
    const sectionsById = store.getSectionsByIds(ids);
    snippets = sectionsById.map(section => ({ 
      id: section.id, 
      section_path: section.sectionPath, 
      text: section.text, 
      tags: section.tags 
    }));
  } else {
    const meta = store.getDocumentMeta(topic!, document!, sections);
    const list = meta?.sections || [];
    snippets = list.map(section => ({ 
      id: section.id, 
      section_path: section.sectionPath, 
      text: section.text, 
      tags: section.tags 
    }));
  }

  // Concatenate with soft cap and optional code stripping
  const summary: typeof snippets = [];
  let total = 0;
  for (const section of snippets) {
    const text = stripCode ? stripFences(section.text) : section.text;
    if (!text) continue;
    if (total + text.length > maxChars) {
      // truncate at paragraph boundary
      const remaining = maxChars - total;
      const slice = text.slice(0, Math.max(0, remaining));
      const cut = slice.lastIndexOf('\n\n');
      const final = cut > 0 ? slice.slice(0, cut) : slice;
      summary.push({ ...section, text: final });
      total += final.length;
      break;
    } else {
      summary.push({ ...section, text });
      total += text.length;
    }
  }

  const payload = includeMeta
    ? { gathered: summary, totalChars: total }
    : { 
      gathered: summary
        .map(section => section.text)
        .join('\n\n'), totalChars: total 
      };

  return toMcpText(payload);
};

export function register(server: McpServer, store: JsonlStore) {
  server.registerTool('summarize_context', info, args => handler(args, store));
};
