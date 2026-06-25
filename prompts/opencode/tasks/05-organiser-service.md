Write unit tests for the organiser service.

## Project Context
- **Backend path:** D:\c3000c\volunteering-rewards-app\backend
- **Service to test:** src/services/organiser.service.js
- **Output path:** tests/unit/organiser.service.test.js
- **Test runner:** Node.js native (`node:test`, `node:assert`)
- **Module system:** CommonJS

## Functions to Test

```js
getDashboard(organiserId)
// Returns: { stats: { total_events, total_volunteers, upcoming_events, average_feedback }, upcoming: [...] }

getMyEvents(organiserId, { page = 1, limit = 20, status } = {})
// Returns: { data: [...], total, page, limit, total_pages }

createEvent(organiserId, data)
// data: { title, description, location, event_date, capacity, points_value, category }
// Returns: event row (status defaults to 'upcoming')

updateEvent(organiserId, eventId, data)
// Throws 404 if not found

deleteEvent(organiserId, eventId)
// Throws 404 if not found

getRoster(organiserId, eventId)
// Returns: { data: [{ id, name, email, status, check_in_time }, ...] }

getFeedback(organiserId, eventId)
// Returns: { data: [{ id, rating, comment, volunteer_name, event_title }, ...] }

getQna(organiserId, eventId)
// Returns: { data: [{ id, question, answer, asked_by }, ...] }

answerQuestion(organiserId, questionId, answer)
// Throws 404 if not found
```

## Test Pattern — Same as existing tests
Use `mockPoolWith()` pattern. Cover success + error paths (404s).

## Verification
```
cd D:\c3000c\volunteering-rewards-app\backend && npm test
```
