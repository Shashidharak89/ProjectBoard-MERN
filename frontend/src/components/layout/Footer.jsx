import React from 'react';
import { BRANDING } from '../../constants/branding';

export const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-left">
        <img
          src={BRANDING.logo}
          alt={BRANDING.name}
          style={{ height: '22px', width: 'auto', objectFit: 'contain' }}
        />
        <span>© {new Date().getFullYear()} {BRANDING.name}. All rights reserved.</span>
      </div>

      <div className="footer-right">
        <span>Plan. Assign. Track. Complete.</span>
      </div>
    </footer>
  );
};
