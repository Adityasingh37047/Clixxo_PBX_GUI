import React, { useState, useEffect } from "react";
import { Alert, CircularProgress, Chip } from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import UploadIcon from "@mui/icons-material/Upload";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import InfoIcon from "@mui/icons-material/Info";
import {
  getLicenseInfo,
  checkLicenseValidity,
  getSystemFingerprint,
  uploadLicenseFile,
  fetchSystemSerialNumber,
} from "../../../api/apiService";
import {
  LICENSE_STATUS,
  LICENSE_STATUS_DISPLAY,
  LICENSE_FORM_LABELS,
  LICENSE_BUTTON_LABELS,
  LICENSE_ERROR_MESSAGES,
  LICENSE_SUCCESS_MESSAGES,
  LICENSE_DEVICE_TYPE_OPTIONS,
  LICENSE_DEVICE_TYPE_VALUES,
} from "../../../constants/LicenceConstants";
const LICENCE_DEVICE_TYPE_STORAGE_KEY = "clixxo_licence_device_type";

// ── Color palette (same as SignalingCapture) ───────────────────────────────────
const C = {
  pageBg: "var(--bg-main)",
  cardBg: "var(--bg-surface)",
  cardBorder: "var(--border-strong)",
  divider: "var(--border-subtle)",
  cardShadow: "var(--shadow-soft)",
  labelText: "var(--text-secondary)",
  valueText: "#3E5475",
  strongText: "var(--text-primary)",
  mutedText: "var(--text-muted)",
  accent: "#0284c7",
  primary: "#2563eb",
  primaryHover: "#1d4ed8",
  errorRed: "#dc2626",
};

const SYS_TOAST_SX = {
  position: "fixed",
  top: 20,
  right: 20,
  zIndex: 9999,
  minWidth: 300,
  boxShadow: 3,
};
// ── Local field UI (inlined from maitenanceSharedUi) ──
const OUTLINED_BORDER = "var(--border-subtle)";
const OUTLINED_HOVER = "var(--border-strong)";
const OUTLINED_FOCUS = "var(--status-primary)";
const FOCUS_RING_SHADOW = (color) => `0 0 0 1px ${color}`;

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
  el.style.boxShadow = FOCUS_RING_SHADOW(OUTLINED_FOCUS);
};

const nativeFieldInteraction = {
  onFocus: (e) => {
    if (e.target.disabled) return;
    setFieldFocus(e.target);
  },
  onBlur: (e) => {
    setFieldDefault(e.target);
  },
  onMouseEnter: (e) => {
    if (e.target.disabled) return;
    if (document.activeElement === e.target) {
      setFieldFocus(e.target);
    } else {
      setFieldHover(e.target);
    }
  },
  onMouseLeave: (e) => {
    if (document.activeElement === e.target) {
      setFieldFocus(e.target);
    } else {
      setFieldDefault(e.target);
    }
  },
};

const inputInteraction = {
  onFocus: (e) => {
    if (e.target.disabled || e.target.readOnly) return;
    nativeFieldInteraction.onFocus(e);
  },
  onBlur: (e) => {
    if (e.target.disabled || e.target.readOnly) return;
    nativeFieldInteraction.onBlur(e);
  },
  onMouseEnter: (e) => {
    if (e.target.disabled || e.target.readOnly) return;
    nativeFieldInteraction.onMouseEnter(e);
  },
  onMouseLeave: (e) => {
    if (e.target.disabled || e.target.readOnly) return;
    nativeFieldInteraction.onMouseLeave(e);
  },
};

const getSystemToolsInputInteraction = (hasError, errorColor = "#dc2626") => {
  if (!hasError) return inputInteraction;
  const ring = (el, focused) => {
    el.style.borderColor = errorColor;
    el.style.borderWidth = "1px";
    el.style.boxShadow = focused ? `0 0 0 1px ${errorColor}` : "none";
  };
  return {
    onFocus: (e) => ring(e.target, true),
    onBlur: (e) => ring(e.target, false),
    onMouseEnter: (e) => ring(e.target, document.activeElement === e.target),
    onMouseLeave: (e) => ring(e.target, document.activeElement === e.target),
  };
};

