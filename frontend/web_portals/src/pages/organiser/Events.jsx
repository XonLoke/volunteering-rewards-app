import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Topbar from '../../components/Topbar';
import StatusBadge from '../../components/StatusBadge';
import { apiGet } from '../../services/api';

const FILTER_OPTIONS = [
  { key: '', label: 'All' },
  { key: 'upcoming', label: 'Upcoming' },
  { key: 'past', label: 'Past' },
  { key: 'draft', label: 'Draft' },
];

function getStatusBadge(status) {
  const map = {
    published: 'approved',
    draft: 'pending',
    cancelled: 'rejected',
    completed: 'active',
  };
  return <StatusBadge status={map[status] || status} />;
}

export default function Events() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [events, setEvents] = useState([]);
  const [total, setTotal] = useState(0);
  const [filter, setFilter] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 15;

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { page, limit: pageSize };
      if (filter) params.status = filter;
      const res = await apiGet('/organiser/events', params);
      setEvents(res.data || []);
      setTotal(res.total || 0);
    } catch (err) {
      setError(err.message || 'Failed to load events');
    } finally {
      setLoading(false);
    }
  }, [filter, page, pageSize]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleFilterChange = (key) => {
    setFilter(key);
    setPage(1);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '--';
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return '--';
    try {
      return new Date(`2000-01-01T${timeStr}`).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return timeStr;
    }
  };

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div>
      <Topbar title="Events" />
      <div className="main-content">
        <div className="page-header">
          <h2 className="page-title">My Events</h2>
          <div className="page-actions">
            <button
              className="btn btn-primary"
              onClick={() => navigate('/organiser/event-create')}
            >
              + Create Event
            </button>
          </div>
        </div>

        {/* Filter chips */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          {FILTER_OPTIONS.map((opt) => (
            <button
              key={opt.key}
              className={`btn btn-sm ${filter === opt.key ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => handleFilterChange(opt.key)}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {loading && (
          <div className="loading-state">
            <p>Loading events...</p>
          </div>
        )}
        {error && !loading && (
          <div className="error-state">
            <h2>Error loading events</h2>
            <p>{error}</p>
            <button className="btn btn-primary" onClick={fetchEvents}>
              Retry
            </button>
          </div>
        )}
        {!loading && !error && events.length === 0 && (
          <div className="empty-state">
            <h2>No events found</h2>
            <p>
              {filter
                ? `No ${filter} events available.`
                : 'You haven\'t created any events yet. Click "Create Event" to get started.'}
            </p>
          </div>
        )}
        {!loading && !error && events.length > 0 && (
          <>
            <div className="data-table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Category</th>
                    <th>Registered / Spots</th>
                    <th>Checked In</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {events.map((row) => (
                    <tr key={row.id}>
                      <td>
                        <button
                          onClick={() => navigate(`/organiser/events/${row.id}`)}
                          style={{
                            background: 'none',
                            border: 'none',
                            padding: 0,
                            fontSize: 13,
                            fontWeight: 500,
                            color: 'var(--accent)',
                            cursor: 'pointer',
                            textAlign: 'left',
                          }}
                        >
                          {row.title}
                        </button>
                      </td>
                      <td>{formatDate(row.date)}</td>
                      <td>
                        {row.start_time
                          ? `${formatTime(row.start_time)} - ${formatTime(row.end_time)}`
                          : '--'}
                      </td>
                      <td style={{ textTransform: 'capitalize' }}>{row.category || '--'}</td>
                      <td>
                        {(row.registered_count ?? 0)} / {(row.spots_total ?? 0)}
                      </td>
                      <td>{row.checked_in_count ?? 0}</td>
                      <td>{getStatusBadge(row.status)}</td>
                      <td>
                        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => navigate(`/organiser/roster/${row.id}`)}
                          >
                            Roster
                          </button>
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => navigate(`/organiser/feedback/${row.id}`)}
                          >
                            Feedback
                          </button>
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => navigate(`/organiser/qna/${row.id}`)}
                          >
                            Q&A
                          </button>
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => navigate(`/organiser/onsite-controller/${row.id}`)}
                          >
                            Onsite
                          </button>
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => navigate(`/organiser/event-edit/${row.id}`)}
                          >
                            Edit
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {totalPages > 1 && (
              <div className="pagination">
                <button
                  className="page-btn"
                  disabled={page === 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  &lsaquo;
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    className={`page-btn${p === page ? ' active' : ''}`}
                    onClick={() => setPage(p)}
                  >
                    {p}
                  </button>
                ))}
                <button
                  className="page-btn"
                  disabled={page === totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  &rsaquo;
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
