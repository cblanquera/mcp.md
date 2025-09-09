//node
import path from 'node:path';
// modules
import type { Terminal } from '@stackpress/lib';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { 
  StdioServerTransport 
} from '@modelcontextprotocol/sdk/server/stdio.js';
// src
import {
  build_brief,
  check_rules,
  cite_context,
  compare_context,
  dedupe_context,
  enforce_rules,
  expand_context,
  export_context,
  extract_code,
  fetch_document,
  fetch_section,
  list_documents,
  list_related,
  list_sections,
  list_tags,
  list_topics,
  search_by_tag,
  search_context,
  search_tags,
  summarize_context,
  validate_filters
} from './tools';
import JsonlStore from './JsonlStore.js';
import { getConfig } from './helpers.js';


//--------------------------------------------------------------------//
// Main Function

export default async function serve(cwd: string, terminal: Terminal) {
  const { name, version, inputs, output } = getConfig(cwd);
  //determine output storage path
  const storage = !output.startsWith('/') 
    ? path.join(cwd, output) 
    : output;
  //get all topics
  const topics = inputs.map(input => input.topic);
  try {
    const store = new JsonlStore(storage, topics);
    const server = new McpServer({ name, version });

    build_brief.register(server, store);
    check_rules.register(server, store);
    cite_context.register(server, store);
    compare_context.register(server, store);
    dedupe_context.register(server, store);
    enforce_rules.register(server, store);
    expand_context.register(server, store);
    export_context.register(server, store);
    extract_code.register(server, store);
    fetch_document.register(server, store);
    fetch_section.register(server, store);
    list_documents.register(server, store);
    list_related.register(server, store);
    list_sections.register(server, store);
    list_tags.register(server, store);
    list_topics.register(server, store);
    search_by_tag.register(server, store);
    search_context.register(server, store);
    search_tags.register(server, store);
    summarize_context.register(server, store);
    validate_filters.register(server, store);

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
        await terminal.resolve('log', {
          type: 'error',
          message: 'MCP transport connection closed during shutdown',
        });
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
