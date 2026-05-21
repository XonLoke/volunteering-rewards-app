import { useState, useEffect, useCallback } from 'react';
import Topbar from '../../components/Topbar';
import Sidebar from '../../components/Sidebar';
import DataTable from '../../components/DataTable';
import StatusBadge from '../../components/StatusBadge';
import Modal from '../../components/Modal';
import { useToast } from '../../components/Toast';
import { apiGet, apiPut, apiDel } from '../../services/api';

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

function UserDetailModal({ userId, isOpen, onClose, onUpdate }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);

  const fetchUser = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await apiGet(`/admin/users/${userId}`);
      setUser(res);
    } catch (err) {
      setError(err.message || 'Failed to load user details');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (isOpen && userId) {
      fetchUser();
    }
  }, [isOpen, userId, fetchUser]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={user ? `User: ${user.name || user.email || 'Unknown'}` : 'User Details'}
      actions={[
        { label: 'Close', variant: 'secondary', onClick: onClose },
      ]}
    >
      {loading && (
        <div className="loading-state">
          <p>Loading user details...</p>
        </div>
      )}
      {error && (
        <div className="error-state">
          <p>{error}</p>
          <button className="btn btn-primary btn-sm" onClick={fetchUser}>
            Retry
          </button>
        </div>
      )}
      {!loading && !error && user && (
        <div>
          <div className="form-row" style={{ marginBottom: 16 }}>
            <div>
              <div className="form-label">Name</div>
              <div style={{ fontSize: 14 }}>{user?.name || '—'}</div>
            </div>
            <div>
              <div className="form-label">Email</div>
              <div style={{ fontSize: 14 }}>{user?.email || '—'}</div>
            </div>
          </div>
          <div className="form-row" style={{ marginBottom: 16 }}>
            <div>
              <div className="form-label">Phone</div>
              <div style={{ fontSize: 14 }}>{user.phone || '--'}</div>
            </div>
            <div>
              <div className="form-label">Role</div>
              <div style={{ fontSize: 14 }}>
                <StatusBadge status={user.role} />
              </div>
            </div>
          </div>
          <div className="form-row" style={{ marginBottom: 16 }}>
            <div>
              <div className="form-label">Status</div>
              <div style={{ fontSize: 14 }}>
                <StatusBadge status={user.status} />
              </div>
            </div>
            <div>
              <div className="form-label">Points Balance</div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>
                {user.points_balance ?? 0}
              </div>
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16, marginTop: 8 }}>
            <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Activity Summary</h4>
            <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
              <div className="stat-card" style={{ padding: 12 }}>
                <div className="stat-value" style={{ fontSize: 22 }}>
                  {user.total_events_attended ?? 0}
                </div>
                <div className="stat-label">Events Attended</div>
              </div>
              <div className="stat-card" style={{ padding: 12 }}>
                <div className="stat-value" style={{ fontSize: 22 }}>
                  {user.total_points_earned ?? 0}
                </div>
                <div className="stat-label">Points Earned</div>
              </div>
              <div className="stat-card" style={{ padding: 12 }}>
                <div className="stat-value" style={{ fontSize: 22 }}>
                  {user.total_points_redeemed ?? 0}
                </div>
                <div className="stat-label">Points Redeemed</div>
              </div>
            </div>
          </div>

          <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 16 }}>
            Created: {user.created_at ? new Date(user.created_at).toLocaleDateString() : '--'}
          </div>
        </div>
      )}
    </Modal>
  );
}

function SuspendModal({ isOpen, onClose, user, onConfirm }) {
  const [suspending, setSuspending] = useState(false);

  const handleConfirm = async () => {
    setSuspending(true);
    await onConfirm(user);
    setSuspending(false);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={user?.status === 'active' ? 'Suspend User' : 'Reactivate User'}
      actions={[
        { label: 'Cancel', variant: 'secondary', onClick: onClose },
        {
          label: user?.status === 'active' ? 'Suspend' : 'Reactivate',
          variant: user?.status === 'active' ? 'danger' : 'primary',
          onClick: handleConfirm,
          disabled: suspending,
        },
      ]}
    >
      {user?.status === 'active' ? (
        <p style={{ fontSize: 14 }}>
          Are you sure you want to suspend <strong>{user?.name || 'this user'}</strong>? They will no longer be able to access the platform.
        </p>
      ) : (
        <p style={{ fontSize: 14 }}>
          Are you sure you want to reactivate <strong>{user?.name || 'this user'}</strong>? They will regain access to the platform.
        </p>
      )}
    </Modal>
  );
}

