# Integration UAT Plan â€” Cross-Portal Integration Testing

**Version:** 1.0  
**Date:** 23 July 2026  
**Project:** Volunteering Rewards App (C3000C Capstone)  
**Purpose:** Live online UAT with supervisor Mr Andy Tao â€” verify all cross-portal data flows  
**Format:** Step-by-step, read aloud and check off as you go  

---

## System Design Note â€” QR vs PIN

Before testing, understand the two distinct flows:

| Flow | What | Who does it | How |
|------|------|-------------|-----|
| **Event Attendance** | Volunteer checks in at an event | **Organiser** scans volunteer's QR code | QR code on volunteer app â†’ Scanner PWA / Organiser Mobile camera |
| **Coupon Redemption** | Volunteer redeems reward at a store | **Merchant/Cashier** enters volunteer's PIN | 6-digit PIN on volunteer's app â†’ Merchant portal PIN verify page |

> **QR is for attendance only.** Coupon redemption is **exclusively PIN-based** â€” there is no QR scanning in the merchant/cashier flow. The Scanner PWA (`/scan`) is an organiser tool for event attendance, not a cashier tool.

## Test Participants & Assignments

| Person | Role | Portals / Apps | Device | URL / Link |
|--------|------|---------------|--------|------------|
| **John/Xon** | Tester & Coordinator | Admin Portal + all fallback accounts | Desktop browser | https://webportals-lovat.vercel.app/admin |
| **Vivian** | Volunteer Tester | Volunteer PWA (browser) + APK (Android) | Phone + Android device | PWA: https://volunteering-rewards-app.vercel.app <br> APK: https://github.com/XonLoke/volunteering-rewards-app/releases/download/v1.0.0-demo/volunteering-rewards-app-release.apk |
| **Nurain** | Organiser Tester | Organiser Portal + Scanner PWA + Organiser Mobile App | Desktop + Phone | Portal: https://webportals-lovat.vercel.app/organiser <br> Scanner: https://webportals-lovat.vercel.app/scan <br> Mobile: Organiser mobile app |
| **Grace** | Merchant/Cashier Tester | Merchant Portal (PIN verify, products, history) | Desktop + Phone | Merchant: https://webportals-lovat.vercel.app/merchant |

### Supervisor
| Person | Role |
|--------|------|
| **Mr Andy Tao** | Supervisor â€” observing and evaluating |

---

## Test Accounts (all passwords: `password123`)

| Role | Email | Used By |
|------|-------|---------|
| Admin (Carol) | carol@test.com | Xon |
| Organiser (Bob) | bob@test.com | Nurain (portal + scanner) |
| Volunteer (Alice) | alice@test.com | Vivian (PWA + APK) |
| Merchant (Cheryl) | cheryl@test.com | Grace |
| Volunteer 2 (Eve) | eve@test.com | Backup volunteer |

---

## Pre-Test Checklist

Before starting the UAT session:

- [ ] **API health check** â€” Everyone visit https://vol-rewards-api.onrender.com/api/health â†’ should see `{"status":"ok","timestamp":"..."}`
- [ ] **Cold start** â€” If slow (Render free tier), wait 30-60s and refresh
- [ ] **All portals open** â€” Each person has their assigned portal loaded and logged in
- [ ] **APK installed** â€” Vivian has the APK installed and can open it
- [ ] **Screen sharing** â€” Decide who shares screen (recommended: Xon shares main screen, others share on demand for their flows)
- [ ] **Bug recording** â€” Have a notepad ready; use template at end of this doc
- [ ] **Existing event confirmed** â€” Check there's at least one active event (or have Nurain create one in Section C)

---

## Integration Test Sections

---
### Section A: Admin â†” Volunteer (User App) Integration

**Covers:** Admin portal â†’ Volunteer data visibility, Volunteer PWA/APK â†’ Admin reflection  
**Involves:** Xon (Admin) + Vivian (Volunteer PWA + APK)

