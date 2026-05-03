# Volunteering Rewards App — Revised Full System Analysis

**Based on detailed workflow analysis by the project team**  
**Date:** May 3, 2026

---

## KEY CHANGES FROM ORIGINAL DESIGN

| Aspect | Original Design | New Design (Your Workflow) |
|--------|----------------|---------------------------|
| **QR Scan direction** | Volunteer scans event QR code | Organizer/Cashier scans **Volunteer's QR code** |
| **Volunteer identity** | Regular account | Each volunteer has a unique QR identity |
| **Social feature** | Not present | **V-Social platform** — post photos + notes from past events |
| **Recognition** | Not present | **Hall-of-Fame** leaderboard for top volunteers |
| **Organizations** | Simple event creation | Organization registration **with official approval documents** |
| **Campaigns** | Individual events only | **Campaigns** as umbrella framework containing multiple events |
| **Reward-Store** | Simple coupon list | Full **Reward-Store** where merchants upload/publish rewards |
| **Redemption QR** | PIN only | Cashier scans **volunteer's QR** + enters PIN |
| **Check-in** | Not present | Volunteers **check-in** at event location |
| **Schedule notes** | Not present | Write notes at online schedule book |
| **Event feedback/Q&A** | Not present | Post feedback, search Q&A |
| **Merchant sponsorship** | Not present | Merchants can **sponsor events** (PR program) |
| **Advertising** | Not present | Merchants can apply for **in-app advertising** |
| **Fraud monitoring** | Basic rate limiting | Dedicated admin fraud monitoring |

---

## (1) ALL PARTIES USING THE SYSTEM

| # | Party | Description | Access |
|---|-------|-------------|--------|
| **P1** | **Volunteer** | Registers via mobile app, browses/selects volunteering events, checks in at events, gets QR scanned by organizer to earn points, redeems rewards at stores, posts on V-Social, builds referral network | Mobile App |
| **P2** | **Organizer** (Campaign/Event Organization) | Registers organization with official documents, creates campaigns/events, manages scheduling, takes attendance via mobile app, scans volunteer QR codes after event completion | Mobile App + Web App |
| **P3** | **Merchant** | Registers as participating merchant, uploads reward info to Reward-Store, manages listings, sponsors events, applies for advertising | Web App |
| **P4** | **Cashier** | Staff at merchant outlet, scans volunteer's QR code, verifies 6-digit PIN, issues rewards | Web App |
| **P5** | **Admin** (Database Controller) | Manages all databases (users, merchants, rewards, QR codes, campaigns), monitors fraud/usage | Web App |

---

## (2) COMPLETE WORKFLOWS

### (A) VOLUNTEER — Mobile App

```
═══════════════════════════════════════════════════════════════════════
                    VOLUNTEER FULL JOURNEY
═══════════════════════════════════════════════════════════════════════

▶ STAGE 1: REGISTRATION
───────────────────────────────────────────────────────────────────────

  START
    │
    ▼
  [Download App] from Google Play / Apple App Store
    │
    ▼
  [Register Account]
    ├── Enter: Name, Email, Password, Phone
    ├── Optional: Enter Sponsor Email (referral)
    └── System generates unique Volunteer QR Code
    │
    ▼
  [Visit Volunteering Event "Store"]
    ├── Browse available campaigns & events
    ├── Filter/Sort by: date, location, organization, category
    ├── View event details (description, date, location, points)
    └── "Like" / bookmark events of interest
    │
    ▼
  [Select Event for Participation]
    ├── Register for event
    └── Event added to personal schedule book
    │
    ▼
  [Edit Selected Events]
    ├── View registered events in schedule book
    ├── Add events
    ├── Delete / Cancel registration
    ├── Post feedback on completed events
    └── Search Q&A for events
    │
    ▼
  [Online Schedule Book]
    ├── View calendar of registered events
    ├── Write personal notes for each event
    └── Set reminders (alarm before and on scheduled dates)
    │
    ▼
  [V-Social Platform] ← Optional Add-on
    ├── Post photos from past events
    ├── Write notes/experiences
    └── Interact with other volunteers


▶ STAGE 2: PARTICIPATION
───────────────────────────────────────────────────────────────────────

  [Scheduler Alarm]
    ├── Reminder before event date
    └── Reminder on event day
    │
    ▼
  [Check Event Location]
    ├── View event location on map
    └── Get directions
    │
    ▼
  [Reach Location & Check-In]
    ├── Volunteer checks in at event venue
    └── Attendance recorded


▶ STAGE 3: AFTER COMPLETING VOLUNTEERING TASK
───────────────────────────────────────────────────────────────────────

  [Organizer Scans Volunteer's QR Code]
    ├── Organizer uses mobile app camera
    ├── Scans volunteer's unique QR code
    ├── System validates attendance
    └── Points awarded to volunteer account
    │
    ▼
  [Points Updated]
    ├── See points earned notification
    └── Balance updated in profile


▶ STAGE 4: REDEMPTION
───────────────────────────────────────────────────────────────────────

  [Browse Reward-Store]
    ├── View available rewards from merchants
    ├── Sort by: name, merchant, points required, location
    └── "Like" rewards
    │
    ▼
  [Choose Redemption Method]
    │
    ├──► ONLINE REDEMPTION
    │     ├── Select reward in app
    │     ├── Redeem points
    │     ├── Receive digital coupon with 6-digit PIN
    │     └── Show PIN at store
    │
    └──► IN-STORE REDEMPTION
          ├── Visit the merchant store
          ├── Cashier scans volunteer's QR code
          ├── Cashier enters PIN
          └── Reward issued


═══════════════════════════════════════════════════════════════════════
OPTIONAL ADD-ONS:
═══════════════════════════════════════════════════════════════════════

▶ V-SOCIAL PLATFORM (Pull Strategy for Recruitment)
    ├── Social feed of volunteer experiences
    ├── Photo sharing from past events
    ├── Like and comment on posts
    └── Share events to invite friends

▶ SPONSORSHIP / REFERRAL SYSTEM (Push Strategy for Recruitment)
    ├── Invite friends via referral link
    ├── Earn points for direct referrals
    ├── Earn points for grandchild referrals
    └── View sponsorship tree

▶ HALL-OF-FAME BILLBOARD
    ├── Most active volunteers leaderboard
    ├── Most referrals leaderboard
    ├── National rewards for top volunteers
    └── Monthly/seasonal rankings
```

---

### (B) MERCHANTS / CASHIERS — Web App

