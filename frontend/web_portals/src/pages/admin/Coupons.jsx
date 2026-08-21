import { useState, useEffect, useCallback } from 'react';
import Topbar from '../../components/Topbar';
import DataTable from '../../components/DataTable';
import StatusBadge from '../../components/StatusBadge';
import Modal from '../../components/Modal';
import { useToast } from '../../components/Toast';
import { apiGet, apiPost, apiPut, apiDel } from '../../services/api';

const FILTER_CHIPS = [
  { key: 'active', label: 'Active' },
  { key: 'depleted', label: 'Depleted' },
  { key: '', label: 'All' },
];

const INITIAL_FORM = {
  coupon_type: '',
  points_cost: '',
  value_cents: '',
  quantity: '',
  valid_from: '',
  valid_until: '',
};

function CouponFormModal({ isOpen, onClose, coupon, onSubmit }) {
  const [form, setForm] = useState(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (isOpen) {
      if (coupon) {
        setForm({
          coupon_type: coupon.title || coupon.coupon_type || '',
          points_cost: coupon.points_cost?.toString() || '',
          value_cents: coupon.value_cents?.toString() || '',
          quantity: coupon.quantity?.toString() || '',
          valid_from: coupon.valid_from ? coupon.valid_from.slice(0, 10) : '',
          valid_until: coupon.valid_until ? coupon.valid_until.slice(0, 10) : '',
        });
      } else {
        setForm(INITIAL_FORM);
      }
      setResult(null);
    }
  }, [isOpen, coupon]);

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setResult(null);
    try {
      const payload = {
        coupon_type: form.coupon_type,
        points_cost: parseInt(form.points_cost, 10) || 0,
        value_cents: parseInt(form.value_cents, 10) || 0,
        quantity: parseInt(form.quantity, 10) || 1,
        valid_from: form.valid_from || undefined,
        valid_until: form.valid_until || undefined,
      };

      if (coupon) {
        await apiPut(`/admin/coupons/${coupon.id}`, {
          coupon_type: payload.coupon_type,
          points_cost: payload.points_cost,
          value_cents: payload.value_cents,
          quantity: payload.quantity,
          valid_from: payload.valid_from,
          valid_until: payload.valid_until,
        });
        onSubmit();
        onClose();
      } else {
        const res = await apiPost('/admin/coupons', payload);
        setResult(res);
      }
    } catch (err) {
      setResult({ error: err.message || 'Failed to create coupon' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={coupon ? 'Edit Coupon' : 'Create Coupon'}
      actions={
        result && !result.error
          ? [
              {
                label: 'Close',
                variant: 'primary',
                onClick: () => {
                  onSubmit();
                  onClose();
                },
              },
            ]
          : [
              { label: 'Cancel', variant: 'secondary', onClick: onClose },
              {
                label: coupon ? 'Save Changes' : 'Create Coupon',
                variant: 'primary',
                onClick: handleSubmit,
                disabled: submitting,
              },
            ]
      }
    >
      {result && !result.error && (
        <div
          className="card"
          style={{
            marginBottom: 16,
            borderColor: 'var(--success)',
            background: 'var(--success-subtle)',
          }}
        >
          <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>Success!</h4>
          <p style={{ fontSize: 13 }}>
            Created {result.pins_generated || 0} PINs for "{result.coupon?.coupon_type || form.coupon_type}"
          </p>
        </div>
      )}
      {result && result.error && (
        <div
          className="card"
          style={{
            marginBottom: 16,
            borderColor: 'var(--danger)',
            background: 'var(--danger-subtle)',
          }}
        >
          <p style={{ fontSize: 13, color: 'var(--danger)' }}>{result.error}</p>
        </div>
      )}

      {(!result || result.error) && (
        <>
          <div className="form-group">
            <label className="form-label">Coupon Type</label>
            <input
              className="form-input"
              placeholder="e.g., Coffee Voucher"
              value={form.coupon_type}
              onChange={handleChange('coupon_type')}
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Points Cost</label>
              <input
                className="form-input"
                type="number"
                min="0"
                value={form.points_cost}
                onChange={handleChange('points_cost')}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Value (cents)</label>
              <input
                className="form-input"
                type="number"
                min="0"
                value={form.value_cents}
                onChange={handleChange('value_cents')}
              />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Quantity (1 - 10,000)</label>
            <input
              className="form-input"
              type="number"
              min="1"
              max="10000"
              value={form.quantity}
              onChange={handleChange('quantity')}
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Valid From</label>
              <input
                className="form-input"
                type="date"
                value={form.valid_from}
                onChange={handleChange('valid_from')}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Valid Until</label>
              <input
                className="form-input"
                type="date"
                value={form.valid_until}
                onChange={handleChange('valid_until')}
              />
            </div>
          </div>
        </>
      )}
    </Modal>
  );
}

function DeleteConfirmModal({ isOpen, onClose, coupon, onConfirm }) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Delete Coupon"
      actions={[
        { label: 'Cancel', variant: 'secondary', onClick: onClose },
        {
          label: 'Delete',
          variant: 'danger',
          onClick: () => onConfirm(coupon),
        },
      ]}
    >
      <p style={{ fontSize: 14 }}>
        Are you sure you want to delete the coupon <strong>"{coupon?.title || coupon?.coupon_type}"</strong>?
        This action cannot be undone.
      </p>
    </Modal>
  );
}

