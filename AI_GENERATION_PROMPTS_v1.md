# AI Generation Prompts — Sprint 2 Code Generation

> **Purpose:** Each member uses these prompts with their AI tool to generate their assigned modules.
> **Constraint:** All code must conform to the shapes in `API_CONTRACTS.md`. Do not deviate.
> **Process:** Generate → Self-review against the API contracts → Submit PR
> **Reference:** See `backend/src/routes/` and `backend/src/controllers/` for pre-created stub files.

---

## Xon — Backend Scaffold + Auth + CI/CD

### Context (feed to AI before prompting)

```
You are building the backend for a Volunteering Rewards App — a capstone project.
Tech stack: Node.js (Express), PostgreSQL, JWT auth, bcrypt.
The project already has:
- Express server in backend/index.js with middleware stack (CORS, helmet, rate limiter, error handler)
- Auth controller + service (register, login, refresh, profile) working
- 12 database migration files in backend/migrations/
- Seed script in backend/src/utils/seed.js
- JWT utility in backend/src/utils/jwt.js
- Middleware: auth.middleware.js, role.middleware.js, errorHandler.middleware.js, rateLimiter.middleware.js

Stub route and controller files already exist in:
- backend/src/routes/ (events, attendance, me, rewards, merchant, organiser, admin, favorites)
- backend/src/controllers/ (events, attendance, me, rewards, merchant, organiser, admin)
- backend/index.js has all routes registered

API contracts are in API_CONTRACTS.md at the project root.
```

### Prompts

**Prompt 1 — Admin Auth APIs**
```
Generate the following controllers in backend/src/controllers/admin.controller.js:

1. GET /api/admin/dashboard — Return stats (total_users, total_organisers, pending_approvals, total_coupons_issued_today, total_redemptions_today, users_growth_pct, coupons_growth_pct). Query the database for real counts where possible.

2. GET /api/admin/users — List all users with ?search=&role=&status=&page=1&limit=20. Support search by name/email. Return { data: [...], total, page, limit, total_pages }.

3. GET /api/admin/users/:id — Return full user detail including total events attended and total points earned/redeemed.

4. PUT /api/admin/users/:id — Update user fields (name, status, role). Body fields are optional.

5. DELETE /api/admin/users/:id — Set user status to 'disabled'.

6. GET /api/admin/organisers — List organisers with ?status=pending|approved|rejected. Include organisation_name, contact_name, documents.

7. PUT /api/admin/organisers/:id/approve — Set organiser status to approved/rejected. Body: { status, note }.

Reference API_CONTRACTS.md for exact response shapes. Use the pattern from auth.controller.js.
```

**Prompt 2 — Admin Rewards APIs**
```
Generate in backend/src/controllers/admin.controller.js:

1. GET /api/admin/events — List all events across all organisers. ?status=upcoming|past&page=1&limit=20.

2. DELETE /api/admin/events/:id — Delete event. Error if has registrations.

3. GET /api/admin/events/:id/participation — Return event data + registered/checked-in counts + average rating.

4. GET /api/admin/coupons — List coupon batches. ?status=active|used|expired&page=1&limit=20.

5. POST /api/admin/coupons — Create coupon batch. Auto-generate N unique 6-digit PINs. Body: { coupon_type, points_cost, value_cents, quantity, valid_from, valid_until }.

6. PUT /api/admin/coupons/:id — Update coupon fields (only before any redemptions).

7. DELETE /api/admin/coupons/:id — Delete batch (only if no redemptions).

8. GET /api/admin/rewards/configuration — Return points settings from a config table or env.

9. PUT /api/admin/rewards/configuration — Update points settings.

10. GET /api/admin/redemptions — View redemption history. ?page=1&limit=20&from=&to=.
```

**Prompt 3 — CI/CD + Docker**
```
Create/modify:
1. .github/workflows/ci.yml — GitHub Actions workflow that:
   - Runs on push to main and feature/* branches
   - Sets up Node 20 and PostgreSQL
   - Runs migrations
   - Runs npm test

2. Dockerfile — Multi-stage build for production

3. docker-compose.yml — App + PostgreSQL with health checks
```

