# INSTALL_AUTONOMY.ps1 — one-time, user-run installer for v8 autonomous trading.
# The agent harness (correctly) refuses to self-authorize unattended trading;
# running this script IS the human authorization step. Run from anywhere:
#   powershell -ExecutionPolicy Bypass -File tools\cron\INSTALL_AUTONOMY.ps1
# Idempotent: safe to re-run. Uninstall: see UNINSTALL notes at the bottom.

$ErrorActionPreference = 'Stop'
$repo = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
Write-Host "Repo: $repo"

# ── 1. Project MCP config: official Robinhood Agentic Trading endpoint ──────
# Verified 2026-07-02 against robinhood.com/us/en/support/articles/agentic-trading-overview/
$mcp = @'
{
  "mcpServers": {
    "robinhood-trading": {
      "type": "http",
      "url": "https://agent.robinhood.com/mcp/trading"
    }
  }
}
'@
Set-Content -Path (Join-Path $repo '.mcp.json') -Value $mcp -Encoding utf8
Write-Host "[1/3] .mcp.json written (Robinhood MCP endpoint)."

# ── 2. Project permission allowlist for headless scheduled runs ─────────────
# Scope: THIS repo only. Grants the scheduled agent: file tools, web research,
# python/git commands, and ALL robinhood-trading MCP tools (incl. order
# placement) without per-call prompts — this is the v8 autonomy grant
# (strategy/HIGH_RISK_MANDATE.md §3). Delete .claude/settings.json to revoke.
$claudeDir = Join-Path $repo '.claude'
New-Item -ItemType Directory -Force $claudeDir | Out-Null
$settings = @'
{
  "permissions": {
    "allow": [
      "Read",
      "Edit",
      "Write",
      "Glob",
      "Grep",
      "WebSearch",
      "WebFetch",
      "Bash(python:*)",
      "Bash(python3:*)",
      "Bash(git add:*)",
      "Bash(git commit:*)",
      "Bash(git push:*)",
      "Bash(git status:*)",
      "Bash(git log:*)",
      "Bash(git diff:*)",
      "mcp__robinhood-trading"
    ]
  }
}
'@
Set-Content -Path (Join-Path $claudeDir 'settings.json') -Value $settings -Encoding utf8
Write-Host "[2/3] .claude/settings.json written (headless allowlist incl. robinhood-trading MCP)."

# ── 3. Scheduled tasks (Windows Task Scheduler, local = Eastern Time) ───────
$ps = 'powershell.exe -NoProfile -ExecutionPolicy Bypass -File'
$runner = Join-Path $repo 'tools\cron\run_claude.ps1'
schtasks /Create /F /TN "AgenticTrading\Daily-0900-Pipeline" /TR "$ps `"$runner`" -PromptFile daily_0900.md -Tag daily0900" /SC WEEKLY /D MON,TUE,WED,THU,FRI /ST 09:00 | Out-Null
schtasks /Create /F /TN "AgenticTrading\Daily-0940-Execute"  /TR "$ps `"$runner`" -PromptFile execute_0940.md -Tag daily0940exec" /SC WEEKLY /D MON,TUE,WED,THU,FRI /ST 09:40 | Out-Null
schtasks /Create /F /TN "AgenticTrading\Weekly-Sunday-Review" /TR "$ps `"$runner`" -PromptFile weekly_sunday.md -Tag weeklyreview" /SC WEEKLY /D SUN /ST 10:00 | Out-Null
Write-Host "[3/3] Scheduled tasks registered: 9:00 pipeline / 9:40 execute (Mon-Fri), Sun 10:00 review."

Write-Host ""
Write-Host "REMAINING MANUAL STEPS (one time):"
Write-Host "  a) Robinhood MCP OAuth: open Claude Code in this repo, run /mcp,"
Write-Host "     select robinhood-trading, authenticate (desktop device required)."
Write-Host "     If the server is missing, first run:"
Write-Host "     claude mcp add robinhood-trading --transport http https://agent.robinhood.com/mcp/trading"
Write-Host "  b) GitHub push auth: run 'git push' once in this repo and complete the sign-in window."
Write-Host ""
Write-Host "UNINSTALL / REVOKE AUTONOMY:"
Write-Host "  schtasks /Delete /F /TN AgenticTrading\Daily-0900-Pipeline"
Write-Host "  schtasks /Delete /F /TN AgenticTrading\Daily-0940-Execute"
Write-Host "  schtasks /Delete /F /TN AgenticTrading\Weekly-Sunday-Review"
Write-Host "  del .claude\settings.json   (removes the no-prompt allowlist)"
Write-Host "  ...or just tell the agent 'revoke autonomy' (HIGH_RISK_MANDATE section 3)."
