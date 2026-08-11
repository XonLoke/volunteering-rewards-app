/**
 * JWT Utility — sign, verify, and decode access & refresh tokens.
 *
 * Token design:
 *   Access token  — short-lived (15 min), carries user_id + role
 *   Refresh token — long-lived (7 days), stored in DB for rotation
 *
 * Usage:
 *   const { generateAccessToken, verifyAccessToken } = require("./utils/jwt");
 */

const jwt = require("jsonwebtoken");

// ─── Access Token ────────────────────────────────────────
// 🔒 SECURITY (5 Aug audit #1): never fall back to a public default secret in
// production — a config error must fail the boot, not silently forge tokens.
function prodSecret(name, value, devFallback) {
  if (!value && process.env.NODE_ENV === "production") {
    throw new Error(`FATAL: ${name} is not set — refusing to start in production with a fallback secret`);
  }
  return value || devFallback;
}
const ACCESS_SECRET  = prodSecret("JWT_ACCESS_SECRET", process.env.JWT_ACCESS_SECRET, "dev-access-secret-not-for-production");
const REFRESH_SECRET = prodSecret("JWT_REFRESH_SECRET", process.env.JWT_REFRESH_SECRET, "dev-refresh-secret-not-for-production");
const ACCESS_EXPIRES_IN  = process.env.JWT_ACCESS_EXPIRES_IN  || "15m";
const REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || "7d";

/**
 * Generate an access token for a user.
 * @param {{ id: number, role: string }} user
 * @returns {string} signed JWT access token
 */
function generateAccessToken(user) {
  return jwt.sign(
    { id: user.id, role: user.role },
    ACCESS_SECRET,
    { expiresIn: ACCESS_EXPIRES_IN }
  );
}

/**
 * Generate a refresh token for a user.
 * @param {{ id: number }} user
 * @returns {string} signed JWT refresh token
 */
function generateRefreshToken(user) {
  return jwt.sign(
    { id: user.id },
    REFRESH_SECRET,
    { expiresIn: REFRESH_EXPIRES_IN }
  );
}

/**
 * Verify and decode an access token.
 * @param {string} token
 * @returns {{ id: number, role: string, iat: number, exp: number } | null}
 */
function verifyAccessToken(token) {
  try {
    return jwt.verify(token, ACCESS_SECRET);
  } catch {
    return null;
  }
}

/**
 * Verify and decode a refresh token.
 * @param {string} token
 * @returns {{ id: number, iat: number, exp: number } | null}
 */
function verifyRefreshToken(token) {
  try {
    return jwt.verify(token, REFRESH_SECRET);
  } catch {
    return null;
  }
}

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
};
