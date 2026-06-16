# Manual Operations Guide — Deployment & Delivery

**Project:** Volunteering Rewards App (C3000C)
**Version:** v1.0.0-rc
**Updated:** 16 June 2026

---

## Table of Contents

1. [Render Deployment](#1-render-deployment)
2. [Post-Deployment Verification](#2-post-deployment-verification)
3. [Project Report & Presentation (T9 — Nurain)](#3-project-report--presentation)
4. [Final Release (T10)](#4-final-release)

---

## 1. Render Deployment

### Prerequisites
- [ ] GitHub account connected to Render
- [ ] Code is pushed to `main` branch at https://github.com/XonLoke/volunteering-rewards-app

### 1.1 Create Render PostgreSQL Database

1. Go to https://dashboard.render.com
2. Click **New +** → **PostgreSQL**
3. Fill in:
   - **Name:** `vol-rewards-db`
   - **Database:** `volunteering_rewards`
   - **User:** `postgres`
   - **Region:** Choose the one closest to you (e.g., Singapore)
   - **Plan:** Free
4. Click **Create Database**
5. Wait ~2–3 minutes for provisioning
6. Copy the **Internal Database URL** (looks like: `postgres://user:password@host:5432/volunteering_rewards`) — you'll need it for the web service env vars

### 1.2 Create Render Web Service

1. Click **New +** → **Web Service**
2. Click **Connect** on your GitHub repo (`XonLoke/volunteering-rewards-app`)
3. Fill in:
   - **Name:** `vol-rewards-api`
   - **Region:** Same as your database
   - **Branch:** `main`
   - **Runtime:** `Node`
   - **Build Command:** `npm install --prefix backend`
   - **Start Command:** `node backend/index.js`
   - **Plan:** Free
4. Click **Create Web Service**
5. It will fail initially — that's expected. You need to set env vars first.

### 1.3 Set Environment Variables

In the web service dashboard, go to **Environment** tab and add:

| Key | Value | Notes |
|-----|-------|-------|
| `NODE_ENV` | `production` | |
| `PORT` | `3000` | Render overrides this with its own port |
| `DB_HOST` | *(from Render DB — Internal Database host)* | e.g., `dpg-xxxxx.singapore-postgres.render.com` |
| `DB_PORT` | `5432` | |
| `DB_NAME` | `volunteering_rewards` | |
| `DB_USER` | `postgres` | |
| `DB_PASSWORD` | *(from Render DB — password)* | |
| `JWT_ACCESS_SECRET` | `f4e2e21b0272d7991d7f22e842893f59aa5f06bc4f5944c8f68718852256eaad` | |
| `JWT_REFRESH_SECRET` | `d96ae641c1dbb9d255ff6d49b7f4149e59fa00af2a33259cd943a14fd969bd19` | |
| `JWT_ACCESS_EXPIRES_IN` | `15m` | |
| `JWT_REFRESH_EXPIRES_IN` | `7d` | |
| `PIN_SECRET` | `volunteering-rewards-pin-secret-v1` | |
| `RATE_LIMIT_WINDOW_MS` | `900000` | 15 minutes |
| `RATE_LIMIT_MAX` | `100` | requests per window |
| `CORS_ORIGINS` | `https://your-admin-frontend.onrender.com,https://your-organiser-frontend.onrender.com` | *(if you deploy frontends later)* |

> **Important:** If you deploy separate frontend portals later, update `CORS_ORIGINS` with their Render URLs.

After adding all vars, Render will automatically rebuild and restart the service.

### 1.4 Run Migrations & Seed

Once the web service is **Live**:

1. Go to your web service dashboard → **Shell** tab
2. Run these commands in order:
   ```bash
   cd backend
   npm run migrate
   npm run seed
   ```
3. Verify:
   ```bash
   psql $DATABASE_URL -c "\dt"
   psql $DATABASE_URL -c "SELECT email FROM users;"
   ```
   You should see 19 tables and 9 users.

### 1.5 Generate Additional PINs (Optional)

If you want pre-generated coupon PINs for testing:
```bash
cd backend
node scripts/init_coupons.js
```

---

## 2. Post-Deployment Verification

### 2.1 Test API Health

```bash
curl https://your-app-name.onrender.com/api/health
```
Expected response: `{"status":"ok","timestamp":"...","uptime":...}`

### 2.2 Test Login (All Roles)

```bash
# Admin
curl -X POST https://your-app-name.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"carol@test.com","password":"password123"}'

# Organiser
curl -X POST https://your-app-name.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"bob@test.com","password":"password123"}'

# Merchant
curl -X POST https://your-app-name.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"cheryl@test.com","password":"password123"}'

# Volunteer
curl -X POST https://your-app-name.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@test.com","password":"password123"}'
```

Each should return a JWT token.

### 2.3 Test E2E Smoke

After getting a token (replace `TOKEN_HERE`):

```bash
# Browse events (volunteer)
curl -H "Authorization: Bearer TOKEN_HERE" \
  https://your-app-name.onrender.com/api/events

# List coupons (admin)
curl -H "Authorization: Bearer TOKEN_HERE" \
  https://your-app-name.onrender.com/api/admin/coupons

# Leaderboard
curl -H "Authorization: Bearer TOKEN_HERE" \
  https://your-app-name.onrender.com/api/leaderboard
```

### 2.4 Test Mobile App Connection

1. Open `frontend/mobile_app/` on your dev machine
2. Update the API base URL to point to your Render URL
3. Run `npm start` and test on device/emulator

---

## 3. Project Report & Presentation

> **Assigned to:** Nurain
> **Time:** ~2 hours

### 3.1 Test Results Appendix

The following docs are ready to copy into the report:

| Document | What to Include |
|----------|----------------|
| `docs/E2E Test Results v1.0.md` | All 4 portals tested, screenshots if available |
| `docs/Test Results — Performance v2.0.md` | 17/17 tests, avg 101.7ms |
| `docs/Security Audit Report v1.0.md` | Clean audit, JWT/PIN_SECRET fixed |
| `docs/Test Report — Unit Tests (Sprint 3) v1.0.md` | 11/11 unit tests |

### 3.2 Architecture Overview

The SVG architecture diagram is at:
- `docs/volunteering_rewards_app_architecture_taskSplit_v1.svg`

Source files for the report template:
- `docs/C300 Report Template.docx` — formal report template
- `docs/Project Report Draft.md` — draft content to expand

### 3.3 Sprint Completion Summary

Guide for Nurain:
1. Open `docs/C300 Report Template.docx` or use `docs/Project Report Draft.md`
2. Fill sections:
   - **Sprint 3:** Database schema, backend API, web portal, mobile app stub
   - **Sprint 4:** JWT auth fix, performance testing, security audit, E2E testing, deployment prep
3. Add architecture diagram and test results appendices

---

## 4. Final Release

> **Time:** ~30 minutes

### 4.1 Version Numbers

Update the version string in these files:
- [ ] `backend/package.json` — `"version": "1.0.0"`
- [ ] `README.md` — add version badge or header
- [ ] `docs/E2E Test Results v1.0.md` — already versioned ✓
- [ ] Any other docs with draft/rc status

### 4.2 README Update

Edit `README.md` to include:
- [ ] Project name & description
- [ ] Architecture overview (1 paragraph)
- [ ] Quick start guide
- [ ] Tech stack list
- [ ] Deployment link (Render URL)
- [ ] Test accounts table
- [ ] Link to Postman collection at `docs/Volunteering_Rewards_API.postman_collection.json`

### 4.3 Tag v1.0.0 Release

```bash
# From the project root
git tag -a v1.0.0 -m "Release v1.0.0 — Volunteering Rewards App"
git push origin v1.0.0
```

Then on GitHub:
1. Go to https://github.com/XonLoke/volunteering-rewards-app/releases
2. Click **Draft a new release**
3. Choose tag: `v1.0.0`
4. Title: `Volunteering Rewards App v1.0.0`
5. Description: Summary of features, test results, deployment info
6. Click **Publish release**

---

## Test Accounts (All Portals)

| Role | Email | Password |
|------|-------|----------|
| **Volunteer** | `alice@test.com` | `password123` |
| **Organiser** | `bob@test.com` | `password123` |
| **Admin** | `carol@test.com` | `password123` |
| **Merchant** | `cheryl@test.com` | `password123` |

---

## Key URLs (After Deployment)

| Resource | URL |
|----------|-----|
| **Render Dashboard** | https://dashboard.render.com |
| **API Base URL** | `https://your-app-name.onrender.com` |
| **API Health** | `https://your-app-name.onrender.com/api/health` |
| **GitHub Repo** | https://github.com/XonLoke/volunteering-rewards-app |
| **Postman Collection** | `docs/Volunteering_Rewards_API.postman_collection.json` |
