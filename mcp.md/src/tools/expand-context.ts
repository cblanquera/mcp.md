//modules
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import * as z from 'zod';
//src
import JsonlStore from '../JsonlStore.js';
import { toMcpText } from '../helpers.js';

export const schema = {
  ids: z.array(z.string()).min(1).describe(
    `Seed section IDs to expand.`
  ),
  neighbors: z.object({
    before: z.number().int().min(0).max(5).default(0).describe(
      `Number of preceding sections to include per seed (0–5).`
    ),
    after: z.number().int().min(0).max(5).default(0).describe(
      `Number of following sections to include per seed (0–5).`
    ),
  }).optional().describe(
    `Optional neighborhood expansion within the same document.`
  ),
  related_by_tags: z.boolean().default(false).describe(
    `If true, also include tag-related sections (ranked by shared tag count).`
  ),
  limit_related: z.number().int().min(1).max(50).default(20).describe(
    `Cap for tag-related additions (ignored if relatedByTags=false).`
  ),
  unique_only: z.boolean().default(true).describe(
    `If true, de-duplicate expanded results by ID.`
  )
};

export const info = {
  title: 'Expand Context',
  description: 'Grow a seed set by neighbors (same doc) and/or by related (shared tags).',
  inputSchema: schema
};

export function register(server: McpServer, store: JsonlStore) {
  server.registerTool('expand_context', info, async args => {
    //get zod params
    const params = z.object(schema).parse(args);
    //extract variables from params
    const {
      ids,
      neighbors,
      related_by_tags: relatedByTags,
      limit_related: limitRelated,
      unique_only: uniqueOnly
    } = params;

    //this is just a temporary storage...
    const results = {
      seeds: ids,
      neighbors: [] as string[],
      related: [] as string[]
    };

    //1. Neighbor expansion via store.section()
    if (neighbors && (neighbors.before || neighbors.after)) {
      const expanded = store
        .getSectionsByIds(ids, neighbors)
        .map(section => section.id);
      // remove seeds to only list true neighbors
      results.neighbors = expanded.filter(id => !ids.includes(id));
    }

    // 2) Related by tags using index
    if (relatedByTags) {
      const scores = new Map<string, number>();
      //for each id
      for (const seed of ids) {
        //get entry 
        const entry = store.index.ids.get(seed);
        //skip if no entry
        if (!entry) continue;
        //for each tag
        for (const tag of entry.tags) {
          //get all the ids where the tag is found
          const tagIds = store.index.tags.get(tag) || [];
          //for each of those ids
          for (const tagId of tagIds) {
            //if the id in the tag id list is in the original ids 
            // given by AI, skip
            if (ids.includes(tagId)) continue;
            //add the score
            scores.set(tagId, (scores.get(tagId) || 0) + 1);
          }
        }
      }
      //from the scores...
      results.related = Array.from(scores.entries())
        //sort which one is higher
        .sort((a, b) => b[1] - a[1])
        //paginate
        .slice(0, limitRelated)
        //and reduce down to just the id
        .map(([id]) => id);
    }
    //merge the ids, neighbors and results
    let expanded = [ ...ids, ...results.neighbors, ...results.related ];
    //if AI wants unique only
    if (uniqueOnly) {
      //make it unique
      expanded = Array.from(new Set(expanded));
    }

    return toMcpText({
      seeds: ids,
      neighbors: results.neighbors,
      related: results.related,
      expanded
    });
  });
};
