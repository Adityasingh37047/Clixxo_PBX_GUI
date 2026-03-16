import React, { useEffect, useState } from 'react';
import LOGO from "../assets/AfterLoginLogo2.png";
import TOP_GIF from "../assets/top2.gif";
import PowerSettingsNewIcon from '@mui/icons-material/PowerSettingsNew';
import MenuIcon from '@mui/icons-material/Menu';
import { IconButton } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { postLinuxCmd } from '../api/apiService';

const Navbar = ({ isMobile, sidebarOpen, setSidebarOpen }) => {
  const [dateTime, setDateTime] = useState(new Date());
  const [serverDateTime, setServerDateTime] = useState(null);
  const [useServerTime, setUseServerTime] = useState(true);
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  // Fetch server time on component mount
  useEffect(() => {
    const fetchServerTime = async () => {
      try {
        // Get current system date and time from server
        const response = await postLinuxCmd({ cmd: 'date "+%Y-%m-%d %H:%M:%S"' });
        
        if (response.response && response.responseData) {
          const serverTimeStr = response.responseData.trim();
          const serverDate = new Date(serverTimeStr);
          
          if (!isNaN(serverDate.getTime())) {
            setServerDateTime(serverDate);
            console.log('📡 Server time fetched:', serverTimeStr);
          } else {
            console.warn('⚠️ Invalid server time, using browser time');
            setUseServerTime(false);
          }
        }
      } catch (error) {
        console.warn('⚠️ Could not fetch server time, using browser time:', error);
        setUseServerTime(false);
      }
    };
    
    fetchServerTime();
    
    // Refetch server time every 30 seconds to stay in sync
    const refetchInterval = setInterval(fetchServerTime, 30000);
    
    return () => clearInterval(refetchInterval);
  }, []);

  // Update displayed time every second
  useEffect(() => {
    const timer = setInterval(() => {
      if (useServerTime && serverDateTime) {
        // Increment server time by 1 second
        setServerDateTime(prev => new Date(prev.getTime() + 1000));
      } else {
        // Use browser time
        setDateTime(new Date());
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [useServerTime, serverDateTime]);

  // Only show time once server time is fetched
  let formattedDate = '';
  let formattedTime = '';
  
  if (serverDateTime) {
    formattedDate = serverDateTime.toLocaleDateString('en-GB', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });
    formattedTime = serverDateTime.toLocaleTimeString('en-GB', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit',
      hour12: false 
    });
  }

  const handleLogout = () => {
    // Show confirmation dialog
    const confirmed = window.confirm('Are you sure you want to logout?');
    
    if (confirmed) {
      logout();
      navigate('/login');
    }
  };

  return (
    <div className="fixed w-full z-50">
      {/* Logo Row */}
      <div className="flex items-center justify-between overflow-hidden" style={{ height: 45, backgroundColor: '#2a2a2a' }}>
        <div className="flex items-center gap-2">
          {/* Hamburger Menu Button for Mobile */}
          {isMobile && (
            <IconButton
              onClick={() => setSidebarOpen(!sidebarOpen)}
              sx={{
                color: 'white',
                ml: 1,
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                },
              }}
            >
              <MenuIcon />
            </IconButton>
          )}
          <img
            src={LOGO}
            className="h-24 w-auto cursor-pointer transition-transform hover:scale-105"
            alt="Logo"
            onClick={() => navigate("/")}
            style={{ maxWidth: '180px', objectFit: 'contain' }}
          />
        </div>
        <img
          src={TOP_GIF}
          className="h-16 w-auto"
          alt="Animated bars"
          style={{
            marginRight: '-15px', 
            objectFit: 'contain'
          }}
        />
      </div>
      {/* Info Row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-black min-h-[36px] py-1 bg-[#EAF0F6] px-3 sm:px-6 gap-2">
        <div className="flex flex-row gap-2 text-sm">
          {serverDateTime ? (
            <>
              <div>{formattedDate}</div>
              <div>{formattedTime}</div>
            </>
          ) : (
            <div className="text-gray-400">Loading time...</div>
          )}
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
          <p className="text-red-500 text-xs hidden sm:block">
            Web SSH Ftp Telnet exist the risk, please close or set the whitelist address
          </p>
          <p className="text-red-500 text-xs sm:hidden">
            Web SSH Ftp Telnet risk - set whitelist
          </p>
          <div className="text-sm">
            Current User: <span className="font-bold text-purple-500">{user?.username || 'admin'}</span>
          </div>
          <button
            onClick={handleLogout}
            className="clixxo-logout-btn group flex items-center bg-gray-300 text-black text-xs sm:text-sm px-2 sm:px-3 py-1 border-2 border-gray-500 rounded-full shadow transition-all font-medium gap-1 sm:gap-2 outline-none min-w-[60px] sm:min-w-[80px] cursor-pointer"
            style={{ boxShadow: '0 2px 4px rgba(0,0,0,0.08)' }}
          >
            <span className="transition-colors">Logout</span>
            <PowerSettingsNewIcon className="power-icon" style={{ fontSize: 16, color: '#6b7280', transition: 'all 0.3s ease' }} />
          </button>
        </div>
      </div>
      {/* Custom Button Styles */}
      <style jsx="true">{`
        .clixxo-logout-btn:hover {
          background: #e5e7eb !important;
          border-color: #3b82f6 !important;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15) !important;
          transform: translateY(-1px) !important;
        }
        .clixxo-logout-btn:hover .power-icon {
          color: #3b82f6 !important;
          transform: scale(1.1) rotate(5deg) !important;
        }
        .clixxo-logout-btn:hover span {
          color: #1f2937 !important;
        }
      `}</style>
    </div>
  );
};

export default Navbar;

