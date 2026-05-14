# Organizer Scanning App — Quick Spec

> **Purpose**: Mobile app for event organizers to scan volunteer QR codes for attendance and point awarding
> **Platform**: Mobile web app (responsive), later native if needed
> **Target**: Sprint 3–4 development

---

## User Flow

1. **Login** — Organizer signs in with event organiser credentials
2. **Select Event** — Pick today's event from a dropdown/list
3. **QR Scanner** — Camera viewfinder scans volunteer's QR code
4. **Attendance Confirmed** — Green checkmark + volunteer name + event name
5. **Points Awarded** — Auto-awards configured points for that event
6. **Manual Entry Fallback** — Search by name/email if QR scan fails

---

## Screen Layout

### Screen 1: Event Selector
- Header: event organiser name + organisation logo
- Event dropdown: pre-populated with today's events
- Quick stats: total checked-in / total registered
- Large "Start Scanning" button

### Screen 2: QR Scanner (main screen)
- Full-width camera viewfinder with scan frame
- Instructions: "Point camera at volunteer's QR code"
- Toggle to manual entry mode
- Recent scan list below

### Screen 3: Scan Result
- Large checkmark animation
- Volunteer name + photo placeholder
- Event name + points awarded
- "Scan Next" button
- "Undo" button (in case of wrong scan)

### Screen 4: Attendance List
- All registered volunteers for selected event
- Status: Checked In / Not Checked In
- Tap a name → manual check-in option
- Export list button

---

## Key Requirements

- Camera access with proper permissions
- QR code scanning via `navigator.mediaDevices.getUserMedia` + jsQR library
- Offline fallback: queue scans when offline, sync when connected
- Rapid scanning: no delay between successive scans
- Points auto-awarded on successful scan (calls POST /api/attendance)
- No special hardware needed — works with standard phone camera

---

## API Integration Points

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/events/today` | GET | Fetch organizer's events for today |
| `/api/attendance/scan` | POST | Submit QR scan result (volunteer_id + event_id) |
| `/api/attendance/batch` | POST | Batch sync offline scans |
| `/api/events/{id}/roster` | GET | Get registered volunteer list |

---

## Data Flow

```
Organizer taps "Start Scanning"
  → Camera activates
  → Volunteer shows QR code
  → Scanner decodes volunteer_id
  → POST /api/attendance/scan {volunteer_id, event_id}
  → Server awards points, records attendance
  → Response shows success + volunteer details
  → Ready for next scan
```

---

## Implementation Notes

- Build as standalone HTML/JS prototype first (like the mobile prototypes)
- Use `jsQR` library for QR decoding from camera feed
- Reuse CSS variables from the white background design system
- Status bar shows scan count for the session
- Sound/vibration feedback on successful scan (nice-to-have)
