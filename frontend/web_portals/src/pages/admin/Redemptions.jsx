import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Topbar from '../../components/Topbar';
import { apiGet, apiPost } from '../../services/api';

export default function Redemptions() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [redemptions, setRedemptions] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(7);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState(new Date().toISOString().slice(0, 10));
  const [sortKey, setSortKey] = useState('redeemed_at');
  const [sortDir, setSortDir] = useState('desc');
  const [cleaningUp, setCleaningUp] = useState(false);

  const fetchRedemptions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { page, limit: pageSize, sort: sortKey, order: sortDir };
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
  }, [page, pageSize, dateFrom, dateTo, sortKey, sortDir]);

  useEffect(() => { fetchRedemptions(); }, [fetchRedemptions]);

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
    setPage(1);
  };

  const handleFilter = () => { setPage(1); };

  const handleCleanup = async () => {
    setCleaningUp(true);
    try {
      const res = await apiPost('/admin/redemptions/cleanup');
      fetchRedemptions();
    } catch (err) {
      setError(err.message || 'Failed to clean up old redemptions');
    } finally {
      setCleaningUp(false);
    }
  };

  const totalPages = Math.ceil(total / pageSize);

  const SortIcon = ({ col }) => {
    if (sortKey !== col) return <span style={{ marginLeft: 4, opacity: 0.3 }}>&#8597;</span>;
    return <span style={{ marginLeft: 4 }}>{sortDir === 'asc' ? '↑' : '↓'}</span>;
  };

  const formatValue = (cents) => {
    if (cents == null) return '$0.00';
    return `$${(cents / 100).toFixed(2)}`;
  };

  return (
    <div>
      <Topbar title="Redemptions" />
      <div className="main-content">
        <div className="page-header">
          <h2 className="page-title">Redemption History</h2>
          <div className="page-actions">
            <button className="btn btn-outline btn-sm" onClick={handleCleanup} disabled={cleaningUp}>
              {cleaningUp ? 'Cleaning...' : 'Cleanup Old (>1yr)'}
            </button>
          </div>
        </div>

        <div className="card" style={{ marginBottom: 20, padding: 16 }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, flexWrap: 'wrap' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">From</label>
              <input type="date" className="form-input" value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)} style={{ width: 180 }} />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">To</label>
              <input type="date" className="form-input" value={dateTo}
                onChange={(e) => setDateTo(e.target.value)} style={{ width: 180 }} />
            </div>
            <button className="btn btn-primary" onClick={handleFilter}>Filter</button>
            <button className="btn btn-secondary" onClick={() => { setDateFrom(''); setDateTo(new Date().toISOString().slice(0, 10)); setPage(1); }}>Clear</button>
          </div>
        </div>

        {loading && (<div className="loading-state"><p>Loading redemptions...</p></div>)}
        {error && !loading && (
          <div className="error-state"><h2>Error loading redemptions</h2><p>{error}</p>
            <button className="btn btn-primary" onClick={fetchRedemptions}>Retry</button></div>
        )}
        {!loading && !error && redemptions.length === 0 && (
          <div className="empty-state"><h2>No redemptions found</h2><p>No redemption records match your filter criteria.</p></div>
        )}
        {!loading && !error && redemptions.length > 0 && (
          <>
            <div className="data-table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th onClick={() => handleSort('user_name')} style={{ cursor: 'pointer' }}>
                      User Name <SortIcon col="user_name" />
                    </th>
                    <th onClick={() => handleSort('redeemed_at')} style={{ cursor: 'pointer' }}>
                      Redemption Date <SortIcon col="redeemed_at" />
                    </th>
                    <th onClick={() => handleSort('coupon_title')} style={{ cursor: 'pointer' }}>
                      Coupon Type <SortIcon col="coupon_title" />
                    </th>
                    <th onClick={() => handleSort('points_spent')} style={{ cursor: 'pointer' }}>
                      Points Used <SortIcon col="points_spent" />
                    </th>
                    <th onClick={() => handleSort('value_cents')} style={{ cursor: 'pointer' }}>
                      $ Value <SortIcon col="value_cents" />
                    </th>
                    <th>Qty</th>
                  </tr>
                </thead>
                <tbody>
                  {redemptions.map((row) => (
                    <tr key={row.id}>
                      <td>
                        <button
                          onClick={() => navigate('/admin/users', { state: { userId: row.user_id } })}
                          style={{ background:'none', border:'none', padding:0, fontSize:13, fontWeight:500, color:'var(--accent)', cursor:'pointer', textDecoration:'underline' }}
                        >
                          {row.user_name}
                        </button>
                      </td>
                      <td>{row.redeemed_at ? new Date(row.redeemed_at).toLocaleDateString() : '--'}</td>
                      <td>{row.coupon_title || '--'}</td>
                      <td style={{ fontWeight: 600 }}>{row.points_spent ?? 0}</td>
                      <td>{formatValue(row.value_cents)}</td>
                      <td>1</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {totalPages > 1 && (
              <div className="pagination">
                <button className="page-btn" disabled={page === 1} onClick={() => setPage(Math.max(1, page - 1))}>&lsaquo;</button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button key={p} className={'page-btn' + (p === page ? ' active' : '')} onClick={() => setPage(p)}>{p}</button>
                ))}
                <button className="page-btn" disabled={page === totalPages} onClick={() => setPage(Math.min(totalPages, page + 1))}>&rsaquo;</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
