import React from 'react';
import { FiAlertCircle, FiRefreshCw } from 'react-icons/fi';
import { Button } from './Button';

export const ErrorState = ({
  title = 'Something went wrong',
  message = 'An unexpected error occurred while loading data.',
  onRetry,
}) => {
  return (
    <div style={{
      padding: '2rem 1.5rem',
      backgroundColor: 'var(--danger-bg)',
      border: '1px solid var(--overdue-border)',
      borderRadius: 'var(--radius-lg)',
      textAlign: 'center',
      margin: '1.5rem 0',
    }}>
      <div style={{ fontSize: '2.2rem', color: 'var(--danger)', marginBottom: '0.5rem', display: 'flex', justifyContent: 'center' }}>
        <FiAlertCircle />
      </div>
      <h4 style={{ color: 'var(--danger)', fontWeight: 700, marginBottom: '0.4rem', fontSize: 'var(--font-lg)' }}>{title}</h4>
      <p style={{ fontSize: 'var(--font-sm)', color: 'var(--text-secondary)', marginBottom: onRetry ? '1rem' : 0 }}>{message}</p>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry} style={{ gap: '0.4rem' }}>
          <FiRefreshCw />
          <span>Try Again</span>
        </Button>
      )}
    </div>
  );
};
