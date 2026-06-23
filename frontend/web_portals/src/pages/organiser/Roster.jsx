import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Topbar from '../../components/Topbar';
import StatusBadge from '../../components/StatusBadge';
import { apiGet } from '../../services/api';

export default function Roster() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchRoster = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiGet(`/organiser/events/${id}/roster`);
      // Backend returns { data: [{id, name, email, status, check_in_time}, ...] }
      const volunteers = (res.data || []).map((v) => ({
        user_id: v.id,
        name: v.name,
        email: v.email,
        phone: '--',
        registered_at: null,
        is_checked_in: v.status === 'checked_in' || v.check_in_time !== null,
        checked_in_at: v.check_in_time || null,
      }));
      setData({
        volunteers,
        total_registered: volunteers.length,
        total_checked_in: volunteers.filter((v) => v.is_checked_in).length,
        event_title: res.event_title || '',
      });
    } catch (err) {
      setError(err.message || 'Failed to load roster');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoster();
  }, [id]);

  const filteredVolunteers = useMemo(() => {
    if (!data?.volunteers) return [];
    if (!searchTerm.trim()) return data.volunteers;
    const term = searchTerm.toLowerCase();
    return data.volunteers.filter(
      (v) =>
        v.name?.toLowerCase().includes(term) ||
        v.email?.toLowerCase().includes(term)
    );
  }, [data, searchTerm]);

  const totalRegistered = data?.total_registered ?? 0;
  const totalCheckedIn = data?.total_checked_in ?? 0;
  const checkInPercent = totalRegistered > 0 ? Math.round((totalCheckedIn / totalRegistered) * 100) : 0;

  const formatDateTime = (dateStr) => {
    if (!dateStr) return '--';
    try {
      return new Date(dateStr).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
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
        <Topbar title="Volunteer Roster" />
        <div className="main-content">
          <div className="loading-state">
            <p>Loading roster...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <Topbar title="Volunteer Roster" />
        <div className="main-content">
          <div className="error-state">
            <h2>Error loading roster</h2>
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
      <Topbar title="Volunteer Roster" />
      <div className="main-content">
        <div className="page-header">
          <div>
            <h2 className="page-title">{data?.event_title || 'Volunteer Roster'}</h2>
            <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 4 }}>
              Event Roster
            </p>
          </div>
          <div className="page-actions">
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => navigate(`/organiser/events`)}
            >
              Back to Event
            </button>
          </div>
        </div>

        {/* Summary */}
        <div className="card" style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', gap: 32, alignItems: 'center', flexWrap: 'wrap' }}>
            <div>
              <div className="stat-value" style={{ fontSize: 24 }}>
                {totalCheckedIn} / {totalRegistered}
              </div>
              <div className="stat-label">Volunteers Checked In</div>
            </div>
            <div style={{ flex: 1, minWidth: 200 }}>
              <div
                style={{
                  height: 10,
                  background: '#F0F0F2',
                  borderRadius: 99,
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: `${checkInPercent}%`,
                    background: checkInPercent === 100 ? 'var(--success)' : 'var(--accent)',
                    borderRadius: 99,
                    transition: 'width 0.4s ease',
                    minWidth: checkInPercent > 0 ? 20 : 0,
                  }}
                />
              </div>
              <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 6 }}>
                {checkInPercent}% check-in rate
              </p>
            </div>
          </div>
        </div>

        {/* Search */}
        <div style={{ marginBottom: 16 }}>
          <input
            type="text"
            className="search-input"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {filteredVolunteers.length === 0 && (
          <div className="empty-state">
            <h2>No volunteers found</h2>
            <p>
              {searchTerm
                ? 'No volunteers match your search.'
                : 'No volunteers have registered for this event yet.'}
            </p>
          </div>
        )}

        {filteredVolunteers.length > 0 && (
          <div className="data-table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Volunteer Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Registered At</th>
                  <th>Check-in Status</th>
                  <th>Checked In At</th>
                </tr>
              </thead>
              <tbody>
                {filteredVolunteers.map((v) => (
                  <tr key={v.user_id}>
                    <td style={{ fontWeight: 500 }}>{v.name || '--'}</td>
                    <td>{v.email || '--'}</td>
                    <td>{v.phone || '--'}</td>
                    <td>{formatDateTime(v.registered_at)}</td>
                    <td>
                      {v.is_checked_in ? (
                        <StatusBadge status="approved" />
                      ) : (
                        <StatusBadge status="pending" />
                      )}
                    </td>
                    <td>{v.is_checked_in ? formatDateTime(v.checked_in_at) : '--'}</td>
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
