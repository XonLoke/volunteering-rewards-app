# Organiser — QR Attendance Scanning Guide

**Version:** 1.0
**Date:** 2 July 2026
**Project:** Volunteering Rewards App (C3000C)
**Portal:** https://webportals-lovat.vercel.app/scan (Web) + Mobile App Controller

---

## 1. Overview

The Organiser's QR scanner is used for **event attendance check-in**. Volunteers
display their unique QR code, and the organiser scans it to record attendance and
award reward points.

> ⚠️ This is for **event attendance only** — NOT for coupon/merchant redemption.
> For reward redemption, use the PIN-based Merchant Portal.

### End-to-End Flow

```
Volunteer                       Organiser                      Backend
   │                               │                              │
   ├─ Opens QR pass in app ────────┤                              │
   │  Shows QR code                │                              │
   │  (VR_VOLUNTEER:<uuid>)        │                              │
   │                               │                              │
   │                               ├─ Scans QR code ─────────────┤
   │                               │  POST /attendance/scan       │
   │                               │  { event_id, qr_code_value } │
   │                               │◄── { points_awarded } ──────┤
   │                               │                              │
   │◄── Auto-detects attendance ───┤                              │
   │  GET /attendance/volunteer    │                              │
   │  /:id/latest?after=...       │                              │
   │◄── Navigates to success ──────┤                              │
```

---

## 2. The Two Scanning Methods

| Method | Platform | Location | Status |
|--------|----------|----------|--------|
| **Web Scanner** | Browser (PWA) | https://webportals-lovat.vercel.app/scan/scanner/:eventId | ✅ Working |
| **Mobile Scanner** | Android APK | `organiser/scanner.tsx` (in Controller tab) | ✅ Built (needs APK rebuild) |

Both methods use the same backend: `POST /api/attendance/scan`.

---

## 3. Prerequisites

### Test Accounts

| Role | Email | Password |
|------|-------|----------|
| Organiser | bob@test.com | password123 |
| Organiser 2 | johnny@test.com | password123 |
| Volunteer | alice@test.com | password123 |
| Volunteer 2 | eve@test.com | password123 |

### Sample Events

| Event | Date | Points Value |
|-------|------|:------------:|
| Beach Cleanup @ East Coast | Jun 15, 2026 | 20 pts |
| Elderly Morning Walk | Jun 20, 2026 | 15 pts |
| Food Distribution @ Jalan Besar | Jun 25, 2026 | 25 pts |

---

## 4. How QR Codes Work

### Volunteer QR Code Format

Each volunteer's QR code contains the format:

```
VR_VOLUNTEER:<uuid>
```

Example: `VR_VOLUNTEER:c29acbe3-3ef4-4bc8-ad16-f99419bead76`

### How It's Generated

- When a volunteer **registers**, the backend automatically generates a UUID and
  stores it as `volunteer_qr_code` in the database
- The QR code is displayed in the volunteer's mobile app under the **Scan** tab
- The QR code never changes — it's permanently tied to the volunteer's account

### Volunteer QR Screen (Mobile App)

```
┌─────────────────────────────────────┐
│  ←    Attendance Pass    📋        │
│─────────────────────────────────────│
│  ┌─────────────────────────────┐    │
│  │  VOLUNTEER PASS             │    │
│  │                             │    │
│  │  Alice Volunteer            │  A │
│  │  alice@test.com             │    │
│  │                             │    │
│  │  Points: 500    Active      │    │
│  └─────────────────────────────┘    │
│                                     │
│  ┌─────────────────────────────┐    │
│  │  🟢 Ready to scan           │    │
│  │                             │    │
│  │     ┌─────────────────┐     │    │
│  │     │     QR CODE     │     │    │
│  │     │   ██ ██ ██ ██   │     │    │
│  │     │   ██ ██ ██ ██   │     │    │
│  │     └─────────────────┘     │    │
│  │                             │    │
│  │  Volunteer Attendance QR    │    │
│  │  Show this to the organiser │    │
│  └─────────────────────────────┘    │
└─────────────────────────────────────┘
```

---

## 5. Method A: Web Scanner (Browser)

### Step 1 — Log into Scanner Portal

1. Open **https://webportals-lovat.vercel.app/scan**
2. Login with organiser credentials (bob@test.com)
3. You'll see the **Scanner Dashboard**

### Step 2 — Select an Event

