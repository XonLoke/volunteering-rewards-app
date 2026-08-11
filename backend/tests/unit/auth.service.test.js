// Test secrets — required since 5 Aug: jwt/rewards fail-fast in production,
// and unit tests may inherit NODE_ENV=production from the shell.
process.env.JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || "test-access-secret";
process.env.JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "test-refresh-secret";
process.env.PIN_SECRET = process.env.PIN_SECRET || "test-pin-secret";

const { describe, it, mock } = require("node:test");
const assert = require("node:assert");
const bcrypt = require("bcrypt");
const { pool } = require("../../src/config/database");
const jwtUtil = require("../../src/utils/jwt");

// Mock bcrypt at load time so native binary never loads
mock.method(bcrypt, "hashSync", () => "$2b$12$mock");
mock.method(bcrypt, "compare", async (pw, hash) => pw === "password123");

const authService = require("../../src/services/auth.service");

function q(rows) { return { rows }; }

// Helper: replace pool.query with a call-counter-based mock
function mockPoolWith(returnValues) {
  let callIdx = 0;
  const len = returnValues.length;
  pool.query = function mockQuery() {
    if (callIdx >= len) return q([]); // fallback
    return returnValues[callIdx++];
  };
}

describe("UT-01: Register — Success", () => {
  it("should create user and return user + token", async () => {
    mock.restoreAll();
    mock.method(bcrypt, "hashSync", () => "$2b$12$mock");
    mock.method(bcrypt, "compare", async () => true);
    mock.method(jwtUtil, "generateAccessToken", () => "mock-token");
    mock.method(jwtUtil, "generateRefreshToken", () => "mock-refresh");

    // register without phone: 6 queries
    mockPoolWith([
      q([]),                                                    // #1 email check
      q([]),                                                    // #2 merchant check
      q([{ id: 2 }]),                                           // #3 getRoleId
      q([{ id: 99, name: "Test User", email: "test@test.com", role_id: 2, points: 0, volunteer_qr_code: "uuid", created_at: new Date() }]), // #4 INSERT
      q([{ role_name: "volunteer" }]),                          // #5 getRoleName
      q([]),                                                    // #6 UPDATE refresh
    ]);

    const r = await authService.register({
      name: "Test User", email: "test@test.com", password: "Password1", password_confirm: "Password1",
    });
    assert.ok(r.user);
    assert.equal(r.user.name, "Test User");
    assert.ok(r.token);
  });
});

describe("UT-02: Register — Duplicate Email", () => {
  it("should throw 409", async () => {
    mock.restoreAll();
    mock.method(bcrypt, "hashSync", () => "$2b$12$mock");
    mockPoolWith([q([{ id: 1 }])]); // email check returns existing -> throws

    try {
      await authService.register({
        name: "Test", email: "alice@test.com", password: "Password1", password_confirm: "Password1",
      });
      assert.fail("Should throw");
    } catch (err) {
      assert.equal(err.statusCode || err.status, 409);
    }
  });
});

describe("UT-03: Login — Success", () => {
  it("should return user + tokens", async () => {
    mock.restoreAll();
    mock.method(bcrypt, "compare", async (pw, hash) => pw === "password123");
    mock.method(jwtUtil, "generateAccessToken", () => "mock-token");
    mock.method(jwtUtil, "generateRefreshToken", () => "mock-refresh");

    mockPoolWith([
      q([{ id: 1, name: "Carol", email: "carol@test.com", password_hash: "mock", status: "active", role_id: 1, points: 0, role_name: "admin" }]),
      q([]),
    ]);

    const r = await authService.login({ email: "carol@test.com", password: "password123" });
    assert.equal(r.user.role, "admin");
    assert.ok(r.token);
    assert.ok(r.refresh_token);
  });
});

