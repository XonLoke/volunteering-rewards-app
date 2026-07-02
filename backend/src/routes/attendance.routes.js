/**
 * Attendance Routes — Organiser Scanning App
 *
 * Endpoints:
 *   POST  /api/attendance/scan                  — QR scan check-in
 *   POST  /api/attendance/batch                 — Batch sync offline scans
 *   GET   /api/attendance/volunteer/:id/latest  — Poll for latest attendance (volunteer)
 *
 * Mounted at: /api/attendance (see index.js)
 */

const { Router } = require("express");
const router = Router();
const controller = require("../controllers/attendance.controller");
const { authenticate } = require("../middleware/auth.middleware");
const { roleGuard } = require("../middleware/role.middleware");
const { requireOrganiser } = roleGuard(["organiser"]);

router.post("/scan",  authenticate, requireOrganiser, controller.scan);   // EVT-04
router.post("/batch", authenticate, requireOrganiser, controller.batch);  // EVT-05

// Volunteer-facing: poll for attendance confirmation (any authenticated user)
router.get("/volunteer/:id/latest", authenticate, controller.getLatestAttendance);

module.exports = router;
