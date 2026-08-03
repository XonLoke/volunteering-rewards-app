import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiGet } from '../../services/api';

function formatCheckinTime(timeStr) {
  if (!timeStr) return null;
  const d = new Date(timeStr);
  return d.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

export default function Roster() {
  const { eventId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [eventData, setEventData] = useState(null);
  const [volunteers, setVolunteers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchRoster = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiGet(`/events/${eventId}/roster`);
      setEventData({
        title: res.event_title,
        totalRegistered: res.total_registered || 0,
        totalCheckedIn: res.total_checked_in || 0,
      });
      setVolunteers(res.volunteers || []);
    } catch (err) {
      setError(err.message || 'Failed to load roster');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoster();
  }, [eventId]);

  const filteredVolunteers = useMemo(() => {
    if (!searchQuery.trim()) return volunteers;
    const q = searchQuery.toLowerCase();
    return volunteers.filter(
      (v) =>
        (v.name && v.name.toLowerCase().includes(q)) ||
        (v.email && v.email.toLowerCase().includes(q))
    );
  }, [volunteers, searchQuery]);

  const checkedInCount = volunteers.filter((v) => v.is_checked_in).length;
  const totalCount = volunteers.length;
  const progress = totalCount > 0 ? (checkedInCount / totalCount) * 100 : 0;

  if (loading) {
    return (
      <div style={styles.wrapper}>
        <div style={styles.container}>
          <div className="loading-state" style={{ minHeight: 300 }}>
            <div style={styles.spinnerLarge} />
            <p>Loading roster...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.wrapper}>
        <div style={styles.container}>
          <div className="error-state" style={{ minHeight: 300 }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#FF3B30" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <h2>Failed to load roster</h2>
            <p>{error}</p>
            <button style={styles.retryBtn} onClick={fetchRoster}>
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.wrapper}>
      <div style={styles.container}>
        {/* Header */}
        <div style={styles.header}>
          <button style={styles.backIcon} onClick={() => navigate('/scan/events')}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <div style={styles.headerInfo}>
            <h1 style={styles.heading}>Attendance Roster</h1>
            <p style={styles.eventName}>{eventData?.title || 'Event'}</p>
          </div>
          <button style={styles.refreshBtn} onClick={fetchRoster} title="Refresh roster">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="23 4 23 10 17 10" />
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
            </svg>
          </button>
        </div>

        {/* Progress overview */}
        <div style={styles.progressCard}>
          <div style={styles.progressHeader}>
            <span style={styles.progressTitle}>Attendance Progress</span>
            <span style={styles.progressCount}>
              {checkedInCount} / {totalCount} checked in
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

        {/* Search */}
        <div style={styles.searchWrap}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6C6C70" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            style={styles.searchInput}
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button style={styles.clearSearch} onClick={() => setSearchQuery('')}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6C6C70" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </div>

        {/* Volunteer list */}
        {filteredVolunteers.length === 0 ? (
          <div className="empty-state" style={{ minHeight: 200 }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#6C6C70" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            <h2>{searchQuery ? 'No volunteers match your search' : 'No volunteers registered'}</h2>
          </div>
        ) : (
          <div style={styles.volunteerList}>
            {filteredVolunteers.map((vol, idx) => {
              const initials = (vol.name || '?')
                .split(' ')
                .map((n) => n[0])
                .join('')
                .toUpperCase()
                .slice(0, 2);

              return (
                <div key={vol.user_id || idx} style={styles.volunteerCard}>
                  <div style={styles.avatar}>
                    {initials}
                  </div>
                  <div style={styles.volInfo}>
                    <p style={styles.volName}>{vol.name || 'Unknown'}</p>
                    <p style={styles.volEmail}>{vol.email || ''}</p>
                    {vol.is_checked_in && (vol.checked_in_at || vol.check_in_time) && (
                      <p style={styles.checkedInTime}>
                        Checked in at {formatCheckinTime(vol.checked_in_at || vol.check_in_time)}
                      </p>
                    )}
                  </div>
                  <div
                    style={{
                      ...styles.statusIcon,
                      background: vol.is_checked_in ? '#E8F8E8' : '#F2F2F5',
                    }}
                    title={vol.is_checked_in ? 'Checked in' : 'Not checked in'}
                  >
                    {vol.is_checked_in ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#34C759" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#C7C7CC" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    )}
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
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  backIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    height: 40,
    borderRadius: 10,
    background: '#FFFFFF',
    border: '1px solid #E0E0E5',
    cursor: 'pointer',
    flexShrink: 0,
  },
  headerInfo: {
    flex: 1,
  },
  heading: {
    fontSize: 22,
    fontWeight: 700,
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'SF Pro Display', system-ui, sans-serif",
    color: '#1C1C1E',
    margin: 0,
  },
  eventName: {
    fontSize: 14,
    color: '#6C6C70',
    margin: '2px 0 0',
  },
  refreshBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    height: 40,
    borderRadius: 10,
    background: '#FFFFFF',
    border: '1px solid #E0E0E5',
    cursor: 'pointer',
    flexShrink: 0,
    color: '#6C6C70',
  },
  progressCard: {
    background: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    border: '1px solid #E0E0E5',
    marginBottom: 16,
  },
  progressHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressTitle: {
    fontSize: 13,
    fontWeight: 500,
    color: '#6C6C70',
  },
  progressCount: {
    fontSize: 13,
    fontWeight: 600,
    color: '#1C1C1E',
  },
  progressTrack: {
    width: '100%',
    height: 8,
    background: '#F2F2F5',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    background: '#34C759',
    borderRadius: 4,
    transition: 'width 0.3s ease',
  },
  searchWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    background: '#FFFFFF',
    borderRadius: 10,
    padding: '0 14px',
    border: '1px solid #E0E0E5',
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    minHeight: 44,
    padding: '10px 0',
    border: 'none',
    fontSize: 15,
    background: 'transparent',
    outline: 'none',
  },
  clearSearch: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 28,
    height: 28,
    borderRadius: '50%',
    background: '#F2F2F5',
    border: 'none',
    cursor: 'pointer',
    flexShrink: 0,
  },
  volunteerList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  volunteerCard: {
    display: 'flex',
    alignItems: 'center',
    gap: 14,
    background: '#FFFFFF',
    borderRadius: 12,
    padding: '14px 16px',
    border: '1px solid #E0E0E5',
    minHeight: 56,
  },
  avatar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    height: 40,
    borderRadius: '50%',
    background: '#E8F8E8',
    color: '#34C759',
    fontSize: 13,
    fontWeight: 600,
    flexShrink: 0,
  },
  volInfo: {
    flex: 1,
    minWidth: 0,
  },
  volName: {
    fontSize: 15,
    fontWeight: 600,
    color: '#1C1C1E',
    margin: 0,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  volEmail: {
    fontSize: 12,
    color: '#6C6C70',
    margin: '1px 0 0',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  checkedInTime: {
    fontSize: 11,
    color: '#34C759',
    margin: '2px 0 0',
    fontWeight: 500,
  },
  statusIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 36,
    height: 36,
    borderRadius: '50%',
    flexShrink: 0,
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
    marginTop: 8,
  },
};
