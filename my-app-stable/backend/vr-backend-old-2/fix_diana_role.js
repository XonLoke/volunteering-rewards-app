const { pool } = require("./src/config/database");

async function main() {
  // Get merchant role ID
  const { rows: roleRows } = await pool.query("SELECT id FROM roles WHERE role_name = 'merchant'");
  if (roleRows.length === 0) {
    await pool.query("INSERT INTO roles (role_name, description) VALUES ('merchant', 'Merchant Cashier')");
    console.log("Created merchant role");
  }
  const merchantRoleId = (await pool.query("SELECT id FROM roles WHERE role_name = 'merchant'")).rows[0].id;

  // Update diana2 to merchant role and reset password
  const result = await pool.query(
    "UPDATE users SET role_id = $1, status = 'active' WHERE email = $2 RETURNING id, email, name",
    [merchantRoleId, 'diana2@test.com']
  );

  if (result.rows.length > 0) {
    console.log("✅ Diana 2 updated to merchant role:", result.rows[0].email);
  } else {
    console.log("Diana 2 not found, trying diana...");
    const result2 = await pool.query(
      "UPDATE users SET role_id = $1, status = 'active' WHERE email = $2 RETURNING id, email, name",
      [merchantRoleId, 'diana@test.com']
    );
    if (result2.rows.length > 0) {
      console.log("✅ Diana updated to merchant role:", result2.rows[0].email);
    } else {
      console.log("Neither Diana found - run seed first");
    }
  }

  await pool.end();
}

main().catch(e => { console.error(e.message); process.exit(1); });