---

## Member B — Backend API Endpoints

### Context (feed to AI before prompting)

```
You are building the backend API endpoints for a Volunteering Rewards App.
Tech stack: Node.js (Express), PostgreSQL, JWT auth, bcrypt, uuid.

The project structure:
- backend/src/routes/events.routes.js — Route stubs already exist with correct endpoints
- backend/src/controllers/events.controller.js — Empty controller stubs
- backend/src/controllers/attendance.controller.js — Empty stubs
- backend/src/controllers/rewards.controller.js — Empty stubs
- backend/src/controllers/merchant.controller.js — Empty stubs
- backend/src/services/ — Create service files here (e.g., event.service.js, attendance.service.js, coupon.service.js)

Database tables (12 migrations in backend/migrations/):
001_roles, 002_users, 003_organizations, 004_events, 005_event_registrations, 006_attendance_logs, 007_event_feedback, 008_event_qna, 009_favorites, 010_coupons, 011_user_coupons, 012_redemption_logs

All API contracts with exact request/response shapes are in API_CONTRACTS.md at the project root.

The auth.service.js pattern shows how to structure service files:
- Service functions call the database (pg pool query), throw errors for business logic failures
- Controllers call services, catch errors, send HTTP responses

Use this database query pattern:
  const pool = require("../config/database");
  const { v4: uuidv4 } = require("uuid");
  const result = await pool.query("SELECT * FROM table WHERE id = $1", [id]);
```

### Prompts

**Prompt 1 — Events Backend**
```
Generate event.service.js and implement all functions in events.controller.js:

1. GET /api/events — Browse events with search, category filter, date filter, pagination. Return events where date >= today for volunteers. Include spots_remaining and is_favorited for the current user (if authenticated).

2. GET /api/events/categories — Return hardcoded or DB-stored categories list.

3. GET /api/events/:id — Return full event detail. Include is_registered (check event_registrations table) and is_favorited (check favorites table) for current user.

4. POST /api/events/:id/register — Insert into event_registrations. Check: not already registered, event not full, event not past. Use a transaction to decrement spots in a race-condition-safe way.

5. DELETE /api/events/:id/register — Delete from event_registrations. Check: exists and not past.

6. POST /api/events/:id/feedback — Insert into event_feedback. Check: user is checked in, not already submitted feedback.

7. GET /api/events/:id/qna — Join event_qna with users to get question/answer pairs.

8. POST /api/events/:id/qna — Insert question into event_qna.

Error format: throw an error with a `statusCode` property (400/404/409) and a `code` string matching the API contracts. Use helper from errorHandler.middleware.js.

Reference API_CONTRACTS.md for exact response shapes.
```

**Prompt 2 — Attendance + Me Backend**
```
Generate attendance.service.js and implement attendance.controller.js and me.controller.js:

Attendance:
1. POST /api/attendance/scan — Accept { volunteer_id, event_id, scanned_at }. Verify: volunteer is registered for event, not already checked in, event is today. Insert into attendance_logs and award points (update users.points_balance). Return volunteer details + points awarded.

2. POST /api/attendance/batch — Accept { scans: [{volunteer_id, event_id, scanned_at}], device_id }. Process each scan, skip duplicates (already_checked_in). Return results array with status per scan.

Me endpoints:
3. GET /api/me/events — Return upcoming (future date, not checked in) and past (checked in) events for current user. ?status=upcoming|past to filter.

4. GET /api/me/qr-code — Return { qr_data: "volunteer:" + user.id, volunteer_id, volunteer_name, expires_at: end of day }.

5. GET /api/me/points — Calculate balance (sum earned - sum redeemed). Return balance, total_earned, total_redeemed, and history (attendance_logs + redemption_logs) with pagination.

6. GET /api/me/coupons — Join user_coupons with coupons table. Return status based on valid_until and is_redeemed. ?status=active|used|expired filter.

7. GET /api/me/favorites — Return events that user has favorited.

8. POST /api/favorites/:id — Toggle: if favorite exists, delete it; else insert it. Return { event_id, is_favorited }.
```

