#!/usr/bin/env node

const args = process.argv.slice(2);

function readArg(name, fallback = null) {
  const key = `--${name}`;
  const index = args.indexOf(key);

  if (index === -1) {
    return fallback;
  }

  const value = args[index + 1];
  if (!value || value.startsWith('--')) {
    return fallback;
  }

  return value;
}

if (args.includes('--help') || args.includes('-h')) {
  console.log(
    'Usage: node create-issues.mjs --file <json> [--team <KEY>] [--dry-run]',
  );
  process.exit(0);
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
        states {
          nodes {
            id
            name
            type
          }
        }
        labels {
          nodes {
            id
            name
            color
          }
        }
      }
    }
  }
`;

const mutationCreateIssueLabel = `
  mutation CreateIssueLabel($input: IssueLabelCreateInput!) {
    issueLabelCreate(input: $input) {
      success
      issueLabel {
        id
        name
        color
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
        estimate
        state {
          id
          name
        }
        labels {
          nodes {
            id
            name
          }
        }
      }
    }
  }
`;

function resolveStateId(team, stateName) {
  if (!stateName) {
    return null;
  }

  const normalized = stateName.trim().toLowerCase();
  const state = team.states.nodes.find(
    (candidate) => candidate.name.trim().toLowerCase() === normalized,
  );

  return state?.id ?? null;
}

function normalizeLabelName(label) {
  return label.trim().toLowerCase();
}

async function resolveLabelIds(team, issueLabels, labelPalette) {
  if (!issueLabels || issueLabels.length === 0) {
    return [];
  }

  const existingByName = new Map(
    team.labels.nodes.map((label) => [normalizeLabelName(label.name), label]),
  );

  const ids = [];
  for (const rawLabel of issueLabels) {
    const labelName = rawLabel.trim();
    if (!labelName) {
      continue;
    }

    const normalized = normalizeLabelName(labelName);
    let label = existingByName.get(normalized);

    if (!label) {
      const created = await linearRequest(mutationCreateIssueLabel, {
        input: {
          teamId: team.id,
          name: labelName,
          color: labelPalette?.[labelName] ?? '#7F8EA3',
        },
      });

      label = created.issueLabelCreate.issueLabel;
      existingByName.set(normalized, label);
      team.labels.nodes.push(label);
      console.log(`Created label: ${label.name}`);
    }

    ids.push(label.id);
  }

  return [...new Set(ids)];
}

if (dryRun) {
  console.log('DRY RUN - no issues will be created');
  console.log(`Team: ${teamKey ?? '<not-set>'}`);
  console.log(`Issues to create: ${payload.issues.length}`);

  for (const issue of payload.issues) {
    const labels = issue.labels?.length ? ` labels=${issue.labels.join(',')}` : '';
    const estimate = issue.estimate ? ` estimate=${issue.estimate}` : '';
    console.log(
      `- [${issue.state ?? 'Backlog'}] p${issue.priority ?? '-'} ${issue.title}${labels}${estimate}`,
    );
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

  if (issue.state) {
    const stateId = resolveStateId(team, issue.state);

    if (stateId) {
      input.stateId = stateId;
    } else {
      console.warn(
        `State "${issue.state}" not found in team ${team.key}. Falling back to default state.`,
      );
    }
  }

  if (issue.estimate !== undefined) {
    input.estimate = issue.estimate;
  }

  if (issue.dueDate) {
    input.dueDate = issue.dueDate;
  }

  if (issue.labels?.length) {
    input.labelIds = await resolveLabelIds(team, issue.labels, payload.labelPalette);
  }

  const result = await linearRequest(mutationCreateIssue, { input });
  const created = result.issueCreate.issue;
  const createdLabels = created.labels.nodes.map((label) => label.name).join(', ');

  console.log(
    `Created ${created.identifier} [${created.state?.name ?? 'unknown'}] (p${issue.priority ?? '-'}) ${created.title}`,
  );

  if (createdLabels) {
    console.log(`  labels: ${createdLabels}`);
  }

  console.log(`  ${created.url}`);
}