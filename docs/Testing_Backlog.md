# Testing Backlog — OpenCode

> Managed by OpenCode (testing + CI/CD agent). Work through tasks in priority order.
> Each task has a corresponding prompt file in `prompts/opencode/tasks/` to feed OpenCode.
> Update this file after completing each task.

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
| 1 | Write unit tests for `events.service.js` | `events` | `01-events-service.md` | ⬜ | Browse, CRUD, search/filter, error cases |
| 2 | Write unit tests for `attendance.service.js` | `attendance` | `02-attendance-service.md` | ⬜ | QR scan, check-in, duplicate scan, batch |
| 3 | Write unit tests for `rewards.service.js` | `rewards` | `03-rewards-service.md` | ⬜ | Browse rewards, PIN, redemption flow |
| 4 | Write unit tests for `referral.service.js` | `referral` | `04-referral-service.md` | ⬜ | Sponsorship, upline/downline |

### P2 — Secondary Services

| # | Task | Service | Prompt File | Status | Notes |
|---|------|---------|-------------|--------|-------|
| 5 | Write unit tests for `organiser.service.js` | `organiser` | `05-organiser-service.md` | ⬜ | Event mgmt, roster, Q&A |
| 6 | Write unit tests for `leaderboard.service.js` | `leaderboard` | `06-leaderboard-service.md` | ⬜ | Read service file first |
| 7 | Write unit tests for `feedback.service.js` | `feedback` | `07-feedback-service.md` | ⬜ | CRUD |
| 8 | Write unit tests for `me.service.js` | `me` | `08-me-service.md` | ⬜ | Profile, stats |

### P3 — Harder-to-Test Services

| # | Task | Service | Prompt File | Status | Notes |
|---|------|---------|-------------|--------|-------|
| 9 | Write unit tests for `email.service.js` | `email` | `09-email-service.md` | ⬜ | Mock nodemailer |
| 10 | Write unit tests for `sponsorshipConfig.service.js` | `sponsorshipConfig` | `10-sponsorshipConfig-service.md` | ⬜ | Read service file first |

### P0 — Expand Thin Tests

| # | Task | Service | Prompt File | Status | Notes |
|---|------|---------|-------------|--------|-------|
| 11 | Expand `admin.service.test.js` | `admin` | `11-expand-existing-tests.md` | ⬜ | Add dashboard, user mgmt, CRUD |
| 12 | Expand `merchant.service.test.js` | `merchant` | `11-expand-existing-tests.md` | ⬜ | Add redeem flow, expiry |

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
- **Pending:** 15
- **Completed:** 1 (CI workflow exists)
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
