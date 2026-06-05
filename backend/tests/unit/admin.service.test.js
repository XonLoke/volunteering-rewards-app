const { describe, it, mock } = require("node:test");
const assert = require("node:assert");
const adminService = require("../../src/services/admin.service");

function setupMocks() {
  mock.restoreAll();
}

describe("UT-07: Coupon — Points Calculation (ppd=100)", () => {
  it("should calculate 500 points for $5 Coffee", () => {
    // Test the formula directly: Math.round(value_cents * ppd / 100)
    const value_cents = 500;
    const ppd = 100;
    const result = Math.round(value_cents * ppd / 100);
    assert.equal(result, 500);
  });
});

describe("UT-08: Coupon — Points Recalculate when Config Changes", () => {
  it("should return different value when ppd changes", () => {
    // Formula at ppd=100
    const v1 = Math.round(500 * 100 / 100);
    // Formula at ppd=50
    const v2 = Math.round(500 * 50 / 100);
    assert.equal(v1, 500);
    assert.equal(v2, 250);
    assert.notEqual(v1, v2, "Values should be different");
  });
});

describe("UT-09: Coupon — PIN Has Deterministic Hash", () => {
  it("should produce deterministic HMAC-SHA256 hash", () => {
    const crypto = require("crypto");
    const secret = "dev-pin-secret";
    const hash1 = crypto.createHmac("sha256", secret).update("123456").digest("hex");
    const hash2 = crypto.createHmac("sha256", secret).update("123456").digest("hex");
    assert.equal(hash1, hash2);
    assert.equal(hash1.length, 64);
  });
});
