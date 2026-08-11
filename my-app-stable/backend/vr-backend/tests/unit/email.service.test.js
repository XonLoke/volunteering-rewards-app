const { describe, it, mock } = require("node:test");
const assert = require("node:assert");
const { pool } = require("../../src/config/database");
const { sendEmail } = require("../../src/services/email.service");

function mq(r) { return mock.method(pool,"query",()=>Promise.resolve({rows:r||[]})); }

describe("sendEmail", () => {
  it("should be a function", () => {
    assert.equal(typeof sendEmail, "function");
  });
});
