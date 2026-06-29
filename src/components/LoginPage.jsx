import React, { useState } from "react";
import clixxoLogo from "../assets/Clixxo_Logo.png";
import { useNavigate } from "react-router-dom";
import useAuth from "../context/useAuth";
import { Visibility, VisibilityOff } from "@mui/icons-material";

const LOGIN_CARD_WIDTH = 400;

const pageWrapStyle = {
  minHeight: "100vh",
  background: "#4a6080",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
};

const toastWrapStyle = {
  width: LOGIN_CARD_WIDTH,
  marginBottom: 14,
  borderRadius: 8,
  padding: "10px 16px",
  display: "flex",
  alignItems: "center",
  gap: 10,
  boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
};

const toastTextStyle = {
  fontSize: 13,
  fontWeight: 600,
  flex: 1,
  lineHeight: 1.4,
};

const cardStyle = {
  width: LOGIN_CARD_WIDTH,
  background: "#ffffff",
  borderRadius: 8,
  boxShadow: "0 12px 40px rgba(0,0,0,0.35)",
  overflow: "hidden",
};

const cardHeaderStyle = {
  padding: "32px 36px 24px",
  textAlign: "center",
  borderBottom: "1px solid #edf0f4",
};

const logoStyle = {
  height: 42,
  objectFit: "contain",
  display: "block",
  margin: "0 auto 8px",
};

const subtitleStyle = {
  margin: 0,
  fontSize: 12,
  color: "#a0aec0",
  letterSpacing: "0.07em",
  fontWeight: 500,
};

const formSectionStyle = { padding: "24px 36px 30px" };

const offlineNoticeStyle = {
  background: "#fef2f2",
  border: "1px solid #fca5a5",
  borderRadius: 6,
  padding: "9px 14px",
  marginBottom: 20,
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 10,
};

const retryBtnStyle = {
  background: "#b91c1c",
  color: "#fff",
  border: "none",
  borderRadius: 4,
  padding: "4px 12px",
  fontSize: 12,
  fontWeight: 600,
  cursor: "pointer",
};

const footerStyle = {
  marginTop: 24,
  fontSize: 12,
  color: "rgba(255,255,255,0.22)",
  letterSpacing: "0.04em",
};

const ERROR_TOAST_THEME = {
  bg: "#fef2f2",
  border: "#fca5a5",
  color: "#b91c1c",
};

const formatTime = (secs) => {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  const parts = [];
  if (h > 0) parts.push(`${h} hr`);
  if (m > 0) parts.push(`${m} min`);
  if (s > 0 || parts.length === 0) parts.push(`${s} sec`);
  return parts.join(" ");
};

const isNetworkError = (message) =>
  message.includes("Network Error") || message.includes("Failed to fetch");

const getInputStyle = (disabled, padding = "0 14px") => ({
  width: "100%",
  height: 42,
  padding,
  border: "1.5px solid #e2e8f0",
  borderRadius: 6,
  fontSize: 14,
  color: "#1e293b",
  background: disabled ? "#f8fafc" : "#fff",
  outline: "none",
  boxSizing: "border-box",
  transition: "border-color 0.15s, box-shadow 0.15s",
});

const handleInputFocus = (e) => {
  e.target.style.borderColor = "#1a73c8";
  e.target.style.boxShadow = "0 0 0 3px rgba(26,115,200,0.12)";
};

const handleInputBlur = (e) => {
  e.target.style.borderColor = "#e2e8f0";
  e.target.style.boxShadow = "none";
};

