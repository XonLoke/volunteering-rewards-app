/**
 * Organiser Routes — Organiser Web Portal
 *
 * Mounted at: /api/organiser
 */

const { Router } = require("express");
const router = Router();

const controller = require("../controllers/organiser.controller");
const { authenticate } = require("../middleware/auth.middleware");
const { roleGuard } = require("../middleware/role.middleware");

// roleGuard returns an object containing requireOrganiser
const { requireOrganiser } = roleGuard(["organiser"]);

router.use(authenticate, requireOrganiser);

// Dashboard
router.get("/dashboard", controller.dashboard);

// Events
router.get("/events", controller.listEvents);
router.post("/events", controller.createEvent);
router.get("/events/:id", controller.getEvent);
router.put("/events/:id", controller.updateEvent);
router.delete("/events/:id", controller.deleteEvent);

// Attendance
router.get("/events/:id/roster", controller.roster);
router.post("/events/:id/check-in", controller.checkInVolunteer);

// Feedback and Q&A
router.get("/events/:id/feedback", controller.viewFeedback);
router.get("/events/:id/qna", controller.viewQna);
router.post("/events/:id/qna/:qid/answer", controller.answerQuestion);

module.exports = router;