```
═══════════════════════════════════════════════════════════════════════
                    MERCHANT & CASHIER JOURNEY
═══════════════════════════════════════════════════════════════════════

▶ STAGE 1: MERCHANT REGISTRATION
───────────────────────────────────────────────────────────────────────

  START
    │
    ▼
  [Visit Website & Register as Merchant]
    ├── Enter: Business name, UEN, contact info
    ├── Enter: Person-in-charge details
    └── Account created (pending admin approval)
    │
    ▼
  [Visit Reward-Store Dashboard]
    ├── View current reward listings
    ├── Upload new reward info
    │     ├── Title, description, image
    │     ├── Points required for redemption
    │     ├── Quantity available
    │     └── Expiry date
    ├── Edit uploaded rewards (delete, add, amend)
    └── Publish reward to Reward-Store (goes live)


▶ STAGE 2: REDEMPTION (Cashier)
───────────────────────────────────────────────────────────────────────

  [Volunteer Visits Store]
    │
    ▼
  [Cashier Opens Verification Screen]
    │
    ▼
  [Scan Volunteer's QR Code]
    ├── Volunteer shows their unique QR code in app
    ├── Cashier scans via webcam or QR scanner
    └── System identifies the volunteer
    │
    ▼
  [Enter 6-digit PIN]
    ├── Volunteer provides the PIN from their coupon
    ├── Cashier enters PIN into system
    └── System validates:
          ├── PIN exists?
          ├── Coupon unused?
          ├── Not expired?
          └── Belongs to this volunteer?
    │
    ├──► VALID
    │     ├── Mark coupon as used
    │     ├── Record timestamp
    │     └── Issue reward to volunteer
    │
    └──► INVALID
          ├── Show error message
          └── Log failed attempt
    │
    ▼
  [Reward-Store Updated]
    └── Redemption recorded in system


═══════════════════════════════════════════════════════════════════════
OPTIONAL ADD-ONS:
═══════════════════════════════════════════════════════════════════════

▶ MERCHANT SPONSORSHIP FOR EVENTS (Merchant PR Program)
    ├── Browse available campaigns/events
    ├── Select event to sponsor
    ├── Set sponsorship amount/type
    └── Logo displayed on event page

▶ ADVERTISING / PROMOTION APPLICATION (Merchant's Incentive)
    ├── Apply for in-app advertising space
    ├── Set budget and duration
    └── Ads shown to volunteers in app
```

---

### (C) CAMPAIGNS / EVENTS ORGANIZATION — Mobile App + Web App

```
═══════════════════════════════════════════════════════════════════════
                    ORGANIZER JOURNEY
═══════════════════════════════════════════════════════════════════════

▶ STAGE 1: REGISTRATION (Web App)
───────────────────────────────────────────────────────────────────────

  START
    │
    ▼
  [Visit Website & Register Organization]
    ├── Enter organization details
    ├── Upload official approval documents
    │     (e.g., ROS registration, ACRA, etc.)
    └── Submit for admin approval
    │
    ▼
  [Organization Approved by Admin]
    │
    ▼
  [Input Campaign / Event Information]
    ├── Create Campaign (umbrella)
    │     ├── Campaign name, description
    │     ├── Date range
    │     └── Goals / objectives
    │
    ├── Create Events under Campaign
    │     ├── Event title, description
    │     ├── Date, time, location
    │     ├── Capacity
    │     ├── Points value
    │     └── Person-in-charge assignment
    │
    ├── Edit Campaigns / Events
    │     ├── Delete
    │     ├── Add new
    │     └── Amendment
    │
    └── Publish to Volunteering Event "Store"


▶ STAGE 2: ON-SITE CONTROL (Mobile App)
───────────────────────────────────────────────────────────────────────

  [On Event Day]
    │
    ▼
  [Person-in-Charge Opens Mobile App]
    │
    ▼
  [Take Attendance]
    ├── View list of registered volunteers
    ├── Mark attendance as volunteers check in
    ├── Manual check-in option
    └── Attendance report generated
    │
    ▼
  [After Event Completed]
    │
    ▼
  [Scan Volunteer's QR Code]
    ├── Each volunteer shows their unique QR
    ├── Organizer scans via mobile app camera
    ├── System validates:
    │     ├── Volunteer was registered for this event
    │     ├── Volunteer checked in
    │     └── Not already scanned (prevents double-scoring)
    ├── Points awarded to volunteer
    └── Confirmation displayed


═══════════════════════════════════════════════════════════════════════
OPTIONAL ADD-ON:
═══════════════════════════════════════════════════════════════════════

▶ STATISTIC CHARTS
    ├── Volunteer participation rates
    ├── Event popularity
    ├── Points distribution
    └── Campaign performance reports
```

---

### (D) DATABASE CONTROLLER (Admin) — Web App

```
═══════════════════════════════════════════════════════════════════════
                    ADMIN JOURNEY
═══════════════════════════════════════════════════════════════════════

  START
    │
    ▼
  [Login to Admin Dashboard]
    │
    ▼
  [Manage Databases]
    ├── Users: View, approve, suspend all accounts
    ├── Merchants: Approve/reject merchant registrations
    ├── Organizations: Review & approve registration documents
    ├── Rewards: Oversee Reward-Store listings
    ├── QR Codes: Monitor all QR code activity
    └── Campaigns: Oversee all campaigns and events
    │
    ▼
  [Monitor Fraud / Usage]
    ├── Review failed PIN attempts
    ├── Detect unusual scan patterns
    ├── Monitor duplicate registrations
    ├── Flag suspicious activity
    └── Generate fraud reports
    │
    ▼
  [System Configuration]
    ├── Default points values
    ├── Rate limiting thresholds
    └── Hall-of-Fame settings
```

---

## (3) DATABASE TABLES

### WORKFLOW A: AUTHENTICATION & USER MANAGEMENT

#### Table 1: roles

```
roles
├── id              : SERIAL (PK)
├── role_name       : VARCHAR(50) UNIQUE NOT NULL
│                    Values: 'Volunteer', 'Organizer', 'Merchant', 'Cashier', 'Admin'
├── description     : TEXT
└── created_at      : TIMESTAMP
```

#### Table 2: users

```
users
├── id                    : SERIAL (PK)
├── name                  : VARCHAR(100) NOT NULL
├── email                 : VARCHAR(150) UNIQUE NOT NULL
├── password_hash         : TEXT NOT NULL
├── phone                 : VARCHAR(20)
├── role_id               : INTEGER (FK → roles.id) NOT NULL
├── points                : INTEGER DEFAULT 0 (CHECK >= 0)
├── volunteer_qr_code     : VARCHAR(255) UNIQUE (Generated UUID for volunteer's unique QR identity)
├── status                : VARCHAR(20) DEFAULT 'active'
│                          Values: 'active', 'suspended', 'pending_approval', 'inactive'
│
├── SPONSORSHIP FIELDS:
│   ├── direct_sponsor_id    : INTEGER (FK → users.id, NULLABLE)
│   │                        Who sponsored me
│   ├── parent_sponsor_id    : INTEGER (FK → users.id, NULLABLE)
│   │                        Who sponsored my direct sponsor
│   ├── direct_sponsorship_count : INTEGER (COMPUTED)
│   │                          SELECT COUNT(*) FROM users WHERE direct_sponsor_id = my_id
│   └── grandchild_sponsorship_count : INTEGER (COMPUTED)
│                              SELECT COUNT(*) FROM users 
│                              WHERE direct_sponsor_id IN 
│                              (SELECT id FROM users WHERE direct_sponsor_id = my_id)
│
├── profile_image_url  : VARCHAR(500)
├── created_at         : TIMESTAMP
└── updated_at         : TIMESTAMP
```

