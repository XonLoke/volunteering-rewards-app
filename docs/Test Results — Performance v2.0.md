# Test Results — Performance v2.0

**Date:** 16 Jun 2026
**Project:** Volunteering Rewards App
**Tool:** `tests/performance/perf_test.js`
**Backend:** localhost:3000 (development mode)

---

## Summary

| Metric | Value |
|--------|-------|
| Tests run | 17 |
| Passed | 17 |
| Failed | 0 (1 bug fixed: `start_time` column → aliased to `event_date`) |
| Overall avg response time | **101.7ms** |
| Best single request | **3.9ms** (Health Check) |
| Sequential avg (5 tests) | ~107ms |
| Concurrent avg (10x load) | **99.1ms** |

---

## Sequential Results

| Test | Endpoint | Response Time |
|------|----------|--------------|
| Login (alice@test.com) | `POST /api/auth/login` | 316.8ms |
| Health Check | `GET /api/health` | 3.9ms |
| Browse Events | `GET /api/events` | 50.2ms |
| Leaderboard | `GET /api/leaderboard` | 61.0ms |
| Login (bob@test.com) | `POST /api/auth/login` | 203.3ms |
| Today's Events | `GET /api/events/today` | 4.0ms |

**Notes:**
- Login is the slowest due to bcrypt (12 rounds). ~200-350ms is expected.
- Event queries are efficient with proper indexes (50-61ms).
- Simple lookups (health, today's events) are sub-5ms.

---

## Concurrent Load Test (10x)

| Metric | Value |
|--------|-------|
| Average | 99.1ms |
| Minimum | 4.9ms |
| Maximum | 266.5ms |
| Concurrency | 10 parallel requests to `GET /api/events` |

**Notes:**
- Pool connection acquisition adds latency as concurrency increases.
- First few requests benefit from warm connection pool (sub-15ms).
- Later requests wait on pool acquisition, pushing to ~200-270ms.
- No request dropped or timed out. Server handled all 10 concurrently.

---

## Bug Fix: Missing `start_time` Column

During performance testing, the organiser endpoint `GET /api/events/today` failed with:
```
column e.start_time does not exist
```

**Root cause:** The schema (migration `004_create_events.sql`) uses `event_date` as a TIMESTAMP, not separate `start_time`/`end_time` columns. The query in `events.controller.js` referenced non-existent columns.

**Fix:** Replaced `e.start_time` and `e.end_time` with `e.event_date AS start_time` and `e.event_date AS end_time`. Also fixed `WHERE e.event_date = CURRENT_DATE` → `WHERE e.event_date::date = CURRENT_DATE` for correct date comparison against a TIMESTAMP column.

**File:** `backend/src/controllers/events.controller.js:39-49`

---

## Conclusion

The backend performs well under both sequential and concurrent load. No bottlenecks identified. The bcrypt cost (12 rounds) on login is the heaviest operation but is within acceptable range (~200-350ms). Connection pooling should be tuned for production (increase `max` from default 10 to 20-50).
