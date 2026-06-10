const express = require("express");
const router = express.Router();
const { pool } = require("../config/database");

// GET /api/recommendations/:userId
// AI-inspired event recommendation based on user's past event categories
router.get("/:userId", async (req, res, next) => {
  try {
    const userId = Number(req.params.userId);

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "Valid userId is required",
      });
    }

    // 1. Get user's past/active event categories
    const historyResult = await pool.query(
      `
      SELECT DISTINCT e.category
      FROM event_registrations er
      JOIN events e ON er.event_id = e.id
      WHERE er.user_id = $1
      AND e.category IS NOT NULL

      UNION

      SELECT DISTINCT e.category
      FROM attendance_logs al
      JOIN events e ON al.event_id = e.id
      WHERE al.user_id = $1
      AND e.category IS NOT NULL
      `,
      [userId]
    );

    const preferredCategories = historyResult.rows
      .map((row) => row.category)
      .filter(Boolean);

    let recommendationResult;

    // 2. If user has history, recommend similar categories first
    if (preferredCategories.length > 0) {
      recommendationResult = await pool.query(
        `
        SELECT
          e.id,
          e.title,
          e.description,
          e.location,
          e.event_date,
          e.capacity,
          e.points_value,
          e.category,
          e.status,
          o.org_name,
          COALESCE(reg.count, 0)::int AS registrations,
          CASE
            WHEN e.category = ANY($2::text[]) THEN
              'Recommended because you have shown interest in ' || e.category || ' events.'
            ELSE
              'Recommended as a high-value upcoming volunteer opportunity.'
          END AS recommendation_reason
        FROM events e
        JOIN organizations o ON e.organization_id = o.id
        LEFT JOIN (
          SELECT event_id, COUNT(*) AS count
          FROM event_registrations
          WHERE status = 'registered'
          GROUP BY event_id
        ) reg ON reg.event_id = e.id
        WHERE e.status = 'upcoming'
        AND NOT EXISTS (
          SELECT 1
          FROM event_registrations er
          WHERE er.event_id = e.id
          AND er.user_id = $1
          AND er.status = 'registered'
        )
        ORDER BY
          CASE WHEN e.category = ANY($2::text[]) THEN 0 ELSE 1 END,
          e.points_value DESC,
          e.event_date ASC
        LIMIT 5
        `,
        [userId, preferredCategories]
      );
    } else {
      // 3. New user: recommend high-points / soonest events
      recommendationResult = await pool.query(
        `
        SELECT
          e.id,
          e.title,
          e.description,
          e.location,
          e.event_date,
          e.capacity,
          e.points_value,
          e.category,
          e.status,
          o.org_name,
          COALESCE(reg.count, 0)::int AS registrations,
          'Recommended for new volunteers based on reward points and upcoming date.' AS recommendation_reason
        FROM events e
        JOIN organizations o ON e.organization_id = o.id
        LEFT JOIN (
          SELECT event_id, COUNT(*) AS count
          FROM event_registrations
          WHERE status = 'registered'
          GROUP BY event_id
        ) reg ON reg.event_id = e.id
        WHERE e.status = 'upcoming'
        ORDER BY e.points_value DESC, e.event_date ASC
        LIMIT 5
        `
      );
    }

    res.json({
      success: true,
      preferred_categories: preferredCategories,
      recommendations: recommendationResult.rows,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;