Choose the event you're currently managing:
```
┌─────────────────────────────────────┐
│  Today's Events                     │
│                                     │
│  ┌─────────────────────────────┐    │
│  │ Beach Cleanup @ East Coast  │    │
│  │ 20 pts  |  50 volunteers    │    │
│  │ [ Scan QR ]                 │    │
│  └─────────────────────────────┘    │
│                                     │
│  ┌─────────────────────────────┐    │
│  │ Elderly Morning Walk        │    │
│  │ 15 pts  |  30 volunteers    │    │
│  │ [ Scan QR ]                 │    │
│  └─────────────────────────────┘    │
└─────────────────────────────────────┘
```

### Step 3 — Scan the QR Code

The camera activates. Point it at the volunteer's QR code:

```
┌─────────────────────────────────────┐
│  ← Scan QR Code              💡    │
│─────────────────────────────────────│
│                                     │
│         ┌───────────────────┐       │
│         │  ┌─────────────┐  │       │
│         │  │  ┌─┐ ┌─┐    │  │       │
│         │  │  │█│ │█│    │  │       │
│         │  │  └─┘ └─┘    │  │       │
│         │  └─────────────┘  │       │
│         └───────────────────┘       │
│                                     │
│    Point the camera at the          │
│    volunteer's QR code              │
│                                     │
├─────────────────────────────────────┤
│  ℹ️ Scanning for Beach Cleanup      │
└─────────────────────────────────────┘
```

- The QR code is decoded automatically
- The `VR_VOLUNTEER:` prefix is stripped
- The raw UUID is sent to the backend

### Step 4 — Confirmation

#### ✅ Success

```
┌─────────────────────────────────────┐
│  ✅ Check-in Complete!              │
│                                     │
│  Check-in recorded successfully.    │
│                                     │
│  ⭐ +20 points awarded              │
│                                     │
│  ┌─────────────────────────────┐    │
│  │   Scan Next                 │    │
│  └─────────────────────────────┘    │
│                                     │
│  Done                               │
└─────────────────────────────────────┘
```

#### ❌ Error

| Error | Meaning | Action |
|-------|---------|--------|
| "No volunteer found with that QR code" | QR doesn't match any account | Check volunteer registered correctly |
| "Event not found" | Invalid event ID | Select correct event |
| "Already scanned" | Volunteer already checked in | Skip — points already awarded |

### Step 5 — Volunteer Auto-Detection

While the organiser scans, the volunteer's phone is **automatically polling**
every 2.5 seconds:

```
GET /api/attendance/volunteer/{id}/latest?after=2026-07-02T10:00:00Z

→ { found: true, attendance: { eventName, pointsEarned, ... } }
```

When attendance is detected, the volunteer's app auto-navigates to the
**success screen** showing:
- Event name
- Points earned
- New points balance

---

## 6. Method B: Mobile Scanner (Android APK)

### Step 1 — Open the Controller Tab

In the mobile app, navigate to the **Organiser** section → **Controller** tab:

```
┌─────────────────────────────────────┐
│  ☰  Onsite Controller    🔲        │
│─────────────────────────────────────│
│  ┌─────────────────────────────┐    │
│  │ Beach Cleanup @ East Coast  │    │
│  │ 🗓 May 25, 2025  08:00 AM   │    │
│  │ 📍 East Coast Park          │    │
│  └─────────────────────────────┘    │
│                                     │
│  Registered:  120                   │
│  Checked-in:  85                    │
│  Pending:     20                    │
│  Rate:        71%                   │
│                                     │
│  ┌─────────────────────────────┐    │
│  │  📷 Scan QR Code            │    │
│  │  Tap to open camera scanner │    │
│  └─────────────────────────────┘    │
└─────────────────────────────────────┘
```

### Step 2 — Tap "Scan QR Code"

This opens the camera scanner:

```
┌─────────────────────────────────────┐
│  ← Scan QR Code              💡    │
│─────────────────────────────────────│
│                                     │
│         ┌──────┐                    │
│         │ ┌──┐ │                    │
│         │ │  │ │                    │
│         │ └──┘ │                    │
│         │  ═══  │  ← scanning line  │
│         │ ┌──┐ │                    │
│         │ │  │ │                    │
│         │ └──┘ │                    │
│         └──────┘                    │
│                                     │
│    Point the camera at the          │
│    volunteer's QR code              │
├─────────────────────────────────────┤
│  ℹ️ Scanning for Event #1           │
└─────────────────────────────────────┘
```

