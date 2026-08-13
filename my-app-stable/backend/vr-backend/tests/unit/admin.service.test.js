const { describe, it, mock } = require("node:test");
const assert = require("node:assert");
const { pool } = require("../../src/config/database");
const adminService = require("../../src/services/admin.service");

function mockPoolQuery(returns) {
  let i = 0;
  return mock.method(pool, "query", () => {
    return i < returns.length ? returns[i++] : { rows: [] };
  });
}

// ─── Existing: Coupon Math ──────────────────────────────────────

describe("UT-07: Coupon — Points Calculation (ppd=100)", () => {
  it("should calculate 500 points for $5 Coffee", () => {
    const result = Math.round(500 * 100 / 100);
    assert.equal(result, 500);
  });
});

describe("UT-08: Coupon — Points Recalculate when Config Changes", () => {
  it("should return different value when ppd changes", () => {
    assert.equal(Math.round(500 * 100 / 100), 500);
    assert.equal(Math.round(500 * 50 / 100), 250);
  });
});

describe("UT-09: Coupon — PIN Has Deterministic Hash", () => {
  it("should produce deterministic HMAC-SHA256 hash", () => {
    const crypto = require("crypto");
    const hash1 = crypto.createHmac("sha256", "dev-pin-secret").update("123456").digest("hex");
    const hash2 = crypto.createHmac("sha256", "dev-pin-secret").update("123456").digest("hex");
    assert.equal(hash1, hash2);
    assert.equal(hash1.length, 64);
  });
});

// ─── New: Dashboard Stats ──────────────────────────────────────

describe("getDashboardStats", () => {
  it("should return aggregated stats", async () => {
    // getDashboardStats runs 10 parallel queries — mock all with count=1
    const qs = Array(10).fill(0).map(() => ({ rows: [{ count: 1 }] }));
    mockPoolQuery(qs);
    const stats = await adminService.getDashboardStats();
    assert.equal(typeof stats.total_users, "number");
    assert.equal(typeof stats.total_events, "number");
    assert.ok(stats.total_users >= 0);
  });
});

// ─── New: User Management ──────────────────────────────────────

describe("updateUserStatus", () => {
  it("should throw 400 for invalid status", async () => {
    try {
      await adminService.updateUserStatus(1, { status: "invalid" });
      assert.fail("Should have thrown");
    } catch (err) {
      assert.equal(err.statusCode || err.status, 400);
    }
  });

  it("should throw 404 if user not found", async () => {
    mockPoolQuery([{ rows: [] }]);
    try {
      await adminService.updateUserStatus(999, { status: "active" });
      assert.fail("Should have thrown");
    } catch (err) {
      assert.equal(err.statusCode || err.status, 404);
    }
  });

  it("should return updated user on success", async () => {
    mockPoolQuery([{ rows: [{ id: 1, status: "disabled", updated_at: new Date() }] }]);
    const r = await adminService.updateUserStatus(1, { status: "disabled" });
    assert.equal(r.status, "disabled");
  });
});

// ─── New: Rewards Config ────────────────────────────────────────

describe("getRewardsConfig", () => {
  it("should return config with defaults", async () => {
    mockPoolQuery([{ rows: [{ points_per_dollar: 100, min_redeem_points: 50, max_redeem_per_day: 5, default_event_points: 50, updated_at: new Date() }] }]);
    const r = await adminService.getRewardsConfig();
    assert.equal(r.points_per_dollar, 100);
  });
});

// ─── New: Coupon Delete ─────────────────────────────────────────

describe("deleteEvent", () => {
  it("should throw 404 if event not found", async () => {
    // deleteEvent deletes dependent tables first, then events
    mockPoolQuery([{ rows: [] }, { rows: [] }, { rows: [] }, { rows: [] }, { rows: [] }, { rows: [] }]);
    try {
      await adminService.deleteEvent(999);
      assert.fail("Should have thrown");
    } catch (err) {
      assert.equal(err.statusCode || err.status, 404);
    }
  });
});
