# Volunteering Rewards App (C3000C)

A multi-portal volunteering rewards platform where volunteers earn points by attending events and redeem them for merchant-sponsored coupon rewards with 6-digit PINs.

**Tech Stack:** Node.js / Express / PostgreSQL 16 / React (Vite) / Expo (React Native) / PWA

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
| **Admin** | `https://webportals-lovat.vercel.app/admin/login` | carol@test.com |
| **Organiser** | `https://webportals-lovat.vercel.app/organiser/login` | bob@test.com |
| **Merchant** | `https://webportals-lovat.vercel.app/merchant` | cheryl@test.com |
| **Scanner PWA** | `https://webportals-lovat.vercel.app/scan` | bob@test.com |

### Volunteer App (PWA)

| App | URL | Login |
|-----|-----|-------|
| **Volunteer PWA** | `https://dist-orpin-nine-46.vercel.app` | alice@test.com |

Installable on phone home screen via browser "Add to Home Screen" prompt.

### Backend API (Render)

| Endpoint | URL |
|----------|-----|
| **API Base** | `https://vol-rewards-api.onrender.com/api` |
| **Health Check** | `https://vol-rewards-api.onrender.com/api/health` |

---

## Architecture

```
┌─────────────────┐     HTTPS requests      ┌─────────────────┐
│   Vercel        │ ──────────────────────▶ │   Render        │
│   (Frontend)    │ ◀────────────────────── │   (Backend)     │
│   React/Vite    │     JSON responses      │   Node/Express  │
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
- **Mobile:** Expo/React Native PWA (APK build blocked by Expo SDK 54 AGP 8.11 bug)

---

## Project Structure

```
volunteering-rewards-app/
├── backend/                     # Node.js/Express API
│   ├── src/
│   │   ├── config/             # Database connection, env vars
│   │   ├── controllers/        # Route handlers (13 files)
│   │   ├── middleware/          # Auth, role, rate limiter, error handler
│   │   ├── routes/             # API route definitions (14 files)
│   │   ├── services/           # Business logic (13 files)
│   │   └── utils/              # JWT, migrations, seed
│   ├── migrations/             # SQL migrations (001-023)
│   └── tests/                  # Unit, integration, performance
├── frontend/
│   └── web_portals/            # React + Vite web app
│       └── src/
│           ├── pages/          # Admin, Organiser, Scan, Merchant
│           ├── layouts/        # Portal-specific layouts
│           └── services/       # JWT API helper
├── app/                        # Expo/React Native mobile app (26 screens)
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

# Mobile App
npx expo start                         # Start Expo dev server
npx expo export --platform web         # Build PWA for web

# Database
cd backend && node src/utils/migrationRunner.js  # Run migrations
```

---

## Notes

- **Cold starts:** Render's free tier spins down after 15 min of inactivity. First request may take 30-60s to wake up.
- **Documentation:** See the `docs/` folder for full deployment guides, test plans, and architecture reports.
