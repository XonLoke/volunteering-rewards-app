const { describe, it, mock } = require("node:test");
const assert = require("node:assert");
const { pool } = require("../../src/config/database");
const referralService = require("../../src/services/referral.service");

function mockPoolQuery(returnValues) {
  let idx = 0;
  return mock.method(pool, "query", () => {
    return idx < returnValues.length ? returnValues[idx++] : { rows: [] };
  });
}

describe("getConfig", () => {
  it("should return config from database", async () => {
    mockPoolQuery([
      { rows: [{ direct_sponsor_points: 10, helped_sponsor_points: 4, upline_helper_points: 6, max_depth: 2 }] },
    ]);
    const cfg = await referralService.getConfig();
    assert.equal(cfg.direct_sponsor_points, 10);
  });

  it("should return defaults when no config row exists", async () => {
    mockPoolQuery([{ rows: [] }]);
    const cfg = await referralService.getConfig();
    assert.equal(cfg.direct_sponsor_points, 10);
    assert.equal(cfg.helped_sponsor_points, 4);
  });
});

describe("linkSponsorship", () => {
  it("should link upline sponsors on registration", async () => {
    const mockFn = mockPoolQuery([
      { rows: [{ id: 2, name: "Alice", email: "alice@test.com" }] },
      { rows: [{ id: 1, name: "Carol", email: "carol@test.com" }] },
      { rows: [{ direct_sponsor_points: 10, helped_sponsor_points: 4, upline_helper_points: 6, max_depth: 2 }] },
    ]);

    const result = await referralService.linkSponsorship(3, "alice@test.com", "carol@test.com");

    assert.equal(result.upline2Id, 2);
    assert.equal(result.upline1Id, 1);
    assert.equal(mockFn.mock.calls.length, 6); // 2 lookups + update + config + 2 inserts
  });

  it("should handle missing upline emails gracefully", async () => {
    const mockFn = mockPoolQuery([
      { rows: [] },
      { rows: [] },
      { rows: [{ direct_sponsor_points: 10, helped_sponsor_points: 4, upline_helper_points: 6, max_depth: 2 }] },
    ]);

    const result = await referralService.linkSponsorship(3, "nonexistent@test.com", "");

    assert.equal(result.upline2Id, null);
    assert.equal(result.upline1Id, null);
  });
});

describe("getMySponsorshipProfile", () => {
  it("should return full sponsorship profile", async () => {
    mockPoolQuery([
      { rows: [{ id: 1, name: "Alice", email: "alice@test.com", upline_1_email: "carol@test.com", upline_2_email: "bob@test.com", points: 500 }] },
      { rows: [{ id: 10, name: "Eve", email: "eve@test.com" }] },
      { rows: [] },
      { rows: [{ total: 50 }] },
    ]);

    const profile = await referralService.getMySponsorshipProfile(1);

    assert.equal(profile.email, "alice@test.com");
    assert.equal(profile.upline_1_email, "carol@test.com");
    assert.equal(profile.upline_2_email, "bob@test.com");
    assert.equal(profile.downline_1st_level_count, 1);
    assert.equal(profile.downline_2nd_level_count, 0);
    assert.equal(profile.total_sponsorship_points, 50);
  });

  it("should throw 404 if user not found", async () => {
    mockPoolQuery([{ rows: [] }]);
    try {
      await referralService.getMySponsorshipProfile(999);
      assert.fail("Should have thrown");
    } catch (err) {
      assert.equal(err.statusCode || err.status, 404);
    }
  });
});
