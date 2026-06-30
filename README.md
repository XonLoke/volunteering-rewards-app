# Volunteering Rewards App (C3000C)

A multi-portal volunteering rewards platform where volunteers earn points by attending events and redeem them for merchant-sponsored coupon rewards with 6-digit PINs.

**Tech Stack:** Node.js / Express / PostgreSQL 16 / React (Vite) · React Native (Android APK + PWA)

**Hosted on:** [Neon](https://neon.tech) (PostgreSQL) · [Render](https://render.com) (Backend API) · [Vercel](https://vercel.com) (Web portals & PWA)

> **Note on Expo:** The React Native app is built with [Expo SDK 54](https://expo.dev). Expo is the underlying build framework that handles:
> 1. The build toolchain — `expo run:android` and `npx expo export --platform web` produce the APK and PWA respectively
> 2. Core packages — `expo-router`, `expo-splash-screen`, `expo-linear-gradient`, `expo-image-picker`, and others are used throughout `frontend/mobile_app/`
> 3. Native config — Gradle properties, Android manifest, and splash screen are all managed through Expo's plugin system (`app.json` / `expo-build-properties`)
>
> However, **the Expo Go / dev client workflow is not used** — the mobile app is delivered as a standalone APK and PWA, not run via the Expo Go sandbox.

These platforms were chosen for **zero-cost hosting** during development and testing:
- **Neon** — serverless PostgreSQL with a generous free tier (no time limit, auto-suspend on inactivity), perfect for a student project database.
- **Render** — free-tier Docker-based Node.js hosting with auto-deploy from GitHub; the backend REST API cold-starts in ~30s after inactivity.
- **Vercel** — free global CDN hosting with seamless Git integration for static SPA and Expo PWA deployments.

---

## Quick Start (Local Development)

### Prerequisites
- Node.js v22+
- PostgreSQL 16
- Git

### Setup

```bash
# Clone the repository
git clone https://github.com/XonLoke/volunteering-rewards-app
cd volunteering-rewards-app

# Install backend dependencies
cd backend && npm install

# Create .env file (see backend/.env.example)
cp backend/.env.example backend/.env
# Edit backend/.env with your local PostgreSQL credentials

# Run migrations
node src/utils/migrationRunner.js

# Seed test data
node src/utils/seed.js

# Start backend (port 3000)
npm run dev
```

Open a second terminal:

```bash
# Install frontend dependencies
cd volunteering-rewards-app/frontend/web_portals
npm install

# Start frontend (port 5173)
npm run dev
```

---

## Deployed URLs

### Web Portals (Vercel)

| Portal | URL | Login |
|--------|-----|-------|
| **Admin** | [webportals-lovat.vercel.app/admin/login](https://webportals-lovat.vercel.app/admin/login) | carol@test.com |
| **Organiser** | [webportals-lovat.vercel.app/organiser/login](https://webportals-lovat.vercel.app/organiser/login) | bob@test.com |
| **Merchant** | [webportals-lovat.vercel.app/merchant](https://webportals-lovat.vercel.app/merchant) | cheryl@test.com |
| **Scanner PWA** | [webportals-lovat.vercel.app/scan](https://webportals-lovat.vercel.app/scan) | bob@test.com |

### Volunteer App (PWA)

| App | URL | Login |
|-----|-----|-------|
| **Volunteer PWA** | [dist-orpin-nine-46.vercel.app](https://dist-orpin-nine-46.vercel.app) | alice@test.com |

Installable on phone home screen via browser "Add to Home Screen" prompt.

### Mobile App (Native APK)

| App | Download | Login |
|-----|----------|-------|
| **Volunteer Android APK** | [GitHub Releases](https://github.com/XonLoke/volunteering-rewards-app/releases) (v1.1.0+) or CI build artifacts | alice@test.com |

A native Android APK built with Expo / React Native. See the [APK Installation](#apk-download--installation) section below.

### Backend API (Render)

| Endpoint | URL |
|----------|-----|
| **API Base** | [vol-rewards-api.onrender.com/api](https://vol-rewards-api.onrender.com/api) |
| **Health Check** | [vol-rewards-api.onrender.com/api/health](https://vol-rewards-api.onrender.com/api/health) |

---

---

## APK Download & Installation

The native Android APK provides the full volunteer experience (Home, Events, Rewards, Profile tabs) as a standalone app — no browser needed.

### Option 1: Download from GitHub Releases (Recommended)

1. Go to [GitHub Releases →](https://github.com/XonLoke/volunteering-rewards-app/releases)
2. Download the latest `app-release.apk` from the release assets
3. Transfer the APK to your Android phone (USB, email, or cloud drive)

### Option 2: Download from CI Artifacts

1. Go to [GitHub Actions →](https://github.com/XonLoke/volunteering-rewards-app/actions)
2. Select the latest successful workflow run
3. Download the APK from the **Artifacts** section

### Option 3: Build Locally

```bash
cd frontend/mobile_app
npm install

# Build release APK
cd android && ./gradlew assembleRelease

# The APK will be at:
# frontend/mobile_app/android/app/build/outputs/apk/release/app-release.apk
```

### Installation on Android

1. **Enable Unknown Sources:** Go to *Settings → Security → Install unknown apps* (or *Settings → Apps → Special app access → Install unknown apps*) and allow your file manager or browser.
2. **Locate the APK:** Open your file manager and navigate to where you saved `app-release.apk`.
3. **Tap to install:** Select the file and follow the on-screen prompts.
4. **Open the app:** Find "Volunteering Rewards" in your app drawer and sign in with **alice@test.com / password123**.

> ⚠️ **Build size:** ~83 MB (includes Hermes engine and native libraries). The app targets Android API 36 (Android 16+).

## Architecture

```
┌─────────────────┐     HTTPS requests      ┌─────────────────┐
│   Vercel        │ ─────────────────────▶ │   Render        │
│   (Frontend)    │ ◀───────────────────── │   (Backend)     │
│   React/Vite    │     JSON responses     │   Node/Express  │
└─────────────────┘                        └────────┬────────┘
                                                    │
                                                    │ PostgreSQL (SSL)
                                                    ▼
                                            ┌─────────────────┐
                                            │   Neon          │
                                            │   (Database)    │
                                            │   PostgreSQL 16 │
                                            └─────────────────┘
```

- **Backend:** Node.js/Express REST API on Render (free tier, Docker-based)
- **Database:** PostgreSQL 16 on Neon (serverless, no time limit)
- **Frontend:** React + Vite SPA with PWAs on Vercel (free tier, global CDN)
- **Mobile:** Expo/React Native — deployed as PWA + native Android APK

---

## Project Structure

```
volunteering-rewards-app/
├── backend/                     # Node.js/Express API
│   ├── src/
│   │   ├── config/             # Database connection, env vars
│   │   ├── controllers/        # Route handlers (13 files)
│   │   ├── middleware/         # Auth, role, rate limiter, error handler
│   │   ├── routes/             # API route definitions (14 files)
│   │   ├── services/           # Business logic (13 files)
│   │   └── utils/              # JWT, migrations, seed
│   ├── migrations/             # SQL migrations (001-023)
│   └── tests/                  # Unit, integration, performance
├── frontend/
│   ├── web_portals/            # React + Vite web app
│   │   └── src/
│   │       ├── pages/          # Admin, Organiser, Scan, Merchant
│   │       ├── layouts/        # Portal-specific layouts
│   │       └── services/       # JWT API helper
│   └── mobile_app/             # Expo/React Native mobile app (26 screens)
│       ├── app/                # Tab-based UI (Home, Events, Rewards, Profile)
│       └── android/            # Native Android project (APK output)
├── docs/                       # Documentation
└── Dockerfile                  # Docker build for Render
```

---

## Additional Features (F1-F4)

| Feature | Type | Status |
|---------|------|--------|
| F1: AI Event Recommendations | Content-based filtering | ✅ Done |
| F2: AI Feedback Summarizer | Lexicon-based sentiment | ✅ Done |
| F3: Volunteer Referral Program | Multi-level referral DAG | ✅ Done |
| F4: Hall of Fame Leaderboard | Gamification / SQL ranking | ✅ Done |

---

## Test Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | carol@test.com | password123 |
| Organiser | bob@test.com | password123 |
| Organiser 2 | johnny@test.com | password123 |
| Merchant | cheryl@test.com | password123 |
| Merchant 2 | diana@test.com | password123 |
| Merchant 3 | frank@test.com | password123 |
| Volunteer | alice@test.com | password123 |
| Volunteer 2 | eve@test.com | password123 |

---

## Key Commands

```bash
# Backend
cd backend && npm run dev              # Start API (port 3000)
cd backend && npm test                 # Run unit tests
cd backend && node src/utils/seed.js   # Re-seed database

# Frontend
cd frontend/web_portals && npm run dev # Start dev server (port 5173)

# Mobile App (frontend/mobile_app/)
cd frontend/mobile_app
npx expo start                         # Start Expo dev server
npx expo export --platform web         # Build PWA for web
npx expo run:android                   # Build & run APK on connected device
cd android && ./gradlew assembleRelease  # Build release APK (output: android/app/build/outputs/apk/release/)
echo "or"
npx eas build --platform android --profile preview  # Build APK via EAS (Expo cloud)

# Database
cd backend && node src/utils/migrationRunner.js  # Run migrations
```

---

## Notes

- **Cold starts:** Render's free tier spins down after 15 min of inactivity. First request may take 30-60s to wake up.
- **Documentation:** See the `docs/` folder for full deployment guides, test plans, and architecture reports.
