import React, { useState, useEffect } from "react";
import Tooltip from "@mui/material/Tooltip";
import {
  buildDhcpLanSections,
  DHCP_SERVER_SETTINGS_INITIAL_FORM,
} from "../../../constants/DhcpServerSettingsConstants";
import {
  fetchDhcpSettings,
  fetchSaveDhcpSettings,
  fetchResetDhcpSettings,
} from "../../../api/apiService";
import { Alert, Checkbox, CircularProgress } from "@mui/material";

const C = {
  pageBg: "#f8fafc",
  cardBg: "#ffffff",
  cardBorder: "#d8dde5",
  cardShadow:
    "0 0 20px rgba(0, 0, 0, 0.25), 0 0 8px rgba(0, 0, 0, 0.15)",
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

// ── Local field UI (matches RoutingInterface.jsx design language) ──
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

const systemFieldInputStyleNarrow = {
  ...systemFieldInputStyle,
  maxWidth: "280px",
};

const inputStyle = systemFieldInputStyleNarrow;

const advancedFormInlineFooterStyle = {
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  justifyContent: "flex-end",
  gap: 12,
  width: "100%",
  margin: 0,
  padding: "10px 28px",
  borderTop: `1px solid ${C.divider}`,
  background: C.cardBg,
  boxSizing: "border-box",
  flexShrink: 0,
};

const advancedFormBtnStyle = {
  minWidth: 110,
  height: 34,
  fontSize: 13,
  margin: 0,
  padding: "0 28px",
  lineHeight: "34px",
  boxSizing: "border-box",
};

const tooltipProps = {
  arrow: true,
  placement: "top",
  slotProps: {
    tooltip: {
      sx: {
        backgroundColor: "#fff",
        color: "#333",
        border: "1px solid #d1d5db",
        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
        fontSize: 13,
        maxWidth: 500,
        padding: "12px 16px",
      },
    },
    arrow: { sx: { color: "#fff" } },
  },
};

const tooltips = {
  enabled:
    "Enable the DHCP server on this LAN interface. When enabled, connected devices can automatically obtain IP addresses from the configured address pool.",
  ipRange:
    "Specify the range of IP addresses the DHCP server can assign to clients on this interface. Typically entered as a start and end address (e.g., 192.168.1.100-192.168.1.200).",
  subnetMask:
    "Specify the subnet mask for the DHCP address pool. It must match the subnet of this LAN interface.",
  defaultGateway:
    "Specify the default gateway IP address assigned to DHCP clients. Clients will use this address to route traffic outside the local network.",
  dnsServer:
    "Specify the DNS server IP address provided to DHCP clients for domain name resolution.",
};

const getTooltipKey = (name) => name.replace(/\d+$/, "");

const FieldRow = ({ name, label, labelStyle, children }) => {
  const tooltipKey = getTooltipKey(name);
  const tooltip = tooltips[tooltipKey];

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-center w-full gap-2 sm:gap-4">
      <Tooltip
        title={tooltip || ""}
        disableHoverListener={!tooltip}
        {...tooltipProps}
      >
        <label
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: C.labelText,
            width: "100%",
            maxWidth: 220,
            flexShrink: 0,
            cursor: tooltip ? "help" : "default",
            ...labelStyle,
          }}
        >
          {label}
        </label>
      </Tooltip>
      <div className="flex-1 w-full max-w-[280px]">{children}</div>
    </div>
  );
};

