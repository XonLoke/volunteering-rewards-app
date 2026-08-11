const { describe, it, mock } = require("node:test");
const assert = require("node:assert");
const { pool } = require("../../src/config/database");
const { getFeedbackSummary } = require("../../src/services/feedback.service");

function mq(r) { return mock.method(pool,"query",()=>Promise.resolve({rows:r||[]})); }

describe("getFeedbackSummary", () => {
  it("should return summary object", async () => {
    mq([{ total_feedback:5, overall_sentiment:"positive" }]);
    const r = await getFeedbackSummary(1);
    assert.ok(r);
  });
});
