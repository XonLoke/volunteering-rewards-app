# Orchestration Demo Checklist — Cross-Portal Data Flow Verification

> **Purpose:** Step-by-step guide for the live demo showing all portals work together
> **Pre-req:** All test accounts ready (see below), API running, portals loaded

## Test Accounts

| Role | Email | Password | Portal URL |
|------|-------|----------|------------|
| Admin (Carol) | carol@test.com | password123 | https://webportals-lovat.vercel.app/admin |
| Organiser (Bob) | bob@test.com | password123 | https://webportals-lovat.vercel.app/organiser |
| Volunteer (Alice) | alice@test.com | password123 | https://volunteering-rewards-app.vercel.app |
| Merchant (Cheryl) | cheryl@test.com | password123 | https://webportals-lovat.vercel.app/merchant |
| Scanner (Bob) | bob@test.com | password123 | https://webportals-lovat.vercel.app/scan |

---

## Demo Flow 1: Admin ↔ Organiser

| # | Action | Expected Result | ✓ |
|---|--------|-----------------|---|
| 1.1 | **Admin:** Log in → go to Organisers page | List shows Bob with org status (approved/pending) | ☐ |
| 1.2 | **Admin:** View Events page | Bob's events are listed (e.g., "Beach Cleanup @ East Coast") | ☐ |
| 1.3 | **Admin:** View User Detail for Bob | Bob's role, status, and org details visible | ☐ |
| 1.4 | **Organiser (Bob):** Log in → Dashboard | Dashboard loads with Bob's event stats and upcoming events | ☐ |
| 1.5 | **Organiser:** Create a new event | Event is created successfully | ☐ |
| 1.6 | **Admin:** Refresh Events page | The new event appears in the admin event list | ☐ |
| 1.7 | **Organiser:** Delete the test event | Event is removed | ☐ |
| 1.8 | **Admin:** Refresh → event is gone | Event no longer visible to admin | ☐ |

---

## Demo Flow 2: Admin ↔ Volunteer

| # | Action | Expected Result | ✓ |
|---|--------|-----------------|---|
| 2.1 | **Admin:** Go to Users page | List shows Alice (volunteer) | ☐ |
| 2.2 | **Admin:** Click Alice → View details | Points, events attended, status visible | ☐ |
| 2.3 | **Admin:** View Rewards Configuration | Points-per-dollar config is displayed | ☐ |
| 2.4 | **Volunteer (Alice):** Log into PWA | Dashboard/profile loads | ☐ |
| 2.5 | **Volunteer:** Browse events | Events created by organiser are visible | ☐ |
| 2.6 | **Volunteer:** View event detail | Event info, date, capacity displayed | ☐ |
| 2.7 | **Volunteer:** Register for an event | Registration succeeds | ☐ |
| 2.8 | **Admin:** View the event's participation data | Shows Alice as registered | ☐ |
| 2.9 | **Volunteer:** Submit feedback (rating+comment) | Feedback submitted | ☐ |
| 2.10| **Organiser:** View feedback for the event | Alice's feedback visible | ☐ |

---

## Demo Flow 3: Admin ↔ Merchant

| # | Action | Expected Result | ✓ |
|---|--------|-----------------|---|
| 3.1 | **Admin:** Go to Merchants page | List shows Cheryl's merchant business | ☐ |
| 3.2 | **Admin:** View Merchant detail | Business info, contact details visible | ☐ |
| 3.3 | **Admin:** Go to Coupons page | Coupon batches listed with quantities | ☐ |
| 3.4 | **Admin:** Create a new coupon batch | Coupon created successfully | ☐ |
| 3.5 | **Admin:** View generated PINs | PINs visible for the coupon batch | ☐ |
| 3.6 | **Admin:** View Redemptions page | Redemption history visible (even if empty) | ☐ |
| 3.7 | **Merchant (Cheryl):** Log into Merchant Portal | Dashboard loads with merchant info | ☐ |
| 3.8 | **Merchant:** View Products | Products listed (or "no products" message) | ☐ |
| 3.9 | **Merchant:** View Redemption History | Shows past redemptions (or empty state) | ☐ |

