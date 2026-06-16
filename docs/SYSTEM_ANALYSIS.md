# Volunteering Rewards App — Full System Analysis

**Date:** May 3, 2026  
**Project:** Capstone (4-person team)  
**Platform:** Expo React Native (Mobile) + React (Web) + Node.js/Express (Backend) + PostgreSQL (Database)

---

## (1) All Parties Using the System

| # | Party | Role Description | System Access |
|---|-------|-----------------|---------------|
| **P1** | **Volunteer** | A Singaporean who performs volunteering activities (beach cleanup, elderly walks, etc.). Scans QR codes at events to earn points. Redeems points for coupons/rewards. | Mobile App |
| **P2** | **Cashier** | Staff at a participating merchant outlet. Verifies volunteer's 6-digit PIN when the volunteer redeems a reward. Confirms and issues the item. | Web App |
| **P3** | **Merchant** | Business owner / manager of a participating outlet. Manages reward listings (add/delete rewards, set quantities and expiry dates). Monitors redemption statistics. | Web App |
| **P4** | **Event Organizer** | Organisation or individual that creates and manages volunteering activities/events. Generates QR codes for each event. Manages event details and capacity. | Web App |
| **P5** | **System Admin** | Super-administrator who manages the entire system: user accounts, approvals, system configuration, sponsorship oversight. | Web App |

---

## (2) Workflows for Each Party

### (A) Volunteer Workflow — Mobile App

