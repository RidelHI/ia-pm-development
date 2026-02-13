#!/usr/bin/env node

import { execFileSync, spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const POLICY_PATH = path.resolve(process.cwd(), "governance/policy.json");

function fail(message) {
  console.error(`Governance validation failed: ${message}`);
  process.exit(1);
}

function ensureCommandAvailable(command, hint) {
  const result = spawnSync(command, ["--version"], { encoding: "utf8" });
  if (result.error || result.status !== 0) {
    fail(hint);
  }
}

function run(command, args) {
  try {
    return execFileSync(command, args, { encoding: "utf8" }).trim();
  } catch (error) {
    const detail =
      error?.stderr?.toString().trim() ||
      error?.stdout?.toString().trim() ||
      error?.message ||
      "unknown error";
    fail(`${command} ${args.join(" ")} failed: ${detail}`);
  }
}

function readPolicy() {
  if (!fs.existsSync(POLICY_PATH)) {
    fail(`Missing policy file: ${POLICY_PATH}`);
  }

  try {
    return JSON.parse(fs.readFileSync(POLICY_PATH, "utf8"));
  } catch (error) {
    fail(`Invalid JSON in ${POLICY_PATH}: ${error.message}`);
  }
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function parsePreflightArgs(argv) {
  const options = {
    allowDirty: false,
    allowTodoStatus: false
  };

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    switch (token) {
      case "--issue":
      case "-i":
        options.issue = Number(argv[++index]);
        break;
      case "--agent":
      case "-a":
        options.agent = argv[++index];
        break;
      case "--project-owner":
        options.projectOwner = argv[++index];
        break;
      case "--project-number":
        options.projectNumber = Number(argv[++index]);
        break;
      case "--allow-dirty":
      case "--AllowDirty":
        options.allowDirty = true;
        break;
      case "--allow-todo-status":
      case "--AllowTodoStatus":
        options.allowTodoStatus = true;
        break;
      default:
        fail(`Unknown option: ${token}`);
    }
  }

  if (!Number.isInteger(options.issue) || options.issue <= 0) {
    fail("--issue must be a positive integer.");
  }

  if (!options.agent) {
    fail("--agent is required.");
  }

  return options;
}

function validatePreflight(policy, options) {
  ensureCommandAvailable("git", "Git is required.");
  ensureCommandAvailable("gh", "GitHub CLI (gh) is required.");

  const agentLabels = Array.isArray(policy.agents) ? policy.agents : [];
  if (!agentLabels.includes(options.agent)) {
    fail(
      `--agent must be one of: ${agentLabels.join(", ")}. Current: ${options.agent}`
    );
  }

  const branchPrefixes = policy?.branch?.prefixes ?? ["feature", "fix", "chore"];
  const slugRegex = policy?.branch?.slugRegex ?? "[a-z0-9._-]+";
  const branchPattern = new RegExp(
    `^(${branchPrefixes.map(escapeRegex).join("|")})/${options.issue}-${slugRegex}$`,
    "i"
  );

  const branch = run("git", ["rev-parse", "--abbrev-ref", "HEAD"]);
  if (branch === "main") {
    fail("Do not implement on main. Create a feature/fix/chore branch first.");
  }

  if (!branchPattern.test(branch)) {
    fail(`Branch must match ${branchPattern}. Current: ${branch}`);
  }

  if (!options.allowDirty) {
    const dirty = run("git", ["status", "--porcelain"]);
    if (dirty) {
      fail("Working tree must be clean before implementation starts.");
    }
  }

  const issueData = JSON.parse(
    run("gh", ["issue", "view", String(options.issue), "--json", "number,state,labels,url,title"])
  );

  if (issueData.state !== "OPEN") {
    fail(`Issue #${options.issue} must be OPEN.`);
  }

  const issueLabels = (issueData.labels ?? []).map((label) => label.name).filter(Boolean);
  const issueAgentLabels = issueLabels.filter((name) => name.startsWith("agent:"));

  if (issueAgentLabels.length !== 1) {
    fail(
      `Issue #${options.issue} must have exactly one agent:* label. Found: ${issueAgentLabels.join(", ") || "none"}`
    );
  }

  if (issueAgentLabels[0] !== options.agent) {
    fail(
      `Issue #${options.issue} agent label mismatch. Expected ${options.agent}, found ${issueAgentLabels[0]}.`
    );
  }

  const projectOwner = options.projectOwner ?? policy?.project?.owner;
  const projectNumber = options.projectNumber ?? Number(policy?.project?.number);

  if (!projectOwner || !Number.isInteger(projectNumber) || projectNumber <= 0) {
    fail("project owner/number are invalid in arguments or policy.");
  }

  const projectData = JSON.parse(
    run("gh", [
      "project",
      "item-list",
      String(projectNumber),
      "--owner",
      String(projectOwner),
      "--format",
      "json"
    ])
  );

  const item = (projectData.items ?? []).find(
    (candidate) =>
      candidate?.content?.type === "Issue" &&
      Number(candidate?.content?.number) === Number(options.issue)
  );

  if (!item) {
    fail(`Issue #${options.issue} is not in project #${projectNumber} owned by ${projectOwner}.`);
  }

  const statuses = policy?.project?.statuses ?? {};
  const allowedStatuses = options.allowTodoStatus
    ? statuses.preflightAllowTodo ?? ["In Progress", "Todo"]
    : statuses.preflight ?? ["In Progress"];

  if (!item.status) {
    fail(`Issue #${options.issue} has no project status set.`);
  }

  if (!allowedStatuses.includes(item.status)) {
    fail(
      `Issue #${options.issue} status must be one of: ${allowedStatuses.join(", ")}. Current: ${item.status}`
    );
  }

  console.log(`Preflight OK for issue #${options.issue} (${issueData.title}).`);
  console.log(`Branch: ${branch}`);
  console.log(`Issue URL: ${issueData.url}`);
  console.log(`Project status: ${item.status}`);
}

function main() {
  const [command, ...rest] = process.argv.slice(2);
  if (!command || command === "--help" || command === "-h") {
    console.log("Usage: node scripts/agent/validate-governance.mjs preflight --issue <number> --agent <agent:role> [--allow-todo-status] [--allow-dirty]");
    process.exit(0);
  }

  const policy = readPolicy();

  if (command === "preflight") {
    const options = parsePreflightArgs(rest);
    validatePreflight(policy, options);
    return;
  }

  fail(`Unknown command: ${command}`);
}

main();
