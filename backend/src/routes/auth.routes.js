/**
 * Auth Routes - Workflow A (AUTH-01 through AUTH-11)
 *
 * Endpoints:
 *   POST   /api/auth/register              Create a new user account
 *   POST   /api/auth/register/organiser    Register as an event organiser
 *   POST   /api/auth/login                 Authenticate and receive tokens
 *   POST   /api/auth/refresh               Rotate refresh token
 *   GET    /api/auth/verify-email          Verify email address (?token=xxx)
 *   POST   /api/auth/forgot-password       Send password reset email
 *   POST   /api/auth/reset-password        Reset password with token
 *   GET    /api/auth/me                    Get current user's profile (authenticated)
 *   PUT    /api/auth/me                    Update current user's profile (authenticated)
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

// AUTH-08: Register Organiser (with strict rate limiter)
router.post("/register/organiser", authRegister, controller.registerOrganiser);

// AUTH-02: Login (with strict rate limiter)
router.post("/login", authStrict, controller.login);

// AUTH-05: Refresh Token
router.post("/refresh", controller.refresh);

// AUTH-09: Verify Email
router.get("/verify-email", controller.verifyEmail);

// AUTH-10: Forgot Password
router.post("/forgot-password", authStrict, controller.forgotPassword);

// AUTH-11: Reset Password
router.post("/reset-password", controller.resetPassword);

// AUTH-06: Get Profile / Update Profile
router.get("/me", authenticate, controller.getProfile);
router.put("/me", authenticate, controller.updateProfile);

// Legacy alias (remove after mobile app is updated)
router.get("/profile", authenticate, controller.getProfile);

module.exports = router;