export default function Users() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(15);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [suspendUser, setSuspendUser] = useState(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { page, limit: pageSize };
      if (search) params.search = search;
      if (roleFilter) params.role = roleFilter;
      if (statusFilter) params.status = statusFilter;
      const res = await apiGet('/admin/users', params);
      setUsers(res.data || []);
      setTotal(res.total || 0);
    } catch (err) {
      setError(err.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [search, roleFilter, statusFilter, page, pageSize]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSearch = (value) => {
    setSearch(value);
    setPage(1);
  };

  const handleRoleFilter = (e) => {
    setRoleFilter(e.target.value);
    setPage(1);
  };

  const handleStatusFilter = (e) => {
    setStatusFilter(e.target.value);
    setPage(1);
  };

  const handleViewUser = (user) => {
    setSelectedUserId(user.id);
    setDetailOpen(true);
  };

  const handleSuspendUser = (user) => {
    setSuspendUser(user);
  };

  const confirmSuspend = async (user) => {
    try {
      const newStatus = user.status === 'active' ? 'disabled' : 'active';
      await apiPut(`/admin/users/${user.id}`, { status: newStatus });
      toast(
        newStatus === 'disabled'
          ? `${user?.name || user?.email || 'User'} has been suspended`
          : `${user?.name || user?.email || 'User'} has been reactivated`,
        'success'
      );
      setSuspendUser(null);
      fetchUsers();
    } catch (err) {
      toast(err.message || 'Failed to update user', 'error');
    }
  };

  const totalPages = Math.ceil(total / pageSize);

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    {
      key: 'role',
      label: 'Role',
      render: (val) => <StatusBadge status={val} />,
    },
    { key: 'points_balance', label: 'Points' },
    {
      key: 'status',
      label: 'Status',
      render: (val) => (
        <StatusBadge status={val === 'active' ? 'approved' : val === 'disabled' ? 'rejected' : val} />
      ),
    },
    {
      key: 'created_at',
      label: 'Created',
      render: (val) => (val ? new Date(val).toLocaleDateString() : '--'),
    },
    {
      key: 'id',
      label: 'Actions',
      sortable: false,
      render: (_, row) => (
        <div style={{ display: 'flex', gap: 6 }}>
          <button
            className="btn btn-outline btn-sm"
            onClick={(e) => {
              e.stopPropagation();
              handleViewUser(row);
            }}
          >
            View
          </button>
          <button
            className={`btn btn-sm ${row.status === 'active' ? 'btn-danger' : 'btn-primary'}`}
            onClick={(e) => {
              e.stopPropagation();
              handleSuspendUser(row);
            }}
          >
            {row.status === 'active' ? 'Suspend' : 'Reactivate'}
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <Topbar title="Users" />
      <div className="main-content">
        <div className="page-header">
          <h2 className="page-title">Users</h2>
          <div className="page-actions">
            <input
              type="text"
              className="search-input"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              style={{ width: 220 }}
            />
            <select
              className="form-select"
              value={roleFilter}
              onChange={handleRoleFilter}
              style={{ width: 140 }}
            >
              <option value="">All Roles</option>
              <option value="volunteer">Volunteer</option>
              <option value="organiser">Organiser</option>
              <option value="admin">Admin</option>
            </select>
            <select
              className="form-select"
              value={statusFilter}
              onChange={handleStatusFilter}
              style={{ width: 140 }}
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="disabled">Disabled</option>
            </select>
          </div>
        </div>

        {loading && (
          <div className="loading-state">
            <p>Loading users...</p>
          </div>
        )}
        {error && !loading && (
          <div className="error-state">
            <h2>Error loading users</h2>
            <p>{error}</p>
            <button className="btn btn-primary" onClick={fetchUsers}>
              Retry
            </button>
          </div>
        )}
        {!loading && !error && users.length === 0 && (
          <div className="empty-state">
            <h2>No users found</h2>
            <p>Try adjusting your search or filters.</p>
          </div>
        )}
        {!loading && !error && users.length > 0 && (
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
                  {users.map((row) => (
                    <tr
                      key={row.id}
                      onClick={() => handleViewUser(row)}
                      style={{ cursor: 'pointer' }}
                    >
                      {columns.map((col) => (
                        <td key={col.key}>
                          {col.render
                            ? col.render(row[col.key], row)
                            : row[col.key]}
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

      <UserDetailModal
        userId={selectedUserId}
        isOpen={detailOpen}
        onClose={() => {
          setDetailOpen(false);
          setSelectedUserId(null);
        }}
      />

      <SuspendModal
        isOpen={!!suspendUser}
        onClose={() => setSuspendUser(null)}
        user={suspendUser}
        onConfirm={confirmSuspend}
      />
    </div>
  );
}
