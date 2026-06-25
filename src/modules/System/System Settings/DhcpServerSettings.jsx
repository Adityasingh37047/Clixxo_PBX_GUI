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
import { Alert, Checkbox } from "@mui/material";
const C = {
  pageBg: "var(--bg-main)",
  cardBg: "var(--bg-surface)",
  cardBorder: "var(--border-subtle)",
  divider: "var(--border-subtle)",
  cardShadow: "var(--shadow-soft)",
  labelText: "var(--text-primary)",
  valueText: "var(--text-primary)",
  strongText: "var(--text-primary)",
  mutedText: "var(--text-muted)",
  accent: "var(--accent-brand)",
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
// ── Local field UI (inlined from systemSharedUi) ──
const OUTLINED_BORDER = "var(--border-subtle)";
const OUTLINED_HOVER = "var(--border-strong)";
const OUTLINED_FOCUS = "var(--status-primary)";
const FOCUS_RING_SHADOW = (color) => `0 0 0 1px ${color}`;

const setFieldDefault = (el) => {
  el.style.borderColor = OUTLINED_BORDER;
  el.style.borderWidth = "1px";
  el.style.boxShadow = "none";
  el.style.backgroundColor = "var(--bg-main)";
};

const setFieldHover = (el) => {
  el.style.borderColor = OUTLINED_HOVER;
  el.style.borderWidth = "1px";
  el.style.boxShadow = "none";
  el.style.backgroundColor = "var(--input-hover-bg)";
};

const setFieldFocus = (el) => {
  el.style.borderColor = OUTLINED_FOCUS;
  el.style.borderWidth = "1px";
  el.style.boxShadow = FOCUS_RING_SHADOW(OUTLINED_FOCUS);
  el.style.backgroundColor = "var(--bg-main)";
};

const nativeFieldInputStyle = {
  height: 28,
  width: 200,
  padding: "0 8px",
  fontSize: 13,
  border: `1px solid ${OUTLINED_BORDER}`,
  borderRadius: 4,
  outline: "none",
  backgroundColor: "var(--bg-main)",
  color: "var(--text-primary)",
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
  borderRadius: 10,
  background: "var(--bg-main)",
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
  justifyContent: "center",
  gap: 12,
  width: "calc(100% + 40px)",
  marginLeft: -20,
  marginRight: -20,
  marginTop: 0,
  marginBottom: 0,
  padding: "10px 20px 10px",
    borderTop: `1px solid var(--border-subtle)`,
  background: "var(--bg-surface)",
  boxSizing: "border-box",
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

const FieldLabel = ({ name, style, children }) => {
  const tooltipKey = getTooltipKey(name);
  const label = <label style={style}>{children}</label>;

  if (!tooltips[tooltipKey]) return label;

  return (
    <Tooltip title={tooltips[tooltipKey]} {...tooltipProps}>
      {label}
    </Tooltip>
  );
};

const BTN_BASE =
  "inline-flex items-center justify-center gap-[6px] h-[30px] px-[14px] py-[6px] rounded-[10px] text-[12px] font-semibold whitespace-nowrap transition-all duration-150 ease-in-out cursor-pointer border disabled:cursor-not-allowed disabled:opacity-60";
const BTN_DEFAULT = `${BTN_BASE} bg-[var(--bg-surface)] text-[var(--text-primary)] border-[var(--border-subtle)] hover:bg-[var(--row-alt)]`;
const BTN_OUTLINE = `${BTN_BASE} bg-[var(--bg-surface)] text-[var(--text-label)] border-[var(--border-strong)] hover:bg-[var(--row-alt)]`;
const BTN_CANCEL = `${BTN_BASE} bg-[var(--border-subtle)] text-[var(--text-primary)] border-[var(--border-subtle)] hover:opacity-90`;
const BTN_PRIMARY = `${BTN_BASE} text-white border-[#5A6F8F] bg-[linear-gradient(to_bottom,#5A6F8F_0%,#3E5475_60%,#2C3E57_100%)] hover:bg-[linear-gradient(to_bottom,#3E5475_0%,#5A6F8F_100%)]`;
const BTN_ERROR = `${BTN_BASE} bg-[#dc2626] text-white border-[#dc2626] hover:bg-[#b91c1c]`;
const BTN_DELETE = `${BTN_BASE} bg-[#fee2e2] text-[#991b1b] border-[#fecaca] hover:bg-[#fecaca]`;
const BTN_EDIT = `${BTN_BASE} bg-[#dcfce7] text-[#166534] border-[#bbf7d0] hover:bg-[#bbf7d0]`;
const BTN_DANGER = `${BTN_BASE} bg-[#fef2f2] text-[#dc2626] border-[0.5px] border-[#fecaca] hover:bg-[#fca5a5]`;

const btnVariantCls = {
  default: BTN_DEFAULT,
  primary: BTN_PRIMARY,
  cancel: BTN_CANCEL,
  outline: BTN_OUTLINE,
  error: BTN_ERROR,
  delete: BTN_DELETE,
  edit: BTN_EDIT,
  danger: BTN_DANGER,
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

const disabledInputStyle = {
  ...inputStyle,
  background: "var(--bg-muted)",
  color: "var(--text-muted)",
  cursor: "not-allowed",
  borderColor: "var(--border-subtle)",
};

const SectionHeading = ({ title, isFirst = false }) => (
  <div
    style={{
      margin: isFirst ? "0 0 24px 0" : "16px 0 24px 0",
      position: "relative",
    }}
  >
    <div style={{ borderTop: `1px solid var(--border-subtle)` }} />
    <span
      style={{
        position: "absolute",
        top: -10,
        left: 0,
        background: C.cardBg,
        paddingRight: 8,
        fontSize: 13,
        fontWeight: 600,
        color: C.mutedText,
      }}
    >
      {title}
    </span>
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
    <div
      className="clixxo-system-settings theme-page-bg min-h-[calc(100vh-80px)] p-4 flex flex-col items-center"
      style={{ backgroundColor: C.pageBg }}
    >
      <div className="w-full" style={{ maxWidth: 1000 }}>
        {error && (
          <Alert
            severity="error"
            onClose={() => setError(null)}
            sx={SYS_TOAST_SX}
          >
            {error}
          </Alert>
        )}

        {success && (
          <Alert
            severity="success"
            onClose={() => setSuccess(null)}
            sx={SYS_TOAST_SX}
          >
            {success}
          </Alert>
        )}

        {/* ── Breadcrumb ── */}
        <div
          style={{
            fontSize: 12,
            color: "var(--text-muted)",
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
            borderRadius: 10,
            overflow: "hidden",
            boxShadow: C.cardShadow,
            marginBottom: 24,
            border: `1px solid var(--border-subtle)`,
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
              padding: "7px 14px",
              borderBottom: `1px solid ${C.divider}`,
              background: C.cardBg,
            }}
          >
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

          {/* Card Body */}
          <div
            className="w-full flex flex-col"
            style={{ padding: "24px 32px 0" }}
          >
            <form onSubmit={handleSave} className="flex flex-col">
              <div className="flex flex-col gap-2" style={{ marginBottom: 12 }}>
              {loading && lanSections.length === 0 ? (
                <div
                  style={{
                    textAlign: "center",
                    fontSize: 13,
                    color: C.mutedText,
                    padding: "24px 0",
                  }}
                >
                  Loading DHCP settings...
                </div>
              ) : lanSections.length === 0 ? (
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
              ) : null}
              {lanSections.map((lanGroup, idx) => {
                const isEnabled = form[lanGroup.fields[0].name];
                return (
                  <div key={lanGroup.lan} className="flex flex-col gap-0">
                    <SectionHeading title={lanGroup.lan} isFirst={idx === 0} />

                    <div
                      className="flex flex-col gap-3 w-full"
                      style={{ maxWidth: 640, margin: "0 auto" }}
                    >
                      {/* Enable DHCP Checkbox */}
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-center w-full gap-2 sm:gap-4">
                        <FieldLabel
                          name={lanGroup.fields[0].name}
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
                        </FieldLabel>
                        <div className="flex flex-col w-full max-w-[280px]">
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
                          className="flex flex-col sm:flex-row items-start sm:items-center justify-center w-full gap-2 sm:gap-4"
                        >
                          <FieldLabel
                            name={field.name}
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
                          </FieldLabel>
                          <div className="flex flex-col w-full max-w-[280px]">
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
              </div>

              <div
                style={{
                  ...advancedFormInlineFooterStyle,
                  width: "calc(100% + 64px)",
                  marginLeft: -32,
                  marginRight: -32,
                }}
              >
                <Btn
                  variant="primary"
                  type="submit"
                  disabled={loading || lanSections.length === 0}
                  style={advancedFormBtnStyle}
                >
                  {loading ? "Saving..." : "Save"}
                </Btn>
                <Btn
                  variant="cancel"
                  type="button"
                  onClick={handleReset}
                  disabled={loading || lanSections.length === 0}
                  style={advancedFormBtnStyle}
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
