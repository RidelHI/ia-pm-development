#!/usr/bin/env node

const args = process.argv.slice(2);

function readArg(name, fallback = null) {
  const key = `--${name}`;
  const index = args.indexOf(key);

  if (index === -1) {
    return fallback;
  }

  return args[index + 1] ?? true;
}

const filePath = readArg('file');
const dryRun = args.includes('--dry-run');
const teamKey = readArg('team', process.env.LINEAR_TEAM_KEY);
const apiKey = process.env.LINEAR_API_KEY;

if (!filePath) {
  console.error('Missing --file argument');
  process.exit(1);
}

if (!teamKey && !dryRun) {
  console.error('Missing team key. Set LINEAR_TEAM_KEY or pass --team <KEY>.');
  process.exit(1);
}

const fs = await import('node:fs/promises');
const path = await import('node:path');

const absPath = path.resolve(process.cwd(), filePath);
const raw = await fs.readFile(absPath, 'utf8');
const payload = JSON.parse(raw);

async function linearRequest(query, variables = {}) {
  if (!apiKey) {
    throw new Error('Missing LINEAR_API_KEY environment variable.');
  }

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

const queryTeam = `
  query TeamByKey($key: String!) {
    teams(filter: { key: { eq: $key } }) {
      nodes {
        id
        key
        name
      }
    }
  }
`;

const mutationCreateIssue = `
  mutation CreateIssue($input: IssueCreateInput!) {
    issueCreate(input: $input) {
      success
      issue {
        id
        identifier
        title
        url
      }
    }
  }
`;

if (dryRun) {
  console.log('DRY RUN - no issues will be created');
  console.log(`Team: ${teamKey ?? '<not-set>'}`);
  console.log(`Issues to create: ${payload.issues.length}`);

  for (const issue of payload.issues) {
    console.log(`- [${issue.state}] ${issue.title}`);
  }

  process.exit(0);
}

const teamData = await linearRequest(queryTeam, { key: teamKey });
const team = teamData.teams.nodes[0];

if (!team) {
  throw new Error(`Team with key ${teamKey} not found in Linear.`);
}

console.log(`Using Linear team: ${team.name} (${team.key})`);

for (const issue of payload.issues) {
  const input = {
    teamId: team.id,
    title: issue.title,
    description: issue.description,
    priority: issue.priority,
  };

  const result = await linearRequest(mutationCreateIssue, { input });
  const created = result.issueCreate.issue;
  console.log(`Created ${created.identifier}: ${created.title}`);
  console.log(`  ${created.url}`);
}
