// components/Layout.jsx
import React, { useState, useEffect, useRef } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

const SCROLL_EASE = 0.1;
const SCROLL_DELTA_SCALE = 0.75;

const getScrollParent = (el, root) => {
  let node = el;
  while (node && node !== root) {
    const style = window.getComputedStyle(node);
    const overflowY = style.overflowY;
    const canScrollY =
      (overflowY === "auto" || overflowY === "scroll") &&
      node.scrollHeight > node.clientHeight;
    if (canScrollY) return node;
    node = node.parentElement;
  }
  return root;
};

const attachSmoothWheelScroll = (container, scrollRoot = container) => {
  if (!container || !scrollRoot) return () => {};

  const state = new WeakMap();
  const activeRafs = new Set();

  const getState = (el) => {
    if (!state.has(el)) {
      state.set(el, {
        target: el.scrollTop,
        current: el.scrollTop,
        rafId: null,
      });
    }
    return state.get(el);
  };

  const clamp = (el, value) =>
    Math.max(0, Math.min(value, el.scrollHeight - el.clientHeight));

  const tick = (el) => {
    const s = getState(el);
    const diff = s.target - s.current;
    if (Math.abs(diff) < 0.5) {
      s.current = s.target;
      el.scrollTop = s.current;
      if (s.rafId != null) activeRafs.delete(s.rafId);
      s.rafId = null;
      return;
    }
    s.current += diff * SCROLL_EASE;
    el.scrollTop = s.current;
    const rafId = requestAnimationFrame(() => tick(el));
    if (s.rafId != null) activeRafs.delete(s.rafId);
    s.rafId = rafId;
    activeRafs.add(rafId);
  };

  const onWheel = (e) => {

    const scrollEl = getScrollParent(e.target, scrollRoot);
    const maxScroll = scrollEl.scrollHeight - scrollEl.clientHeight;
    if (maxScroll <= 0) return;


    // Pages that opt in use native browser scrolling (immediate, no eased lag).
    if (e.target.closest("[data-native-scroll]")) {
      return;
    }

  

    const s = getState(scrollEl);

    e.preventDefault();
    s.target = clamp(scrollEl, s.target + e.deltaY * SCROLL_DELTA_SCALE);
    if (!s.rafId) {
      s.current = scrollEl.scrollTop;
      const rafId = requestAnimationFrame(() => tick(scrollEl));
      s.rafId = rafId;
      activeRafs.add(rafId);
    }
  };

  container.addEventListener("wheel", onWheel, { passive: false });

  return () => {
    container.removeEventListener("wheel", onWheel);
    activeRafs.forEach((rafId) => cancelAnimationFrame(rafId));
    activeRafs.clear();
  };
};

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

  // Document-level wheel easing covers main content and MUI modals (portal outside <main>).
  useEffect(() => {
    let detach = () => {};
    const frame = requestAnimationFrame(() => {
      detach = attachSmoothWheelScroll(document, document.body);
    });

    return () => {
      cancelAnimationFrame(frame);
      detach();
    };
  }, [location.pathname, refreshKey]);

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
        className="app-main-scroll"
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
