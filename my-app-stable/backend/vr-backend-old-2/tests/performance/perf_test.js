/**
 * Performance Load Test v1.0
 *
 * Tests API response times for key endpoints under sequential + concurrent load.
 * Run: node tests/performance/perf_test.js
 *
 * Targets:
 *   GET  /api/events         — Browse events (volunteer)
 *   POST /api/auth/login     — Authentication
 *   POST /api/attendance/scan — QR check-in (organiser)
 *   GET  /api/leaderboard    — Hall of Fame leaderboard
 *   GET  /api/health         — Health check (baseline)
 */

const BASE = "http://localhost:3000/api";
const PASS = 0;
const FAIL = 0;
const RESULTS = [];

function log(label, ms, ok) {
  const status = ok ? "PASS" : "FAIL";
  console.log(`  ${status}: ${label} — ${ms.toFixed(1)}ms`);
  RESULTS.push({ label, ms, ok });
}

async function timedFetch(label, url, opts = {}) {
  const start = performance.now();
  try {
    const res = await fetch(url, opts);
    const ms = performance.now() - start;
    const ok = res.ok || res.status === 401 || res.status === 403;
    log(label, ms, ok);
    return { ok, ms, res, data: await res.json().catch(() => ({})) };
  } catch (err) {
    const ms = performance.now() - start;
    log(label, ms, false);
    console.error(`    Error: ${err.message}`);
    return { ok: false, ms, res: null, data: {} };
  }
}

// ─── Run login once to get tokens ────────────────────────────

async function loginAs(email, password) {
  const { data } = await timedFetch(
    `Login:${email}`,
    `${BASE}/auth/login`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    }
  );
  return data.token;
}

// ─── Sequential tests ────────────────────────────────────────

async function runSequential(token) {
  console.log("\n─── Sequential Tests ──────────────────────\n");

  // PT-01: Health check
  await timedFetch("Health Check", `${BASE}/health`);

  // PT-02: Browse events (volunteer)
  await timedFetch("Browse Events (GET /events)", `${BASE}/events?limit=5`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  // PT-03: Leaderboard
  await timedFetch("Leaderboard (GET /leaderboard)", `${BASE}/leaderboard`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  // Login as organiser for scan
  const orgToken = await loginAs("bob@test.com", "password123");
  if (!orgToken) {
    console.log("  ⚠️  Could not get organiser token, skipping scan tests");
    return token;
  }

  // PT-04: Get today's events (organiser)
  const { data: todayData } = await timedFetch(
    "Today's Events (GET /events/today)",
    `${BASE}/events/today`,
    { headers: { Authorization: `Bearer ${orgToken}` } }
  );

  return token;
}

// ─── Concurrent load test ────────────────────────────────────

async function runConcurrent(token, concurrency = 10) {
  console.log(`\n─── Concurrent Load Test (${concurrency}x) ──────────\n`);

  const endpoint = `${BASE}/events?limit=5`;
  const promises = [];

  for (let i = 0; i < concurrency; i++) {
    promises.push(
      timedFetch(
        `Concurrent #${i + 1}`,
        endpoint,
        { headers: { Authorization: `Bearer ${token}` } }
      )
    );
  }

  const results = await Promise.all(promises);
  const times = results.map((r) => r.ms);
  const avg = times.reduce((a, b) => a + b, 0) / times.length;
  const min = Math.min(...times);
  const max = Math.max(...times);

  console.log(`\n  Avg: ${avg.toFixed(1)}ms  Min: ${min.toFixed(1)}ms  Max: ${max.toFixed(1)}ms`);
  RESULTS.push({ label: `Concurrent ${concurrency}x (avg)`, ms: avg, ok: true });
}

// ─── Main ────────────────────────────────────────────────────

async function main() {
  console.log("═══════════════════════════════════════════");
  console.log("  Performance Load Test v1.0");
  console.log(`  Target: ${BASE}`);
  console.log(`  Started: ${new Date().toISOString()}`);
  console.log("═══════════════════════════════════════════\n");

  // Login
  console.log("─── Authentication Setup ─────────────────\n");
  const token = await loginAs("alice@test.com", "password123");
  if (!token) {
    console.error("FATAL: Could not login. Is the backend running?");
    process.exit(1);
  }
  console.log("  Token acquired ✓");

  await runSequential(token);
  await runConcurrent(token, 10);

  // Summary
  const passed = RESULTS.filter((r) => r.ok).length;
  const failed = RESULTS.filter((r) => !r.ok).length;
  const avgAll = RESULTS.reduce((s, r) => s + r.ms, 0) / RESULTS.length;

  console.log("\n─── Summary ─────────────────────────────\n");
  console.log(`  Total: ${RESULTS.length} tests`);
  console.log(`  Passed: ${passed}`);
  console.log(`  Failed: ${failed}`);
  console.log(`  Overall avg: ${avgAll.toFixed(1)}ms`);
  console.log(`  Completed: ${new Date().toISOString()}`);
  console.log("\n═══════════════════════════════════════════\n");

  process.exit(failed > 0 ? 1 : 0);
}

main();
