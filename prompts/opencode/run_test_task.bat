@echo off
REM ===========================================
REM  OpenCode Test Task Runner — Batch version
REM  Usage: double-click or run from terminal
REM ===========================================
cd /d "D:\c3000c\volunteering-rewards-app"
if errorlevel 1 (
    echo ERROR: Cannot find project directory
    pause
    exit /b 1
)

echo ===========================================
echo  OpenCode Test Task Runner
echo ===========================================
echo.

REM --- Pick which task to run ---
echo Available tasks:
echo  1  events.service
echo  2  attendance.service
echo  3  rewards.service
echo  4  referral.service
echo  5  organiser.service
echo  6  leaderboard.service
echo  7  feedback.service
echo  8  me.service
echo  9  email.service
echo  10 sponsorshipConfig.service
echo  11 Expand existing tests (admin + merchant)
echo  99 Run ALL tasks sequentially
echo.
set /p CHOICE="Enter task number: "

if "%CHOICE%"=="99" goto run_all

set "TASKDIR=prompts\opencode\tasks"
if "%CHOICE%"=="1" set "TASKFILE=%TASKDIR%\01-events-service.md"
if "%CHOICE%"=="2" set "TASKFILE=%TASKDIR%\02-attendance-service.md"
if "%CHOICE%"=="3" set "TASKFILE=%TASKDIR%\03-rewards-service.md"
if "%CHOICE%"=="4" set "TASKFILE=%TASKDIR%\04-referral-service.md"
if "%CHOICE%"=="5" set "TASKFILE=%TASKDIR%\05-organiser-service.md"
if "%CHOICE%"=="6" set "TASKFILE=%TASKDIR%\06-leaderboard-service.md"
if "%CHOICE%"=="7" set "TASKFILE=%TASKDIR%\07-feedback-service.md"
if "%CHOICE%"=="8" set "TASKFILE=%TASKDIR%\08-me-service.md"
if "%CHOICE%"=="9" set "TASKFILE=%TASKDIR%\09-email-service.md"
if "%CHOICE%"=="10" set "TASKFILE=%TASKDIR%\10-sponsorshipConfig-service.md"
if "%CHOICE%"=="11" set "TASKFILE=%TASKDIR%\11-expand-existing-tests.md"

if "%TASKFILE%"=="" (
    echo Invalid choice.
    pause
    exit /b 1
)

if not exist "%TASKFILE%" (
    echo ERROR: Task file not found: %TASKFILE%
    pause
    exit /b 1
)

echo Running task: %TASKFILE%
echo.
for /f "delims=" %%i in ('type "%TASKFILE%"') do set "PROMPT=%%i"
opencode run "%PROMPT%"
echo.
echo Task complete. Check backend/tests/unit/ for output.
pause
exit /b 0

:run_all
echo Running ALL tasks sequentially...
echo This will take a while. Press Ctrl+C to stop at any time.
echo.
powershell -File "prompts\opencode\runner.ps1"
pause
exit /b 0
