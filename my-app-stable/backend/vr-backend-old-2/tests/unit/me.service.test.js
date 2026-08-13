const { describe, it, mock } = require("node:test");
const assert = require("node:assert");
const { pool } = require("../../src/config/database");
const meService = require("../../src/services/me.service");

function mq(r) { return mock.method(pool,"query",()=>Promise.resolve({rows:r||[]})); }

describe("getMyQrCode", () => {
  it("should return QR code UUID", async () => {
    mq([{ volunteer_qr_code: "abc-123" }]);
    const r = await meService.getMyQrCode(42);
    assert.equal(r.qr_code, "abc-123");
  });
  it("should throw 404 if user not found", async () => {
    mq([]);
    try { await meService.getMyQrCode(999); assert.fail(); }
    catch (err) { assert.equal(err.statusCode||err.status, 404); }
  });
});

describe("getMyPoints", () => {
  it("should return points balance", async () => {
    mq([{ points: 500 }], [{ id:1, points:20, description:"Event", created_at:new Date() }]);
    const r = await meService.getMyPoints(42);
    assert.equal(r.points_balance, 500);
  });
});

describe("getMyCoupons", () => {
  it("should return coupons list", async () => {
    mq([{ id:1, title:"Coffee", status:"unused", points_cost:100 }]);
    const r = await meService.getMyCoupons(42);
    assert.equal(r.data.length, 1);
  });
});
