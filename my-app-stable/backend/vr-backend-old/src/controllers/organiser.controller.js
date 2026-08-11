import * as service from "../services/organiser.service.js";

export async function dashboard(req, res) {
  res.json(await service.getDashboard(req.user.id));
}

export async function events(req, res) {
  res.json(await service.getEvents(req.user.id, req.query.status, req.query.search));
}

export async function eventDetails(req, res) {
  const event = await service.getEventById(req.user.id, req.params.eventId);
  if (!event) return res.status(404).json({ message: "Event not found" });
  res.json(event);
}

export async function createEvent(req, res) {
  const event = await service.createEvent(req.user.id, req.body);
  res.status(201).json(event);
}

export async function updateEvent(req, res) {
  const event = await service.updateEvent(req.user.id, req.params.eventId, req.body);
  if (!event) return res.status(404).json({ message: "Event not found" });
  res.json(event);
}

export async function deleteEvent(req, res) {
  const deleted = await service.deleteEvent(req.user.id, req.params.eventId);
  if (!deleted) return res.status(404).json({ message: "Event not found" });
  res.json({ message: "Event deleted" });
}

export async function roster(req, res) {
  res.json(await service.getRoster(req.user.id, req.params.eventId));
}

export async function checkIn(req, res) {
  const result = await service.checkInVolunteer(req.user.id, req.params.eventId, req.body.qrCode);
  if (!result) return res.status(404).json({ message: "Volunteer/event not found" });
  res.json({ message: "Check-in successful", data: result });
}

export async function feedback(req, res) {
  res.json(await service.getFeedback(req.user.id));
}
