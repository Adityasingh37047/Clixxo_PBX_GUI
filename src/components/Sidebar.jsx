// components / Sidebar.jsx

import React, { useMemo, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { canAccessLicence } from '../constants/authAccess';
import { List, ListItem, ListItemIcon, ListItemText, Collapse } from '@mui/material';
import ExpandLess from '@mui/icons-material/ExpandLess';
import { SIDEBAR_SECTIONS } from '../constants/sidebarConstants';

const Sidebar = ({
  isMobile = false,
  sidebarOpen = false,
  setSidebarOpen = () => { },
  navbarHeight = 85
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  // Filter sections
  const sidebarSections = useMemo(() => {
    return SIDEBAR_SECTIONS.map((section) => {
      if (section.id === 'maintenance' && Array.isArray(section.submenuItems)) {
        return {
          ...section,
          submenuItems: section.submenuItems.map((submenuItem) => {
            if (submenuItem.id === 'systemTools' && Array.isArray(submenuItem.items)) {
              return {
                ...submenuItem,
                items: submenuItem.items.filter((item) => {
                  if (item.id === 'licence') return canAccessLicence(user);
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

  // State management
  const [activeSection, setActiveSection] = useState("status");
  const [openItems, setOpenItems] = useState({});
  const [scrollTarget, setScrollTarget] = useState("submenu");

  const mainMenuRef = useRef(null);
  const subMenuRef = useRef(null);

  // Navigation handler
  const handleNavigation = (path) => {
    if (path) {
      if (location.pathname === path) {
        navigate(path, { replace: true, state: { refresh: Date.now() } });
      } else {
        navigate(path);
      }
      // Close sidebar on mobile after navigation
      if (isMobile) {
        setSidebarOpen(false);
      }
    }
  };

  // Toggle open/close state for items
  const handleToggle = (id) => {
    setOpenItems(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Check if current path is active
  const isActive = (path) => location.pathname === path;

  // ============================================
  // RENDER FUNCTIONS - 4 LEVELS OF NESTING
  // ============================================

  // LEVEL 4: Deepest items
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
        cursor: 'pointer',
        backgroundColor: isActive(item.path) ? '#1a3a5c' : '#f2f4f7',
        borderBottom: '1px solid #ced2d9',
        minHeight: 28,
        display: 'flex',
        alignItems: 'center',
        width: '100%',
        boxSizing: 'border-box',
        padding: '3px 8px 3px 20px',
        transition: 'background-color 0.15s ease',
        '&:hover': {
          backgroundColor: isActive(item.path) ? '#1a3a5c' : '#d4d8e0',
        },
      }}
    >
      <ListItemIcon sx={{ minWidth: 0, mr: 1, flexShrink: 0 }}>
        <div style={{ width: 2, height: 10, borderRadius: 1, backgroundColor: isActive(item.path) ? '#60a5fa' : '#9ca3af' }} />
      </ListItemIcon>
      <ListItemText
        primary={item.title}
        sx={{
          m: 0,
          '& .MuiTypography-root': {
            color: isActive(item.path) ? '#ffffff' : '#1e293b',
            fontWeight: isActive(item.path) ? 600 : 500,
            fontSize: 11,
            lineHeight: 1.3,
            whiteSpace: 'normal',
            wordBreak: 'break-word',
          }
        }}
      />
    </ListItem>
  );

  // LEVEL 3: Subgroup header with collapse


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
            // Close all other subgroups at this level, open/close this one
            setOpenItems(prev => {
              const newState = { ...prev };
              // Close all items
              Object.keys(newState).forEach(key => {
                newState[key] = false;
              });
              // Open only this one
              newState[group.id] = !isOpen;
              return newState;
            });
          }}
          sx={{
            cursor: 'pointer',
            backgroundColor: '#d5dae3',
            borderBottom: '1px solid #bfc4cc',
            minHeight: 30,
            display: 'flex',
            alignItems: 'center',
            padding: '4px 8px 4px 10px',
            width: '100%',
            boxSizing: 'border-box',
            transition: 'background-color 0.15s ease',
            '&:hover': { backgroundColor: '#c8cdd6' },
          }}
        >
          <ListItemIcon sx={{ minWidth: 0, marginRight: 1 }}>
            <IconComponent sx={{ color: '#2563eb', fontSize: 14 }} />
          </ListItemIcon>
          <ListItemText
            primary={group.title}
            sx={{
              m: 0,
              '& .MuiTypography-root': {
                color: '#1e293b',
                fontWeight: 700,
                fontSize: 12,
                lineHeight: 1.3,
              }
            }}
          />
          <ExpandLess
            sx={{
              color: '#4b5563',
              transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
              fontSize: 16,
              transition: 'transform 0.2s ease',
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

  // LEVEL 2: Group items with collapse
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
            cursor: 'pointer',
            backgroundColor: '#d5dae3',
            borderBottom: '1px solid #bfc4cc',
            minHeight: 30,
            display: 'flex',
            alignItems: 'center',
            width: '100%',
            boxSizing: 'border-box',
            padding: '4px 8px 4px 10px',
            transition: 'background-color 0.15s ease',
            '&:hover': { backgroundColor: '#c8cdd6' },
          }}
        >
          <ListItemIcon sx={{ minWidth: 0, marginRight: 1, flexShrink: 0 }}>
            <div style={{ width: 2, height: 12, borderRadius: 1, backgroundColor: '#2563eb' }} />
          </ListItemIcon>
          <ListItemText
            primary={item.title}
            sx={{
              m: 0,
              '& .MuiTypography-root': {
                color: '#1e293b',
                fontWeight: 700,
                fontSize: 12,
                lineHeight: 1.3,
              }
            }}
          />
          <ExpandLess
            sx={{
              color: '#4b5563',
              transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
              fontSize: 16,
              transition: 'transform 0.2s ease',
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

  // LEVEL 1: Simple submenu items
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
        cursor: 'pointer',
        backgroundColor: isActive(item.path) ? '#1a3a5c' : 'transparent',
        borderBottom: '1px solid #ced2d9',
        minHeight: 30,
        display: 'flex',
        alignItems: 'center',
        width: '100%',
        boxSizing: 'border-box',
        padding: '3px 10px 3px 12px',
        transition: 'background-color 0.15s ease',
        '&:hover': {
          backgroundColor: isActive(item.path) ? '#1a3a5c' : '#d4d8e0',
        },
      }}
    >
      <ListItemIcon sx={{ minWidth: 0, mr: 1, flexShrink: 0 }}>
        <div style={{ width: 2, height: 12, borderRadius: 1, backgroundColor: isActive(item.path) ? '#60a5fa' : '#9ca3af' }} />
      </ListItemIcon>
      <ListItemText
        primary={item.title}
        sx={{
          m: 0,
          '& .MuiTypography-root': {
            color: isActive(item.path) ? '#ffffff' : '#1e293b',
            fontWeight: isActive(item.path) ? 600 : 500,
            fontSize: 12,
            lineHeight: 1.3,
            whiteSpace: 'normal',
            wordBreak: 'break-word',
          }
        }}
      />
    </ListItem>
  );

  // Smart router - decides which render function to call based on item structure
  const renderSubmenuItems = (submenuItems) => {
    return submenuItems.map((item) => {
      // Has isGroup + subGroups (Level 2 groups)
      if (item.isGroup && item.subGroups) {
        return renderGroupItem(item);
      }
      // Has items array + icon (Level 2 subgroups)
      if (item.items && item.icon) {
        return renderSubGroup(item);
      }
      // Simple direct item (Level 1)
      return renderSimpleItem(item);
    });
  };

  // Main sidebar section header (Status, CDR, PBX, etc. - left menu)
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
          setActiveSection(section.id);
          if (!section.hasSubmenu) {
            handleNavigation(section.path);
          }
        }}
        sx={{
          cursor: 'pointer',
          backgroundColor: isCurrentActive ? '#1a2f4a' : 'transparent',
          borderBottom: '1px solid #1e2d42',
          minHeight: 44,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '6px 4px',
          transition: 'background-color 0.15s ease',
          '&:hover': {
            backgroundColor: isCurrentActive ? '#1a2f4a' : '#3a5070',
          }
        }}
        title={section.title}
      >
        <ListItemIcon sx={{ minWidth: 0, mb: 0.25 }}>
          <IconComponent sx={{ color: isCurrentActive ? '#60a5fa' : '#93c5fd', fontSize: 20 }} />
        </ListItemIcon>
        <ListItemText
          primary={section.title}
          sx={{
            textAlign: 'center',
            m: 0,
            '& .MuiTypography-root': {
              color: isCurrentActive ? '#ffffff' : '#cbd5e1',
              fontWeight: 700,
              fontSize: 10,
              lineHeight: 1.2,
              whiteSpace: 'nowrap',
            },
          }}
        />
      </ListItem>
    );
  };

  // Get current submenu items to display on right
  const renderSubmenu = () => {
    const section = sidebarSections.find((s) => s.id === activeSection);
    if (!section || !section.submenuItems) return null;

    return renderSubmenuItems(section.submenuItems);
  };

  // Shared scrollbar handler
  const handleScroll = (e) => {
    const scrollTop = e.target.scrollTop;
    if (scrollTarget === "main" && mainMenuRef.current) {
      mainMenuRef.current.scrollTop = scrollTop;
    }
    if (scrollTarget === "submenu" && subMenuRef.current) {
      subMenuRef.current.scrollTop = scrollTop;
    }
  };

  const LEFT_W = isMobile ? 62 : 72;
  const RIGHT_W = isMobile ? 178 : 178;
  const TOTAL_W = LEFT_W + RIGHT_W;

  return (
    <>
      {/* Mobile Overlay */}
      {isMobile && sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed', top: 0, left: 0,
            width: '100%', height: '100%',
            backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 39,
          }}
        />
      )}

      {/* Sidebar Container */}
      <div
        style={{
          position: 'fixed',
          top: `${navbarHeight}px`,
          left: isMobile ? (sidebarOpen ? 0 : `-${TOTAL_W}px`) : 0,
          height: `calc(100vh - ${navbarHeight}px)`,
          display: 'flex',
          flexDirection: 'row',
          width: TOTAL_W,
          zIndex: 40,
          transition: isMobile ? 'left 0.3s ease' : 'none',
          boxShadow: '2px 0 6px rgba(0,0,0,0.08)',
        }}
      >
        {/* LEFT MENU */}
        <div
          ref={mainMenuRef}
          onMouseEnter={() => setScrollTarget('main')}
          style={{
            width: LEFT_W,
            flexShrink: 0,
            background: '#2c3e5c',
            borderRight: '1px solid #1e2d42',
            overflowY: 'auto',
            overflowX: 'hidden',
            scrollbarWidth: 'thin',
          }}
        >
          <List sx={{ py: 0 }}>
            {sidebarSections.map(renderSidebarSection)}
          </List>
        </div>

        {/* RIGHT MENU */}
        <div
          ref={subMenuRef}
          onMouseEnter={() => setScrollTarget('submenu')}
          style={{
            width: RIGHT_W,
            flexShrink: 0,
            background: '#edf0f4',
            borderRight: '1px solid #c4c8cf',
            overflowY: 'auto',
            overflowX: 'hidden',
            scrollbarWidth: 'thin',
          }}
        >
          <List sx={{ py: 0 }}>
            {renderSubmenu()}
          </List>
        </div>
      </div>
    </>
  );
};

export default Sidebar;