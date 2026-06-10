//-----------------------------------------------------------------------
// SECTION: Sponsorship Referral Service (F3 Redesign)
// Purpose: Email-based upline/downline sponsorship tracking with
//          configurable points. Supports helped vs unhelped recruitment.
//-----------------------------------------------------------------------
const { pool } = require("../config/database");
const { createError } = require("../middleware/errorHandler.middleware");

//-----------------------------------------------------------------------
// SECTION: Get Current Sponsorship Config
//-----------------------------------------------------------------------
async function getConfig() {
  const { rows } = await pool.query(
    "SELECT direct_sponsor_points, helped_sponsor_points, upline_helper_points, max_depth FROM sponsorship_configuration ORDER BY id DESC LIMIT 1"
  );
  if (rows.length === 0) return { direct_sponsor_points: 10, helped_sponsor_points: 4, upline_helper_points: 6 };
  return rows[0];
}

//-----------------------------------------------------------------------
// SECTION: Link Sponsorship on Registration
// Purpose: When a new user registers with upline emails, link them.
//          upline_2_email = direct sponsor (person who recruited them)
//          upline_1_email = parent sponsor (person who sponsored the recruiter)
//-----------------------------------------------------------------------
async function linkSponsorship(userId, upline2Email, upline1Email) {
  // Find the direct sponsor (upline 2)
  let upline2Id = null;
  if (upline2Email) {
    const { rows: u2 } = await pool.query(
      "SELECT id, name, email FROM users WHERE email = $1 AND role_id = (SELECT id FROM roles WHERE role_name = 'volunteer') LIMIT 1",
      [upline2Email.trim().toLowerCase()]
    );
    if (u2.length > 0) upline2Id = u2[0].id;
  }

  // Find the parent sponsor (upline 1)
  let upline1Id = null;
  if (upline1Email) {
    const { rows: u1 } = await pool.query(
      "SELECT id, name, email FROM users WHERE email = $1 AND role_id = (SELECT id FROM roles WHERE role_name = 'volunteer') LIMIT 1",
      [upline1Email.trim().toLowerCase()]
    );
    if (u1.length > 0) upline1Id = u1[0].id;
  }

  // Save upline emails on the new user
  const updates = [];
  const params = [userId];
  if (upline2Email) { updates.push(`upline_2_email = $${params.length + 1}`); params.push(upline2Email.trim().toLowerCase()); }
  if (upline1Email) { updates.push(`upline_1_email = $${params.length + 1}`); params.push(upline1Email.trim().toLowerCase()); }
  if (updates.length > 0) {
    await pool.query(`UPDATE users SET ${updates.join(', ')} WHERE id = $1`, params);
  }

  // Create referral log entries for points tracking
  const cfg = await getConfig();
  const now = new Date();

  // Level 1: Direct sponsor gets helped_sponsor_points
  // (they receive less because upline helped — the premium 10 is only for own effort)
  if (upline2Id) {
    await pool.query(
      `INSERT INTO referral_logs (referrer_id, referred_id, level, points_awarded, status, created_at)
       VALUES ($1, $2, 1, $3, 'rewarded', $4)`,
      [upline2Id, userId, cfg.helped_sponsor_points, now]
    );
  }

  // Level 2: Parent sponsor gets upline_helper_points for helping the recruiter
  if (upline1Id) {
    await pool.query(
      `INSERT INTO referral_logs (referrer_id, referred_id, level, points_awarded, status, created_at)
       VALUES ($1, $2, 2, $3, 'rewarded', $4)`,
      [upline1Id, userId, cfg.upline_helper_points, now]
    );
  }

  return { upline2Id, upline1Id };
}

//-----------------------------------------------------------------------
// SECTION: Award Direct Sponsor Points (10 pts — own effort, no help)
// Purpose: Called when a user registers WITHOUT upline emails but
//          we detect their referrer by other means, OR when we need
//          to award the full direct sponsor points.
//-----------------------------------------------------------------------
async function awardDirectSponsorPoints(referrerId, newUserId) {
  const cfg = await getConfig();
  await pool.query(
    `INSERT INTO referral_logs (referrer_id, referred_id, level, points_awarded, status, created_at)
     VALUES ($1, $2, 1, $3, 'rewarded', NOW())`,
    [referrerId, newUserId, cfg.direct_sponsor_points]
  );
}

//-----------------------------------------------------------------------
// SECTION: Get Sponsorship Profile for Current User
//-----------------------------------------------------------------------
async function getMySponsorshipProfile(userId) {
  const { rows: userRows } = await pool.query(
    "SELECT id, name, email, upline_1_email, upline_2_email, points FROM users WHERE id = $1",
    [userId]
  );
  if (userRows.length === 0) throw createError(404, "not_found", "User not found.");
  const user = userRows[0];

  // Get downline level 1 count + names
  const { rows: downline1 } = await pool.query(
    `SELECT rl.id, u.name, u.email, rl.created_at
     FROM referral_logs rl
     JOIN users u ON u.id = rl.referred_id
     WHERE rl.referrer_id = $1 AND rl.level = 1
     ORDER BY rl.created_at DESC`,
    [userId]
  );

  // Get downline level 2 count
  const { rows: downline2 } = await pool.query(
    `SELECT rl.id, u.name, u.email, rl.created_at
     FROM referral_logs rl
     JOIN users u ON u.id = rl.referred_id
     WHERE rl.referrer_id = $1 AND rl.level = 2
     ORDER BY rl.created_at DESC`,
    [userId]
  );

  // Get total sponsorship points earned
  const { rows: pointsResult } = await pool.query(
    "SELECT COALESCE(SUM(points_awarded), 0)::int AS total FROM referral_logs WHERE referrer_id = $1",
    [userId]
  );

  return {
    email: user.email,
    upline_1_email: user.upline_1_email || '',
    upline_2_email: user.upline_2_email || '',
    downline_1st_level_count: downline1.length,
    downline_2nd_level_count: downline2.length,
    downline_1st_level: downline1.map(d => `${d.name} (${d.email})`).join('\n'),
    downline_2nd_level: downline2.map(d => `${d.name} (${d.email})`).join('\n'),
    total_sponsorship_points: pointsResult[0]?.total || 0,
  };
}

module.exports = {
  linkSponsorship,
  awardDirectSponsorPoints,
  getMySponsorshipProfile,
  getConfig,
};
