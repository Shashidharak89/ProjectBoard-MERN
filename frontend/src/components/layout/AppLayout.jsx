import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { Footer } from './Footer';

export const AppLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="app-layout">
      <div className="main-content">
        <Header onToggleSidebar={() => setSidebarOpen((prev) => !prev)} />
        <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
          <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
            <main className="page-container" style={{ flex: 1 }}>
              <Outlet />
            </main>
            <Footer />
          </div>
        </div>
      </div>
    </div>
  );
};
