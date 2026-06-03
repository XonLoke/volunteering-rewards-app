import { useState, useEffect, useCallback } from 'react';
import Topbar from '../../components/Topbar';
import { useToast } from '../../components/Toast';
import { apiGet, apiPut } from '../../services/api';

const DEFAULT_CONFIG = {
  points_per_dollar: 100,
  min_redeem_points: 50,
  max_redeem_per_day: 5,
  default_event_points: 50,
};

export default function RewardsConfig() {
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
      const res = await apiGet('/admin/rewards/configuration');
      setConfig({
        points_per_dollar: res.points_per_dollar ?? DEFAULT_CONFIG.points_per_dollar,
        min_redeem_points: res.min_redeem_points ?? DEFAULT_CONFIG.min_redeem_points,
        max_redeem_per_day: res.max_redeem_per_day ?? DEFAULT_CONFIG.max_redeem_per_day,
        default_event_points: res.default_event_points ?? DEFAULT_CONFIG.default_event_points,
      });
      setLastUpdated(res.updated_at || null);
      setHasChanges(false);
    } catch (err) {
      setError(err.message || 'Failed to load configuration');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  const handleChange = (field) => (e) => {
    const val = parseInt(e.target.value, 10);
    setConfig((prev) => ({ ...prev, [field]: isNaN(val) ? '' : val }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        points_per_dollar: Number(config.points_per_dollar) || DEFAULT_CONFIG.points_per_dollar,
        min_redeem_points: Number(config.min_redeem_points) || DEFAULT_CONFIG.min_redeem_points,
        max_redeem_per_day: Number(config.max_redeem_per_day) || DEFAULT_CONFIG.max_redeem_per_day,
        default_event_points: Number(config.default_event_points) || DEFAULT_CONFIG.default_event_points,
      };
      const res = await apiPut('/admin/rewards/configuration', payload);
      setLastUpdated(res.updated_at || new Date().toISOString());
      setHasChanges(false);
      toast('Configuration saved successfully', 'success');
    } catch (err) {
      toast(err.message || 'Failed to save configuration', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div>
        <Topbar title="Rewards Configuration" />
        <div className="main-content">
          <div className="loading-state">
            <p>Loading configuration...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <Topbar title="Rewards Configuration" />
        <div className="main-content">
          <div className="error-state">
            <h2>Error loading configuration</h2>
            <p>{error}</p>
            <button className="btn btn-primary" onClick={fetchConfig}>
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Topbar title="Rewards Configuration" />
      <div className="main-content">
        <div className="page-header">
          <h2 className="page-title">Reward System Configuration</h2>
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

        <div className="card" style={{ maxWidth: 560 }}>
          <div className="card-header">
            <h3 className="card-title">Point Values</h3>
            {lastUpdated && (
              <span style={{ fontSize: 12, color: 'var(--muted)' }}>
                Last updated: {new Date(lastUpdated).toLocaleString()}
              </span>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">
              Points Per Dollar
              <span style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 400, marginLeft: 4 }}>
                (how many points per $1 spent)
              </span>
            </label>
            <input
              className="form-input"
              type="number"
              min="1"
              value={config.points_per_dollar}
              onChange={handleChange('points_per_dollar')}
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              Minimum Redeem Points
              <span style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 400, marginLeft: 4 }}>
                (minimum points needed for a redemption)
              </span>
            </label>
            <input
              className="form-input"
              type="number"
              min="1"
              value={config.min_redeem_points}
              onChange={handleChange('min_redeem_points')}
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              Max Redemptions Per Day
              <span style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 400, marginLeft: 4 }}>
                (limit per user)
              </span>
            </label>
            <input
              className="form-input"
              type="number"
              min="1"
              value={config.max_redeem_per_day}
              onChange={handleChange('max_redeem_per_day')}
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              Default Event Points
              <span style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 400, marginLeft: 4 }}>
                (points awarded for attending an event)
              </span>
            </label>
            <input
              className="form-input"
              type="number"
              min="1"
              value={config.default_event_points}
              onChange={handleChange('default_event_points')}
            />
          </div>

          {lastUpdated && (
            <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 16 }}>
              Configuration last updated: {new Date(lastUpdated).toLocaleString()}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
