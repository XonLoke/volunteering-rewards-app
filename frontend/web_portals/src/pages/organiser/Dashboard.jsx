import { useState, useEffect } from 'react';
import Topbar from '../../components/Topbar';
import StatusBadge from '../../components/StatusBadge';
import { apiGet } from '../../services/api';

function StatCard({ value, label, icon }) {
  return (
    <div className="stat-card">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontSize: 24, opacity: 0.5 }}>{icon}</span>
        <div>
          <div className="stat-value">{value ?? '--'}</div>
          <div className="stat-label">{label}</div>
        </div>
      </div>
    </div>
  );
}

function ActivityFeed({ activities }) {
  if (!activities || activities.length === 0) {
    return (
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Recent Activity</h3>
        </div>
        <div className="empty-state">
          <p>No recent activity yet.</p>
        </div>
      </div>
    );
  }

  const getIcon = (type) => {
    switch (type) {
      case 'check_in': return '✓';
      case 'event': return '★';
      case 'register': return '☺';
      case 'feedback': return '♡';
      default: return '●';
    }
  };

  const formatTimestamp = (ts) => {
    if (!ts) return '';
    try {
      const d = new Date(ts);
      const now = new Date();
      const diff = now - d;
      const mins = Math.floor(diff / 60000);
      if (mins < 1) return 'Just now';
      if (mins < 60) return `${mins}m ago`;
      const hours = Math.floor(mins / 60);
      if (hours < 24) return `${hours}h ago`;
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch {
      return ts;
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">Recent Activity</h3>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {activities.map((item, idx) => (
          <div
            key={idx}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              fontSize: '13px',
              padding: '10px 0',
              borderBottom: idx < activities.length - 1 ? '1px solid var(--border)' : 'none',
            }}
          >
            <span style={{ fontSize: '16px', flexShrink: 0, opacity: 0.5 }}>
              {getIcon(item.type)}
            </span>
            <div style={{ flex: 1 }}>
              <p style={{ margin: 0, color: 'var(--fg)' }}>
                <strong>{item.volunteer_name}</strong> checked in for{' '}
                <strong>{item.event_title}</strong>
              </p>
            </div>
            <span style={{ fontSize: '12px', color: 'var(--muted)', whiteSpace: 'nowrap' }}>
              {formatTimestamp(item.timestamp)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  const fetchDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiGet('/organiser/dashboard');
      setData(res);
    } catch (err) {
      setError(err.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div>
        <Topbar title="Dashboard" />
        <div className="main-content">
          <div className="loading-state">
            <p>Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <Topbar title="Dashboard" />
        <div className="main-content">
          <div className="error-state">
            <h2>Error loading dashboard</h2>
            <p>{error}</p>
            <button className="btn btn-primary" onClick={fetchDashboard}>
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  const org = data?.organisation || {};
  const stats = data?.stats || {};
  const recentActivity = data?.recent_activity || [];

  return (
    <div>
      <Topbar title="Dashboard" />
      <div className="main-content">
        <div className="page-header">
          <div>
            <h2 className="page-title">Organiser Dashboard</h2>
          </div>
        </div>

        {/* Organisation Card */}
        <div
          className="card"
          style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 16 }}
        >
          {org.logo_url && (
            <img
              src={org.logo_url}
              alt={org.name}
              style={{ width: 48, height: 48, borderRadius: 8, objectFit: 'cover' }}
            />
          )}
          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: 17, fontWeight: 600, margin: 0 }}>{org.name || 'Your Organisation'}</h3>
          </div>
          {org.status && <StatusBadge status={org.status} />}
        </div>

        {/* Stats Grid */}
        <div className="stats-grid">
          <StatCard value={stats.total_events ?? 0} label="Total Events" icon="★" />
          <StatCard value={stats.upcoming_events ?? 0} label="Upcoming Events" icon="☰" />
          <StatCard value={stats.total_volunteers_checked_in ?? 0} label="Volunteers Checked In" icon="✓" />
          <StatCard
            value={stats.average_rating != null ? stats.average_rating.toFixed(1) : '--'}
            label="Average Rating"
            icon="♡"
          />
        </div>

        {/* Recent Activity */}
        <ActivityFeed activities={recentActivity} />
      </div>
    </div>
  );
}
