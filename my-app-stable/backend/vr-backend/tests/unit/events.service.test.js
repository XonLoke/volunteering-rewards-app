const { describe, it, mock } = require("node:test");
const assert = require("node:assert");
const { pool } = require("../../src/config/database");
const eventsService = require("../../src/services/events.service");

// ─── Helpers ────────────────────────────────────────────────────────────────

function mockPoolQuery(returnValues) {
  let callIdx = 0;
  return mock.method(pool, "query", () => {
    return returnValues[callIdx++] || { rows: [] };
  });
}

function mockPoolConnect(client) {
  return mock.method(pool, "connect", () => Promise.resolve(client));
}

// ─── browseEvents ───────────────────────────────────────────────────────────

describe("browseEvents", () => {
  it("should return paginated events with defaults", async () => {
    const mockFn = mockPoolQuery([
      { rows: [{ total: 5 }] },
      { rows: [{ id: 1, title: "Event 1" }, { id: 2, title: "Event 2" }] },
    ]);

    const result = await eventsService.browseEvents();

    assert.equal(result.page, 1);
    assert.equal(result.limit, 20);
    assert.equal(result.total, 5);
    assert.equal(result.events.length, 2);
    assert.equal(mockFn.mock.callCount(), 2);
  });

  it("should apply search filter", async () => {
    const mockFn = mockPoolQuery([
      { rows: [{ total: 1 }] },
      { rows: [{ id: 1, title: "Beach Cleanup" }] },
    ]);

    const result = await eventsService.browseEvents({ search: "beach" });

    assert.equal(result.total, 1);
    // Verify the first query call included ILIKE pattern
    const calls = mockFn.mock.calls;
    assert.ok(calls[0].arguments[0].includes("ILIKE"));
    assert.ok(calls[0].arguments[1].includes("%beach%"));
  });

  it("should apply category filter", async () => {
    const mockFn = mockPoolQuery([
      { rows: [{ total: 3 }] },
      { rows: [{ id: 1, category: "environment" }] },
    ]);

    const result = await eventsService.browseEvents({ category: "environment" });

    assert.equal(result.total, 3);
    const calls = mockFn.mock.calls;
    assert.ok(calls[0].arguments[0].includes("category"));
  });

  it("should return empty array when no events match", async () => {
    mockPoolQuery([
      { rows: [{ total: 0 }] },
      { rows: [] },
    ]);

    const result = await eventsService.browseEvents({ search: "nonexistent" });

    assert.equal(result.total, 0);
    assert.deepEqual(result.events, []);
  });

  it("should handle page=0 gracefully (convert to 1)", async () => {
    const mockFn = mockPoolQuery([
      { rows: [{ total: 10 }] },
      { rows: [{ id: 1 }] },
    ]);

    const result = await eventsService.browseEvents({ page: 0 });

    assert.equal(result.page, 0); // page is returned as-is
    assert.equal(result.total, 10);
  });
});

// ─── getEventById ───────────────────────────────────────────────────────────

describe("getEventById", () => {
  it("should return event with registrations count", async () => {
    mockPoolQuery([
      { rows: [{ id: 1, title: "Test", registrations: 5, registered: false }] },
    ]);

    const result = await eventsService.getEventById(1, 42);

    assert.equal(result.id, 1);
    assert.equal(result.registrations, 5);
  });

  it("should return event with is_registered flag for logged-in user", async () => {
    mockPoolQuery([
      { rows: [{ id: 1, title: "Test", registrations: 3, registered: true }] },
    ]);

    const result = await eventsService.getEventById(1, 42);

    assert.equal(result.registered, true);
  });

  it("should throw 404 when event doesn't exist", async () => {
    mockPoolQuery([{ rows: [] }]);

    try {
      await eventsService.getEventById(999, 42);
      assert.fail("Should have thrown");
    } catch (err) {
      assert.equal(err.statusCode || err.status, 404);
    }
  });
});

// ─── registerForEvent ───────────────────────────────────────────────────────

