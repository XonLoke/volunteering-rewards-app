import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Topbar from '../../components/Topbar';
import { apiGet } from '../../services/api';

function formatValue(cents) {
  if (cents == null) return '$0.00';
  return `$${(cents / 100).toFixed(2)}`;
}

function formatDateTime(dateStr) {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  return d.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function MerchantDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);

  const fetchDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiGet('/merchant/dashboard');
      setStats(res.data || res);
    } catch (err) {
      setError(err.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  return (
    <div className="main-content">
      <Topbar title="Dashboard" />

      <div style={{ padding: '24px' }}>
        {/* Loading */}
        {loading && (
          <div className="loading-state" style={{ minHeight: 300 }}>
            <div className="spinner" />
            <p>Loading dashboard...</p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="error-state" style={{ minHeight: 300 }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#FF3B30" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <h2>Failed to load dashboard</h2>
            <p>{error}</p>
            <button className="btn btn-primary" onClick={fetchDashboard}>Retry</button>
          </div>
        )}

        {/* Dashboard Content */}
        {!loading && !error && stats && (
          <>
            <div style={{ marginBottom: 24 }}>
              <h2 style={{ margin: '0 0 4px', fontSize: 20, fontWeight: 600, color: '#1C1C1E' }}>
                {stats.merchant_name || 'Your Store'}
              </h2>
              <p style={{ margin: 0, fontSize: 13, color: '#6C6C70' }}>
                {stats.total_redemptions} total redemptions processed
              </p>
            </div>

            {/* Stats Cards */}
            <div className="stats-grid" style={{ marginBottom: 24 }}>
              <div className="stat-card">
                <div className="stat-value" style={{ color: '#FF9500' }}>{stats.today_redemptions}</div>
                <div className="stat-label">Today's Redemptions</div>
              </div>
              <div className="stat-card">
                <div className="stat-value" style={{ color: '#FF9500' }}>{formatValue(stats.today_value_cents)}</div>
                <div className="stat-label">Today's Value</div>
              </div>
              <div className="stat-card">
                <div className="stat-value" style={{ color: '#FF9500' }}>{stats.active_products}</div>
                <div className="stat-label">Active Products</div>
              </div>
              <div className="stat-card">
                <div className="stat-value" style={{ color: '#FF9500' }}>{stats.total_redemptions}</div>
                <div className="stat-label">Total All Time</div>
              </div>
            </div>

            {/* Quick Actions */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
              <button className="btn btn-primary" onClick={() => navigate('/merchant/verify')}>
                Verify a PIN
              </button>
              <button className="btn btn-secondary" onClick={() => navigate('/merchant/products')}>
                Manage Products
              </button>
              <button className="btn btn-secondary" onClick={() => navigate('/merchant/history')}>
                View History
              </button>
            </div>

            {/* Popular Items */}
            {stats.popular_items && stats.popular_items.length > 0 && (
              <div className="card" style={{ marginBottom: 24 }}>
                <div className="card-header">
                  <h3 className="card-title">Most Popular Items</h3>
                </div>
                <div style={{ padding: '16px' }}>
                  {stats.popular_items.map((item, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '10px 0',
                        borderBottom: idx < stats.popular_items.length - 1 ? '1px solid #F2F2F5' : 'none',
                      }}
                    >
                      <span style={{ fontWeight: 500, fontSize: 14, color: '#1C1C1E' }}>
                        {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `${idx + 1}.`} {item.title}
                      </span>
                      <span style={{ fontSize: 13, color: '#6C6C70' }}>
                        {item.redemption_count} redeemed
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Activity */}
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Recent Redemptions</h3>
              </div>
              {stats.recent_activity && stats.recent_activity.length > 0 ? (
                <div style={{ padding: '0 16px 16px' }}>
                  {stats.recent_activity.map((item, idx) => (
                    <div
                      key={item.id || idx}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '12px 0',
                        borderBottom: idx < stats.recent_activity.length - 1 ? '1px solid #F2F2F5' : 'none',
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 500, fontSize: 14, color: '#1C1C1E' }}>
                          {item.coupon_title || 'Redemption'}
                        </div>
                        <div style={{ fontSize: 12, color: '#6C6C70', marginTop: 2 }}>
                          {item.volunteer_name || 'Unknown'} · {formatDateTime(item.redeemed_at)}
                        </div>
                      </div>
                      <div style={{ fontWeight: 600, fontSize: 14, color: '#FF9500' }}>
                        {formatValue(item.value_cents)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state" style={{ padding: '40px 20px' }}>
                  <p>No redemptions yet. Start by verifying a PIN.</p>
                </div>
              )}
            </div>
          </>
        )}

        {/* Empty / No data */}
        {!loading && !error && !stats && (
          <div className="empty-state" style={{ minHeight: 300 }}>
            <p>No dashboard data available yet.</p>
            <button className="btn btn-primary" onClick={() => navigate('/merchant/verify')}>
              Start Verifying PINs
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
