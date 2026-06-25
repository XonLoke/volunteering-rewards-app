# OpenCode Testing Agent — Automation

This directory contains everything needed for OpenCode to autonomously write tests for the Volunteering Rewards App backend.

## Quick Start

### Run ALL tests (one by one, press key between each)

```powershell
cd D:\c3000c\volunteering-rewards-app
powershell -File prompts/opencode/runner.ps1
```

### Run a SINGLE test task manually

```powershell
cd D:\c3000c\volunteering-rewards-app
opencode run "$(Get-Content prompts/opencode/tasks/01-events-service.md -Raw)"
```

Or with bash:
```bash
cd /d/c3000c/volunteering-rewards-app
opencode run "$(cat prompts/opencode/tasks/01-events-service.md)"
```

### Or double-click `run_test_task.bat`

## Task Order

| # | Prompt File | Service | Priority |
|---|-------------|---------|----------|
| 1 | `01-events-service.md` | events.service.js | P1 |
| 2 | `02-attendance-service.md` | attendance.service.js | P1 |
| 3 | `03-rewards-service.md` | rewards.service.js | P1 |
| 4 | `04-referral-service.md` | referral.service.js | P1 |
| 5 | `05-organiser-service.md` | organiser.service.js | P2 |
| 6 | `06-leaderboard-service.md` | leaderboard.service.js | P2 |
| 7 | `07-feedback-service.md` | feedback.service.js | P2 |
| 8 | `08-me-service.md` | me.service.js | P2 |
| 9 | `09-email-service.md` | email.service.js | P3 |
| 10 | `10-sponsorshipConfig-service.md` | sponsorshipConfig.service.js | P3 |
| 11 | `11-expand-existing-tests.md` | admin + merchant (expand) | P0 |

## How It Works

Each `.md` file is a complete, self-contained prompt for OpenCode. It includes:
- The service's exact function signatures
- The test pattern to follow (with code examples)
- What success/error cases to cover
- How to verify the tests pass

OpenCode reads the prompt, writes the test file, runs `npm test`, and reports results.

## Output

Test files go to: `backend/tests/unit/{service}.test.js`
Logs go to: `prompts/opencode/logs/{task-name}.log`
