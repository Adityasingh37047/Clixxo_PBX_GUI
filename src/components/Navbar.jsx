import React, { useEffect, useState } from "react";
import LOGO from "../assets/clixxo_white.png";
import PowerSettingsNewIcon from "@mui/icons-material/PowerSettingsNew";
import MenuIcon from "@mui/icons-material/Menu";
import { IconButton } from "@mui/material";
import { useNavigate } from "react-router-dom";
import useAuth from "../context/useAuth";
import { postLinuxCmd } from "../api/apiService";

const NAVBAR_BG = "#1C2536";
export const NAVBAR_HEIGHT = 48;
export const NAVBAR_HEIGHT_DESKTOP = NAVBAR_HEIGHT;
export const NAVBAR_HEIGHT_MOBILE = NAVBAR_HEIGHT;
export const getNavbarHeight = () => NAVBAR_HEIGHT;

const Navbar = ({ isMobile, sidebarOpen, setSidebarOpen }) => {
  const [dateTime, setDateTime] = useState(new Date());
  const [serverDateTime, setServerDateTime] = useState(null);
  const [useServerTime, setUseServerTime] = useState(true);
  const [timeOffset, setTimeOffset] = useState(0);
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  useEffect(() => {
    const fetchServerTime = async () => {
      try {
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
          } else {
            setUseServerTime(false);
          }
        }
      } catch {
        setUseServerTime(false);
      }
    };

    fetchServerTime();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      if (useServerTime && serverDateTime) {
        setServerDateTime(new Date(Date.now() + timeOffset));
      } else {
        setDateTime(new Date());
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [useServerTime, timeOffset, serverDateTime]);

  const activeDateTime =
    useServerTime && serverDateTime ? serverDateTime : dateTime;

  const formattedDate = activeDateTime.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  const formattedTime = activeDateTime.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  const handleLogout = () => {
    const confirmed = window.confirm("Are you sure you want to logout?");
    if (confirmed) {
      logout();
      navigate("/login");
    }
  };

  const dateTimeBlock = (
    <div
      style={{
        color: "#ffffff",
        display: "flex",
        flexDirection: "row",
        gap: 8,
        fontSize: 13,
        fontWeight: 600,
        lineHeight: 1,
        whiteSpace: "nowrap",
      }}
    >
      {useServerTime && !serverDateTime ? (
        <span style={{ color: "#5a7a9a" }}>—</span>
      ) : (
        <>
          <span>{formattedDate}</span>
          <span>{formattedTime}</span>
        </>
      )}
    </div>
  );

  const userBlock = (
    <div
      style={{
        color: "#b0b8c8",
        fontSize: 13,
        fontWeight: 600,
        whiteSpace: "nowrap",
      }}
    >
      Current User:{" "}
      <span style={{ fontWeight: 700, color: "#4fc3f7" }}>
        {user?.username || "admin"}
      </span>
    </div>
  );

  const logoutButton = (
    <button
      type="button"
      onClick={handleLogout}
      className="clixxo-logout-btn group flex items-center justify-center text-white text-xs sm:text-sm px-2 sm:px-2.5 py-1 border border-white rounded-full font-semibold gap-1 outline-none min-w-[60px] sm:min-w-[72px] cursor-pointer shrink-0"
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
  );

  return (
    <div className="fixed w-full z-50" style={{ background: NAVBAR_BG }}>
      <div
        className="flex items-center justify-between overflow-hidden"
        style={{
          position: "relative",
          height: NAVBAR_HEIGHT,
          backgroundColor: NAVBAR_BG,
        }}
      >
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

        <div
          style={{
            position: "absolute",
            left: "50%",
            transform: "translateX(-50%)",
            pointerEvents: "none",
            whiteSpace: "nowrap",
          }}
        >
          {dateTimeBlock}
        </div>

        <div className="flex flex-row items-center gap-2 pr-1">
          {userBlock}
          {logoutButton}
        </div>
      </div>

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
