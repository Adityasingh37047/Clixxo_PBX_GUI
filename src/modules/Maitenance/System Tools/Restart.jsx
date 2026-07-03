import React, { useState, useEffect } from "react";
import Button from "@mui/material/Button";
import { Alert } from "@mui/material";
import {
  RESTART_SECTIONS,
  RESTART_BUTTON_LABEL,
  RESTART_BREADCRUMB,
  RESTART_CONFIRM,
  RESTART_MESSAGES,
  RESTART_DEFAULT_TOAST,
  RESTART_TOAST_DURATION,
  RESTART_ERROR_HIDE_MS,
  RESTART_TIMINGS,
  RESTART_API,
  RESTART_ROUTES,
  RESTART_NETWORK_ERRORS,
  RESTART_CONNECTION_CODES,
} from "../../../constants/RestartConstants";
import {
  systemRestart,
  servicePing,
  serviceRestart,
  fetchSystemInfo,
} from "../../../api/apiService";

const C = {
  pageBg: "#f8fafc",
  cardBg: "#ffffff",
  cardBorder: "#d8dde5",
  cardShadow:
  "0 0 14px rgba(0, 0, 0, 0.18), 0 0 5px rgba(0, 0, 0, 0.10)",
  divider: "#e2e6ec",
  labelText: "#3E5475",
  valueText: "#1f2937",
  mutedText: "#6b7280",
  placeholderText: "#9aa3b2",
  strongText: "#1f2937",
  accent: "#4A5D75",
  accentDark: "#3a4a5e",
  amber: "#dc2626",
  errorRed: "#dc2626",
  gridHeaderBg: "#F8FAFC",
};

const CARD_RADIUS = 10;
const FIELD_RADIUS = 6;

// ── Local field UI (matches Network.jsx design language) ──
const OUTLINED_BORDER = "#d1d5db";
const OUTLINED_HOVER = "#9ca3af";
const OUTLINED_FOCUS = "#3E5475";
const FOCUS_RING_SHADOW = () => `0 0 0 2px rgba(62, 84, 117, 0.15)`;  

const Btn = ({
  children,
  onClick,
  disabled,
  variant = "default",
  style: extraStyle,
  type,
  component,
  startIcon,
}) => {
  const styles = {
    default: {
      background: C.cardBg,
      color: C.valueText,
      border: "1px solid #9ca3af",
    },
    primary: {
      background:
        "linear-gradient(to bottom, #5A6F8F 0%, #3E5475 60%, #2C3E57 100%)",
      color: "#fff",
      border: "1px solid #5A6F8F",
    },
    danger: {
      background: C.errorRed,
      color: C.cardBg,
      border: `0.5px solid ${C.errorRed}`,
    },
  };

  const s = styles[variant] || styles.default;
  const hoverBg =
    {
      primary: "linear-gradient(to bottom, #3E5475 0%, #5A6F8F 100%)",
      cancel: "#b6c2d3",
      danger: "#fca5a5",
      outline: "#e2e8f0",
      error: "#b91c1c",
      default: "#e2e8f0",
    }[variant] || "#e2e8f0";
  const activeBg =
    {
      primary: "linear-gradient(to bottom, #2C3E57 0%, #3E5475 100%)",
      cancel: "#a3b1c2",
      danger: "#f87171",
      outline: "#d1d9e6",
      error: "#991b1b",
      default: "#d1d5db",
    }[variant] || "#d1d5db";
  const baseBg = extraStyle?.background ?? s.background;
  const baseShadow = extraStyle?.boxShadow ?? s.boxShadow ?? "none";

  const clearPressStyle = (el) => {
    el.style.transform = "";
    el.style.boxShadow = baseShadow;
  };

  const applyPressStyle = (el) => {
    el.style.background = activeBg;
    el.style.transform = "translateY(1px) scale(0.98)";
    el.style.boxShadow =
      variant === "primary"
        ? "inset 0 2px 4px rgba(0, 0, 0, 0.25)"
        : variant === "cancel"
          ? "inset 0 2px 4px rgba(15, 23, 42, 0.15)"
          : "inset 0 1px 3px rgba(15, 23, 42, 0.12)";
  };

  const Component = component || "button";
  return (
    <Component
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "6px 14px",
        borderRadius: 10,
        fontSize: 13,
        fontWeight: 600,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.6 : 1,
        transition:
          "background 0.15s ease, transform 0.1s ease, box-shadow 0.1s ease",
        height: 36,
        gap: 6,
        whiteSpace: "nowrap",
        ...s,
        ...extraStyle,
      }}
      onMouseEnter={(e) => {
        if (disabled) return;
        e.currentTarget.style.background = hoverBg;
      }}
      onMouseLeave={(e) => {
        if (disabled) return;
        e.currentTarget.style.background = baseBg;
        clearPressStyle(e.currentTarget);
      }}
      onMouseDown={(e) => {
        if (disabled) return;
        applyPressStyle(e.currentTarget);
      }}
      onMouseUp={(e) => {
        if (disabled) return;
        e.currentTarget.style.background = hoverBg;
        clearPressStyle(e.currentTarget);
      }}
    >
      {startIcon && (
        <span style={{ display: "inline-flex" }}>
          {startIcon}
        </span>
      )}
      {children}
    </Component>
  );
};




