/**
 * Auth Routes - Workflow A (AUTH-01 through AUTH-06)
 *
 * Endpoints:
 *   POST   /api/auth/register            Create a new user account
 *   POST   /api/auth/login               Authenticate and receive tokens
 *   POST   /api/auth/refresh             Rotate refresh token
 *   GET    /api/auth/me                  Get current user's profile (authenticated)
 *   PUT    /api/auth/me                  Update current user's profile (authenticated)
 *
 * Mounted at: /api/auth (see index.js)
 */

const { Router } = require("express");
const router = Router();

const controller   = require("../controllers/auth.controller");
const { authenticate } = require("../middleware/auth.middleware");
const { authStrict, authRegister } = require("../middleware/rateLimiter.middleware");

// AUTH-01: Register (with strict rate limiter)
router.post("/register", authRegister, controller.register);

// AUTH-02: Login (with strict rate limiter)
router.post("/login", authStrict, controller.login);

// AUTH-05: Refresh Token
router.post("/refresh", controller.refresh);

// AUTH-06: Get Profile / Update Profile
router.get("/me", authenticate, controller.getProfile);
router.put("/me", authenticate, controller.updateProfile);

// Legacy alias (remove after mobile app is updated)
router.get("/profile", authenticate, controller.getProfile);

module.exports = router;
