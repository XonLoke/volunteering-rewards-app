/**
 * Seed Data Script (INF-04)
 *
 * Populates the database with initial reference data:
 *   - 4 roles (volunteer, organizer, admin, merchant)
 *   - 2 test users per role (total 8 users)
 *   - 1 sample organization
 *   - 3 sample events
 *   - 3 sample coupons with merchant association
 *   - 2 merchant business records linked to merchant users
 *
 * Safe to run multiple times — uses ON CONFLICT DO NOTHING / skipping.
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
  { role_name: "merchant",  description: "Merchant Cashier — verifies PINs, redeems coupons" },
];

const TEST_USERS = [
  // Volunteers
  { name: "Alice Volunteer",  email: "alice@test.com",    role: "volunteer", points: 500 },
  { name: "Eve Volunteer",    email: "eve@test.com",      role: "volunteer", points: 300 },
  // Organisers
  { name: "Bob Organizer",    email: "bob@test.com",      role: "organizer", points: 0 },
  { name: "Johnny Organizer", email: "johnny@test.com",   role: "organizer", points: 0 },
  // Admin
  { name: "Carol Admin",      email: "carol@test.com",    role: "admin",     points: 0 },
  // Merchants
  { name: "Cheryl Merchant",  email: "cheryl@test.com",   role: "merchant",  points: 0 },
  { name: "Diana Merchant",   email: "diana@test.com",    role: "merchant",  points: 0 },
  { name: "Frank Merchant",   email: "frank@test.com",    role: "merchant",  points: 0 },
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

const TEST_MERCHANTS = [
  { name: "FairPrice Singapore",    contact_person: "Cheryl", contact_email: "cheryl@test.com", contact_phone: "+65 8111 1111", address: "1 Tampines Central, Singapore" },
  { name: "Kopitiam Pte Ltd",      contact_person: "Diana",  contact_email: "diana@test.com",  contact_phone: "+65 8222 2222", address: "2 Jalan Besar, Singapore" },
  { name: "GrabFood Asia",         contact_person: "Frank",  contact_email: "frank@test.com",  contact_phone: "+65 8333 3333", address: "3 Marina Boulevard, Singapore" },
];

const TEST_COUPONS = [
  { title: "$5 FairPrice Voucher",       description: "Redeem for a $5 FairPrice grocery voucher.",                  points_required: 100, quantity: 50,  value_cents: 500,  merchant_name: "FairPrice Singapore",  expiry_date: "2026-12-31 23:59:59+08" },
  { title: "Kopitiam Coffee & Toast Set",description: "A set of coffee and toast at any Kopitiam outlet.",            points_required: 50,  quantity: 100, value_cents: 400,  merchant_name: "Kopitiam Pte Ltd",     expiry_date: "2026-10-31 23:59:59+08" },
  { title: "$10 GrabFood Promo Code",    description: "$10 off your next GrabFood order (min. $20 spend).",          points_required: 200, quantity: 25,  value_cents: 1000, merchant_name: "GrabFood Asia",        expiry_date: "2026-09-30 23:59:59+08" },
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

    // 5. Seed Merchants (link to merchant users)
    console.log("\n  ▶ Seeding merchants...");
    for (const m of TEST_MERCHANTS) {
      const { rows: userRows } = await client.query(
        `SELECT id FROM users WHERE email = $1`, [m.contact_email]
      );
      if (userRows.length > 0) {
        const userId = userRows[0].id;
        await client.query(
          `INSERT INTO merchants (name, contact_person, contact_email, contact_phone, address, created_by)
           VALUES ($1, $2, $3, $4, $5, $6)
           ON CONFLICT DO NOTHING`,
          [m.name, m.contact_person, m.contact_email, m.contact_phone, m.address, userId]
        );
      }
    }
    console.log("  ✓ Merchants seeded");

    // 6. Seed Coupons
    console.log("\n  ▶ Seeding coupons...");
    const { rows: carolRows } = await client.query(
      `SELECT id FROM users WHERE email = 'carol@test.com'`
    );
    const adminId = carolRows[0]?.id;

    if (adminId) {
      for (const cp of TEST_COUPONS) {
        await client.query(
          `INSERT INTO coupons (title, description, points_required, quantity, value_cents, merchant_name, expiry_date, status, created_by)
           VALUES ($1, $2, $3, $4, $5, $6, $7, 'active', $8)
           ON CONFLICT DO NOTHING`,
          [cp.title, cp.description, cp.points_required, cp.quantity, cp.value_cents, cp.merchant_name, cp.expiry_date, adminId]
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
