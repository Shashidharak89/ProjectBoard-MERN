import React from 'react';
import { FiClock, FiSearch, FiCheckCircle, FiAlertTriangle } from 'react-icons/fi';

export const StatusBadge = ({ status = 'in-progress', isOverdue = false }) => {
  if (isOverdue && status !== 'completed') {
    return (
      <span className="badge badge-overdue" title="Task deadline has passed">
        <FiAlertTriangle style={{ fontSize: '0.85rem' }} /> OVERDUE
      </span>
    );
  }

  switch (status) {
    case 'completed':
      return (
        <span className="badge badge-completed">
          <FiCheckCircle style={{ fontSize: '0.85rem' }} /> Completed
        </span>
      );
    case 'review':
      return (
        <span className="badge badge-review">
          <FiSearch style={{ fontSize: '0.85rem' }} /> Review
        </span>
      );
    case 'in-progress':
    default:
      return (
        <span className="badge badge-in-progress">
          <FiClock style={{ fontSize: '0.85rem' }} /> In Progress
        </span>
      );
  }
};
