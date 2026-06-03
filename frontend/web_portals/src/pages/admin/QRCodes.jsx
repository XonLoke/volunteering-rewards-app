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
              Each volunteer has a unique QR code embedded in their profile. When a volunteer attends
              an event, they present their QR code to the organiser, who scans it using the on-site
              controller mobile app to confirm attendance and award points.
            </p>
            <p style={{ marginBottom: 8 }}>
              The volunteer's QR code can be found in their profile page under "My QR Code" and is
              also used for coupon redemption at merchant outlets.
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
                  <th>Participants</th>
                  <th>Status</th>
                  <th>Organiser</th>
                </tr>
              </thead>
              <tbody>
                {events.map((event) => (
                  <tr key={event.id}>
                    <td style={{ fontWeight: 500 }}>{event.title}</td>
                    <td>
                      {event.date ? new Date(event.date).toLocaleDateString() : '--'}
                    </td>
                    <td style={{ textAlign: 'center', fontWeight: 500 }}>
                      {event.registered_count ?? 0}
                    </td>
                    <td>
                      <span className="status-badge approved">{event.status || 'upcoming'}</span>
                    </td>
                    <td>
                      {event.organiser_name || '--'}
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
