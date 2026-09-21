import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Sidebar } from './Sidebar';

export const AppLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="app-layout">
      <div className="main-content">
        <Header onToggleSidebar={() => setSidebarOpen((prev) => !prev)} />
        <div style={{ display: 'flex', flex: 1 }}>
          <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
          <main className="page-container">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};
