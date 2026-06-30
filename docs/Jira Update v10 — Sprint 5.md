# Jira Update Instructions — Sprint 5 PWA-APK Unification

**Version:** 10
**Date:** 30 June 2026
**From:** Xon
**To:** Jira Admin
**Sprint:** Sprint 5 (29 Jun – 6 Jul 2026) — Final Testing, Documentation & Delivery

---

## Instructions

Please update Jira with the following changes. This update covers the **new PWA-APK Unification tasks** and tracks the **Sprint 5 progress** including the completed APK build work.

- **New issue KAN-157** → create with sub-tasks per the table below
- **Existing Sprint 5 completed tasks** → mark as **Done**
- **New sub-tasks for KAN-157** → add under the PWA-APK Unification epic

---

## Section A: New Issue — PWA-APK Unification

**Create new issue:**

| Field | Value |
|---|---|
| **Issue Key** | KAN-157 (new — KAN-157 was already taken) |
| **Summary** | PWA-APK Unification — Fix PWA to match APK GUI |
| **Description** | The Vercel PWA currently deploys from root app/ (flat structure) while the APK was built from frontend/mobile_app/ (Vivian's tab-based GUI). This task reconfigures Vercel to deploy from frontend/mobile_app/ instead, and sets the correct API base URL. After this, both platforms show the same tab-based GUI. See docs/PWA-APK-Unification-Plan-v1.md for full plan. |
| **Issue Type** | Task |
| **Priority** | High |
| **Assignee** | Xon |
| **Sprint** | Sprint 5 |
| **Labels** | pwa, apk, deployment, unification |

**Sub-tasks:**

| Sub-task | Summary | Est. Time | Assignee |
|---|---|---|---|
| KAN-157-1 | Phase 1: Add web deps (react-dom, react-native-web) to frontend/mobile_app/ | 20 min | Xon |
| KAN-157-2 | Phase 2: Set EXPO_PUBLIC_API_URL on Vercel env vars to production Render URL | 15 min | Xon |
| KAN-157-3 | Phase 3: Reconfigure Vercel root directory to frontend/mobile_app/ and deploy | 15 min | Xon |
| KAN-157-4 | Verification: Smoke test PWA + APK show same tab-based GUI | 30 min | Xon |
| KAN-157-5 | Rollback if needed — revert Vercel root directory to previous value | 10 min | Xon |

---

## Section B: Existing Sprint 5 Issues — Status Update

### Mark as Done ✅

| Issue Key | Summary | Assignee | Notes |
|---|---|---|---|
| KAN-148 | Set up Android build environment | Xon | JDK, SDK, platform tools installed |
| KAN-149 | Fix code issues for APK build | Xon | 23 files fixed (import paths, syntax, dependencies) |
| KAN-150 | Local APK build | Xon | app-release.apk generated (83 MB) |
| KAN-153 | SDK upgrade + CI workflow | Xon | Expo SDK 52→54 merged to main; CI passing |

### Remaining — Keep as In Progress / To Do ⬜

| Issue Key | Summary | Assignee | Status |
|---|---|---|---|
| **KAN-157** | **PWA-APK Unification (NEW)** | **Xon** | **⬜ To Do** |
| KAN-155 | UAT participation | Xon | ⬜ To Do |
| KAN-156 | Security test: Auth & session management | Vivian | ⬜ To Do |
| KAN-157 | Security test: Input validation | Vivian | ⬜ To Do |
| KAN-158 | APK-TEST-01: Install APK + auth flow | Vivian | ⬜ To Do |
| KAN-159 | APK-TEST-02: Events browsing | Vivian | ⬜ To Do |
| KAN-160 | UAT: Volunteer mobile flows | Vivian | ⬜ To Do |
| KAN-161 | UAT: Organiser flows | Vivian | ⬜ To Do |
| KAN-162 | Integration test: API endpoints | Grace | ⬜ To Do |
| KAN-163 | Integration test: QR scanning flow | Grace | ⬜ To Do |
| KAN-164 | UAT: End-to-end volunteer journey | Grace | ⬜ To Do |
| KAN-165 | Documentation: Project report draft | Nurain | ⬜ To Do |
| KAN-166 | Documentation: User manual | Nurain | ⬜ To Do |
| KAN-167 | APK-TEST-03: Rewards + QR scanning | Nurain | ⬜ To Do |
| KAN-168 | APK-TEST-04: Profile + settings | Nurain | ⬜ To Do |
| KAN-169 | UAT: Merchant flows | Nurain | ⬜ To Do |
| KAN-170 | Documentation: Sprint report | Nurain | ⬜ To Do |
| KAN-171 | Presentation slides | Nurain | ⬜ To Do |

---

## Section C: Sprint 5 Progress Summary

| Area | Status | % Complete |
|---|---|---|
| APK Build | ✅ Done | 100% |
| CI Build | ✅ Done | 100% |
| PWA-APK Unification | ⬜ Planned | 0% |
| APK Testing | ⬜ Not started | 0% |
| Security Testing | ⬜ Not started | 0% |
| Integration Testing | ⬜ Not started | 0% |
| UAT | ⬜ Not started | 0% |
| Documentation | ⬜ Not started | 0% |

---

## Board Links

- **Jira Board:** https://fengshui0011.atlassian.net/jira/software/projects/KAN/boards/2
- **Reference Plan:** docs/PWA-APK-Unification-Plan-v1.md
- **Sprint Schedule:** docs/Sprint 5 Schedule v4.md

---

*— End of Jira Update v10 —*
