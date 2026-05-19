import Topbar from '../../components/Topbar';

export default function Campaigns() {
  return (
    <div>
      <Topbar title="Campaigns" />
      <div className="main-content">
        <div className="page-header">
          <h2 className="page-title">Campaigns</h2>
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
          <h2>Campaign Management</h2>
          <p style={{ maxWidth: 420, margin: '8px auto' }}>
            Campaign management is coming in Phase 2. This feature will enable you to create
            and manage promotional campaigns to encourage volunteer participation and coupon redemptions.
          </p>
          <div
            className="card"
            style={{
              marginTop: 24,
              maxWidth: 420,
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
              <li>Create time-limited bonus point campaigns</li>
              <li>Set campaign goals and track progress</li>
              <li>Targeted notifications to volunteers</li>
              <li>Campaign performance analytics and ROI</li>
              <li>Automated reward distribution on campaign completion</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
