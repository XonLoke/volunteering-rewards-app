/**
 * Organiser Routes — Organiser Web Portal
 *
 * Endpoints:
 *   GET   /api/organiser/dashboard              — Dashboard stats
 *   GET   /api/organiser/events                 — List my events
 *   POST  /api/organiser/events                 — Create event
 *   GET   /api/organiser/events/:id             — Event detail + stats
 *   PUT   /api/organiser/events/:id             — Update event
 *   DELETE /api/organiser/events/:id            — Delete event
 *   GET   /api/organiser/events/:id/roster      — Registered volunteers
 *   GET   /api/organiser/events/:id/feedback    — View feedback
 *   GET   /api/organiser/events/:id/qna         — View Q&A
 *   POST  /api/organiser/events/:id/qna/:qid/answer — Answer question
 *
 * Mounted at: /api/organiser (see index.js)
 */

const { Router } = require("express");
const router = Router();
const controller = require("../controllers/organiser.controller");
const { authenticate } = require("../middleware/auth.middleware");
const { roleGuard } = require("../middleware/role.middleware");
const { requireOrganiser } = roleGuard(["organiser"]);

router.use(authenticate, requireOrganiser);

router.get("/dashboard", controller.dashboard);
router.get("/events", controller.listEvents);
router.post("/events", controller.createEvent);
router.get("/events/:id", controller.getEvent);
router.put("/events/:id", controller.updateEvent);
router.delete("/events/:id", controller.deleteEvent);
router.get("/events/:id/roster", controller.roster);
router.get("/events/:id/feedback", controller.viewFeedback);
router.get("/events/:id/qna", controller.viewQna);
router.post("/events/:id/qna/:qid/answer", controller.answerQuestion);

module.exports = router;
