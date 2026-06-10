import { useState, useEffect, useCallback } from 'react';
import Topbar from '../../components/Topbar';
import { useToast } from '../../components/Toast';
import { apiGet, apiPut } from '../../services/api';

const DEFAULT_CONFIG = {
  direct_sponsor_points: 10,
  helped_sponsor_points: 4,
  upline_helper_points: 6,
  max_depth: 3,
};

export default function SponsorshipConfig() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [config, setConfig] = useState(DEFAULT_CONFIG);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);

  const fetchConfig = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiGet('/admin/sponsorship/configuration');
      setConfig({
        direct_sponsor_points: res.direct_sponsor_points ?? DEFAULT_CONFIG.direct_sponsor_points,
        helped_sponsor_points: res.helped_sponsor_points ?? DEFAULT_CONFIG.helped_sponsor_points,
        upline_helper_points: res.upline_helper_points ?? DEFAULT_CONFIG.upline_helper_points,
        max_depth: res.max_depth ?? DEFAULT_CONFIG.max_depth,
      });
      setLastUpdated(res.updated_at || null);
      setHasChanges(false);
    } catch (err) {
      setError(err.message || 'Failed to load sponsorship configuration');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchConfig(); }, [fetchConfig]);

  const handleChange = (field) => (e) => {
    const val = parseInt(e.target.value, 10);
    setConfig((prev) => ({ ...prev, [field]: isNaN(val) ? '' : val }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        direct_sponsor_points: Number(config.direct_sponsor_points) || DEFAULT_CONFIG.direct_sponsor_points,
        helped_sponsor_points: Number(config.helped_sponsor_points) || DEFAULT_CONFIG.helped_sponsor_points,
        upline_helper_points: Number(config.upline_helper_points) || DEFAULT_CONFIG.upline_helper_points,
        max_depth: Number(config.max_depth) || DEFAULT_CONFIG.max_depth,
      };
      const res = await apiPut('/admin/sponsorship/configuration', payload);
      setLastUpdated(res.updated_at || new Date().toISOString());
      setHasChanges(false);
      toast('Sponsorship configuration saved successfully', 'success');
    } catch (err) {
      toast(err.message || 'Failed to save configuration', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div>
        <Topbar title="Sponsorship Configuration" />
        <div className="main-content">
          <div className="loading-state"><p>Loading configuration...</p></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <Topbar title="Sponsorship Configuration" />
        <div className="main-content">
          <div className="error-state">
            <h2>Error loading configuration</h2>
            <p>{error}</p>
            <button className="btn btn-primary" onClick={fetchConfig}>Retry</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Topbar title="Sponsorship Configuration" />
      <div className="main-content">
        <div className="page-header">
          <h2 className="page-title">Sponsorship Points Configuration</h2>
          <div className="page-actions">
            <button
              className="btn btn-primary"
              onClick={handleSave}
              disabled={saving}
              style={{ fontWeight: 600, background: '#2563eb', color: '#fff', border: 'none', padding: '10px 24px', borderRadius: 6, cursor: saving ? 'not-allowed' : 'pointer' }}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>

        <div className="card" style={{ maxWidth: 600, marginBottom: 20 }}>
          <div className="card-header">
            <h3 className="card-title">Sponsorship Point Values</h3>
            {lastUpdated && (
              <span style={{ fontSize: 12, color: 'var(--muted)' }}>
                Last updated: {new Date(lastUpdated).toLocaleString()}
              </span>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">
              Direct Sponsor Points
              <span style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 400, marginLeft: 4 }}>
                (points earned when you recruit someone without help)
              </span>
            </label>
            <input className="form-input" type="number" min="0"
              value={config.direct_sponsor_points}
              onChange={handleChange('direct_sponsor_points')} />
          </div>

          <div className="form-group">
            <label className="form-label">
              Helped Sponsor Points
              <span style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 400, marginLeft: 4 }}>
                (points earned when you recruit with upline help)
              </span>
            </label>
            <input className="form-input" type="number" min="0"
              value={config.helped_sponsor_points}
              onChange={handleChange('helped_sponsor_points')} />
          </div>

          <div className="form-group">
            <label className="form-label">
              Upline Helper Points
              <span style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 400, marginLeft: 4 }}>
                (points earned by upline for helping you recruit)
              </span>
            </label>
            <input className="form-input" type="number" min="0"
              value={config.upline_helper_points}
              onChange={handleChange('upline_helper_points')} />
          </div>

          <div className="form-group">
            <label className="form-label">
              Max Depth
              <span style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 400, marginLeft: 4 }}>
                (maximum sponsorship levels for rewards, default: 3)
              </span>
            </label>
            <input className="form-input" type="number" min="1" max="5"
              value={config.max_depth}
              onChange={handleChange('max_depth')} />
          </div>

          {/* Visual explanation */}
          <div style={{ marginTop: 20, padding: 16, background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0' }}>
            <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>How Points Work</h4>
            <div style={{ fontSize: 13, lineHeight: 1.8, color: '#374151' }}>
              <p><strong>You recruit Person A (no help):</strong> You earn <strong>{config.direct_sponsor_points} pts</strong></p>
              <p><strong>You help Person A recruit Person B:</strong> Person A earns {config.helped_sponsor_points} pts, You earn {config.upline_helper_points} pts</p>
              <p><strong>Person B recruits Person C (with A's help):</strong> Person B earns {config.helped_sponsor_points} pts, Person A earns {config.upline_helper_points} pts</p>
              <p><strong>Max depth:</strong> {config.max_depth} levels. Beyond this, no further rewards.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
