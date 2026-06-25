Write unit tests for the rewards service.

## Project Context

- **Project:** Volunteering Rewards App (c3000c)
- **Backend path:** D:\c3000c\volunteering-rewards-app\backend
- **Service to test:** src/services/rewards.service.js
- **Output path:** tests/unit/rewards.service.test.js
- **Test runner:** Node.js native (`node:test`, `node:assert`)
- **Module system:** CommonJS (`require`/`module.exports`)
- **DB mocking:** Replace `pool.query` and `pool.connect` function directly

## Service Functions to Test

```js
// Internal: hash a PIN with HMAC-SHA256
hashPin(pin)
// Returns: 64-char hex string

// Browse available rewards (coupons) with filters
browseRewards({ page = 1, limit = 20, search, status = "active" } = {})
// Returns: { data: [...], total, page, limit, total_pages }
// Filters: status, quantity > 0, not expired, optional search (ILIKE title/description)

// Get a single reward by ID with favorite flag
getRewardById(rewardId, userId)
// Returns: { data: { ...reward, is_favorite } }
// Throws: 404 if not found

// Full redemption flow (transaction)
redeemReward(rewardId, userId, meta = {})
// Returns: { data: { user_coupon fields, pin, points_balance, remaining_quantity } }
// Throws: 404 (not found), 400 (not_available, expired), 409 (out_of_stock), 403 (insufficient_points)
```

## Key Implementation Details

`redeemReward` has a complex transaction flow:
1. SELECT ... FOR UPDATE on coupon (404 if not found)
2. Check: status active? quantity > 0? not expired?
3. UPDATE users SET points -= points_required (403 if insufficient)
4. UPDATE coupons SET quantity -= 1 (409 if out of stock)
5. Generate unique PIN + hash
6. INSERT user_coupon with pin_hash
7. INSERT redemption_log
8. TRY INSERT into points_ledger (non-fatal if table missing)
9. COMMIT (ROLLBACK on any error)

`generateUniquePinHash` is internal (used by redeemReward):
- Retries up to 10 times to find a unique PIN hash
- Uses crypto.randomInt(100000, 1000000) for PIN generation

## Test Pattern

```js
const { describe, it, mock } = require("node:test");
const assert = require("node:assert");
const { pool } = require("../../src/config/database");

function mockPoolWith(returnValues) {
  let callIdx = 0;
  pool.query = function mockQuery() {
    return returnValues[callIdx++] || { rows: [] };
  };
}

function mockPoolClient(queries) {
  let clientIdx = 0;
  const client = {
    query: (sql, ...args) => {
      if (typeof sql === "string" && ["BEGIN","COMMIT","ROLLBACK"].includes(sql.trim())) {
        return { rows: [] };
      }
      if (clientIdx >= queries.length) return { rows: [] };
      return queries[clientIdx++];
    },
    release: () => {},
  };
  pool.connect = () => client;
  return client;
}
```

## What to Cover

### hashPin (pure function, no DB)
- ✅ Returns a 64-character hex string
- ✅ Is deterministic (same input = same output)
- ✅ Different inputs produce different hashes
- ✅ Uses PIN_SECRET from env or fallback

### browseRewards
- ✅ Returns paginated results with defaults
- ✅ Filters by status (default "active")
- ✅ Excludes expired coupons
- ✅ Excludes zero-quantity coupons
- ✅ Searches by title/description with ILIKE
- ✅ Returns empty result when nothing matches
- ✅ Calculates total_pages correctly
- ✅ Caps limit at 100

### getRewardById
- ✅ Returns reward with is_favorite flag
- ✅ Throws 404 if reward not found
- ✅ Handles userId being null/undefined (no favorite check crash)

### redeemReward (complex — test carefully)
- ✅ Successful full redemption returns pin, balance, remaining_quantity
- ✅ Throws 404 if coupon doesn't exist
- ✅ Throws 400 if coupon not active
- ✅ Throws 409 if out of stock (quantity = 0)
- ✅ Throws 400 if coupon expired
- ✅ Throws 403 if user has insufficient points
- ✅ Deducts points from user and decrements coupon quantity
- ✅ Points ledger insert failure does NOT block redemption (non-fatal)
- ✅ Uses transaction (BEGIN/COMMIT/ROLLBACK)

## Verification

After writing, run:
```
cd D:\c3000c\volunteering-rewards-app\backend
npm test
```

All tests must pass. Write ONLY the test file.
