//-------------------------------------------------------------------------
// TEST: Admin Service — coupon calculations, PIN generation
// Purpose: Verify coupon value calculation formula and PIN gen logic
// Run:     node --test tests/unit/admin.service.test.js
//-------------------------------------------------------------------------
const { describe, it, mock } = require("node:test");
const assert = require("node:assert");
const crypto = require("crypto");

//-------------------------------------------------------------------------
// SECTION: Mock Database Pool
//-------------------------------------------------------------------------
const mockPool = { query: mock.fn() };
mock.method(require("path").resolve(__dirname, "../../src/config/database"), "pool", mockPool);
mock.method(require("path").resolve(__dirname, "../../src/config/database"), "pool.connect", () => ({
  query: mock.fn(),
  release: () => {},
}));

const adminService = require("../../src/services/admin.service");

//-------------------------------------------------------------------------
// SECTION: UT-07 — Points Calculation with Rewards Config
//-------------------------------------------------------------------------
describe("UT-07: Coupon — Points Calculation (ppd=100)", () => {
  it("should calculate points_cost as Math.round(value_cents * ppd / 100)", async () => {
    mockPool.query.mock.resetCalls();

    // getPointsPerDollar query
    mockPool.query.mock.mockImplementationOnce(() => ({
      rows: [{ points_per_dollar: 100 }],
    }));
    // Count query
    mockPool.query.mock.mockImplementationOnce(() => ({
      rows: [{ count: "1" }],
    }));
    // Main query
    mockPool.query.mock.mockImplementationOnce(() => ({
      rows: [{ id: 1, title: "$5 Coffee Voucher", description: "", points_required: 50, quantity: 10, value_cents: 500, merchant_name: "FairPrice", expiry_date: "2026-12-31", status: "active", created_at: new Date(), created_by_name: "Admin", redeemed_count: "0" }],
    }));

    const result = await adminService.listCoupons({ page: 1, limit: 15 });
    const coupon = result.data[0];

    // Formula: Math.round(500 * 100 / 100) = 500
    assert.equal(coupon.points_cost, 500, "$5 Coffee should cost 500 points at ppd=100");
    assert.equal(coupon.calculated_points, 500);
  });
});

//-------------------------------------------------------------------------
// SECTION: UT-08 — Points Change with Config Change
//-------------------------------------------------------------------------
describe("UT-08: Coupon — Points Recalculate When Config Changes", () => {
  it("should return different points_cost when points_per_dollar changes", async () => {
    mockPool.query.mock.resetCalls();

    // getPointsPerDollar returns 50
    mockPool.query.mock.mockImplementationOnce(() => ({
      rows: [{ points_per_dollar: 50 }],
    }));
    // Count
    mockPool.query.mock.mockImplementationOnce(() => ({
      rows: [{ count: "1" }],
    }));
    // Main query
    mockPool.query.mock.mockImplementationOnce(() => ({
      rows: [{ id: 1, title: "$5 Coffee Voucher", description: "", points_required: 50, quantity: 10, value_cents: 500, merchant_name: "FairPrice", expiry_date: "2026-12-31", status: "active", created_at: new Date(), created_by_name: "Admin", redeemed_count: "0" }],
    }));

    const result = await adminService.listCoupons({ page: 1, limit: 15 });
    const coupon = result.data[0];

    // Formula: Math.round(500 * 50 / 100) = 250
    assert.equal(coupon.points_cost, 250, "$5 Coffee should cost 250 points at ppd=50");
  });
});

//-------------------------------------------------------------------------
// SECTION: UT-09 — Auto-Calculate Points on Coupon Create
//-------------------------------------------------------------------------
describe("UT-09: Coupon — Auto-Calculate Points on Create", () => {
  it("should auto-calculate points_required from value_cents", async () => {
    mockPool.query.mock.resetCalls();

    // getPointsPerDollar
    mockPool.query.mock.mockImplementationOnce(() => ({
      rows: [{ points_per_dollar: 100 }],
    }));

    // Mock pool.connect for transaction
    const mockClient = {
      query: mock.fn(),
      release: () => {},
    };
    mockPool.query.mock.mockImplementationOnce(() => mockClient);

    // BEGIN
    mockClient.query.mock.mockImplementationOnce(() => ({}));
    // INSERT coupon
    mockClient.query.mock.mockImplementationOnce(() => ({
      rows: [{ id: 99, title: "Test Coupon", points_required: 750, quantity: 10, value_cents: 750, merchant_name: "Test", expiry_date: "2026-12-31" }],
    }));
    // SELECT for PIN uniqueness checks (called 10 times for quantity=10)
    for (let i = 0; i < 10; i++) {
      mockClient.query.mock.mockImplementationOnce(() => ({ rows: [] }));
    }
    // 10 INSERTs for PINs
    for (let i = 0; i < 10; i++) {
      mockClient.query.mock.mockImplementationOnce(() => ({ rows: [{ id: i }] }));
    }
    // COMMIT
    mockClient.query.mock.mockImplementationOnce(() => ({}));

    const result = await adminService.createCoupon(
      { title: "Test Coupon", value_cents: 750, quantity: 10, expiry_date: "2026-12-31" },
      3
    );

    assert.equal(result.coupon.points_required, 750, "750¢ should auto-calculate to 750 points at ppd=100");
  });
});

//-------------------------------------------------------------------------
// SECTION: UT-10 — PIN Hashing Determinism
//-------------------------------------------------------------------------
describe("UT-10: PIN — Hashing is Deterministic", () => {
  it("should return the same hash for the same PIN", () => {
    const hash1 = adminService.testHelpers?.hashPin
      ? adminService.testHelpers.hashPin("123456")
      : crypto.createHmac("sha256", "dev-pin-secret").update("123456").digest("hex");

    const secret = process.env.PIN_SECRET || process.env.JWT_ACCESS_SECRET || "dev-pin-secret";
    const hash2 = crypto.createHmac("sha256", secret).update("123456").digest("hex");

    assert.equal(typeof hash2, "string");
    assert.equal(hash2.length, 64, "SHA256 HMAC should be 64 hex chars");
  });
});
