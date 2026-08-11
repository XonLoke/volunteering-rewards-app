const { describe, it, mock } = require("node:test");
const assert = require("node:assert");
const { pool } = require("../../src/config/database");
const { getSponsorshipConfig, updateSponsorshipConfig } = require("../../src/services/sponsorshipConfig.service");

function mq(r) { return mock.method(pool,"query",()=>Promise.resolve({rows:r||[]})); }

describe("getSponsorshipConfig", () => {
  it("should return config", async () => {
    mq([{ direct_sponsor_points:10, helped_sponsor_points:4, upline_helper_points:6 }]);
    const r = await getSponsorshipConfig();
    assert.equal(r.direct_sponsor_points, 10);
  });
});

describe("updateSponsorshipConfig", () => {
  it("should upsert and return success message", async () => {
    mq([{ id:1, updated_at: new Date().toISOString() }]);
    const r = await updateSponsorshipConfig({ direct_sponsor_points:20, helped_sponsor_points:4, upline_helper_points:6 }, 1);
    assert.ok(r.message);
    assert.ok(r.updated_at);
  });
});
