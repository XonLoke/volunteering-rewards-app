/**
 * Auth Service (AUTH-01, AUTH-02, AUTH-05, AUTH-06)
 *
 * Business logic for user registration, login, token refresh, and profile retrieval.
 * Uses Joi for input validation. All errors use createError with contract-compliant codes.
 */

const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require("uuid");
const Joi = require("joi");
const { pool } = require("../config/database");
const jwtUtil = require("../utils/jwt");
const { createError } = require("../middleware/errorHandler.middleware");

const SALT_ROUNDS = 12;
const ACCESS_TOKEN_EXPIRY_MS = 15 * 60 * 1000; // 15 min, matches JWT util

// ─── Joi Schemas ────────────────────────────────────────────

const registerSchema = Joi.object({
  name: Joi.string().min(2).max(100).trim().required()
    .messages({ "string.min": "Name must be at least 2 characters.", "any.required": "Name is required." }),
  email: Joi.string().email().trim().lowercase().required()
    .messages({ "string.email": "Please provide a valid email address.", "any.required": "Email is required." }),
  phone: Joi.string().pattern(/^\+65[689]\d{7}$/).optional().allow("")
    .messages({ "string.pattern.base": "Phone must be a valid SG number (e.g. +6581234567)." }),
  password: Joi.string().min(8).pattern(/(?=.*[A-Z])(?=.*\d)/).required()
    .messages({
      "string.min": "Password must be at least 8 characters.",
      "string.pattern.base": "Password must contain at least one uppercase letter and one number.",
      "any.required": "Password is required.",
    }),
  password_confirm: Joi.string().valid(Joi.ref("password")).required()
    .messages({ "any.only": "Passwords do not match.", "any.required": "Please confirm your password." }),
});

const loginSchema = Joi.object({
  email: Joi.string().email().trim().lowercase().required()
    .messages({ "string.email": "Please provide a valid email address.", "any.required": "Email is required." }),
  password: Joi.string().required()
    .messages({ "any.required": "Password is required." }),
});

// ═══════════════════════════════════════════════════════════
//  AUTH-01: Register
// ═══════════════════════════════════════════════════════════

/**
 * Register a new volunteer account.
 *
 * @param {object} body - { name, email, phone?, password, password_confirm }
 * @returns {object} { user, token }
 * @throws {Error} 400 validation_error, 409 email_taken
 */
async function register(body) {
  // ── Joi validation ────────────────────────────────────
  const { error, value } = registerSchema.validate(body, { abortEarly: false });
  if (error) {
    const details = {};
    error.details.forEach((d) => {
      const field = d.path[0];
      if (!details[field]) details[field] = d.message;
    });
    throw createError(400, "validation_error", "Validation failed. Please check your inputs.", details);
  }

  const { name, email, phone, password } = value;

  // ── Check for existing user ───────────────────────────
  const { rows: existing } = await pool.query(
    "SELECT id FROM users WHERE email = $1",
    [email]
  );

  if (existing.length > 0) {
    throw createError(409, "email_taken", "An account with this email already exists.");
  }

  // ── Check for existing phone (if provided) ────────────
  if (phone) {
    const { rows: phoneExists } = await pool.query(
      "SELECT id FROM users WHERE phone = $1",
      [phone]
    );
    if (phoneExists.length > 0) {
      throw createError(409, "phone_taken", "This phone number is already registered.");
    }
  }

  // ── Create user ───────────────────────────────────────
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const volunteerRoleId = await getRoleId("volunteer");
  const qrCode = uuidv4();

  const { rows } = await pool.query(
    `INSERT INTO users (email, password_hash, name, phone, role_id, volunteer_qr_code, points, status)
     VALUES ($1, $2, $3, $4, $5, $6, 0, 'active')
     RETURNING id, email, name, phone, points, role_id, created_at`,
    [email, passwordHash, name, phone || null, volunteerRoleId, qrCode]
  );

  const user = rows[0];
  const roleName = await getRoleName(user.role_id);

  // ── Generate token ────────────────────────────────────
  const tokenPayload = { id: user.id, role: roleName };
  const accessToken = jwtUtil.generateAccessToken(tokenPayload);
  const refreshToken = jwtUtil.generateRefreshToken(tokenPayload);

  await pool.query(
    "UPDATE users SET refresh_token = $1 WHERE id = $2",
    [refreshToken, user.id]
  );

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: roleName,
      points_balance: user.points,
      created_at: user.created_at,
    },
    token: accessToken,
  };
}

