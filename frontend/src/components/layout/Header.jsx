import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Avatar } from '../common/Avatar';
import { BRANDING } from '../../constants/branding';

export const Header = ({ onToggleSidebar }) => {
  const { user } = useAuth();

  return (
    <header className="header">
      <div className="header-left">
        <button
          className="mobile-menu-toggle"
          onClick={onToggleSidebar}
          aria-label="Toggle navigation menu"
        >
          ☰
        </button>
        <div>
          <div className="brand-title">
            <span style={{ color: 'var(--accent)' }}>❖</span> {BRANDING.name}
          </div>
          <div className="brand-tagline">{BRANDING.tagline}</div>
        </div>
      </div>

      <div className="header-right">
        {user && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Avatar name={user.name} size={36} />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)', lineHeight: 1.2 }}>
                {user.name}
              </span>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                {user.email}
              </span>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
