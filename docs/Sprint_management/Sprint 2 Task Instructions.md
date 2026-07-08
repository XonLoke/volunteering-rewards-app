# Sprint 2 Task Instructions v2 — For Each Team Member

> **Deadline:** 1 Jun 2026
> **Mid-sprint checkpoint:** 25 May
> **Updated:** 21 May 2026 — Added supervisor's workflow changes

---

## 🆕 New Requirements from Supervisor (21 May Meeting)

| Change | Who's Affected | What to Do |
|--------|---------------|------------|
| Organiser registers with official documents, waits for approval | Nurain | Add document upload to reg form + pending approval status page |
| Admin verifies documents, approves/rejects | Xon | Already done (approve/reject API exists) |
| Admin resets user passwords | **Xon** | Done — new button on Users page |
| Admin registers merchants + their products | **Xon** | ✅ Done — new Merchants page with product management |
| PIN is generated at coupon CREATION (by admin), not at redemption | **Xon** | ✅ Done — batch PIN generation on coupon create |
| No-show alarm on admin dashboard | **Xon** | ✅ Done — stat card shows registered no-shows |
| Organiser reviews feedback + evaluates event + person-in-charge | Nurain / Vivian | Enhanced feedback/evaluation workflow |
| Statistics charts on organiser dashboard | Vivian | Charts showing campaign data |
| Merchant sponsorship model — merchants sponsor goods/services as rewards | Grace | Rewards come from merchant sponsorships |
| Cashier app & organiser attendance app use **PWA** (not native) | Vivian / Grace | Build as PWA — installable via browser. No Expo needed. |

---



> **Deadline:** 1 Jun 2026  
> **Mid-sprint checkpoint:** 25 May (each person demos 2 working endpoints)  
> **Your task:** Implement the **service layer** (real database queries) for your slice's backend endpoints, and wire your frontend screens to the live API.

---

## 👤 Vivian — Events & QR Attendance

### What's Already Done for You
- Events routes (`events.routes.js`) — ✅ all 12 endpoints wired with role guards
- Events controller (`events.controller.js`) — ✅ all functions return correct response shapes (currently stubs)
- Attendance routes + controller — ✅ wired
- Favorites routes + controller — ✅ wired
- Mobile app screens (browse, detail, my events, rewards, profile) — ✅ UI built
- Organiser scanning app → **PWA** (not native). Built as React web app, installable via browser.

### What You Need to Do

**1. Create service files with real database queries:**

| File to Create | What It Should Do | Key Endpoints |
|---------------|-------------------|---------------|
| `backend/src/services/events.service.js` | Browse/search events, get detail with registration status, join/leave events | GET /api/events, GET /:id, POST /:id/register, DELETE /:id/register |
| `backend/src/services/attendance.service.js` | Scan QR code, award points, batch sync | POST /api/attendance/scan, POST /api/attendance/batch |
| `backend/src/services/favorites.service.js` | Toggle favorite, list favorites | POST /api/favorites/:id, GET /api/me/favorites |

**2. Update the controller to use your service:**
- In `events.controller.js`, replace `res.json({ data: [] })` with calls to your service
- Same for `attendance.controller.js` and `favorites.controller.js`

**3. Wire mobile app screens to live API:**
- `app/(tabs)/events.tsx` → call `GET /api/events`
- `app/(tabs)/events/[id].tsx` → call `GET /api/events/:id` and `POST /:id/register`
- `app/(tabs)/events/my.tsx` → call `GET /api/me/events`

### How to Code It
Follow the pattern from `admin.service.js`:
```javascript
const { pool } = require("../config/database");
const { createError } = require("../middleware/errorHandler.middleware");

async function browseEvents({ page = 1, limit = 20, search, category } = {}) {
  const offset = (page - 1) * limit;
  // Build your WHERE clauses with parameterized queries
  const { rows } = await pool.query("SELECT * FROM events LIMIT $1 OFFSET $2", [limit, offset]);
  return { data: rows, total: rows.length, page, limit, total_pages: Math.ceil(rows.length / limit) };
}
```

### Database Tables You Can Use
`events`, `event_registrations`, `attendance_logs`, `event_feedback`, `event_qna`, `favorites`

---

## 👤 Grace — Rewards & Merchant

### What's Already Done for You
- Rewards routes (`rewards.routes.js`) — ✅ all 3 endpoints wired
- Rewards controller — ✅ wired with stub responses
- Merchant routes + controller — ✅ wired
- Mobile rewards screens (catalog, detail, redeem) — ✅ UI built by Vivian
- Cashier redemption app → **PWA** (not native). Built as React web app, installable via browser.

### What You Need to Do

**1. Create service files with real database queries:**

