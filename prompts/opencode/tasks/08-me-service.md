Write unit tests for the "me" (profile) service.

## Project Context
- **Backend path:** D:\c3000c\volunteering-rewards-app\backend
- **Service to test:** src/services/me.service.js
- **Output path:** tests/unit/me.service.test.js
- **Test runner:** Node.js native (`node:test`, `node:assert`)
- **Module system:** CommonJS

Before writing tests, READ the service file first:
```
cat src/services/me.service.js
```

Then test all exported functions.

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

Cover: profile retrieval, stats, empty states, not-found errors.

## Verification
```
cd D:\c3000c\volunteering-rewards-app\backend && npm test
```
