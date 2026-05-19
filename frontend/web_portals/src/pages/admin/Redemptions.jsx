import { useState, useEffect, useCallback } from 'react';
import Topbar from '../../components/Topbar';
import DataTable from '../../components/DataTable';
import StatusBadge from '../../components/StatusBadge';
import { apiGet } from '../../services/api';

function getToday() {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}

function getWeekAgo() {
  const d = new Date();
  d.setDate(d.getDate() - 30);
  return d.toISOString().slice(0, 10);
}

export default function Redemptions() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [redemptions, setRedemptions] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(15);
  const [dateFrom, setDateFrom] = useState(getWeekAgo);
  const [dateTo, setDateTo] = useState(getToday);

  const fetchRedemptions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { page, limit: pageSize };
      if (dateFrom) params.from = dateFrom;
      if (dateTo) params.to = dateTo;
      const res = await apiGet('/admin/redemptions', params);
      setRedemptions(res.data || []);
      setTotal(res.total || 0);
    } catch (err) {
      setError(err.message || 'Failed to load redemptions');
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, dateFrom, dateTo]);

  useEffect(() => {
    fetchRedemptions();
  }, [fetchRedemptions]);

  const handleFilter = () => {
    setPage(1);
    fetchRedemptions();
  };

  const maskPin = (pin) => {
    if (!pin) return '******';
    if (pin.length <= 4) return '*'.repeat(pin.length);
    return pin.slice(0, 2) + '****' + pin.slice(-2);
  };

  const getStatusForBadge = (status) => {
    switch (status) {
      case 'used': return 'used';
      case 'active': return 'pending';
      case 'expired': return 'expired';
      default: return status;
    }
  };

  const totalPages = Math.ceil(total / pageSize);

  const columns = [
    { key: 'coupon_type', label: 'Coupon Type' },
    {
      key: 'pin_code',
      label: 'PIN',
      render: (val) => (
        <span style={{ fontFamily: 'monospace', fontSize: 13 }}>{maskPin(val)}</span>
      ),
    },
    { key: 'volunteer_name', label: 'Volunteer' },
    { key: 'volunteer_email', label: 'Email' },
    {
      key: 'redeemed_at',
      label: 'Redeemed At',
      render: (val) => (val ? new Date(val).toLocaleString() : '--'),
    },
    {
      key: 'status',
      label: 'Status',
      render: (val) => <StatusBadge status={getStatusForBadge(val)} />,
    },
    {
      key: 'used_at',
      label: 'Used At',
      render: (val) => (val ? new Date(val).toLocaleString() : '--'),
    },
  ];

  return (
    <div>
      <Topbar title="Redemptions" />
      <div className="main-content">
        <div className="page-header">
          <h2 className="page-title">Redemption History</h2>
        </div>

        <div className="card" style={{ marginBottom: 20, padding: 16 }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, flexWrap: 'wrap' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">From</label>
              <input
                type="date"
                className="form-input"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                style={{ width: 180 }}
              />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">To</label>
              <input
                type="date"
                className="form-input"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                style={{ width: 180 }}
              />
            </div>
            <button className="btn btn-primary" onClick={handleFilter}>
              Filter
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => {
                setDateFrom('');
                setDateTo('');
                setPage(1);
              }}
            >
              Clear
            </button>
          </div>
        </div>

        {loading && (
          <div className="loading-state">
            <p>Loading redemptions...</p>
          </div>
        )}
        {error && !loading && (
          <div className="error-state">
            <h2>Error loading redemptions</h2>
            <p>{error}</p>
            <button className="btn btn-primary" onClick={fetchRedemptions}>
              Retry
            </button>
          </div>
        )}
        {!loading && !error && redemptions.length === 0 && (
          <div className="empty-state">
            <h2>No redemptions found</h2>
            <p>No redemption records match your filter criteria.</p>
          </div>
        )}
        {!loading && !error && redemptions.length > 0 && (
          <>
            <div className="data-table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    {columns.map((col) => (
                      <th key={col.key}>{col.label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {redemptions.map((row) => (
                    <tr key={row.id}>
                      {columns.map((col) => (
                        <td key={col.key}>
                          {col.render ? col.render(row[col.key], row) : row[col.key]}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
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
    </div>
  );
}
