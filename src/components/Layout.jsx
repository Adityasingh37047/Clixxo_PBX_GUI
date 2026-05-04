// components/Layout.jsx
import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

const Layout = () => {
  const [isMobile, setIsMobile]         = useState(false);
  const [sidebarOpen, setSidebarOpen]   = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(95); // tracks actual sidebar width (hover + click both)
  const location                        = useLocation();
  const [refreshKey, setRefreshKey]     = useState(0);

  useEffect(() => {
    const checkScreenSize = () => {
      const w = window.innerWidth;
      setIsMobile(w < 768);
      if (w >= 1024) setSidebarOpen(false);
    };
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  useEffect(() => {
    if (location.state?.refresh) {
      setRefreshKey(location.state.refresh);
    }
  }, [location.state]);

  const NAVBAR_HEIGHT = isMobile ? 140 : 85;

  // Content margin follows sidebar width on every change (hover + click)
  const contentMarginLeft = isMobile ? 0 : sidebarWidth;
  const contentWidth      = isMobile ? '100%' : `calc(100% - ${sidebarWidth}px)`;

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#dde0e4' }}>

      <Navbar
        isMobile={isMobile}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      <Sidebar
        isMobile={isMobile}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        navbarHeight={NAVBAR_HEIGHT}
        onWidthChange={setSidebarWidth} // fires on hover AND click
      />

      {/* Main content shrinks on hover AND click, expands when both gone */}
      <main
        style={{
          marginLeft: contentMarginLeft,
          paddingTop: NAVBAR_HEIGHT,
          minHeight: `calc(100vh - ${NAVBAR_HEIGHT}px)`,
          backgroundColor: '#dde0e4',
          width: contentWidth,
          boxSizing: 'border-box',
          transition: 'margin-left 0.2s ease, width 0.2s ease',
        }}
      >
        <div
          className="w-full"
          style={{
            backgroundColor: '#dde0e4',
            padding: isMobile ? '8px' : '16px',
            boxSizing: 'border-box',
          }}
        >
          <Outlet key={refreshKey} />
        </div>
      </main>
    </div>
  );
};

export default Layout;