import React, { useState, useEffect } from "react";
import Button from "@mui/material/Button";
import { Alert } from "@mui/material";
import {
  RESTART_SECTIONS,
  RESTART_BUTTON_LABEL,
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
  cardBorder: "#9CA3AF",
  divider: "#9CA3AF",
  cardShadow: "0 4px 20px rgba(15,23,42,0.06)",
  labelText: "#64748b",
  valueText: "#1e293b",
  strongText: "#0f172a",
  mutedText: "#94a3b8",
  accent: "#0284c7",
  primary: "#2563eb",
  primaryHover: "#1d4ed8",
  errorRed: "#dc2626",
};

const Btn = ({
  children,
  onClick,
  disabled,
  variant = "default",
  style: extraStyle,
  type,
}) => {
  const styles = {
    default: {
      background: C.cardBg,
      color: C.valueText,
      border: "1px solid #9ca3af",
    },
    primary: {
      background: "linear-gradient(to bottom, #5A6F8F 0%, #3E5475 60%, #2C3E57 100%)",
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
  const hoverBg = (() => {
    switch (variant) {
      case "primary":
        return "linear-gradient(to bottom, #3E5475 0%, #5A6F8F 100%)";
      case "danger":
        return "#b91c1c";
      case "default":
      default:
        return "#e2e8f0";
    }
  })();

  const baseBg = s.background;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "6px 14px",
        borderRadius: 10,
        fontSize: 12,
        fontWeight: 600,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.6 : 1,
        transition: "all 0.15s ease",
        height: 30,
        gap: 6,
        whiteSpace: "nowrap",
        ...s,
        ...extraStyle,
      }}
      onMouseEnter={(e) => {
        if (!disabled) e.currentTarget.style.background = hoverBg;
      }}
      onMouseLeave={(e) => {
        if (!disabled) e.currentTarget.style.background = baseBg;
      }}
    >
      {children}
    </button>
  );
};

const tableContainerStyle = {
  width: "100%",
  maxWidth: "100%",
  margin: "0 auto",
  background: C.cardBg,
  border: `1px solid ${C.cardBorder}`,
  borderRadius: 20,
  boxShadow: C.cardShadow,
  overflow: "hidden",
  paddingBottom: "16px",
  marginBottom: "24px",
};

const blueBarStyle = {
  width: "100%",
  height: 44,
  background: C.cardBg,
  borderTopLeftRadius: 20,
  borderTopRightRadius: 20,
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "0 14px",
  fontWeight: 700,
  fontSize: 13,
  color: "#3E5475",
  borderBottom: `1px solid ${C.divider}`,
};

const Restart = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState({ msg: "", type: "success" });
  const [loadingType, setLoadingType] = useState(""); // 'system' or 'service'
  const [progressMessage, setProgressMessage] = useState("");

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "success" }), 3500);
  };

  // Auto-hide error after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(""), 5000);
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
    const url = `${protocol}//${ip}${port}/api/service-ping`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 7000);
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
      const confirmed = window.confirm("Are you sure you want to restart the System?");
      if (!confirmed) return;
    } else if (sectionKey === "service") {
      const confirmed = window.confirm("Are you sure you want to restart this Service?");
      if (!confirmed) return;
    }
    setError("");
    if (sectionKey === "system") {
      setLoading(true);
      setLoadingType("system");
      setProgressMessage("System is restarting...");
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
            code === "ECONNRESET" ||
            code === "ETIMEDOUT" ||
            code === "ECONNABORTED" ||
            msg.includes("Network Error") ||
            msg.includes("Failed to fetch") ||
            msg.includes("timeout");
          if (is500 || isConnectionError) {
            // Assume reboot was initiated
          } else {
            console.error("System restart API error:", apiError);
            let errorMessage = "Failed to initiate system restart.";
            if (status === 401 || status === 403)
              errorMessage = "Permission denied.";
            else if (status === 404)
              errorMessage = "Restart endpoint not found.";
            else if (apiError.message) errorMessage = apiError.message;
            setError(errorMessage);
            setLoading(false);
            setLoadingType("");
            setProgressMessage("");
            return;
          }
        }
        setProgressMessage("Waiting for device to come back online...");
        setTimeout(async () => {
          let result = { success: false, respondedIp: null };
          for (let i = 0; i < 48; i++) {
            try {
              result = await pingAllTargets(pingTargets);
              if (result.success) break;
            } catch (e) {
              // continue
            }
            await new Promise((res) => setTimeout(res, 5000));
          }
          if (result.success) {
            setProgressMessage(
              "Device is back online. Redirecting to login...",
            );
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
            const loginUrl = `${protocol}//${result.respondedIp}${portPart}/login`;
            setTimeout(() => {
              window.location.href = loginUrl;
            }, 3000);
          } else {
            setLoading(false);
            setLoadingType("");
            setProgressMessage("");
            setError(
              "Device did not come back online. Please check your network or try again later.",
            );
          }
        }, 5000);
      } catch (error) {
        console.error("System restart error:", error);
        setError(
          "Failed to get device info or start restart. Please try again.",
        );
        setLoading(false);
        setLoadingType("");
        setProgressMessage("");
      }
    } else if (sectionKey === "service") {
      setLoading(true);
      setLoadingType("service");
      setProgressMessage("Restarting service...");
      try {
        await serviceRestart();
        setLoading(false);
        setLoadingType("");
        setProgressMessage("");
        showToast("Service restart successful");
      } catch (error) {
        console.error("Service restart error:", error);
        let errorMessage = "Failed to restart service.";
        if (
          error.code === "ECONNABORTED" ||
          error.message?.includes("timeout")
        ) {
          errorMessage = "Service restart timed out. Please try again.";
        } else if (error.response?.status >= 500) {
          errorMessage =
            "Server error during service restart. Please try again later.";
        } else if (
          error.message?.includes("Network Error") ||
          error.message?.includes("Failed to fetch")
        ) {
          errorMessage =
            "Server is not connected. Please check your connection.";
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
      className="min-h-[calc(100vh-80px)] p-4 flex flex-col items-center"
      style={{ backgroundColor: C.pageBg }}
    >
      <div className="w-full" style={{ maxWidth: 1000 }}>
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
          <span>Maintenance</span>
          <span>&gt;</span>
          <span>System Tool</span>
          <span>&gt;</span>
          <span style={{ color: C.strongText, fontWeight: 600 }}>Restart</span>
        </div>

        {/* Global Toast */}
        {toast.msg && (
          <Alert
            severity={toast.type}
            onClose={() => setToast({ msg: "", type: "success" })}
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
          <div key={section.key} style={tableContainerStyle}>
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
                  ? "System is restarting..."
                  : "Service is restarting...")}
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
