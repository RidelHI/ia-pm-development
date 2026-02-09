#!/usr/bin/env node

import { spawnSync } from 'node:child_process';

const LINEAR_MCP_URL = 'https://mcp.linear.app/mcp';

function runCodex(args, options = {}) {
  return spawnSync('codex', args, {
    encoding: 'utf8',
    ...options,
  });
}

function printStd(result) {
  if (result.stdout) {
    process.stdout.write(result.stdout);
  }

  if (result.stderr) {
    process.stderr.write(result.stderr);
  }
}

const getExisting = runCodex(['mcp', 'get', 'linear']);

if (getExisting.status === 0) {
  console.log('Linear MCP server is already configured in Codex.');
  printStd(getExisting);
  process.exit(0);
}

console.log('Linear MCP server not found. Adding it now...');

const addResult = runCodex(['mcp', 'add', 'linear', '--url', LINEAR_MCP_URL], {
  stdio: 'inherit',
});

if (addResult.status !== 0) {
  process.exit(addResult.status ?? 1);
}

const verify = runCodex(['mcp', 'get', 'linear']);

if (verify.status !== 0) {
  printStd(verify);
  console.error('Linear MCP server could not be verified after setup.');
  process.exit(1);
}

console.log('Linear MCP server configured successfully.');
printStd(verify);