**Prompt 3 — Rewards + Merchant Backend**
```
Generate coupon.service.js and implement rewards.controller.js and merchant.controller.js:

Rewards (volunteer-facing):
1. GET /api/rewards — Return all active coupons (not expired, quantity_remaining > 0). ?type=online|instore to filter.

2. POST /api/rewards/:id/redeem — Volunteer redeems a reward (online). Use a transaction: check user has enough points, check coupon has remaining quantity (SELECT ... FOR UPDATE to prevent race), deduct points from user, insert into user_coupons with a generated 6-digit PIN, increment quantity_used. Return the coupon with PIN and remaining points.

Merchant (coupon redemption):
3. POST /api/coupons/verify — Accept { pin, merchant_id }. Join user_coupons with coupons: check PIN exists, check not expired (valid_until), check not already redeemed (is_redeemed), check quantity_remaining > 0. Return coupon details or appropriate error.

4. POST /api/coupons/redeem — Accept { pin, merchant_id }. Mark user_coupon.is_redeemed = true, set redeemed_at, redeemed_by. Insert into redemption_logs. Increment coupons.quantity_used.

5. POST /api/coupons/reverse — Accept { redemption_id, merchant_id }. Check: redemption exists, was created < 5 min ago, belongs to this merchant. Reverse: set is_redeemed = false, null redeemed_at/redeemed_by, decrement quantity_used, insert reversal log.

6. GET /api/merchant/history — Return last 20 redemptions for this merchant's coupons with reverse window calculation (can_reverse = checked_in_at within 5 min).
```

**Prompt 4 — Organiser Backend**
```
Generate organiser.service.js and implement organiser.controller.js:

1. GET /api/organiser/dashboard — Return org info (from organizations table joined with users), stats (total events, upcoming events, total checked in, average rating from event_feedback), and recent check-in activity.

2. GET /api/organiser/events — Return events created by this organiser's organisation. ?status=upcoming|past|draft&page=1&limit=20. Include registered_count and checked_in_count.

3. POST /api/organiser/events — Create event with organiser's organisation_id. Validate required fields.

4. GET /api/organiser/events/:id — Return full event detail with stats (registered_count, checked_in_count).

5. PUT /api/organiser/events/:id — Update event. Check ownership.

6. DELETE /api/organiser/events/:id — Delete event. Error if has registrations.

7. GET /api/organiser/events/:id/roster — Join event_registrations with users. Include is_checked_in status. Return volunteer name, email, phone, registration time, check-in status.

8. GET /api/organiser/events/:id/feedback — Return feedback with volunteer names, average rating.

9. GET /api/organiser/events/:id/qna — Return unanswered questions first.

10. POST /api/organiser/events/:id/qna/:qid/answer — Update event_qna with answer and answered_at.
```

---

## Member C — Volunteer Mobile Frontend + Test Scaffolding

### Context (feed to AI before prompting)

```
You are building the volunteer mobile app for a Volunteering Rewards App.
The app is a static HTML/CSS/JS web app served by Express. See existing prototypes in:
- frontend/mobile_UI/User_Mobile_Prototype-·-5_14_2026/screens/

These prototypes show the visual design and layout. You need to convert them into live screens that call the backend API.

Design system:
- White background (#fff), accent colour: #2a9d8f
- Mobile frame: 390x844 viewport
- Status bar at top with time 9:41
- Font: -apple-system, BlinkMacSystemFont, system-ui, sans-serif
- Cards have white bg, subtle shadow, rounded corners (20px)

All API contracts with exact request/response shapes are in API_CONTRACTS.md at the project root.

Backend runs on the same origin (Express serves the frontend), so API calls are relative: fetch("/api/events").

Use a shared api.js helper:
  const API = {
    get: (path) => fetch(path).then(r => r.json()),
    post: (path, body) => fetch(path, { method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify(body) }).then(r => r.json()),
    // Include Authorization header from stored token
    authGet: (path, token) => fetch(path, { headers: {"Authorization": `Bearer ${token}`} }).then(r => r.json()),
    authPost: (path, body, token) => fetch(path, { method: "POST", headers: {"Content-Type":"application/json", "Authorization": `Bearer ${token}`}, body: JSON.stringify(body) }).then(r => r.json()),
  };
```

