# Merchant/Cashier Attendant — PIN Redemption Guide

**Version:** 1.0
**Date:** 2 July 2026
**Project:** Volunteering Rewards App (C3000C)
**Portal:** https://webportals-lovat.vercel.app/merchant

---

## 1. Overview

The Merchant/Cashier portal handles **reward redemption** for volunteers who have
redeemed coupons using their points. Redemption is **PIN-based** — the volunteer
presents a 6-digit code which the cashier enters into the system.

> ⚠️ **Note:** QR code scanning is NOT used in merchant redemption. QR scanning
> is only available on the **Organiser** side for event attendance check-in.

### End-to-End Flow

```
Volunteer                       Cashier                      Backend
   │                               │                            │
   ├─ Redeems coupon with          │                            │
   │  points in mobile app         │                            │
   │                               │                            │
   ├─ Gets 6-digit PIN             │                            │
   │  Shows PIN to cashier ────────┤                            │
   │                               ├─ Enters PIN on             │
   │                               │  merchant portal           │
   │                               │                            │
   │                               ├─ POST /coupons/verify ────┤
   │                               │◄── Coupon details ────────┤
   │                               │                            │
   │                               ├─ Confirms redemption       │
   │                               │  POST /coupons/redeem ────┤
   │                               │◄── Redemption confirmed ──┤
   │                               │  (5-min undo available)    │
```

---

## 2. Prerequisites

### Test Accounts

| Role | Email | Password |
|------|-------|----------|
| Merchant 1 | cheryl@test.com | password123 |
| Merchant 2 | diana@test.com | password123 |
| Merchant 3 | frank@test.com | password123 |

### System Requirements
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Internet connection
- No special hardware required — all input is via keyboard or on-screen keypad

---

## 3. Step-by-Step Procedure

### Step 1: Cashier Login

1. Open **https://webportals-lovat.vercel.app/merchant**
2. Enter your **email** and **password**
3. Click **"Sign In"**

```
┌─────────────────────────────────────┐
│         🏪 Cashier Login            │
│                                     │
│  Email                              │
│  ┌─────────────────────────────┐    │
│  │ cheryl@test.com             │    │
│  └─────────────────────────────┘    │
│                                     │
│  Password                           │
│  ┌─────────────────────────────┐    │
│  │ •••••••••••                 │    │
│  └─────────────────────────────┘    │
│                                     │
│  ┌─────────────────────────────┐    │
│  │         Sign In             │    │
│  └─────────────────────────────┘    │
└─────────────────────────────────────┘
```

> ⚠️ Only accounts with role **"merchant"** can access this portal.
> If you see "Access denied", check your role.

---

### Step 2: Ask Volunteer for Their PIN

The volunteer should have a coupon ready in their mobile app:

```
     ┌──┐ ┌──┐ ┌──┐ ┌──┐ ┌──┐ ┌──┐
     │5 │ │2 │ │4 │ │9 │ │5 │ │3 │
     └──┘ └──┘ └──┘ └──┘ └──┘ └──┘
     6-Digit Redemption PIN
```

Where to find it in the volunteer app:
- **My Coupons** tab → Tap a coupon → The PIN appears in large boxes
- Volunteer can tap **"Copy PIN"** to share it

---

### Step 3: Enter the PIN

After login, you'll see the **PIN entry screen**:

```
┌─────────────────────────────────────┐
│        Enter PIN Code               │
│  Ask the volunteer for their        │
│  6-digit redemption PIN             │
│                                     │
│   ┌──┐ ┌──┐ ┌──┐ ┌──┐ ┌──┐ ┌──┐   │
│   │● │ │● │ │● │ │  │ │  │ │  │   │
│   └──┘ └──┘ └──┘ └──┘ └──┘ └──┘   │
│                                     │
│   ┌───┐ ┌───┐ ┌───┐                │
│   │ 1 │ │ 2 │ │ 3 │                │
│   └───┘ └───┘ └───┘                │
│   ┌───┐ ┌───┐ ┌───┐                │
│   │ 4 │ │ 5 │ │ 6 │                │
│   └───┘ └───┘ └───┘                │
│   ┌───┐ ┌───┐ ┌───┐                │
│   │ 7 │ │ 8 │ │ 9 │                │
│   └───┘ └───┘ └───┘                │
│   ┌───┐ ┌───┐ ┌───┐                │
│   │   │ │ 0 │ │ ⌫ │                │
│   └───┘ └───┘ └───┘                │
│                                     │
│      ┌─────────────────────┐        │
│      │    Verify PIN       │        │
│      └─────────────────────┘        │
└─────────────────────────────────────┘
```

**Two ways to enter the PIN:**
- **On-screen keypad:** Tap the numbered buttons
- **Physical keyboard:** Just type the digits (hidden input is auto-focused)

**To correct a digit:** Tap the **⌫ (backspace)** button or press Backspace on keyboard.

**The Verify button** activates automatically when all 6 digits are entered.

---

### Step 4: Verify the PIN

Click **"Verify PIN"** to check the code against the backend.

#### ✅ Success — Coupon Found

```
┌─────────────────────────────────────┐
│      ✅ Coupon Verified             │
│                                     │
│   Kopitiam Coffee & Toast Set       │
│                                     │
│   Value            400 pts          │
│   Points Cost      50 pts           │
│   Valid Until      Oct 31, 2026     │
│                                     │
│   Volunteer        Alice Volunteer  │
│                                     │
│  ┌─────────────────────────────┐    │
│  │   ✓ Redeem Now              │    │
│  └─────────────────────────────┘    │
│                                     │
│  Verify Another                     │
└─────────────────────────────────────┘
```

