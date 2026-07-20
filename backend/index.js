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
if (process.env.NODE_ENV !== "production") {
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
}

// ─── Middleware Stack ────────────────────────────────────
app.use(helmet({ contentSecurityPolicy: false })); // Disable CSP for dev — enable in prod

// CORS — allow configured origins (reflect request origin when wildcard)
const rawCors = process.env.CORS_ORIGINS;
const corsOrigins = rawCors && rawCors !== "*"
  ? rawCors.split(",").map((s) => s.trim())
  : true; // true = reflect the request Origin header (safe with credentials)
app.use(cors({ origin: corsOrigins, credentials: true }));
app.use(express.json({ limit: "1mb" }));
app.use(rateLimiter.global);

// ─── Serve Frontend Prototypes (static files) ───────────
app.use(express.static(path.join(__dirname, "..", "frontend")));

// ─── Health Check ────────────────────────────────────────
app.get("/api/health", (_req, res) => {
  const db = require("./src/config/database");
  db.checkConnection().then((ok) => {
    // 🔒 SECURITY: Don't leak DB connection details in production
    const body = { status: "ok", timestamp: new Date().toISOString(), uptime: process.uptime() };
    if (process.env.NODE_ENV !== "production") {
      body.db_connected = ok;
      body.db_host = process.env.DB_HOST || "(not set)";
      body.db_name = process.env.DB_NAME || "(not set)";
      body.db_user = process.env.DB_USER || "(not set)";
      body.db_ssl = process.env.DB_SSL || "(not set)";
      body.has_database_url = !!process.env.DATABASE_URL;
    }
    res.json(body);
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

// ─── Seed Data via HTTP (for Render without Shell) ────────
// 🔒 SECURITY: Debug endpoints are ONLY available in development mode
function devOnly(_req, _res, next) {
  if (process.env.NODE_ENV === "production") {
    return _res.status(404).json({ error: { code: "not_found", message: "Route not found" } });
  }
  next();
}

app.post("/api/debug/seed", devOnly, async (_req, res) => {
  try {
    const { pool } = require("./src/config/database");
    const bcrypt = require("bcrypt");
    const { v4: uuidv4 } = require("uuid");

    const hash = await bcrypt.hash("password123", 12);
    const roles = [
      ["volunteer", "Volunteer — browses events, earns points, redeems rewards"],
      ["organiser", "Event Organizer — creates events, scans QR codes, manages attendance"],
      ["admin", "System Admin — manages users, creates coupons, verifies PINs, audits"],
      ["merchant", "Merchant Cashier — verifies PINs, redeems coupons"],
    ];
    let seeded = { roles: 0, users: 0, org: false, events: 0, merchants: 0, coupons: 0 };
    for (const [name, desc] of roles) {
      const r = await pool.query("INSERT INTO roles (role_name, description) VALUES ($1, $2) ON CONFLICT (role_name) DO NOTHING", [name, desc]);
      if (r.rowCount > 0) seeded.roles++;
    }

    // Full 8 users (2 per role)
    const testUsers = [
      {name: "Alice Volunteer", email: "alice@test.com", role: "volunteer", points: 500},
      {name: "Eve Volunteer", email: "eve@test.com", role: "volunteer", points: 300},
      {name: "Bob Organizer", email: "bob@test.com", role: "organiser", points: 0},
      {name: "Johnny Organizer", email: "johnny@test.com", role: "organiser", points: 0},
      {name: "Carol Admin", email: "carol@test.com", role: "admin", points: 0},
      {name: "Cheryl Merchant", email: "cheryl@test.com", role: "merchant", points: 0},
      {name: "Diana Merchant", email: "diana@test.com", role: "merchant", points: 0},
      {name: "Frank Merchant", email: "frank@test.com", role: "merchant", points: 0},
    ];
    for (const u of testUsers) {
      const roleRes = await pool.query("SELECT id FROM roles WHERE role_name = $1", [u.role]);
      if (roleRes.rows.length > 0) {
        const qr = uuidv4();
        const r = await pool.query("INSERT INTO users (email, password_hash, name, role_id, points, volunteer_qr_code, status) VALUES ($1, $2, $3, $4, $5, $6, 'active') ON CONFLICT (email) DO NOTHING", [u.email, hash, u.name, roleRes.rows[0].id, u.points, qr]);
        if (r.rowCount > 0) seeded.users++;
      }
    }

    // Organization
    const orgRes = await pool.query("INSERT INTO organizations (org_name, org_type, uen, contact_person, contact_email, approval_status, status) VALUES ('Green Earth Society', 'Non-Profit', 'S80SS0011A', 'Bob Organizer', 'bob@test.com', 'approved', 'active') ON CONFLICT DO NOTHING RETURNING id");
    if (orgRes.rows.length > 0) seeded.org = true;
    const orgRow = await pool.query("SELECT id FROM organizations LIMIT 1");

    // Events (3)
    const bobRow = await pool.query("SELECT id FROM users WHERE email = 'bob@test.com' LIMIT 1");
    if (orgRow.rows.length > 0 && bobRow.rows.length > 0) {
      const events = [
        ["Beach Cleanup @ East Coast", "Help clean up East Coast Park. Gloves and bags provided.", "East Coast Park, Singapore", "2026-06-15 08:00:00+08", 50, 20, "Environment"],
        ["Elderly Morning Walk", "Accompany seniors from Bright Hill Home for a morning walk.", "Bright Hill Home, Singapore", "2026-06-20 09:00:00+08", 30, 15, "Elderly"],
        ["Food Distribution @ Jalan Besar", "Pack and distribute meals to low-income families in Jalan Besar.", "Jalan Besar Community Centre", "2026-06-25 10:00:00+08", 40, 25, "Community"],
      ];
      for (const [title, desc, loc, date, cap, pts, cat] of events) {
        const r = await pool.query("INSERT INTO events (organization_id, organizer_id, title, description, location, event_date, capacity, points_value, category, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'upcoming') ON CONFLICT DO NOTHING", [orgRow.rows[0].id, bobRow.rows[0].id, title, desc, loc, date, cap, pts, cat]);
        if (r.rowCount > 0) seeded.events++;
      }
    }

    // Merchants (3, linked to merchant users)
    const testMerchants = [
      {name: "FairPrice Singapore", contact: "Cheryl", email: "cheryl@test.com", phone: "+65 8111 1111", address: "1 Tampines Central, Singapore"},
      {name: "Kopitiam Pte Ltd", contact: "Diana", email: "diana@test.com", phone: "+65 8222 2222", address: "2 Jalan Besar, Singapore"},
      {name: "GrabFood Asia", contact: "Frank", email: "frank@test.com", phone: "+65 8333 3333", address: "3 Marina Boulevard, Singapore"},
    ];
    for (const m of testMerchants) {
      const userRow = await pool.query("SELECT id FROM users WHERE email = $1 LIMIT 1", [m.email]);
      if (userRow.rows.length > 0) {
        const r = await pool.query("INSERT INTO merchants (name, contact_person, contact_email, contact_phone, address, created_by) VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT DO NOTHING", [m.name, m.contact, m.email, m.phone, m.address, userRow.rows[0].id]);
        if (r.rowCount > 0) seeded.merchants++;
      }
    }

    // Coupons (3 with value_cents and merchant_name)
    const carolRow = await pool.query("SELECT id FROM users WHERE email = 'carol@test.com' LIMIT 1");
    if (carolRow.rows.length > 0) {
      const coupons = [
        {title: "$5 FairPrice Voucher", desc: "Redeem for a $5 FairPrice grocery voucher.", pts: 100, qty: 50, value: 500, merchant: "FairPrice Singapore", exp: "2026-12-31 23:59:59+08"},
        {title: "Kopitiam Coffee & Toast Set", desc: "A set of coffee and toast at any Kopitiam outlet.", pts: 50, qty: 100, value: 400, merchant: "Kopitiam Pte Ltd", exp: "2026-10-31 23:59:59+08"},
        {title: "$10 GrabFood Promo Code", desc: "$10 off your next GrabFood order (min. $20 spend).", pts: 200, qty: 25, value: 1000, merchant: "GrabFood Asia", exp: "2026-09-30 23:59:59+08"},
      ];
      for (const cp of coupons) {
        const r = await pool.query("INSERT INTO coupons (title, description, points_required, quantity, value_cents, merchant_name, expiry_date, status, created_by) VALUES ($1, $2, $3, $4, $5, $6, $7, 'active', $8) ON CONFLICT DO NOTHING", [cp.title, cp.desc, cp.pts, cp.qty, cp.value, cp.merchant, cp.exp, carolRow.rows[0].id]);
        if (r.rowCount > 0) seeded.coupons++;
      }
    }

    res.json({ message: "Seed complete", seeded });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Seed Coupon PINs (for Render without Shell) ───────────
const { hashPin } = require("./src/services/rewards.service");

app.post("/api/debug/seed-coupon-pins", devOnly, async (_req, res) => {
  try {
    const { pool } = require("./src/config/database");
    const crypto = require("crypto");

    // Delete old data
    await pool.query("DELETE FROM user_coupons");
    await pool.query("DELETE FROM redemption_logs");

    const { rows: coupons } = await pool.query("SELECT id, title, quantity FROM coupons WHERE status = 'active' AND quantity > 0");
    let totalPins = 0;

    for (const cp of coupons) {
      const qty = Math.min(cp.quantity, 20); // cap at 20 pins per coupon
      for (let i = 0; i < qty; i++) {
        const pin = String(100000 + crypto.randomInt(0, 900000));
        const pinHash = hashPin(pin);
        await pool.query(
          "INSERT INTO user_coupons (coupon_id, pin_code, pin_hash, status, expiry_date) VALUES ($1, $2, $3, 'unused', '2026-12-31')",
          [cp.id, pin, pinHash]
        );
        totalPins++;
      }
    }

    res.json({ message: "Coupon PINs generated", coupons_processed: coupons.length, pins_generated: totalPins });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Diagnostic: Check DB Schema & Tables ─────────────────
app.get("/api/debug/db", devOnly, async (_req, res) => {
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
    res.status(500).json({ error: err.message });
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
app.use("/api/referral", require("./src/routes/referral.routes")); // Alias for Vivian's frontend

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

// AI — LLM-powered recommendations & feedback summary (Gen 2)
app.use("/api/ai", require("./src/routes/ai.routes"));

// ─── Debug: Direct email test (REMOVE AFTER DEBUGGING) ──
app.get("/api/debug/email-test", async (_req, res) => {
  try {
    const { sendEmail } = require("./src/services/email.service");
    const result = await sendEmail({
      to: "xiaoai.assistant@proton.me",
      subject: "Debug test from Render",
      text: "If you receive this, SMTP works from Render!",
    });
    res.json({ ok: true, result });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message, stack: err.stack?.split("\n").slice(0, 3).join("\\n") });
  }
});
// ────────────────────────────────────────────────────────

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
