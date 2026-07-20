import { useState, useEffect, useCallback } from 'react';
import Topbar from '../../components/Topbar';
import { useToast } from '../../components/Toast';
import { apiGet, apiPut, apiPost } from '../../services/api';

const DEFAULT_CONFIG = {
  smtp_host: 'smtp.gmail.com',
  smtp_port: 465,
  smtp_secure: true,
  email_user: '',
  email_pass: '',
  email_from_name: 'Volunteer Rewards App',
};

const FREE_PROVIDERS = [
  { name: 'Gmail (free)', host: 'smtp.gmail.com', port: 465, secure: true, note: 'Requires App Password — enable 2FA then generate at myaccount.google.com/apppasswords' },
  { name: 'SendGrid (100/day free)', host: 'smtp.sendgrid.net', port: 587, secure: false, note: 'Free tier: 100 emails/day. Set EMAIL_USER=apikey, EMAIL_PASS=<SendGrid API key>' },
  { name: 'Mailgun (100/day free)', host: 'smtp.mailgun.org', port: 587, secure: false, note: 'Free tier: 100 emails/day. Use your Mailgun domain credentials.' },
  { name: 'SMTP2GO (1000/mo free)', host: 'mail.smtp2go.com', port: 587, secure: false, note: 'Free tier: 1000 emails/month, no credit card needed.' },
  { name: 'Brevo (300/day free)', host: 'smtp-relay.brevo.com', port: 587, secure: false, note: 'Free tier: 300 emails/day.' },
];

