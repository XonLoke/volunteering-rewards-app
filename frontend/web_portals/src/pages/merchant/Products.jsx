import { useState, useEffect, useCallback } from 'react';
import Topbar from '../../components/Topbar';
import DataTable from '../../components/DataTable';
import Modal from '../../components/Modal';
import { useToast } from '../../components/Toast';
import { apiGet, apiPost, apiPut, apiDel } from '../../services/api';

function ProductForm({ initial, onSave, onCancel, saving }) {
  const [name, setName] = useState(initial?.name || '');
  const [description, setDescription] = useState(initial?.description || '');
  const [pointsCost, setPointsCost] = useState(initial?.points_cost || 0);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSave({ name: name.trim(), description: description.trim(), points_cost: parseInt(pointsCost) || 0 });
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div className="form-group">
        <label className="form-label">Product Name *</label>
        <input
          className="form-input"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          placeholder="e.g. Kopitiam Coffee Set"
          disabled={saving}
          autoFocus
        />
      </div>
      <div className="form-group">
        <label className="form-label">Description</label>
        <textarea
          className="form-input"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Brief description of the product"
          rows={3}
          disabled={saving}
          style={{ resize: 'vertical', minHeight: 80 }}
        />
      </div>
      <div className="form-group">
        <label className="form-label">Points Cost</label>
        <input
          className="form-input"
          type="number"
          min={0}
          value={pointsCost}
          onChange={(e) => setPointsCost(e.target.value)}
          disabled={saving}
          placeholder="e.g. 50"
        />
      </div>
      <div className="modal-actions">
        <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={saving}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary" disabled={saving || !name.trim()}>
          {saving ? 'Saving...' : initial ? 'Update Product' : 'Add Product'}
        </button>
      </div>
    </form>
  );
}

export default function MerchantProducts() {
  const { toast } = useToast();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal state
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [saving, setSaving] = useState(false);

  // Delete confirm state
  const [deletingProduct, setDeletingProduct] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiGet('/merchant/products');
      setProducts(res.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleCreate = async (data) => {
    setSaving(true);
    try {
      await apiPost('/merchant/products', data);
      toast('Product created successfully', 'success');
      setShowForm(false);
      fetchProducts();
    } catch (err) {
      toast(err.message || 'Failed to create product', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (data) => {
    if (!editingProduct) return;
    setSaving(true);
    try {
      await apiPut(`/merchant/products/${editingProduct.id}`, data);
      toast('Product updated successfully', 'success');
      setShowForm(false);
      setEditingProduct(null);
      fetchProducts();
    } catch (err) {
      toast(err.message || 'Failed to update product', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingProduct) return;
    setDeleting(true);
    try {
      await apiDel(`/merchant/products/${deletingProduct.id}`);
      toast('Product deactivated', 'success');
      setDeletingProduct(null);
      fetchProducts();
    } catch (err) {
      toast(err.message || 'Failed to deactivate product', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const openCreate = () => {
    setEditingProduct(null);
    setShowForm(true);
  };

  const openEdit = (product) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const columns = [
    {
      key: 'name',
      label: 'Name',
      sortable: true,
      render: (val, row) => <span style={{ fontWeight: 500 }}>{row.name}</span>,
    },
    {
      key: 'description',
      label: 'Description',
      sortable: false,
      render: (val, row) => row.description || '-',
    },
    {
      key: 'points_cost',
      label: 'Points',
      sortable: true,
      render: (val, row) => <span style={{ fontWeight: 600, color: '#FF9500' }}>{row.points_cost} pts</span>,
    },
    {
      key: 'is_active',
      label: 'Status',
      sortable: false,
      render: (val, row) => (
        <span className={`status-badge ${row.is_active ? 'approved' : 'disabled'}`}>
          {row.is_active ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      sortable: false,
      render: (val, row) => (
        <div style={{ display: 'flex', gap: 6 }}>
          <button className="btn btn-secondary btn-sm" onClick={() => openEdit(row)}>
            Edit
          </button>
          <button className="btn btn-danger btn-sm" onClick={() => setDeletingProduct(row)}>
            Deactivate
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="main-content">
      <Topbar title="My Products" />

      <div style={{ padding: 24 }}>
        <div className="page-header" style={{ marginBottom: 20 }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 600 }}>Products</h2>
            <p style={{ margin: '4px 0 0', fontSize: 13, color: '#6C6C70' }}>
              Manage the products volunteers can redeem with their points
            </p>
          </div>
          <button className="btn btn-primary" onClick={openCreate}>
            + Add Product
          </button>
        </div>

        {/* Error state */}
        {error && !loading && (
          <div className="error-state" style={{ marginBottom: 20 }}>
            <p>{error}</p>
            <button className="btn btn-primary" onClick={fetchProducts} style={{ marginTop: 8 }}>
              Retry
            </button>
          </div>
        )}

        <DataTable
          columns={columns}
          data={products}
          searchable
          searchPlaceholder="Search products..."
          loading={loading}
          emptyMessage="No products yet. Add your first product to get started."
          pageSize={10}
        />
      </div>

      {/* Create/Edit Modal */}
      {showForm && (
        <Modal
          title={editingProduct ? 'Edit Product' : 'Add Product'}
          onClose={() => { setShowForm(false); setEditingProduct(null); }}
        >
          <ProductForm
            initial={editingProduct}
            onSave={editingProduct ? handleUpdate : handleCreate}
            onCancel={() => { setShowForm(false); setEditingProduct(null); }}
            saving={saving}
          />
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {deletingProduct && (
        <Modal
          title="Deactivate Product"
          onClose={() => setDeletingProduct(null)}
        >
          <p style={{ fontSize: 14, color: '#1C1C1E', marginBottom: 20 }}>
            Are you sure you want to deactivate <strong>{deletingProduct.name}</strong>?
            Volunteers will no longer be able to redeem this product.
          </p>
          <div className="modal-actions">
            <button className="btn btn-secondary" onClick={() => setDeletingProduct(null)} disabled={deleting}>
              Cancel
            </button>
            <button className="btn btn-danger" onClick={handleDelete} disabled={deleting}>
              {deleting ? 'Deactivating...' : 'Deactivate'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