| File to Create | What It Should Do | Key Endpoints |
|---------------|-------------------|---------------|
| `backend/src/services/rewards.service.js` | Browse available rewards, get detail, redeem (deduct points, generate 6-digit PIN) | GET /api/rewards, GET /:id, POST /:id/redeem |
| `backend/src/services/merchant.service.js` | Verify 6-digit PIN, mark as redeemed, reverse (5-min window), redemption history | POST /api/coupons/verify, POST /api/coupons/redeem, POST /api/coupons/reverse, GET /api/merchant/history |

**2. Update the controller to use your service:**
- In `rewards.controller.js`, replace stub responses with calls to your service
- Same for `merchant.controller.js`

**3. Wire web portal pages to live API:**
- Merchant app pages at `frontend/web_portals/src/pages/merchant/`
- Admin coupons page at `/admin/coupons`
- Admin redemptions page at `/admin/redemptions`
- Admin rewards config page at `/admin/rewards-config`

### Key Logic for Redemption
```javascript
// Generate unique 6-digit PIN
const pin = String(Math.floor(100000 + Math.random() * 900000));

// Atomic points deduction (prevents overspend)
const result = await pool.query(
  "UPDATE users SET points = points - $1 WHERE id = $2 AND points >= $1 RETURNING points",
  [pointsCost, userId]
);
if (result.rows.length === 0) throw createError(403, "insufficient_points", "Not enough points.");
```

### Database Tables You Can Use
`coupons`, `user_coupons`, `redemption_logs`, `users` (read-only for points)

---

## 👤 Nurain — Admin & Organiser & Me

### What's Already Done for You
- Admin service (`admin.service.js`) — ✅ **fully implemented** by Xon (dashboard, users, organisers, events, coupons, redemptions, config)
- Admin controller — ✅ updated to use the service
- All admin web portal pages — ✅ wired to live API (Dashboard, Users, Organisers, Events, Coupons, Redemptions, Rewards Config, QR Codes, PIN Verify, Merchants, Campaigns)
- Organiser routes + controller — ✅ wired
- Me routes + controller — ✅ wired

### What You Need to Do

**1. Create organiser service file:**

| File to Create | What It Should Do | Key Endpoints |
|---------------|-------------------|---------------|
| `backend/src/services/organiser.service.js` | Dashboard stats, event CRUD (only for their own events), roster, feedback viewing, Q&A answering | GET /api/organiser/dashboard, GET/POST/PUT/DELETE /api/organiser/events, GET /:id/roster, GET /:id/feedback, GET /:id/qna, POST /:id/qna/:qid/answer |

**2. Create "me" service file:**

| File to Create | What It Should Do | Key Endpoints |
|---------------|-------------------|---------------|
| `backend/src/services/me.service.js` | Volunteer's own events (upcoming + past), points balance + history, my coupons with PINs, my QR code data, my favorites | GET /api/me/events, GET /api/me/points, GET /api/me/coupons, GET /api/me/qr-code, GET /api/me/favorites |

**3. Update controllers to use your services:**
- `organiser.controller.js` → replace stubs with calls to `organiser.service.js`
- `me.controller.js` → replace stubs with calls to `me.service.js`

### Important: All Admin Work Is Done
You do NOT need to touch `admin.service.js` or any admin page — those are complete and working.

### Database Tables You Can Use
`users`, `organizations`, `events`, `event_registrations`, `attendance_logs`, `event_feedback`, `event_qna`, `favorites`, `coupons`, `user_coupons`, `redemption_logs` (all tables, read-only for stats)

---

## 📋 Quick Reference for Everyone

### Pattern for Service Files
```javascript
const { pool } = require("../config/database");
const { createError } = require("../middleware/errorHandler.middleware");

async function listItems(filters) {
  const { rows } = await pool.query(
    "SELECT * FROM your_table WHERE status = $1 ORDER BY created_at DESC",
    ['active']
  );
  return { data: rows, total: rows.length };
}

module.exports = { listItems };
```

### Pattern for Controller (after service is ready)
```javascript
const yourService = require("../services/your-slice.service");

async function list(req, res, next) {
  try {
    const result = await yourService.listItems(req.query);
    res.json(result);
  } catch (err) { next(err); }
}
```

### Test Your Work
```bash
# 1. Check syntax
cd backend
node --check src/services/your-file.service.js

# 2. Test with Postman
# Import the collection at Volunteering_Rewards_API.postman_collection.json
# Login first, then test your endpoints
```

### Error Codes to Use
| Code | When |
|------|------|
| `not_found` | Resource doesn't exist |
| `already_registered` | User already joined event |
| `event_full` | Event is at capacity |
| `insufficient_points` | Not enough points |
| `out_of_stock` | Coupon fully claimed |
| `invalid_pin` | Wrong 6-digit PIN |
| `already_redeemed` | Coupon already used |
