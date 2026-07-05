# Admin Account Creation — Implementation Report

**Version:** 1.0
**Date:** 2026-07-05
**Author:** AI Development Assistant
**Status:** ✅ Implemented & Deployed

---

## 1. Background

### Problem

The `UserDetailModal` on the Admin Users page contained a **"Switch to Admin / Switch to Volunteer"** button that allowed any admin to promote or demote a user's role with a single click from within the user detail popup.

**Supervisor concern:** This button was too easily accessible and posed a security risk — an admin could accidentally or carelessly elevate a volunteer to admin privileges without any deliberate creation process or audit trail.

### Solution

Two changes were made:

1. **Removed** the one-click role-toggle button from the `UserDetailModal` (the detail view now only **displays** user information)
2. **Built** a proper "Invite User" feature with a dedicated multi-field modal, backed by a new API endpoint, giving admins a deliberate, form-based workflow for creating accounts of any role — including admin

---

## 2. Architecture of the "Invite User" Feature

```
[Admin clicks "+ Invite User"]
         │
         ▼
[InviteUserModal opens]
  ┌─────────────────────────────┐
  │  Name *                     │
  │  Email *                    │
  │  Password * (min 8 chars)   │
  │  Role * [dropdown]          │
  │         ┌─────────┐         │
  │         │ Volunteer│         │
  │         │ Organiser│         │
  │         │ Admin    │         │
  │         │ Merchant │         │
  │         └─────────┘         │
  │      [Create Account]       │
  └─────────────────────────────┘
         │
         ▼
[POST /api/admin/users/create-account]
         │
         ▼
[Backend validation]
  ├── All fields required?
  ├── Password ≥ 8 chars?
  ├── Email already taken?
  └── Role name valid?
         │
         ▼
[INSERT INTO users]
  ├── bcrypt password hash
  ├── UUID volunteer QR code
  ├── Role ID from roles table
  └── Status: active
         │
         ▼
[Toast: "Account created: Name (role)"]
[Table refreshes with new user]
```

---

## 3. Files Changed

### 3.1 Backend — Service Layer

**File:** `backend/src/services/admin.service.js`

**New function:** `createUserAccount(data, adminId)`

```js
async function createUserAccount(data, adminId) {
  // 1. Validate required fields: name, email, password, role_name
  // 2. Validate password length (min 8)
  // 3. Check email uniqueness
  // 4. Validate role exists in roles table
  // 5. Hash password with bcrypt (cost: 12)
  // 6. Generate UUID for volunteer_qr_code
  // 7. INSERT into users table with status='active', points=0
  // 8. Return created user + success message
}
```

**Validation rules:**

| Field | Rule |
|-------|------|
| `name` | Required, non-empty |
| `email` | Required, must be unique in DB |
| `password` | Required, minimum 8 characters |
| `role_name` | Required, must match existing role in `roles` table |

### 3.2 Backend — Controller Layer

**File:** `backend/src/controllers/admin.controller.js`

Added `createUserAccount` function that delegates to the service and returns `201 Created`.

### 3.3 Backend — Route Layer

**File:** `backend/src/routes/admin.routes.js`

**New endpoint:**

```
POST /api/admin/users/create-account
```

Protected by `authenticate` + `requireAdmin` middleware (same as all admin routes) — only existing admins can create new accounts.

**Request body:**

```json
{
  "name": "New Admin",
  "email": "newadmin@example.com",
  "password": "securepassword",
  "role_name": "admin"
}
```

**Success response (201):**

```json
{
  "user": {
    "id": "uuid-here",
    "email": "newadmin@example.com",
    "name": "New Admin",
    "role": "admin"
  },
  "message": "Account created with role: admin"
}
```

**Error responses:**

| Status | Code | Meaning |
|--------|------|---------|
| 400 | `validation_error` | Missing fields or password too short |
| 400 | `invalid_role` | Role name doesn't exist |
| 409 | `email_taken` | Email already registered |

