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

if (args.includes('--help') || args.includes('-h')) {
  console.log(
    'Usage: node move-issue-state.mjs --issue <KEY> --state <StateName> [--team <TEAM_KEY>]',
  );
  process.exit(0);
}

const issueKey = readArg('issue');
const stateName = readArg('state');
const teamKeyArg = readArg('team', process.env.LINEAR_TEAM_KEY);
const apiKey = process.env.LINEAR_API_KEY;

if (!issueKey || !stateName) {
  console.error('Missing required args. Use --issue <KEY> and --state <StateName>.');
  process.exit(1);
}

if (!apiKey) {
  console.error('Missing LINEAR_API_KEY environment variable.');
  process.exit(1);
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

const queryIssue = `
  query IssueByKey($key: String!) {
    issue(id: $key) {
      id
      identifier
      title
      url
      state {
        id
        name
      }
      team {
        id
        key
        name
        states {
          nodes {
            id
            name
            type
          }
        }
      }
    }
  }
`;

const mutationIssueUpdate = `
  mutation UpdateIssue($id: String!, $input: IssueUpdateInput!) {
    issueUpdate(id: $id, input: $input) {
      success
      issue {
        id
        identifier
        title
        url
        state {
          id
          name
        }
      }
    }
  }
`;

function resolveState(team, targetStateName) {
  const normalized = targetStateName.trim().toLowerCase();
  return (
    team.states.nodes.find(
      (candidate) => candidate.name.trim().toLowerCase() === normalized,
    ) ?? null
  );
}

const issueData = await linearRequest(queryIssue, { key: issueKey });
const issue = issueData.issue;

if (!issue) {
  throw new Error(`Issue ${issueKey} not found.`);
}

if (teamKeyArg && issue.team.key !== teamKeyArg) {
  throw new Error(
    `Issue ${issue.identifier} belongs to team ${issue.team.key}, not ${teamKeyArg}.`,
  );
}

const targetState = resolveState(issue.team, stateName);

if (!targetState) {
  const available = issue.team.states.nodes.map((state) => state.name).join(', ');
  throw new Error(
    `State "${stateName}" not found in team ${issue.team.key}. Available: ${available}`,
  );
}

if (issue.state?.id === targetState.id) {
  console.log(`Issue ${issue.identifier} is already in state ${targetState.name}.`);
  console.log(issue.url);
  process.exit(0);
}

const updatedData = await linearRequest(mutationIssueUpdate, {
  id: issue.id,
  input: {
    stateId: targetState.id,
  },
});

const updatedIssue = updatedData.issueUpdate.issue;
console.log(`Moved ${updatedIssue.identifier} to ${updatedIssue.state?.name ?? targetState.name}`);
console.log(updatedIssue.url);