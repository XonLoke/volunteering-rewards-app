/**
 * One-time script to create Diana Merchant user
 */
const { pool } = require("./src/config/database");
const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require("uuid");

async function main() {
  // Create merchant role if not exists
  await pool.query(
    `INSERT INTO roles (role_name, description) VALUES ('merchant', 'Merchant Cashier') ON CONFLICT (role_name) DO NOTHING`
  );

  // Get merchant role id
  const { rows: roleRows } = await pool.query(
    `SELECT id FROM roles WHERE role_name = 'merchant'`
  );
  const roleId = roleRows[0].id;

  // Check if Diana already exists
  const { rows: existing } = await pool.query(
    `SELECT id FROM users WHERE email = 'diana@test.com'`
  );

  if (existing.length > 0) {
    console.log("Diana already exists with ID:", existing[0].id);
  } else {
    // Create Diana
    const passwordHash = await bcrypt.hash("password123", 12);
    const qrCode = uuidv4();
    await pool.query(
      `INSERT INTO users (email, password_hash, name, role_id, points, volunteer_qr_code, status)
       VALUES ($1, $2, $3, $4, 0, $5, 'active')`,
      ["diana@test.com", passwordHash, "Diana Merchant", roleId, qrCode]
    );
    console.log("✅ Diana Merchant created! Login: diana@test.com / password123");
  }

  await pool.end();
}

main().catch(err => {
  console.error("Error:", err.message);
  process.exit(1);
});
