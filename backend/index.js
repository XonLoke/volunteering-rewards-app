/**
 * Volunteering Rewards App — Backend Entry Point
 * Express server with middleware stack and route registration.
 */

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const path = require("path");
const rateLimiter = require("./src/middleware/rateLimiter.middleware");
const errorHandler = require("./src/middleware/errorHandler.middleware");

const app = express();
const PORT = process.env.PORT || 3000;

// ─── Startup Diagnostics ──────────────────────────────────
console.log("─".repeat(50));
console.log("Volunteering Rewards API — startup diagnostics");
console.log("─".repeat(50));
console.log(`NODE_ENV:          ${process.env.NODE_ENV}`);
console.log(`PORT:              ${PORT}`);
console.log(`DB_HOST:           ${process.env.DB_HOST || "(not set)"}`);
console.log(`DB_PORT:           ${process.env.DB_PORT || "(not set)"}`);
console.log(`DB_NAME:           ${process.env.DB_NAME || "(not set)"}`);
console.log(`DB_USER:           ${process.env.DB_USER || "(not set)"}`);
console.log(`DB_PASSWORD:       ${process.env.DB_PASSWORD ? "***set***" : "(not set)"}`);
console.log(`DB_SSL:            ${process.env.DB_SSL || "(not set)"}`);
console.log(`DATABASE_URL:      ${process.env.DATABASE_URL ? "***set***" : "(not set)"}`);
console.log(`CORS_ORIGINS:      ${process.env.CORS_ORIGINS || "(not set)"}`);
console.log(`JWT_ACCESS_SECRET: ${process.env.JWT_ACCESS_SECRET ? "***set***" : "(not set)"}`);
console.log("─".repeat(50));

// ─── Middleware Stack ────────────────────────────────────
app.use(helmet({ contentSecurityPolicy: false })); // Disable CSP for dev — enable in prod

// CORS — allow configured origins (fallback to all origins in dev)
const corsOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(",").map((s) => s.trim())
  : "*";
app.use(cors({ origin: corsOrigins, credentials: true }));
app.use(express.json({ limit: "1mb" }));
app.use(rateLimiter.global);

// ─── Serve Frontend Prototypes (static files) ───────────
app.use(express.static(path.join(__dirname, "..", "frontend")));

// ─── Health Check ────────────────────────────────────────
app.get("/api/health", (_req, res) => {
  const db = require("./src/config/database");
  db.checkConnection().then((ok) => {
    res.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      db_connected: ok,
      db_host: process.env.DB_HOST || "(not set)",
      db_name: process.env.DB_NAME || "(not set)",
      db_user: process.env.DB_USER || "(not set)",
      db_ssl: process.env.DB_SSL || "(not set)",
      has_database_url: !!process.env.DATABASE_URL,
    });
  });
});

// ─── Auto-Migrate on Startup (production only) ────────────
if (process.env.NODE_ENV === "production") {
  (async () => {
    try {
      const { pool } = require("./src/config/database");
      const { readFileSync, readdirSync, existsSync } = require("fs");
      const path = require("path");
      const migrationDir = path.resolve(__dirname, "migrations");
      const files = readdirSync(migrationDir).filter(f => f.endsWith(".sql")).sort();
      console.log(`Auto-migrate: running ${files.length} migration(s)...`);
      for (const file of files) {
        const sql = readFileSync(path.join(migrationDir, file), "utf-8");
        try {
          await pool.query(sql);
          console.log(`  ✓ ${file}`);
        } catch (err) {
          console.error(`  ✗ ${file}: ${err.message}`);
        }
      }
      console.log("Auto-migrate: done.");

      // Auto-seed if users table is empty
      const { rows } = await pool.query("SELECT COUNT(*)::int AS cnt FROM users");
      if (rows[0].cnt === 0) {
        console.log("Auto-seed: users table empty, running seed...");
        try {
          // Inline minimal seed
          const bcrypt = require("bcrypt");
          const { v4: uuidv4 } = require("uuid");

          // Seed roles
          const roles = [
            ["volunteer", "Volunteer — browses events, earns points, redeems rewards"],
            ["organiser", "Event Organizer — creates events, scans QR codes, manages attendance"],
            ["admin", "System Admin — manages users, creates coupons, verifies PINs, audits"],
            ["merchant", "Merchant Cashier — verifies PINs, redeems coupons"],
          ];
          for (const [name, desc] of roles) {
            await pool.query("INSERT INTO roles (role_name, description) VALUES ($1, $2) ON CONFLICT (role_name) DO NOTHING", [name, desc]);
          }
          console.log("  ✓ roles seeded");

          // Seed test users
          const hash = await bcrypt.hash("password123", 12);
          const testUsers = [
            {name: "Alice Volunteer", email: "alice@test.com", role: "volunteer", points: 500},
            {name: "Bob Organizer", email: "bob@test.com", role: "organiser", points: 0},
            {name: "Carol Admin", email: "carol@test.com", role: "admin", points: 0},
            {name: "Cheryl Merchant", email: "cheryl@test.com", role: "merchant", points: 0},
          ];
          for (const u of testUsers) {
            const roleRes = await pool.query("SELECT id FROM roles WHERE role_name = $1", [u.role]);
            if (roleRes.rows.length > 0) {
              const qr = uuidv4();
              await pool.query(
                "INSERT INTO users (email, password_hash, name, role_id, points, volunteer_qr_code, status) VALUES ($1, $2, $3, $4, $5, $6, 'active') ON CONFLICT (email) DO NOTHING",
                [u.email, hash, u.name, roleRes.rows[0].id, u.points, qr]
              );
            }
          }
          console.log("  ✓ test users seeded");

          // Seed a sample event so there's content
          const orgRes = await pool.query("INSERT INTO organizations (org_name, org_type, uen, contact_person, contact_email, approval_status, status) VALUES ('Green Earth Society', 'Non-Profit', 'S80SS0011A', 'Bob Organizer', 'bob@test.com', 'approved', 'active') ON CONFLICT DO NOTHING RETURNING id");
          if (orgRes.rows.length > 0) {
            const bobRes = await pool.query("SELECT id FROM users WHERE email = 'bob@test.com'");
            if (bobRes.rows.length > 0) {
              await pool.query("INSERT INTO events (organization_id, organizer_id, title, description, location, event_date, capacity, points_value, category, status) VALUES ($1, $2, 'Beach Cleanup @ East Coast', 'Help clean up East Coast Park.', 'East Coast Park', NOW() + INTERVAL \'7 days\', 50, 20, 'Environment', 'upcoming') ON CONFLICT DO NOTHING", [orgRes.rows[0].id, bobRes.rows[0].id]);
            }
          }
          console.log("  ✓ sample content seeded");
        } catch (seedErr) {
          console.error("Auto-seed error:", seedErr.message);
        }
      } else {
        console.log(`Auto-seed: skipped (${rows[0].cnt} users already exist)`);
      }
    } catch (err) {
      console.error("Auto-migrate error:", err.message);
    }
  })();
}