const systemToolsFieldInputStyle = {
  padding: "6px 12px",
  borderRadius: 6,
  border: `1px solid ${OUTLINED_BORDER}`,
  fontSize: 14,
  width: "100%",
  backgroundColor: "var(--row-alt)",
  outline: "none",
  color: "var(--text-primary)",
  transition: "border-color 0.2s ease, box-shadow 0.2s ease",
  boxSizing: "border-box",
  boxShadow: "none",
};

const SYSTEM_TOOLS_FILL_BG_EDITABLE = "var(--bg-main)";
const SYSTEM_TOOLS_FILL_BG_READ_ONLY = "var(--bg-muted)";

const systemToolsFieldInputStyleWhite = {
  ...systemToolsFieldInputStyle,
  backgroundColor: "var(--bg-main)",
  borderRadius: 8,
  color: "var(--text-primary)",
};
const inputStyle = systemToolsFieldInputStyleWhite;


// ── Button Component (same as SignalingCapture) ────────────────────────────────
const BTN_BASE =
  "inline-flex items-center justify-center gap-[6px] h-[30px] px-[14px] py-[6px] rounded-[10px] text-[12px] font-semibold whitespace-nowrap transition-all duration-150 ease-in-out cursor-pointer border disabled:cursor-not-allowed disabled:opacity-60";
const BTN_DEFAULT = `${BTN_BASE} bg-[var(--bg-surface)] text-[var(--text-primary)] border-[var(--border-subtle)] hover:bg-[var(--row-alt)]`;
const BTN_OUTLINE = `${BTN_BASE} bg-[var(--bg-surface)] text-[var(--text-label)] border-[var(--border-strong)] hover:bg-[var(--row-alt)]`;
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

const Btn = ({ children, onClick, disabled, variant = "default", className = "", style, type, title, startIcon }) => (
  <button
    type={type}
    onClick={onClick}
    disabled={disabled}
    title={title}
    style={style}
    className={`${btnVariantCls[variant] || btnVariantCls.default} ${className}`.trim()}
  >
    {startIcon && <span className="inline-flex items-center">{startIcon}</span>}
    {children}
  </button>
);

const tableContainerStyle = {
  width: "100%",
  maxWidth: "100%",
  margin: "0 auto",
  background: C.cardBg,
  border: `1px solid ${C.cardBorder}`,
  borderRadius: 10,
  boxShadow: C.cardShadow,
  overflow: "hidden",
  marginBottom: 24,
};

const blueBarStyle = {
  width: "100%",
  minHeight: 44,
  background: C.cardBg,
  borderTopLeftRadius: 10,
  borderTopRightRadius: 10,
  marginBottom: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-start",
  padding: "7px 14px",
  flexWrap: "wrap",
  gap: 12,
  fontWeight: 700,
  fontSize: 13,
  color: "var(--text-primary)",
  borderBottom: `1px solid ${C.divider}`,
};

