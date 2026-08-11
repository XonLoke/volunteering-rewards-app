// rotate_pin_secret.js — re-hash user_coupons pin_hash with the CURRENT PIN_SECRET
//
// WHY: PINs are stored as plaintext pin_code + HMAC-SHA256 pin_hash (see
// rewards.service.js hashPin). Rotating PIN_SECRET invalidates every stored
// hash; this script re-hashes from the plaintext codes, so coupon PINs keep
// working under the new secret.
//
// Usage:
//   PIN_SECRET=<new secret> DATABASE_URL=<...> node scripts/rotate_pin_secret.js          # dry run
//   PIN_SECRET=<new secret> DATABASE_URL=<...> node scripts/rotate_pin_secret.js --apply   # write
//
// Run against production (Neon) AFTER PIN_SECRET is updated in the Render
// dashboard + render.yaml, and BEFORE anyone attempts a redemption.
// Precedent: June 2026 rotation (67 PINs).

const crypto = require("crypto");
const { pool } = require("../src/config/database");

function hashPin(pin) {
  // Mirror rewards.service.js exactly — must produce identical hashes.
  if (!process.env.PIN_SECRET && process.env.NODE_ENV === "production") {
    throw new Error("FATAL: PIN_SECRET is not set — refusing to hash PINs with a fallback secret");
  }
  const secret = process.env.PIN_SECRET || "dev-pin-secret-not-for-production";
  return crypto.createHmac("sha256", secret).update(String(pin)).digest("hex");
}

const apply = process.argv.includes("--apply");

(async () => {
  if (!process.env.PIN_SECRET) {
    throw new Error("PIN_SECRET env var is required (set it to the NEW secret).");
  }

  const { rows } = await pool.query(
    "SELECT id, pin_code, pin_hash FROM user_coupons WHERE pin_code IS NOT NULL ORDER BY id"
  );
  console.log(`Found ${rows.length} coupon PIN(s) to re-hash — ${apply ? "APPLY MODE" : "DRY RUN"}.\n`);

  let changed = 0;
  for (const row of rows) {
    const newHash = hashPin(row.pin_code);
    if (newHash === row.pin_hash) continue; // already hashed with this secret
    changed++;
    console.log(`  #${row.id} pin=${row.pin_code} -> hash updated`);
    if (apply) {
      await pool.query("UPDATE user_coupons SET pin_hash = $1 WHERE id = $2", [newHash, row.id]);
    }
  }

  if (changed === 0) {
    console.log("No PIN hashes change with this secret — either already rotated or PIN_SECRET is unchanged.");
  } else if (apply) {
    console.log(`\nRe-hashed ${changed} PIN(s). Verify one full redemption end-to-end before announcing.`);
  } else {
    console.log(`\n${changed} PIN(s) WOULD change — rerun with --apply to write.`);
  }

  await pool.end();
  process.exit(0);
})().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
