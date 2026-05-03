# Volunteer Rewards App — Complete Database Tables

---

## WORKFLOW A: AUTHENTICATION & USER MANAGEMENT

### Table 1: roles

Stores all possible user roles in the system.

```
roles
├── id              : SERIAL (Primary Key)
├── role_name       : VARCHAR(50) UNIQUE NOT NULL
│                    Example values: 'Volunteer', 'Cashier', 'Merchant', 'Organizer', 'Admin'
├── description     : TEXT (optional description of what this role can do)
└── created_at      : TIMESTAMP DEFAULT CURRENT_TIMESTAMP
```

**Sample Data:**
| id | role_name | description |
|----|-----------|-------------|
| 1 | Volunteer | Scans QR codes, earns points, redeems coupons via mobile app |
| 2 | Cashier | Verifies 6-digit PIN at merchant outlet via web app |
| 3 | Merchant | Manages reward listings and redemption stats via web app |
| 4 | Organizer | Creates events and generates QR codes via web app |
| 5 | Admin | Manages users, system config, and oversight via web app |

---

### Table 2: users

Every person who uses the system, regardless of role.

```
users
├── id                   : SERIAL (Primary Key)
├── name                 : VARCHAR(100) NOT NULL
├── email                : VARCHAR(150) UNIQUE NOT NULL
├── password_hash        : TEXT NOT NULL (bcrypt hashed)
├── phone                : VARCHAR(20) (optional contact number)
├── role_id              : INTEGER (Foreign Key → roles.id) NOT NULL
├── points               : INTEGER DEFAULT 0 (CHECK: points >= 0)
├── status               : VARCHAR(20) DEFAULT 'active'
│                         Values: 'active', 'suspended', 'inactive'
│
├── SPONSORSHIP FIELDS (4 fields total):
│   ├── direct_sponsor_id   : INTEGER (Foreign Key → users.id, NULLABLE)
│   │                        Who sponsored me to become a volunteer
│   │
│   ├── parent_sponsor_id   : INTEGER (Foreign Key → users.id, NULLABLE)
│   │                        Who sponsored my direct sponsor
│   │
│   ├── direct_sponsorship_count : INTEGER (COMPUTED via SQL query)
│   │                             Number of people I sponsored directly
│   │                             → SELECT COUNT(*) FROM users WHERE direct_sponsor_id = my_id
│   │
│   └── grandchild_sponsorship_count : INTEGER (COMPUTED via SQL query)
│                                      Number of people sponsored by my direct sponsorships
│                                      → SELECT COUNT(*) FROM users 
│                                        WHERE direct_sponsor_id IN 
│                                        (SELECT id FROM users WHERE direct_sponsor_id = my_id)
│
├── created_at           : TIMESTAMP DEFAULT CURRENT_TIMESTAMP
└── updated_at           : TIMESTAMP DEFAULT CURRENT_TIMESTAMP
```

**Note on the 4 sponsorship fields:**
- **Fields 1 & 2** (`direct_sponsor_id`, `parent_sponsor_id`) → **STORED** in the database as columns
- **Fields 3 & 4** (`direct_sponsorship_count`, `grandchild_sponsorship_count`) → **COMPUTED** on-the-fly via SQL queries when the user views their profile. These are NOT stored as columns; they are calculated dynamically.

---

## WORKFLOW B: EVENT MANAGEMENT & QR SCANNING

### Table 3: events

Volunteering activities created by Organizers.

```
events
├── id                : SERIAL (Primary Key)
├── organizer_id      : INTEGER (Foreign Key → users.id) NOT NULL
├── title             : VARCHAR(200) NOT NULL (e.g. "East Coast Beach Cleanup")
├── description       : TEXT (full details about the activity)
├── location          : VARCHAR(255) (venue address)
├── event_date        : TIMESTAMP NOT NULL (when the activity takes place)
├── capacity          : INTEGER (maximum number of volunteers, NULL = unlimited)
├── points_value      : INTEGER NOT NULL (CHECK: points_value > 0)
│                     How many points a volunteer earns by attending
├── status            : VARCHAR(20) DEFAULT 'upcoming'
│                     Values: 'upcoming', 'ongoing', 'completed', 'cancelled'
├── image_url         : VARCHAR(500) (optional banner image for the event)
├── created_at        : TIMESTAMP DEFAULT CURRENT_TIMESTAMP
└── updated_at        : TIMESTAMP DEFAULT CURRENT_TIMESTAMP
```

---

### Table 4: event_registrations

Links volunteers to events they have registered for (the Schedule Book).