const Licence = () => {
  const [licenseData, setLicenseData] = useState({
    Serial_Number: "",
    activateDate: "",
    expireDate: "",
    status: LICENSE_STATUS.UNKNOWN,
  });

  const [systemFingerprint, setSystemFingerprint] = useState("");
  /** Same source as System Info page: web_version.json serial_no, then astlicense. */
  const [systemSerial, setSystemSerial] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState({
    info: false,
    validity: false,
    fingerprint: false,
    upload: false,
  });
  const [message, setMessage] = useState({ type: "", text: "" });

  const [deviceTypeMode, setDeviceTypeMode] = useState(() => {
    try {
      const stored = localStorage.getItem(LICENCE_DEVICE_TYPE_STORAGE_KEY);
      if (
        stored &&
        Object.values(LICENSE_DEVICE_TYPE_VALUES).includes(stored)
      ) {
        return stored;
      }
    } catch (_) {}
    return LICENSE_DEVICE_TYPE_VALUES.IPPBX;
  });

  const loadSystemSerial = async () => {
    try {
      const sn = await fetchSystemSerialNumber();
      setSystemSerial(sn || "");
    } catch (err) {
      console.warn("Failed to load system serial for licence page:", err);
      setSystemSerial("");
    }
  };

  const serialDisplay = (
    systemSerial ||
    licenseData.Serial_Number ||
    ""
  ).trim();

  // Fetch license info, validity, and system serial (same as System Info) on mount
  useEffect(() => {
    const loadLicenseData = async () => {
      const [infoResult, validityResult, serialResult] =
        await Promise.allSettled([
          fetchLicenseInfo(),
          checkValidity(),
          loadSystemSerial(),
        ]);

      if (infoResult.status === "rejected") {
        console.warn("License info API call failed:", infoResult.reason);
      }
      if (validityResult.status === "rejected") {
        console.warn(
          "License validity check API call failed:",
          validityResult.reason,
        );
      }
      if (serialResult.status === "rejected") {
        console.warn("System serial load failed:", serialResult.reason);
      }
    };

    loadLicenseData();
  }, []);

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 5000);
  };

  const fetchLicenseInfo = async () => {
    setLoading((prev) => ({ ...prev, info: true }));
    try {
      const [response] = await Promise.all([
        getLicenseInfo(),
        loadSystemSerial(),
      ]);
      if (response.response && response.responseData) {
        try {
          const parsedData = JSON.parse(response.responseData);
          setLicenseData({
            Serial_Number:
              parsedData.license_key || parsedData.Serial_Number || "",
            activateDate: parsedData.activate_date || "",
            expireDate: parsedData.expire_date || "",
            status: LICENSE_STATUS.UNKNOWN,
          });
          showMessage("success", LICENSE_SUCCESS_MESSAGES.INFO_FETCHED);
        } catch (parseError) {
          console.error("Error parsing license data:", parseError);
          showMessage("error", "Invalid license data format");
        }
      }
    } catch (error) {
      console.error("Error fetching license info:", error);
      showMessage("error", LICENSE_ERROR_MESSAGES.FETCH_INFO_FAILED);
    } finally {
      setLoading((prev) => ({ ...prev, info: false }));
    }
  };

  const checkValidity = async () => {
    setLoading((prev) => ({ ...prev, validity: true }));
    try {
      const response = await checkLicenseValidity();
      if (response.response && response.responseData) {
        const status = response.responseData;
        setLicenseData((prev) => ({ ...prev, status }));
        showMessage("success", LICENSE_SUCCESS_MESSAGES.VALIDITY_CHECKED);
      }
    } catch (error) {
      console.error("Error checking license validity:", error);
      showMessage("error", LICENSE_ERROR_MESSAGES.CHECK_VALIDITY_FAILED);
    } finally {
      setLoading((prev) => ({ ...prev, validity: false }));
    }
  };

  const fetchSystemFingerprint = async () => {
    setLoading((prev) => ({ ...prev, fingerprint: true }));
    try {
      const response = await getSystemFingerprint();
      if (response.response && response.responseData) {
        setSystemFingerprint(response.responseData);
        showMessage("success", LICENSE_SUCCESS_MESSAGES.FINGERPRINT_FETCHED);
      }
    } catch (error) {
      console.error("Error fetching system fingerprint:", error);
      showMessage("error", LICENSE_ERROR_MESSAGES.GET_FINGERPRINT_FAILED);
    } finally {
      setLoading((prev) => ({ ...prev, fingerprint: false }));
    }
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setMessage({ type: "", text: "" });
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFile) {
      showMessage("error", LICENSE_ERROR_MESSAGES.INVALID_FILE);
      return;
    }

    setLoading((prev) => ({ ...prev, upload: true }));
    try {
      const response = await uploadLicenseFile(selectedFile);
      if (response.response) {
        showMessage("success", LICENSE_SUCCESS_MESSAGES.FILE_UPLOADED);
        setSelectedFile(null);
        // Refresh license info after upload
        setTimeout(() => fetchLicenseInfo(), 1000);
      }
    } catch (error) {
      console.error("Error uploading license file:", error);
      showMessage("error", LICENSE_ERROR_MESSAGES.UPLOAD_FAILED);
    } finally {
      setLoading((prev) => ({ ...prev, upload: false }));
    }
  };

  const getStatusDisplay = (status) => {
    const statusInfo =
      LICENSE_STATUS_DISPLAY[status] ||
      LICENSE_STATUS_DISPLAY[LICENSE_STATUS.UNKNOWN];

    const textColor =
      statusInfo.color === "success"
        ? "#166534"
        : statusInfo.color === "error"
          ? "#991b1b"
          : C.valueText;

    return (
      <span
        style={{
          fontSize: 13,
          color: textColor,
          fontWeight: 600,
        }}
      >
        {statusInfo.label}
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  const handleDeviceTypeChange = (event) => {
    const value = event.target.value;
    setDeviceTypeMode(value);
    try {
      localStorage.setItem(LICENCE_DEVICE_TYPE_STORAGE_KEY, value);
    } catch (_) {}
  };

  return (
    <div
      className="clixxo-system-settings theme-page-bg min-h-[calc(100vh-80px)] p-4 flex flex-col items-center"
      style={{ backgroundColor: C.pageBg }}
    >
      {/* ── Alerts ── */}
      {message.text && (
        <Alert
          severity={message.type}
          onClose={() => setMessage({ type: "", text: "" })}
          sx={SYS_TOAST_SX}
        >
          {message.text}
        </Alert>
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
          <span style={{ color: C.strongText, fontWeight: 600 }}>License</span>
        </div>

        {/* ── Content ── */}
        <div style={tableContainerStyle}>
          <div style={blueBarStyle}>
            <span>License Management</span>
          </div>

          <div className="p-6 flex flex-col gap-6">
            {/* License Information Section */}
            <div>
              <div
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 pb-4"
                style={{ borderBottom: `1px solid ${C.divider}` }}
              >
                <span className="text-[14px] font-semibold text-[var(--text-label)]">
                  License Information
                </span>
                <Btn
                  variant="primary"
                  startIcon={
                    loading.info ? (
                      <CircularProgress size={16} color="inherit" />
                    ) : (
                      <RefreshIcon style={{ fontSize: 18 }} />
                    )
                  }
                  onClick={fetchLicenseInfo}
                  disabled={loading.info}
                  style={{ minWidth: 100, height: 34, fontSize: 13 }}
                >
                  {LICENSE_BUTTON_LABELS.REFRESH_INFO}
                </Btn>
              </div>

              <div className="flex flex-col gap-6">
                <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 w-full">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4 shrink-0">
                    <label className="text-[14px] font-semibold text-[var(--text-label)] w-[140px] shrink-0 whitespace-nowrap">
                      {LICENSE_FORM_LABELS.Serial_Number}
                    </label>
                    <input
                      type="text"
                      value={serialDisplay}
                      readOnly
                      style={{
                        ...inputStyle,
                        width: 210,
                        flexShrink: 0,
                        backgroundColor: "var(--row-alt)",
                        cursor: "default",
                      }}
                    />
                  </div>

                  <div className="flex flex-wrap items-center gap-18">
                    <span className="text-[14px] font-semibold text-[var(--text-label)] whitespace-nowrap">
                      {LICENSE_FORM_LABELS.STATUS}
                    </span>
                    <div className="flex flex-wrap items-center gap-3">
                      {getStatusDisplay(licenseData.status)}
                      <Btn
                        variant="cancel"
                        startIcon={
                          loading.validity ? (
                            <CircularProgress size={16} color="inherit" />
                          ) : (
                            <CheckCircleIcon style={{ fontSize: 18 }} />
                          )
                        }
                        onClick={checkValidity}
                        disabled={loading.validity}
                        style={{ minWidth: 100, height: 34, fontSize: 13 }}
                      >
                        {LICENSE_BUTTON_LABELS.CHECK_VALIDITY}
                      </Btn>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <label className="text-[14px] font-semibold text-[var(--text-label)] w-[140px] shrink-0 whitespace-nowrap">
                    {LICENSE_FORM_LABELS.DEVICE_TYPE_MODE}
                  </label>
                  <select
                    value={deviceTypeMode}
                    onChange={handleDeviceTypeChange}
                    style={{ ...inputStyle, width: 210, flexShrink: 0 }}
                    {...inputInteraction}
                  >
                    {LICENSE_DEVICE_TYPE_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* System ID Section */}
            <div
              className="pt-2"
              style={{ borderTop: `1px solid ${C.divider}` }}
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                <span className="text-[14px] font-semibold text-[var(--text-label)]">
                  {LICENSE_FORM_LABELS.SYSTEM_FINGERPRINT}
                </span>
                <Btn
                  variant="primary"
                  startIcon={
                    loading.fingerprint ? (
                      <CircularProgress size={16} color="inherit" />
                    ) : (
                      <InfoIcon style={{ fontSize: 18 }} />
                    )
                  }
                  onClick={fetchSystemFingerprint}
                  disabled={loading.fingerprint}
                  style={{ minWidth: 100, height: 34, fontSize: 13 }}
                >
                  {LICENSE_BUTTON_LABELS.GET_FINGERPRINT}
                </Btn>
              </div>

              <textarea
                value={systemFingerprint}
                readOnly
                rows={2}
                placeholder="Click 'Get System ID' to retrieve system ID"
                style={{
                  ...inputStyle,
                  width: "100%",
                  backgroundColor: "var(--row-alt)",
                  fontFamily: "monospace",
                  resize: "none",
                  cursor: "default",
                }}
              />
            </div>

            {/* License File Upload Section */}
            <div
              className="pt-2"
              style={{ borderTop: `1px solid ${C.divider}` }}
            >
              <span className="text-[14px] font-semibold text-[var(--text-label)] block mb-4">
                Upload License File
              </span>

              <div className="flex flex-col gap-4">
                <div className="flex flex-wrap items-center gap-4">
                  <input
                    accept=".lic,.txt,.key"
                    style={{ display: "none" }}
                    id="license-file-input"
                    type="file"
                    onChange={handleFileSelect}
                  />
                  <label htmlFor="license-file-input">
                    <Btn
                      component="span"
                      variant="cancel"
                      startIcon={<UploadIcon style={{ fontSize: 18 }} />}
                      style={{ minWidth: 100, height: 34, fontSize: 13 }}
                    >
                      Select File
                    </Btn>
                  </label>

                  {selectedFile && (
                    <div className="flex items-center gap-2">
                      <span style={{ fontSize: 13, color: C.mutedText }}>
                        Selected:{" "}
                        <span style={{ color: C.valueText, fontWeight: 600 }}>
                          {selectedFile.name}
                        </span>
                      </span>
                      <Chip
                        label={`${(selectedFile.size / 1024).toFixed(1)} KB`}
                        size="small"
                        sx={{ height: 20, fontSize: 11 }}
                      />
                    </div>
                  )}
                </div>

                {selectedFile && (
                  <div>
                    <Btn
                      variant="primary"
                      startIcon={
                        loading.upload ? (
                          <CircularProgress size={16} color="inherit" />
                        ) : (
                          <UploadIcon style={{ fontSize: 18 }} />
                        )
                      }
                      onClick={handleFileUpload}
                      disabled={loading.upload}
                      style={{ minWidth: 100, height: 34, fontSize: 13 }}
                    >
                      {loading.upload
                        ? "Uploading..."
                        : LICENSE_BUTTON_LABELS.UPLOAD_LICENSE}
                    </Btn>
                  </div>
                )}
              </div>
            </div>

            {/* Current License Status Summary */}
            <div
              className="pt-2"
              style={{ borderTop: `1px solid ${C.divider}` }}
            >
              <div
                style={{
                  backgroundColor: "var(--row-alt)",
                  padding: "16px",
                  borderRadius: 8,
                  border: `1px solid ${C.cardBorder}`,
                }}
              >
                <div className="text-[14px] font-semibold text-[var(--text-label)] mb-2">
                  Current License Summary
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-[14px] font-semibold text-[var(--text-label)]">
                    Status:
                  </span>
                  {getStatusDisplay(licenseData.status)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Licence;
