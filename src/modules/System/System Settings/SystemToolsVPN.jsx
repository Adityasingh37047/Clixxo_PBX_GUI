import React, { useState, useEffect } from "react";
import axiosInstance from "../../../api/axiosInstance";
import {
  VPN_TYPES,
  SYSTEM_TOOLS_VPN_INITIAL,
  VPN_RUNNING_INFO,
} from "../../../constants/SystemToolsVPNConstants";
import {
  Alert,
  CircularProgress,
  Chip,
} from "@mui/material";
import StartIcon from "@mui/icons-material/PlayArrow";
import StopIcon from "@mui/icons-material/Stop";
import RefreshIcon from "@mui/icons-material/Refresh";
import UploadIcon from "@mui/icons-material/Upload";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CloseIcon from "@mui/icons-material/Close";
import {
  uploadOpenVpnFile,
  startOpenVpn,
  stopOpenVpn,
  getOpenVpnStatus,
  getOpenVpnLogs,
  seCreateVpn,
  seConnectVpn,
  seDisconnectVpn,
  seVpnEnable,
  seVpnDisable,
  seVpnSetCert,
  seAutoStartEnable,
  seAutoStartDisable,
  seVpnList,
  seVpnStatus,
  seVpnDelete,
  seVpnState,
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
  errorRed: "#dc2626",
};

const CARD_RADIUS = 10;
const FIELD_RADIUS = 6;

const OUTLINED_BORDER = "#d1d5db";
const OUTLINED_HOVER = "#9ca3af";
const OUTLINED_FOCUS = "#3E5475";
const FOCUS_RING_SHADOW = () => `0 0 0 2px rgba(62, 84, 117, 0.15)`;

const setFieldDefault = (el) => {
  el.style.borderColor = OUTLINED_BORDER;
  el.style.borderWidth = "1px";
  el.style.boxShadow = "none";
};

const setFieldHover = (el) => {
  el.style.borderColor = OUTLINED_HOVER;
  el.style.borderWidth = "1px";
  el.style.boxShadow = "none";
};

const setFieldFocus = (el) => {
  el.style.borderColor = OUTLINED_FOCUS;
  el.style.borderWidth = "1px";
  el.style.boxShadow = FOCUS_RING_SHADOW();
};

const nativeFieldInputStyle = {
  height: 32,
  width: 200,
  padding: "0 10px",
  fontSize: 13,
  border: `1px solid ${OUTLINED_BORDER}`,
  borderRadius: FIELD_RADIUS,
  outline: "none",
  backgroundColor: "#fff",
  color: C.valueText,
  boxSizing: "border-box",
  boxShadow: "none",
  transition: "border-color 0.2s ease, box-shadow 0.2s ease",
};

const inputInteraction = {
  onFocus: (e) => {
    if (e.target.disabled || e.target.readOnly) return;
    setFieldFocus(e.target);
  },
  onBlur: (e) => {
    if (e.target.disabled || e.target.readOnly) return;
    setFieldDefault(e.target);
  },
  onMouseEnter: (e) => {
    if (e.target.disabled || e.target.readOnly) return;
    if (document.activeElement === e.target) {
      setFieldFocus(e.target);
    } else {
      setFieldHover(e.target);
    }
  },
  onMouseLeave: (e) => {
    if (e.target.disabled || e.target.readOnly) return;
    if (document.activeElement === e.target) {
      setFieldFocus(e.target);
    } else {
      setFieldDefault(e.target);
    }
  },
};

const { height: _nativeHeight, ...nativeFieldBase } = nativeFieldInputStyle;

const systemFieldInputStyle = {
  ...nativeFieldBase,
  width: "100%",
  padding: "6px 10px",
  borderRadius: FIELD_RADIUS,
  background: "#fff",
  lineHeight: 1.4,
  minHeight: 34,
};

const systemFieldSelectStyle = {
  ...systemFieldInputStyle,
  appearance: "auto",
  minHeight: 36,
  height: 36,
  paddingTop: 7,
  paddingBottom: 7,
  lineHeight: 1.35,
  cursor: "pointer",
};

const inputStyle = systemFieldInputStyle;
const selectStyle = systemFieldSelectStyle;

const vpnPageWrapStyle = {
  backgroundColor: C.pageBg,
  minHeight: "calc(100vh - 80px)",
  padding: 16,
  boxSizing: "border-box",
};

const vpnPageInnerStyle = {
  width: "100%",
  maxWidth: "100%",
  margin: 0,
  display: "flex",
  flexDirection: "column",
};



const vpnTableContainerStyle = {
  width: "100%",
  maxWidth: "100%",
  margin: 0,
  display: "flex",
  flexDirection: "column",
  background: C.cardBg,
  border: `1px solid ${C.cardBorder}`,
  borderRadius: CARD_RADIUS,
  boxShadow: C.cardShadow,
  overflow: "hidden",
  boxSizing: "border-box",
};

const vpnToolbarStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  minHeight: 44,
  padding: "7px 14px",
  borderBottom: `1px solid ${C.divider}`,
  background: C.cardBg,
  flexWrap: "wrap",
  gap: 12,
};

const vpnContentStyle = {
  display: "flex",
  flexDirection: "column",
  gap: 12,
  minWidth: 0,
  padding: "16px 36px 24px",
  background: C.cardBg,
};

const vpnFixedAlertSx = {
  position: "fixed",
  top: 20,
  right: 20,
  zIndex: 9999,
  minWidth: 300,
  maxWidth: 500,
  wordBreak: "break-word",
  boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
  fontWeight: 500,
};

const vpnActionBtnStyle = {
  minWidth: 110,
  height: 34,
  fontSize: 13,
  margin: 0,
  padding: "0 28px",
  lineHeight: "34px",
  boxSizing: "border-box",
};

const vpnCompactBtnStyle = {
  minWidth: 80,
  height: 34,
  fontSize: 13,
  padding: "0 20px",
  lineHeight: "34px",
  boxSizing: "border-box",
};

const vpnLogTextareaStyle = {
  width: "100%",
  height: 200,
  fontSize: 12,
  fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
  backgroundColor: "#f8fafc",
  color: C.valueText,
  padding: "10px 12px",
  borderRadius: CARD_RADIUS,
  border: `1px solid ${C.cardBorder}`,
  outline: "none",
  resize: "vertical",
  lineHeight: 1.6,
  boxSizing: "border-box",
};

const vpnChooseFileLabelStyle = {
  padding: "5px 12px",
  background: "#cbd5e1",
  border: "1px solid #cbd5e1",
  borderRadius: 8,
  fontSize: 12,
  fontWeight: 600,
  color: "#374151",
  whiteSpace: "nowrap",
  flexShrink: 0,
  cursor: "pointer",
  userSelect: "none",
  boxShadow: "0 1px 2px rgba(15,23,42,0.08)",
  transition:
    "background 0.15s ease, transform 0.1s ease, box-shadow 0.1s ease",
};

const vpnUploadLabelStyle = {
  ...vpnChooseFileLabelStyle,
  background: "#fff",
  border: `1px solid ${C.cardBorder}`,
  color: C.valueText,
  boxShadow: "none",
};

const VpnPageShell = ({ children }) => (
  <div style={vpnPageWrapStyle} data-native-scroll>
    <div style={vpnPageInnerStyle}>{children}</div>
  </div>
);

const VpnBreadcrumb = () => (
  <div
    style={{
      fontSize: 12,
      color: "#94a3b8",
      fontWeight: 400,
      display: "flex",
      alignItems: "center",
      gap: 4,
      flexWrap: "wrap",
      flexShrink: 0,
    }}
  >
    <span>System</span>
    <span>&gt;</span>
    <span>System Settings</span>
    <span>&gt;</span>
    <span style={{ color: "#1e293b", fontWeight: 600 }}>VPN</span>
  </div>
);


