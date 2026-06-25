const { describe, it, mock } = require("node:test");
const assert = require("node:assert");
const { pool } = require("../../src/config/database");
const merchantService = require("../../src/services/merchant.service");

function mockPoolQuery(returns) {
  let i = 0;
  return mock.method(pool, "query", () => {
    return i < returns.length ? returns[i++] : { rows: [] };
  });
}

function mockPoolConnect(client) {
  return mock.method(pool, "connect", () => Promise.resolve(client));
}

// ─── Existing: PIN Verify ──────────────────────────────────────

describe("UT-12: Merchant — Verify Valid PIN", () => {
  it("should return coupon details for a valid unused PIN", async () => {
    mockPoolQuery([{
      rows: [{
        user_coupon_id: 1, status: "unused", expiry_date: "2026-12-31",
        title: "Test Coffee", volunteer_name: "Alice",
      }],
    }]);
    const result = await merchantService.verifyPin({ pin: "123456" });
    assert.equal(result.data.title, "Test Coffee");
  });
});

describe("UT-13: Merchant — Verify Invalid PIN", () => {
  it("should throw 404 for non-existent PIN", async () => {
    mockPoolQuery([{ rows: [] }]);
    try {
      await merchantService.verifyPin({ pin: "000000" });
      assert.fail("Should have thrown");
    } catch (err) {
      assert.equal(err.statusCode || err.status, 404);
    }
  });
});

// ─── New: PIN Edge Cases ───────────────────────────────────────

describe("verifyPin — edge cases", () => {
  it("should throw 400 for non-6-digit PIN", async () => {
    try {
      await merchantService.verifyPin({ pin: "12345" });
      assert.fail("Should have thrown");
    } catch (err) {
      assert.equal(err.statusCode || err.status, 400);
    }
  });

  it("should throw 409 for already redeemed coupon", async () => {
    mockPoolQuery([{
      rows: [{
        user_coupon_id: 1, status: "used", expiry_date: "2026-12-31",
        title: "Coffee", volunteer_name: "Bob",
      }],
    }]);
    try {
      await merchantService.verifyPin({ pin: "999999" });
      assert.fail("Should have thrown");
    } catch (err) {
      assert.equal(err.statusCode || err.status, 409);
    }
  });

  it("should throw 400 for expired coupon", async () => {
    mockPoolQuery([{
      rows: [{
        user_coupon_id: 1, status: "unused", expiry_date: "2020-01-01",
        title: "Old Coffee", volunteer_name: "Bob",
      }],
    }]);
    try {
      await merchantService.verifyPin({ pin: "111111" });
      assert.fail("Should have thrown");
    } catch (err) {
      assert.equal(err.statusCode || err.status, 400);
    }
  });
});

// ─── New: Redeem Coupon ────────────────────────────────────────

describe("redeemCoupon", () => {
  it("should successfully redeem a valid coupon", async () => {
    const mockClient = {
      query: mock.fn(),
      release: () => {},
    };
    let qc = 0;
    mockClient.query.mock.mockImplementation((sql) => {
      qc++;
      if (sql === "BEGIN" || sql === "COMMIT" || sql === "ROLLBACK") return {};
      if (sql.includes("FOR UPDATE")) return { rows: [{ user_coupon_id: 1, status: "unused", expiry_date: "2026-12-31", title: "Coffee", points_required: 100, value_cents: 500, volunteer_name: "Alice" }] };
      if (sql.includes("UPDATE user_coupons")) return { rows: [{ id: 1, status: "used", redeemed_at: new Date(), verified_by: 42 }] };
      if (sql.includes("INSERT INTO redemption_logs")) return {};
      return { rows: [] };
    });
    mockPoolConnect(mockClient);

    const result = await merchantService.redeemCoupon({ userCouponId: 1 }, 42);
    assert.equal(result.data.status, "used");
    assert.equal(result.data.coupon_title, "Coffee");
  });

  it("should throw 409 for already redeemed coupon", async () => {
    const mockClient = {
      query: mock.fn(),
      release: () => {},
    };
    mockClient.query.mock.mockImplementation((sql) => {
      if (sql === "BEGIN" || sql === "ROLLBACK") return {};
      if (sql.includes("FOR UPDATE")) return { rows: [{ user_coupon_id: 1, status: "used", expiry_date: "2026-12-31", title: "Coffee", points_required: 100, value_cents: 500, volunteer_name: "Alice" }] };
      return { rows: [] };
    });
    mockPoolConnect(mockClient);

    try {
      await merchantService.redeemCoupon({ userCouponId: 1 }, 42);
      assert.fail("Should have thrown");
    } catch (err) {
      assert.equal(err.statusCode || err.status, 409);
    }
  });
});

// ─── New: Reverse Redemption ────────────────────────────────────

describe("reverseRedemption", () => {
  it("should throw 400 if userCouponId missing", async () => {
    try {
      await merchantService.reverseRedemption({});
      assert.fail("Should have thrown");
    } catch (err) {
      assert.equal(err.statusCode || err.status, 400);
    }
  });

  it("should throw 400 if coupon not yet redeemed", async () => {
    const mockClient = {
      query: mock.fn(),
      release: () => {},
    };
    mockClient.query.mock.mockImplementation((sql) => {
      if (sql === "BEGIN" || sql === "ROLLBACK") return {};
      if (sql.includes("FOR UPDATE")) return { rows: [{ id: 1, status: "unused", redeemed_at: null }] };
      return { rows: [] };
    });
    mockPoolConnect(mockClient);

    try {
      await merchantService.reverseRedemption({ userCouponId: 1 }, 42);
      assert.fail("Should have thrown");
    } catch (err) {
      assert.equal(err.statusCode || err.status, 400);
    }
  });

  it("should throw 403 if outside 5-minute window", async () => {
    const oldDate = new Date(Date.now() - 10 * 60 * 1000); // 10 min ago
    const mockClient = {
      query: mock.fn(),
      release: () => {},
    };
    mockClient.query.mock.mockImplementation((sql) => {
      if (sql === "BEGIN" || sql === "ROLLBACK") return {};
      if (sql.includes("FOR UPDATE")) return { rows: [{ id: 1, status: "used", redeemed_at: oldDate }] };
      return { rows: [] };
    });
    mockPoolConnect(mockClient);

    try {
      await merchantService.reverseRedemption({ userCouponId: 1 }, 42);
      assert.fail("Should have thrown");
    } catch (err) {
      assert.equal(err.statusCode || err.status, 403);
    }
  });
});
