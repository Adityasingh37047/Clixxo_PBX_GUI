import React, { useState, useEffect } from "react";
import { Alert, CircularProgress } from "@mui/material";
import { Tooltip } from "@mui/material";
import axiosInstance from "../../../api/axiosInstance";
const fetchRoutingInfo = async () => {
  const res = await axiosInstance.get("/get-routing-info");
  if (!res.data?.response)
    throw new Error(res.data?.message || "Failed to get routing info");
  return res.data.data;
};

const changeRouting = async (payload) => {
  const res = await axiosInstance.post("/change-routing", payload);
  if (!res.data?.response)
    throw new Error(res.data?.message || "Failed to change routing");
  return res.data;
};

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

const inputStyle = systemFieldInputStyleNarrow;
const selectStyle = systemFieldSelectStyle;

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

const SectionHeading = ({ title, isFirst = false }) => (
  <div
    style={{
      margin: isFirst ? "0 0 24px 0" : "16px 0 24px 0",
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

const routingPageWrapStyle = {
  backgroundColor: C.pageBg,
  minHeight: "calc(100vh - 80px)",
  padding: 16,
  boxSizing: "border-box",
};

const routingPageInnerStyle = {
  width: "100%",
  maxWidth: "100%",
  margin: "0 auto",
};

const routingTableContainerStyle = {
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

const routingToolbarStyle = {
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

const routingFieldGroupStyle = {
  display: "flex",
  flexDirection: "column",
  gap: 10,
  width: "100%",
};

const routingFixedAlertSx = {
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

const RoutingPageShell = ({ children }) => (
  <div style={routingPageWrapStyle} data-native-scroll>
    <div style={routingPageInnerStyle}>{children}</div>
  </div>
);

const RoutingBreadcrumb = () => (
  <div
    style={{
      fontSize: 12,
      color: "#94a3b8",
      marginBottom: 16,
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
    <span style={{ color: "#1e293b", fontWeight: 600 }}>Routing Interface</span>
  </div>
);

const ROUTES_TABLE_RADIUS = CARD_RADIUS;

/** Read-only / disabled — same as Network page */
const disabledInputStyle = {
  ...inputStyle,
  background: "#f1f5f9",
  color: "#94a3b8",
  cursor: "not-allowed",
  borderColor: "#e2e8f0",
};

/** Select — same box as Network page */
const nativeSelectStyle = selectStyle;

const routesTableShellStyle = {
  border: `1px solid ${C.cardBorder}`,
  borderRadius: ROUTES_TABLE_RADIUS,
  overflow: "hidden",
  background: C.cardBg,
  boxShadow: "0 1px 2px rgba(15,23,42,0.04)",
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

const FieldRow = ({ label, tooltip, children }) => (
  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-center w-full gap-2 sm:gap-4">
    <Tooltip title={tooltip || ""} disableHoverListener={!tooltip} {...tooltipProps}>
      <label
        style={{
          fontSize: 12,
          fontWeight: 600,
          color: C.labelText,
          width: "100%",
          maxWidth: 220,
          flexShrink: 0,
          cursor: tooltip ? "help" : "default",
        }}
      >
        {label}
      </label>
    </Tooltip>
    <div className="flex-1 w-full max-w-[280px]">{children}</div>
  </div>
);

function isValidIPv4(ip) {
  return /^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(
    ip,
  );
}

const TH = ({ children, isLast = false }) => (
  <th
    style={{
      background: C.gridHeaderBg,
      color: C.labelText,
      fontWeight: 700,
      fontSize: 11,
      padding: "9px 14px",
      textAlign: "center",
      borderBottom: `1px solid ${C.divider}`,
      borderRight: isLast ? "none" : `1px solid ${C.divider}`,
      whiteSpace: "nowrap",
      textTransform: "uppercase",
      letterSpacing: "0.12em",
    }}
  >
    {children}
  </th>
);

const TD = ({ children, highlight, isLastCol = false, isLastRow = false }) => (
  <td
    style={{
      padding: "8px 14px",
      fontSize: 12,
      color: highlight ? C.accent : C.valueText,
      fontWeight: highlight ? 700 : 400,
      textAlign: "center",
      borderBottom: isLastRow ? "none" : `1px solid ${C.divider}`,
      borderRight: isLastCol ? "none" : `1px solid ${C.divider}`,
    }}
  >
    {children}
  </td>
);

const EMPTY_CURRENT = {
  interface: "—",
  gateway: "—",
  ipAddress: "—",
  subnetMask: "—",
  metric: "—",
};

const RoutingInterface = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [current, setCurrent] = useState(EMPTY_CURRENT);
  const [activeRoutes, setActiveRoutes] = useState([]);
  const [interfaces, setInterfaces] = useState([]);

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    interface: "",
    gateway: "",
    metric: "100",
  });
  const [formIp, setFormIp] = useState("");
  const [formSubnet, setFormSubnet] = useState("");
  const [errors, setErrors] = useState({ gateway: "", metric: "" });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const data = await fetchRoutingInfo();
      setCurrent(data.current || EMPTY_CURRENT);
      setActiveRoutes(data.activeRoutes || []);
      setInterfaces(data.interfaces || []);
    } catch (e) {
      setErrorMsg(e?.message || "Failed to load routing information.");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenForm = () => {
    if (interfaces.length === 0) return;
    const first = interfaces[0];
    setForm({
      interface: first.interface,
      gateway: first.configuredGateway || "",
      metric: String(first.metric ?? 100),
    });
    setFormIp(first.ipAddress || "");
    setFormSubnet(first.subnetMask || "");
    setErrors({ gateway: "", metric: "" });
    setShowForm(true);
  };

  const handleIfaceChange = (ifaceName) => {
    const found = interfaces.find((i) => i.interface === ifaceName);
    if (!found) return;
    setForm({
      interface: ifaceName,
      gateway: found.configuredGateway || "",
      metric: String(found.metric ?? 100),
    });
    setFormIp(found.ipAddress || "");
    setFormSubnet(found.subnetMask || "");
    setErrors({ gateway: "", metric: "" });
  };

  const handleFormChange = (field, value) => {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: "" }));
  };

  const validate = () => {
    const e = { gateway: "", metric: "" };
    let ok = true;
    if (!isValidIPv4(form.gateway)) {
      e.gateway = "Enter a valid gateway IP address.";
      ok = false;
    }
    const m = parseInt(form.metric, 10);
    if (isNaN(m) || m < 0 || m > 9999) {
      e.metric = "Metric must be a number between 0 and 9999.";
      ok = false;
    }
    setErrors(e);
    return ok;
  };

  const handleSave = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;

    const confirmed = window.confirm(
      `Switch default routing to ${form.interface}?\n\nGateway: ${form.gateway}\nMetric: ${form.metric}\n\nThis will update the active routing interface.`,
    );
    if (!confirmed) return;

    setSaving(true);
    setErrorMsg("");
    setSuccessMsg("");
    try {
      const result = await changeRouting({
        interface: form.interface,
        gateway: form.gateway,
        metric: parseInt(form.metric, 10),
      });
      setSuccessMsg(
        result.message ||
          `Routing interface switched to ${form.interface} successfully.`,
      );
      setShowForm(false);
      await loadData();
    } catch (e) {
      setErrorMsg(e?.message || "Failed to apply routing changes.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setErrors({ gateway: "", metric: "" });
  };

  return (
    <RoutingPageShell>
      {errorMsg && (
        <Alert
          severity="error"
          onClose={() => setErrorMsg("")}
          sx={routingFixedAlertSx}
        >
          {errorMsg}
        </Alert>
      )}
      {successMsg && (
        <Alert
          severity="success"
          onClose={() => setSuccessMsg("")}
          sx={{
            ...routingFixedAlertSx,
            top: errorMsg ? 88 : 20,
          }}
        >
          {successMsg}
        </Alert>
      )}

      <RoutingBreadcrumb />

      <div style={routingTableContainerStyle}>
          <div style={routingToolbarStyle}>
            <span
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: C.labelText,
                letterSpacing: "0.02em",
              }}
            >
              Routing Interface
            </span>
            {!loading && !showForm && (
              <Btn
                variant="primary"
                onClick={handleOpenForm}
                style={advancedFormBtnStyle}
              >
                Switch Routing Interface
              </Btn>
            )}
          </div>

          <div
            style={{
              padding:
                showForm && !loading ? "24px 36px 0" : "24px 36px 24px",
            }}
          >
            {loading ? (
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
                    Loading routing information...
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {/* ── Current Active Routing (read-only) ── */}
                <div className="flex flex-col gap-0">
                  <SectionHeading title="Current Active Routing" isFirst />
                  <div
                    className="flex flex-col gap-3 w-full"
                    style={{ ...routingFieldGroupStyle, maxWidth: 640, margin: "0 auto" }}
                  >
                    <FieldRow label="Active Interface:"
                    tooltip="The interface that is currently active and being used for routing."
                    >
                      <input
                        type="text"
                        readOnly
                        value={current.interface}
                        style={disabledInputStyle}
                      />
                    </FieldRow>
                    <FieldRow label="IP Address:"
                    tooltip="The IP address of the current active interface.">
                      <input
                        type="text"
                        readOnly
                        value={current.ipAddress}
                        style={disabledInputStyle}
                      />
                    </FieldRow>
                    <FieldRow label="Subnet Mask:"
                    tooltip="The subnet mask of the current active interface.">
                      <input
                        type="text"
                        readOnly
                        value={current.subnetMask}
                        style={disabledInputStyle}
                      />
                    </FieldRow>
                    <FieldRow label="Gateway IP:"
                    tooltip="The gateway IP address of the current active interface.">
                      <input
                        type="text"
                        readOnly
                        value={current.gateway}
                        style={disabledInputStyle}
                      />
                    </FieldRow>
                    <FieldRow label="Metric:"
                    tooltip="The metric of the current active interface."
                    >
                      <input
                        type="text"
                        readOnly
                        value={String(current.metric)}
                        style={disabledInputStyle}
                      />
                    </FieldRow>
                  </div>
                </div>

                {/* ── Active Routes Table ── */}
                {activeRoutes.length > 0 && (
                  <div className="flex flex-col gap-0">
                    <SectionHeading title="Active Routes" />
                    <div style={{ overflowX: "auto" }}>
                      <div style={routesTableShellStyle}>
                      <table
                        style={{
                          width: "100%",
                          borderCollapse: "collapse",
                          fontSize: 12,
                        }}
                      >
                        <thead>
                          <tr>
                            <TH>Interface</TH>
                            <TH>Gateway</TH>
                            <TH>Metric</TH>
                            <TH isLast>Status</TH>
                          </tr>
                        </thead>
                        <tbody>
                          {activeRoutes.map((route, idx) => {
                            const isActive =
                              route.interface === current.interface;
                            const isLastRow = idx === activeRoutes.length - 1;
                            return (
                              <tr
                                key={idx}
                                style={{
                                  background: isActive ? "#f0f4f8" : C.cardBg,
                                }}
                              >
                                <TD highlight={isActive} isLastRow={isLastRow}>
                                  {route.interface}
                                </TD>
                                <TD isLastRow={isLastRow}>{route.gateway}</TD>
                                <TD isLastRow={isLastRow}>{route.metric}</TD>
                                <TD isLastCol isLastRow={isLastRow}>
                                  {isActive ? (
                                    <span
                                      style={{
                                        display: "inline-block",
                                        padding: "2px 8px",
                                        borderRadius: 6,
                                        background: "#dcfce7",
                                        color: "#16a34a",
                                        fontSize: 11,
                                        fontWeight: 700,
                                      }}
                                    >
                                      Active
                                    </span>
                                  ) : (
                                    <span
                                      style={{
                                        display: "inline-block",
                                        padding: "2px 8px",
                                        borderRadius: 6,
                                        background: "#f1f5f9",
                                        color: "#94a3b8",
                                        fontSize: 11,
                                        fontWeight: 600,
                                      }}
                                    >
                                      Standby
                                    </span>
                                  )}
                                </TD>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                      </div>
                    </div>
                  </div>
                )}

                {/* ── Switch Form ── */}
                {showForm && (
                  <form
                    id="routing-switch-form"
                    onSubmit={handleSave}
                    className="flex flex-col gap-2"
                  >
                    <SectionHeading title="Target Interface Configuration" />
                    <div
                      className="flex flex-col gap-3 w-full"
                      style={{ ...routingFieldGroupStyle, maxWidth: 640, margin: "0 auto 12px" }}
                    >
                      {/* Interface dropdown */}
                      <FieldRow label="Select Interface (M):"
                      tooltip="Select the interface to switch to.">
                        <select
                          value={form.interface}
                          onChange={(e) => handleIfaceChange(e.target.value)}
                          style={nativeSelectStyle}
                          onFocus={inputInteraction.onFocus}
                          onBlur={inputInteraction.onBlur}
                          onMouseEnter={inputInteraction.onMouseEnter}
                          onMouseLeave={inputInteraction.onMouseLeave}
                        >
                          {interfaces.map((i) => (
                            <option key={i.interface} value={i.interface}>
                              {i.interface}
                            </option>
                          ))}
                        </select>
                      </FieldRow>

                      {/* IP Address — read-only, auto-filled */}
                      <FieldRow label="IP Address:"
                      tooltip="The IP address of the selected interface.">
                        <input
                          type="text"
                          readOnly
                          value={formIp}
                          style={disabledInputStyle}
                        />
                      </FieldRow>

                      {/* Subnet Mask — read-only, auto-filled */}
                      <FieldRow label="Subnet Mask:"
                      tooltip="The subnet mask of the selected interface.">
                        <input
                          type="text"
                          readOnly
                          value={formSubnet}
                          style={disabledInputStyle}
                        />
                      </FieldRow>

                      {/* Gateway — editable */}
                      <FieldRow label="Gateway IP (M):"
                      tooltip="The gateway IP address of the selected interface.">
                        <input
                          type="text"
                          value={form.gateway}
                          onChange={(e) =>
                            handleFormChange("gateway", e.target.value)
                          }
                          placeholder="e.g. 192.168.1.1"
                          style={{
                            ...inputStyle,
                            borderColor: errors.gateway
                              ? C.errorRed
                              : C.cardBorder,
                          }}
                          onFocus={inputInteraction.onFocus}
                          onBlur={inputInteraction.onBlur}
                          onMouseEnter={inputInteraction.onMouseEnter}
                          onMouseLeave={inputInteraction.onMouseLeave}
                        />
                        {errors.gateway && (
                          <div
                            style={{
                              color: C.errorRed,
                              fontSize: 11,
                              marginTop: 4,
                            }}
                          >
                            {errors.gateway}
                          </div>
                        )}
                      </FieldRow>

                      {/* Metric — editable */}
                      <FieldRow label="Metric:"
                      tooltip="The metric of the selected interface.">
                        <input
                          type="text"
                          value={form.metric}
                          onChange={(e) =>
                            handleFormChange("metric", e.target.value)
                          }
                          placeholder="Default: 100"
                          style={{
                            ...inputStyle,
                            borderColor: errors.metric
                              ? C.errorRed
                              : C.cardBorder,
                          }}
                          onFocus={inputInteraction.onFocus}
                          onBlur={inputInteraction.onBlur}
                          onMouseEnter={inputInteraction.onMouseEnter}
                          onMouseLeave={inputInteraction.onMouseLeave}
                        />
                        {errors.metric && (
                          <div
                            style={{
                              color: C.errorRed,
                              fontSize: 11,
                              marginTop: 4,
                            }}
                          >
                            {errors.metric}
                          </div>
                        )}
                      </FieldRow>
                    </div>
                  </form>
                )}
              </div>
            )}
          </div>

          {showForm && !loading && (
            <div style={advancedFormInlineFooterStyle}>
              <Btn
                variant="cancel"
                type="button"
                onClick={handleCancel}
                disabled={saving}
                style={advancedFormBtnStyle}
              >
                Cancel
              </Btn>
              <Btn
                variant="primary"
                type="submit"
                form="routing-switch-form"
                disabled={saving}
                style={advancedFormBtnStyle}
              >
                {saving ? "Applying..." : "Apply & Switch"}
              </Btn>
            </div>
          )}
        </div>
    </RoutingPageShell>
  );
};

export default RoutingInterface;
