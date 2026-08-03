import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiGet } from '../../services/api';
import StatusBadge from '../../components/StatusBadge';
import Topbar from '../../components/Topbar';

const CENTS_PER_POINT = 100;

function formatValue(cents) {
  if (cents == null) return '-';
  return `$${(cents / CENTS_PER_POINT).toFixed(2)}`;
}

function formatDateTime(dateStr) {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  return d.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatDateShort(dateStr) {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

const DATE_FILTERS = [
  { label: 'Today', value: 'today' },
  { label: 'This Week', value: 'week' },
  { label: 'This Month', value: 'month' },
  { label: 'All', value: 'all' },
];

const PAGE_SIZE = 10;

function getFilterRange(filter) {
  const now = new Date();
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);

  switch (filter) {
    case 'today':
      return { start, end: now };
    case 'week': {
      const day = start.getDay();
      const diff = start.getDate() - day + (day === 0 ? -6 : 1);
      start.setDate(diff);
      return { start, end: now };
    }
    case 'month':
      start.setDate(1);
      return { start, end: now };
    case 'all':
    default:
      return { start: null, end: null };
  }
}

function maskPin(pin) {
  if (!pin) return '-';
  if (pin.length <= 4) return '*'.repeat(pin.length);
  return '****' + pin.slice(-2);
}

export default function History() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [redemptions, setRedemptions] = useState([]);
  const [dateFilter, setDateFilter] = useState('today');
  const [currentPage, setCurrentPage] = useState(1);

  const fetchHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiGet('/merchant/history');
      setRedemptions(res.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load redemption history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  // Inject responsive styles
  useEffect(() => {
    const styleId = 'merchant-history-responsive';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        @media (min-width: 640px) {
          .merchant-table-wrap { display: block !important; }
          .merchant-mobile-list { display: none !important; }
        }
        @media (max-width: 639px) {
          .merchant-table-wrap { display: none !important; }
          .merchant-mobile-list { display: flex !important; }
        }
      `;
      document.head.appendChild(style);
    }
    return () => {
      const el = document.getElementById(styleId);
      if (el) el.remove();
    };
  }, []);

  const handleFilterChange = (filter) => {
    setDateFilter(filter);
    setCurrentPage(1);
  };

  const filteredData = useMemo(() => {
    const { start, end } = getFilterRange(dateFilter);
    if (!start) return redemptions;
    return redemptions.filter((r) => {
      const d = new Date(r.redeemed_at || r.created_at);
      return d >= start && d <= end;
    });
  }, [redemptions, dateFilter]);

  const totalPages = Math.ceil(filteredData.length / PAGE_SIZE);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const statusConfig = (item) => {
    // Backend returns coupon_status (unused/used/expired), status alias and
    // reversed_at (set on the log row where action = 'reversed').
    if (item.reversed_at) return { status: 'rejected', label: 'Reversed' };
    const s = item.coupon_status || item.status || 'pending';
    if (s === 'used' || s === 'approved') return { status: 'approved', label: 'Used' };
    return { status: s === 'unused' ? 'pending' : s, label: s === 'unused' ? 'Pending' : s };
  };

  return (
    <div className="main-content">
      <Topbar title="Redemption History" />
      <div style={{ padding: '24px' }}>
        <div style={styles.container}>
        {/* Header */}
        <div style={styles.header}>
          <div>
            <h1 style={styles.heading}>Redemption History</h1>
            <p style={styles.subtitle}>{redemptions.length} total redemptions</p>
          </div>
          <div style={styles.headerActions}>
            <button style={styles.refreshBtn} onClick={fetchHistory}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="23 4 23 10 17 10" />
                <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
              </svg>
            </button>
          </div>
        </div>

        {/* Date filter tabs */}
        <div style={styles.filterBar}>
          {DATE_FILTERS.map((f) => (
            <button
              key={f.value}
              style={{
                ...styles.filterTab,
                background: dateFilter === f.value ? '#FF9500' : '#F2F2F5',
                color: dateFilter === f.value ? '#FFFFFF' : '#1C1C1E',
              }}
              onClick={() => handleFilterChange(f.value)}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Loading state */}
        {loading && (
          <div className="loading-state" style={{ minHeight: 200 }}>
            <div style={styles.spinnerLarge} />
            <p>Loading history...</p>
          </div>
        )}

        {/* Error state */}
        {!loading && error && (
          <div className="error-state" style={{ minHeight: 200 }}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#FF3B30" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <h2>Failed to load history</h2>
            <p>{error}</p>
            <button style={styles.retryBtn} onClick={fetchHistory}>
              Retry
            </button>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && filteredData.length === 0 && (
          <div className="empty-state" style={{ minHeight: 200 }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#6C6C70" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
            <h2>No redemptions found</h2>
            <p>{dateFilter !== 'all' ? 'No redemptions for this period.' : 'No redemptions have been made yet.'}</p>
          </div>
        )}

        {/* Desktop table */}
        {!loading && !error && filteredData.length > 0 && (
          <>
            <div className="merchant-table-wrap" style={styles.tableWrap}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>PIN</th>
                    <th style={styles.th}>Coupon Type</th>
                    <th style={styles.th}>Value</th>
                    <th style={styles.th}>Status</th>
                    <th style={styles.th}>Redeemed At</th>
                    <th style={styles.th}>Reversed At</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedData.map((item, idx) => {
                    const cfg = statusConfig(item);
                    return (
                      <tr key={item.id || idx}>
                        <td style={styles.td}>
                          <span style={{ fontFamily: "ui-monospace, 'SF Mono', monospace" }}>
                            {maskPin(item.pin_code)}
                          </span>
                        </td>
                        <td style={styles.td}>{item.coupon_title || item.title || item.coupon_type || '-'}</td>
                        <td style={styles.td}>
                          <span style={{ fontWeight: 600 }}>
                            {item.value_cents != null && Number(item.value_cents) > 0
                              ? formatValue(item.value_cents)
                              : item.points_spent != null
                              ? `${item.points_spent} pts`
                              : '-'}
                        </span>
                        </td>
                        <td style={styles.td}>
                          <StatusBadge status={cfg.status} />
                        </td>
                        <td style={styles.td}>{formatDateTime(item.redeemed_at)}</td>
                        <td style={styles.td}>
                          {item.reversed_at ? formatDateTime(item.reversed_at) : '-'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile card list */}
            <div className="merchant-mobile-list" style={styles.mobileList}>
              {paginatedData.map((item, idx) => {
                const cfg = statusConfig(item);
                return (
                  <div key={item.id || idx} style={styles.mobileCard}>
                    <div style={styles.mobileCardHeader}>
                      <span style={styles.mobileCouponType}>{item.coupon_title || item.title || item.coupon_type || '-'}</span>
                      <span style={styles.mobileValue}>
                        {item.value_cents != null && Number(item.value_cents) > 0
                          ? formatValue(item.value_cents)
                          : item.points_spent != null
                          ? `${item.points_spent} pts`
                          : '-'}
                    </span>
                    </div>
                    <div style={styles.mobileCardBody}>
                      <div style={styles.mobileRow}>
                        <span style={styles.mobileLabel}>PIN</span>
                        <span style={{ fontFamily: "ui-monospace, 'SF Mono', monospace" }}>
                          {maskPin(item.pin_code)}
                        </span>
                      </div>
                      <div style={styles.mobileRow}>
                        <span style={styles.mobileLabel}>Status</span>
                        <StatusBadge status={cfg.status} />
                      </div>
                      <div style={styles.mobileRow}>
                        <span style={styles.mobileLabel}>Redeemed</span>
                        <span>{formatDateTime(item.redeemed_at)}</span>
                      </div>
                      {item.reversed_at && (
                        <div style={styles.mobileRow}>
                          <span style={styles.mobileLabel}>Reversed</span>
                          <span>{formatDateTime(item.reversed_at)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pagination">
                <button
                  className="page-btn"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                >
                  &lsaquo;
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    className={`page-btn${page === currentPage ? ' active' : ''}`}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </button>
                ))}
                <button
                  className="page-btn"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                >
                  &rsaquo;
                </button>
              </div>
            )}
          </>
        )}

        {/* Quick link */}
        <div style={styles.footerLink}>
          <button style={styles.linkBtn} onClick={() => navigate('/merchant/verify')}>
            &larr; Back to Verification
          </button>
        </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: 800,
    margin: '0 auto',
  },
  header: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 16,
    flexWrap: 'wrap',
  },
  heading: {
    fontSize: 24,
    fontWeight: 700,
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'SF Pro Display', system-ui, sans-serif",
    color: '#1C1C1E',
    margin: 0,
  },
  subtitle: {
    fontSize: 14,
    color: '#6C6C70',
    margin: '4px 0 0',
  },
  headerActions: {
    display: 'flex',
    gap: 8,
    alignItems: 'center',
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
    minHeight: 36,
  },
  refreshBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 36,
    height: 36,
    borderRadius: 8,
    background: '#F2F2F5',
    border: 'none',
    cursor: 'pointer',
    color: '#6C6C70',
  },
  filterBar: {
    display: 'flex',
    gap: 8,
    marginBottom: 20,
    flexWrap: 'wrap',
  },
  filterTab: {
    padding: '8px 16px',
    borderRadius: 8,
    fontSize: 13,
    fontWeight: 500,
    border: 'none',
    cursor: 'pointer',
    minHeight: 36,
    transition: 'background 0.15s, color 0.15s',
  },
  spinnerLarge: {
    width: 32,
    height: 32,
    border: '3px solid #E0E0E5',
    borderTopColor: '#FF9500',
    borderRadius: '50%',
    animation: 'spin 0.6s linear infinite',
  },
  retryBtn: {
    padding: '10px 24px',
    borderRadius: 10,
    fontSize: 14,
    fontWeight: 600,
    background: '#FF9500',
    color: '#FFFFFF',
    border: 'none',
    cursor: 'pointer',
    minHeight: 44,
    marginTop: 8,
  },
  tableWrap: {
    background: '#FFFFFF',
    borderRadius: 14,
    border: '1px solid #E0E0E5',
    overflow: 'hidden',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  th: {
    fontSize: 11,
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
    color: '#6C6C70',
    padding: '12px 16px',
    textAlign: 'left',
    borderBottom: '1px solid #E0E0E5',
    whiteSpace: 'nowrap',
  },
  td: {
    fontSize: 13,
    padding: '12px 16px',
    borderBottom: '1px solid #F2F2F5',
    color: '#1C1C1E',
  },
  mobileList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  },
  mobileCard: {
    background: '#FFFFFF',
    borderRadius: 12,
    border: '1px solid #E0E0E5',
    overflow: 'hidden',
  },
  mobileCardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '14px 16px',
    borderBottom: '1px solid #F2F2F5',
  },
  mobileCouponType: {
    fontSize: 15,
    fontWeight: 600,
    color: '#1C1C1E',
  },
  mobileValue: {
    fontSize: 15,
    fontWeight: 700,
    color: '#FF9500',
  },
  mobileCardBody: {
    padding: '10px 16px',
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
  mobileRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: 13,
    color: '#1C1C1E',
  },
  mobileLabel: {
    color: '#6C6C70',
    fontWeight: 500,
  },
  footerLink: {
    textAlign: 'center',
    marginTop: 20,
  },
  linkBtn: {
    padding: '10px 20px',
    fontSize: 14,
    fontWeight: 500,
    color: '#FF9500',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    minHeight: 44,
  },
};

/* Responsive table toggle injected via component */
