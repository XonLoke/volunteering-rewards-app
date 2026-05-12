/**
 * Auth Middleware (AUTH-03)
 *
 * Validates the JWT access token from the Authorization header.
 * On success, attaches `req.user = { id, role }`.
 * On failure, returns 401 with an appropriate error message.
 *
 * Usage:
 *   router.get("/profile", authenticate, controller.getProfile);
 */

const { verifyAccessToken } = require("../utils/jwt");

function authenticate(req, res, next) {
  const header = req.headers.authorization;

  if (!header) {
    return res.status(401).json({ error: true, message: "Access denied. No token provided." });
  }

  // Expect: "Bearer <token>"
  const parts = header.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") {
    return res.status(401).json({ error: true, message: "Invalid authorization format. Use: Bearer <token>" });
  }

  const token = parts[1];
  const decoded = verifyAccessToken(token);

  if (!decoded) {
    return res.status(401).json({ error: true, message: "Invalid or expired access token." });
  }

  // Attach user info to request
  req.user = { id: decoded.id, role: decoded.role };
  next();
}

module.exports = { authenticate };
