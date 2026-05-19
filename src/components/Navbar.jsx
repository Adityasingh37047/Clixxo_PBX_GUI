import React, { useEffect, useState } from "react";
import LOGO from "../assets/clixxo_white.png";
import TOP_GIF from "../assets/toptip.png";
import PowerSettingsNewIcon from "@mui/icons-material/PowerSettingsNew";
import MenuIcon from "@mui/icons-material/Menu";
import { IconButton } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { postLinuxCmd } from "../api/apiService";

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
        const response = await postLinuxCmd({
          cmd: 'date "+%Y-%m-%d %H:%M:%S"',
        });

        if (response.response && response.responseData) {
          const serverTimeStr = response.responseData.trim();
          const serverDate = new Date(serverTimeStr);

          if (!isNaN(serverDate.getTime())) {
            setServerDateTime(serverDate);
            console.log("📡 Server time fetched:", serverTimeStr);
          } else {
            console.warn("⚠️ Invalid server time, using browser time");
            setUseServerTime(false);
          }
        }
      } catch (error) {
        console.warn(
          "⚠️ Could not fetch server time, using browser time:",
          error,
        );
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
        setServerDateTime((prev) => new Date(prev.getTime() + 1000));
      } else {
        // Use browser time
        setDateTime(new Date());
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [useServerTime, serverDateTime]);

  // Only show time once server time is fetched
  let formattedDate = "";
  let formattedTime = "";

  if (serverDateTime) {
    formattedDate = serverDateTime.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
    formattedTime = serverDateTime.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
  }

  const handleLogout = () => {
    // Show confirmation dialog
    const confirmed = window.confirm("Are you sure you want to logout?");

    if (confirmed) {
      logout();
      navigate("/login");
    }
  };

  return (
    <div className="fixed w-full z-50">
      {/* Logo Row */}
      <div
        className="flex items-center justify-between overflow-hidden"
        style={{
          height: 48,
          backgroundColor: "#1a2332",
          borderBottom: "1px solid #243347",
        }}
      >
        {/* LEFT: hamburger + logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
          {isMobile && (
            <IconButton onClick={() => setSidebarOpen(!sidebarOpen)} sx={{ color: "white", ml: 1, "&:hover": { backgroundColor: "rgba(255,255,255,0.1)" } }}>
              <MenuIcon />
            </IconButton>
          )}
          <img
            src={LOGO}
            className="h-24 w-auto cursor-pointer transition-transform hover:scale-105"
            alt="Logo"
            onClick={() => navigate("/")}
            style={{ maxWidth: "180px", objectFit: "contain" }}
          />
        </div>

        {/* CENTER: datetime — absolutely centered in navbar */}
        <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', color: '#ffffff', display: 'flex', flexDirection: 'row', gap: 8, fontSize: 13, fontWeight: 600, pointerEvents: 'none', whiteSpace: 'nowrap' }}>
          {serverDateTime ? (
            <>
              <span>{formattedDate}</span>
              <span>{formattedTime}</span>
            </>
          ) : (
            <span style={{ color: '#5a7a9a' }}>—</span>
          )}
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
          {/* <p className="text-red-500 text-xs hidden sm:block">
            Web SSH Ftp Telnet exist the risk, please close or set the whitelist address
          </p> */}
          <p className="text-red-500 text-xs sm:hidden">
            Web SSH Ftp Telnet risk - set whitelist
          </p>
          <div style={{ color: '#b0b8c8', fontSize: 13, fontWeight: 600 }}>
            Current User:{" "}
            <span style={{ fontWeight: 700, color: '#4fc3f7' }}>
              {user?.username || "admin"}
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="clixxo-logout-btn group flex items-center bg-[#F1F5F9] text-[#2F4362] text-xs sm:text-sm px-2 sm:px-3 py-1 border border-[#D8E0EA] rounded-full shadow-sm hover:bg-[#E2E8F0] hover:text-[#1E2F47] active:bg-[#D1DAE6] transition-all font-medium gap-1 sm:gap-2 outline-none min-w-[60px] sm:min-w-[80px] cursor-pointer"
            style={{ boxShadow: "0 2px 4px rgba(0,0,0,0.08)" }}
          >
            <span className="transition-colors">Logout</span>
            <PowerSettingsNewIcon
              className="power-icon"
              style={{
                fontSize: 16,
                color: "#6b7280",
                transition: "all 0.3s ease",
              }}
            />
          </button>
        </div>
      </div>
      {/* Custom Button Styles */}
      <style jsx="true">{`
        .clixxo-logout-btn:hover {
          background: #e5e7eb !important;
          border-color: #3e5475 !important;
          box-shadow: 0 4px 12px rgba(62, 84, 117, 0.6) !important;
          transform: translateY(-1px) !important;
        }
        .clixxo-logout-btn:hover .power-icon {
          color: #3e5475 !important;
          transform: scale(1.1) rotate(5deg) !important;
        }
        .clixxo-logout-btn:hover span {
          color: #000 !important;
        }
      `}</style>
    </div>
  );
};

export default Navbar;
