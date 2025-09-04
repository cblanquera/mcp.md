// Simple test script to verify MCP server connection handling
const { spawn } = require('child_process');
const path = require('path');

console.log('Testing MCP server connection handling...');

// Start the MCP server
const serverProcess = spawn('npx', ['mcp.md', 'serve'], {
  stdio: ['pipe', 'pipe', 'pipe'],
  cwd: process.cwd()
});

let serverOutput = '';
let serverError = '';

serverProcess.stdout.on('data', (data) => {
  const output = data.toString();
  serverOutput += output;
  console.log('Server stdout:', output.trim());
});

serverProcess.stderr.on('data', (data) => {
  const error = data.toString();
  serverError += error;
  console.log('Server stderr:', error.trim());
});

serverProcess.on('close', (code) => {
  console.log(`Server process exited with code ${code}`);
  
  if (code === 0) {
    console.log('✅ Server started and shut down gracefully');
  } else {
    console.log('❌ Server exited with error code');
  }
  
  // Check if our error handling messages are present
  if (serverOutput.includes('MCP server connected successfully') || 
      serverOutput.includes('Starting MCP server')) {
    console.log('✅ Connection logging is working');
  } else {
    console.log('⚠️  Connection logging may not be working as expected');
  }
});

serverProcess.on('error', (error) => {
  console.error('Failed to start server process:', error);
});

// Send a test message to simulate MCP communication
setTimeout(() => {
  console.log('Sending test message...');
  serverProcess.stdin.write(JSON.stringify({
    jsonrpc: "2.0",
    id: 1,
    method: "initialize",
    params: {
      protocolVersion: "2024-11-05",
      capabilities: {},
      clientInfo: {
        name: "test-client",
        version: "1.0.0"
      }
    }
  }) + '\n');
}, 1000);

// Gracefully shut down after 5 seconds
setTimeout(() => {
  console.log('Sending SIGINT to test graceful shutdown...');
  serverProcess.kill('SIGINT');
}, 5000);

// Force kill after 10 seconds if it doesn't shut down gracefully
setTimeout(() => {
  if (!serverProcess.killed) {
    console.log('Force killing server process...');
    serverProcess.kill('SIGKILL');
  }
}, 10000);
