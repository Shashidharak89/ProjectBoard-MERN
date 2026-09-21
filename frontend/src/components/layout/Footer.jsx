import React from 'react';
import { Link } from 'react-router-dom';
import { BRANDING } from '../../constants/branding';

export const Footer = () => {
  return (
    <footer className="footer">
      <Link to="/dashboard" className="footer-left" style={{ textDecoration: 'none', color: 'inherit' }}>
        <img
          src={BRANDING.logo}
          alt={BRANDING.name}
          style={{ height: '22px', width: 'auto', objectFit: 'contain' }}
        />
        <span>© {new Date().getFullYear()} {BRANDING.name}. All rights reserved.</span>
      </Link>

      <div className="footer-right">
        <span>Plan. Assign. Track. Complete.</span>
      </div>
    </footer>
  );
};
