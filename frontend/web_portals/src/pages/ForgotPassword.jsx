import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const BASE_URL = 'https://vol-rewards-api.onrender.com/api';

const inputStyle = {
  width: '100%',
  padding: '12px 14px',
  border: '1px solid #ddd',
  borderRadius: '8px',
  fontSize: '14px',
  outline: 'none',
  boxSizing: 'border-box',
};

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sent, setSent] = useState(false);
  // Detect portal from URL path: /admin/forgot-password => admin
  const pathParts = window.location.pathname.split('/');
  const portal = pathParts[1] === 'forgot-password' ? 'admin' : pathParts[1] || 'admin';
  const portalNames = { admin: 'Admin', organiser: 'Organiser', merchant: 'Merchant', scan: 'Scanner' };
  const portalTitle = portalNames[portal] || 'Portal';

  // Build the correct redirect URL for the reset email
  const getRedirectUrl = () => {
    const origins = {
      admin: `${window.location.origin}/admin/reset-password`,
      organiser: `${window.location.origin}/organiser/reset-password`,
      merchant: `${window.location.origin}/merchant/reset-password`,
      scan: `${window.location.origin}/scan/reset-password`,
    };
    return origins[portal] || origins.admin;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${BASE_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          redirect_url: getRedirectUrl(),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || 'Request failed.');

      setSent(true);
    } catch (err) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)' }}>
        <div style={{ background: '#fff', borderRadius: '12px', padding: '40px', width: '100%', maxWidth: '400px', boxShadow: '0 20px 60px rgba(0,0,0,0.3)', textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📧</div>
          <h1 style={{ margin: '0 0 8px', fontSize: '22px', color: '#1a1a2e' }}>Check Your Email</h1>
          <p style={{ color: '#666', fontSize: '14px', lineHeight: '1.6', margin: '0 0 24px' }}>
            If an account exists for <strong>{email}</strong>, a password reset link has been sent.
          </p>
          <button onClick={() => navigate(`/${portal}/login`)} style={{
            width: '100%', padding: '12px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: '#fff', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: 600, cursor: 'pointer',
          }}>Back to Sign In</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)' }}>
      <div style={{ background: '#fff', borderRadius: '12px', padding: '40px', width: '100%', maxWidth: '400px', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ fontSize: '40px', marginBottom: '8px' }}>🔒</div>
          <h1 style={{ margin: '0', fontSize: '22px', color: '#1a1a2e' }}>{portalTitle} — Forgot Password?</h1>
          <p style={{ margin: '8px 0 0', fontSize: '14px', color: '#666' }}>
            Enter your email and we'll send you a reset link.
          </p>
        </div>

        {error && (
          <div style={{ padding: '12px 16px', borderRadius: '8px', background: '#fff0f0', color: '#d32f2f', fontSize: '14px', marginBottom: '16px' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#333', marginBottom: '6px' }}>Email</label>
            <input
              type="email" value={email} required
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              style={inputStyle}
              onFocus={(e) => e.target.style.borderColor = '#667eea'}
              onBlur={(e) => e.target.style.borderColor = '#ddd'}
            />
          </div>

          <button type="submit" disabled={loading} style={{
            width: '100%', padding: '12px',
            background: loading ? '#999' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: '#fff', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: 600,
            cursor: loading ? 'not-allowed' : 'pointer',
          }}>
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <button onClick={() => navigate(`/${portal}/login`)} style={{
            background: 'none', border: 'none', color: '#667eea', fontSize: '14px', cursor: 'pointer',
            textDecoration: 'underline',
          }}>Back to Sign In</button>
        </div>
      </div>
    </div>
  );
}
