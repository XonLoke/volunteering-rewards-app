//-----------------------------------------------------------------------
// SECTION: Public Demo Reset Service
// Purpose: Restore the shared demo dataset to a known-good baseline.
//
// WHY THIS EXISTS: the repo is public and the test accounts are deliberately
// shared (`password123`), so visitors can drive all four roles against the live
// system. That means a visitor can rename an admin, empty a coupon, delete the
// events, or register hundreds of accounts. None of that is recoverable by the
// "self-healing" that the app already had, because there was no baseline: the
// old `seed.js` is additive only (its `ON CONFLICT DO NOTHING` cannot even fire
// on organizations/events/merchants/coupons — none of those tables has a unique
// constraint), and `reset_data.js` is destructive, unguarded, and mis-ordered.
//
// DESIGN RULES — each one exists because of a specific hazard:
//
//   1. Dry run is the default at the CLI, and the dry run is the SAME code path
//      as a real run: BEGIN → every statement → ROLLBACK instead of COMMIT.
//      A dry run that takes a different path proves nothing about the real one.
//
//   2. Canonical accounts are UPSERTed by email, never delete-and-recreate.
//      Recreating them would change their ids, and 21 columns across 16 tables
//      hold a NO ACTION foreign key to users(id) — anything they ever created
//      would block the delete. Upsert also self-repairs a hijacked row: if a
//      visitor deleted carol@test.com and re-registered that address as a
//      volunteer, the upsert restores the admin role and the shared password.
//
//   3. Interaction tables are wiped TABLE-WIDE, not scoped to demo users.
//      Scoping looks safer but is wrong: a visitor-registered account consumes
//      event capacity (events.service.js counts event_registrations rows), so a
//      scoped wipe leaves the demo events permanently full of strangers.
//
//   4. The three config tables are never touched — not by deletes, and not by
//      the INSERT that `updateRewardsConfig` would otherwise perform. They hold
//      live values (SMTP credentials, programme economics) that must survive a
//      reset. Because an admin *could* reference them via `updated_by`, the
//      audit stamp is repointed at the canonical admin before any user is
//      deleted, so the FK can never block the delete.
//
//   5. Dates are relative (NOW() + INTERVAL), never literals. The old seed
//      hardcoded June 2026, and `ai.service.js` filters `event_date > NOW()`, so
//      the demo silently lost its AI recommendations the moment those dates
//      passed. Relative dates mean this baseline never goes stale.
//
//   6. One transaction. A reset that dies half way through is worse than no
//      reset, because it leaves a state that matches neither the baseline nor
//      what the visitor had.
//-----------------------------------------------------------------------

const bcrypt = require("bcrypt");
const crypto = require("crypto");
const { pool } = require("../config/database");
const { isPublicDemoMode } = require("../config/demoMode");

const SALT_ROUNDS = 12;
const DEMO_PASSWORD = "password123";
const DEFAULT_INTERVAL_MINUTES = 60;

// The live demo stores Singapore wall-clock time in TIMESTAMP (no tz) columns —
// that is what the original seed's '...+08' literals became once Postgres cast
// them. Matching that convention keeps the reset consistent with existing rows.
const TZ = "Asia/Singapore";

//-----------------------------------------------------------------------
// SECTION: The baseline
//-----------------------------------------------------------------------

// The 8 canonical accounts from docs/Testing/Test Accounts v1.1.md.
// `points` is the demo's opening balance — the volunteer app's "math card"
// walks a visitor through how a balance is built up, so it must be a stable,
// explainable number rather than whatever the last visitor left behind.
const DEMO_USERS = [
  { email: "alice@test.com", name: "Alice Volunteer", role: "volunteer", points: 500 },
  { email: "eve@test.com", name: "Eve Volunteer", role: "volunteer", points: 300 },
  { email: "bob@test.com", name: "Bob Organizer", role: "organiser", points: 0 },
  { email: "johnny@test.com", name: "Johnny Organizer", role: "organiser", points: 0 },
  { email: "carol@test.com", name: "Carol Admin", role: "admin", points: 0 },
  { email: "cheryl@test.com", name: "Cheryl Merchant", role: "merchant", points: 0 },
  { email: "diana@test.com", name: "Diana Merchant", role: "merchant", points: 0 },
  { email: "frank@test.com", name: "Frank Merchant", role: "merchant", points: 0 },
];

