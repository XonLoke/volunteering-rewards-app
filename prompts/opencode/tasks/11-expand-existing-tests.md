Expand the existing unit tests for the admin service and merchant service.

## Project Context
- **Backend path:** D:\c3000c\volunteering-rewards-app\backend
- **Existing test files:**
  - tests/unit/admin.service.test.js (currently 3 tests — coupon math only)
  - tests/unit/merchant.service.test.js (currently 2 tests — PIN verify only)
- **Test runner:** Node.js native (`node:test`, `node:assert`)
- **Module system:** CommonJS

## What to Do

### admin.service.test.js — Expand

First READ the service file to see all exported functions:
```
cat src/services/admin.service.js
```

Current tests (UT-07 to UT-09) only cover coupon points calculation. Add tests for:
- Dashboard stats (dashboard)
- User management (list/manage users)
- Coupon CRUD (list, create, update coupons)
- Configuration management
- Error handling for each function

### merchant.service.test.js — Expand

First READ the service file to see all exported functions:
```
cat src/services/merchant.service.js
```

Current tests (UT-12 to UT-13) only cover PIN verification. Add tests for:
- Coupon redemption flow
- Expired coupon handling
- Edge cases (invalid PIN format, already-redeemed coupons)

## Test Pattern
```js
const { describe, it, mock } = require("node:test");
const assert = require("node:assert");
const { pool } = require("../../src/config/database");

function mockPoolWith(returnValues) {
  let callIdx = 0;
  pool.query = function mockQuery() { return returnValues[callIdx++] || { rows: [] }; };
}
```

## Verification
```
cd D:\c3000c\volunteering-rewards-app\backend && npm test
```

All 5 original tests must STILL pass. Add at least 3-4 new tests per file.
