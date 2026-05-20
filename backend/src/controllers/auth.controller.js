/**
 * Auth Controller (AUTH-01 through AUTH-06)
 *
 * Thin HTTP layer - parses requests, calls the auth service, sends responses.
 * All responses now match API_CONTRACTS.md shapes exactly.
 */

const authService = require("../services/auth.service");

// POST /api/auth/register (AUTH-01)
async function register(req, res, next) {
  try {
    const result = await authService.register(req.body);
    res.status(201).json({
      user: result.user,
      token: result.token,
    });
  } catch (err) {
    next(err);
  }
}

// POST /api/auth/login (AUTH-02)
async function login(req, res, next) {
  try {
    const result = await authService.login(req.body);
    res.status(200).json({
      user: result.user,
      token: result.token,
      expires_at: result.expires_at,
    });
  } catch (err) {
    next(err);
  }
}

// POST /api/auth/refresh (AUTH-05)
async function refresh(req, res, next) {
  try {
    const result = await authService.refreshTokens(req.body.refreshToken);
    res.status(200).json({
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      expires_at: result.expires_at,
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/auth/me (AUTH-06)
async function getProfile(req, res, next) {
  try {
    const user = await authService.getProfile(req.user.id);
    res.status(200).json(user);
  } catch (err) {
    next(err);
  }
}

// PUT /api/auth/me (profile update)
async function updateProfile(req, res, next) {
  try {
    const result = await authService.updateProfile(req.user.id, req.body);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

// POST /api/auth/register/organiser (AUTH-08)
async function registerOrganiser(req, res, next) {
  try {
    const result = await authService.registerOrganiser(req.body);
    res.status(201).json({
      user: result.user,
      token: result.token,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  register,
  registerOrganiser,
  login,
  refresh,
  getProfile,
  updateProfile,
};