const DEMO_ROLES = [
  ["volunteer", "Volunteer — browses events, earns points, redeems rewards"],
  ["organiser", "Event Organizer — creates events, scans QR codes, manages attendance"],
  ["admin", "System Admin — manages users, creates coupons, verifies PINs, audits"],
  ["merchant", "Merchant Cashier — verifies PINs, redeems coupons"],
];

const DEMO_ORGANIZATION = {
  org_name: "Green Earth Society",
  org_type: "Non-Profit",
  uen: "S80SS0011A",
  address: "1 Green Crescent, Singapore 123456",
  contact_person: "Bob Organizer",
  contact_email: "bob@test.com",
  contact_phone: "+65 9123 4567",
};

// `days`/`hour` are offsets from midnight tonight — 08:00 Singapore time on the
// day N days from now, so the demo always has upcoming events to browse, and
// the AI recommender always has something to rank.
const DEMO_EVENTS = [
  { title: "Beach Cleanup @ East Coast", description: "Help clean up East Coast Park. Gloves and bags provided.", location: "East Coast Park, Singapore", days: 5, hour: 8, capacity: 50, points_value: 20, category: "Environment" },
  { title: "Elderly Morning Walk", description: "Accompany seniors from Bright Hill Home for a morning walk.", location: "Bright Hill Home, Singapore", days: 12, hour: 9, capacity: 30, points_value: 15, category: "Elderly" },
  { title: "Food Distribution @ Jalan Besar", description: "Pack and distribute meals to low-income families in Jalan Besar.", location: "Jalan Besar Community Centre", days: 19, hour: 10, capacity: 40, points_value: 25, category: "Community" },
];

// `key` links a merchant to its products below.
const DEMO_MERCHANTS = [
  { key: "fairprice", name: "FairPrice Singapore", contact_person: "Cheryl", contact_email: "cheryl@test.com", contact_phone: "+65 8111 1111", address: "1 Tampines Central, Singapore" },
  { key: "kopitiam", name: "Kopitiam Pte Ltd", contact_person: "Diana", contact_email: "diana@test.com", contact_phone: "+65 8222 2222", address: "2 Jalan Besar, Singapore" },
  { key: "grabfood", name: "GrabFood Asia", contact_person: "Frank", contact_email: "frank@test.com", contact_phone: "+65 8333 3333", address: "3 Marina Boulevard, Singapore" },
];

const DEMO_PRODUCTS = [
  { merchant: "fairprice", name: "Grocery Voucher ($5)", description: "Redeemable at any FairPrice outlet.", points_cost: 100 },
  { merchant: "fairprice", name: "Grocery Voucher ($10)", description: "Redeemable at any FairPrice outlet.", points_cost: 200 },
  { merchant: "kopitiam", name: "Coffee & Toast Set", description: "One hot drink with kaya toast.", points_cost: 50 },
  { merchant: "grabfood", name: "GrabFood Promo Code ($10)", description: "Min. spend $20.", points_cost: 200 },
];

// `expiry_days` is relative for the same reason the events are: a hardcoded
// expiry silently drains the rewards page the day it passes.
const DEMO_COUPONS = [
  { title: "$5 FairPrice Voucher", description: "Redeem for a $5 FairPrice grocery voucher.", points_required: 100, quantity: 50, value_cents: 500, merchant_name: "FairPrice Singapore", expiry_days: 180 },
  { title: "Kopitiam Coffee & Toast Set", description: "A set of coffee and toast at any Kopitiam outlet.", points_required: 50, quantity: 100, value_cents: 400, merchant_name: "Kopitiam Pte Ltd", expiry_days: 120 },
  { title: "$10 GrabFood Promo Code", description: "$10 off your next GrabFood order (min. $20 spend).", points_required: 200, quantity: 25, value_cents: 1000, merchant_name: "GrabFood Asia", expiry_days: 90 },
];

// Pre-issued PINs for alice, so the merchant portal can be exercised without
// first completing a redemption as a volunteer. The PINs are deliberately
// fixed and documented — a visitor has no other way to learn a PIN, and the
// merchant flow is one of the four roles this demo exists to show.
// `pin_hash` is HMAC-SHA256(pin, PIN_SECRET) — the same construction as
// rewards.service.js (which mints PINs at redemption) and admin.service.js
// (which mints them in batches), so verification accepts these.
const DEMO_PINS = [
  { pin: "246813", couponIndex: 1 }, // "Kopitiam Coffee & Toast Set"
  { pin: "135791", couponIndex: 1 },
  { pin: "864209", couponIndex: 1 },
];

