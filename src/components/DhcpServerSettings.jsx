import React, { useState, useEffect } from "react";
import {
  DHCP_SERVER_SETTINGS_FIELDS,
  DHCP_SERVER_SETTINGS_INITIAL_FORM,
} from "../constants/DhcpServerSettingsConstants";
import {
  fetchDhcpSettings,
  fetchSaveDhcpSettings,
  fetchResetDhcpSettings,
} from "../api/apiService";
import { Alert, Checkbox } from "@mui/material";

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

const inputStyle = {
  width: "100%",
  fontSize: 13,
  padding: "6px 10px",
  borderRadius: 10,
  border: `1px solid ${C.cardBorder}`,
  background: C.cardBg,
  color: C.valueText,
  outline: "none",
  transition: "border-color 0.2s ease",
};

const inputInteraction = {
  onFocus: (e) => (e.target.style.borderColor = C.accent),
  onBlur: (e) => (e.target.style.borderColor = C.cardBorder),
  onMouseEnter: (e) => {
    if (document.activeElement !== e.target)
      e.target.style.borderColor = "#94a3b8";
  },
  onMouseLeave: (e) => {
    if (document.activeElement !== e.target)
      e.target.style.borderColor = C.cardBorder;
  },
};

const disabledInputStyle = {
  ...inputStyle,
  background: "#f1f5f9",
  color: "#94a3b8",
  cursor: "not-allowed",
  borderColor: "#e2e8f0",
};

