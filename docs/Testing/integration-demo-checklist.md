# Integration Demo Checklist â€” Cross-Portal Data Flow Verification

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

## Demo Flow 1: Admin â†” Organiser

| # | Action | Expected Result | âœ“ |
|---|--------|-----------------|---|
| 1.1 | **Admin:** Log in â†’ go to Organisers page | List shows Bob with org status (approved/pending) | â˜ |
| 1.2 | **Admin:** View Events page | Bob's events are listed (e.g., "Beach Cleanup @ East Coast") | â˜ |
| 1.3 | **Admin:** View User Detail for Bob | Bob's role, status, and org details visible | â˜ |
| 1.4 | **Organiser (Bob):** Log in â†’ Dashboard | Dashboard loads with Bob's event stats and upcoming events | â˜ |
| 1.5 | **Organiser:** Create a new event | Event is created successfully | â˜ |
| 1.6 | **Admin:** Refresh Events page | The new event appears in the admin event list | â˜ |
| 1.7 | **Organiser:** Delete the test event | Event is removed | â˜ |
| 1.8 | **Admin:** Refresh â†’ event is gone | Event no longer visible to admin | â˜ |

---

## Demo Flow 2: Admin â†” Volunteer

| # | Action | Expected Result | âœ“ |
|---|--------|-----------------|---|
| 2.1 | **Admin:** Go to Users page | List shows Alice (volunteer) | â˜ |
| 2.2 | **Admin:** Click Alice â†’ View details | Points, events attended, status visible | â˜ |
| 2.3 | **Admin:** View Rewards Configuration | Points-per-dollar config is displayed | â˜ |
| 2.4 | **Volunteer (Alice):** Log into PWA | Dashboard/profile loads | â˜ |
| 2.5 | **Volunteer:** Browse events | Events created by organiser are visible | â˜ |
| 2.6 | **Volunteer:** View event detail | Event info, date, capacity displayed | â˜ |
| 2.7 | **Volunteer:** Register for an event | Registration succeeds | â˜ |
| 2.8 | **Admin:** View the event's participation data | Shows Alice as registered | â˜ |
| 2.9 | **Volunteer:** Submit feedback (rating+comment) | Feedback submitted | â˜ |
| 2.10| **Organiser:** View feedback for the event | Alice's feedback visible | â˜ |

---

## Demo Flow 3: Admin â†” Merchant

| # | Action | Expected Result | âœ“ |
|---|--------|-----------------|---|
| 3.1 | **Admin:** Go to Merchants page | List shows Cheryl's merchant business | â˜ |
| 3.2 | **Admin:** View Merchant detail | Business info, contact details visible | â˜ |
| 3.3 | **Admin:** Go to Coupons page | Coupon batches listed with quantities | â˜ |
| 3.4 | **Admin:** Create a new coupon batch | Coupon created successfully | â˜ |
| 3.5 | **Admin:** View generated PINs | PINs visible for the coupon batch | â˜ |
| 3.6 | **Admin:** View Redemptions page | Redemption history visible (even if empty) | â˜ |
| 3.7 | **Merchant (Cheryl):** Log into Merchant Portal | Dashboard loads with merchant info | â˜ |
| 3.8 | **Merchant:** View Products | Products listed (or "no products" message) | â˜ |
| 3.9 | **Merchant:** View Redemption History | Shows past redemptions (or empty state) | â˜ |

---

## Demo Flow 4: Organiser â†” Scanner â†” Volunteers

| # | Action | Expected Result | âœ“ |
|---|--------|-----------------|---|
| 4.1 | **Organiser (Bob):** Log into Scanner portal | Scanner UI ready to scan | â˜ |
| 4.2 | **Organiser:** View Today's event stats | Shows registered/checked-in counts | â˜ |
| 4.3 | **Volunteer:** Show QR code in PWA | QR code visible on profile | â˜ |
| 4.4 | **Scanner:** Scan Alice's QR code | Check-in recorded successfully | â˜ |
| 4.5 | **Organiser:** Check event roster | Alice shows as checked-in | â˜ |
| 4.6 | **Organiser:** View event stats page | Check-in count updated | â˜ |

---

## Demo Flow 5: Merchant Coupon Redemption

| # | Action | Expected Result | âœ“ |
|---|--------|-----------------|---|
| 5.1 | **Admin:** Create coupon batch for $5 Voucher (100 pts) | Coupon created with PINs | â˜ |
| 5.2 | **Admin:** Copy a PIN code | PIN visible in admin panel | â˜ |
| 5.3 | **Merchant:** Enter PIN in verification page | PIN verified â†’ coupon details shown | â˜ |
| 5.4 | **Merchant:** Redeem the coupon | Redemption succeeds | â˜ |
| 5.5 | **Volunteer:** Check points balance | Points deducted by coupon value | â˜ |
| 5.6 | **Merchant:** View redemption history | New redemption entry visible | â˜ |
| 5.7 | **Admin:** View Redemptions page | Same redemption visible to admin | â˜ |

---

## Demo Flow 6: Leaderboard & Hall of Fame

| # | Action | Expected Result | âœ“ |
|---|--------|-----------------|---|
| 6.1 | **Admin:** View Dashboard | Stats load (users, events, merchants counts) | â˜ |
| 6.2 | **Volunteer:** Check Leaderboard | Rankings visible (if multiple volunteers) | â˜ |
| 6.3 | **Organiser:** Check dashboard stats | Their event stats shown | â˜ |

---

## Checklist For Demo Success

- [ ] All 5 browser tabs open and logged in beforehand
- [ ] API health confirmed: https://vol-rewards-api.onrender.com/api/health
- [ ] Automated test run first: `node backend/tests/integration/Integration.test.js`
- [ ] Screen capture ready (if recording)
- [ ] Backup plan: if live API down, use screenshots from last successful run

## APK / Android App Verification

| # | Action | Expected Result | âœ“ |
|---|--------|-----------------|---|
| 7.1 | **Volunteer:** Install APK on Android device | APK installs without errors | â˜ |
| 7.2 | **Volunteer:** Open the app | App loads, no blank screen | â˜ |
| 7.3 | **Volunteer:** Log in as alice@test.com / password123 | Login successful â†’ profile loads | â˜ |
| 7.4 | **Volunteer:** Browse events | Events list loads from API | â˜ |
| 7.5 | **Volunteer:** View event detail | Event info visible | â˜ |
| 7.6 | **Volunteer:** Check points balance | Shows correct points (should match PWA) | â˜ |
| 7.7 | **Volunteer:** Register for an event | Registration succeeds | â˜ |
| 7.8 | **Volunteer:** View profile / QR code | QR code visible for scanner | â˜ |
| 7.9 | **Cross-check:** Open PWA on browser | Same data displayed as in APK | â˜ |
| 7.10| **Cross-check:** Admin sees Alice's registration | Admin portal shows same registration | â˜ |

> **Key Assertion:** The APK and PWA share the same source (`frontend/mobile_app/`) and connect to the same API (`https://vol-rewards-api.onrender.com/api`). Any action visible in one should be visible in the other.

## Fallback: Quick Smoke Test

If time is limited, run the automated test first:

```bash
cd D:\c3000c\volunteering-rewards-app
node backend/tests/integration/Integration.test.js
```

Any failures = investigate before live demo. All green = portals are working together.

