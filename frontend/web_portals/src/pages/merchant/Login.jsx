import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiLogin } from '../../services/api';

export default function MerchantLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setError(null);
    try {
      const res = await apiLogin(email, password);
      if (res.user?.role !== 'merchant') {
        setError(`Access denied. This portal is for merchant cashiers only (your role: ${res.user?.role || 'unknown'}).`);
        setLoading(false);
        return;
      }
      navigate('/merchant/verify');
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.wrapper}>
      <div className="merchant-login-card" style={styles.card}>
        <div style={styles.header}>
          <div style={styles.iconWrap}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#FF9500" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
            </svg>
          </div>
          <h1 style={styles.title}>Cashier Login</h1>
          <p style={styles.subtitle}>Sign in to process redemptions</p>
        </div>

        {error && (
          <div style={styles.errorPanel}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="merchant-email">Email</label>
            <input
              id="merchant-email"
              type="email"
              className="form-input"
              style={styles.input}
              placeholder="cashier@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              autoFocus
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="merchant-password">Password</label>
            <input
              id="merchant-password"
              type="password"
              className="form-input"
              style={styles.input}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <button
            type="submit"
            style={{
              ...styles.primaryBtn,
              opacity: loading ? 0.7 : 1,
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
            disabled={loading}
          >
            {loading ? (
              <span style={styles.btnContent}>
                <span style={styles.spinner} />
                Signing in...
              </span>
            ) : (
              'Sign In'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    padding: 24,
    background: '#F5F5F7',
  },
  card: {
    background: '#FFFFFF',
    borderRadius: 16,
    padding: 40,
    width: '100%',
    maxWidth: 400,
    boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
  },
  header: {
    textAlign: 'center',
    marginBottom: 32,
  },
  iconWrap: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 700,
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'SF Pro Display', system-ui, sans-serif",
    margin: '0 0 8px',
    color: '#1C1C1E',
  },
  subtitle: {
    fontSize: 14,
    color: '#6C6C70',
    margin: 0,
  },
  errorPanel: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '12px 16px',
    background: '#FFEBEE',
    color: '#FF3B30',
    borderRadius: 10,
    fontSize: 13,
    fontWeight: 500,
    marginBottom: 20,
  },
  input: {
    minHeight: 48,
    fontSize: 16,
  },
  primaryBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    minHeight: 48,
    padding: '12px 24px',
    borderRadius: 10,
    fontSize: 16,
    fontWeight: 600,
    background: '#FF9500',
    color: '#FFFFFF',
    border: 'none',
    marginTop: 8,
    transition: 'background 0.15s',
  },
  btnContent: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  spinner: {
    display: 'inline-block',
    width: 16,
    height: 16,
    border: '2px solid rgba(255,255,255,0.3)',
    borderTopColor: '#FFFFFF',
    borderRadius: '50%',
    animation: 'spin 0.6s linear infinite',
  },
};
