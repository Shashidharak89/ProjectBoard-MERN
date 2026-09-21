import React from 'react';

export const StatusBadge = ({ status = 'in-progress', isOverdue = false }) => {
  if (isOverdue && status !== 'completed') {
    return (
      <span className="badge badge-overdue" title="Task deadline has passed">
        ⚠️ OVERDUE
      </span>
    );
  }

  switch (status) {
    case 'completed':
      return <span className="badge badge-completed">✓ Completed</span>;
    case 'review':
      return <span className="badge badge-review">🔍 Review</span>;
    case 'in-progress':
    default:
      return <span className="badge badge-in-progress">⏳ In Progress</span>;
  }
};