const getToastState = ({
  isLoading,
  lockMessage,
  attemptsLeft,
  error,
  setLockMessage,
  setAttemptsLeft,
  setError,
}) => {
  if (isLoading) {
    return {
      show: true,
      bg: "#eff6ff",
      border: "#93c5fd",
      color: "#1d4ed8",
      icon: "⏳",
      text: "Connecting to server...",
      dismiss: null,
    };
  }
  if (lockMessage) {
    return {
      show: true,
      ...ERROR_TOAST_THEME,
      icon: "🔒",
      text: lockMessage,
      dismiss: () => setLockMessage(""),
    };
  }
  if (attemptsLeft !== null && attemptsLeft > 0) {
    return {
      show: true,
      bg: "#fffbeb",
      border: "#fcd34d",
      color: "#92400e",
      icon: "⚠️",
      text: `Invalid credentials — ${attemptsLeft} attempt${attemptsLeft !== 1 ? "s" : ""} left`,
      dismiss: () => {
        setAttemptsLeft(null);
        setError("");
      },
    };
  }
  if (error && error !== "locked") {
    return {
      show: true,
      ...ERROR_TOAST_THEME,
      icon: "⊘",
      text: error,
      dismiss: () => setError(""),
    };
  }
  return { show: false };
};

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [serverStatus, setServerStatus] = useState("online");
  const [showPassword, setShowPassword] = useState(false);
  const [attemptsLeft, setAttemptsLeft] = useState(null);
  const [lockMessage, setLockMessage] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  const isFormDisabled = isLoading || serverStatus === "offline";

  const clearFeedback = () => {
    setError("");
    setLockMessage("");
    setAttemptsLeft(null);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError("Please enter both username and password");
      return;
    }
    setIsLoading(true);
    clearFeedback();
    try {
      await login(username, password);
      navigate("/");
    } catch (err) {
      console.error("Login error:", err);
      if (isNetworkError(err.message)) {
        setServerStatus("offline");
      } else if (err.locked) {
        const secs = err.retryAfter || 300;
        setLockMessage(
          `Too many attempts. Try again after ${formatTime(secs)}`,
        );
      } else {
        if (err.attemptsLeft !== null && err.attemptsLeft !== undefined) {
          setAttemptsLeft(err.attemptsLeft);
        }
        setError(err.message || "Invalid credentials. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setUsername("");
    setPassword("");
    clearFeedback();
    setServerStatus("online");
  };

  const handleEnterKey = (e) => {
    if (e.key === "Enter" && username && password) handleLogin(e);
  };

  const handleRetry = () => {
    setServerStatus("online");
    if (username.trim() && password.trim()) {
      handleLogin({ preventDefault: () => {} });
    }
  };

  const toast = getToastState({
    isLoading,
    lockMessage,
    attemptsLeft,
    error,
    setLockMessage,
    setAttemptsLeft,
    setError,
  });

  const submitLabel = isLoading
    ? "Logging in..."
    : serverStatus === "offline"
      ? "Offline"
      : "LOGIN";

  const submitBtnStyle = {
    flex: 1,
    height: 42,
    background: isFormDisabled
      ? "#94a3b8"
      : "linear-gradient(to bottom, #1e7fd4, #1560a8)",
    color: "#fff",
    border: "none",
    borderRadius: 7,
    fontSize: 13,
    fontWeight: 700,
    letterSpacing: "0.1em",
    cursor: isFormDisabled ? "not-allowed" : "pointer",
    boxShadow: isFormDisabled ? "none" : "0 2px 8px rgba(21,96,168,0.35)",
    transition: "all 0.15s",
  };

  const cancelBtnStyle = {
    flex: 1,
    height: 42,
    background: "#f1f5f9",
    color: "#475569",
    border: "1.5px solid #e2e8f0",
    borderRadius: 7,
    fontSize: 13,
    fontWeight: 700,
    letterSpacing: "0.1em",
    cursor: isLoading ? "not-allowed" : "pointer",
    transition: "all 0.15s",
  };

  return (
    <div style={pageWrapStyle}>
      {toast.show && (
        <div
          style={{
            ...toastWrapStyle,
            background: toast.bg,
            border: `1px solid ${toast.border}`,
          }}
        >
          <span style={{ fontSize: 15, flexShrink: 0 }}>{toast.icon}</span>
          <span style={{ ...toastTextStyle, color: toast.color }}>
            {toast.text}
          </span>
          {toast.dismiss && (
            <span
              style={{
                color: toast.color,
                cursor: "pointer",
                fontSize: 19,
                opacity: 0.7,
              }}
              onClick={toast.dismiss}
            >
              &times;
            </span>
          )}
        </div>
      )}

      <div style={cardStyle}>
        <div style={cardHeaderStyle}>
          <img src={clixxoLogo} alt="Clixxo" style={logoStyle} />
          <p style={subtitleStyle}>IP PBX Management System</p>
        </div>

        <div style={formSectionStyle}>
          {serverStatus === "offline" && (
            <div style={offlineNoticeStyle}>
              <span style={{ color: "#b91c1c", fontSize: 12, fontWeight: 500 }}>
                ⚠ Server unreachable
              </span>
              <button type="button" onClick={handleRetry} style={retryBtnStyle}>
                Retry
              </button>
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: 14 }}>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username"
                disabled={isFormDisabled}
                autoFocus
                onKeyDown={handleEnterKey}
                style={getInputStyle(isFormDisabled)}
                onFocus={handleInputFocus}
                onBlur={handleInputBlur}
              />
            </div>

            <div style={{ marginBottom: 22, position: "relative" }}>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                disabled={isFormDisabled}
                onKeyDown={handleEnterKey}
                style={getInputStyle(isFormDisabled, "0 44px 0 14px")}
                onFocus={handleInputFocus}
                onBlur={handleInputBlur}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                disabled={isFormDisabled}
                style={{
                  position: "absolute",
                  right: 13,
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#94a3b8",
                  padding: 0,
                  display: "flex",
                  alignItems: "center",
                }}
              >
                {showPassword ? (
                  <VisibilityOff fontSize="small" />
                ) : (
                  <Visibility fontSize="small" />
                )}
              </button>
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button
                type="submit"
                disabled={isFormDisabled}
                style={submitBtnStyle}
                onMouseEnter={(e) => {
                  if (!isFormDisabled) {
                    e.target.style.background =
                      "linear-gradient(to bottom, #2490e8, #1a6dc4)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isFormDisabled) {
                    e.target.style.background =
                      "linear-gradient(to bottom, #1e7fd4, #1560a8)";
                  }
                }}
              >
                {submitLabel}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                disabled={isLoading}
                style={cancelBtnStyle}
                onMouseEnter={(e) => {
                  if (!isLoading) {
                    e.target.style.background = "#e2e8f0";
                    e.target.style.color = "#334155";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isLoading) {
                    e.target.style.background = "#f1f5f9";
                    e.target.style.color = "#475569";
                  }
                }}
              >
                CANCEL
              </button>
            </div>
          </form>
        </div>
      </div>

      <div style={footerStyle}>
        © 2026 Clixxo Broadband Pvt. Ltd. &nbsp;·&nbsp; All rights reserved
      </div>
    </div>
  );
};

export default LoginPage;