**Check these details before proceeding:**
- ✅ Coupon name matches what the volunteer shows
- ✅ Points value is correct
- ✅ Not expired

#### ❌ Error — Wrong or Invalid PIN

```
┌─────────────────────────────────────┐
│  ⚠️ PIN not found                   │
│  Please check and try again.        │
└─────────────────────────────────────┘
```

| Error Message | Meaning | Action |
|--------------|---------|--------|
| "PIN not found" | No coupon matches this code | Ask volunteer to double-check their PIN |
| "Coupon has expired" | The coupon is past its expiry date | Cannot redeem — inform volunteer |
| "Already redeemed" | This coupon was already used | Inform volunteer this was already used |
| "Too many attempts" | Rate limited (max 10/min) | Wait 1 minute before trying again |

---

### Step 5: Redeem the Coupon

Once the coupon details are confirmed, click **"Redeem Now"** to finalize.

```
┌─────────────────────────────────────┐
│     🎉 Redemption Successful!       │
│                                     │
│  Coupon:   Kopitiam Coffee & Toast  │
│  Value:    $4.00                    │
│  PIN:      524953                   │
│  Status:   ✅ Redeemed              │
│  Time:     Jul 2, 2026, 10:32 AM   │
│                                     │
│ ┌──────────────────────────────┐    │
│ │ ⏪ Undo (5 minutes remaining)│    │
│ └──────────────────────────────┘    │
│                                     │
│  Verify Another                     │
└─────────────────────────────────────┘
```

---

### Step 6: Undo a Redemption (If Needed)

If you made a mistake, you can **undo within 5 minutes**:

1. Click **"Undo Redemption"** on the success screen
2. Confirm in the dialog box: **"Yes, Undo Redemption"**
3. The coupon status returns to **"unused"** — it can be redeemed again

```
┌─────────────────────────────────────┐
│  ⏪ Undo Redemption                  │
│                                     │
│  Are you sure you want to reverse   │
│  this redemption? This action       │
│  cannot be undone.                  │
│                                     │
│  Coupon: Kopitiam Coffee & Toast    │
│  Value:  $4.00                      │
│                                     │
│  ┌──────────┐  ┌─────────────────┐  │
│  │ Cancel   │  │ Yes, Undo ❌   │  │
│  └──────────┘  └─────────────────┘  │
└─────────────────────────────────────┘
```

> ⏰ After **5 minutes**, the undo button disappears permanently.

---

## 4. View Redemption History

Click **"View History"** on the login screen to see past redemptions:

| Column | Description |
|--------|-------------|
| Coupon | Name of the redeemed coupon |
| Volunteer | Name of the volunteer |
| Value | Points or dollar value |
| Time | When it was redeemed |
| Status | Active, Reversed |

Filter by time period: **Today** | **This Week** | **This Month** | **All**

---

## 5. Common Scenarios

### Scenario A: Volunteer's PIN doesn't work
1. Ask volunteer to open **My Coupons** and check the exact PIN
2. Verify the coupon hasn't expired
3. If still failing, ask volunteer to redeem a new coupon

### Scenario B: Volunteer redeemed but doesn't see the PIN
1. The PIN is shown only once on the **redeem-success** screen
2. Volunteer can find it again in **My Coupons** → tap coupon → PIN is displayed
3. If still not visible, volunteer may need to log out and log in again

### Scenario C: Coupon says "Already redeemed"
1. Someone may have already used this PIN
2. Check with the volunteer if they've used it elsewhere
3. If it was a mistake (undone within 5 min), ask them to get a fresh coupon

---

## 6. Technical Reference (For Support)

### API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/coupons/verify` | POST | Verify a 6-digit PIN and return coupon details |
| `/api/coupons/redeem` | POST | Mark coupon as used |
| `/api/coupons/reverse` | POST | Undo redemption (5-min window) |
| `/api/merchant/history` | GET | Get redemption history |

### Request/Response Examples

**Verify PIN:**
```
POST /api/coupons/verify
Body: { "pin": "524953" }

Response: {
  "coupon": {
    "coupon_title": "Kopitiam Coffee & Toast Set",
    "value_cents": 400,
    "points_cost": 50,
    "volunteer_name": "Alice Volunteer",
    "valid_until": "2026-10-31"
  }
}
```

**Redeem Coupon:**
```
POST /api/coupons/redeem
Body: { "pin": "524953", "userCouponId": 183 }

Response: {
  "redemption": {
    "status": "used",
    "coupon_type": "Kopitiam Coffee & Toast Set",
    "value_cents": 400,
    "redeemed_at": "2026-07-02T03:10:32.592Z"
  }
}
```

**Undo Redemption:**
```
POST /api/coupons/reverse
Body: { "userCouponId": 183 }
```

---

## 7. Related Links

| Resource | URL |
|----------|-----|
| Merchant Portal | https://webportals-lovat.vercel.app/merchant |
| Redemption History | https://webportals-lovat.vercel.app/merchant/history |
| Backend Health | https://vol-rewards-api.onrender.com/api/health |
| Volunteer PWA | https://volunteering-rewards-app.vercel.app |
| Sprint Status Report | docs/Sprint 5 Status Report v1.0.md |

---

*— End of Merchant/Cashier Attendant Guide v1.0 —*