**Features:**
- **Torch toggle** (💡) — for low-light environments
- **Scan line animation** — visual feedback that scanning is active
- **Corner guides** — helps frame the QR code properly

### Step 3 — Automatic Scan

When a QR code is detected:
- 5-second debounce prevents double-scans
- The app sends `POST /api/attendance/scan` with `event_id` and `qr_code_value`
- Processing overlay appears while waiting

### Step 4 — Result

Same success/error flow as the web scanner.

---

## 7. Viewing Scan History

### Volunteer Side

The volunteer can view their scan history in the mobile app:

```
Scan tab → History icon (⏱️)
  └─ Shows all past attendance records
     └─ Each entry: Event name, location, date, points earned
     └─ Source badge: "Synced" (backend) or "Saved locally"
```

### Organiser Side

The organiser can view the **event roster** to see who has checked in:
```
Organiser Portal → Events → Select Event → Roster

Shows:
  - Total registered volunteers
  - How many checked in
  - Individual check-in status per volunteer
```

---

## 8. Roster & Check-in Management

### View Event Roster

```
GET /api/events/:id/roster

Response: List of registered volunteers with check-in status

- pending  → Not yet arrived
- checked_in → Attendance recorded
```

### Manual Check-in (Fallback)

If QR scanning fails, the organiser can manually check in a volunteer:

```
Organiser Portal → Onsite Controller → Manual Check-in
  └─ Enter volunteer's email or ID
  └─ POST /api/attendance/scan { event_id, volunteer_id }
```

---

## 9. Common Scenarios

### Scenario A: QR Code Won't Scan
1. Ensure the volunteer's screen brightness is high
2. Hold camera steady 10-15 cm from the QR code
3. Avoid glare from overhead lights
4. Use the **torch toggle** in dark environments
5. If still failing, use **manual check-in** as fallback

### Scenario B: Volunteer Can't Find Their QR Code
1. Volunteer opens the **Scan tab** in the mobile app
2. If QR doesn't appear, tap **Refresh**
3. If still missing: log out → log in again (regenerates stored data)
4. If completely absent: admin can check `volunteer_qr_code` in the database

### Scenario C: "Already Scanned" Error
1. The volunteer has already been checked in for this event
2. Points were already awarded — no action needed
3. If it's a different event, make sure you selected the correct event

### Scenario D: Volunteer Didn't Get Success Screen
1. The app polls every 2.5 seconds — it may take a moment
2. Check the volunteer's internet connection
3. Volunteer can manually check scan history (Scan tab → History)

---

## 10. Technical Reference

### API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/attendance/scan` | POST | Record attendance by QR code |
| `/api/attendance/batch` | POST | Sync offline scans |
| `/api/attendance/volunteer/:id/latest` | GET | Poll for latest attendance (volunteer side) |
| `/api/events/today` | GET | List today's events (organiser) |
| `/api/events/:id/roster` | GET | Get event roster with check-in status |

### QR Code Data Format

```
VR_VOLUNTEER:<36-char UUID>

Example: VR_VOLUNTEER:c29acbe3-3ef4-4bc8-ad16-f99419bead76
```

### Scan Request

```
POST /api/attendance/scan
Auth: Bearer <organiser_token>
Body: {
  "event_id": 1,
  "qr_code_value": "c29acbe3-3ef4-4bc8-ad16-f99419bead76"
}

Response: {
  "message": "Check-in recorded successfully.",
  "data": {
    "attendance_id": 42,
    "points_awarded": 20
  }
}
```

### Volunteer Polling

```
GET /api/attendance/volunteer/1/latest?after=2026-07-02T10:00:00Z
Auth: Bearer <volunteer_token>

Response: {
  "found": true,
  "attendance": {
    "eventId": 1,
    "eventName": "Beach Cleanup @ East Coast",
    "pointsEarned": 20,
    "location": "East Coast Park",
    "scannedAt": "2026-07-02T10:05:00Z"
  }
}
```

---

## 11. Related Links

| Resource | URL |
|----------|-----|
| Scanner Portal (Web) | https://webportals-lovat.vercel.app/scan |
| Organiser Dashboard | https://webportals-lovat.vercel.app/organiser |
| Volunteer PWA | https://volunteering-rewards-app.vercel.app |
| Backend Health | https://vol-rewards-api.onrender.com/api/health |
| Sprint Status Report | docs/Sprint 5 Status Report v1.0.md |

---

*— End of Organiser QR Scanning Guide v1.0 —*
