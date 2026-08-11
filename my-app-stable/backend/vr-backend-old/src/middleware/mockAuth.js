// For school/demo only. Later replace with real JWT auth.
export function mockAuth(req, res, next) {
  req.user = {
    id: Number(req.headers["x-user-id"] || 1),
    role: req.headers["x-role"] || "organiser",
  };
  next();
}
