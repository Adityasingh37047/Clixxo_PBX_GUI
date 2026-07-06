import React, { useEffect, useRef, useState } from "react";
import Tooltip from "@mui/material/Tooltip";
import { InfoOutlined } from "@mui/icons-material"; 
import {
  UPGRADE_TABLE_HEADERS,
  UPGRADE_LABELS,
  UPGRADE_BUTTON_LABELS,
  UPGRADE_BUTTON_VARIANTS,
  UPGRADE_BUTTON_STYLE,
  UPGRADE_BREADCRUMB,
  UPGRADE_STATUS,
  UPGRADE_BUTTON_STATUS,
  UPGRADE_TOOLTIPS,
  UPGRADE_MESSAGES,
  UPGRADE_TIMINGS,
  UPGRADE_FILE,
  UPGRADE_COMMANDS,
  UPGRADE_ROUTES,
  UPGRADE_API,
} from "../../../constants/UpgradeConstants";
import { Alert, CircularProgress } from "@mui/material";
import {
  uploadSoftwareUpdate,
  postLinuxCmd,
  fetchSystemInfo,
} from "../../../api/apiService";
import axiosInstance from "../../../api/axiosInstance";

// ── Color palette (same as UserManage) ────────────────────────────────────────
const C = {
  pageBg: "#f8fafc",
  cardBg: "#ffffff",
  cardBorder: "#d8dde5",
  cardShadow:
  "0 0 14px rgba(0, 0, 0, 0.18), 0 0 5px rgba(0, 0, 0, 0.10)",
  divider: "#e2e6ec",
  labelText: "#3E5475",
  valueText: "#1f2937",
  mutedText: "#94a3b8",
  strongText: "#1e293b",
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


// ── Button Component (same as UserManage) ────────────────────────────────────
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
    cancel: {
      background: "#cbd5e1",
      color: "#374151",
      border: "1px solid #cbd5e1",
      boxShadow: "0 1px 2px rgba(15, 23, 42, 0.08)",
    },
    edit: {
      background: "#dcfce7",
      color: "#166534",
      border: "1px solid #bbf7d0",
    },
    delete: {
      background: "#fee2e2",
      color: "#991b1b",
      border: "1px solid #fecaca",
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

const UpgradePageWrapStyle = {
  backgroundColor: C.pageBg,
  minHeight: "calc(100vh - 80px)",
  padding: 16,
  boxSizing: "border-box",
};

const UpgradePageInnerStyle = {
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
const labelStyle = {
  fontSize: 13,
  fontWeight: 600,
  color: C.labelText,
  textAlign: "left",
};

const valueBoxStyle = {
  padding: "6px 12px",
  borderRadius: 6,
  border: `1px solid ${C.cardBorder}`,
  fontSize: 12,
  fontWeight: 500,
  width: "100%",
  minHeight: 34,
  backgroundColor: "#f8fafc",
  color: C.valueText,
  textAlign: "center",
  lineHeight: 1.45,
  whiteSpace: "normal",
  overflowWrap: "break-word",
  wordBreak: "break-word",
  boxSizing: "border-box",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const formatVersionValue = (raw) => {
  if (raw == null || raw === "") return UPGRADE_STATUS.unavailable;
  if (typeof raw === "object") {
    const parts = [raw.version, raw.timestamp, raw.boot, raw.boot_time, raw.value]
      .filter((v) => v != null && String(v).trim() !== "")
      .map((v) => String(v).trim());
    return parts.length ? parts.join(" ") : UPGRADE_STATUS.unavailable;
  }
  return String(raw).trim() || UPGRADE_STATUS.unavailable;
};

const tooltipProps = {
  arrow: true,
  placement: "top",
  slotProps: {
    tooltip: {
      sx: {
        bgcolor: "#fff",
        color: "#334155",
        border: "1px solid #d1d5db",
        fontSize: 12,
        maxWidth: 500,
        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
      },
    },
    arrow: {
      sx: {
        color: "#fff",
      },
    },
  },
};

const VERSION_FIELDS = [
  {
    key: "serial_no",
    label: UPGRADE_TABLE_HEADERS[0],
    formatter: (val) => val || UPGRADE_STATUS.unavailable,
    tooltip: UPGRADE_TOOLTIPS.serialNumber,
  },
  {
    key: "web_version",
    label: UPGRADE_TABLE_HEADERS[1],
    formatter: (val) => val || UPGRADE_STATUS.unavailable,
    tooltip: UPGRADE_TOOLTIPS.webVersion,
  },
  {
    key: "service",
    label: UPGRADE_TABLE_HEADERS[2],
    formatter: (val) => val || UPGRADE_STATUS.unavailable,
    tooltip: UPGRADE_TOOLTIPS.service,
  },
  {
    key: "uboot",
    label: UPGRADE_TABLE_HEADERS[3],
    formatter: (val) => val || UPGRADE_STATUS.unavailable,
    tooltip: UPGRADE_TOOLTIPS.uboot,
  },
  {
    key: "kernel",
    label: UPGRADE_TABLE_HEADERS[4],
    formatter: (val) => val || UPGRADE_STATUS.unavailable,
    tooltip: UPGRADE_TOOLTIPS.kernel,
  },
  {
    key: "firmware",
    label: UPGRADE_TABLE_HEADERS[5],
    formatter: (val) => val || UPGRADE_STATUS.unavailable,
    tooltip: UPGRADE_TOOLTIPS.firmware,
  },
];

const createInitialRows = (placeholder = UPGRADE_STATUS.loading) =>
  VERSION_FIELDS.map((field) => ({
    ...field,
    version: placeholder,
    timestamp: "",
  }));

const Upgrade = () => {
  const [fileName, setFileName] = useState(UPGRADE_LABELS.noFile);
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [uploading, setUploading] = useState(false);
  const [rebooting, setRebooting] = useState(false);
  const [progressMessage, setProgressMessage] = useState("");
  const [versionRows, setVersionRows] = useState(createInitialRows());
  const [versionLoading, setVersionLoading] = useState(false);
  const fileInputRef = useRef();
  const pingIntervalRef = useRef(null);
  const rebootDelayRef = useRef(null);

  const clearPolling = () => {
    if (pingIntervalRef.current) {
      clearInterval(pingIntervalRef.current);
      pingIntervalRef.current = null;
    }
    if (rebootDelayRef.current) {
      clearTimeout(rebootDelayRef.current);
      rebootDelayRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      clearPolling();
    };
  }, []);

  useEffect(() => {
    loadVersionInfo();
  }, []);

  // Auto-hide alerts after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(""), UPGRADE_TIMINGS.alertHideMs);
      return () => clearTimeout(timer);
    }
  }, [error]);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(""), UPGRADE_TIMINGS.alertHideMs);
      return () => clearTimeout(timer);
    }
  }, [success]);

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    setSelectedFile(f || null);
    setFileName(f ? f.name : UPGRADE_LABELS.noFile);
    setError("");
    setSuccess("");
  };

  const handleReset = () => {
    clearPolling();
    setSelectedFile(null);
    setFileName(UPGRADE_LABELS.noFile);
    setError("");
    setSuccess("");
    setProgressMessage("");
    setUploading(false);
    setRebooting(false);
    loadVersionInfo();
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const loadVersionInfo = async () => {
    setVersionLoading(true);
    setVersionRows(createInitialRows(UPGRADE_STATUS.loading));
    try {
      const res = await postLinuxCmd({
        cmd: UPGRADE_COMMANDS.readVersion,
      });
      if (!res?.response || !res?.responseData) {
        throw new Error(res?.message || UPGRADE_MESSAGES.invalidResponse);
      }

      let parsed = {};
      try {
        parsed = JSON.parse(res.responseData);
      } catch (_) {
        throw new Error(UPGRADE_MESSAGES.parseFailed);
      }

      const updatedRows = VERSION_FIELDS.map((field) => {
        const rawValue = parsed[field.key];
        const normalized = formatVersionValue(rawValue);
        const formatted = field.formatter
          ? field.formatter(normalized)
          : normalized;
        return {
          ...field,
          version: String(formatted),
          timestamp: "",
        };
      });
      setVersionRows(updatedRows);
      setError("");
    } catch (err) {
      console.error("Failed to load version info:", err);
      setVersionRows(createInitialRows(UPGRADE_STATUS.unavailable));
      setError(UPGRADE_MESSAGES.loadVersionFailed);
    } finally {
      setVersionLoading(false);
    }
  };

  const checkDeviceOnline = async () => {
    try {
      await axiosInstance.get(UPGRADE_API.servicePing, { timeout: UPGRADE_TIMINGS.pingTimeoutMs });
      return true;
    } catch (err) {
      if (err?.response?.status === 401 || err?.response?.status === 403) {
        return true; // backend up but session expired
      }
      return false;
    }
  };

  const beginOnlinePolling = () => {
    clearPolling();
    setProgressMessage(UPGRADE_MESSAGES.rebootingWait);
    let attempts = 0;
    pingIntervalRef.current = setInterval(async () => {
      attempts += 1;
      const online = await checkDeviceOnline();
      if (online) {
        clearPolling();
        setProgressMessage(UPGRADE_MESSAGES.backOnline);
        setTimeout(() => {
          window.location.href = UPGRADE_ROUTES.login;
        }, UPGRADE_TIMINGS.redirectDelayMs);
      } else if (attempts >= UPGRADE_TIMINGS.maxPingAttempts) {
        // ~5 minutes
        clearPolling();
        setRebooting(false);
        setProgressMessage("");
        setError(UPGRADE_MESSAGES.deviceOfflineTimeout);
      }
    }, UPGRADE_TIMINGS.pingIntervalMs);
  };

  const initiateReboot = async () => {
    setRebooting(true);
    setProgressMessage(UPGRADE_MESSAGES.initiatingReboot);
    try {
      await postLinuxCmd({ cmd: UPGRADE_COMMANDS.reboot });
    } catch (err) {
      console.warn(
        "Reboot command failed (continuing to poll):",
        err?.message || err,
      );
    }
    rebootDelayRef.current = setTimeout(() => {
      beginOnlinePolling();
    }, UPGRADE_TIMINGS.rebootDelayMs);
  };

  const handleUpdate = async () => {
    setError("");
    setSuccess("");

    if (!selectedFile) {
      setError(UPGRADE_MESSAGES.selectFileRequired);
      return;
    }
    if (!UPGRADE_FILE.tarRegex.test(selectedFile.name)) {
      setError(UPGRADE_MESSAGES.tarOnly);
      return;
    }

    try {
      setUploading(true);
      setProgressMessage(UPGRADE_MESSAGES.uploading);
      const response = await uploadSoftwareUpdate(selectedFile);
      if (!response?.response) {
        throw new Error(
          response?.message || UPGRADE_MESSAGES.uploadFailed,
        );
      }
      setSuccess(response?.message || UPGRADE_MESSAGES.uploadSuccess);
      setUploading(false);

      // Wait 4-5 seconds before rebooting, show loading during wait
      setRebooting(true);
      setProgressMessage(UPGRADE_MESSAGES.preparingReboot);

      await new Promise((resolve) => setTimeout(resolve, UPGRADE_TIMINGS.preRebootWaitMs));

      await initiateReboot();
    } catch (err) {
      console.error("Update upload failed:", err);
      setUploading(false);
      setProgressMessage("");
      const message =
        typeof err === "string"
          ? err
          : err?.message ||
            err?.error ||
            err?.response?.message ||
            UPGRADE_MESSAGES.uploadFailed;
      setError(message);
    }
  };

  return (
    <div
      style={UpgradePageWrapStyle} data-native-scroll>
      <div style={UpgradePageInnerStyle}>
      {(uploading || rebooting) && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-md shadow-xl px-10 py-6 flex flex-col items-center gap-4 max-w-sm text-center">
            <CircularProgress />
            <div className="text-gray-700 text-sm whitespace-pre-line">
              {progressMessage ||
                (rebooting
                  ? UPGRADE_MESSAGES.rebootingPleaseWait
                  : UPGRADE_MESSAGES.uploading)}
            </div>
          </div>
        </div>
      )}

        {/* ── Breadcrumb ── */}
        <div
          style={{
            fontSize: 12,
            color: C.mutedText,
            marginBottom: 16,
            fontWeight: 400,
            display: "flex",
            alignItems: "center",
            gap: 4,
            flexWrap: "wrap",
          }}
        >
          <span>{UPGRADE_BREADCRUMB[0]}</span>
          <span>&gt;</span>
          <span>{UPGRADE_BREADCRUMB[1]}</span>
          <span>&gt;</span>
          <span style={{ color: C.strongText, fontWeight: 600 }}>
            {UPGRADE_BREADCRUMB[2]}
          </span>
        </div>

        {/* Alerts */}
        {error && (
          <Alert
            severity="error"
            onClose={() => setError("")}
            sx={{
              position: "fixed",
              top: 20,
              right: 20,
              zIndex: 9999,
              minWidth: 300,
              boxShadow: 3,
            }}
          >
            {error}
          </Alert>
        )}
        {success && (
          <Alert
            severity="success"
            onClose={() => setSuccess("")}
            sx={{
              position: "fixed",
              top: 20,
              right: 20,
              zIndex: 9999,
              minWidth: 300,
              boxShadow: 3,
            }}
          >
            {success}
          </Alert>
        )}

        {/* Current Version */}
        <div style={tableContainerStyle}>
          <div style={blueBarStyle}>
            <span>{UPGRADE_LABELS.currentVersion}</span>
            {versionLoading && (
              <CircularProgress size={16} sx={{ color: C.strongText }} />
            )}
          </div>
          <div
            className="w-full px-5 pt-3 pb-3 flex flex-col items-center"
            style={{ borderBottomLeftRadius: 10, borderBottomRightRadius: 10 }}
          >
            <div
              className="w-full max-w-2xl grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 items-center"
            >
              {versionRows.map((row) => (
                <React.Fragment key={row.key}>
                  <Tooltip title={row.tooltip} {...tooltipProps}>
                    <label style={labelStyle}>{row.label}:</label>
                  </Tooltip>
                  <div className="flex flex-col min-w-0 w-full">
                    <div style={valueBoxStyle}>
                      {row.version || UPGRADE_STATUS.unavailable}
                    </div>
                    {row.timestamp ? (
                      <div
                        style={{
                          fontSize: 11,
                          color: C.mutedText,
                          marginTop: 4,
                          textAlign: "center",
                          lineHeight: 1.45,
                        }}
                      >
                        Last updated: {row.timestamp}
                      </div>
                    ) : null}
                  </div>
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>

        {/* Select Update File + actions */}
        <div style={{ ...tableContainerStyle, marginTop: 20 }}>
          <div style={{ ...blueBarStyle, justifyContent: "left" }}>
            <span>{UPGRADE_LABELS.selectFile}</span>
          </div>
          <div
            className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
            style={{ padding: "24px 20px" }}
          >
            <div
              className="flex flex-col sm:flex-row sm:items-center gap-4"
              style={{ flex: 1, minWidth: 0 }}
            >
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={handleFileChange}
                disabled={uploading || rebooting}
              />
              <Btn
                variant={UPGRADE_BUTTON_VARIANTS.CHOOSE_FILE}
                type="button"
                onClick={() =>
                  !uploading && !rebooting && fileInputRef.current?.click()
                }
                disabled={uploading || rebooting}
                style={UPGRADE_BUTTON_STYLE}
              >
                {UPGRADE_BUTTON_LABELS.CHOOSE_FILE}
              </Btn>
              <span
                style={{
                  fontSize: 13,
                  color:
                    fileName === UPGRADE_LABELS.noFile
                      ? C.mutedText
                      : C.valueText,
                  minWidth: 0,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {fileName}
              </span>
            </div>
            <div
              className="flex flex-row items-center gap-3"
              style={{ flexShrink: 0 }}
            >
              <Btn
                variant={UPGRADE_BUTTON_VARIANTS.UPDATE}
                type="button"
                onClick={handleUpdate}
                disabled={uploading || rebooting}
                style={UPGRADE_BUTTON_STYLE}
              >
                {uploading
                  ? UPGRADE_BUTTON_STATUS.uploading
                  : rebooting
                    ? UPGRADE_BUTTON_STATUS.rebooting
                    : UPGRADE_BUTTON_LABELS.UPDATE}
              </Btn>
              <Btn
                variant={UPGRADE_BUTTON_VARIANTS.RESET}
                type="button"
                onClick={handleReset}
                disabled={uploading || rebooting}
                style={UPGRADE_BUTTON_STYLE}
              >
                {UPGRADE_BUTTON_LABELS.RESET}
              </Btn>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Upgrade;
