# Deployment Checklist

**Version:** 1.0  
**Date:** 18 June 2026  
**Project:** Volunteering Rewards App (C3000C)  

---

## 1. Purpose

This document provides a step-by-step checklist for taking the Volunteering Rewards App from a local development environment to a fully deployed cloud-based system. It covers all four cloud platforms used (Render, Neon, Vercel, Expo) and the sequence in which they must be set up.

Unlike a traditional single-platform deployment (e.g. everything on Railway or Heroku), this project uses **four separate free-tier cloud services** because no single free platform provides all required capabilities without critical limitations (database expiry, cold starts, or build failures). This checklist documents the exact order, dependencies, and configuration needed to replicate the deployment from scratch.

---

## 2. Prerequisites

Before starting, ensure you have:

- [ ] **GitHub account** — for source control and deployment triggers
- [ ] **Git** installed locally (verify: `git --version`)
- [ ] **Node.js v22+** installed locally (verify: `node --version`)
- [ ] **npm** installed locally (verify: `npm --version`)
- [ ] **Project code** cloned locally (`git clone https://github.com/XonLoke/volunteering-rewards-app`)

---

## 3. Deployment Order & Dependencies

Each step must be completed in order because later steps depend on earlier ones:

```
Step 1: Neon (Database)     ← must exist first
    ↓
Step 2: Render (Backend)    ← needs Neon connection string
    ↓
Step 3: Vercel (Frontend)   ← needs Render API URL
    ↓
Step 4: Expo EAS (Mobile)   ← optional, currently blocked
```

---

## 4. Step-by-Step Deployment Checklist

### Step 1: Neon PostgreSQL Database

**Purpose:** Create the persistent database that stores all application data.

**Estimated time:** 5 minutes

