/**
 * Auth Controller (AUTH-01 through AUTH-06)
 *
 * Thin HTTP layer — parses requests, calls the auth service, sends responses.
 * Errors are forwarded to the global error handler via next().
 */

const authService = require("../services/auth.service");

// ─── POST /api/auth/register  (AUTH-01) ─────────────────
async function register(req, res, next) {
  try {
    const result = await authService.register(req.body);
    res.status(201).json({
      message: "Registration successful.",
      user: result.user,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    });
  } catch (err) {
    next(err);
  }
}

// ─── POST /api/auth/login  (AUTH-02) ────────────────────
async function login(req, res, next) {
  try {
    const result = await authService.login(req.body);
    res.status(200).json({
      message: "Login successful.",
      user: result.user,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    });
  } catch (err) {
    next(err);
  }
}

// ─── POST /api/auth/refresh  (AUTH-05) ──────────────────
async function refresh(req, res, next) {
  try {
    const oldRefreshToken = req.body.refreshToken;
    const result = await authService.refreshTokens(oldRefreshToken);
    res.status(200).json({
      message: "Token refreshed.",
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    });
  } catch (err) {
    next(err);
  }
}

// ─── GET /api/auth/profile  (AUTH-06) ───────────────────
async function getProfile(req, res, next) {
  try {
    const user = await authService.getProfile(req.user.id);
    res.status(200).json({ user });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  register,
  login,
  refresh,
  getProfile,
};
