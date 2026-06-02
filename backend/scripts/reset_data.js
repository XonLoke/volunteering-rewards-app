/**
 * Data Reset Script — Items 5-10
 * Run with: node scripts/reset_data.js
 * This will:
 *   - Clean up organisers/merchants user accounts
 *   - Re-seed events (7), coupons (6), redemptions (7), QR codes (7)
 *   - Organiser names made clickable in Events page
 */

const { pool } = require("../src/config/database");
const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require("uuid");

async function resetData() {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    console.log("=== Data Reset Script ===\n");

    // 1. Keep only: carol@test.com (admin), alice@test.com (volunteer)
    //    Delete Diana, Diana2, and any test organisers
    console.log("1. Cleaning up users...");
    await client.query("DELETE FROM users WHERE email IN ('diana@test.com', 'diana2@test.com', 'john@shop.com')");
    console.log("   Removed duplicate test users\n");

    // 2. Create 3 organisers
    console.log("2. Creating organisers...");
    const orgRoleId = (await client.query("SELECT id FROM roles WHERE role_name = 'organizer'")).rows[0].id;
    const hash = await bcrypt.hash("password123", 12);

    const organisers = [
      { name: "Sarah Green", email: "sarah@greensoc.org", org: "Green Earth Society", type: "charity" },
      { name: "Marcus Lim", email: "marcus@bright.org", org: "Bright Hill Home", type: "statutory_board" },
      { name: "Priya Sharma", email: "priya@community.sg", org: "Jalan Besar CC", type: "community_group" },
    ];

    const orgUserIds = [];
    for (const org of organisers) {
      const qr = uuidv4();
      const { rows: userRows } = await client.query(
        `INSERT INTO users (email, password_hash, name, role_id, points, volunteer_qr_code, status)
         VALUES ($1, $2, $3, $4, 0, $5, 'active') RETURNING id`,
        [org.email, hash, org.name, orgRoleId, qr]
      );
      const userId = userRows[0].id;
      orgUserIds.push(userId);

      // Create organisation
      const { rows: orgRows } = await client.query(
        `INSERT INTO organizations (org_name, org_type, contact_person, contact_email, approval_status, approved_by, approved_at, status)
         VALUES ($1, $2, $3, $4, 'approved', 3, NOW(), 'active') RETURNING id`,
        [org.org, org.type, org.name, org.email, 3]
      );
      console.log(`   Created: ${org.name} (${org.email}) - org ID ${orgRows[0].id}, user ID ${userId}`);
    }

    // 3. Delete old events, create 7 new ones
    console.log("\n3. Re-seeding events...");
    await client.query("DELETE FROM event_registrations");
    await client.query("DELETE FROM attendance_logs");
    await client.query("DELETE FROM event_feedback");
    await client.query("DELETE FROM event_qna");
    await client.query("DELETE FROM favorites WHERE item_type = 'event'");
    await client.query("DELETE FROM events");

    const events = [
      { title: "Beach Cleanup @ East Coast", desc: "Help clean up East Coast Park. Gloves and bags provided.", loc: "East Coast Park", date: "2026-06-15 08:00:00+08", cap: 50, pts: 20, cat: "Environment", orgIdx: 0 },
      { title: "Elderly Morning Walk", desc: "Accompany seniors from Bright Hill Home for a morning walk.", loc: "Bright Hill Home", date: "2026-06-20 09:00:00+08", cap: 30, pts: 15, cat: "Elderly", orgIdx: 1 },
      { title: "Food Distribution @ Jalan Besar", desc: "Pack and distribute meals to low-income families.", loc: "Jalan Besar CC", date: "2026-06-25 10:00:00+08", cap: 40, pts: 25, cat: "Community", orgIdx: 2 },
      { title: "Mangrove Planting @ Pasir Ris", desc: "Plant mangrove saplings to restore coastal ecosystem.", loc: "Pasir Ris Park", date: "2026-07-05 08:00:00+08", cap: 35, pts: 30, cat: "Environment", orgIdx: 0 },
      { title: "Tuition @ Children's Home", desc: "Provide homework guidance to underprivileged children.", loc: "Children's Home, Sengkang", date: "2026-07-12 14:00:00+08", cap: 20, pts: 20, cat: "Education", orgIdx: 0 },
      { title: "Blood Donation Drive", desc: "Assist with registration and refreshments at blood drive.", loc: "Red Cross HQ, Penang Road", date: "2026-07-18 09:00:00+08", cap: 25, pts: 15, cat: "Health", orgIdx: 1 },
      { title: "Community Garden Harvest", desc: "Harvest vegetables and distribute to needy families.", loc: "Tampines Hub", date: "2026-07-26 08:00:00+08", cap: 30, pts: 20, cat: "Community", orgIdx: 2 },
    ];

    const eventIds = [];
    for (const evt of events) {
      const { rows } = await client.query(
        `INSERT INTO events (organization_id, organizer_id, title, description, location, event_date, capacity, points_value, category, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'upcoming') RETURNING id`,
        [orgUserIds[evt.orgIdx] || 0, orgUserIds[evt.orgIdx], evt.title, evt.desc, evt.loc, evt.date, evt.cap, evt.pts, evt.cat]
      );
      eventIds.push(rows[0].id);
      console.log(`   Event: ${evt.title}`);
    }

    // 4. Register Alice for some events
    console.log("\n4. Creating event registrations...");
    const aliceId = (await client.query("SELECT id FROM users WHERE email = 'alice@test.com'")).rows[0]?.id;
    if (aliceId) {
      for (let i = 0; i < 3; i++) {
        await client.query(
          `INSERT INTO event_registrations (user_id, event_id, status) VALUES ($1, $2, 'registered') ON CONFLICT DO NOTHING`,
          [aliceId, eventIds[i]]
        );
      }
      console.log("   Alice registered for 3 events");
    }

    // 5. Delete old coupons, create 6 new ones
    console.log("\n5. Re-seeding coupons...");
    await client.query("DELETE FROM user_coupons");
    await client.query("DELETE FROM redemption_logs");
    await client.query("DELETE FROM coupons");

    const adminId = (await client.query("SELECT id FROM users WHERE email = 'carol@test.com'")).rows[0]?.id || 3;
    const coupons = [
      { title: "$5 FairPrice Voucher", desc: "Redeem at any FairPrice outlet", pts: 100, qty: 10, val: 500, merchant: "FairPrice", status: "active" },
      { title: "Kopitiam Coffee & Toast", desc: "Coffee and toast set at Kopitiam", pts: 50, qty: 0, val: 300, merchant: "Kopitiam", status: "depleted" },
      { title: "$10 GrabFood Promo", desc: "$10 off GrabFood order", pts: 200, qty: 8, val: 1000, merchant: "Grab", status: "active" },
      { title: "Movie Ticket Voucher", desc: "One free movie ticket at GV", pts: 150, qty: 5, val: 1200, merchant: "Golden Village", status: "active" },
      { title: "$3 Kopi C Voucher", desc: "Free kopi at any Toast Box", pts: 30, qty: 20, val: 300, merchant: "Toast Box", status: "active" },
      { title: "NTUC Voucher $8", desc: "$8 off at NTUC FairPrice", pts: 160, qty: 0, val: 800, merchant: "NTUC", status: "depleted" },
    ];

    const couponIds = [];
    for (const cp of coupons) {
      const { rows } = await client.query(
        `INSERT INTO coupons (title, description, points_required, quantity, value_cents, merchant_name, expiry_date, status, created_by)
         VALUES ($1, $2, $3, $4, $5, $6, '2026-12-31 23:59:59+08', $7, $8) RETURNING id`,
        [cp.title, cp.desc, cp.pts, cp.qty, cp.val, cp.merchant, cp.status, adminId]
      );
      couponIds.push(rows[0].id);
      console.log(`   ${cp.title} (${cp.status})`);
    }

    // 6. Create 7 redemption records
    console.log("\n6. Creating redemption records...");
    for (let i = 0; i < 7; i++) {
      const cid = couponIds[i % 4];
      const pin = Math.floor(100000 + Math.random() * 900000).toString();
      // Create user_coupon
      const { rows: ucRows } = await client.query(
        `INSERT INTO user_coupons (user_id, coupon_id, pin_code, status) VALUES ($1, $2, $3, 'used') RETURNING id`,
        [aliceId, cid, pin]
      );
      // Create redemption log
      const coupon = coupons[i % 4];
      await client.query(
        `INSERT INTO redemption_logs (user_id, coupon_id, user_coupon_id, points_spent, action, action_by, created_at)
         VALUES ($1, $2, $3, $4, 'redeem', $5, NOW() - INTERVAL '${i} days')`,
        [aliceId, cid, ucRows[0].id, coupon.pts, adminId]
      );
      console.log(`   Redemption #${i+1}: ${coupon.title} - ${coupon.pts}pts`);
    }

    await client.query("COMMIT");
    console.log("\n=== Data reset complete! ===");
    console.log("Login: carol@test.com / password123");
    console.log("Organisers: sarah@greensoc.org, marcus@bright.org, priya@community.sg (all password: password123)");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Reset failed:", err.message);
  } finally {
    client.release();
    await pool.end();
  }
}

resetData();
