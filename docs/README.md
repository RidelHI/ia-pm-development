# Documentation Map

## Objective
Keep a single, professional documentation system with clear ownership and low duplication.

## Source hierarchy
1. ADRs explain why a decision exists.
2. Runbooks explain how to operate workflows.
3. AI docs define execution rules for agent-assisted delivery.
4. QA reports provide evidence for specific issues/PRs.
5. PRDs/RFCs define product and design intent.

## Directory structure
```text
docs/
  README.md
  prd/
  adr/
  ai/
  runbooks/
  qa/
    standards/
    reports/
  postman/
  arch/
  _templates/
```

## What goes where
- `docs/prd/`: product requirement docs (MVP and future initiatives).
- `docs/adr/`: architecture decision records, immutable decision history.
- `docs/ai/`: operating model, workflows, prompt templates, and AI checklists.
- `docs/runbooks/`: operational procedures (local dev, branching, project workflow, deploys).
- `docs/qa/standards/`: QA policy and quality gate criteria.
- `docs/qa/reports/`: issue-specific quality reports and evidence.
- `docs/postman/`: API collections and environments for manual verification.
- `docs/arch/`: system architecture overview and diagrams.
- `docs/_templates/`: reusable templates for consistent authoring.

## Key entry points
- GitHub Project board: `gh project view 1 --owner RidelHI --web`
- Agent operating model: `docs/ai/agent-operating-model.md`
- GitHub Project workflow: `docs/runbooks/github-project-workflow.md`
- Git branching strategy: `docs/runbooks/git-branching-model.md`
- Angular + AI canonical playbook: `docs/ai/angular-ai-professional-playbook.md`
- Local development: `docs/runbooks/local-dev.md`
- QA standards: `docs/qa/standards/quality-gates.md`

## Conventions
- Keep one canonical source per topic and link to it from summaries.
- Prefer short runbooks and place rationale in ADRs.
- Keep issue/PR evidence in `docs/qa/reports/` and not in standards.
- Keep templates updated when quality gates or workflows change.