#### Table 3: organizations (for Event Organizers)

```
organizations
├── id                    : SERIAL (PK)
├── org_name              : VARCHAR(200) NOT NULL
├── org_type              : VARCHAR(50) (e.g., 'Charity', 'Community Group', 'Government')
├── uen                   : VARCHAR(50) (Unique Entity Number for Singapore)
├── address               : TEXT
├── contact_person        : VARCHAR(100)
├── contact_email         : VARCHAR(150)
├── contact_phone         : VARCHAR(20)
├── approval_document_url : VARCHAR(500) (Uploaded official documents for verification)
├── approval_status       : VARCHAR(20) DEFAULT 'pending'
│                          Values: 'pending', 'approved', 'rejected'
├── approved_by           : INTEGER (FK → users.id, NULLABLE — admin who approved)
├── approved_at           : TIMESTAMP
├── status                : VARCHAR(20) DEFAULT 'active'
│                          Values: 'active', 'inactive', 'suspended'
├── created_at            : TIMESTAMP
└── updated_at            : TIMESTAMP
```

---

### WORKFLOW B: CAMPAIGNS, EVENTS & QR SCANNING

#### Table 4: campaigns

Umbrella framework that groups multiple related events together.

```
campaigns
├── id                : SERIAL (PK)
├── organization_id   : INTEGER (FK → organizations.id) NOT NULL
├── title             : VARCHAR(200) NOT NULL
├── description       : TEXT
├── start_date        : TIMESTAMP
├── end_date          : TIMESTAMP
├── goals             : TEXT (campaign objectives)
├── status            : VARCHAR(20) DEFAULT 'active'
│                     Values: 'active', 'completed', 'cancelled'
├── banner_image_url  : VARCHAR(500)
├── created_at        : TIMESTAMP
└── updated_at        : TIMESTAMP
```

#### Table 5: events

Individual volunteering activities under campaigns.

```
events
├── id                : SERIAL (PK)
├── campaign_id       : INTEGER (FK → campaigns.id, NULLABLE)
├── organizer_id      : INTEGER (FK → users.id) NOT NULL (person-in-charge)
├── title             : VARCHAR(200) NOT NULL
├── description       : TEXT
├── location          : VARCHAR(255)
├── latitude          : DECIMAL(10,8) (for map display)
├── longitude         : DECIMAL(11,8)
├── event_date        : TIMESTAMP NOT NULL
├── duration_hours    : DECIMAL(4,1)
├── capacity          : INTEGER
├── points_value      : INTEGER NOT NULL (CHECK > 0)
├── status            : VARCHAR(20) DEFAULT 'upcoming'
│                     Values: 'upcoming', 'ongoing', 'completed', 'cancelled'
├── image_url         : VARCHAR(500)
├── category          : VARCHAR(100) (e.g., 'Environment', 'Elderly', 'Youth', 'Community')
├── created_at        : TIMESTAMP
└── updated_at        : TIMESTAMP
```

#### Table 6: event_registrations (Schedule Book)

```
event_registrations
├── id                : SERIAL (PK)
├── user_id           : INTEGER (FK → users.id) NOT NULL
├── event_id          : INTEGER (FK → events.id) NOT NULL
├── status            : VARCHAR(20) DEFAULT 'confirmed'
│                     Values: 'confirmed', 'cancelled', 'attended', 'no_show'
├── check_in_time     : TIMESTAMP (NULLABLE — when volunteer checked in at venue)
├── check_in_method   : VARCHAR(20) (NULLABLE — 'manual', 'organizer_scanned')
├── notes             : TEXT (volunteer's personal notes for this event in schedule book)
├── reminder_sent     : BOOLEAN DEFAULT FALSE
├── registered_at     : TIMESTAMP DEFAULT CURRENT_TIMESTAMP
│
└── CONSTRAINT        : UNIQUE(user_id, event_id)
```

#### Table 7: attendance_logs

Detailed tracking of check-in and QR scanning for points.

```
attendance_logs
├── id                : SERIAL (PK)
├── event_id          : INTEGER (FK → events.id) NOT NULL
├── user_id           : INTEGER (FK → users.id) NOT NULL
├── scanned_by        : INTEGER (FK → users.id) NOT NULL (organizer who scanned)
├── scan_type         : VARCHAR(20) NOT NULL
│                     Values: 'check_in', 'points_award'
├── qr_code_value     : VARCHAR(255) (the QR code value that was scanned)
├── points_awarded    : INTEGER DEFAULT 0
├── scanned_at        : TIMESTAMP DEFAULT CURRENT_TIMESTAMP
│
└── CONSTRAINT        : UNIQUE(event_id, user_id, scan_type)
```

#### Table 8: event_feedback

Volunteer feedback on completed events.

```
event_feedback
├── id                : SERIAL (PK)
├── user_id           : INTEGER (FK → users.id) NOT NULL
├── event_id          : INTEGER (FK → events.id) NOT NULL
├── rating            : INTEGER (CHECK 1-5)
├── comment           : TEXT
├── created_at        : TIMESTAMP DEFAULT CURRENT_TIMESTAMP
│
└── CONSTRAINT        : UNIQUE(user_id, event_id)
```

#### Table 9: event_qna

Q&A section for events (searchable).

```
event_qna
├── id                : SERIAL (PK)
├── event_id          : INTEGER (FK → events.id) NOT NULL
├── question_by       : INTEGER (FK → users.id) NOT NULL
├── question          : TEXT NOT NULL
├── answer_by         : INTEGER (FK → users.id, NULLABLE)
├── answer            : TEXT (NULLABLE)
├── is_published      : BOOLEAN DEFAULT TRUE
├── created_at        : TIMESTAMP
└── updated_at        : TIMESTAMP
```

#### Table 10: favorites

```
favorites
├── id                : SERIAL (PK)
├── user_id           : INTEGER (FK → users.id) NOT NULL
├── item_type         : VARCHAR(20) NOT NULL
│                     Values: 'event', 'coupon', 'campaign'
├── item_id           : INTEGER NOT NULL
├── created_at        : TIMESTAMP DEFAULT CURRENT_TIMESTAMP
│
└── CONSTRAINT        : UNIQUE(user_id, item_type, item_id)
```