---

## Demo Flow 4: Organiser ↔ Scanner ↔ Volunteers

| # | Action | Expected Result | ✓ |
|---|--------|-----------------|---|
| 4.1 | **Organiser (Bob):** Log into Scanner portal | Scanner UI ready to scan | ☐ |
| 4.2 | **Organiser:** View Today's event stats | Shows registered/checked-in counts | ☐ |
| 4.3 | **Volunteer:** Show QR code in PWA | QR code visible on profile | ☐ |
| 4.4 | **Scanner:** Scan Alice's QR code | Check-in recorded successfully | ☐ |
| 4.5 | **Organiser:** Check event roster | Alice shows as checked-in | ☐ |
| 4.6 | **Organiser:** View event stats page | Check-in count updated | ☐ |

---

## Demo Flow 5: Merchant Coupon Redemption

| # | Action | Expected Result | ✓ |
|---|--------|-----------------|---|
| 5.1 | **Admin:** Create coupon batch for $5 Voucher (100 pts) | Coupon created with PINs | ☐ |
| 5.2 | **Admin:** Copy a PIN code | PIN visible in admin panel | ☐ |
| 5.3 | **Merchant:** Enter PIN in verification page | PIN verified → coupon details shown | ☐ |
| 5.4 | **Merchant:** Redeem the coupon | Redemption succeeds | ☐ |
| 5.5 | **Volunteer:** Check points balance | Points deducted by coupon value | ☐ |
| 5.6 | **Merchant:** View redemption history | New redemption entry visible | ☐ |
| 5.7 | **Admin:** View Redemptions page | Same redemption visible to admin | ☐ |

---

## Demo Flow 6: Leaderboard & Hall of Fame

| # | Action | Expected Result | ✓ |
|---|--------|-----------------|---|
| 6.1 | **Admin:** View Dashboard | Stats load (users, events, merchants counts) | ☐ |
| 6.2 | **Volunteer:** Check Leaderboard | Rankings visible (if multiple volunteers) | ☐ |
| 6.3 | **Organiser:** Check dashboard stats | Their event stats shown | ☐ |

---

## Checklist For Demo Success

- [ ] All 5 browser tabs open and logged in beforehand
- [ ] API health confirmed: https://vol-rewards-api.onrender.com/api/health
- [ ] Automated test run first: `node backend/tests/integration/orchestration.test.js`
- [ ] Screen capture ready (if recording)
- [ ] Backup plan: if live API down, use screenshots from last successful run

## APK / Android App Verification

| # | Action | Expected Result | ✓ |
|---|--------|-----------------|---|
| 7.1 | **Volunteer:** Install APK on Android device | APK installs without errors | ☐ |
| 7.2 | **Volunteer:** Open the app | App loads, no blank screen | ☐ |
| 7.3 | **Volunteer:** Log in as alice@test.com / password123 | Login successful → profile loads | ☐ |
| 7.4 | **Volunteer:** Browse events | Events list loads from API | ☐ |
| 7.5 | **Volunteer:** View event detail | Event info visible | ☐ |
| 7.6 | **Volunteer:** Check points balance | Shows correct points (should match PWA) | ☐ |
| 7.7 | **Volunteer:** Register for an event | Registration succeeds | ☐ |
| 7.8 | **Volunteer:** View profile / QR code | QR code visible for scanner | ☐ |
| 7.9 | **Cross-check:** Open PWA on browser | Same data displayed as in APK | ☐ |
| 7.10| **Cross-check:** Admin sees Alice's registration | Admin portal shows same registration | ☐ |

> **Key Assertion:** The APK and PWA share the same source (`frontend/mobile_app/`) and connect to the same API (`https://vol-rewards-api.onrender.com/api`). Any action visible in one should be visible in the other.

## Fallback: Quick Smoke Test

If time is limited, run the automated test first:

```bash
cd D:\c3000c\volunteering-rewards-app
node backend/tests/integration/orchestration.test.js
```

Any failures = investigate before live demo. All green = portals are working together.
