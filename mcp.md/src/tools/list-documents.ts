//modules
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import * as z from 'zod';
//src
import JsonlStore from '../JsonlStore.js';
import { toMcpText } from '../helpers.js';

export type Args = z.infer<typeof args>;

export const schema = {
  topics: z.array(z.string()).optional().describe(
    'Restrict to documents under these topics. '
    + '\nExamples: ["coding"], ["testing"]'
  ),

  includeTags: z.array(z.string()).optional().describe(
    'Return documents that contain at least one of these tags (OR). '
    + '\nExamples: ["react"], ["plugin system"]'
  ),

  requireTags: z.array(z.string()).optional().describe(
    'Return only documents that contain all of these tags (AND). '
    + '\nExample: ["jest","mocking"]'
  ),

  excludeTags: z.array(z.string()).optional().describe(
    'Exclude documents that contain any of these tags (NOT). '
    + '\nExamples: ["deprecated"], ["internal only"]'
  ),

  corpus: z.enum(['knowledge','ruleset']).optional().describe(
    'Limit by corpus: "knowledge" for knowledge-base, "ruleset" for formal rules. '
    + '\nExample: "knowledge"'
  ),

  sort: z.enum(['title','sections','topic']).optional().describe(
    'Sorting field: by document title, section count, or topic. '
    + '\nExamples: "title", "sections", "topic"'
  ),

  order: z.enum(['asc','desc']).optional().describe(
    'Sorting direction. '
    + '\nExamples: "asc", "desc"'
  ),

  limit: z.number().int().min(1).max(200).optional().describe(
    'Maximum number of documents to return (1-200). '
    + '\nExamples: 10, 50, 100'
  ),

  cursor: z.string().optional().describe(
    'Opaque pagination cursor from a previous call. '
    + '\nExample: "eyJvZmZzZXQiOjEwfQ=="'
  )
};

export const args = z.object(schema);

export const info = { 
  title: 'List Documents', 
  description: 'Browse documents with filters.', 
  inputSchema: schema 
};

export async function handler(args: Args, store: JsonlStore) {
  const params = z.object(schema).parse(args);
  params.sort = params.sort || 'title';
  params.order = params.order || 'asc';
  params.limit = params.limit || 50;
  const results = store.searchDocuments(params);
  return toMcpText(results);
};

export function register(server: McpServer, store: JsonlStore) {
  server.registerTool('list_documents', info, args => handler(args, store));
};