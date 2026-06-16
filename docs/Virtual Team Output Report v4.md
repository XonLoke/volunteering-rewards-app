# Virtual Team Output Report v4

> **Version:** v4 — May 20, 2026  
> **Prepared for:** Sprint 2 Kickoff  
> **Scope:** Vertical slice task assignments per virtual teammate for Sprint 2 (18 May – 1 Jun)

---

## Executive Summary

The three virtual teammates have been reassigned from Sprint 1's concentrated-generation model to **vertical slice ownership** for Sprint 2. Each now owns the full backend implementation (routes + controllers + services) for their feature area, plus the frontend-to-API wiring of their existing screens.

| Teammate | Sprint 1 Role | Sprint 2 Role | Backend Endpoints to Implement | Frontend Tasks |
|----------|--------------|--------------|-------------------------------|----------------|
| **v-Vivian** | Mobile UI Developer | Events + QR Attendance Developer | 10 new endpoints | Wire mobile events screens + build scanning app |
| **v-Grace** | Web UI + Rewards Developer | Rewards + Merchant Developer | 10 new endpoints | Wire rewards catalog + build merchant app |
| **v-Nurain** | Auth Audit Specialist | Admin + Organiser Developer | 8 new endpoints | Wire organiser portal + admin pages |

---

## 1. v-Vivian — Events & QR Attendance Slice

### Sprint 2 Backend Endpoints

All endpoints are defined in `API_CONTRACTS_v2.md`. Files to create/modify:

**New files to create:**
| File | Purpose |
|------|---------|
| `backend/src/services/events.service.js` | Event CRUD, search, registration, feedback, Q&A, favorites logic |
| `backend/src/services/attendance.service.js` | QR scan, batch sync, point awarding logic |

**Files already wired (routes + controller stubs done):**
| Route File | Controller File | Status |
|-----------|----------------|--------|
| `backend/src/routes/events.routes.js` | `backend/src/controllers/events.controller.js` | Routes wired ✅ — needs real DB queries |
| `backend/src/routes/attendance.routes.js` | `backend/src/controllers/attendance.controller.js` | Routes wired ✅ — needs real DB queries |
| `backend/src/routes/favorites.routes.js` | Uses `me.controller` | Route wired ✅ — needs real DB queries |

### Endpoint Implementation List

| ID | Endpoint | Contract Section | Priority |
|----|----------|-----------------|----------|
| EVT-01 | `GET /api/events` — Browse with search/filter/pagination | Volunteer Mobile | High (mid-sprint demo) |
| EVT-02 | `GET /api/events/categories` — List categories | Volunteer Mobile | Medium |
| EVT-02 | `GET /api/events/:id` — Event detail with registration status | Volunteer Mobile | High |
| EVT-03 | `POST /api/events/:id/register` — Join event | Volunteer Mobile | High (mid-sprint demo) |
| EVT-03 | `DELETE /api/events/:id/register` — Leave event | Volunteer Mobile | Medium |
| EVT-04 | `POST /api/attendance/scan` — QR check-in + award points | Scanning App | High |
| EVT-05 | `POST /api/attendance/batch` — Offline scan sync | Scanning App | Medium |
| EVT-06 | `POST /api/events/:id/feedback` — Submit rating + comment | Volunteer Mobile | Medium |
| EVT-07 | `GET /api/events/:id/qna` — View Q&A | Volunteer Mobile | Low |
| EVT-07 | `POST /api/events/:id/qna` — Ask question | Volunteer Mobile | Low |
| EVT-08 | `POST /api/favorites/:id` — Toggle favorite | Volunteer Mobile | Medium |
| EVT-08 | `GET /api/me/favorites` — List favorites | Volunteer Mobile | Medium |
| EVT-09 | `GET /api/events/:id/roster` — Volunteer list with check-in status | Scanning App | High |
| EVT-10 | `GET /api/events/:id/stats` — Check-in stats for scanning | Scanning App | Medium |
| EVT-10 | `GET /api/events/today` — Today's events for scanning | Scanning App | High |

### Frontend Wiring

