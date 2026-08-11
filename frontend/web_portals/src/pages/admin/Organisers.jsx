import { useState, useEffect, useCallback } from 'react';
import Topbar from '../../components/Topbar';
import DataTable from '../../components/DataTable';
import StatusBadge from '../../components/StatusBadge';
import Modal from '../../components/Modal';
import { useToast } from '../../components/Toast';
import { apiGet, apiPut, apiPost } from '../../services/api';

const TABS = [
  { key: 'pending', label: 'Pending' },
  { key: 'approved', label: 'Approved' },
  { key: 'rejected', label: 'Rejected' },
];

function ReviewModal({ isOpen, onClose, organiser, onConfirm }) {
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleApprove = async () => {
    setSubmitting(true);
    await onConfirm(organiser, 'approved', note);
    setSubmitting(false);
    setNote('');
  };

  const handleReject = async () => {
    setSubmitting(true);
    await onConfirm(organiser, 'rejected', note);
    setSubmitting(false);
    setNote('');
  };

  if (!organiser) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Review: ${organiser.organisation_name}`}
      actions={[
        { label: 'Cancel', variant: 'secondary', onClick: onClose },
        { label: 'Reject', variant: 'danger', onClick: handleReject, disabled: submitting },
        { label: 'Approve', variant: 'primary', onClick: handleApprove, disabled: submitting },
      ]}
    >
      <div style={{ marginBottom: 16 }}>
        <p style={{ fontSize: 14, marginBottom: 8 }}>
          <strong>Organisation:</strong> {organiser.organisation_name}
        </p>
        <p style={{ fontSize: 14, marginBottom: 8 }}>
          <strong>Type:</strong> {organiser.organisation_type || '--'}
        </p>
        <p style={{ fontSize: 14, marginBottom: 8 }}>
          <strong>Contact:</strong> {organiser.contact_name || '--'} {organiser.contact_email ? `(${organiser.contact_email})` : ''}
        </p>
        {organiser.documents && organiser.documents.length > 0 && (
          <div style={{ marginTop: 8 }}>
            <strong style={{ fontSize: 13 }}>Documents:</strong>
            <ul style={{ margin: '4px 0 0', paddingLeft: 20 }}>
              {organiser.documents.map((doc, idx) => (
                <li key={idx}>
                  <a
                    href={doc.url || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ fontSize: 13, color: 'var(--accent)' }}
                  >
                    {doc.name || `Document ${idx + 1}`}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      <div className="form-group">
        <label className="form-label">Review Note (optional)</label>
        <textarea
          className="form-textarea"
          placeholder="Add a note about this decision..."
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      </div>
    </Modal>
  );
}

export default function Organisers() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('pending');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [organisers, setOrganisers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(15);
  const [reviewOrg, setReviewOrg] = useState(null);
  const [createOrgOpen, setCreateOrgOpen] = useState(false);
  const [createOrgForm, setCreateOrgForm] = useState({ name: '', email: '', org_name: '', org_type: 'charity' });

  const fetchOrganisers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { page, limit: pageSize };
      if (activeTab !== 'all') params.status = activeTab;
      const res = await apiGet('/admin/organisers', params);
      setOrganisers(res.data || []);
      setTotal(res.total || 0);
    } catch (err) {
      setError(err.message || 'Failed to load organisers');
    } finally {
      setLoading(false);
    }
  }, [activeTab, page, pageSize]);

  useEffect(() => {
    fetchOrganisers();
  }, [fetchOrganisers]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setPage(1);
  };

  const handleReview = (org) => {
    setReviewOrg(org);
  };

  const handleConfirmReview = async (org, status, note) => {
    try {
      await apiPut(`/admin/organisers/${org.id}/approve`, { status, note });
      toast(
        `${org.organisation_name} has been ${status}`,
        status === 'approved' ? 'success' : 'info'
      );
      setReviewOrg(null);
      fetchOrganisers();
    } catch (err) {
      toast(err.message || 'Failed to update organiser', 'error');
    }
  };

  const handleCreateOrganiser = async () => {
    try {
      const res = await apiPost('/admin/organisers/create-account', createOrgForm);
      toast(res.message || 'Organiser created', 'success');
      setCreateOrgOpen(false);
      setCreateOrgForm({ name: '', email: '', org_name: '', org_type: 'charity' });
      fetchOrganisers();
    } catch (err) {
      toast(err.message || 'Failed to create organiser', 'error');
    }
  };

  const totalPages = Math.ceil(total / pageSize);

  const columns = [
    { key: 'organisation_name', label: 'Organisation' },
    { key: 'organisation_type', label: 'Type' },
    { key: 'contact_name', label: 'Contact' },
    { key: 'contact_email', label: 'Email' },
    {
      key: 'created_at',
      label: 'Created',
      render: (val) => (val ? new Date(val).toLocaleDateString() : '--'),
    },
    {
      key: 'organisation_status',
      label: 'Status',
      render: (val) => <StatusBadge status={val || 'pending'} />,
    },
    {
      key: 'id',
      label: 'Actions',
      sortable: false,
      render: (_, row) => (
        <button
          className="btn btn-outline btn-sm"
          onClick={() => handleReview(row)}
        >
          {row.organisation_status === 'pending' ? 'Review' : 'View'}
        </button>
      ),
    },
  ];

  return (
    <div>
      <Topbar title="Organisers" />
      <div className="main-content">
        <div className="page-header">
          <h2 className="page-title">Organisation Approval</h2>
          <div className="page-actions">
            <button className="btn btn-primary" onClick={() => setCreateOrgOpen(true)}>+ Create Organiser</button>
          </div>
        </div>

        <div className="tab-bar">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              className={`tab-item${activeTab === tab.key ? ' active' : ''}`}
              onClick={() => handleTabChange(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {loading && (
          <div className="loading-state">
            <p>Loading organisers...</p>
          </div>
        )}
        {error && !loading && (
          <div className="error-state">
            <h2>Error loading organisers</h2>
            <p>{error}</p>
            <button className="btn btn-primary" onClick={fetchOrganisers}>
              Retry
            </button>
          </div>
        )}
        {!loading && !error && organisers.length === 0 && (
          <div className="empty-state">
            <h2>No organisers found</h2>
            <p>There are no {activeTab} organisers to display.</p>
          </div>
        )}
        {!loading && !error && organisers.length > 0 && (
          <>
            {activeTab === 'pending' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {organisers.map((org) => (
                  <div className="card" key={org.id}>
                    <div className="card-header">
                      <h3 className="card-title">{org.organisation_name}</h3>
                      <StatusBadge status={org.organisation_status || 'pending'} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, fontSize: 13 }}>
                      <div>
                        <span style={{ color: 'var(--muted)' }}>Type:</span>{' '}
                        {org.organisation_type || '--'}
                      </div>
                      <div>
                        <span style={{ color: 'var(--muted)' }}>Contact:</span>{' '}
                        {org.contact_name}
                      </div>
                      <div>
                        <span style={{ color: 'var(--muted)' }}>Email:</span>{' '}
                        {org.contact_email}
                      </div>
                      <div>
                        <span style={{ color: 'var(--muted)' }}>Created:</span>{' '}
                        {org.created_at ? new Date(org.created_at).toLocaleDateString() : '--'}
                      </div>
                    </div>
                    {org.documents && org.documents.length > 0 && (
                      <div style={{ marginTop: 12, fontSize: 13 }}>
                        <span style={{ color: 'var(--muted)' }}>Documents:</span>
                        <ul style={{ margin: '4px 0 0', paddingLeft: 20 }}>
                          {org.documents.map((doc, idx) => (
                            <li key={idx}>
                              <a
                                href={doc.url || '#'}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ color: 'var(--accent)' }}
                              >
                                {doc.name || `Document ${idx + 1}`}
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => handleConfirmReview(org, 'approved', '')}
                      >
                        Approve
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleConfirmReview(org, 'rejected', '')}
                      >
                        Reject
                      </button>
                      <button
                        className="btn btn-outline btn-sm"
                        onClick={() => handleReview(org)}
                      >
                        Review with Note
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {(activeTab === 'approved' || activeTab === 'rejected') && (
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
                      {organisers.map((row) => (
                        <tr key={row.id}>
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
          </>
        )}
      </div>

      <ReviewModal
        isOpen={!!reviewOrg}
        onClose={() => setReviewOrg(null)}
        organiser={reviewOrg}
        onConfirm={handleConfirmReview}
      />

      <Modal isOpen={!!createOrgOpen} onClose={() => setCreateOrgOpen(false)} title="Create Organiser"
        actions={[
          { label: 'Cancel', variant: 'secondary', onClick: () => setCreateOrgOpen(false) },
          { label: 'Create', variant: 'primary', onClick: handleCreateOrganiser },
        ]}>
        <div className="form-group" style={{ marginBottom: 12 }}>
          <label className="form-label">Name</label>
          <input className="form-input" value={createOrgForm.name} onChange={(e) => setCreateOrgForm({...createOrgForm, name: e.target.value})}
            style={{ width:'100%', padding:'10px 12px', border:'1px solid #ddd', borderRadius:6, fontSize:14, boxSizing:'border-box' }} />
        </div>
        <div className="form-group" style={{ marginBottom: 12 }}>
          <label className="form-label">Email</label>
          <input className="form-input" type="email" value={createOrgForm.email} onChange={(e) => setCreateOrgForm({...createOrgForm, email: e.target.value})}
            style={{ width:'100%', padding:'10px 12px', border:'1px solid #ddd', borderRadius:6, fontSize:14, boxSizing:'border-box' }} />
        </div>
        <div className="form-row" style={{ display:'flex', gap:12, marginBottom:12 }}>
          <div className="form-group" style={{ flex:1 }}>
            <label className="form-label">Organisation</label>
            <input className="form-input" value={createOrgForm.org_name} onChange={(e) => setCreateOrgForm({...createOrgForm, org_name: e.target.value})}
              style={{ width:'100%', padding:'10px 12px', border:'1px solid #ddd', borderRadius:6, fontSize:14, boxSizing:'border-box' }} />
          </div>
          <div className="form-group" style={{ flex:1 }}>
            <label className="form-label">Type</label>
            <select className="form-select" value={createOrgForm.org_type} onChange={(e) => setCreateOrgForm({...createOrgForm, org_type: e.target.value})}
              style={{ width:'100%', padding:'10px 12px', border:'1px solid #ddd', borderRadius:6, fontSize:14, boxSizing:'border-box' }}>
              <option value="charity">Charity</option>
              <option value="community_group">Community Group</option>
              <option value="statutory_board">Statutory Board</option>
            </select>
          </div>
        </div>
      </Modal>
    </div>
  );
}
