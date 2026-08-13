//-----------------------------------------------------------------------
// SECTION: AI Feedback Summarizer (F2)
// Purpose: Lexicon-based sentiment analysis for volunteer event feedback.
//          Tokenises feedback text, scores against positive/negative keyword
//          lexicons, detects suggestion patterns, and returns a structured
//          summary with overall sentiment, top keywords, and suggestion count.
//-----------------------------------------------------------------------
const { pool } = require("../config/database");
const { createError } = require("../middleware/errorHandler.middleware");

//-----------------------------------------------------------------------
// SECTION: Sentiment Lexicons (built-in, no external API needed)
//-----------------------------------------------------------------------
const POSITIVE_KEYWORDS = [
  "great", "excellent", "amazing", "fun", "enjoyed", "inspiring",
  "organized", "helpful", "wonderful", "fantastic", "love", "best",
  "awesome", "brilliant", "perfect", "kind", "friendly", "professional",
  "smooth", "efficient", "enjoyable", "meaningful", "rewarding",
  "fantastic", "superb", "outstanding", "touching", "heartwarming",
  "nice", "good", "well", "impressive", "thanks", "thank you",
];

const NEGATIVE_KEYWORDS = [
  "boring", "disorganized", "late", "hot", "tiring", "confusing",
  "waste", "bad", "terrible", "crowded", "far", "difficult",
  "rude", "slow", "unprepared", "chaotic", "messy", "poor",
  "uncomfortable", "stressful", "disappointing", "lack", "missing",
  "unclear", "unfair", "expensive", "cold", "rain", "delayed",
];

const SUGGESTION_PATTERNS = [
  /(?:should|could|would|could have|would have|suggest|recommend|improve|better if|next time|maybe|perhaps|how about|what about)/i,
  /(?:i wish|i hope|it would be (?:good|nice|great) if)/i,
  /(?:more|less|better|worse) (?:organisation|communication|food|water|shade|seat|break|time|support|staff)/i,
];

//-----------------------------------------------------------------------
// SECTION: Tokeniser
// Purpose: Split text into lowercase word tokens, removing punctuation.
//-----------------------------------------------------------------------
function tokenise(text) {
  if (!text) return [];
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

//-----------------------------------------------------------------------
// SECTION: Sentiment Analysis Algorithm
//-----------------------------------------------------------------------
function analyseSentiment(text) {
  const tokens = tokenise(text);
  const positiveMatches = tokens.filter((t) => POSITIVE_KEYWORDS.includes(t));
  const negativeMatches = tokens.filter((t) => NEGATIVE_KEYWORDS.includes(t));
  const hasSuggestions = SUGGESTION_PATTERNS.some((p) => p.test(text));

  const positiveScore = positiveMatches.length;
  const negativeScore = negativeMatches.length;
  const totalScore = positiveScore - negativeScore;

  let sentiment;
  if (totalScore > 0) sentiment = "positive";
  else if (totalScore < 0) sentiment = "negative";
  else sentiment = "neutral";

  return {
    sentiment,
    positive_score: positiveScore,
    negative_score: negativeScore,
    total_score: totalScore,
    has_suggestions: hasSuggestions,
    positive_keywords: [...new Set(positiveMatches)],
    negative_keywords: [...new Set(negativeMatches)],
  };
}

//-----------------------------------------------------------------------
// SECTION: Get Feedback Summary for an Event
//-----------------------------------------------------------------------
async function getFeedbackSummary(eventId) {
  // Verify event exists
  const { rows: eventRows } = await pool.query(
    "SELECT id, title FROM events WHERE id = $1",
    [eventId]
  );
  if (eventRows.length === 0) throw createError(404, "not_found", "Event not found.");

  // Fetch all feedback for this event
  const { rows: feedbackRows } = await pool.query(
    `SELECT ef.id, ef.rating, ef.comment, ef.created_at,
            u.name AS volunteer_name
     FROM event_feedback ef
     JOIN users u ON u.id = ef.user_id
     WHERE ef.event_id = $1
     ORDER BY ef.created_at DESC`,
    [eventId]
  );

  const total = feedbackRows.length;

  // Aggregate sentiment across all feedback
  const sentiments = feedbackRows.map((f) => ({
    ...analyseSentiment(f.comment || ""),
    rating: f.rating,
  }));

  const positiveCount = sentiments.filter((s) => s.sentiment === "positive").length;
  const neutralCount = sentiments.filter((s) => s.sentiment === "neutral").length;
  const negativeCount = sentiments.filter((s) => s.sentiment === "negative").length;
  const suggestionCount = sentiments.filter((s) => s.has_suggestions).length;

  // Collect all keywords across all feedback
  const allPositiveKws = sentiments.flatMap((s) => s.positive_keywords);
  const allNegativeKws = sentiments.flatMap((s) => s.negative_keywords);

  // Count keyword frequency
  const keywordFreq = (arr) => {
    const freq = {};
    arr.forEach((kw) => { freq[kw] = (freq[kw] || 0) + 1; });
    return Object.entries(freq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([word, count]) => ({ word, count }));
  };

  // Calculate average rating
  const ratings = sentiments.filter((s) => s.rating != null).map((s) => s.rating);
  const avgRating = ratings.length > 0
    ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1)
    : null;

  return {
    event_id: parseInt(eventId),
    event_title: eventRows[0].title,
    total_feedback: total,
    overall_sentiment: positiveCount > negativeCount
      ? "positive"
      : negativeCount > positiveCount
        ? "negative"
        : "neutral",
    average_rating: avgRating ? parseFloat(avgRating) : null,
    breakdown: {
      positive: positiveCount,
      neutral: neutralCount,
      negative: negativeCount,
      with_suggestions: suggestionCount,
    },
    top_positive_keywords: keywordFreq(allPositiveKws),
    top_negative_keywords: keywordFreq(allNegativeKws),
  };
}

module.exports = {
  getFeedbackSummary,
  analyseSentiment,
};