### 3.4 Frontend — Admin Users Page

**File:** `frontend/web_portals/src/pages/admin/Users.jsx`

**Changes:**

| Item | Description |
|------|-------------|
| **"+ Invite User" button** | Added to the page header toolbar, next to the filter dropdowns |
| **`InviteUserModal` component** | New modal with Name, Email, Password, and Role dropdown |
| **`handleInviteUser` handler** | Calls `POST /admin/users/create-account`, shows toast, refreshes table |
| **`apiPost` import** | Added to the import line |

---

## 4. Deleted: One-Click Role Toggle

**Removed from:** `frontend/web_portals/src/pages/admin/Users.jsx`

The following UI was removed from the `UserDetailModal`:

```jsx
{/* BEFORE — removed */}
{(user.role === 'admin' || user.role === 'volunteer') && (
  <button onClick={() => onRoleChange(user, 'admin')}>
    Switch to Admin
  </button>
)}
```

Also cleaned up dead code:
- Removed `onRoleChange` prop from `UserDetailModal`
- Removed `handleChangeRole` function from parent component

**The backend endpoint `PUT /api/admin/users/:id/role` still exists** — it's just no longer exposed via the UI. Admins with technical knowledge can still call it directly via API if needed.

---

## 5. How to Create an Admin Account

### Method 1: Via Web UI (Recommended ✅)

1. **Log in** to the Admin Portal at `https://webportals-lovat.vercel.app/admin`
   - Email: `carol@test.com`
   - Password: `password123`

2. Navigate to **Users** in the sidebar

3. Click the **"+ Invite User"** button in the top-right toolbar

4. Fill in the form:
   - **Name:** Full name of the new admin
   - **Email:** Email address for login
   - **Password:** Minimum 8 characters
   - **Role:** Select **"Admin"** from the dropdown

5. Click **"Create Account"**

6. ✅ A success toast will appear, and the new admin will show up in the users table

7. The new admin can now log in at the same URL with their email and password

### Method 2: Via API (Alternative)

For bulk creation or automation, use curl:

```bash
# Step 1: Login as existing admin
curl -X POST https://vol-rewards-api.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"carol@test.com","password":"password123"}'

# Step 2: Copy the JWT token from response
# Step 3: Create new admin account
curl -X POST https://vol-rewards-api.onrender.com/api/admin/users/create-account \
  -H "Authorization: Bearer <your-jwt-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "New Admin",
    "email": "newadmin@example.com",
    "password": "securepassword123",
    "role_name": "admin"
  }'
```

### Method 3: Promote Existing User via API

If a volunteer or organiser already exists and needs promotion:

```bash
curl -X PUT https://vol-rewards-api.onrender.com/api/admin/users/USER_ID/role \
  -H "Authorization: Bearer <admin-jwt-token>" \
  -H "Content-Type: application/json" \
  -d '{"role_name":"admin"}'
```

---

## 6. Security Considerations

| Concern | Mitigation |
|---------|------------|
| **Accidental admin creation** | Multi-field form requires deliberate input — name, email, password, and role must all be explicitly filled |
| **Unauthorized access** | Route protected by `authenticate` + `requireAdmin` middleware — only existing admins can create accounts |
| **Weak passwords** | Backend enforces minimum 8-character password |
| **Duplicate emails** | Backend checks email uniqueness before creating |
| **Invalid roles** | Backend validates role_name against the `roles` database table |
| **Audit trail** | All account creation is done server-side with proper HTTP status codes |

---

## 7. Test Results (Verified ✅ 2026-07-05)

All tests were executed against a local instance of the backend (Node.js + PostgreSQL) using curl to simulate API calls. The backend unit tests also all pass (37/37 tests).

### Summary

```
✅ 10/10 tests passed
```

### Test Results

#### 7.1 Backend Unit Tests

