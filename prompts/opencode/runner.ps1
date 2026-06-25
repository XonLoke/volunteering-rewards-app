<#
.SYNOPSIS
  OpenCode Test Automation Runner — feeds testing tasks to OpenCode one by one.
.DESCRIPTION
  Reads task prompts from tasks/ directory, feeds each to `opencode run`,
  logs results, and moves on. Run from project root.
.EXAMPLE
  cd D:\c3000c\volunteering-rewards-app
  powershell -File prompts/opencode/runner.ps1
#>

$ErrorActionPreference = "Continue"
$ProjectRoot = "D:\c3000c\volunteering-rewards-app"
$TasksDir    = "$ProjectRoot\prompts\opencode\tasks"
$LogDir      = "$ProjectRoot\prompts\opencode\logs"
$Backend     = "$ProjectRoot\backend"

# Ensure log dir exists
New-Item -ItemType Directory -Force -Path $LogDir | Out-Null

# Task execution order (filenames without .md)
$TaskOrder = @(
    "01-events-service"
    "02-attendance-service"
    "03-rewards-service"
    "04-referral-service"
    "05-organiser-service"
    "06-leaderboard-service"
    "07-feedback-service"
    "08-me-service"
    "09-email-service"
    "10-sponsorshipConfig-service"
)

Write-Host "===========================================" -ForegroundColor Cyan
Write-Host "  OpenCode Test Automation Runner" -ForegroundColor Cyan
Write-Host "  Started: $(Get-Date)" -ForegroundColor Cyan
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host ""

# Read the task master list to get current status
$BacklogPath = "$ProjectRoot\docs\Testing_Backlog.md"
Write-Host "Backlog: $BacklogPath" -ForegroundColor Gray

for ($i = 0; $i -lt $TaskOrder.Count; $i++) {
    $TaskName = $TaskOrder[$i]
    $TaskFile = "$TasksDir\$TaskName.md"
    $LogFile  = "$LogDir\$TaskName.log"

    if (-not (Test-Path $TaskFile)) {
        Write-Host "  [$i] SKIP — $TaskFile not found" -ForegroundColor Yellow
        continue
    }

    Write-Host ""
    Write-Host "--- Task $($i+1)/$($TaskOrder.Count): $TaskName ---" -ForegroundColor Green
    Write-Host ""

    # Read the prompt
    $Prompt = Get-Content $TaskFile -Raw

    # Run OpenCode
    $StartTime = Get-Date
    try {
        $Output = & opencode run $Prompt 2>&1
        $ExitCode = $LASTEXITCODE
    } catch {
        $Output = $_.Exception.Message
        $ExitCode = 1
    }
    $Duration = (Get-Date) - $StartTime

    # Log output
    @"
Task: $TaskName
Started: $($StartTime -f 'yyyy-MM-dd HH:mm:ss')
Duration: $($Duration.TotalSeconds) seconds
Exit Code: $ExitCode
---
$Output
"@ | Out-File -FilePath $LogFile -Encoding utf8

    if ($ExitCode -eq 0) {
        Write-Host "  ✅ PASS ($($Duration.TotalSeconds.ToString('0.0'))s)" -ForegroundColor Green
    } else {
        Write-Host "  ❌ FAIL ($($Duration.TotalSeconds.ToString('0.0'))s) — see $LogFile" -ForegroundColor Red
    }

    Write-Host ""
    Write-Host "  Next: $TaskName" -ForegroundColor Magenta
    Write-Host "  Log:  $LogFile" -ForegroundColor Gray
    Write-Host "  Press Ctrl+C to stop, or any key to continue..." -ForegroundColor DarkGray

    # Pause between tasks so you can review/interrupt
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
}

Write-Host ""
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host "  All tasks completed at $(Get-Date)" -ForegroundColor Cyan
Write-Host "===========================================" -ForegroundColor Cyan
