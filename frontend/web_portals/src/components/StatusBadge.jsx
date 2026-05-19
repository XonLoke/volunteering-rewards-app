const STATUS_CLASSES = {
  approved: 'approved',
  pending: 'pending',
  rejected: 'rejected',
  active: 'active',
  used: 'used',
  expired: 'expired',
  disabled: 'disabled',
};

const STATUS_LABELS = {
  approved: 'Approved',
  pending: 'Pending',
  rejected: 'Rejected',
  active: 'Active',
  used: 'Used',
  expired: 'Expired',
  disabled: 'Disabled',
};

export default function StatusBadge({ status, className = '' }) {
  const statusClass = STATUS_CLASSES[status] || 'pending';
  const label = STATUS_LABELS[status] || status;

  return (
    <span className={`status-badge ${statusClass} ${className}`}>
      {label}
    </span>
  );
}
