/**
 * Organiser Controller — Web portal for event organisers
 * Wired to organiser.service.js
 */
const organiserService = require("../services/organiser.service");

async function dashboard(req, res, next) {
  try {
    const result = await organiserService.getDashboard(req.user.id);
    res.json(result);
  } catch (err) { next(err); }
}

async function listEvents(req, res, next) {
  try {
    const result = await organiserService.getMyEvents(req.user.id, req.query);
    res.json(result);
  } catch (err) { next(err); }
}

async function createEvent(req, res, next) {
  try {
    const event = await organiserService.createEvent(req.user.id, req.body);
    res.status(201).json({ data: event, message: "Event created." });
  } catch (err) { next(err); }
}

async function getEvent(req, res, next) {
  try {
    const result = await organiserService.getMyEvents(req.user.id, { page: 1, limit: 1 });
    const event = result.data.find(e => e.id == req.params.id);
    if (!event) return next(require("../middleware/errorHandler.middleware").createError(404, "not_found", "Event not found."));
    res.json({ data: event });
  } catch (err) { next(err); }
}

async function updateEvent(req, res, next) {
  try {
    const event = await organiserService.updateEvent(req.user.id, req.params.id, req.body);
    res.json({ data: event, message: "Event updated." });
  } catch (err) { next(err); }
}

async function deleteEvent(req, res, next) {
  try {
    await organiserService.deleteEvent(req.user.id, req.params.id);
    res.json({ message: "Event deleted." });
  } catch (err) { next(err); }
}

async function roster(req, res, next) {
  try {
    const result = await organiserService.getRoster(req.user.id, req.params.id);
    res.json(result);
  } catch (err) { next(err); }
}

async function viewFeedback(req, res, next) {
  try {
    const result = await organiserService.getFeedback(req.user.id, req.params.id);
    res.json(result);
  } catch (err) { next(err); }
}

async function viewQna(req, res, next) {
  try {
    const result = await organiserService.getQna(req.user.id, req.params.id);
    res.json(result);
  } catch (err) { next(err); }
}

async function answerQuestion(req, res, next) {
  try {
    const result = await organiserService.answerQuestion(req.user.id, req.params.qid, req.body.answer);
    res.json({ data: result, message: "Answer posted." });
  } catch (err) { next(err); }
}

module.exports = {
  dashboard, listEvents, createEvent, getEvent, updateEvent, deleteEvent,
  roster, viewFeedback, viewQna, answerQuestion,
};