| # | Tester | Action | Expected Result | âœ“ |
|---|--------|--------|-----------------|---|
| A1 | **Xon** | Login as Admin â†’ go to Users page | List shows Alice (volunteer) among users | â˜ |
| A2 | **Xon** | Click Alice â†’ View Details | Alice's profile, points, event history visible | â˜ |
| A3 | **Xon** | Go to Rewards Configuration | Shows current points-per-dollar setting (default: 100) | â˜ |
| A4 | **Vivian** | Open Volunteer PWA on phone browser â†’ Login as alice@test.com | Home screen loads with points balance and events | â˜ |
| A5 | **Vivian** | Check profile â€” verify name "Alice", email displayed | Profile matches what Admin sees | â˜ |
| A6 | **Vivian** | Browse Events tab | Events list loads from API | â˜ |
| A7 | **Vivian** | Tap an event â†’ view details | Event info, date, location displayed | â˜ |
| A8 | **Vivian** | Tap "Join Event" to register | Registration succeeds with confirmation | â˜ |
| A9 | **Xon** | Admin â†’ Events â†’ find that event â†’ check roster | Shows Alice as registered participant | â˜ |
| A10 | **Vivian** | Go to Home â†’ check "My Bookings" section | The registered event appears | â˜ |
| A11 | **Vivian** | After event (or for a past event), submit feedback/rating | Feedback submitted successfully | â˜ |
| A12 | **Xon** | Admin â†’ check event feedback data | Feedback visible to admin | â˜ |
| A13 | **Vivian** | Check points balance on PWA | Balance displayed (may be 0 or starting points) | â˜ |
| A14 | **Vivian** | Open APK on Android â†’ Login as alice@test.com | APK loads, same data as PWA | â˜ |
| A15 | **Vivian** | Browse events on APK | Same events visible as PWA | â˜ |
| A16 | **Vivian** | Check profile/QR code on APK | QR code displays for scanning | â˜ |
| A17 | **Vivian** | Cross-check: Points on APK = Points on PWA | Both show identical balance | â˜ |

---
### Section B: Admin â†” Organiser Integration

**Covers:** Admin oversight of organisers, organiser event management reflected in admin  
**Involves:** Xon (Admin) + Nurain (Organiser)

| # | Tester | Action | Expected Result | âœ“ |
|---|--------|--------|-----------------|---|
| B1 | **Xon** | Admin â†’ Organisers page | List shows Bob (organiser) with status | â˜ |
| B2 | **Xon** | Click Bob â†’ View Details | Bob's org info, contact, status visible | â˜ |
| B3 | **Xon** | Admin â†’ Events page | Bob's existing events are listed | â˜ |
| B4 | **Nurain** | Login as Organiser (bob@test.com) â†’ Dashboard | Dashboard loads with event stats | â˜ |
| B5 | **Nurain** | Dashboard numbers check: total events, volunteers | Stats display correctly | â˜ |
| B6 | **Nurain** | Click "Create Event" â†’ fill: title, description, location, date, capacity (50), points (20), category | Form accepts all fields | â˜ |
| B7 | **Nurain** | Submit the event | Event created, appears in My Events list | â˜ |
| B8 | **Xon** | Admin â†’ refresh Events page | The new event appears with Bob as organiser | â˜ |
| B9 | **Nurain** | Click into the event â†’ Edit (change title or date) | Edit succeeds | â˜ |
| B10 | **Xon** | Admin â†’ refresh Events â†’ verify edited title | Change reflected in admin view | â˜ |
| B11 | **Nurain** | Go to Roster for the event | Shows registered volunteers (if any registered) | â˜ |
| B12 | **Nurain** | Delete the test event | Event removed | â˜ |
| B13 | **Xon** | Admin â†’ refresh Events â†’ verify deletion | Event gone from admin view | â˜ |

---
### Section C: Admin â†” Merchant Integration

**Covers:** Admin merchant oversight, coupon batch creation, merchant portal data  
**Involves:** Xon (Admin) + Grace (Merchant)

