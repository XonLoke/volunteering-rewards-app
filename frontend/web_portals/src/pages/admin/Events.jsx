import { useState, useEffect, useCallback } from 'react';
import Topbar from '../../components/Topbar';
import DataTable from '../../components/DataTable';
import StatusBadge from '../../components/StatusBadge';
import Modal from '../../components/Modal';
import { useToast } from '../../components/Toast';
import { apiGet, apiDel } from '../../services/api';

const FILTER_OPTIONS = [
  { key: '', label: 'All' },
  { key: 'upcoming', label: 'Upcoming' },
  { key: 'past', label: 'Past' },
];

function ParticipationPanel({ eventId, onClose }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  useEffect(() => {
    if (!eventId) return;
    const fetchParticipation = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await apiGet(`/admin/events/${eventId}/participation`);
        setData(res);
      } catch (err) {
        setError(err.message || 'Failed to load participation data');
      } finally {
        setLoading(false);
      }
    };
    fetchParticipation();
  }, [eventId]);

  if (loading) {
    return (
      <div style={{ padding: 16 }}>
        <div className="loading-state">
          <p>Loading participation data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: 16 }}>
        <div className="error-state">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div style={{ padding: 16, borderTop: '1px solid var(--border)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div>
          <h4 style={{ fontSize: 14, fontWeight: 600 }}>{data.event?.title}</h4>
          <p style={{ fontSize: 12, color: 'var(--muted)' }}>
            {data.event?.organiser_name} &middot;{' '}
            {data.event?.date ? new Date(data.event.date).toLocaleDateString() : '--'}
          </p>
        </div>
        <button
          className="btn btn-secondary btn-sm"
          onClick={onClose}
        >
          Close
        </button>
      </div>
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <div className="stat-card" style={{ padding: 16, textAlign: 'center' }}>
          <div className="stat-value" style={{ fontSize: 24 }}>
            {data.participation?.total_registered ?? 0}
          </div>
          <div className="stat-label">Registered</div>
        </div>
        <div className="stat-card" style={{ padding: 16, textAlign: 'center' }}>
          <div className="stat-value" style={{ fontSize: 24 }}>
            {data.participation?.total_checked_in ?? 0}
          </div>
          <div className="stat-label">Checked In</div>
        </div>
        <div className="stat-card" style={{ padding: 16, textAlign: 'center' }}>
          <div className="stat-value" style={{ fontSize: 24 }}>
            {data.participation?.average_rating != null
              ? data.participation.average_rating.toFixed(1)
              : '--'}
          </div>
          <div className="stat-label">Avg Rating</div>
        </div>
        <div className="stat-card" style={{ padding: 16, textAlign: 'center' }}>
          <div className="stat-value" style={{ fontSize: 24 }}>
            {data.participation?.feedback_count ?? 0}
          </div>
          <div className="stat-label">Feedback</div>
        </div>
      </div>
    </div>
  );
}

function DeleteEventModal({ isOpen, onClose, event, onConfirm }) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Delete Event"
      actions={[
        { label: 'Cancel', variant: 'secondary', onClick: onClose },
        {
          label: 'Delete',
          variant: 'danger',
          onClick: () => onConfirm(event),
        },
      ]}
    >
      <p style={{ fontSize: 14 }}>
        Are you sure you want to delete <strong>"{event?.title}"</strong>? This action cannot be undone.
      </p>
    </Modal>
  );
}

export default function Events() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [events, setEvents] = useState([]);
  const [total, setTotal] = useState(0);
  const [filter, setFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(15);
  const [expandedId, setExpandedId] = useState(null);
  const [deleteEvent, setDeleteEvent] = useState(null);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { page, limit: pageSize };
      if (filter) params.status = filter;
      const res = await apiGet('/admin/events', params);
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
    setExpandedId(null);
  };

  const handleToggleExpand = (eventId) => {
    setExpandedId((prev) => (prev === eventId ? null : eventId));
  };

  const handleDeleteEvent = async (event) => {
    try {
      await apiDel(`/admin/events/${event.id}`);
      toast(`Event "${event.title}" deleted`, 'success');
      setDeleteEvent(null);
      if (expandedId === event.id) setExpandedId(null);
      fetchEvents();
    } catch (err) {
      toast(err.message || 'Failed to delete event', 'error');
    }
  };

  const getStatusBadge = (status) => {
    const map = {
      upcoming: 'pending',
      past: 'approved',
      cancelled: 'rejected',
    };
    return <StatusBadge status={map[status] || status} />;
  };

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div>
      <Topbar title="Events" />
      <div className="main-content">
        <div className="page-header">
          <h2 className="page-title">Events Overview</h2>
          <div className="page-actions">
            <div style={{ display: 'flex', gap: 8 }}>
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
          </div>
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
                : 'No events have been created yet.'}
            </p>
          </div>
        )}
        {!loading && !error && events.length > 0 && (
          <>
            <div className="data-table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Event Title</th>
                    <th>Organiser</th>
                    <th>Date</th>
                    <th>Registered</th>
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
                          onClick={() => handleToggleExpand(row.id)}
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
                          {expandedId === row.id ? '▼' : '▶'} {row.title}
                        </button>
                      </td>
                      <td>{row.organiser_name || '--'}</td>
                      <td>{row.date ? new Date(row.date).toLocaleDateString() : '--'}</td>
                      <td>{row.registered_count ?? 0}</td>
                      <td>{row.checked_in_count ?? 0}</td>
                      <td>{getStatusBadge(row.status)}</td>
                      <td>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => setDeleteEvent(row)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {expandedId && (
                <ParticipationPanel
                  eventId={expandedId}
                  onClose={() => setExpandedId(null)}
                />
              )}
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

      <DeleteEventModal
        isOpen={!!deleteEvent}
        onClose={() => setDeleteEvent(null)}
        event={deleteEvent}
        onConfirm={handleDeleteEvent}
      />
    </div>
  );
}
