# Runbook: Angular MCP Setup

## Objective
Standardize safe MCP setup for Angular AI workflows in this repository.

## Prerequisites
- Node.js 22+
- `pnpm` enabled in the environment
- Workspace opened at repo root

## Default policy
- Use `--read-only` by default.
- Enable write/command tools only for explicit implementation tasks.
- Keep servers local-first and least-privilege.

## Recommended command
```bash
pnpm exec ng mcp --read-only
```

## Optional command flags
- `--read-only`: disables write and shell tools.
- `--local-only`: disables web search tools.
- `--experimental-tools`: enables Angular migration, docs search, and package info tools.

## VS Code example (`.vscode/mcp.json`)
```json
{
  "servers": {
    "angular-cli": {
      "type": "stdio",
      "command": "pnpm",
      "args": ["exec", "ng", "mcp", "--read-only"]
    }
  }
}
```

## Cursor example (`.cursor/mcp.json`)
```json
{
  "mcpServers": {
    "angular-cli": {
      "command": "pnpm",
      "args": ["exec", "ng", "mcp", "--read-only"]
    }
  }
}
```

## Escalation modes
1. Safe review mode:
   - `pnpm exec ng mcp --read-only --local-only`
2. Delivery mode (trusted prompt + active implementation):
   - `pnpm exec ng mcp --experimental-tools`
3. Controlled delivery mode:
   - `pnpm exec ng mcp --experimental-tools --read-only`

## Security checklist
- Verify server origin and transport security.
- Require explicit consent for destructive or sensitive actions.
- Never pass through API keys or tokens without strict control.
- Limit tool scope to the minimum required for the task.
- Prefer local context (`AGENTS.md`, runbooks, architecture docs) before web pull.

## Troubleshooting
- `ng: command not found`:
  - Run `pnpm install` and retry `pnpm exec ng mcp --read-only`.
- MCP server not discovered in IDE:
  - Check JSON format and working directory in IDE MCP settings.
- Unexpected tool behavior:
  - Restart IDE MCP session and force `--read-only` until verified.

## Related docs
- `docs/ai/angular-ai-professional-playbook.md`
- `docs/runbooks/angular-frontend-architecture.md` (operational summary)
- `docs/ai/agent-operating-model.md`
