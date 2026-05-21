// components / Sidebar.jsx

import React, {
  useMemo,
  useState,
  useRef,
  useEffect,
  useCallback,
} from "react";
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
    typeof window !== "undefined" ? window.innerWidth : 1280,
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
  const screenW = useWindowSize();

  // ─── Breakpoints ──────────────────────────────────────────────────────────
  const isMobile = screenW < 768;
  const isTablet = screenW >= 768 && screenW < 1024;
  const isTouch = isTouchDevice();
  const canHover = !isTouch && !isMobile;

  const LEFT_W = isMobile ? 70 : isTablet ? 80 : 95;
  const RIGHT_W = isMobile ? 160 : isTablet ? 175 : 195;

  // ─── Filter sections ──────────────────────────────────────────────────────
  const sidebarSections = useMemo(() => {
    const access = user?.access;
    const allowAll =
      !access ||
      access.allow_all === true ||
      access.access_type === "superadmin" ||
      user?.role === "superadmin";
    const allowedPages = allowAll ? null : new Set(access?.pages ?? []);

    return SIDEBAR_SECTIONS.map((section) => {
      // Always filter licence item regardless of permissions
      const applyLicenceFilter = (submenuItems) =>
        submenuItems.map((sm) => {
          if (sm.id === "systemTools" && Array.isArray(sm.items)) {
            return {
              ...sm,
              items: sm.items.filter(
                (item) => item.id !== "licence" || canAccessLicence(user),
              ),
            };
          }
          return sm;
        });

      if (allowAll) {
        // Admin / superadmin — show everything, just filter licence
        if (
          section.id === "maintenance" &&
          Array.isArray(section.submenuItems)
        ) {
          return {
            ...section,
            submenuItems: applyLicenceFilter(section.submenuItems),
          };
        }
        return section;
      }

      // Custom user — filter pages within each submenu item, then drop empty ones
      const filteredSubmenus = (section.submenuItems || [])
        .map((sm) => ({
          ...sm,
          items: (sm.items || []).filter((item) => allowedPages.has(item.id)),
        }))
        .filter((sm) => sm.items.length > 0);

      // Drop the whole section if no pages remain
      if (filteredSubmenus.length === 0) return null;

      // Apply licence filter on top for maintenance section
      const finalSubmenus =
        section.id === "maintenance"
          ? applyLicenceFilter(filteredSubmenus)
          : filteredSubmenus;

      return { ...section, submenuItems: finalSubmenus };
    }).filter(Boolean);
  }, [user]);

  // ─── State ────────────────────────────────────────────────────────────────
  const [activeMenu, setActiveMenu] = useState(null); // click → persistent
  const [hoveredMenu, setHoveredMenu] = useState(null); // hover → temporary
  const [openItems, setOpenItems] = useState({});
  const [scrollTarget, setScrollTarget] = useState("submenu");

  const hoverLeaveTimer = useRef(null);
  const mainMenuRef = useRef(null);
  const subMenuRef = useRef(null);

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
  const handleNavigation = useCallback(
    (path) => {
      if (!path) return;
      if (location.pathname === path) {
        navigate(path, { replace: true, state: { refresh: Date.now() } });
      } else {
        navigate(path);
      }
      if (isMobile) setSidebarOpen(false);
    },
    [location.pathname, navigate, isMobile, setSidebarOpen],
  );

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

  // LEVEL 4 — leaf page items
  const renderDeepItem = (item) => (
    <ListItem
      key={item.id}
      component="div"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        handleNavigation(item.path);
      }}
      sx={{
        cursor: "pointer",
        backgroundColor: isActive(item.path) ? "#d0ecf8" : "#ffffff",
        borderBottom: "1px solid #e8edf3",
        borderLeft: isActive(item.path)
          ? "3px solid #29a8e0"
          : "3px solid transparent",
        minHeight: isMobile ? "26px" : "28px",
        display: "flex",
        alignItems: "center",
        width: "100%",
        boxSizing: "border-box",
        padding: isMobile ? "3px 6px" : "3px 8px 3px 10px",
        transition: "background-color 0.15s ease",
        "&:hover": {
          backgroundColor: isActive(item.path) ? "#d0ecf8" : "#f0f7fd",
        },
      }}
    >
      <ListItemIcon sx={{ minWidth: 0, marginRight: 1 }}>
        <div
          style={{
            width: "2px",
            height: "14px",
            backgroundColor: isActive(item.path) ? "#29a8e0" : "#cbd5e1",
          }}
        />
      </ListItemIcon>
      <ListItemText
        primary={item.title}
        sx={{
          "& .MuiTypography-root": {
            color: isActive(item.path) ? "#29a8e0" : "#374151",
            fontWeight: isActive(item.path) ? 700 : 500,
            fontSize: isMobile ? 12 : isTablet ? 11 : 12,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          },
        }}
      />
    </ListItem>
  );

  // LEVEL 3 — subgroup with items
  const renderSubGroup = (group) => {
    const IconComponent = group.icon;
    const isOpen = openItems[group.id] || false;
    return (
      <React.Fragment key={group.id}>
        <ListItem
          component="div"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setOpenItems((prev) => {
              const newState = { ...prev };
              Object.keys(newState).forEach((key) => {
                newState[key] = false;
              });
              newState[group.id] = !isOpen;
              return newState;
            });
          }}
          sx={{
            cursor: "pointer",
            backgroundColor: "#eaeff5",
            borderBottom: "1px solid #dde4ed",
            // borderTop: "1px solid rgba(255,255,255,0.9)",
            minHeight: isMobile ? "26px" : "28px",
            display: "flex",
            alignItems: "center",
            padding: isMobile ? "4px 6px" : "6px 8px 6px 10px",
            width: "100%",
            boxSizing: "border-box",
            transition: "background-color 0.15s ease",
          }}
        >
          <ListItemIcon sx={{ minWidth: 0, marginRight: 1 }}>
            <IconComponent
              sx={{ color: "#29a8e0", fontSize: isMobile ? 14 : 15 }}
            />
          </ListItemIcon>
          <ListItemText
            primary={group.title}
            sx={{
              "& .MuiTypography-root": {
                color: "#334155",
                fontWeight: 700,
                fontSize: isMobile ? 12 : isTablet ? 12 : 13,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              },
            }}
          />
          <ExpandLess
            sx={{
              color: "#64748b",
              transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
              fontSize: isMobile ? 15 : 16,
              transition: "transform 0.2s ease",
              flexShrink: 0,
            }}
          />
        </ListItem>
        <Collapse in={isOpen} timeout={200} unmountOnExit>
          <List component="div" disablePadding>
            {group.items && group.items.map(renderDeepItem)}
          </List>
        </Collapse>
      </React.Fragment>
    );
  };

  // LEVEL 2 — group with subgroups
  const renderGroupItem = (item) => {
    const isOpen = openItems[item.id] || false;
    return (
      <React.Fragment key={item.id}>
        <ListItem
          component="div"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleToggle(item.id);
          }}
          sx={{
            cursor: "pointer",
            backgroundColor: "#eaeff5",
            borderBottom: "1px solid #dde4ed",
            borderTop: "1px solid rgba(255,255,255,0.9)",
            minHeight: isMobile ? "26px" : "28px",
            display: "flex",
            alignItems: "center",
            width: "100%",
            boxSizing: "border-box",
            padding: isMobile ? "2px 6px" : "2px 8px",
            transition: "background-color 0.15s ease",
          }}
        >
          <ListItemIcon sx={{ minWidth: 0, marginRight: 1 }}>
            <div
              style={{
                width: "2px",
                height: "12px",
                backgroundColor: "#29a8e0",
              }}
            />
          </ListItemIcon>
          <ListItemText
            primary={item.title}
            sx={{
              "& .MuiTypography-root": {
                color: "#334155",
                fontWeight: 700,
                fontSize: isMobile ? 11 : isTablet ? 11.5 : 12,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              },
            }}
          />
          <ExpandLess
            sx={{
              color: "#64748b",
              transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
              fontSize: isMobile ? 14 : 16,
              transition: "transform 0.2s ease",
              flexShrink: 0,
            }}
          />
        </ListItem>
        <Collapse in={isOpen} timeout={200} unmountOnExit>
          <List component="div" disablePadding>
            {item.subGroups && item.subGroups.map(renderSubGroup)}
          </List>
        </Collapse>
      </React.Fragment>
    );
  };

  // LEVEL 1 — simple nav item
  const renderSimpleItem = (item) => (
    <ListItem
      key={item.id}
      component="div"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        handleNavigation(item.path);
      }}
      sx={{
        cursor: "pointer",
        backgroundColor: isActive(item.path) ? "#d0ecf8" : "transparent",
        borderBottom: "1px solid #e8edf3",
        borderLeft: isActive(item.path)
          ? "3px solid #29a8e0"
          : "3px solid transparent",
        minHeight: isMobile ? "26px" : "28px",
        display: "flex",
        alignItems: "center",
        width: "100%",
        boxSizing: "border-box",
        padding: isMobile ? "1px 6px" : "1px 10px",
        "&:hover": {
          backgroundColor: isActive(item.path) ? "#d0ecf8" : "#f0f7fd",
        },
      }}
    >
      <ListItemIcon sx={{ minWidth: 0, marginRight: 1 }}>
        <div
          style={{
            width: "2px",
            height: "12px",
            backgroundColor: isActive(item.path) ? "#29a8e0" : "#cbd5e1",
          }}
        />
      </ListItemIcon>
      <ListItemText
        primary={item.title}
        sx={{
          "& .MuiTypography-root": {
            color: isActive(item.path) ? "#29a8e0" : "#374151",
            fontWeight: isActive(item.path) ? 700 : 500,
            fontSize: isMobile ? 12 : isTablet ? 12.5 : 13,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          },
        }}
      />
    </ListItem>
  );

  // Smart router
  const renderSubmenuItems = (submenuItems) =>
    submenuItems.map((item) => {
      if (item.isGroup && item.subGroups) return renderGroupItem(item);
      if (item.items && item.icon) return renderSubGroup(item);
      return renderSimpleItem(item);
    });

  // Main section header (left icon panel)
  const renderSidebarSection = (section) => {
    const IconComponent = section.icon;
    const isCurrentActive = activeSection === section.id;

    return (
      <ListItem
        key={section.id}
        component="div"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleMainItemClick(section);
        }}
        onMouseEnter={() => handleLeftItemMouseEnter(section.id)}
        onMouseLeave={handleLeftItemMouseLeave}
        sx={{
          cursor: "pointer",
          backgroundColor: isCurrentActive ? "#29a8e0" : "transparent",
          borderBottom: "1px solid #162233",
          minHeight: isMobile ? "44px" : isTablet ? "48px" : "52px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          padding: isMobile ? "6px 4px" : "10px 8px",
          transition: "background-color 0.15s ease",
          "&:hover": {
            backgroundColor: isCurrentActive ? "#29a8e0" : "#2a3f58",
          },
        }}
        title={section.title}
      >
        <ListItemIcon sx={{ minWidth: 0, marginBottom: isMobile ? 0 : -0.5 }}>
          <IconComponent
            sx={{
              color: isCurrentActive ? "#ffffff" : "#ffffff",
              fontSize: isMobile ? 18 : isTablet ? 20 : 21,
            }}
          />
        </ListItemIcon>
        {!isMobile && (
          <ListItemText
            primary={section.title}
            sx={{
              textAlign: "center",
              "& .MuiTypography-root": {
                color: isCurrentActive ? "#ffffff" : "#ffffff",
                fontWeight: 700,
                fontSize: isTablet ? 11 : 11.5,
                lineHeight: 1.2,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
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
    if (scrollTarget === "main" && mainMenuRef.current)
      mainMenuRef.current.scrollTop = scrollTop;
    if (scrollTarget === "submenu" && subMenuRef.current)
      subMenuRef.current.scrollTop = scrollTop;
  };

  const sidebarLeft = isMobile ? (sidebarOpen ? 0 : "-100%") : 0;
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
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0,0,0,0.5)",
            zIndex: 39,
            touchAction: "none",
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
            minWidth: LEFT_W,
            width: LEFT_W,
            background: "#162436",
            borderRight: "1px solid #162233",
            overflowY: "auto",
            overflowX: "hidden",
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
              background: "#f0f4f8",
              borderRight: "1px solid #dde4ed",
              overflowY: "auto",
              overflowX: "hidden",
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
