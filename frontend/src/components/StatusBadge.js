import React from 'react';

const LABELS = {
  present: 'Present',
  late: 'Late',
  'half-day': 'Half day',
  absent: 'Absent',
  'on-leave': 'On leave',
  pending: 'Pending',
  approved: 'Approved',
  rejected: 'Rejected',
  cancelled: 'Cancelled',
};

const StatusBadge = ({ status }) => (
  <span className={`badge badge-${status}`}>{LABELS[status] || status}</span>
);

export default StatusBadge;