---

### WORKFLOW C: REWARD-STORE & COUPON MANAGEMENT

#### Table 11: coupons (Reward-Store items)

```
coupons
├── id                : SERIAL (PK)
├── merchant_id       : INTEGER (FK → users.id) NOT NULL
├── title             : VARCHAR(150) NOT NULL
├── description       : TEXT
├── image_url         : VARCHAR(500)
├── points_required   : INTEGER NOT NULL (CHECK > 0)
├── quantity          : INTEGER NOT NULL (CHECK >= 0)
├── expiry_date       : TIMESTAMP
├── status            : VARCHAR(20) DEFAULT 'draft'
│                     Values: 'draft', 'published', 'inactive'
├── published_at      : TIMESTAMP (NULLABLE — when merchant published it)
├── created_at        : TIMESTAMP
└── updated_at        : TIMESTAMP
```

#### Table 12: user_coupons

```
user_coupons
├── id                : SERIAL (PK)
├── user_id           : INTEGER (FK → users.id) NOT NULL
├── coupon_id         : INTEGER (FK → coupons.id) NOT NULL
├── pin               : CHAR(6) UNIQUE NOT NULL (crypto.randomInt)
├── qr_code           : VARCHAR(255) UNIQUE (UUID for coupon QR — shown on volunteer's phone)
├── status            : VARCHAR(20) DEFAULT 'unused'
│                     Values: 'unused', 'used', 'expired'
├── verify_attempts   : INTEGER DEFAULT 0
├── redeemed_at       : TIMESTAMP (NULLABLE)
├── redeemed_by       : INTEGER (FK → users.id, NULLABLE — cashier who verified)
├── expiry_date       : TIMESTAMP
├── created_at        : TIMESTAMP
│
└── CONSTRAINT        : UNIQUE(pin)
```

#### Table 13: redemption_logs

```
redemption_logs
├── id                : SERIAL (PK)
├── user_coupon_id    : INTEGER (FK → user_coupons.id) NOT NULL
├── cashier_id        : INTEGER (FK → users.id) NOT NULL
├── volunteer_id      : INTEGER (FK → users.id) NOT NULL
├── qr_scanned        : VARCHAR(255) (volunteer's QR that was scanned)
├── attempt_status    : VARCHAR(20) NOT NULL
│                     Values: 'success', 'failed_pin', 'failed_expired', 'failed_used'
├── ip_address        : VARCHAR(45)
├── attempted_at      : TIMESTAMP DEFAULT CURRENT_TIMESTAMP
└── created_at        : TIMESTAMP
```

---

### WORKFLOW D: SPONSORSHIP / REFERRAL

#### Table 14: sponsorship_points

```
sponsorship_points
├── id                    : SERIAL (PK)
├── earned_by_user_id     : INTEGER (FK → users.id) NOT NULL
├── source_user_id        : INTEGER (FK → users.id) NOT NULL
├── level                 : INTEGER NOT NULL (CHECK IN (1,2))
│                         1 = direct, 2 = grandchild
├── points_earned         : INTEGER NOT NULL
├── description           : VARCHAR(255)
└── created_at            : TIMESTAMP
```

---

### WORKFLOW E: SOCIAL PLATFORM & RECOGNITION (Optional Add-ons)

#### Table 15: social_posts (V-Social Platform)

```
social_posts
├── id                : SERIAL (PK)
├── user_id           : INTEGER (FK → users.id) NOT NULL
├── event_id          : INTEGER (FK → events.id, NULLABLE)
├── content           : TEXT NOT NULL
├── image_urls        : TEXT (JSON array of image URLs)
├── likes_count       : INTEGER DEFAULT 0
├── comments_count    : INTEGER DEFAULT 0
├── status            : VARCHAR(20) DEFAULT 'published'
│                     Values: 'published', 'hidden', 'reported'
├── created_at        : TIMESTAMP
└── updated_at        : TIMESTAMP
```

#### Table 16: social_comments

```
social_comments
├── id                : SERIAL (PK)
├── post_id           : INTEGER (FK → social_posts.id) NOT NULL
├── user_id           : INTEGER (FK → users.id) NOT NULL
├── content           : TEXT NOT NULL
├── created_at        : TIMESTAMP
└── updated_at        : TIMESTAMP
```

#### Table 17: hall_of_fame

```
hall_of_fame
├── id                : SERIAL (PK)
├── user_id           : INTEGER (FK → users.id) NOT NULL
├── category          : VARCHAR(50) NOT NULL
│                     Values: 'most_active', 'most_referrals', 'most_points'
├── rank              : INTEGER NOT NULL
├── period_start      : DATE
├── period_end        : DATE
├── score             : INTEGER (the metric value)
├── national_reward   : VARCHAR(255) (NULLABLE)
└── updated_at        : TIMESTAMP
```

---

### WORKFLOW F: MERCHANT SPONSORSHIP & ADVERTISING (Optional Add-ons)

#### Table 18: merchant_sponsorships

```
merchant_sponsorships
├── id                : SERIAL (PK)
├── merchant_id       : INTEGER (FK → users.id) NOT NULL
├── event_id          : INTEGER (FK → events.id, NULLABLE)
├── campaign_id       : INTEGER (FK → campaigns.id, NULLABLE)
├── sponsorship_type  : VARCHAR(50) (e.g., 'financial', 'in_kind', 'reward_provision')
├── amount            : DECIMAL(10,2)
├── status            : VARCHAR(20) DEFAULT 'active'
│                     Values: 'active', 'completed', 'cancelled'
├── created_at        : TIMESTAMP
└── updated_at        : TIMESTAMP
```

#### Table 19: advertising_applications

```
advertising_applications
├── id                : SERIAL (PK)
├── merchant_id       : INTEGER (FK → users.id) NOT NULL
├── ad_title          : VARCHAR(200) NOT NULL
├── ad_image_url      : VARCHAR(500)
├── ad_target_url     : VARCHAR(500)
├── budget            : DECIMAL(10,2)
├── duration_days     : INTEGER
├── status            : VARCHAR(20) DEFAULT 'pending'
│                     Values: 'pending', 'approved', 'active', 'rejected', 'completed'
├── admin_notes       : TEXT
├── created_at        : TIMESTAMP
└── updated_at        : TIMESTAMP
```

---

### TABLE LIST SUMMARY

