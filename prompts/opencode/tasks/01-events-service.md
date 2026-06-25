Write unit tests for the events service.

## Project Context

- **Project:** Volunteering Rewards App (c3000c)
- **Backend path:** D:\c3000c\volunteering-rewards-app\backend
- **Service to test:** src/services/events.service.js
- **Output path:** tests/unit/events.service.test.js
- **Test runner:** Node.js native (`node:test`, `node:assert`)
- **Module system:** CommonJS (`require`/`module.exports`)
- **DB mocking:** Replace `pool.query` function directly

## Service Functions to Test

```js
// Browse events with pagination and optional search/category filters
browseEvents({ page = 1, limit = 20, search, category } = {})
// Returns: { events, page, limit, total }

// Get a single event by ID (with registration check for current user)
getEventById(eventId, userId)
// Returns: event row or throws 404

// Register a volunteer for an event (with capacity check)
registerForEvent(eventId, userId)
// Returns: registration row or throws 404/409 (already_registered, event_full)

// Unregister from an event
unregisterFromEvent(eventId, userId)
// Returns: deleted registration row or throws 404

// Get AI-based event recommendations (category matching)
getRecommendations(userId, limit = 5)
// Returns: array of recommended events with relevance_score

// Get most popular upcoming events (fallback for new users)
getPopularEvents(limit = 5)
// Returns: array of popular events with 0 relevance_score
```

## Test Pattern (copy this structure exactly)

```js
const { describe, it, mock } = require("node:test");
const assert = require("node:assert");
const { pool } = require("../../src/config/database");

// Helper: mock pool.query with ordered return values
function mockPoolWith(returnValues) {
  let callIdx = 0;
  pool.query = function mockQuery() {
    return returnValues[callIdx++] || { rows: [] };
  };
}

describe("SECTION — behavior", () => {
  it("should do something", async () => {
    mock.restoreAll();
    mockPoolWith([{ rows: [...] }]);
    const result = await service.method(input);
    assert.equal(result, expected);
  });

  it("should throw on error case", async () => {
    mock.restoreAll();
    mockPoolWith([{ rows: [] }]); // empty = not found
    try {
      await service.method(badInput);
      assert.fail("Should throw");
    } catch (err) {
      assert.equal(err.statusCode || err.status, 4XX);
    }
  });
});
```

## What to Cover

### browseEvents
- ✅ Returns paginated events with default page/limit
- ✅ Applies search filter (ILIKE on title/description)
- ✅ Applies category filter
- ✅ Returns empty array when no events match
- ✅ Handles page=0 gracefully (should convert to 1)
- ✅ Returns correct total count

### getEventById
- ✅ Returns event with registrations count
- ✅ Returns event with is_registered flag for logged-in user
- ✅ Throws 404 when event doesn't exist

### registerForEvent
- ✅ Successfully registers user for event
- ✅ Throws 404 if event doesn't exist
- ✅ Throws 409 if already registered
- ✅ Throws 409 if event at capacity
- ✅ Handles capacity being null (unlimited)
- ✅ Uses BEGIN/COMMIT/ROLLBACK transaction pattern

### unregisterFromEvent
- ✅ Successfully unregisters user
- ✅ Throws 404 if event doesn't exist

### getRecommendations
- ✅ Returns recommendations based on past category preferences
- ✅ Falls back to popular events if user has no history
- ✅ Excludes events user is already registered for

### getPopularEvents
- ✅ Returns most popular upcoming events

## Verification

After writing the file, run:
```
cd D:\c3000c\volunteering-rewards-app\backend
npm test
```

Make sure all tests pass (no failures, no errors).
Write ONLY the test file. Do NOT modify the service file.
