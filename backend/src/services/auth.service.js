/**
 * Auth Service (AUTH-01, AUTH-02, AUTH-05, AUTH-06)
 *
 * Business logic for user registration, login, token refresh, and profile retrieval.
 * Each method is a pure async function — it takes input and returns a result or throws.
 *
 * Thrown errors are caught by the controller and forwarded to the error handler middleware.
 */

const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require("uuid");
const { pool } = require("../config/database");
const jwtUtil = require("../utils/jwt");
const { createError } = require("../middleware/errorHandler.middleware");

const SALT_ROUNDS = 12;

// ═══════════════════════════════════════════════════════════
//  AUTH-01: Register
// ═══════════════════════════════════════════════════════════

/**
 * Register a new user.
 *
 * @param {object} body - { email, password, name, phone? }
 * @returns {object} { user, accessToken, refreshToken }
 * @throws {Error} 409 if email already exists, 400 if validation fails
 */
async function register(body) {
  const { email, password, name, phone } = body;

  // ── Validate input ────────────────────────────────────
  if (!email || !password || !name) {
    throw createError(400, "Email, password, and name are required.");
  }

  if (typeof email !== "string" || !email.includes("@")) {
    throw createError(400, "Invalid email address.");
  }

  if (password.length < 8) {
    throw createError(400, "Password must be at least 8 characters.");
  }

  // ── Check for existing user ───────────────────────────
  const { rows: existing } = await pool.query(
    "SELECT id FROM users WHERE email = $1",
    [email.trim().toLowerCase()]
  );

  if (existing.length > 0) {
    throw createError(409, "An account with this email already exists.");
  }

  // ── Create user ───────────────────────────────────────
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const volunteerRoleId = await getRoleId("volunteer");
  const qrCode = uuidv4();

  const { rows } = await pool.query(
    `INSERT INTO users (email, password_hash, name, phone, role_id, volunteer_qr_code, points, status)
     VALUES ($1, $2, $3, $4, $5, $6, 0, 'active')
     RETURNING id, email, name, phone, points, volunteer_qr_code, role_id, created_at`,
    [email.trim().toLowerCase(), passwordHash, name.trim(), phone || null, volunteerRoleId, qrCode]
  );

  const user = rows[0];
  const roleName = await getRoleName(user.role_id);

  // ── Generate tokens ───────────────────────────────────
  const tokenPayload = { id: user.id, role: roleName };
  const accessToken  = jwtUtil.generateAccessToken(tokenPayload);
  const refreshToken = jwtUtil.generateRefreshToken(tokenPayload);

  // Store refresh token in DB (for rotation in Sprint ═)
  await pool.query(
    "UPDATE users SET refresh_token = $1 WHERE id = $2",
    [refreshToken, user.id]
  );

  return {
    user: sanitizeUser(user, roleName),
    accessToken,
    refreshToken,
  };
}

// ═══════════════════════════════════════════════════════════
//  AUTH-02: Login
// ═══════════════════════════════════════════════════════════

/**
 * Authenticate a user by email and password.
 *
 * @param {object} body - { email, password }
 * @returns {object} { user, accessToken, refreshToken }
 * @throws {Error} 401 if credentials are invalid
 */
async function login(body) {
  const { email, password } = body;

  if (!email || !password) {
    throw createError(400, "Email and password are required.");
  }

  const { rows } = await pool.query(
    `SELECT u.id, u.email, u.password_hash, u.name, u.phone, u.points,
            u.volunteer_qr_code, u.status, u.role_id, r.role_name
     FROM users u
     JOIN roles r ON r.id = u.role_id
     WHERE u.email = $1`,
    [email.trim().toLowerCase()]
  );

  if (rows.length === 0) {
    throw createError(401, "Invalid email or password.");
  }

  const user = rows[0];

  if (user.status !== "active") {
    throw createError(403, "Account is deactivated. Contact an administrator.");
  }

  const passwordValid = await bcrypt.compare(password, user.password_hash);
  if (!passwordValid) {
    throw createError(401, "Invalid email or password.");
  }

  // ── Generate tokens ───────────────────────────────────
  const tokenPayload = { id: user.id, role: user.role_name };
  const accessToken  = jwtUtil.generateAccessToken(tokenPayload);
  const refreshToken = jwtUtil.generateRefreshToken(tokenPayload);

  // Store refresh token in DB
  await pool.query(
    "UPDATE users SET refresh_token = $1 WHERE id = $2",
    [refreshToken, user.id]
  );

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      points: user.points,
      role: user.role_name,
      volunteer_qr_code: user.volunteer_qr_code,
      status: user.status,
    },
    accessToken,
    refreshToken,
  };
}

