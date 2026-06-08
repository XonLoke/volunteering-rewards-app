# Jira Update v2 — For Hermes

**Version:** 2.0  
**Date:** 8 June 2026  
**Board:** https://fengshui0011.atlassian.net/jira/software/projects/KAN/list  

---

## Instructions for Hermes

Please update the Jira board with the following changes:

---

## 1. Mark These as Done

| Key | Summary | Notes |
|-----|---------|-------|
| — | Merge Vivian's branch | origin/vivian → main merged (notifications + events) ✅ |
| KAN-? | Build AI Event Recommendations Backend | F1 backend complete. Endpoints `/api/events/recommended` and `/api/events/popular` working ✅ |

---

## 2. Create New Tickets — Xon's Tasks

All assigned to **Xon**, Sprint 4 (15 Jun – 29 Jun)

| Priority | Summary | Est. Days | Description |
|----------|---------|-----------|-------------|
| 🟢 Feature | F1 Frontend — "Recommended for You" UI | 1 day | Add "Recommended for You" section to volunteer mobile app home screen. Shows 5 recommended events with relevance score badge. Coordinate with Vivian on UI placement. |
| 🟢 Feature | F2: AI Feedback Summarizer Backend | 2 days | Lexicon-based sentiment analysis engine. New endpoint `GET /api/organiser/events/:id/feedback/summary`. Keyword matching + sentiment polarity scoring. No LLM needed. |
| 🟢 Feature | F2: AI Feedback Summarizer Frontend | 1 day | Add "AI Summary" card to organiser feedback page showing sentiment breakdown. |
| 🟢 Feature | Build Hall of Fame Leaderboard (F4) | 2 days | New endpoint `GET /api/leaderboard`. Top 3 volunteers by points, events, check-ins, redemptions. Podium display. No schema changes needed. |
| 🔴 Task | Execute Integration Tests (34 tests) | 2 days | Run all 34 integration test cases from Test Plan & Case Spec v1.1. Record pass/fail in Section 10. |
| 🔴 Task | Execute Performance Tests (8 tests) | 1 day | Run all 8 performance tests using autocannon. Record response times. |
| 🔴 Task | Start Sprint 4 Testing Execution | — | Coordinate with Grace on integration tests. Begin with IT-01 to IT-18 (admin endpoints). |

---

## 3. Vivian's Status

| Key | Summary | Status |
|-----|---------|--------|
| — | Notifications system | ✅ Done — merged to main |
| — | Event registration enhancements | ✅ Done — merged to main |
| — | Mobile app UI updates (profile, scan, events) | ✅ Done — merged to main |
| KAN-16 | On-site controller PWA | ❌ Still pending — only mockup exists |

---

## 4. Grace & Nurain

| Person | Status |
|--------|--------|
| Grace | No new commits. All work still on old `origin/grace` branch from 27 May. |
| Nurain | No new commits. All work still on old `origin/nurain` branch from 2 Jun. |

---

## Quick Reference — All Current Tickets for Xon

| # | Task | Sprint | Est. |
|---|------|--------|------|
| 1 | F1 Backend — AI Event Recommendations | Sprint 4 | ✅ Done |
| 2 | F1 Frontend — "Recommended for You" UI | Sprint 4 | 1 day |
| 3 | F2 Backend — AI Feedback Summarizer | Sprint 4 | 2 days |
| 4 | F2 Frontend — AI Summary on feedback page | Sprint 5 | 1 day |
| 5 | F4 — Hall of Fame Leaderboard | Sprint 4 | 2 days |
| 6 | Integration Tests (34 IT cases) | Sprint 4 | 2 days |
| 7 | Performance Tests (8 PT cases) | Sprint 4 | 1 day |
