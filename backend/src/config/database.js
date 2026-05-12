/**
 * Database Connection — PostgreSQL connection pool via `pg`.
 *
 * Usage:
 *   const pool = require("./src/config/database");
 *   const { rows } = await pool.query("SELECT * FROM users WHERE id = $1", [id]);
 */

const { Pool } = require("pg");

const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT, 10) || 5432,
  database: process.env.DB_NAME || "volunteering_rewards",
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "",
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

// ─── Connection Verification ─────────────────────────────
pool.on("connect", () => {
  console.log("New client acquired from the pool");
});

pool.on("error", (err) => {
  console.error("Unexpected pool error:", err.message);
});

/**
 * Quick health-check query.
 * Returns `true` if the database is reachable.
 */
async function checkConnection() {
  try {
    await pool.query("SELECT 1");
    return true;
  } catch {
    return false;
  }
}

module.exports = { pool, checkConnection };
