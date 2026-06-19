# Project Current Status Report

**Date:** 19 June 2026
**Project:** Volunteering Rewards App (C3000C)

---

## All Working ✅

| Portal | URL | Status | Login |
|--------|-----|--------|-------|
| **Backend API** | `https://vol-rewards-api.onrender.com` | ✅ Health 200, DB connected | — |
| **Admin Login** | `https://webportals-lovat.vercel.app/admin/login` | ✅ Loads | carol@test.com |
| **Organiser Portal** | `https://webportals-lovat.vercel.app/organiser` | ✅ Loads | bob@test.com |
| **Merchant Portal** | `https://webportals-lovat.vercel.app/merchant` | ✅ Loads | cheryl@test.com |
| **Scanner PWA** | `https://webportals-lovat.vercel.app/scan` | ✅ Loads | bob@test.com |
| **Volunteer PWA** | `https://dist-orpin-nine-46.vercel.app/home` | ✅ Loads | alice@test.com |

### API Login Verification (all 4 roles working)

| Role | Email | Status |
|------|-------|--------|
| Admin | carol@test.com | ✅ Login OK |
| Organiser | bob@test.com | ✅ Login OK |
| Merchant | cheryl@test.com | ✅ Login OK |
| Volunteer | alice@test.com | ✅ Login OK |

### Frontend Configuration

- The JS bundle on Vercel correctly points to `https://vol-rewards-api.onrender.com/api` (no localhost URLs)
- SPA routing fixed for all portals (`/organiser`, `/merchant`, `/scan` no longer redirect to Admin)
- Volunteer PWA `/home` 404 error fixed with `vercel.json` SPA rewrites

---

## Still Pending ⬜

| Task | Owner | Notes |
|------|-------|-------|
| PWA wrapper files (manifest, service worker) | Optional | Enhance volunteer PWA installability |
| Security tests (12 cases) | Vivian | JWT expiry, SQL injection, XSS, rate limiting, role guards |
| Integration tests (30+ endpoints) | Grace | Auth, events, attendance, rewards, leaderboard, referral, admin |
| System tests (6 E2E workflows) | Whole team | End-to-end portal workflows |
| User Acceptance Tests (8 scenarios) | Whole team | Real-world usage scenarios |
| Project report | Nurain | From C300 Report Template.docx |
| Presentation slides | Nurain | Demo walkthrough, AI features, testing, team |
| User manual | Nurain | Step-by-step for all user roles |

---

## Infrastructure

| Service | Platform | Cost |
|---------|----------|------|
| Backend API | Render (free tier) | $0/month |
| Database | Neon PostgreSQL (free tier, no expiry) | $0/month |
| Web Portals + PWA | Vercel (free tier) | $0/month |
| **Total** | | **$0.00/month** |

### Cold Start Notice

Render's free tier backend spins down after **15 minutes of inactivity**. The first request after idle takes approximately **30–60 seconds** to wake up. If a page loads slowly, wait 30 seconds and refresh.

---

## Test Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | carol@test.com | password123 |
| Organiser | bob@test.com | password123 |
| Merchant | cheryl@test.com | password123 |
| Volunteer | alice@test.com | password123 |
| Volunteer 2 | eve@test.com | password123 |