```
┌─────────────────────────────────────────────────────────────────────┐
│                        VOLUNTEER JOURNEY                            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  START                                                               │
│    │                                                                  │
│    ▼                                                                  │
│  [Register] ─── Optional: enter sponsor email (referral)              │
│    │                                                                  │
│    ▼                                                                  │
│  [Login] ─── JWT token issued                                        │
│    │                                                                  │
│    ▼                                                                  │
│  ┌──────────────── DASHBOARD ──────────────────────┐                 │
│  │                                                  │                 │
│  │  ├── Points Summary                               │                 │
│  │  │     - Total points earned                      │                 │
│  │  │     - Points redeemed                          │                 │
│  │  │     - Current balance                           │                 │
│  │  │     - Target progress (if set)                  │                 │
│  │  │                                                  │                 │
│  │  ├── [Activity List / Browse Events]               │                 │
│  │  │     - View upcoming volunteering events         │                 │
│  │  │     - Filter/sort by: date, location, org       │                 │
│  │  │     - "Like" / favourite events                 │                 │
│  │  │     - Register for an event                     │                 │
│  │  │                                                  │                 │
│  │  ├── [My Schedule / Registered Events]             │                 │
│  │  │     - View registered upcoming events            │                 │
│  │  │     - Cancel registration                        │                 │
│  │  │     - "Bring a friend" option                    │                 │
│  │  │     - Receive reminders (1 day before)           │                 │
│  │  │                                                  │                 │
│  │  ├── [My Activity History]                         │                 │
│  │  │     - Past events participated                   │                 │
│  │  │     - Points earned per event                    │                 │
│  │  │     - Sort by name, organisation, location       │                 │
│  │  │                                                  │                 │
│  │  ├── [Today's Activity]                             │                 │
│  │  │     - Shows today's event if registered          │                 │
│  │  │     - Tap → QR Scanner opens                     │                 │
│  │  │     - Scan QR code → points credited             │                 │
│  │  │     - Confirmation screen                        │                 │
│  │  │                                                  │                 │
│  │  ├── [Rewards / Coupon Shop]                       │                 │
│  │  │     - Browse available rewards                   │                 │
│  │  │     - Sort by: product name, merchant, location  │                 │
│  │  │     - "Like" rewards                             │                 │
│  │  │     - Set reward as personal target              │                 │
│  │  │     - Redeem reward (if enough points)            │                 │
│  │  │                                                  │                 │
│  │  ├── [My Coupons / Redemption History]              │                 │
│  │  │     - List of redeemed coupons + 6-digit PIN     │                 │
│  │  │     - Coupon status: unused / used / expired     │                 │
│  │  │     - Expiry date displayed                      │                 │
│  │  │                                                  │                 │
│  │  └── [Sponsorship / Referral]                      │                 │
│  │        - View my Direct Sponsor (name)              │                 │
│  │        - View my Parent Sponsor (name)              │                 │
│  │        - My Direct Sponsorships (count + list)      │                 │
│  │        - My Grandchild Sponsorships (count + list)   │                 │
│  │        - Points earned from referrals               │                 │
│  │                                                     │                 │
│  └─────────────────────────────────────────────────────┘                 │
│    │                                                                      │
│    ▼                                                                      │
│  [Logout]                                                               │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### (B) Cashier Workflow — Web App

```
┌─────────────────────────────────────────────────────────────────────┐
│                       CASHIER JOURNEY                               │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  START                                                               │
│    │                                                                  │
│    ▼                                                                  │
│  [Login] ─── JWT token issued                                        │
│    │                                                                  │
│    ▼                                                                  │
│  ┌──────────────── DASHBOARD ──────────────────────┐                 │
│  │                                                  │                 │
│  │  ├── [Verify Coupon]                             │                 │
│  │  │     - 6-digit PIN input field                 │                 │
│  │  │     - Submit button                           │                 │
│  │  │     - Result: Valid / Invalid / Used / Expired│                 │
│  │  │     - On valid: issue item to volunteer        │                 │
│  │  │                                                  │                 │
│  │  └── [Today's Event Attendance] (if applicable)    │                 │
│  │        - Scan volunteer's entry QR code            │                 │
│  │        - Mark attendance                           │                 │
│  │                                                     │                 │
│  └─────────────────────────────────────────────────────┘                 │
│    │                                                                      │
│    ▼                                                                      │
│  [Logout]                                                               │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

### (C) Merchant Workflow — Web App

```
┌─────────────────────────────────────────────────────────────────────┐
│                      MERCHANT JOURNEY                               │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  START                                                               │
│    │                                                                  │
│    ▼                                                                  │
│  [Login] ─── JWT token issued                                        │
│    │                                                                  │
│    ▼                                                                  │
│  ┌──────────────── DASHBOARD ──────────────────────┐                 │
│  │                                                  │                 │
│  │  ├── [Reward Showcase Management]                │                 │
│  │  │     - View my current reward listings         │                 │
│  │  │     - Add new reward (title, description,     │                 │
│  │  │       points required, quantity, expiry)      │                 │
│  │  │     - Edit existing reward                    │                 │
│  │  │     - Delete / deactivate reward              │                 │
│  │  │                                                  │                 │
│  │  ├── [Redemption History]                        │                 │
│  │  │     - See which coupons were redeemed at       │                 │
│  │  │       my outlet                                │                 │
│  │  │     - View daily/weekly/monthly stats          │                 │
│  │  │                                                  │                 │
│  │  └── [Profile / Settings]                        │                 │
│  │        - Update outlet info                       │                 │
│  │        - Manage cashier accounts                  │                 │
│  │                                                     │                 │
│  └─────────────────────────────────────────────────────┘                 │
│    │                                                                      │
│    ▼                                                                      │
│  [Logout]                                                               │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

### (D) Event Organizer Workflow — Web App

```
┌─────────────────────────────────────────────────────────────────────┐
│                    EVENT ORGANIZER JOURNEY                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  START                                                               │
│    │                                                                  │
│    ▼                                                                  │
│  [Register / Login] ─── JWT token issued                            │
│    │                                                                  │
│    ▼                                                                  │
│  ┌──────────────── DASHBOARD ──────────────────────┐                 │
│  │                                                  │                 │
│  │  ├── [Event Management]                          │                 │
│  │  │     - View my events                          │                 │
│  │  │     - Create new event                        │                 │
│  │  │       (title, description, location, date,    │                 │
│  │  │        capacity, points value)                │                 │
│  │  │     - Edit / cancel event                     │                 │
│  │  │     - View registered volunteers              │                 │
│  │  │                                                  │                 │
│  │  ├── [QR Code Management]                        │                 │
│  │  │     - Generate QR code for an event            │                 │
│  │  │     - Download / print QR code                 │                 │
│  │  │     - Deactivate QR code (if event cancelled)  │                 │
│  │  │                                                  │                 │
│  │  └── [Attendance Tracking]                       │                 │
│  │        - See who attended vs registered           │                 │
│  │        - View attendance reports                  │                 │
│  │                                                     │                 │
│  └─────────────────────────────────────────────────────┘                 │
│    │                                                                      │
│    ▼                                                                      │
│  [Logout]                                                               │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

### (E) System Admin Workflow — Web App

```
┌─────────────────────────────────────────────────────────────────────┐
│                     SYSTEM ADMIN JOURNEY                            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  START                                                               │
│    │                                                                  │
│    ▼                                                                  │
│  [Login] ─── Admin-level JWT token issued                            │
│    │                                                                  │
│    ▼                                                                  │
│  ┌──────────────── DASHBOARD ──────────────────────┐                 │
│  │                                                  │                 │
│  │  ├── [User Management]                           │                 │
│  │  │     - View all users (volunteers, cashiers,   │                 │
│  │  │       merchants, organisers)                  │                 │
│  │  │     - Approve / reject / suspend accounts     │                 │
│  │  │     - Reset passwords                         │                 │
│  │  │                                                  │                 │
│  │  ├── [System Monitoring]                         │                 │
│  │  │     - Total scans, redemptions, users         │                 │
│  │  │     - Daily active users                      │                 │
│  │  │     - Error logs                              │                 │
│  │  │                                                  │                 │
│  │  ├── [Sponsorship Oversight]                     │                 │
│  │  │     - View referral tree                      │                 │
│  │  │     - Monitor points distribution             │                 │
│  │  │                                                  │                 │
│  │  └── [Configuration]                             │                 │
│  │        - System-wide settings                    │                 │
│  │        - Default points values                   │                 │
│  │                                                     │                 │
│  └─────────────────────────────────────────────────────┘                 │
│    │                                                                      │
│    ▼                                                                      │
│  [Logout]                                                               │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## (3) Database Tables Classified by Workflow

### WORKFLOW A: Authentication & User Management

All parties (P1–P5) use these tables.

| Table | Fields | Purpose |
|-------|--------|---------|
| **users** | id, name, email (UQ), password_hash, role (volunteer/cashier/merchant/organizer/admin), points (≥0), direct_sponsor_id (FK→users), parent_sponsor_id (FK→users), status (active/suspended), phone, created_at, updated_at | Stores all user accounts across all 5 roles. Sponsorship fields enable referral tracking. |

### WORKFLOW B: Event Management & QR Scanning

Used by P1 (Volunteer), P4 (Event Organizer).

| Table | Fields | Purpose |
|-------|--------|---------|
| **events** | id, organizer_id (FK→users), title, description, location, event_date, capacity, points_value (CHECK>0), status (upcoming/ongoing/completed/cancelled), created_at, updated_at | Stores volunteering activity definitions created by organisers. |
| **event_registrations** | id, user_id (FK→users), event_id (FK→events), status (confirmed/cancelled/attended), registered_at | Tracks which volunteer registered for which event. UNIQUE(user_id, event_id). |
| **qr_codes** | id, code (UQ UUID), event_id (FK→events), location, points_value (CHECK>0), expiry_date, status (active/inactive/expired), created_at | Stores unique QR codes generated for events. Each event can have multiple QR codes. |
| **scan_logs** | id, user_id (FK→users), qr_id (FK→qr_codes), scanned_at | Records every QR scan. UNIQUE(user_id, qr_id) prevents double-scoring. |
| **favorites** | id, user_id (FK→users), item_type (event/coupon/activity), item_id, created_at | Allows volunteers to "like" events, coupons, or activities for quick access. |

### WORKFLOW C: Reward & Coupon Management

Used by P1 (Volunteer), P2 (Cashier), P3 (Merchant).

| Table | Fields | Purpose |
|-------|--------|---------|
| **coupons** | id, merchant_id (FK→users), title, description, image_url, points_required (CHECK>0), quantity (CHECK≥0), expiry_date, status (active/inactive), created_at, updated_at | Defines available rewards that merchants offer. Quantity is decremented atomically on each redemption. |
| **user_coupons** | id, user_id (FK→users), coupon_id (FK→coupons), pin (UQ CHAR(6)), status (unused/used/expired), verify_attempts (DEFAULT 0), redeemed_at, expiry_date, created_at | Records each coupon issuance to a volunteer. PIN is generated via crypto.randomInt(). This is the most security-critical table. |
| **redemption_logs** | id, user_coupon_id (FK→user_coupons), cashier_id (FK→users), verified_at, ip_address | Audit trail for every PIN verification attempt (success and failure). |

### WORKFLOW D: Sponsorship / Referral

Used by P1 (Volunteer), P5 (Admin).

| Table | Fields | Purpose |
|-------|--------|---------|
| **sponsorship_points** | id, earned_by_user_id (FK→users), source_user_id (FK→users), level (1=direct, 2=indirect), points_earned, created_at | Audit trail for every sponsorship points event. Who earned, from whom, and how much. |

### Summary of All Database Tables

```
PROJECT DATABASE
│
├── [WORKFLOW A: Auth & Users]
│   └── users
│
├── [WORKFLOW B: Events & QR]
│   ├── events
│   ├── event_registrations
│   ├── qr_codes
│   ├── scan_logs
│   └── favorites
│
├── [WORKFLOW C: Rewards & Coupons]
│   ├── coupons
│   ├── user_coupons
│   └── redemption_logs
│
└── [WORKFLOW D: Sponsorship]
    └── sponsorship_points
```

---

## (4) API Endpoints + Functions Classified by Workflow

### WORKFLOW A: Authentication & User Management

| Method | Endpoint | Auth | Function | Parties |
|--------|----------|------|----------|---------|
| POST | `/api/auth/register` | None | Register new user (name, email, password, role, optional sponsor emails) | P1–P5 |
| POST | `/api/auth/login` | None | Authenticate user, return JWT token | P1–P5 |
| GET | `/api/auth/me` | JWT | Get current user's profile, points, sponsorship | P1–P5 |
| PUT | `/api/auth/profile` | JWT | Update profile (name, phone, password) | P1–P5 |
| POST | `/api/auth/logout` | JWT | Invalidate token | P1–P5 |

### WORKFLOW B: Event Management & QR Scanning

| Method | Endpoint | Auth | Function | Parties |
|--------|----------|------|----------|---------|
| GET | `/api/events` | JWT | List all upcoming events (with sorting & filtering) | P1, P4 |
| POST | `/api/events` | JWT(P4) | Create a new volunteering event | P4 |
| PUT | `/api/events/:id` | JWT(P4) | Edit event details | P4 |
| DELETE | `/api/events/:id` | JWT(P4) | Cancel/delete an event | P4 |
| GET | `/api/events/:id` | JWT | Get event details + registration count | P1, P4 |
| POST | `/api/events/:id/register` | JWT(P1) | Register volunteer for event | P1 |
| DELETE | `/api/events/:id/register` | JWT(P1) | Cancel registration | P1 |
| POST | `/api/events/:id/attendance` | JWT(P2) | Mark volunteer attendance at event | P2 |
| GET | `/api/events/mine` | JWT(P1) | Get my registered events (schedule) | P1 |
| GET | `/api/events/history` | JWT(P1) | Get my past participated events | P1 |
| POST | `/api/qr/generate` | JWT(P4) | Generate QR code for an event | P4 |
| POST | `/api/qr/scan` | JWT(P1) | Scan QR code → validate → award points | P1 |
| GET | `/api/qr/history` | JWT(P1) | Get my scan history | P1 |
| PUT | `/api/qr/:id/deactivate` | JWT(P4) | Deactivate a QR code | P4 |
| POST | `/api/favorites` | JWT | Add a favourite (event/coupon) | P1 |
| DELETE | `/api/favorites/:id` | JWT | Remove a favourite | P1 |
| GET | `/api/favorites` | JWT | List my favourites | P1 |

### WORKFLOW C: Reward & Coupon Management

| Method | Endpoint | Auth | Function | Parties |
|--------|----------|------|----------|---------|
| GET | `/api/coupons` | JWT | List available rewards (with sorting + filtering) | P1, P3 |
| POST | `/api/coupons` | JWT(P3) | Add a new reward | P3 |
| PUT | `/api/coupons/:id` | JWT(P3) | Edit reward details | P3 |
| DELETE | `/api/coupons/:id` | JWT(P3) | Delete/deactivate a reward | P3 |
| GET | `/api/coupons/:id` | JWT | Get reward details | P1, P3 |
| POST | `/api/coupons/redeem` | JWT(P1) | Redeem points → generate coupon + PIN (transactional) | P1 |
| GET | `/api/coupons/my` | JWT(P1) | Get my redeemed coupons with PINs | P1 |
| POST | `/api/verify` | JWT(P2) | Verify a 6-digit PIN (rate-limited) | P2 |
| GET | `/api/merchant/redemptions` | JWT(P3) | Get redemption history for my outlet | P3 |
| GET | `/api/merchant/stats` | JWT(P3) | Get redemption statistics | P3 |

### WORKFLOW D: Sponsorship / Referral

| Method | Endpoint | Auth | Function | Parties |
|--------|----------|------|----------|---------|
| GET | `/api/sponsor/tree` | JWT | Get my sponsorship tree (direct + grandchild lists) | P1 |
| GET | `/api/sponsor/points` | JWT | Get points earned from referrals | P1 |
| GET | `/api/admin/sponsorship` | JWT(P5) | View all sponsorship data | P5 |

### WORKFLOW E: Admin / System

| Method | Endpoint | Auth | Function | Parties |
|--------|----------|------|----------|---------|
| GET | `/api/admin/users` | JWT(P5) | List all users | P5 |
| PUT | `/api/admin/users/:id/status` | JWT(P5) | Approve/suspend user | P5 |
| GET | `/api/admin/stats` | JWT(P5) | System statistics dashboard | P5 |

### Summary of All Endpoints

```
WORKFLOW A: Auth
  POST /api/auth/register
  POST /api/auth/login
  GET  /api/auth/me
  PUT  /api/auth/profile
  POST /api/auth/logout

WORKFLOW B: Events & QR
  GET    /api/events
  POST   /api/events
  PUT    /api/events/:id
  DELETE /api/events/:id
  GET    /api/events/:id
  POST   /api/events/:id/register
  DELETE /api/events/:id/register
  POST   /api/events/:id/attendance
  GET    /api/events/mine
  GET    /api/events/history
  POST   /api/qr/generate
  POST   /api/qr/scan
  GET    /api/qr/history
  PUT    /api/qr/:id/deactivate
  POST   /api/favorites
  DELETE /api/favorites/:id
  GET    /api/favorites

WORKFLOW C: Rewards & Coupons
  GET    /api/coupons
  POST   /api/coupons
  PUT    /api/coupons/:id
  DELETE /api/coupons/:id
  GET    /api/coupons/:id
  POST   /api/coupons/redeem
  GET    /api/coupons/my
  POST   /api/verify
  GET    /api/merchant/redemptions
  GET    /api/merchant/stats

WORKFLOW D: Sponsorship
  GET    /api/sponsor/tree
  GET    /api/sponsor/points

WORKFLOW E: Admin
  GET    /api/admin/users
  PUT    /api/admin/users/:id/status
  GET    /api/admin/stats
```

---

## (5) Tree Structure of the System (by Workflow Category)

```
                                VOLUNTEERING REWARDS APP
                                    │
                    ┌───────────────┴───────────────┐
                    │                               │
            Mobile App (P1)                  Web App (P2-P5)
                    │                               │
                    ▼                               ▼
            ┌──────────────────┐         ┌──────────────────────┐
            │  BACKEND API     │         │  BACKEND API          │
            │  (same server)   │         │  (same server)        │
            └────────┬─────────┘         └───────────┬──────────┘
                     │                               │
                     └───────────────┬───────────────┘
                                     │
                                     ▼
                          ┌─────────────────────┐
                          │   PostgreSQL DB      │
                          └─────────────────────┘


WORKFLOW CATEGORY TREE:

System
│
├── WORKFLOW A: AUTH & USER MANAGEMENT
│   ├── Register
│   ├── Login
│   ├── Profile Management
│   └── Logout
│
├── WORKFLOW B: EVENT MANAGEMENT & QR SCANNING
│   ├── Event CRUD (Organiser)
│   │   ├── Create Event
│   │   ├── Edit Event
│   │   ├── Cancel Event
│   │   └── View Registrations
│   ├── QR Code Management (Organiser)
│   │   ├── Generate QR Code
│   │   └── Deactivate QR Code
│   ├── Event Registration (Volunteer)
│   │   ├── Browse/Sort Events
│   │   ├── Like Events
│   │   ├── Register for Event
│   │   └── Cancel Registration
│   ├── QR Scanning (Volunteer)
│   │   ├── Scan QR Code
│   │   ├── Validate QR Code
│   │   └── Award Points
│   └── Attendance (Cashier)
│       └── Mark Attendance
│
├── WORKFLOW C: REWARD & COUPON MANAGEMENT
│   ├── Reward CRUD (Merchant)
│   │   ├── Add Reward
│   │   ├── Edit Reward
│   │   └── Delete Reward
│   ├── Coupon Redemption (Volunteer)
│   │   ├── Browse Rewards
│   │   ├── Like Rewards
│   │   ├── Set Personal Target
│   │   └── Redeem Coupon
│   ├── PIN Verification (Cashier)
│   │   ├── Enter PIN
│   │   ├── Validate PIN
│   │   ├── Mark Coupon Used
│   │   └── Rate Limiting
│   └── Redemption History (Merchant)
│       └── View Stats
│
├── WORKFLOW D: SPONSORSHIP / REFERRAL
│   ├── Referral Registration
│   ├── Points Allocation Engine
│   ├── View Sponsorship Tree
│   └── View Sponsorship Points
│
└── WORKFLOW E: SYSTEM ADMIN
    ├── User Management
    ├── System Monitoring
    └── Configuration
```

---

## (6) GUI Pages — Mobile App (Volunteer)

The Expo project already has file-based routing with tabs. Here is the complete page structure:

### Mobile App — Navigation Structure

```
APP (Root Stack)
│
├── Auth Stack (no tabs)
│   ├── WelcomeScreen
│   ├── LoginScreen
│   └── RegisterScreen
│
└── Main Tabs
    │
    ├── TAB 1: Home / Dashboard
    │   └── DashboardScreen
    │
    ├── TAB 2: Events
    │   ├── EventListScreen
    │   ├── EventDetailScreen
    │   └── EventRegistrationScreen
    │
    ├── TAB 3: Scan (Center Button)
    │   └── ScanScreen
    │
    ├── TAB 4: Rewards
    │   ├── RewardListScreen
    │   ├── MyCouponsScreen
    │   └── CouponDetailScreen
    │
    └── TAB 5: Profile / More
        ├── ProfileScreen
        ├── MyScheduleScreen
        ├── ActivityHistoryScreen
        ├── SponsorshipScreen
        └── SettingsScreen
```

### Page-by-Page Item Listing

```
┌─────────────────────────────────────────────────────────────────────┐
│ WelcomeScreen (shown when not logged in)                            │
├─────────────────────────────────────────────────────────────────────┤
│ ● Logo image                                                        │
│ ● App title: "Volunteering Rewards App"                             │
│ ● Tagline: "Earn points while giving back to the community"         │
│ ● [Login] button                                                    │
│ ● [Register] button                                                 │
│ ● "Skip" link (optional, not recommended)                           │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│ LoginScreen                                                         │
├─────────────────────────────────────────────────────────────────────┤
│ ● Header: "Welcome Back"                                            │
│ ● TextInput: Email (keyboard: email)                                │
│ ● TextInput: Password (secure entry)                                │
│ ● [Login] button                                                    │
│ ● "Forgot password?" link                                           │
│ ● "Don't have an account? Register" link                            │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│ RegisterScreen                                                      │
├─────────────────────────────────────────────────────────────────────┤
│ ● Header: "Create Account"                                          │
│ ● TextInput: Full Name                                              │
│ ● TextInput: Email (keyboard: email)                                │
│ ● TextInput: Phone Number (keyboard: phone)                         │
│ ● TextInput: Password (secure entry)                                │
│ ● TextInput: Confirm Password (secure entry)                        │
│ ● --- Optional: Referral Info ---                                   │
│ ● TextInput: Direct Sponsor Email (optional)                        │
│ ● TextInput: Parent Sponsor Email (optional)                        │
│ ● --- ---                                                           │
│ ● [Register] button                                                 │
│ ● "Already have an account? Login" link                             │
│ ● Terms & Conditions checkbox                                       │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│ DashboardScreen (Main Home Tab)                                     │
├─────────────────────────────────────────────────────────────────────┤
│ ● Header: "Hello, {UserName}" with profile avatar                   │
│ ● Points Summary Card:                                              │
│   ├── Current Points Balance (large number)                         │
│   ├── Total Points Earned                                           │
│   ├── Points Redeemed                                               │
│   └── Progress bar: "Target: {x} points" (if set)                  │
│ ● Quick Action Cards (2x2 grid):                                    │
│   ├── [Today's Activity] – shows today's event or "No activity"     │
│   ├── [My Schedule] – count of upcoming events                      │
│   ├── [Scan QR] – opens camera                                      │
│   └── [Redeem Points] – goes to rewards                             │
│ ● Upcoming Events (scrollable horizontal list):                     │
│   ├── Event card × N                                                │
│   │   ├── Event title, date, location                               │
│   │   └── [Register] button                                         │
│ ● Recent Activity (list):                                           │
│   ├── "Scanned QR at {event}" – {points} pts                        │
│   ├── "Redeemed {coupon}" – {-points} pts                          │
│   └── [View All] link                                               │
│ ● Bottom Navigation: Home | Events | Scan | Rewards | Profile       │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│ EventListScreen (TAB 2: Events)                                     │
├─────────────────────────────────────────────────────────────────────┤
│ ● Header: "Volunteering Activities"                                 │
│ ● Search bar: search by keyword                                     │
│ ● Filter chips row: All | Upcoming | This Week | This Month         │
│ ● Sort dropdown: By Date | By Name | By Organisation | By Location  │
│ ● Event Card (repeating list):                                      │
│   ├── Event image/banner                                            │
│   ├── Event title                                                   │
│   ├── Organisation name                                             │
│   ├── Date & time                                                   │
│   ├── Location                                                      │
│   ├── Points value badge: "{N} pts"                                 │
│   ├── Capacity: "{N}/{M} registered"                                │
│   ├── Heart icon (like/unlike toggle)                               │
│   └── [Register] button (or "Registered ✓" if done)                │
│ ● [Floating filter button] for advanced filters                     │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│ EventDetailScreen (tap on an event)                                 │
├─────────────────────────────────────────────────────────────────────┤
│ ● Header: Event title with back button                              │
│ ● Event banner image                                                │
│ ● Info section:                                                     │
│   ├── Organisation name + logo                                      │
│   ├── Date & time                                                   │
│   ├── Location (with map link)                                      │
│   ├── Duration                                                      │
│   ├── Points value: "{N} pts"                                       │
│   └── Capacity: "{N}/{M}"                                           │
│ ● Description section: full event description                       │
│ ● [Register Now] button (primary CTA)                               │
│ ● [Like / Unlike] toggle button                                     │
│ ● [Set Reminder] toggle                                             │
│ ● [Bring a Friend] button (optional)                                │
│ ● Participants section: "N volunteers registered"                   │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│ ScanScreen (TAB 3 – Center button)                                  │
├─────────────────────────────────────────────────────────────────────┤
│ ● Header: "Scan QR Code"                                            │
│ ● Camera viewport (square frame with scan animation)                │
│ ● Instruction text: "Point your camera at the event QR code"        │
│ ● [Enter Code Manually] link (fallback)                             │
│ ● TextInput: Or type QR code (hidden until "Manual" tapped)         │
│ ● [Submit] button (hidden until "Manual" tapped)                    │
├─────────────────────────────────────────────────────────────────────┤
│ After successful scan:                                              │
│ ● Success animation (checkmark)                                     │
│ ● "Points Earned: {N}"                                              │
│ ● "Total Balance: {N} pts"                                          │
│ ● Event name                                                        │
│ ● [Done] button → back to dashboard                                 │
├─────────────────────────────────────────────────────────────────────┤
│ After failed scan:                                                  │
│ ● Error icon                                                        │
│ ● Error message: "Invalid QR code" / "Already scanned" / "Expired"  │
│ ● [Try Again] button                                                │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│ RewardListScreen (TAB 4: Rewards)                                   │
├─────────────────────────────────────────────────────────────────────┤
│ ● Header: "Rewards & Coupons"                                       │
│ ● Points balance chip: "{N} pts available"                          │
│ ● Search bar                                                        │
│ ● Sort dropdown: By Name | By Points | By Merchant | By Location    │
│ ● Filter chips: All | Within My Points | Popular                     │
│ ● Reward Card (repeating list):                                      │
│   ├── Reward image                                                  │
│   ├── Reward title                                                  │
│   ├── Merchant name                                                 │
│   ├── Points required: "{N} pts"                                    │
│   ├── Stock: "{N} left" or "Out of stock"                           │
│   ├── Expiry date                                                   │
│   ├── Heart icon (like/unlike)                                      │
│   ├── "Set as Target" button                                        │
│   └── [Redeem] button                                               │
│ ● [My Coupons] link at top right                                    │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│ MyCouponsScreen (sub-page of Rewards)                               │
├─────────────────────────────────────────────────────────────────────┤
│ ● Header: "My Coupons"                                              │
│ ● Tab bar: Unused | Used | Expired                                  │
│ ● Coupon Card (repeating):                                          │
│   ├── Coupon title                                                  │
│   ├── Merchant name                                                 │
│   ├── 6-digit PIN (large, copyable)                                 │
│   ├── Status badge: Unused / Used / Expired                         │
│   ├── Expiry date                                                   │
│   └── [Show QR Code] button (optional future feature)               │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│ Profile / More Tab                                                  │
├─────────────────────────────────────────────────────────────────────┤
│ ProfileScreen:                                                      │
│ ● Profile picture + name + email                                    │
│ ● Total points badge                                                │
│ ● Menu list:                                                        │
│   ├── [My Schedule] → ScheduleScreen                                │
│   ├── [Activity History] → ActivityHistoryScreen                    │
│   ├── [Sponsorship] → SponsorshipScreen                             │
│   ├── [Settings] → SettingsScreen                                   │
│   ├── [About] → AboutScreen                                         │
│   └── [Logout] button                                               │
│                                                                      │
├── ScheduleScreen:                                                    │
│ ● Header: "My Schedule"                                             │
│ ● Upcoming events list:                                             │
│   ├── Event card: title, date, location, status                     │
│   ├── [Cancel Registration] button                                  │
│   └── [View QR Code] button for day-of scanning                     │
│ ● Past events (collapsible section)                                 │
│                                                                      │
├── ActivityHistoryScreen:                                            │
│ ● Header: "My Activity History"                                     │
│ ● Sort dropdown                                                     │
│ ● Activity list:                                                    │
│   ├── Event name + date                                             │
│   ├── Points earned                                                 │
│   └── Status: Attended / Registered / Cancelled                     │
│                                                                      │
├── SponsorshipScreen:                                                │
│ ● Header: "Sponsorship / Referral"                                  │
│ ● My Upline section:                                                │
│   ├── Direct Sponsor: {name} (or "None")                            │
│   ├── Parent Sponsor: {name} (or "None")                            │
│   └── Note: "Contact them if you need help"                         │
│ ● My Downline section:                                              │
│   ├── Direct Sponsorships: {count}                                  │
│   │   └── [Show List] → list of names + joined dates               │
│   ├── Grandchild Sponsorships: {count}                              │
│   │   └── [Show List] → list of names + joined dates               │
│ ● Points from Referrals:                                            │
│   ├── Total sponsorship points earned                               │
│   └── Breakdown: Level 1 vs Level 2                                 │
│ ● [Invite Friends] button (share referral link)                     │
│                                                                      │
└── SettingsScreen:                                                    │
    ├── Change Password                                                │
    ├── Notification Preferences                                       │
    ├── Dark Mode Toggle                                               │
    └── Delete Account                                                 │
```

### Web App — Page Structure (Cashier, Merchant, Organizer, Admin)

```
WEB APP (React)
│
├── Auth Pages
│   ├── LoginPage
│   └── RegisterPage
│
├── CASHIER PAGES
│   ├── CashierDashboardPage
│   │   ├── PIN Input area
│   │   └── Today's Event Attendance
│   └── VerificationResult component
│
├── MERCHANT PAGES
│   ├── MerchantDashboardPage
│   ├── RewardManagementPage
│   │   ├── Add Reward form
│   │   ├── Edit Reward form
│   │   └── Reward List table
│   ├── RedemptionHistoryPage
│   │   ├── Date range filter
│   │   ├── Statistics cards
│   │   └── Redemption table
│   └── ProfilePage
│
├── ORGANIZER PAGES
│   ├── OrganizerDashboardPage
│   ├── EventManagementPage
│   │   ├── Create Event form
│   │   ├── Event List table
│   │   └── Edit Event form
│   ├── QRCodeManagementPage
│   │   ├── QR Code preview/render
│   │   ├── Download QR button
│   │   └── QR List table
│   └── AttendanceReportPage
│       ├── Event selector
│       └── Attendance table
│
└── ADMIN PAGES
    ├── AdminDashboardPage
    ├── UserManagementPage
    │   ├── User table (searchable, filterable)
    │   └── User detail / action modal
    ├── SystemStatsPage
    └── ConfigurationPage
```

---

## (7) Conclusion & Opinion

I have completed the full analysis covering all 7 deliverables. Here is my concluding assessment:

### Strengths of This System

1. **Clear social impact** — The system directly addresses a real need: encouraging volunteerism in Singapore through tangible rewards. This gives the project a strong motivational narrative for both development and presentation.

2. **Well-defined user roles** — The 5 distinct parties (Volunteer, Cashier, Merchant, Organizer, Admin) have cleanly separated responsibilities. Each role has a focused workflow, which prevents scope creep within individual features.

3. **Modular architecture** — The workflows naturally map to independent feature blocks (Auth → Events → QR → Rewards → Sponsorship → Admin). Your team can build and test each block independently.

4. **Strong security baseline** — The PIN-based verification with rate limiting, JWT authentication on all endpoints, UUID-based QR codes, and database-level constraints (UNIQUE, CHECK) provide solid protection against common attack vectors.

5. **Sponsorship adds depth** — The 2-level referral system with effort-based points allocation is a differentiating feature that adds real incentive dynamics. It demonstrates thoughtful system design beyond basic CRUD.

### Challenges to Anticipate

1. **Scope management** — The system has 5 workflows, 9 database tables, 30+ API endpoints, and ~20 screens across mobile + web. For a 4-person team on a capstone timeline, prioritization is critical. The sponsorship and admin workflows are the most "optional" — build them only if the core flows are solid.

2. **QR scanning reliability** — The camera/QR library in Expo can behave differently across Android versions and device models. Test on the actual demo device early and always keep the manual text-entry fallback.

3. **Team dependency sequencing** — The backend must be functional before either mobile or web can connect. The recommended backend build order is: Auth → Events → QR → Coupons → Sponsorship → Admin. Frontend teams should start with mock screens but expect to connect to real APIs.

4. **Expo Go limitations** — Expo Go does not support all native modules. If your QR scanning library requires a native module not included in Expo Go, you may need to build a development build (expo-dev-client). Verify QR scanning works in Expo Go early.

5. **Database transactions** — The points deduction + coupon creation operation must be a single atomic transaction. Without this, a server crash mid-redemption could deduct points without issuing a coupon. This is non-negotiable.

### Final Verdict

**This is a strong, well-scoped capstone project.** The core value proposition (scan → earn → redeem → verify) is simple enough to demo in 5 minutes but has enough depth to satisfy technical assessment criteria. The addition of events management and sponsorship adds bonus dimensions that can elevate the grade if implemented well.

**My recommended build priority for your team of 4:**

| Sprint | Focus | Team Member A | Team Member B | Team Member C | Team Member D |
|--------|-------|---------------|---------------|---------------|---------------|
| 1 | Backend Foundation | Auth System | Events API | QR + Points API | Coupons + Verify API |
| 2 | Backend Polish + Web App | Sponsorship API | Merchant API | Web: Cashier UI | Web: Merchant UI |
| 3 | Mobile App | Auth Screens | Events Screens | QR Scanner | Rewards Screens |
| 4 | Integration + Polish | Profile + Sponsor screens | Admin Web | Testing + Bug Fixes | Deployment + Demo Prep |

**The existing Expo project in D:\c3000c\volunteering-rewards-app\ is a solid starting point** — it has file-based routing, tab navigation, dark/light mode support, and is already connected to GitHub. You're in a good position to begin development.
