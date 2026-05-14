# Design System — White Background (Volunteer Rewards App)

> **Principle:** Maximum readability and accessibility. White backgrounds with dark text. Colour used sparingly for actions and status only.

---

## 1. Colour Palette

### Neutral Palette (80% of the UI)

| Token | Hex | Usage |
|-------|-----|-------|
| `--bg-page` | `#FFFFFF` | Page/screen backgrounds |
| `--bg-card` | `#FFFFFF` | Card backgrounds |
| `--bg-input` | `#F5F5F7` | Text input fields |
| `--bg-subtle` | `#F2F2F5` | Section dividers, pull-to-refresh bg |
| `--border-light` | `#E0E0E5` | Card borders, dividers, separators |
| `--border-focus` | `#007AFF` | Input focus ring |
| `--text-primary` | `#1C1C1E` | Main body text (high contrast) |
| `--text-secondary` | `#6C6C70` | Labels, hints, subtitles |
| `--text-tertiary` | `#AEAEB2` | Placeholder text, disabled |
| `--text-inverse` | `#FFFFFF` | Text on coloured buttons |

### Accent Palette (20% of the UI)

| Token | Hex | Usage |
|-------|-----|-------|
| `--accent-green` | `#34C759` | Primary action, confirm, success, points display |
| `--accent-blue` | `#007AFF` | Links, navigation active state, info |
| `--accent-orange` | `#FF9500` | Rewards/coupons, warnings |
| `--accent-red` | `#FF3B30` | Errors, destructive actions, expiry alerts |
| `--accent-grey` | `#8E8E93` | Secondary buttons, tab inactive |

### Status Colours

| Token | Hex | Usage |
|-------|-----|-------|
| `--status-approved` | `#34C759` | Approved / Completed |
| `--status-pending` | `#FF9500` | Pending / In progress |
| `--status-rejected` | `#FF3B30` | Rejected / Expired |
| `--status-default` | `#8E8E93` | Neutral / Not yet |

---

## 2. Typography

**Font:** SF Pro (iOS) / Roboto (Android) — system default for each platform.

| Style | Size | Weight | Line Height | Usage |
|-------|------|--------|-------------|-------|
| **Large Title** | 34px | Bold | 41px | Screen headings |
| **Title 1** | 28px | Bold | 34px | Section headings |
| **Title 2** | 22px | Bold | 28px | Card titles |
| **Title 3** | 20px | Semi-Bold | 25px | Sub-section titles |
| **Headline** | 17px | Semi-Bold | 22px | Button labels, list headers |
| **Body** | 17px | Regular | 22px | Main paragraph text |
| **Callout** | 16px | Regular | 21px | Captions, secondary info |
| **Subhead** | 15px | Regular | 20px | Tabs, filters |
| **Footnote** | 13px | Regular | 18px | Timestamps, helper text |
| **Caption 1** | 12px | Regular | 16px | Labels, badges |
| **Caption 2** | 11px | Medium | 13px | Small badges, counts |

---

## 3. Spacing

| Token | Size | Usage |
|-------|------|-------|
| `--space-xs` | 4px | Between icon and label |
| `--space-sm` | 8px | Between related elements |
| `--space-md` | 12px | Between form fields |
| `--space-lg` | 16px | Standard margin between sections |
| `--space-xl` | 24px | Section padding |
| `--space-2xl` | 32px | Screen edge padding |

**Screen edge padding:** 16px left and right (standard iOS/Android safe area).

---

## 4. Component Specs

### 4.1 Cards

```
┌──────────────────────────────┐
│  ┌────────────────────────┐  │
│  │  Title (17px SemiBold) │  │  ← 16px padding all sides
│  │  Subtitle (15px Reg)   │  │
│  │                        │  │
│  │  [Action Button]       │  │
│  └────────────────────────┘  │
└──────────────────────────────┘
```

- Background: `#FFFFFF`
- Border: 1px solid `#E0E0E5`
- Corner radius: 12px
- Shadow: None (flat design) or very subtle (0px 1px 3px rgba(0,0,0,0.08))
- Padding inside: 16px

### 4.2 Buttons

**Primary Button (filled):**
- Background: `#34C759` (green)
- Text: White, 17px SemiBold
- Height: 48px
- Corner radius: 12px
- Full width or minimum 120px

**Secondary Button (outlined):**
- Background: White
- Border: 1.5px solid `#34C759`
- Text: `#34C759`, 17px SemiBold
- Height: 48px
- Corner radius: 12px

**Tertiary Button (text only):**
- Background: none
- Text: `#007AFF`, 17px Regular
- Height: 44px

### 4.3 Text Inputs

```
┌──────────────────────────────────┐
│  Label (15px, #6C6C70)          │
│  ┌────────────────────────────┐  │
│  │  Input text (17px)        │  │  ← bg: #F5F5F7, 12px radius
│  └────────────────────────────┘  │
│  Helper text (13px, #AEAEB2)     │
└──────────────────────────────────┘
```

