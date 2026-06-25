Write unit tests for the attendance service.

## Project Context

- **Project:** Volunteering Rewards App (c3000c)
- **Backend path:** D:\c3000c\volunteering-rewards-app\backend
- **Service to test:** src/services/attendance.service.js
- **Output path:** tests/unit/attendance.service.test.js
- **Test runner:** Node.js native (`node:test`, `node:assert`)
- **Module system:** CommonJS (`require`/`module.exports`)
- **DB mocking:** Replace `pool.query` and `pool.connect` function directly

## Service Functions to Test

```js
// Scan QR code = check-in volunteer + award points (uses transaction with client)
scanQR(eventId, volunteerId)
// Returns: { attendance, awardedPoints }
// Throws: 404 (event/volunteer not found), 409 (already scanned)

// Batch sync for offline QR scans
batchSync(scans = [])
// scans: [{ eventId, volunteerId }, ...]
// Returns: { success: [...], skipped: [...], errors: [...] }
// Throws: 400 (invalid_payload if scans is not an array)
```

## Key Implementation Details

`scanQR` uses a DB transaction (client from `pool.connect()`):
1. BEGIN
2. `awardPointsForEvent(client, eventId, volunteerId)` — internal helper that:
   - SELECT ... FOR SHARE on events (404 if not found)
   - SELECT ... FOR SHARE on users (404 if not found)
   - Check attendance_logs for duplicate (409 if already_scanned)
   - INSERT attendance_log with points
   - UPDATE users SET points = points + X
3. COMMIT
4. On any error: ROLLBACK

`batchSync` also uses a transaction:
1. Validate scans is an array (400 if not)
2. BEGIN
3. For each scan in the array:
   - Skip if missing eventId/volunteerId → errors[]
   - Call awardPointsForEvent → catch 409 as skipped[], other errors as errors[]
4. COMMIT

## Test Pattern (copy exactly)

```js
const { describe, it, mock } = require("node:test");
const assert = require("node:assert");
const { pool } = require("../../src/config/database");

// Helper for single-query services
function mockPoolWith(returnValues) {
  let callIdx = 0;
  pool.query = function mockQuery() {
    return returnValues[callIdx++] || { rows: [] };
  };
}

// Helper for transaction-based services (pool.connect)
// The `client` mock needs to implement: client.query(), client.query("BEGIN"), etc.
function mockPoolClient(queries) {
  let clientIdx = 0;
  const client = {
    query: (sql, ...args) => {
      // BEGIN / COMMIT / ROLLBACK return { rows: [] }
      if (sql === "BEGIN" || sql === "COMMIT" || sql === "ROLLBACK") return { rows: [] };
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

### scanQR
- ✅ Successfully scans QR, awards points, returns attendance record
- ✅ Throws 404 if event doesn't exist
- ✅ Throws 404 if user doesn't exist
- ✅ Throws 409 if already scanned (duplicate)
- ✅ Uses transaction (BEGIN/COMMIT/ROLLBACK pattern)
- ✅ Releases client connection in finally block

### batchSync
- ✅ Successfully processes multiple valid scans
- ✅ Returns skipped[] for already-scanned volunteers (no throw)
- ✅ Returns errors[] for scans with missing eventId/volunteerId
- ✅ Returns errors[] on unexpected DB errors (no throw for individual items)
- ✅ Throws 400 if scans is not an array (null, string, object)
- ✅ Processes mix of success/skip/error in one batch
- ✅ Uses transaction for the batch

## Verification

After writing the file, run:
```
cd D:\c3000c\volunteering-rewards-app\backend
npm test
```

Make sure all tests pass (no failures, no errors).
Write ONLY the test file. Do NOT modify the service file.
