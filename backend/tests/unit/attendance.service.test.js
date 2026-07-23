const { describe, it, mock } = require("node:test");
const assert = require("node:assert");
const { pool } = require("../../src/config/database");
const attendanceService = require("../../src/services/attendance.service");

function makeMockClient(queries = []) {
  let idx = 0;
  return {
    query: (sql) => {
      if (sql === "BEGIN" || sql === "COMMIT" || sql === "ROLLBACK") return {};
      return idx < queries.length ? queries[idx++] : { rows: [] };
    },
    release: () => {},
  };
}

function mockPoolConnect(client) {
  return mock.method(pool, "connect", () => Promise.resolve(client));
}

describe("scanQR", () => {
  it("should successfully scan QR and award points", async () => {
    const client = makeMockClient([
      { rows: [{ id: 1, title: "Beach Cleanup", points_reward: 20 }] },
      { rows: [{ id: 42 }] },
      { rows: [] },
      { rows: [{ id: 1, event_id: 1, user_id: 42, points_awarded: 20 }] },
      {},
      {},
    ]);
    mockPoolConnect(client);
    const result = await attendanceService.scanQR(1, 42);
    assert.equal(result.awardedPoints, 20);
    assert.equal(result.attendance.event_id, 1);
    assert.equal(result.attendance.points_awarded, 20);
  });

  it("should throw 404 if event doesn't exist", async () => {
    const client = makeMockClient([{ rows: [] }]);
    mockPoolConnect(client);
    try {
      await attendanceService.scanQR(999, 42);
      assert.fail("Should have thrown");
    } catch (err) {
      assert.equal(err.statusCode || err.status, 404);
    }
  });

  it("should throw 404 if user doesn't exist", async () => {
    const client = makeMockClient([
      { rows: [{ id: 1, points_reward: 20 }] },
      { rows: [] },
    ]);
    mockPoolConnect(client);
    try {
      await attendanceService.scanQR(1, 999);
      assert.fail("Should have thrown");
    } catch (err) {
      assert.equal(err.statusCode || err.status, 404);
    }
  });

  it("should throw 409 if already scanned", async () => {
    const client = makeMockClient([
      { rows: [{ id: 1, points_reward: 20 }] },
      { rows: [{ id: 42 }] },
      { rows: [{ id: 1 }] },
    ]);
    mockPoolConnect(client);
    try {
      await attendanceService.scanQR(1, 42);
      assert.fail("Should have thrown");
    } catch (err) {
      assert.equal(err.statusCode || err.status, 409);
    }
  });

  it("should use BEGIN/COMMIT transaction on success", async () => {
    const sqlCalls = [];
    const client = {
      query: (sql) => {
        sqlCalls.push(sql);
        if (sql === "BEGIN" || sql === "COMMIT" || sql === "ROLLBACK") return {};
        if (sql.includes("points_reward")) return { rows: [{ id: 1, title: "Test Event", points_reward: 10 }] };
        if (sql.includes("SELECT id FROM users")) return { rows: [{ id: 42 }] };
        if (sql.includes("SELECT 1 FROM attendance_logs")) return { rows: [] };
        if (sql.includes("INSERT INTO attendance_logs")) return { rows: [{ id: 1 }] };
        if (sql.includes("UPDATE users")) return {};
        return { rows: [] };
      },
      release: () => {},
    };
    mockPoolConnect(client);
    await attendanceService.scanQR(1, 42);
    assert.ok(sqlCalls.includes("BEGIN"));
    assert.ok(sqlCalls.includes("COMMIT"));
    assert.ok(!sqlCalls.includes("ROLLBACK"));
  });

  it("should rollback on error and release client", async () => {
    let rolledBack = false;
    let released = false;
    const client = {
      query: (sql) => {
        if (sql === "BEGIN") return {};
        if (sql === "ROLLBACK") { rolledBack = true; return {}; }
        throw new Error("db error");
      },
      release: () => { released = true; },
    };
    mockPoolConnect(client);
    try {
      await attendanceService.scanQR(1, 42);
      assert.fail("Should have thrown");
    } catch (err) {
      assert.ok(rolledBack);
      assert.ok(released);
    }
  });
});

describe("batchSync", () => {
  it("should successfully process multiple valid scans", async () => {
    // Build SQL-aware mock that matches actual query patterns
    const mockResults = {
      "BEGIN": {},
      "points_reward": { rows: [{ id: 1, points_reward: 20 }] },
      "SELECT id FROM users": { rows: [{ id: 42 }] },
      "SELECT 1 FROM attendance_logs": { rows: [] },
      "INSERT INTO attendance_logs": { rows: [{ id: 1, event_id: 1, user_id: 42, points_awarded: 20 }] },
      "UPDATE users": {},
      "COMMIT": {},
    };
    // For second scan, return different points
    let scanCount = 0;
    const client = {
      query: (sql) => {
        if (sql === "BEGIN" || sql === "COMMIT" || sql === "ROLLBACK") return {};
        if (sql.includes("points_reward")) {
          scanCount++;
          return { rows: [{ id: scanCount, points_reward: scanCount === 1 ? 20 : 15 }] };
        }
        if (sql.includes("SELECT id FROM users")) return { rows: [{ id: 42 }] };
        if (sql.includes("SELECT 1 FROM attendance_logs")) return { rows: [] };
        if (sql.includes("INSERT INTO attendance_logs")) return { rows: [{ id: scanCount, event_id: scanCount, user_id: 42, points_awarded: scanCount === 1 ? 20 : 15 }] };
        if (sql.includes("UPDATE users")) return {};
        return { rows: [] };
      },
      release: () => {},
    };
    mockPoolConnect(client);
    const result = await attendanceService.batchSync([
      { eventId: 1, volunteerId: 42 },
      { eventId: 2, volunteerId: 43 },
    ]);
    assert.equal(result.success.length, 2);
    assert.equal(result.skipped.length, 0);
    assert.equal(result.errors.length, 0);
  });

  it("should return skipped for already-scanned volunteers", async () => {
    const client = {
      query: (sql) => {
        if (sql === "BEGIN" || sql === "COMMIT" || sql === "ROLLBACK") return {};
        if (sql.includes("points_reward")) return { rows: [{ id: 1, points_reward: 20 }] };
        if (sql.includes("SELECT id FROM users")) return { rows: [{ id: 42 }] };
        if (sql.includes("SELECT 1 FROM attendance_logs")) return { rows: [{ id: 1 }] }; // exists=duplicate
        return { rows: [] };
      },
      release: () => {},
    };
    mockPoolConnect(client);
    const result = await attendanceService.batchSync([{ eventId: 1, volunteerId: 42 }]);
    assert.equal(result.skipped.length, 1);
    assert.equal(result.skipped[0].reason, "already_scanned");
  });

  it("should return errors for scans with missing fields", async () => {
    const client = makeMockClient([]);
    mockPoolConnect(client);
    const result = await attendanceService.batchSync([
      { eventId: null, volunteerId: 42 },
      { eventId: 1, volunteerId: null },
      {},
    ]);
    assert.equal(result.errors.length, 3);
  });

  it("should throw 400 if scans is not an array", async () => {
    try {
      await attendanceService.batchSync(null);
      assert.fail("Should have thrown");
    } catch (err) {
      assert.equal(err.statusCode || err.status, 400);
    }
  });
});
