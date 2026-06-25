Write unit tests for the sponsorship configuration service.

## Project Context
- **Backend path:** D:\c3000c\volunteering-rewards-app\backend
- **Service to test:** src/services/sponsorshipConfig.service.js
- **Output path:** tests/unit/sponsorshipConfig.service.test.js
- **Test runner:** Node.js native (`node:test`, `node:assert`)
- **Module system:** CommonJS

Before writing tests, READ the service file first:
```
cat src/services/sponsorshipConfig.service.js
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

Cover: CRUD operations, validation, success + error paths.

## Verification
```
cd D:\c3000c\volunteering-rewards-app\backend && npm test
```
