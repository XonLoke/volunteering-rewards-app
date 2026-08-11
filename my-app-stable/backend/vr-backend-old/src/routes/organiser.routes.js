import express from "express";
import { mockAuth } from "../middleware/mockAuth.js";
import * as c from "../controllers/organiser.controller.js";

const router = express.Router();
router.use(mockAuth);

router.get("/dashboard", c.dashboard);
router.get("/events", c.events);
router.post("/events", c.createEvent);
router.get("/events/:eventId", c.eventDetails);
router.put("/events/:eventId", c.updateEvent);
router.delete("/events/:eventId", c.deleteEvent);
router.get("/events/:eventId/roster", c.roster);
router.post("/events/:eventId/check-in", c.checkIn);
router.get("/feedback", c.feedback);

export default router;
