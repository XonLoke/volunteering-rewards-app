# Test Results — Performance Tests

**Project:** Volunteering Rewards App (C3000C)
**Date:** 08 June 2026
**Executor:** Xon (Automated)

---

## Summary

| Total | Passed | Failed |
|-------|--------|--------|
| 8 | 6 | 2 |

---

## Detailed Results

| Test ID | Description | Status | Details |
|---------|-------------|--------|---------|
| PT-01 | API Response — Admin Dashboard | ✅ PASS	| avg=159ms | min=126ms | max=301ms | 10ok/0err |
| PT-02 | API Response — User List | ✅ PASS	| avg=141ms | min=124ms | max=163ms | 10ok/0err |
| PT-03 | API Response — Coupon List | ✅ PASS	| avg=146ms | min=130ms | max=167ms | 10ok/0err |
| PT-04 | API Response — Login | ✅ PASS	| avg=365ms | min=343ms | max=390ms | 5ok/0err |
| PT-05 | API Response — Event List | ❌ Fail | avg=152ms | min=133ms | max=185ms | 0ok/10err (known issue: start_time column missing in DB - see IT-20) |
| PT-06 | API Response — Reward Redeem | ❌ Fail | avg=144ms | min=138ms | max=150ms | 0ok/5err (known issue: controller/service arg mismatch - see IT-27) |
| PT-07 | Pagination Correctness | ✅ Pass | total=15, page1=[43,42,41,40,39] page2=[38,37,36,35,34] — no duplicates |
| PT-08 | Concurrent Requests | ✅ Pass | 3 concurrent requests completed in 309ms (no deadlock) |


---

## Notes

1. Response times measured using `date +%s%N` (nanosecond precision), averaged across N sequential requests.
2. PT-01 through PT-03 used the admin token (carol@test.com). PT-04 and PT-05 used volunteer token (alice@test.com).
3. PT-05 (Event List) is affected by the same `start_time` column bug found in IT-20 — all requests fail with HTTP 500.
4. PT-06 (Reward Redeem) is affected by the same controller/service argument mismatch bug found in IT-27.
5. PT-04 limited to 5 requests to avoid hitting the authStrict rate limiter (10 req/min).
6. Tests run on localhost (zero network latency). Production response times will vary.
7. No concurrent load was applied (sequential requests for PT-01 to PT-07, 3 concurrent for PT-08).
