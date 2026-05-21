import React, { useEffect, useRef, useState } from "react";
import {
  UPGRADE_LABELS,
  UPGRADE_BUTTONS,
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
  cardBorder: "#e2e8f0",
  divider: "#f1f5f9",
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

// ── Button Component (same as UserManage) ────────────────────────────────────
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
      background: C.primary,
      color: C.cardBg,
      border: `1px solid ${C.primary}`,
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
  const hoverBg = (() => {
    switch (variant) {
      case "primary":
        return C.primaryHover;
      case "cancel":
        return "#b6c2d3";
      case "edit":
        return "#bbf7d0";
      case "delete":
        return "#fecaca";
      case "danger":
        return "#b91c1c"; // darker than C.errorRed
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
        if (!disabled) e.currentTarget.style.backgroundColor = hoverBg;
      }}
      onMouseLeave={(e) => {
        if (!disabled) e.currentTarget.style.backgroundColor = baseBg;
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
};
const blueBarStyle = {
  width: "100%",
  height: 44,
  background: C.cardBg,
  borderTopLeftRadius: 20,
  borderTopRightRadius: 20,
  marginLeft: 6,
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "0 14px",
  fontWeight: 700,
  fontSize: 13,
  color: C.strongText,
  borderBottom: `1px solid ${C.divider}`,
};
const thStyle = {
  background: C.pageBg,
  color: C.labelText,
  fontWeight: 700,
  fontSize: 11,
  borderBottom: `1px solid ${C.divider}`,
  padding: "14px 18px",
  whiteSpace: "nowrap",
  textTransform: "uppercase",
  letterSpacing: "0.08em",
};
const tdStyle = {
  borderBottom: `1px solid ${C.divider}`,
  padding: "16px 18px",
  fontSize: 13,
  background: C.cardBg,
  color: C.valueText,
  textAlign: "center",
  whiteSpace: "nowrap",
};
const tdLeftStyle = {
  borderBottom: `1px solid ${C.divider}`,
  padding: "16px 18px",
  fontSize: 13,
  background: C.cardBg,
  color: C.valueText,
  textAlign: "left",
  whiteSpace: "nowrap",
};

const VERSION_FIELDS = [
  {
    key: "serial_no",
    label: "Serial Number",
    formatter: (val) => val || "Unavailable",
  },
  {
    key: "web_version",
    label: "WEB",
    formatter: (val) => val || "Unavailable",
  },
  {
    key: "service",
    label: "Service",
    formatter: (val) => val || "Unavailable",
  },
  { key: "uboot", label: "Uboot", formatter: (val) => val || "Unavailable" },
  { key: "kernel", label: "Kernel", formatter: (val) => val || "Unavailable" },
  {
    key: "firmware",
    label: "Firmware",
    formatter: (val) => val || "Unavailable",
  },
];

const createInitialRows = (placeholder = "Loading...") =>
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
      const timer = setTimeout(() => setError(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(""), 5000);
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
    setVersionRows(createInitialRows("Loading..."));
    try {
      const res = await postLinuxCmd({
        cmd: "cat /home/clixxo/server/config/web_version.json",
      });
      if (!res?.response || !res?.responseData) {
        throw new Error(res?.message || "Invalid response");
      }

      let parsed = {};
      try {
        parsed = JSON.parse(res.responseData);
      } catch (_) {
        throw new Error("Failed to parse version data");
      }

      const updatedRows = VERSION_FIELDS.map((field) => {
        const rawValue = parsed[field.key];
        const formatted = field.formatter
          ? field.formatter(rawValue)
          : (rawValue ?? "Unavailable");
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
      setVersionRows(createInitialRows("Unavailable"));
      setError("Failed to load current version details.");
    } finally {
      setVersionLoading(false);
    }
  };

  const checkDeviceOnline = async () => {
    try {
      await axiosInstance.get("/service-ping", { timeout: 4000 });
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
    setProgressMessage(
      "Device is rebooting. Waiting for it to come back online...",
    );
    let attempts = 0;
    pingIntervalRef.current = setInterval(async () => {
      attempts += 1;
      const online = await checkDeviceOnline();
      if (online) {
        clearPolling();
        setProgressMessage("Device is back online. Redirecting to login...");
        setTimeout(() => {
          window.location.href = "/login";
        }, 3000);
      } else if (attempts >= 60) {
        // ~5 minutes
        clearPolling();
        setRebooting(false);
        setProgressMessage("");
        setError("Device did not come back online. Please verify manually.");
      }
    }, 5000);
  };

  const initiateReboot = async () => {
    setRebooting(true);
    setProgressMessage("Update uploaded. Initiating reboot...");
    try {
      await postLinuxCmd({ cmd: "reboot" });
    } catch (err) {
      console.warn(
        "Reboot command failed (continuing to poll):",
        err?.message || err,
      );
    }
    rebootDelayRef.current = setTimeout(() => {
      beginOnlinePolling();
    }, 5000);
  };

  const handleUpdate = async () => {
    setError("");
    setSuccess("");

    if (!selectedFile) {
      setError("Please select a .tar update package to upload.");
      return;
    }
    if (!/\.tar$/i.test(selectedFile.name)) {
      setError("Only .tar update packages are supported.");
      return;
    }

    try {
      setUploading(true);
      setProgressMessage("Uploading update package...");
      const response = await uploadSoftwareUpdate(selectedFile);
      if (!response?.response) {
        throw new Error(
          response?.message || "Failed to upload update package.",
        );
      }
      setSuccess(response?.message || "Update package uploaded successfully.");
      setUploading(false);

      // Wait 4-5 seconds before rebooting, show loading during wait
      setRebooting(true);
      setProgressMessage(
        "Update uploaded successfully. Preparing to reboot in a few seconds...",
      );

      await new Promise((resolve) => setTimeout(resolve, 4500)); // 4.5 seconds wait

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
            "Failed to upload update package.";
      setError(message);
    }
  };

  return (
    <div
      className="min-h-[calc(100vh-80px)] p-4 flex flex-col items-center"
      style={{ backgroundColor: C.pageBg }}
    >
      {(uploading || rebooting) && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-md shadow-xl px-10 py-6 flex flex-col items-center gap-4 max-w-sm text-center">
            <CircularProgress />
            <div className="text-gray-700 text-sm whitespace-pre-line">
              {progressMessage ||
                (rebooting
                  ? "Device is rebooting. Please wait..."
                  : "Uploading update package...")}
            </div>
          </div>
        </div>
      )}

      <div className="w-full" style={{ maxWidth: 1000 }}>
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
          }}
        >
          <span>Maintenance</span>
          <span>&gt;</span>
          <span>System Tool</span>
          <span>&gt;</span>
          <span style={{ color: C.strongText, fontWeight: 600 }}>Upgrade</span>
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

        {/* Table */}
        <div style={tableContainerStyle}>
          <div style={blueBarStyle}>
            <span>{UPGRADE_LABELS.currentVersion}</span>
            {versionLoading && (
              <CircularProgress size={16} sx={{ color: C.strongText }} />
            )}
          </div>
          <div style={{ overflowX: "auto", width: "100%" }}>
            <table
              style={{
                width: "100%",
                minWidth: 600,
                borderCollapse: "collapse",
              }}
            >
              <tbody>
                {versionRows.map((row) => (
                  <tr
                    key={row.key}
                    style={{
                      background: C.cardBg,
                      transition: "background 0.15s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = C.pageBg;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = C.cardBg;
                    }}
                  >
                    <td
                      style={{
                        ...tdStyle,
                        width: "30%",
                        fontWeight: 600,
                        color: C.labelText,
                      }}
                    >
                      {row.label}
                    </td>
                    <td style={tdLeftStyle}>
                      <div
                        style={{
                          color:
                            row.key === "serial_no" ? C.valueText : C.accent,
                          fontWeight: 500,
                        }}
                      >
                        {row.version || "Unavailable"}
                      </div>
                      {row.timestamp && (
                        <div
                          style={{
                            fontSize: 11,
                            color: C.mutedText,
                            marginTop: 4,
                          }}
                        >
                          Last updated: {row.timestamp}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* File Input Row - Styled to match AccountManage */}
        <div
          style={{
            ...tableContainerStyle,
            marginTop: 20,
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            padding: "16px 20px",
            gap: 16,
            flexWrap: "wrap",
          }}
        >
          <span
            style={{
              fontWeight: 600,
              color: C.labelText,
              minWidth: 140,
              fontSize: 13,
            }}
          >
            {UPGRADE_LABELS.selectFile}
          </span>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={handleFileChange}
            disabled={uploading || rebooting}
          />
          <Btn
            variant="default"
            onClick={() =>
              !uploading && !rebooting && fileInputRef.current?.click()
            }
            disabled={uploading || rebooting}
            style={{ minWidth: 120, height: 32 }}
          >
            {UPGRADE_LABELS.chooseFile}
          </Btn>
          <span
            style={{
              fontSize: 13,
              color:
                fileName === UPGRADE_LABELS.noFile ? C.mutedText : C.valueText,
              flex: 1,
            }}
          >
            {fileName}
          </span>
        </div>

        {/* Buttons Row */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            flexWrap: "wrap",
            gap: 24,
            marginTop: 24,
          }}
        >
          <Btn
            variant="primary"
            onClick={handleUpdate}
            disabled={uploading || rebooting}
            style={{ minWidth: 120, height: 36, fontSize: 13 }}
          >
            {uploading
              ? "Uploading..."
              : rebooting
                ? "Rebooting..."
                : UPGRADE_BUTTONS.update}
          </Btn>
          <Btn
            variant="cancel"
            onClick={handleReset}
            disabled={uploading || rebooting}
            style={{ minWidth: 120, height: 36, fontSize: 13 }}
          >
            {UPGRADE_BUTTONS.reset}
          </Btn>
        </div>
      </div>
    </div>
  );
};

export default Upgrade;