// ═══════════════════════════════════════════════════════════
//  AUTH-05: Refresh Token
// ═══════════════════════════════════════════════════════════

/**
 * Issue a new access token using a valid refresh token (rotation).
 *
 * @param {string} oldRefreshToken
 * @returns {object} { accessToken, refreshToken }
 * @throws {Error} 401 if token is invalid or revoked
 */
async function refreshTokens(oldRefreshToken) {
  if (!oldRefreshToken) {
    throw createError(401, "Refresh token is required.");
  }

  // Verify the token signature
  const decoded = jwtUtil.verifyRefreshToken(oldRefreshToken);
  if (!decoded) {
    throw createError(401, "Invalid or expired refresh token.");
  }

  // Verify it matches what's stored in DB (prevents token theft / rotation)
  const { rows } = await pool.query(
    "SELECT id, refresh_token FROM users WHERE id = $1 AND refresh_token = $2",
    [decoded.id, oldRefreshToken]
  );

  if (rows.length === 0) {
    // Token mismatch — possible token reuse attack. Revoke all tokens for safety.
    await pool.query("UPDATE users SET refresh_token = NULL WHERE id = $1", [decoded.id]);
    throw createError(401, "Refresh token has been revoked. Please log in again.");
  }

  const user = rows[0];

  // Get current role
  const { rows: roleRows } = await pool.query(
    `SELECT r.role_name FROM users u JOIN roles r ON r.id = u.role_id WHERE u.id = $1`,
    [user.id]
  );
  const roleName = roleRows[0]?.role_name || "volunteer";

  // Rotate: generate new tokens
  const tokenPayload = { id: user.id, role: roleName };
  const newAccessToken  = jwtUtil.generateAccessToken(tokenPayload);
  const newRefreshToken = jwtUtil.generateRefreshToken(tokenPayload);

  // Store new refresh token in DB (old one is now invalid)
  await pool.query(
    "UPDATE users SET refresh_token = $1 WHERE id = $2",
    [newRefreshToken, user.id]
  );

  return { accessToken: newAccessToken, refreshToken: newRefreshToken };
}

// ═══════════════════════════════════════════════════════════
//  AUTH-06: Get Profile
// ═══════════════════════════════════════════════════════════

/**
 * Retrieve the authenticated user's profile.
 *
 * @param {number} userId
 * @returns {object} user object (without password_hash)
 * @throws {Error} 404 if user not found
 */
async function getProfile(userId) {
  const { rows } = await pool.query(
    `SELECT u.id, u.email, u.name, u.phone, u.points, u.volunteer_qr_code,
            u.status, u.created_at, r.role_name AS role
     FROM users u
     JOIN roles r ON r.id = u.role_id
     WHERE u.id = $1`,
    [userId]
  );

  if (rows.length === 0) {
    throw createError(404, "User not found.");
  }

  return rows[0];
}

// ═══════════════════════════════════════════════════════════
//  Helpers
// ═══════════════════════════════════════════════════════════

async function getRoleId(roleName) {
  const { rows } = await pool.query("SELECT id FROM roles WHERE role_name = $1", [roleName]);
  return rows[0]?.id;
}

async function getRoleName(roleId) {
  const { rows } = await pool.query("SELECT role_name FROM roles WHERE id = $1", [roleId]);
  return rows[0]?.role_name || "volunteer";
}

function sanitizeUser(user, roleName) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    phone: user.phone,
    points: user.points,
    role: roleName,
    volunteer_qr_code: user.volunteer_qr_code,
  };
}

module.exports = {
  register,
  login,
  refreshTokens,
  getProfile,
};
