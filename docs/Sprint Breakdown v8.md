# Sprint Breakdown v8 — Final Version

**Version:** 8.0
**Date:** 29 June 2026 (Updated — Added PWA-APK Unification)
**Project:** Volunteering Rewards App (C3000C)
**Timeline:** May 7 – July 6, 2026 (9 weeks)

---

## Rationale for Changes (v7.2 → v8)

Following the successful APK build for `frontend/mobile_app/`, two issues were identified:

1. **PWA-APK GUI Mismatch** — The Vercel PWA deploys from root `app/` (flat structure) while the APK was built from `frontend/mobile_app/app/` (Vivian's tab-based GUI). Users testing both platforms see different interfaces.
2. **API URL Fallback to localhost** — `frontend/mobile_app/src/services/api.ts` defaults to `http://localhost:3000/api` when `EXPO_PUBLIC_API_URL` is not set, causing production API calls to fail.

**Resolution:** New PWA-APK Unification phase added to Sprint 5 under Xon (KAN-157). See `docs/PWA-APK-Unification-Plan-v1.md` for full plan.

---

## Updated Sprint Overview

| Sprint | Dates | Focus |
|--------|-------|-------|
| **Sprint 3** | 1 Jun – 15 Jun | Frontend Completion + Integration |
| **Sprint 4** | 15 Jun – 29 Jun | Comprehensive Testing (Team) + Additional Features (Xon only) |
| **Sprint 5** | 29 Jun – 6 Jul | APK Build ✅, PWA-APK Unification, Deployment & Delivery, Feature Frontend Completion |

> **No date changes.** The original final delivery date of 6 Jul remains unchanged.

---

## Sprint 3 *(1 Jun – 15 Jun)* — Unchanged

| Member | Focus |
|--------|-------|
| **Xon** | Test Plan, unit tests, testing guide, Jira update (all ✅ done). Assist blocked members. |
| **Vivian** | Complete organiser QR scanner PWA. Wire mobile screens to live API. |
| **Grace** | Complete cashier PIN PWA. Wire merchant pages. |
| **Nurain** | Complete organiser portal wiring. Document upload. Pending approval page. |

---

## Sprint 4 *(15 Jun – 29 Jun)*

### Primary: Test Plan Execution (Whole Team)

| Test Type | Owner | Deliverable |
|-----------|-------|-------------|
| **Integration Tests** (34 tests) | Grace + Xon | Test each API endpoint with real database queries. Verify correct response shapes & error codes. |
| **System Tests** (6 tests) | Whole team | End-to-end workflow tests for all 4 portals. |
| **User Acceptance Tests** (8 tests) | Whole team | Real-world scenarios, documented with step-by-step pass/fail. |
| **Security Tests** (12 tests) | Vivian + Xon | Role guards, SQL injection, JWT expiry, rate limiting, brute force. |
| **Performance Tests** (8 tests) | Xon | API response times under load, DB query performance, pagination. |

### Sprint 3 Carry-Over Buffer
- If Vivian's QR scanner PWA or Grace's cashier PWA are not complete by 15 Jun, they are finished here using virtual teammates if needed.

---

### Secondary: Additional Features (Xon Only)

*All other team members are not assigned any feature development — they focus solely on testing and their day jobs.*

| # | Feature | Type | Est. Time | Description |
|---|---------|------|-----------|-------------|
| F1 | **AI Event Recommendations** | Content-based filtering algorithm | 3 days | Recommends events to volunteers based on their past participation history using weighted category scoring. No LLM or external API needed — pure Node.js + PostgreSQL algorithm. |
| F2 | **AI Feedback Summarizer** | Lexicon-based sentiment analysis | 3 days | Auto-summarizes volunteer feedback using keyword sentiment analysis. No LLM or external API needed — pure string processing. |
| F3 | **Volunteer Referral Program** | Database + business logic | 5 days | Multi-level referral system: referral codes, upline/downline tracking (2 tiers), bonus points for successful referrals. New DB migration+API+UI. |
| F4 | **Hall of Fame Leaderboard** | Gamification / SQL ranking | 2 days | Top 3 volunteers by points earned, events attended, check-ins, and points redeemed. Podium display with gold/silver/bronze. No schema changes needed. |

**Total estimated effort for Xon:** ~13 days across Sprint 4-5, built in parallel with testing responsibilities.

**Build order:** F1 (Recommendations) → F4 (Hall of Fame) → F3 (Referral) → F2 (Summarizer), time permitting.

---

## Sprint 5 *(29 Jun – 6 Jul)* — Deployment & Delivery + APK + PWA Unification

| Member | Focus |
|--------|-------|
| **Xon** | ✅ APK Build complete. ✅ CI Build passing. **NEW:** PWA-APK Unification (KAN-157) — Phase 1-3 + Verification. Backend deployment (Render). Complete remaining feature frontend work (Referral UI, Summarizer UI). README, final API docs. |
| **Vivian** | APK Testing (APK-TEST-01/02). Security tests. UAT: volunteer mobile + organiser flows. |
| **Grace** | Integration tests (API, QR scanning). UAT: E2E volunteer journey. |
| **Nurain** | APK Testing (APK-TEST-03/04). Documentation: report, manual, slides. UAT: merchant flows. |

### Sprint 5 — PWA-APK Unification (NEW — KAN-157)

*Assigned to Xon. Estimated total: ~1.5 hours.*

| Phase | Task | Est. Time | Reference |
|-------|------|:---------:|-----------|
| **Phase 1** | Add web deps (`react-dom`, `react-native-web`, `@expo/metro-runtime`) to `frontend/mobile_app/` | 20 min | `docs/PWA-APK-Unification-Plan-v1.md` §3 |
| **Phase 2** | Set `EXPO_PUBLIC_API_URL=https://vol-rewards-api.onrender.com/api` on Vercel | 15 min | `docs/PWA-APK-Unification-Plan-v1.md` §4 |
| **Phase 3** | Reconfigure Vercel root dir → `frontend/mobile_app/` + deploy | 15 min | `docs/PWA-APK-Unification-Plan-v1.md` §5 |
| **Verification** | Smoke test PWA + APK (both show tab-based GUI, API calls work) | 30 min | `docs/PWA-APK-Unification-Plan-v1.md` §6 |
| **Rollback** | Revert Vercel root directory if PWA breaks | 10 min | `docs/PWA-APK-Unification-Plan-v1.md` §7 |

**After unification:** Both platforms share the same source code (`frontend/mobile_app/`) and display Vivian's tab-based GUI.

---

## Additional Features — Technical Summary for Report

### F1: AI Event Recommendations
| Aspect | Detail |
|--------|--------|
| **Type** | Content-based filtering / weighted category scoring |
| **Infrastructure** | Existing Node.js + PostgreSQL — no external services |
| **Algorithm** | Count volunteer's past event categories → score upcoming events by category match → rank by relevance |
| **Report terminology** | Preference vector, weighted scoring, category affinity model |

### F2: AI Feedback Summarizer
| Aspect | Detail |
|--------|--------|
| **Type** | Lexicon-based sentiment analysis / keyword extraction |
| **Infrastructure** | Existing Node.js — no external services |
| **Algorithm** | Tokenize feedback → count positive/negative keyword matches → detect suggestion phrases → generate structured summary |
| **Report terminology** | Tokenisation, polarity scoring, pattern matching, sentiment lexicon |

### F3: Volunteer Referral Program
| Aspect | Detail |
|--------|--------|
| **Type** | Multi-level referral DAG with points incentive |
| **Infrastructure** | Existing PostgreSQL + Node.js — new migration required |
| **Algorithm** | Referral code generation → uplink tracking at registration → points awarded on downline attendance (2-tier) |
| **Report terminology** | Directed acyclic graph, two-tier weighted incentive, viral coefficient |

---

## Key Deadlines

| Date | Milestone | Status |
|------|-----------|:------:|
| **8 Jun** | Mid-sprint check: each person demos 2 working screens | ✅ Done |
| **15 Jun** | Sprint 3 ends. Test Plan + unit tests complete. | ✅ Done |
| **22 Jun** | Sprint 4 mid-point: integration tests complete. AI Event Recommendations functional. | ✅ Done |
| **29 Jun** | Sprint 4 ends: all test types complete. APK Build successful. CI Build passing. | ✅ Done |
| **30 Jun** | **PWA-APK Unification complete (NEW)** — PWA matches APK GUI | ⬜ |
| **4 Jul** | Dry-run presentation for team feedback. All features complete. | ⬜ |
| **6 Jul** | **FINAL DELIVERY** — Presentation, report, demo, deployment | ⬜ |

---

## Jira References

| Issue | Summary | Assignee | Status |
|-------|---------|----------|:------:|
| KAN-148 | APK-BUILD-v1: Install JDK 17+ & Android SDK | Xon | ✅ Done |
| KAN-149 | APK-BUILD-v2: Build native APK locally | Xon | ✅ Done |
| **KAN-157** | **PWA-APK-UNIFY: Fix PWA to match APK GUI** | **Xon** | **⬜ New** |
| KAN-150 | CI-COVERAGE-v1: Add test coverage reporting to CI | Xon | ⬜ |
| KAN-151 | CI-TESTDB-v1: Add PostgreSQL test database to CI | Xon | ⬜ |
| KAN-152 | SEC-TESTS-v1: Security tests | Vivian | ⬜ |
| KAN-153 | APK-TEST-01: Install APK on Android device | Vivian | ⬜ |
| KAN-154 | APK-TEST-02: Test home screen, navigation & events | Vivian | ⬜ |
| KAN-155 | APK-TEST-03: Test login/auth, profile & settings | Nur Ain | ⬜ |
| KAN-156 | APK-TEST-04: Test performance, stability & rotation | — | ⬜ |

---

## Additional Documentation (Sprint 5)

| Document | Location | Description |
|----------|----------|-------------|
| PWA-APK Unification Plan v1 | `docs/PWA-APK-Unification-Plan-v1.md` | 3-phase plan to fix PWA to match APK |
| Sprint 5 Schedule v4 | `docs/Sprint 5 Schedule v4.md` | Detailed task assignments by date |
| APK Testing Guide V4 | `docs/apk-testing-guide_V4.md` | Step-by-step APK install & test instructions |
| Jira Update v10 | `docs/Jira Update v10 — Sprint 5.md` | Jira board update instructions |

---

*— End of Sprint Breakdown v8 —*
