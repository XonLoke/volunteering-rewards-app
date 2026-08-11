/**
 * Rate Limiter Middleware (AUTH-10)
 *
 * Applies a global rate limit to all API routes.
 * Sensitive auth endpoints (login, register) use stricter windows.
 * All error responses use contract-compliant shape.
 *
 * Dev overrides:
 *   DISABLE_RATE_LIMIT=true    — skips all rate limiting (dev only)
 *   AUTH_STRICT_MAX=100        — raise login limit for dev testing
 *   AUTH_REGISTER_MAX=50       — raise register limit for dev testing
 */

const rateLimit = require("express-rate-limit");

const isRateLimitDisabled = () => process.env.DISABLE_RATE_LIMIT === "true";

// ─── Global rate limit (INF-06) ──────────────────────────
const global = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000, // 15 min
  max: parseInt(process.env.RATE_LIMIT_MAX, 10) || 500,
  standardHeaders: true,
  legacyHeaders: false,
  skip: isRateLimitDisabled,
  message: { error: { code: "rate_limited", message: "Too many requests. Please try again later." } },
});

// ─── Strict rate limit for login (AUTH-10) ───────────────
const authStrict = rateLimit({
  windowMs: parseInt(process.env.AUTH_STRICT_WINDOW_MS, 10) || 60 * 1000, // 1 min
  max: parseInt(process.env.AUTH_STRICT_MAX, 10) || 10, // 10 attempts per minute
  standardHeaders: true,
  legacyHeaders: false,
  skip: isRateLimitDisabled,
  message: { error: { code: "rate_limited", message: "Too many login attempts. Please try again later." } },
});

// ─── Strict rate limit for register (AUTH-01) ────────────
const authRegister = rateLimit({
  windowMs: parseInt(process.env.AUTH_REGISTER_WINDOW_MS, 10) || 60 * 1000, // 1 min
  max: parseInt(process.env.AUTH_REGISTER_MAX, 10) || 5, // 5 attempts per minute
  standardHeaders: true,
  legacyHeaders: false,
  skip: isRateLimitDisabled,
  message: { error: { code: "rate_limited", message: "Too many registration attempts. Please try again later." } },
});

module.exports = { global, authStrict, authRegister };
