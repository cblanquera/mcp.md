//modules
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import * as z from 'zod';
//src
import type { DiffContext } from '../types';
import JsonlStore from '../JsonlStore.js';
import { toMcpText, cosine } from '../helpers.js';

export type Args = z.infer<typeof args>;

export const schema = {
  left_ids: z.array(z.string()).min(1).describe(
    'Left-hand side section IDs to compare. '
    + '\nExample: ["coding:docs/standards.md#2"]'
  ),
  right_ids: z.array(z.string()).min(1).describe(
    'Right-hand side section IDs to compare. '
    + '\nExample: ["coding:docs/standards.md#3"]'
  ),
  similarity: z.boolean().default(true).describe(
    'If true, compute embedding similarity (cosine) for pairwise IDs when possible.'
  ),
  diff_hints: z.boolean().default(true).describe(
    'If true, include lightweight diff hints (rule changes, heading changes, length delta).'
  )
};

export const args = z.object(schema);

export const info = {
  title: 'Compare Context',
  description: 'Compare two sets of sections; optionally compute '
    + 'cosine similarity and emit diff hints.',
  inputSchema: schema
};

export async function handler(args: Args, store: JsonlStore) {
  //get zod params
  const params = z.object(schema).parse(args);
  //extract variables from params
  const { 
    left_ids: leftIds, 
    right_ids: rightIds, 
    diff_hints: diffHints,
    similarity,
  } = params;

  //Build vectors if we can
  const embeddings = store.index.embeddings;
  const vectors = embeddings.vectors;
  //remember the pairs, this is what will be returned in the end
  const pairs: DiffContext[] = [];
  //for each left id
  for (const leftId of leftIds) {
    //get the left chunk
    const left = store.get(leftId);
    //and for each right id
    for (const rightId of rightIds) {
      //get the right chunk
      const right = store.get(rightId);
      //create a diff space so we can compare
      const diff: DiffContext = {
        left: { 
          id: leftId, 
          headings: left?.headings || [], 
          rule: left?.rule || null, 
          length: left?.text?.length || 0 
        },
        right:{ 
          id: rightId, 
          headings: right?.headings || [], 
          rule: right?.rule || null, 
          length: right?.text?.length || 0 
        }
      };
      //if AI wants the similarity score
      if (similarity) {
        //get the left and right vector pointers
        const leftEmbed = embeddings.get(leftId);
        const rightEmbed = embeddings.get(rightId);
        //if there are vectors
        if (leftEmbed != null 
          && rightEmbed != null 
          && vectors[leftEmbed] 
          && vectors[rightEmbed]
        ) {
          //determine the score
          diff.cosine = cosine(
            vectors[leftEmbed], 
            vectors[rightEmbed]
          );
        }
      }
      //if AI wants hints
      if (diffHints) {
        const leftRule = left?.rule || null;
        const rightRule = right?.rule || null;
        const leftHeadings = (left?.headings || []).join(' > ');
        const rightHeadings = (right?.headings || []).join(' > ');
        const leftSize = left?.text?.length || 0; 
        const rightSize = right?.text?.length || 0; 
        //collect all the hints
        diff.hints = {
          rule_changed: leftRule !== rightRule,
          heading_changed: leftHeadings !== rightHeadings,
          length_delta: rightSize - leftSize
        };
      }

      pairs.push(diff);
    }
  }

  return toMcpText({ pairs });
};

export function register(server: McpServer, store: JsonlStore) {
  server.registerTool('compare_context', info, args => handler(args, store));
};
