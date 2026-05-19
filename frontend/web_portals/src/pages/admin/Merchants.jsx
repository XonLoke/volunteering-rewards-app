import Topbar from '../../components/Topbar';

export default function Merchants() {
  return (
    <div>
      <Topbar title="Merchants" />
      <div className="main-content">
        <div className="page-header">
          <h2 className="page-title">Merchants</h2>
        </div>

        <div className="empty-state" style={{ padding: '60px 40px' }}>
          <div
            style={{
              fontSize: 48,
              marginBottom: 16,
              opacity: 0.3,
            }}
          >
            &#9733;
          </div>
          <h2>Merchant Management</h2>
          <p style={{ maxWidth: 400, margin: '8px auto' }}>
            Merchant management is coming in Phase 2. This feature will allow you to manage
            partner merchants who accept coupon redemptions.
          </p>
          <div
            className="card"
            style={{
              marginTop: 24,
              maxWidth: 400,
              margin: '24px auto 0',
              textAlign: 'left',
            }}
          >
            <div className="card-header">
              <h3 className="card-title">Planned Features</h3>
            </div>
            <ul
              style={{
                fontSize: 13,
                lineHeight: 2,
                paddingLeft: 20,
                margin: 0,
                color: 'var(--muted)',
              }}
            >
              <li>Merchant registration and onboarding</li>
              <li>Coupon acceptance configuration</li>
              <li>Redemption validation at point of sale</li>
              <li>Settlement and reconciliation reports</li>
              <li>Merchant performance analytics</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
