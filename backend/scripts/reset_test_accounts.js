// reset_test_accounts.js — rotate ALL test-account passwords (post-exam cleanup)
//
// WHY: Every portal/test doc in the repo documents the shared test password
// `password123` for carol/bob/cheryl/diana/frank/alice/eve @test.com. Once the
// exam demo window closes (end of Aug 2026), those accounts should get unique
// strong passwords so the documented password no longer works anywhere.
//
// HOW: Logs in as the admin (still on the OLD password), lists all users,
// resets every @test.com account via the admin reset-password endpoint with a
// freshly generated strong password, then VERIFIES each by logging in.
//
// Contract (verified against live code, 11 Aug 2026):
//   POST /api/auth/login                {email, password}        -> { token, refresh_token, ... }
//   GET  /api/admin/users               (Bearer admin token)     -> user list (accepts array, {data}, {users})
//   PUT  /api/admin/users/:id/reset-password  {newPassword}      -> { message, user }   (min 8 chars)
//   (admin.routes.js:42 / admin.service.js:844 resetUserPassword)
//
// Usage:
//   ADMIN_PASSWORD=<current admin pw> node scripts/reset_test_accounts.js             # dry run (plan only)
//   ADMIN_PASSWORD=<current admin pw> node scripts/reset_test_accounts.js --apply      # reset + verify
//   ADMIN_PASSWORD=<current admin pw> node scripts/reset_test_accounts.js --apply > new-passwords.txt  # save mapping
//
// Env:
//   API_URL        default https://vol-rewards-api.onrender.com/api
//   ADMIN_EMAIL    default carol@test.com
//   ADMIN_PASSWORD required — refused to run without it (fail-fast, like rotate_pin_secret.js)
//
// Follow-up (manual): after the demo window, consider updating the default in
// backend/src/utils/seed.js so fresh dev seeds no longer use password123.
// The admin's own password is reset too (it is an @test.com account); the JWT
// from the initial login stays valid through the run, so verification works.

const crypto = require("crypto");

const API_URL = process.env.API_URL || "https://vol-rewards-api.onrender.com/api";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "carol@test.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const apply = process.argv.includes("--apply");

if (!ADMIN_PASSWORD) {
  console.error("FATAL: ADMIN_PASSWORD is not set — refusing to run.");
  console.error('Usage: ADMIN_PASSWORD=<current admin pw> node scripts/reset_test_accounts.js [--apply]');
  process.exit(1);
}

function newPassword() {
  return crypto.randomBytes(12).toString("base64url"); // 16 chars, url-safe
}

async function api(path, options = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
  });
  let body = null;
  try { body = await res.json(); } catch { /* non-JSON body (e.g. cold start) */ }
  if (!res.ok) {
    const detail = body ? (body.error?.message || body.message || JSON.stringify(body)) : `HTTP ${res.status}`;
    throw new Error(`${options.method || "GET"} ${path} -> ${res.status}: ${detail}`);
  }
  return body;
}

async function login(email, password) {
  const body = await api("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) });
  const token = body.token || body.accessToken;
  if (!token) throw new Error(`Login for ${email} returned no token`);
  return token;
}

(async () => {
  console.log(`[reset_test_accounts] ${apply ? "APPLY MODE" : "DRY RUN"} — API: ${API_URL}`);
  if (!apply) console.log("Pass --apply to actually reset passwords. New passwords are printed for you to save.\n");

  const adminToken = await login(ADMIN_EMAIL, ADMIN_PASSWORD);
  console.log(`[OK] Admin login: ${ADMIN_EMAIL}\n`);

  const listBody = await api("/admin/users", { headers: { Authorization: `Bearer ${adminToken}` } });
  const users = Array.isArray(listBody) ? listBody : listBody.data || listBody.users || [];
  const disabled = users.filter((u) => u.email && u.email.endsWith("@test.com") && u.status !== "active");
  const targets = users.filter((u) => u.email && u.email.endsWith("@test.com") && u.status === "active");

  if (targets.length === 0) throw new Error("No active @test.com accounts found via /admin/users");
  if (disabled.length) {
    console.log(`[SKIP] ${disabled.length} disabled test account(s) — cannot log in, reset pointless: ${disabled.map((u) => u.email).join(", ")}\n`);
  }

  console.log(`Found ${targets.length} test accounts:\n`);
  console.log("EMAIL".padEnd(32) + "NEW PASSWORD".padEnd(28) + "STATUS");
  const results = [];
  for (const u of targets) {
    const password = newPassword();
    let status;
    if (apply) {
      try {
        await api(`/admin/users/${u.id}/reset-password`, {
          method: "PUT",
          headers: { Authorization: `Bearer ${adminToken}` },
          body: JSON.stringify({ newPassword: password }),
        });
        await login(u.email, password); // verify the new password actually works
        status = "[OK] reset + verified";
      } catch (err) {
        status = `[FAIL] ${err.message}`;
      }
    } else {
      status = "[dry run]";
    }
    console.log(`${(u.email || `${u.name} (${u.id})`).padEnd(32)}${password.padEnd(28)}${status}`);
    results.push({ email: u.email || `${u.name} (${u.id})`, password, ok: status.startsWith("[OK]") });
  }

  const failed = results.filter((r) => !r.ok);
  if (apply) {
    console.log(`\nDone. ${results.length - failed.length}/${results.length} accounts reset and verified.`);
    if (failed.length) {
      console.log(`FAILED (${failed.length}): ${failed.map((r) => r.email).join(", ")} — rerun to retry.`);
      process.exit(1);
    }
    console.log("\nSAVE THIS OUTPUT — it is the only record of the new passwords (nothing is written to disk).");
  } else {
    console.log("\nDry run only — no changes made. Run with --apply to execute.");
  }
})().catch((err) => {
  console.error(`FATAL: ${err.message}`);
  process.exit(1);
});
