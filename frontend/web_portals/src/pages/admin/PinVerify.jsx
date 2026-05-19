import { useState } from 'react';
import Topbar from '../../components/Topbar';
import { useToast } from '../../components/Toast';
import { apiPost } from '../../services/api';

export default function PinVerify() {
  const { toast } = useToast();
  const [pin, setPin] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [redeeming, setRedeeming] = useState(false);
  const [result, setResult] = useState(null); // { valid, coupon, error }
  const [redeemResult, setRedeemResult] = useState(null);

  const handlePinChange = (e) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 6);
    setPin(val);
    setResult(null);
    setRedeemResult(null);
  };

  const handleVerify = async () => {
    if (pin.length !== 6) {
      toast('Please enter a 6-digit PIN', 'error');
      return;
    }
    setVerifying(true);
    setResult(null);
    setRedeemResult(null);
    try {
      const res = await apiPost('/coupons/verify', { pin });
      setResult({ valid: true, coupon: res.coupon });
    } catch (err) {
      setResult({
        valid: false,
        error: {
          code: err.code || 'unknown',
          message: err.message || 'Invalid or expired PIN',
        },
      });
    } finally {
      setVerifying(false);
    }
  };

  const handleRedeem = async () => {
    setRedeeming(true);
    try {
      const res = await apiPost('/coupons/redeem', { pin });
      setRedeemResult(res.redemption);
      toast('Coupon redeemed successfully!', 'success');
    } catch (err) {
      toast(err.message || 'Failed to redeem coupon', 'error');
    } finally {
      setRedeeming(false);
    }
  };

  const handleReset = () => {
    setPin('');
    setResult(null);
    setRedeemResult(null);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && pin.length === 6) {
      handleVerify();
    }
  };

  return (
    <div>
      <Topbar title="PIN Verification" />
      <div className="main-content">
        <div style={{ maxWidth: 480, margin: '40px auto', textAlign: 'center' }}>
          <h2 className="page-title" style={{ marginBottom: 8 }}>
            Verify PIN Code
          </h2>
          <p style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 32 }}>
            Enter a 6-digit coupon PIN to verify and redeem
          </p>

          <div style={{ marginBottom: 24 }}>
            <input
              type="text"
              value={pin}
              onChange={handlePinChange}
              onKeyDown={handleKeyDown}
              placeholder="000000"
              maxLength={6}
              autoFocus
              style={{
                width: 200,
                padding: '16px 20px',
                fontSize: 32,
                fontFamily: 'monospace',
                textAlign: 'center',
                letterSpacing: 8,
                border: '2px solid var(--border)',
                borderRadius: 12,
                outline: 'none',
                background: pin ? 'var(--surface)' : 'var(--accent-subtle)',
                transition: 'border-color 0.15s, background 0.15s',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = 'var(--accent)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'var(--border)';
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 24 }}>
            <button
              className="btn btn-primary"
              onClick={handleVerify}
              disabled={pin.length !== 6 || verifying}
            >
              {verifying ? 'Verifying...' : 'Verify'}
            </button>
            <button
              className="btn btn-secondary"
              onClick={handleReset}
              disabled={!pin && !result}
            >
              Reset
            </button>
          </div>

          {result && result.valid && !redeemResult && (
            <div
              className="card"
              style={{
                textAlign: 'left',
                borderColor: 'var(--success)',
                background: 'var(--success-subtle)',
              }}
            >
              <h3
                style={{
                  fontSize: 16,
                  fontWeight: 600,
                  color: 'var(--success)',
                  marginBottom: 12,
                }}
              >
                PIN Verified Successfully
              </h3>
              <div style={{ fontSize: 14, lineHeight: 1.8 }}>
                <p>
                  <strong>Coupon:</strong> {result.coupon.coupon_type || 'N/A'}
                </p>
                <p>
                  <strong>Value:</strong>{' '}
                  {result.coupon.value_cents != null
                    ? `$${(result.coupon.value_cents / 100).toFixed(2)}`
                    : '--'}
                </p>
                <p>
                  <strong>Points Cost:</strong> {result.coupon.points_cost ?? '--'}
                </p>
                <p>
                  <strong>Valid Until:</strong>{' '}
                  {result.coupon.valid_until
                    ? new Date(result.coupon.valid_until).toLocaleDateString()
                    : '--'}
                </p>
                <p>
                  <strong>Remaining Quantity:</strong>{' '}
                  {result.coupon.quantity_remaining ?? result.coupon.quantity ?? '--'}
                </p>
              </div>
              <button
                className="btn btn-primary"
                onClick={handleRedeem}
                disabled={redeeming}
                style={{ marginTop: 16 }}
              >
                {redeeming ? 'Redeeming...' : 'Redeem Now'}
              </button>
            </div>
          )}

          {result && !result.valid && !redeemResult && (
            <div
              className="card"
              style={{
                textAlign: 'left',
                borderColor: 'var(--danger)',
                background: 'var(--danger-subtle)',
              }}
            >
              <h3
                style={{
                  fontSize: 16,
                  fontWeight: 600,
                  color: 'var(--danger)',
                  marginBottom: 12,
                }}
              >
                Verification Failed
              </h3>
              <div style={{ fontSize: 14, lineHeight: 1.8 }}>
                <p>
                  <strong>Error:</strong> {result.error?.code || 'error'}
                </p>
                <p style={{ color: 'var(--danger)' }}>
                  {result.error?.message || 'The PIN is invalid or has expired.'}
                </p>
              </div>
              <button
                className="btn btn-outline"
                onClick={handleReset}
                style={{ marginTop: 16 }}
              >
                Try Another PIN
              </button>
            </div>
          )}

          {redeemResult && (
            <div
              className="card"
              style={{
                textAlign: 'left',
                borderColor: 'var(--accent)',
                background: 'var(--accent-subtle)',
              }}
            >
              <h3
                style={{
                  fontSize: 16,
                  fontWeight: 600,
                  color: 'var(--accent)',
                  marginBottom: 12,
                }}
              >
                Redemption Confirmed
              </h3>
              <div style={{ fontSize: 14, lineHeight: 1.8 }}>
                <p>
                  <strong>Redemption ID:</strong> {redeemResult.id}
                </p>
                <p>
                  <strong>PIN:</strong>{' '}
                  <span style={{ fontFamily: 'monospace' }}>{redeemResult.pin}</span>
                </p>
                <p>
                  <strong>Coupon:</strong> {redeemResult.coupon_type || 'N/A'}
                </p>
                <p>
                  <strong>Value:</strong>{' '}
                  {redeemResult.value_cents != null
                    ? `$${(redeemResult.value_cents / 100).toFixed(2)}`
                    : '--'}
                </p>
                <p>
                  <strong>Redeemed At:</strong>{' '}
                  {redeemResult.redeemed_at
                    ? new Date(redeemResult.redeemed_at).toLocaleString()
                    : '--'}
                </p>
              </div>
              <button
                className="btn btn-primary"
                onClick={handleReset}
                style={{ marginTop: 16 }}
              >
                Verify Another PIN
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
