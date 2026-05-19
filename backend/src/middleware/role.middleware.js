/**
 * Role Guard Middleware (AUTH-04)
 *
 * Restricts route access to one or more roles.
 * MUST be used after the `authenticate` middleware so that req.user exists.
 * All errors use contract-compliant shapes and codes.
 *
 * Usage:
 *   const { authorize } = require("../middleware/role.middleware");
 *   router.delete("/users/:id", authenticate, authorize("admin"), controller.deleteUser);
 *   router.post("/events", authenticate, authorize("organiser", "admin"), controller.createEvent);
 */

const { createError } = require("./errorHandler.middleware");

/**
 * Factory that returns middleware which checks if req.user.role
 * is in the list of allowed roles.
 *
 * @param  {...string} allowedRoles - e.g. "admin", "organiser"
 * @returns {Function} Express middleware
 */
function authorize(...allowedRoles) {
  return (req, _res, next) => {
    if (!req.user) {
      return next(createError(401, "unauthenticated", "Authentication required before role check."));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        createError(403, "forbidden", `Access denied. Requires one of: ${allowedRoles.join(", ")}`)
      );
    }

    next();
  };
}

/**
 * Alternative factory that returns an object with named guards.
 * Usage: const { requireVolunteer } = roleGuard(["volunteer"]);
 */
function roleGuard(roles) {
  return {
    requireVolunteer: roles.includes("volunteer") ? authorize("volunteer") : (_req, _res, next) => next(),
    requireOrganiser: roles.includes("organiser") ? authorize("organiser") : (_req, _res, next) => next(),
    requireAdmin:     roles.includes("admin")     ? authorize("admin")     : (_req, _res, next) => next(),
    requireMerchant:  roles.includes("merchant")  ? authorize("merchant")  : (_req, _res, next) => next(),
  };
}

module.exports = { authorize, roleGuard };
