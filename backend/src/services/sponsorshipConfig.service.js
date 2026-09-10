//-----------------------------------------------------------------------
// SECTION: Sponsorship Configuration Service
// Purpose: Read/write sponsorship points configuration (like Rewards Config)
//-----------------------------------------------------------------------
const { pool } = require("../config/database");
const { isPublicDemoMode } = require("../config/demoMode");

async function getSponsorshipConfig() {
  const { rows } = await pool.query(
    "SELECT direct_sponsor_points, helped_sponsor_points, upline_helper_points, updated_at FROM sponsorship_configuration ORDER BY id DESC LIMIT 1"
  );
  if (rows.length === 0) {
    return { direct_sponsor_points: 10, helped_sponsor_points: 4, upline_helper_points: 6 };
  }
  return rows[0];
}

async function updateSponsorshipConfig(data, userId) {
  // 🔒 PUBLIC DEMO: same reasoning as updateRewardsConfig — an append-only
  // INSERT that getSponsorshipConfig() reads as the newest row, so one write
  // permanently changes referral economics. The reset must not repair this
  // table, so the write is refused instead.
  if (isPublicDemoMode()) {
    console.log("[sponsorshipConfig.service] DEMO MODE — sponsorship configuration write suppressed.");
    return { message: "Sponsorship configuration updated", updated_at: new Date().toISOString() };
  }

  const { rows } = await pool.query(
    `INSERT INTO sponsorship_configuration (direct_sponsor_points, helped_sponsor_points, upline_helper_points, updated_by, updated_at)
     VALUES ($1, $2, $3, $4, NOW()) RETURNING *`,
    [data.direct_sponsor_points, data.helped_sponsor_points, data.upline_helper_points, userId]
  );
  return { message: "Sponsorship configuration updated", updated_at: rows[0].updated_at };
}

module.exports = { getSponsorshipConfig, updateSponsorshipConfig };