describe("UT-04: Login — Wrong Password", () => {
  it("should throw 401", async () => {
    mock.restoreAll();
    mock.method(bcrypt, "compare", async () => false);

    mockPoolWith([
      q([{ id: 1, email: "carol@test.com", password_hash: "mock", status: "active" }]),
    ]);

    try {
      await authService.login({ email: "carol@test.com", password: "WRONG" });
      assert.fail("Should throw");
    } catch (err) {
      assert.equal(err.statusCode || err.status, 401);
    }
  });
});

describe("UT-05: Token Refresh — Success", () => {
  it("should rotate tokens", async () => {
    mock.restoreAll();
    mock.method(jwtUtil, "verifyRefreshToken", (t) => t === "valid" ? { id: 1 } : null);
    mock.method(jwtUtil, "generateAccessToken", () => "new-token");
    mock.method(jwtUtil, "generateRefreshToken", () => "new-refresh");

    mockPoolWith([
      q([{ id: 1, refresh_token: "valid" }]),
      q([{ role_name: "admin" }]),
      q([]),
    ]);

    const r = await authService.refreshTokens("valid");
    assert.ok(r.accessToken);
    assert.ok(r.refreshToken);
  });
});

describe("UT-06: Token Refresh — Invalid Token", () => {
  it("should throw 401", async () => {
    mock.restoreAll();
    mock.method(jwtUtil, "verifyRefreshToken", () => null);

    try {
      await authService.refreshTokens("bad-token");
      assert.fail("Should throw");
    } catch (err) {
      assert.equal(err.statusCode || err.status, 401);
    }
  });
});

describe("UT-07: Forgot Password — Reset Link URL Construction", () => {
  const emailService = require("../../src/services/email.service");

  // forgotPassword destructures sendEmail at require time, so mock the
  // module property and re-require auth.service (same idiom as the
  // load-time bcrypt mock above).
  async function captureResetLink(redirectUrl) {
    mock.restoreAll();
    let captured = null;
    mock.method(emailService, "sendEmail", async (opts) => { captured = opts; });
    delete require.cache[require.resolve("../../src/services/auth.service")];
    const freshAuth = require("../../src/services/auth.service");
    mockPoolWith([
      q([{ id: 1, name: "Alice", email: "alice@test.com" }]), // user found
      q([]),                                                  // UPDATE reset token
    ]);
    await freshAuth.forgotPassword("alice@test.com", redirectUrl);
    assert.ok(captured, "sendEmail should have been called");
    return captured.html;
  }

  it("appends /reset-password when no redirect_url (PWA fallback)", async () => {
    delete process.env.FRONTEND_URL;
    const html = await captureResetLink(undefined);
    assert.match(html, /https:\/\/volunteering-rewards-app\.vercel\.app\/reset-password\?token=/);
  });

  it("appends /reset-password to FRONTEND_URL origin when no redirect_url", async () => {
    process.env.FRONTEND_URL = "https://custom-frontend.example.com";
    try {
      const html = await captureResetLink(undefined);
      assert.match(html, /https:\/\/custom-frontend\.example\.com\/reset-password\?token=/);
    } finally {
      delete process.env.FRONTEND_URL;
    }
  });

  it("keeps web portal path — no double /reset-password", async () => {
    const html = await captureResetLink("https://webportals-lovat.vercel.app/admin/reset-password");
    assert.match(html, /https:\/\/webportals-lovat\.vercel\.app\/admin\/reset-password\?token=/);
    assert.ok(!html.includes("/admin/reset-password/reset-password"));
  });

  it("keeps mobile full path — no double /reset-password", async () => {
    const html = await captureResetLink("https://volunteering-rewards-app.vercel.app/reset-password");
    assert.match(html, /https:\/\/volunteering-rewards-app\.vercel\.app\/reset-password\?token=/);
  });

  it("falls back to default origin + path when redirect_url origin is blocked", async () => {
    delete process.env.FRONTEND_URL;
    const html = await captureResetLink("https://evil.example.com/login");
    assert.match(html, /https:\/\/volunteering-rewards-app\.vercel\.app\/reset-password\?token=/);
    assert.ok(!html.includes("evil.example.com"));
  });
});
