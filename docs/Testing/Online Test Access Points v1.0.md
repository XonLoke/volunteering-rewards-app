# Online Test Access Points

**Version:** 1.0  
**Date:** 18 June 2026  
**Project:** Volunteering Rewards App (C3000C)  

---

## Portal Access URLs

| Portal | URL | Login |
|--------|-----|-------|
| **Admin** | `https://webportals-lovat.vercel.app/admin` | carol@test.com |
| **Organiser** | `https://webportals-lovat.vercel.app/organiser` | bob@test.com |
| **Merchant** | `https://webportals-lovat.vercel.app/merchant` | cheryl@test.com |
| **Scanner PWA** | `https://webportals-lovat.vercel.app/scan` | bob@test.com |
| **Volunteer App (PWA)** | `https://volunteering-rewards-app.vercel.app/home` | alice@test.com, eve@test.com |

---

## Where Everything Runs

| Component | Hosted On |
|-----------|-----------|
| Volunteer PWA (`volunteering-rewards-app.vercel.app`) | **Vercel** (cloud) |
| Admin Portal (`webportals-lovat.vercel.app`) | **Vercel** (cloud) |
| Backend API (`vol-rewards-api.onrender.com`) | **Render** (cloud) |
| Database (`neon.tech`) | **Neon** (cloud) |

All 4 services are hosted on cloud servers that run 24/7. Your computer can be completely shut down and everything still works.

Anyone with the URL can open `https://volunteering-rewards-app.vercel.app/home` on their phone, login with alice@test.com / password123, and use the volunteer app — browse events, check rewards, view leaderboard, etc. All data comes from the live Neon database via the Render API.

---

## Additional URLs

| What | URL |
|------|-----|
| Admin Login | `https://webportals-lovat.vercel.app/admin/login` |
| Organiser | `https://webportals-lovat.vercel.app/organiser` |
| Merchant | `https://webportals-lovat.vercel.app/merchant` |
| Scanner | `https://webportals-lovat.vercel.app/scan` |
| API Health | `https://vol-rewards-api.onrender.com/api/health` |
| Build Status | `https://expo.dev/accounts/xonloke/projects/vol-app/builds/09147766-5839-46c5-bc18-942e5f569db3` |
| **APK Download** | [GitHub Release v1.0.0-demo](https://github.com/XonLoke/volunteering-rewards-app/releases/tag/v1.0.0-demo) |
| **Test Suite** | `node backend/tests/integration/orchestration.test.js` (54 tests) |

---

## Testing Instructions by Role

### Carol (Admin)
- Uses `https://webportals-lovat.vercel.app/admin/login`
- Desktop use only — not mobile-optimised
- Test: Dashboard, Users, Coupons, Redemptions, Rewards Config, Merchants

### Bob (Organiser)
- Uses `https://webportals-lovat.vercel.app/organiser` for event management
- Uses `https://webportals-lovat.vercel.app/scan` for QR attendance scanning
- Scanner can be installed as PWA on phone via browser
- Test: Dashboard, Events, Roster, Feedback (AI Summary), QR Scanner

### Cheryl (Merchant)
- Uses `https://webportals-lovat.vercel.app/merchant` for PIN verification
- Installable as PWA on phone via browser
- Test: PIN verification, Coupon redemption, 5-minute reversal, History

### Alice & Eve (Volunteers)
- Use `https://volunteering-rewards-app.vercel.app` on their phones
- Mobile-optimised PWA — installable on home screen
- Test: Login, Home, Browse events, Register for event, Rewards, Leaderboard, Profile, Referral

---

## About Cold Starts

Render's free tier backend spins down after **15 minutes of inactivity**. The first request after idle takes approximately **30–60 seconds** to wake up (cold start). After that, it runs normally. So if you haven't visited the site in a while, the first page load may be slow — just wait a minute and refresh.

---

## Test Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | carol@test.com | password123 |
| Organiser | bob@test.com | password123 |
| Merchant | cheryl@test.com | password123 |
| Volunteer | alice@test.com | password123 |
| Volunteer 2 | eve@test.com | password123 |

---

## Portal Access Matrix

| Persona | Admin Portal | Organiser Portal | Merchant Portal | Scanner PWA | Volunteer PWA |
|---------|:-----------:|:---------------:|:--------------:|:----------:|:------------:|
| Admin | ✅ | ❌ | ❌ | ❌ | ❌ |
| Organiser | ❌ | ✅ | ❌ | ✅ | ❌ |
| Merchant | ❌ | ❌ | ✅ | ❌ | ❌ |
| Volunteer | ❌ | ❌ | ❌ | ❌ | ✅ |

---

## Cloud Dashboards (for Admin Use)

| Service | URL |
|---------|-----|
| **Render** | `https://dashboard.render.com` |
| **Neon** | `https://console.neon.tech` |
| **Vercel** | `https://vercel.com/xonlokes-projects` |
