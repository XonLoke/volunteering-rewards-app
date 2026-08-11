import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiGet, apiPost } from '../../services/api';
import { useToast } from '../../components/Toast';

const STORAGE_KEY = 'scan_failed_scans';

function loadOfflineScans() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveOfflineScans(scans) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(scans));
}

function formatTimeDisplay() {
  const now = new Date();
  return now.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

function formatTime(t) {
  if (!t) return '';
  const d = new Date(t);
  return d.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

const ERROR_MAP = {
  not_registered: 'Volunteer is not registered for this event.',
  already_checked_in: 'Volunteer has already been checked in.',
  event_not_today: 'This event is not scheduled for today.',
  not_found: 'Volunteer not found. Please check the ID.',
  // Backend codes (thrown without messages — see attendance.service.js)
  already_scanned: 'Volunteer has already been checked in.',
  event_not_found: 'Event not found. Please check the event.',
  user_not_found: 'Volunteer not found. Please check the ID.',
  volunteer_not_found: 'Volunteer not found. Please check the ID.',
};

// QR code prefix expected from the volunteer app
const QR_PREFIX = 'VR_VOLUNTEER:';

export default function Scanner() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const autoClearRef = useRef(null);

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [volunteerId, setVolunteerId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [scanError, setScanError] = useState(null);

  const [offlineScans, setOfflineScans] = useState([]);
  const [syncing, setSyncing] = useState(false);

  // Camera / QR scanner state
  const videoRef = useRef(null);
  const scannerRef = useRef(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [manualMode, setManualMode] = useState(false);

  // Load offline scans on mount
  useEffect(() => {
    setOfflineScans(loadOfflineScans());
  }, []);

  // Auto-clear result after 5 seconds
  useEffect(() => {
    if (scanResult || scanError) {
      if (autoClearRef.current) clearTimeout(autoClearRef.current);
      autoClearRef.current = setTimeout(() => {
        setScanResult(null);
        setScanError(null);
      }, 5000);
    }
    return () => {
      if (autoClearRef.current) clearTimeout(autoClearRef.current);
    };
  }, [scanResult, scanError]);

  // Fetch event details
  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await apiGet('/events/today');
        const found = (res.data || []).find((e) => String(e.id) === String(eventId));
        if (found) {
          setEvent(found);
        } else {
          setError('Event not found in today\'s schedule.');
        }
      } catch (err) {
        setError(err.message || 'Failed to load event');
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [eventId]);

  // Initialize QR scanner on mount
  useEffect(() => {
    let html5QrCode = null;

    const startCamera = async () => {
      try {
        // Dynamically import html5-qrcode to avoid issues if not available
        const { Html5Qrcode } = await import('html5-qrcode');
        html5QrCode = new Html5Qrcode('qr-reader');

        await html5QrCode.start(
          { facingMode: 'environment' },
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
          },
          async (decodedText) => {
            // QR code detected — process it
            if (submitting) return;

            // Parse QR value — expected format: VR_VOLUNTEER:<volunteer_qr_code>
            let extractedId = decodedText;
            if (decodedText.startsWith(QR_PREFIX)) {
              extractedId = decodedText.substring(QR_PREFIX.length);
            }

            // Use the extracted ID to scan
            setVolunteerId(extractedId);
            await performScan(extractedId);

            // Brief pause to avoid double-scan
            if (html5QrCode) {
              try { await html5QrCode.pause(); } catch {}
              setTimeout(() => {
                if (html5QrCode) {
                  try { html5QrCode.resume(); } catch {}
                }
              }, 2000);
            }
          },
          (errorMessage) => {
            // QR scan error (no code visible) — ignore, this fires continuously
          }
        );

        setCameraActive(true);
        setCameraError(null);
      } catch (err) {
        console.warn('Camera QR scanner not available:', err.message);
        setCameraError('Camera not available. Use manual entry instead.');
        setManualMode(true);
      }
    };

    startCamera();

    return () => {
      if (html5QrCode) {
        try { html5QrCode.stop(); } catch {}
        try { html5QrCode.clear(); } catch {}
      }
    };
  }, [eventId]);

  const performScan = async (volunteerIdValue) => {
    if (!volunteerIdValue || volunteerIdValue.trim() === '') return;
    if (submitting) return;

    setSubmitting(true);
    setScanResult(null);
    setScanError(null);

    try {
      const res = await apiPost('/attendance/scan', {
        volunteer_id: volunteerIdValue.trim(),
        event_id: Number(eventId),
        scanned_at: new Date().toISOString(),
      });
      setScanResult({
        volunteerName: res.volunteer?.name || res.attendance?.volunteer_name || 'Volunteer',
        pointsAwarded: res.data?.points_awarded ?? res.attendance?.points_awarded ?? 0,
        newBalance: res.volunteer?.points_balance ?? 0,
        action: 'Checked In',
        time: formatTimeDisplay(),
      });
      setVolunteerId('');
    } catch (err) {
      handleScanError(err, volunteerIdValue);
    } finally {
      setSubmitting(false);
    }
  };

  const handleScan = useCallback(
    async (actionType) => {
      if (!volunteerId.trim()) {
        toast('Please enter a Volunteer ID', 'error');
        return;
      }
      if (submitting) return;

      setSubmitting(true);
      setScanResult(null);
      setScanError(null);

      try {
        const res = await apiPost('/attendance/scan', {
          volunteer_id: volunteerId.trim(),
          event_id: Number(eventId),
          scanned_at: new Date().toISOString(),
        });
        setScanResult({
          volunteerName: res.volunteer?.name || res.attendance?.volunteer_name || 'Volunteer',
          pointsAwarded: res.data?.points_awarded ?? res.attendance?.points_awarded ?? 0,
          newBalance: res.volunteer?.points_balance ?? 0,
          action: actionType === 'checkin' ? 'Checked In' : 'Points Awarded',
          time: formatTimeDisplay(),
        });
        setVolunteerId('');
      } catch (err) {
        handleScanError(err, volunteerId);
      } finally {
        setSubmitting(false);
      }
    },
    [volunteerId, eventId, submitting, offlineScans, toast]
  );

  const handleScanError = (err, volId) => {
    if (err.status === 409) {
      const friendly = ERROR_MAP[err.code] || err.message;
      setScanError({ message: friendly, code: err.code });
    } else if (err.status === 400 || err.status === 404) {
      const friendly = ERROR_MAP[err.code] || err.message;
      setScanError({ message: friendly, code: err.code });
      // Store failed scan offline for batch sync
      const failed = {
        volunteer_id: volId,
        event_id: Number(eventId),
        attempted_at: new Date().toISOString(),
        error: err.code,
      };
      const updated = [...offlineScans, failed];
      setOfflineScans(updated);
      saveOfflineScans(updated);
    } else {
      setScanError({ message: err.message || 'Scan failed', code: 'unknown' });
      const failed = {
        volunteer_id: volId,
        event_id: Number(eventId),
        attempted_at: new Date().toISOString(),
        error: 'network_error',
      };
      const updated = [...offlineScans, failed];
      setOfflineScans(updated);
      saveOfflineScans(updated);
    }
  };

  const handleSync = useCallback(async () => {
    if (offlineScans.length === 0 || syncing) return;
    setSyncing(true);
    try {
      const payload = {
        scans: offlineScans.map((s) => ({
          volunteer_id: s.volunteer_id,
          event_id: s.event_id,
          scanned_at: s.attempted_at,
        })),
      };
      const res = await apiPost('/attendance/batch', payload);
      const succeeded = res.success_count || 0;
      const skipped = res.skipped_count || 0;
      setOfflineScans([]);
      saveOfflineScans([]);
      toast(`Synced: ${succeeded} succeeded, ${skipped} skipped`, 'success');
    } catch (err) {
      toast(err.message || 'Sync failed', 'error');
    } finally {
      setSyncing(false);
    }
  }, [offlineScans, syncing, toast]);

  if (loading) {
    return (
      <div className="scanner-wrapper" style={styles.wrapper}>
        <div className="loading-state" style={{ minHeight: 300 }}>
          <div style={styles.spinnerLarge} />
          <p>Loading event...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="scanner-wrapper" style={styles.wrapper}>
        <div className="error-state" style={{ minHeight: 300 }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#FF3B30" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <h2>Error</h2>
          <p>{error}</p>
          <button
            style={styles.backBtn}
            onClick={() => navigate('/scan/events')}
          >
            Back to Events
          </button>
        </div>
      </div>
    );
  }

  if (event?.has_ended) {
    return (
      <div className="scanner-wrapper" style={styles.wrapper}>
        <div style={styles.container}>
          <div style={styles.endedPanel}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#8E8E93" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
            </svg>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: '#1C1C1E', margin: '12px 0 4px' }}>Event has ended</h2>
            <p style={{ fontSize: 14, color: '#6C6C70', margin: '0 0 24px' }}>
              {event.title} ended at {event.end_time ? formatTime(event.end_time) : ''}. Scanning is no longer available.
            </p>
            <button
              style={styles.backBtn}
              onClick={() => navigate('/scan/events')}
            >
              Back to Events
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="scanner-wrapper" style={styles.wrapper}>
      <div style={styles.container}>
        {/* Header */}
        <div style={styles.header}>
          <button style={styles.backIcon} onClick={() => navigate('/scan/events')}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <div style={styles.headerInfo}>
            <h1 style={styles.heading}>Scanner</h1>
            <p style={styles.eventName}>{event?.title || 'Event'}</p>
          </div>
        </div>

        {/* QR Scanner or Manual Entry toggle */}
        <div style={styles.modeToggle}>
          <button
            style={{
              ...styles.modeTab,
              background: manualMode ? '#F2F2F5' : '#FF9500',
              color: manualMode ? '#1C1C1E' : '#FFFFFF',
            }}
            onClick={() => setManualMode(false)}
            disabled={!manualMode}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
              <circle cx="12" cy="13" r="4" />
            </svg>
            Camera Scan
          </button>
          <button
            style={{
              ...styles.modeTab,
              background: manualMode ? '#FF9500' : '#F2F2F5',
              color: manualMode ? '#FFFFFF' : '#1C1C1E',
            }}
            onClick={() => setManualMode(true)}
            disabled={manualMode}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            Manual Entry
          </button>
        </div>

        {/* Camera QR Scanner */}
        {!manualMode && (
          <div className="scanner-viewfinder" style={styles.viewfinder}>
            <div id="qr-reader" style={styles.qrReader} />
            {cameraError && (
              <div style={styles.cameraNotice}>
                <p style={styles.cameraNoticeText}>{cameraError}</p>
                <button
                  style={styles.manualSwitchBtn}
                  onClick={() => setManualMode(true)}
                >
                  Switch to Manual Entry
                </button>
              </div>
            )}
            {cameraActive && (
              <p style={styles.cameraHint}>Point camera at volunteer's QR code</p>
            )}
          </div>
        )}

        {/* Manual entry */}
        <div style={styles.manualSection}>
          <label style={styles.inputLabel}>Volunteer ID</label>
          <input
            type="text"
            style={styles.input}
            placeholder="Enter volunteer ID or name"
            value={volunteerId}
            onChange={(e) => setVolunteerId(e.target.value)}
            disabled={submitting}
            autoFocus
          />
        </div>

        {/* Action buttons */}
        <div className="scanner-action-row" style={styles.actionRow}>
          <button
            style={{
              ...styles.checkinBtn,
              opacity: submitting ? 0.6 : 1,
              cursor: submitting ? 'not-allowed' : 'pointer',
            }}
            onClick={() => handleScan('checkin')}
            disabled={submitting}
          >
            {submitting ? (
              <span style={styles.btnLoading}>
                <span style={styles.btnSpinner} />
                Processing...
              </span>
            ) : (
              <>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Check In
              </>
            )}
          </button>
          <button
            style={{
              ...styles.awardBtn,
              opacity: submitting ? 0.6 : 1,
              cursor: submitting ? 'not-allowed' : 'pointer',
            }}
            onClick={() => handleScan('award')}
            disabled={submitting}
          >
            {submitting ? (
              <span style={styles.btnLoading}>
                <span style={styles.btnSpinner} />
                Processing...
              </span>
            ) : (
              <>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="8" r="7" />
                  <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
                </svg>
                Award Points
              </>
            )}
          </button>
        </div>

        {/* Scan result */}
        {scanResult && (
          <div style={styles.successPanel}>
            <div style={styles.successIcon}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <div style={styles.successContent}>
              <p style={styles.successAction}>{scanResult.action}</p>
              <h3 style={styles.successName}>{scanResult.volunteerName}</h3>
              <p style={styles.successPoints}>
                +{scanResult.pointsAwarded} points &middot; Balance: {scanResult.newBalance}
              </p>
              <p style={styles.successTime}>{scanResult.time}</p>
            </div>
          </div>
        )}

        {/* Scan error */}
        {scanError && (
          <div style={styles.errorPanel}>
            <div style={styles.errorIcon}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
              </svg>
            </div>
            <div style={styles.errorContent}>
              <p style={styles.errorTitle}>Scan Failed</p>
              <p style={styles.errorMsg}>{scanError.message}</p>
              {scanError.code && (
                <p style={styles.errorCode}>Code: {scanError.code}</p>
              )}
            </div>
          </div>
        )}

        {/* Batch sync */}
        {offlineScans.length > 0 && (
          <div style={styles.offlineBar}>
            <div style={styles.offlineInfo}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FF9500" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="2" x2="12" y2="6" /><line x1="12" y1="18" x2="12" y2="22" />
                <line x1="4.93" y1="4.93" x2="7.76" y2="7.76" /><line x1="16.24" y1="16.24" x2="19.07" y2="19.07" />
                <line x1="2" y1="12" x2="6" y2="12" /><line x1="18" y1="12" x2="22" y2="12" />
                <line x1="4.93" y1="19.07" x2="7.76" y2="16.24" /><line x1="16.24" y1="7.76" x2="19.07" y2="4.93" />
              </svg>
              <span>{offlineScans.length} failed scan{offlineScans.length > 1 ? 's' : ''} stored offline</span>
            </div>
            <button
              style={{
                ...styles.syncBtn,
                opacity: syncing ? 0.6 : 1,
                cursor: syncing ? 'not-allowed' : 'pointer',
              }}
              onClick={handleSync}
              disabled={syncing}
            >
              {syncing ? 'Syncing...' : `Sync (${offlineScans.length})`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    padding: 16,
    minHeight: '100vh',
    background: '#F5F5F7',
  },
  container: {
    maxWidth: 520,
    margin: '0 auto',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    marginBottom: 24,
  },
  backIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    height: 40,
    borderRadius: 10,
    background: '#FFFFFF',
    border: '1px solid #E0E0E5',
    cursor: 'pointer',
    flexShrink: 0,
  },
  headerInfo: {
    flex: 1,
  },
  heading: {
    fontSize: 22,
    fontWeight: 700,
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'SF Pro Display', system-ui, sans-serif",
    color: '#1C1C1E',
    margin: 0,
  },
  eventName: {
    fontSize: 14,
    color: '#6C6C70',
    margin: '2px 0 0',
  },
  viewfinder: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: '48px 24px',
    background: '#FFFFFF',
    borderRadius: 14,
    border: '2px dashed #C7C7CC',
    marginBottom: 20,
  },
  viewfinderText: {
    fontSize: 15,
    fontWeight: 600,
    color: '#6C6C70',
    margin: 0,
  },
  viewfinderHint: {
    fontSize: 12,
    color: '#AEAEB2',
    margin: 0,
  },
  manualSection: {
    marginBottom: 20,
  },
  inputLabel: {
    display: 'block',
    fontSize: 13,
    fontWeight: 500,
    color: '#1C1C1E',
    marginBottom: 6,
  },
  input: {
    width: '100%',
    minHeight: 48,
    padding: '12px 16px',
    border: '1px solid #E0E0E5',
    borderRadius: 10,
    fontSize: 16,
    background: '#FFFFFF',
    outline: 'none',
    boxSizing: 'border-box',
  },
  actionRow: {
    display: 'flex',
    gap: 12,
    marginBottom: 20,
  },
  checkinBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    flex: 1,
    minHeight: 52,
    padding: '14px 20px',
    borderRadius: 12,
    fontSize: 16,
    fontWeight: 600,
    background: '#34C759',
    color: '#FFFFFF',
    border: 'none',
    transition: 'background 0.15s',
  },
  awardBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    flex: 1,
    minHeight: 52,
    padding: '14px 20px',
    borderRadius: 12,
    fontSize: 16,
    fontWeight: 600,
    background: '#FF9500',
    color: '#FFFFFF',
    border: 'none',
    transition: 'background 0.15s',
  },
  btnLoading: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  btnSpinner: {
    display: 'inline-block',
    width: 16,
    height: 16,
    border: '2px solid rgba(255,255,255,0.3)',
    borderTopColor: '#FFFFFF',
    borderRadius: '50%',
    animation: 'spin 0.6s linear infinite',
  },
  successPanel: {
    display: 'flex',
    gap: 16,
    padding: 20,
    background: '#E8F8E8',
    borderRadius: 14,
    border: '1px solid #34C759',
    marginBottom: 20,
  },
  successIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 44,
    height: 44,
    borderRadius: '50%',
    background: '#34C759',
    flexShrink: 0,
  },
  successContent: {
    flex: 1,
  },
  successAction: {
    fontSize: 11,
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
    color: '#34C759',
    margin: '0 0 4px',
  },
  successName: {
    fontSize: 17,
    fontWeight: 600,
    color: '#1C1C1E',
    margin: '0 0 4px',
  },
  successPoints: {
    fontSize: 14,
    color: '#1C1C1E',
    margin: '0 0 2px',
  },
  successTime: {
    fontSize: 12,
    color: '#6C6C70',
    margin: 0,
  },
  errorPanel: {
    display: 'flex',
    gap: 16,
    padding: 20,
    background: '#FFEBEE',
    borderRadius: 14,
    border: '1px solid #FF3B30',
    marginBottom: 20,
  },
  errorIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 44,
    height: 44,
    borderRadius: '50%',
    background: '#FF3B30',
    flexShrink: 0,
  },
  errorContent: {
    flex: 1,
  },
  errorTitle: {
    fontSize: 15,
    fontWeight: 600,
    color: '#1C1C1E',
    margin: '0 0 4px',
  },
  errorMsg: {
    fontSize: 13,
    color: '#1C1C1E',
    margin: '0 0 2px',
  },
  errorCode: {
    fontSize: 11,
    color: '#6C6C70',
    fontFamily:
      "ui-monospace, 'SF Mono', monospace",
    margin: 0,
  },
  offlineBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    padding: '12px 16px',
    background: '#FFF3E0',
    borderRadius: 10,
    border: '1px solid #FFB347',
  },
  offlineInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    fontSize: 13,
    fontWeight: 500,
    color: '#1C1C1E',
  },
  syncBtn: {
    padding: '8px 16px',
    borderRadius: 8,
    fontSize: 13,
    fontWeight: 600,
    background: '#FF9500',
    color: '#FFFFFF',
    border: 'none',
    whiteSpace: 'nowrap',
    minHeight: 36,
  },
  spinnerLarge: {
    width: 32,
    height: 32,
    border: '3px solid #E0E0E5',
    borderTopColor: '#34C759',
    borderRadius: '50%',
    animation: 'spin 0.6s linear infinite',
  },
  backBtn: {
    padding: '10px 24px',
    borderRadius: 10,
    fontSize: 14,
    fontWeight: 600,
    background: '#34C759',
    color: '#FFFFFF',
    border: 'none',
    cursor: 'pointer',
    minHeight: 44,
    marginTop: 8,
  },
  //-------------------------------------------------------------------------
  // QR Scanner specific styles
  //-------------------------------------------------------------------------
  modeToggle: {
    display: 'flex',
    gap: 8,
    marginBottom: 16,
  },
  modeTab: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    flex: 1,
    minHeight: 42,
    padding: '10px 16px',
    borderRadius: 10,
    fontSize: 14,
    fontWeight: 600,
    border: 'none',
    cursor: 'pointer',
    transition: 'background 0.15s',
  },
  qrReader: {
    width: '100%',
    maxWidth: 400,
    margin: '0 auto',
    borderRadius: 12,
    overflow: 'hidden',
  },
  cameraNotice: {
    textAlign: 'center',
    padding: 12,
  },
  cameraNoticeText: {
    fontSize: 13,
    color: '#6C6C70',
    margin: '0 0 8px',
  },
  manualSwitchBtn: {
    padding: '8px 16px',
    borderRadius: 8,
    fontSize: 13,
    fontWeight: 600,
    background: '#FF9500',
    color: '#FFFFFF',
    border: 'none',
    cursor: 'pointer',
    minHeight: 36,
  },
  cameraHint: {
    fontSize: 12,
    color: '#6C6C70',
    textAlign: 'center',
    margin: '8px 0 0',
  },
  endedPanel: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    minHeight: 300,
    padding: '48px 24px',
  },
};
