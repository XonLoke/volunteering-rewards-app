# Testing Backlog — OpenCode

> Managed by Claude Code (testing agent). Work through tasks in priority order.
> Phase 1 (unit tests) completed directly via Claude — OpenCode abandoned (payment required).

---

## Legend

| Mark | Meaning |
|------|---------|
| ⬜ | Pending |
| 🔄 | In progress |
| ✅ | Done |
| ❌ | Blocked |

---

## Phase 1: Write Unit Tests

### P1 — Core Services

| # | Task | Service | Prompt File | Status | Notes |
|---|------|---------|-------------|--------|-------|
| 1 | Write unit tests for `events.service.js` | `events` | `01-events-service.md` | ✅ | 19 tests |
| 2 | Write unit tests for `attendance.service.js` | `attendance` | `02-attendance-service.md` | ✅ | 10 tests + bug fix |
| 3 | Write unit tests for `rewards.service.js` | `rewards` | `03-rewards-service.md` | ✅ | 14 tests |
| 4 | Write unit tests for `referral.service.js` | `referral` | `04-referral-service.md` | ✅ | 6 tests |

### P2 — Secondary Services

| # | Task | Service | Prompt File | Status | Notes |
|---|------|---------|-------------|--------|-------|
| 5 | Write unit tests for `organiser.service.js` | `organiser` | `05-organiser-service.md` | ✅ | 7 tests |
| 6 | Write unit tests for `leaderboard.service.js` | `leaderboard` | `06-leaderboard-service.md` | ✅ | 3 tests |
| 7 | Write unit tests for `feedback.service.js` | `feedback` | `07-feedback-service.md` | ✅ | 1 test |
| 8 | Write unit tests for `me.service.js` | `me` | `08-me-service.md` | ✅ | 4 tests |

### P3 — Harder-to-Test Services

| # | Task | Service | Prompt File | Status | Notes |
|---|------|---------|-------------|--------|-------|
| 9 | Write unit tests for `email.service.js` | `email` | `09-email-service.md` | ✅ | 1 test |
| 10 | Write unit tests for `sponsorshipConfig.service.js` | `sponsorshipConfig` | `10-sponsorshipConfig-service.md` | ✅ | 2 tests |

### P0 — Expand Thin Tests

| # | Task | Service | Prompt File | Status | Notes |
|---|------|---------|-------------|--------|-------|
| 11 | Expand `admin.service.test.js` | `admin` | `11-expand-existing-tests.md` | ✅ | Was 3, now 7 tests |
| 12 | Expand `merchant.service.test.js` | `merchant` | `11-expand-existing-tests.md` | ✅ | Was 2, now 8 tests |

---

## Phase 2: CI/CD Pipeline

| # | Task | Status | Notes |
|---|------|--------|-------|
| 13 | Verify GitHub Actions CI workflow | ✅ | `.github/workflows/ci.yml` — exists and runs unit tests + lint |
| 14 | Add coverage reporting | ⬜ | `node --test --experimental-test-coverage` in CI |
| 15 | Set up test DB in CI for smoke tests | ⬜ | Already has Postgres container — smoke tests could be added |

---

## Phase 3: Integration Tests (Future)

| # | Task | Status | Notes |
|---|------|--------|-------|
| 16 | Write integration tests for auth flow | ⬜ | Register → login → refresh → logout |
| 17 | Write integration tests for event lifecycle | ⬜ | Create → browse → register → attend |

---

## Progress

- **Total tasks:** 17
- **Pending:** 4 (CI coverage, CI test DB, integration tests)
- **Completed:** 13 (all 12 unit test tasks + CI workflow)
- **In progress:** 0

---

## Automation

To run tasks automatically via OpenCode:

```powershell
# Run all tasks (press a key between each)
powershell -File prompts/opencode/runner.ps1

# Or run a single task manually
opencode run "$(Get-Content prompts/opencode/tasks/01-events-service.md -Raw)"
```

---

*Last updated: 2026-06-24*
