import React from 'react';
import { Button } from './Button';

export const EmptyState = ({
  icon = '📂',
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
      border: '1px border var(--border)',
      borderRadius: 'var(--radius-lg)',
      margin: '1rem 0',
    }}>
      <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>{icon}</div>
      <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.4rem' }}>{title}</h3>
      <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', maxWidth: '400px', marginBottom: actionLabel ? '1.25rem' : 0 }}>{description}</p>
      {actionLabel && onAction && (
        <Button variant="primary" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