// ─── Diagnostic: Check DB Schema & Tables ─────────────────
app.get("/api/debug/db", async (_req, res) => {
  try {
    const { pool } = require("./src/config/database");
    const schema = await pool.query("SELECT current_database(), current_schema(), inet_server_addr(), version()");
    const searchPath = await pool.query("SHOW search_path");
    const tables = await pool.query("SELECT table_name, table_schema FROM information_schema.tables WHERE table_catalog = current_database() AND table_schema NOT IN ('pg_catalog', 'information_schema') ORDER BY table_schema, table_name");
    const usersCount = await pool.query("SELECT COUNT(*)::int AS cnt FROM information_schema.tables WHERE table_name = 'users'");
    // Also check all available databases on this server
    const databases = await pool.query("SELECT datname FROM pg_database WHERE datistemplate = false ORDER BY datname");
    // Check if schema exists with tables
    const schemas = await pool.query("SELECT schema_name FROM information_schema.schemata WHERE schema_name NOT IN ('pg_catalog', 'information_schema', 'pg_toast') ORDER BY schema_name");
    res.json({
      db: schema.rows[0],
      search_path: searchPath.rows,
      databases: databases.rows.map(r => r.datname),
      schemas: schemas.rows.map(r => r.schema_name),
      tables: tables.rows,
      users_table_exists: usersCount.rows[0].cnt > 0,
    });
  } catch (err) {
    res.status(500).json({ error: err.message, detail: err.stack });
  }
});

// ─── API Routes ─────────────────────────────────────────
// Workflow A — Auth & User Management
app.use("/api/auth", require("./src/routes/auth.routes"));

// Workflow B — Events & QR Attendance
app.use("/api/events", require("./src/routes/events.routes"));
app.use("/api/events", require("./src/routes/feedback.routes")); // F2: Feedback Summarizer
app.use("/api/attendance", require("./src/routes/attendance.routes"));

// Volunteer-specific data
app.use("/api/me", require("./src/routes/me.routes"));

// Referral Program (F3)
app.use("/api/me", require("./src/routes/referral.routes"));

// F4: Hall of Fame Leaderboard
app.use("/api/leaderboard", require("./src/routes/leaderboard.routes"));

// Favorites toggle
app.use("/api/favorites", require("./src/routes/favorites.routes"));

// Workflow C — Rewards & Redemption
app.use("/api/rewards", require("./src/routes/rewards.routes"));

// Organiser Web Portal
app.use("/api/organiser", require("./src/routes/organiser.routes"));

// Admin Web Portal
app.use("/api/admin", require("./src/routes/admin.routes"));

// Merchant Redemption App
app.use("/api", require("./src/routes/merchant.routes"));

// User Settings & Contact (Vivian's routes — adapted)
app.use("/api/settings", require("./src/routes/settings.routes"));
app.use("/api/contact", require("./src/routes/contact.routes"));

// ─── 404 Handler ─────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: { code: "not_found", message: "Route not found" } });
});

// ─── Global Error Handler ────────────────────────────────
app.use(errorHandler);

// ─── Start Server ────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} [${process.env.NODE_ENV || "development"}]`);
});

module.exports = app;