```
event_registrations
├── id                : SERIAL (Primary Key)
├── user_id           : INTEGER (Foreign Key → users.id) NOT NULL
├── event_id          : INTEGER (Foreign Key → events.id) NOT NULL
├── status            : VARCHAR(20) DEFAULT 'confirmed'
│                     Values: 'confirmed', 'cancelled', 'attended'
├── registered_at     : TIMESTAMP DEFAULT CURRENT_TIMESTAMP
│
├── CONSTRAINT        : UNIQUE(user_id, event_id)
│                     A volunteer can only register once per event
│
└── CONSTRAINT        : (Optional: bring_friend_count INTEGER DEFAULT 0)
```

---

### Table 5: qr_codes

Unique QR codes generated for events.

```
qr_codes
├── id                : SERIAL (Primary Key)
├── code              : UUID UNIQUE NOT NULL DEFAULT gen_random_uuid()
│                     Cryptographically random, not guessable
├── event_id          : INTEGER (Foreign Key → events.id) (NULLABLE)
│                     Which event this QR code belongs to
├── location          : VARCHAR(255) (physical location where QR is placed)
├── points_value      : INTEGER NOT NULL (CHECK: points_value > 0)
├── expiry_date       : TIMESTAMP (NULLABLE — QR code becomes invalid after this)
├── status            : VARCHAR(20) DEFAULT 'active'
│                     Values: 'active', 'inactive', 'expired'
└── created_at        : TIMESTAMP DEFAULT CURRENT_TIMESTAMP
```

---

### Table 6: scan_logs

Records every QR code scan by a volunteer.

```
scan_logs
├── id                : SERIAL (Primary Key)
├── user_id           : INTEGER (Foreign Key → users.id) NOT NULL
├── qr_id             : INTEGER (Foreign Key → qr_codes.id) NOT NULL
├── scanned_at        : TIMESTAMP DEFAULT CURRENT_TIMESTAMP
│
└── CONSTRAINT        : UNIQUE(user_id, qr_id)
                       Prevents the same volunteer from scanning the same QR twice
                       (This is the most important constraint in the system)
```

---

### Table 7: favorites

Allows volunteers to "like" events, rewards, or activities for quick access.

```
favorites
├── id                : SERIAL (Primary Key)
├── user_id           : INTEGER (Foreign Key → users.id) NOT NULL
├── item_type         : VARCHAR(20) NOT NULL
│                     Values: 'event', 'coupon', 'activity'
├── item_id           : INTEGER NOT NULL (the ID of the liked item)
├── created_at        : TIMESTAMP DEFAULT CURRENT_TIMESTAMP
│
└── CONSTRAINT        : UNIQUE(user_id, item_type, item_id)
                       Prevents duplicate likes
```

---

## WORKFLOW C: REWARD & COUPON MANAGEMENT

### Table 8: coupons

Reward definitions created by Merchants.

```
coupons
├── id                : SERIAL (Primary Key)
├── merchant_id       : INTEGER (Foreign Key → users.id) NOT NULL
│                     Which merchant is offering this reward
├── title             : VARCHAR(150) NOT NULL (e.g. "Free Coffee", "$5 Voucher")
├── description       : TEXT (details about the reward)
├── image_url         : VARCHAR(500) (optional image of the reward)
├── points_required   : INTEGER NOT NULL (CHECK: points_required > 0)
│                     How many points a volunteer needs to redeem this
├── quantity          : INTEGER NOT NULL (CHECK: quantity >= 0)
│                     Total number available. Decremented on each redemption.
├── expiry_date       : TIMESTAMP (date after which this coupon offer expires)
├── status            : VARCHAR(20) DEFAULT 'active'
│                     Values: 'active', 'inactive'
├── created_at        : TIMESTAMP DEFAULT CURRENT_TIMESTAMP
└── updated_at        : TIMESTAMP DEFAULT CURRENT_TIMESTAMP
```

---

### Table 9: user_coupons

Records each coupon issued to a volunteer (this is the most security-critical table).

```
user_coupons
├── id                : SERIAL (Primary Key)
├── user_id           : INTEGER (Foreign Key → users.id) NOT NULL
│                     Which volunteer owns this coupon
├── coupon_id         : INTEGER (Foreign Key → coupons.id) NOT NULL
│                     Which reward was redeemed
├── pin               : CHAR(6) UNIQUE NOT NULL
│                     6-digit PIN generated by crypto.randomInt(100000, 999999)
│                     This is what the volunteer tells the cashier
├── status            : VARCHAR(20) DEFAULT 'unused'
│                     Values: 'unused', 'used', 'expired'
├── verify_attempts   : INTEGER DEFAULT 0
│                     Tracks how many times someone tried to verify this PIN
│                     (for security monitoring)
├── redeemed_at       : TIMESTAMP (NULLABLE — set when cashier verifies the PIN)
├── expiry_date       : TIMESTAMP (NULLABLE — coupon validity period)
├── created_at        : TIMESTAMP DEFAULT CURRENT_TIMESTAMP
│
├── CONSTRAINT        : UNIQUE(pin)  — every PIN must be unique
└── CONSTRAINT        : CHECK(status IN ('unused', 'used', 'expired'))
```