// ═══════════════════════════════════════════════════════════
//  AUTH-02: Login
// ═══════════════════════════════════════════════════════════

/**
 * Authenticate a user by email and password.
 *
 * @param {object} body - { email, password }
 * @returns {object} { user, token, expires_at }
 * @throws {Error} 400 validation_error, 401 invalid_credentials, 403 account_disabled
 */
async function login(body) {
  // ── Joi validation ────────────────────────────────────
  const { error, value } = loginSchema.validate(body, { abortEarly: false });
  if (error) {
    const details = {};
    error.details.forEach((d) => {
      const field = d.path[0];
      if (!details[field]) details[field] = d.message;
    });
    throw createError(400, "validation_error", "Validation failed. Please check your inputs.", details);
  }

  const { email, password } = value;

  const { rows } = await pool.query(
    `SELECT u.id, u.email, u.password_hash, u.name, u.phone, u.points,
            u.profile_image_url, u.status, u.role_id, u.created_at, r.role_name
     FROM users u
     JOIN roles r ON r.id = u.role_id
     WHERE u.email = $1`,
    [email]
  );

  if (rows.length === 0) {
    throw createError(401, "invalid_credentials", "Invalid email or password.");
  }

  const user = rows[0];

  if (user.status !== "active") {
    throw createError(403, "account_disabled", "Account is deactivated. Contact an administrator.");
  }

  const passwordValid = await bcrypt.compare(password, user.password_hash);
  if (!passwordValid) {
    throw createError(401, "invalid_credentials", "Invalid email or password.");
  }

  // ── Generate token ────────────────────────────────────
  const tokenPayload = { id: user.id, role: user.role_name };
  const accessToken = jwtUtil.generateAccessToken(tokenPayload);
  const refreshToken = jwtUtil.generateRefreshToken(tokenPayload);

  await pool.query(
    "UPDATE users SET refresh_token = $1 WHERE id = $2",
    [refreshToken, user.id]
  );

  // Calculate expires_at (15 min from now in ISO 8601)
  const expiresAt = new Date(Date.now() + ACCESS_TOKEN_EXPIRY_MS).toISOString();

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role_name,
      points_balance: user.points,
      avatar_url: user.profile_image_url,
    },
    token: accessToken,
    expires_at: expiresAt,
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
 * @throws {Error} 401 invalid_token
 */
