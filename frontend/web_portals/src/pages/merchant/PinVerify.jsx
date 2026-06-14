import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../components/Toast';
import Modal from '../../components/Modal';
import { apiPost } from '../../services/api';

const CENTS_PER_POINT = 100;

function formatValue(cents) {
  if (cents == null) return '$0.00';
  return `$${(cents / CENTS_PER_POINT).toFixed(2)}`;
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function formatDateTime(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

const ERROR_MAP = {
  invalid_pin: 'PIN not found. Please check and try again.',
  expired: 'This coupon has expired.',
  already_redeemed: 'This coupon has already been redeemed.',
  out_of_stock: 'No more stock available for this coupon.',
  rate_limited: 'Too many attempts. Max 10 verifications per minute.',
};

const KEYPAD_KEYS = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['', '0', 'backspace'],
];

export default function PinVerify() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const pinInputRef = useRef(null);

  // State machine: pin_entry | verifying | verified | redeeming | redeemed | reversing
  const [phase, setPhase] = useState('pin_entry');

  // PIN
  const [pin, setPin] = useState('');
  const MAX_PIN_LENGTH = 6;

  // Verification result
  const [coupon, setCoupon] = useState(null);
  const [verifyError, setVerifyError] = useState(null);
  const [isRateLimited, setIsRateLimited] = useState(false);

  // Redemption result
  const [redemption, setRedemption] = useState(null);
  const [redeemError, setRedeemError] = useState(null);

  // Reverse
  const [showReverseConfirm, setShowReverseConfirm] = useState(false);
  const [reversing, setReversing] = useState(false);

  // Track redemption time for 5-minute undo window
  const [redeemedAt, setRedeemedAt] = useState(null);
  const [undoWindowExpired, setUndoWindowExpired] = useState(false);

  // Focus hidden input when using keypad
  useEffect(() => {
    if (phase === 'pin_entry' && pinInputRef.current) {
      pinInputRef.current.focus();
    }
  }, [phase]);

  // Check undo window expiry
  useEffect(() => {
    if (phase !== 'redeemed' || !redeemedAt) return;
    const check = () => {
      const elapsed = Date.now() - redeemedAt;
      if (elapsed >= 300000) {
        setUndoWindowExpired(true);
      }
    };
    check();
    const interval = setInterval(check, 1000);
    return () => clearInterval(interval);
  }, [phase, redeemedAt]);

  const handleKeypadPress = (key) => {
    if (phase !== 'pin_entry') return;
    if (key === 'backspace') {
      setPin((prev) => prev.slice(0, -1));
    } else if (pin.length < MAX_PIN_LENGTH) {
      setPin((prev) => prev + key);
    }
  };

  const handlePinInputChange = (e) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, MAX_PIN_LENGTH);
    setPin(val);
  };

  const resetAll = () => {
    setPhase('pin_entry');
    setPin('');
    setCoupon(null);
    setVerifyError(null);
    setIsRateLimited(false);
    setRedemption(null);
    setRedeemError(null);
    setRedeemedAt(null);
    setUndoWindowExpired(false);
    setShowReverseConfirm(false);
  };

  const handleVerify = async () => {
    if (pin.length !== MAX_PIN_LENGTH) {
      toast('Please enter a complete 6-digit PIN', 'error');
      return;
    }
    setPhase('verifying');
    setVerifyError(null);
    setIsRateLimited(false);
    try {
      const res = await apiPost('/coupons/verify', { pin });
      setCoupon(res.data || res.coupon);
      setPhase('verified');
    } catch (err) {
      setVerifyError(err);
      if (err.code === 'rate_limited') {
        setIsRateLimited(true);
      }
      setPhase('pin_entry');
    }
  };

  const handleRedeem = async () => {
    setPhase('redeeming');
    setRedeemError(null);
    try {
      const res = await apiPost('/coupons/redeem', { pin, userCouponId: coupon.user_coupon_id || coupon.id,});
      setRedemption(res.data || res.redemption || res);
      setRedemption(res.redemption);
      setRedeemedAt(Date.now());
      setUndoWindowExpired(false);
      setPhase('redeemed');
    } catch (err) {
      setRedeemError(err.message || 'Redemption failed');
      setPhase('verified');
    }
  };

  const handleReverse = async () => {
    setShowReverseConfirm(false);
    setReversing(true);
    try {
      await apiPost('/coupons/reverse', {
        userCouponId: redemption?.user_coupon_id || redemption?.id || coupon?.user_coupon_id || coupon?.id
    });
      toast('Redemption reversed successfully', 'success');
      resetAll();
    } catch (err) {
      toast(err.message || 'Failed to reverse redemption', 'error');
    } finally {
      setReversing(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    navigate('/merchant');
  };

  // --- PIN ENTRY PHASE ---
  const renderPinEntry = () => (
    <>
      <h1 style={styles.heading}>Enter PIN Code</h1>
      <p style={styles.subtitle}>Ask the volunteer for their redemption PIN</p>

      {/* PIN dots display */}
      <div style={styles.pinDisplay}>
        {Array.from({ length: MAX_PIN_LENGTH }).map((_, i) => (
          <div
            key={i}
            style={{
              ...styles.pinDot,
              background: pin[i] ? '#FF9500' : '#F2F2F5',
              borderColor: pin[i] ? '#FF9500' : '#E0E0E5',
            }}
          >
            {pin[i] ? (
              <span style={styles.pinDotChar}>&#9679;</span>
            ) : (
              <span style={styles.pinDotEmpty}>_</span>
            )}
          </div>
        ))}
      </div>

      {/* Hidden input for keyboard typing */}
      <input
        ref={pinInputRef}
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        maxLength={MAX_PIN_LENGTH}
        value={pin}
        onChange={handlePinInputChange}
        style={styles.hiddenInput}
        autoFocus
        disabled={phase !== 'pin_entry'}
      />

      {/* Verify error */}
      {verifyError && (
        <div style={styles.errorPanel}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span>{ERROR_MAP[verifyError.code] || verifyError.message || 'Verification failed'}</span>
        </div>
      )}

      {/* Rate limit notice */}
      {isRateLimited && (
        <div style={styles.rateLimitPanel}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span>Max 10 verifications/minute. Please wait before trying again.</span>
        </div>
      )}

      {/* On-screen keypad */}
      <div style={styles.keypad}>
        {KEYPAD_KEYS.map((row, ri) => (
          <div key={ri} style={styles.keypadRow}>
            {row.map((key) => {
              if (key === '') {
                return <div key={ri + '-' + Math.random()} style={styles.keypadPlaceholder} />;
              }
              if (key === 'backspace') {
                return (
                  <button
                    key="backspace"
                    style={styles.keypadKey}
                    onClick={() => handleKeypadPress('backspace')}
                    disabled={phase !== 'pin_entry'}
                  >
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z" />
                      <line x1="18" y1="9" x2="12" y2="15" /><line x1="12" y1="9" x2="18" y2="15" />
                    </svg>
                  </button>
                );
              }
              return (
                <button
                  key={key}
                  style={styles.keypadKey}
                  onClick={() => handleKeypadPress(key)}
                  disabled={phase !== 'pin_entry'}
                >
                  {key}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Verify button */}
      <button
        style={{
          ...styles.verifyBtn,
          opacity: pin.length !== MAX_PIN_LENGTH ? 0.5 : 1,
          cursor: pin.length !== MAX_PIN_LENGTH ? 'not-allowed' : 'pointer',
        }}
        onClick={handleVerify}
        disabled={pin.length !== MAX_PIN_LENGTH}
      >
        Verify PIN
      </button>

      <div style={styles.footerLinks}>
        <button style={styles.linkBtn} onClick={handleLogout}>Logout</button>
        <button style={styles.linkBtn} onClick={() => navigate('/merchant/history')}>
          View History
        </button>
      </div>
    </>
  );

  // --- VERIFYING PHASE ---
  const renderVerifying = () => (
    <div style={styles.centerState}>
      <div style={styles.spinnerLarge} />
      <p style={styles.loadingText}>Verifying PIN...</p>
    </div>
  );

  // --- VERIFIED PHASE ---
  const renderVerified = () => (
    <>
      <div style={styles.successPanel}>
        <div style={styles.successIconLarge}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <div style={styles.successContent}>
          <p style={styles.successLabel}>Coupon Verified</p>
          <h2 style={styles.couponType}>{coupon.coupon_title || coupon.title || coupon.coupon_type || 'Coupon'}</h2>
          <div style={styles.couponDetails}>
            <div style={styles.couponRow}>
              <span style={styles.couponLabel}>Value</span>
              <span style={styles.couponValue}>{coupon.points_required ? `${coupon.points_required} pts` : formatValue(coupon.value_cents)}</span>
            </div>
            {coupon.points_cost != null && (
              <div style={styles.couponRow}>
                <span style={styles.couponLabel}>Points Cost</span>
                <span style={styles.couponValue}>{coupon.points_cost} pts</span>
              </div>
            )}
            <div style={styles.couponRow}>
              <span style={styles.couponLabel}>Valid Until</span>
              <span style={styles.couponValue}>{formatDate(coupon.valid_until)}</span>
            </div>
            {coupon.quantity_remaining != null && (
              <div style={styles.couponRow}>
                <span style={styles.couponLabel}>Stock Remaining</span>
                <span style={styles.couponValue}>{coupon.quantity_remaining}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {redeemError && (
        <div style={styles.errorPanel}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
          </svg>
          <span>{redeemError}</span>
        </div>
      )}

      <button
        style={styles.redeemBtn}
        onClick={handleRedeem}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
        Redeem Now
      </button>

      <button style={styles.secondaryBtn} onClick={resetAll}>
        Verify Another
      </button>
    </>
  );

  // --- REDEEMING PHASE ---
  const renderRedeeming = () => (
    <div style={styles.centerState}>
      <div style={styles.spinnerLarge} />
      <p style={styles.loadingText}>Processing redemption...</p>
    </div>
  );

  // --- REDEEMED PHASE ---
  const renderRedeemed = () => (
    <>
      <div style={styles.redeemedPanel}>
        <div style={styles.redeemedIcon}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h2 style={styles.redeemedTitle}>Redemption Successful!</h2>
        <p style={styles.redeemedTime}>
          {redemption?.redeemed_at ? formatDateTime(redemption.redeemed_at) : formatDateTime(new Date().toISOString())}
        </p>
        {redemption && (
          <div style={styles.redemptionDetails}>
            <div style={styles.redemptionRow}>
              <span>Coupon</span>
              <span style={{ fontWeight: 600 }}>{redemption.coupon_type}</span>
            </div>
            <div style={styles.redemptionRow}>
              <span>Value</span>
              <span style={{ fontWeight: 600 }}>{formatValue(redemption.value_cents)}</span>
            </div>
            <div style={styles.redemptionRow}>
              <span>PIN</span>
              <span style={{ fontFamily: "ui-monospace, 'SF Mono', monospace", fontWeight: 600 }}>
                {redemption.pin || pin}
              </span>
            </div>
            <div style={styles.redemptionRow}>
              <span>Status</span>
              <span className="status-badge approved">Redeemed</span>
            </div>
          </div>
        )}
      </div>

      {/* Undo button - available within 5 minutes */}
      {!undoWindowExpired && (
        <div style={styles.undoSection}>
          <p style={styles.undoHint}>Made a mistake? You can undo this redemption within 5 minutes.</p>
          <button
            style={styles.undoBtn}
            onClick={() => setShowReverseConfirm(true)}
            disabled={reversing}
          >
            {reversing ? 'Reversing...' : 'Undo Redemption'}
          </button>
        </div>
      )}

      <button style={styles.verifyAnotherBtn} onClick={resetAll}>
        Verify Another
      </button>

      {/* Reverse confirmation modal */}
      <Modal
        isOpen={showReverseConfirm}
        onClose={() => setShowReverseConfirm(false)}
        title="Confirm Undo"
        actions={[
          {
            label: 'Cancel',
            variant: 'secondary',
            onClick: () => setShowReverseConfirm(false),
          },
          {
            label: 'Yes, Undo Redemption',
            variant: 'danger',
            onClick: handleReverse,
          },
        ]}
      >
        <p>Are you sure you want to reverse this redemption? This action cannot be undone.</p>
        {redemption && (
          <div style={{ marginTop: 12, padding: 12, background: '#F5F5F7', borderRadius: 8, fontSize: 13 }}>
            <p style={{ margin: '0 0 4px' }}><strong>Coupon:</strong> {redemption.coupon_type}</p>
            <p style={{ margin: 0 }}><strong>Value:</strong> {formatValue(redemption.value_cents)}</p>
          </div>
        )}
      </Modal>
    </>
  );

  // --- REVERSING PHASE ---
  const renderReversing = () => (
    <div style={styles.centerState}>
      <div style={styles.spinnerLarge} />
      <p style={styles.loadingText}>Reversing redemption...</p>
    </div>
  );

  return (
    <div style={styles.wrapper}>
      <div style={styles.container}>
        {phase === 'pin_entry' && renderPinEntry()}
        {phase === 'verifying' && renderVerifying()}
        {phase === 'verified' && renderVerified()}
        {phase === 'redeeming' && renderRedeeming()}
        {phase === 'redeemed' && renderRedeemed()}
        {phase === 'reversing' && renderReversing()}
      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    padding: 24,
    minHeight: '100vh',
    background: '#F5F5F7',
  },
  container: {
    maxWidth: 440,
    margin: '0 auto',
  },
  heading: {
    fontSize: 24,
    fontWeight: 700,
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'SF Pro Display', system-ui, sans-serif",
    color: '#1C1C1E',
    textAlign: 'center',
    margin: '0 0 8px',
  },
  subtitle: {
    fontSize: 14,
    color: '#6C6C70',
    textAlign: 'center',
    margin: '0 0 32px',
  },
  hiddenInput: {
    position: 'absolute',
    opacity: 0,
    pointerEvents: 'none',
    width: 0,
    height: 0,
  },
  pinDisplay: {
    display: 'flex',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 24,
  },
  pinDot: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 48,
    height: 56,
    borderRadius: 12,
    border: '2px solid #E0E0E5',
    fontSize: 24,
    transition: 'background 0.15s, border-color 0.15s',
  },
  pinDotChar: {
    color: '#FFFFFF',
    fontSize: 28,
    lineHeight: 1,
  },
  pinDotEmpty: {
    color: '#C7C7CC',
    fontSize: 22,
    lineHeight: 1,
    fontWeight: 300,
  },
  keypad: {
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    marginBottom: 20,
  },
  keypadRow: {
    display: 'flex',
    gap: 10,
    justifyContent: 'center',
  },
  keypadKey: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 72,
    height: 56,
    borderRadius: 12,
    fontSize: 22,
    fontWeight: 600,
    background: '#FFFFFF',
    border: '1px solid #E0E0E5',
    color: '#1C1C1E',
    cursor: 'pointer',
    transition: 'background 0.1s',
    minHeight: 44,
  },
  keypadPlaceholder: {
    width: 72,
    height: 56,
  },
  verifyBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    minHeight: 52,
    padding: '14px 24px',
    borderRadius: 12,
    fontSize: 17,
    fontWeight: 600,
    background: '#FF9500',
    color: '#FFFFFF',
    border: 'none',
    marginBottom: 16,
    transition: 'background 0.15s',
  },
  footerLinks: {
    display: 'flex',
    justifyContent: 'center',
    gap: 20,
  },
  linkBtn: {
    padding: '8px 16px',
    fontSize: 14,
    fontWeight: 500,
    color: '#FF9500',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    minHeight: 44,
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
    marginBottom: 16,
  },
  rateLimitPanel: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '12px 16px',
    background: '#FFF3E0',
    color: '#FF9500',
    borderRadius: 10,
    fontSize: 13,
    fontWeight: 500,
    marginBottom: 16,
  },
  centerState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '60px 0',
    gap: 16,
  },
  spinnerLarge: {
    width: 36,
    height: 36,
    border: '3px solid #E0E0E5',
    borderTopColor: '#FF9500',
    borderRadius: '50%',
    animation: 'spin 0.6s linear infinite',
  },
  loadingText: {
    fontSize: 15,
    color: '#6C6C70',
    margin: 0,
  },
  successPanel: {
    background: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    border: '2px solid #34C759',
    marginBottom: 20,
  },
  successIconLarge: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 52,
    height: 52,
    borderRadius: '50%',
    background: '#34C759',
    margin: '0 auto 16px',
  },
  successContent: {
    textAlign: 'center',
  },
  successLabel: {
    fontSize: 12,
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
    color: '#34C759',
    margin: '0 0 4px',
  },
  couponType: {
    fontSize: 20,
    fontWeight: 700,
    color: '#1C1C1E',
    margin: '0 0 16px',
  },
  couponDetails: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  couponRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '6px 0',
    borderBottom: '1px solid #F2F2F5',
  },
  couponLabel: {
    fontSize: 13,
    color: '#6C6C70',
  },
  couponValue: {
    fontSize: 14,
    fontWeight: 600,
    color: '#1C1C1E',
  },
  redeemBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    width: '100%',
    minHeight: 52,
    padding: '14px 24px',
    borderRadius: 12,
    fontSize: 17,
    fontWeight: 600,
    background: '#34C759',
    color: '#FFFFFF',
    border: 'none',
    marginBottom: 12,
    cursor: 'pointer',
    transition: 'background 0.15s',
  },
  secondaryBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    minHeight: 48,
    padding: '12px 24px',
    borderRadius: 12,
    fontSize: 15,
    fontWeight: 500,
    background: '#F2F2F5',
    color: '#1C1C1E',
    border: 'none',
    cursor: 'pointer',
    transition: 'background 0.15s',
  },
  redeemedPanel: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    background: '#FFFFFF',
    borderRadius: 16,
    padding: 32,
    border: '2px solid #34C759',
    marginBottom: 20,
    textAlign: 'center',
  },
  redeemedIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 64,
    height: 64,
    borderRadius: '50%',
    background: '#34C759',
    marginBottom: 16,
  },
  redeemedTitle: {
    fontSize: 22,
    fontWeight: 700,
    color: '#1C1C1E',
    margin: '0 0 4px',
  },
  redeemedTime: {
    fontSize: 13,
    color: '#6C6C70',
    margin: '0 0 20px',
  },
  redemptionDetails: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    padding: '12px 0',
    borderTop: '1px solid #F2F2F5',
  },
  redemptionRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: 14,
    color: '#1C1C1E',
    padding: '4px 0',
  },
  undoSection: {
    textAlign: 'center',
    marginBottom: 16,
    padding: 16,
    background: '#FFF3E0',
    borderRadius: 12,
    border: '1px solid #FFB347',
  },
  undoHint: {
    fontSize: 13,
    color: '#6C6C70',
    margin: '0 0 12px',
  },
  undoBtn: {
    padding: '10px 24px',
    borderRadius: 10,
    fontSize: 14,
    fontWeight: 600,
    background: '#FF9500',
    color: '#FFFFFF',
    border: 'none',
    cursor: 'pointer',
    minHeight: 44,
    transition: 'background 0.15s',
  },
  verifyAnotherBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    minHeight: 48,
    padding: '12px 24px',
    borderRadius: 12,
    fontSize: 15,
    fontWeight: 500,
    background: '#F2F2F5',
    color: '#1C1C1E',
    border: 'none',
    cursor: 'pointer',
    transition: 'background 0.15s',
  },
};
