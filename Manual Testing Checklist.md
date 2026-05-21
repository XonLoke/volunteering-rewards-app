# Manual Testing Checklist — Sprint 2

> **Purpose:** Verify that all working features behave correctly before the mid-sprint checkpoint (25 May).
> **Prerequisites:** Backend running (`cd backend && npm run dev`) + Web portals running (`cd frontend/web_portals && npm run dev`).

---

## 1. Auth API — Owner: Xon

Open a terminal and test each endpoint:

### 1.1 Login — Admin
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"carol@test.com","password":"password123"}'
```
- [ ] Returns `{ user: { ... }, token }` with status 200
- [ ] `user.role` is `"admin"`
- [ ] Token is a valid JWT (3 dot-separated segments)

### 1.2 Login — Organiser
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"bob@test.com","password":"password123"}'
```
- [ ] Returns 200 with `user.role` = `"organizer"`

### 1.3 Login — Volunteer
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@test.com","password":"password123"}'
```
- [ ] Returns 200 with `user.role` = `"volunteer"`

### 1.4 Login — Invalid Password
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"carol@test.com","password":"wrongpass"}'
```
- [ ] Returns 401 with `error.code` = `"invalid_credentials"`

### 1.5 Token Refresh
```bash
# First, save your login token:
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"carol@test.com","password":"password123"}' | node -e "process.stdin.on('data', d => console.log(JSON.parse(d).token))")

# Then refresh:
curl -X POST http://localhost:3000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN"
```
- [ ] Returns 200 with a new token pair

### 1.6 Profile (authenticated)
```bash
curl http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer $TOKEN"
```
- [ ] Returns 200 with user object

### 1.7 Register — Volunteer
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@test.com","password":"Password1","phone":"+6591234567","password_confirm":"Password1"}'
```
- [ ] Returns 201 with user and token
- [ ] Cleanup: Delete test user if possible, or note as created

### 1.8 Register — Organiser
```bash
curl -X POST http://localhost:3000/api/auth/register/organiser \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Org","email":"testorg@test.com","password":"Password1","phone":"+6591234567","password_confirm":"Password1","organisation_name":"Test Charity Ltd","organisation_type":"charity"}'
```
- [ ] Returns 201 with `user.organisation.status` = `"pending_approval"`

### 1.9 Rate Limiting
```bash
# Send 11 rapid requests:
for i in $(seq 1 11); do
  curl -s -o /dev/null -w "%{http_code}\n" -X POST http://localhost:3000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"carol@test.com","password":"wrongpass"}'
