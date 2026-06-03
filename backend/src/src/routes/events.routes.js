const express = require("express");
const router = express.Router();
const { pool } = require("../config/database");

// GET /api/events?user_id=1
// Get upcoming events + current registration count + whether this user booked
router.get("/", async (req, res, next) => {
  try {
    const rawUserId = req.query.user_id || req.query.userId || null;
    const userId = rawUserId ? Number(rawUserId) : null;

    const { rows } = await pool.query(
      `
      SELECT
        e.*,
        o.org_name,
        COALESCE(reg.count, 0)::int AS registrations,
        CASE
          WHEN $1::int IS NULL THEN false
          ELSE EXISTS (
            SELECT 1
            FROM event_registrations er
            WHERE er.event_id = e.id
              AND er.user_id = $1
          )
        END AS registered
      FROM events e
      JOIN organizations o ON e.organization_id = o.id
      LEFT JOIN (
        SELECT event_id, COUNT(*) AS count
        FROM event_registrations
        GROUP BY event_id
      ) reg ON reg.event_id = e.id
      WHERE e.status = 'upcoming'
      ORDER BY e.event_date ASC
      `,
      [userId]
    );

    res.json({
      success: true,
      events: rows,
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/events/:eventId/register
// Book event
router.post("/:eventId/register", async (req, res, next) => {
  const client = await pool.connect();

  try {
    const { eventId } = req.params;
    const userId = req.body.user_id || req.body.userId;

    console.log("BOOK EVENT HIT");
    console.log("eventId:", eventId);
    console.log("userId:", userId);
    console.log("body:", req.body);

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "user_id is required",
      });
    }

    await client.query("BEGIN");

    const eventResult = await client.query(
      `
      SELECT id, title, capacity, status
      FROM events
      WHERE id = $1
      FOR UPDATE
      `,
      [eventId]
    );

    if (!eventResult.rows.length) {
      await client.query("ROLLBACK");
      return res.status(404).json({
        success: false,
        message: "event_not_found",
      });
    }

    const event = eventResult.rows[0];

    if (event.status !== "upcoming") {
      await client.query("ROLLBACK");
      return res.status(400).json({
        success: false,
        message: "event_not_available",
      });
    }

    const alreadyRegistered = await client.query(
      `
      SELECT 1
      FROM event_registrations
      WHERE event_id = $1
        AND user_id = $2
      `,
      [eventId, userId]
    );

    if (alreadyRegistered.rows.length) {
      await client.query("ROLLBACK");
      return res.status(409).json({
        success: false,
        message: "already_registered",
      });
    }

    const countResult = await client.query(
      `
      SELECT COUNT(*)::int AS count
      FROM event_registrations
      WHERE event_id = $1
      `,
      [eventId]
    );

    const currentRegistrations = Number(countResult.rows[0].count || 0);
    const capacity = Number(event.capacity || 0);

    if (capacity > 0 && currentRegistrations >= capacity) {
      await client.query("ROLLBACK");
      return res.status(409).json({
        success: false,
        message: "event_full",
      });
    }

    const insertResult = await client.query(
      `
      INSERT INTO event_registrations (event_id, user_id)
      VALUES ($1, $2)
      RETURNING *
      `,
      [eventId, userId]
    );

    await client.query("COMMIT");

    res.status(201).json({
      success: true,
      message: "Event booked successfully",
      registration: insertResult.rows[0],
      registrations: currentRegistrations + 1,
    });
  } catch (err) {
    await client.query("ROLLBACK");
    next(err);
  } finally {
    client.release();
  }
});

// DELETE /api/events/:eventId/register?user_id=1
// Cancel booking
router.delete("/:eventId/register", async (req, res, next) => {
  try {
    const { eventId } = req.params;

    const userId =
      req.body?.user_id ||
      req.body?.userId ||
      req.query?.user_id ||
      req.query?.userId ||
      req.headers["x-user-id"];

    console.log("DELETE BOOKING HIT");
    console.log("eventId:", eventId);
    console.log("body:", req.body);
    console.log("query:", req.query);
    console.log("headers x-user-id:", req.headers["x-user-id"]);
    console.log("final userId:", userId);

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "user_id is required",
      });
    }

    const beforeCheck = await pool.query(
      `
      SELECT *
      FROM event_registrations
      WHERE event_id = $1
        AND user_id = $2
      `,
      [eventId, userId]
    );

    console.log("booking rows before delete:", beforeCheck.rows);

    const deleteResult = await pool.query(
      `
      DELETE FROM event_registrations
      WHERE event_id = $1
        AND user_id = $2
      RETURNING *
      `,
      [eventId, userId]
    );

    console.log("deleted rows:", deleteResult.rows);

    const countResult = await pool.query(
      `
      SELECT COUNT(*)::int AS count
      FROM event_registrations
      WHERE event_id = $1
      `,
      [eventId]
    );

    res.json({
      success: true,
      message: deleteResult.rows.length
        ? "Event booking cancelled"
        : "No existing booking found, but treated as cancelled",
      deleted: deleteResult.rows.length,
      registration: deleteResult.rows[0] || null,
      registrations: Number(countResult.rows[0].count || 0),
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;