//-------------------------------------------------------------------------
// TEST: Auth Service — register, login, refreshTokens
// Purpose: Verify auth business logic in isolation (mock database)
// Run:     node --test tests/unit/auth.service.test.js
//-------------------------------------------------------------------------
const { describe, it, mock } = require("node:test");
const assert = require("node:assert");

//-------------------------------------------------------------------------
// SECTION: Mock Database Pool
// Purpose: Replace real DB with controlled responses for each test case.
//-------------------------------------------------------------------------
const mockPool = {
  query: mock.fn(),
};
mock.method(require("path").resolve(__dirname, "../../src/config/database"), "pool", mockPool);

// Mock JWT utility
mock.method(require("path").resolve(__dirname, "../../src/utils/jwt"), "generateAccessToken", () => "mock-access-token");
mock.method(require("path").resolve(__dirname, "../../src/utils/jwt"), "generateRefreshToken", () => "mock-refresh-token");
mock.method(require("path").resolve(__dirname, "../../src/utils/jwt"), "verifyRefreshToken", (token) => {
  if (token === "valid-refresh-token") return { id: 1, iat: Date.now(), exp: Date.now() + 86400000 };
  return null;
});

const authService = require("../../src/services/auth.service");

//-------------------------------------------------------------------------
// SECTION: UT-01 — Register Success
//-------------------------------------------------------------------------
describe("UT-01: Register — Success", () => {
  it("should create a user and return user object + token", async () => {
    mockPool.query.mock.resetCalls();

    // Mock role lookup
    mockPool.query.mock.mockImplementationOnce(() => ({
      rows: [{ id: 2, role_name: "volunteer" }],
    }));
    // Mock email existence check
    mockPool.query.mock.mockImplementationOnce(() => ({
      rows: [],
    }));
    // Mock INSERT user
    mockPool.query.mock.mockImplementationOnce(() => ({
      rows: [{ id: 99, name: "Test User", email: "test@test.com", role_id: 2, points: 0, volunteer_qr_code: "uuid-here" }],
    }));
    // Mock role name lookup
    mockPool.query.mock.mockImplementationOnce(() => ({
      rows: [{ role_name: "volunteer" }],
    }));
    // Mock refresh token update
    mockPool.query.mock.mockImplementationOnce(() => ({
      rows: [],
    }));

    const result = await authService.register({
      name: "Test User",
      email: "test@test.com",
      password: "Password1",
      password_confirm: "Password1",
    });

    assert.ok(result.user, "Should return user object");
    assert.equal(result.user.name, "Test User");
    assert.ok(result.token, "Should return token string");
  });
});

//-------------------------------------------------------------------------
// SECTION: UT-02 — Register Duplicate Email
//-------------------------------------------------------------------------
describe("UT-02: Register — Duplicate Email", () => {
  it("should throw 409 when email already exists", async () => {
    mockPool.query.mock.resetCalls();

    // Mock role lookup
    mockPool.query.mock.mockImplementationOnce(() => ({
      rows: [{ id: 2 }],
    }));
    // Mock email existence check — email already in use
    mockPool.query.mock.mockImplementationOnce(() => ({
      rows: [{ id: 1 }],
    }));

    try {
      await authService.register({
        name: "Test User",
        email: "alice@test.com",
        password: "Password1",
        password_confirm: "Password1",
      });
      assert.fail("Should have thrown an error");
    } catch (err) {
      assert.equal(err.statusCode || err.status, 409);
    }
  });
});

//-------------------------------------------------------------------------
// SECTION: UT-03 — Login Success
//-------------------------------------------------------------------------
describe("UT-03: Login — Success", () => {
  it("should return user + tokens for valid credentials", async () => {
    mockPool.query.mock.resetCalls();

    const hashedPassword = require("bcrypt").hashSync("password123", 12);

    // Mock user lookup
    mockPool.query.mock.mockImplementationOnce(() => ({
      rows: [{ id: 1, name: "Carol", email: "carol@test.com", password_hash: hashedPassword, role_id: 1, points: 0 }],
    }));
    // Mock role name lookup
    mockPool.query.mock.mockImplementationOnce(() => ({
      rows: [{ role_name: "admin" }],
    }));
    // Mock refresh token update
    mockPool.query.mock.mockImplementationOnce(() => ({
      rows: [],
    }));

    const result = await authService.login({
      email: "carol@test.com",
      password: "password123",
    });

    assert.ok(result.user, "Should return user");
    assert.equal(result.user.role, "admin");
    assert.ok(result.token, "Should return access token");
    assert.ok(result.refresh_token, "Should return refresh token");
  });
});

//-------------------------------------------------------------------------
// SECTION: UT-04 — Login Wrong Password
//-------------------------------------------------------------------------
describe("UT-04: Login — Wrong Password", () => {
  it("should throw 401 for invalid password", async () => {
    mockPool.query.mock.resetCalls();

    const hashedPassword = require("bcrypt").hashSync("password123", 12);

    mockPool.query.mock.mockImplementationOnce(() => ({
      rows: [{ id: 1, email: "carol@test.com", password_hash: hashedPassword, role_id: 1 }],
    }));

    try {
      await authService.login({ email: "carol@test.com", password: "WRONG" });
      assert.fail("Should have thrown");
    } catch (err) {
      assert.equal(err.statusCode || err.status, 401);
    }
  });
});

//-------------------------------------------------------------------------
// SECTION: UT-05 — Token Refresh Success
//-------------------------------------------------------------------------
describe("UT-05: Token Refresh — Success", () => {
  it("should rotate tokens for valid refresh token", async () => {
    mockPool.query.mock.resetCalls();

    // Mock user lookup with matching refresh token
    mockPool.query.mock.mockImplementationOnce(() => ({
      rows: [{ id: 1, refresh_token: "valid-refresh-token" }],
    }));
    // Mock role lookup
    mockPool.query.mock.mockImplementationOnce(() => ({
      rows: [{ role_name: "admin" }],
    }));
    // Mock refresh token update
    mockPool.query.mock.mockImplementationOnce(() => ({
      rows: [],
    }));

    const result = await authService.refreshTokens("valid-refresh-token");

    assert.ok(result.accessToken, "Should return new access token");
    assert.ok(result.refreshToken, "Should return new refresh token");
  });
});

//-------------------------------------------------------------------------
// SECTION: UT-06 — Token Refresh Invalid
//-------------------------------------------------------------------------
describe("UT-06: Token Refresh — Invalid Token", () => {
  it("should throw 401 for invalid refresh token", async () => {
    try {
      await authService.refreshTokens("invalid-token");
      assert.fail("Should have thrown");
    } catch (err) {
      assert.equal(err.statusCode || err.status, 401);
    }
  });
});
