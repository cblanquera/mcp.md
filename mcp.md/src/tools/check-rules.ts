//modules
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import * as z from 'zod';
//src
import type { RuleType, ChecklistItem } from '../types.js';
import JsonlStore from '../JsonlStore.js';
import { toMcpText, toChecklistItem } from '../helpers.js';

export const schema = {
  task: z.string().describe(
    `What you need to accomplish. Drives retrieval of relevant rules.
     Examples: "Implement a plugin loader", "Write Jest tests for auth"`
  ),
  topics: z.array(z.string()).optional().describe(
    `Limit rules to these topics.
     Example: ["coding"]`
  ),
  include_tags: z.array(z.string()).optional().describe(
    `OR-filter for rule discovery.
     Example: ["style guide","api guidelines"]`
  ),
  require_tags: z.array(z.string()).optional().describe(
    `AND-filter—common to include "ruleset".
     Example: ["ruleset","typescript"]`
  ),
  exclude_tags: z.array(z.string()).optional().describe(
    `NOT-filter for rules to avoid.
     Example: ["legacy","deprecated"]`
  ),
  mode: z.enum([ 'simple', 'semantic', 'hybrid' ]).default('hybrid').describe(
    `Retrieval mode for finding relevant rules.`
  ),
  limit: z.number().int().min(1).max(50).default(20).describe(
    `Max sections considered when generating the checklist.`
  ),
  format: z.enum([ 'json','markdown' ]).default('json').describe(
    `Output shape for the checklist deliverable.`
  )
};

export const info = {
  title: 'Checklist from Rules',
  description: 'Turn applicable rules (MUST/SHOULD/MAY/MUST NOT) into an actionable checklist for the given task.',
  inputSchema: schema
};

export function register(server: McpServer, store: JsonlStore) {
  server.registerTool('checklist_from_rules', info, async args => {
    //get zod params
    const params = z.object(schema).parse(args);
    //extract variables from params
    const {
      task,
      topics,
      include_tags: includeTags, 
      require_tags: requireTags = ['ruleset'], 
      exclude_tags: excludeTags, 
      mode,
      limit,
      format
    } = params
    //search for the task and get the hits
    const { hits } = await store.search(task, {
      topics: topics,
      includeTags,
      requireTags,
      excludeTags,
      mode: mode,
      limit: limit,
      snippetOnly: false
    });
    //group the hits by rule
    const grouped: Record<string, ChecklistItem[]> = { 
      MUST: [], 
      SHOULD: [], 
      'MUST NOT': [], 
      UNKNOWN: []
    };
    //loop through hits
    for (const hit of hits) {
      //get row by id
      const row = store.get(hit.id);
      //determine the rule
      const rule = (row?.rule as RuleType) || 'UNKNOWN';
      //create a check item and group it with the rule
      grouped[rule].push(toChecklistItem(store, hit.id));
    }
    //if AI wants markdown
    if (format === 'markdown') {
      const lines: string[] = [];
      //define callback that converts checklist item to markdown
      const section = (name: string, items: any[]) => {
        if (!items.length) return;
        lines.push(`## ${name}`);
        for (const i of items) {
          lines.push(`- [ ] (${i.id}) ${i.title}`);
        }
        lines.push('');
      };
      //now convert all the checklist items to markdown
      section('MUST', grouped.MUST);
      section('SHOULD', grouped.SHOULD);
      section('MUST NOT', grouped['MUST NOT']);
      section('UNKNOWN', grouped.UNKNOWN);
      return toMcpText({ 
        format: 'markdown', 
        checklist: lines.join('\n') 
      });
    }
    //otherwise just return the json
    return toMcpText({
      format: 'json',
      checklist: grouped,
      meta: { task: task }
    });
  });
};
