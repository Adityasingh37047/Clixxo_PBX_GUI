import React, { useEffect, useState } from "react";
import LOGO from "../assets/clixxo_white.png";
import TOP_GIF from "../assets/toptip.png";
import PowerSettingsNewIcon from "@mui/icons-material/PowerSettingsNew";
import MenuIcon from "@mui/icons-material/Menu";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import { IconButton } from "@mui/material";
import { useNavigate } from "react-router-dom";
import useAuth from "../context/useAuth";
import useTheme from "../context/useTheme";
import { postLinuxCmd } from "../api/apiService";

const Navbar = ({ isMobile, sidebarOpen, setSidebarOpen }) => {
  const [dateTime, setDateTime] = useState(new Date());
  const [serverDateTime, setServerDateTime] = useState(null);
  const [useServerTime, setUseServerTime] = useState(true);
  const [timeOffset, setTimeOffset] = useState(0);
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const { theme, toggleTheme } = useTheme();

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
            const offset = serverDate.getTime() - Date.now();
            setTimeOffset(offset);
            setServerDateTime(serverDate);
            console.log("📡 Server time fetched and offset set:", offset);
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
  }, []);

  // Update displayed time every second
  useEffect(() => {
    const timer = setInterval(() => {
      if (useServerTime) {
        setServerDateTime(new Date(Date.now() + timeOffset));
      } else {
        // Use browser time
        setDateTime(new Date());
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [useServerTime, timeOffset]);

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
          backgroundColor: "#1C2536",
        }}
      >
        {/* LEFT: hamburger + logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
          {isMobile && (
            <IconButton
              onClick={() => setSidebarOpen(!sidebarOpen)}
              sx={{
                color: "white",
                ml: 1,
                "&:hover": { backgroundColor: "rgba(255,255,255,0.1)" },
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
            style={{ maxWidth: "180px", objectFit: "contain" }}
          />
        </div>

        {/* CENTER: datetime — absolutely centered in navbar */}
        <div
          style={{
            position: "absolute",
            left: "50%",
            transform: "translateX(-50%)",
            color: "#ffffff",
            display: "flex",
            flexDirection: "row",
            gap: 8,
            fontSize: 13,
            fontWeight: 600,
            pointerEvents: "none",
            whiteSpace: "nowrap",
          }}
        >
          {serverDateTime ? (
            <>
              <span>{formattedDate}</span>
              <span>{formattedTime}</span>
            </>
          ) : (
            <span style={{ color: "#5a7a9a" }}>—</span>
          )}
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center items-end gap-1.5 sm:gap-2 pr-0.5 sm:pr-1">
          {/* <p className="text-red-500 text-xs hidden sm:block">
            Web SSH Ftp Telnet exist the risk, please close or set the whitelist address
          </p> */}
          <p className="text-red-500 text-xs sm:hidden">
            Web SSH Ftp Telnet risk - set whitelist
          </p>
          <div style={{ color: "#b0b8c8", fontSize: 13, fontWeight: 600 }}>
            Current User:{" "}
            <span style={{ fontWeight: 700, color: "#4fc3f7" }}>
              {user?.username || "admin"}
            </span>
          </div>
          <button
            type="button"
            onClick={toggleTheme}
            className="clixxo-theme-toggle"
            aria-label={
              theme === "dark"
                ? "Switch to light mode"
                : "Switch to dark mode"
            }
            title={theme === "dark" ? "Light mode" : "Dark mode"}
          >
            {theme === "dark" ? (
              <LightModeIcon sx={{ fontSize: 18 }} />
            ) : (
              <DarkModeIcon sx={{ fontSize: 18 }} />
            )}
          </button>
          <button
            onClick={handleLogout}
            className="clixxo-logout-btn group flex items-center justify-center text-white text-xs sm:text-sm px-2 sm:px-2.5 py-1 border border-white rounded-full font-semibold gap-1 outline-none min-w-[60px] sm:min-w-[72px] cursor-pointer"
            style={{ background: "transparent", transition: "all 0.13s ease" }}
          >
            <span className="transition-colors">Logout</span>
            <PowerSettingsNewIcon
              className="power-icon"
              style={{
                fontSize: 16,
                color: "#ffffff",
                transition: "all 0.13s ease",
              }}
            />
          </button>
        </div>
      </div>
      {/* Custom Button Styles */}
      <style jsx="true">{`
        .clixxo-logout-btn:hover {
          background: rgba(255, 255, 255, 0.1) !important;
          border-color: #ffffff !important;
        }
        .clixxo-logout-btn:active {
          transform: scale(0.97) !important;
        }
      `}</style>
    </div>
  );
};

export default Navbar;
