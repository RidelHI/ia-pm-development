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

if (-not (Get-Command gh -ErrorAction SilentlyContinue)) {
  Fail 'GitHub CLI (gh) is required.'
}

$branch = (git rev-parse --abbrev-ref HEAD).Trim()
if ($branch -eq 'main') {
  Fail 'Do not implement on main. Create a feature/fix/chore branch first.'
}

$expectedPattern = "^(feature|fix|chore)/$Issue-[a-z0-9._-]+$"
if ($branch -notmatch $expectedPattern) {
  Fail "Branch must match $expectedPattern. Current: $branch"
}

if (-not $AllowDirty) {
  $dirty = git status --porcelain
  if ($dirty) {
    Fail 'Working tree must be clean before implementation starts.'
  }
}

$issueData = gh issue view $Issue --json number,state,labels,url,title | ConvertFrom-Json
if ($issueData.state -ne 'OPEN') {
  Fail "Issue #$Issue must be OPEN."
}

$issueLabels = @($issueData.labels | ForEach-Object { $_.name })
$agentLabels = @($issueLabels | Where-Object { $_ -like 'agent:*' })
if ($agentLabels.Count -ne 1) {
  Fail "Issue #$Issue must have exactly one agent:* label. Found: $($agentLabels -join ', ')"
}

if ($agentLabels[0] -ne $Agent) {
  Fail "Issue #$Issue agent label mismatch. Expected $Agent, found $($agentLabels[0])."
}

$projectData = gh project item-list $ProjectNumber --owner $ProjectOwner --format json | ConvertFrom-Json
$item = $projectData.items | Where-Object {
  $_.content.type -eq 'Issue' -and $_.content.number -eq $Issue
} | Select-Object -First 1

if (-not $item) {
  Fail "Issue #$Issue is not in project #$ProjectNumber owned by $ProjectOwner."
}

$allowedStatuses = @('In Progress')
if ($AllowTodoStatus) {
  $allowedStatuses += 'Todo'
}

if ([string]::IsNullOrWhiteSpace($item.status)) {
  Fail "Issue #$Issue has no project status set."
}

if ($allowedStatuses -notcontains $item.status) {
  Fail "Issue #$Issue status must be one of: $($allowedStatuses -join ', '). Current: $($item.status)"
}

Write-Host "Preflight OK for issue #$Issue ($($issueData.title))." -ForegroundColor Green
Write-Host "Branch: $branch"
Write-Host "Issue URL: $($issueData.url)"
Write-Host "Project status: $($item.status)"