export default function EmailConfig() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [error, setError] = useState(null);
  const [config, setConfig] = useState(DEFAULT_CONFIG);
  const [testEmail, setTestEmail] = useState('');
  const [hasChanges, setHasChanges] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [usingEnv, setUsingEnv] = useState(false);

  const fetchConfig = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiGet('/admin/email/config');
      setConfig({
        smtp_host: res.smtp_host ?? DEFAULT_CONFIG.smtp_host,
        smtp_port: res.smtp_port ?? DEFAULT_CONFIG.smtp_port,
        smtp_secure: res.smtp_secure ?? DEFAULT_CONFIG.smtp_secure,
        email_user: res.email_user ?? '',
        email_pass: res.email_pass ?? '',
        email_from_name: res.email_from_name ?? DEFAULT_CONFIG.email_from_name,
      });
      setUsingEnv(res.using_env_fallback || false);
      setHasChanges(false);
    } catch (err) {
      setError(err.message || 'Failed to load email configuration');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchConfig(); }, [fetchConfig]);

  const handleChange = (field) => (e) => {
    const val = field === 'smtp_port' ? parseInt(e.target.value, 10) || 465 :
               field === 'smtp_secure' ? e.target.checked : e.target.value;
    setConfig((prev) => ({ ...prev, [field]: val }));
    setHasChanges(true);
  };

  const applyPreset = (preset) => {
    setConfig((prev) => ({
      ...prev,
      smtp_host: preset.host,
      smtp_port: preset.port,
      smtp_secure: preset.secure,
    }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (!config.smtp_host.trim()) { toast('SMTP host is required.', 'error'); return; }
    if (!config.email_user.trim()) { toast('Email user is required.', 'error'); return; }

    setSaving(true);
    try {
      const payload = {
        smtp_host: config.smtp_host.trim(),
        smtp_port: Number(config.smtp_port) || 465,
        smtp_secure: config.smtp_secure,
        email_user: config.email_user.trim(),
        email_pass: config.email_pass,
        email_from_name: config.email_from_name.trim() || 'Volunteer Rewards App',
      };
      const res = await apiPut('/admin/email/config', payload);
      setHasChanges(false);
      toast(res.message || 'Email configuration saved', 'success');
    } catch (err) {
      toast(err.message || 'Failed to save', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    if (!testEmail.trim()) { toast('Enter a test email address.', 'error'); return; }
    setTesting(true);
    try {
      // Simple test: send a verification email to the test address
      const res = await apiPost('/admin/email/test', { email: testEmail.trim() });
      toast(res.message || 'Test email sent!', 'success');
    } catch (err) {
      toast(err.message || 'Test failed', 'error');
    } finally {
      setTesting(false);
    }
  };

  if (loading) {
    return (
      <div>
        <Topbar title="Email Configuration" />
        <div className="main-content">
          <div className="loading-state"><p>Loading email configuration...</p></div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Topbar title="Email Configuration" />
      <div className="main-content">
        {error && (
          <div className="alert alert-error" style={{ marginBottom: 20 }}>
            {error}
            <button className="btn btn-sm" onClick={fetchConfig} style={{ marginLeft: 12 }}>Retry</button>
          </div>
        )}

        {usingEnv && (
          <div className="alert alert-warning" style={{ marginBottom: 20, padding: '12px 16px', background: '#fff3cd', border: '1px solid #ffc107', borderRadius: 8, fontSize: 14 }}>
            ⚠️ Currently using environment variables (<code>EMAIL_USER</code>, <code>SMTP_HOST</code>).
            Settings below will override them once saved.
          </div>
        )}

        {/* Quick preset selector */}
        <div style={{ marginBottom: 24 }}>
          <label className="form-label" style={{ marginBottom: 8, display: 'block' }}>Quick Setup — Free Providers</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {FREE_PROVIDERS.map((p) => (
              <button key={p.name} className="btn btn-sm" onClick={() => applyPreset(p)}
                style={{ border: config.smtp_host === p.host ? '2px solid var(--primary)' : '1px solid #ddd', fontWeight: config.smtp_host === p.host ? 700 : 400 }}
                title={p.note}
              >
                {p.name.split('(')[0].trim()}
              </button>
            ))}
          </div>
          <div style={{ fontSize: 12, color: '#666', marginTop: 6 }}>
            {FREE_PROVIDERS.find(p => p.host === config.smtp_host)?.note || 'Select a provider above for recommended settings.'}
          </div>
        </div>

        <div className="card" style={{ padding: 24, borderRadius: 12, border: '1px solid #eee' }}>
          <h3 style={{ margin: '0 0 20px', fontSize: 18 }}>SMTP Server Settings</h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <div>
              <label className="form-label">SMTP Host *</label>
              <input className="form-input" value={config.smtp_host} onChange={handleChange('smtp_host')}
                placeholder="smtp.gmail.com" style={{ width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: 6, fontSize: 14, boxSizing: 'border-box' }} />
            </div>
            <div>
              <label className="form-label">SMTP Port</label>
              <input className="form-input" type="number" value={config.smtp_port} onChange={handleChange('smtp_port')}
                placeholder="465" style={{ width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: 6, fontSize: 14, boxSizing: 'border-box' }} />
            </div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
              <input type="checkbox" checked={config.smtp_secure} onChange={handleChange('smtp_secure')} />
              <span style={{ fontSize: 14, fontWeight: 600, color: '#333' }}>Use SSL/TLS (secure connection)</span>
            </label>
            <div style={{ fontSize: 12, color: '#666', marginTop: 4, marginLeft: 24 }}>
              Enable for port 465 (SSL). Disable for port 587 (STARTTLS).
            </div>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid #eee', margin: '20px 0' }} />

          <h4 style={{ margin: '0 0 16px', fontSize: 15, color: '#333' }}>Authentication</h4>

          <div style={{ marginBottom: 16 }}>
            <label className="form-label">Email User *</label>
            <input className="form-input" value={config.email_user} onChange={handleChange('email_user')}
              placeholder="your@email.com" style={{ width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: 6, fontSize: 14, boxSizing: 'border-box' }} />
            <div style={{ fontSize: 12, color: '#666', marginTop: 4, lineHeight: 1.5 }}>
              Your <strong>SMTP login username</strong> from your email provider — <em>not</em> your personal email.<br />
              {config.smtp_host?.includes('mailgun')
                ? '📌 Mailgun: find this under Sending → Domains → your domain → SMTP Credentials. It looks like postmaster@yourdomain.mailgun.org'
                : config.smtp_host?.includes('gmail')
                  ? '📌 Gmail: use your full Gmail address'
                  : config.smtp_host?.includes('sendgrid')
                    ? '📌 SendGrid: use "apikey" as the username'
                    : '📌 Check your provider\'s SMTP settings page for the login username.'}
            </div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label className="form-label">Email Password {config.email_pass === '********' ? '(leave blank to keep current)' : ''}</label>
            <div style={{ display: 'flex', gap: 8 }}>
              <input className="form-input" type={showPass ? 'text' : 'password'} value={config.email_pass}
                onChange={handleChange('email_pass')}
                placeholder={config.email_pass === '********' ? 'Enter new password to change' : 'SMTP password or API key'}
                style={{ flex: 1, padding: '10px 12px', border: '1px solid #ddd', borderRadius: 6, fontSize: 14, boxSizing: 'border-box' }} />
              <button className="btn btn-sm" onClick={() => setShowPass(!showPass)} style={{ whiteSpace: 'nowrap' }}>
                {showPass ? 'Hide' : 'Show'}
              </button>
            </div>
            <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
              For Gmail: generate an App Password at myaccount.google.com/apppasswords.
              For SendGrid: use your API key.
            </div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label className="form-label">Sender Display Name</label>
            <input className="form-input" value={config.email_from_name} onChange={handleChange('email_from_name')}
              placeholder="Volunteer Rewards App" style={{ width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: 6, fontSize: 14, boxSizing: 'border-box' }} />
          </div>

          <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
            <button className="btn btn-primary" onClick={handleSave} disabled={saving}
              style={{ opacity: saving ? 0.7 : 1, padding: '12px 32px' }}>
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
            {hasChanges && <span style={{ fontSize: 13, color: '#f59e0b', alignSelf: 'center' }}>Unsaved changes</span>}
          </div>
        </div>

        {/* Test Section */}
        <div className="card" style={{ padding: 24, borderRadius: 12, border: '1px solid #eee', marginTop: 20 }}>
          <h4 style={{ margin: '0 0 12px', fontSize: 15, color: '#333' }}>Send Test Email</h4>
          <p style={{ fontSize: 13, color: '#666', margin: '0 0 12px' }}>
            Send a test email to verify your SMTP settings are working.
          </p>
          <div style={{ display: 'flex', gap: 8 }}>
            <input className="form-input" type="email" value={testEmail} onChange={(e) => setTestEmail(e.target.value)}
              placeholder="recipient@example.com" style={{ flex: 1, padding: '10px 12px', border: '1px solid #ddd', borderRadius: 6, fontSize: 14, boxSizing: 'border-box' }} />
            <button className="btn btn-secondary" onClick={handleTest} disabled={testing}
              style={{ opacity: testing ? 0.7 : 1, whiteSpace: 'nowrap' }}>
              {testing ? 'Sending...' : 'Send Test'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
