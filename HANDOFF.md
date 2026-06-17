# Handoff: Re-Seed Database, Verify Data, and Configure Portal URLs

**Handoff ID:** HO-20260616-011
**Date:** 16 June 2026
**From:** Cowork (Xon)
**To:** Claude Desktop Code / Project
**Project:** Volunteering Rewards App (C3000C)
**Location:** `D:\c3000c\volunteering-rewards-app`
**Repo:** https://github.com/XonLoke/volunteering-rewards-app
**Owner:** Xon

---

## Session Context

The frontend (Vercel) and backend (Render + Neon) are both deployed and login works. However:

1. **Render is still running old code** — the updated `seed.js` (8 users, 3 merchants, coupon value_cents) is on GitHub but Render hasn't been redeployed
2. **Merchants table is empty** — merchants exist in the `users` table (cheryl, diana, frank) but they have no records in the `merchants` table
3. **No coupons have PIN codes** — PINs are not auto-generated. The `init_coupons.js` script needs to be run or coupons need PIN generation logic
4. **The submit button text "Sign in" vs "Signing in..." typo** — minor but should be consistent

**All portal URLs work from the same Vercel domain:**
- Admin: `https://webportals-lovat.vercel.app/admin/login` → carol@test.com
- Organiser: `https://webportals-lovat.vercel.app/organiser` → bob@test.com
- Merchant: `https://webportals-lovat.vercel.app/merchant/login` → cheryl@test.com
- Scanner: `https://webportals-lovat.vercel.app/scan/events` → bob@test.com

---

## ✅ What's Already Done

- Frontend deployed at Vercel: `https://webportals-lovat.vercel.app`
- Backend deployed at Render: `https://vol-rewards-api.onrender.com`
- Database at Neon: working, tables created
- Login works (CORS fixed)
- `seed.js` updated with expanded data but NOT yet deployed
- Test credentials removed from login page

---

## 🎯 Task 1: Deploy Latest Code to Render

### Step 1 — Trigger manual deploy
- Go to Render dashboard: `https://dashboard.render.com`
- Web Service: `vol-rewards-api`
- Click **Manual Deploy → Deploy latest commit** (commit `188e70f` or latest)

### Step 2 — Wait for Live status (~3-5 minutes)

### Step 3 — Open Shell tab and re-seed
```bash
node src/utils/seed.js
```

### Step 4 — Verify the data
```bash
# Login as admin
curl -X POST https://vol-rewards-api.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"carol@test.com","password":"password123"}'

# Should return: Carol Admin (role: admin) with token
```

---

## 🎯 Task 2: Verify Post-Seed Data

After re-seeding, check:

| Check | Endpoint | Expected Result |
|-------|----------|----------------|
| Users count | `GET /api/admin/users` | 8 users (2 per role) |
| Merchants | `GET /api/admin/merchants` | 3 merchants: FairPrice, Kopitiam, GrabFood |
| Coupons | `GET /api/admin/coupons` | 3 coupons with `value_cents` and `merchant_name` |
| Events | `GET /api/events` (as alice) | 3 events listed |
| Sponsorship config | `GET /api/admin/sponsorship/configuration` | Returns `{direct:10, helped:4, upline:6}` |
| Redemption | `GET /api/admin/redemptions` | Empty list (no one redeemed yet — expected) |

### If data still shows only 4 users
Investigate why the ON CONFLICT DO NOTHING clause is skipping inserts. The seed uses `ON CONFLICT (email) DO NOTHING` — if the 4 original users already exist, the new 4 will NOT be added. Fix: run a delete first:
```sql
DELETE FROM users WHERE email IN ('eve@test.com','johnny@test.com','cheryl@test.com','diana@test.com','frank@test.com');
```
Then re-run seed.

Delete old merchants similarly:
```sql
DELETE FROM merchants;
```
Then re-run seed.

---

## 🎯 Task 3: Generate Coupon PINs

### Problem
The coupons exist in the `coupons` table but no PINs have been generated. The `user_coupons` table is empty. The "PINs" button shows "No pins available" because there are no user-assigned coupons with generated PINs.

### Fix
Run the init_coupons script in Render Shell:
```bash
node scripts/init_coupons.js
```

This should generate PIN codes for the coupons and assign them to the coupons table or user_coupons table.

### Acceptance Criteria
- [ ] `GET /api/admin/coupons/:id/pins` returns PIN codes for each batch
- [ ] The "PINs" button on the admin Coupons page shows PIN codes

---

## 🎯 Task 4: Verify Portal Routing

The React app has route-based portals. Verify each works:

| Route | Expected Behaviour |
|-------|-------------------|
| `https://webportals-lovat.vercel.app/admin/login` | Admin login → redirect to `/admin` |
| `https://webportals-lovat.vercel.app/admin` | Admin Dashboard (after login) |
| `https://webportals-lovat.vercel.app/organiser` | Organiser Dashboard (bob@test.com) |
| `https://webportals-lovat.vercel.app/merchant/login` | Merchant login → PIN verify page |
| `https://webportals-lovat.vercel.app/scan/events` | Scanner event selection → QR scanner |

If routes don't show the correct portal, check `App.jsx` router configuration — each layout (AdminLayout, OrganiserLayout, ScanLayout, MerchantLayout) needs its own path prefix.

---

## Technical Context

### Database Config
```javascript
// backend/src/config/database.js
host: process.env.DB_HOST
port: parseInt(process.env.DB_PORT, 10) || 5432
database: process.env.DB_NAME || "volunteering_rewards"
user: process.env.DB_USER || "postgres"
password: process.env.DB_PASSWORD || ""
ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : false
```

### Test Accounts
| Role | Email | Password |
|------|-------|----------|
| Admin | carol@test.com | password123 |
| Organiser | bob@test.com | password123 |
| Merchant | cheryl@test.com | password123 |
| Volunteer | alice@test.com | password123 |

### Environment Variables (Render)
- `DB_SSL=true` (Neon requires SSL)
- `CORS_ORIGINS=*` 
- `PIN_SECRET=volunteering-rewards-pin-secret-v1` (must match seed)

---

## Status Tracking

| Task | Status | Notes |
|------|--------|-------|
| Deploy latest code to Render | ⬜ Pending | Manual Deploy → Deploy latest commit |
| Re-seed database | ⬜ Pending | Render Shell: `node src/utils/seed.js` |
| Generate coupon PINs | ⬜ Pending | Run `scripts/init_coupons.js` |
| Verify merchants data | ⬜ Pending | Should show 3 merchants |
| Verify portal routing | ⬜ Pending | Admin, Organiser, Merchant, Scanner |
| Update HANDOFF.md | ⬜ Pending | When done |

---

## How to Use

1. Read this HANDOFF.md in full
2. Start with Task 1 — Deploy latest code to Render
3. Work through tasks in order
4. Update the Status Tracking table
5. Say "Database re-seed handoff complete" when ready to hand back to Cowork
