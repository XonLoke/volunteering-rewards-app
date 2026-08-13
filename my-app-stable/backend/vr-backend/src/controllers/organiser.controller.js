/**
 * Organiser Controller — Web portal for event organisers
 * Wired to organiser.service.js
 */

const organiserService = require("../services/organiser.service");
const { createError } = require("../middleware/errorHandler.middleware");

async function dashboard(req, res, next) {
  try {
    const result = await organiserService.getDashboard(req.user.id);

    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function listEvents(req, res, next) {
  try {
    const result = await organiserService.getMyEvents(req.user.id, req.query);

    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function createEvent(req, res, next) {
  try {
    const event = await organiserService.createEvent(req.user.id, req.body);

    res.status(201).json({
      data: event,
      message: "Event created.",
    });
  } catch (err) {
    next(err);
  }
}

async function getEvent(req, res, next) {
  try {
    const result = await organiserService.getMyEvents(req.user.id, {
      page: 1,
      limit: 100,
    });

    const event = result.data.find(
      (item) => Number(item.id) === Number(req.params.id),
    );

    if (!event) {
      return next(createError(404, "not_found", "Event not found."));
    }

    res.json({
      data: event,
    });
  } catch (err) {
    next(err);
  }
}

async function updateEvent(req, res, next) {
  try {
    const event = await organiserService.updateEvent(
      req.user.id,
      req.params.id,
      req.body,
    );

    res.json({
      data: event,
      message: "Event updated.",
    });
  } catch (err) {
    next(err);
  }
}

async function deleteEvent(req, res, next) {
  try {
    await organiserService.deleteEvent(req.user.id, req.params.id);

    res.json({
      message: "Event deleted.",
    });
  } catch (err) {
    next(err);
  }
}

async function roster(req, res, next) {
  try {
    const result = await organiserService.getRoster(req.user.id, req.params.id);

    res.json(result);
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/organiser/events/:id/check-in
 *
 * Expected request body:
 * {
 *   "qrCode": "VOLUNTEER-QR-ID"
 * }
 */
async function checkInVolunteer(req, res, next) {
  try {
    const organiserId = req.user.id;
    const eventId = Number(req.params.id);
    const qrCode =
      typeof req.body?.qrCode === "string" ? req.body.qrCode.trim() : "";

    if (!Number.isInteger(eventId) || eventId <= 0) {
      return next(
        createError(400, "invalid_event_id", "A valid event ID is required."),
      );
    }

    if (!qrCode) {
      return next(
        createError(400, "invalid_qr_code", "Volunteer QR code is required."),
      );
    }

    const result = await organiserService.checkInVolunteer(
      organiserId,
      eventId,
      qrCode,
    );

    res.json({
      data: result,
      message: "Volunteer checked in successfully.",
    });
  } catch (err) {
    next(err);
  }
}

async function viewFeedback(req, res, next) {
  try {
    const result = await organiserService.getFeedback(
      req.user.id,
      req.params.id,
    );

    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function viewQna(req, res, next) {
  try {
    const result = await organiserService.getQna(req.user.id, req.params.id);

    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function answerQuestion(req, res, next) {
  try {
    const answer =
      typeof req.body?.answer === "string" ? req.body.answer.trim() : "";

    if (!answer) {
      return next(
        createError(400, "answer_required", "An answer is required."),
      );
    }

    const result = await organiserService.answerQuestion(
      req.user.id,
      req.params.qid,
      answer,
    );

    res.json({
      data: result,
      message: "Answer posted.",
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  dashboard,
  listEvents,
  createEvent,
  getEvent,
  updateEvent,
  deleteEvent,
  roster,
  checkInVolunteer,
  viewFeedback,
  viewQna,
  answerQuestion,
};
