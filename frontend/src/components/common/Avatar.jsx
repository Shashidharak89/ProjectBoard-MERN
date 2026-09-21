import React from 'react';

const getInitials = (name = '') => {
  if (!name.trim()) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

export const Avatar = ({ name = '', size = 34, className = '', title }) => {
  const initials = getInitials(name);
  return (
    <div
      className={`avatar ${className}`}
      style={{ width: size, height: size, fontSize: size * 0.4 }}
      title={title || name}
    >
      {initials}
    </div>
  );
};