| # | Tester | Action | Expected Result | âœ“ |
|---|--------|--------|-----------------|---|
| C1 | **Xon** | Admin â†’ Merchants page | List shows Cheryl's business (e.g., "FairPrice Singapore") | â˜ |
| C2 | **Xon** | Click Cheryl â†’ View Details | Business info, contact details visible | â˜ |
| C3 | **Xon** | Admin â†’ Coupons page | Existing coupon batches listed | â˜ |
| C4 | **Xon** | Click "+ Create Coupon" â†’ Title="UAT Voucher $5", Value=$5, Quantity=3, set expiry 31 Dec 2026 | Form accepts input | â˜ |
| C5 | **Xon** | Click "Create" | Success: "Created 3 PINs" | â˜ |
| C6 | **Xon** | Find the new coupon batch â†’ click "PINs" | 3 unique 6-digit PINs displayed | â˜ |
| C7 | **Xon** | Copy one PIN for later use (Section E or F) | PIN noted down | â˜ |
| C8 | **Grace** | Login as Merchant (cheryl@test.com) â†’ Dashboard | Dashboard loads with merchant info | â˜ |
| C9 | **Grace** | Check Products page | Products listed (or "no products" message) | â˜ |
| C10 | **Grace** | Check Redemption History | Shows past redemptions (or empty state) | â˜ |
| C11 | **Xon** | Admin â†’ Redemptions page | Sees same redemption history | â˜ |
| C12 | **Xon** | Admin â†’ Sponsorship page | Sponsorship config accessible | â˜ |

---
### Section D: Organiser â†” Volunteer Event Lifecycle (QR Attendance)

**Covers:** Full event lifecycle â€” create â†’ discover â†’ register â†’ QR scan check-in â†’ feedback  
**Key flow:** Organiser uses Scanner PWA to scan volunteer's QR code for attendance check-in  
**Involves:** Nurain (Organiser + Scanner) + Vivian (Volunteer) + Xon (Admin)

| # | Tester | Action | Expected Result | âœ“ |
|---|--------|--------|-----------------|---|
| D1 | **Nurain** | Organiser Portal â†’ Create a new event: "UAT Live Test Event", location, capacity=10, points=30 | Event created | â˜ |
| D2 | **Vivian** | Volunteer PWA/APK â†’ Events tab â†’ pull to refresh | New event "UAT Live Test Event" visible | â˜ |
| D3 | **Vivian** | Tap the event â†’ view full details | Location, date, time, points, capacity all visible | â˜ |
| D4 | **Vivian** | Tap "Join Event" | Registration confirmed | â˜ |
| D5 | **Nurain** | Organiser â†’ Find event â†’ Roster | Shows 1 volunteer registered (Alice) | â˜ |
| D6 | **Nurain** | Organiser â†’ Check event stats page | Registered count shows 1 | â˜ |
| D7 | **Xon** | Admin â†’ that event's participation data | Shows Alice as registered, consistent | â˜ |
| D8 | **Nurain** | **Open Scanner PWA** (`/scan`) â†’ Login as bob@test.com | Scanner UI ready with camera | â˜ |
| D9 | **Nurain** | Scanner â†’ select "UAT Live Test Event" â†’ view stats | Shows registered=1, checked-in=0 | â˜ |
| D10 | **Vivian** | Volunteer PWA/APK â†’ show QR code from profile/scan page | QR code visible and scannable | â˜ |
| D11 | **Nurain** | Scanner â†’ scan Vivian's QR code with camera | Check-in recorded successfully âœ… | â˜ |
| D12 | **Nurain** | Organiser â†’ refresh event roster | Alice shows as checked-in âœ… | â˜ |
| D13 | **Nurain** | Scanner â†’ refresh event stats | Check-in count updated to 1 | â˜ |
| D14 | **Vivian** | Volunteer PWA/APK â†’ submit feedback for the event (rating + comment) | Feedback submitted | â˜ |
| D15 | **Nurain** | Organiser â†’ click "Feedback" on the event | Alice's feedback visible | â˜ |
| D16 | **Xon** | Admin â†’ check event feedback | Same feedback visible | â˜ |

---
### Section E: Merchant/Cashier â†” Volunteer Coupon Redemption

