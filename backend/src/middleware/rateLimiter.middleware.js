/**
 * Rate Limiter Middleware (AUTH-10)
 *
 * Applies a global rate limit to all API routes.
 * Sensitive auth endpoints (login, register) use a stricter window.
 */

const rateLimit = require("express-rate-limit");

// ─── Global rate limit (INF-06) ──────────────────────────
const global = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000, // 15 min
  max: parseInt(process.env.RATE_LIMIT_MAX, 10) || 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: true, message: "Too many requests. Please try again later." },
});

// ─── Strict rate limit for auth endpoints (AUTH-10) ──────
const authStrict = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 10, // 10 attempts per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: true, message: "Too many login attempts. Please try again later." },
});

module.exports = { global, authStrict };