---

### Table 10: redemption_logs

Audit trail for every PIN verification attempt (success and failure).

```
redemption_logs
├── id                : SERIAL (Primary Key)
├── user_coupon_id    : INTEGER (Foreign Key → user_coupons.id) NOT NULL
├── cashier_id        : INTEGER (Foreign Key → users.id) NOT NULL
│                     Which cashier performed the verification
├── attempt_status    : VARCHAR(20) NOT NULL
│                     Values: 'success', 'failed'
├── ip_address        : VARCHAR(45) (IP address of the cashier's device)
├── attempted_at      : TIMESTAMP DEFAULT CURRENT_TIMESTAMP
└── created_at        : TIMESTAMP DEFAULT CURRENT_TIMESTAMP
```

---

## WORKFLOW D: SPONSORSHIP / REFERRAL

### Table 11: sponsorship_points

Audit trail for every sponsorship points-earning event.

```
sponsorship_points
├── id                    : SERIAL (Primary Key)
├── earned_by_user_id     : INTEGER (Foreign Key → users.id) NOT NULL
│                          Who received the points
├── source_user_id        : INTEGER (Foreign Key → users.id) NOT NULL
│                          The new recruit that triggered this points award
├── level                 : INTEGER NOT NULL (CHECK: level IN (1, 2))
│                          1 = Direct sponsorship (direct recruit)
│                          2 = Indirect sponsorship (grandchild recruit)
├── points_earned         : INTEGER NOT NULL
│                          How many points were awarded
├── description           : VARCHAR(255) (optional — e.g. "Direct recruit: John Doe")
└── created_at            : TIMESTAMP DEFAULT CURRENT_TIMESTAMP
```

**Points Allocation Logic (for reference):**

| Scenario | Points Breakdown |
|----------|-----------------|
| I directly recruit Person A (my own effort) | **I earn:** 10 pts |
| I help Person A recruit Person B | **Person A earns:** 4 pts (direct sponsor) ← less because indirect effort |
| | **I earn:** 6 pts (upline helper) ← more because I did the work |
| Person B directly recruits Person C (own effort) | **Person B earns:** 10 pts |

---

## MASTER TABLE LIST (All 11 Tables)

```
DATABASE: volunteering_rewards_app
│
├── WORKFLOW A: AUTH & USER MANAGEMENT
│   ├── 1. roles
│   └── 2. users
│
├── WORKFLOW B: EVENTS & QR SCANNING
│   ├── 3. events
│   ├── 4. event_registrations
│   ├── 5. qr_codes
│   ├── 6. scan_logs
│   └── 7. favorites
│
├── WORKFLOW C: REWARDS & COUPONS
│   ├── 8. coupons
│   ├── 9. user_coupons
│   └── 10. redemption_logs
│
└── WORKFLOW D: SPONSORSHIP
    └── 11. sponsorship_points
```

---

## ENTITY RELATIONSHIPS

```
roles (1) ──── (M) users
                         │
          ┌──────────────┼──────────────────┐
          │              │                   │
     (M) events     (M) favorites     (M) user_coupons (M)── (1) coupons
          │                                           │
          │                                           │ (M) redemption_logs (M) ── users (as cashier)
          │ (M) qr_codes                              │
          │      │                                    │
          │      │ (M) scan_logs (M) ── users         │
          │                                           │
          └── (M) event_registrations (M) ── users    │
                                                      │
users (self-referencing) ──── direct_sponsor_id ──────┘
users (self-referencing) ──── parent_sponsor_id
users (1) ──── (M) sponsorship_points (M) ──── users (as source)
```

---

## KEY CHANGES FROM PREVIOUS VERSION

| Change | Before | After |
|--------|--------|-------|
| **Role handling** | `role VARCHAR(20)` in users table | Separate `roles` table with `role_id FK` in users |
| **Sponsorship fields** | 2 stored fields only | 4 fields clearly listed with 2 stored + 2 computed explained |
| **Redemption audit** | Not present | New `redemption_logs` table for full audit trail |
| **QR-event link** | Optional | Still optional but clarified as FK |
| **User phone** | Not present | Added for contact |
| **Points value on events** | Not present | Added so organizers can set points per event |
| **Event image_url** | Not present | Added for visual appeal |

---

*Document generated: May 1, 2026*
