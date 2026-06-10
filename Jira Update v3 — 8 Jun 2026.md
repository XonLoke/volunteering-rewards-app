# Jira Update v3 — For Hermes

**Version:** 3.0  
**Date:** 8 June 2026  
**Board:** https://fengshui0011.atlassian.net/jira/software/projects/KAN/list  

---

## Instructions for Hermes

Update the Jira board with the following changes:

---

## 1. Mark These as Done

| Feature | Summary | Status |
|---------|---------|--------|
| F1 | AI Event Recommendations Backend | ✅ Done — `GET /api/events/recommended`, `GET /api/events/popular` |
| F2 | AI Feedback Summarizer Backend | ✅ Done — `GET /api/events/:id/feedback/summary` |
| F3 | Volunteer Referral Program (Full Stack) | ✅ Done — migration, API, auth hook, attendance hook, frontend |
| F4 | Hall of Fame Leaderboard Backend | ✅ Done — `GET /api/leaderboard`, `/points`, `/events`, `/checkins`, `/redeemed` |
| — | Merge Vivian's branch | ✅ Done — notifications + events enhancements merged |

---

## 2. Remaining Tasks — All Xon

| # | Task | Type | Est. |
|---|------|------|------|
| 1 | F1 Frontend — "Recommended for You" mobile UI | Feature | 1 day |
| 2 | F2 Frontend — AI Summary on organiser feedback page | Feature | 1 day |
| 3 | F4 Frontend — Hall of Fame leaderboard page | Feature | 1 day |
| 4 | Execute Integration Tests (34 IT cases) | Testing | 2 days |
| 5 | Execute Performance Tests (8 PT cases) | Testing | 1 day |

---

## 3. Team Status

| Person | Status |
|--------|--------|
| Vivian | Notifications merged. On-site controller PWA still pending. |
| Grace | No new commits since 27 May. |
| Nurain | No new commits since 2 Jun. |