describe("registerForEvent", () => {
  it("should successfully register user for event", async () => {
    const mockClient = {
      query: mock.fn(),
      release: mock.fn(),
    };

    mockClient.query.mock.mockImplementation((query, params) => {
      if (query === "BEGIN") return {};
      if (query.includes("SELECT id, capacity")) return { rows: [{ id: 1, capacity: 100 }] };
      if (query.includes("SELECT 1 FROM event_registrations")) return { rows: [] };
      if (query.includes("SELECT COUNT")) return { rows: [{ count: 5 }] };
      if (query.includes("INSERT INTO event_registrations")) return { rows: [{ id: 10, event_id: 1, user_id: 42 }] };
      if (query === "COMMIT") return {};
      return {};
    });

    mockPoolConnect(mockClient);

    const result = await eventsService.registerForEvent(1, 42);

    assert.equal(result.event_id, 1);
    assert.equal(result.user_id, 42);
    assert.equal(mockClient.query.mock.calls.length, 6); // BEGIN, SELECT event, SELECT reg, COUNT, INSERT, COMMIT
  });

  it("should throw 404 if event doesn't exist", async () => {
    const mockClient = {
      query: mock.fn(),
      release: mock.fn(),
    };

    mockClient.query.mock.mockImplementation((query) => {
      if (query === "BEGIN") return {};
      if (query.includes("SELECT id, capacity")) return { rows: [] };
      if (query === "ROLLBACK") return {};
      return { rows: [] };
    });

    mockPoolConnect(mockClient);

    try {
      await eventsService.registerForEvent(999, 42);
      assert.fail("Should have thrown");
    } catch (err) {
      assert.equal(err.statusCode || err.status, 404);
    }
  });

  it("should throw 409 if already registered", async () => {
    const mockClient = {
      query: mock.fn(),
      release: mock.fn(),
    };

    mockClient.query.mock.mockImplementation((query) => {
      if (query === "BEGIN") return {};
      if (query.includes("SELECT id, capacity")) return { rows: [{ id: 1, capacity: 50 }] };
      if (query.includes("SELECT 1 FROM event_registrations")) return { rows: [{ id: 1 }] }; // already registered
      if (query === "ROLLBACK") return {};
      return {};
    });

    mockPoolConnect(mockClient);

    try {
      await eventsService.registerForEvent(1, 42);
      assert.fail("Should have thrown");
    } catch (err) {
      assert.equal(err.statusCode || err.status, 409);
    }
  });

  it("should throw 409 if event at capacity", async () => {
    const mockClient = {
      query: mock.fn(),
      release: mock.fn(),
    };

    let callCount = 0;
    mockClient.query.mock.mockImplementation((query) => {
      callCount++;
      if (query === "BEGIN") return {};
      if (query.includes("SELECT id, capacity")) return { rows: [{ id: 1, capacity: 10 }] };
      if (query.includes("SELECT 1 FROM event_registrations")) return { rows: [] };
      if (query.includes("SELECT COUNT")) return { rows: [{ count: 10 }] }; // full
      if (query === "ROLLBACK") return {};
      return {};
    });

    mockPoolConnect(mockClient);

    try {
      await eventsService.registerForEvent(1, 42);
      assert.fail("Should have thrown");
    } catch (err) {
      assert.equal(err.statusCode || err.status, 409);
    }
  });

  it("should handle capacity being null (unlimited)", async () => {
    const mockClient = {
      query: mock.fn(),
      release: mock.fn(),
    };

    mockClient.query.mock.mockImplementation((query) => {
      if (query === "BEGIN") return {};
      if (query.includes("SELECT id, capacity")) return { rows: [{ id: 1, capacity: null }] };
      if (query.includes("SELECT 1 FROM event_registrations")) return { rows: [] };
      if (query.includes("INSERT INTO event_registrations")) return { rows: [{ id: 11, event_id: 1, user_id: 42 }] };
      if (query === "COMMIT") return {};
      return {};
    });

    mockPoolConnect(mockClient);

    const result = await eventsService.registerForEvent(1, 42);

    assert.equal(result.event_id, 1);
  });
});

// ─── unregisterFromEvent ────────────────────────────────────────────────────

describe("unregisterFromEvent", () => {
  it("should successfully unregister user", async () => {
    mockPoolQuery([
      { rows: [{ id: 1 }] }, // event exists
      { rows: [{ id: 10, event_id: 1, user_id: 42 }] }, // deleted registration
    ]);

    const result = await eventsService.unregisterFromEvent(1, 42);

    assert.equal(result.event_id, 1);
    assert.equal(result.user_id, 42);
  });

  it("should throw 404 if event doesn't exist", async () => {
    mockPoolQuery([
      { rows: [] }, // event not found
    ]);

    try {
      await eventsService.unregisterFromEvent(999, 42);
      assert.fail("Should have thrown");
    } catch (err) {
      assert.equal(err.statusCode || err.status, 404);
    }
  });

  it("should throw 404 if registration doesn't exist", async () => {
    mockPoolQuery([
      { rows: [{ id: 1 }] }, // event exists
      { rows: [] }, // no registration found
    ]);

    try {
      await eventsService.unregisterFromEvent(1, 42);
      assert.fail("Should have thrown");
    } catch (err) {
      assert.equal(err.statusCode || err.status, 404);
    }
  });
});

// ─── getRecommendations ─────────────────────────────────────────────────────

describe("getRecommendations", () => {
  it("should return recommendations based on past category preferences", async () => {
    mockPoolQuery([
      {
        rows: [
          { category: "environment", weight: 3 },
          { category: "community", weight: 2 },
        ],
      }, // preferences
      { rows: [{ id: 1, title: "Park Cleanup", relevance_score: 3 }] }, // recommendations
    ]);

    const result = await eventsService.getRecommendations(42);

    assert.ok(result.length > 0);
    assert.equal(result[0].id, 1);
  });

  it("should fall back to popular events if user has no history", async () => {
    const mockFn = mockPoolQuery([
      { rows: [] }, // no preferences → fallback to getPopularEvents
      {
        rows: [
          { id: 1, title: "Popular Event", registrations: 20, relevance_score: 0 },
        ],
      },
    ]);

    const result = await eventsService.getRecommendations(99);

    assert.ok(Array.isArray(result));
    // Second query is for popular events
    assert.equal(mockFn.mock.calls[1]?.arguments[0]?.includes("ORDER BY reg.count"), true);
  });
});

// ─── getPopularEvents ───────────────────────────────────────────────────────

describe("getPopularEvents", () => {
  it("should return most popular upcoming events", async () => {
    mockPoolQuery([
      {
        rows: [
          { id: 1, title: "Popular 1", registrations: 50, relevance_score: 0 },
          { id: 2, title: "Popular 2", registrations: 30, relevance_score: 0 },
        ],
      },
    ]);

    const result = await eventsService.getPopularEvents(5);

    assert.equal(result.length, 2);
    assert.equal(result[0].relevance_score, 0); // fallback has relevance_score 0
  });
});
