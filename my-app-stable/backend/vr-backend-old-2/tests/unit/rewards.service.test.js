const { describe, it, mock } = require("node:test");
const assert = require("node:assert");
const { pool } = require("../../src/config/database");
const rewardsService = require("../../src/services/rewards.service");

// ─── Helpers ────────────────────────────────────────────────────────────────

function mockPoolQuery(returnValues) {
  let idx = 0;
  return mock.method(pool, "query", () => {
    return idx < returnValues.length ? returnValues[idx++] : { rows: [] };
  });
}

function mockPoolConnect(client) {
  return mock.method(pool, "connect", () => Promise.resolve(client));
}

// ─── hashPin ────────────────────────────────────────────────────────────────

describe("hashPin", () => {
  it("should produce deterministic HMAC-SHA256 hash", () => {
    const hash1 = rewardsService.hashPin("123456");
    const hash2 = rewardsService.hashPin("123456");
    assert.equal(hash1, hash2);
    assert.equal(hash1.length, 64); // hex-encoded SHA256 = 64 chars
  });

  it("should produce different hashes for different PINs", () => {
    const hash1 = rewardsService.hashPin("123456");
    const hash2 = rewardsService.hashPin("654321");
    assert.notEqual(hash1, hash2);
  });
});

// ─── browseRewards ──────────────────────────────────────────────────────────

describe("browseRewards", () => {
  it("should return paginated rewards with defaults", async () => {
    mockPoolQuery([
      { rows: [{ total: 10 }] },
      { rows: [{ id: 1, title: "Coffee Voucher" }, { id: 2, title: "Movie Ticket" }] },
    ]);

    const result = await rewardsService.browseRewards();

    assert.equal(result.total, 10);
    assert.equal(result.data.length, 2);
    assert.equal(result.page, 1);
    assert.equal(result.limit, 20);
  });

  it("should filter by search", async () => {
    const mockFn = mockPoolQuery([
      { rows: [{ total: 1 }] },
      { rows: [{ id: 1, title: "Coffee Voucher" }] },
    ]);

    await rewardsService.browseRewards({ search: "coffee" });

    const calls = mockFn.mock.calls;
    assert.ok(calls[0].arguments[0].includes("ILIKE"));
    assert.ok(calls[0].arguments[1].includes("%coffee%"));
  });

  it("should return empty when no rewards match", async () => {
    mockPoolQuery([
      { rows: [{ total: 0 }] },
      { rows: [] },
    ]);

    const result = await rewardsService.browseRewards({ search: "nonexistent" });

    assert.equal(result.total, 0);
    assert.equal(result.data.length, 0);
  });

  it("should handle page=0 gracefully", async () => {
    mockPoolQuery([
      { rows: [{ total: 5 }] },
      { rows: [{ id: 1 }] },
    ]);

    const result = await rewardsService.browseRewards({ page: 0 });

    assert.equal(result.page, 1); // toPositiveInt converts 0 → fallback 1
  });
});

// ─── getRewardById ──────────────────────────────────────────────────────────

describe("getRewardById", () => {
  it("should return reward with is_favorite flag", async () => {
    mockPoolQuery([
      { rows: [{ id: 1, title: "Coffee", is_favorite: true }] },
    ]);

    const result = await rewardsService.getRewardById(1, 42);

    assert.equal(result.data.id, 1);
    assert.equal(result.data.is_favorite, true);
  });

  it("should throw 404 if reward not found", async () => {
    mockPoolQuery([{ rows: [] }]);

    try {
      await rewardsService.getRewardById(999, 42);
      assert.fail("Should have thrown");
    } catch (err) {
      assert.equal(err.statusCode || err.status, 404);
    }
  });
});

// ─── redeemReward ───────────────────────────────────────────────────────────

