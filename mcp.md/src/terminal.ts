//fills
import './polyfills.js'; 
//node
import fs from 'node:fs';
import path from 'node:path';
//modules
import { Terminal } from '@stackpress/lib';
//src
import { ensureDir } from './helpers.js';
import JsonlStore from './JsonlStore.js';
import { config, doc, project, bin } from './templates.js';
import server from './server.js';

/**
 * Returns a terminal interface
 */
export default function terminal(argv = process.argv) {
  const terminal = new Terminal(argv, '[mcp.md]');
  const flags = [ 'v', 'verbose', 'l', 'log', 'loud' ];
  const verbose = terminal.expect<boolean>(flags, false);
  const logger = async (type: string, message: string) => {
    await terminal.resolve('log', { type, message });
  };

  terminal.on('log', req => {
    const type = req.data.path('type', 'log');
    if (!verbose) return;
    const message = req.data.path('message', '');
    if (!message) return;
    if (type === 'error') {
      terminal.control.error(message);
    } else if (type === 'success') {
      terminal.control.success(message);
    } else if (type === 'system') {
      terminal.control.system(message);
    } else {
      terminal.control.info(message);
    }
  });

  terminal.on('ingest', async req => {
    //ex. --cwd /some/path
    //ex. --cwd .
    let cwd = req.data.path('cwd', process.cwd());
    if (cwd.startsWith('.')) {
      cwd = path.join(process.cwd(), cwd);
    }
    try {
      await JsonlStore.ingest(cwd, logger);
    } catch (error) {
      await logger('error', `Failed to ingest files: ${(error as Error).message}`);
      throw error;
    }
  });

  terminal.on('serve', async req => {
    //ex. --cwd /some/path
    //ex. --cwd .
    let cwd = req.data.path('cwd', process.cwd());
    if (cwd.startsWith('.')) {
      cwd = path.join(process.cwd(), cwd);
    }
    
    try {
      // Start the MCP server
      await logger('success', 'Starting MCP server...');
      await server(cwd, terminal);
    } catch (e) {
      const error = e as Error;
      await logger('error', `Failed to start MCP server: ${error.message}`);
      throw e;
    }
  });

  terminal.on('example', async req => {
    //ex. --cwd /some/path
    //ex. --cwd .
    let cwd = req.data.path('cwd', process.cwd());
    if (cwd.startsWith('.')) {
      cwd = process.cwd();
    }
    //$ touch my-mcp.md/config.yml
    fs.writeFileSync(path.join(cwd, 'config.yml'), config);
    await logger('success', 'Created config.yml');
    //$ touch my-mcp.md/docs/hello.md
    ensureDir(path.join(cwd, 'docs'));
    fs.writeFileSync(path.join(cwd, 'docs', 'hello.md'), doc);
    await logger('success', 'Created docs/hello.md');
    //$ touch my-mcp.md/mcp.md.js
    fs.writeFileSync(path.join(cwd, 'mcp.md.js'), bin);
    await logger('success', 'Created mcp.md.js');
    //$ touch my-mcp.md/package.json
    fs.writeFileSync(
      path.join(cwd, 'package.json'), 
      JSON.stringify(project, null, 2)
    );
    await logger('success', 'Created package.json');
    //$ npm install --save mcp.md
    await logger('info', 'Run "npm install" to install dependencies');
    await logger('success', 'Example project created successfully!');
  });

  return terminal;
}
