<#
.SYNOPSIS
  Silent OpenCode Test Runner — runs ALL tasks unattended, no pauses.
#>

$ErrorActionPreference = "Continue"
$ProjectRoot = "D:\c3000c\volunteering-rewards-app"
$TasksDir = "$ProjectRoot\prompts\opencode\tasks"
$LogDir = "$ProjectRoot\prompts\opencode\logs"
$StatusFile = "$LogDir\RUN_STATUS.md"

New-Item -ItemType Directory -Force -Path $LogDir | Out-Null

$TaskOrder = @()
$TaskOrder += @{File="01-events-service.md"; Name="events.service.js"; Priority="P1"}
$TaskOrder += @{File="02-attendance-service.md"; Name="attendance.service.js"; Priority="P1"}
$TaskOrder += @{File="03-rewards-service.md"; Name="rewards.service.js"; Priority="P1"}
$TaskOrder += @{File="04-referral-service.md"; Name="referral.service.js"; Priority="P1"}
$TaskOrder += @{File="05-organiser-service.md"; Name="organiser.service.js"; Priority="P2"}
$TaskOrder += @{File="06-leaderboard-service.md"; Name="leaderboard.service.js"; Priority="P2"}
$TaskOrder += @{File="07-feedback-service.md"; Name="feedback.service.js"; Priority="P2"}
$TaskOrder += @{File="08-me-service.md"; Name="me.service.js"; Priority="P2"}
$TaskOrder += @{File="09-email-service.md"; Name="email.service.js"; Priority="P3"}
$TaskOrder += @{File="10-sponsorshipConfig-service.md"; Name="sponsorshipConfig.service.js"; Priority="P3"}
$TaskOrder += @{File="11-expand-existing-tests.md"; Name="admin+merchant (expand)"; Priority="P0"}

$Results = @()
$StartTime = Get-Date

Write-Host "==========================================="
Write-Host "  OpenCode Silent Test Automation"
$dt = $StartTime.ToString('yyyy-MM-dd HH:mm:ss')
Write-Host "  Started: $dt"
Write-Host "  Model: opencode/deepseek-v4-flash-free"
Write-Host "==========================================="

$total = $TaskOrder.Count
for ($i = 0; $i -lt $total; $i++) {
    $Task = $TaskOrder[$i]
    $num = $i + 1
    $TaskFile = Join-Path $TasksDir $Task.File
    $LogName = $Task.File -replace '\.md$', '.log'
    $LogFile = Join-Path $LogDir $LogName

    if (-not (Test-Path $TaskFile)) {
        Write-Host "[$num/$total] SKIP -- $($Task.File) not found"
        $obj = New-Object PSObject
        $obj | Add-Member NoteProperty Number $num
        $obj | Add-Member NoteProperty Priority $Task.Priority
        $obj | Add-Member NoteProperty Service $Task.Name
        $obj | Add-Member NoteProperty Status "SKIP"
        $obj | Add-Member NoteProperty Duration "0s"
        $Results += $obj
        continue
    }

    Write-Host "[$num/$total] Running: $($Task.Name) ($($Task.Priority))..."

    $Prompt = Get-Content $TaskFile -Raw
    $TaskStart = Get-Date

    try {
        $Output = & opencode run --model opencode/claude-haiku-4-5 $Prompt 2>&1
        $ExitCode = $LASTEXITCODE
    } catch {
        $Output = $_.Exception.Message
        $ExitCode = 1
    }

    $secs = [math]::Round(((Get-Date) - $TaskStart).TotalSeconds, 1)
    $Duration = "$($secs)s"

    $sep = "=" * 40
    $LogContent = @"
$sep
TASK: $($Task.Name)
FILE: $($Task.File)
PRIORITY: $($Task.Priority)
STARTED: $($TaskStart.ToString('yyyy-MM-dd HH:mm:ss'))
DURATION: $Duration
EXIT CODE: $ExitCode
$sep
$Output
"@
    $LogContent | Out-File -FilePath $LogFile -Encoding utf8
    Write-Host "  Log: $LogFile"

    if ($ExitCode -eq 0) {
        Write-Host "  -> PASS ($Duration)" -ForegroundColor Green
        $Status = "PASS"
    } else {
        Write-Host "  -> FAIL ($Duration)" -ForegroundColor Red
        $Status = "FAIL"
    }

    $obj = New-Object PSObject
    $obj | Add-Member NoteProperty Number $num
    $obj | Add-Member NoteProperty Priority $Task.Priority
    $obj | Add-Member NoteProperty Service $Task.Name
    $obj | Add-Member NoteProperty Status $Status
    $obj | Add-Member NoteProperty Duration $Duration
    $Results += $obj

    Write-Host ""
}

$EndTime = Get-Date
$TotalMin = [math]::Round(($EndTime - $StartTime).TotalMinutes, 1)

$Passed = 0
$Failed = 0
$Skipped = 0
foreach ($r in $Results) {
    if ($r.Status -eq "PASS") { $Passed++ }
    elseif ($r.Status -eq "FAIL") { $Failed++ }
    elseif ($r.Status -eq "SKIP") { $Skipped++ }
}

$SummaryLines = @()
$SummaryLines += "# OpenCode Test Run -- Status Summary"
$SummaryLines += ""
$SummaryLines += "**Run:** $($StartTime.ToString('yyyy-MM-dd HH:mm:ss')) -> $($EndTime.ToString('HH:mm:ss'))"
$SummaryLines += "**Duration:** ${TotalMin} minutes"
$SummaryLines += "**Model:** opencode/deepseek-v4-flash-free"
$SummaryLines += ""
$SummaryLines += "## Results"
$SummaryLines += ""
$SummaryLines += "| # | Priority | Service | Status | Duration |"
$SummaryLines += "|---|----------|---------|--------|----------|"

foreach ($r in $Results) {
    $icon = ""
    if ($r.Status -eq "PASS") { $icon = "PASS" }
    elseif ($r.Status -eq "FAIL") { $icon = "FAIL" }
    else { $icon = "SKIP" }
    $SummaryLines += "| $($r.Number) | $($r.Priority) | $($r.Service) | $icon | $($r.Duration) |"
}

$SummaryLines += ""
$SummaryLines += "**Summary:** $Passed passed, $Failed failed, $Skipped skipped (${TotalMin} min total)"
$SummaryLines += "**Logs:** $LogDir"
$SummaryLines += "**Test files:** backend/tests/unit/"

$SummaryLines -join "`n" | Out-File -FilePath $StatusFile -Encoding utf8

Write-Host "==========================================="
Write-Host "  COMPLETE -- ${TotalMin} minutes total"
$msg = "  $Passed passed, $Failed failed, $Skipped skipped"
Write-Host $msg
Write-Host "  Status report: $StatusFile"
Write-Host "==========================================="

exit $Failed
