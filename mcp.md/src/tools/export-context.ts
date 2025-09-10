//modules
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import * as z from 'zod';
//src
import JsonlStore from '../JsonlStore.js';
import { toMcpText, toMarkdown } from '../helpers.js';

export type Args = z.infer<typeof args>;

export const schema = {
  ids: z.array(z.string()).optional().describe(
    'Specific section IDs to export. If omitted, you must provide (topic + document).'
  ),
  topic: z.string().optional().describe(
    'Topic of the document to export (required if exporting by document).'
  ),
  document: z.string().optional().describe(
    'Document path to export (required if exporting by document).'
  ),
  sections: z.array(z.string()).optional().describe(
    'Optional subset of sections (IDs or "A > B" paths) within the document.'
  ),
  format: z.enum(['json','markdown']).default('json').describe(
    'Export format for the bundle.'
  ),
  include_meta: z.boolean().optional().describe(
    'Include topic/document/sectionPath/tags metadata in the export.'
  )
};

export const args = z.object(schema);

export const info = {
  title: 'Export Context Bundle',
  description: 'Package selected context as JSON or Markdown for handoff.',
  inputSchema: schema
};

export async function handler(args: Args, store: JsonlStore) {
  //get zod params
  const params = z.object(schema).refine(
    value => (value.ids && value.ids.length) 
      || (value.topic && value.document),
    { message: 'Provide either ids[] or (topic + document).' }
  ).parse(args);
  //extract variables from params
  const {
    ids,
    topic,
    document,
    sections: subset,
    format,
    include_meta: includeMeta = true
  } = params;
  //will be used to form the final result set
  let sections: { 
    id: string, 
    section_path: string[], 
    text: string, 
    tags: string[] 
  }[] = [];
  //if AI gave some IDs
  if (ids?.length) {
    //get all the sections from all the ids
    const sectionsById = store.getSectionsByIds(ids);
    //set the sections
    sections = sectionsById.map(section => ({ 
      id: section.id, 
      section_path: section.sectionPath, 
      text: section.text, 
      tags: section.tags 
    }));
  //no ids were given...
  } else {
    //get the sections from the document meta
    const meta = store.getDocumentMeta(topic!, document!, subset);
    const list = meta?.sections || [];
    //set the sections
    sections = list.map(section => ({ 
      id: section.id, 
      section_path: section.sectionPath, 
      text: section.text, 
      tags: section.tags 
    }));
  }
  //if AI wants markdown
  if (format === 'markdown') {
    const md = toMarkdown(sections);
    return toMcpText({ format: 'markdown', content: md });
  }
  //otherwise, just return the JSON
  return toMcpText(includeMeta
    ? { format: 'json', sections }
    : { format: 'json', sections: sections.map(
      section => ({ text: section.text })
    ) }
  );
};

export function register(server: McpServer, store: JsonlStore) {
  server.registerTool('export_context', info, args => handler(args, store));
};
