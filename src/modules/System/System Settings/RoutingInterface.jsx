import React, { useState, useEffect } from "react";
import { Alert, CircularProgress } from "@mui/material";
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
  cardBorder: "#9CA3AF",
  divider: "#9CA3AF",
  cardShadow: "0 10px 30px rgba(15,23,42,0.06)",
  labelText: "#3E5475",
  valueText: "#1e293b",
  strongText: "#0f172a",
  mutedText: "#30415A",
  errorRed: "#dc2626",
  primary: "#2563eb",
  gridHeaderBg: "#F8FAFC",
};
// ── Local field UI (inlined from systemSharedUi) ──
const OUTLINED_BORDER = "rgba(0, 0, 0, 0.23)";
const OUTLINED_HOVER = "rgba(0, 0, 0, 0.87)";
const OUTLINED_FOCUS = "#1976d2";
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

const nativeFieldInputStyle = {
  height: 28,
  width: 200,
  padding: "0 8px",
  fontSize: 13,
  border: `1px solid ${OUTLINED_BORDER}`,
  borderRadius: 4,
  outline: "none",
  backgroundColor: "#fff",
  color: "#0f172a",
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

const systemFieldInputStyleNarrow = {
  ...nativeFieldBase,
  width: "100%",
  padding: "6px 10px",
  borderRadius: 10,
  background: "#fff",
  lineHeight: 1.4,
  minHeight: 34,
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
  borderTop: `1px solid ${C.cardBorder}`,
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

const SYSTEM_SETTINGS_NATIVE_FIELD_CLASS = "system-settings-native-field";


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
      background:
        "linear-gradient(to bottom, #5A6F8F 0%, #3E5475 60%, #2C3E57 100%)",
      color: "#fff",
      border: "1px solid #5A6F8F",
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
    variant === "primary"
      ? "linear-gradient(to bottom, #3E5475 0%, #5A6F8F 100%)"
      : variant === "cancel"
        ? "#b6c2d3"
        : "#e2e8f0";
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

const SectionHeading = ({ title, isFirst = false }) => (
  <div
    style={{
      margin: isFirst ? "0 0 24px 0" : "16px 0 24px 0",
      position: "relative",
    }}
  >
    <div style={{ borderTop: `1px solid ${C.cardBorder}` }} />
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

const ROUTES_TABLE_RADIUS = 2;

/** Read-only / disabled — same as Network page */
const disabledInputStyle = {
  ...inputStyle,
  background: "#f1f5f9",
  color: "#94a3b8",
  cursor: "not-allowed",
  borderColor: "#e2e8f0",
};

/** Select — same box as Gateway IP; appearance:none so border-radius renders on native select */
const nativeSelectStyle = {
  ...inputStyle,
  borderRadius: 4,
  appearance: "none",
  WebkitAppearance: "none",
  MozAppearance: "none",
  cursor: "pointer",
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
  backgroundRepeat: "no-repeat",
  backgroundPosition: "right 10px center",
  paddingRight: 28,
};

/** Same width/height for Switch, Cancel, and Apply & Switch */
const actionBtnStyle = {
  minWidth: 190,
  height: 30,
  padding: "6px 16px",
  fontSize: 12,
  boxSizing: "border-box",
};

const routesTableShellStyle = {
  border: `1px solid ${C.cardBorder}`,
  borderRadius: ROUTES_TABLE_RADIUS,
  overflow: "hidden",
  background: C.cardBg,
};

const FieldRow = ({ label, children }) => (
  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-center w-full gap-2 sm:gap-4">
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
    <div className="flex-1 w-full">{children}</div>
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
      borderBottom: `1px solid ${C.cardBorder}`,
      borderRight: isLast ? "none" : `1px solid ${C.cardBorder}`,
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
      color: highlight ? C.primary : C.valueText,
      fontWeight: highlight ? 700 : 400,
      textAlign: "center",
      borderBottom: isLastRow ? "none" : `1px solid ${C.cardBorder}`,
      borderRight: isLastCol ? "none" : `1px solid ${C.cardBorder}`,
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
    <div
      className="min-h-[calc(100vh-80px)] p-4 flex flex-col items-center"
      style={{ backgroundColor: C.pageBg }}
    >
      <div className="w-full" style={{ maxWidth: 1000 }}>
        {errorMsg && (
          <Alert
            severity="error"
            onClose={() => setErrorMsg("")}
            sx={{
              position: "fixed",
              top: 20,
              right: 20,
              zIndex: 9999,
              minWidth: 300,
              maxWidth: 500,
              wordBreak: "break-word",
              boxShadow: 3,
            }}
          >
            {errorMsg}
          </Alert>
        )}
        {successMsg && (
          <Alert
            severity="success"
            onClose={() => setSuccessMsg("")}
            sx={{
              position: "fixed",
              top: 20,
              right: 20,
              zIndex: 9999,
              minWidth: 300,
              maxWidth: 500,
              wordBreak: "break-word",
              boxShadow: 3,
            }}
          >
            {successMsg}
          </Alert>
        )}

        {/* Breadcrumb */}
        <div
          style={{
            fontSize: 12,
            color: "#94a3b8",
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
            Routing Interface
          </span>
        </div>

        {/* Main Card */}
        <div
          style={{
            background: C.cardBg,
            borderRadius: 10,
            overflow: "hidden",
            boxShadow: C.cardShadow,
            marginBottom: 24,
            border: `1.5px solid ${C.cardBorder}`,
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
              justifyContent: "space-between",
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
              Routing Interface
            </span>
            {!loading && !showForm && (
              <Btn
                variant="primary"
                onClick={handleOpenForm}
                style={actionBtnStyle}
              >
                Switch Routing Interface
              </Btn>
            )}
          </div>

          {/* Card Body */}
          <div
            style={{
              padding: showForm && !loading ? "24px 32px 0" : "24px 32px",
            }}
          >
            {loading ? (
              <div className="flex flex-col items-center justify-center min-h-50">
                <CircularProgress size={40} sx={{ color: C.primary }} />
                <div
                  style={{ marginTop: 12, color: C.mutedText, fontSize: 13 }}
                >
                  Loading routing information...
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {/* ── Current Active Routing (read-only) ── */}
                <div className="flex flex-col gap-0">
                  <SectionHeading title="Current Active Routing" isFirst />
                  <div
                    className="flex flex-col gap-3 w-full"
                    style={{ maxWidth: 640, margin: "0 auto" }}
                  >
                    <FieldRow label="Active Interface:">
                      <input
                        type="text"
                        readOnly
                        value={current.interface}
                        className={SYSTEM_SETTINGS_NATIVE_FIELD_CLASS}
                        style={disabledInputStyle}
                      />
                    </FieldRow>
                    <FieldRow label="IP Address:">
                      <input
                        type="text"
                        readOnly
                        value={current.ipAddress}
                        className={SYSTEM_SETTINGS_NATIVE_FIELD_CLASS}
                        style={disabledInputStyle}
                      />
                    </FieldRow>
                    <FieldRow label="Subnet Mask:">
                      <input
                        type="text"
                        readOnly
                        value={current.subnetMask}
                        className={SYSTEM_SETTINGS_NATIVE_FIELD_CLASS}
                        style={disabledInputStyle}
                      />
                    </FieldRow>
                    <FieldRow label="Gateway IP:">
                      <input
                        type="text"
                        readOnly
                        value={current.gateway}
                        className={SYSTEM_SETTINGS_NATIVE_FIELD_CLASS}
                        style={disabledInputStyle}
                      />
                    </FieldRow>
                    <FieldRow label="Metric:">
                      <input
                        type="text"
                        readOnly
                        value={String(current.metric)}
                        className={SYSTEM_SETTINGS_NATIVE_FIELD_CLASS}
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
                                  background: isActive ? "#f0f7ff" : C.cardBg,
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
                      style={{ maxWidth: 640, margin: "0 auto 12px" }}
                    >
                      {/* Interface dropdown */}
                      <FieldRow label="Select Interface (M):">
                        <select
                          value={form.interface}
                          onChange={(e) => handleIfaceChange(e.target.value)}
                          className={SYSTEM_SETTINGS_NATIVE_FIELD_CLASS}
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
                      <FieldRow label="IP Address:">
                        <input
                          type="text"
                          readOnly
                          value={formIp}
                          className={SYSTEM_SETTINGS_NATIVE_FIELD_CLASS}
                          style={disabledInputStyle}
                        />
                      </FieldRow>

                      {/* Subnet Mask — read-only, auto-filled */}
                      <FieldRow label="Subnet Mask:">
                        <input
                          type="text"
                          readOnly
                          value={formSubnet}
                          className={SYSTEM_SETTINGS_NATIVE_FIELD_CLASS}
                          style={disabledInputStyle}
                        />
                      </FieldRow>

                      {/* Gateway — editable */}
                      <FieldRow label="Gateway IP (M):">
                        <input
                          type="text"
                          value={form.gateway}
                          onChange={(e) =>
                            handleFormChange("gateway", e.target.value)
                          }
                          placeholder="e.g. 192.168.1.1"
                          className={SYSTEM_SETTINGS_NATIVE_FIELD_CLASS}
                          style={{
                            ...inputStyle,
                            borderColor: errors.gateway
                              ? C.errorRed
                              : undefined,
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
                              marginTop: 3,
                            }}
                          >
                            {errors.gateway}
                          </div>
                        )}
                      </FieldRow>

                      {/* Metric — editable */}
                      <FieldRow label="Metric:">
                        <input
                          type="text"
                          value={form.metric}
                          onChange={(e) =>
                            handleFormChange("metric", e.target.value)
                          }
                          placeholder="Default: 100"
                          className={SYSTEM_SETTINGS_NATIVE_FIELD_CLASS}
                          style={{
                            ...inputStyle,
                            borderColor: errors.metric ? C.errorRed : undefined,
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
                              marginTop: 3,
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
      </div>
    </div>
  );
};

export default RoutingInterface;
