//fills
import './polyfills.js'; 
//modules
import { Terminal } from '@stackpress/lib';
//src
import { ingest } from './store.js';
import server from './server.js';

/**
 * Returns a terminal interface
 */
export default function terminal(argv = process.argv) {
  const terminal = new Terminal(argv, '[mcp.md]');
  const verbose = terminal.expect<boolean>(['v', 'verbose'], false);
  const logger = async (type: string, message: string) => {
    await terminal.resolve('log', { type, message });
  };

  terminal.on('log', req => {
    const type = req.data.path('type', 'log');
    const ignore = [ 'log', 'info', 'system' ];
    if (!verbose && ignore.includes(type)) {
      return;
    }
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
      cwd = process.cwd();
    }
    try {
      await ingest(cwd, logger);
    } catch (error) {
      await terminal.resolve('log', {
        type: 'error',
        message: `Failed to ingest files: ${(error as Error).message}`
      });
      throw error;
    }
  });

  terminal.on('serve', async req => {
    //ex. --cwd /some/path
    //ex. --cwd .
    let cwd = req.data.path('cwd', process.cwd());
    if (cwd.startsWith('.')) {
      cwd = process.cwd();
    }
    
    try {
      // Start the MCP server
      await terminal.resolve('log', { 
        type: 'success', 
        message: 'Starting MCP server...' 
      });
      await server(cwd, terminal);
    } catch (error) {
      await terminal.resolve('log', { 
        type: 'error', 
        message: `Failed to start MCP server: ${(error as Error).message}` 
      });
      throw error;
    }
  });

  return terminal;
}
