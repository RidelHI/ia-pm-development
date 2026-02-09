#!/usr/bin/env node

import { spawnSync } from 'node:child_process';

const args = process.argv.slice(2);
const strict = args.includes('--strict');
const apiKey = process.env.LINEAR_API_KEY;
const teamKey = process.env.LINEAR_TEAM_KEY;

function runCodex(argsToRun) {
  return spawnSync('codex', argsToRun, {
    encoding: 'utf8',
  });
}

async function linearRequest(query, variables = {}) {
  const response = await fetch('https://api.linear.app/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: apiKey,
    },
    body: JSON.stringify({ query, variables }),
  });

  const body = await response.json();

  if (!response.ok || body.errors) {
    const details = JSON.stringify(body.errors ?? body, null, 2);
    throw new Error(`Linear API error: ${details}`);
  }

  return body.data;
}

let hasErrors = false;

console.log('Checking Codex MCP integration...');
const mcpResult = runCodex(['mcp', 'get', 'linear']);

if (mcpResult.status !== 0) {
  hasErrors = true;
  console.log('  [FAIL] Linear MCP server is not configured in Codex.');
  console.log('  Run: pnpm linear:mcp');
} else {
  console.log('  [OK] Linear MCP server configured.');
}

console.log('Checking Linear API env vars...');
if (!apiKey) {
  hasErrors = true;
  console.log('  [FAIL] Missing LINEAR_API_KEY.');
} else {
  console.log('  [OK] LINEAR_API_KEY set.');
}

if (!teamKey) {
  hasErrors = true;
  console.log('  [FAIL] Missing LINEAR_TEAM_KEY.');
} else {
  console.log(`  [OK] LINEAR_TEAM_KEY set (${teamKey}).`);
}

if (apiKey && teamKey) {
  try {
    const query = `
      query SetupCheck($key: String!) {
        viewer {
          id
          name
          email
        }
        teams(filter: { key: { eq: $key } }) {
          nodes {
            id
            key
            name
          }
        }
      }
    `;

    const data = await linearRequest(query, { key: teamKey });
    const team = data.teams.nodes[0];

    if (!team) {
      hasErrors = true;
      console.log(`  [FAIL] Team ${teamKey} not found in Linear account.`);
    } else {
      console.log(`  [OK] API access confirmed as ${data.viewer.email}.`);
      console.log(`  [OK] Team found: ${team.name} (${team.key}).`);
    }
  } catch (error) {
    hasErrors = true;
    console.log(`  [FAIL] Linear API validation failed: ${error.message}`);
  }
}

if (hasErrors) {
  if (strict) {
    process.exit(1);
  }

  console.log('Linear integration is partially configured.');
  process.exit(0);
}

console.log('Linear integration is ready.');