const DhcpServerSettings = () => {
  const [form, setForm] = useState(DHCP_SERVER_SETTINGS_INITIAL_FORM);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    fetchDhcpData();
  }, []);

  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError(null);
        setSuccess(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  const fetchDhcpData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetchDhcpSettings();

      if (
        response &&
        response.success &&
        response.data &&
        Array.isArray(response.data)
      ) {
        const mappedData = {};

        response.data.forEach((lanData, index) => {
          const lanNumber = index + 1;
          mappedData[`enabled${lanNumber}`] = lanData.enabled || false;
          mappedData[`ipRange${lanNumber}`] = lanData.ipRange || "";
          mappedData[`subnetMask${lanNumber}`] = lanData.subnetMask || "";
          mappedData[`defaultGateway${lanNumber}`] =
            lanData.defaultGateway || "";
          mappedData[`dnsServer${lanNumber}`] = lanData.dnsServer || "";
        });

        setForm((prevForm) => ({
          ...prevForm,
          ...mappedData,
        }));
      } else {
        throw new Error(response?.message || "Failed to load DHCP settings");
      }
    } catch (error) {
      console.error("Error fetching DHCP settings:", error);
      if (error.code === "ECONNABORTED" || error.message?.includes("timeout")) {
        setError(
          "Request timeout. Please check your connection and try again.",
        );
      } else if (error.response?.status === 404) {
        setError("DHCP configuration not found. Please contact administrator.");
      } else if (error.response?.status >= 500) {
        setError("Server error. Please try again later or contact support.");
      } else if (
        error.message?.includes("Network Error") ||
        error.message?.includes("Failed to fetch")
      ) {
        setError(
          "Network connection failed. Please check your internet connection.",
        );
      } else {
        setError(
          error.message ||
            "Failed to load DHCP settings. Please refresh the page and try again.",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleReset = async () => {
    try {
      setError(null);
      setSuccess(null);
      setLoading(true);

      const response = await fetchResetDhcpSettings();

      if (response && response.success) {
        setSuccess("DHCP settings reset successfully!");
        await fetchDhcpData();
      } else {
        throw new Error(response?.message || "Failed to reset DHCP settings");
      }
    } catch (error) {
      console.error("Error resetting DHCP settings:", error);
      let errorMessage = "Failed to reset DHCP settings.";
      if (error.code === "ECONNABORTED" || error.message?.includes("timeout")) {
        errorMessage =
          "Reset operation timed out. Please check your connection and try again.";
      } else if (error.response?.status >= 500) {
        errorMessage =
          "Server error during reset. Please try again later or contact support.";
      } else if (
        error.message?.includes("Network Error") ||
        error.message?.includes("Failed to fetch")
      ) {
        errorMessage =
          "Network connection failed during reset. Please check your connection.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setError(null);
      setSuccess(null);
      setLoading(true);

      const response = await fetchSaveDhcpSettings(form);

      if (response && response.success) {
        setSuccess("DHCP settings saved successfully!");
      } else {
        throw new Error(response?.message || "Failed to save DHCP settings");
      }
    } catch (error) {
      console.error("Error saving DHCP settings:", error);
      let errorMessage = "Failed to save DHCP settings.";
      if (error.code === "ECONNABORTED" || error.message?.includes("timeout")) {
        errorMessage =
          "Save operation timed out. Please check your connection and try again.";
      } else if (error.response?.status === 400) {
        errorMessage =
          "Invalid DHCP configuration. Please check your settings and try again.";
      } else if (error.response?.status >= 500) {
        errorMessage =
          "Server error during save. Please try again later or contact support.";
      } else if (
        error.message?.includes("Network Error") ||
        error.message?.includes("Failed to fetch")
      ) {
        errorMessage =
          "Network connection failed during save. Please check your connection.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-[calc(100vh-80px)] p-4 flex flex-col items-center"
      style={{ backgroundColor: C.pageBg }}
    >
      <div className="w-full" style={{ maxWidth: 1000 }}>
        {error && (
          <Alert
            severity="error"
            onClose={() => setError(null)}
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
            onClose={() => setSuccess(null)}
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
          <span>System</span>
          <span>&gt;</span>
          <span>System Settings</span>
          <span>&gt;</span>
          <span style={{ color: C.strongText, fontWeight: 600 }}>
            DHCP Server
          </span>
        </div>

        {/* ── Main Card ── */}
        <div
          style={{
            background: C.cardBg,
            borderRadius: 20,
            overflow: "hidden",
            boxShadow: C.cardShadow,
            marginBottom: 24,
            border: `1px solid ${C.cardBorder}`,
          }}
        >
          {/* Card Header */}
          <div
            style={{
              minHeight: 44,
              display: "flex",
              flexWrap: "wrap",
              gap: 12,
              alignItems: "center",
              padding: "10px 14px",
              borderBottom: `1px solid ${C.divider}`,
              background: C.cardBg,
            }}
          >
            <span
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: C.strongText,
                letterSpacing: "0.02em",
              }}
            >
              DHCP Server
            </span>
          </div>

          {/* Card Body */}
          <div style={{ padding: "24px 32px" }}>
            <form onSubmit={handleSave} className="flex flex-col gap-10">
              {DHCP_SERVER_SETTINGS_FIELDS.map((lanGroup) => {
                const isEnabled = form[lanGroup.fields[0].name];
                return (
                  <div key={lanGroup.lan} className="flex flex-col gap-4">
                    {/* Section Label */}
                    <div
                      style={{
                        fontSize: 14,
                        fontWeight: 700,
                        color: C.strongText,
                        marginBottom: 8,
                        paddingBottom: 8,
                        borderBottom: `1px solid ${C.divider}`,
                      }}
                    >
                      {lanGroup.lan}
                    </div>

                    <div className="flex flex-col gap-4 w-full" style={{ maxWidth: 640, margin: "0 auto" }}>
                      {/* Enable DHCP Checkbox */}
                      <div className="flex flex-col sm:flex-row items-start sm:items-center w-full gap-4">
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
                        DHCP Server:
                      </label>
                      <div className="flex flex-col w-full max-w-[400px]">
                        <div className="flex items-center gap-2">
                          <Checkbox
                            size="small"
                            name={lanGroup.fields[0].name}
                            checked={isEnabled || false}
                            onChange={handleChange}
                            sx={{
                              padding: "4px",
                              color: "#64748b",
                              "&.Mui-checked": { color: C.accent },
                            }}
                          />
                          <span
                            style={{
                              fontSize: 12,
                              color: C.valueText,
                            }}
                          >
                            Enable
                          </span>
                        </div>
                        </div>
                      </div>

                      {/* Other fields */}
                      {lanGroup.fields.slice(1).map((field) => (
                        <div
                          key={field.name}
                          className="flex flex-col sm:flex-row items-start sm:items-center w-full gap-4"
                        >
                          <label
                            style={{
                              fontSize: 12,
                              fontWeight: 600,
                              color: C.labelText,
                              width: "100%",
                              maxWidth: 220,
                              flexShrink: 0,
                              opacity: isEnabled ? 1 : 0.6,
                            }}
                        >
                          {field.label}:
                        </label>
                        <div className="flex flex-col w-full max-w-[400px]">
                          <input
                            type="text"
                            name={field.name}
                            value={form[field.name] || ""}
                            onChange={handleChange}
                            disabled={!isEnabled}
                            style={isEnabled ? inputStyle : disabledInputStyle}
                            onFocus={
                              isEnabled ? inputInteraction.onFocus : undefined
                            }
                            onBlur={
                              isEnabled ? inputInteraction.onBlur : undefined
                            }
                            onMouseEnter={
                              isEnabled
                                ? inputInteraction.onMouseEnter
                                : undefined
                            }
                            onMouseLeave={
                              isEnabled
                                ? inputInteraction.onMouseLeave
                                : undefined
                            }
                          />
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                );
              })}

              {/* Action Buttons Row */}
              <div className="flex flex-wrap gap-4 mt-6 justify-start sm:justify-center">
                <Btn
                  variant="primary"
                  type="submit"
                  disabled={loading}
                  style={{ minWidth: 100 }}
                >
                  {loading ? "Saving..." : "Save"}
                </Btn>
                <Btn
                  variant="cancel"
                  type="button"
                  onClick={handleReset}
                  disabled={loading}
                  style={{ minWidth: 100 }}
                >
                  {loading ? "Resetting..." : "Reset"}
                </Btn>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DhcpServerSettings;
