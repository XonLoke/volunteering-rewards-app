# Jira Update Instructions — Sprint 4-5 Status (19 Jun Update)

**Version:** 9
**Date:** 19 June 2026
**From:** Xon
**To:** Hermes (Jira Admin)
**Sprint:** Sprint 4 (15 Jun – 29 Jun) + Sprint 5 (29 Jun – 6 Jul)
**Status:** SPRINT 4 CORE DELIVERED ✅ (16 Jun). Sprint 5 deployment and documentation complete ✅

---

## Instructions

Please update Jira with the following changes. This update covers all tasks completed since v8 (18 Jun).

- **Newly completed tasks** → mark as **Done**
- **Sprint 5 backlog** → update per sections below
- **Set fields:** Status → Done, Resolution → Completed, Assignee → as indicated

---

## Section A: Organiser Portal (Completed 19 Jun)

| Issue Key | Summary | Assignee | Status |
|---|---|---|---|
| *(use existing key)* | Create Organiser login page at `/organiser/login` | Xon | Done — 19 Jun |
| *(use existing key)* | Add Organiser login route to App.jsx router | Xon | Done — 19 Jun |
| *(use existing key)* | Verify Admin and Organiser share same event data | Xon | Done — 19 Jun |

**Detail:** The Organiser portal was built with all pages (Dashboard, Events, Roster, Feedback, Q&A, OnsiteController) but had no login page — users visiting `/organiser` went straight to the Dashboard with no authentication. Created a green-themed login page at `/organiser/login` with role-gating for 'organiser' only. Also verified that Admin and Organiser portals both read from the same `events` table — both see identical event data.

---

## Section B: Volunteer Mobile App (Completed 19 Jun)

| Issue Key | Summary | Assignee | Status |
|---|---|---|---|
| *(use existing key)* | Rebuild volunteer PWA with manifest.json, service worker, and installability | Xon | Done — 19 Jun |
| *(use existing key)* | Add PWA manifest (name, icons, theme_color, standalone display) to `dist/` | Xon | Done — 19 Jun |
| *(use existing key)* | Add service worker for offline fetch fallback | Xon | Done — 19 Jun |
| *(use existing key)* | Deploy volunteer PWA to Vercel | Xon | Done — 19 Jun |

**Detail:** The volunteer PWA at `https://volunteering-rewards-app.vercel.app` was rebuilt with full PWA support — manifest.json (icons, theme_color #6366f1, standalone display), service-worker.js (basic offline fallback), PWA icons (192x192 and 512x512), and updated index.html with manifest link and service worker registration.

---

## Section C: Documentation & Release (Completed 19 Jun)

| Issue Key | Summary | Assignee | Status |
|---|---|---|---|
| *(use existing key)* | Update README.md with full architecture, deployment URLs, test accounts, quick-start guide | Xon | Done — 19 Jun |
| *(use existing key)* | Create `docs/Project Current Status v1.0.md` | Xon | Done — 19 Jun |
| *(use existing key)* | Update `docs/Online Test Access Points v1.0.md` | Xon | Done — 19 Jun |
| *(use existing key)* | Tag v1.0.0 release on GitHub | Xon | Done — 19 Jun |
| *(use existing key)* | Publish v1.0.0 release on GitHub with description | Xon | Done — 19 Jun |
| *(use existing key)* | Update Sprint 4 & 5 Status Report to v1.2 | Xon | Done — 19 Jun |

---

## Section D: Sprint 5 Remaining Backlog (Updated)

| Priority | Task | Suggested Assignee | Estimate | Notes |
|---|---|---|---|---|
| 🟡 MEDIUM | Integration tests (34 cases from Test Plan) | Grace | 3 days | Not yet started |
| 🟡 MEDIUM | System tests (6 E2E workflow tests) | Whole team | 2 days | Not yet started |
| 🟡 MEDIUM | User Acceptance Tests (8 real-world scenarios) | Whole team | 2 days | Not yet started |
| 🟡 MEDIUM | Project report (from C300 Report Template.docx) | Nurain | 3 days | Architecture, test results, features, contributions |
| 🟡 MEDIUM | Presentation slides | Nurain | 2 days | Demo, AI features, testing, team contributions |
| 🟢 LOW | User manual — step-by-step for all roles | Nurain | 2 days | Volunteers, organisers, merchants, admins |
| 🟡 MEDIUM | Dry-run presentation + team feedback | All | 4 Jul | Rehearsal before final delivery |
| 🔴 HIGH | Final delivery | All | 6 Jul | Hard deadline — presentation, report, demo, deployment |

---

## Notes for Hermes

1. **All Xon's Sprint 4-5 tasks are now complete.** Remaining work is team member tasks (Vivian, Grace, Nurain).
2. **Volunteer mobile APK was abandoned** after 5 failed EAS Build attempts due to Expo SDK 54 / AGP 8.11 Gradle bug. Replaced with working web PWA at `https://volunteering-rewards-app.vercel.app`.
3. **v1.0.0 tagged and published** on GitHub with full release notes.
4. **Organiser portal** now has a proper login page — previously it had none.
5. **Git commit for this update:** `53baf3b` on `origin/main`
6. **Key documents:**
   - Sprint 4 & 5 Status Report v1.2.md
   - Project Current Status v1.0.md
   - Online Test Access Points v1.0.md
   - Deployment Architecture Report v1.1.md
