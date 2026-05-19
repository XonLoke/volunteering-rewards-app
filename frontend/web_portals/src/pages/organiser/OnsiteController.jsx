import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Topbar from '../../components/Topbar';
import { useToast } from '../../components/Toast';
import { apiGet, apiPost } from '../../services/api';

function ProgressCircle({ checkedIn, total }) {
  const pct = total > 0 ? Math.round((checkedIn / total) * 100) : 0;
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (pct / 100) * circumference;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      <svg width="150" height="150" viewBox="0 0 150 150">
        <circle
          cx="75"
          cy="75"
          r={radius}
          fill="none"
          stroke="#F0F0F2"
          strokeWidth="10"
        />
        <circle
          cx="75"
          cy="75"
          r={radius}
          fill="none"
          stroke={pct === 100 ? 'var(--success)' : 'var(--accent)'}
          strokeWidth="10"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 75 75)"
          style={{ transition: 'stroke-dashoffset 0.6s ease' }}
        />
        <text
          x="75"
          y="75"
          textAnchor="middle"
          dominantBaseline="central"
          style={{ fontSize: 28, fontWeight: 700, fontFamily: 'var(--font-display)' }}
        >
          {checkedIn}/{total}
        </text>
      </svg>
      <div className="stat-label">Checked In</div>
    </div>
  );
}

export default function OnsiteController() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [roster, setRoster] = useState(null);
  const [checkingIn, setCheckingIn] = useState(null);

  const fetchRoster = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiGet(`/organiser/events/${id}/roster`);
      setRoster(res);
    } catch (err) {
      setError(err.message || 'Failed to load event data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoster();
  }, [id]);

  const notCheckedIn = useMemo(() => {
    if (!roster?.volunteers) return [];
    return roster.volunteers.filter((v) => !v.is_checked_in);
  }, [roster]);

  const totalRegistered = roster?.total_registered ?? 0;
  const totalCheckedIn = roster?.total_checked_in ?? 0;

  const handleManualCheckIn = async (volunteer) => {
    setCheckingIn(volunteer.user_id);
    try {
      await apiPost('/attendance/scan', {
        volunteer_id: volunteer.user_id,
        event_id: parseInt(id, 10),
        scanned_at: new Date().toISOString(),
      });
      toast(`${volunteer.name} checked in successfully!`, 'success');
      fetchRoster();
    } catch (err) {
      toast(err.message || 'Failed to check in volunteer', 'error');
    } finally {
      setCheckingIn(null);
    }
  };

  const formatDateTime = (dateStr) => {
    if (!dateStr) return '--';
    try {
      return new Date(dateStr).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  if (loading) {
    return (
      <div>
        <Topbar title="Onsite Controller" />
        <div className="main-content">
          <div className="loading-state">
            <p>Loading onsite data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <Topbar title="Onsite Controller" />
        <div className="main-content">
          <div className="error-state">
            <h2>Error loading onsite data</h2>
            <p>{error}</p>
            <button className="btn btn-primary" onClick={fetchRoster}>
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Topbar title="Onsite Controller" />
      <div className="main-content">
        <div className="page-header">
          <div>
            <h2 className="page-title">{roster?.event_title || 'Onsite Controller'}</h2>
            <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 4 }}>
              Manage on-the-day check-ins
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

        {/* Progress */}
        <div className="card" style={{ marginBottom: 24, textAlign: 'center' }}>
          <ProgressCircle checkedIn={totalCheckedIn} total={totalRegistered} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          {/* QR Code Section */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Scan QR Code</h3>
            </div>
            <div
              style={{
                textAlign: 'center',
                padding: 32,
                border: '2px dashed var(--border)',
                borderRadius: 'var(--radius-md)',
              }}
            >
              <div style={{ fontSize: 48, marginBottom: 12, opacity: 0.3 }}>▦</div>
              <p style={{ fontSize: 14, color: 'var(--muted)', margin: 0 }}>
                Use a scanning app for QR code scanning
              </p>
              <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>
                Volunteers present their QR code for quick check-in
              </p>
            </div>
          </div>

          {/* Manual Check-in Section */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Manual Check-in</h3>
              {notCheckedIn.length > 0 && (
                <span className="status-badge pending">{notCheckedIn.length} pending</span>
              )}
            </div>

            {notCheckedIn.length === 0 ? (
              <div className="empty-state" style={{ padding: 20 }}>
                <p>All volunteers have checked in!</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {notCheckedIn.map((v) => (
                  <div
                    key={v.user_id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 12px',
                      background: 'var(--accent-subtle)',
                      borderRadius: 'var(--radius-md)',
                    }}
                  >
                    <div>
                      <p style={{ margin: 0, fontSize: 13, fontWeight: 500 }}>
                        {v.name || 'Unknown'}
                      </p>
                      <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--muted)' }}>
                        {v.email || '--'}
                        {v.registered_at && ` • Registered ${formatDateTime(v.registered_at)}`}
                      </p>
                    </div>
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => handleManualCheckIn(v)}
                      disabled={checkingIn === v.user_id}
                    >
                      {checkingIn === v.user_id ? '...' : 'Check In'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
