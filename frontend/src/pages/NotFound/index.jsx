import React from 'react';
import { Link } from 'react-router-dom';
import { FiCompass } from 'react-icons/fi';
import { Button } from '../../components/common/Button';
import { PageHeader } from '../../components/common/PageHeader';

export default function NotFound() {
  return (
    <div className="animate-page-entrance" style={{ maxWidth: '600px', margin: '2rem auto' }}>
      <PageHeader
        title="404 - Page Not Found"
        subtitle="The page you are looking for doesn't exist or has been moved."
      />

      <div
        className="card"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          padding: '3rem 2rem',
        }}
      >
        <div style={{ fontSize: '3.5rem', color: 'var(--rose-deep)', marginBottom: '1.25rem', display: 'flex' }}>
          <FiCompass />
        </div>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '440px', fontSize: 'var(--font-base)', marginBottom: '2rem' }}>
          Please verify the URL or return to the main dashboard workspace.
        </p>
        <Link to="/dashboard">
          <Button variant="primary">Return to Dashboard</Button>
        </Link>
      </div>
    </div>
  );
}