| Screen | File | API to Wire | Status |
|--------|------|------------|--------|
| Event Browse | `app/(tabs)/events.tsx` | `GET /api/events` | UI done, needs live data |
| Event Detail | `app/(tabs)/events/[id].tsx` | `GET /api/events/:id`, `POST /:id/register` | UI done, needs live data |
| My Events | `app/(tabs)/events/my.tsx` | `GET /api/me/events` | UI done, needs live data |
| Scanning: Today | `pages/scan/EventSelect.jsx` | `GET /api/events/today` | UI done, needs live data |
| Scanning: Scanner | `pages/scan/Scanner.jsx` | `POST /api/attendance/scan`, `/batch` | UI done, needs live data |
| Scanning: Roster | `pages/scan/Roster.jsx` | `GET /api/events/:id/roster` | UI done, needs live data |
| Organiser: Roster | `pages/organiser/Roster.jsx` | `GET /api/organiser/events/:id/roster` | UI done, needs live data |

### Relevant Database Tables

`events`, `event_registrations`, `attendance_logs`, `event_feedback`, `event_qna`, `favorites`, `users` (for points)

---

## 2. v-Grace — Rewards & Merchant Slice

### Sprint 2 Backend Endpoints

**New files to create:**
| File | Purpose |
|------|---------|
| `backend/src/services/rewards.service.js` | Coupon CRUD, redemption, PIN generation, rewards config logic |
| `backend/src/services/merchant.service.js` | PIN verify/redeem/reverse, merchant history |

**Files already wired (routes + controller stubs done):**
| Route File | Controller File | Status |
|-----------|----------------|--------|
| `backend/src/routes/rewards.routes.js` | `backend/src/controllers/rewards.controller.js` | Routes wired ✅ — needs real DB queries |
| `backend/src/routes/merchant.routes.js` | `backend/src/controllers/merchant.controller.js` | Routes wired ✅ — needs real DB queries |
| `backend/src/routes/admin.routes.js` (coupon + rewards config + redemptions sections) | `backend/src/controllers/admin.controller.js` | Routes wired ✅ — needs real DB queries |

### Endpoint Implementation List

| ID | Endpoint | Contract Section | Priority |
|----|----------|-----------------|----------|
| REW-02 | `GET /api/rewards` — Browse available rewards | Volunteer Mobile | High (mid-sprint demo) |
| REW-04 | `GET /api/rewards/:id` — Reward detail | Volunteer Mobile | Medium |
| REW-03 | `POST /api/rewards/:id/redeem` — Redeem with points, generate PIN | Volunteer Mobile | High (mid-sprint demo) |
| REW-08 | `GET /api/admin/coupons` — List coupon batches | Admin Web | Medium |
| REW-01 | `POST /api/admin/coupons` — Create coupon batch + generate PINs | Admin Web | High |
| REW-08 | `PUT /api/admin/coupons/:id` — Update coupon | Admin Web | Low |
| REW-08 | `DELETE /api/admin/coupons/:id` — Delete coupon | Admin Web | Low |
| REW-10 | `GET /api/admin/rewards/configuration` — Get points config | Admin Web | Medium |
| REW-10 | `PUT /api/admin/rewards/configuration` — Update points config | Admin Web | Medium |
| REW-06 | `GET /api/admin/redemptions` — Redemption history | Admin Web | Medium |
| REW-05 | `POST /api/coupons/verify` — Verify 6-digit PIN | Merchant App | High |
| REW-03 | `POST /api/coupons/redeem` — Mark coupon as redeemed | Merchant App | High (mid-sprint demo) |
| REW-07 | `POST /api/coupons/reverse` — Undo redemption (5-min window) | Merchant App | Medium |
| REW-09 | `GET /api/merchant/history` — Recent redemptions | Merchant App | Medium |

### Frontend Wiring

| Screen | File | API to Wire | Status |
|--------|------|------------|--------|
| Rewards Catalog | `app/(tabs)/rewards.tsx` | `GET /api/rewards` | UI done, needs live data |
| Coupon Detail | `app/(tabs)/rewards/[id].tsx` | `POST /api/rewards/:id/redeem` | UI done, needs live data |
| Merchant: PIN Entry | `pages/merchant/PinVerify.jsx` | `POST /api/coupons/verify`, `/redeem`, `/reverse` | UI done, needs live data |
| Merchant: History | `pages/merchant/History.jsx` | `GET /api/merchant/history` | UI done, needs live data |
| Admin: Coupons | `pages/admin/Coupons.jsx` | `GET/POST/PUT/DELETE /api/admin/coupons` | UI done, needs live data |
| Admin: Redemptions | `pages/admin/Redemptions.jsx` | `GET /api/admin/redemptions` | UI done, needs live data |
| Admin: Rewards Config | `pages/admin/RewardsConfig.jsx` | `GET/PUT /api/admin/rewards/configuration` | UI done, needs live data |