describe("redeemReward", () => {
  it("should successfully redeem reward with sufficient points", async () => {
    let queryCount = 0;
    const client = {
      query: (sql) => {
        queryCount++;
        if (sql === "BEGIN" || sql === "COMMIT" || sql === "ROLLBACK") return {};
        if (sql.includes("SELECT id, title")) return { rows: [{ id: 1, title: "Coffee", points_required: 100, quantity: 5, value_cents: 500, expiry_date: null, status: "active" }] };
        if (sql.includes("UPDATE users SET points")) return { rows: [{ points: 400 }] }; // was 500, spent 100
        if (sql.includes("UPDATE coupons")) return { rows: [{ quantity: 4, status: "active" }] };
        if (sql.includes("SELECT id FROM user_coupons WHERE pin_hash")) return { rows: [] }; // PIN unique
        if (sql.includes("INSERT INTO user_coupons")) return { rows: [{ id: 10, user_id: 42, coupon_id: 1, status: "unused", expiry_date: new Date(), created_at: new Date() }] };
        if (sql.includes("INSERT INTO redemption_logs")) return {};
        if (sql.includes("INSERT INTO points_ledger")) return {};
        return { rows: [] };
      },
      release: () => {},
    };
    mockPoolConnect(client);

    const result = await rewardsService.redeemReward(1, 42);

    assert.equal(result.data.coupon_title, "Coffee");
    assert.equal(result.data.points_balance, 400);
    assert.equal(result.data.remaining_quantity, 4);
    assert.equal(result.data.pin.length, 6); // 6-digit PIN
    assert.equal(typeof result.data.pin, "string");
  });

  it("should throw 403 if user has insufficient points", async () => {
    const client = {
      query: (sql) => {
        if (sql === "BEGIN" || sql === "ROLLBACK") return {};
        if (sql.includes("SELECT id, title")) return { rows: [{ id: 1, title: "Coffee", points_required: 1000, quantity: 5, value_cents: 500, expiry_date: null, status: "active" }] };
        if (sql.includes("UPDATE users SET points")) return { rows: [] }; // not enough points
        return { rows: [] };
      },
      release: () => {},
    };
    mockPoolConnect(client);

    try {
      await rewardsService.redeemReward(1, 42);
      assert.fail("Should have thrown");
    } catch (err) {
      assert.equal(err.statusCode || err.status, 403);
    }
  });

  it("should throw 409 if coupon is out of stock", async () => {
    const client = {
      query: (sql) => {
        if (sql === "BEGIN" || sql === "ROLLBACK") return {};
        if (sql.includes("SELECT id, title")) return { rows: [{ id: 1, title: "Coffee", points_required: 100, quantity: 0, value_cents: 500, expiry_date: null, status: "active" }] };
        return { rows: [] };
      },
      release: () => {},
    };
    mockPoolConnect(client);

    try {
      await rewardsService.redeemReward(1, 42);
      assert.fail("Should have thrown");
    } catch (err) {
      assert.equal(err.statusCode || err.status, 409);
    }
  });

  it("should throw 404 if reward doesn't exist", async () => {
    const client = {
      query: (sql) => {
        if (sql === "BEGIN" || sql === "ROLLBACK") return {};
        if (sql.includes("SELECT id, title")) return { rows: [] };
        return { rows: [] };
      },
      release: () => {},
    };
    mockPoolConnect(client);

    try {
      await rewardsService.redeemReward(999, 42);
      assert.fail("Should have thrown");
    } catch (err) {
      assert.equal(err.statusCode || err.status, 404);
    }
  });

  it("should throw 400 if reward is not active", async () => {
    const client = {
      query: (sql) => {
        if (sql === "BEGIN" || sql === "ROLLBACK") return {};
        if (sql.includes("SELECT id, title")) return { rows: [{ id: 1, title: "Coffee", points_required: 100, quantity: 5, value_cents: 500, expiry_date: null, status: "depleted" }] };
        return { rows: [] };
      },
      release: () => {},
    };
    mockPoolConnect(client);

    try {
      await rewardsService.redeemReward(1, 42);
      assert.fail("Should have thrown");
    } catch (err) {
      assert.equal(err.statusCode || err.status, 400);
    }
  });

  it("should use BEGIN/COMMIT/ROLLBACK transaction pattern", async () => {
    const sqlCalls = [];
    const client = {
      query: (sql) => {
        sqlCalls.push(typeof sql === "string" ? sql.substring(0, 30) : "?");
        if (sql === "BEGIN" || sql === "COMMIT" || sql === "ROLLBACK") return {};
        if (sql.includes("SELECT id, title")) return { rows: [{ id: 1, title: "Coffee", points_required: 100, quantity: 5, value_cents: 500, expiry_date: null, status: "active" }] };
        if (sql.includes("UPDATE users")) return { rows: [{ points: 400 }] };
        if (sql.includes("UPDATE coupons")) return { rows: [{ quantity: 4, status: "active" }] };
        if (sql.includes("SELECT id FROM user_coupons WHERE pin_hash")) return { rows: [] };
        if (sql.includes("INSERT INTO user_coupons")) return { rows: [{ id: 10, user_id: 42, coupon_id: 1, status: "unused", expiry_date: new Date(), created_at: new Date() }] };
        if (sql.includes("INSERT INTO redemption_logs")) return {};
        if (sql.includes("INSERT INTO points_ledger")) return {};
        return { rows: [] };
      },
      release: () => {},
    };
    mockPoolConnect(client);

    await rewardsService.redeemReward(1, 42);

    assert.ok(sqlCalls.some(s => s.startsWith("BEGIN")));
    assert.ok(sqlCalls.some(s => s.startsWith("COMMIT")));
    assert.ok(!sqlCalls.some(s => s.startsWith("ROLLBACK")));
  });
});