// Past redemptions, so the merchant portal, the admin audit list and the
// "Most Redeemed" leaderboard have something to show the moment the demo
// resets. Without them the reset empties all three — which reads to a first-time
// visitor as a broken feature rather than a clean slate.
//
// `cashier` is the account that performed the redemption; the coupon's business
// comes from DEMO_COUPONS[couponIndex].merchant_name. The two are deliberately
// NOT always the same business: a cashier can redeem any PIN, and merchant
// history is scoped as the UNION of "coupons my business issued" and
// "redemptions I performed" (see merchant.service.js). Keeping both cases in the
// baseline is what makes that union visible instead of theoretical — e.g. eve's
// Kopitiam coupon redeemed by the FairPrice cashier appears in BOTH merchants'
// histories, for different reasons.
const DEMO_REDEMPTIONS = [
  { volunteer: "alice@test.com", couponIndex: 1, cashier: "diana@test.com", days_ago: 8, hour: 9, notes: "Cashier marked coupon as used" },
  { volunteer: "alice@test.com", couponIndex: 0, cashier: "cheryl@test.com", days_ago: 6, hour: 11, notes: "Cashier marked coupon as used" },
  { volunteer: "alice@test.com", couponIndex: 2, cashier: "frank@test.com", days_ago: 4, hour: 15, notes: "Cashier marked coupon as used" },
  { volunteer: "eve@test.com", couponIndex: 2, cashier: "frank@test.com", days_ago: 5, hour: 14, notes: "Cashier marked coupon as used" },
  { volunteer: "eve@test.com", couponIndex: 1, cashier: "cheryl@test.com", days_ago: 1, hour: 16, notes: "Cashier marked coupon as used" },
];

const DEMO_NOTIFICATIONS = [
  { email: "alice@test.com", title: "Welcome to Volunteering Rewards!", description: "Thank you for joining. Start browsing events to earn points.", icon: "happy-outline", color: "#10b981", is_read: false, hours_ago: 1 },
  { email: "alice@test.com", title: "Points Earned!", description: "You earned 20 points for attending Beach Cleanup @ East Coast.", icon: "star-outline", color: "#f59e0b", is_read: false, hours_ago: 2 },
  { email: "alice@test.com", title: "New Event Added", description: "Elderly Morning Walk has been added to upcoming events. Register now!", icon: "calendar-outline", color: "#6366f1", is_read: true, hours_ago: 24 },
  { email: "eve@test.com", title: "Welcome to Volunteering Rewards!", description: "Thank you for joining. Start browsing events to earn points.", icon: "happy-outline", color: "#10b981", is_read: false, hours_ago: 0.5 },
];

//-----------------------------------------------------------------------
// SECTION: Helpers
//-----------------------------------------------------------------------

// Mirrors the precedence in rewards.service.js, which is the code path that
// mints PINs at redemption time — the two must agree or the seeded PINs would
// hash differently from the ones the app checks against.
// Returns null (rather than throwing) when production has no PIN_SECRET: the
// reset should still restore everything else.
function resolvePinSecret() {
  if (!process.env.PIN_SECRET && process.env.NODE_ENV === "production") return null;
  return process.env.PIN_SECRET || process.env.JWT_SECRET || "dev-pin-secret-not-for-production";
}

function hashPin(pin, secret) {
  return crypto.createHmac("sha256", secret).update(String(pin)).digest("hex");
}

// A timestamp column value: 00:00 Singapore on today+N days, plus H hours.
// Interpolated rather than passed as a parameter because an INTERVAL expression
// cannot be a bind value; `days`/`hour` come from the constants above, never
// from input.
function relativeDate(days, hour = 0) {
  return `(date_trunc('day', NOW() AT TIME ZONE '${TZ}') + INTERVAL '${days} days ${hour} hours')`;
}

/**
 * Update the row matching a natural key, or insert it if absent. Returns its id.
 *
 * Content tables (organizations, events, merchants, merchant_products, coupons)
 * have no UNIQUE constraint on any natural key, so `INSERT ... ON CONFLICT` is
 * not available and the id has to be resolved by a SELECT first. Keeping the id
 * stable matters: the reset runs hourly against a live demo, and reinserting
 * would invalidate every id a visitor's open page is holding.
 */
