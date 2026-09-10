// reset_demo_data.js — restore the public demo dataset to its baseline
//
// WHY: the repo is public and the test accounts are deliberately shared
// (`password123`) so visitors can drive all four roles against the live system.
// The API runs the same reset on a timer (see demoReset.service.js), so the
// demo repairs itself; this script is the manual equivalent — for a dry run
// before deploying, for an immediate kick after someone trashes the data, and
// for inspecting exactly what the timer is about to do.
//
// SAFE BY DEFAULT: prints the plan and changes nothing. Pass --apply to commit.
// The dry run executes the identical statements inside the identical
// transaction and then rolls back, so what it reports is what --apply does —
// not a separate "preview" path that could disagree with the real one.
//
// Usage (from anywhere — paths resolve against this file, not the cwd):
//   node backend/scripts/reset_demo_data.js                  # dry run — plan only
//   node backend/scripts/reset_demo_data.js --apply          # commit the reset
//   node backend/scripts/reset_demo_data.js --apply --force  # commit even if PUBLIC_DEMO_MODE is unset
//
// Env:
//   DATABASE_URL (or the DB_HOST/DB_PORT/DB_NAME/DB_USER/DB_PASSWORD set)
//     required — the script refuses to guess a database.
//   PUBLIC_DEMO_MODE=true       required unless --force (see the guard below).
//   DEMO_RESET_INTERVAL_MINUTES unused here; it only drives the in-process timer.

require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") });

const { runDemoReset, DEMO_PASSWORD, DEMO_PINS } = require("../src/services/demoReset.service");

const apply = process.argv.includes("--apply");
const force = process.argv.includes("--force");

// Fail fast on a missing database rather than silently falling back to
// database.js's localhost defaults, which would either fail confusingly or —
// worse — point at the wrong local database and wipe it.
if (!process.env.DATABASE_URL && !process.env.DB_HOST) {
  console.error("FATAL: no database configured — set DATABASE_URL, or DB_HOST/DB_NAME/DB_USER/DB_PASSWORD.");
  console.error(`       Expected them in ${require("path").resolve(__dirname, "../.env")}.`);
  process.exit(1);
}

// A second guard, mirroring the service's own check. Skipping the reset on an
// un-flagged system is the safe direction to fail, but it is also confusing if
// you *meant* to run it — so say exactly how to override.
if (!force && process.env.PUBLIC_DEMO_MODE !== "true") {
  console.error('FATAL: PUBLIC_DEMO_MODE is not "true" — refusing to reset.');
  console.error("       This restores shared demo data; on a normal deployment that is destructive.");
  console.error("       Pass --force if you really mean it.");
  process.exit(1);
}

(async () => {
  const target = process.env.DATABASE_URL
    ? `DATABASE_URL (…${String(process.env.DATABASE_URL).slice(-24)})`
    : `${process.env.DB_HOST}/${process.env.DB_NAME || "volunteering_rewards"}`;

  console.log(`[demo_reset] ${apply ? "APPLY MODE" : "DRY RUN"} — database: ${target}`);
  if (!apply) {
    console.log("[demo_reset] Dry run — every statement runs inside a transaction that is rolled back.");
    console.log("[demo_reset] Nothing is changed. Pass --apply to commit.\n");
  } else {
    console.log("");
  }

  const { steps, summary } = await runDemoReset({
    apply,
    force,
    log: (line) => console.log(line),
  });

  console.log("\n" + "─".repeat(60));
  const changed = steps.filter((s) => typeof s.rows === "number" && s.rows > 0);
  const total = changed.reduce((n, s) => n + s.rows, 0);
  console.log(`Statements executed: ${steps.length} (${changed.length} affecting at least one row)`);
  console.log(`Rows touched: ${total}`);

  if (summary) {
    console.log("\nResulting state:");
    console.log(`  canonical demo accounts : ${summary.demo_users} / 8`);
    console.log(`  total users             : ${summary.total_users}`);
    console.log(`  events                  : ${summary.events}`);
    console.log(`  coupons                 : ${summary.coupons}`);
    console.log(`  merchants               : ${summary.merchants}`);
    console.log(`  pre-issued coupon PINs  : ${summary.user_coupons}`);
    console.log(`  rewards_configuration   : ${summary.rewards_config_rows} row(s) — untouched`);
    console.log(`  email_config            : ${summary.email_config_rows} row(s) — untouched`);
  }

  console.log("\nDemo credentials after this reset:");
  console.log(`  all 8 @test.com accounts : ${DEMO_PASSWORD}`);
  console.log(`  alice's coupon PINs      : ${DEMO_PINS.map((p) => p.pin).join(", ")}`);
  console.log("─".repeat(60));

  if (apply) {
    console.log("Reset committed.");
  } else {
    console.log("Dry run only — rolled back. Run with --apply to commit.");
  }

  // The pool holds the process open; database.js keeps it alive on purpose for
  // the server, but a one-shot script has to close it or it hangs after the
  // last line of output.
  const { pool } = require("../src/config/database");
  await pool.end();
})().catch(async (err) => {
  console.error(`\nFATAL: ${err.message}`);
  if (err.detail) console.error(`       ${err.detail}`);
  try {
    const { pool } = require("../src/config/database");
    await pool.end();
  } catch { /* pool may never have been created */ }
  process.exit(1);
});