```
DATABASE: volunteering_rewards_app
│
├── WORKFLOW A: AUTH & USER MANAGEMENT
│   ├── 1. roles
│   ├── 2. users
│   └── 3. organizations
│
├── WORKFLOW B: CAMPAIGNS, EVENTS & QR
│   ├──  4. campaigns
│   ├──  5. events
│   ├──  6. event_registrations
│   ├──  7. attendance_logs
│   ├──  8. event_feedback
│   ├──  9. event_qna
│   └── 10. favorites
│
├── WORKFLOW C: REWARD-STORE & COUPONS
│   ├── 11. coupons
│   ├── 12. user_coupons
│   └── 13. redemption_logs
│
├── WORKFLOW D: SPONSORSHIP
│   └── 14. sponsorship_points
│
├── WORKFLOW E: SOCIAL & RECOGNITION (Add-on)
│   ├── 15. social_posts
│   ├── 16. social_comments
│   └── 17. hall_of_fame
│
└── WORKFLOW F: MERCHANT PROGRAMS (Add-on)
    ├── 18. merchant_sponsorships
    └── 19. advertising_applications
```

---

## (4) API ENDPOINTS

### WORKFLOW A: AUTH & USER MANAGEMENT

| Method | Endpoint | Auth | Description | Party |
|--------|----------|------|-------------|-------|
| POST | `/api/auth/register` | None | Register new user (name, email, password, optional sponsor) | P1–P4 |
| POST | `/api/auth/login` | None | Login, returns JWT token | P1–P5 |
| GET | `/api/auth/me` | JWT | Get current user profile + QR code | P1–P5 |
| PUT | `/api/auth/profile` | JWT | Update profile info | P1–P5 |
| GET | `/api/auth/my-qr` | JWT | Get my unique volunteer QR code | P1 |
| POST | `/api/auth/logout` | JWT | Invalidate session | P1–P5 |

### WORKFLOW B: CAMPAIGNS, EVENTS & QR

| Method | Endpoint | Auth | Description | Party |
|--------|----------|------|-------------|-------|
| GET | `/api/campaigns` | JWT | List campaigns | P1, P2 |
| POST | `/api/campaigns` | JWT(P2) | Create campaign | P2 |
| PUT | `/api/campaigns/:id` | JWT(P2) | Edit campaign | P2 |
| GET | `/api/events` | JWT | List events (with sort/filter) | P1, P2 |
| POST | `/api/events` | JWT(P2) | Create event | P2 |
| PUT | `/api/events/:id` | JWT(P2) | Edit event | P2 |
| DELETE | `/api/events/:id` | JWT(P2) | Cancel event | P2 |
| GET | `/api/events/:id` | JWT | Get event details | P1, P2 |
| POST | `/api/events/:id/register` | JWT(P1) | Register for event | P1 |
| DELETE | `/api/events/:id/register` | JWT(P1) | Cancel registration | P1 |
| GET | `/api/events/mine` | JWT(P1) | My registered events (schedule) | P1 |
| GET | `/api/events/history` | JWT(P1) | My past events | P1 |
| POST | `/api/events/:id/check-in` | JWT(P1) | Volunteer checks in at event | P1 |
| POST | `/api/events/:id/scan-volunteer` | JWT(P2) | Organizer scans volunteer's QR → award points | P2 |
| GET | `/api/events/:id/attendance` | JWT(P2) | View attendance report | P2 |
| POST | `/api/events/:id/feedback` | JWT(P1) | Submit event feedback | P1 |
| GET | `/api/events/:id/qna` | JWT | View event Q&A | P1, P2 |
| POST | `/api/events/:id/qna` | JWT(P1) | Ask a question | P1 |
| PUT | `/api/qna/:id/answer` | JWT(P2) | Answer a question | P2 |
| GET | `/api/favorites` | JWT | List my favorites | P1 |
| POST | `/api/favorites` | JWT | Add favorite | P1 |
| DELETE | `/api/favorites/:id` | JWT | Remove favorite | P1 |
| PUT | `/api/registrations/:id/notes` | JWT(P1) | Update schedule book notes | P1 |

### WORKFLOW C: REWARD-STORE & COUPONS

| Method | Endpoint | Auth | Description | Party |
|--------|----------|------|-------------|-------|
| GET | `/api/coupons` | JWT | List published rewards (Reward-Store) | P1, P3 |
| POST | `/api/coupons` | JWT(P3) | Add reward (draft) | P3 |
| PUT | `/api/coupons/:id` | JWT(P3) | Edit reward | P3 |
| DELETE | `/api/coupons/:id` | JWT(P3) | Delete reward | P3 |
| PUT | `/api/coupons/:id/publish` | JWT(P3) | Publish reward to Reward-Store | P3 |
| GET | `/api/coupons/my` | JWT(P3) | My merchant's reward listings | P3 |
| POST | `/api/coupons/redeem` | JWT(P1) | Redeem points → get coupon + PIN + QR | P1 |
| GET | `/api/coupons/my-coupons` | JWT(P1) | My redeemed coupons with PINs | P1 |
| POST | `/api/verify` | JWT(P4) | Cashier: scan volunteer QR + enter PIN → verify | P4 |
| GET | `/api/merchant/redemptions` | JWT(P3) | Redemption history for my store | P3 |
| GET | `/api/merchant/stats` | JWT(P3) | Redemption statistics | P3 |
| GET | `/api/coupons/:id/qr` | JWT(P1) | Get coupon QR code for in-store scan | P1 |

### WORKFLOW D: SPONSORSHIP

| Method | Endpoint | Auth | Description | Party |
|--------|----------|------|-------------|-------|
| GET | `/api/sponsor/tree` | JWT | My sponsorship tree | P1 |
| GET | `/api/sponsor/points` | JWT | Points from referrals | P1 |
| POST | `/api/sponsor/invite` | JWT(P1) | Generate referral link/code | P1 |

### WORKFLOW E: SOCIAL & RECOGNITION

| Method | Endpoint | Auth | Description | Party |
|--------|----------|------|-------------|-------|
| GET | `/api/social/posts` | JWT | V-Social feed | P1 |
| POST | `/api/social/posts` | JWT(P1) | Create post (photos + notes) | P1 |
| PUT | `/api/social/posts/:id` | JWT(P1) | Edit my post | P1 |
| DELETE | `/api/social/posts/:id` | JWT(P1) | Delete my post | P1 |
| POST | `/api/social/posts/:id/like` | JWT | Like/unlike post | P1 |
| GET | `/api/social/posts/:id/comments` | JWT | View comments | P1 |
| POST | `/api/social/posts/:id/comments` | JWT | Add comment | P1 |
| GET | `/api/hall-of-fame` | JWT | View leaderboards | P1 |

### WORKFLOW F: MERCHANT PROGRAMS

| Method | Endpoint | Auth | Description | Party |
|--------|----------|------|-------------|-------|
| GET | `/api/sponsorships/available` | JWT | View events available for sponsorship | P3 |
| POST | `/api/sponsorships` | JWT(P3) | Sponsor an event | P3 |
| GET | `/api/sponsorships/my` | JWT(P3) | My sponsorships | P3 |
| POST | `/api/advertising` | JWT(P3) | Apply for advertising | P3 |
| GET | `/api/advertising/my` | JWT(P3) | My ad applications | P3 |

