import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { useSelector } from 'react-redux';
import { FaBars } from 'react-icons/fa';

const Layout = () => {
  const { user } = useSelector((state) => state.auth);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="layout">
      <Navbar user={user} />
      <div className="layout-main">
        {/* Mobile sidebar toggle button */}
        <button 
          className="mobile-sidebar-toggle"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          <FaBars />
        </button>
        
        <div className={`sidebar-container ${isSidebarOpen ? 'open' : ''}`}>
          <Sidebar userRole={user?.role} />
        </div>
        
        <main className="main-content" onClick={() => setIsSidebarOpen(false)}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;