- [ ] Go to [neon.tech](https://neon.tech) and sign up (use GitHub login for speed)
- [ ] Click **"Create a project"**
- [ ] Fill in:

  | Field | Value |
  |-------|-------|
  | Project name | `volunteering-rewards-db` |
  | Postgres version | `16` |
  | Region | **Singapore** (ap-southeast-1) |

- [ ] Click **"Create project"**
- [ ] Copy the **connection string** (looks like: `postgresql://user:password@ep-xxx.ap-southeast-1.aws.neon.tech/neondb?sslmode=require`)
- [ ] Save the connection string credentials:
  - `DB_HOST` = the host portion (e.g. `ep-xxx.ap-southeast-1.aws.neon.tech`)
  - `DB_USER` = the username portion (e.g. `neondb_owner`)
  - `DB_PASSWORD` = the password portion
  - `DB_NAME` = the database name (e.g. `neondb`)

**Verification:**
- [ ] You can view the database in Neon dashboard
- [ ] The connection string is saved (will be used in Step 2)

**Important notes:**
- Neon free tier has **no time limit** — unlike Render's built-in PostgreSQL which expires in 30 days
- SSL is **required** — all connections must use `sslmode=require`
- The database is **empty** at this point (migrations will create tables in Step 2)

---

### Step 2: Render Backend API

**Purpose:** Deploy the Node.js/Express backend server that handles all API requests.

**Estimated time:** 10 minutes

#### 2a. Create Web Service

- [ ] Go to [render.com](https://render.com) and sign up (use GitHub login)
- [ ] Click **"New +"** → **"Web Service"**
- [ ] Click **"Connect"** on your GitHub repo (`XonLoke/volunteering-rewards-app`)
- [ ] Fill in:

  | Field | Value |
  |-------|-------|
  | Name | `vol-rewards-api` |
  | Region | **Singapore** |
  | Branch | `main` |
  | Runtime | **Docker** |
  | Plan | **Free** |

- [ ] Click **"Create Web Service"**
- [ ] **Do not deploy yet** — set environment variables first (next step)

#### 2b. Set Environment Variables

- [ ] Go to **Environment** tab
- [ ] Add these variables from the Neon connection string from Step 1:

  | Key | Value Source |
  |-----|-------------|
  | `NODE_ENV` | `production` |
  | `PORT` | `3000` |
  | `DB_HOST` | From Neon connection string (host part) |
  | `DB_PORT` | `5432` |
  | `DB_NAME` | From Neon connection string (`neondb`) |
  | `DB_USER` | From Neon connection string (username) |
  | `DB_PASSWORD` | From Neon connection string (password) |
  | `DB_SSL` | `true` (critical — Neon requires SSL) |
  | `JWT_ACCESS_SECRET` | Generate: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
  | `JWT_REFRESH_SECRET` | Generate again (different value) |
  | `JWT_ACCESS_EXPIRES_IN` | `15m` |
  | `JWT_REFRESH_EXPIRES_IN` | `7d` |
  | `PIN_SECRET` | `set in Render dashboard (rotated 5 Aug 2026 — do not commit)` (must match seed data) |
  | `RATE_LIMIT_WINDOW_MS` | `900000` |
  | `RATE_LIMIT_MAX` | `100` |
  | `CORS_ORIGINS` | `*` |

**Secret generation command (run locally):**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
Run this **twice** to generate `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET`.

#### 2c. Deploy

- [ ] After adding all env vars, Render will auto-build and deploy
- [ ] Wait for **Live** status (green) — ~3–5 minutes
- [ ] Go to **Shell** tab and run migrations:
  ```bash
  cd backend && node src/utils/migrationRunner.js
  ```
- [ ] Seed test data:
  ```bash
  node src/utils/seed.js
  ```

#### 2d. Verify

- [ ] Visit `https://vol-rewards-api.onrender.com/api/health`
  - Expected: `{"status":"ok","db_connected":true,...}`
- [ ] Test login:
  ```bash
  curl -X POST https://vol-rewards-api.onrender.com/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"carol@test.com","password":"password123"}'
  ```
  - Expected: Returns JSON with JWT token

**Troubleshooting common issues:**
| Issue | Cause | Fix |
|-------|-------|-----|
| `bcrypt_lib.node: Exec format error` | Windows node_modules copied to Linux Docker | Add `.dockerignore` with `node_modules`, add `apk add python3 make g++`, add `npm rebuild bcrypt --build-from-source` to Dockerfile |
| `42P01: relation does not exist` | Web service connects to wrong database | Remove `fromDatabase` from `render.yaml`, ensure `DB_*` env vars are set correctly |
| `Failed to fetch` (browser) | CORS wildcard + credentials conflict | Set `CORS_ORIGINS=*` and ensure CORS middleware reflects origin when wildcard is used |

---

### Step 3: Vercel Frontend Portal

**Purpose:** Deploy the React admin/organiser/merchant/scanner PWA portals.

**Estimated time:** 5 minutes

#### 3a. Create Project

- [ ] Go to [vercel.com](https://vercel.com) and sign up (use GitHub login)
- [ ] Click **"Add New"** → **"Project"**
- [ ] Import `XonLoke/volunteering-rewards-app`
- [ ] Fill in:

  | Field | Value |
  |-------|-------|
  | Framework Preset | `Vite` (auto-detect) |
  | Root Directory | `frontend/web_portals` |
  | Build Command | `npm run build` |
  | Output Directory | `dist` |

- [ ] Add environment variable:

  | Key | Value |
  |-----|-------|
  | `VITE_API_URL` | `https://vol-rewards-api.onrender.com/api` |

- [ ] Click **"Deploy"**

#### 3b. Verify

- [ ] Visit `https://webportals-lovat.vercel.app/admin/login`
- [ ] Login as `carol@test.com` / `password123`
- [ ] Verify Admin Dashboard loads
- [ ] Visit `https://webportals-lovat.vercel.app/organiser` — login as `bob@test.com`
- [ ] Visit `https://webportals-lovat.vercel.app/merchant/login` — login as `cheryl@test.com`
- [ ] Visit `https://webportals-lovat.vercel.app/scan` — login as `bob@test.com`

---

### Step 4: Expo EAS Mobile App (Optional — Currently Blocked)

**Purpose:** Build an installable Android APK for the volunteer mobile app.

**Status:** ⚠️ **Blocked** — EAS Build fails due to AGP 8.11 compatibility issue (Expo SDK 54). See known issues below.

**Attempted workaround:**
The volunteer mobile app (`app/` folder) is being rebuilt as a **web PWA** using `react-native-web`. This preserves all 26 screens and the same UI while eliminating the need for native compilation.

**To try building the APK (if the bug is resolved):**
- [ ] Install EAS CLI: `npm install -g eas-cli`
- [ ] Log in: `eas login` (use Expo account credentials)
- [ ] Build: `eas build -p android --profile preview`
- [ ] Download from: `https://expo.dev/accounts/xonloke/projects/vol-app/builds`

---

## 5. File Structure Reference

### Backend (`backend/`)
```
backend/
├── Dockerfile                  # Docker build config for Render
├── package.json                # Node.js dependencies + scripts
├── .env.example                # Environment variable template (copy to .env)
├── index.js                    # Express entry point
├── src/
│   ├── config/
│   │   └── database.js         # PostgreSQL connection pool (SSL-aware)
│   ├── controllers/            # Route handlers (13 files)
│   ├── middleware/             # Auth, role, rate limiter, error handler
│   ├── routes/                 # API route definitions (14 files)
│   ├── services/               # Business logic (13 files)
│   └── utils/
│       ├── jwt.js              # JWT token generation/verification
│       ├── migrationRunner.js  # Runs SQL migrations
│       └── seed.js             # Seeds test data
├── migrations/                 # SQL migration files (001 → 023)
└── tests/                      # Unit, integration, performance tests
```

### Frontend (`frontend/web_portals/`)
```
frontend/web_portals/
├── vite.config.js              # Vite + PWA plugin config
├── vercel.json                 # Vercel SPA rewrites + build env
├── .dockerignore               # Excludes node_modules from Docker
├── src/
│   ├── App.jsx                 # React Router (admin, organiser, scan, merchant routes)
│   ├── services/
│   │   └── api.js              # JWT-authenticated API helper
│   ├── layouts/                # Admin, Organiser, Scan, Merchant layouts
│   ├── pages/
│   │   ├── admin/              # 13 admin pages
│   │   ├── organiser/          # 8 organiser pages
│   │   ├── scan/               # 4 scanner PWA pages
│   │   └── merchant/           # 3 merchant PWA pages
│   └── components/             # Shared UI components
└── public/
    ├── icon-192.png            # PWA icon
    ├── icon-512.png            # PWA icon
    └── manifest.json           # PWA manifest
```

### Mobile App (`app/`)
```
app/
├── app.json                    # Expo config (owner, package name, SDK version)
├── eas.json                    # EAS Build config
├── package.json                # Expo/React Native dependencies
├── babel.config.js             # Module alias (@/ → ./) + reanimated plugin
├── tsconfig.json               # TypeScript config
├── contexts/
│   └── ThemeContext.tsx         # Dark/light theme provider
├── assets/images/              # App icons and splash screens
└── app/                        # 26 Expo Router screen files
    ├── _layout.tsx             # Root stack navigator
    ├── login.tsx               # Volunteer login
    ├── register.tsx            # Volunteer registration
    ├── home.tsx                # Main home screen
    ├── events.tsx              # Browse events
    ├── rewards.tsx             # Browse rewards
    ├── hall-of-fame.tsx        # Leaderboard (F4)
    ├── referral.tsx            # Referral program (F3)
    ├── ai-recommendations.tsx  # AI event recommendations (F1)
    ├── scan.tsx                # QR code display
    └── ...                     # Remaining 16 screens
```

---

## 6. Key Configuration Files

| File | Purpose | Platform |
|------|---------|----------|
| `Dockerfile` | Builds the Docker image for Render | Render |
| `.dockerignore` | Prevents Windows `node_modules`, `.env`, `docs/` from entering Docker | Render |
| `render.yaml` | (Optional) Blueprint for Render deployment | Render |
| `backend/.env.example` | Template for environment variables | Local / Render |
| `backend/src/config/database.js` | PostgreSQL connection pool with SSL support | Render + Neon |
| `frontend/web_portals/vercel.json` | SPA rewrites + environment variable for build | Vercel |
| `frontend/web_portals/vite.config.js` | Vite build + PWA manifest + workbox caching | Vercel |
| `frontend/web_portals/src/services/api.js` | JWT-authenticated API helper (defaults to Render URL) | Vercel |
| `app/app.json` | Expo project config (owner, version, SDK) | Expo |
| `app/eas.json` | EAS Build profiles (APK config) | Expo |
| `app/api.ts` | Mobile API helper (points to Render URL) | Expo |

---

## 7. Environment Variables Summary

| Variable | Where Set | Required By | Example Value |
|----------|-----------|------------|---------------|
| `DB_HOST` | Render | Backend (database.js) | `ep-xxx.ap-southeast-1.aws.neon.tech` |
| `DB_PORT` | Render | Backend (database.js) | `5432` |
| `DB_NAME` | Render | Backend (database.js) | `neondb` |
| `DB_USER` | Render | Backend (database.js) | `neondb_owner` |
| `DB_PASSWORD` | Render | Backend (database.js) | (auto-generated by Neon) |
| `DB_SSL` | Render | Backend (database.js) | `true` |
| `JWT_ACCESS_SECRET` | Render | Backend (jwt.js) | 64-char hex string |
| `JWT_REFRESH_SECRET` | Render | Backend (jwt.js) | 64-char hex string |
| `PIN_SECRET` | Render | Backend (rewards.service.js) | `set in Render dashboard (rotated 5 Aug 2026 — do not commit)` |
| `NODE_ENV` | Render | Backend | `production` |
| `PORT` | Render | Backend | `3000` |
| `CORS_ORIGINS` | Render | Backend (index.js) | `*` |
| `VITE_API_URL` | Vercel | Frontend (api.js) | `https://vol-rewards-api.onrender.com/api` |

---

## 8. Dockerfile Reference

```dockerfile
FROM node:20-alpine AS builder

# Install build tools needed for bcrypt native compilation
RUN apk add --no-cache python3 make g++

WORKDIR /build

# Copy package files first (leverage Docker cache)
COPY backend/package*.json ./
RUN npm ci

# Copy source files (node_modules excluded by .dockerignore)
COPY backend/ .

# Force rebuild bcrypt for Linux Alpine (avoids Windows binary mismatch)
RUN npm rebuild bcrypt --build-from-source

# ─── Production Stage ─────────────────────────────────────
FROM node:20-alpine
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
WORKDIR /app
COPY --from=builder /build/node_modules ./node_modules
COPY --from=builder /build/ .
COPY frontend/ ./frontend/
EXPOSE 3000
USER appuser
CMD ["node", "index.js"]
```

### .dockerignore
```
node_modules
backend/node_modules
.git
.env
*.md
docs/
app/
```

---

## 9. Common Troubleshooting

| Symptom | Most Likely Cause | Fix |
|---------|------------------|-----|
| **Build succeeds but app crashes** | Environment variables not set in Render | Go to Environment tab, add all vars, redeploy |
| **bcrypt native binary error** | Windows node_modules copied to Linux Docker | Add `.dockerignore`, add build tools + rebuild to Dockerfile |
| **Login returns 42P01** | Tables don't exist in connected database | Run migration + seed in Render Shell |
| **"Failed to fetch" in browser** | CORS issue (wildcard + credentials) | Ensure CORS middleware handles wildcard origin correctly |
| **Vercel blocks deployment** | Git commit email not linked to GitHub | Set `git config user.email "your-github-email@example.com"` |
| **Vercel URL returns 404** | Root directory not set to `frontend/web_portals` | Update project settings → Root Directory |
| **APK build fails** | Expo EAS AGP 8.11 bug | Use web PWA workaround or build locally with Android Studio |
| **Sponsorship config error** | `max_depth` column doesn't exist | Remove `max_depth` from `sponsorshipConfig.service.js` query |

---

## 10. Accounts Reference

| Service | Sign-up URL | Free? | Credit Card Required? |
|---------|-------------|-------|----------------------|
| **GitHub** | github.com | ✅ Yes | ❌ No |
| **Render** | render.com | ✅ Yes | ❌ No |
| **Neon** | neon.tech | ✅ Yes | ❌ No |
| **Vercel** | vercel.com | ✅ Yes | ❌ No |
| **Expo** | expo.dev | ✅ Yes | ❌ No |

All services use GitHub OAuth for login — you can sign up with one click.

---

## 11. Deployed URLs Reference

| Service | URL | Purpose |
|---------|-----|---------|
| Backend API | `https://vol-rewards-api.onrender.com` | All API endpoints |
| API Health | `https://vol-rewards-api.onrender.com/api/health` | Health check |
| Admin Portal | `https://webportals-lovat.vercel.app/admin/login` | System admin |
| Organiser Portal | `https://webportals-lovat.vercel.app/organiser` | Event organisers |
| Merchant Portal | `https://webportals-lovat.vercel.app/merchant/login` | Cashier PIN verification |
| Scanner PWA | `https://webportals-lovat.vercel.app/scan` | QR attendance scanning |
| Neon Database | `https://console.neon.tech` | Database management |
| Expo Builds | `https://expo.dev/accounts/xonloke/projects/vol-app/builds` | APK build status |
