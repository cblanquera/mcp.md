// modules
import type { Terminal } from '@stackpress/lib';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
// src
import type { Config } from './types.js';
import Store from './store.js';
import { embed, getConfig } from './helpers.js';

//-------------------------------------------------------------------//
// Zod shapes (ZodRawShape)

export const searchContextShape = {
  query: z.string(),
  topic: z.string().optional(),
  tags: z.array(z.string()).optional(),
  section: z.string().optional(),
  must: z.boolean().optional(),
  take: z.number().int().positive().default(6)
};

export const getContextShape = {
  id: z.string(),
};

export const getTagShape = {
  query: z.string().optional(),
};

export const dependencyGraphShape = {
  repo: z.string().optional(),
};

export const buildBriefShape = {
  task: z.string(),
  topics: z.array(z.string()),
  tokens: z.number().int().positive().default(6000)
};

//--------------------------------------------------------------------//
// Server Features

export function registerSearchContext(server: McpServer, store: Store) {
  server.registerTool(
    'search_context',
    {
      title: 'Semantic search over Stackpress docs',
      description: 'Semantic search over Stackpress docs',
      inputSchema: searchContextShape,
    },
    async (args) => {
      // defaults applied here; take is guaranteed number
      const { topic, query, tags, must, take } = z.object(searchContextShape).parse(args);
      const [ search ] = await embed([String(query)]);
      const results = store.search(search, { topic, tags, must: !!must, take });
      return { content: [{ type: 'text', text: JSON.stringify(results, null, 2) }] };
    }
  );
};

export function registerGetContext(server: McpServer, store: Store) {
  server.registerTool(
    'get_context',
    {
      title: 'Fetch a chunk by id',
      description: 'Fetch a chunk by id',
      inputSchema: getContextShape,
    },
    async (args) => {
      const { id } = z.object(getContextShape).parse(args);
      const [ repo ] = String(id).split(':');
      const items = store.load(repo).filter(context => context.id === id);
      return {
        content: [{ type: 'text', text: items.length ? JSON.stringify(items[0], null, 2) : 'NOT_FOUND' }],
      };
    }
  );
};

export function registerGetTags(server: McpServer, store: Store) {
  server.registerTool(
    'get_tags',
    {
      title: 'Fetch all tags',
      description: 'Fetch all tags',
      inputSchema: getTagShape,
    },
    async (args) => {
      // defaults applied here; take is guaranteed number
      const { query } = z.object(getTagShape).parse(args);
      const results = store.tags(query);
      return { content: [{ type: 'text', text: JSON.stringify(results, null, 2) }] };
    }
  );
};

export function registerDependencyGraph(server: McpServer, inputs: Config['inputs']) {
  server.registerTool(
    'dependency_graph',
    {
      title: 'Returns ordered dependencies',
      description: 'Returns ordered dependencies',
      inputSchema: dependencyGraphShape,
    },
    async () => ({
      content: [{ type: 'text', text: JSON.stringify({ 
        order: inputs
          //sort project by rank
          .sort((a, b) => (b.rank || 0) - (a.rank || 0))
          //then map to the repo name
          .map(input => input.topic)
      }, null, 2) }],
    })
  );
};

export function registerBuildBrief(server: McpServer, store: Store) {
  server.registerTool(
    'build_brief',
    {
      title: 'Assemble a compact brief for a task from top results across topics',
      description: 'Assemble a compact brief for a task from top results across topics',
      inputSchema: buildBriefShape,
    },
    async (args) => {
      // tokens is guaranteed number here
      const { task, topics } = z.object(buildBriefShape).parse(args);
      const [ search ] = await embed([String(task)]);
      const perRepo = topics.map(topic => ({
        topic,
        hits: store
          .search(search, { topic, take: 8, must: false })
          .sort((a, b) => {
            const aw = a.rule === 'MUST' ? 2 : a.rule === 'SHOULD' ? 1.2 : 1;
            const bw = b.rule === 'MUST' ? 2 : b.rule === 'SHOULD' ? 1.2 : 1;
            return bw - aw;
          })
          .slice(0, 8)
      }));

      const brief: string[] = [
        `# Stackpress Task Brief`,
        `Task: ${task}`,
        ``,
        `**Rules precedence:** MUST > SHOULD > MUST NOT. Upstream (lib) overrides downstream on conflict.`,
        ``
      ];
      for (const { topic, hits } of perRepo) {
        brief.push(`## ${topic}`);
        for (const h of hits) {
          brief.push(`### ${h.headings.join(' › ')}`);
          if (h.rule) brief.push(`**${h.rule}**`);
          brief.push(h.text, '');
        }
      }
      // you can use `tokens` later to trim to budget
      return { content: [{ type: 'text', text: brief.join('\n') }] };
    }
  );
};

//--------------------------------------------------------------------//
// Main Function

export default async function serve(cwd: string, terminal: Terminal) {
  const { name, version, inputs, output } = getConfig(cwd);
  try {
    const store = new Store(cwd + output);
    const server = new McpServer({ name, version });

    registerSearchContext(server, store);
    registerGetContext(server, store);
    registerGetTags(server, store);
    registerDependencyGraph(server, inputs);
    registerBuildBrief(server, store);

    const transport = new StdioServerTransport();
    
    // Add error handling for the transport
    let isShuttingDown = false;
    
    transport.onclose = async () => {
      if (!isShuttingDown) {
        await terminal.resolve('log', {
          type: 'error',
          message: 'MCP transport connection closed unexpectedly',
        });
        process.exit(1);
      } else {
        console.log('MCP transport connection closed during shutdown');
      }
    };

    transport.onerror = async (error: any) => {
      await terminal.resolve('log', {
        type: 'error',
        message: `MCP transport connection error: ${error.message}`,
      });
      if (!isShuttingDown) {
        process.exit(1);
      }
    };

    // Connect with proper error handling
    try {
      await server.connect(transport);
      await terminal.resolve('log', {
        type: 'success',
        message: 'MCP server connected successfully',
      });
    } catch (error) {
      const e = error as Error;
      await terminal.resolve('log', {
        type: 'error',
        message: `Failed to connect MCP server: ${e.message || e.toString()}`,
      });
      throw error;
    }

    // Handle process termination gracefully
    process.on('SIGINT', async () => {
      await terminal.resolve('log', {
        type: 'info',
        message: 'Received SIGINT, shutting down gracefully...',
      });
      isShuttingDown = true;
      try {
        await server.close();
        process.exit(0);
      } catch (error) {
        const e = error as Error;
        await terminal.resolve('log', {
          type: 'error',
          message: `Error during shutdown: ${e.message || e.toString()}`,
        });
        process.exit(1);
      }
    });

    process.on('SIGTERM', async () => {
      await terminal.resolve('log', {
        type: 'info',
        message: 'Received SIGTERM, shutting down gracefully...',
      });
      isShuttingDown = true;
      try {
        await server.close();
        process.exit(0);
      } catch (error) {
        const e = error as Error;
        await terminal.resolve('log', {
          type: 'error',
          message: `Error during shutdown: ${e.message || e.toString()}`,
        });
        process.exit(1);
      }
    });
  } catch (error) {
    const e = error as Error;
    await terminal.resolve('log', {
      type: 'error',
      message: `Failed to start MCP server: ${e.message || e.toString()}`,
    });
    process.exit(1);
  }
};
