import express from "express";
import { mockAuth } from "../middleware/mockAuth.js";
import * as c from "../controllers/me.controller.js";

const router = express.Router();
router.use(mockAuth);

router.get("/profile", c.profile);
router.get("/events", c.myEvents);
router.get("/points", c.points);
router.get("/coupons", c.coupons);
router.get("/qr-code", c.qrCode);

export default router;
