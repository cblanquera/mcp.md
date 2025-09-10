//modules
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import * as z from 'zod';
//src
import JsonlStore from '../JsonlStore.js';
import { toMcpText } from '../helpers.js';

export type Args = z.infer<typeof args>;

export const schema = {
  task: z.string().describe(
    'Short description of what needs to be produced. '
    + '\nExamples: "Create a plugin system RFC", "Write tests for the auth module"'
  ),
  audience: z.string().optional().describe(
    'Primary audience or consumers of the deliverable. '
    + '\nExamples: "library maintainers", "SWE onboarding"'
  ),
  deliverable: z.string().optional().describe(
    'Deliverable type. '
    + '\nExamples: "RFC", "design doc", "test plan", "README", "API reference"'
  ),
  tone: z.string().optional().describe(
    'Writing tone or voice. '
    + '\nExamples: "concise", "formal", "approachable", "opinionated"'
  ),
  constraints: z.array(z.string()).optional().describe(
    'Hard requirements or boundaries. '
    + '\nExamples: ["TypeScript only","max 2 pages","no external deps"]'
  ),
  topics: z.array(z.string()).optional().describe(
    'Restrict context retrieval to one or more topics. '
    + '\nExample: ["coding"]'
  ),
  include_tags: z.array(z.string()).optional().describe(
    'OR-filter: include results with at least one of these tags. '
    + '\nExample: ["plugin system","architecture"]'
  ),
  require_tags: z.array(z.string()).optional().describe(
    'AND-filter: results must include all of these tags. '
    + '\nExample: ["style guide","ruleset"]'
  ),
  exclude_tags: z.array(z.string()).optional().describe(
    'NOT-filter: exclude results with any of these tags. '
    + '\nExample: ["deprecated"]'
  ),
  mode: z.enum([ 'simple', 'semantic', 'hybrid' ]).optional().describe(
    'Retrieval strategy: "simple"=keyword, "semantic"=embedding, "hybrid"=both.'
    + '\nDefault: hybrid'
  ),
  limit: z.number().int().min(1).max(20).optional().describe(
    'Max number of supporting contexts to include in the brief scaffold.'
    + '\nDefault: 8'
  )
};

export const args = z.object(schema);

export const info = {
  title: 'Build Brief',
  description: 'Assemble a structured brief scaffold with goals, '
    + 'constraints, and top supporting contexts.',
  inputSchema: schema
};

export async function handler(args: Args, store: JsonlStore) {
  //get zod params
  const params = z.object(schema).parse(args);
  //extract variables from params
  const { 
    task, 
    topics, 
    audience = null,
    deliverable = null,
    tone = null,
    constraints = [],
    include_tags: includeTags, 
    require_tags: requireTags, 
    exclude_tags: excludeTags, 
    mode = 'hybrid', 
    limit = 8
  } = params;
  //search for the task and get the hits
  const { hits } = await store.search(task, {
    topics, 
    includeTags, 
    requireTags, 
    excludeTags, 
    mode,
    limit, 
    snippetOnly: false
  });

  return toMcpText({
    task,
    audience,
    deliverable,
    tone,
    constraints,
    guidance: {
      suggested_outline: [
        'Context & Goals',
        'Requirements & Constraints',
        'Approach / Design',
        'Risks & Trade-offs',
        'References'
      ],
      writing_tips: [
        'Prefer examples drawn from the References.',
        'Adhere to any MUST/SHOULD rules found in rulesets.',
        'Keep scope tight; defer out-of-scope items.'
      ]
    },
    references: hits.map(hit => ({
      id: hit.id,
      topic: hit.topic,
      document: hit.document,
      section_path: hit.sectionPath,
      tags: hit.tags,
      score: hit.score
    }))
  });
};

export function register(server: McpServer, store: JsonlStore) {
  server.registerTool('build_brief', info, args => handler(args, store));
};