done
```
- [ ] Request 11 returns 429 (`rate_limited`)

---

## 2. Events API — Owner: Vivian

Save a volunteer token:
```bash
VTOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@test.com","password":"password123"}' | node -e "process.stdin.on('data', d => console.log(JSON.parse(d).token))")
```

### 2.1 Browse Events
```bash
curl http://localhost:3000/api/events -H "Authorization: Bearer $VTOKEN"
```
- [ ] Returns 200 with `{ data: [...], total, page, limit, total_pages }`
- [ ] Data contains the 3 seeded events

### 2.2 Event Categories
```bash
curl http://localhost:3000/api/events/categories -H "Authorization: Bearer $VTOKEN"
```
- [ ] Returns 200 with categories list

### 2.3 Event Detail
```bash
curl http://localhost:3000/api/events/1 -H "Authorization: Bearer $VTOKEN"
```
- [ ] Returns 200 with event data

---

## 3. Rewards API — Owner: Grace

### 3.1 Browse Rewards
```bash
curl http://localhost:3000/api/rewards -H "Authorization: Bearer $VTOKEN"
```
- [ ] Returns 200 with rewards list

### 3.2 Reward Detail
```bash
curl http://localhost:3000/api/rewards/1 -H "Authorization: Bearer $VTOKEN"
```
- [ ] Returns 200 with reward data

---

## 4. Admin Portal — Owner: Xon (http://localhost:5173)

### 4.1 Login Page
- [ ] Open http://localhost:5173/admin/login
- [ ] Shows login form with email, password, Sign In button
- [ ] Shows test credentials hint at bottom

### 4.2 Login — Admin (happy path)
- [ ] Enter `carol@test.com` / `password123`
- [ ] Click Sign In
- [ ] Redirects to /admin (dashboard)
- [ ] Dashboard shows metrics (Total Users, Total Organisers, etc.)
- [ ] Recent Activity feed renders (or shows "No recent activity")

### 4.3 Login — Wrong credentials
- [ ] Enter wrong email/password
- [ ] Shows error message in red panel
- [ ] Stays on login page

### 4.4 Login — Non-admin user
- [ ] Try logging in as `alice@test.com` / `password123`
- [ ] Shows "Access denied. This portal is for admin users only"
- [ ] Stays on login page

### 4.5 Dashboard
- [ ] Stats cards render with numbers
- [ ] Activity feed section visible
- [ ] Sidebar navigation shows all sections

### 4.6 Users Page
- [ ] Navigate to /admin/users
- [ ] Table shows all users (Alice, Bob, Carol + any newly registered)
- [ ] Search bar works (type to filter)
- [ ] Role filter dropdown works (All, volunteer, organizer, admin)
- [ ] Status filter works (All, Active, Disabled)
- [ ] Click "View" on a user → detail modal opens with stats
- [ ] Click "Suspend" on an active user → confirmation modal
- [ ] Confirm suspend → user status changes to disabled
- [ ] Click "Reactivate" on a disabled user → reactivates
- [ ] Pagination works if more than 15 users

### 4.7 Organisers Page
- [ ] Navigate to /admin/organisers
- [ ] Table shows organiser requests
- [ ] Switch tabs (Pending / Approved / Rejected) — each filters correctly
- [ ] Approve/reject buttons work

### 4.8 Events Page — Owner: Nurain
- [ ] Navigate to /admin/events
- [ ] Table shows seeded events
- [ ] Filter buttons (All, Upcoming, Past) work
- [ ] Click "▶" to expand event → participation panel loads
- [ ] Delete button works with confirmation

### 4.9 Coupons Page — Owner: Grace
- [ ] Navigate to /admin/coupons
- [ ] Shows coupon list

### 4.10 Redemptions Page — Owner: Grace
- [ ] Navigate to /admin/redemptions
- [ ] Shows redemption log (or empty state)

### 4.11 Rewards Config Page — Owner: Nurain
- [ ] Navigate to /admin/rewards-config
- [ ] Shows config form or empty state

### 4.12 QR Codes Page — Owner: Nurain
- [ ] Navigate to /admin/qr-codes
- [ ] Shows QR page

### 4.13 PIN Verify Page — Owner: Nurain
- [ ] Navigate to /admin/pin-verify
- [ ] Shows PIN entry form

### 4.14 Merchants Page — Owner: Nurain
- [ ] Navigate to /admin/merchants
- [ ] Shows merchant list or empty state

### 4.15 Campaigns Page — Owner: Nurain
- [ ] Navigate to /admin/campaigns
- [ ] Shows campaign page

### 4.16 Sidebar Navigation
- [ ] Click each nav item → page loads without errors
- [ ] Active nav item is highlighted
- [ ] Sidebar collapses on narrow viewport

### 4.17 Logout
- [ ] Click Logout button in topbar
- [ ] Token is cleared
- [ ] Redirected to login page on next navigation

---

## 5. Organiser Portal — Owner: Nurain (http://localhost:5173/organiser)

### 5.1 Login
- [ ] Login via `/admin/login` first, then navigate to `/organiser`

### 5.2 Dashboard
- [ ] Loads without crashes
- [ ] Shows organiser-specific stats

### 5.3 Events List
- [ ] Shows events created by this organiser
- [ ] Filter/pagination works

### 5.4 Create Event
- [ ] Form renders with all fields
- [ ] Submit creates event (or shows appropriate error if service not implemented)

### 5.5 Roster — Owner: Vivian
- [ ] Loads roster view
- [ ] Shows registered volunteers

### 5.6 Feedback — Owner: Vivian
- [ ] Loads feedback view
- [ ] Shows ratings/comments or empty state

### 5.7 Q&A — Owner: Nurain
- [ ] Loads Q&A view
- [ ] Shows questions with answer capability

### 5.8 Onsite Controller — Owner: Vivian
- [ ] Loads onsite controller page

---

## 6. Merchant Portal — Owner: Grace (http://localhost:5173/merchant)

### 6.1 Login Page
- [ ] Loads login form
- [ ] Enter credentials → redirected to PIN verify

### 6.2 PIN Verification
- [ ] 6-digit input field works
- [ ] Submit calls verify endpoint
- [ ] Shows success/error result

### 6.3 Redemption History
- [ ] Shows merchant's redemption log

---

## 7. Scanning App — Owner: Vivian (http://localhost:5173/scan)

### 7.1 Login
- [ ] Login form works
- [ ] Successful login → redirects to event selection

### 7.2 Event Selection
- [ ] Shows list of today's events

### 7.3 Scanner
- [ ] Camera viewfinder loads (or appropriate fallback)
- [ ] QR scan flow works

### 7.4 Roster
- [ ] Shows scanned-in volunteers

---

## 8. Mobile App — Owner: Vivian (Expo)

### 8.1 Start mobile app
```bash
cd frontend/mobile_app
npx expo start
```
- [ ] App launches in Expo Go (iOS and/or Android)

### 8.2 Onboarding Flow
- [ ] 3-step onboarding walkthrough displays on first launch
- [ ] Swipe through all 3 screens
- [ ] "Get Started" navigates to login/register

### 8.3 Registration
- [ ] Registration form displays
- [ ] Fill in name, email, phone, password
- [ ] Submit → user created, redirected to home

### 8.4 Login
- [ ] Login with `alice@test.com` / `password123`
- [ ] Success → redirected to home tab

### 8.5 Home Tab
- [ ] Shows welcome message
- [ ] Points balance displays
- [ ] Upcoming events section shows

### 8.6 Events Tab
- [ ] Browse events list loads
- [ ] Search works
- [ ] Category filters work
- [ ] Tap event → detail screen

### 8.7 Event Detail
- [ ] Event info displays
- [ ] Join/Leave button shows appropriate state

### 8.8 Profile Tab
- [ ] User info displays
- [ ] QR code renders
- [ ] Logout works

---

## 9. Error States — Owner: Everyone

### 9.1 Backend Down
- [ ] Stop backend (`Ctrl+C`)
- [ ] Open admin portal → pages show error state with "Retry" button
- [ ] Click Retry → error persists (backend is down)
- [ ] Restart backend → Retry → data loads

### 9.2 Invalid Routes
- [ ] Navigate to `http://localhost:5173/nonexistent` → redirects to `/admin`

### 9.3 Network Errors
- [ ] Disconnect network
- [ ] Interact with app → appropriate error displayed (not blank screen)

---

## Summary: Pass/Fail Log

| # | Test Area | Owner | Total Checks | Pass | Fail | Notes |
|---|-----------|-------|-------------|------|------|-------|
| 1 | Auth API | Xon | 9 | | | |
| 2 | Events API | Vivian | 3 | | | |
| 3 | Rewards API | Grace | 2 | | | |
| 4 | Admin Portal | Xon | 17 | | | |
| 5 | Organiser Portal | Nurain | 8 | | | |
| 6 | Merchant Portal | Grace | 3 | | | |
| 7 | Scan App | Vivian | 4 | | | |
| 8 | Mobile App | Vivian | 8 | | | |
| 9 | Error States | Everyone | 3 | | | |
| | **Total** | | **57** | | | |
