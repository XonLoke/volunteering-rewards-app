import { useState, useEffect, useCallback } from 'react';
import Topbar from '../../components/Topbar';
import { apiGet } from '../../services/api';

export default function QRCodes() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [events, setEvents] = useState([]);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiGet('/admin/events', { page: 1, limit: 50 });
      setEvents(res.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load events');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  return (
    <div>
      <Topbar title="QR Codes" />
      <div className="main-content">
        <div className="page-header">
          <h2 className="page-title">QR Code Management</h2>
        </div>

        <div className="card" style={{ marginBottom: 24 }}>
          <div className="card-header">
            <h3 className="card-title">How QR Codes Work</h3>
          </div>
          <div style={{ fontSize: 14, lineHeight: 1.7, color: 'var(--fg)' }}>
            <p style={{ marginBottom: 8 }}>
              QR codes are automatically generated for each event when it is created by an organiser.
              The QR code is used for check-in at the event venue, allowing volunteers to scan in
              and earn points for their participation.
            </p>
            <p style={{ marginBottom: 8 }}>
              Each QR code encodes the unique event ID and a verification token. When scanned by the
              event organiser's mobile app, the volunteer is checked in and points are awarded
              automatically based on the default event points configuration.
            </p>
            <p>
              QR codes can be downloaded by the event organiser from their dashboard and printed
              for display at the event check-in desk.
            </p>
          </div>
        </div>

        <div className="card-header">
          <h3 className="card-title">Events with QR Code Status</h3>
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
            <h2>No events yet</h2>
            <p>Events will appear here once they are created.</p>
          </div>
        )}
        {!loading && !error && events.length > 0 && (
          <div className="data-table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Event Title</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>QR Code Status</th>
                </tr>
              </thead>
              <tbody>
                {events.map((event) => (
                  <tr key={event.id}>
                    <td style={{ fontWeight: 500 }}>{event.title}</td>
                    <td>
                      {event.date ? new Date(event.date).toLocaleDateString() : '--'}
                    </td>
                    <td>
                      <span className="status-badge approved">{event.status || 'upcoming'}</span>
                    </td>
                    <td>
                      <span className="status-badge active">
                        {event.status === 'upcoming' ? 'Generated' : 'Archived'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