const Btn = ({
  children,
  onClick,
  disabled,
  variant = "default",
  style: extraStyle,
  type,
  startIcon,
  form,
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
      fontWeight: 600,
      fontSize: 15,
      textTransform: "none",
      padding: "6px 28px",
    },
    cancel: {
      background: "#cbd5e1",
      color: "#374151",
      border: "1px solid #cbd5e1",
      boxShadow: "0 1px 2px rgba(15,23,42,0.08)",
    },
    error: {
      background: C.errorRed,
      color: C.cardBg,
      border: `1px solid ${C.errorRed}`,
    },
  };

  const s = styles[variant] || styles.default;
  const hoverBg =
    {
      primary: "linear-gradient(to bottom, #3E5475 0%, #5A6F8F 100%)",
      cancel: "#b6c2d3",
      error: "#b91c1c",
      default: "#e2e8f0",
    }[variant] || "#e2e8f0";
  const activeBg =
    {
      primary: "linear-gradient(to bottom, #2C3E57 0%, #3E5475 100%)",
      cancel: "#a3b1c2",
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

  return (
    <button
      type={type}
      form={form}
      onClick={onClick}
      disabled={disabled}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        padding:
          variant === "primary" || variant === "cancel" || variant === "error"
            ? "8px 32px"
            : "6px 14px",
        borderRadius: 8,
        fontSize:
          variant === "primary" || variant === "cancel" || variant === "error"
            ? 14
            : 12,
        fontWeight: 600,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.6 : 1,
        transition:
          "background 0.15s ease, transform 0.1s ease, box-shadow 0.1s ease",
        height:
          variant === "primary" || variant === "cancel" || variant === "error"
            ? 38
            : 30,
        gap: 6,
        whiteSpace: "nowrap",
        userSelect: "none",
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
        <span style={{ display: "flex", alignItems: "center" }}>
          {startIcon}
        </span>
      )}
      {children}
    </button>
  );
};

const disabledInputStyle = {
  ...inputStyle,
  background: "#f1f5f9",
  color: "#94a3b8",
  cursor: "not-allowed",
  borderColor: "#e2e8f0",
};

