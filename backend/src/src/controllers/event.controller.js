const eventService = require("../services/event.service");

const browseEvents = async (req, res, next) => {
  try {
    const result = await eventService.browseEvents({
      page: Number(req.query.page) || 1,
      limit: Number(req.query.limit) || 20,
      search: req.query.search,
      category: req.query.category,
      userId: req.query.user_id || req.query.userId,
    });

    res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

const getEventById = async (req, res, next) => {
  try {
    const event = await eventService.getEventById(
      req.params.eventId,
      req.query.user_id || req.query.userId
    );

    res.json({
      success: true,
      event,
    });
  } catch (error) {
    next(error);
  }
};

const registerForEvent = async (req, res, next) => {
  try {
    const eventId = req.params.eventId;
    const userId = req.body.user_id || req.body.userId;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "user_id is required",
      });
    }

    const registration = await eventService.registerForEvent(eventId, userId);

    res.status(201).json({
      success: true,
      message: "Event booked successfully",
      registration,
    });
  } catch (error) {
    if (error.message === "already_registered") {
      return res.status(409).json({
        success: false,
        message: "already_registered",
      });
    }

    if (error.message === "event_full") {
      return res.status(409).json({
        success: false,
        message: "event_full",
      });
    }

    if (error.message === "not_found") {
      return res.status(404).json({
        success: false,
        message: "not_found",
      });
    }

    next(error);
  }
};

const unregisterFromEvent = async (req, res, next) => {
  try {
    const eventId = req.params.eventId;
    const userId = req.body.user_id || req.body.userId || req.query.user_id || req.query.userId;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "user_id is required",
      });
    }

    const registration = await eventService.unregisterFromEvent(eventId, userId);

    res.json({
      success: true,
      message: "Event booking cancelled",
      registration,
    });
  } catch (error) {
    if (error.message === "not_found") {
      return res.status(404).json({
        success: false,
        message: "not_found",
      });
    }

    next(error);
  }
};

module.exports = {
  browseEvents,
  getEventById,
  registerForEvent,
  unregisterFromEvent,
};