/**
 * Generate PINs for existing coupons that don't have any
 * Run: node scripts/generate_missing_pins.js
 */
require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") });
const { Client } = require("pg");
const crypto = require("crypto");

const client = new Client({
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME || "volunteering_rewards",
  user: process.env.DB_USER || "postgres",
  password: String(process.env.DB_PASSWORD || "9663"),
});

function hashPin(pin) {
  const secret = process.env.PIN_SECRET || process.env.JWT_ACCESS_SECRET || "dev-pin-secret";
  return crypto.createHmac("sha256", secret).update(String(pin)).digest("hex");
}

function generatePins(count) {
  const pins = [];
  const used = new Set();
  while (pins.length < count) {
    const pin = String(Math.floor(100000 + Math.random() * 900000));
    if (!used.has(pin)) { used.add(pin); pins.push(pin); }
  }
  return pins;
}

async function main() {
  await client.connect();
  console.log("Connected. Checking for coupons missing PINs...\n");

  // Find all coupons that have fewer PINs than their quantity (or zero)
  const { rows: coupons } = await client.query(`
    SELECT c.id, c.title, c.quantity, c.expiry_date,
           (SELECT COUNT(*) FROM user_coupons uc WHERE uc.coupon_id = c.id) AS existing_pins
    FROM coupons c
    ORDER BY c.id
  `);

  let totalGenerated = 0;
  for (const c of coupons) {
    const needed = c.quantity - parseInt(c.existing_pins);
    if (needed <= 0) {
      console.log(`  ✓ ${c.title}: ${c.existing_pins} PINs (ok)`);
      continue;
    }

    const pins = generatePins(needed);
    for (const pin of pins) {
      await client.query(
        `INSERT INTO user_coupons (coupon_id, pin_code, pin_hash, status, expiry_date)
         VALUES ($1, $2, $3, 'unused', $4)`,
        [c.id, pin, hashPin(pin), c.expiry_date || '2026-12-31']
      );
    }
    totalGenerated += pins.length;
    console.log(`  → ${c.title}: generated ${pins.length} PINs (had ${c.existing_pins}, needs ${c.quantity})`);
  }

  console.log(`\nDone! Generated ${totalGenerated} PINs total.`);
  await client.end();
}

main().catch(e => { console.error("Error:", e.message); process.exit(1); });
