// components/Layout.jsx
import React, { useState, useEffect, useRef } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
 
const Layout = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(290); // desktop: left + right panel (95 + 195)
  const location = useLocation();
  const mainRef = useRef(null);
  const [refreshKey, setRefreshKey] = useState(0);
 
  useEffect(() => {
    const checkScreenSize = () => {
      const w = window.innerWidth;
      setIsMobile(w < 768);
      if (w >= 1024) setSidebarOpen(false);
    };
    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);
 
  useEffect(() => {
    if (location.state?.refresh) {
      setRefreshKey(location.state.refresh);
    }
  }, [location.state]);

  useEffect(() => {
    if (mainRef.current) {
      mainRef.current.scrollTop = 0;
    }
  }, [location.pathname]);
 
  const NAVBAR_HEIGHT = isMobile ? 140 : 48;
 
  // Content margin follows sidebar width (right panel always open on desktop)
  const contentMarginLeft = isMobile ? 0 : sidebarWidth;
  const contentWidth = isMobile ? "100%" : `calc(100% - ${sidebarWidth}px)`;
 
  return (
    <div className="min-h-screen" style={{ backgroundColor: "#eef2f7", overflow: "hidden" }}>
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
 
      {/* Main content margin matches sidebar width */}
      <main
        ref={mainRef}
        style={{
          marginLeft: contentMarginLeft,
          marginTop: NAVBAR_HEIGHT,
          height: `calc(100vh - ${NAVBAR_HEIGHT}px)`,
          overflowY: "auto",
          backgroundColor: "#eef2f7",
          width: contentWidth,
          boxSizing: "border-box",
          transition: "margin-left 0.2s ease, width 0.2s ease",
        }}
      >
        <div
          className="w-full"
          style={{
            backgroundColor: "#eef2f7",
            padding: isMobile ? "8px" : "16px",
            boxSizing: "border-box",
          }}
        >
          <Outlet key={refreshKey} />
        </div>
      </main>
    </div>
  );
};
 
export default Layout;
 
 