# User Manual — Volunteering Rewards App

**Version:** 1.0  
**Date:** 6 July 2026  
**Project:** C3000C — Volunteering Rewards App  
**Applicable to:** All users and system administrators

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [System Overview](#2-system-overview)
3. [Getting Started](#3-getting-started)
4. [Volunteer Mobile App](#4-volunteer-mobile-app)
5. [Admin Web Portal](#5-admin-web-portal)
6. [Organiser Web Portal](#6-organiser-web-portal)
7. [Merchant / Cashier Portal](#7-merchant--cashier-portal)
8. [Scanner PWA](#8-scanner-pwa)
9. [Troubleshooting](#9-troubleshooting)
10. [Appendices](#10-appendices)

---

## 1. Introduction

### 1.1 About the App

The Volunteering Rewards App is a platform that connects volunteers with community events and rewards them for their participation. Volunteers can browse events, register to participate, earn points, and redeem rewards. Organisers can create and manage events. Merchants can verify reward redemptions. Administrators oversee the entire system.

### 1.2 Key Features

- **Event Discovery** — Browse and search for volunteering opportunities
- **QR Attendance** — Check in at events via QR code scanning
- **Points & Rewards** — Earn points for volunteering, redeem for vouchers
- **AI Recommendations** — Personalised event suggestions based on past participation
- **AI Feedback Summary** — Automated sentiment analysis of event feedback
- **Referral Program** — Earn bonus points by inviting friends
- **Leaderboard** — Hall of Fame showcasing top volunteers
- **Multiple Platforms** — Mobile App (PWA + Android APK), Web Portals

### 1.3 Target Audience

| Role | Description |
|------|-------------|
| **Volunteer** | Individuals who participate in community events |
| **Organiser** | Organisations that create and manage volunteer events |
| **Merchant / Cashier** | Businesses that process reward redemptions |
| **Scanner** | Event staff who scan volunteer QR codes for attendance |
| **Administrator** | System managers overseeing users, coupons, and configuration |

---

## 2. System Overview

### 2.1 Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     User Access                          │
├────────────┬───────────┬──────────┬──────────┬──────────┤
│ Volunteer  │  Admin    │Organiser │ Merchant │ Scanner  │
│ PWA / APK  │  Portal   │ Portal   │ Portal   │ PWA      │
├────────────┴───────────┴──────────┴──────────┴──────────┤
│              Vercel (Frontend Hosting)                    │
├─────────────────────────────────────────────────────────┤
│              Render (Backend API Server)                  │
├─────────────────────────────────────────────────────────┤
│              Neon (PostgreSQL Database)                   │
└─────────────────────────────────────────────────────────┘
```

### 2.2 Access URLs

| Portal | URL | Best Viewed On |
|--------|-----|----------------|
| **Volunteer PWA** | `https://volunteering-rewards-app.vercel.app` | Mobile phone |
| **Admin Portal** | `https://webportals-lovat.vercel.app/admin` | Desktop |
| **Organiser Portal** | `https://webportals-lovat.vercel.app/organiser` | Desktop |
| **Merchant Portal** | `https://webportals-lovat.vercel.app/merchant` | Phone / Desktop |
| **Scanner PWA** | `https://webportals-lovat.vercel.app/scan` | Mobile phone |
| **API Health** | `https://vol-rewards-api.onrender.com/api/health` | Any browser |

### 2.3 Test Accounts

All passwords: `password123`

| Role | Name | Email |
|------|------|-------|
| Admin | Carol Admin | carol@test.com |
| Organiser | Bob Organizer | bob@test.com |
| Merchant | Cheryl Merchant | cheryl@test.com |
| Merchant | Diana Merchant | diana@test.com |
| Volunteer | Alice Volunteer | alice@test.com |
| Volunteer | Eve Volunteer | eve@test.com |

---

## 3. Getting Started

### 3.1 Accessing the Volunteer App

**Option A — PWA (Progressive Web App):**

1. Open `https://volunteering-rewards-app.vercel.app` on your mobile browser
2. The app loads immediately — no installation needed
3. For offline access: tap the browser menu and select "Add to Home Screen"

**Option B — Android APK (Native App):**

1. Download the APK file from the project's release folder
2. On your Android device, open Settings → Security → enable "Install from unknown sources"
3. Open the downloaded APK file and tap "Install"
4. Once installed, open "Volunteering Rewards" from your app drawer

### 3.2 Creating an Account

1. Open the Volunteer App
2. Tap "Get Started" or "Create an account"
3. Fill in:
   - **Name** — Your full name (min. 2 characters)
   - **Email** — A valid email address
   - **Phone** — Singapore number (optional, e.g. +6581234567)
   - **Password** — At least 8 characters with one uppercase letter and one number
   - **Confirm Password** — Re-enter your password
4. Tap "Create Account"
5. You are automatically logged in and redirected to the Home screen

### 3.3 Logging In

1. Open the app and tap "Login"
2. Enter your email and password
3. Tap "Login"
4. You are redirected to the Home screen with your points balance displayed

---

## 4. Volunteer Mobile App

### 4.1 Home Screen

The Home screen is your dashboard. It displays:

- **Points Wallet** — Your current points balance at the top
- **Quick Actions** — Scan (QR), Redeem (rewards), Coupons (my coupons)
- **Your Bookings** — Upcoming events you have registered for (tap to manage)
- **Featured Events** — Horizontal scroll of recommended events
- **My Coupons Banner** — Quick link to your active coupons
- **Latest Updates** — Notifications and announcements

### 4.2 Navigation (Bottom Tab Bar)

| Tab | Icon | Purpose |
|-----|------|---------|
| **Home** | 🏠 | Dashboard with wallet, bookings, and featured events |
| **Events** | 📅 | Browse and search all available events |
| **Top** | 🏆 | Hall of Fame leaderboard (points, events, check-ins, redemptions) |
| **Rewards** | ⭐ | Browse rewards catalogue and redeem points |
| **Profile** | 👤 | View profile, QR code, settings, and logout |

### 4.3 Events

**Browsing Events:**
1. Tap the "Events" tab
2. Events are displayed as a scrollable list with:
   - Event title, date, location
   - Category badge (Environment, Community, Elderly, etc.)
   - Points value and capacity indicator
   - A "Join" button if spots are available
3. Use the search bar to find events by keyword
4. Tap an event card to view full details

**Joining an Event:**
1. Tap an event card to open the detail screen
2. Review the event description, date, time, location, and capacity
3. Tap "Join Event" to register
4. The event appears under "Your Bookings" on the Home screen
5. To cancel: Go to Home → Your Bookings → Manage → Cancel Booking

### 4.4 QR Code for Attendance

1. Go to the Home screen
2. Your QR code is displayed on your Profile page
3. At the event, show this QR code to the organiser or scanner
4. The organiser scans your QR code to mark your attendance
5. Points are automatically credited to your account

### 4.5 Rewards Catalogue

1. Tap the "Rewards" tab
2. Browse available rewards (vouchers, food sets, etc.)
3. Each reward shows:
   - Title and description
   - Points required
   - Remaining quantity
   - Expiry date
4. Tap a reward to see full details
5. Tap "Redeem" if you have enough points
6. Confirm the redemption
7. A **6-digit PIN** is displayed — this is your voucher code
8. The coupon is saved to "My Coupons"

### 4.6 My Coupons

1. From Home, tap "My Coupons" in the wallet actions
2. View all your redeemed coupons
3. Each coupon shows:
   - Reward title
   - Status (unused / used)
   - Expiry date
   - **6-digit PIN** (for merchant verification)
4. Tap a coupon to see full details

### 4.7 Leaderboard (Hall of Fame)

1. Tap the "Top" tab
2. View the **podium** showing the top 3 volunteers by points
3. Switch between categories:
   - **Top Points** — Volunteers with most points
   - **Most Events** — Volunteers who attended most events
   - **Most Check-ins** — Most attendance check-ins
   - **Most Redeemed** — Most points redeemed
4. Scroll through the ranked list below the podium

### 4.8 Referral Program

1. Go to your Profile → Sponsorship
2. Your referral link/code is displayed
3. Share it with friends
4. When a friend registers using your code, you earn bonus points
5. Two-tier referral: earn from direct referrals and their referrals

### 4.9 Profile & Settings

1. Tap the "Profile" tab
2. View your:
   - Name, email, phone number
   - Points balance
   - QR code for event attendance
3. Tap "Edit Profile" to update name, phone, or avatar
4. Tap "Settings" to configure notifications
5. Tap "Logout" to sign out

### 4.10 Notifications

1. Tap the bell icon on the Home screen header
2. View notifications about:
   - Event reminders
   - Points earned
   - Reward confirmations
   - System announcements

---

## 5. Admin Web Portal

### 5.1 Access

Open `https://webportals-lovat.vercel.app/admin` in a desktop browser.
Login with admin credentials (e.g., carol@test.com / password123).

### 5.2 Dashboard

After login, the dashboard displays:

- **Total Users** — Count of registered users
- **Active Events** — Currently active events count
- **Pending Organisers** — Organiser applications awaiting approval
- **Recent Activity** — Latest system events and transactions

### 5.3 Managing Users

**Viewing Users:**
1. Click "Users" in the sidebar
2. View a table of all users with columns: Name, Email, Role, Status, Created
3. Click "View" on any user to see their full profile

**Creating a User (Invite User):**
1. On the Users page, click "+ Invite User"
2. Fill in the form:
   - **Name** — Full name
   - **Email** — Email address
   - **Password** — Must be at least 8 characters
   - **Role** — Select from: Admin, Volunteer, Organiser, Merchant
3. Click "Create Account"
4. The user is created and can log in immediately

**Managing User Status:**
1. View a user's details
2. Their status is shown (active / pending / deactivated)
3. Admin can deactivate problematic accounts

### 5.4 Managing Organisers

1. Click "Organisers" in the sidebar
2. View a list of organiser applications
3. Pending organisers are shown with their organisation details
4. Click "View" to see their submitted information:
   - Organisation name, type, contact person
   - UEN (Unique Entity Number)
   - Supporting documents
5. Click "Approve" to activate the organiser
6. Click "Reject" if the application does not meet requirements

### 5.5 Managing Coupons

**Viewing Coupons:**
1. Click "Coupons" in the sidebar
2. Browse the list of coupon batches with:
   - Title, points required, quantity
   - Value, merchant, expiry date
   - Status (active / depleted)
3. Filter by status using chips: "All", "Active", "Depleted"

**Creating a Coupon Batch:**
1. Click "+ Create Coupon"
2. Fill in:
   - **Title** — Name of the reward (e.g., "$5 FairPrice Voucher")
   - **Description** — Optional details
   - **Points Required** — Cost in points
   - **Quantity** — Number of PINs to generate
   - **Value (cents)** — Monetary value in cents
   - **Merchant Name** — Partner merchant
   - **Expiry Date** — When coupons expire
3. Click "Create Coupon"
4. The system generates unique PINs for each unit

**Viewing PINs:**
1. Find a coupon in the list and click "PINs"
2. View all generated 6-digit PIN codes
3. Each PIN can be assigned to a volunteer upon redemption

### 5.6 Rewards Configuration

1. Click "Rewards Configuration" in the sidebar
2. View and edit:
   - **Points Per Dollar (PPD)** — Conversion rate for coupon values
   - **Min Redeem Points** — Minimum points required to redeem
   - **Max Redeem Per Day** — Redemption limit
   - **Default Event Points** — Points awarded for event attendance
3. Click "Save" to apply changes
4. Coupon point values update dynamically based on PPD

### 5.7 Managing Merchants

1. Click "Merchants" in the sidebar
2. View a list of registered merchants
3. Click "View" to see merchant details:
   - Business name, contact person
   - Contact email, phone
   - Business address
4. Merchants can be added through the merchant management interface

### 5.8 Redemption History

1. Click "Redemptions" in the sidebar
2. View a log of all coupon redemptions
3. Each entry shows:
   - Volunteer name
   - Coupon title
   - Points spent
   - Value redeemed
   - Date and time
   - Cashier who processed it
4. Use search and date filters to find specific transactions

---

## 6. Organiser Web Portal

### 6.1 Access

Open `https://webportals-lovat.vercel.app/organiser` in a desktop browser.
Login with organiser credentials (e.g., bob@test.com / password123).

### 6.2 Dashboard

After login, the dashboard displays:

- **Total Events** — Number of events created
- **Total Volunteers** — Registered volunteer count
- **Upcoming Events** — Count of upcoming events
- **Average Feedback** — Average rating from event feedback

Your upcoming events are listed below the stats.

### 6.3 Managing Events

**Viewing Events:**
1. Click "Events" in the sidebar
2. Browse your events with details: title, date, capacity, volunteers, status
3. Search and filter by status or date

**Creating an Event:**
1. Click "Create Event"
2. Fill in:
   - **Title** — Event name
   - **Description** — What volunteers will do
   - **Location** — Venue address
   - **Date & Time** — When the event takes place
   - **Capacity** — Maximum number of volunteers
   - **Points Value** — Points each volunteer earns
   - **Category** — Environment, Community, Elderly, etc.
3. Click "Create Event"
4. The event appears in your events list and is visible to volunteers

**Editing an Event:**
1. Find the event in your list and click "Edit"
2. Update any fields as needed
3. Click "Save"

**Cancelling an Event:**
1. Find the event and click "Cancel"
2. Confirm the cancellation
3. Registered volunteers are notified

### 6.4 Viewing Roster

1. Find an event and click "Roster"
2. View list of registered volunteers:
   - Name, email
   - Registration date
   - Attendance status (registered / attended / no-show)
3. Manually mark attendance if needed

### 6.5 Feedback & AI Summary

1. Find a completed event and click "Feedback"
2. View volunteer feedback entries
3. The **AI Feedback Summary** automatically analyses:
   - Overall sentiment (positive / neutral / negative)
   - Average rating
   - Top positive keywords
   - Suggestions from volunteers
4. This helps improve future events

---

## 7. Merchant / Cashier Portal

### 7.1 Access

Open `https://webportals-lovat.vercel.app/merchant` on a phone or desktop browser.
Login with merchant credentials (e.g., cheryl@test.com / password123).

### 7.2 Dashboard

After login, the dashboard displays:

- **Today's Redemptions** — Number of coupons redeemed today
- **Today's Value** — Total value of today's redemptions
- **Active Products** — Products available for redemption
- **Total Redemptions** — All-time redemption count
- **Popular Items** — Most redeemed items
- **Recent Activity** — Latest redemption transactions

### 7.3 Products Management

**Viewing Products:**
1. Click "Products" in the sidebar
2. Browse your product list with name, points cost, and status

**Creating a Product:**
1. Click "Add Product"
2. Fill in:
   - **Name** — Product name
   - **Description** — Optional details
   - **Points Cost** — Points required for redemption
3. Click "Create"
4. The product appears in your dashboard stats

**Editing a Product:**
1. Find the product and click "Edit"
2. Update name, description, or points cost
3. Click "Save"

**Deactivating a Product:**
1. Find the product and click "Deactivate"
2. The product is soft-deleted (hidden from active list)

### 7.4 PIN Verification (Redemption)

1. Click "Verify" in the sidebar
2. Enter the volunteer's **6-digit PIN** on the keypad
3. Tap "Verify"
4. The system displays coupon details:
   - Reward title
   - Volunteer name
   - Expiry date
5. Confirm the details and tap "Confirm Redemption"
6. The PIN is marked as used

### 7.5 Reversal (5-Minute Window)

1. If a redemption was made in error, tap "History"
2. Find the transaction and tap "Reverse"
3. This is only allowed within **5 minutes** of the redemption
4. After 5 minutes, contact an administrator for reversal

### 7.6 Redemption History

1. Click "History" in the sidebar
2. View all past redemptions processed by your store
3. Columns: Date, Coupon, Volunteer, Points, Value, Status
4. Use search to find specific transactions

---

## 8. Scanner PWA

### 8.1 Access

Open `https://webportals-lovat.vercel.app/scan` on a mobile phone.
Login with organiser credentials (e.g., bob@test.com / password123).

### 8.2 How It Works

The Scanner PWA is used by event staff to scan volunteer QR codes for attendance tracking. Each volunteer has a unique QR code displayed in their Profile screen.

### 8.3 Scanning a QR Code

1. Log in as an organiser
2. The camera viewfinder opens automatically
3. Select the event from the dropdown (if multiple events)
4. Point the camera at the volunteer's QR code
5. The scanner automatically detects and processes the code
6. On success: "Attendance recorded" message with volunteer name
7. Points are automatically awarded to the volunteer

### 8.4 Batch Scanning

For high-volume events:
1. Tap "Batch Mode"
2. Scan multiple volunteer QR codes in sequence
3. Review the scan log for any errors
4. Tap "Sync All" to process all scans at once

### 8.5 Past Events

1. The scanner shows a list of your events
2. Past events display "Event has ended" state
3. If no events exist, a friendly "No events" message is shown

---

## 9. Troubleshooting

### 9.1 Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| **App won't load** | Backend server sleeping | Wait 30-60 seconds and refresh (free hosting spins down after inactivity) |
| **Login fails** | Incorrect credentials | Use the test accounts or reset password via admin |
| **Cannot register** | Email already taken | Use a different email or contact admin |
| **QR code not scanning** | Camera permissions denied | Grant camera access in browser/phone settings |
| **Points not showing** | Need to refresh | Pull down to refresh or restart the app |
| **PIN doesn't work** | Already used or expired | Check coupon status in My Coupons |
| **Event registration fails** | Event at capacity | Join a different event or check back if spots open |

### 9.2 Cold Start Warning

The backend server on Render's free tier spins down after 15 minutes of inactivity.
When accessing the app after a period of inactivity:

1. The page may load slowly (30-60 seconds)
2. You may see a temporary error
3. **Wait and refresh** — the server will start up
4. Subsequent requests will be fast

### 9.3 Browser Compatibility

| Browser | Volunteer PWA | Web Portals |
|---------|:------------:|:-----------:|
| Chrome (desktop) | ✅ Full support | ✅ Full support |
| Chrome (Android) | ✅ Full support | ✅ Full support |
| Safari (iOS) | ✅ Full support | ⚠️ Partial |
| Firefox | ✅ Full support | ✅ Full support |
| Edge | ✅ Full support | ✅ Full support |

### 9.4 Getting Help

- **System Administrator:** Contact Carol (admin) via the admin portal
- **Technical Support:** Contact the development team via GitHub Issues
- **Bug Reports:** Use the bug report template in `docs/` folder

---

## 10. Appendices

### 10.1 Glossary

| Term | Definition |
|------|------------|
| **PWA** | Progressive Web App — a website that can be installed like a native app |
| **APK** | Android Package Kit — native Android application file |
| **PIN** | 6-digit code used to verify reward redemption |
| **QR Code** | Quick Response code — scannable code for attendance tracking |
| **Points** | Virtual currency earned by volunteering |
| **PPD** | Points Per Dollar — conversion rate for reward values |
| **UAT** | User Acceptance Testing — verification that the system meets requirements |

### 10.2 Keyboard Shortcuts (Admin Portal)

| Action | Shortcut |
|--------|----------|
| Navigate to Dashboard | `Alt + 1` |
| Navigate to Users | `Alt + 2` |
| Navigate to Coupons | `Alt + 3` |
| Navigate to Organisers | `Alt + 4` |
| Navigate to Merchants | `Alt + 5` |
| Navigate to Redemptions | `Alt + 6` |
| Refresh current page | `Ctrl + R` |

### 10.3 API Endpoints (For Developers)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | Server health check |
| `/api/auth/login` | POST | User authentication |
| `/api/auth/register` | POST | New volunteer registration |
| `/api/events` | GET | Browse events |
| `/api/leaderboard` | GET | Hall of Fame rankings |
| `/api/ai/recommendations` | GET | AI-powered event recommendations |
| `/api/ai/feedback-summary/:id` | GET | AI feedback analysis |

For the full API reference, see `docs/API_CONTRACTS_v2.md`.

### 10.4 Document References

- **System Architecture:** `docs/System Architecture & Development Report v3.2.md`
- **Test Plan:** `docs/Test Plan & Case Spec v2.1.md`
- **AI Development Guide:** `docs/AI_DEVELOPMENT_GUIDE_V2.1.md`
- **APK Testing Guide:** `docs/apk-testing-guide_V5.1.md`
- **Security Report:** `docs/System Security Status Report v1.0.md`

---

*— End of User Manual v1.0 —*

**Project:** Volunteering Rewards App (C3000C)  
**Repository:** https://github.com/XonLoke/volunteering-rewards-app  
**Author:** Xon Loke (Technical Lead)
