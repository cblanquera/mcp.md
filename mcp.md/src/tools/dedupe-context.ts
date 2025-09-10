//modules
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import * as z from 'zod';
//src
import JsonlStore from '../JsonlStore.js';
import { toMcpText, cosine } from '../helpers.js';

export type Args = z.infer<typeof args>;

export const schema = {
  ids: z.array(z.string()).min(2).describe(
    'Candidate section IDs to deduplicate.'
  ),
  threshold: z.number().min(0).max(1).default(0.92).describe(
    'Cosine similarity threshold to treat two sections as duplicates (higher = stricter).'
  ),
  keep_strategy: z.enum(['first','longest','highest-rank']).default('first').describe(
    'Which duplicate to keep: '
    + '\n - "first": preserve input order '
    + '\n - "longest": keep the longest text '
    + '\n - "highest-rank": prefer chunk with higher rank (if present)'
  )
};

export const args = z.object(schema);

export const info = {
  title: 'Dedupe Context',
  description: 'Remove near-duplicate sections using embedding '
    + 'similarity and a keep strategy.',
  inputSchema: schema
};

export async function handler(args: Args, store: JsonlStore) {
  //get zod params
  const params = z.object(schema).parse(args);
  //extract variables from params
  const { 
    ids, 
    threshold, 
    keep_strategy: keepStrategy
  } = params;

  //get the EmbeddingsIndexer
  const embeddings = store.index.embeddings;
  //and get all the vectors (number[][])
  const { vectors } = embeddings;
  //these will be returned in the end.
  const kept: string[] = [];
  const dropped: { id: string; dupe_of: string; score: number }[] = [];
  //for each id that AI gave
  for (const currentId of ids) {
    //get the index
    const currentIndex = embeddings.get(currentId);
    //get the vector using the index
    const vector = currentIndex != null ? vectors[currentIndex] : null;
    //if no vector
    if (!vector) {
      //then it's technically not a dupe...
      kept.push(currentId); 
      continue; 
    }

    //compare to items already kept
    let dupeOf: { id: string; score: number } | false = false;
    //now let's go through the kept 
    //(existing ids that were previously processed)
    for (const previousId of kept) {
      //get the index
      const previousIndex = embeddings.get(previousId);
      //get the vector using the index
      const previousVector = previousIndex != null 
        ? vectors[previousIndex] 
        : null;
      //if no vector, then it's still technically not a dupe...
      if (!previousVector) continue;
      //determine closeness score
      const score = cosine(vector, previousVector);
      //if the closeness score is above the threshold that AI provided
      if (score >= threshold) {
        //then previous a dupe of the current
        dupeOf = { id: previousId, score };
        //so we can break out.
        //NOTE: theoretically since dupes will replace each other
        // in kept, then there should only be at most only one dupe
        // in kept at any given time.
        break;
      }
    }
    //if the current has no dupe
    if (!dupeOf) {
      //then keep the current 
      //NOTE: It may be a dupe later in the loop, who knows?!?
      kept.push(currentId);
      continue;
    }

    //if we are here, then it means a dupe was found!

    //if AI wants to keep which ever is first
    if (keepStrategy === 'first') {
      //state that the current is a dupe of previous
      //and add to the dropped list (we are keeping the previous)
      dropped.push({ 
        id: currentId, 
        dupe_of: dupeOf.id, 
        score: dupeOf.score 
      });
      continue;
    }

    //so just a recap:
    //- currentId is the chunk (row) id that we are currently 
    //  looking for dupes for.
    //- previousId was found to be a dupe of currentId
    const previousId = dupeOf.id;
    const previous = store.get(previousId);
    const current = store.get(currentId);
    //if the strategy the AI wants is to keep which ever is longer
    if (keepStrategy === 'longest') {
      //get the previous size
      const previousSize = previous?.text?.length || 0;
      //get the current size
      const currentSize = current?.text?.length || 0;
      //keep the previous if it's longer, if not then current
      const keep = previousSize >= currentSize 
        ? previousId 
        : currentId;
      //oppositely drop the other
      const drop = keep === previousId 
        ? currentId 
        : previousId;
      //if we are keeping the current
      if (keep !== previousId) {
        //get the index where the previous is
        const index = kept.indexOf(previousId);
        //and replace it with the current
        if (index >= 0) kept[index] = keep;
        //now state that the previous is a dupe of current
        //and add to the dropped list
        dropped.push({ 
          id: drop, 
          dupe_of: keep, 
          score: dupeOf.score 
        });
        continue;
      }
      //if we are here, then we are keeping the previous...
      //state that the current is a dupe of previous
      //and add to the dropped list
      dropped.push({ 
        id: currentId, 
        dupe_of: dupeOf.id, 
        score: dupeOf.score 
      });
      continue;
    } 
    //if the strategy the AI wants is to keep which ever is 
    // higher ranked
    if (keepStrategy === 'highest-rank') {
      //get the previous rank
      const previousRank = previous?.rank ?? -Infinity;
      //get the current rank
      const currentRank = current?.rank ?? -Infinity;
      //keep the previousId if it ranks higher
      const keep = previousRank >= currentRank 
        ? previousId 
        : currentId;
      //oppositely drop the other
      const drop = keep === previousId 
        ? currentId 
        : previousId;
      //if we are keeping the current
      if (keep !== previousId) {
        //get the index where the dupe is
        const index = kept.indexOf(previousId);
        //and replace it with the current
        if (index >= 0) kept[index] = keep;
        //now state that the previous is a dupe of current
        //and add to the dropped list
        dropped.push({ 
          id: drop, 
          dupe_of: keep, 
          score: dupeOf.score 
        });
        continue;
      }
      //if we are here, then we are keeping the previous...
      //state that the current is a dupe of previous
      //and add to the dropped list
      dropped.push({ 
        id: currentId, 
        dupe_of: dupeOf.id, 
        score: dupeOf.score 
      });
      continue;
    }
  }

  return toMcpText({ kept, dropped, threshold, strategy: keepStrategy });
};

export function register(server: McpServer, store: JsonlStore) {
  server.registerTool('dedupe_context', info, args => handler(args, store));
};