const SystemToolsVPN = () => {
  const [form, setForm] = useState(SYSTEM_TOOLS_VPN_INITIAL);
  const [showAdvanced, setShowAdvanced] = useState(true); // Hidden when disabled via toggle
  const [runningInfo, setRunningInfo] = useState(VPN_RUNNING_INFO);

  // OpenVPN specific states
  const [vpnStatus, setVpnStatus] = useState("Unknown");
  const [vpnLogs, setVpnLogs] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [loading, setLoading] = useState({
    upload: false,
    start: false,
    stop: false,
    status: false,
    logs: false,
    toggle: false,
    seCreate: false,
    seConnect: false,
    seDisconnect: false,
    seStatus: false,
    seList: false,
    seDelete: false,
    seState: false,
  });

  // SoftEther form
  const [seForm, setSeForm] = useState({
    connectionName: "",
    server: "",
    hub: "",
    username: "",
    password: "",
    port: "",
    clientIp: "",
    netmask: "",
  });
  const [authMethod, setAuthMethod] = useState("password"); // 'password' | 'certificate'
  const [seCertFile, setSeCertFile] = useState(null);
  const [seKeyFile, setSeKeyFile] = useState(null);
  const [seStatus, setSeStatus] = useState("Unknown");
  const [seAccounts, setSeAccounts] = useState([]);
  const [seLogs, setSeLogs] = useState("");
  const [isProfileCreated, setIsProfileCreated] = useState(false); // Track if profile is created

  const appendSeLog = (text) => {
    const ts = new Date().toLocaleString();
    setSeLogs((prev) => `${prev}${prev ? "\n" : ""}[${ts}] ${text}`);
  };

  // ---- Persistence helpers for SoftEther single-profile ----
  const saveSeProfile = (profile) => {
    try {
      localStorage.setItem("seProfile", JSON.stringify(profile));
    } catch {}
  };

  const loadSeProfile = () => {
    try {
      const raw = localStorage.getItem("seProfile");
      if (!raw) return null;
      return JSON.parse(raw);
    } catch {
      return null;
    }
  };

  const handleTypeChange = (e) => {
    const newType = e.target.value;
    setForm((prev) => ({ ...prev, vpnType: newType }));
    // Always show advanced options for OpenVPN and SoftEtherVPN
    setShowAdvanced(true);
  };

  const handleCertChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setForm((prev) => ({ ...prev, vpnCertName: e.target.files[0].name }));
    } else {
      setSelectedFile(null);
      setForm((prev) => ({ ...prev, vpnCertName: "No file chosen" }));
    }
  };

  // ---------------- SoftEther helpers ----------------
  const handleSeChange = (field) => (e) =>
    setSeForm((prev) => ({ ...prev, [field]: e.target.value }));
  const handleSeCert = (e) => setSeCertFile(e.target.files?.[0] || null);
  const handleSeKey = (e) => setSeKeyFile(e.target.files?.[0] || null);

  const isCertValid = (file) => !!file && /\.(cer|crt)$/i.test(file.name || "");
  const isKeyValid = (file) => !!file && /\.key$/i.test(file.name || "");
  const areSeFieldsFilled = () => {
    const { connectionName, server, hub, username, password, port } = seForm;
    const commonOk = [
      connectionName,
      server,
      hub,
      username,
      password,
      port,
    ].every((v) => String(v || "").trim().length > 0);
    if (!commonOk) return false;
    if (authMethod === "certificate") {
      return isCertValid(seCertFile) && isKeyValid(seKeyFile);
    }
    return true; // password auth - all fields already checked above
  };

  const handleSeCreateFlow = async () => {
    // Check if OpenVPN is running
    if (vpnStatus === "Running") {
      window.alert(
        "OpenVPN is currently running. Please stop OpenVPN first before starting SoftEther VPN.",
      );
      return;
    }

    // Front-end validations
    if (!areSeFieldsFilled()) {
      showMessage(
        "error",
        "Please fill all fields (Connection Name, Server, Port, HUB, Username, Password).",
      );
      return;
    }
    // Only validate certificate files if using certificate authentication
    if (authMethod === "certificate") {
      if (!isCertValid(seCertFile)) {
        showMessage(
          "error",
          "Please upload a valid certificate file (.cer or .crt).",
        );
        return;
      }
      if (!isKeyValid(seKeyFile)) {
        showMessage("error", "Please upload a valid key file (.key).");
        return;
      }
    }
    try {
      setLoading((prev) => ({ ...prev, seCreate: true }));

      // Create new connection
      const resCreate = await seCreateVpn({ ...seForm });
      if (resCreate?.message) appendSeLog(`Create: ${resCreate.message}`);

      // If certificate method chosen, set certificate after creation
      if (authMethod === "certificate") {
        try {
          const r = await seVpnSetCert(
            seForm.connectionName,
            seCertFile,
            seKeyFile,
          );
          if (r?.message) appendSeLog(`SetCert: ${r.message}`);
          if (r?.output) appendSeLog(r.output);
        } catch (certError) {
          appendSeLog(`Certificate upload failed: ${certError.message}`);
          showMessage(
            "error",
            "Certificate upload failed. Please check your certificate files.",
          );
          return;
        }
      }

      // Connect
      const resConn = await seConnectVpn(seForm.connectionName);
      if (resConn?.message) appendSeLog(`Connect: ${resConn.message}`);

      // Enable client on boot and autostart this profile
      const en = await seVpnEnable();
      if (en?.message) appendSeLog(`Enable: ${en.message}`);

      const ae = await seAutoStartEnable(seForm.connectionName);
      if (ae?.message) appendSeLog(`Autostart: ${ae.message}`);

      showMessage(
        "success",
        "Profile created and connected with autostart enabled",
      );

      // Mark profile as created and make fields read-only
      setIsProfileCreated(true);
      // Persist profile locally with all details
      const profileToSave = {
        connectionName: seForm.connectionName,
        server: seForm.server,
        hub: seForm.hub,
        username: seForm.username,
        password: seForm.password,
        port: seForm.port,
        authMethod: authMethod,
        clientIp: seForm.clientIp,
        netmask: seForm.netmask,
      };
      console.log("Saving profile:", profileToSave);
      saveSeProfile(profileToSave);

      // Immediately check status after successful connection
      // Use the connection name directly to avoid state timing issues
      const connectionName = seForm.connectionName;
      setTimeout(async () => {
        try {
          setLoading((prev) => ({ ...prev, seStatus: true }));
          const res = await seVpnStatus(connectionName);

          if (res?.error) {
            setSeStatus("Stopped");
            appendSeLog(`Status API Error: ${res.error}`);
          } else {
            const rawText = (
              res?.status ||
              res?.output ||
              res?.responseData ||
              res?.message ||
              ""
            ).toString();
            if (rawText) {
              appendSeLog(rawText);
            }

            if (rawText || (res && (res.responseData || res.message))) {
              const statusText = (
                rawText ||
                res.responseData ||
                res.message ||
                "Unknown"
              ).toString();
              const statusLower = statusText.toLowerCase();

              if (
                statusLower.includes("running") ||
                statusLower.includes("connected") ||
                statusLower.includes("established") ||
                statusLower.includes("the command completed successfully") ||
                statusLower.includes("session status")
              ) {
                setSeStatus("Running");
              } else if (
                statusLower.includes("stopped") ||
                statusLower.includes("offline") ||
                statusLower.includes("disconnected")
              ) {
                setSeStatus("Stopped");
              } else if (
                statusLower.includes("connecting") ||
                statusLower.includes("retrying")
              ) {
                setSeStatus("Connecting");
              } else {
                setSeStatus("Unknown");
              }
            } else {
              setSeStatus("Unknown");
            }
          }
        } catch (e) {
          console.error("Error getting SoftEther status after creation:", e);
          if (e.response && e.response.status === 500) {
            setSeStatus("Stopped");
            appendSeLog(`Status API Error: ${e.message}`);
          } else {
            setSeStatus("Unknown");
            appendSeLog(`Status API Error: ${e.message}`);
          }
        } finally {
          setLoading((prev) => ({ ...prev, seStatus: false }));
        }
      }, 1000); // Wait 1 second for connection to establish
    } catch (e) {
      console.error("SoftEther create/connect error:", e);
      showMessage("error", e?.message || "SoftEther create/connect failed");
    } finally {
      setLoading((prev) => ({ ...prev, seCreate: false }));
    }
  };

  const handleSeDisconnect = async () => {
    if (!seForm.connectionName.trim()) {
      showMessage("error", "Please enter Connection Name to disconnect.");
      return;
    }
    try {
      setLoading((prev) => ({ ...prev, seDisconnect: true }));
      await seDisconnectVpn(seForm.connectionName.trim());

      // Disable VPN client and autostart so it doesn't start automatically after reboot
      try {
        await seVpnDisable();
        appendSeLog(`Disable: VPN client disabled`);

        await seAutoStartDisable(seForm.connectionName.trim());
        appendSeLog(`Autostart: Disabled for ${seForm.connectionName}`);

        // Update localStorage to reflect autostart is disabled
        try {
          localStorage.setItem("softetherAutoStart", "no");
        } catch {}
        setEnableSeChoice("no");
        setShowSeAdvanced(false);
      } catch (disableError) {
        console.error("Error disabling SoftEther autostart:", disableError);
        appendSeLog(`Autostart disable warning: ${disableError.message}`);
        // Don't fail the whole operation if autostart disable fails
      }

      showMessage(
        "success",
        "VPN disconnected and autostart disabled - profile saved",
      );
      setSeStatus("Stopped");
      // Persist current profile so fields remain intact on refresh/navigation
      saveSeProfile({
        connectionName: seForm.connectionName,
        server: seForm.server,
        hub: seForm.hub,
        username: seForm.username,
        password: seForm.password,
        port: seForm.port,
        authMethod: authMethod,
        clientIp: seForm.clientIp,
        netmask: seForm.netmask,
      });
      // Keep profile created state and form data - don't clear them
      await handleSeStatus(false);
    } catch (e) {
      showMessage("error", e?.message || "SoftEther disconnect failed");
    } finally {
      setLoading((prev) => ({ ...prev, seDisconnect: false }));
    }
  };

  const handleSeStatus = async (showError = true) => {
    if (!seForm.connectionName.trim()) {
      if (showError) {
        showMessage("error", "Please enter Connection Name to check status.");
      }
      return;
    }
    try {
      setLoading((prev) => ({ ...prev, seStatus: true }));
      const res = await seVpnStatus(seForm.connectionName);

      // Check if response contains an error field (like the 500 error response)
      if (res?.error) {
        setSeStatus("Stopped");
        appendSeLog(`Status API Error: ${res.error}`);
        // Don't show error message for API errors - just log it
        return;
      }

      // Prefer raw status text if provided by backend
      const rawText = (
        res?.status ||
        res?.output ||
        res?.responseData ||
        res?.message ||
        ""
      ).toString();
      if (rawText) {
        appendSeLog(rawText);
      }

      // Check if we got a valid response (like OpenVPN logic)
      if (rawText || (res && (res.responseData || res.message))) {
        // Get status from any available field
        const statusText = (
          rawText ||
          res.responseData ||
          res.message ||
          "Unknown"
        ).toString();
        const statusLower = statusText.toLowerCase();

        // Map the status to proper display values (like OpenVPN)
        if (
          statusLower.includes("running") ||
          statusLower.includes("connected") ||
          statusLower.includes("established") ||
          statusLower.includes("the command completed successfully") ||
          statusLower.includes("session status")
        ) {
          setSeStatus("Running");
        } else if (
          statusLower.includes("stopped") ||
          statusLower.includes("offline") ||
          statusLower.includes("disconnected")
        ) {
          setSeStatus("Stopped");
        } else if (
          statusLower.includes("connecting") ||
          statusLower.includes("retrying")
        ) {
          setSeStatus("Connecting");
        } else if (
          statusLower.includes("unknown") ||
          statusLower.includes("error")
        ) {
          setSeStatus("Unknown");
        } else {
          setSeStatus("Unknown");
        }

        if (res?.message) appendSeLog(`Status: ${res.message}`);
        if (res?.output && res.output !== rawText) appendSeLog(res.output);
      } else {
        // Only show Unknown if we have no response at all (server not connected)
        setSeStatus("Unknown");
        appendSeLog("Status API returned no valid response");
        // Don't show error message for no response - just log it
      }
    } catch (e) {
      console.error("Error getting SoftEther status:", e);

      // Check if it's a 500 error - show "Stopped" instead of "Unknown"
      if (e.response && e.response.status === 500) {
        setSeStatus("Stopped");
        appendSeLog(`Status API Error: ${e.message}`);
        // Don't show error message for 500 status - just log it
      } else if (e.response && e.response.status >= 400) {
        // For other 4xx/5xx errors, show "Stopped" and don't show error message
        setSeStatus("Stopped");
        appendSeLog(`Status API Error: ${e.message}`);
      } else {
        // For network errors or other issues, show "Unknown" and error message
        setSeStatus("Unknown");
        appendSeLog(`Status API Error: ${e.message}`);
        showMessage("error", e?.message || "Failed to get SoftEther status");
      }
    } finally {
      setLoading((prev) => ({ ...prev, seStatus: false }));
    }
  };

  const handleSeList = async () => {
    try {
      setLoading((prev) => ({ ...prev, seList: true }));
      const res = await seVpnList();
      setSeAccounts(Array.isArray(res?.accounts) ? res.accounts : []);
    } catch (e) {
      console.error("Error fetching VPN list:", e);
      setSeAccounts([]);
      if (e.message && e.message.includes("Cannot GET /api/vpnlist")) {
        showMessage(
          "error",
          "VPN list endpoint not implemented on server yet. Please implement GET /api/vpnlist endpoint.",
        );
      } else {
        showMessage(
          "error",
          "Failed to fetch VPN list: " + (e.message || "Unknown error"),
        );
      }
    } finally {
      setLoading((prev) => ({ ...prev, seList: false }));
    }
  };

  const handleSeConnect = async () => {
    if (!seForm.connectionName.trim()) {
      showMessage("error", "Please enter Connection Name to connect.");
      return;
    }
    try {
      setLoading((prev) => ({ ...prev, seConnect: true }));
      await seConnectVpn(seForm.connectionName);

      // Enable VPN client and autostart so it starts automatically after reboot
      try {
        const en = await seVpnEnable();
        if (en?.message) appendSeLog(`Enable: ${en.message}`);

        const ae = await seAutoStartEnable(seForm.connectionName);
        if (ae?.message) appendSeLog(`Autostart: ${ae.message}`);

        // Update localStorage to reflect autostart is enabled
        try {
          localStorage.setItem("softetherAutoStart", "yes");
        } catch {}
        setEnableSeChoice("yes");
        setShowSeAdvanced(true);
      } catch (enableError) {
        console.error("Error enabling SoftEther autostart:", enableError);
        appendSeLog(`Autostart enable warning: ${enableError.message}`);
        // Don't fail the whole operation if autostart enable fails
      }

      showMessage(
        "success",
        "VPN connected successfully with autostart enabled",
      );
      // Immediately check status after connection
      const connectionName = seForm.connectionName;
      setTimeout(async () => {
        try {
          setLoading((prev) => ({ ...prev, seStatus: true }));
          const res = await seVpnStatus(connectionName);

          if (res?.error) {
            setSeStatus("Stopped");
            appendSeLog(`Status API Error: ${res.error}`);
          } else {
            const rawText = (
              res?.status ||
              res?.output ||
              res?.responseData ||
              res?.message ||
              ""
            ).toString();
            if (rawText) {
              appendSeLog(rawText);
            }

            if (rawText || (res && (res.responseData || res.message))) {
              const statusText = (
                rawText ||
                res.responseData ||
                res.message ||
                "Unknown"
              ).toString();
              const statusLower = statusText.toLowerCase();

              if (
                statusLower.includes("running") ||
                statusLower.includes("connected") ||
                statusLower.includes("established") ||
                statusLower.includes("the command completed successfully") ||
                statusLower.includes("session status")
              ) {
                setSeStatus("Running");
              } else if (
                statusLower.includes("stopped") ||
                statusLower.includes("offline") ||
                statusLower.includes("disconnected")
              ) {
                setSeStatus("Stopped");
              } else if (
                statusLower.includes("connecting") ||
                statusLower.includes("retrying")
              ) {
                setSeStatus("Connecting");
              } else {
                setSeStatus("Unknown");
              }
            } else {
              setSeStatus("Unknown");
            }
          }
        } catch (e) {
          console.error("Error getting SoftEther status after connect:", e);
          if (e.response && e.response.status === 500) {
            setSeStatus("Stopped");
            appendSeLog(`Status API Error: ${e.message}`);
          } else {
            setSeStatus("Unknown");
            appendSeLog(`Status API Error: ${e.message}`);
          }
        } finally {
          setLoading((prev) => ({ ...prev, seStatus: false }));
        }
      }, 1000);
    } catch (e) {
      showMessage("error", e?.message || "SoftEther connect failed");
    } finally {
      setLoading((prev) => ({ ...prev, seConnect: false }));
    }
  };

  const handleSeDelete = async (connectionName) => {
    if (!connectionName.trim()) {
      showMessage("error", "Please enter Connection Name to delete.");
      return;
    }

    // Show browser confirmation dialog
    const confirmed = window.confirm(
      `Are you sure you want to delete the VPN connection "${connectionName}"? This will disconnect the VPN and remove the profile.`,
    );
    if (!confirmed) {
      return;
    }

    try {
      setLoading((prev) => ({ ...prev, seDelete: true }));

      // Disconnect VPN first if it's the current connection
      if (seForm.connectionName === connectionName) {
        try {
          await seDisconnectVpn(connectionName);
          appendSeLog(`Disconnected: ${connectionName}`);
        } catch (disconnectError) {
          console.log(
            "Disconnect failed (may not be connected):",
            disconnectError,
          );
        }
      }

      // Delete the VPN account
      await seVpnDelete(connectionName);
      showMessage("success", "VPN account deleted successfully");

      // Clear form if this was the current connection
      if (seForm.connectionName === connectionName) {
        setSeForm({
          connectionName: "",
          server: "",
          hub: "",
          username: "",
          password: "",
          port: "",
          clientIp: "",
          netmask: "",
        });
        setSeCertFile(null);
        setSeKeyFile(null);
        setSeStatus("Unknown");
        setSeLogs("");
        setIsProfileCreated(false); // Reset profile created state
        // Remove persisted profile
        try {
          localStorage.removeItem("seProfile");
        } catch {}
        appendSeLog(
          `Form cleared after deleting connection: ${connectionName}`,
        );
      }

      await handleSeList();
    } catch (e) {
      console.error("Error deleting VPN account:", e);
      showMessage("error", e?.message || "Failed to delete VPN account");
    } finally {
      setLoading((prev) => ({ ...prev, seDelete: false }));
    }
  };

  const handleSeState = async () => {
    try {
      setLoading((prev) => ({ ...prev, seState: true }));
      const res = await seVpnState();
      if (res?.message) appendSeLog(`VPN State: ${res.message}`);
    } catch (e) {
      console.error("Error getting VPN state:", e);
      showMessage("error", e?.message || "Failed to get VPN state");
    } finally {
      setLoading((prev) => ({ ...prev, seState: false }));
    }
  };

  // Remove selected file
  const handleRemoveFile = () => {
    setSelectedFile(null);
    setForm((prev) => ({ ...prev, vpnCertName: "No file chosen" }));
    // Reset the file input
    const fileInput = document.getElementById("vpn-file-upload");
    if (fileInput) {
      fileInput.value = "";
    }
  };

  // Message handling
  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 5000);
  };

  // OpenVPN API functions
  const handleFileUpload = async () => {
    // Check if SoftEther VPN is running
    if (seStatus === "Running" || seStatus === "Connecting") {
      window.alert(
        "SoftEther VPN is currently running. Please stop SoftEther VPN first before starting OpenVPN.",
      );
      return;
    }

    if (!selectedFile) {
      showMessage("error", "Please select a file first");
      return;
    }

    setLoading((prev) => ({ ...prev, upload: true }));
    try {
      const response = await uploadOpenVpnFile(selectedFile);
      if (response.response) {
        showMessage(
          "success",
          "OpenVPN configuration file uploaded successfully!",
        );
        setSelectedFile(null);
        setForm((prev) => ({ ...prev, vpnCertName: "No file chosen" }));

        // Auto-start VPN after a successful upload
        try {
          setLoading((prev) => ({ ...prev, start: true }));
          const startRes = await startOpenVpn();
          if (startRes.response) {
            // Enable autostart so VPN starts automatically after reboot
            try {
              await axiosInstance.post("/openvpn_op", { type: "enable" });
              // Update localStorage to reflect autostart is enabled
              localStorage.setItem("openvpnAutoStart", "true");
              setEnableChoice("yes");
              setShowAdvanced(true);
            } catch (enableError) {
              console.error("Error enabling OpenVPN autostart:", enableError);
              // Don't fail the whole operation if autostart enable fails
            }
            showMessage(
              "success",
              "OpenVPN started automatically after upload with autostart enabled.",
            );
          } else {
            showMessage(
              "error",
              startRes.message || "Failed to start OpenVPN after upload",
            );
          }
        } catch (e) {
          showMessage(
            "error",
            e?.message || "Failed to start OpenVPN after upload",
          );
        } finally {
          setLoading((prev) => ({ ...prev, start: false }));
        }

        // Auto-check status after attempting to start
        try {
          await handleCheckStatus();
        } catch {
          /* handled inside */
        }
      } else {
        showMessage(
          "error",
          response.message || "Failed to upload OpenVPN configuration file",
        );
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      if (error.message === "Network Error") {
        showMessage("error", "Network error. Please check your connection.");
      } else {
        showMessage(
          "error",
          error.message || "Failed to upload OpenVPN configuration file",
        );
      }
    } finally {
      setLoading((prev) => ({ ...prev, upload: false }));
    }
  };

  const handleStartVpn = async () => {
    // Check if SoftEther VPN is running
    if (seStatus === "Running" || seStatus === "Connecting") {
      window.alert(
        "SoftEther VPN is currently running. Please stop SoftEther VPN first before starting OpenVPN.",
      );
      return;
    }

    setLoading((prev) => ({ ...prev, start: true }));
    try {
      const response = await startOpenVpn();
      if (response.response) {
        // Enable autostart so VPN starts automatically after reboot
        try {
          await axiosInstance.post("/openvpn_op", { type: "enable" });
          // Update localStorage to reflect autostart is enabled
          localStorage.setItem("openvpnAutoStart", "true");
          setEnableChoice("yes");
          setShowAdvanced(true);
        } catch (enableError) {
          console.error("Error enabling OpenVPN autostart:", enableError);
          // Don't fail the whole operation if autostart enable fails
        }
        showMessage(
          "success",
          "OpenVPN started successfully and autostart enabled!",
        );
        // Refresh status after starting
        setTimeout(() => handleCheckStatus(), 1000);
      } else {
        showMessage("error", response.message || "Failed to start OpenVPN");
      }
    } catch (error) {
      console.error("Error starting VPN:", error);
      if (error.message === "Network Error") {
        showMessage("error", "Network error. Please check your connection.");
      } else {
        showMessage("error", error.message || "Failed to start OpenVPN");
      }
    } finally {
      setLoading((prev) => ({ ...prev, start: false }));
    }
  };

  const handleStopVpn = async () => {
    setLoading((prev) => ({ ...prev, stop: true }));
    try {
      const response = await stopOpenVpn();
      if (response.response) {
        showMessage("success", "OpenVPN stopped successfully!");
        // Set status to Stopped immediately
        setVpnStatus("Stopped");
        // Refresh status after stopping
        setTimeout(() => handleCheckStatus(), 1000);
      } else {
        showMessage("error", response.message || "Failed to stop OpenVPN");
      }
    } catch (error) {
      console.error("Error stopping VPN:", error);
      if (error.message === "Network Error") {
        showMessage("error", "Network error. Please check your connection.");
      } else {
        showMessage("error", error.message || "Failed to stop OpenVPN");
      }
    } finally {
      setLoading((prev) => ({ ...prev, stop: false }));
    }
  };

  const handleCheckStatus = async () => {
    setLoading((prev) => ({ ...prev, status: true }));
    try {
      const response = await getOpenVpnStatus();

      // Check if we got a valid response (even if response.response is false)
      if (response && (response.responseData || response.message)) {
        // Get status from responseData or message
        const status = response.responseData || response.message || "Unknown";

        // Map the status to proper display values
        if (
          status.toLowerCase().includes("running") ||
          status.toLowerCase().includes("started")
        ) {
          setVpnStatus("Running");
        } else if (
          status.toLowerCase().includes("stopped") ||
          status.toLowerCase().includes("not running")
        ) {
          setVpnStatus("Stopped");
        } else if (
          status.toLowerCase().includes("unknown") ||
          status.toLowerCase().includes("error")
        ) {
          setVpnStatus("Unknown");
        } else {
          setVpnStatus(status);
        }
      } else {
        // Only show Unknown if we have no response at all (server not connected)
        setVpnStatus("Unknown");
        showMessage(
          "error",
          "Failed to get OpenVPN status - server may not be connected",
        );
      }
    } catch (error) {
      console.error("Error getting VPN status:", error);
      // Only show Unknown for network errors or server connection issues
      if (error.message === "Network Error") {
        setVpnStatus("Unknown");
        showMessage("error", "Network error. Please check your connection.");
      } else {
        setVpnStatus("Unknown");
        showMessage("error", error.message || "Failed to get OpenVPN status");
      }
    } finally {
      setLoading((prev) => ({ ...prev, status: false }));
    }
  };

  const handleRefreshLogs = async () => {
    setLoading((prev) => ({ ...prev, logs: true }));
    try {
      const response = await getOpenVpnLogs();
      if (response.response) {
        setVpnLogs(response.responseData || "");
      } else {
        showMessage("error", response.message || "Failed to get OpenVPN logs");
      }
    } catch (error) {
      console.error("Error getting VPN logs:", error);
      if (error.message === "Network Error") {
        showMessage("error", "Network error. Please check your connection.");
      } else {
        showMessage("error", error.message || "Failed to get OpenVPN logs");
      }
    } finally {
      setLoading((prev) => ({ ...prev, logs: false }));
    }
  };

  // Load initial status when component mounts
  useEffect(() => {
    // Initialize autostart from localStorage and prepare UI
    const saved = localStorage.getItem("openvpnAutoStart");
    const enabled = saved === null ? true : saved === "true";
    setShowAdvanced(enabled);
    setEnableChoice(enabled ? "yes" : "no");
    if (form.vpnType === "openvpn" && enabled) {
      handleCheckStatus();
      handleRefreshLogs();
    }
  }, [form.vpnType]);

  // Initialize SoftEther form whenever SoftEther tab is active (open or refresh)
  useEffect(() => {
    if (form.vpnType !== "softethervpn") return;

    // Immediate status check when SoftEther VPN tab is selected
    appendSeLog("SoftEther VPN tab opened - checking status...");

    const initializeSeProfile = async () => {
      // Clear old logs when (re)opening the SoftEther tab to avoid mixing profiles
      setSeLogs("");
      const stored = loadSeProfile();
      let connectionNameToCheck = null;

      if (stored && stored.connectionName) {
        console.log("Restoring stored profile:", stored);
        connectionNameToCheck = stored.connectionName;
        setSeForm({
          connectionName: stored.connectionName || "",
          server: stored.server || "",
          hub: stored.hub || "",
          username: stored.username || "",
          password: stored.password || "",
          port: stored.port || "",
          clientIp: stored.clientIp || "",
          netmask: stored.netmask || "",
        });
        if (stored.authMethod) setAuthMethod(stored.authMethod);
        setIsProfileCreated(true);
      } else {
        // Fallback: try backend list to infer current connection
        try {
          const res = await seVpnList();
          const first = Array.isArray(res?.accounts) ? res.accounts[0] : null;
          if (first && first.name) {
            console.log("Found connection from list:", first);
            connectionNameToCheck = first.name;

            // Extract server and port from server field
            let server = "";
            let port = "";
            if (first.server) {
              const serverMatch = first.server.match(/^([^:]+):(\d+)/);
              if (serverMatch) {
                server = serverMatch[1];
                port = serverMatch[2];
              }
            }

            setSeForm({
              connectionName: first.name || "",
              server: server,
              hub: first.hub || "",
              username: "", // Not available in list API
              password: "", // Not available in list API
              port: port,
              clientIp: "", // Not available in list API
              netmask: "", // Not available in list API
            });
            setIsProfileCreated(true);
          }
        } catch (e) {
          console.log("List API failed, no profile to restore");
        }
      }

      // Immediately check status if we have a connection name
      if (connectionNameToCheck && connectionNameToCheck.trim()) {
        appendSeLog(
          `Checking VPN status for connection: ${connectionNameToCheck}`,
        );
        // Use a small delay to ensure state is updated, then check status
        setTimeout(async () => {
          try {
            const res = await seVpnStatus(connectionNameToCheck);

            // Check if response contains an error field
            if (res?.error) {
              setSeStatus("Stopped");
              appendSeLog(`Status API Error: ${res.error}`);
            } else {
              // Process the status response
              const rawText = (
                res?.status ||
                res?.output ||
                res?.responseData ||
                res?.message ||
                ""
              ).toString();
              if (rawText) {
                appendSeLog(rawText);
              }

              if (rawText || (res && (res.responseData || res.message))) {
                const statusText = (
                  rawText ||
                  res.responseData ||
                  res.message ||
                  "Unknown"
                ).toString();
                const statusLower = statusText.toLowerCase();

                if (
                  statusLower.includes("running") ||
                  statusLower.includes("connected") ||
                  statusLower.includes("established") ||
                  statusLower.includes("the command completed successfully") ||
                  statusLower.includes("session status")
                ) {
                  setSeStatus("Running");
                } else if (
                  statusLower.includes("stopped") ||
                  statusLower.includes("offline") ||
                  statusLower.includes("disconnected")
                ) {
                  setSeStatus("Stopped");
                } else if (
                  statusLower.includes("connecting") ||
                  statusLower.includes("retrying")
                ) {
                  setSeStatus("Connecting");
                } else {
                  setSeStatus("Unknown");
                }
              } else {
                setSeStatus("Unknown");
              }
            }
          } catch (e) {
            console.error("Error getting SoftEther status:", e);
            if (e.response && e.response.status === 500) {
              setSeStatus("Stopped");
              appendSeLog(`Status API Error: ${e.message}`);
            } else {
              setSeStatus("Unknown");
              appendSeLog(`Status API Error: ${e.message}`);
            }
          }
        }, 100); // Small delay to ensure state is set
      } else {
        appendSeLog("No connection name found; skipping status check.");
      }
    };

    initializeSeProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.vpnType]);

  // Enable/Disable OpenVPN radio state
  const [enableChoice, setEnableChoice] = useState("yes");
  const [enableSeChoice, setEnableSeChoice] = useState("yes");

  // Track SoftEther advanced visibility similar to OpenVPN
  const [showSeAdvanced, setShowSeAdvanced] = useState(true);

  // Initialize saved SoftEther autostart choice on tab open
  useEffect(() => {
    if (form.vpnType !== "softethervpn") return;
    try {
      const saved = localStorage.getItem("softetherAutoStart");
      if (saved === "yes" || saved === "no") {
        setEnableSeChoice(saved);
        setShowSeAdvanced(saved === "yes");
      } else {
        // default ON to match previous behavior
        setShowSeAdvanced(true);
      }
    } catch {}
  }, [form.vpnType]);

  const handleSaveEnable = async () => {
    const enable = enableChoice === "yes";
    const confirmation = window.confirm(
      `Are you sure you want to ${enable ? "turn ON" : "turn OFF"} AutoStart for OpenVPN?${!enable ? " This will also stop and disconnect the currently running VPN." : ""}`,
    );
    if (!confirmation) return;

    // Optimistic UI for snappy response
    const prevEnabled = localStorage.getItem("openvpnAutoStart") === "true";
    localStorage.setItem("openvpnAutoStart", String(enable));
    setShowAdvanced(enable);
    if (!enable) setVpnStatus("Stopped");
    setLoading((prev) => ({ ...prev, toggle: true }));

    try {
      // If disabling autostart, also stop the running VPN
      if (!enable) {
        try {
          const stopResponse = await stopOpenVpn();
          if (stopResponse.response) {
            showMessage(
              "success",
              "OpenVPN stopped and disconnected successfully!",
            );
            setVpnStatus("Stopped");
            // Refresh status after stopping
            setTimeout(() => handleCheckStatus(), 1000);
          } else {
            showMessage(
              "warning",
              stopResponse.message || "VPN may still be running",
            );
          }
        } catch (stopError) {
          console.error("Error stopping VPN:", stopError);
          showMessage(
            "warning",
            "Failed to stop VPN: " + (stopError.message || "Unknown error"),
          );
        }
      }

      // Disable/enable autostart on boot
      await axiosInstance.post("/openvpn_op", {
        type: enable ? "enable" : "disable",
      });

      // Defer heavy calls in background to avoid perceived slowness
      if (enable) {
        setTimeout(() => {
          handleCheckStatus();
          handleRefreshLogs();
        }, 50);
      }

      window.alert(
        enable
          ? "AutoStart: ON. OpenVPN will start automatically after reboot."
          : "AutoStart: OFF. OpenVPN stopped and will not start automatically after reboot.",
      );
    } catch (e) {
      // Revert UI on failure
      localStorage.setItem("openvpnAutoStart", String(prevEnabled));
      setShowAdvanced(prevEnabled);
      showMessage("error", e?.message || "Failed to update OpenVPN state");
    } finally {
      setLoading((prev) => ({ ...prev, toggle: false }));
    }
  };

  const handleSaveSeEnable = async () => {
    const enable = enableSeChoice === "yes";
    setLoading((prev) => ({ ...prev, toggle: true }));
    try {
      const res = enable ? await seVpnEnable() : await seVpnDisable();
      // Persist selection locally so it sticks on page revisit
      try {
        localStorage.setItem("softetherAutoStart", enable ? "yes" : "no");
      } catch {}
      // Normalize server messages like "disables" vs "disabled"
      const msg = (res?.message || "").toLowerCase();
      if (msg.includes("enable")) {
        setEnableSeChoice("yes");
        setShowSeAdvanced(true);
      } else if (msg.includes("disable")) {
        setEnableSeChoice("no");
        setShowSeAdvanced(false);
      } else {
        setShowSeAdvanced(enable);
      }
      window.alert(
        enable
          ? "AutoStart: ON. SoftEther VPN client will start on boot."
          : "AutoStart: OFF. SoftEther VPN client will not start on boot.",
      );
    } catch (e) {
      // Revert UI on failure
      try {
        const saved = localStorage.getItem("softetherAutoStart");
        if (saved === "yes" || saved === "no") {
          setEnableSeChoice(saved);
          setShowSeAdvanced(saved === "yes");
        }
      } catch {}
      showMessage(
        "error",
        e?.message || "Failed to update SoftEther autostart",
      );
    } finally {
      setLoading((prev) => ({ ...prev, toggle: false }));
    }
  };

  // SoftEther paired field rows (2 per row)
  const seFieldPairs = [
    [
      { label: "Connection Name:", field: "connectionName", type: "text" },
      { label: "Server Address:", field: "server", type: "text" },
    ],
    [
      { label: "Port:", field: "port", type: "text" },
      { label: "HUB Name:", field: "hub", type: "text" },
    ],
    [
      { label: "Username:", field: "username", type: "text" },
      { label: "Password:", field: "password", type: "password" },
    ],
    [
      { label: "Client IP:", field: "clientIp", type: "text" },
      { label: "Netmask:", field: "netmask", type: "text" },
    ],
  ];

  const SeInput = ({ field, type = "text" }) => (
    <input
      type={type}
      value={seForm[field]}
      onChange={handleSeChange(field)}
      disabled={isProfileCreated}
      style={{
        ...(isProfileCreated ? disabledInputStyle : inputStyle),
        flex: 1,
        minWidth: 0,
        width: "100%",
      }}
      onFocus={!isProfileCreated ? inputInteraction.onFocus : undefined}
      onBlur={!isProfileCreated ? inputInteraction.onBlur : undefined}
      onMouseEnter={
        !isProfileCreated ? inputInteraction.onMouseEnter : undefined
      }
      onMouseLeave={
        !isProfileCreated ? inputInteraction.onMouseLeave : undefined
      }
    />
  );

  const seRowLabelStyle = {
    fontSize: 12,
    fontWeight: 600,
    color: C.labelText,
    minWidth: 130,
    flexShrink: 0,
    opacity: isProfileCreated ? 0.6 : 1,
  };

  const ROW = ({ label, children }) => (
    <div
      style={{ display: "flex", alignItems: "center", gap: 12, width: "100%" }}
    >
      <label
        style={{
          fontSize: 12,
          fontWeight: 600,
          color: C.labelText,
          width: "100%",
          maxWidth: 220,
          flexShrink: 0,
        }}
      >
        {label}
      </label>
      <div style={{ flex: 1, minWidth: 0 }}>{children}</div>
    </div>
  );

  return (
    <VpnPageShell>
      {message.text && (
        <Alert
          severity={message.type}
          onClose={() => setMessage({ type: "", text: "" })}
          sx={vpnFixedAlertSx}
        >
          {message.text}
        </Alert>
      )}

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          marginBottom: 12,
        }}
      >
        <VpnBreadcrumb />
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: C.labelText }}>
            VPN Type:
          </span>
          <select
            value={form.vpnType}
            onChange={handleTypeChange}
            style={{ ...selectStyle, width: 220 }}
            onFocus={inputInteraction.onFocus}
            onBlur={inputInteraction.onBlur}
            onMouseEnter={inputInteraction.onMouseEnter}
            onMouseLeave={inputInteraction.onMouseLeave}
          >
            {VPN_TYPES.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div >
        <div style={vpnTableContainerStyle}>
          <div style={vpnToolbarStyle}>
            <span
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: C.labelText,
                letterSpacing: "0.02em",
              }}
            >
              VPN Settings
            </span>
          </div>

          <div style={vpnContentStyle}>
            {/* ── OpenVPN ── */}
            {form.vpnType === "openvpn" && (
              <div>
                <div
                  style={{
                    maxWidth: 680,
                    margin: "0 auto",
                    display: "flex",
                    flexDirection: "column",
                    gap: 18,
                  }}
                >
                  <ROW label="AutoStart OPENVPN:">
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 24,
                        }}
                      >
                        <label
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                            cursor: "pointer",
                            userSelect: "none",
                          }}
                        >
                          <input
                            type="radio"
                            name="enableOpenVpn"
                            checked={enableChoice === "yes"}
                            onChange={() => setEnableChoice("yes")}
                            style={{ accentColor: OUTLINED_FOCUS }}
                          />
                          <span style={{ fontSize: 13, color: C.valueText }}>
                            Yes
                          </span>
                        </label>
                        <label
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                            cursor: "pointer",
                            userSelect: "none",
                          }}
                        >
                          <input
                            type="radio"
                            name="enableOpenVpn"
                            checked={enableChoice === "no"}
                            onChange={() => setEnableChoice("no")}
                            style={{ accentColor: OUTLINED_FOCUS }}
                          />
                          <span style={{ fontSize: 13, color: C.valueText }}>
                            No
                          </span>
                        </label>
                      </div>
                      <Btn
                        variant="primary"
                        onClick={handleSaveEnable}
                        disabled={loading.toggle}
                        style={vpnCompactBtnStyle}
                      >
                        {loading.toggle ? "Saving..." : "Save"}
                      </Btn>
                    </div>
                  </ROW>

                  {showAdvanced && (
                    <>
                      <div style={{ height: 1, background: C.divider }} />

                      <ROW label="Configuration File:">
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                            justifyContent: "space-between",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 8,
                              flex: 1,
                              minWidth: 0,
                            }}
                          >
                            <input
                              id="vpn-file-upload"
                              type="file"
                              accept=".ovpn,.conf"
                              onChange={handleCertChange}
                              style={{ display: "none" }}
                            />
                            <label
                              htmlFor="vpn-file-upload"
                              style={vpnChooseFileLabelStyle}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = "#b6c2d3";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = "#cbd5e1";
                              }}
                            >
                              Choose File
                            </label>
                            <span
                              style={{
                                fontSize: 11,
                                color: C.mutedText,
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                                minWidth: 0,
                              }}
                              title={
                                selectedFile
                                  ? selectedFile.name
                                  : "No file chosen"
                              }
                            >
                              {selectedFile
                                ? selectedFile.name
                                : "No file chosen"}
                            </span>
                          </div>
                          <Btn
                            variant="primary"
                            onClick={handleFileUpload}
                            disabled={loading.upload || !selectedFile}
                            startIcon={
                              loading.upload ? (
                                <CircularProgress size={13} color="inherit" />
                              ) : (
                                <UploadIcon sx={{ fontSize: 13 }} />
                              )
                            }
                            style={{ ...vpnActionBtnStyle, minWidth: 105, flexShrink: 0 }}
                          >
                            {loading.upload ? "Uploading..." : "Upload File"}
                          </Btn>
                        </div>
                      </ROW>

                      <ROW label="Current Status:">
                        <Chip
                          label={vpnStatus}
                          size="small"
                          sx={{
                            fontSize: 12,
                            fontWeight: 700,
                            borderRadius: "6px",
                            color: "#fff",
                            px: 0.5,
                            backgroundColor:
                              vpnStatus === "Running"
                                ? "#16a34a"
                                : vpnStatus === "Stopped"
                                  ? C.errorRed
                                  : "#ea580c",
                          }}
                        />
                      </ROW>

                      <div style={{ height: 1, background: C.divider }} />

                      <div
                        style={{
                          display: "flex",
                          justifyContent: "center",
                          gap: 12,
                          paddingTop: 4,
                          paddingBottom: 4,
                        }}
                      >
                        <Btn
                          variant="primary"
                          onClick={handleStartVpn}
                          disabled={loading.start}
                          startIcon={
                            loading.start ? (
                              <CircularProgress size={13} color="inherit" />
                            ) : (
                              <StartIcon sx={{ fontSize: 13 }} />
                            )
                          }
                          style={vpnActionBtnStyle}
                        >
                          {loading.start ? "Starting..." : "Start VPN"}
                        </Btn>
                        <Btn
                          variant="primary"
                          onClick={handleStopVpn}
                          disabled={loading.stop}
                          startIcon={
                            loading.stop ? (
                              <CircularProgress size={13} color="inherit" />
                            ) : (
                              <StopIcon sx={{ fontSize: 13 }} />
                            )
                          }
                          style={vpnActionBtnStyle}
                        >
                          {loading.stop ? "Stopping..." : "Stop VPN"}
                        </Btn>
                        <Btn
                          variant="cancel"
                          onClick={handleCheckStatus}
                          disabled={loading.status}
                          startIcon={
                            loading.status ? (
                              <CircularProgress size={13} color="inherit" />
                            ) : (
                              <CheckCircleIcon sx={{ fontSize: 13 }} />
                            )
                          }
                          style={{ ...vpnActionBtnStyle, minWidth: 130 }}
                        >
                          {loading.status ? "Checking..." : "Check Status"}
                        </Btn>
                      </div>
                    </>
                  )}
                </div>

                {showAdvanced && (
                  <div
                    style={{
                      marginTop: 32,
                      borderTop: `1px solid ${C.divider}`,
                      paddingTop: 20,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginBottom: 12,
                      }}
                    >
                      <div>
                        <span
                          style={{
                            fontSize: 13,
                            fontWeight: 700,
                            color: C.strongText,
                          }}
                        >
                          VPN Logs
                        </span>
                        <span
                          style={{
                            fontSize: 11,
                            color: C.mutedText,
                            marginLeft: 8,
                          }}
                        >
                          Live output from the OpenVPN service
                        </span>
                      </div>
                      <Btn
                        variant="cancel"
                        onClick={handleRefreshLogs}
                        disabled={loading.logs}
                        startIcon={
                          loading.logs ? (
                            <CircularProgress size={13} color="inherit" />
                          ) : (
                            <RefreshIcon sx={{ fontSize: 13 }} />
                          )
                        }
                      >
                        {loading.logs ? "Refreshing..." : "Refresh Logs"}
                      </Btn>
                    </div>
                    <textarea
                      value={vpnLogs || "No logs available"}
                      readOnly
                      style={vpnLogTextareaStyle}
                    />
                  </div>
                )}
              </div>
            )}

            {/* ── SoftEtherVPN ── */}
            {form.vpnType === "softethervpn" && (
              <div>
                <div
                  style={{
                    maxWidth: 680,
                    margin: "0 auto 24px",
                    display: "flex",
                    flexDirection: "column",
                    gap: 18,
                  }}
                >
                  <ROW label="AutoStart SoftEtherVPN:">
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 24,
                        }}
                      >
                        <label
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                            cursor: "pointer",
                            userSelect: "none",
                          }}
                        >
                          <input
                            type="radio"
                            name="enableSeTop"
                            checked={enableSeChoice === "yes"}
                            onChange={() => setEnableSeChoice("yes")}
                            style={{ accentColor: OUTLINED_FOCUS }}
                          />
                          <span style={{ fontSize: 13, color: C.valueText }}>
                            Yes
                          </span>
                        </label>
                        <label
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                            cursor: "pointer",
                            userSelect: "none",
                          }}
                        >
                          <input
                            type="radio"
                            name="enableSeTop"
                            checked={enableSeChoice === "no"}
                            onChange={() => setEnableSeChoice("no")}
                            style={{ accentColor: OUTLINED_FOCUS }}
                          />
                          <span style={{ fontSize: 13, color: C.valueText }}>
                            No
                          </span>
                        </label>
                      </div>
                      <Btn
                        variant="primary"
                        onClick={handleSaveSeEnable}
                        disabled={loading.toggle}
                        style={vpnCompactBtnStyle}
                      >
                        {loading.toggle ? "Saving..." : "Save"}
                      </Btn>
                    </div>
                  </ROW>
                </div>

                {showSeAdvanced && (
                  <>
                    {/* Inner config box — no cut lines, clean card */}
                    <div
                      style={{
                        background: "#f8fafc",
                        borderRadius: CARD_RADIUS,
                        border: `1px solid ${C.cardBorder}`,
                        padding: "20px 24px",
                        marginBottom: 14,
                      }}
                    >
                      <div
                        style={{
                          fontSize: 13,
                          fontWeight: 700,
                          color: C.strongText,
                          marginBottom: 18,
                        }}
                      >
                        SoftEtherVPN Configuration
                      </div>

                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 14,
                          marginBottom: 16,
                        }}
                      >
                        {seFieldPairs.map((pair, pairIdx) => (
                          <div
                            key={pairIdx}
                            style={{ display: "flex", gap: 24 }}
                          >
                            {pair.map(({ label, field, type }) => (
                              <div
                                key={field}
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 10,
                                  flex: 1,
                                  minWidth: 0,
                                }}
                              >
                                <label style={seRowLabelStyle}>{label}</label>
                                <SeInput field={field} type={type} />
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>

                      <div
                        style={{
                          height: 1,
                          background: C.divider,
                          margin: "4px 0 14px",
                        }}
                      />

                      <div
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          color: C.mutedText,
                          textTransform: "uppercase",
                          letterSpacing: "0.07em",
                          marginBottom: 12,
                        }}
                      >
                        Authentication
                      </div>

                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          maxWidth: 460,
                          marginBottom: authMethod === "certificate" ? 12 : 0,
                        }}
                      >
                        <label style={{ ...seRowLabelStyle, opacity: 1 }}>
                          Auth Method:
                        </label>
                        <select
                          value={authMethod}
                          onChange={(e) => setAuthMethod(e.target.value)}
                          style={{ ...selectStyle, flex: 1 }}
                          onFocus={inputInteraction.onFocus}
                          onBlur={inputInteraction.onBlur}
                          onMouseEnter={inputInteraction.onMouseEnter}
                          onMouseLeave={inputInteraction.onMouseLeave}
                        >
                          <option value="password">Password</option>
                          <option value="certificate">Certificate</option>
                        </select>
                      </div>

                      {authMethod === "certificate" && (
                        <div
                          style={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: 16,
                            paddingLeft: 140,
                            marginTop: 8,
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 8,
                            }}
                          >
                            <input
                              id="se-cert"
                              type="file"
                              accept=".cer,.crt"
                              style={{ display: "none" }}
                              onChange={handleSeCert}
                            />
                            <label
                              htmlFor="se-cert"
                              style={vpnUploadLabelStyle}
                            >
                              Upload Cert (.cer)
                            </label>
                            <span style={{ fontSize: 11, color: C.mutedText }}>
                              {seCertFile ? seCertFile.name : "No file"}
                            </span>
                          </div>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 8,
                            }}
                          >
                            <input
                              id="se-key"
                              type="file"
                              accept=".key"
                              style={{ display: "none" }}
                              onChange={handleSeKey}
                            />
                            <label
                              htmlFor="se-key"
                              style={vpnUploadLabelStyle}
                            >
                              Upload Key (.key)
                            </label>
                            <span style={{ fontSize: 11, color: C.mutedText }}>
                              {seKeyFile ? seKeyFile.name : "No file"}
                            </span>
                          </div>
                        </div>
                      )}

                      <div
                        style={{
                          height: 1,
                          background: C.divider,
                          margin: "14px 0",
                        }}
                      />

                      <div
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          color: C.mutedText,
                          textTransform: "uppercase",
                          letterSpacing: "0.07em",
                          marginBottom: 10,
                        }}
                      >
                        Connection Status
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                        }}
                      >
                        <label style={{ ...seRowLabelStyle, opacity: 1 }}>
                          Current Status:
                        </label>
                        <Chip
                          label={seStatus}
                          size="small"
                          sx={{
                            fontSize: 12,
                            fontWeight: 700,
                            borderRadius: "6px",
                            color: "#fff",
                            px: 0.5,
                            backgroundColor:
                              seStatus === "Running"
                                ? "#16a34a"
                                : seStatus === "Stopped"
                                  ? C.errorRed
                                  : seStatus === "Connecting"
                                    ? "#2563eb"
                                    : "#ea580c",
                          }}
                        />
                      </div>
                    </div>

                    {/* Action buttons — outside the config box */}
                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: 10,
                        marginBottom: 28,
                      }}
                    >
                      {!isProfileCreated ? (
                        <Btn
                          variant="primary"
                          onClick={handleSeCreateFlow}
                          disabled={loading.seCreate || !areSeFieldsFilled()}
                          style={{ ...vpnActionBtnStyle, minWidth: 130 }}
                        >
                          {loading.seCreate
                            ? "Processing..."
                            : "Create & Connect"}
                        </Btn>
                      ) : (
                        <>
                          {seStatus === "Running" ||
                          seStatus === "Connecting" ? (
                            <Btn
                              variant="error"
                              onClick={handleSeDisconnect}
                              disabled={
                                loading.seDisconnect ||
                                !seForm.connectionName.trim()
                              }
                              style={vpnActionBtnStyle}
                            >
                              {loading.seDisconnect
                                ? "Disconnecting..."
                                : "Disconnect"}
                            </Btn>
                          ) : (
                            <Btn
                              variant="primary"
                              onClick={handleSeConnect}
                              disabled={
                                loading.seConnect ||
                                !seForm.connectionName.trim()
                              }
                              style={vpnActionBtnStyle}
                            >
                              {loading.seConnect ? "Connecting..." : "Connect"}
                            </Btn>
                          )}
                          <Btn
                            variant="cancel"
                            onClick={() => handleSeStatus(false)}
                            disabled={loading.seStatus}
                            style={vpnActionBtnStyle}
                          >
                            {loading.seStatus ? "Checking..." : "Check Status"}
                          </Btn>
                          <Btn
                            variant="default"
                            onClick={handleSeState}
                            disabled={loading.seState}
                            style={{ ...vpnActionBtnStyle, minWidth: 100 }}
                          >
                            {loading.seState ? "Checking..." : "VPN State"}
                          </Btn>
                          <Btn
                            variant="error"
                            onClick={() =>
                              handleSeDelete(seForm.connectionName)
                            }
                            disabled={loading.seDelete}
                            style={vpnActionBtnStyle}
                          >
                            {loading.seDelete
                              ? "Deleting..."
                              : "Delete Profile"}
                          </Btn>
                        </>
                      )}
                    </div>

                    {/* SoftEther Logs */}
                    <div
                      style={{
                        borderTop: `1px solid ${C.divider}`,
                        paddingTop: 20,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          marginBottom: 12,
                        }}
                      >
                        <div>
                          <span
                            style={{
                              fontSize: 13,
                              fontWeight: 700,
                              color: C.strongText,
                            }}
                          >
                            SoftEther Logs
                          </span>
                          <span
                            style={{
                              fontSize: 11,
                              color: C.mutedText,
                              marginLeft: 8,
                            }}
                          >
                            Client activity log
                          </span>
                        </div>
                        <Btn variant="cancel" onClick={() => setSeLogs("")}>
                          Clear Logs
                        </Btn>
                      </div>
                      <textarea
                        value={seLogs || "No logs yet"}
                        readOnly
                        style={vpnLogTextareaStyle}
                      />
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </VpnPageShell>
  );
};

export default SystemToolsVPN;
