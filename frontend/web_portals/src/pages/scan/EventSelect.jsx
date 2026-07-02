import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiGet } from '../../services/api';
import { useToast } from '../../components/Toast';

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function formatTime(start, end) {
  const fmt = (t) => {
    if (!t) return '';
    const [h, m] = t.split(':');
    const hour = parseInt(h, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const h12 = hour % 12 || 12;
    return `${h12}:${m} ${ampm}`;
  };
  if (start && end) return `${fmt(start)} - ${fmt(end)}`;
  if (start) return fmt(start);
  return '';
}

export default function EventSelect() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await apiGet('/events/today');
      setEvents(res.data || []);
    } catch (err) {
      // Gracefully degrade: treat all load failures as "no events today"
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const today = new Date();
  const todayStr = today.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    navigate('/scan');
  };

  if (loading) {
    return (
      <div style={styles.wrapper}>
        <div style={styles.container}>
          <div className="loading-state" style={{ minHeight: 300 }}>
            <div style={styles.spinnerLarge} />
            <p>Loading today's events...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.wrapper}>
      <div style={styles.container}>
        <div style={styles.topBar}>
          <div>
            <h1 style={styles.heading}>Today's Events</h1>
            <p style={styles.date}>{todayStr}</p>
          </div>
          <button
            style={styles.logoutBtn}
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>

        {events.length === 0 ? (
          <div className="empty-state" style={{ minHeight: 300 }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#6C6C70" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <h2>No events scheduled for today</h2>
            <p className="muted">Check back later for upcoming events.</p>
            <button
              style={styles.retryBtn}
              onClick={fetchEvents}
            >
              Refresh
            </button>
          </div>
        ) : (
          <div style={styles.eventList}>
            {events.map((event) => {
              const checkedIn = event.total_checked_in || 0;
              const registered = event.total_registered || 0;
              const progress = registered > 0 ? (checkedIn / registered) * 100 : 0;

              return (
                <div key={event.id} style={styles.eventCard}>
                  <div style={styles.eventHeader}>
                    <h2 style={styles.eventTitle}>{event.title}</h2>
                    <span style={styles.eventPoints}>+{event.points_awarded || 0} pts</span>
                  </div>

                  <div style={styles.eventMeta}>
                    <div style={styles.metaItem}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6C6C70" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                      </svg>
                      <span>{event.start_time ? formatTime(event.start_time, event.end_time) : 'All day'}</span>
                    </div>
                    {event.location && (
                      <div style={styles.metaItem}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6C6C70" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
                        </svg>
                        <span>{event.location}</span>
                      </div>
                    )}
                  </div>

                  <div style={styles.progressSection}>
                    <div style={styles.progressLabel}>
                      <span>Attendance</span>
                      <span style={styles.progressCount}>
                        {checkedIn} / {registered} checked in
                      </span>
                    </div>
                    <div style={styles.progressTrack}>
                      <div
                        style={{
                          ...styles.progressFill,
                          width: `${Math.min(progress, 100)}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div style={styles.cardActions}>
                    <button
                      style={styles.openScannerBtn}
                      onClick={() => navigate(`/scan/scanner/${event.id}`)}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 7V5a2 2 0 0 1 2-2h2" /><path d="M17 3h2a2 2 0 0 1 2 2v2" /><path d="M21 17v2a2 2 0 0 1-2 2h-2" /><path d="M7 21H5a2 2 0 0 1-2-2v-2" />
                        <line x1="7" y1="12" x2="17" y2="12" />
                      </svg>
                      Open Scanner
                    </button>
                    <button
                      style={styles.rosterBtn}
                      onClick={() => navigate(`/scan/roster/${event.id}`)}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
                      </svg>
                      View Roster
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    padding: 24,
    minHeight: '100vh',
    background: '#F5F5F7',
  },
  container: {
    maxWidth: 640,
    margin: '0 auto',
  },
  topBar: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 16,
  },
  heading: {
    fontSize: 24,
    fontWeight: 700,
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'SF Pro Display', system-ui, sans-serif",
    color: '#1C1C1E',
    margin: 0,
  },
  date: {
    fontSize: 14,
    color: '#6C6C70',
    margin: '4px 0 0',
  },
  logoutBtn: {
    padding: '8px 16px',
    borderRadius: 8,
    fontSize: 13,
    fontWeight: 500,
    background: '#F2F2F5',
    color: '#1C1C1E',
    border: 'none',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    minHeight: 36,
  },
  spinnerLarge: {
    width: 32,
    height: 32,
    border: '3px solid #E0E0E5',
    borderTopColor: '#34C759',
    borderRadius: '50%',
    animation: 'spin 0.6s linear infinite',
  },
  retryBtn: {
    padding: '10px 24px',
    borderRadius: 10,
    fontSize: 14,
    fontWeight: 600,
    background: '#34C759',
    color: '#FFFFFF',
    border: 'none',
    cursor: 'pointer',
    minHeight: 44,
  },
  eventList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
  },
  eventCard: {
    background: '#FFFFFF',
    borderRadius: 14,
    padding: 20,
    boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
    border: '1px solid #E0E0E5',
  },
  eventHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 12,
  },
  eventTitle: {
    fontSize: 17,
    fontWeight: 600,
    color: '#1C1C1E',
    margin: 0,
    flex: 1,
  },
  eventPoints: {
    fontSize: 13,
    fontWeight: 600,
    color: '#34C759',
    background: '#E8F8E8',
    padding: '4px 10px',
    borderRadius: 99,
    whiteSpace: 'nowrap',
  },
  eventMeta: {
    display: 'flex',
    gap: 16,
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  metaItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    fontSize: 13,
    color: '#6C6C70',
  },
  progressSection: {
    marginBottom: 16,
  },
  progressLabel: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: 12,
    color: '#6C6C70',
    marginBottom: 6,
  },
  progressCount: {
    fontWeight: 600,
    color: '#1C1C1E',
  },
  progressTrack: {
    width: '100%',
    height: 6,
    background: '#F2F2F5',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    background: '#34C759',
    borderRadius: 3,
    transition: 'width 0.3s ease',
  },
  cardActions: {
    display: 'flex',
    gap: 12,
  },
  openScannerBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    flex: 1,
    minHeight: 48,
    padding: '12px 20px',
    borderRadius: 10,
    fontSize: 15,
    fontWeight: 600,
    background: '#34C759',
    color: '#FFFFFF',
    border: 'none',
    cursor: 'pointer',
    transition: 'background 0.15s',
  },
  rosterBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    flex: 1,
    minHeight: 48,
    padding: '12px 20px',
    borderRadius: 10,
    fontSize: 15,
    fontWeight: 500,
    background: '#F2F2F5',
    color: '#1C1C1E',
    border: 'none',
    cursor: 'pointer',
    transition: 'background 0.15s',
  },
};
