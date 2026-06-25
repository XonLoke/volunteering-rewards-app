Write unit tests for the leaderboard service.

## Project Context
- **Backend path:** D:\c3000c\volunteering-rewards-app\backend
- **Service to test:** src/services/leaderboard.service.js
- **Output path:** tests/unit/leaderboard.service.test.js
- **Test runner:** Node.js native (`node:test`, `node:assert`)
- **Module system:** CommonJS

Before writing tests, READ the service file first:
```
cat src/services/leaderboard.service.js
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

Cover: success path, empty results, error handling, edge cases.

## Verification
```
cd D:\c3000c\volunteering-rewards-app\backend && npm test
```