async function upsertRow(client, run, { label, findSql, findParams, updateSql, updateParams, insertSql, insertParams }) {
  const { rows } = await client.query(findSql, findParams);
  if (rows.length > 0) {
    await run(`${label} — updated`, updateSql, updateParams);
    return rows[0].id;
  }
  const res = await run(`${label} — created`, insertSql, insertParams);
  return res.rows[0].id;
}

//-----------------------------------------------------------------------
// SECTION: The reset
//-----------------------------------------------------------------------

/**
 * Restore the demo dataset to its baseline.
 *
 * Always runs inside one transaction. With `apply: false` the transaction is
 * rolled back, so a dry run exercises the identical statements and reports the
 * same row counts while changing nothing.
 *
 * @param {object}  options
 * @param {boolean} options.apply  commit (true) or roll back (false)
 * @param {boolean} options.force  run even when PUBLIC_DEMO_MODE is not "true"
 * @param {function} options.log   sink for progress lines
 * @returns {Promise<{apply:boolean, skipped:string|null, steps:Array, summary:object|null}>}
 */
async function runDemoReset({ apply = false, force = false, log = () => {} } = {}) {
  if (!force && !isPublicDemoMode()) {
    return { apply, skipped: "PUBLIC_DEMO_MODE is not \"true\"", steps: [], summary: null };
  }

  const steps = [];
  const client = await pool.connect();

  const run = async (label, sql, params) => {
    const res = await client.query(sql, params);
    steps.push({ label, rows: res.rowCount });
    log(`  ${label}${res.rowCount != null ? ` — ${res.rowCount} row(s)` : ""}`);
    return res;
  };

  try {
    await client.query("BEGIN");

    // ── STEP 1: canonical accounts first ────────────────────────────────
    // Everything below needs these ids, and a visitor may have deleted them.
    log("STEP 1 — canonical demo accounts");
    const passwordHash = await bcrypt.hash(DEMO_PASSWORD, SALT_ROUNDS);

    for (const [role_name, description] of DEMO_ROLES) {
      // roles.role_name is UNIQUE, so this is a no-op on a healthy database.
      // Note the British spelling: migration 028 repointed and deleted the
      // legacy 'organizer' row, so inserting that spelling again would recreate
      // a role nothing else uses.
      await run(`role ${role_name}`, `INSERT INTO roles (role_name, description) VALUES ($1, $2) ON CONFLICT (role_name) DO NOTHING`, [role_name, description]);
    }

    for (const u of DEMO_USERS) {
      await run(`user ${u.email}`, `
        INSERT INTO users (email, password_hash, name, role_id, points, volunteer_qr_code, status, email_verified, created_at, updated_at)
        VALUES ($1, $2, $3, (SELECT id FROM roles WHERE role_name = $4), $5, $6, 'active', TRUE, NOW(), NOW())
        ON CONFLICT (email) DO UPDATE SET
          password_hash              = EXCLUDED.password_hash,
          name                       = EXCLUDED.name,
          role_id                    = EXCLUDED.role_id,
          points                     = EXCLUDED.points,
          status                     = 'active',
          email_verified             = TRUE,
          -- Keep an existing QR code: it may be baked into a printed sheet or a
          -- downloaded APK, and rotating it would break scanning for no gain.
          volunteer_qr_code          = COALESCE(users.volunteer_qr_code, EXCLUDED.volunteer_qr_code),
          -- Clear any half-finished verification / reset the visitor triggered.
          email_verification_token   = NULL,
          email_verification_expires = NULL,
          reset_password_token       = NULL,
          reset_password_expires     = NULL,
          updated_at                 = NOW()
      `, [u.email, passwordHash, u.name, u.role, u.points, crypto.randomUUID()]);
    }

    const { rows: userRows } = await run(
      "resolve canonical ids",
      "SELECT id, email FROM users WHERE email = ANY($1::text[])",
      [DEMO_USERS.map((u) => u.email)]
    );
    const userIdByEmail = new Map(userRows.map((r) => [r.email, r.id]));
    for (const u of DEMO_USERS) {
      if (!userIdByEmail.has(u.email)) throw new Error(`Canonical account ${u.email} missing after upsert`);
    }
    const idOf = (email) => userIdByEmail.get(email);
    const canonicalEmails = DEMO_USERS.map((u) => u.email);

    // ── STEP 2: unhook audit stamps from users we are about to delete ───
    // rewards_configuration / sponsorship_configuration / email_config are
    // APPEND-ONLY config the reset must never modify — a single inserted row
    // permanently changes programme economics, because the readers all take
    // ORDER BY id DESC LIMIT 1. But each row carries `updated_by`, a NO ACTION
    // FK to users(id), so a stale stamp pointing at a soon-to-be-deleted test
    // account would block the delete. Repointing the stamp at the canonical
    // admin keeps those tables intact while removing the dependency.
    log("STEP 2 — repoint config audit stamps");
    for (const table of ["rewards_configuration", "sponsorship_configuration", "email_config"]) {
      await run(`stamp ${table}`, `
        UPDATE ${table} SET updated_by = $1
         WHERE updated_by IS NOT NULL
           AND updated_by NOT IN (SELECT id FROM users WHERE email = ANY($2::text[]))
      `, [idOf("carol@test.com"), canonicalEmails]);
    }

    // ── STEP 3: wipe every interaction table ────────────────────────────
    // Table-wide by design (rule 3). Order is FK-critical: only user_settings,
    // points_ledger and notifications cascade, so redemption_logs must go
    // before the user_coupons it references.
    log("STEP 3 — wipe interaction data");
    for (const table of [
      "redemption_logs",       // → user_coupons, coupons, users
      "user_coupons",          // → coupons, users
      "attendance_logs",       // → events, users
      "event_feedback",        // → events, users
      "event_qna",             // → events, users
      "event_registrations",   // → events, users
      "favorites",             // → users
      "referral_logs",         // → users
      "points_ledger",         // → users (cascade, deleted explicitly anyway)
      "notifications",         // → users (cascade)
      "user_settings",         // → users (cascade)
    ]) {
      await run(`clear ${table}`, `DELETE FROM ${table}`);
    }

    // ── STEP 4: restore the canonical content ───────────────────────────
    // Update-or-insert keyed on a natural key, NOT delete-and-reinsert.
    // Two reasons:
    //   a) These tables carry no UNIQUE constraint on any natural key, so
    //      `ON CONFLICT` is not available — but more importantly,
    //   b) reinserting would mint new ids on every tick, and a visitor with the
    //      event list open would start getting 404s the moment the timer fired.
    //      Stable ids make the hourly reset invisible to anyone mid-demo.
    //
    // Every field a visitor can change is written explicitly on UPDATE (see the
    // RESET column lists) — including clearing the denormalized
    // `events.feedback_score` and any `image_url`, which would otherwise
    // survive as stale values pointing at a visitor's upload.
    log("STEP 4 — restore canonical content");

    const orgId = await upsertRow(client, run, {
      label: `organization ${DEMO_ORGANIZATION.org_name}`,
      findSql: "SELECT id FROM organizations WHERE org_name = $1",
      findParams: [DEMO_ORGANIZATION.org_name],
      updateSql: `
        UPDATE organizations
           SET org_type = $2, uen = $3, address = $4, contact_person = $5, contact_email = $6,
               contact_phone = $7, approval_status = 'approved', approved_by = $8, approved_at = NOW(),
               status = 'active', approval_document_url = NULL, updated_at = NOW()
         WHERE org_name = $1
      `,
      updateParams: [
        DEMO_ORGANIZATION.org_name, DEMO_ORGANIZATION.org_type, DEMO_ORGANIZATION.uen,
        DEMO_ORGANIZATION.address, DEMO_ORGANIZATION.contact_person,
        DEMO_ORGANIZATION.contact_email, DEMO_ORGANIZATION.contact_phone,
        idOf("carol@test.com"),
      ],
      insertSql: `
        INSERT INTO organizations (org_name, org_type, uen, address, contact_person, contact_email, contact_phone, approval_status, approved_by, approved_at, status, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, 'approved', $8, NOW(), 'active', NOW(), NOW())
        RETURNING id
      `,
      insertParams: [
        DEMO_ORGANIZATION.org_name, DEMO_ORGANIZATION.org_type, DEMO_ORGANIZATION.uen,
        DEMO_ORGANIZATION.address, DEMO_ORGANIZATION.contact_person,
        DEMO_ORGANIZATION.contact_email, DEMO_ORGANIZATION.contact_phone,
        idOf("carol@test.com"),
      ],
    });

    const merchantIdByKey = new Map();
    for (const m of DEMO_MERCHANTS) {
      const id = await upsertRow(client, run, {
        label: `merchant ${m.name}`,
        findSql: "SELECT id FROM merchants WHERE name = $1",
        findParams: [m.name],
        updateSql: `
          UPDATE merchants
             SET contact_person = $2, contact_email = $3, contact_phone = $4, address = $5,
                 status = 'active', created_by = $6, updated_at = NOW()
           WHERE name = $1
        `,
        updateParams: [m.name, m.contact_person, m.contact_email, m.contact_phone, m.address, idOf("carol@test.com")],
        insertSql: `
          INSERT INTO merchants (name, contact_person, contact_email, contact_phone, address, status, created_by, created_at, updated_at)
          VALUES ($1, $2, $3, $4, $5, 'active', $6, NOW(), NOW())
          RETURNING id
        `,
        insertParams: [m.name, m.contact_person, m.contact_email, m.contact_phone, m.address, idOf("carol@test.com")],
      });
      merchantIdByKey.set(m.key, id);
    }

    const merchantProductIds = [];
    for (const p of DEMO_PRODUCTS) {
      const merchantId = merchantIdByKey.get(p.merchant);
      const id = await upsertRow(client, run, {
        label: `product ${p.name}`,
        findSql: "SELECT id FROM merchant_products WHERE merchant_id = $1 AND name = $2",
        findParams: [merchantId, p.name],
        updateSql: `
          UPDATE merchant_products
             SET description = $3, points_cost = $4, is_active = TRUE, image_url = NULL, updated_at = NOW()
           WHERE merchant_id = $1 AND name = $2
        `,
        updateParams: [merchantId, p.name, p.description, p.points_cost],
        insertSql: `
          INSERT INTO merchant_products (merchant_id, name, description, points_cost, is_active, created_at, updated_at)
          VALUES ($1, $2, $3, $4, TRUE, NOW(), NOW())
          RETURNING id
        `,
        insertParams: [merchantId, p.name, p.description, p.points_cost],
      });
      merchantProductIds.push(id);
    }

    const eventIds = [];
    for (const e of DEMO_EVENTS) {
      const id = await upsertRow(client, run, {
        label: `event ${e.title}`,
        findSql: "SELECT id FROM events WHERE title = $1",
        findParams: [e.title],
        updateSql: `
          UPDATE events
             SET organization_id = $2, organizer_id = $3, description = $4, location = $5,
                 event_date = ${relativeDate(e.days, e.hour)}, capacity = $6, points_value = $7,
                 category = $8, status = 'upcoming', feedback_score = NULL, image_url = NULL,
                 updated_at = NOW()
           WHERE title = $1
        `,
        updateParams: [e.title, orgId, idOf("bob@test.com"), e.description, e.location, e.capacity, e.points_value, e.category],
        insertSql: `
          INSERT INTO events (organization_id, organizer_id, title, description, location, event_date, capacity, points_value, category, status, created_at, updated_at)
          VALUES ($1, $2, $3, $4, $5, ${relativeDate(e.days, e.hour)}, $6, $7, $8, 'upcoming', NOW(), NOW())
          RETURNING id
        `,
        insertParams: [orgId, idOf("bob@test.com"), e.title, e.description, e.location, e.capacity, e.points_value, e.category],
      });
      eventIds.push(id);
    }

    const couponIds = [];
    for (const c of DEMO_COUPONS) {
      const id = await upsertRow(client, run, {
        label: `coupon ${c.title}`,
        findSql: "SELECT id FROM coupons WHERE title = $1",
        findParams: [c.title],
        updateSql: `
          UPDATE coupons
             SET description = $2, points_required = $3, quantity = $4, value_cents = $5,
                 merchant_name = $6, expiry_date = ${relativeDate(c.expiry_days)}, valid_from = ${relativeDate(0)},
                 status = 'active', image_url = NULL, created_by = $7, updated_at = NOW()
           WHERE title = $1
        `,
        updateParams: [c.title, c.description, c.points_required, c.quantity, c.value_cents, c.merchant_name, idOf("carol@test.com")],
        insertSql: `
          INSERT INTO coupons (title, description, points_required, quantity, value_cents, merchant_name, expiry_date, valid_from, status, created_by, created_at, updated_at)
          VALUES ($1, $2, $3, $4, $5, $6, ${relativeDate(c.expiry_days)}, ${relativeDate(0)}, 'active', $7, NOW(), NOW())
          RETURNING id
        `,
        insertParams: [c.title, c.description, c.points_required, c.quantity, c.value_cents, c.merchant_name, idOf("carol@test.com")],
      });
      couponIds.push(id);
    }

    // ── STEP 5: prune anything a visitor added ──────────────────────────
    // Children before parents: merchant_products → merchants and
    // events → organizations are NO ACTION FKs. Safe to delete here because
    // step 3 already removed every row that could reference them.
    log("STEP 5 — prune non-canonical content");
    await run("prune merchant_products", "DELETE FROM merchant_products WHERE id <> ALL($1::int[])", [merchantProductIds]);
    await run("prune events", "DELETE FROM events WHERE id <> ALL($1::int[])", [eventIds]);
    await run("prune coupons", "DELETE FROM coupons WHERE id <> ALL($1::int[])", [couponIds]);
    await run("prune merchants", "DELETE FROM merchants WHERE id <> ALL($1::int[])", [[...merchantIdByKey.values()]]);
    await run("prune organizations", "DELETE FROM organizations WHERE id <> ALL($1::int[])", [[orgId]]);
    // Prospects are pure scratch — there is no canonical set, so all of it goes.
    await run("clear merchant_prospects", "DELETE FROM merchant_prospects");

    // ── STEP 6: remove non-canonical demo accounts ──────────────────────
    // Scoped to @test.com on purpose. A visitor who registered with their own
    // address keeps their account; only the shared demo namespace is reset, so
    // the reset can never be seen to delete a real person's login. Their
    // *activity* was cleared in step 3 regardless.
    //
    // The match is case-insensitive (`~*`) while the canonical comparison is
    // exact: users.email is UNIQUE case-sensitively, so a visitor can register
    // "Alice@test.com" as a second row alongside alice@test.com. That row must
    // be pruned, not treated as canonical.
    log("STEP 6 — remove non-canonical demo accounts");
    await run("prune @test.com accounts", `
      DELETE FROM users
       WHERE email ~* '^[^@]+@test\\.com$'
         AND email <> ALL($1::text[])
    `, [canonicalEmails]);

    // ── STEP 7: pre-issued PINs for the merchant demo ───────────────────
    const pinSecret = resolvePinSecret();
    if (pinSecret) {
      log("STEP 7 — pre-issued coupon PINs");
      for (const { pin, couponIndex } of DEMO_PINS) {
        await run(`pin ${pin}`, `
          INSERT INTO user_coupons (user_id, coupon_id, pin_code, pin_hash, status, expiry_date, created_at)
          VALUES ($1, $2, $3, $4, 'unused', ${relativeDate(DEMO_COUPONS[couponIndex].expiry_days)}, NOW())
        `, [idOf("alice@test.com"), couponIds[couponIndex], pin, hashPin(pin, pinSecret)]);
      }
    } else {
      log("STEP 7 — skipped (no PIN_SECRET in production; seeded PINs would not verify)");
      steps.push({ label: "pre-issued coupon PINs", rows: null });
    }

    // ── STEP 7b: baseline redemption history ────────────────────────────
    // Written in the CASHIER row shape deliberately: only `user_coupon_id` is
    // set, with `user_id` and `coupon_id` left NULL — exactly as
    // merchant.service.js writes them, which is why migration 019 made those two
    // nullable. Seeding the other shape would let the demo look healthy while
    // the cashier path stayed broken, which is the bug this baseline exists to
    // keep visible. `pin_code`/`pin_hash` stay NULL: these coupons are already
    // spent, and pin_code carries a UNIQUE index.
    log("STEP 7b — baseline redemption history");
    for (const r of DEMO_REDEMPTIONS) {
      const cashierId = idOf(r.cashier);
      const coupon = DEMO_COUPONS[r.couponIndex];
      const redeemedAt = relativeDate(-r.days_ago, r.hour);

      const held = await run(`redeemed coupon for ${r.volunteer}`, `
        INSERT INTO user_coupons (user_id, coupon_id, pin_code, pin_hash, status, expiry_date, created_at, redeemed_at, verified_by)
        VALUES ($1, $2, NULL, NULL, 'used', ${relativeDate(coupon.expiry_days)}, ${redeemedAt}, ${redeemedAt}, $3)
        RETURNING id
      `, [idOf(r.volunteer), couponIds[r.couponIndex], cashierId]);

      await run(`redemption log for ${r.volunteer}`, `
        INSERT INTO redemption_logs (user_coupon_id, points_spent, value_cents, action, action_by, created_at, notes)
        VALUES ($1, $2, $3, 'used', $4, ${redeemedAt}, $5)
      `, [held.rows[0].id, coupon.points_required, coupon.value_cents, cashierId, r.notes]);
    }

    // ── STEP 8: notifications ───────────────────────────────────────────
    log("STEP 8 — notifications");
    for (const n of DEMO_NOTIFICATIONS) {
      await run(`notification "${n.title}"`, `
        INSERT INTO notifications (user_id, title, description, icon, color, is_read, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, NOW() - INTERVAL '${n.hours_ago} hours')
      `, [idOf(n.email), n.title, n.description, n.icon, n.color, n.is_read]);
    }

    // ── STEP 9: report ──────────────────────────────────────────────────
    const { rows: summaryRows } = await client.query(`
      SELECT
        (SELECT COUNT(*)::int FROM users WHERE email = ANY($1::text[])) AS demo_users,
        (SELECT COUNT(*)::int FROM users)                               AS total_users,
        (SELECT COUNT(*)::int FROM events)                              AS events,
        (SELECT COUNT(*)::int FROM coupons)                             AS coupons,
        (SELECT COUNT(*)::int FROM merchants)                           AS merchants,
        (SELECT COUNT(*)::int FROM user_coupons)                        AS user_coupons,
        (SELECT COUNT(*)::int FROM rewards_configuration)               AS rewards_config_rows,
        (SELECT COUNT(*)::int FROM email_config)                        AS email_config_rows
    `, [canonicalEmails]);

    if (apply) {
      await client.query("COMMIT");
    } else {
      await client.query("ROLLBACK");
    }

    return { apply, skipped: null, steps, summary: summaryRows[0] };
  } catch (err) {
    // The transaction may already be aborted (or already rolled back by the
    // failure itself) — a failed ROLLBACK here must not mask the real error.
    await client.query("ROLLBACK").catch(() => {});
    throw err;
  } finally {
    client.release();
  }
}

