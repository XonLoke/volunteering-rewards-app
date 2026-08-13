const { describe, it, mock } = require("node:test");
const assert = require("node:assert");
const { pool } = require("../../src/config/database");
const { topByPoints, topByEvents, topByCheckins, topByRedeemed, getFullLeaderboard } = require("../../src/services/leaderboard.service");

function mq(r) { return mock.method(pool,"query",()=>Promise.resolve({rows:r||[]})); }

describe("topByPoints", () => {
  it("should return top volunteers by points", async () => {
    mq([{ id:1, name:"Alice", points:500, rank:1 }, { id:2, name:"Bob", points:300, rank:2 }]);
    const r = await topByPoints(3);
    assert.equal(r.length, 2);
    assert.equal(r[0].rank, 1);
  });
});

describe("getFullLeaderboard", () => {
  it("should return all 4 categories", async () => {
    mq([{ id:1, name:"Alice", points:500, rank:1 }]);
    mq([{ id:1, total_events:10, rank:1 }]);
    mq([{ id:1, total_checkins:8, rank:1 }]);
    mq([{ id:1, total_redeemed:5, rank:1 }]);
    const r = await getFullLeaderboard();
    assert.ok(r.most_points);
    assert.ok(r.most_events);
    assert.ok(r.most_checkins);
    assert.ok(r.most_redeemed);
  });
});
