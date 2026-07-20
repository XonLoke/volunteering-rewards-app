# System Security Status Report v1.1

**Date:** 20 July 2026
**Project:** Volunteering Rewards App (C3000C)
**Auditor:** Xon (Technical Lead)
**Commit:** `8764c4f` (pushed to GitHub)

---

## 1. Overall System Security Status

| Area | Status |
|------|--------|
| Authentication | ✅ **Secure** |
| Authorization | ✅ **Secure** |
| Input Validation | ✅ **Secure** |
| Secrets Management | ✅ **Fixed** |
| API Endpoint Security | ✅ **Fixed** |
| Database Security | ✅ **Secure** |
| Rate Limiting | ✅ **In Place** (env-configurable limits, see v1.0 for original fix) |
| Error Handling | ✅ **Fixed** |

**Final Verdict: SYSTEM IS SECURE** — All 6 issues found have been fixed and verified. Rate limits made configurable per environment (20 Jul).

---

## 2. What Was Found (Issues Discovered)

### 🔴 Critical Issues

| # | Issue | Risk | Location |
|---|-------|------|----------|
| C1 | Debug endpoints accessible without auth in production | Attacker can wipe coupon/redemption data, enumerate DB schema | `POST /api/debug/seed`, `POST /api/debug/seed-coupon-pins`, `GET /api/debug/db` |
| C2 | Health endpoint leaks database connection info | Reconnaissance — exposes DB host, name, user | `GET /api/health` |
| C3 | `.env` files with secrets tracked in git | JWT signing keys, DB password, PIN secret, API key visible on GitHub | `/.env`, `/backend/.env` |
| C4 | Stack trace exposed in debug/db error response | Server file paths and code structure leaked | `GET /api/debug/db` error handler |

### 🟡 Medium Issues

| # | Issue | Risk | Location |
|---|-------|------|----------|
| M1 | Server startup logs DB config to console | Credential status visible in cloud logs | `backend/index.js` diagnostics block |
| M2 | PIN_SECRET was weak (dictionary-word-level) | PIN hash precomputation attack feasible | `backend/.env` |

---

## 3. What Was Fixed

### Fix #1 — Debug Endpoints Protected (C1)
**What changed:** Added a `devOnly` Express middleware that checks `NODE_ENV`. In production, all three debug endpoints return `404 Not Found`. In development, they work as before.

```js
function devOnly(_req, _res, next) {
  if (process.env.NODE_ENV === "production") {
    return _res.status(404).json({
      error: { code: "not_found", message: "Route not found" }
    });
  }
  next();
}
```

### Fix #2 — Health Endpoint Sanitized (C2)
**What changed:** DB connection details are now only returned when `NODE_ENV !== "production"`. In production, only `status`, `timestamp`, and `uptime` are returned.

### Fix #3 — Secrets Removed from Git (C3)
**What changed:**
- `git rm --cached` on both `.env` and `backend/.env`
- Created `.env.example` templates with placeholder values
- **Rotated all secrets** to new cryptographically-random values

### Fix #4 — Stack Trace Removed (C4)
**What changed:** `err.stack` removed from the `/api/debug/db` error response body.

### Fix #5 — Startup Diagnostics Guarded (M1)
**What changed:** Startup diagnostics wrapped in `if (process.env.NODE_ENV !== "production")`.

### Fix #6 — PIN_SECRET Strengthened (M2)
**What changed:** From `volunteering-rewards-pin-secret-v1` to a 128-bit cryptographically random hex string.

---

## 4. Security Features Verified (No Issues Found)

| Feature | Status | Evidence |
|---------|--------|----------|
| **SQL Injection Prevention** | ✅ Secure | All 100+ queries use parameterized `$1, $2` syntax |
| **Input Validation** | ✅ Secure | Joi schemas on register, login, profile update, organiser registration |
| **Password Hashing** | ✅ Secure | bcrypt with 12 salt rounds. Policy: 8+ chars, uppercase + digit |
| **JWT Design** | ✅ Secure | 15-min access tokens, 7-day refresh tokens with rotation and theft detection |
| **Role-Based Access** | ✅ Secure | `roleGuard` middleware on all admin/organiser/merchant routes returns 403 if unauthorized |
| **Rate Limiting** | ✅ In Place | Global: 500/15min, login: 10/min, register: 5/min (all defaults — configurable via env vars: `AUTH_STRICT_MAX`, `AUTH_REGISTER_MAX`, `DISABLE_RATE_LIMIT` for dev) |
| **HTTP Headers** | ✅ In Place | Helmet.js active (CSP disabled for dev) |
| **Body Size Limit** | ✅ In Place | Express JSON parser limited to 1MB |
| **Refresh Token Rotation** | ✅ Secure | DB comparison on refresh — revokes all tokens if reuse detected |
| **Error Handling** | ✅ Secure | 500 errors show generic message in production |

---

## 5. Commit History

| Commit | Description | Files Changed |
|--------|-------------|---------------|
| `0ddf0fe` | Security fixes | 5 files |
| `7b11ba8` | Security report v1.0 | 1 file |
| `8764c4f` | Rate limits env-configurable, DISABLE_RATE_LIMIT for dev | 2 files |

---

## 6. Deployment Note

The code fixes are pushed to `main` on GitHub. Render will auto-deploy on the next build cycle.

**Rate limiting note:** Production uses the default limits (global 500/15min, login 10/min, register 5/min) — safe as-is. The `DISABLE_RATE_LIMIT` env var is only for local `NODE_ENV=development` and should **not** be set on production.

---

*— End of System Security Status Report v1.1 —*
