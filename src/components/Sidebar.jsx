// components / Sidebar.jsx

import React, {
  useMemo,
  useState,
  useRef,
  useEffect,
  useCallback,
} from "react";
import { useNavigate, useLocation } from "react-router-dom";
import useAuth from "../context/useAuth";
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

const SIDEBAR_ACCENT = "#3B6FE8";
const SIDEBAR_RAIL_BG = "#1C2536";
const SIDEBAR_PANEL_BG = "#1a2332";
const SIDEBAR_BORDER = "#243044";
const SIDEBAR_TEXT_MUTED = "#94a3b8";
const SIDEBAR_TEXT_ACTIVE = "#dbeafe";
const SIDEBAR_TEXT_ICON_ACTIVE = "#93c5fd";
const SIDEBAR_HOVER_BG = "rgba(255, 255, 255, 0.08)";
const SUBMENU_ACTIVE_BG = "rgba(59, 111, 232, 0.16)";
const MODULE_COLLAPSE_MS = 480;
const RAIL_ITEM_TRANSITION =
  "background 180ms ease, color 180ms ease";
const PANEL_ITEM_TRANSITION =
  "background 180ms ease, color 180ms ease";

const panelActiveAccent = (active) =>
  active
    ? {
        "&::before": {
          content: '""',
          position: "absolute",
          left: 0,
          top: "50%",
          transform: "translateY(-50%)",
          width: 3,
          height: "48%",
          backgroundColor: SIDEBAR_ACCENT,
          borderRadius: "0 3px 3px 0",
          boxShadow: `0 0 8px ${SIDEBAR_ACCENT}66`,
        },
      }
    : {};

const PANEL_HOVER_BG = "#243044";
const PANEL_MODULE_CLOSED_WEIGHT = 600;
const PANEL_MODULE_OPEN_WEIGHT = 700;
const PANEL_MODULE_OPEN_COLOR = "#e2e8f0";

