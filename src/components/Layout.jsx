// components/Layout.jsx
import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

const Layout = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth >= 1024) {
        setSidebarOpen(false); // Close mobile sidebar on desktop
      }
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Handle refresh trigger from sidebar navigation
  useEffect(() => {
    if (location.state?.refresh) {
      // Force remount of the current route component by changing the key
      setRefreshKey(location.state.refresh);
    }
  }, [location.state]);

  const NAVBAR_HEIGHT = isMobile ? 140 : 85;
  const SIDEBAR_WIDTH = isMobile ? 0 : 250; // 72px (icons) + 178px (submenu) = 250px

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#dde0e4' }}>
      {/* Fixed Navbar at the top */}
      <Navbar
        isMobile={isMobile}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      {/* Sidebar - responsive */}
      <Sidebar
        isMobile={isMobile}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        navbarHeight={NAVBAR_HEIGHT}
      />

      {/* Main content area with responsive margins */}
      <main
        className="transition-all duration-200"
        style={{
          marginLeft: isMobile ? 0 : SIDEBAR_WIDTH,
          paddingTop: NAVBAR_HEIGHT,
          minHeight: `calc(100vh - ${NAVBAR_HEIGHT}px)`,
          backgroundColor: '#dde0e4',
          width: isMobile ? '100%' : `calc(100% - ${SIDEBAR_WIDTH}px)`,
          boxSizing: 'border-box',
        }}
      >
        <div className="w-full" style={{
          backgroundColor: '#dde0e4',
          padding: isMobile ? '8px' : '16px',
          boxSizing: 'border-box',
        }}>
          <Outlet key={refreshKey} />
        </div>
      </main>
    </div>
  );
};

export default Layout;