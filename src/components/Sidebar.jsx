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

const SIDEBAR_ACCENT = "#3B6FE8";
const SIDEBAR_RAIL_BG = "#1a2332";
const SIDEBAR_BORDER = "#243044";
const SIDEBAR_TEXT_MUTED = "#94a3b8";
const SIDEBAR_TEXT_ACTIVE = "#dbeafe";
const SIDEBAR_TEXT_ICON_ACTIVE = "#93c5fd";
const SIDEBAR_HOVER_BG = "#243044";
const SUBMENU_ACTIVE_BG = "rgba(59, 111, 232, 0.16)";

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

  // Desktop: right submenu always open (clicked section, else default)
  const activeSection = isMobile
    ? activeMenu
    : (activeMenu ?? defaultOpenSectionId);

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
          cursor: "pointer",
          backgroundColor: active ? SUBMENU_ACTIVE_BG : "transparent",
          borderLeft: active
            ? `3px solid ${SIDEBAR_ACCENT}`
            : "3px solid transparent",
          minHeight: 34,
          display: "flex",
          alignItems: "center",
          width: "100%",
          boxSizing: "border-box",
          padding: "7px 12px 7px 16px",
          transition:
            "background 0.12s ease, color 0.12s ease, padding-left 0.12s ease, border-left-color 0.12s ease",
          "&:hover": {
            backgroundColor: active ? SUBMENU_ACTIVE_BG : SIDEBAR_HOVER_BG,
            paddingLeft: active ? "16px" : "18px",
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
    const hasActiveChild = group.items?.some((item) => isActive(item.path));
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
            borderBottom: `1px solid ${SIDEBAR_BORDER}`,
            minHeight: 38,
            display: "flex",
            alignItems: "center",
            padding: "8px 12px",
            width: "100%",
            boxSizing: "border-box",
            transition: "background 0.12s ease",
            "&:hover": { backgroundColor: SIDEBAR_HOVER_BG },
          }}
        >
          <ListItemText
            primary={group.title}
            sx={{
              margin: 0,
              "& .MuiTypography-root": {
                color: hasActiveChild
                  ? SIDEBAR_TEXT_ACTIVE
                  : SIDEBAR_TEXT_MUTED,
                fontWeight: 700,
                fontSize: 10,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              },
            }}
          />
          <ExpandLess
            sx={{
              color: SIDEBAR_TEXT_MUTED,
              transform: isOpen ? "rotate(180deg)" : "rotate(90deg)",
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
            backgroundColor: "transparent",
            borderBottom: `1px solid ${SIDEBAR_BORDER}`,
            minHeight: 38,
            display: "flex",
            alignItems: "center",
            width: "100%",
            boxSizing: "border-box",
            padding: "8px 12px",
            transition: "background 0.12s ease",
            "&:hover": { backgroundColor: SIDEBAR_HOVER_BG },
          }}
        >
          <ListItemText
            primary={item.title}
            sx={{
              margin: 0,
              "& .MuiTypography-root": {
                color: SIDEBAR_TEXT_MUTED,
                fontWeight: 700,
                fontSize: 10,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              },
            }}
          />
          <ExpandLess
            sx={{
              color: SIDEBAR_TEXT_MUTED,
              transform: isOpen ? "rotate(180deg)" : "rotate(90deg)",
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
          cursor: "pointer",
          backgroundColor: active ? SUBMENU_ACTIVE_BG : "transparent",
          borderBottom: `1px solid ${SIDEBAR_BORDER}`,
          borderLeft: active
            ? `3px solid ${SIDEBAR_ACCENT}`
            : "3px solid transparent",
          minHeight: 34,
          display: "flex",
          alignItems: "center",
          width: "100%",
          boxSizing: "border-box",
          padding: "7px 12px",
          transition:
            "background 0.12s ease, color 0.12s ease, padding-left 0.12s ease, border-left-color 0.12s ease",
          "&:hover": {
            backgroundColor: active ? SUBMENU_ACTIVE_BG : SIDEBAR_HOVER_BG,
            paddingLeft: active ? "12px" : "14px",
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
        className="sidebar-rail-item"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleMainItemClick(section);
        }}
        sx={{
          cursor: "pointer",
          position: "relative",
          backgroundColor: isCurrentActive ? SUBMENU_ACTIVE_BG : "transparent",
          borderBottom: `1px solid ${SIDEBAR_BORDER}`,
          borderLeft: isCurrentActive
            ? `3px solid ${SIDEBAR_ACCENT}`
            : "3px solid transparent",
          borderRadius: isCurrentActive ? "10px" : 0,
          margin: isCurrentActive ? "4px 5px" : "0",
          width: isCurrentActive ? "calc(100% - 10px)" : "100%",
          minHeight: isMobile ? "44px" : isTablet ? "48px" : "52px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          padding: isMobile ? "6px 4px" : "10px 6px",
          transition:
            "background 0.13s ease, color 0.13s ease, transform 0.13s ease, border-color 0.13s ease",
          "&:hover": {
            backgroundColor: isCurrentActive
              ? SUBMENU_ACTIVE_BG
              : SIDEBAR_HOVER_BG,
            transform: "scale(1.04)",
          },
          "&:active": {
            transform: "scale(0.96)",
          },
        }}
        title={section.title}
      >
        <ListItemIcon sx={{ minWidth: 0, marginBottom: isMobile ? 0 : -0.5 }}>
          <IconComponent
            sx={{
              color: isCurrentActive
                ? SIDEBAR_TEXT_ICON_ACTIVE
                : SIDEBAR_TEXT_MUTED,
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
                color: isCurrentActive
                  ? SIDEBAR_TEXT_ACTIVE
                  : SIDEBAR_TEXT_MUTED,
                fontWeight: 700,
                fontSize: isTablet ? 10.5 : 11,
                lineHeight: 1.2,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                maxWidth: LEFT_W - 12,
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
    : // activeSection ? LEFT_W + RIGHT_W : LEFT_W;
      LEFT_W + RIGHT_W;

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
          top: `${navbarHeight}px`,
          left: sidebarLeft,
          height: `calc(100vh - ${navbarHeight}px)`,
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
          className="sidebar-rail"
          onMouseEnter={() => setScrollTarget("main")}
          style={{
            minWidth: LEFT_W,
            width: LEFT_W,
            background: SIDEBAR_RAIL_BG,
            borderTop: `1px solid ${SIDEBAR_BORDER}`,
            borderRight: `1px solid ${SIDEBAR_BORDER}`,
            overflowY: "auto",
            overflowX: "hidden",
            WebkitOverflowScrolling: "touch",
          }}
        >
          <List sx={{ py: 0.5 }}>
            {sidebarSections.map(renderSidebarSection)}
          </List>
        </div>

        {/* RIGHT MENU — always open on desktop; click switches section (mobile: when active) */}
        {(isMobile ? activeSection : activeSection != null) && (
          <div
            ref={subMenuRef}
            className="sidebar-submenu-panel"
            style={{
              width: isMobile ? `calc(100vw - ${LEFT_W}px)` : RIGHT_W,
              background: SIDEBAR_RAIL_BG,
              borderTop: `1px solid ${SIDEBAR_BORDER}`,
              borderRight: `1px solid ${SIDEBAR_BORDER}`,
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
