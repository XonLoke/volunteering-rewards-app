/**
 * Initialize 6 coupons (4 active, 2 depleted)
 * Run: node scripts/init_coupons.js
 */
require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") });
const { Client } = require("pg");

const client = new Client({
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME || "volunteering_rewards",
  user: process.env.DB_USER || "postgres",
  password: String(process.env.DB_PASSWORD || "9663"),
});

const COUPONS = [
  { title: "$5 Coffee Voucher", points: 50, qty: 10, status: "active", value: 500, merchant: "FairPrice" },
  { title: "Kopitiam Breakfast Set", points: 30, qty: 10, status: "active", value: 400, merchant: "Kopitiam" },
  { title: "$10 GrabFood Promo", points: 200, qty: 8, status: "active", value: 1000, merchant: "Grab" },
  { title: "GV Movie Ticket", points: 150, qty: 5, status: "active", value: 1200, merchant: "Golden Village" },
  { title: "$8 NTUC Voucher", points: 160, qty: 0, status: "depleted", value: 800, merchant: "NTUC" },
  { title: "Toast Box Kopi C", points: 30, qty: 0, status: "depleted", value: 300, merchant: "Toast Box" },
];

async function init() {
  await client.connect();
  console.log("Connected. Cleaning up coupons...");

  // Delete all existing coupon data
  await client.query("DELETE FROM user_coupons");
  await client.query("DELETE FROM redemption_logs");
  await client.query("DELETE FROM coupons");
  console.log("Old coupons deleted.");

  // Insert 6 new coupons
  for (const c of COUPONS) {
    await client.query(
      `INSERT INTO coupons (title, description, points_required, quantity, value_cents, merchant_name, expiry_date, status, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, '2026-12-31', $7, 3)`,
      [c.title, 'Redeem at ' + c.merchant, c.points, c.qty, c.value, c.merchant, c.status]
    );
    console.log(`  ${c.status === 'active' ? '✅' : '⛔'} ${c.title} (${c.status})`);
  }

  console.log("\nDone! 6 coupons created (4 active, 2 depleted).");
  await client.end();
}

init().catch(e => { console.error("Error:", e.message); process.exit(1); });
