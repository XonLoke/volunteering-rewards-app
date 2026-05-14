# Prototype Assessment Report

> Review date: 14 May 2026
> Files reviewed: Mobile HTML prototype (10 screens), Organiser web prototype (8 pages), Admin web prototype (11 pages)

---

## 1. Mobile App — ServeConnect (10 screens)

### Strengths
- Clean, polished visual design — warm teal accent colour `#2a9d8f` feels friendly
- Good user flow: Onboarding → Register → Login → Browse → Detail → My Events → Check-in → QR → Rewards → Social
- Responsive phone frame mockup with status bar, nav bar, tab bar — feels realistic
- Search bar with category filters on Event Store screen
- Tab bar with 5 tabs (Explore, My Events, Activity, Rewards, Profile)
- "human / approachable" visual direction matches the volunteering theme
- CSS uses OKLCH colour space — modern and accessible

### Issues to Fix (Future Real App)

| # | Issue | Severity | Correction |
|---|-------|----------|------------|
| 1 | **App name mismatch** — prototype uses "ServeConnect", but project is "Volunteering Rewards App" | High | Rename to match project name |
| 2 | **QR flow is wrong** — prototype shows volunteer **scanning** QR codes ("Scan organizer QR codes"). Our design is **organizer scans volunteer's QR** | High | Reverse the flow — volunteer **displays** QR, organizer **scans** it |
| 3 | **V-Social screen** (screen 10) is a **Phase 2** feature (social_posts, social_comments tables) | Medium | Remove from Phase 1 MVP or mark as future |
| 4 | **Check-in is GPS-based** — prototype uses map + GPS check-in, but our design uses **organizer-led QR scanning** for attendance | Medium | Replace GPS check-in with QR-based attendance flow |
| 5 | **Points tier system** (Bronze/Silver/Gold/Platinum) appears in admin prototype — not in our current DB schema. Points is a simple integer column | Medium | Add tiers to DB schema or simplify to flat points |
| 6 | **Merchants module** in admin prototype is a Phase 2 feature | Medium | Remove or hide for Phase 1 |
| 7 | **Campaigns module** in admin prototype is a Phase 2 feature | Medium | Remove or hide for Phase 1 |
| 8 | **Colour scheme** — teal green accent (`#2a9d8f`) conflicts with the white background redesign. Need to adopt the `#34C759` green from the design system | Low | Update accent colour to match design system |

### Missing Screens (for real app)

| Missing | Priority | Notes |
|---------|----------|-------|
| Organizer scanning app (separate flow) | High | New app — QR scan for attendance + points |
| Merchant redemption app (separate flow) | High | New app — PIN entry for redemption |
| PIN display screen after redemption | High | Volunteer sees their 6-digit PIN |
| Profile screen with QR code display | High | Volunteer's QR code for organizer to scan |

---

## 2. Organiser Web Prototype (8 pages)

### Pages Reviewed
- `index.html` — Login
- `register.html` — Registration (organiser sign-up)
- `dashboard.html` — Overview with metrics
- `events.html` — Event list
- `event-edit.html` — Event create/edit form
- `feedback.html` — Volunteer feedback viewer
- `assessment.html` — Assessment/ratings
- `onsite-controller.html` — On-site event control

### Strengths
- Clean layout with sidebar navigation
- Dashboard shows useful metrics (events, volunteers, attendance rate)
- Event edit form has date picker, description, points fields
- Feedback viewer is a nice addition for organisers to see volunteer reviews

### Issues

| # | Issue | Severity | Correction |
|---|-------|----------|------------|
| 1 | **App name** uses "ServeConnect" consistently | High | Rename to project name |
| 2 | **Onsite controller** — unclear if this is the QR scanning interface or something else | Medium | Clarify purpose — this should be the QR scanning dashboard for live events |
| 3 | **Assessment page** — purpose is unclear. What is being assessed? | Low | Define whether this is volunteer assessment or event assessment |
| 4 | **No white background spec applied** — uses dark sidebar with white main area | Low | Update to full white bg design system |

---

## 3. Admin Web — "Dbase Controller" (11 pages)

### Pages Reviewed
- `index.html` — Dashboard
- `users.html` — User management
- `reward-system.html` — Points configuration
- `coupons.html` — Coupon/PIN management
- `merchants.html` — Merchant management (Phase 2)
- `event-organisers.html` — Organiser management
- `qr-codes.html` — QR code management
- `campaigns.html` — Campaign management (Phase 2)
- `redemptions.html` — Redemption history
- `events.html` — Event participation
- `admin.css`, `admin.js` — Styles and scripts

### Strengths
- **Most polished prototype** — full sidebar nav with section grouping, search bar, notification bell, user avatar
- Reward system page has real config management (conversion rate, tiers, change log)
- Users page likely has CRUD operations
- Redemption history with audit log
- Clean, modern CSS with OKLCH colour tokens

### Issues

| # | Issue | Severity | Correction |
|---|-------|----------|------------|
| 1 | **App name** "Dbase Controller" doesn't match project | High | Rename to "Volunteering Rewards — Admin Portal" |
| 2 | **Merchants page** (Phase 2 feature) | Medium | Remove or gate for Phase 1 |
| 3 | **Campaigns page** (Phase 2 feature) | Medium | Remove or gate for Phase 1 |
| 4 | **Points tiers** (Bronze/Silver/Gold/Platinum) not in current DB schema | Medium | Either add tiers table or simplify to flat points |
| 5 | **Reward per coupon = $5.00** in config — our current coupons are: $5 FairPrice (100pts), Kopitiam Coffee Set (50pts), $10 GrabFood (200pts). Conversion rate doesn't match | Low | Align with actual test data |
| 6 | **Sidebar uses blue accent** (`oklch(58% 0.18 255)`) while mobile uses teal green — inconsistent across platforms | Low | Standardise accent colour across all UIs |

---

## 4. Design Consistency Summary

### Colour Inconsistencies Across Prototypes

| UI | Accent Colour | Background | Status |
|----|--------------|------------|--------|
| Mobile prototype | Teal green `#2a9d8f` | Warm off-white `#f5f4f0` | Needs update to white bg design system |
| Admin web | Blue `oklch(58% 0.18 255)` | Near-white `oklch(99% 0.002 240)` | Closest to white bg requirement |
| Organiser web | Same as admin (blue) | Same as admin | OK |
| Design system spec | Green `#34C759` | White `#FFFFFF` | Target |

### Recommendation
Standardise on a single accent colour across ALL UIs — the design system recommends **green `#34C759`** as the primary accent (associates with points/rewards/positive action).

---

## 5. Phase 1 vs Phase 2 Feature Audit

### Phase 1 (Keep in MVP)
- [x] User registration / login / profile
- [x] Event browsing, detail, registration
- [x] My Events / schedule
- [x] QR attendance (reversed flow — organizer scans volunteer)
- [x] Points display
- [x] Rewards/coupons browse
- [x] PIN redemption
- [x] Event feedback

### Phase 2 (Remove or Flag)
- [ ] V-Social / social feed (screen 10)
- [ ] Merchants management
- [ ] Campaigns management
- [ ] Points tiers (Bronze/Silver/Gold/Platinum)
- [ ] Sponsorship/advertising features

---

## 6. Summary of Corrections Needed

| Priority | Count | Key Items |
|----------|-------|-----------|
| **High** | 4 | App name mismatch, QR flow direction, missing apps (organizer scanning + merchant redemption), Phase 2 features in scope |
| **Medium** | 5 | GPS vs QR check-in, points tiers schema, merchant/campaign pages, accent colour consistency |
| **Low** | 3 | Colour update, onboarding text, page labels |