### Prompts

**Prompt 1 — Navigation Shell + Auth Screens**
```
Create the mobile app shell:

1. An index.html that serves as the app shell with:
   - Mobile frame (390x844 max) centered on the page
   - Status bar (9:41 time, signal/wifi/battery icons)
   - Tab-based navigation (bottom tab bar) after login: Events | My Events | Rewards | Profile
   - All screen content loads via JavaScript into a <main> container
   - Token management: store JWT in localStorage, redirect to login if expired

2. Create an api.js helper with authGet/authPost functions that attach the Bearer token.

3. Create these screens (each as a JS function that returns HTML):
   - Onboarding: 3-step walkthrough with "Skip" and "Next" buttons. Steps: Welcome → Find Causes → Earn & Redeem. On finish → navigate to Login.
   - Register: Form with name, email, phone, password, confirm password. Calls POST /api/auth/register. On success stores token and navigates to Events tab.
   - Login: Form with email, password, "Remember me" toggle. Calls POST /api/auth/login. On success stores token and navigates to Events tab.

Match the visual design from the prototypes at frontend/mobile_UI/User_Mobile_Prototype-·-5_14_2026/screens/01-onboarding.html and 02-register.html and 03-login.html.
```

**Prompt 2 — Events Screens**
```
Create these screens for the mobile app:

1. Event Store (browse): 
   - Search bar at top
   - Category filter chips (horizontal scroll): All, Environment, Elderly, Youth, etc.
   - Event cards: image placeholder, title, date, time, location, spots remaining, points badge
   - Pull events from GET /api/events with query params for search and category
   - Pull categories from GET /api/events/categories
   - "Favourite" heart icon on each card, calls POST /api/favorites/:id
   - Tap card → navigate to Event Detail

2. Event Detail:
   - Large image/header placeholder
   - Event title, organiser name, date, time, location
   - Map placeholder (grey box with location name)
   - "What to bring" list
   - "Join Event" button → POST /api/events/:id/register (or "Leave" if already registered)
   - Q&A section at bottom: list questions, "Ask a Question" button → POST /api/events/:id/qna
   - Fetch from GET /api/events/:id

3. My Events:
   - Tab toggle: Upcoming | Past
   - Upcoming: event cards with date, time, location, "Show QR Code" button
   - Past: event cards with points earned, "Leave Feedback" button
   - Fetch from GET /api/me/events?status=upcoming and ?status=past

Match the visual design from prototypes 04-event-store.html, 05-event-detail.html, 06-my-events.html.
```

**Prompt 3 — QR + Points + Rewards Screens**
```
Create these screens:

1. Check-in Screen:
   - Large QR code display (generate as a CSS grid or canvas from the qr_data string)
   - "Show this code to the event organiser" instruction text
   - Pending state while waiting for scan
   - On success check-in notification (poll GET /api/me/events or simulate with a button for demo)
   - Points earned confirmation

2. My QR Code & Points:
   - Personal QR code (volunteer's UUID encoded) — fetch from GET /api/me/qr-code
   - Points summary card: balance, total earned, total redeemed
   - Points history list with date, description, amount (+/-)
   - Fetch from GET /api/me/points

3. Rewards Catalog:
   - Tabs: Redeem Online | In Store
   - Reward cards: image, title, description, points cost, "Redeem" button
   - Fetch from GET /api/rewards?type=online or instore
   - Points balance at top

4. Reward Redeem / PIN Display:
   - Confirmation screen: "Redeem [reward name] for [points] points?"
   - Confirm button → POST /api/rewards/:id/redeem
   - Success screen: large PIN code display (6 digits, spaced out)
   - Show valid_until date and points remaining
   - "Back to Rewards" button

5. My Coupons:
   - List of redeemed coupons with PIN, status (active/used/expired), valid_until
   - Fetch from GET /api/me/coupons?status=active

Match designs from prototypes 07-checkin.html, 08-qr-points.html, 09-rewards.html.
```

