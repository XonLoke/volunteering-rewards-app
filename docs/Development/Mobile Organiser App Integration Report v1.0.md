# Mobile Organiser App — Integration Report

> **Feature:** Organiser Mobile App (Expo/React Native)  
> **Developer:** Nurain  
> **Integrator:** Xon (Project Lead)  
> **Date:** 9 July 2026  
> **Status:** ✅ Integrated — Connected to Production Backend  
> **Location:** `frontend/organiser_mobile_app/`

---

## Table of Contents

1. [Overview](#1-overview)
2. [App Structure](#2-app-structure)
3. [Screens & Features](#3-screens--features)
4. [API Integration](#4-api-integration)
5. [Changes Made During Integration](#5-changes-made-during-integration)
6. [Testing Instructions](#6-testing-instructions)

---

## 1. Overview

Nurain built a **standalone mobile organiser app** using Expo/React Native. The app was originally a separate project (`my-app-stable/`) with its own backend and local API endpoints. During integration, the following was done:

- Moved into the main project at `frontend/organiser_mobile_app/`
- Updated API connection from her local backend to the **shared production backend** (`https://vol-rewards-api.onrender.com`)
- Added **JWT authentication** to match the main backend's auth system
- Restored integration test files that were affected during the merge
- Removed the duplicate standalone backend (the app now uses the existing backend)

### Architecture

```
┌─────────────────────────────────────────────┐
│      Organiser Mobile App (Expo/RN)          │
│      frontend/organiser_mobile_app/          │
├─────────────────────────────────────────────┤
│  Login → JWT Token → Stored in memory        │
│  All API calls include Bearer token header   │
└────────────────────┬────────────────────────┘
                     │ HTTPS
                     ▼
┌─────────────────────────────────────────────┐
│  Shared Backend API                          │
│  https://vol-rewards-api.onrender.com/api    │
│  Same backend used by Admin, Merchant, PWA   │
└─────────────────────────────────────────────┘
```

---

## 2. App Structure

```
frontend/organiser_mobile_app/
├── app/
│   ├── index.tsx              # Login screen
│   ├── layout_.tsx            # App layout
│   └── (tabs)/
│       ├── _layout.tsx        # Tab navigation (Dashboard, Events, Scanner, Feedback, Profile)
│       ├── dashboard.tsx      # Organiser dashboard stats
│       ├── events.tsx         # Event list + create/edit/delete
│       ├── eventForm.tsx      # Event creation/edit form
│       ├── controller.tsx     # QR code scanner (check-in)
│       ├── feedback.tsx       # Event feedback viewer
│       └── profile.tsx        # Organiser profile
├── components/                # Reusable UI components
├── constants/theme.ts         # Theme configuration
├── hooks/                     # Custom hooks
├── lib/
│   └── api.ts                 # API client (JWT auth, fetch wrapper)
├── assets/images/             # App icons and images
├── app.json                   # Expo configuration
├── package.json               # Dependencies
└── tsconfig.json              # TypeScript config
```

---

## 3. Screens & Features

| Screen | Feature | Backend Endpoint |
|--------|---------|-----------------|
| **Login** (`index.tsx`) | Email/password authentication, stores JWT token | `POST /api/auth/login` |
| **Dashboard** (`dashboard.tsx`) | Event stats (total events, volunteers, feedback) | `GET /api/organiser/dashboard` |
| **Events** (`events.tsx`) | List, search, filter events; delete events | `GET /api/organiser/events`, `DELETE /api/organiser/events/:id` |
| **Event Form** (`eventForm.tsx`) | Create new event, edit existing event | `POST /api/organiser/events`, `PUT /api/organiser/events/:id` |
| **QR Scanner** (`controller.tsx`) | Select event, scan volunteer QR code for check-in | `POST /api/attendance/scan` |
| **Feedback** (`feedback.tsx`) | Select event, view volunteer ratings and comments | `GET /api/organiser/events/:id/feedback` |
| **Profile** (`profile.tsx`) | View organiser profile info | `GET /api/auth/me` |

---

## 4. API Integration

### Authentication

The main backend uses **JWT two-token auth** (15-min access token + 7-day refresh token). The mobile app:

1. Logs in via `POST /api/auth/login` with email + password
2. Stores the returned `token` in memory via `setAuthToken()`
3. All subsequent API calls include `Authorization: Bearer <token>` header

### API Client (`lib/api.ts`)

```typescript
// All API calls automatically include the JWT token
import { apiGet, apiPost, apiPut, apiDelete, setAuthToken } from "../lib/api";

// Login
const data = await apiPost("/api/auth/login", { email, password });
setAuthToken(data.token);

// Fetch dashboard
const dash = await apiGet("/api/organiser/dashboard");

// Create event
await apiPost("/api/organiser/events", { title, description, ... });

// QR check-in
await apiPost("/api/attendance/scan", { event_id, qr_code_value });
```

### Endpoint Mapping

| Nurain's Original | Production Backend | Status |
|-------------------|-------------------|--------|
| `POST /auth/login` | `POST /api/auth/login` | ✅ Same |
| `GET /organiser/dashboard` | `GET /api/organiser/dashboard` | ✅ Same |
| `GET /organiser/events` | `GET /api/organiser/events` | ✅ Same |
| `POST /organiser/events` | `POST /api/organiser/events` | ✅ Same |
| `PUT /organiser/events/:id` | `PUT /api/organiser/events/:id` | ✅ Same |
| `DELETE /organiser/events/:id` | `DELETE /api/organiser/events/:id` | ✅ Same |
| `GET /organiser/events/:id/roster` | `GET /api/organiser/events/:id/roster` | ✅ Same |
| `POST /organiser/events/:id/check-in` | `POST /api/attendance/scan` | ✅ Adapted |
| `GET /organiser/feedback` | `GET /api/organiser/events/:id/feedback` | ✅ Adapted |
| `GET /me/profile` | `GET /api/auth/me` | ✅ Adapted |
| `GET /me/events` | `GET /api/me/events` | ✅ Same |
| `GET /me/points` | `GET /api/me/points` | ✅ Same |
| `GET /me/coupons` | `GET /api/me/coupons` | ✅ Same |
| `GET /me/qr-code` | `GET /api/me/qr-code` | ✅ Same |

---

## 5. Changes Made During Integration

### 5.1 Critical Fixes

| Issue | Fix |
|-------|-----|
| API URL pointed to `http://192.168.10.8:3000` (local) | Changed to `https://vol-rewards-api.onrender.com` |
| No JWT auth (used `mockAuth`) | Added JWT token management — login stores token, all API calls include `Bearer` header |
| Login used hardcoded fetch | Rewritten to use `apiPost()` with proper error handling |
| Dashboard had hardcoded `API_URL` | Rewritten to use shared `apiGet()` from API client |
| QR scanner had hardcoded event ID (`/events/5/check-in`) | Added event selection UI before scanning |
| QR scanner endpoint didn't exist in main backend | Changed to `POST /api/attendance/scan` with `event_id` + `qr_code_value` |
| Feedback screen used `/api/organiser/feedback` (doesn't exist) | Changed to `GET /api/organiser/events/:id/feedback` + added event selector |
| Profile screen used `/api/me/profile` (doesn't exist) | Changed to `GET /api/auth/me` |
| Events screen used direct fetch with `API_URL` | Changed to use `apiGet()` with JWT auth |

### 5.2 Reverted Changes Restored

Nurain's branch inadvertently reverted several production fixes. These were restored:

- `merchant.service.js:26` — `LEFT JOIN` (was changed back to `INNER JOIN`)
- `render.yaml` — `PIN_SECRET` and `RATE_LIMIT_MAX` values
- Integration test files — restored from `main`

### 5.3 Removed

- `my-app-stable/` — Nurain's original standalone project directory (replaced by `frontend/organiser_mobile_app/`)
- `my-app-stable.zip` — 103 MB zip file (not suitable for git)
- `my-app-stable/backend/vr-backend/` — Duplicate backend (app now uses main backend)
- Root-level `.tsx` and `.js` files — These were duplicates of the `my-app-stable/` files

---

## 6. Testing Instructions

### 6.1 Prerequisites

- Node.js 20+
- Expo CLI (`npm install -g expo-cli`) or use `npx expo`
- Android emulator, iOS simulator, or physical device with Expo Go app
- Backend must be running (production is live at `https://vol-rewards-api.onrender.com`)

### 6.2 Running the App

```bash
# Navigate to the mobile app directory
cd frontend/organiser_mobile_app

# Install dependencies
npm install --legacy-peer-deps

# Start Expo dev server
npx expo start
```

This will open the Expo developer tools. From there:
- Press `a` to open on Android emulator
- Press `i` to open on iOS simulator
- Scan QR code with Expo Go app on physical device

### 6.3 Test Accounts

| Role | Email | Password |
|------|-------|----------|
| Organiser | bob@test.com | password123 |
| Organiser 2 | johnny@test.com | password123 |

### 6.4 Test Flow

#### 6.4.1 Login
1. Open the app → Login screen appears
2. Enter `bob@test.com` / `password123`
3. Tap **Log In**
4. ✅ Should navigate to Dashboard

#### 6.4.2 Dashboard
1. After login, Dashboard tab shows:
   - Total events count
   - Total volunteers count
   - Upcoming events list
2. ✅ Data matches the Organiser Web Portal

#### 6.4.3 Events
1. Tap **Events** tab
2. ✅ List of your events is displayed
3. Tap an event → View details
4. Tap **+** button → Create a new event
5. ✅ New event appears in the list

#### 6.4.4 QR Scanner (Attendance)
1. Tap **Scanner** tab
2. Select an event from the list
3. Tap **Start Scanning**
4. Point camera at a volunteer's QR code (from Volunteer PWA profile page)
5. ✅ "Check-in Successful" alert appears
6. Verify: Organiser Web Portal → Event Roster shows the volunteer as checked in

#### 6.4.5 Feedback
1. Tap **Feedback** tab
2. Select an event from the horizontal tabs
3. ✅ View volunteer ratings and comments
4. Verify: Data matches the Organiser Web Portal feedback page

#### 6.4.6 Profile
1. Tap **Profile** tab
2. ✅ View your organiser name, email, and stats

### 6.5 Cross-Portal Verification

After completing the mobile app tests, verify data consistency with other portals:

| Test | Mobile App | Web Portal | Expected |
|------|-----------|------------|----------|
| Create event | Events → Create | Admin → Events | Event appears in admin list |
| QR check-in | Scanner → scan QR | Organiser → Event Roster | Volunteer shows as checked in |
| Submit feedback | (Volunteer PWA) | Feedback tab | Feedback appears in mobile app |
| Dashboard stats | Dashboard tab | Organiser Dashboard | Same numbers |

### 6.6 Running the Integration Test

To verify the entire system still works after integration:

```bash
# From project root
node backend/tests/integration/integration.test.js
```

Expected: **54/54 PASS**

---

*— End of Mobile Organiser App Integration Report —*
