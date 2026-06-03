/**
 * Seed 7 sample redemption records for testing the Redemption History page.
 * Run: node scripts/seed_redemptions.js
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

async function seed() {
  await client.connect();

  // Find coupons and users to use for sample data
  const { rows: coupons } = await client.query("SELECT id, title, points_required, value_cents FROM coupons WHERE status = 'active' ORDER BY id LIMIT 4");
  const { rows: volunteers } = await client.query(
    "SELECT u.id, u.name FROM users u JOIN roles r ON u.role_id = r.id WHERE r.role_name = 'volunteer' LIMIT 3"
  );

  if (coupons.length < 2 || volunteers.length < 2) {
    console.log("Need at least 2 coupons and 2 volunteers for sample data.");
    console.log(`Found ${coupons.length} coupons, ${volunteers.length} volunteers.`);
    await client.end();
    return;
  }

  // Create 7 redemption records with different dates
  const now = new Date();
  const records = [
    { user: volunteers[0], coupon: coupons[0], daysAgo: 0 },
    { user: volunteers[1], coupon: coupons[1], daysAgo: 1 },
    { user: volunteers[2] || volunteers[0], coupon: coupons[2] || coupons[0], daysAgo: 3 },
    { user: volunteers[0], coupon: coupons[1], daysAgo: 7 },
    { user: volunteers[1], coupon: coupons[3] || coupons[0], daysAgo: 14 },
    { user: volunteers[2] || volunteers[1], coupon: coupons[0], daysAgo: 30 },
    { user: volunteers[0], coupon: coupons[2] || coupons[1], daysAgo: 60 },
  ];

  // Find or create user_coupon entries for these
  let inserted = 0;
  for (const rec of records) {
    const date = new Date(now.getTime() - rec.daysAgo * 24 * 60 * 60 * 1000);

    // Check if user has a user_coupon for this coupon
    const { rows: existing } = await client.query(
      "SELECT id FROM user_coupons WHERE user_id = $1 AND coupon_id = $2 AND status = 'used' LIMIT 1",
      [rec.user.id, rec.coupon.id]
    );

    let userCouponId;
    if (existing.length > 0) {
      userCouponId = existing[0].id;
    } else {
      // Create a used user_coupon record
      const pin = String(Math.floor(100000 + Math.random() * 900000));
      const { rows: uc } = await client.query(
        `INSERT INTO user_coupons (user_id, coupon_id, pin_code, status, redeemed_at, expiry_date)
         VALUES ($1, $2, $3, 'used', $4, '2026-12-31') RETURNING id`,
        [rec.user.id, rec.coupon.id, pin, date]
      );
      userCouponId = uc[0].id;
    }

    // Insert the redemption log with value_cents snapshot
    await client.query(
      `INSERT INTO redemption_logs (user_id, coupon_id, user_coupon_id, points_spent, value_cents, action, created_at, notes)
       VALUES ($1, $2, $3, $4, $5, 'redeem', $6, $7)`,
      [
        rec.user.id,
        rec.coupon.id,
        userCouponId,
        rec.coupon.points_required,
        rec.coupon.value_cents || 0,
        date,
        `Sample redemption #${inserted + 1} — ${rec.coupon.title}`,
      ]
    );

    console.log(`  ${++inserted}. ${rec.user.name} → ${rec.coupon.title} (${rec.coupon.points_required}pts) — ${date.toLocaleDateString()}`);
  }

  console.log(`\nDone! ${inserted} sample redemption records created.`);
  await client.end();
}

seed().catch(e => { console.error("Error:", e.message); process.exit(1); });