/** Slow top→bottom open / bottom→top close for module page lists (e.g. FXS Advanced). */
const SidebarModuleCollapse = ({ in: open, children }) => (
  <Collapse
    className="sidebar-module-collapse"
    in={open}
    timeout={{ enter: MODULE_COLLAPSE_MS, exit: MODULE_COLLAPSE_MS }}
    easing={{ enter: "ease-in-out", exit: "ease-in-out" }}
    unmountOnExit
  >
    <div className="sidebar-module-collapse-inner">{children}</div>
  </Collapse>
);

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

  // First section with submenu — default when right panel is always open (desktop)
  const defaultOpenSectionId =
    sidebarSections.find((s) => s.hasSubmenu)?.id ??
    sidebarSections[0]?.id ??
    null;

  // Derived: activeMenu wins; hoveredMenu fills when nothing clicked
  // const activeSection = activeMenu || (canHover ? hoveredMenu : null);

  // Desktop/mobile: show submenu for clicked section, else default first module
  const activeSection = activeMenu ?? defaultOpenSectionId;

  // ─── Notify Layout on EVERY width change (hover + click both) ─────────────
  useEffect(() => {
    if (isMobile) {
      onWidthChange(0);
    } else {
      // Submenu visible (either hovered or clicked) → full width
      // Submenu hidden → left panel only
      // onWidthChange(activeSection ? LEFT_W + RIGHT_W : LEFT_W);
      onWidthChange(LEFT_W + RIGHT_W);
    }
  }, [activeSection, isMobile, LEFT_W, RIGHT_W, onWidthChange]);

  // ─── Cleanup on breakpoint change ─────────────────────────────────────────
  useEffect(() => {
    if (isMobile) setHoveredMenu(null);
  }, [isMobile]);

  useEffect(() => {
    if (!isMobile && sidebarOpen) setSidebarOpen(false);
  }, [isMobile]);

  useEffect(() => {
    const path = location.pathname;
    const matchedSection = sidebarSections.find((section) => {
      if (!section.submenuItems?.length) return false;
      return section.submenuItems.some((group) =>
        (group.items || []).some(
          (item) =>
            item.path === path ||
            (item.path &&
              path.startsWith(item.path.split("/").slice(0, 3).join("/"))),
        ),
      );
    });
    if (matchedSection) {
      setActiveMenu(matchedSection.id);
      const groupContainsPath = (group, itemPath) => {
        const prefixes = {
          fxsAdvanced: "/advanced",
          fxsPort: "/port",
          fxsRoute: "/fxs/route",
          fxsNumManipulate: "/fxs/num-manipulate",
        };
        const prefix = prefixes[group.id];
        if (prefix && itemPath.startsWith(prefix)) return true;
        return (group.items || []).some((item) => item.path === itemPath);
      };
      const openGroup = matchedSection.submenuItems.find((group) =>
        groupContainsPath(group, path),
      );
      if (openGroup) {
        setOpenItems((prev) => ({ ...prev, [openGroup.id]: true }));
      }
    }
  }, [location.pathname, sidebarSections]);

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

  // ─── Hover handlers with 80ms delay (prevents flicker) — kept, not wired in JSX ──
  // onMouseEnter={() => handleLeftItemMouseEnter(section.id)}
  // onMouseLeave={handleLeftItemMouseLeave}
  // onMouseEnter={handleSubmenuMouseEnter} onMouseLeave={handleSubmenuMouseLeave}
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
      // Click-to-toggle close (disabled — right menu always open on desktop)
      // setActiveMenu((prev) => (prev === section.id ? null : section.id));
      setActiveMenu(section.id);
    }
  };

  // ============================================
  // RENDER FUNCTIONS — 4 LEVELS OF NESTING
  // ============================================

  // LEVEL 4 — leaf page items
  const renderDeepItem = (item) => {
    const active = isActive(item.path);
    return (
      <ListItem
        key={item.id}
        component="div"
        className="sidebar-subnav-link"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleNavigation(item.path);
        }}
        sx={{
          position: "relative",
          cursor: "pointer",
          backgroundColor: active ? SUBMENU_ACTIVE_BG : "transparent",
          borderLeft: "none",
          margin: "1px 0",
          minHeight: 36,
          display: "flex",
          alignItems: "center",
          width: "100%",
          boxSizing: "border-box",
          padding: "8px 12px 8px 18px",
          transition: PANEL_ITEM_TRANSITION,
          ...panelActiveAccent(active),
          "&:hover": {
            backgroundColor: active ? SUBMENU_ACTIVE_BG : PANEL_HOVER_BG,
          },
        }}
      >
        <ListItemText
          primary={item.title}
          sx={{
            margin: 0,
            "& .MuiTypography-root": {
              color: active ? SIDEBAR_TEXT_ICON_ACTIVE : SIDEBAR_TEXT_MUTED,
              fontWeight: active ? 600 : 500,
              fontSize: isMobile ? 12 : 13,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            },
          }}
        />
      </ListItem>
    );
  };

  // LEVEL 3 — subgroup with items (collapsible dropdown)
  const renderSubGroup = (group) => {
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
            backgroundColor: "transparent",
            minHeight: 38,
            display: "flex",
            alignItems: "center",
            padding: "8px 12px",
            width: "100%",
            boxSizing: "border-box",
            transition: PANEL_ITEM_TRANSITION,
            "&:hover": { backgroundColor: PANEL_HOVER_BG },
          }}
        >
          <ListItemText
            primary={group.title}
            sx={{
              margin: 0,
              "& .MuiTypography-root": {
                color: isOpen ? PANEL_MODULE_OPEN_COLOR : SIDEBAR_TEXT_MUTED,
                fontWeight: isOpen ? PANEL_MODULE_OPEN_WEIGHT : PANEL_MODULE_CLOSED_WEIGHT,
                fontSize: 10,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                transition: "color 180ms ease",
              },
            }}
          />
          <ExpandLess
            sx={{
              color: isOpen ? PANEL_MODULE_OPEN_COLOR : SIDEBAR_TEXT_MUTED,
              transform: isOpen ? "rotate(180deg)" : "rotate(90deg)",
              fontSize: isMobile ? 15 : 16,
              transition: `transform ${MODULE_COLLAPSE_MS}ms ease-in-out, color 180ms ease`,
              flexShrink: 0,
            }}
          />
        </ListItem>
        <SidebarModuleCollapse in={isOpen}>
          <List component="div" disablePadding>
            {group.items && group.items.map(renderDeepItem)}
          </List>
        </SidebarModuleCollapse>
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
            backgroundColor: "transparent",
            minHeight: 38,
            display: "flex",
            alignItems: "center",
            width: "100%",
            boxSizing: "border-box",
            padding: "8px 12px",
            transition: PANEL_ITEM_TRANSITION,
            "&:hover": { backgroundColor: PANEL_HOVER_BG },
          }}
        >
          <ListItemText
            primary={item.title}
            sx={{
              margin: 0,
              "& .MuiTypography-root": {
                color: isOpen ? PANEL_MODULE_OPEN_COLOR : SIDEBAR_TEXT_MUTED,
                fontWeight: isOpen ? PANEL_MODULE_OPEN_WEIGHT : PANEL_MODULE_CLOSED_WEIGHT,
                fontSize: 10,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                transition: "color 180ms ease",
              },
            }}
          />
          <ExpandLess
            sx={{
              color: isOpen ? PANEL_MODULE_OPEN_COLOR : SIDEBAR_TEXT_MUTED,
              transform: isOpen ? "rotate(180deg)" : "rotate(90deg)",
              fontSize: isMobile ? 14 : 16,
              transition: `transform ${MODULE_COLLAPSE_MS}ms ease-in-out, color 180ms ease`,
              flexShrink: 0,
            }}
          />
        </ListItem>
        <SidebarModuleCollapse in={isOpen}>
          <List component="div" disablePadding>
            {item.subGroups && item.subGroups.map(renderSubGroup)}
          </List>
        </SidebarModuleCollapse>
      </React.Fragment>
    );
  };

  // LEVEL 1 — simple nav item
  const renderSimpleItem = (item) => {
    const active = isActive(item.path);
    return (
      <ListItem
        key={item.id}
        component="div"
        className="sidebar-subnav-link"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleNavigation(item.path);
        }}
        sx={{
          position: "relative",
          cursor: "pointer",
          backgroundColor: active ? SUBMENU_ACTIVE_BG : "transparent",
          borderLeft: "none",
          margin: "1px 0",
          minHeight: 36,
          display: "flex",
          alignItems: "center",
          width: "100%",
          boxSizing: "border-box",
          padding: "8px 12px 8px 14px",
          transition: PANEL_ITEM_TRANSITION,
          ...panelActiveAccent(active),
          "&:hover": {
            backgroundColor: active ? SUBMENU_ACTIVE_BG : PANEL_HOVER_BG,
          },
        }}
      >
        <ListItemText
          primary={item.title}
          sx={{
            margin: 0,
            "& .MuiTypography-root": {
              color: active ? SIDEBAR_TEXT_ICON_ACTIVE : SIDEBAR_TEXT_MUTED,
              fontWeight: active ? 600 : 500,
              fontSize: isMobile ? 12 : 13,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              transition: "color 180ms ease",
            },
          }}
        />
      </ListItem>
    );
  };

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
        className={`sidebar-rail-item${isCurrentActive ? " is-active" : ""}`}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleMainItemClick(section);
        }}
        sx={{
          cursor: "pointer",
          position: "relative",
          backgroundColor: isCurrentActive ? SUBMENU_ACTIVE_BG : "transparent",
          borderLeft: "none",
          borderRadius: 0,
          margin: "1px 0",
          width: "100%",
          minHeight: isMobile ? 46 : isTablet ? 50 : 54,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          padding: isMobile ? "8px 4px" : "10px 6px",
          transition: RAIL_ITEM_TRANSITION,
          ...(isCurrentActive && {
            "&::before": {
              content: '""',
              position: "absolute",
              left: 0,
              top: "50%",
              transform: "translateY(-50%)",
              width: 3,
              height: "48%",
              backgroundColor: SIDEBAR_ACCENT,
              borderRadius: "0 3px 3px 0",
              boxShadow: `0 0 8px ${SIDEBAR_ACCENT}66`,
            },
          }),
          "&:hover": {
            backgroundColor: isCurrentActive ? SUBMENU_ACTIVE_BG : SIDEBAR_HOVER_BG,
          },
          "&:focus-visible": {
            outline: `2px solid ${SIDEBAR_ACCENT}`,
            outlineOffset: -2,
          },
        }}
        title={section.title}
      >
        <ListItemIcon
          sx={{
            minWidth: 0,
            marginBottom: isMobile ? 0 : 0.25,
            transition: "color 180ms ease",
          }}
        >
          <IconComponent
            sx={{
              color: isCurrentActive ? SIDEBAR_TEXT_ICON_ACTIVE : SIDEBAR_TEXT_MUTED,
              fontSize: isMobile ? 19 : isTablet ? 20 : 21,
              transition: "color 180ms ease",
            }}
          />
        </ListItemIcon>
        {!isMobile && (
          <ListItemText
            primary={section.title}
            sx={{
              textAlign: "center",
              margin: 0,
              "& .MuiTypography-root": {
                color: isCurrentActive ? SIDEBAR_TEXT_ACTIVE : SIDEBAR_TEXT_MUTED,
                fontWeight: isCurrentActive ? 700 : 500,
                fontSize: isTablet ? 10.5 : 11,
                lineHeight: 1.25,
                letterSpacing: "0.02em",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                maxWidth: LEFT_W - 10,
                transition: "color 180ms ease, font-weight 180ms ease",
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

  const sidebarPanelWidth = LEFT_W + RIGHT_W;
  const sidebarLeft = isMobile
    ? sidebarOpen
      ? 0
      : `-${sidebarPanelWidth}px`
    : 0;
  const sidebarWidth = sidebarPanelWidth;

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

      {/* Full-height sidebar backdrop */}
      <div
        aria-hidden
        style={{
          position: "fixed",
          top: `${navbarHeight}px`,
          left: isMobile ? sidebarLeft : 0,
          width: sidebarWidth,
          height: `calc(100vh - ${navbarHeight}px)`,
          background: SIDEBAR_RAIL_BG,
          zIndex: 39,
          pointerEvents: "none",
          transition: isMobile ? "left 0.3s ease" : "none",
        }}
      />

      {/* Sidebar wrapper */}
      <div
        style={{
          position: "fixed",
          top: `${navbarHeight}px`,
          left: sidebarLeft,
          height: `calc(100vh - ${navbarHeight}px)`,
          display: "flex",
          flexDirection: "row",
          width: sidebarWidth,
          zIndex: 40,
          borderTop: `1px solid ${SIDEBAR_BORDER}`,
          transition: isMobile ? "left 0.3s ease" : "width 0.2s ease",
          overscrollBehavior: "contain",
          overflow: "hidden",
        }}
      >
        {/* LEFT MENU */}
        <div
          ref={mainMenuRef}
          className="sidebar-rail"
          onMouseEnter={() => setScrollTarget("main")}
          style={{
            minWidth: LEFT_W,
            width: LEFT_W,
            height: "100%",
            flexShrink: 0,
            background: SIDEBAR_RAIL_BG,
            overflowY: "auto",
            overflowX: "hidden",
            WebkitOverflowScrolling: "touch",
          }}
        >
          <List sx={{ py: 0.75, px: 0 }}>
            {sidebarSections.map(renderSidebarSection)}
          </List>
        </div>

        {/* RIGHT MENU — always open on desktop; click switches section (mobile: when active) */}
        {activeSection != null && (
          <div
            ref={subMenuRef}
            className="sidebar-submenu-panel sidebar-slim-scrollbar"
            style={{
              width: RIGHT_W,
              height: "100%",
              flex: "0 0 auto",
              minWidth: 0,
              background: SIDEBAR_PANEL_BG,
              overflowY: "auto",
              overflowX: "hidden",
              WebkitOverflowScrolling: "touch",
            }}
          >
            <List sx={{ py: 0 }}>{renderSubmenu()}</List>
          </div>
        )}
      </div>

      <style>{`
        .sidebar-module-collapse {
          transform-origin: top center;
        }

        .sidebar-module-collapse-inner {
          transform-origin: top center;
          overflow: hidden;
        }

        /* Open: top → bottom */
        .sidebar-module-collapse.MuiCollapse-entering .sidebar-module-collapse-inner {
          animation: sidebarModuleOpen ${MODULE_COLLAPSE_MS}ms ease-in-out forwards;
        }

        .sidebar-module-collapse.MuiCollapse-entered .sidebar-module-collapse-inner {
          opacity: 1;
          transform: translateY(0);
        }

        /* Close: bottom → top */
        .sidebar-module-collapse.MuiCollapse-exiting .sidebar-module-collapse-inner {
          animation: sidebarModuleClose ${MODULE_COLLAPSE_MS}ms ease-in-out forwards;
        }

        @keyframes sidebarModuleOpen {
          from {
            opacity: 0;
            transform: translateY(-12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes sidebarModuleClose {
          from {
            opacity: 1;
            transform: translateY(0);
          }
          to {
            opacity: 0;
            transform: translateY(-12px);
          }
        }
      `}</style>
    </>
  );
};

export default Sidebar;
