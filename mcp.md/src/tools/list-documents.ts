//modules
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import * as z from 'zod';
//src
import JsonlStore from '../JsonlStore.js';
import { toMcpText } from '../helpers.js';

export const schema = {
  topics: z.array(z.string()).optional().describe(
    `Restrict to documents under these topics.
     Examples: ["coding"], ["testing"]`
  ),

  includeTags: z.array(z.string()).optional().describe(
    `Return documents that contain at least one of these tags (OR).
     Examples: ["react"], ["plugin system"]`
  ),

  requireTags: z.array(z.string()).optional().describe(
    `Return only documents that contain all of these tags (AND).
     Example: ["jest","mocking"]`
  ),

  excludeTags: z.array(z.string()).optional().describe(
    `Exclude documents that contain any of these tags (NOT).
     Examples: ["deprecated"], ["internal only"]`
  ),

  corpus: z.enum(['knowledge','ruleset']).optional().describe(
    `Limit by corpus: "knowledge" for knowledge-base, "ruleset" for formal rules.
     Example: "knowledge"`
  ),

  sort: z.enum(['title','sections','topic']).default('title').describe(
    `Sorting field: by document title, section count, or topic.
     Examples: "title", "sections", "topic"`
  ),

  order: z.enum(['asc','desc']).default('asc').describe(
    `Sorting direction.
     Examples: "asc", "desc"`
  ),

  limit: z.number().int().min(1).max(200).default(50).describe(
    `Maximum number of documents to return (1–200).
     Examples: 10, 50, 100`
  ),

  cursor: z.string().optional().describe(
    `Opaque pagination cursor from a previous call.
     Example: "eyJvZmZzZXQiOjEwfQ=="`
  )
};

export const info = { 
  title: 'List Documents', 
  description: 'Browse documents with filters.', 
  inputSchema: schema 
};

export function register(server: McpServer, store: JsonlStore) {
  server.registerTool('list_documents', info, async args => {
    const params = z.object(schema).parse(args);
    const results = store.searchDocuments(params);
    return toMcpText(results);
  });
};