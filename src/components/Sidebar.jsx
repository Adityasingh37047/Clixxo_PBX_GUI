// components / Sidebar.jsx

import React, { useMemo, useState, useRef, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { canAccessLicence } from "../constants/authAccess";
import {
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Collapse,
} from "@mui/material";
import ExpandLess from "@mui/icons-material/ExpandLess";
import { SIDEBAR_SECTIONS } from "../constants/sidebarConstants";

// ─── Window width hook ────────────────────────────────────────────────────────
const useWindowSize = () => {
  const [width, setWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1280
  );
  useEffect(() => {
    let raf;
    const onResize = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => setWidth(window.innerWidth));
    };
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(raf);
    };
  }, []);
  return width;
};

const isTouchDevice = () =>
  typeof window !== "undefined" &&
  ("ontouchstart" in window || navigator.maxTouchPoints > 0);

// ─────────────────────────────────────────────────────────────────────────────

const Sidebar = ({
  isMobile: _isMobileProp = false,
  sidebarOpen = false,
  setSidebarOpen = () => {},
  navbarHeight = 85,
  onWidthChange = () => {}, // fires on hover AND click
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const screenW  = useWindowSize();

  // ─── Breakpoints ──────────────────────────────────────────────────────────
  const isMobile = screenW < 768;
  const isTablet = screenW >= 768 && screenW < 1024;
  const isTouch  = isTouchDevice();
  const canHover = !isTouch && !isMobile;

  const LEFT_W  = isMobile ? 70  : isTablet ? 80  : 95;
  const RIGHT_W = isMobile ? 160 : isTablet ? 175 : 195;

  // ─── Filter sections ──────────────────────────────────────────────────────
  const sidebarSections = useMemo(() => {
    return SIDEBAR_SECTIONS.map((section) => {
      if (section.id === "maintenance" && Array.isArray(section.submenuItems)) {
        return {
          ...section,
          submenuItems: section.submenuItems.map((submenuItem) => {
            if (
              submenuItem.id === "systemTools" &&
              Array.isArray(submenuItem.items)
            ) {
              return {
                ...submenuItem,
                items: submenuItem.items.filter((item) => {
                  if (item.id === "licence") return canAccessLicence(user);
                  return true;
                }),
              };
            }
            return submenuItem;
          }),
        };
      }
      return section;
    });
  }, [user]);

  // ─── State ────────────────────────────────────────────────────────────────
  const [activeMenu,   setActiveMenu]   = useState(null); // click → persistent
  const [hoveredMenu,  setHoveredMenu]  = useState(null); // hover → temporary
  const [openItems,    setOpenItems]    = useState({});
  const [scrollTarget, setScrollTarget] = useState("submenu");

  const hoverLeaveTimer = useRef(null);
  const mainMenuRef     = useRef(null);
  const subMenuRef      = useRef(null);

  // Derived: activeMenu wins; hoveredMenu fills when nothing clicked
  const activeSection = activeMenu || (canHover ? hoveredMenu : null);

  // ─── Notify Layout on EVERY width change (hover + click both) ─────────────
  useEffect(() => {
    if (isMobile) {
      onWidthChange(0);
    } else {
      // Submenu visible (either hovered or clicked) → full width
      // Submenu hidden → left panel only
      onWidthChange(activeSection ? LEFT_W + RIGHT_W : LEFT_W);
    }
  }, [activeSection, isMobile, LEFT_W, RIGHT_W, onWidthChange]);

  // ─── Cleanup on breakpoint change ─────────────────────────────────────────
  useEffect(() => {
    if (isMobile) setHoveredMenu(null);
  }, [isMobile]);

  useEffect(() => {
    if (!isMobile && sidebarOpen) setSidebarOpen(false);
  }, [isMobile]);

  // ─── Navigation ───────────────────────────────────────────────────────────
  const handleNavigation = useCallback((path) => {
    if (!path) return;
    if (location.pathname === path) {
      navigate(path, { replace: true, state: { refresh: Date.now() } });
    } else {
      navigate(path);
    }
    if (isMobile) setSidebarOpen(false);
  }, [location.pathname, navigate, isMobile, setSidebarOpen]);

  const handleToggle = (id) =>
    setOpenItems((prev) => ({ ...prev, [id]: !prev[id] }));

  const isActive = (path) => location.pathname === path;

  // ─── Hover handlers with 80ms delay (prevents flicker) ───────────────────
  const handleLeftItemMouseEnter = (sectionId) => {
    if (!canHover) return;
    clearTimeout(hoverLeaveTimer.current);
    setHoveredMenu(sectionId);
  };

  const handleLeftItemMouseLeave = () => {
    if (!canHover) return;
    hoverLeaveTimer.current = setTimeout(() => setHoveredMenu(null), 80);
  };

  const handleSubmenuMouseEnter = () => {
    if (!canHover) return;
    clearTimeout(hoverLeaveTimer.current);
  };

  const handleSubmenuMouseLeave = () => {
    if (!canHover) return;
    hoverLeaveTimer.current = setTimeout(() => setHoveredMenu(null), 80);
  };

  // ─── Click handler ────────────────────────────────────────────────────────
  const handleMainItemClick = (section) => {
    clearTimeout(hoverLeaveTimer.current);
    if (!section.hasSubmenu) {
      handleNavigation(section.path);
      setActiveMenu(section.id);
    } else {
      setActiveMenu((prev) => (prev === section.id ? null : section.id));
    }
  };

  // ============================================
  // RENDER FUNCTIONS — 4 LEVELS OF NESTING
  // ============================================

  // LEVEL 4
  const renderDeepItem = (item) => (
    <ListItem
      key={item.id}
      component="div"
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleNavigation(item.path); }}
      sx={{
        cursor: "pointer",
        backgroundColor: isActive(item.path) ? "#1a3a5c" : "#f2f4f7",
        borderBottom: "1px solid #ced2d9",
        borderTop: "1px solid rgba(255,255,255,0.8)",
        minHeight: isMobile ? "26px" : "28px",
        display: "flex", alignItems: "center",
        width: "100%", boxSizing: "border-box",
        padding: isMobile ? "3px 6px" : "3px 8px 3px 10px",
        transition: "background-color 0.2s ease",
      }}
    >
      <ListItemIcon sx={{ minWidth: 0, marginRight: 1 }}>
        <div style={{ width: "2px", height: "14px", backgroundColor: isActive(item.path) ? "#ffffff" : "#d4d8e0" }} />
      </ListItemIcon>
      <ListItemText
        primary={item.title}
        sx={{
          "& .MuiTypography-root": {
            color: isActive(item.path) ? "#ffffff" : "#1e293b",
            fontWeight: 600,
            fontSize: isMobile ? 12 : isTablet ? 13 : 13.5,
            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
          },
        }}
      />
    </ListItem>
  );

  // LEVEL 3
  const renderSubGroup = (group) => {
    const IconComponent = group.icon;
    const isOpen = openItems[group.id] || false;
    return (
      <React.Fragment key={group.id}>
        <ListItem
          component="div"
          onClick={(e) => {
            e.preventDefault(); e.stopPropagation();
            setOpenItems((prev) => {
              const newState = { ...prev };
              Object.keys(newState).forEach((key) => { newState[key] = false; });
              newState[group.id] = !isOpen;
              return newState;
            });
          }}
          sx={{
            cursor: "pointer", backgroundColor: "#d5dae3",
            borderBottom: "1px solid #bfc4cc",
            borderTop: "1px solid rgba(255,255,255,0.8)",
            minHeight: isMobile ? "26px" : "28px",
            display: "flex", alignItems: "center",
            padding: isMobile ? "4px 6px" : "6px 8px 6px 10px",
            width: "100%", boxSizing: "border-box",
            transition: "background-color 0.2s ease",
          }}
        >
          <ListItemIcon sx={{ minWidth: 0, marginRight: 1 }}>
            <IconComponent sx={{ color: "#2563eb", fontSize: isMobile ? 14 : 16 }} />
          </ListItemIcon>
          <ListItemText
            primary={group.title}
            sx={{
              "& .MuiTypography-root": {
                color: "#1e293b", fontWeight: 700,
                fontSize: isMobile ? 12 : isTablet ? 13 : 14,
                whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
              },
            }}
          />
          <ExpandLess sx={{
            color: "#4b5563",
            transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
            fontSize: isMobile ? 14 : 16,
            transition: "transform 0.2s ease", flexShrink: 0,
          }} />
        </ListItem>
        <Collapse in={isOpen} timeout={200} unmountOnExit>
          <List component="div" disablePadding>
            {group.items && group.items.map(renderDeepItem)}
          </List>
        </Collapse>
      </React.Fragment>
    );
  };

  // LEVEL 2
  const renderGroupItem = (item) => {
    const isOpen = openItems[item.id] || false;
    return (
      <React.Fragment key={item.id}>
        <ListItem
          component="div"
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleToggle(item.id); }}
          sx={{
            cursor: "pointer", backgroundColor: "#d5dae3",
            borderBottom: "1px solid #c0c4c8",
            borderTop: "1px solid rgba(255,255,255,0.8)",
            minHeight: isMobile ? "26px" : "28px",
            display: "flex", alignItems: "center",
            width: "100%", boxSizing: "border-box",
            padding: isMobile ? "2px 6px" : "2px 8px",
            transition: "background-color 0.2s ease",
          }}
        >
          <ListItemIcon sx={{ minWidth: 0, marginRight: 1 }}>
            <div style={{ width: "1px", height: "12px", backgroundColor: "#2563eb" }} />
          </ListItemIcon>
          <ListItemText
            primary={item.title}
            sx={{
              "& .MuiTypography-root": {
                color: "#374151", fontWeight: 700,
                fontSize: isMobile ? 11 : isTablet ? 11.5 : 12,
                whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
              },
            }}
          />
          <ExpandLess sx={{
            color: "#4b5563",
            transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
            fontSize: isMobile ? 14 : 16,
            transition: "transform 0.2s ease", flexShrink: 0,
          }} />
        </ListItem>
        <Collapse in={isOpen} timeout={200} unmountOnExit>
          <List component="div" disablePadding>
            {item.subGroups && item.subGroups.map(renderSubGroup)}
          </List>
        </Collapse>
      </React.Fragment>
    );
  };

  // LEVEL 1
  const renderSimpleItem = (item) => (
    <ListItem
      key={item.id}
      component="div"
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleNavigation(item.path); }}
      sx={{
        cursor: "pointer",
        backgroundColor: isActive(item.path) ? "#1a3a5c" : "transparent",
        borderBottom: "1px solid #ced2d9",
        borderTop: "1px solid rgba(255,255,255,0.8)",
        minHeight: isMobile ? "26px" : "28px",
        display: "flex", alignItems: "center",
        width: "100%", boxSizing: "border-box",
        padding: isMobile ? "1px 6px" : "1px 10px",
      }}
    >
      <ListItemIcon sx={{ minWidth: 0, marginRight: 1 }}>
        <div style={{ width: "1px", height: "12px", backgroundColor: isActive(item.path) ? "#60a5fa" : "#9ca3af" }} />
      </ListItemIcon>
      <ListItemText
        primary={item.title}
        sx={{
          "& .MuiTypography-root": {
            color: isActive(item.path) ? "#ffffff" : "#1e293b",
            fontWeight: isActive(item.path) ? 600 : 500,
            fontSize: isMobile ? 12 : isTablet ? 12.5 : 13,
            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
          },
        }}
      />
    </ListItem>
  );

  // Smart router
  const renderSubmenuItems = (submenuItems) =>
    submenuItems.map((item) => {
      if (item.isGroup && item.subGroups) return renderGroupItem(item);
      if (item.items && item.icon)        return renderSubGroup(item);
      return renderSimpleItem(item);
    });

  // Main section header
  const renderSidebarSection = (section) => {
    const IconComponent   = section.icon;
    const isCurrentActive = activeSection === section.id;

    return (
      <ListItem
        key={section.id}
        component="div"
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleMainItemClick(section); }}
        onMouseEnter={() => handleLeftItemMouseEnter(section.id)}
        onMouseLeave={handleLeftItemMouseLeave}
        sx={{
          cursor: "pointer",
          backgroundColor: isCurrentActive ? "#1a2f4a" : "transparent",
          borderBottom: "1px solid #1e2d42",
          borderLeft: isCurrentActive ? "3px solid #60a5fa" : "3px solid transparent",
          minHeight: isMobile ? "50px" : isTablet ? "55px" : "60px",
          display: "flex", flexDirection: "column",
          justifyContent: "center", alignItems: "center",
          padding: isMobile ? "8px 4px" : "13px",
          transition: "background-color 0.2s ease",
          "&:hover": { backgroundColor: isCurrentActive ? "#1a2f4a" : "#3a5070" },
        }}
        title={section.title}
      >
        <ListItemIcon sx={{ minWidth: 0, marginBottom: isMobile ? 0 : -0.5 }}>
          <IconComponent sx={{
            color: isCurrentActive ? "#ffffff" : "#60a5fa",
            fontSize: isMobile ? 18 : isTablet ? 20 : 21,
          }} />
        </ListItemIcon>
        {!isMobile && (
          <ListItemText
            primary={section.title}
            sx={{
              textAlign: "center",
              "& .MuiTypography-root": {
                color: isCurrentActive ? "#e0e0e0" : "#ffffff",
                fontWeight: 700,
                fontSize: isTablet ? 13 : 14,
                lineHeight: 1.2,
                whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                maxWidth: LEFT_W - 8,
              },
            }}
          />
        )}
      </ListItem>
    );
  };

  const renderSubmenu = () => {
    const section = sidebarSections.find((s) => s.id === activeSection);
    if (!section || !section.submenuItems) return null;
    return renderSubmenuItems(section.submenuItems);
  };

  const handleScroll = (e) => {
    const scrollTop = e.target.scrollTop;
    if (scrollTarget === "main"    && mainMenuRef.current) mainMenuRef.current.scrollTop = scrollTop;
    if (scrollTarget === "submenu" && subMenuRef.current)  subMenuRef.current.scrollTop  = scrollTop;
  };

  const sidebarLeft  = isMobile ? (sidebarOpen ? 0 : "-100%") : 0;
  const sidebarWidth = isMobile
    ? "100%"
    : activeSection
      ? LEFT_W + RIGHT_W
      : LEFT_W;

  return (
    <>
      {/* Mobile overlay */}
      {isMobile && sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: "fixed", top: 0, left: 0,
            width: "100%", height: "100%",
            backgroundColor: "rgba(0,0,0,0.5)",
            zIndex: 39, touchAction: "none",
          }}
        />
      )}

      {/* Sidebar wrapper */}
      <div
        onScroll={handleScroll}
        style={{
          position: "fixed",
          top: `${navbarHeight + 1}px`,
          left: sidebarLeft,
          height: `calc(100vh - ${navbarHeight + 1}px)`,
          display: "flex",
          flexDirection: "row",
          width: sidebarWidth,
          zIndex: 40,
          transition: isMobile ? "left 0.3s ease" : "width 0.2s ease",
          overscrollBehavior: "contain",
        }}
      >
        {/* LEFT MENU */}
        <div
          ref={mainMenuRef}
          onMouseEnter={() => setScrollTarget("main")}
          style={{
            minWidth: LEFT_W, width: LEFT_W,
            background: "#2c3e5c",
            borderRight: "1px solid #1e2d42",
            overflowY: "auto", overflowX: "hidden",
            WebkitOverflowScrolling: "touch",
          }}
        >
          <List sx={{ py: 0 }}>
            {sidebarSections.map(renderSidebarSection)}
          </List>
        </div>

        {/* RIGHT MENU — same behavior for hover and click, always in flow */}
        {activeSection && (
          <div
            ref={subMenuRef}
            onMouseEnter={handleSubmenuMouseEnter}
            onMouseLeave={handleSubmenuMouseLeave}
            style={{
              width: isMobile ? `calc(100vw - ${LEFT_W}px)` : RIGHT_W,
              background: "#dde0e4",
              borderRight: "2px solid #ECEEF3",
              overflowY: "auto", overflowX: "hidden",
              WebkitOverflowScrolling: "touch",
              animation: "sbSlideIn 0.15s ease",
            }}
          >
            <List sx={{ py: 0 }}>{renderSubmenu()}</List>
          </div>
        )}
      </div>

      <style>{`
        @keyframes sbSlideIn {
          from { opacity: 0; transform: translateX(-6px); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </>
  );
};

export default Sidebar;