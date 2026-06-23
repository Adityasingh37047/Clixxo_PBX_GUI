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
import { THEME_PALETTE } from "../../../constants/themePalette";

const C = {
  ...THEME_PALETTE,
  cardShadow: "var(--shadow-soft)",
  divider: "var(--border-subtle)",
};

const SYS_TOAST_SX = {
  position: "fixed",
  top: 20,
  right: 20,
  zIndex: 9999,
  minWidth: 300,
  boxShadow: 3,
};

// ── Button Component (same as UserManage) ────────────────────────────────────
const BTN_BASE =
  "inline-flex items-center justify-center gap-[6px] h-[30px] px-[14px] py-[6px] rounded-[10px] text-[12px] font-semibold whitespace-nowrap transition-all duration-150 ease-in-out cursor-pointer border disabled:cursor-not-allowed disabled:opacity-60";
const BTN_DEFAULT = `${BTN_BASE} bg-[var(--bg-surface)] text-[var(--text-primary)] border-[var(--border-subtle)] hover:bg-[var(--row-alt)]`;
const BTN_OUTLINE = `${BTN_BASE} bg-[var(--bg-surface)] text-[var(--text-label)] border-[var(--border-subtle)] hover:bg-[var(--row-alt)]`;
const BTN_CANCEL = `${BTN_BASE} bg-[var(--border-subtle)] text-[var(--text-primary)] border-[var(--border-subtle)] hover:opacity-90`;
const BTN_PRIMARY = `${BTN_BASE} text-white border-[#5A6F8F] bg-[linear-gradient(to_bottom,#5A6F8F_0%,#3E5475_60%,#2C3E57_100%)] hover:bg-[linear-gradient(to_bottom,#3E5475_0%,#5A6F8F_100%)]`;
const BTN_ERROR = `${BTN_BASE} bg-[#dc2626] text-white border-[#dc2626] hover:bg-[#b91c1c]`;
const BTN_DELETE = `${BTN_BASE} bg-[#fee2e2] text-[#991b1b] border-[#fecaca] hover:bg-[#fecaca]`;
const BTN_EDIT = `${BTN_BASE} bg-[#dcfce7] text-[#166534] border-[#bbf7d0] hover:bg-[#bbf7d0]`;

const btnVariantCls = {
  default: BTN_DEFAULT,
  primary: BTN_PRIMARY,
  cancel: BTN_CANCEL,
  outline: BTN_OUTLINE,
  error: BTN_ERROR,
  delete: BTN_DELETE,
  edit: BTN_EDIT,
  danger: BTN_ERROR,
};

const Btn = ({ children, onClick, disabled, variant = "default", className = "", style, type, title }) => (
  <button
    type={type}
    onClick={onClick}
    disabled={disabled}
    title={title}
    style={style}
    className={`${btnVariantCls[variant] || btnVariantCls.default} ${className}`.trim()}
  >
    {children}
  </button>
);

const tableContainerStyle = {
  width: "100%",
  maxWidth: "100%",
  margin: "0 auto",
  background: C.cardBg,
  border: `1.5px solid ${C.cardBorder}`,
  borderRadius: 10,
  boxShadow: C.cardShadow,
  overflow: "hidden",
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
  color: C.labelText,
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
  border: "1px solid var(--border-subtle)",
  fontSize: 12,
  fontWeight: 500,
  width: "100%",
  minHeight: 34,
  backgroundColor: "var(--bg-main)",
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

/** Upgrade page — standalone action footer (not attached to any table/card) */
const upgradeFooterStyle = {
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  justifyContent: "center",
  gap: 12,
  width: "100%",
  marginTop: 24,
  padding: "10px 20px",
  border: `1.5px solid ${C.cardBorder}`,
  borderRadius: 10,
  boxSizing: "border-box",
  background: C.cardBg,
  boxShadow: C.cardShadow,
};

const upgradeFooterBtnStyle = {
  minWidth: 110,
  height: 34,
  fontSize: 13,
  margin: 0,
  padding: "0 28px",
  lineHeight: "34px",
  boxSizing: "border-box",
};

const formatVersionValue = (raw) => {
  if (raw == null || raw === "") return "Unavailable";
  if (typeof raw === "object") {
    const parts = [raw.version, raw.timestamp, raw.boot, raw.boot_time, raw.value]
      .filter((v) => v != null && String(v).trim() !== "")
      .map((v) => String(v).trim());
    return parts.length ? parts.join(" ") : "Unavailable";
  }
  return String(raw).trim() || "Unavailable";
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
      className="clixxo-system-settings theme-page-bg min-h-[calc(100vh-80px)] p-4 flex flex-col items-center"
      style={{ backgroundColor: C.pageBg }}
    >
      {(uploading || rebooting) && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-[var(--bg-surface)] text-[var(--text-primary)] border border-[var(--border-subtle)] rounded-md shadow-xl px-10 py-6 flex flex-col items-center gap-4 max-w-sm text-center">
            <CircularProgress sx={{ color: "var(--status-primary)" }} />
            <div className="text-[var(--text-secondary)] text-sm whitespace-pre-line">
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
            sx={SYS_TOAST_SX}
          >
            {error}
          </Alert>
        )}
        {success && (
          <Alert
            severity="success"
            onClose={() => setSuccess("")}
            sx={SYS_TOAST_SX}
          >
            {success}
          </Alert>
        )}

        {/* Current Version */}
        <div style={{ ...tableContainerStyle, marginBottom: 12 }}>
          <div style={blueBarStyle}>
            <span>{UPGRADE_LABELS.currentVersion}</span>
            {versionLoading && (
              <CircularProgress size={16} sx={{ color: C.strongText }} />
            )}
          </div>
          <div
            className="w-full px-5 pt-3 pb-3 flex flex-col items-center"
            style={{
              borderBottomLeftRadius: 10,
              borderBottomRightRadius: 10,
              backgroundColor: "var(--bg-surface)",
            }}
          >
            <div
              className="w-full max-w-2xl grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 items-center"
            >
              {versionRows.map((row) => (
                <React.Fragment key={row.key}>
                  <label style={labelStyle}>{row.label}:</label>
                  <div className="flex flex-col min-w-0 w-full">
                    <div style={valueBoxStyle}>
                      {row.version || "Unavailable"}
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

        {/* File Input Row */}
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
            backgroundColor: "var(--bg-surface)",
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
            variant="cancel"
            type="button"
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
              minWidth: 0,
            }}
          >
            {fileName}
          </span>
        </div>

        {/* Personal action footer — separate from tables/cards above */}
        <div style={upgradeFooterStyle}>
          <Btn
            variant="primary"
            type="button"
            onClick={handleUpdate}
            disabled={uploading || rebooting}
            style={upgradeFooterBtnStyle}
          >
            {uploading
              ? "Uploading..."
              : rebooting
                ? "Rebooting..."
                : UPGRADE_BUTTONS.update}
          </Btn>
          <Btn
            variant="cancel"
            type="button"
            onClick={handleReset}
            disabled={uploading || rebooting}
            style={upgradeFooterBtnStyle}
          >
            {UPGRADE_BUTTONS.reset}
          </Btn>
        </div>
      </div>
    </div>
  );
};

export default Upgrade;