**Covers:** Full rewards lifecycle â€” redeem PIN â†’ verify â†’ redeem â†’ history  
**Involves:** Vivian (Volunteer) + Grace (Merchant/Cashier) + Xon (Admin)

**Pre-requisite:** At least one coupon batch with available PINs exists (from Section C or earlier)

| # | Tester | Action | Expected Result | âœ“ |
|---|--------|--------|-----------------|---|
| E1 | **Vivian** | Volunteer PWA/APK â†’ check current points | Points balance visible | â˜ |
| E2 | **Vivian** | Tap "Redeem" / go to Rewards catalogue | Available rewards listed with point costs | â˜ |
| E3 | **Vivian** | Select a reward â†’ tap "Redeem" | Confirmation prompt | â˜ |
| E4 | **Vivian** | Confirm redemption | Success screen with 6-digit PIN code | â˜ |
| E5 | **Vivian** | Note the PIN code (e.g., "179149") | PIN is 6 digits | â˜ |
| E6 | **Vivian** | Go to "My Coupons" | Shows the newly redeemed coupon with its PIN | â˜ |
| E7 | **Grace** | Merchant portal â†’ Enter the volunteer's 6-digit PIN â†’ tap "Verify" | Coupon details displayed (title, value, expiry) | â˜ |
| E8 | **Grace** | Tap "Confirm Redemption" | Redemption confirmed, PIN marked as used | â˜ |
| E9 | **Vivian** | Volunteer PWA â†’ check points balance | Points deducted by coupon value | â˜ |
| E10 | **Grace** | Merchant â†’ check Redemption History | New redemption entry visible | â˜ |
| E11 | **Xon** | Admin â†’ Redemptions page | Same redemption visible to admin | â˜ |
| E12 | **Grace** | Try to verify the same PIN again | Error: "Coupon already used" | â˜ |
| E13 | **Grace** | Enter an invalid PIN (e.g., "000000") â†’ Verify | Error: "Wrong 6-digit PIN" | â˜ |

---
### Section F: Organiser Mobile App Verification (if applicable)

**Covers:** Organiser mobile app data consistency with web portal  
**Involves:** Nurain (Organiser mobile) + Xon (Admin)

| # | Tester | Action | Expected Result | âœ“ |
|---|--------|--------|-----------------|---|
| F1 | **Nurain** | Open Organiser Mobile App â†’ Login as bob@test.com | App loads, dashboard with stats | â˜ |
| F2 | **Nurain** | Browse events on mobile | Same events as web portal | â˜ |
| F3 | **Nurain** | Check event roster for "UAT Live Test Event" | Shows Alice registered + checked-in (same data) | â˜ |
| F4 | **Nurain** | Verify stats match web portal dashboard | Consistent numbers | â˜ |

---
### Section G: Role-Based Access Control (RBAC)

**Covers:** Security boundaries â€” each role restricted to its own portal  
**Involves:** All team members

| # | Tester | Action | Expected Result | âœ“ |
|---|--------|--------|-----------------|---|
| G1 | **Vivian** | Try accessing Admin portal URL while logged in as volunteer | Access denied / redirect | â˜ |
| G2 | **Vivian** | Try accessing Organiser portal URL while logged in as volunteer | Access denied / redirect | â˜ |
| G3 | **Vivian** | Try accessing Merchant portal URL while logged in as volunteer | Access denied / redirect | â˜ |
| G4 | **Grace** | Try accessing Admin portal URL while logged in as merchant | Access denied / redirect | â˜ |
| G5 | **Grace** | Try accessing Organiser portal URL while logged in as merchant | Access denied / redirect | â˜ |
| G6 | **Nurain** | Try accessing Admin portal URL while logged in as organiser | Access denied / redirect (should go to organiser) | â˜ |
| G7 | **Xon** | Try accessing Volunteer PWA while logged in as admin | Should show volunteer data (this is normal â€” admin can view volunteer-facing UI) | â˜ |

---
### Section H: Cross-Portal Data Consistency Checks

