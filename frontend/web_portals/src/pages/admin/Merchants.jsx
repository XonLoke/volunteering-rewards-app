import { useState, useEffect, useCallback } from 'react';
import Topbar from '../../components/Topbar';
import DataTable from '../../components/DataTable';
import Modal from '../../components/Modal';
import { useToast } from '../../components/Toast';
import { apiGet, apiPost } from '../../services/api';

const INITIAL_FORM = {
  name: '',
  contact_person: '',
  contact_email: '',
  contact_phone: '',
  address: '',
};

const INITIAL_PRODUCT = {
  name: '',
  description: '',
  points_cost: '',
};

function MerchantFormModal({ isOpen, onClose, onSubmit }) {
  const [form, setForm] = useState(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) setForm(INITIAL_FORM);
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    try {
      await onSubmit(form);
      setForm(INITIAL_FORM);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Register Merchant"
      actions={[
        { label: 'Cancel', variant: 'secondary', onClick: onClose },
        { label: 'Register', variant: 'primary', onClick: handleSubmit, disabled: submitting },
      ]}
    >
      <div className="form-group" style={{ marginBottom: 12 }}>
        <label className="form-label">Merchant Name *</label>
        <input className="form-input" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})}
          style={{ width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: 6, fontSize: 14, boxSizing: 'border-box' }} />
      </div>
      <div className="form-group" style={{ marginBottom: 12 }}>
        <label className="form-label">Contact Person</label>
        <input className="form-input" value={form.contact_person} onChange={(e) => setForm({...form, contact_person: e.target.value})}
          style={{ width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: 6, fontSize: 14, boxSizing: 'border-box' }} />
      </div>
      <div className="form-row" style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
        <div className="form-group" style={{ flex: 1 }}>
          <label className="form-label">Email</label>
          <input className="form-input" type="email" value={form.contact_email} onChange={(e) => setForm({...form, contact_email: e.target.value})}
            style={{ width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: 6, fontSize: 14, boxSizing: 'border-box' }} />
        </div>
        <div className="form-group" style={{ flex: 1 }}>
          <label className="form-label">Phone</label>
          <input className="form-input" value={form.contact_phone} onChange={(e) => setForm({...form, contact_phone: e.target.value})}
            style={{ width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: 6, fontSize: 14, boxSizing: 'border-box' }} />
        </div>
      </div>
      <div className="form-group">
        <label className="form-label">Address</label>
        <textarea className="form-textarea" value={form.address} onChange={(e) => setForm({...form, address: e.target.value})}
          style={{ width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: 6, fontSize: 14, boxSizing: 'border-box', minHeight: 60 }} />
      </div>
    </Modal>
  );
}

function ProductFormModal({ isOpen, onClose, merchant, onSubmit }) {
  const [form, setForm] = useState(INITIAL_PRODUCT);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) setForm(INITIAL_PRODUCT);
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    try {
      await onSubmit(merchant.id, form);
      setForm(INITIAL_PRODUCT);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Add Product: ${merchant?.name || ''}`}
      actions={[
        { label: 'Cancel', variant: 'secondary', onClick: onClose },
        { label: 'Add', variant: 'primary', onClick: handleSubmit, disabled: submitting },
      ]}
    >
      <div className="form-group" style={{ marginBottom: 12 }}>
        <label className="form-label">Product Name *</label>
        <input className="form-input" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})}
          style={{ width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: 6, fontSize: 14, boxSizing: 'border-box' }} />
      </div>
      <div className="form-group" style={{ marginBottom: 12 }}>
        <label className="form-label">Description</label>
        <textarea className="form-textarea" value={form.description} onChange={(e) => setForm({...form, description: e.target.value})}
          style={{ width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: 6, fontSize: 14, boxSizing: 'border-box', minHeight: 60 }} />
      </div>
      <div className="form-group">
        <label className="form-label">Points Cost *</label>
        <input className="form-input" type="number" value={form.points_cost} onChange={(e) => setForm({...form, points_cost: e.target.value})}
          style={{ width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: 6, fontSize: 14, boxSizing: 'border-box' }} />
      </div>
    </Modal>
  );
}

function ProductListModal({ isOpen, onClose, merchant, products }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Products: ${merchant?.name || ''}`}
      actions={[{ label: 'Close', variant: 'secondary', onClick: onClose }]}
    >
      {(!products || products.length === 0) ? (
        <div className="empty-state"><p>No products added yet.</p></div>
      ) : (
        <table className="data-table" style={{ width: '100%' }}>
          <thead><tr><th>Product</th><th>Description</th><th>Points</th></tr></thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id}>
                <td style={{ fontWeight: 500 }}>{p.name}</td>
                <td>{p.description || '--'}</td>
                <td>{p.points_cost}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </Modal>
  );
}

