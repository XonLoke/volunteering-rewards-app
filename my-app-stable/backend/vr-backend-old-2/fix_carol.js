const { pool } = require("./src/config/database");
const bcrypt = require("bcrypt");

async function main() {
  const hash = await bcrypt.hash("password123", 12);
  const result = await pool.query(
    "UPDATE users SET password_hash = $1, role_id = (SELECT id FROM roles WHERE role_name = 'admin'), status = 'active' WHERE email = 'carol@test.com' RETURNING id, name, email",
    [hash]
  );
  if (result.rows.length > 0) {
    console.log("✅ Carol reset! Login: carol@test.com / password123");
  } else {
    console.log("❌ Carol not found");
  }
  await pool.end();
}

main().catch(e => console.error("Error:", e.message));
