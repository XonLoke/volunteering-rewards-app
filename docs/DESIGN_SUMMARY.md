# Volunteering Rewards App — Design Summary

**Team:** 4-person capstone project  
**Date:** April 30, 2026  
**Approach:** Vibe coding with AI development partner  
**Working folder:** D:\capstone

---

## Table of Contents

1. [System Architecture](#1-system-architecture)
2. [Tech Stack](#2-tech-stack)
3. [Database ERD](#3-database-erd)
4. [User Roles + Workflows](#4-user-roles--workflows)
5. [Sponsorship/Referral System](#5-sponsorshipreferral-system)
6. [API Endpoints](#6-api-endpoints)
7. [Security Rules](#7-security-rules)
8. [Build Order (Phased)](#8-build-order-phased)
9. [File Structure](#9-file-structure)
10. [Report Gaps (for later)](#10-report-gaps-for-later)

---

## 1. System Architecture

```
[Mobile App — React Native]         [Web App — React]
   (Volunteer)                        (Cashier/Organizer/Merchant)
        │                                      │
        └──────────────┬───────────────────────┘
                       │ HTTPS + JSON + JWT
                       ▼
              [Backend API — Node.js + Express]
                       │
                       ▼
              [PostgreSQL Database — Single DB]
```

- All three tiers communicate exclusively through the backend API
- Database is never accessed directly by any client
- One single PostgreSQL database (not three separate databases)
- Logical separation via table naming, not separate DB instances

---

## 2. Tech Stack

| Layer | Technology | Why |
|---|---|---|
| Mobile App | React Native | Cross-platform, JS reuse with backend |
| Web App | React | Consistent with React Native skills |
| Backend | Node.js + Express | Fast to prototype, huge ecosystem |
| Database | PostgreSQL | ACID transactions, CHECK/UNIQUE constraints |
| QR Codes | UUID v4 via gen_random_uuid() | Not guessable |
| Authentication | JWT + bcrypt | Stateless, well-understood |
| PIN Generation | crypto.randomInt() | Cryptographically secure |
| Rate Limiting | express-rate-limit | Built-in, no Redis needed |
| Deployment | Render / Railway | Free tier, capstone-appropriate |

---

## 3. Database ERD

The ERD diagram is saved as: **`D:\capstone\erd_diagram.mermaid`**

Open it with any Mermaid-compatible viewer (VS Code with Mermaid extension, or https://mermaid.live)

### Tables Summary

#### Core Tables (Phase 1)

**users** — All user types in one table
| Column | Type | Notes |
|---|---|---|
| id | SERIAL PK | |
| name | VARCHAR(100) | Required |
| email | VARCHAR(150) | UNIQUE, required |
| password_hash | TEXT | bcrypt hashed |
| role | VARCHAR(20) | volunteer, cashier, organizer, merchant, admin |
| points | INTEGER | DEFAULT 0, CHECK >= 0 |
| direct_sponsor_id | INTEGER FK→users | NULLABLE, who sponsored this user |
| parent_sponsor_id | INTEGER FK→users | NULLABLE, who sponsored the direct sponsor |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

**qr_codes** — QR definitions tied to events
| Column | Type | Notes |
|---|---|---|
| id | SERIAL PK | |
| code | UUID | gen_random_uuid(), UNIQUE |
| event_id | INTEGER FK→events | NULLABLE, ties QR to an event |
| location | VARCHAR(255) | e.g. "East Coast Park - Beach Cleanup" |
| points_value | INTEGER | CHECK > 0 |
| expiry_date | TIMESTAMP | QR becomes invalid after this |
| status | VARCHAR(20) | active, inactive, expired |
| created_at | TIMESTAMP | |

**scan_logs** — Tracks every QR scan
| Column | Type | Notes |
|---|---|---|
| id | SERIAL PK | |
| user_id | INTEGER FK→users | |
| qr_id | INTEGER FK→qr_codes | |
| scanned_at | TIMESTAMP | |
| UNIQUE(user_id, qr_id) | Constraint | Prevents double-scoring |

**coupons** — Available rewards
| Column | Type | Notes |
|---|---|---|
| id | SERIAL PK | |
| merchant_id | INTEGER FK→users | NULLABLE, which merchant offers this |
| title | VARCHAR(150) | e.g. "Free Coffee" |
| description | TEXT | |
| points_required | INTEGER | CHECK > 0 |
| quantity | INTEGER | CHECK >= 0, decremented atomically |
| expiry_date | TIMESTAMP | |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

**user_coupons** — Issued redemptions (critical table)
| Column | Type | Notes |
|---|---|---|
| id | SERIAL PK | |
| user_id | INTEGER FK→users | |
| coupon_id | INTEGER FK→coupons | |
| pin | CHAR(6) | UNIQUE, crypto.randomInt generated |
| status | VARCHAR(20) | unused, used, expired |
| verify_attempts | INTEGER | DEFAULT 0, brute force tracking |
| redeemed_at | TIMESTAMP | When cashier verified |
| expiry_date | TIMESTAMP | |
| created_at | TIMESTAMP | |

#### Add-on Tables (Phase 2+)

**events** — Volunteer activities
| Column | Type | Notes |
|---|---|---|
| id | SERIAL PK | |
| organizer_id | INTEGER FK→users | Who created the event |
| title | VARCHAR(200) | |
| description | TEXT | |
| location | VARCHAR(255) | |
| event_date | TIMESTAMP | When it happens |
| capacity | INTEGER | Max participants |
| status | VARCHAR(20) | upcoming, ongoing, completed, cancelled |
| created_at | TIMESTAMP | |

**event_registrations** — Volunteer schedule book
| Column | Type | Notes |
|---|---|---|
| id | SERIAL PK | |
| user_id | INTEGER FK→users | |
| event_id | INTEGER FK→events | |
| status | VARCHAR(20) | confirmed, cancelled, attended |
| created_at | TIMESTAMP | |
| UNIQUE(user_id, event_id) | Constraint | One registration per event per user |

**favorites** — "Like" feature
| Column | Type | Notes |
|---|---|---|
| id | SERIAL PK | |
| user_id | INTEGER FK→users | |
| favorite_type | VARCHAR(20) | event, coupon, activity |
| favorite_id | INTEGER | Polymorphic reference |
| created_at | TIMESTAMP | |
| UNIQUE(user_id, type, id) | Constraint | Prevents duplicate likes |

**sponsorship_points** — Audit trail for referral points
| Column | Type | Notes |
|---|---|---|
| id | SERIAL PK | |
| earned_by_user_id | INTEGER FK→users | Who earned the points |
| source_user_id | INTEGER FK→users | The new recruit that triggered this |
| level | INTEGER | 1 (direct) or 2 (indirect) |
| points_earned | INTEGER | |
| created_at | TIMESTAMP | |

### Entity Relationships

```
users 1────M scan_logs M────1 qr_codes
  │
  │── self-references via direct_sponsor_id, parent_sponsor_id
  │
  │──1────M event_registrations M────1 events
  │──1────M favorites (polymorphic)
  │──1────M user_coupons M────1 coupons
  │──1────M sponsorship_points (as earner or source)
  │──1────M coupons (as merchant)
  │──1────M events (as organizer)
```

---

## 4. User Roles + Workflows

### Volunteer (Mobile App)

**Full flow:**
```
Open App → Register/Login → Dashboard/Home
  │
  ├── Personal Schedule Book
  │     → Browse scheduled activities
  │     → View or cancel registration
  │
  ├── Activities for Volunteers
  │     → Browse available events (with "like" labeling)
  │     → Set reminder for when available
  │     → Register for event → confirms → recorded in schedule
  │
  ├── Participated Program List
  │     → Sort by: program name, organization, location
  │     → Cancel or amend registration
  │     → "Bring friends" option
  │     → 1-day-in-advance reminder service
  │
  ├── Reward List
  │     → Sort by: product/service name, organization, location
  │     → Set as personal target or redeem directly
  │
  ├── Sponsorship
  │     → View Parent Sponsor, Direct Sponsor
  │     → View Direct Sponsorships (count + list)
  │     → View Grandchild Sponsorships (count + list)
  │     → Notes beside sponsor names
  │
  ├── Today's Volunteering Activity
  │     → Click → pop-up QR scanner
  │     → Scan → record participation → points claimed
  │
  └── Reward Redemption
        → View points balance
        → Redeem reward → points deducted
        → Get coupon + 6-digit PIN
        → Go to store → tell cashier PIN
```

### Cashier (Web App)

```
Open Web App → Login → Dashboard
  ├── Today's Event Attendance
  │     → Scan QR code → update attendance
  └── Reward Redemption
        → Enter 6-digit PIN
        → System verifies coupon
        → Valid → approve → give reward
```

### Organizer (Web App)

```
Open Web App → Login → Dashboard
  ├── Events Organization
  │     → Apply to create events for volunteer participation
  │     → Manage event details
  │     → Generate QR codes for events
```

### Merchant (Web App)

```
Open Web App → Login → Dashboard
  └── Reward Administration
        → Add / delete rewards to the showcase
        → Manage reward inventory
```

---

## 5. Sponsorship / Referral System

### The 4 Profile Fields

| # | Field | What It Is |
|---|---|---|
| 1 | Parent Sponsor | The person who sponsored my direct sponsor |
| 2 | Direct Sponsor | The person who sponsored me |
| 3 | My Direct Sponsorships | People I sponsored (clickable list) |
| 4 | My Grandchild Sponsorships | People sponsored by my direct sponsorships (clickable list) |

### Registration Form

```
Upline 1 — Parent Sponsor Email: (optional)
Upline 2 — Direct Sponsor Email: (optional)
Your Email:                       [________]
Password:                         [________]
```

Both upline fields are optional — a user can register without any sponsor.

### Points Allocation (Effort-Based Model)

| Scenario | Direct Sponsor | Helper (Upline) | Both = Total |
|---|---|---|---|
| Direct recruit (own effort) | 10 pts | — | 10 pts |
| Direct recruit (helped by upline) | 4 pts | 6 pts | 10 pts |
| Grandchild recruit (helped by mid) | 4 pts (mid) | 6 pts (helper) | 10 pts |

**Design rationale:** The person who actively puts in the work earns more (6 vs 4). This motivates uplines to help their downlines recruit, making the sponsorship tree dynamic rather than static.

### Database Implementation

Just 2 extra columns on `users`:
```sql
direct_sponsor_id  INTEGER REFERENCES users(id)  -- who sponsored me
parent_sponsor_id  INTEGER REFERENCES users(id)  -- who sponsored my direct sponsor
```

Plus an audit table `sponsorship_points` to track every points-earning event.

---

## 6. API Endpoints

### Authentication
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | /api/auth/register | No | Register new user (with optional sponsor emails) |
| POST | /api/auth/login | No | Login, returns JWT token |
| GET | /api/auth/me | Yes | Get current user profile + points |

### QR Code & Points
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | /api/qr/scan | Yes (Volunteer) | Scan a QR code → earn points |
| GET | /api/qr/history | Yes | View scan history |

### Coupons & Rewards
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | /api/coupons | Yes | List available coupons (with sorting) |
| POST | /api/coupons/redeem | Yes (Volunteer) | Redeem points for a coupon → get PIN |
| GET | /api/coupons/my | Yes | View my redeemed coupons |

### Cashier Verification
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | /api/verify | Yes (Cashier) | Enter 6-digit PIN → validate coupon |

### Sponsorship (Add-on)
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | /api/sponsor/tree | Yes | Get my sponsorship tree |
| GET | /api/sponsor/points | Yes | Get my sponsorship points history |

### Events (Add-on)
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | /api/events | Yes | List available events (with sorting) |
| POST | /api/events | Yes (Organizer) | Create an event |
| POST | /api/events/:id/register | Yes (Volunteer) | Register for an event |
| DELETE | /api/events/:id/register | Yes (Volunteer) | Cancel registration |

---

## 7. Security Rules

### QR Code Rules
- One QR code → usable once per user (UNIQUE constraint on scan_logs)
- QR codes have expiry dates (checked server-side)
- QR codes are tied to a specific event/location
- QR code values use cryptographically random UUIDs
- QR codes have a status field (active/inactive/expired)

### Points Rules
- Points balance cannot go negative (CHECK constraint)
- Points are added only after a valid, non-duplicate scan
- Points deduction + coupon creation = single database transaction
- Sponsorship points have a full audit trail

### Coupon & PIN Rules
- Coupons have expiry dates (checked on redeem AND verify)
- Limited quantity — decremented atomically on each redemption
- PIN: 6-digit, crypto.randomInt(), UNIQUE constraint, one-time use
- PIN verification requires cashier JWT authentication

### Rate Limiting
- Verify endpoint: max 5 attempts per IP per minute
- Scan endpoint: max 10 attempts per IP per minute
- Track failed verification attempts in user_coupons table

---

## 8. Build Order (Phased)

### Phase 1 — Core System (Working demo first)
1. Database schema (all core tables)
2. Auth system (register + login + JWT middleware)
3. QR scan + points engine
4. Coupon redemption + PIN generation
5. Cashier verification endpoint

### Phase 2 — Event Management
6. Events CRUD (organizer)
7. Event listing + registration (volunteer)
8. "Like" / favorites system

### Phase 3 — Sponsorship/Referral
9. Referral fields on registration
10. Points allocation logic
11. Sponsorship tree views

### Phase 4 — Polish
12. 1-day-advance reminders (email via node-cron)
13. Sorting + filtering throughout
14. Mobile app UI polish
15. Deployment

**Key principle:** Each phase is a modular add-on. New features = new files, not edits to existing working code.

---

## 9. File Structure

```
D:\capstone\
│
├── backend/                     # Node.js + Express API
│   ├── package.json
│   ├── .env
│   ├── .gitignore
│   ├── db/
│   │   ├── schema.sql           # Full database schema
│   │   ├── seed.sql             # Sample data
│   │   └── migrate.js           # Schema runner
│   ├── src/
│   │   ├── server.js
│   │   ├── app.js
│   │   ├── config/database.js
│   │   ├── middleware/          # auth, rateLimiter, errorHandler
│   │   ├── routes/              # auth, qr, coupon, verify, event, sponsor
│   │   ├── controllers/         # one per route group
│   │   ├── services/            # pointsService, couponService, sponsorService
│   │   └── utils/               # generatePIN, generateToken
│   └── tests/                   # API test files
│
├── mobile/                      # React Native (Volunteer)
│   ├── package.json
│   ├── App.js
│   └── src/
│       ├── navigation/
│       ├── screens/             # Login, Register, Home, Scan, Rewards, etc.
│       ├── components/          # QRScanner, CouponCard
│       ├── context/             # AuthContext
│       └── services/api.js
│
└── web/                         # React (Cashier/Organizer/Merchant)
    ├── package.json
    ├── App.js
    └── src/
        ├── pages/               # Login, VerifyCoupon, EventMgmt, RewardAdmin
        ├── components/
        └── services/api.js
```

---

## 10. Report Gaps (For Later)

The current v2 report is missing these sections required by the C300 template:

| Missing Section | Notes |
|---|---|
| Acknowledgements | To be written |
| Abstract | ~200-300 word summary |
| Introduction | Problem statement, motivation, scope |
| Business Issues | Current volunteerism challenges in SG |
| Market Analysis | Competitors, target users |
| Business Solutions | Why our app solves the problem |
| User Documentation | Screenshots + guides |
| Technical Documentation | Installation guide |
| Conclusions | Lessons learned, future work |
| References | Citations |
| Appendices | Extra supporting material |
| Project Poster | Capstone poster |

These will be drafted after the technical implementation is complete.

---

*End of design summary. Last updated: April 30, 2026*
