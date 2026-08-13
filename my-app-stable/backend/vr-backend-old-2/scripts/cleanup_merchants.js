/**
 * Cleanup script to sync Merchant records with User accounts.
 * Run: node scripts/cleanup_merchants.js
 *
 * What it does:
 * 1. For each merchant in merchants table, finds matching user by email
 * 2. For each matched user, sets their role_id to merchant and syncs name/phone
 * 3. Reports unmatched records
 */

const { pool } = require("../src/config/database");

async function cleanup() {
  console.log("=== Merchant-User Sync Cleanup ===\n");

  // Get all merchants
  const { rows: merchants } = await pool.query("SELECT id, name, contact_person, contact_email, contact_phone FROM merchants ORDER BY id");
  console.log(`Found ${merchants.length} merchant(s):\n`);

  let synced = 0;
  let orphaned = 0;

  for (const m of merchants) {
    if (!m.contact_email) {
      console.log(`  ⚠️  Merchant #${m.id} "${m.name}" has no email — skipping`);
      continue;
    }

    // Find matching user
    const { rows: users } = await pool.query(
      "SELECT id, name, email, role_id FROM users WHERE email = $1",
      [m.contact_email]
    );

    if (users.length === 0) {
      console.log(`  ⚠️  Merchant #${m.id} "${m.name}" (${m.contact_email}) — NO matching user found`);
      orphaned++;
      continue;
    }

    const user = users[0];

    // Get merchant role id
    const { rows: roleRows } = await pool.query("SELECT id FROM roles WHERE role_name = 'merchant'");
    if (roleRows.length === 0) {
      console.log("  ❌ Merchant role not found in database!");
      break;
    }
    const merchantRoleId = roleRows[0].id;

    // Update user — set role to merchant, sync name and phone
    await pool.query(
      "UPDATE users SET role_id = $1, name = $2, phone = $3, status = 'active' WHERE id = $4",
      [merchantRoleId, m.contact_person || m.name, m.contact_phone || null, user.id]
    );

    console.log(`  ✅ User #${user.id} "${user.name}" → updated to merchant "${m.name}" (${m.contact_email})`);
    synced++;
  }

  console.log(`\nSummary: ${synced} user(s) synced, ${orphaned} merchant(s) without matching user`);
  console.log("Done.");
  await pool.end();
}

cleanup().catch(e => { console.error("Error:", e.message); process.exit(1); });
