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
  pageBg: "#f8fafc",
  cardBg: "#ffffff",
  cardBorder: "#9CA3AF",
  divider: "#9CA3AF",
  cardShadow: "0 4px 20px rgba(15,23,42,0.06)",
  labelText: "#64748b",
  valueText: "#3E5475",
  strongText: "#0f172a",
  mutedText: "#94a3b8",
  accent: "#0284c7",
  primary: "#2563eb",
  primaryHover: "#1d4ed8",
  errorRed: "#dc2626",
};

// ── Button Component (same as SignalingCapture) ────────────────────────────────
const Btn = ({
  children,
  onClick,
  disabled,
  variant = "default",
  style: extraStyle,
  type,
  startIcon,
  component,
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
  };

  const s = styles[variant] || styles.default;
  const hoverBg = (() => {
    switch (variant) {
      case "primary":
        return "linear-gradient(to bottom, #3E5475 0%, #5A6F8F 100%)";
      case "cancel":
        return "#b6c2d3";
      case "default":
      default:
        return "#e2e8f0";
    }
  })();

  const baseBg = s.background;
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
      {startIcon && <span style={{ display: "inline-flex" }}>{startIcon}</span>}
      {children}
    </Component>
  );
};

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

const inputStyle = {
  border: `1px solid ${C.cardBorder}`,
  borderRadius: 8,
  padding: "6px 12px",
  fontSize: 14,
  color: C.valueText,
  background: C.cardBg,
  outline: "none",
  transition: "border-color 0.15s ease",
};

const inputInteraction = {
  onFocus: (e) => {
    if (!e.target.disabled && !e.target.readOnly)
      e.target.style.borderColor = "#0284c7";
  },
  onBlur: (e) => {
    if (!e.target.disabled && !e.target.readOnly)
      e.target.style.borderColor = C.cardBorder;
  },
  onMouseEnter: (e) => {
    if (
      !e.target.disabled &&
      !e.target.readOnly &&
      document.activeElement !== e.target
    )
      e.target.style.borderColor = "#64748b";
  },
  onMouseLeave: (e) => {
    if (
      !e.target.disabled &&
      !e.target.readOnly &&
      document.activeElement !== e.target
    )
      e.target.style.borderColor = C.cardBorder;
  },
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
  color: "#3E5475",
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
      className="min-h-[calc(100vh-80px)] p-4 flex flex-col items-center"
      style={{ backgroundColor: C.pageBg }}
    >
      {/* ── Alerts ── */}
      {message.text && (
        <Alert
          severity={message.type}
          onClose={() => setMessage({ type: "", text: "" })}
          sx={{
            position: "fixed",
            top: 20,
            right: 20,
            zIndex: 9999,
            minWidth: 300,
            boxShadow: 3,
          }}
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
                <span className="text-[14px] font-semibold text-[#3E5475]">
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
                    <label className="text-[14px] font-semibold text-[#3E5475] w-[140px] shrink-0 whitespace-nowrap">
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
                        backgroundColor: "#f8fafc",
                        cursor: "default",
                      }}
                    />
                  </div>

                  <div className="flex flex-wrap items-center gap-18">
                    <span className="text-[14px] font-semibold text-[#3E5475] whitespace-nowrap">
                      {LICENSE_FORM_LABELS.STATUS}
                    </span>
                    <div className="flex flex-wrap items-center gap-3">
                      {getStatusDisplay(licenseData.status)}
                      <Btn
                        variant="default"
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
                  <label className="text-[14px] font-semibold text-[#3E5475] w-[140px] shrink-0 whitespace-nowrap">
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
                <span className="text-[14px] font-semibold text-[#3E5475]">
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
                  backgroundColor: "#f8fafc",
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
              <span className="text-[14px] font-semibold text-[#3E5475] block mb-4">
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
                      variant="default"
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
                  backgroundColor: "#f8fafc",
                  padding: "16px",
                  borderRadius: 8,
                  border: `1px solid ${C.cardBorder}`,
                }}
              >
                <div className="text-[14px] font-semibold text-[#3E5475] mb-2">
                  Current License Summary
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-[14px] font-semibold text-[#3E5475]">
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