async function refreshTokens(oldRefreshToken) {
  if (!oldRefreshToken) {
    throw createError(401, "invalid_token", "Refresh token is required.");
  }

  const decoded = jwtUtil.verifyRefreshToken(oldRefreshToken);
  if (!decoded) {
    throw createError(401, "invalid_token", "Invalid or expired refresh token.");
  }

  // Verify it matches what's stored in DB (prevents token theft / rotation)
  const { rows } = await pool.query(
    "SELECT id, refresh_token FROM users WHERE id = $1 AND refresh_token = $2",
    [decoded.id, oldRefreshToken]
  );

  if (rows.length === 0) {
    // Token mismatch — possible reuse attack. Revoke all tokens for safety.
    await pool.query("UPDATE users SET refresh_token = NULL WHERE id = $1", [decoded.id]);
    throw createError(401, "invalid_token", "Refresh token has been revoked. Please log in again.");
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

  await pool.query(
    "UPDATE users SET refresh_token = $1 WHERE id = $2",
    [newRefreshToken, user.id]
  );

  const expiresAt = new Date(Date.now() + ACCESS_TOKEN_EXPIRY_MS).toISOString();

  return { accessToken: newAccessToken, refreshToken: newRefreshToken, expires_at: expiresAt };
}

// ═══════════════════════════════════════════════════════════
//  AUTH-06: Get Profile
// ═══════════════════════════════════════════════════════════

/**
 * Retrieve the authenticated user's full profile.
 * Response matches GET /api/auth/me contract shape.
 *
 * @param {number} userId
 * @returns {object} user object (without password_hash)
 * @throws {Error} 404 if user not found
 */
async function getProfile(userId) {
  const { rows } = await pool.query(
    `SELECT u.id, u.email, u.name, u.phone, u.points,
            u.profile_image_url, u.status, u.created_at, r.role_name AS role
     FROM users u
     JOIN roles r ON r.id = u.role_id
     WHERE u.id = $1`,
    [userId]
  );

  if (rows.length === 0) {
    throw createError(404, "not_found", "User not found.");
  }

  const user = rows[0];

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    points_balance: user.points,
    avatar_url: user.profile_image_url,
    created_at: user.created_at,
    organisation: null, // Reserved for Phase 2
  };
}

// ═══════════════════════════════════════════════════════════
//  Profile Update
// ═══════════════════════════════════════════════════════════

/**
 * Update the authenticated user's profile.
 * Only name, phone, and avatar_url can be updated via this endpoint.
 *
 * @param {number} userId
 * @param {object} body - { name?, phone?, avatar_url? }
 * @returns {object} updated user fields
 * @throws {Error} 400 validation_error, 404 not_found
 */
