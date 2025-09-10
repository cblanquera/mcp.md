//modules
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import * as z from 'zod';
//src
import JsonlStore from '../JsonlStore.js';
import { toMcpText } from '../helpers.js';

export type Args = z.infer<typeof args>;

export const schema = {
  draft: z.string().describe(
    'Text to validate against rules (can be a code snippet, doc draft, etc.).'
  ),
  topics: z.array(z.string()).optional().describe(
    'Restrict rule retrieval to these topics. Example: ["documenting"]'
  ),
  include_tags: z.array(z.string()).optional().describe(
    'OR-filter for rules. Example: ["style guide","lint"]'
  ),
  require_tags: z.array(z.string()).optional().describe(
    'AND-filter for rules. Example: ["ruleset"]'
  ),
  exclude_tags: z.array(z.string()).optional().describe(
    'NOT-filter for rules. Example: ["legacy"]'
  ),
  mode: z.enum(['simple','semantic','hybrid']).optional().describe(
    'Retrieval strategy for the draft-to-rule match.'
  ),
  limit: z.number().int().min(1).max(50).optional().describe(
    'Max number of rules to return.'
  )
};

export const args = z.object(schema);

export const info = {
  title: 'Enforce Rules',
  description: 'Retrieve applicable rules (MUST/SHOULD/MUST NOT) '
    + 'relevant to a draft for review/linting.',
  inputSchema: schema
};

export async function handler(args: Args, store: JsonlStore) {
  //get zod params
  const params = z.object(schema).parse(args);
  //extract variables from params
  const {
    draft,
    topics,
    mode = 'hybrid',
    limit = 15,
    include_tags: includeTags, 
    require_tags: requireTags, 
    exclude_tags: excludeTags, 
  } = params;
  //search using the draft text itself as the query.
  const { hits } = await store.search(draft, {
    topics,
    includeTags,
    requireTags,
    excludeTags,
    mode,
    limit,
    snippetOnly: false
  });
  //keep only ruleset hits and fetch rule level from the source chunk.
  const rules = hits
    .filter(hit => hit.corpus === 'ruleset')
    .map(hit => {
      const chunk = store.get(hit.id);
      // 'MUST' | 'SHOULD' | 'MUST NOT' | null
      const ruleLevel = chunk?.rule || null;
      return {
        id: hit.id,
        rule: ruleLevel,
        topic: hit.topic,
        document: hit.document,
        section_path: hit.sectionPath,
        snippet: hit.snippet
      };
    });

  return toMcpText({
    // guard huge payloads in responses
    draft: draft.slice(0, 4000), 
    rules
  });
};

export function register(server: McpServer, store: JsonlStore) {
  server.registerTool('enforce_rules', info, args => handler(args, store));
};
