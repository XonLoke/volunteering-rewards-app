import * as service from "../services/me.service.js";

export async function profile(req, res) {
  res.json(await service.getProfile(req.user.id));
}

export async function myEvents(req, res) {
  res.json(await service.getMyEvents(req.user.id));
}

export async function points(req, res) {
  res.json(await service.getPoints(req.user.id));
}

export async function coupons(req, res) {
  res.json(await service.getCoupons(req.user.id));
}

export async function qrCode(req, res) {
  res.json(await service.getQrCode(req.user.id));
}
