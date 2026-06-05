//-------------------------------------------------------------------------
// TEST: Merchant Service — PIN verify, redeem, reverse
// Purpose: Verify PIN verification, redemption, and reversal logic
// Run:     node --test tests/unit/merchant.service.test.js
//-------------------------------------------------------------------------
const { describe, it, mock } = require("node:test");
const assert = require("node:assert");
const crypto = require("crypto");

//-------------------------------------------------------------------------
// SECTION: Mock Database Pool
//-------------------------------------------------------------------------
const mockPool = { query: mock.fn() };
mock.method(require("path").resolve(__dirname, "../../src/config/database"), "pool", mockPool);

const merchantService = require("../../src/services/merchant.service");

// Helper to hash PIN for test setup
function hashPin(pin) {
  const secret = process.env.PIN_SECRET || process.env.JWT_ACCESS_SECRET || "dev-pin-secret";
  return crypto.createHmac("sha256", secret).update(String(pin)).digest("hex");
}

//-------------------------------------------------------------------------
// SECTION: UT-12 — PIN Verify Success
//-------------------------------------------------------------------------
describe("UT-12: Merchant — Verify Valid PIN", () => {
  it("should return coupon details for a valid unused PIN", async () => {
    mockPool.query.mock.resetCalls();

    const validPin = "123456";
    const hashedPin = hashPin(validPin);

    // Verify PIN hash lookup
    mockPool.query.mock.mockImplementationOnce(() => ({
      rows: [{
        user_coupon_id: 1,
        status: "unused",
        expiry_date: "2026-12-31",
        title: "Test Coffee",
        volunteer_name: "Alice",
      }],
    }));

    const result = await merchantService.verifyPin(validPin);

    assert.ok(result.data, "Should return data object");
    assert.equal(result.data.status, "unused");
    assert.equal(result.data.coupon_title, "Test Coffee");
  });
});

//-------------------------------------------------------------------------
// SECTION: UT-13 — PIN Verify Invalid
//-------------------------------------------------------------------------
describe("UT-13: Merchant — Verify Invalid PIN", () => {
  it("should throw 404 for non-existent PIN", async () => {
    mockPool.query.mock.resetCalls();

    const invalidPin = "000000";
    const hashedPin = hashPin(invalidPin);

    // PIN lookup returns empty
    mockPool.query.mock.mockImplementationOnce(() => ({
      rows: [],
    }));

    try {
      await merchantService.verifyPin(invalidPin);
      assert.fail("Should have thrown");
    } catch (err) {
      assert.equal(err.statusCode || err.status, 404);
    }
  });
});

//-------------------------------------------------------------------------
// SECTION: UT-16 — Reverse Expired Window
//-------------------------------------------------------------------------
describe("UT-16: Merchant — Reverse Outside 5-Min Window", () => {
  it("should throw 403 when redeeming more than 5 minutes ago", async () => {
    mockPool.query.mock.resetCalls();

    // Mock pool.connect for transaction
    const mockClient = { query: mock.fn(), release: () => {} };
    mock.method(require("path").resolve(__dirname, "../../src/config/database"), "pool", "connect", () => mockClient);

    // BEGIN
    mockClient.query.mock.mockImplementationOnce(() => ({}));
    // Lookup — redeemed_at older than 5 min
    const oldDate = new Date(Date.now() - 10 * 60 * 1000); // 10 min ago
    mockClient.query.mock.mockImplementationOnce(() => ({
      rows: [{ id: 1, status: "used", redeemed_at: oldDate }],
    }));

    try {
      await merchantService.reverseRedemption({ userCouponId: 1, notes: "" }, 1, {});
      assert.fail("Should have thrown");
    } catch (err) {
      assert.equal(err.statusCode || err.status, 403);
    }
  });
});
