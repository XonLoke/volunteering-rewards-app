import { useState, useEffect } from 'react';
import Topbar from '../../components/Topbar';
import Sidebar from '../../components/Sidebar';
import { apiGet } from '../../services/api';

const NAV_ITEMS = [
  {
    section: 'Management',
    children: [
      { label: 'Dashboard', path: '/admin', icon: '⌂', exact: true },
      { label: 'Users', path: '/admin/users', icon: '☺' },
      { label: 'Organisers', path: '/admin/organisers', icon: '☰' },
      { label: 'Events', path: '/admin/events', icon: '★' },
      { label: 'Coupons', path: '/admin/coupons', icon: '☆' },
    ],
  },
  {
    section: 'Rewards',
    children: [
      { label: 'Redemptions', path: '/admin/redemptions', icon: '⇄' },
      { label: 'Configuration', path: '/admin/rewards', icon: '⚙' },
      { label: 'PIN Verify', path: '/admin/pin-verify', icon: '✓' },
    ],
  },
  {
    section: 'More',
    children: [
      { label: 'QR Codes', path: '/admin/qr-codes', icon: '▦' },
      { label: 'Merchants', path: '/admin/merchants', icon: '⌂' },
      { label: 'Campaigns', path: '/admin/campaigns', icon: '★' },
    ],
  },
];

function StatCard({ value, label, change, negative }) {
  return (
    <div className="stat-card">
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
      {change != null && (
        <div className={`stat-change${negative ? ' negative' : ''}`}>
          {negative ? '↓' : '↑'} {change}
        </div>
      )}
    </div>
  );
}

function ActivityFeed({ activities }) {
  if (!activities || activities.length === 0) {
    return (
      <div className="card">
        <div className="empty-state">
          <p>No recent activity.</p>
        </div>
      </div>
    );
  }

  const getIcon = (type) => {
    switch (type) {
      case 'user': return '☺';
      case 'event': return '★';
      case 'coupon': return '☆';
      case 'redeem': return '⇄';
      case 'org': return '☰';
      default: return '●';
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">Recent Activity</h3>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {activities.map((item, idx) => (
          <div
            key={idx}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px',
              fontSize: '13px',
              padding: '8px 0',
              borderBottom: idx < activities.length - 1 ? '1px solid var(--border)' : 'none',
            }}
          >
            <span style={{ fontSize: '16px', flexShrink: 0, opacity: 0.6 }}>
              {getIcon(item.type)}
            </span>
            <div style={{ flex: 1 }}>
              <p style={{ margin: 0, color: 'var(--fg)' }}>{item.description}</p>
              <p style={{ margin: '2px 0 0', fontSize: '12px', color: 'var(--muted)' }}>
                {item.timestamp}
              </p>
            </div>
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
      const res = await apiGet('/admin/dashboard');
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

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return d.toLocaleTimeString('en-US', {
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

  const stats = data?.stats || {};
  const recentActivity = data?.recent_activity || [];
  const currentDate = data?.current_date;
  const lastUpdated = data?.last_updated;

  return (
    <div>
      <Topbar title="Dashboard" />
      <div className="main-content">
        <div className="page-header">
          <div>
            <h2 className="page-title">Dashboard</h2>
            {currentDate && (
              <p style={{ fontSize: '13px', color: 'var(--muted)', marginTop: 4 }}>
                {formatDate(currentDate)}
                {lastUpdated && ` • Last updated ${formatTime(lastUpdated)}`}
              </p>
            )}
          </div>
        </div>

        <div className="stats-grid">
          <StatCard
            value={stats.total_users ?? '--'}
            label="Total Users"
            change={stats.users_growth_pct != null ? `${stats.users_growth_pct}% this month` : null}
          />
          <StatCard
            value={stats.total_organisers ?? '--'}
            label="Total Organisers"
            change={stats.pending_approvals > 0 ? `${stats.pending_approvals} pending approval` : 'No pending'}
          />
          <StatCard
            value={stats.total_coupons_issued_today ?? '--'}
            label="Coupons Issued Today"
            change={stats.coupons_growth_pct != null ? `${stats.coupons_growth_pct}% vs yesterday` : null}
          />
          <StatCard
            value={stats.total_redemptions_today ?? '--'}
            label="Redemptions Today"
            change={stats.total_redemptions_today > 0 ? 'Today' : 'No redemptions yet'}
          />
          <StatCard
            value={stats.total_merchants ?? 0}
            label="Total Merchants"
            change={null}
          />
          <StatCard
            value={stats.no_show_count ?? 0}
            label="No-Show Alerts"
            change={stats.no_show_count > 0 ? 'Registered but didn\'t attend' : null}
            negative={stats.no_show_count > 0}
          />
        </div>

        <ActivityFeed activities={recentActivity} />
      </div>
    </div>
  );
}
