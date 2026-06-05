const { describe, it, mock } = require("node:test");
const assert = require("node:assert");
const { pool } = require("../../src/config/database");
const merchantService = require("../../src/services/merchant.service");

function setupMocks() {
  mock.restoreAll();
  pool.query = mock.fn();
}

describe("UT-12: Merchant — Verify Valid PIN", () => {
  it("should return coupon details for a valid unused PIN", async () => {
    setupMocks();
    pool.query.mock.mockImplementationOnce(() => ({
      rows: [{
        user_coupon_id: 1, status: "unused", expiry_date: "2026-12-31",
        title: "Test Coffee", volunteer_name: "Alice",
      }],
    }));
    const result = await merchantService.verifyPin({ pin: "123456" });
    assert.equal(result.data.title, "Test Coffee");
  });
});

describe("UT-13: Merchant — Verify Invalid PIN", () => {
  it("should throw 404 for non-existent PIN", async () => {
    setupMocks();
    pool.query.mock.mockImplementationOnce(() => ({ rows: [] }));
    try {
      await merchantService.verifyPin({ pin: "000000" });
      assert.fail("Should have thrown");
    } catch (err) {
      assert.equal(err.statusCode || err.status, 404);
    }
  });
});
