/**
 * Migration Runner (INF-03)
 *
 * Reads all .sql files from the migrations/ directory in numeric order
 * and executes them against the database. Safe to run multiple times —
 * uses IF NOT EXISTS on all CREATE TABLE statements.
 *
 * Usage:
 *   node src/utils/migrationRunner.js
 *   npm run migrate
 */

require("dotenv").config({ path: require("path").resolve(__dirname, "../../.env") });
const fs = require("fs");
const path = require("path");
const { pool } = require("../config/database");

const MIGRATIONS_DIR = path.resolve(__dirname, "../../migrations");

async function runMigrations() {
  console.log("─".repeat(50));
  console.log("Migration Runner Starting");
  console.log("─".repeat(50));

  // Read migration files sorted by name (ensures numeric order)
  const files = fs
    .readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith(".sql"))
    .sort();

  if (files.length === 0) {
    console.log("No migration files found.");
    process.exit(0);
  }

  console.log(`Found ${files.length} migration(s)\n`);

  const client = await pool.connect();

  try {
    for (const file of files) {
      const filePath = path.join(MIGRATIONS_DIR, file);
      const sql = fs.readFileSync(filePath, "utf-8");

      console.log(`  ▶ Running: ${file}`);

      try {
        await client.query(sql);
        console.log(`  ✓ Completed: ${file}\n`);
      } catch (err) {
        console.error(`  ✗ Failed: ${file}`);
        console.error(`    ${err.message}\n`);
        throw err;
      }
    }

    console.log("─".repeat(50));
    console.log("All migrations completed successfully.");
    console.log("─".repeat(50));
  } finally {
    client.release();
    await pool.end();
  }
}

runMigrations().catch((err) => {
  console.error("Migration runner failed:", err.message);
  process.exit(1);
});
