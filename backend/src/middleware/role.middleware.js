/**
 * Role Guard Middleware (AUTH-04)
 *
 * Restricts route access to one or more roles.
 * MUST be used after the `authenticate` middleware so that req.user exists.
 *
 * Usage:
 *   const { authorize } = require("../middleware/role.middleware");
 *   router.delete("/users/:id", authenticate, authorize("admin"), controller.deleteUser);
 *   router.post("/events", authenticate, authorize("organizer", "admin"), controller.createEvent);
 */

const { createError } = require("./errorHandler.middleware");

/**
 * Factory that returns middleware which checks if req.user.role
 * is in the list of allowed roles.
 *
 * @param  {...string} allowedRoles - e.g. "admin", "organizer"
 * @returns {Function} Express middleware
 */
function authorize(...allowedRoles) {
  return (req, _res, next) => {
    // req.user is set by the authenticate middleware
    if (!req.user) {
      return next(createError(401, "Authentication required before role check."));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(createError(403, `Access denied. Requires one of: ${allowedRoles.join(", ")}`));
    }

    next();
  };
}

module.exports = { authorize };