### WORKFLOW G: ADMIN

| Method | Endpoint | Auth | Description | Party |
|--------|----------|------|-------------|-------|
| GET | `/api/admin/users` | JWT(P5) | List all users | P5 |
| PUT | `/api/admin/users/:id/status` | JWT(P5) | Approve/suspend user | P5 |
| GET | `/api/admin/organizations` | JWT(P5) | List organization registrations | P5 |
| PUT | `/api/admin/organizations/:id/approve` | JWT(P5) | Approve/reject organization | P5 |
| GET | `/api/admin/stats` | JWT(P5) | System statistics | P5 |
| GET | `/api/admin/fraud-alerts` | JWT(P5) | View fraud alerts | P5 |

---

## (5) SYSTEM ARCHITECTURE

```
┌─────────────────────────────────────────────────────────────────────┐
│                        SYSTEM ARCHITECTURE                          │
└─────────────────────────────────────────────────────────────────────┘

                     ┌──────────────────────────┐
                     │     MOBILE APP           │
                     │   (Expo React Native)     │
                     │                          │
                     │  P1: Volunteer App        │
                     │  P2: Organizer App         │
                     │                          │
                     │  Screens:                │
                     │  ├── Auth (Register/Login)│
                     │  ├── Event "Store" Browse │
                     │  ├── QR Scan (Organizer)  │
                     │  ├── My QR (Volunteer)    │
                     │  ├── Schedule Book        │
                     │  ├── Reward-Store         │
                     │  ├── V-Social Feed        │
                     │  └── Sponsorship Tree     │
                     └──────────┬───────────────┘
                                │
                                │ HTTPS + JSON + JWT
                                ▼
                     ┌──────────────────────────┐
                     │    BACKEND API SERVER      │
                     │   Node.js + Express.js     │
                     │                          │
                     │  ┌──── MIDDLEWARE ──────┐ │
                     │  │ JWT Auth | Rate Limit │ │
                     │  │ Error Handler | Logs │ │
                     │  └──────────────────────┘ │
                     │                          │
                     │  ┌── ROUTE MODULES ────┐ │
                     │  │ Auth | Events | QR  │ │
                     │  │ Coupons | Verify    │ │
                     │  │ Social | Sponsor    │ │
                     │  │ Admin | Ads         │ │
                     │  └────────────────────┘ │
                     └──────────┬───────────────┘
                                │
                                ▼
                     ┌──────────────────────────┐
                     │    PostgreSQL DATABASE     │
                     │                          │
                     │  19 Tables across          │
                     │  6 Workflow Groups         │
                     └──────────────────────────┘
                                ▲
                                │ HTTPS + JSON + JWT
                                │
                     ┌──────────────────────────┐
                     │       WEB APP            │
                     │        (React)            │
                     │                          │
                     │  P3: Merchant Dashboard   │
                     │  P4: Cashier Verification │
                     │  P5: Admin Panel          │
                     │  P2: Organizer Web Mgmt   │
                     └──────────────────────────┘


WORKFLOW HIERARCHY:

                    Volunteering Rewards App
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
    MOBILE APP           WEB APP               DATABASE
        │                     │                     │
        ▼                     ▼                     ▼
  ┌────────────┐     ┌──────────────┐     ┌──────────────┐
  │ Volunteer  │     │ Merchant     │     │ 19 Tables    │
  │ Organizer  │     │ Cashier      │     │              │
  └────────────┘     │ Admin        │     └──────────────┘
                     │ Organizer    │
                     └──────────────┘
```

---

## (6) GUI PAGES

### MOBILE APP — Screens

