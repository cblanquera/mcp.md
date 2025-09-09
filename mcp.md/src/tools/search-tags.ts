//modules
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import * as z from 'zod';
//src
import JsonlStore from '../JsonlStore.js';
import { toMcpText } from '../helpers.js';

export const schema = {
  phrases: z.array(z.string()).min(1).describe(
    `Free-text phrases to map to known tags.
     Examples: ["plugin system","auth","style guide"]`
  ),
  namespaces: z.array(z.string()).optional().describe(
    `Optional tag namespaces/prefixes to constrain suggestions (prefix match).`
  ),
  limitPerPhrase: z.number().int().min(1).max(10).default(5).describe(
    `Max suggestions per phrase.`
  )
};

export const info = {
  title: 'Search Tags',
  description: 'Suggest tags that match the given phrases, optionally constrained by namespaces.',
  inputSchema: schema
};

export function register(server: McpServer, store: JsonlStore) {
  server.registerTool('search_tags', info, async args => {
    const params = z.object(schema).parse(args);
    const suggestions = store.suggestTags(params.phrases, {
      namespaces: params.namespaces,
      limitPerPhrase: params.limitPerPhrase
    });
    return toMcpText({ suggestions });
  });
};
