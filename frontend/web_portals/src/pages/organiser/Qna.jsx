import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Topbar from '../../components/Topbar';
import StatusBadge from '../../components/StatusBadge';
import { useToast } from '../../components/Toast';
import { apiGet, apiPost } from '../../services/api';

function QuestionCard({ item, onAnswer }) {
  const [answerText, setAnswerText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmitAnswer = async () => {
    if (!answerText.trim()) return;
    setSubmitting(true);
    try {
      await onAnswer(item.id, answerText);
      setAnswerText('');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div
      style={{
        padding: '16px 0',
        borderBottom: '1px solid var(--border)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 14, fontWeight: 500, margin: '0 0 4px' }}>
            {item.question}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--muted)' }}>
            <span>Asked by <strong>{item.asked_by || 'Anonymous'}</strong></span>
            <span>&middot;</span>
            <span>{formatDate(item.asked_at)}</span>
          </div>
        </div>
        <div>
          {item.is_answered ? (
            <StatusBadge status="approved" />
          ) : (
            <StatusBadge status="pending" />
          )}
        </div>
      </div>

      {item.is_answered && item.answer && (
        <div
          style={{
            marginTop: 12,
            marginLeft: 16,
            padding: '12px 16px',
            background: 'var(--accent-subtle)',
            borderRadius: 'var(--radius-md)',
            borderLeft: '3px solid var(--accent)',
          }}
        >
          <p style={{ fontSize: 13, margin: 0, color: 'var(--fg)' }}>
            <strong>Answer:</strong> {item.answer}
          </p>
          {item.answered_at && (
            <p style={{ fontSize: 11, color: 'var(--muted)', margin: '4px 0 0' }}>
              Answered {formatDate(item.answered_at)}
            </p>
          )}
        </div>
      )}

      {!item.is_answered && (
        <div style={{ marginTop: 12, marginLeft: 16 }}>
          <textarea
            className="form-textarea"
            placeholder="Type your answer..."
            rows={2}
            value={answerText}
            onChange={(e) => setAnswerText(e.target.value)}
            style={{ minHeight: 60 }}
          />
          <button
            className="btn btn-primary btn-sm"
            style={{ marginTop: 8 }}
            onClick={handleSubmitAnswer}
            disabled={submitting || !answerText.trim()}
          >
            {submitting ? 'Submitting...' : 'Submit Answer'}
          </button>
        </div>
      )}
    </div>
  );
}

export default function Qna() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [eventTitle, setEventTitle] = useState('');

  const fetchQna = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiGet(`/organiser/events/${id}/qna`);
      setQuestions(res.data || []);
      try {
        const rosterRes = await apiGet(`/organiser/events/${id}/roster`);
        if (rosterRes?.event_title) {
          setEventTitle(rosterRes.event_title);
        }
      } catch {
        // optional
      }
    } catch (err) {
      setError(err.message || 'Failed to load Q&A');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQna();
  }, [id]);

  const handleAnswer = async (qid, answer) => {
    try {
      await apiPost(`/organiser/events/${id}/qna/${qid}/answer`, { answer });
      toast('Answer submitted successfully!', 'success');
      fetchQna();
    } catch (err) {
      toast(err.message || 'Failed to submit answer', 'error');
    }
  };

  const unanswered = questions.filter((q) => !q.is_answered);
  const answered = questions.filter((q) => q.is_answered);

  if (loading) {
    return (
      <div>
        <Topbar title="Q&A" />
        <div className="main-content">
          <div className="loading-state">
            <p>Loading Q&A...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <Topbar title="Q&A" />
        <div className="main-content">
          <div className="error-state">
            <h2>Error loading Q&A</h2>
            <p>{error}</p>
            <button className="btn btn-primary" onClick={fetchQna}>
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Topbar title="Q&A" />
      <div className="main-content">
        <div className="page-header">
          <div>
            <h2 className="page-title">{eventTitle || 'Event Q&A'}</h2>
            <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 4 }}>
              {questions.length} {questions.length === 1 ? 'question' : 'questions'} total
              &middot; {unanswered.length} unanswered
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

        {questions.length === 0 ? (
          <div className="empty-state">
            <h2>No questions yet</h2>
            <p>No volunteers have asked questions for this event.</p>
          </div>
        ) : (
          <>
            {/* Unanswered Questions */}
            {unanswered.length > 0 && (
              <div className="card" style={{ marginBottom: 24, borderLeft: '3px solid var(--warning)' }}>
                <div className="card-header">
                  <h3 className="card-title">
                    Unanswered Questions ({unanswered.length})
                  </h3>
                </div>
                {unanswered.map((item) => (
                  <QuestionCard key={item.id} item={item} onAnswer={handleAnswer} />
                ))}
              </div>
            )}

            {/* Answered Questions */}
            {answered.length > 0 && (
              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">
                    Answered Questions ({answered.length})
                  </h3>
                </div>
                {answered.map((item) => (
                  <QuestionCard key={item.id} item={item} onAnswer={handleAnswer} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
