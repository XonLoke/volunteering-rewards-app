const { pool } = require("../config/database");
const { createError } = require("../middleware/errorHandler.middleware");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

async function register({ name, email, password }) {
  // Check if email already exists
  const existing = await pool.query(
    "SELECT id FROM users WHERE email = $1",
    [email]
  );
  if (existing.rows.length > 0) {
    throw createError(409, "email_taken", "Email already registered.");
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Generate unique QR code
  const qrCode = crypto.randomUUID();

  // Insert new user
  const { rows } = await pool.query(
    `INSERT INTO users (name, email, password_hash, role_id, points, volunteer_qr_code, status, created_at, updated_at)
     VALUES ($1, $2, $3, 1, 0, $4, 'active', NOW(), NOW())
     RETURNING id, name, email, points, volunteer_qr_code`,
    [name, email, hashedPassword, qrCode]
  );

  const user = rows[0];

  const token = jwt.sign(
    { id: user.id, email: user.email, role_id: 1 },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  return { user, token };
}

async function login({ email, password }) {
  const { rows } = await pool.query(
    `SELECT u.*, r.role_name 
     FROM users u 
     JOIN roles r ON u.role_id = r.id 
     WHERE u.email = $1`,
    [email]
  );

  if (rows.length === 0) {
    throw createError(401, "invalid_credentials", "Invalid email or password.");
  }

  const user = rows[0];

  if (user.status !== "active") {
    throw createError(403, "account_suspended", "Your account has been suspended.");
  }

  const isMatch = await bcrypt.compare(password, user.password_hash);
  if (!isMatch) {
    throw createError(401, "invalid_credentials", "Invalid email or password.");
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, role_id: user.role_id },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      points: user.points,
      role: user.role_name,
      volunteer_qr_code: user.volunteer_qr_code,
    },
    token,
  };
}

module.exports = { register, login };