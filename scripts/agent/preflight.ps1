param(
  [Parameter(Mandatory = $true)]
  [int]$Issue,

  [Parameter(Mandatory = $true)]
  [ValidateSet('agent:pm', 'agent:backend', 'agent:frontend', 'agent:qa', 'agent:release')]
  [string]$Agent,

  [string]$ProjectOwner = 'RidelHI',
  [int]$ProjectNumber = 1,
  [switch]$AllowTodoStatus,
  [switch]$AllowDirty
)

$ErrorActionPreference = 'Stop'

function Fail([string]$Message) {
  Write-Host "Preflight failed: $Message" -ForegroundColor Red
  exit 1
}

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
  Fail 'Node.js is required.'
}

$validatorArgs = @(
  'scripts/agent/validate-governance.mjs',
  'preflight',
  '--issue', $Issue,
  '--agent', $Agent,
  '--project-owner', $ProjectOwner,
  '--project-number', $ProjectNumber
)

if ($AllowTodoStatus) {
  $validatorArgs += '--allow-todo-status'
}

if ($AllowDirty) {
  $validatorArgs += '--allow-dirty'
}

node @validatorArgs
exit $LASTEXITCODE