export default function Merchants() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('merchants');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [merchants, setMerchants] = useState([]);
  const [total, setTotal] = useState(0);
  const [formOpen, setFormOpen] = useState(false);
  const [productFormOpen, setProductFormOpen] = useState(false);
  const [productListOpen, setProductListOpen] = useState(false);
  const [selectedMerchant, setSelectedMerchant] = useState(null);
  const [products, setProducts] = useState([]);

  const fetchMerchants = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiGet('/admin/merchants');
      setMerchants(res.data || []);
      setTotal(res.total || 0);
    } catch (err) {
      setError(err.message || 'Failed to load merchants');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchMerchants(); }, [fetchMerchants]);

  const handleCreateMerchant = async (data) => {
    try {
      await apiPost('/admin/merchants', data);
      toast('Merchant registered successfully', 'success');
      setFormOpen(false);
      fetchMerchants();
    } catch (err) {
      toast(err.message || 'Failed to register merchant', 'error');
    }
  };

  const handleAddProduct = async (merchantId, data) => {
    try {
      await apiPost(`/admin/merchants/${merchantId}/products`, data);
      toast('Product added', 'success');
      setProductFormOpen(false);
    } catch (err) {
      toast(err.message || 'Failed to add product', 'error');
    }
  };

  const [prospects, setProspects] = useState([]);
  const [prospectFormOpen, setProspectFormOpen] = useState(false);
  const [prospectForm, setProspectForm] = useState({ name: '', contact_person: '', contact_email: '', contact_phone: '', notes: '' });
  const [accountFormOpen, setAccountFormOpen] = useState(false);
  const [accountForm, setAccountForm] = useState({ name: '', email: '', password: 'password123', phone: '', merchant_id: '' });

  const fetchProspects = useCallback(async () => {
    try { const r = await apiGet('/admin/merchants/prospects'); setProspects(r.data || []); } catch {}
  }, []);

  useEffect(() => {
    if (activeTab === 'prospects') fetchProspects();
  }, [activeTab, fetchProspects]);

  const handleCreateProspect = async () => {
    try {
      await apiPost('/admin/merchants/prospects', prospectForm);
      toast('Prospect added', 'success');
      setProspectFormOpen(false);
      setProspectForm({ name: '', contact_person: '', contact_email: '', contact_phone: '', notes: '' });
      fetchProspects();
    } catch (err) { toast(err.message || 'Failed', 'error'); }
  };

  const handleCreateAccount = async () => {
    try {
      const data = { ...accountForm, merchant_id: parseInt(accountForm.merchant_id) || undefined };
      const r = await apiPost('/admin/merchants/create-account', data);
      toast(r.message || 'Account created', 'success');
      setAccountFormOpen(false);
      setAccountForm({ name: '', email: '', password: 'password123', phone: '', merchant_id: '' });
    } catch (err) { toast(err.message || 'Failed', 'error'); }
  };

  const handleViewProducts = async (merchant) => {
    setSelectedMerchant(merchant);
    try {
      const res = await apiGet(`/admin/merchants/${merchant.id}/products`);
      setProducts(res.data || []);
      setProductListOpen(true);
    } catch (err) {
      toast(err.message || 'Failed to load products', 'error');
    }
  };

  const columns = [
    { key: 'name', label: 'Merchant Name' },
    { key: 'contact_person', label: 'Contact Person' },
    { key: 'contact_email', label: 'Email' },
    { key: 'contact_phone', label: 'Phone' },
    { key: 'product_count', label: 'Products' },
    {
      key: 'id', label: 'Actions', sortable: false,
      render: (_, row) => (
        <div style={{ display: 'flex', gap: 6 }}>
          <button className="btn btn-outline btn-sm" onClick={() => { setSelectedMerchant(row); setProductFormOpen(true); }}>
            + Product
          </button>
          <button className="btn btn-outline btn-sm" onClick={() => handleViewProducts(row)}>
            View Products
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <Topbar title="Merchants" />
      <div className="main-content">
        <div className="page-header">
          <h2 className="page-title">Merchant Management</h2>
          <div className="page-actions" style={{ display: 'flex', gap: 12 }}>
            <div style={{ display: 'flex', gap: 4 }}>
              <button className={`btn btn-sm ${activeTab === 'merchants' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab('merchants')}>Merchants</button>
              <button className={`btn btn-sm ${activeTab === 'prospects' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab('prospects')}>Sourcing</button>
            </div>
            {activeTab === 'merchants' ? (
              <>
                <button className="btn btn-outline btn-sm" onClick={() => setAccountFormOpen(true)}>Create Account</button>
                <button className="btn btn-primary" onClick={() => setFormOpen(true)}>+ Register</button>
              </>
            ) : (
              <button className="btn btn-primary btn-sm" onClick={() => setProspectFormOpen(true)}>+ Add Prospect</button>
            )}
          </div>
        </div>

        {loading && <div className="loading-state"><p>Loading merchants...</p></div>}
        {error && !loading && (
          <div className="error-state">
            <h2>Error loading merchants</h2>
            <p>{error}</p>
            <button className="btn btn-primary" onClick={fetchMerchants}>Retry</button>
          </div>
        )}
        {!loading && !error && merchants.length === 0 && (
          <div className="empty-state" style={{ padding: '60px 40px' }}>
            <h2>No Merchants Yet</h2>
            <p>Register your first merchant to start building the rewards network.</p>
            <button className="btn btn-primary" onClick={() => setFormOpen(true)} style={{ marginTop: 12 }}>
              + Register Merchant
            </button>
          </div>
        )}
        {activeTab === 'merchants' && !loading && !error && merchants.length > 0 && (
          <DataTable columns={columns} data={merchants} />
        )}
        
        {activeTab === 'prospects' && (
          <>
            {prospects.length === 0 ? (
              <div className="empty-state" style={{ padding: '60px 40px' }}>
                <h2>No Prospects Yet</h2>
                <p>Track potential merchants before onboarding them.</p>
                <button className="btn btn-primary" onClick={() => setProspectFormOpen(true)} style={{ marginTop: 12 }}>+ Add Prospect</button>
              </div>
            ) : (
              <DataTable 
                columns={[
                  { key: 'name', label: 'Company' },
                  { key: 'contact_person', label: 'Contact' },
                  { key: 'contact_email', label: 'Email' },
                  { key: 'contact_phone', label: 'Phone' },
                  { key: 'status', label: 'Status' },
                  { key: 'notes', label: 'Notes' },
                ]} 
                data={prospects} 
              />
            )}
          </>
        )}
      </div>

      <MerchantFormModal isOpen={formOpen} onClose={() => setFormOpen(false)} onSubmit={handleCreateMerchant} />
      
      <Modal isOpen={prospectFormOpen} onClose={() => setProspectFormOpen(false)} title="Add Prospect"
        actions={[
          { label: 'Cancel', variant: 'secondary', onClick: () => setProspectFormOpen(false) },
          { label: 'Add', variant: 'primary', onClick: handleCreateProspect },
        ]}>
        <div className="form-group" style={{ marginBottom: 12 }}>
          <label className="form-label">Company Name</label>
          <input className="form-input" value={prospectForm.name} onChange={(e) => setProspectForm({...prospectForm, name: e.target.value})} style={{ width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: 6, fontSize: 14, boxSizing: 'border-box' }} />
        </div>
        <div className="form-row" style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
          <div className="form-group" style={{ flex: 1 }}>
            <label className="form-label">Contact Person</label>
            <input className="form-input" value={prospectForm.contact_person} onChange={(e) => setProspectForm({...prospectForm, contact_person: e.target.value})} style={{ width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: 6, fontSize: 14, boxSizing: 'border-box' }} />
          </div>
          <div className="form-group" style={{ flex: 1 }}>
            <label className="form-label">Email</label>
            <input className="form-input" value={prospectForm.contact_email} onChange={(e) => setProspectForm({...prospectForm, contact_email: e.target.value})} style={{ width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: 6, fontSize: 14, boxSizing: 'border-box' }} />
          </div>
        </div>
        <div className="form-group" style={{ marginBottom: 12 }}>
          <label className="form-label">Notes</label>
          <textarea className="form-textarea" value={prospectForm.notes} onChange={(e) => setProspectForm({...prospectForm, notes: e.target.value})} style={{ width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: 6, fontSize: 14, boxSizing: 'border-box', minHeight: 60 }} />
        </div>
      </Modal>

      <Modal isOpen={accountFormOpen} onClose={() => setAccountFormOpen(false)} title="Create Merchant Login"
        actions={[
          { label: 'Cancel', variant: 'secondary', onClick: () => setAccountFormOpen(false) },
          { label: 'Create', variant: 'primary', onClick: handleCreateAccount },
        ]}>
        <div className="form-group" style={{ marginBottom: 12 }}>
          <label className="form-label">Full Name</label>
          <input className="form-input" value={accountForm.name} onChange={(e) => setAccountForm({...accountForm, name: e.target.value})} style={{ width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: 6, fontSize: 14, boxSizing: 'border-box' }} />
        </div>
        <div className="form-group" style={{ marginBottom: 12 }}>
          <label className="form-label">Email (login ID)</label>
          <input className="form-input" type="email" value={accountForm.email} onChange={(e) => setAccountForm({...accountForm, email: e.target.value})} style={{ width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: 6, fontSize: 14, boxSizing: 'border-box' }} />
        </div>
        <div className="form-row" style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
          <div className="form-group" style={{ flex: 1 }}>
            <label className="form-label">Password</label>
            <input className="form-input" type="password" value={accountForm.password} onChange={(e) => setAccountForm({...accountForm, password: e.target.value})} style={{ width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: 6, fontSize: 14, boxSizing: 'border-box' }} />
          </div>
          <div className="form-group" style={{ flex: 1 }}>
            <label className="form-label">Phone</label>
            <input className="form-input" value={accountForm.phone} onChange={(e) => setAccountForm({...accountForm, phone: e.target.value})} style={{ width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: 6, fontSize: 14, boxSizing: 'border-box' }} />
          </div>
        </div>
        <p style={{ fontSize: 12, color: 'var(--muted)' }}>Default password is "password123"</p>
      </Modal>
      <ProductFormModal isOpen={productFormOpen} onClose={() => setProductFormOpen(false)}
        merchant={selectedMerchant} onSubmit={handleAddProduct} />
      <ProductListModal isOpen={productListOpen} onClose={() => setProductListOpen(null)}
        merchant={selectedMerchant} products={products} />
    </div>
  );
}