function PinsModal({ isOpen, onClose, coupon, pinsData }) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`PINs — ${coupon?.title || coupon?.coupon_type || ''}`}
      actions={[
        { label: 'Close', variant: 'primary', onClick: onClose },
      ]}
    >
      <div style={{ maxHeight: 400, overflowY: 'auto' }}>
        {!pinsData || pinsData.length === 0 ? (
          <p style={{ fontSize: 14, color: 'var(--muted)' }}>No PINs available for this coupon.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <th style={{ textAlign: 'left', padding: '8px 12px', fontSize: 12, fontWeight: 600 }}>#</th>
                <th style={{ textAlign: 'left', padding: '8px 12px', fontSize: 12, fontWeight: 600 }}>PIN Code</th>
                <th style={{ textAlign: 'left', padding: '8px 12px', fontSize: 12, fontWeight: 600 }}>Status</th>
                <th style={{ textAlign: 'left', padding: '8px 12px', fontSize: 12, fontWeight: 600 }}>Created</th>
              </tr>
            </thead>
            <tbody>
              {pinsData.map((pin, idx) => (
                <tr key={pin.id} style={{ borderBottom: '1px solid var(--border-subtle, #eee)' }}>
                  <td style={{ padding: '8px 12px', fontSize: 13, color: 'var(--muted)' }}>{idx + 1}</td>
                  <td style={{ padding: '8px 12px', fontFamily: 'monospace', fontSize: 14, fontWeight: 600 }}>{pin.pin_code}</td>
                  <td style={{ padding: '8px 12px' }}>
                    <span className={`badge badge-${pin.status === 'unused' ? 'success' : pin.status === 'used' ? 'secondary' : 'warning'}`}>
                      {pin.status}
                    </span>
                  </td>
                  <td style={{ padding: '8px 12px', fontSize: 13, color: 'var(--muted)' }}>
                    {pin.created_at ? new Date(pin.created_at).toLocaleDateString() : '--'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </Modal>
  );
}

export default function Coupons() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [coupons, setCoupons] = useState([]);
  const [total, setTotal] = useState(0);
  const [filter, setFilter] = useState('active');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(15);
  const [formOpen, setFormOpen] = useState(false);
  const [editCoupon, setEditCoupon] = useState(null);
  const [deleteCoupon, setDeleteCoupon] = useState(null);
  const [pinsData, setPinsData] = useState(null);
  const [pinsModalOpen, setPinsModalOpen] = useState(false);
  const [viewingCoupon, setViewingCoupon] = useState(null);
  
  const handleViewPins = async (coupon) => {
    setViewingCoupon(coupon);
    try {
      const res = await apiGet(`/admin/coupons/${coupon.id}/pins`);
      setPinsData(res.data || []);
      setPinsModalOpen(true);
    } catch (err) {
      toast(err.message || 'Failed to load PINs', 'error');
    }
  };

  const fetchCoupons = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { page, limit: pageSize };
      if (filter) params.status = filter;
      const res = await apiGet('/admin/coupons', params);
      setCoupons(res.data || []);
      setTotal(res.total || 0);
    } catch (err) {
      setError(err.message || 'Failed to load coupons');
    } finally {
      setLoading(false);
    }
  }, [filter, page, pageSize]);

  useEffect(() => {
    fetchCoupons();
  }, [fetchCoupons]);

  const handleFilterChange = (key) => {
    setFilter(key);
    setPage(1);
  };

  const handleCreate = () => {
    setEditCoupon(null);
    setFormOpen(true);
  };

  const handleEdit = (coupon) => {
    setEditCoupon(coupon);
    setFormOpen(true);
  };

  const handleFormSubmit = () => {
    fetchCoupons();
  };

  const handleDelete = async (coupon) => {
    try {
      await apiDel(`/admin/coupons/${coupon.id}`);
      toast(`Coupon "${coupon.title || coupon.coupon_type}" deleted`, 'success');
      setDeleteCoupon(null);
      fetchCoupons();
    } catch (err) {
      toast(err.message || 'Failed to delete coupon', 'error');
    }
  };

  const totalPages = Math.ceil(total / pageSize);

  const columns = [
    { key: 'title', label: 'Coupon Type' },
    {
      key: 'points_cost',
      label: 'Points',
      render: (val, row) => {
        if (val == null) return '--';
        const dollarVal = row.value_cents ? `$${(row.value_cents / 100).toFixed(2)}` : null;
        return (
          <div>
            <span style={{ fontWeight: 600, fontSize: 14 }}>{val}</span>
            {dollarVal && (
              <div style={{ fontSize: 11, color: 'var(--text-muted, #888)', marginTop: 2 }}>
                {dollarVal} · from config
              </div>
            )}
          </div>
        );
      },
    },
    {
      key: 'value_cents',
      label: 'Value',
      render: (val) => {
        if (val == null) return '--';
        return `$${(val / 100).toFixed(2)}`;
      },
    },
    { key: 'quantity', label: 'Qty' },
    {
      key: 'quantity_used',
      label: 'Used',
      render: (val) => val ?? 0,
    },
    {
      key: 'status',
      label: 'Status',
      render: (val) => {
        const mapStatus = val === 'active' ? 'active' : val === 'depleted' ? 'expired' : val;
        return <StatusBadge status={mapStatus} />;
      },
    },
    {
      key: 'valid_until',
      label: 'Valid Until',
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
            onClick={() => handleEdit(row)}
          >
            Edit
          </button>
          <button
            className="btn btn-outline btn-sm"
            onClick={() => handleViewPins(row)}
          >
            PINs
          </button>
          <button
            className="btn btn-danger btn-sm"
            onClick={() => setDeleteCoupon(row)}
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <Topbar title="Coupons" />
      <div className="main-content">
        <div className="page-header">
          <h2 className="page-title">Coupon & PIN Management</h2>
          <div className="page-actions">
            <button className="btn btn-primary" onClick={handleCreate}>
              + Create Coupon
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          {FILTER_CHIPS.map((chip) => (
            <button
              key={chip.key}
              className={`btn btn-sm ${filter === chip.key ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => handleFilterChange(chip.key)}
            >
              {chip.label}
            </button>
          ))}
        </div>

        {loading && (
          <div className="loading-state">
            <p>Loading coupons...</p>
          </div>
        )}
        {error && !loading && (
          <div className="error-state">
            <h2>Error loading coupons</h2>
            <p>{error}</p>
            <button className="btn btn-primary" onClick={fetchCoupons}>
              Retry
            </button>
          </div>
        )}
        {!loading && !error && coupons.length === 0 && (
          <div className="empty-state">
            <h2>No coupons found</h2>
            <p>
              {filter === 'active'
                ? 'No active coupons available. Create one to get started.'
                : filter === 'depleted'
                ? 'No depleted coupons found.'
                : 'No coupons available.'}
            </p>
          </div>
        )}
        {!loading && !error && coupons.length > 0 && (
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
                  {coupons.map((row) => (
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

      <CouponFormModal
        isOpen={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditCoupon(null);
        }}
        coupon={editCoupon}
        onSubmit={handleFormSubmit}
      />

      <DeleteConfirmModal
        isOpen={!!deleteCoupon}
        onClose={() => setDeleteCoupon(null)}
        coupon={deleteCoupon}
        onConfirm={handleDelete}
      />

      <PinsModal
        isOpen={pinsModalOpen}
        onClose={() => setPinsModalOpen(false)}
        coupon={viewingCoupon}
        pinsData={pinsData}
      />
    </div>
  );
}
