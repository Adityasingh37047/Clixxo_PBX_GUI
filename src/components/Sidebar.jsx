// components/Sidebar.jsx (updated with simple modern design)
import React, { useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Drawer, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText, 
  Collapse 
} from '@mui/material';
import ExpandLess from '@mui/icons-material/ExpandLess';
import { SIDEBAR_SECTIONS } from '../constants/sidebarConstants';

const Sidebar = ({ isMobile, sidebarOpen, setSidebarOpen, navbarHeight = 85 }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const initialOpenSections = useMemo(() => {
    return SIDEBAR_SECTIONS.reduce((acc, section) => {
      acc[section.id] = false;
      return acc;
    }, {});
  }, []);

  const [openSections, setOpenSections] = useState(initialOpenSections);
  // Tracks open state for group items (level 2) and sub-groups (level 3)
  const [openItems, setOpenItems] = useState({});

  const handleToggle = (section) => {
    setOpenSections(prev => {
      const newState = Object.keys(initialOpenSections).reduce((acc, key) => {
        acc[key] = false;
        return acc;
      }, {});
      newState[section] = !prev[section];
      return newState;
    });
  };

  const handleItemToggle = (id) => {
    setOpenItems(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleNavigation = (path) => {
    if (path) {
      // If clicking on the same route, trigger a refresh by navigating with a refresh state
      if (location.pathname === path) {
        navigate(path, { 
          replace: true, 
          state: { refresh: Date.now() } 
        });
        return;
      }
      // Otherwise, navigate normally
      navigate(path);
      if (isMobile) {
        setSidebarOpen(false); // Close sidebar on mobile after navigation
      }
    }
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  // Nested under PBX/FXS-style groups: slightly lighter than subgroup headers
  const nestedRowBg = '#e9eaee';
  const nestedRowBgActive = '#000000';

  const renderDeepItem = (item) => (
    <ListItem
      key={item.id}
      component="div"
      sx={{
        cursor: 'pointer',
        backgroundColor: isActive(item.path) ? nestedRowBgActive : nestedRowBg,
        borderBottom: '1px solid #c0c4c8',
        borderTop: '1px solid rgba(255,255,255,0.8)',
        minHeight: '28px',
        display: 'flex',
        alignItems: 'center',
        width: '100%',
        boxSizing: 'border-box',
        padding: '2px 8px 2px 24px',
      }}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        handleNavigation(item.path);
      }}
    >
      <ListItemIcon sx={{ minWidth: 0, marginRight: 1 }}>
        <div
          style={{
            width: '1px',
            height: '12px',
            backgroundColor: isActive(item.path) ? '#ffffff' : '#d1d5db',
          }}
        />
      </ListItemIcon>
      <ListItemText
        primary={item.title}
        sx={{
          '& .MuiTypography-root': {
            color: isActive(item.path) ? '#ffffff' : '#374151',
            fontWeight: isActive(item.path) ? 600 : 500,
            fontSize: 13,
          }
        }}
      />
    </ListItem>
  );

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
            handleItemToggle(group.id);
          }}
          sx={{
            cursor: 'pointer',
            // Subgroup title row: a touch darker than nested links (same for all groups)
            backgroundColor: '#d6dae1',
            borderBottom: '1px solid #c0c4c8',
            borderTop: '1px solid rgba(255,255,255,0.8)',
            minHeight: '28px',
            display: 'flex',
            alignItems: 'center',
            padding: '2px 8px 2px 16px',
            width: '100%',
            boxSizing: 'border-box',
          }}
        >
          <ListItemIcon sx={{ minWidth: 0, marginRight: 1 }}>
            <IconComponent sx={{ color: '#3b82f6', fontSize: 16 }} />
          </ListItemIcon>
          <ListItemText
            primary={group.title}
            sx={{
              '& .MuiTypography-root': {
                color: '#374151',
                fontWeight: 700,
                fontSize: 13,
              }
            }}
          />
          <ExpandLess
            sx={{
              color: '#6b7280',
              transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
              fontSize: 16,
              transition: 'transform 0.2s',
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

  const renderGroupItem = (item) => {
    const isOpen = openItems[item.id] || false;

    return (
      <React.Fragment key={item.id}>
        <ListItem
          component="div"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleItemToggle(item.id);
          }}
          sx={{
            cursor: 'pointer',
            backgroundColor: '#e0e3e7',
            borderBottom: '1px solid #c0c4c8',
            borderTop: '1px solid rgba(255,255,255,0.8)',
            minHeight: '28px',
            display: 'flex',
            alignItems: 'center',
            width: '100%',
            boxSizing: 'border-box',
            padding: '2px 8px',
          }}
        >
          <ListItemIcon sx={{ minWidth: 0, marginRight: 1 }}>
            <div style={{ width: '1px', height: '12px', backgroundColor: '#d1d5db' }} />
          </ListItemIcon>
          <ListItemText
            primary={item.title}
            sx={{
              '& .MuiTypography-root': {
                color: '#374151',
                fontWeight: 700,
                fontSize: 13,
              }
            }}
          />
          <ExpandLess
            sx={{
              color: '#6b7280',
              transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
              fontSize: 16,
              transition: 'transform 0.2s',
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

  const renderSubmenuItems = (submenuItems) => {
    return submenuItems.map((item) => {
      if (item.isGroup && item.subGroups) {
        return renderGroupItem(item);
      }
      if (item.items && item.icon) {
        return renderSubGroup(item);
      }
      return (
        <ListItem 
          key={item.id}
          component="div"
          sx={{ 
            cursor: 'pointer', 
            pl: 2,
            pr: 1,
            backgroundColor: isActive(item.path) ? '#000000' : '#e0e3e7',
            borderBottom: '1px solid #c0c4c8',
            borderTop: '1px solid rgba(255,255,255,0.8)', 
            minHeight: '28px',
            display: 'flex',
            alignItems: 'center',
            width: '100%',
            boxSizing: 'border-box', 
            padding: '2px 8px',
          }}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleNavigation(item.path);
          }}
        >
          <ListItemIcon sx={{ minWidth: 0, marginRight: 1 }}>
            <div 
              style={{
                width: '1px',
                height: '12px',
                backgroundColor: isActive(item.path) ? '#ffffff' : '#d1d5db',
              }}
            />
          </ListItemIcon>
          <ListItemText 
            primary={item.title}
            sx={{
              '& .MuiTypography-root': {
                color: isActive(item.path) ? '#ffffff' : '#374151',
                fontWeight: isActive(item.path) ? 600 : 500,
                fontSize: 13,
              }
            }}
          />
        </ListItem>
      );
    });
  };

  const renderSidebarSection = (section) => {
    const IconComponent = section.icon;
    // Check if this section has an active submenu item
    const hasActiveSubmenu = section.hasSubmenu && 
      section.submenuItems && 
      section.submenuItems.some(item => isActive(item.path));
    
    // Main section should only be highlighted if it's directly active (NOT for submenu items)
    const isCurrentActive = isActive(section.path);
    
    return (
      <React.Fragment key={section.id}>
        <ListItem 
          component="div"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (section.hasSubmenu) {
              handleToggle(section.id);
            } else {
              handleNavigation(section.path);
            }
          }}
          sx={{
            cursor: 'pointer',
            backgroundColor: '#e0e3e7',
            borderBottom: '1px solid #c0c4c8',
            minHeight: '32px',
            display: 'flex',
            alignItems: 'center',
            padding: '4px 8px',
          }}
        >
          <ListItemIcon sx={{ minWidth: 0, marginRight: 1 }}>
            <IconComponent 
              sx={{ 
                color: '#3b82f6',
                fontSize: 18,
              }} 
            />
          </ListItemIcon>
          <ListItemText 
            primary={section.title}
            sx={{
              '& .MuiTypography-root': {
                color: '#374151',
                fontWeight: 700,
                fontSize: 14,
              }
            }}
          />
          {section.hasSubmenu && (
            <ExpandLess 
              sx={{ 
                color: '#6b7280',
                transform: openSections[section.id] ? 'rotate(180deg)' : 'rotate(0deg)',
                fontSize: 16,
              }} 
            />
          )}
        </ListItem>
        
        {section.hasSubmenu && (
          <Collapse in={openSections[section.id]} timeout={200} unmountOnExit>
            <List component="div" disablePadding>
              {renderSubmenuItems(section.submenuItems)}
            </List>
          </Collapse>
        )}
      </React.Fragment>
    );
  };

  return (
    <Drawer
      variant={isMobile ? "temporary" : "permanent"}
      anchor="left"
      open={isMobile ? sidebarOpen : true}
      onClose={() => setSidebarOpen(false)}
      sx={{
        width: 180,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: 180,
          boxSizing: 'border-box',
          top: `${navbarHeight + 1}px`, // Dynamic alignment with navbar height + 1px buffer
          height: `calc(100vh - ${navbarHeight + 1}px)`, // Dynamic height calculation with buffer
          background: '#dde0e4', // Solid background to match main content area
          borderRight: '1px solid #e5e7eb',
          position: 'fixed',
          zIndex: isMobile ? 45 : 30, // Higher z-index on mobile (above overlay at 35, below navbar at 50)
          marginTop: 0, // Remove margin to prevent overlap
          borderTop: 'none', // Remove the light gray border
        },
      }}
    >
      <div role="presentation" className="h-full">
        <List className="py-0">
          {SIDEBAR_SECTIONS.map(renderSidebarSection)}
        </List>
      </div>
    </Drawer>
  );
};

export default Sidebar;
