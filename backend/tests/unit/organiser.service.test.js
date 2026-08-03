const { describe, it, mock } = require("node:test");
const assert = require("node:assert");
const { pool } = require("../../src/config/database");
const organiserService = require("../../src/services/organiser.service");

function mq(returns) { let i=0; return mock.method(pool,"query",() => i<returns.length?returns[i++]:{rows:[]}); }

describe("getDashboard", () => {
  it("should return stats, upcoming events, organisation and activity", async () => {
    mq([
      { rows: [{ total_events: 5, total_volunteers: 20, total_volunteers_checked_in: 8, upcoming_events: 3, average_rating: 4.2 }] },
      { rows: [{ id: 1, title: "Event 1", volunteers: 10 }] },
      { rows: [{ name: "Green Earth", status: "active" }] },
      { rows: [{ timestamp: new Date().toISOString(), volunteer_name: "Alice", event_title: "Event 1" }] },
    ]);
    const d = await organiserService.getDashboard(1);
    assert.equal(d.stats.total_events, 5);
    assert.equal(d.stats.total_volunteers_checked_in, 8);
    assert.equal(d.upcoming.length, 1);
    assert.equal(d.organisation.name, "Green Earth");
    assert.equal(d.recent_activity.length, 1);
  });
});

describe("getMyEvents", () => {
  it("should return paginated events", async () => {
    mq([{ rows: [{ count: 10 }] }, { rows: [{ id: 1, title: "Event" }] }]);
    const r = await organiserService.getMyEvents(1);
    assert.equal(r.total, 10);
  });
});

describe("createEvent", () => {
  it("should create and return event", async () => {
    mq([{ rows: [{ id: 1, title: "New Event" }] }]);
    const r = await organiserService.createEvent(1, { title: "New Event", description: "Test", location: "Loc", event_date: "2026-07-01", capacity: 50, points_value: 20, category: "environment" });
    assert.equal(r.title, "New Event");
  });
});

describe("deleteEvent", () => {
  it("should delete and return event id", async () => {
    const queries = [];
    const client = {
      query: (sql) => {
        queries.push(sql);
        if (sql === "BEGIN" || sql === "COMMIT" || sql === "ROLLBACK") return {};
        if (sql.includes("DELETE FROM events")) return { rows: [{ id: 1 }] };
        return { rows: [{ id: 1 }] };
      },
      release: () => {},
    };
    mock.method(pool, "connect", () => Promise.resolve(client));
    const r = await organiserService.deleteEvent(1, 1);
    assert.equal(r.id, 1);
    assert.ok(queries.includes("BEGIN"));
    assert.ok(queries.includes("COMMIT"));
  });
  it("should throw 404 if not found or not owner", async () => {
    const client = {
      query: (sql) => {
        if (sql === "BEGIN") return {};
        if (sql.includes("SELECT id FROM events")) return { rows: [] };
        if (sql === "ROLLBACK") return {};
        return {};
      },
      release: () => {},
    };
    mock.method(pool, "connect", () => Promise.resolve(client));
    try { await organiserService.deleteEvent(1, 999); assert.fail(); }
    catch (err) { assert.equal(err.statusCode || err.status, 404); }
  });
});

describe("getRoster", () => {
  it("should return volunteer list", async () => {
    mq([{ rows: [{ id: 1, name: "Alice", status: "registered" }] }]);
    const r = await organiserService.getRoster(1, 1);
    assert.equal(r.data.length, 1);
  });
});

describe("getFeedback", () => {
  it("should return feedback list with average rating and total", async () => {
    mq([
      { rows: [{ id: 1, rating: 5 }] },
      { rows: [{ average_rating: 5, total: 1 }] },
    ]);
    const r = await organiserService.getFeedback(1, 1);
    assert.equal(r.data.length, 1);
    assert.equal(r.average_rating, 5);
    assert.equal(r.total, 1);
  });
});