```
MOBILE APP NAVIGATION
═══════════════════════════════════════════════════════════════════

AUTH STACK (No tabs — shown when not logged in)
│
├── SplashScreen
│   ├── App logo
│   ├── App name: "Volunteering Rewards"
│   ├── Tagline
│   ├── [Login] button
│   └── [Register] button
│
├── LoginScreen
│   ├── TextInput: Email
│   ├── TextInput: Password (secure)
│   ├── [Login] button
│   └── "Don't have account? Register" link
│
├── RegisterScreen
│   ├── TextInput: Full Name
│   ├── TextInput: Email
│   ├── TextInput: Phone
│   ├── TextInput: Password
│   ├── TextInput: Confirm Password
│   ├── ── Referral (Optional) ──
│   ├── TextInput: Sponsor Email
│   ├── TextInput: Parent Sponsor Email
│   ├── [Register] button
│   └── "Already have account? Login" link

───────────────────────────────────────────────────────────────────

MAIN TABS (Shown after login)

TAB 1: HOME / DASHBOARD
│
├── DashboardScreen
│   ├── Header: Avatar + "Hello, {Name}"
│   ├── Points Card:
│   │   ├── Current Points (large)
│   │   ├── Total Earned
│   │   └── Progress to next reward
│   ├── Quick Actions (grid):
│   │   ├── [My QR Code]
│   │   ├── [Today's Events]
│   │   ├── [My Schedule]
│   │   └── [Reward-Store]
│   ├── Upcoming Events (horizontal list)
│   │   └── Event cards with date, title, location
│   ├── Recent Activity feed
│   │   └── "Earned X pts from {event}" entries
│   └── Hall-of-Fame teaser

TAB 2: EVENTS
│
├── EventStoreScreen (Event "Store" browse)
│   ├── Header: "Volunteering Events"
│   ├── Search bar
│   ├── Category filter chips (Environment, Elderly, etc.)
│   ├── Sort dropdown (Date, Name, Organization, Location)
│   ├── Event Cards (repeating list):
│   │   ├── Event image
│   │   ├── Event title
│   │   ├── Organization name
│   │   ├── Date + time
│   │   ├── Location
│   │   ├── Points: "{N} pts"
│   │   ├── Capacity: "{N}/{M}"
│   │   ├── [Register] button or "Registered ✓"
│   │   └── Heart (favorite) icon
│   └── [Filter] button
│
├── EventDetailScreen
│   ├── Event banner image
│   ├── Event title
│   ├── Organization name + logo
│   ├── Date, time, location (with map link)
│   ├── Points value
│   ├── Capacity meter
│   ├── Full description
│   ├── Q&A Section:
│   │   ├── List of questions + answers
│   │   └── [Ask a Question] button
│   ├── [Register Now] button
│   ├── [Like] toggle
│   └── [Set Reminder] toggle

TAB 3: MY SCHEDULE (Schedule Book)
│
├── ScheduleScreen
│   ├── Header: "My Schedule"
│   ├── Calendar view / List view toggle
│   ├── Upcoming Events list:
│   │   └── Event cards with:
│   │       ├── Title, date, time
│   │       ├── Location
│   │       ├── Notes field (personal notes)
│   │       ├── [Cancel] button
│   │       └── [Add Note] button
│   ├── Past Events list:
│   │   └── Event cards with:
│   │       ├── Title, date
│   │       ├── Points earned
│   │       ├── [Post on V-Social] button
│   │       └── [Give Feedback] button
│   └── Today's Event highlight:
│       ├── [Check In] button (if at venue)
│       └── "Show My QR Code" (for organizer to scan)

TAB 4: REWARDS (Reward-Store)
│
├── RewardStoreScreen
│   ├── Header: "Reward-Store"
│   ├── Points balance display
│   ├── Search bar
│   ├── Sort dropdown
│   ├── Filter chips
│   ├── Reward Cards (list):
│   │   ├── Reward image
│   │   ├── Title + Merchant name
│   │   ├── Points required
│   │   ├── Stock remaining
│   │   ├── Heart (favorite)
│   │   └── [Redeem] button
│   └── [My Coupons] link
│
├── CouponDetailScreen / MyCouponsScreen
│   ├── Header: "My Coupons"
│   ├── Tabs: Unused | Used | Expired
│   └── Coupon Cards:
│       ├── Reward title + Merchant
│       ├── 6-digit PIN (large, copyable)
│       ├── Coupon QR Code (for cashier scanning)
│       ├── Status badge
│       ├── Expiry date
│       └── "Show QR to Cashier" button

TAB 5: PROFILE / MORE
│
├── ProfileScreen
│   ├── Avatar, name, email
│   ├── Points badge
│   ├── My QR Code (large, for organizer/cashier to scan)
│   ├── [Download My QR] button
│   ├── Menu:
│   │   ├── [My Activity History]
│   │   ├── [Sponsorship / Referral]
│   │   ├── [V-Social]
│   │   ├── [Hall of Fame]
│   │   ├── [Settings]
│   │   └── [Logout]
│
├── SponsorshipScreen
│   ├── Header: "Sponsorship"
│   ├── My Upline:
│   │   ├── Direct Sponsor: {name} or "None"
│   │   └── Parent Sponsor: {name} or "None"
│   ├── My Downline:
│   │   ├── Direct Sponsorships: {count} [Show List]
│   │   └── Grandchild Sponsorships: {count} [Show List]
│   ├── Points from Referrals
│   └── [Invite Friends] button (share referral)
│
├── ActivityHistoryScreen
│   ├── Header: "My History"
│   ├── Sort/filter
│   └── Activity list: event name, points, date, status
│
├── VSocialScreen (V-Social)
│   ├── Header: "V-Social"
│   ├── Feed of posts from volunteers
│   │   ├── User avatar + name
│   │   ├── Event name (linked)
│   │   ├── Photos (gallery)
│   │   ├── Content/notes text
│   │   ├── Like button + count
│   │   └── Comments
│   └── [Create Post] FAB button
│
├── HallOfFameScreen
│   ├── Header: "Hall of Fame"
│   ├── Tabs: Most Active | Most Referrals | Most Points
│   └── Leaderboard ranking list:
│       ├── Rank number
│       ├── Avatar + name
│       ├── Score
│       └── National reward badge (if applicable)
│
├── SettingsScreen
│   ├── Change Password
│   ├── Notification Preferences
│   ├── Reminder Settings
│   └── Delete Account
```

### ORGANIZER MOBILE APP — Additional Screens

```
ORGANIZER MOBILE (On-site Control)
│
├── OrganizerDashboard
│   ├── Today's events list
│   └── Quick stats
│
├── AttendanceScreen
│   ├── Select event
│   ├── List of registered volunteers
│   ├── Check-in status per volunteer
│   ├── [Manual Check-In] button
│   └── [Scan Volunteer QR] button
│
├── ScanVolunteerScreen
│   ├── Camera viewfinder (scan volunteer's QR)
│   ├── Scanned volunteer info display
│   ├── Confirmation: {Name} checked in / points awarded
│   └── [Done] → continue scanning
```

### WEB APP — Screens