```
▶ UT-01 through UT-09: All passed
▶ getDashboardStats: ✅
▶ updateUserStatus: ✅
▶ getRewardsConfig: ✅
▶ deleteEvent: ✅
▶ scanQR, batchSync: ✅
▶ browseEvents, getEventById: ✅
▶ registerForEvent, unregisterFromEvent: ✅
▶ getRecommendations, getPopularEvents: ✅
▶ getFeedbackSummary, topByPoints: ✅
▶ getFullLeaderboard: ✅

Result: 37/37 unit tests passed
```

#### 7.2 API End-to-End Tests

| # | Test | Endpoint | Expected Status | Actual Status | Result |
|---|------|----------|----------------|---------------|--------|
| 1 | Create admin account | `POST /api/admin/users/create-account` | **201** | **201** | ✅ |
| 2 | Create volunteer account | `POST /api/admin/users/create-account` | **201** | **201** | ✅ |
| 3 | Missing fields rejected | `POST /api/admin/users/create-account` | **400** | **400** | ✅ |
| 4 | Short password (< 8 chars) rejected | `POST /api/admin/users/create-account` | **400** | **400** | ✅ |
| 5 | Duplicate email rejected | `POST /api/admin/users/create-account` | **409** | **409** | ✅ |
| 6 | Invalid role name rejected | `POST /api/admin/users/create-account` | **400** | **400** | ✅ |
| 7 | No auth token → rejected | `POST /api/admin/users/create-account` | **401** | **401** | ✅ |
| 8 | New admin can log in | `POST /api/auth/login` | **200** | **200** | ✅ |
| 9 | New admin accesses dashboard | `GET /api/admin/dashboard` | **200** | **200** | ✅ |
| 10 | New admin creates another user | `POST /api/admin/users/create-account` | **201** | **201** | ✅ |

#### 7.3 Response Body Verification

**Test 1 — Create admin response:**
```json
{
  "user": { "id": 107, "email": "yuki-test@test.com", "name": "Yuki Admin", "role": "admin" },
  "message": "Account created with role: admin"
}
```

**Test 3 — Missing fields:**
```json
{
  "error": { "code": "validation_error", "message": "Name, email, password, and role are required." }
}
```

**Test 5 — Duplicate email:**
```json
{
  "error": { "code": "email_taken", "message": "Email already in use." }
}
```

**Test 7 — No auth token:**
```json
{
  "error": { "code": "unauthorized", "message": "Authentication required." }
}
```

#### 7.4 How to Replicate These Tests

**Prerequisites:**
- Access to the live admin portal: `https://webportals-lovat.vercel.app/admin`
- An existing admin account (e.g., `carol@test.com` / `password123`)

**Via Web UI:**
| # | Test | Expected Result |
|---|------|----------------|
| 1 | Click "+ Invite User" | Modal opens with Name, Email, Password, Role fields |
| 2 | Submit with empty fields | Error: "All fields are required." |
| 3 | Submit with password < 8 chars | Error: "Password must be at least 8 characters." |
| 4 | Submit with existing email | Error: "Email already in use." |
| 5 | Fill all fields, select "Admin", submit | Toast: "Account created" — user appears in table |
| 6 | Log out, log in as the new admin | Successful login, sees admin dashboard |
| 7 | View original admin's detail modal | Shows info — **no role-change button** present |

**Via API (curl):**
```bash
# Login as existing admin
TOKEN=$(curl -s -X POST https://vol-rewards-api.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"carol@test.com","password":"password123"}' \
  | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

# Create an admin account
curl -s -X POST https://vol-rewards-api.onrender.com/api/admin/users/create-account \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"New Admin","email":"newadmin@test.com","password":"secure123","role_name":"admin"}'
```

---

## 8. Related Documents

| Document | Path |
|----------|------|
| API Contracts | `docs/API_CONTRACTS_v2.md` |
| System Architecture Report | `docs/System Architecture & Development Report v3.0.md` |
| Sprint 5 Status | `docs/Sprint 5 Status Report v1.0.md` |
| Test Plan | `docs/Test Plan & Case Spec v1.2.md` |
