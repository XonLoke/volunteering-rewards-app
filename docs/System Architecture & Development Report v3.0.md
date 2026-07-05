# Volunteering Rewards App — System Architecture & Development Report

> **Document Version:** 3.0  
> **Date:** 2 July 2026  
> **Project:** Volunteering Rewards App (C3000C)  
> **Status:** Sprint 5 — Final Week (Deadline: 6 Jul 2026)

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [System Architecture](#2-system-architecture)
3. [Technology Stack](#3-technology-stack)
4. [Directory Structure](#4-directory-structure)
5. [Workflow Architecture](#5-workflow-architecture)
6. [Database Schema](#6-database-schema)
7. [Roles & Permissions](#7-roles--permissions)
8. [Deployment Architecture](#8-deployment-architecture)
9. [Additional Features (F1–F4)](#9-additional-features-f1f4)
10. [Development Methodology](#10-development-methodology)
11. [Member Task Allocation & Actual Work Done](#11-member-task-allocation--actual-work-done)
12. [Sprint Progress](#12-sprint-progress)
13. [Testing & Quality](#13-testing--quality)
14. [What Was Built vs Original Plan](#14-what-was-built-vs-original-plan)

---

## 1. Executive Summary

The Volunteering Rewards App is a full-stack web and mobile platform that connects volunteers with event organisers through a points-based reward system. Volunteers browse and register for community events, earn points through QR-scanned attendance, and redeem rewards via coupon PINs.

### What the System Does

| Actor | Capabilities |
|-------|-------------|
| **Volunteer** | Register, browse events, join/leave events, earn points via QR scan, redeem coupons, view leaderboard, refer friends |
| **Organiser** | Create/manage events, scan volunteer QR codes, award points, view roster, manage feedback and Q&A |
| **Admin** | Manage users and organisers, approve organisations, create coupons, verify redemptions, configure rewards, view audit logs |
| **Merchant Cashier** | Verify 6-digit coupon PINs, process redemptions, reverse within 5-minute window, view history |

### Key Achievements (as of 2 Jul 2026)

| Milestone | Date | Status |
|-----------|------|--------|
| Sprint 1 — Foundation + Auth Backend | 27 May | ✅ Complete |
| Sprint 2 — Auth Frontend + Events Backend | 17 Jun | ✅ Complete |
| Sprint 3 — Events + QR + Rewards Backend | 8 Jul (planned) | ✅ Complete (early) |
| Sprint 4 — Testing + Additional Features | 29 Jun | ✅ Complete (13 days early) |
| Sprint 5 — Native APK Build | 2 Jul | ✅ Built (83 MB) |
| Sprint 5 — All Portals Deployed | 2 Jul | ✅ 7 portals live |
| **Consolidated Tests** | 25 Jun | **✅ 188 tests, 100% pass** |

---

## 2. System Architecture

### 2.1 High-Level Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                        USERS                                      │
│   ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────────────┐  │
│   │Volunteer │  │Organiser │  │  Admin   │  │Merchant Cashier│  │
│   │ (Mobile) │  │ (Mobile) │  │  (Web)   │  │    (PWA)       │  │
│   └─────┬────┘  └────┬─────┘  └────┬─────┘  └───────┬────────┘  │
│         │             │             │                │            │
│         └─────────────┴─────────────┴────────────────┘            │
│                              │ HTTPS                              │
└──────────────────────────────┼────────────────────────────────────┘
                               │
┌──────────────────────────────▼────────────────────────────────────┐
│                    VERCEL (Frontend CDN)                          │
│                                                                   │
│   ┌─────────────────────────────────────────────────────────┐    │
│   │              Web Portals (React + Vite)                  │    │
│   │  ┌─────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐   │    │
│   │  │  Admin  │ │ Organiser│ │ Merchant │ │ Scanner  │   │    │
│   │  │ Portal  │ │  Portal  │ │  Portal  │ │   PWA    │   │    │
│   │  └─────────┘ └──────────┘ └──────────┘ └──────────┘   │    │
│   └─────────────────────────────────────────────────────────┘    │
│                                                                   │
│   ┌─────────────────────────────────────────────────────────┐    │
│   │         Volunteer PWA (Expo/React Native → Web)          │    │
│   │  https://volunteering-rewards-app.vercel.app              │    │
│   └─────────────────────────────────────────────────────────┘    │
│                                                                   │
│   ┌─────────────────────────────────────────────────────────┐    │
│   │         Volunteer APK (Expo/React Native → Android)      │    │
│   │  Native Android build (83 MB)                            │    │
│   └─────────────────────────────────────────────────────────┘    │
└──────────────────────────────┬────────────────────────────────────┘
                               │ HTTPS/JSON
┌──────────────────────────────▼────────────────────────────────────┐
│                    RENDER (Backend API)                           │
│                                                                   │
│   ┌─────────────────────────────────────────────────────────┐    │
│   │              Express.js API Server                       │    │
│   │                                                         │    │
│   │  Middleware Stack:                                       │    │
│   │  helmet → cors → rateLimiter → authenticate → authorize │    │
│   │                                                         │    │
│   │  Route Groups:                                          │    │
│   │  /api/auth        /api/events      /api/attendance      │    │
│   │  /api/me          /api/rewards     /api/coupons         │    │
│   │  /api/merchant    /api/organiser   /api/admin           │    │
│   │  /api/favorites   /api/leaderboard /api/feedback        │    │
│   │  /api/settings    /api/contact     /api/referral        │    │
│   └─────────────────────────────────────────────────────────┘    │
└──────────────────────────────┬────────────────────────────────────┘
                               │ PostgreSQL (SSL)
┌──────────────────────────────▼────────────────────────────────────┐
│                     NEON (Serverless PostgreSQL)                   │
│                                                                   │
│   12 Core Tables + 8 Feature Tables = 20 Tables                  │
│                                                                   │
│   roles, users, organizations, events, event_registrations,      │
│   attendance_logs, event_feedback, event_qna, favorites,          │
│   merchants, merchant_products, merchant_prospects,               │
│   coupons, user_coupons, redemption_logs, points_ledger,          │
│   user_settings, referral_logs, sponsorship_configuration,        │
│   rewards_configuration                                           │
└───────────────────────────────────────────────────────────────────┘
```

### 2.2 Key Design Principle

Simple, layered Express architecture. No module registry, no event bus/pub-sub. Each workflow is a self-contained Express router with its own controller, service, and middleware. Routes → middleware → controllers → services → database.

### 2.3 Request-Response Flow

```
[Mobile/Web App]
    ↓  fetch() or api.get('/events')
[Express Router]  →  routes/*.routes.js
    ↓  (authenticate, authorize)
[Controller]  →  controllers/*.controller.js
    ↓  (parses request, calls service)
[Service / DB]  →  services/*.service.js  or  pg.query()
    ↓
[JSON Response]  →  res.json({ data: [...] })
```

---

## 3. Technology Stack

| Layer | Technology | Version / Config |
|-------|-----------|-----------------|
| **Backend** | Node.js + Express.js | Node 20, Express 4 |
| **Database** | PostgreSQL 16 | Neon serverless (SSL) |
| **Mobile App** | Expo + React Native | Expo SDK 52, Expo Router |
| **Web Portals** | React + Vite | React 18, Vite 5 |
| **Auth** | JWT (access + refresh) | 15-min access, 7-day refresh with rotation |
| **Password Hashing** | bcrypt | 12 salt rounds |
| **QR Scanning** | `html5-qrcode` (web), `expo-camera` (mobile) | — |
| **Deployment** | Vercel (frontend), Render (backend), Neon (DB) | All free tier |
| **APK Build** | Android SDK (local) | 83 MB release APK |

### Not in Phase 1 Scope (Original Plan)

| Item | Status |
|------|--------|
| ❌ Module registry | Replaced by simple Express route mounting |
| ❌ Event bus / pub-sub | Replaced by direct service calls |
| ❌ S3 storage | File URLs only, backend-agnostic |
| ❌ Push notifications (FCM/APNs) | Phase 2 |
| ❌ SendGrid email service | Phase 2 |
| ❌ Redis | Not needed for current scale |
| ❌ Docker (production) | Manual deploy via Git |

---

## 4. Directory Structure

### 4.1 As Planned (Original v2.0)

```
volunteering-rewards-app/
├── backend/           # Express.js API
│   ├── src/
│   │   ├── index.js           # Entry point
│   │   ├── config/            # database.js
│   │   ├── middleware/        # auth, roleGuard, rateLimiter, errorHandler
│   │   ├── routes/            # 13 route files
│   │   ├── controllers/
│   │   ├── services/
│   │   └── utils/
│   ├── migrations/            # SQL migration files
│   └── package.json
├── mobile/            # Expo React Native app
│   ├── app/                   # File-based routing
│   │   ├── (auth)/            # Login, Register
│   │   ├── (tabs)/            # Home, Events, Rewards, Profile
│   │   └── ...
│   └── components/
├── web/               # React (Vite) web app
│   ├── src/
│   │   ├── pages/admin/       # Admin portal
│   │   └── pages/organiser/   # Organiser portal
│   └── package.json
└── README.md
```

### 4.2 As Actually Built

```
volunteering-rewards-app/
├── backend/                     # Express.js API server
│   ├── index.js                 # Entry point — mounts 14 route groups
│   ├── src/
│   │   ├── config/database.js   # PostgreSQL connection pool
│   │   ├── middleware/          # auth, role, rateLimiter, errorHandler
│   │   ├── routes/              # 16 route files
│   │   │   ├── auth.routes.js         # Xon
│   │   │   ├── events.routes.js       # Vivian
│   │   │   ├── attendance.routes.js   # Vivian
│   │   │   ├── feedback.routes.js     # Vivian
│   │   │   ├── favorites.routes.js    # Vivian
│   │   │   ├── rewards.routes.js      # Grace
│   │   │   ├── merchant.routes.js     # Grace
│   │   │   ├── admin.routes.js        # Nurain
│   │   │   ├── organiser.routes.js    # Nurain
│   │   │   ├── me.routes.js           # Nurain
│   │   │   ├── referral.routes.js     # Nurain
│   │   │   ├── leaderboard.routes.js  # Nurain
│   │   │   ├── settings.routes.js     # Vivian
│   │   │   ├── contact.routes.js      # Vivian
│   │   │   └── ...
│   │   ├── controllers/         # 14 controller files
│   │   ├── services/            # 14 service files
│   │   └── utils/               # JWT, migrationRunner, seed
│   ├── migrations/              # 23 SQL migration files (001–023)
│   ├── create_diana.js          # Utility scripts
│   ├── fix_carol.js
│   └── fix_diana_role.js
├── frontend/
│   ├── mobile_app/              # Expo/React Native app (APK + PWA)
│   │   ├── app/                 # File-based routing (Expo Router)
│   │   │   ├── (auth)/          # Login, Register
│   │   │   ├── (tabs)/          # Home, Events, Rewards, Profile
│   │   │   ├── organiser/       # Scanner, Controller
│   │   │   └── ...
│   │   ├── src/                 # Components, services, theme
│   │   ├── android/             # Android native project
│   │   ├── vercel.json          # Vercel deployment config
│   │   └── package.json
│   └── web_portals/             # React + Vite (4 portals)
│       └── src/
│           ├── App.jsx          # Router for all 4 portals
│           ├── pages/
│           │   ├── admin/       # 10 pages
│           │   ├── organiser/   # 8 pages
│           │   ├── merchant/    # 3 pages
│           │   └── scan/        # 4 pages
│           ├── layouts/         # Admin, Organiser, Merchant, Scan layouts
│           ├── components/      # Sidebar, Topbar, DataTable, Modal, Toast
│           └── services/api.js  # API client
├── app/                         # Root-level Expo screens (shared)
│   ├── ai-recommendations.tsx
│   ├── events.tsx, home.tsx, ...
│   └── organiser/scanner.tsx
├── contexts/                    # React contexts (ThemeContext)
├── docs/                        # 50+ project documents
├── .github/workflows/           # CI/CD pipeline
├── Dockerfile                   # Multi-stage build
└── docker-compose.yml           # App + PostgreSQL 16
```

### Key Structural Changes from Original Plan

| Change | Original Plan | Actual |
|--------|--------------|--------|
| **Monorepo structure** | `mobile/` + `web/` | `frontend/mobile_app/` + `frontend/web_portals/` |
| **Web portals** | Separate admin + organiser | Single Vite app with 4 portal routes (admin, organiser, merchant, scan) |
| **Merchant portal** | ❌ Not in Phase 1 | ✅ Built as PWA with PIN verify, redeem, reverse, history |
| **Scanner PWA** | Not separately listed | ✅ Dedicated scanner with QR camera + manual entry |
| **Expo PWA** | Mobile only | ✅ Also deployed as PWA via `npx expo export --platform web` |
| **Root app/ directory** | Not in plan | ✅ Shared Expo Router screens at root level |
| **Migration files** | 12 planned | 23 migrations executed |
| **CI/CD** | Manual deploy via Git | ✅ GitHub Actions CI + auto-deploy via Vercel |

---

## 5. Workflow Architecture

### Workflow A: Auth & User Management — Xon (Owner)

**Backend routes:**

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Register volunteer | None |
| POST | `/api/auth/register/organiser` | Register organiser + org | None |
| POST | `/api/auth/login` | Login → JWT | None |
| POST | `/api/auth/refresh` | Rotate refresh token | Refresh token |
| GET | `/api/auth/me` | Get profile | JWT |
| PUT | `/api/auth/me` | Update profile | JWT |
| GET | `/api/auth/profile` | Get profile (legacy) | JWT |

**Key design points:**
- JWT payload: `{ id: userId, role: 'volunteer'|'organiser'|'admin'|'merchant', iat, exp }`
- Access token: 15-minute expiry. Refresh token: 7-day expiry with rotation.
- Token storage: mobile → `expo-secure-store` / `AsyncStorage`, web → `localStorage`
- Password hashing: bcrypt with 12 salt rounds
- Rate limiting: authStrict (10 req/15min) on login route

---

### Workflow B: Events & QR Scanning — Vivian (Owner)

**Backend routes:**

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/events` | Browse events (search, filter, paginate) | Volunteer |
| GET | `/api/events/categories` | List event categories | Volunteer |
| GET | `/api/events/today` | Today's events (organiser scanner) | Organiser |
| GET | `/api/events/:id` | Event detail | Volunteer |
| POST | `/api/events/:id/register` | Join event | Volunteer |
| DELETE | `/api/events/:id/register` | Leave event | Volunteer |
| POST | `/api/events/:id/feedback` | Submit feedback | Volunteer |
| GET | `/api/events/:id/qna` | View Q&A | Volunteer |
| POST | `/api/events/:id/qna` | Ask question | Volunteer |
| GET | `/api/events/:id/roster` | Volunteer roster | Organiser |
| GET | `/api/events/:id/stats` | Check-in stats | Organiser |
| GET | `/api/events/recommended` | AI recommendations | Volunteer |
| GET | `/api/events/popular` | Popular events | Volunteer |
| POST | `/api/attendance/scan` | Scan volunteer QR | Organiser |
| POST | `/api/attendance/batch` | Batch sync scans | Organiser |
| POST | `/api/favorites` | Toggle favorite | Volunteer |

**QR Scanning Flow:**
1. Volunteer displays QR code (UUID-based, stored in `users.volunteer_qr_code`)
2. Organiser opens scanner → scans volunteer's QR code
3. `POST /api/attendance/scan` records check-in and awards points
4. Points added to `users.points`, attendance recorded in `attendance_logs`
5. Offline scans stored in `localStorage`, synced via batch endpoint

---

### Workflow C: Rewards & Redemption — Grace (Owner)

**Backend routes:**

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/rewards` | Browse rewards catalog | Volunteer |
| GET | `/api/rewards/:id` | Reward detail | Volunteer |
| POST | `/api/rewards/:id/redeem` | Redeem points → PIN | Volunteer |
| POST | `/api/coupons/verify` | Verify PIN | Merchant/Admin |
| POST | `/api/coupons/redeem` | Process redemption | Merchant/Admin |
| POST | `/api/coupons/reverse` | Reverse (5-min window) | Merchant/Admin |
| GET | `/api/merchant/history` | Redemption history | Merchant |

**Redemption Flow:**
1. Volunteer browses available coupons (filtered: active, not expired, quantity > 0)
2. Volunteer redeems → server checks `users.points >= coupons.points_required`
3. Server deducts points, decrements quantity, generates 6-digit PIN
4. PIN returned to volunteer via app
5. Volunteer presents PIN to merchant cashier
6. Cashier verifies PIN → processes redemption
7. 5-minute undo window available

---

### Workflow D: Admin & Organiser Management — Nurain (Owner)

**Backend routes:**

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/admin/dashboard` | Dashboard stats | Admin |
| GET | `/api/admin/users` | List users | Admin |
| GET | `/api/admin/users/:id` | User detail | Admin |
| PUT | `/api/admin/users/:id` | Update user | Admin |
| DELETE | `/api/admin/users/:id` | Deactivate user | Admin |
| GET | `/api/admin/organisers` | List organisers | Admin |
| PUT | `/api/admin/organisers/:id/approve` | Approve/reject | Admin |
| GET | `/api/admin/events` | All events | Admin |
| GET/POST/PUT/DELETE | `/api/admin/coupons` | Coupon CRUD | Admin |
| GET | `/api/admin/redemptions` | Redemption log | Admin |
| GET | `/api/organiser/dashboard` | Dashboard stats | Organiser |
| GET/POST | `/api/organiser/events` | My events CRUD | Organiser |
| GET/PUT/DELETE | `/api/organiser/events/:id` | Event CRUD | Organiser |
| GET | `/api/organiser/events/:id/roster` | Event roster | Organiser |
| GET | `/api/organiser/events/:id/feedback` | View feedback | Organiser |
| GET | `/api/organiser/events/:id/qna` | View Q&A | Organiser |
| POST | `/api/organiser/events/:id/qna/:qid/answer` | Answer question | Organiser |
| GET | `/api/me/events` | My events | Volunteer |
| GET | `/api/me/points` | Points balance | Volunteer |
| GET | `/api/me/coupons` | My coupons | Volunteer |

---

## 6. Database Schema

### 6.1 Core Tables (Original Plan — 12 tables)

| # | Table | Purpose |
|---|-------|---------|
| 001 | `roles` | Role definitions (volunteer, organiser, admin, merchant) |
| 002 | `users` | User accounts with points balance and QR code |
| 003 | `organizations` | Organisation registration and approval |
| 004 | `events` | Volunteering events |
| 005 | `event_registrations` | Volunteer event registrations |
| 006 | `attendance_logs` | QR scan attendance records |
| 007 | `event_feedback` | Volunteer feedback with ratings |
| 008 | `event_qna` | Questions and answers |
| 009 | `favorites` | User favorites |
| 010 | `coupons` | Reward coupons |
| 011 | `user_coupons` | Redeemed coupons with PINs |
| 012 | `redemption_logs` | Redemption audit trail |

### 6.2 Additional Tables (Built Beyond Original Plan)

| # | Table | Purpose | Feature |
|---|-------|---------|---------|
| 013 | `merchants` | Merchant/cashier accounts | Merchant Portal |
| 014 | `merchant_products` | Merchant product listings | Merchant Portal |
| 015 | `merchant_prospects` | Prospective merchants | Merchant Portal |
| 016 | `rewards_configuration` | Points-to-value configuration | Rewards Config |
| 017 | `points_ledger` | Points transaction history | Points Tracking |
| 018 | `referral_logs` | Referral tracking | F3: Referral Program |
| 019 | `sponsorship_configuration` | Sponsorship tiers | F3: Referral Program |
| 020 | `user_settings` | User preferences | Settings |

**Total: 20 tables (12 core + 8 additional)**

### 6.3 Points Model

```
users.points (INTEGER, DEFAULT 0, CHECK >= 0)
```

**Earning points:**
- Each event has a `points_value` field
- When organiser scans attendance with `scan_type = 'check_in'`, points are awarded
- Points added to `users.points`, recorded in `attendance_logs.points_awarded`

**Spending points:**
- On redemption: `UPDATE users SET points = points - cost WHERE id = ?`
- Deduction recorded in `redemption_logs`

**Audit trail:**
- Points earned → `attendance_logs` + `points_ledger`
- Points spent → `redemption_logs` + `points_ledger`

---

## 7. Roles & Permissions

| Role | Backend Guard | Portals | Description |
|------|--------------|---------|-------------|
| **volunteer** | `authorize("volunteer")` | Volunteer PWA / APK | Browses events, earns points, redeems rewards |
| **organiser** | `authorize("organiser")` | Organiser Portal, Scanner PWA | Creates events, scans QR codes, manages attendance |
| **admin** | `authorize("admin")` | Admin Portal | Manages users, creates coupons, verifies PINs, audits |
| **merchant** | `authorize("merchant")` | Merchant Portal | Verifies PINs, redeems coupons |

### Portal Access Matrix

| Persona | Admin Portal | Organiser Portal | Merchant Portal | Scanner PWA | Volunteer PWA | Volunteer APK |
|---------|:-----------:|:---------------:|:--------------:|:----------:|:------------:|:------------:|
| Admin | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Organiser | ❌ | ✅ | ❌ | ✅ | ❌ | ❌ |
| Merchant | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ |
| Volunteer | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |

---

## 8. Deployment Architecture

### 8.1 Infrastructure

| Service | Component | Plan | Cost |
|---------|-----------|------|------|
| **Vercel** | Frontend Web Portals + PWAs (global CDN) | Free Hobby | $0/mo |
| **Render** | Backend API (Node.js/Express) | Free Hobby | $0/mo |
| **Neon** | PostgreSQL 16 Database (serverless) | Free Tier | $0/mo |
| **Total** | | | **$0.00/mo** |

### 8.2 Deployed Portals

| Portal | URL | Status |
|--------|-----|--------|
| **Backend API** | `https://vol-rewards-api.onrender.com/api/health` | ✅ Live |
| **Admin Portal** | `https://webportals-lovat.vercel.app/admin/login` | ✅ Live |
| **Organiser Portal** | `https://webportals-lovat.vercel.app/organiser/login` | ✅ Live |
| **Merchant Portal** | `https://webportals-lovat.vercel.app/merchant` | ✅ Live |
| **Scanner PWA** | `https://webportals-lovat.vercel.app/scan` | ✅ Live |
| **Volunteer PWA** | `https://volunteering-rewards-app.vercel.app` | ✅ Live |
| **Volunteer APK** | `frontend/mobile_app/android/app/build/outputs/apk/release/app-release.apk` | ✅ Built (83 MB) |

### 8.3 Architecture Diagram

```
┌─────────────────┐     HTTPS/JSON      ┌─────────────────┐
│   Vercel        │ ◄────────────────── │   Render        │
│   (Frontend)    │ ──────────────────► │   (Backend)     │
│   7 portals     │     requests        │   Node/Express  │
└─────────────────┘                     └────────┬────────┘
                                                 │
                                          PostgreSQL (SSL)
                                                 │
                                          ┌──────▼──────┐
                                          │   Neon      │
                                          │  PostgreSQL │
                                          └─────────────┘
```

### 8.4 Cold Start Notice

Render's free tier backend spins down after **15 minutes of inactivity**. The first request after idle takes approximately **30–60 seconds** to wake up (cold start). After that, it runs normally.

---

## 9. Additional Features (F1–F4)

Beyond the core three-workflow architecture, four additional features were built:

### F1: AI Event Recommendations (Vivian)

**Location:** `backend/src/services/events.service.js`, `app/ai-recommendations.tsx`

Content-based filtering engine that recommends upcoming events based on each volunteer's past attendance category preferences. Falls back to popular events for new volunteers. Includes an interactive "Ask about your picks" assistant with four contextual questions.

See `docs/AI_DEVELOPMENT_GUIDE.md` for full documentation.

### F2: Feedback AI Summary (Vivian)

**Location:** `backend/src/services/feedback.service.js`, `backend/src/routes/feedback.routes.js`

Summarises volunteer feedback for organisers, providing aggregate ratings and sentiment overview per event.

### F3: Referral & Sponsorship Program (Nurain)

**Location:** `backend/src/services/referral.service.js`, `backend/src/services/sponsorshipConfig.service.js`

Two-tier referral system:
- **Direct sponsor** (upline_1): the person who directly referred the volunteer
- **Parent sponsor** (upline_2): the sponsor's sponsor
- Sponsorship configuration with configurable points and tiers

### F4: Hall of Fame Leaderboard (Nurain)

**Location:** `backend/src/services/leaderboard.service.js`, `backend/src/routes/leaderboard.routes.js`

Leaderboard ranking volunteers by total points earned, with hall-of-fame style display on the mobile app.

---

## 10. Development Methodology

### 10.1 Evolution from Original Plan

The project evolved through three distinct methodology phases:

**Phase 1: Three-Workflow Architecture with Vibe Coding (Original Plan — May 2026)**

The original architecture document specified:
- Three workflows: Auth, Events, Rewards
- Vibe coding approach: AI generates code → team tests → iterate
- No merchants/cashiers (Phase 1)
- 12 core database tables

**Phase 2: Vertical Slices (Sprint 2 — Late May 2026)**

Following supervisor feedback, the team restructured to **vertical slices**:

```
Each person owns a complete feature from database to frontend:

  Xon:     Auth + Shared Infrastructure + CI/CD + Docker
  Vivian:  Events + QR Attendance + Favorites + AI Recommendations
  Grace:   Rewards + Merchant + Coupons + Redemptions
  Nurain:  Admin + Organiser + Leaderboard + Referral
```

Integration rules:
1. **Your service, your tables** — query only assigned tables
2. **Route files don't overlap** — no two people edit the same route file
3. **API contracts are frozen** — response shapes in `API_CONTRACTS_v2.md`
4. **PR gates** — domain peer review + integration check + smoke test
5. **Weekly sync** — merge working code to `main` every Friday

**Phase 3: AI-Assisted Generation with Coordinator Model (Sprint 3–5)**

By Sprint 3, the team adopted a **coordinator model** where Xon acted as project coordinator using AI tools to generate code while team members focused on testing and quality assurance. Structured AI prompts were used following documented patterns in `AI_GENERATION_PROMPTS_v2.md`.

### 10.2 AI Prompt Methodology

Each coding prompt followed this structure:

```
┌──────────────────────────────────────────────────────────┐
│  1. CONTEXT — Project, stack, existing code patterns      │
│  2. WHAT EXISTS — Infrastructure already in place         │
│  3. EXACT PATTERNS — Router(), controller(), service()    │
│  4. THE TASK — Specific function to build                 │
│  5. CONSTRAINT — Must match API_CONTRACTS.md exactly      │
└──────────────────────────────────────────────────────────┘
```

### 10.3 Development Process

For each feature:

```
System Analysis Docs
  → Workflow Analysis
    → Vertical Slice Assignment
      → AI-Generated Code from Structured Prompts
        → Team Testing on Real Devices
          → Bug Reporting and Iteration
            → Merge and Deploy
```

---

## 11. Member Task Allocation & Actual Work Done

### 11.1 Original Task Allocation (v2.0 — May 2026)

| Member | Role | Tasks |
|--------|------|-------|
| **Xon** | Infrastructure + Code Generation Coordinator | INF-01 to INF-07, AUTH-01 to AUTH-10, AUTH-M01 to M04, WEB-01 to WEB-07 |
| **Nurain** | Workflow A: Auth & User Management | AUTH backend testing, mobile auth screens, org registration |
| **Vivian** | Workflow B: Events & QR Scanning | EVT-01 to EVT-10, EVT-M01 to M06, QR scanner testing |
| **Grace** | Workflow C: Rewards + Frontend | REW-01 to REW-08, REW-M01 to M04, MOB-01 to MOB-08, WEB admin pages |
| **Everyone** | Shared Responsibilities | GAP-01 to GAP-04, cross-testing, bug reporting, presentation |

### 11.2 Actual Work Completed (as of 2 Jul 2026)

| Member | What Was Actually Built/Tested |
|--------|-------------------------------|
| **Xon** | Express backend scaffold, all middleware, JWT auth, database migrations (23), seed data, auth service with full validation, Docker + CI/CD, admin web portal pages (login, dashboard, users, organisers), vertical slice coordination, AI prompt engineering, PWA-APK unification, APK build, merchant layout fix |
| **Vivian** | Events routes + controller + service (browse, detail, categories, today, recommended, popular), attendance routes + controller + service (scan, batch, volunteer latest), QR scanner screens (web PWA + mobile), event screens (browse, detail, my events, home), organiser web pages (roster, feedback, scanning), favorites, feedback routes, settings + contact routes, AI recommendations engine + "For You" screen |
| **Grace** | Rewards routes + controller + service (browse, detail, redeem), merchant routes + controller + service (verify, redeem, reverse, history), mobile screens (rewards catalog, reward detail, redeem confirmation, my coupons, PIN display), merchant web portal (login, PIN verify, history), admin coupons + redemptions web pages |
| **Nurain** | Admin routes + controller + service (dashboard, users CRUD, organiser approval, events, coupons, redemptions, rewards config), organiser routes + controller + service (dashboard, events CRUD, roster, feedback, Q&A), me routes + controller (my events, my QR, my points, my coupons), referral + sponsorship service, leaderboard service, organiser web portal pages (dashboard, events, event-edit, Q&A), admin web pages (events, rewards config) |

### 11.3 What Was Added Beyond Original Plan

| Addition | Reason | Status |
|----------|--------|--------|
| **Merchant Portal** | Requirement added during development | ✅ Built (3 pages) |
| **Scanner PWA** | Dedicated web-based QR scanner | ✅ Built (4 pages) |
| **Volunteer PWA** | Expo web export for non-Android users | ✅ Deployed on Vercel |
| **Native APK** | Android native build (83 MB) | ✅ Built |
| **AI Recommendations (F1)** | Additional feature | ✅ Built |
| **Feedback AI Summary (F2)** | Additional feature | ✅ Built |
| **Referral Program (F3)** | Additional feature | ✅ Built |
| **Hall of Fame Leaderboard (F4)** | Additional feature | ✅ Built |
| **23 database migrations** | Schema evolution across sprints | ✅ 23 files |
| **8 additional tables** | Merchant, rewards config, points ledger, referral, settings, etc. | ✅ Created |
| **Real camera QR scanner (mobile)** | expo-camera implementation | ✅ Built |

### 11.4 Task Count Summary

| Category | Count |
|----------|-------|
| Core Backend Tasks | 45+ |
| Mobile Screens | 25+ |
| Web Portal Pages | 25+ |
| Database Migrations | 23 |
| Docker + CI/CD Configs | 3 |
| Project Documents | 50+ |
| **Total Deliverables** | **170+** |

---

## 12. Sprint Progress

### Sprint 1 (7–27 May) — Foundation + Auth Backend ✅

| Deliverable | Status |
|------------|--------|
| Express server with middleware stack (CORS, helmet, rate limiter, error handler) | ✅ Complete |
| PostgreSQL database with 12 migration files | ✅ Complete |
| Auth API (register, login, refresh, profile) | ✅ Complete |
| JWT utilities (access + refresh tokens with rotation) | ✅ Complete |
| Role-based access control middleware | ✅ Complete |
| Seed data (3 roles, 3 users, 1 org, 3 events, 3 coupons) | ✅ Complete |
| Docker multi-stage build + docker-compose | ✅ Complete |

### Sprint 2 (28 May–17 Jun) — Auth Frontend + Events Backend ✅

| Deliverable | Status |
|------------|--------|
| Auth hardening (validation, rate limiting) | ✅ Complete |
| Admin login + dashboard pages | ✅ Complete |
| Events API (browse, detail, categories) | ✅ Complete |
| Event registration (join/leave) | ✅ Complete |
| Mobile auth screens (login, register, profile) | ✅ Complete |
| Admin users + organisers pages | ✅ Complete |
| Vertical slice restructure | ✅ Complete |

### Sprint 3 (18 Jun–8 Jul) — Events + QR + Rewards Backend ✅ (Early)

| Deliverable | Status |
|------------|--------|
| QR attendance scan + batch sync | ✅ Complete |
| Feedback + Q&A | ✅ Complete |
| Favorites toggle | ✅ Complete |
| Rewards catalog + redemption + PIN generation | ✅ Complete |
| Merchant backend (verify, redeem, reverse, history) | ✅ Complete |
| Organiser web portal (dashboard, events, roster, feedback, Q&A) | ✅ Complete |
| **Completion:** 13 days ahead of deadline | ✅ Early |

### Sprint 4 (15 Jun–29 Jun) — Testing + Additional Features ✅ (Early)

| Deliverable | Status |
|------------|--------|
| AI Event Recommendations (F1) | ✅ Complete |
| Feedback AI Summary (F2) | ✅ Complete |
| Referral Program (F3) | ✅ Complete |
| Hall of Fame Leaderboard (F4) | ✅ Complete |
| Consolidated testing (188 tests, 100% pass) | ✅ Complete |
| Admin web portal (events, rewards config) | ✅ Complete |
| **Completion:** 13 days ahead of deadline | ✅ Early |

### Sprint 5 (29 Jun–6 Jul) — Deployment & Delivery 🟢 On Track

| Deliverable | Status | Date |
|------------|--------|------|
| Native APK build | ✅ Complete | 30 Jun |
| PWA-APK unification (KAN-157) | ✅ Complete | 30 Jun |
| QR scanner fixes | ✅ Complete | 2 Jul |
| Merchant redemption bugs fixed | ✅ Complete | 2 Jul |
| "Event has ended" indicator | ✅ Complete | 2 Jul |
| "No events" graceful error handling | ✅ Complete | 2 Jul |
| Merchant layout responsiveness | ✅ Complete | 2 Jul |
| User Acceptance Testing (8 scenarios) | ⬜ Pending | 3–4 Jul |
| Dry-run presentation | ⬜ Pending | 4 Jul |
| Project report / slides / user manual | ⬜ Pending | 5–6 Jul |

**Overall completion rate:** 80.5% (33/41 Sprint 5 tasks)

---

## 13. Testing & Quality

### 13.1 Consolidated Test Results (25 Jun 2026)

| Test Suite | Tests | Pass Rate |
|------------|-------|-----------|
| Unit Tests | 91 | ✅ 100% |
| Integration Tests | 45 | ✅ 100% |
| Regression Tests | 5 | ✅ 100% |
| System/E2E Tests | 17 checks | ✅ 100% |
| Security Tests | 9 | ✅ 100% |
| Performance Tests | 17 | ✅ 100% |
| **Total** | **188** | **✅ 100%** |

### 13.2 Testing by Workflow

| Workflow | Key Test Cases |
|----------|---------------|
| **Auth** | Register, login, duplicate email, missing fields, wrong password, deactivated account, token refresh, role guard, rate limiting |
| **Events** | Create event, browse/search, join/leave, capacity limits, duplicate registration, cancel registration |
| **Attendance** | QR scan check-in, duplicate scan prevention, points award, batch sync, offline fallback |
| **Rewards** | Browse coupons, redeem with sufficient/insufficient points, expired coupon, last item, concurrent redemption, PIN generation |
| **Merchant** | PIN verify (correct/wrong/expired/used), redeem, 5-min reverse, audit log |

### 13.3 Security Tests

| Test | Result |
|------|--------|
| JWT token expiry handling | ✅ Pass |
| SQL injection prevention (parameterised queries) | ✅ Pass |
| XSS prevention (no raw HTML rendering) | ✅ Pass |
| Rate limiting on auth routes | ✅ Pass |
| Role-based access control (all roles) | ✅ Pass |
| Refresh token rotation | ✅ Pass |
| bcrypt password hashing (12 rounds) | ✅ Pass |
| CORS origin restriction | ✅ Pass |
| Helmet security headers | ✅ Pass |

---

## 14. What Was Built vs Original Plan

### 14.1 Key Differences

| Aspect | Original Plan (v2.0) | What Was Actually Built |
|--------|---------------------|------------------------|
| **Merchant/Cashier** | ❌ Removed from Phase 1 | ✅ Full merchant portal with PIN verify, redeem, reverse, history |
| **Web Portals** | Separate admin + organiser | ✅ Single Vite app with 4 portals (admin, organiser, merchant, scan) |
| **Mobile App** | Expo Go only | ✅ Expo PWA + Native APK (83 MB) |
| **Database** | 12 tables | ✅ 20 tables (8 additional) |
| **Migrations** | 12 migration files | ✅ 23 migration files |
| **Auth** | 4 roles (volunteer, organiser, admin) | ✅ 4 roles (volunteer, organiser, admin, merchant) |
| **Referral** | ❌ Phase 2 | ✅ Built (F3) |
| **Leaderboard** | ❌ Phase 2 | ✅ Built (F4) |
| **AI Recommendations** | ❌ Not planned | ✅ Built (F1) |
| **Feedback AI Summary** | ❌ Not planned | ✅ Built (F2) |
| **CI/CD** | Manual deploy | ✅ GitHub Actions + Vercel auto-deploy |
| **Docker** | Production only | ✅ Multi-stage build with healthcheck |
| **Development Model** | Vibe coding with 4 owners | ✅ Vertical slices → AI-assisted coordinator model |
| **Deployment Cost** | $0/month | ✅ $0/month (all free tier) |

### 14.2 What the Original Plan Got Right

- Three-workflow architecture (Auth, Events, Rewards) as the core
- JWT with refresh token rotation
- bcrypt with 12 salt rounds
- PostgreSQL with migration files
- Role-based access control
- Points as a simple column on users table

### 14.3 What Evolved During Development

- Vertical slice architecture improved team ownership and demoability
- Web portals consolidated into one Vite app (reduced duplication)
- Merchant portal added after stakeholder feedback
- PWA alongside APK for broader device coverage
- AI-assisted generation accelerated development
- Additional features (F1–F4) added to enrich the platform
- Expo → Vercel PWA deployment enabled browser-based access

---

> **Document Version 3.0 — 2 July 2026**  
> Compiled from: A_REVISED_SYSTEM_ARCHITECTURE_V2.docx, B_Member_Task_Allocation_v2.docx, Sprint Reports, Codebase Analysis, and Project Documents  
> **Next Milestone:** Dry-run presentation (4 Jul), Final Submission (6 Jul)
