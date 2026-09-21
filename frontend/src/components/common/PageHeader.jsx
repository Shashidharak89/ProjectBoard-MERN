import React from 'react';

export const PageHeader = ({ title, subtitle, action, accentIcon = true }) => {
  return (
    <div className="page-header-container">
      <div className="page-header-text">
        <div className="page-header-title-row">
          {accentIcon && <span className="page-header-accent-dot" />}
          <h1 className="page-header-title">{title}</h1>
        </div>
        {subtitle && <p className="page-header-subtitle">{subtitle}</p>}
      </div>

      {action && <div className="page-header-action">{action}</div>}
    </div>
  );
};
