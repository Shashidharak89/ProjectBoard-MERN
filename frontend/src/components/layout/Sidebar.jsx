import React from 'react';
import { NavLink } from 'react-router-dom';
import { FiGrid, FiFolder, FiUsers, FiUser, FiLogOut, FiX } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../common/Button';

export const Sidebar = ({ isOpen, onClose }) => {
  const { logout } = useAuth();

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: <FiGrid /> },
    { label: 'Projects', path: '/projects', icon: <FiFolder /> },
    { label: 'Users', path: '/users', icon: <FiUsers /> },
    { label: 'Profile', path: '/profile', icon: <FiUser /> },
  ];

  return (
    <>
      {isOpen && <div className="sidebar-overlay" onClick={onClose} />}

      <aside className={`sidebar-right ${isOpen ? 'open' : ''}`}>
        <div>
          <div className="sidebar-header">
            <span className="sidebar-title">Menu</span>
            <button className="sidebar-close-btn" onClick={onClose} aria-label="Close menu">
              <FiX />
            </button>
          </div>

          <nav className="sidebar-nav">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                onClick={onClose}
              >
                <span style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center' }}>{item.icon}</span>
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="sidebar-footer">
          <Button
            variant="outline"
            size="sm"
            style={{ width: '100%', gap: '0.5rem' }}
            onClick={() => {
              onClose();
              logout();
            }}
          >
            <FiLogOut />
            <span>Sign Out</span>
          </Button>
        </div>
      </aside>
    </>
  );
};