### Relevant Database Tables

`coupons`, `user_coupons`, `redemption_logs`, `rewards_configuration` (if added)

---

## 3. v-Nurain — Admin & Organiser Slice

### Sprint 2 Backend Endpoints

**New files to create:**
| File | Purpose |
|------|---------|
| `backend/src/services/organiser.service.js` | Organiser dashboard, event management, roster, feedback, Q&A logic |
| `backend/src/services/me.service.js` | Volunteer my-events, points, coupons, QR, favorites logic |
| `backend/src/services/admin.service.js` | Admin dashboard, users, organisers, events participation queries |

**Files already wired (routes + controller stubs done):**
| Route File | Controller File | Status |
|-----------|----------------|--------|
| `backend/src/routes/organiser.routes.js` | `backend/src/controllers/organiser.controller.js` | Routes wired ✅ — needs real DB queries |
| `backend/src/routes/me.routes.js` | `backend/src/controllers/me.controller.js` | Routes wired ✅ — needs real DB queries |
| `backend/src/routes/admin.routes.js` (dashboard + users + organisers + events sections) | `backend/src/controllers/admin.controller.js` | Routes wired ✅ — needs real DB queries |

### Endpoint Implementation List

| ID | Endpoint | Contract Section | Priority |
|----|----------|-----------------|----------|
| ADM-01 | `GET /api/admin/dashboard` — Dashboard metrics | Admin Web | High (mid-sprint demo) |
| ADM-02 | `GET /api/admin/users` — List with search/filter/pagination | Admin Web | High |
| ADM-03 | `GET /api/admin/users/:id` — User detail with stats | Admin Web | Medium |
| ADM-04 | `PUT /api/admin/users/:id` — Update user / change status | Admin Web | Medium |
| ADM-04 | `DELETE /api/admin/users/:id` — Deactivate user | Admin Web | Low |
| ADM-05 | `GET /api/admin/organisers` — List with status filter | Admin Web | High |
| ADM-06 | `PUT /api/admin/organisers/:id/approve` — Approve/reject | Admin Web | High |
| ADM-05 | `GET /api/admin/events` — List all events | Admin Web | Medium |
| ADM-05 | `GET /api/admin/events/:id/participation` — Event participation | Admin Web | Medium |
| ORG-02 | `GET /api/organiser/dashboard` — Dashboard stats | Organiser Web | High (mid-sprint demo) |
| ORG-03 | `GET /api/organiser/events` — List my events | Organiser Web | High |
| ORG-03 | `POST /api/organiser/events` — Create event | Organiser Web | High |
| ORG-03 | `GET /api/organiser/events/:id` — Event detail | Organiser Web | Medium |
| ORG-03 | `PUT /api/organiser/events/:id` — Update event | Organiser Web | Medium |
| ORG-03 | `DELETE /api/organiser/events/:id` — Delete event | Organiser Web | Low |
| ORG-03 | `GET /api/organiser/events/:id/roster` — Registered volunteers | Organiser Web | Medium |
| ORG-03 | `GET /api/organiser/events/:id/feedback` — View feedback | Organiser Web | Medium |
| ORG-03 | `GET /api/organiser/events/:id/qna` — View Q&A | Organiser Web | Low |
| ORG-03 | `POST /api/organiser/events/:id/qna/:qid/answer` — Answer question | Organiser Web | Low |
| ME-01 | `GET /api/me/events` — My upcoming/past events | Volunteer Mobile | High (mid-sprint demo) |
| ME-02 | `GET /api/me/points` — Points balance + history | Volunteer Mobile | Medium |
| ME-03 | `GET /api/me/coupons` — My coupons + PINs | Volunteer Mobile | Medium |
| ME-04 | `GET /api/me/qr-code` — QR code data | Volunteer Mobile | High |
| ME-05 | `GET /api/me/favorites` — My favorites | Volunteer Mobile | Low |

### Frontend Wiring

