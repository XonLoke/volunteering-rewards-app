# Volunteering Rewards App (C3000C)

A multi-portal volunteering rewards platform where volunteers earn points by attending events and redeem them for merchant-sponsored coupon rewards with 6-digit PINs.

**Tech Stack:** Node.js / Express / PostgreSQL 16 / React (Vite) · React Native (Android APK + PWA)

**Test Account Hosted on:** [Neon](https://neon.tech) (PostgreSQL) · [Render](https://render.com) (Backend API) · [Vercel](https://vercel.com) (Web portals & PWA)

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

## Deployment for New Developers

When deploying your own instance, set the following environment variables so the **Forgot Password** and **Email Verification** flows link back to **your** deployed URLs — not the demo URLs.

### 1. Backend (Render)

In your Render dashboard → Environment Variables:

| Variable | Value |
|----------|-------|
| `FRONTEND_URL` | Your PWA URL, e.g. `https://my-app.vercel.app` |
| `EMAIL_USER` | SMTP username or Mailgun from address |
| `EMAIL_PASS` | SMTP password or Mailgun sending key |

The backend uses this priority:
1. **`redirect_url`** sent from the frontend (highest priority)
2. **`FRONTEND_URL`** env var fallback
3. Hardcoded `https://volunteering-rewards-app.vercel.app` (last resort — change this)

### 2. Mobile Apps (Expo)

In `frontend/mobile_app/.env` and `frontend/organiser_mobile_app/.env`:

```bash
EXPO_PUBLIC_API_URL=https://your-backend.onrender.com/api
EXPO_PUBLIC_FRONTEND_URL=https://my-app.vercel.app
```

The forgot-password screens pass `redirect_url: "${EXPO_PUBLIC_FRONTEND_URL}/reset-password"` to the backend. If the env var is not set, it falls back to the demo URL.

### 3. Web Portals (auto-detected — no config needed)

The web portals (`ForgotPassword.jsx`) use `window.location.origin` to detect their own URL at runtime. The reset link always points back to the same portal the user came from.

### 4. Email Setup (Mailgun / SMTP)

**Option A: Mailgun API (recommended)**
1. Create a free [Mailgun](https://www.mailgun.com) account
2. Go to **Domains** → copy your sandbox domain
3. In **Admin Portal** → **Email Config** → click **Mailgun** preset
4. Enter `postmaster@<your-sandbox>.mailgun.org` as Email User
5. Enter your Mailgun **sending key** as Email Pass
6. Click **Save** → **Send Test**
7. Add your email as an **Authorized Recipient** in Mailgun dashboard

**Option B: Any SMTP provider**
1. In **Admin Portal** → **Email Config** → enter your SMTP credentials
2. Supported: Gmail (App Password), SendGrid, SMTP2GO, Brevo



---

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
| **Volunteer PWA** | [volunteering-rewards-app.vercel.app](https://volunteering-rewards-app.vercel.app) | alice@test.com |

Installable on phone home screen via browser "Add to Home Screen" prompt.

### Mobile App (Native APK)

| App | Download | Login |
|-----|----------|-------|
| **Volunteer Android APK** | [Download APK v1.1.2 (82 MB)](https://github.com/XonLoke/volunteering-rewards-app/releases/download/apk-v1.1.2/Volunteering-Rewards-App_11Aug2026.apk) · [All releases](https://github.com/XonLoke/volunteering-rewards-app/releases) | alice@test.com |

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

1. **Latest release (v1.1.2, 11 Aug 2026):** [Download `Volunteering-Rewards-App_11Aug2026.apk`](https://github.com/XonLoke/volunteering-rewards-app/releases/download/apk-v1.1.2/Volunteering-Rewards-App_11Aug2026.apk) (~82 MB)
2. Or browse [all releases →](https://github.com/XonLoke/volunteering-rewards-app/releases) for earlier versions
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
2. **Locate the APK:** Open your file manager and navigate to where you saved the downloaded APK.
3. **Tap to install:** Select the file and follow the on-screen prompts.
4. **Open the app:** Find "Volunteering Rewards" in your app drawer and sign in with **alice@test.com / password123**.

> ⚠️ **Build size:** ~83 MB (includes Hermes engine and native libraries). The app targets Android API 36 (Android 16+).

## Architecture

```
┌─────────────────┐     HTTPS requests      ┌─────────────────┐
│   Vercel        │ ─────────────────────▶ │   Render        │
│   (Frontend)    │ ◀───────────────────── │   (Backend)     │
│   React/Vite    │     JSON responses      │   Node/Express  │
└─────────────────┘                         └────────┬────────┘
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
│   ├── migrations/             # SQL migrations (001-026)
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

## Additional Features (F1-F4 & Auth)

The system implements **two generations of AI** — Gen 1 (non-API rule-based algorithms) acts as the fallback when Gen 2 (LLM via [FreeLLMAPI](https://github.com/tashfeenahmed/freellmapi)) is unavailable. See [`docs/Development/AI_DEVELOPMENT_GUIDE_V2.1.md`](docs/Development/AI_DEVELOPMENT_GUIDE_V2.1.md) for full detail.

| Feature | Type | Status |
|---------|------|--------|
| F1: AI Event Recommendations | **Two-tier:** LLM via FreeLLMAPI (16+ providers, ~1.7B free tokens/mo) → SQL content-based filtering fallback | ✅ Done |
| F2: AI Feedback Summarizer | **Two-tier:** LLM via FreeLLMAPI → lexicon-based sentiment analysis fallback | ✅ Done |
| F3: Volunteer Referral Program | Multi-level referral DAG with direct + parent sponsor points | ✅ Done |
| F4: Hall of Fame Leaderboard | Gamification / SQL ranking with volunteer leaderboard | ✅ Done |
| Email Verification | Crypto-token verification sent on registration (24h expiry) | ✅ Done (AUTH-09) |
| Forgot / Reset Password | Self-service password reset via email with secure token (1h expiry) | ✅ Done (AUTH-10/11) |
| Admin Email Config | Configure SMTP / Mailgun settings from Admin Portal UI | ✅ Done |

> **AI Architecture (F1 & F2):** `GET /api/ai/recommendations` and `GET /api/ai/feedback-summary/:eventId` call **FreeLLMAPI** (`localhost:3001`) — a local proxy aggregating free tiers from Google AI Studio (Gemini 2.5 Flash), Groq, Cerebras, Mistral, and 12+ others with auto-failover between providers. Each request has a 15-second timeout. If the LLM is unreachable or all providers are exhausted, the controller falls back to the Gen 1 rule-based algorithms (content-based filtering / lexicon sentiment). Responses include an `ai_generated: true/false` flag.
> 
> **Email System:** Registration triggers a verification email with a 24-hour crypto token. Forgot password sends a reset link (1-hour expiry). The Contact Us form emails the support team. Emails are sent via Mailgun REST API (free sandbox: 5 authorized recipients) or any SMTP provider configured in the Admin Portal. The contact form recipient is configurable via `SUPPORT_EMAIL` env var (see [`docs/Development/Email Setup Guide v2.0.md`](docs/Development/Email%20Setup%20Guide%20v2.0.md#4-contact-form--support-email-recipient)).

> **"For You" AI Assistant:** The mobile app also includes a client-side decision engine (`app/ai-recommendations.tsx`) answering 4 fixed questions — "Highest match?", "Best overall?", "Most points?", "Has slots?" — using a deterministic scoring formula on recommendation data.

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

## Account Creation & Roles

Only the **Volunteer** role has a public registration page (Volunteer PWA). The Admin, Organiser, Merchant and Scanner portals deliberately have **no register page** — `POST /api/auth/register` is hardcoded to the `volunteer` role, so no one can self-register as a privileged role through the API either.

| Role | How the account is created |
|------|---------------------------|
| Volunteer | Self-registration (Volunteer PWA → Sign Up) |
| Organiser | Created by an admin (Admin Portal → Organisers → + Create Account), then approved |
| Merchant | Created by an admin (Admin Portal → Users → + Invite User, role: Merchant) |
| Admin | Created by an existing admin — or bootstrapped by script for the very first one (see below) |

### The first admin account (bootstrap)

The very first admin cannot be created from the app itself (that would be a chicken-and-egg problem, and a public admin register page would be a security hole). It is created by an ops step:

1. **Seed script (recommended for local / fresh environments):** `cd backend && node src/utils/seed.js` creates the demo accounts (including `carol@test.com` / admin) with `ON CONFLICT DO NOTHING` so it is safe to re-run.
2. **One-off script or SQL (production):** production auto-seed is **disabled by design** (`backend/index.js` — the 5 Aug security fix prevents well-known accounts from being auto-seeded on a fresh production DB). To create an admin in production, run a one-off script like `backend/fix_carol.js` / `backend/create_diana.js` (bcrypt password hash + role_id lookup) or insert the user via SQL.

### Creating more admins (in-app)

Admin Portal → **Users → "+ Invite User"** → fill in Name / Email / Password / **Role: Admin** → Create Account (`POST /api/admin/users/create-account`). This deliberate form-based flow (built 5 Jul 2026) replaced the earlier one-click role toggle, which was removed after a supervisor security review — account elevation now requires an intentional, auditable action.

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
 
