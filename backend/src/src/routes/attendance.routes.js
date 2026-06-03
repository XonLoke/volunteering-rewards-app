const express = require("express");
const router = express.Router();

const attendanceService = require("../services/attendance.service");

router.post("/scan", async (req, res, next) => {
  try {
    const { eventId, volunteerId } = req.body;

    if (!eventId || !volunteerId) {
      return res.status(400).json({
        message: "eventId and volunteerId are required",
      });
    }

    const result = await attendanceService.scanQR(eventId, volunteerId);

    res.json(result);
  } catch (error) {
    next(error);
  }
});

module.exports = router;