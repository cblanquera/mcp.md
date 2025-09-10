//node
import path from 'node:path';
//modules
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
//src
import JsonlStore from '../../src/JsonlStore.js';
import { getConfig } from '../../src/helpers.js';

export default function setup() {
  const cwd = __dirname;
  const { name, version, inputs, output } = getConfig(cwd);
  //determine output storage path
  const storage = !output.startsWith('/') 
    ? path.join(cwd, output) 
    : output;
  //get all topics
  const topics = inputs.map(input => input.topic);
  const store = new JsonlStore(storage, topics);
  const server = new McpServer({ name, version });
  return { store, server };
}