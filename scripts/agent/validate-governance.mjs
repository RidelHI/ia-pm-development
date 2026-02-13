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

function extractIssueField(body, fieldName) {
  if (typeof body !== "string" || !body.trim()) {
    return "";
  }

  const inlinePattern = new RegExp(
    `^\\s*${escapeRegex(fieldName)}\\s*:\\s*(.+)$`,
    "im"
  );
  const inlineMatch = inlinePattern.exec(body);
  if (inlineMatch?.[1]) {
    return inlineMatch[1].trim();
  }

  const lines = body.split(/\r?\n/);
  const headingPattern = new RegExp(
    `^\\s*#{1,6}\\s*${escapeRegex(fieldName)}\\s*$`,
    "i"
  );

  for (let index = 0; index < lines.length; index += 1) {
    if (!headingPattern.test(lines[index])) {
      continue;
    }

    const valueLines = [];
    for (let cursor = index + 1; cursor < lines.length; cursor += 1) {
      const currentLine = lines[cursor];
      if (/^\s*#{1,6}\s+/.test(currentLine)) {
        break;
      }
      valueLines.push(currentLine);
    }

    return valueLines.join("\n").trim();
  }

  return "";
}

function parseIssueReferences(value) {
  if (typeof value !== "string" || !value.trim()) {
    return [];
  }

  const matches = [...value.matchAll(/#(\d+)/g)];
  return [...new Set(matches.map((match) => Number(match[1])).filter(Number.isInteger))];
}

function parseExecutionOrder(value) {
  if (typeof value !== "string" || !value.trim()) {
    return null;
  }

  const match = /^\s*(\d+)\s*$/.exec(value);
  if (!match) {
    return null;
  }

  const parsed = Number(match[1]);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    return null;
  }

  return parsed;
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
      case "--help":
      case "-h":
        console.log(
          "Usage: node scripts/agent/validate-governance.mjs preflight --issue <number> --agent <agent:role> [--allow-todo-status] [--allow-dirty]"
        );
        process.exit(0);
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

  const issueCache = new Map();
  function getIssue(issueNumber) {
    if (!Number.isInteger(issueNumber) || issueNumber <= 0) {
      fail(`Issue number must be a positive integer. Current: ${issueNumber}`);
    }

    if (!issueCache.has(issueNumber)) {
      const data = JSON.parse(
        run("gh", [
          "issue",
          "view",
          String(issueNumber),
          "--json",
          "number,state,labels,url,title,body"
        ])
      );
      issueCache.set(issueNumber, data);
    }

    return issueCache.get(issueNumber);
  }

  const orchestration = policy?.orchestration ?? {};
  const executionAgents = Array.isArray(orchestration.executionAgents)
    ? orchestration.executionAgents
    : ["agent:backend", "agent:frontend", "agent:qa", "agent:release"];
  const pmAgentLabel = orchestration.pmAgentLabel ?? "agent:pm";
  const parentPmField = orchestration.parentPmField ?? "Parent PM";
  const executionOrderField = orchestration.executionOrderField ?? "Execution Order";
  const dependsOnField = orchestration.dependsOnField ?? "Depends on";
  const noneValue = String(orchestration.noneValue ?? "none").trim().toLowerCase();
  const requirePmParentForExecutionAgents =
    orchestration.requirePmParentForExecutionAgents ?? true;
  const requireExecutionOrderForExecutionAgents =
    orchestration.requireExecutionOrderForExecutionAgents ?? true;
  const requireDependsOnFieldForExecutionAgents =
    orchestration.requireDependsOnFieldForExecutionAgents ?? true;
  const requireDependencyClosure = orchestration.requireDependencyClosure ?? true;
  const requireParentToReferenceChildIssue =
    orchestration.requireParentToReferenceChildIssue ?? true;

  const issueData = getIssue(options.issue);

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

  const isExecutionAgent = executionAgents.includes(options.agent);
  const issueBody = issueData.body ?? "";

  const executionOrderRaw = extractIssueField(issueBody, executionOrderField);
  const executionOrder = parseExecutionOrder(executionOrderRaw);
  if (isExecutionAgent && requireExecutionOrderForExecutionAgents && !executionOrder) {
    fail(
      `Issue #${options.issue} must define "${executionOrderField}" as a positive integer for ${options.agent}.`
    );
  }

  const dependsOnRaw = extractIssueField(issueBody, dependsOnField);
  if (isExecutionAgent && requireDependsOnFieldForExecutionAgents && !dependsOnRaw) {
    fail(
      `Issue #${options.issue} must include "${dependsOnField}" (use "${noneValue}" when there are no blockers).`
    );
  }

  let dependencyIssueNumbers = [];
  if (dependsOnRaw && dependsOnRaw.trim().toLowerCase() !== noneValue) {
    dependencyIssueNumbers = parseIssueReferences(dependsOnRaw).filter(
      (issueNumber) => issueNumber !== options.issue
    );
  }

  if (
    isExecutionAgent &&
    requireDependsOnFieldForExecutionAgents &&
    dependsOnRaw &&
    dependsOnRaw.trim().toLowerCase() !== noneValue &&
    dependencyIssueNumbers.length === 0
  ) {
    fail(
      `Issue #${options.issue} "${dependsOnField}" must contain issue references like "#123" or "${noneValue}".`
    );
  }

  const parentPmRaw = extractIssueField(issueBody, parentPmField);
  const parentPmIssueNumbers = parseIssueReferences(parentPmRaw);
  let parentPmIssue = null;

  if (isExecutionAgent && requirePmParentForExecutionAgents) {
    if (parentPmIssueNumbers.length !== 1) {
      fail(
        `Issue #${options.issue} must define exactly one "${parentPmField}" reference (e.g. "#123").`
      );
    }

    parentPmIssue = getIssue(parentPmIssueNumbers[0]);
    const parentLabels = (parentPmIssue.labels ?? [])
      .map((label) => label.name)
      .filter(Boolean);
    const parentAgentLabels = parentLabels.filter((name) => name.startsWith("agent:"));

    if (parentAgentLabels.length !== 1 || parentAgentLabels[0] !== pmAgentLabel) {
      fail(
        `Parent issue #${parentPmIssue.number} must be owned by ${pmAgentLabel}. Found: ${parentAgentLabels.join(", ") || "none"}.`
      );
    }

    if (requireParentToReferenceChildIssue) {
      const childReferencePattern = new RegExp(`#${options.issue}(\\D|$)`);
      if (!childReferencePattern.test(parentPmIssue.body ?? "")) {
        fail(
          `Parent PM issue #${parentPmIssue.number} must reference child issue #${options.issue} in its execution plan.`
        );
      }
    }
  }

  if (isExecutionAgent && requireDependencyClosure && dependencyIssueNumbers.length > 0) {
    for (const dependencyIssueNumber of dependencyIssueNumbers) {
      const dependencyIssue = getIssue(dependencyIssueNumber);
      if (dependencyIssue.state !== "CLOSED") {
        fail(
          `Dependency issue #${dependencyIssueNumber} must be CLOSED before starting #${options.issue}.`
        );
      }

      if (executionOrder) {
        const dependencyOrderRaw = extractIssueField(
          dependencyIssue.body ?? "",
          executionOrderField
        );
        const dependencyOrder = parseExecutionOrder(dependencyOrderRaw);
        if (dependencyOrder && dependencyOrder >= executionOrder) {
          fail(
            `Dependency issue #${dependencyIssueNumber} has "${executionOrderField}"=${dependencyOrder}, which must be lower than #${options.issue} (${executionOrder}).`
          );
        }
      }
    }
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
  if (isExecutionAgent) {
    console.log(`Execution order: ${executionOrder ?? "n/a"}`);
    console.log(
      `Parent PM: ${parentPmIssue ? `#${parentPmIssue.number}` : parentPmRaw || "n/a"}`
    );
    console.log(
      `Depends on: ${
        dependencyIssueNumbers.length > 0
          ? dependencyIssueNumbers.map((issueNumber) => `#${issueNumber}`).join(", ")
          : noneValue
      }`
    );
  }
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