**Prompt 4 — Test Scaffolding**
```
Create the test infrastructure:

1. Install dev dependencies: jest, supertest
2. Create backend/src/tests/setup.js — Test database connection + migration runner
3. Create backend/src/tests/helpers.js — Auth helper (register test user, get token)
4. Create backend/src/tests/api/events.test.js — Test GET /api/events returns array
5. Create backend/src/tests/api/auth.test.js — Test register + login flow
6. Update backend/package.json scripts: "test": "jest --coverage"

Use the pattern:
```js
const request = require("supertest");
const app = require("../../index");
```
```

---

## Member D — Organiser + Admin + Scanning + Merchant Frontend

### Context (feed to AI before prompting)

```
You are building four frontend apps for a Volunteering Rewards App.
All are static HTML/CSS/JS web apps served by Express.

Design system (see frontend/web_UI/ for reference):
- White/light grey background (#f5f4f0)
- Cards: white bg, subtle shadow, 10-12px padding, rounded corners
- Accent colour: #2a9d8f
- Font: -apple-system, BlinkMacSystemFont, system-ui, sans-serif
- For mobile apps: 390x844 viewport frame

All API contracts with exact request/response shapes are in API_CONTRACTS.md at the project root.
Backend runs on same origin, so API calls use relative paths: fetch("/api/...").

Use a shared api.js helper with authGet/authPost that attaches the Bearer token from localStorage.
```

### Prompts

**Prompt 1 — Organiser Web Portal (8 pages)**
```
Build the Organiser Web Portal. Each page is a standalone HTML file in frontend/web_UI/Organiser_Portal/.

1. login.html — Email + password form. Calls POST /api/auth/login. Stores token.
2. register.html — Organiser registration form with org name, type, document upload. POST /api/auth/register/organiser.
3. dashboard.html — Welcome message with org name, stats cards (total events, upcoming, checked-in count, avg rating). Fetch GET /api/organiser/dashboard. "New Event" button.
4. events.html — Table/list of events with status, date, registered/checked-in counts. "Create" button. Click → event-edit.html. Fetch GET /api/organiser/events.
5. event-edit.html — Create/edit form: title, description, date, time, location, points, capacity, what-to-bring. POST/PUT /api/organiser/events.
6. onsite-controller.html — Event selector dropdown, then QR scanner view (full-width camera) with manual entry fallback. Shows recent scans. POST /api/attendance/scan.
7. feedback.html — Event selector, then feedback list with ratings, comments, average rating. GET /api/organiser/events/:id/feedback.
8. assessment.html — Event selector with roster table showing registered vs checked-in volunteers. GET /api/organiser/events/:id/roster.

Reference existing prototype designs in frontend/web_UI/Organiser_Prototype-·-5_14_2026/ for visual layout.
```