const tableContainerStyle = {
  width: "100%",
  maxWidth: "100%",
  margin: 0,
  display: "flex",
  flexDirection: "column",
  background: C.cardBg,
  border: `1.5px solid ${C.cardBorder}`,
  borderRadius: CARD_RADIUS,
  boxShadow: C.cardShadow,
  overflow: "hidden",
  boxSizing: "border-box",
};

const RestartPageWrapStyle = {
  backgroundColor: C.pageBg,
  minHeight: "calc(100vh - 80px)",
  padding: 16,
  boxSizing: "border-box",
};

const RestartPageInnerStyle = {
  width: "100%",
  maxWidth: "100%",
  margin: "0 auto",
};

const blueBarStyle = {
  width: "100%",
  minHeight: 44,
  background: C.cardBg,
  borderTopLeftRadius: 10,
  borderTopRightRadius: 10,
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "7px 14px",
  flexWrap: "wrap",
  gap: 12,
  fontWeight: 700,
  fontSize: 13,
  color: "#3E5475",
  borderBottom: `1px solid ${C.divider}`,
};

const Restart = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState(RESTART_DEFAULT_TOAST);
  const [loadingType, setLoadingType] = useState(""); // 'system' or 'service'
  const [progressMessage, setProgressMessage] = useState("");

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(RESTART_DEFAULT_TOAST), RESTART_TOAST_DURATION);
  };

  // Auto-hide error after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(""), RESTART_ERROR_HIDE_MS);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Helper function to extract IP addresses from system info
  const getDeviceIPs = async () => {
    try {
      const sysInfo = await fetchSystemInfo();
      const getIpFromInterfaceObject = (obj) => {
        if (!obj || typeof obj !== "object") return null;
        if (Array.isArray(obj["IP Address"]) && obj["IP Address"][0])
          return obj["IP Address"][0];
        if (Array.isArray(obj["Ip Address"]) && obj["Ip Address"][0])
          return obj["Ip Address"][0];
        if (Array.isArray(obj["ip_address"]) && obj["ip_address"][0])
          return obj["ip_address"][0];
        return null;
      };

      const details = sysInfo?.details || {};
      const lanInterfaces =
        details.LAN_INTERFACES || details.lan_interfaces || null;
      const interfacesArray = Array.isArray(lanInterfaces)
        ? lanInterfaces
        : lanInterfaces && typeof lanInterfaces === "object"
          ? Object.entries(lanInterfaces).map(([name, data]) => ({
              name,
              data,
            }))
          : [];

      let lan1Ip = null;
      let lan2Ip = null;

      interfacesArray.forEach((iface) => {
        const name = String(iface.name || iface.Name || "").toLowerCase();
        if (
          name.includes("eth0") ||
          name.includes("lan 1") ||
          name.includes("lan1")
        ) {
          lan1Ip = lan1Ip || getIpFromInterfaceObject(iface.data || iface);
        }
        if (
          name.includes("eth1") ||
          name.includes("lan 2") ||
          name.includes("lan2")
        ) {
          lan2Ip = lan2Ip || getIpFromInterfaceObject(iface.data || iface);
        }
      });

      // Fallback to direct network object access
      if (!lan1Ip)
        lan1Ip =
          getIpFromInterfaceObject(sysInfo?.network?.eth0) ||
          getIpFromInterfaceObject(sysInfo?.eth0);
      if (!lan2Ip)
        lan2Ip =
          getIpFromInterfaceObject(sysInfo?.network?.eth1) ||
          getIpFromInterfaceObject(sysInfo?.eth1);

      return { lan1Ip, lan2Ip };
    } catch (error) {
      console.error("Error getting device IPs:", error);
      return { lan1Ip: null, lan2Ip: null };
    }
  };

  const getPingTargets = (lan1Ip, lan2Ip) => {
    const currentHost = (window.location.hostname || "").trim();
    const set = new Set([lan1Ip, lan2Ip, currentHost].filter(Boolean));
    return Array.from(set);
  };

  const pingDeviceAt = async (ip) => {
    const protocol = window.location.protocol;
    const isSameHost = (ip || "").trim() === window.location.hostname;
    const port = isSameHost
      ? window.location.port
        ? `:${window.location.port}`
        : protocol === "https:"
          ? ":443"
          : ":80"
      : protocol === "https:"
        ? ":443"
        : ":80";
    const url = `${protocol}//${ip}${port}${RESTART_API.servicePingPath}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), RESTART_TIMINGS.pingTimeoutMs);
    try {
      const res = await fetch(url, {
        method: "GET",
        credentials: "include",
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      if (res.ok) return true;
      if (res.status === 401 || res.status === 403) return true;
      return false;
    } catch (err) {
      clearTimeout(timeoutId);
      return false;
    }
  };

  const pingAllTargets = async (targetIps) => {
    for (const ip of targetIps) {
      const ok = await pingDeviceAt(ip);
      if (ok) return { success: true, respondedIp: ip };
    }
    if (targetIps.length === 0) {
      try {
        const res = await servicePing();
        if (res?.response)
          return { success: true, respondedIp: window.location.hostname };
        return { success: false, respondedIp: null };
      } catch (err) {
        if (err?.response?.status === 401 || err?.response?.status === 403) {
          return { success: true, respondedIp: window.location.hostname };
        }
        return { success: false, respondedIp: null };
      }
    }
    return { success: false, respondedIp: null };
  };

  const handleRestart = async (sectionKey) => {
    if (sectionKey === "system") {
      const confirmed = window.confirm(RESTART_CONFIRM.system);
      if (!confirmed) return;
    } else if (sectionKey === "service") {
      const confirmed = window.confirm(RESTART_CONFIRM.service);
      if (!confirmed) return;
    }
    setError("");
    if (sectionKey === "system") {
      setLoading(true);
      setLoadingType("system");
      setProgressMessage(RESTART_MESSAGES.systemRestarting);
      let pingTargets = [];
      try {
        const ips = await getDeviceIPs();
        pingTargets = getPingTargets(ips.lan1Ip, ips.lan2Ip);
        try {
          await systemRestart();
        } catch (apiError) {
          const status = apiError.response?.status;
          const code = apiError.code;
          const msg = apiError.message || "";
          const is500 = status >= 500;
          const isConnectionError =
            code === RESTART_CONNECTION_CODES.ECONNRESET ||
            code === RESTART_CONNECTION_CODES.ETIMEDOUT ||
            code === RESTART_CONNECTION_CODES.ECONNABORTED ||
            msg.includes(RESTART_NETWORK_ERRORS.networkError) ||
            msg.includes(RESTART_NETWORK_ERRORS.failedToFetch) ||
            msg.includes(RESTART_NETWORK_ERRORS.timeout);
          if (is500 || isConnectionError) {
            // Assume reboot was initiated
          } else {
            console.error("System restart API error:", apiError);
            let errorMessage = RESTART_MESSAGES.systemRestartFailed;
            if (status === 401 || status === 403)
              errorMessage = RESTART_MESSAGES.permissionDenied;
            else if (status === 404)
              errorMessage = RESTART_MESSAGES.endpointNotFound;
            else if (apiError.message) errorMessage = apiError.message;
            setError(errorMessage);
            setLoading(false);
            setLoadingType("");
            setProgressMessage("");
            return;
          }
        }
        setProgressMessage(RESTART_MESSAGES.waitingOnline);
        setTimeout(async () => {
          let result = { success: false, respondedIp: null };
          for (let i = 0; i < RESTART_TIMINGS.maxPollAttempts; i++) {
            try {
              result = await pingAllTargets(pingTargets);
              if (result.success) break;
            } catch (e) {
              // continue
            }
            await new Promise((res) => setTimeout(res, RESTART_TIMINGS.pollIntervalMs));
          }
          if (result.success) {
            setProgressMessage(RESTART_MESSAGES.backOnline);
            const protocol = window.location.protocol;
            const isSameHost =
              (result.respondedIp || "") === window.location.hostname;
            const portPart = isSameHost
              ? window.location.port
                ? `:${window.location.port}`
                : ""
              : protocol === "https:"
                ? ":443"
                : ":80";
            const loginUrl = `${protocol}//${result.respondedIp}${portPart}${RESTART_ROUTES.login}`;
            setTimeout(() => {
              window.location.href = loginUrl;
            }, RESTART_TIMINGS.redirectDelayMs);
          } else {
            setLoading(false);
            setLoadingType("");
            setProgressMessage("");
            setError(RESTART_MESSAGES.deviceOffline);
          }
        }, RESTART_TIMINGS.pollInitialDelayMs);
      } catch (error) {
        console.error("System restart error:", error);
        setError(RESTART_MESSAGES.deviceInfoFailed);
        setLoading(false);
        setLoadingType("");
        setProgressMessage("");
      }
    } else if (sectionKey === "service") {
      setLoading(true);
      setLoadingType("service");
      setProgressMessage(RESTART_MESSAGES.restartingService);
      try {
        await serviceRestart();
        setLoading(false);
        setLoadingType("");
        setProgressMessage("");
        showToast(RESTART_MESSAGES.serviceRestartSuccess);
      } catch (error) {
        console.error("Service restart error:", error);
        let errorMessage = RESTART_MESSAGES.serviceRestartFailed;
        if (
          error.code === RESTART_CONNECTION_CODES.ECONNABORTED ||
          error.message?.includes(RESTART_NETWORK_ERRORS.timeout)
        ) {
          errorMessage = RESTART_MESSAGES.serviceRestartTimeout;
        } else if (error.response?.status >= 500) {
          errorMessage = RESTART_MESSAGES.serviceRestartServerError;
        } else if (
          error.message?.includes(RESTART_NETWORK_ERRORS.networkError) ||
          error.message?.includes(RESTART_NETWORK_ERRORS.failedToFetch)
        ) {
          errorMessage = RESTART_MESSAGES.serverNotConnected;
        } else if (error.message) {
          errorMessage = error.message;
        }
        setError(errorMessage);
        setLoading(false);
        setLoadingType("");
        setProgressMessage("");
      }
    }
  };

  return (
    <div
      style={RestartPageWrapStyle} data-native-scroll>
      <div style={RestartPageInnerStyle}>
        {/* Breadcrumb */}
        <div
          style={{
            fontSize: 12,
            color: C.mutedText,
            marginBottom: 16,
            fontWeight: 400,
            display: "flex",
            alignItems: "center",
            gap: 4,
          }}
        >
          <span>{RESTART_BREADCRUMB[0]}</span>
          <span>&gt;</span>
          <span>{RESTART_BREADCRUMB[1]}</span>
          <span>&gt;</span>
          <span style={{ color: C.strongText, fontWeight: 600 }}>
            {RESTART_BREADCRUMB[2]}
          </span>
        </div>

        {/* Global Toast */}
        {toast.msg && (
          <Alert
            severity={toast.type}
            onClose={() => setToast(RESTART_DEFAULT_TOAST)}
            sx={{
              position: "fixed",
              top: 16,
              right: 16,
              zIndex: 9999,
              boxShadow: C.cardShadow,
            }}
          >
            {toast.msg}
          </Alert>
        )}

        {/* Global Error Alert */}
        {error && (
          <Alert
            severity="error"
            onClose={() => setError("")}
            sx={{
              position: "fixed",
              top: 16,
              right: 16,
              zIndex: 9999,
              boxShadow: C.cardShadow,
            }}
          >
            {error}
          </Alert>
        )}

        {RESTART_SECTIONS.map((section) => (
          <div key={section.key} style={{
    ...tableContainerStyle,
    marginTop: 20,
  }}>
            <div style={blueBarStyle}>{section.title}</div>
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "24px 32px",
                gap: 24,
                flexWrap: "wrap",
              }}
            >
              <div
                style={{
                  fontSize: 14,
                  color: C.valueText,
                  flex: 1,
                  fontWeight: 500,
                }}
              >
                {section.instruction}
              </div>
              <Btn
                variant="primary"
                onClick={() => handleRestart(section.key)}
                disabled={loading && loadingType === section.key}
                style={{ height: 36, padding: "0 24px", fontSize: 13 }}
              >
                {RESTART_BUTTON_LABEL}
              </Btn>
            </div>
          </div>
        ))}

        {loading && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100vw",
              height: "100vh",
              background: "rgba(255,255,255,0.85)",
              zIndex: 9999,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                fontSize: 22,
                fontWeight: 600,
                color: C.primary,
                marginBottom: 16,
                textAlign: "center",
                maxWidth: 360,
              }}
            >
              {progressMessage ||
                (loadingType === "system"
                  ? RESTART_MESSAGES.systemRestarting
                  : RESTART_MESSAGES.serviceRestartingOverlay)}
            </div>
            <div
              className="loader"
              style={{
                width: 48,
                height: 48,
                border: "6px solid #e2e8f0",
                borderTop: `6px solid ${C.primary}`,
                borderRadius: "50%",
                animation: "spin 1s linear infinite",
              }}
            ></div>
            <style>{`@keyframes spin { 0% { transform: rotate(0deg);} 100% { transform: rotate(360deg);} }`}</style>
          </div>
        )}
      </div>
    </div>
  );
};

export default Restart;