**Covers:** Verify the same data looks identical across all portals  
**Involves:** All team members (compare in real-time)

| # | Action | How | Expected Result | âœ“ |
|---|--------|-----|-----------------|---|
| H1 | **Event count consistency** | Nurain (Organiser) announces total event count â†’ Xon (Admin) checks same | Both show identical number | â˜ |
| H2 | **Volunteer count consistency** | Xon (Admin) reads total volunteers â†’ Vivian confirms on PWA/APK profile count | Consistent | â˜ |
| H3 | **Points balance** | Vivian reads points balance on PWA â†’ check same on APK â†’ Xon checks in Admin | All three identical | â˜ |
| H4 | **Registration data** | Vivian registers for an event â†’ Nurain sees on roster â†’ Xon sees in admin | All three show same registration | â˜ |

---
### Section I: Email & Notification Flows

**Covers:** Email verification, forgot password, contact form  
**Involves:** Vivian (Volunteer) + Xon (Admin)

| # | Tester | Action | Expected Result | âœ“ |
|---|--------|--------|-----------------|---|
| I1 | **Xon** | Admin â†’ Email Config â†’ check current config | Shows Mailgun configured, sender name visible | â˜ |
| I2 | **Xon** | Click "Test Email" | Test email sent successfully | â˜ |
| I3 | **Vivian** | Volunteer PWA â†’ try "Forgot Password" on login screen | Redirects to forgot password page | â˜ |
| I4 | **Vivian** | Enter alice@test.com â†’ submit | "If account exists, email sent" message | â˜ |
| I5 | **Xon** | (If possible) Check email inbox for reset link | Reset email received (from Mailgun) | â˜ |
| I6 | **Vivian** | Volunteer PWA/APK â†’ Contact/Support page â†’ fill subject + message â†’ send | "Your message has been sent" | â˜ |
| I7 | **Xon** | (If possible) Check contact email arrived | Contact email received at volunteerrewardsapp@gmail.com | â˜ |

---

## Bug Reporting Template

If any step fails during the UAT, record it immediately:

```
### Bug Report
**Section:** [e.g., D11]
**Severity:** ðŸ”´ Critical / ðŸŸ¡ Major / ðŸŸ¢ Minor
**URL/App:** [URL or "APK"]
**Tester:** [Name]

**What you did:**
[Action performed]

**Expected:**
[What should happen]

**Actual:**
[What actually happened]

**Screenshot:** [Y/N]
```

### Severity Guide
| Severity | Meaning | Action |
|----------|---------|--------|
| ðŸ”´ Critical | Workflow blocked, data loss | Stop, notify team immediately |
| ðŸŸ¡ Major | Works but has issues | Report, continue testing |
| ðŸŸ¢ Minor | Cosmetic, non-blocking | Report at end of session |

---

## Post-UAT Wrap-Up

After completing all sections:

- [ ] **Review all bugs found** â€” assign fix priorities
- [ ] **Quick verbal summary** from each tester (1-2 min each)
- [ ] **Supervisor feedback** â€” Mr Andy Tao's observations
- [ ] **Save this document** with checkmarks filled in
- [ ] **Decide next steps** â€” fixes needed before final submission

---

## Quick Reference Card (during test)

| Portal | URL | Login |
|--------|-----|-------|
| Admin | https://webportals-lovat.vercel.app/admin | carol@test.com |
| Organiser | https://webportals-lovat.vercel.app/organiser | bob@test.com |
| Merchant | https://webportals-lovat.vercel.app/merchant | cheryl@test.com |
| Scanner | https://webportals-lovat.vercel.app/scan | bob@test.com |
| Volunteer PWA | https://volunteering-rewards-app.vercel.app | alice@test.com |
| APK Download | https://github.com/XonLoke/volunteering-rewards-app/releases/download/v1.0.0-demo/volunteering-rewards-app-release.apk | alice@test.com |
| API Health | https://vol-rewards-api.onrender.com/api/health | â€” |

All passwords: **password123**

---

*End of Integration Test Plan v1.0 â€” Good luck team! ðŸŽ¯*

