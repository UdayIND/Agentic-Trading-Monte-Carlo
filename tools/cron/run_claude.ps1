# Shared runner: invokes headless Claude Code with a prompt file, logging to runs/cron-logs/.
# Usage: run_claude.ps1 -PromptFile <name.md> -Tag <logtag>
param(
  [Parameter(Mandatory = $true)][string]$PromptFile,
  [Parameter(Mandatory = $true)][string]$Tag
)
$ErrorActionPreference = 'Continue'
$repo = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)  # tools/cron -> repo root
Set-Location $repo
$logDir = Join-Path $repo 'runs\cron-logs'
New-Item -ItemType Directory -Force $logDir | Out-Null
$log = Join-Path $logDir ("{0}_{1}.log" -f (Get-Date -Format 'yyyy-MM-dd'), $Tag)

# Locate claude CLI (winget link first, then package dir, then PATH)
$claude = "$env:LOCALAPPDATA\Microsoft\WinGet\Links\claude.exe"
if (-not (Test-Path $claude)) {
  $pkg = Get-ChildItem "$env:LOCALAPPDATA\Microsoft\WinGet\Packages" -Directory -Filter 'Anthropic.ClaudeCode*' -ErrorAction SilentlyContinue | Select-Object -First 1
  if ($pkg) { $claude = (Get-ChildItem $pkg.FullName -Recurse -Filter 'claude.exe' | Select-Object -First 1).FullName }
}
if (-not $claude -or -not (Test-Path $claude)) {
  $cmd = Get-Command claude -ErrorAction SilentlyContinue
  if ($cmd) { $claude = $cmd.Source }
}
if (-not $claude) {
  "$(Get-Date -Format s) FATAL claude CLI not found; run skipped" | Out-File -Append -Encoding utf8 $log
  exit 1
}

# Weekend guard for market-day tags (weekly review runs Sundays by schedule)
$dow = (Get-Date).DayOfWeek
if ($Tag -like 'daily*' -and ($dow -eq 'Saturday' -or $dow -eq 'Sunday')) {
  "$(Get-Date -Format s) weekend; skipped" | Out-File -Append -Encoding utf8 $log
  exit 0
}

$prompt = Get-Content -Raw (Join-Path $PSScriptRoot ("prompts\" + $PromptFile))
"$(Get-Date -Format s) START $Tag via $claude" | Out-File -Append -Encoding utf8 $log
& $claude -p $prompt --permission-mode acceptEdits *>> $log
"$(Get-Date -Format s) END $Tag exit=$LASTEXITCODE" | Out-File -Append -Encoding utf8 $log
exit $LASTEXITCODE