| Screen | File | API to Wire | Status |
|--------|------|------------|--------|
| Admin: Dashboard | `pages/admin/Dashboard.jsx` | `GET /api/admin/dashboard` | UI done, needs live data |
| Admin: Users | `pages/admin/Users.jsx` | `GET/PUT/DELETE /api/admin/users` | UI done, needs live data |
| Admin: Organisers | `pages/admin/Organisers.jsx` | `GET /api/admin/organisers`, `PUT .../approve` | UI done, needs live data |
| Admin: Events | `pages/admin/Events.jsx` | `GET /api/admin/events`, `GET .../participation` | UI done, needs live data |
| Admin: QR Codes | `pages/admin/QRCodes.jsx` | Backend placeholder | UI done |
| Organiser: Dashboard | `pages/organiser/Dashboard.jsx` | `GET /api/organiser/dashboard` | UI done, needs live data |
| Organiser: Events | `pages/organiser/Events.jsx` | `GET /api/organiser/events` | UI done, needs live data |
| Organiser: Create | `pages/organiser/EventCreate.jsx` | `POST /api/organiser/events` | UI done, needs live data |
| Organiser: Edit | `pages/organiser/EventEdit.jsx` | `GET/PUT/DELETE /api/organiser/events/:id` | UI done, needs live data |
| Organiser: Roster | `pages/organiser/Roster.jsx` | `GET /api/organiser/events/:id/roster` | UI done, needs live data |
| Organiser: Feedback | `pages/organiser/Feedback.jsx` | `GET /api/organiser/events/:id/feedback` | UI done, needs live data |
| Organiser: Q&A | `pages/organiser/Qna.jsx` | `GET /api/organiser/events/:id/qna`, `POST .../answer` | UI done, needs live data |
| Organiser: Onsite | `pages/organiser/OnsiteController.jsx` | `POST /api/attendance/scan` | UI done, needs live data |
| Mobile: Profile | `app/(tabs)/profile.tsx` | `GET /api/me/points`, `GET /api/me/qr-code` | UI done, needs live data |
| Mobile: My Coupons | `app/(tabs)/rewards.tsx` | `GET /api/me/coupons` | UI done, needs live data |

### Relevant Database Tables

All 12 tables — `roles`, `users`, `organizations`, `events`, `event_registrations`, `attendance_logs`, `event_feedback`, `event_qna`, `favorites`, `coupons`, `user_coupons`, `redemption_logs`

---

## 4. Sprint 2 Milestones

### Week 1 (18–24 May)

| Teammate | Target |
|----------|--------|
| **v-Vivian** | `GET /api/events`, `GET /api/events/:id`, `POST /api/events/:id/register` working with real DB queries |
| **v-Grace** | `GET /api/rewards`, `POST /api/rewards/:id/redeem`, `POST /api/coupons/verify` working |
| **v-Nurain** | `GET /api/admin/dashboard`, `GET /api/organiser/dashboard`, `GET /api/me/events` working |

### Mid-Sprint Checkpoint (25 May)

Each virtual teammate must demo at least 2 working endpoints connected to the database.

### Week 2 (25 May – 1 Jun)

Complete remaining endpoints. All controller stubs replaced with real DB queries.

---

## 5. Shared Infrastructure

These Sprint 1 deliverables remain in place and unchanged:

| Component | Status |
|-----------|--------|
| Express backend on port 3000 | ✅ Running |
| PostgreSQL with 12+1 tables | ✅ Migrated |
| JWT auth middleware | ✅ Working |
| Role guard middleware | ✅ Working |
| Rate limiter middleware | ✅ Working |
| Global error handler | ✅ Working |
| API contracts frozen | ✅ API_CONTRACTS_v2.md |
| Seed data (3 users, 3 events, 3 coupons) | ✅ Populated |

---

## 6. Key Patterns to Follow

### Service Pattern
Create a new service file per feature area:
```javascript
// services/events.service.js
const { pool } = require("../config/database");
const { createError } = require("../middleware/errorHandler.middleware");

async function browseEvents(filters) {
  // Use parameterized queries — never string interpolation
  const { rows } = await pool.query("SELECT * FROM events WHERE ...", []);
  return { data: rows, total: rows.length, page: 1, limit: 20, total_pages: 0 };
}

module.exports = { browseEvents };
```

### Error Pattern
```javascript
throw createError(400, "validation_error", "Human-readable message", details);
throw createError(404, "not_found", "Event not found.");
throw createError(409, "already_registered", "You are already registered for this event.");
```

### Response Shape
All responses must match `API_CONTRACTS_v2.md` exactly — field names, nesting, casing.
