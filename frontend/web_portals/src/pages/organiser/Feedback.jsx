import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Topbar from '../../components/Topbar';
import { apiGet } from '../../services/api';

function StarRating({ rating }) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  const empty = 5 - full - (half ? 1 : 0);

  return (
    <span style={{ color: '#F5A623', fontSize: 16, letterSpacing: 1 }}>
      {'★'.repeat(full)}
      {half ? '½' : ''}
      {'☆'.repeat(empty)}
    </span>
  );
}

function FeedbackCard({ item }) {
  return (
    <div
      style={{
        padding: '16px 0',
        borderBottom: '1px solid var(--border)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
        <span style={{ fontWeight: 500, fontSize: 13 }}>{item.volunteer_name || 'Anonymous'}</span>
        <StarRating rating={item.rating || 0} />
        <span style={{ fontSize: 12, color: 'var(--muted)', marginLeft: 'auto' }}>
          {formatDate(item.created_at)}
        </span>
      </div>
      {item.comment && (
        <p style={{ fontSize: 13, color: 'var(--fg)', margin: 0, lineHeight: 1.5 }}>
          {item.comment}
        </p>
      )}
    </div>
  );
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  try {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

export default function Feedback() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [feedback, setFeedback] = useState([]);
  const [averageRating, setAverageRating] = useState(null);
  const [total, setTotal] = useState(0);
  const [eventTitle, setEventTitle] = useState('');

  //-----------------------------------------------------------------------
  // SECTION: AI Feedback Summary (F2)
  // Purpose: Fetch AI-generated sentiment summary alongside feedback data.
  //-----------------------------------------------------------------------
  const [aiSummary, setAiSummary] = useState(null);
  const [aiLoading, setAiLoading] = useState(true);
  const [aiError, setAiError] = useState(null);

  const fetchFeedback = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiGet(`/organiser/events/${id}/feedback`);
      setFeedback(res.data || []);
      setAverageRating(res.average_rating);
      setTotal(res.total || 0);
      // Try to get event title from the roster endpoint
      try {
        const rosterRes = await apiGet(`/organiser/events/${id}/roster`);
        if (rosterRes?.event_title) {
          setEventTitle(rosterRes.event_title);
        }
      } catch {
        // Event title is optional for display
      }
    } catch (err) {
      setError(err.message || 'Failed to load feedback');
    } finally {
      setLoading(false);
    }
  };

  // Fetch AI summary separately
  const fetchAiSummary = async () => {
    setAiLoading(true);
    setAiError(null);
    try {
      const res = await apiGet(`/events/${id}/feedback/summary`);
      setAiSummary(res.data || null);
    } catch (err) {
      setAiError(err.message || null);
    } finally {
      setAiLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedback();
    fetchAiSummary();
  }, [id]);

  if (loading) {
    return (
      <div>
        <Topbar title="Feedback" />
        <div className="main-content">
          <div className="loading-state">
            <p>Loading feedback...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <Topbar title="Feedback" />
        <div className="main-content">
          <div className="error-state">
            <h2>Error loading feedback</h2>
            <p>{error}</p>
            <button className="btn btn-primary" onClick={fetchFeedback}>
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Topbar title="Feedback" />
      <div className="main-content">
        <div className="page-header">
          <div>
            <h2 className="page-title">{eventTitle || 'Event Feedback'}</h2>
            <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 4 }}>
              Volunteer feedback and ratings
            </p>
          </div>
          <div className="page-actions">
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => navigate(`/organiser/events`)}
            >
              Back to Event
            </button>
          </div>
        </div>

        {/* ─── AI Feedback Summary Card (F2) ──────────────────── */}
        {aiLoading && (
          <div className="card" style={{ marginBottom: 24, padding: 20 }}>
            <div className="loading-state" style={{ padding: 0 }}>
              <p style={{ fontSize: 13 }}>Analysing feedback sentiment...</p>
            </div>
          </div>
        )}

        {aiError && (
          <div className="card" style={{ marginBottom: 24, padding: 16, borderLeft: '3px solid var(--warning)' }}>
            <p style={{ fontSize: 13, color: 'var(--muted)' }}>
              AI Summary temporarily unavailable. Individual feedback below.
            </p>
          </div>
        )}

        {aiSummary && !aiLoading && (
          <div className="card" style={{ marginBottom: 24, padding: 20 }}>
            <div className="card-header" style={{ padding: 0, marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 20 }}>✨</span>
                <h3 className="card-title" style={{ margin: 0 }}>AI Feedback Summary</h3>
                {aiSummary.total_feedback === 0 && (
                  <span className="badge badge-secondary" style={{ fontSize: 11 }}>No data</span>
                )}
              </div>
            </div>

            {aiSummary.total_feedback === 0 ? (
              <p style={{ fontSize: 13, color: 'var(--muted)', margin: 0 }}>
                No feedback yet. Check back after volunteers submit reviews.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {/* Sentiment Badge */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    padding: '4px 12px', borderRadius: 20, fontSize: 13, fontWeight: 600,
                    background: aiSummary.overall_sentiment === 'positive' ? '#dcfce7' :
                               aiSummary.overall_sentiment === 'negative' ? '#fef2f2' : '#f5f5f5',
                    color: aiSummary.overall_sentiment === 'positive' ? '#16a34a' :
                           aiSummary.overall_sentiment === 'negative' ? '#dc2626' : '#6b7280',
                  }}>
                    <span>{aiSummary.overall_sentiment === 'positive' ? '😊' :
                            aiSummary.overall_sentiment === 'negative' ? '☹️' : '😐'}</span>
                    <span>{aiSummary.overall_sentiment.charAt(0).toUpperCase() + aiSummary.overall_sentiment.slice(1)}</span>
                  </span>
                  {aiSummary.average_rating && (
                    <span style={{ fontSize: 13, color: 'var(--muted)' }}>
                      Avg: <strong>{aiSummary.average_rating.toFixed(1)}</strong> / 5
                    </span>
                  )}
                </div>

                {/* Breakdown Bar */}
                <div>
                  <div style={{ display: 'flex', gap: 4, height: 8, borderRadius: 4, overflow: 'hidden', marginBottom: 6 }}>
                    {aiSummary.breakdown.positive > 0 && (
                      <div style={{
                        flex: aiSummary.breakdown.positive, background: '#16a34a',
                        minWidth: 4,
                      }} title={`${aiSummary.breakdown.positive} positive`} />
                    )}
                    {aiSummary.breakdown.neutral > 0 && (
                      <div style={{
                        flex: aiSummary.breakdown.neutral, background: '#9ca3af',
                        minWidth: 4,
                      }} title={`${aiSummary.breakdown.neutral} neutral`} />
                    )}
                    {aiSummary.breakdown.negative > 0 && (
                      <div style={{
                        flex: aiSummary.breakdown.negative, background: '#dc2626',
                        minWidth: 4,
                      }} title={`${aiSummary.breakdown.negative} negative`} />
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: 16, fontSize: 12, color: 'var(--muted)' }}>
                    <span>😊 {aiSummary.breakdown.positive}</span>
                    <span>😐 {aiSummary.breakdown.neutral}</span>
                    <span>☹️ {aiSummary.breakdown.negative}</span>
                    {aiSummary.breakdown.with_suggestions > 0 && (
                      <span>💡 {aiSummary.breakdown.with_suggestions} with suggestions</span>
                    )}
                  </div>
                </div>

                {/* Top Keywords */}
                <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
                  {aiSummary.top_positive_keywords?.length > 0 && (
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: '#16a34a', marginBottom: 6 }}>Positive Keywords</div>
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                        {aiSummary.top_positive_keywords.map((kw, i) => (
                          <span key={i} style={{
                            padding: '2px 8px', borderRadius: 12, fontSize: 12,
                            background: '#dcfce7', color: '#166534',
                          }}>
                            {kw.word} ({kw.count})
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {aiSummary.top_negative_keywords?.length > 0 && (
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: '#dc2626', marginBottom: 6 }}>Negative Keywords</div>
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                        {aiSummary.top_negative_keywords.map((kw, i) => (
                          <span key={i} style={{
                            padding: '2px 8px', borderRadius: 12, fontSize: 12,
                            background: '#fef2f2', color: '#991b1b',
                          }}>
                            {kw.word} ({kw.count})
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Rating Summary */}
        <div className="card" style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 40, fontWeight: 700, fontFamily: 'var(--font-display)' }}>
                {averageRating != null ? averageRating.toFixed(1) : '--'}
              </div>
              <div style={{ marginTop: 4 }}>
                {averageRating != null ? <StarRating rating={averageRating} /> : '--'}
              </div>
              <div className="stat-label" style={{ marginTop: 4 }}>
                {total} {total === 1 ? 'review' : 'reviews'}
              </div>
            </div>
          </div>
        </div>

        {/* Feedback List */}
        {feedback.length === 0 ? (
          <div className="empty-state">
            <h2>No feedback yet</h2>
            <p>No volunteers have submitted feedback for this event.</p>
          </div>
        ) : (
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">All Feedback</h3>
            </div>
            {feedback.map((item) => (
              <FeedbackCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
