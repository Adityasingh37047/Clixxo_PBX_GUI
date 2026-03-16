// components/Sidebar.jsx (updated with simple modern design)
import React, { useState } from 'react';
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
  
  const [openSections, setOpenSections] = useState({
    operationInfo: false,
    sip: false,
    pcm: false,
    isdn: false,
    fax: false,
    route: false,
    numberFilter: false,
    manipulate: false,
    vpn: false,
    dhcp: false,
    systemTools: false
  });

  const handleToggle = (section) => {
    setOpenSections(prev => {
      const newState = Object.keys(prev).reduce((acc, key) => {
        acc[key] = false;
        return acc;
      }, {});
      newState[section] = !prev[section];
      return newState;
    });
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

  const renderSubmenuItems = (submenuItems) => {
    return submenuItems.map((item) => (
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
    ));
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