const Btn = ({
  children,
  onClick,
  disabled,
  variant = "default",
  style: extraStyle,
  type,
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
  };
  const s = styles[variant] || styles.default;
  const hoverBg =
    {
      primary: "linear-gradient(to bottom, #3E5475 0%, #5A6F8F 100%)",
      cancel: "#b6c2d3",
      default: "#e2e8f0",
    }[variant] || "#e2e8f0";
  const activeBg =
    {
      primary: "linear-gradient(to bottom, #2C3E57 0%, #3E5475 100%)",
      cancel: "#a3b1c2",
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
          variant === "primary" || variant === "cancel"
            ? "8px 32px"
            : "6px 14px",
        borderRadius: 8,
        fontSize: variant === "primary" || variant === "cancel" ? 14 : 12,
        fontWeight: 600,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.6 : 1,
        transition:
          "background 0.15s ease, transform 0.1s ease, box-shadow 0.1s ease",
        height: variant === "primary" || variant === "cancel" ? 38 : 30,
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

const SectionHeading = ({ title, isFirst = false }) => (
  <div
    style={{
      margin: isFirst ? "0 0 28px 0" : "24px 0 28px 0",
      position: "relative",
    }}
  >
    <div style={{ borderTop: `1px solid ${C.divider}` }} />
    <span
      style={{
        position: "absolute",
        top: -10,
        left: 0,
        background: C.cardBg,
        paddingRight: 8,
        fontSize: 13,
        fontWeight: 500,
        color: C.labelText,
        letterSpacing: "0.01em",
      }}
    >
      {title}
    </span>
  </div>
);

const dhcpPageWrapStyle = {
  backgroundColor: C.pageBg,
  minHeight: "calc(100vh - 80px)",
  width: "100%",
  maxWidth: "100%",
  padding: "8px 28px 16px",
  display: "flex",
  flexDirection: "column",
  alignItems: "stretch",
  boxSizing: "border-box",
};

const dhcpPageInnerStyle = {
  width: "100%",
  maxWidth: "100%",
  margin: 0,
  display: "flex",
  flexDirection: "column",
};

const dhcpCardShellStyle = {
  display: "flex",
  flexDirection: "column",
  width: "100%",
  padding: "6px",
  boxSizing: "border-box",
};

const dhcpTableContainerStyle = {
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

const dhcpToolbarStyle = {
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

const dhcpFieldGroupStyle = {
  display: "flex",
  flexDirection: "column",
  gap: 18,
  width: "100%",
};

const dhcpFixedAlertSx = {
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

const DhcpPageShell = ({ children }) => (
  <div style={dhcpPageWrapStyle} data-native-scroll>
    <div style={dhcpPageInnerStyle}>{children}</div>
  </div>
);

const DhcpBreadcrumb = () => (
  <div
    style={{
      fontSize: 12,
      color: "#94a3b8",
      marginBottom: 12,
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
    <span style={{ color: "#1e293b", fontWeight: 600 }}>DHCP Server</span>
  </div>
);

const buildSavePayload = (formData, sections) => {
  const payload = {};
  sections.forEach((section) => {
    section.fields.forEach((field) => {
      payload[field.name] = formData[field.name];
    });
  });
  return payload;
};

const DhcpServerSettings = () => {
  const [form, setForm] = useState(DHCP_SERVER_SETTINGS_INITIAL_FORM);
  const [lanSections, setLanSections] = useState([]);
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
        const lanPorts = response.data;
        const mappedData = {};

        lanPorts.forEach((lanData, index) => {
          const lanNumber = index + 1;
          mappedData[`enabled${lanNumber}`] = lanData.enabled || false;
          mappedData[`ipRange${lanNumber}`] = lanData.ipRange || "";
          mappedData[`subnetMask${lanNumber}`] = lanData.subnetMask || "";
          mappedData[`defaultGateway${lanNumber}`] =
            lanData.defaultGateway || "";
          mappedData[`dnsServer${lanNumber}`] = lanData.dnsServer || "";
        });

        setLanSections(buildDhcpLanSections(lanPorts));
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

      const response = await fetchSaveDhcpSettings(
        buildSavePayload(form, lanSections),
      );

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
    <DhcpPageShell>
      {error && (
        <Alert
          severity="error"
          onClose={() => setError(null)}
          sx={dhcpFixedAlertSx}
        >
          {error}
        </Alert>
      )}

      {success && (
        <Alert
          severity="success"
          onClose={() => setSuccess(null)}
          sx={{
            ...dhcpFixedAlertSx,
            top: error ? 88 : 20,
          }}
        >
          {success}
        </Alert>
      )}

      <DhcpBreadcrumb />

      <div style={dhcpCardShellStyle}>
        <div style={dhcpTableContainerStyle}>
          <div style={dhcpToolbarStyle}>
            <span
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: C.labelText,
                letterSpacing: "0.02em",
              }}
            >
              DHCP Server
            </span>
          </div>

          <div style={{ padding: "16px 36px 32px" }}>
            {loading && lanSections.length === 0 ? (
              <div
                className="flex items-center justify-center w-full"
                style={{ minHeight: 400, padding: "48px 32px" }}
              >
                <div className="text-center">
                  <CircularProgress size={40} sx={{ color: C.accent }} />
                  <div
                    style={{
                      marginTop: 12,
                      fontSize: 13,
                      color: C.mutedText,
                      fontWeight: 500,
                    }}
                  >
                    Loading DHCP settings...
                  </div>
                </div>
              </div>
            ) : (
              <form
                id="dhcp-settings-form"
                onSubmit={handleSave}
                className="flex flex-col"
                style={{ gap: 24 }}
              >
                {lanSections.length === 0 ? (
                  <div
                    style={{
                      textAlign: "center",
                      fontSize: 13,
                      color: C.mutedText,
                      padding: "24px 0",
                    }}
                  >
                    No connected LAN ports found.
                  </div>
                ) : (
                  lanSections.map((lanGroup, idx) => {
                    const isEnabled = form[lanGroup.fields[0].name];
                    return (
                      <div key={lanGroup.lan} className="flex flex-col gap-0">
                        <SectionHeading
                          title={lanGroup.lan}
                          isFirst={idx === 0}
                        />

                        <div
                          className="flex flex-col w-full"
                          style={{
                            ...dhcpFieldGroupStyle,
                            maxWidth: 640,
                            margin: "0 auto",
                          }}
                        >
                          <FieldRow
                            name={lanGroup.fields[0].name}
                            label="DHCP Server:"
                          >
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
                          </FieldRow>

                          {lanGroup.fields.slice(1).map((field) => (
                            <FieldRow
                              key={field.name}
                              name={field.name}
                              label={`${field.label}:`}
                              labelStyle={{
                                opacity: isEnabled ? 1 : 0.6,
                              }}
                            >
                              <input
                                type="text"
                                name={field.name}
                                value={form[field.name] || ""}
                                onChange={handleChange}
                                disabled={!isEnabled}
                                style={
                                  isEnabled ? inputStyle : disabledInputStyle
                                }
                                onFocus={
                                  isEnabled
                                    ? inputInteraction.onFocus
                                    : undefined
                                }
                                onBlur={
                                  isEnabled
                                    ? inputInteraction.onBlur
                                    : undefined
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
                            </FieldRow>
                          ))}
                        </div>
                      </div>
                    );
                  })
                )}
              </form>
            )}
          </div>

          {(!loading || lanSections.length > 0) && (
            <div style={advancedFormInlineFooterStyle}>
              <Btn
                variant="cancel"
                type="button"
                onClick={handleReset}
                disabled={loading || lanSections.length === 0}
                style={advancedFormBtnStyle}
              >
                {loading ? "Resetting..." : "Reset"}
              </Btn>
              <Btn
                variant="primary"
                type="submit"
                form="dhcp-settings-form"
                disabled={loading || lanSections.length === 0}
                style={advancedFormBtnStyle}
              >
                {loading ? "Saving..." : "Save"}
              </Btn>
            </div>
          )}
        </div>
      </div>
    </DhcpPageShell>
  );
};

export default DhcpServerSettings;
