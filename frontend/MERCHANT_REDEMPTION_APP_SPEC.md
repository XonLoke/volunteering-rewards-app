# Merchant Redemption App — Quick Spec

> **Purpose**: Mobile app/flow for merchants to verify and process coupon redemptions via 6-digit PIN
> **Platform**: Mobile web app (responsive), embedded in merchant's existing POS or standalone
> **Target**: Sprint 3–4 development

---

## User Flow

1. **Merchant Login** — Simple PIN/OTP login or shared device mode
2. **Enter 6-Digit PIN** — Customer reads their 6-digit PIN from the Volunteering Rewards app
3. **Verify PIN** — System checks PIN validity, expiration, and quantity limits
4. **Redemption Confirmed** — Coupon marked as used, stock decremented
5. **Reversal (if needed)** — Undo last redemption within 5 minutes

---

## Screen Layout

### Screen 1: PIN Entry (main screen)
- Large heading: "Enter Coupon PIN"
- 6 separate digit input boxes (like OTP entry)
- Numeric keypad or text input
- Customer info preview once PIN is partially validated
- "Verify" button activates when 6 digits entered

### Screen 2: Verification Result
- Success: Green checkmark, coupon details (item name, value, expiry)
  - "Redemption successful" message
  - "Process Next" button
- Failure: Red X with reason
  - "Invalid PIN" / "Expired coupon" / "Already redeemed"
  - "Try Again" button

### Screen 3: Redemption History (recent)
- Last 20 redemptions for this merchant
- Date, time, coupon type, status
- Tap to view details / reverse

---

## Key Requirements

- Works offline: cache valid coupon batches for verification
- 6-digit PIN format: numbers only, no letters
- PIN validity: single-use only, checked against server
- Rate limiting: max 10 attempts per minute per device
- Expired coupon detection: client-side + server-side
- Quantity limit check: coupon may be limited to N total redemptions
- Auto-clear: after successful redemption, auto-reset to PIN entry after 5 seconds
- Sound feedback: success chime / error buzz

---

## API Integration Points

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/coupons/verify` | POST | Verify a 6-digit PIN, returns coupon details |
| `/api/coupons/redeem` | POST | Mark coupon as redeemed |
| `/api/coupons/reverse` | POST | Undo last redemption (within 5 min) |
| `/api/merchant/history` | GET | Get recent redemptions |

---

## Data Flow

```
Customer shows 6-digit PIN (e.g. "483291")
  → Merchant enters PIN into app
  → POST /api/coupons/verify {pin, merchant_id}
  → Server checks:
      - PIN exists in coupons table?
      - Is coupon expired? (validity period)
      - Is coupon already redeemed? (single-use)
      - Are there remaining quantities?
  → If valid: show coupon details, merchant confirms
  → POST /api/coupons/redeem {pin, merchant_id}
  → Coupon marked as used, stock -1
  → Success screen
```

---

## Coupon Data Model (for reference)

```sql
coupons (
  id            UUID PRIMARY KEY,
  pin_code      VARCHAR(6) UNIQUE NOT NULL,   -- 6-digit string
  coupon_type   VARCHAR(50) NOT NULL,          -- e.g. "FairPrice $5", "Kopitiam Coffee"
  points_cost   INTEGER NOT NULL,              -- e.g. 100
  value_cents   INTEGER NOT NULL,              -- value in cents e.g. 500 = $5
  quantity      INTEGER NOT NULL DEFAULT 1,    -- total available
  quantity_used INTEGER NOT NULL DEFAULT 0,    -- redemptions so far
  valid_from    TIMESTAMP NOT NULL,
  valid_until   TIMESTAMP NOT NULL,
  is_redeemed   BOOLEAN NOT NULL DEFAULT FALSE,
  redeemed_at   TIMESTAMP,
  redeemed_by   UUID REFERENCES users(id)
)
```

---

## Implementation Notes

- PIN entry via `<input type="text" inputmode="numeric" pattern="[0-9]*" maxlength="6">`
- Auto-submit when 6 digits entered
- Visual feedback: digit boxes highlight green/red on verify
- Preload coupon batch data for offline verification where possible
- Keep redemption history local for fast access