- Background: `#F5F5F7`
- Border: none (or 1px `#E0E0E5` when empty)
- Focus border: 2px `#007AFF` ring
- Height: 44px
- Corner radius: 10px
- Padding: 12px horizontal

### 4.4 Navigation Bar (Top)

- Background: `#FFFFFF`
- Bottom border: 0.5px `#E0E0E5`
- Title: 17px SemiBold, `#1C1C1E`
- Back button: `#007AFF` text or chevron

### 4.5 Tab Bar (Bottom)

- Background: `#FFFFFF`
- Top border: 0.5px `#E0E0E5`
- Active tab icon: `#007AFF`
- Inactive tab icon: `#8E8E93`
- Tab label: 11px
- Height: 50px (iOS) / 56px (Android)

### 4.6 Status Badges

```
┌──────────┐
│ Approved │  ← bg: #E8F8E8, text: #34C759, 12px
└──────────┘

┌─────────┐
│ Pending │  ← bg: #FFF3E0, text: #FF9500
└─────────┘

┌──────────┐
│ Expired  │  ← bg: #FFEBEE, text: #FF3B30
└──────────┘
```

- Corner radius: 4px
- Padding: 4px 8px
- Font: 12px Medium

### 4.7 Points / Score Display

```
★ 500 pts
```

- Icon: Green star or diamond (`#34C759`)
- Number: 20px Bold, `#1C1C1E`
- Label: 15px Regular, `#6C6C70`
- Background: `#F5F5F7` pill (optional, for hero score)

---

## 5. Vivian's 9 Screens — White Background Redesign Guide

### Screen 1: Login
| Element | Current (dark) | New (white) |
|---------|---------------|-------------|
| Background | Dark teal/green | `#FFFFFF` |
| Logo/header | White text on dark | Green `#34C759` icon + `#1C1C1E` text |
| Input fields | Dark fields, white text | `#F5F5F7` fields, `#1C1C1E` text |
| Login button | White on dark accent | Green `#34C759` filled |
| Links (forgot pwd) | Light on dark | Blue `#007AFF` |

### Screen 2: Register
Same as login pattern — white bg, `#F5F5F7` inputs, green primary button.

### Screen 3: Home Dashboard
| Element | Current (dark) | New (white) |
|---------|---------------|-------------|
| Background | Dark | `#FFFFFF` |
| Header bar | Dark with white text | White with `#E0E0E5` bottom border |
| Points display | Dark pill | `#F5F5F7` pill, green star icon |
| Event cards | Coloured backgrounds | White cards, `#E0E0E5` border, 12px radius |
| Card text | White on colour | `#1C1C1E` on white |
| Tab bar | Dark | White with grey inactive tabs |

### Screen 4: Event Details
- White bg with white card sections
- Event image at top (full width, or placeholder with light grey bg)
- Register button: green `#34C759`
- Points value: green text `+20 pts`

### Screen 5: QR Code Display
- White bg
- QR code in centre with subtle border
- "Show this to the organizer" — `#6C6C70` text
- Points earned info below

### Screen 6: Rewards/Coupons List
- White bg
- Coupon cards: white with `#E0E0E5` border, orange accent strip on left
- Points required: `#FF9500` text
- Redeem button: green

### Screen 7: Coupon Detail
- White bg with coupon card
- Large points cost display
- "Redeem Now" green button
- Terms in `#6C6C70` 13px text

### Screen 8: Profile
- White bg
- Avatar placeholder: `#F2F2F5` circle
- Name: 28px Bold `#1C1C1E`
- Email: 15px `#6C6C70`
- Total points: green highlight
- Settings rows: white bg, `#E0E0E5` separators

### Screen 9: Redemption / PIN Display
- White bg
- Large PIN code in bold, monospaced font (e.g. `Courier New` or SF Mono)
- "Show this PIN to the cashier" instruction
- Countdown timer or expiry note in `#FF9500`

---

## 6. Organiser Scanning App — Quick Spec

Even simpler than the volunteer app. White background throughout.

| Screen | Key Elements |
|--------|-------------|
| Login | Same as volunteer app login |
| Scan QR | Full-screen camera view + white overlay instructions |
| Attendance Confirm | Green checkmark, user name, "Attendance recorded" |
| Points Award | Points field, confirm button, success animation |

## 7. Merchant Redemption App — Quick Spec

Minimal. White background.

| Screen | Key Elements |
|--------|-------------|
| Login | Cashier login (simplified, no registration) |
| PIN Entry | 6-digit numeric input, large keypad |
| Confirmation | Green checkmark, coupon name, "Redemption successful" |
| History | Simple list of recent redemptions |

---

## 8. Implementation Notes

- **Expo/React Native:** Use `StyleSheet.create()` for all styles. Define colours as constants in a `theme.js` file.
- **React (Web):** Use CSS custom properties (variables) for the colour tokens above.
- **Accessibility:** Ensure minimum 4.5:1 contrast ratio for all text. All touch targets minimum 44x44px.
- **Dark mode (future):** Can be added later by swapping CSS variables. Not required for Phase 1.