//-----------------------------------------------------------------------
// SECTION: Scheduler
//-----------------------------------------------------------------------

let intervalHandle = null;
let running = false;

/**
 * Kick off the boot reset and the periodic timer.
 *
 * Called from index.js after migrations. Never throws and never blocks the
 * caller — a failed reset must not take the API down, and Render's cold starts
 * are slow enough without waiting on a full data restore.
 *
 * On Render's free tier the service sleeps after ~15 minutes idle, which
 * freezes this timer; the boot reset is what covers that case, since waking the
 * service runs it again.
 */
function startDemoResetScheduler({ log = console.log } = {}) {
  if (!isPublicDemoMode()) {
    log("[demoReset] disabled — PUBLIC_DEMO_MODE is not \"true\"");
    return null;
  }

  const parsed = Number.parseInt(process.env.DEMO_RESET_INTERVAL_MINUTES ?? "", 10);
  const minutes = Number.isFinite(parsed) && parsed >= 0 ? parsed : DEFAULT_INTERVAL_MINUTES;

  const tick = async (reason) => {
    // Overlap guard: a slow reset (or a slow database) must not let the next
    // tick start a second concurrent transaction over the same rows.
    if (running) {
      log(`[demoReset] ${reason} skipped — a reset is already running`);
      return;
    }
    running = true;
    const startedAt = Date.now();
    try {
      const { summary } = await runDemoReset({ apply: true, log: (line) => log(`[demoReset] ${line}`) });
      log(`[demoReset] ${reason} complete in ${Date.now() - startedAt}ms — ${JSON.stringify(summary)}`);
    } catch (err) {
      console.error(`[demoReset] ${reason} FAILED: ${err.message}`);
    } finally {
      running = false;
    }
  };

  tick("boot reset");

  if (minutes === 0) {
    log("[demoReset] periodic reset disabled (DEMO_RESET_INTERVAL_MINUTES=0) — boot reset only");
    return null;
  }

  intervalHandle = setInterval(() => tick("scheduled reset"), minutes * 60 * 1000);
  if (typeof intervalHandle.unref === "function") intervalHandle.unref();
  log(`[demoReset] scheduled every ${minutes} minute(s)`);
  return intervalHandle;
}

module.exports = { runDemoReset, startDemoResetScheduler, DEMO_PASSWORD, DEMO_PINS };