```
WEB APP NAVIGATION
═══════════════════════════════════════════════════════════════════

AUTH PAGES
├── LoginPage
│   ├── TextInput: Email
│   ├── TextInput: Password
│   └── [Login] button
│
└── MerchantRegisterPage
    ├── TextInput: Business Name
    ├── TextInput: UEN
    ├── TextInput: Contact Person
    ├── TextInput: Contact Email
    ├── TextInput: Contact Phone
    ├── Password
    └── [Register] button

───────────────────────────────────────────────────────────────────

CASHIER PAGES
│
├── CashierDashboardPage
│   ├── Header: "Coupon Verification"
│   ├── ── Scan QR Section ──
│   ├── QR Scanner viewfinder
│   │   (scan volunteer's QR code from their phone)
│   ├── OR [Enter Volunteer ID] text input (fallback)
│   │
│   ├── ── PIN Entry Section ──
│   ├── PIN Input: 6 separate digit boxes
│   ├── Volunteer info: {Name} (shown after QR scan)
│   ├── Coupon info: {Reward title} (shown after PIN entry)
│   ├── [Verify] button
│   │
│   ├── Result: Success
│   │   ├── Green checkmark
│   │   ├── "Coupon Valid — Reward Issued"
│   │   ├── Volunteer name
│   │   ├── Reward title
│   │   └── [New Verification] button
│   │
│   └── Result: Failed
│       ├── Red X
│       ├── Error message (Used/Expired/Invalid)
│       └── [Try Again] button

───────────────────────────────────────────────────────────────────

MERCHANT PAGES
│
├── MerchantDashboardPage
│   ├── Statistics cards:
│   │   ├── Total rewards published
│   │   ├── Total redemptions
│   │   └── Active coupons
│   ├── Recent redemptions list
│   └── Quick actions: [Add Reward] [View Store]
│
├── RewardManagementPage
│   ├── Header: "My Rewards"
│   ├── [Add New Reward] button
│   ├── Rewards Table:
│   │   ├── Title, Points, Quantity, Status, Actions
│   │   ├── [Edit] [Delete] [Publish] buttons
│   └── Add/Edit Reward Form:
│       ├── TextInput: Title
│       ├── TextArea: Description
│       ├── FileUpload: Image
│       ├── NumberInput: Points Required
│       ├── NumberInput: Quantity
│       ├── DatePicker: Expiry Date
│       ├── [Save as Draft] [Publish] buttons
│
├── MerchantSponsorshipPage
│   ├── Available events/campaigns for sponsorship
│   ├── [Sponsor] button per event
│   └── My active sponsorships list
│
├── AdvertisingPage
│   ├── [Apply for Ad] button
│   ├── Form: ad title, image, target URL, budget, duration
│   └── My ad applications status list
│
└── RedemptionHistoryPage
    ├── Date range filter
    ├── Search by volunteer
    ├── Statistics summary cards
    └── Redemption table: Date, Volunteer, Reward, PIN, Status

───────────────────────────────────────────────────────────────────

ORGANIZER PAGES (Web — for management)
│
├── OrganizerDashboardPage
│   ├── My campaigns overview
│   ├── Upcoming events list
│   └── Statistics: volunteers, events, points awarded
│
├── CampaignManagementPage
│   ├── [Create Campaign] button
│   ├── Campaign List: title, date range, status, events count
│   └── Create/Edit Campaign form: title, description, date range, goals
│
├── EventManagementPage
│   ├── Campaign selector
│   ├── [Create Event] button
│   ├── Event Table:
│   │   ├── Title, date, location, capacity, points, status
│   │   └── [Edit] [Cancel] [View Registrations]
│   └── Create/Edit Event form:
│       ├── TextInput: Title, Location, Category
│       ├── TextArea: Description
│       ├── DatePicker: Event date
│       ├── NumberInput: Capacity, Points value
│       ├── [Save] [Publish] buttons
│
├── RegistrationManagementPage
│   ├── Event selector
│   ├── Volunteer registrations table
│   ├── Check-in status
│   ├── Attendance report download
│   └── [Mark Attendance] button (manual override)
│
├── QAManagementPage
│   ├── Select event
│   ├── Pending questions list
│   └── [Answer] button → text input → submit
│
└── StatisticChartsPage
    ├── Campaign selector
    ├── Volunteer participation chart (bar)
    ├── Event popularity chart
    ├── Points distribution chart (pie)
    └── Registration trends (line)

───────────────────────────────────────────────────────────────────

ADMIN PAGES
│
├── AdminDashboardPage
│   ├── System stats cards:
│   │   ├── Total users, merchants, orgs, events
│   │   ├── Daily active users
│   │   └── Pending approvals count
│   ├── Recent fraud alerts
│   └── Quick actions
│
├── UserManagementPage
│   ├── Search bar + role filter
│   ├── Users Table:
│   │   ├── Name, email, role, status, points
│   │   └── [View] [Suspend] [Approve] [Delete]
│   └── User detail modal
│
├── OrganizationApprovalPage
│   ├── Pending organizations list
│   ├── Document preview (uploaded official docs)
│   ├── [Approve] [Reject] buttons
│   └── Notes/reason field
│
├── RewardOversightPage
│   ├── All rewards across all merchants
│   ├── Flag inappropriate listings
│   └── [Deactivate] button
│
├── FraudMonitoringPage
│   ├── Failed PIN attempts log
│   ├── Unusual scan patterns
│   ├── Duplicate account detection
│   └── Flagged transactions table
│
└── SystemConfigPage
    ├── Default points values
    ├── Rate limit settings
    ├── Hall-of-Fame schedule
    └── Email/notification settings
```

---

## (7) CONCLUSION & OPINION

### What I Like About This Design

| Aspect | Why It's Strong |
|--------|----------------|
| **QR direction reversed** | Organizer scanning volunteer's QR is more secure (no need to print event QR codes that could be photographed and shared remotely) |
| **V-Social platform** | Great for organic volunteer recruitment — people share their experiences, friends see them and want to join |
| **Hall-of-Fame** | Public recognition is a powerful motivator that costs nothing to implement |
| **Organization registration with documents** | Shows real-world thinking about trust and verification |
| **Campaigns as umbrella** | A campaign containing multiple events is more realistic than standalone events |
| **Reward-Store publish workflow** | Draft → Published gives merchants control over listing timing |
| **Check-in + QR scan** | Two-step verification (check-in then QR scan) prevents many types of fraud |
| **19 tables across 6 groups** | Well-organized, each table has a clear purpose |

### Challenges & Risks

| Challenge | Why | Mitigation |
|-----------|-----|------------|
| **Scope is large** | 19 tables, 50+ API endpoints, 30+ screens across mobile + web for a 4-person team | Prioritize: Core (Workflows A+B+C) → Sponsorship (D) → Social+Recognition (E) → Merchant Programs (F) |
| **QR scanning on organizer's phone** | Organizer needs a mobile app too — means you're building TWO mobile experiences (volunteer + organizer) in one codebase | Expo supports role-based routing. One app build, different views based on login role |
| **Organization document upload** | Handling file uploads (approval documents) adds complexity | Store in cloud storage (AWS S3, Cloudinary) or just base64 in DB for prototype |
| **V-Social moderation** | User-generated content needs moderation to prevent spam/abuse | Start with simple "report post" flag + admin review. Full moderation can come later |

### Recommended Build Order for 4-Person Team

```
SPRINT 1: Foundation (1 week)
├── Database schema (all 19 tables)
├── Auth system (register, login, JWT, roles)
├── User profile + QR identity
└── Admin user management

SPRINT 2: Events Core (1-2 weeks)
├── Organization registration + approval
├── Campaigns CRUD
├── Events CRUD
├── Event registration (schedule book)
└── Favorites

SPRINT 3: QR + Attendance + Points (1 week)
├── Volunteer QR display
├── Organizer QR scanner
├── Check-in flow
├── Attendance tracking
├── Points engine
└── Event feedback + Q&A

SPRINT 4: Reward-Store + Redemption (1 week)
├── Merchant reward management
├── Reward-Store browse
├── Coupon redemption + PIN generation
├── Cashier verification (QR + PIN)
├── Redemption audit logs
└── Merchant stats

SPRINT 5: Add-ons (1-2 weeks)
├── Sponsorship system
├── V-Social platform
├── Hall of Fame
├── Merchant sponsorships + advertising
├── Admin fraud monitoring
└── Statistic charts

SPRINT 6: Polish + Deploy (1 week)
├── UI refinement
├── Testing (all workflows)
├── Deployment (Render/Railway + Expo)
└── Presentation prep
```

### Final Verdict

This is a **comprehensive and well-thought-out system** that covers the full lifecycle of volunteer engagement — from recruitment (referral + V-Social), through participation (events + QR + points), to reward (Redemption-Store + PIN verification), and recognition (Hall-of-Fame). The addition of merchant sponsorship and advertising creates a potential revenue model that makes the system sustainable beyond the capstone.

The biggest decision for your team is **what to cut if time runs short**. My suggestion: the Merchant Programs (sponsorship + advertising) are the most "nice-to-have" and should be deprioritized. Everything else directly supports the core volunteer → reward loop.

The existing Expo project is a great starting point — the file-based routing makes it easy to add the 30+ screens planned above without fighting with navigation configuration.

---

*Document generated: May 1, 2026*
