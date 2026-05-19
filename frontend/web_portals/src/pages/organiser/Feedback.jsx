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

  useEffect(() => {
    fetchFeedback();
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
              onClick={() => navigate(`/organiser/events/${id}`)}
            >
              Back to Event
            </button>
          </div>
        </div>

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
