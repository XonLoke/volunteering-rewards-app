//-----------------------------------------------------------------------
// SECTION: Feedback Controller (F2)
//-----------------------------------------------------------------------
const feedbackService = require("../services/feedback.service");

// GET /api/events/:id/feedback/summary
async function getSummary(req, res, next) {
  try {
    const result = await feedbackService.getFeedbackSummary(req.params.id);
    res.json({ data: result });
  } catch (err) { next(err); }
}

module.exports = { getSummary };
