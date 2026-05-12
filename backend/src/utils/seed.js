/**
 * Seed Data Script (INF-04)
 *
 * Populates the database with initial reference data:
 *   - 3 roles (volunteer, organizer, admin)
 *   - 1 test user per role
 *   - 1 sample organization
 *   - 3 sample events
 *   - 3 sample coupons
 *
 * Safe to run multiple times — uses ON CONFLICT DO NOTHING / skipping.
 *
 * Usage:
 *   node src/utils/seed.js
 *   npm run seed
 */

require("dotenv").config({ path: require("path").resolve(__dirname, "../../.env") });
const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require("uuid");
const { pool } = require("../config/database");

const SALT_ROUNDS = 12;

// ─── Seed Data ───────────────────────────────────────────

const ROLES = [
  { role_name: "volunteer", description: "Volunteer — browses events, earns points, redeems rewards" },
  { role_name: "organizer", description: "Event Organizer — creates events, scans QR codes, manages attendance" },
  { role_name: "admin",     description: "System Admin — manages users, creates coupons, verifies PINs, audits" },
];

const TEST_USERS = [
  { name: "Alice Volunteer", email: "alice@test.com",   role: "volunteer", points: 500 },
  { name: "Bob Organizer",   email: "bob@test.com",     role: "organizer", points: 0 },
  { name: "Carol Admin",     email: "carol@test.com",   role: "admin",     points: 0 },
];

const TEST_ORGANIZATION = {
  org_name: "Green Earth Society",
  org_type: "Non-Profit",
  uen: "S80SS0011A",
  address: "1 Green Crescent, Singapore 123456",
  contact_person: "Bob Organizer",
  contact_email: "bob@test.com",
  contact_phone: "+65 9123 4567",
  approval_status: "approved",
};

const TEST_EVENTS = [
  { title: "Beach Cleanup @ East Coast",     description: "Help clean up East Coast Park. Gloves and bags provided.",               location: "East Coast Park, Singapore",      event_date: "2026-06-15 08:00:00+08", capacity: 50,  points_value: 20, category: "Environment" },
  { title: "Elderly Morning Walk",           description: "Accompany seniors from Bright Hill Home for a morning walk.",           location: "Bright Hill Home, Singapore",     event_date: "2026-06-20 09:00:00+08", capacity: 30,  points_value: 15, category: "Elderly" },
  { title: "Food Distribution @ Jalan Besar",description: "Pack and distribute meals to low-income families in Jalan Besar.",     location: "Jalan Besar Community Centre",    event_date: "2026-06-25 10:00:00+08", capacity: 40,  points_value: 25, category: "Community" },
];

const TEST_COUPONS = [
  { title: "$5 FairPrice Voucher",       description: "Redeem for a $5 FairPrice grocery voucher.",                  points_required: 100, quantity: 50,  expiry_date: "2026-12-31 23:59:59+08" },
  { title: "Kopitiam Coffee & Toast Set",description: "A set of coffee and toast at any Kopitiam outlet.",            points_required: 50,  quantity: 100, expiry_date: "2026-10-31 23:59:59+08" },
  { title: "$10 GrabFood Promo Code",    description: "$10 off your next GrabFood order (min. $20 spend).",          points_required: 200, quantity: 25,  expiry_date: "2026-09-30 23:59:59+08" },
];

// ─── Seed Logic ──────────────────────────────────────────

async function seed() {
  console.log("─".repeat(50));
  console.log("Seed Script Starting");
  console.log("─".repeat(50));

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // 1. Seed Roles
    console.log("\n  ▶ Seeding roles...");
    for (const role of ROLES) {
      await client.query(
        `INSERT INTO roles (role_name, description) VALUES ($1, $2) ON CONFLICT (role_name) DO NOTHING`,
        [role.role_name, role.description]
      );
    }
    console.log("  ✓ Roles seeded");

    // 2. Seed Test Users
    console.log("\n  ▶ Seeding test users...");
    const passwordHash = await bcrypt.hash("password123", SALT_ROUNDS);

    for (const u of TEST_USERS) {
      const { rows } = await client.query(`SELECT id FROM roles WHERE role_name = $1`, [u.role]);
      const roleId = rows[0].id;
      const qrCode = uuidv4();

      await client.query(
        `INSERT INTO users (email, password_hash, name, role_id, points, volunteer_qr_code, status)
         VALUES ($1, $2, $3, $4, $5, $6, 'active')
         ON CONFLICT (email) DO NOTHING`,
        [u.email, passwordHash, u.name, roleId, u.points, qrCode]
      );
    }
    console.log("  ✓ Test users seeded (password: password123)");

    // 3. Seed Organization (only if it doesn't exist)
    console.log("\n  ▶ Seeding organization...");
    const { rows: orgUsers } = await client.query(
      `SELECT id FROM users WHERE email = 'bob@test.com'`
    );

    if (orgUsers.length > 0) {
      const bobId = orgUsers[0].id;
      await client.query(
        `INSERT INTO organizations (org_name, org_type, uen, address, contact_person, contact_email, contact_phone, approval_status, approved_by, approved_at, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), 'active')
         ON CONFLICT DO NOTHING`,
        [TEST_ORGANIZATION.org_name, TEST_ORGANIZATION.org_type, TEST_ORGANIZATION.uen,
         TEST_ORGANIZATION.address, TEST_ORGANIZATION.contact_person,
         TEST_ORGANIZATION.contact_email, TEST_ORGANIZATION.contact_phone,
         TEST_ORGANIZATION.approval_status, bobId]
      );
      console.log("  ✓ Organization seeded");
    }

    // 4. Seed Events
    console.log("\n  ▶ Seeding events...");
    const { rows: adminRows } = await client.query(
      `SELECT id FROM users WHERE email = 'bob@test.com'`
    );
    const organizerId = adminRows[0]?.id;
    const { rows: orgRows } = await client.query(
      `SELECT id FROM organizations WHERE org_name = $1`, [TEST_ORGANIZATION.org_name]
    );
    const orgId = orgRows[0]?.id;

    if (organizerId && orgId) {
      for (const evt of TEST_EVENTS) {
        await client.query(
          `INSERT INTO events (organization_id, organizer_id, title, description, location, event_date, capacity, points_value, category, status)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'upcoming')
           ON CONFLICT DO NOTHING`,
          [orgId, organizerId, evt.title, evt.description, evt.location, evt.event_date, evt.capacity, evt.points_value, evt.category]
        );
      }
      console.log("  ✓ Events seeded");
    }

    // 5. Seed Coupons
    console.log("\n  ▶ Seeding coupons...");
    const { rows: carolRows } = await client.query(
      `SELECT id FROM users WHERE email = 'carol@test.com'`
    );
    const adminId = carolRows[0]?.id;

    if (adminId) {
      for (const cp of TEST_COUPONS) {
        await client.query(
          `INSERT INTO coupons (title, description, points_required, quantity, expiry_date, status, created_by)
           VALUES ($1, $2, $3, $4, $5, 'active', $6)
           ON CONFLICT DO NOTHING`,
          [cp.title, cp.description, cp.points_required, cp.quantity, cp.expiry_date, adminId]
        );
      }
      console.log("  ✓ Coupons seeded");
    }

    await client.query("COMMIT");

    console.log("\n" + "─".repeat(50));
    console.log("Seed complete. Happy coding!");
    console.log("─".repeat(50));
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Seed failed:", err.message);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

seed().catch((err) => {
  console.error("Seed script error:", err.message);
  process.exit(1);
});
