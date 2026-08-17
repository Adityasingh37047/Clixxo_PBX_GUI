import React, { useState, useEffect } from "react";
import { fetchLogin } from "../api/apiService";
import { canWrite as canWriteUser, isReadOnlyUser } from "../utils/permissions";
import AuthContext from "./authContextInstance";

// Auth Provider component
export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [BASE_URL, setBASE_URL] = useState("");

  function getBaseURL() {
    // setChangesMade(!changesMade);
    const url = new URL(window.location.origin);
    const ip = url.hostname;
    const port = url.port || (url.protocol === "https:" ? "443" : "80");
    const isLocalhost =
      ip === "localhost" || ip === "127.0.0.1" || ip === "0.0.0.0";

    if (isLocalhost) {

      let testIp = "192.168.0.160";  

      // Local development → backend usually runs on 5000
      return `https://${testIp}:443/api`;
    } else {
      // Production → use whatever URL the site is running on
      console.log(
        "Production → use whatever URL the site is running on",
        ip,
        port,
      );
      return `${url.protocol}//${ip}:${port}/api`;
    }
  }

  useEffect(() => {
    console.log(getBaseURL(), "in auth context");
    setBASE_URL(getBaseURL());
  }, [getBaseURL]);

  // Check authentication status on component mount
  useEffect(() => {
    const checkAuth = () => {
      const authStatus = sessionStorage.getItem("isAuthenticated") === "true";
      const userData = sessionStorage.getItem("user");

      setIsAuthenticated(authStatus);
      setUser(userData ? JSON.parse(userData) : null);
      setLoading(false);
    };

    checkAuth();
  }, []);

  // Login function
  const login = async (username, password) => {
    try {
      const response = await fetchLogin({ username, password });
      console.log("Login response:", response);

      if (response.response === false || response.response === "false") {
        const err = new Error(response.message || "Login failed");
        err.locked = response.locked || false;
        err.retryAfter = response.retryAfter || 0;
        err.attemptsLeft = response.attemptsLeft ?? null;
        throw err;
      }

      if (response.response === true) {
        const userData = {
          username: response.data?.username || username,
          role:
            response.data?.role || response.data?.access?.access_type || null,
          id: response.data?.id,
          ...response.data,
          // Capture access from wherever the backend places it
          access: response.data?.access ?? response.access ?? null,
          password: undefined, // never store password
        };
        delete userData.password;

        // Update state
        setIsAuthenticated(true);
        setUser(userData);

        // Save to sessionStorage (clears on tab/browser close)
        sessionStorage.setItem("isAuthenticated", "true");
        sessionStorage.setItem("user", JSON.stringify(userData));

        if (response.data?.token) {
          sessionStorage.setItem("authToken", response.data.token);
        }

        return userData;
      } else {
        throw new Error(response.message || "Login failed");
      }
    } catch (error) {
      console.error("Login error:", error);
      // Preserve lockout fields so LoginPage can read them
      const richError = new Error(error.message || "Invalid credentials");
      richError.locked = error.locked || false;
      richError.retryAfter = error.retryAfter || 0;
      richError.attemptsLeft = error.attemptsLeft ?? null;
      throw richError;
    }
  };

  // Logout function
  const logout = () => {
    // Update state
    setIsAuthenticated(false);
    setUser(null);

    // Clear sessionStorage
    sessionStorage.clear();
  };

  // Auto-logout on inactivity (5 minutes)
  useEffect(() => {
    let timerId = null;
    const TIMEOUT_MS = 30 * 60 * 1000; // 5 minutes

    const resetTimer = () => {
      if (timerId) clearTimeout(timerId);
      timerId = setTimeout(() => {
        // Only logout if currently authenticated
        if (sessionStorage.getItem("isAuthenticated") === "true") {
          logout();
        }
      }, TIMEOUT_MS);
    };

    const activityEvents = [
      "click",
      "mousemove",
      "keydown",
      "touchstart",
      "scroll",
    ];
    activityEvents.forEach((evt) =>
      window.addEventListener(evt, resetTimer, { passive: true }),
    );

    // Start timer initially
    resetTimer();

    return () => {
      if (timerId) clearTimeout(timerId);
      activityEvents.forEach((evt) =>
        window.removeEventListener(evt, resetTimer),
      );
    };
  }, []);

  // Update user function
  const updateUser = (userData) => {
    setUser(userData);
    sessionStorage.setItem("user", JSON.stringify(userData));
  };

  // Global read-only toast
  const [readOnlyToast, setReadOnlyToast] = useState(false);
  const readOnlyToastTimer = React.useRef(null);

  const showReadOnlyToast = () => {
    setReadOnlyToast(true);
    if (readOnlyToastTimer.current) clearTimeout(readOnlyToastTimer.current);
    readOnlyToastTimer.current = setTimeout(
      () => setReadOnlyToast(false),
      4000,
    );
  };

  // Listen for read-only flag from API interceptor
  useEffect(() => {
    const handler = () => {
      setUser((prev) => {
        if (!prev || prev.read_only) return prev;
        const updated = { ...prev, read_only: true };
        sessionStorage.setItem("user", JSON.stringify(updated));
        return updated;
      });
      showReadOnlyToast();
    };
    window.addEventListener("pbx:read-only", handler);
    return () => {
      window.removeEventListener("pbx:read-only", handler);
      if (readOnlyToastTimer.current) clearTimeout(readOnlyToastTimer.current);
    };
  }, []);

  const value = {
    isAuthenticated,
    user,
    loading,
    login,
    logout,
    updateUser,
    BASE_URL,
    setBASE_URL,
    getBaseURL,
    isReadOnly: isReadOnlyUser(user),
    canWrite: canWriteUser(user),
    showReadOnlyToast,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}

      {/* Global read-only toast — shown whenever any API call returns read_only: true */}
      {readOnlyToast && (
        <div
          style={{
            position: "fixed",
            bottom: 24,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 99999,
            background: "#1e293b",
            color: "#fff",
            padding: "12px 24px",
            borderRadius: 10,
            fontSize: 14,
            fontWeight: 600,
            boxShadow: "0 8px 32px rgba(0,0,0,0.28)",
            display: "flex",
            alignItems: "center",
            gap: 10,
            minWidth: 320,
            maxWidth: "90vw",
            borderLeft: "4px solid #f59e0b",
            animation: "pbx-slide-up 0.25s ease",
          }}
        >
          <span style={{ fontSize: 18 }}>🔒</span>
          <div>
            <div style={{ fontWeight: 700, marginBottom: 2 }}>
              Read-Only Access
            </div>
            <div style={{ fontSize: 12, fontWeight: 400, color: "#94a3b8" }}>
              You do not have permission to make changes.
            </div>
          </div>
          <button
            onClick={() => setReadOnlyToast(false)}
            style={{
              marginLeft: "auto",
              background: "none",
              border: "none",
              color: "#94a3b8",
              cursor: "pointer",
              fontSize: 18,
              lineHeight: 1,
              padding: "0 4px",
            }}
          >
            ×
          </button>
        </div>
      )}

      <style>{`
        @keyframes pbx-slide-up {
          from { opacity: 0; transform: translateX(-50%) translateY(16px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      `}</style>
    </AuthContext.Provider>
  );
};