async function updateProfile(userId, body) {
  const schema = Joi.object({
    name: Joi.string().min(2).max(100).trim().optional(),
    phone: Joi.string().pattern(/^\+65[689]\d{7}$/).optional().allow(""),
    avatar_url: Joi.string().uri().optional().allow(""),
  });

  const { error, value } = schema.validate(body, { abortEarly: false });
  if (error) {
    const details = {};
    error.details.forEach((d) => {
      const field = d.path[0];
      if (!details[field]) details[field] = d.message;
    });
    throw createError(400, "validation_error", "Validation failed.", details);
  }

  const fields = [];
  const values = [];
  let idx = 1;

  if (value.name !== undefined) { fields.push(`name = $${idx++}`); values.push(value.name); }
  if (value.phone !== undefined) { fields.push(`phone = $${idx++}`); values.push(value.phone); }
  if (value.avatar_url !== undefined) { fields.push(`profile_image_url = $${idx++}`); values.push(value.avatar_url); }

  if (fields.length === 0) {
    throw createError(400, "validation_error", "No fields to update.");
  }

  fields.push(`updated_at = NOW()`);
  values.push(userId);

  const { rows } = await pool.query(
    `UPDATE users SET ${fields.join(", ")} WHERE id = $${idx}
     RETURNING id, name, phone, profile_image_url AS avatar_url`,
    values
  );

  if (rows.length === 0) {
    throw createError(404, "not_found", "User not found.");
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

// ═══════════════════════════════════════════════════════════
//  AUTH-08: Register Organiser
// ═══════════════════════════════════════════════════════════

const registerOrganiserSchema = Joi.object({
  name: Joi.string().min(2).max(100).trim().required()
    .messages({ "string.min": "Name must be at least 2 characters.", "any.required": "Name is required." }),
  email: Joi.string().email().trim().lowercase().required()
    .messages({ "string.email": "Please provide a valid email address.", "any.required": "Email is required." }),
  phone: Joi.string().pattern(/^\+65[689]\d{7}$/).optional().allow("")
    .messages({ "string.pattern.base": "Phone must be a valid SG number (e.g. +6581234567)." }),
  password: Joi.string().min(8).pattern(/(?=.*[A-Z])(?=.*\d)/).required()
    .messages({
      "string.min": "Password must be at least 8 characters.",
      "string.pattern.base": "Password must contain at least one uppercase letter and one number.",
      "any.required": "Password is required.",
    }),
  password_confirm: Joi.string().valid(Joi.ref("password")).required()
    .messages({ "any.only": "Passwords do not match.", "any.required": "Please confirm your password." }),
  organisation_name: Joi.string().min(2).max(255).trim().required()
    .messages({ "string.min": "Organisation name must be at least 2 characters.", "any.required": "Organisation name is required." }),
  organisation_type: Joi.string().valid("charity", "statutory_board", "community_group", "private", "other").required()
    .messages({ "any.only": "Invalid organisation type.", "any.required": "Organisation type is required." }),
  organisation_docs: Joi.array().items(Joi.string().uri()).optional(),
});

/**
 * Register a new organiser account with organisation details.
 *
 * @param {object} body - { name, email, phone, password, password_confirm, organisation_name, organisation_type, organisation_docs? }
 * @returns {object} { user, token }
 * @throws {Error} 400 validation_error, 409 email_taken, 409 phone_taken
 */
async function registerOrganiser(body) {
  // ── Joi validation ────────────────────────────────────
  const { error, value } = registerOrganiserSchema.validate(body, { abortEarly: false });
  if (error) {
    const details = {};
    error.details.forEach((d) => {
      const field = d.path[0];
      if (!details[field]) details[field] = d.message;
    });
    throw createError(400, "validation_error", "Validation failed. Please check your inputs.", details);
  }

  const { name, email, phone, password, organisation_name, organisation_type, organisation_docs } = value;

  // ── Check for existing user ───────────────────────────
  const { rows: existing } = await pool.query(
    "SELECT id FROM users WHERE email = $1",
    [email]
  );

  if (existing.length > 0) {
    throw createError(409, "email_taken", "An account with this email already exists.");
  }

  // ── Check for existing phone (if provided) ────────────
  if (phone) {
    const { rows: phoneExists } = await pool.query(
      "SELECT id FROM users WHERE phone = $1",
      [phone]
    );
    if (phoneExists.length > 0) {
      throw createError(409, "phone_taken", "This phone number is already registered.");
    }
  }

  // ── Create organisation (pending approval) ────────────
  const { rows: orgRows } = await pool.query(
    `INSERT INTO organizations (org_name, org_type, status)
     VALUES ($1, $2, 'pending')
     RETURNING id, org_name, org_type, created_at`,
    [organisation_name, organisation_type]
  );
  const organisation = orgRows[0];

  // ── Create user ───────────────────────────────────────
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const organiserRoleId = await getRoleId("organiser");
  const qrCode = uuidv4();

  const { rows } = await pool.query(
    `INSERT INTO users (email, password_hash, name, phone, role_id, volunteer_qr_code, points, status, organisation_id)
     VALUES ($1, $2, $3, $4, $5, $6, 0, 'active', $7)
     RETURNING id, email, name, phone, points, role_id, created_at`,
    [email, passwordHash, name, phone || null, organiserRoleId, qrCode, organisation.id]
  );

  const user = rows[0];
  const roleName = await getRoleName(user.role_id);

  // ── Generate token ────────────────────────────────────
  const tokenPayload = { id: user.id, role: roleName };
  const accessToken = jwtUtil.generateAccessToken(tokenPayload);
  const refreshToken = jwtUtil.generateRefreshToken(tokenPayload);

  await pool.query(
    "UPDATE users SET refresh_token = $1 WHERE id = $2",
    [refreshToken, user.id]
  );

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: roleName,
      organisation: {
        id: organisation.id,
        name: organisation.org_name,
        type: organisation.org_type,
        status: "pending_approval",
      },
      created_at: user.created_at,
    },
    token: accessToken,
  };
}

module.exports = {
  register,
  registerOrganiser,
  login,
  refreshTokens,
  getProfile,
  updateProfile,
};
