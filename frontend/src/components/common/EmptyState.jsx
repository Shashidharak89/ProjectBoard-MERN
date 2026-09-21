import React from 'react';
import { FiFolder } from 'react-icons/fi';
import { Button } from './Button';

export const EmptyState = ({
  icon = <FiFolder />,
  title = 'No records found',
  description = 'There are no items to display at the moment.',
  actionLabel,
  onAction,
}) => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '3rem 1.5rem',
      textAlign: 'center',
      backgroundColor: 'var(--surface-card)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)',
      margin: '1rem 0',
    }}>
      <div style={{ fontSize: '2.5rem', color: 'var(--accent)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center' }}>
        {icon}
      </div>
      <h3 style={{ fontSize: 'var(--font-lg)', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.4rem' }}>{title}</h3>
      <p style={{ fontSize: 'var(--font-sm)', color: 'var(--text-secondary)', maxWidth: '400px', marginBottom: actionLabel ? '1.25rem' : 0 }}>{description}</p>
      {actionLabel && onAction && (
        <Button variant="primary" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