**Prompt 2 — Admin Web Portal (9 pages)**
```
Build the Admin Web Portal. Each page in frontend/web_UI/Admin_Portal/.

1. login.html — Admin login. POST /api/auth/login.
2. dashboard.html — Metric cards (total users, organisers, pending approvals, coupons issued). Fetch GET /api/admin/dashboard. Quick action buttons.
3. users.html — Search bar + user table (name, email, role, status, points). Click → user detail modal or inline expand. GET /api/admin/users.
4. event-organisers.html — Organiser table with approve/reject buttons and document links. Approve → PUT /api/admin/organisers/:id/approve. GET /api/admin/organisers.
5. events.html — Event list across all organisers. Click → participation stats. GET /api/admin/events.
6. coupons.html — Coupon batch table with create button. Create modal: coupon_type, points_cost, value, quantity, dates. GET/POST /api/admin/coupons.
7. reward-system.html — Configuration form: points per dollar, min redeem, max daily. GET/PUT /api/admin/rewards/configuration.
8. redemptions.html — Redemption log table: coupon, volunteer, PIN, date, status. GET /api/admin/redemptions.
9. qr-codes.html — QR code records table (for tracking). GET /api/admin/qr-codes (if endpoint exists).

Use a sidebar navigation layout matching the prototypes in frontend/web_UI/Admin_Prototype-·-5_14_2026/.
Include a global search bar and notification bell in the top bar.
```

**Prompt 3 — Organiser Scanning App (mobile, 4 screens)**
```
Build the Organiser Scanning App as a mobile web app in frontend/scanning_app/.

1. event-select.html — Dropdown of today's events. Fetch GET /api/events/today. Show checked-in/total stats. "Start Scanning" button.
2. scanner.html — Full-width camera viewfinder using navigator.mediaDevices.getUserMedia and jsQR library. Scan frame overlay. Instructions: "Point camera at volunteer's QR code". Toggle to manual entry mode.
3. scan-result.html — Large checkmark animation on success. Volunteer name + photo. Event name + points awarded. "Scan Next" button. "Undo" button (POST /api/coupons/reverse for last scan).
4. attendance-list.html — Volunteer roster with check-in status badges. Pull GET /api/events/:id/roster. Tap name → manual check-in option. "Export" button.

Reference ORGANIZER_SCANNING_APP_SPEC.md for flow details.
Design as mobile-first (390x844 viewport).
```

**Prompt 4 — Merchant Redemption App (mobile, 3 screens)**
```
Build the Merchant Redemption App as a mobile web app in frontend/merchant_app/.

1. pin-entry.html — Large heading "Enter Coupon PIN". 6 separate digit input boxes. Numeric keypad. "Verify" button activates when 6 digits entered. POST /api/coupons/verify on submit.

2. verification-result.html — Success: green checkmark, coupon details (item name, value, expiry), "Redemption successful" message, "Process Next" button. After confirm → POST /api/coupons/redeem. Failure: red X with reason (Invalid PIN / Expired / Already redeemed), "Try Again" button.

3. history.html — Last 20 redemptions: date, time, coupon type, PIN preview, status. Tap → view details / reverse if within 5-min window. POST /api/coupons/reverse for reverse. GET /api/merchant/history.

Reference MERCHANT_REDEMPTION_APP_SPEC.md for flow details.
Design as mobile-first (390x844 viewport). Include success chime / error buzz (Web Audio API).
```

---

## Quick Reference: API Endpoints by Member

| Member | What to Build | API Contracts Section |
|--------|--------------|----------------------|
| **Xon** | Admin APIs, CI/CD, Docker | Admin Web Portal |
| **B** | Events, Attendance, Me, Rewards, Merchant, Organiser APIs | All sections |
| **C** | Volunteer mobile app (10 screens) + test suite | Volunteer Mobile App |
| **D** | Organiser portal (8), Admin portal (9), Scanning app (4), Merchant app (3) | Organiser, Admin, Scanning, Merchant |

---

## Code Generation Day Plan

| Day | Activity |
|-----|----------|
| **Day 1** | Generate all backend services + controllers (Member B + Xon) |
| **Day 2** | Generate volunteer mobile app screens (Member C) + Organiser/Admin portals (Member D) |
| **Day 3** | Generate scanning app + merchant app + test scaffolding (Member C + D) |
| **Day 4** | PR review pass — fix issues, ensure contracts match |
| **Day 5** | Buffer — address any remaining gaps |
