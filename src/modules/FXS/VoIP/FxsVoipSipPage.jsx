import React, { useState, useEffect, useRef } from "react";
import { Alert, CircularProgress, Tooltip } from "@mui/material";
import {
  SIP_SETTINGS_FIELDS,
  SIP_SETTINGS_NOTE,
  FXS_SIP_FIELD_TOOLTIPS,
} from "../../../constants/FxsVoipSipConstants";
import {
  listFxsSipSettings,
  saveFxsSipSettings,
  resetFxsSipSettings,
  statusFxsSipSettings,
} from "../../../api/apiService";

// ── Page-local field label tooltip UI (not shared) ──
const FIELD_LABEL_COLOR = "#374151";

const FIELD_TOOLTIP_PROPS = {
  arrow: true,
  placement: "top",
  slotProps: {
    tooltip: {
      sx: {
        backgroundColor: "#fff",
        color: "#333",
        border: "1px solid #d1d5db",
        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
        fontSize: 12,
        lineHeight: 1.45,
        maxWidth: 500,
        padding: "10px 12px",
        textTransform: "none",
        letterSpacing: "normal",
      },
    },
    arrow: { sx: { color: "#fff" } },
  },
};

const formatFieldTooltipTitle = (text) => {
  if (!text) return "";
  const normalized = text.replace(/<br\s*\/?>/gi, "\n").replace(/&quot;/g, '"');
  if (normalized.includes("\n")) {
    return (
      <span style={{ whiteSpace: "pre-line", display: "block" }}>
        {normalized}
      </span>
    );
  }
  return normalized;
};

const SipFieldRow = ({ label, tooltipKey, children }) => {
  const tooltip = tooltipKey ? FXS_SIP_FIELD_TOOLTIPS[tooltipKey] || "" : "";
  const labelNode = (
    <label
      style={{
        fontSize: 13,
        fontWeight: 600,
        color: FIELD_LABEL_COLOR,
        flex: "1 1 auto",
        minWidth: 0,
        paddingRight: 16,
        textAlign: "left",
        lineHeight: 1.4,
        cursor: tooltip ? "help" : undefined,
      }}
    >
      {label}
    </label>
  );

  return (
    <div
      className="flex flex-row items-center w-full"
      style={{ minHeight: 36 }}
    >
      {tooltip ? (
        <Tooltip
          title={formatFieldTooltipTitle(tooltip)}
          {...FIELD_TOOLTIP_PROPS}
        >
          {labelNode}
        </Tooltip>
      ) : (
        labelNode
      )}
      {children}
    </div>
  );
};

// ── Local page UI (matches Media Parameters page) ──
const C = {
  pageBg: "#f8fafc",
  cardBg: "#ffffff",
  cardBorder: "#d8dde5",
  cardShadow:
    "0 0 14px rgba(0, 0, 0, 0.18), 0 0 5px rgba(0, 0, 0, 0.10)",
  divider: "#e2e6ec",
  labelText: "#374151",
  valueText: "#1f2937",
  mutedText: "#6b7280",
  strongText: "#1f2937",
  accent: "#4A5D75",
  amber: "#dc2626",
};

const CARD_RADIUS = 10;
const FIELD_RADIUS = 8;

const Btn = ({
  children,
  onClick,
  disabled,
  variant = "default",
  style: extraStyle,
  type,
  form,
  component,
  title,
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
    danger: {
      background: "#fef2f2",
      color: C.amber,
      border: "0.5px solid #fecaca",
    },
    outline: {
      background: C.cardBg,
      color: C.labelText,
      border: `1px solid ${C.cardBorder}`,
    },
  };
  const s = styles[variant] || styles.default;
  const hoverBg =
    {
      primary: "linear-gradient(to bottom, #3E5475 0%, #5A6F8F 100%)",
      cancel: "#b6c2d3",
      danger: "#fca5a5",
      outline: "#e2e8f0",
      default: "#e2e8f0",
    }[variant] || "#e2e8f0";
  const baseBg = extraStyle?.background ?? s.background;
  const baseShadow = extraStyle?.boxShadow ?? s.boxShadow ?? "none";
  const activeBg =
    {
      primary: "linear-gradient(to bottom, #2C3E57 0%, #3E5475 100%)",
      cancel: "#a3b1c2",
      danger: "#f87171",
      outline: "#d1d9e6",
      default: "#d1d5db",
    }[variant] || "#d1d5db";

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
      form={form}
      title={title}
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
    </Component>
  );
};

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

const getFxsNativeFieldInteraction = (disabled) =>
  disabled ? {} : nativeFieldInteraction;

const nativeFieldInputStyle = {
  height: 36,
  width: "100%",
  maxWidth: 220,
  padding: "0 12px",
  fontSize: 13,
  border: `1px solid ${OUTLINED_BORDER}`,
  borderRadius: FIELD_RADIUS,
  outline: "none",
  backgroundColor: "#f8fafc",
  color: C.valueText,
  boxSizing: "border-box",
  boxShadow: "none",
  transition: "border-color 0.2s ease, box-shadow 0.2s ease",
};

const nativeFieldSelectStyle = {
  width: "100%",
  maxWidth: 220,
  minHeight: 36,
  height: 36,
  padding: "0 28px 0 12px",
  fontSize: nativeFieldInputStyle.fontSize,
  lineHeight: 1.35,
  border: nativeFieldInputStyle.border,
  borderRadius: nativeFieldInputStyle.borderRadius,
  outline: nativeFieldInputStyle.outline,
  backgroundColor: nativeFieldInputStyle.backgroundColor,
  color: nativeFieldInputStyle.color,
  boxSizing: nativeFieldInputStyle.boxSizing,
  transition: nativeFieldInputStyle.transition,
  appearance: "auto",
  cursor: "pointer",
};

const advancedPageWrapStyle = {
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

const advancedPageInnerStyle = {
  width: "100%",
  maxWidth: "100%",
  margin: 0,
  display: "flex",
  flexDirection: "column",
};

const advancedTableContainerStyle = {
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
};

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

const dashboardGridStyle = {
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr) 1px minmax(0, 1fr)",
  width: "100%",
  alignItems: "stretch",
  alignContent: "start",
};

const dashboardColumnStyle = {
  display: "flex",
  flexDirection: "column",
  gap: 12,
  minWidth: 0,
  padding: "16px 36px 20px",
};

const dashboardColumnLeftStyle = {
  ...dashboardColumnStyle,
  background: C.cardBg,
};

const dashboardColumnRightStyle = {
  ...dashboardColumnStyle,
  background: C.cardBg,
};

const dashboardDividerStyle = {
  background: C.divider,
  width: 1,
  alignSelf: "stretch",
  margin: "14px 0",
};

const dashboardSectionTitleStyle = {
  fontSize: 14,
  fontWeight: 700,
  color: C.strongText,
  marginBottom: 2,
};

const VoipBreadcrumb = ({ current }) => (
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
    <span>FXS</span>
    <span>&gt;</span>
    <span>VoIP</span>
    <span>&gt;</span>
    <span style={{ color: "#1e293b", fontWeight: 600 }}>{current}</span>
  </div>
);

const AdvancedPageShell = ({ children }) => (
  <div style={advancedPageWrapStyle}>
    <div style={advancedPageInnerStyle}>{children}</div>
  </div>
);

const LEFT_COLUMN_FIELD_KEYS = [
  "registerStatus",
  "registrarIp",
  "registrarPort",
  "registerInterval",
  "registryValidity",
  "reregistrationInterval",
];

const RIGHT_COLUMN_FIELD_KEYS = [
  "sipTransportProtocol",
  "spareRegistrarServer",
  "spareRegistrarIp",
  "spareRegistrarPort",
  "multiRegistrarMode",
  "switchSignalPort",
];

const LOCAL_PBX_REGISTER_STATUS_TEXT = "Local PBX (registration not required)";

const getRegisterStatusDisplay = (mode, status, localMsg) => {
  if (mode === "local") {
    return LOCAL_PBX_REGISTER_STATUS_TEXT;
  }
  return status || "";
};

const getInitialState = () => {
  const state = {};
  SIP_SETTINGS_FIELDS.forEach((f) => {
    if (f.type === "select") {
      state[f.key] = f.options[0] || f.default || "";
    } else if (f.type === "checkbox") {
      state[f.key] = f.default || false;
    } else if (f.type === "readonly") {
      state[f.key] = f.default || "";
    } else {
      state[f.key] = f.default || "";
    }
  });
  return state;
};

const FxsVoipSipPage = () => {
  const [form, setForm] = useState(getInitialState());
  const [message, setMessage] = useState({ type: "", text: "" });
  const [loadingPage, setLoadingPage] = useState(true);
  const [saving, setSaving] = useState(false);
  const [registrationMode, setRegistrationMode] = useState("local");
  const [localModeMsg, setLocalModeMsg] = useState("");
  const statusPollRef = useRef(null);

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 6000);
  };

  const applyApiData = (data) => {
    if (!data) return;
    setForm((prev) => {
      const next = { ...prev };
      SIP_SETTINGS_FIELDS.forEach((f) => {
        if (data[f.key] !== undefined) next[f.key] = data[f.key];
      });
      if (data.registerStatus !== undefined)
        next.registerStatus = data.registerStatus;
      return next;
    });
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const settingsRes = await listFxsSipSettings().catch((e) => {
          console.warn("Failed to load FXS SIP settings:", e);
          return null;
        });
        if (!mounted) return;
        if (settingsRes?.success) {
          const mode = settingsRes.registrationMode || "local";
          setRegistrationMode(mode);
          const localMsg =
            mode === "local"
              ? settingsRes.message || LOCAL_PBX_REGISTER_STATUS_TEXT
              : "";
          setLocalModeMsg(localMsg);
          applyApiData(settingsRes.data || {});
          if (mode === "local") {
            setForm((prev) => ({
              ...prev,
              registerStatus: LOCAL_PBX_REGISTER_STATUS_TEXT,
            }));
          }
        }
      } catch (e) {
        console.warn("Error during initial load:", e);
      } finally {
        if (mounted) setLoadingPage(false);
      }
    })();
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (statusPollRef.current) clearInterval(statusPollRef.current);
    if (registrationMode === "remote") {
      statusPollRef.current = setInterval(async () => {
        try {
          const res = await statusFxsSipSettings();
          if (res?.success && res.registerStatus) {
            setForm((prev) => ({
              ...prev,
              registerStatus: res.registerStatus,
            }));
          }
        } catch (_) {}
      }, 30000);
    }
    return () => {
      if (statusPollRef.current) clearInterval(statusPollRef.current);
    };
  }, [registrationMode]);

  const handleChange = (key, value) => {
    const fieldDef = SIP_SETTINGS_FIELDS.find((f) => f.key === key);
    if (fieldDef && fieldDef.validation === "integer") {
      if (value === "" || /^\d+$/.test(value)) {
        setForm((prev) => ({ ...prev, [key]: value }));
      }
    } else {
      setForm((prev) => ({ ...prev, [key]: value }));
    }
  };

  const handleCheckbox = (key) => {
    setForm((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await saveFxsSipSettings(form);
      if (!res?.success) {
        showMessage("error", res?.message || "Failed to save settings.");
        return;
      }
      const mode = res.registrationMode || "local";
      setRegistrationMode(mode);
      const localMsg =
        mode === "local" ? res.message || LOCAL_PBX_REGISTER_STATUS_TEXT : "";
      setLocalModeMsg(localMsg);
      if (res.data) applyApiData(res.data);
      if (mode === "local") {
        setForm((prev) => ({
          ...prev,
          registerStatus: LOCAL_PBX_REGISTER_STATUS_TEXT,
        }));
      } else if (res.registerStatus) {
        setForm((prev) => ({ ...prev, registerStatus: res.registerStatus }));
      }
      showMessage("success", res.message || "Settings saved successfully!");
    } catch (err) {
      showMessage("error", err?.message || "Failed to save settings.");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    try {
      const res = await resetFxsSipSettings();
      if (res?.success && res.data) {
        applyApiData(res.data);
        showMessage("info", res.message || "Settings reset to defaults.");
      } else {
        setForm(getInitialState());
      }
    } catch (_) {
      setForm(getInitialState());
    }
  };

  const shouldShowField = (field) => {
    if (!field.conditional) return true;
    const conditionalValue = form[field.conditional];
    if (field.conditionalValues)
      return field.conditionalValues.includes(conditionalValue);
    if (field.conditionalValue !== undefined)
      return conditionalValue === field.conditionalValue;
    return !!conditionalValue;
  };

  const fieldInputStyle = {
    ...nativeFieldInputStyle,
    width: "100%",
  };

  const fieldSelectStyle = {
    ...nativeFieldSelectStyle,
    width: "100%",
  };

  const sipFieldInteraction = getFxsNativeFieldInteraction(saving);

  const fieldReadonlyStyle = {
    ...fieldInputStyle,
    backgroundColor: "#e5e7eb",
    lineHeight: "36px",
    height: 36,
    whiteSpace: "normal",
    wordBreak: "break-word",
  };

  const valueColStyle = {
    flex: "1 1 auto",
    minWidth: 0,
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    justifyContent: "center",
  };

  const controlSlotStyle = {
    width: 220,
    maxWidth: "100%",
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-start",
  };

  const leftColumnFields = SIP_SETTINGS_FIELDS.filter((f) =>
    LEFT_COLUMN_FIELD_KEYS.includes(f.key),
  );
  const rightColumnFields = SIP_SETTINGS_FIELDS.filter((f) =>
    RIGHT_COLUMN_FIELD_KEYS.includes(f.key),
  );

  const renderField = (field) => {
    if (!shouldShowField(field)) return null;

    return (
      <SipFieldRow key={field.key} label={field.label} tooltipKey={field.key}>
        <div style={valueColStyle}>
          {field.type === "readonly" && (
            <div style={controlSlotStyle}>
              <div
                style={{
                  ...fieldReadonlyStyle,
                  width: "100%",
                  ...(field.key === "registerStatus"
                    ? {
                        whiteSpace: "nowrap",
                        textAlign: "center",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }
                    : {}),
                }}
              >
                {field.key === "registerStatus"
                  ? getRegisterStatusDisplay(
                      registrationMode,
                      form.registerStatus,
                      localModeMsg,
                    )
                  : form[field.key]}
              </div>
            </div>
          )}

          {field.type === "text" && (
            <div style={controlSlotStyle}>
              <input
                type="text"
                value={form[field.key] || ""}
                onChange={(e) => handleChange(field.key, e.target.value)}
                style={fieldInputStyle}
                disabled={saving}
                {...sipFieldInteraction}
              />
            </div>
          )}

          {field.type === "select" && (
            <div style={controlSlotStyle}>
              <select
                value={form[field.key] || ""}
                onChange={(e) => handleChange(field.key, e.target.value)}
                style={fieldSelectStyle}
                disabled={saving}
                {...sipFieldInteraction}
              >
                {field.options.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
          )}

          {field.type === "checkbox" && (
            <div style={controlSlotStyle}>
              <label
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  cursor: saving ? "not-allowed" : "pointer",
                }}
              >
                <input
                  type="checkbox"
                  name={field.key}
                  checked={!!form[field.key]}
                  onChange={() => handleCheckbox(field.key)}
                  disabled={saving}
                  style={{
                    width: 16,
                    height: 16,
                    margin: 0,
                    cursor: saving ? "not-allowed" : "pointer",
                    accentColor: "#3E5475",
                  }}
                />
              </label>
            </div>
          )}

          {field.helper && (
            <div
              style={{
                width: 220,
                maxWidth: "100%",
                color: C.amber,
                fontSize: 11,
                marginTop: 4,
                wordWrap: "break-word",
                textAlign: "left",
              }}
            >
              {field.helper}
            </div>
          )}
        </div>
      </SipFieldRow>
    );
  };

  return (
    <AdvancedPageShell>
      {message.text && (
        <Alert
          severity={
            message.type === "error"
              ? "error"
              : message.type === "success"
                ? "success"
                : "info"
          }
          onClose={() => setMessage({ type: "", text: "" })}
          sx={{
            position: "fixed",
            top: 20,
            right: 20,
            zIndex: 9999,
            minWidth: 300,
            boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
            fontWeight: 500,
          }}
        >
          {message.text}
        </Alert>
      )}


      <VoipBreadcrumb current="SIP Settings" />

      {registrationMode === "local" && localModeMsg && (
        <div
          style={{
            background: "#fffbeb",
            border: "1px solid #fcd34d",
            borderRadius: 6,
            padding: "10px 16px",
            marginBottom: 16,
            fontSize: 12,
            color: C.amber,
            display: "flex",
            alignItems: "center",
            gap: 8,
            flexShrink: 0,
          }}
        >
          <span style={{ fontWeight: 700 }}>ℹ Local PBX mode:</span>
          <span>{localModeMsg}</span>
        </div>
      )}

      <div style={advancedTableContainerStyle}>
        {loadingPage ? (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              flex: 1,
              padding: 60,
            }}
          >
            <CircularProgress size={32} sx={{ color: C.accent }} />
          </div>
        ) : (
          <div style={dashboardGridStyle}>
            <div style={dashboardColumnLeftStyle}>
              <div style={dashboardSectionTitleStyle}>Registration</div>
              <div className="flex flex-col gap-3" style={{ width: "100%" }}>
                {leftColumnFields.map((field) => renderField(field))}
              </div>
            </div>

            <div style={dashboardDividerStyle} aria-hidden="true" />

            <div style={dashboardColumnRightStyle}>
              <div style={dashboardSectionTitleStyle}>Protocol & Options</div>
              <div className="flex flex-col gap-3" style={{ width: "100%" }}>
                {rightColumnFields.map((field) => renderField(field))}
              </div>
              {SIP_SETTINGS_NOTE ? (
                <div
                  style={{
                    fontSize: 11,
                    color: C.amber,
                    marginTop: 16,
                    textAlign: "left",
                    lineHeight: 1.45,
                  }}
                >
                  {SIP_SETTINGS_NOTE}
                </div>
              ) : null}
            </div>
          </div>
        )}

        {!loadingPage && (
          <div style={advancedFormInlineFooterStyle}>
            <Btn
              type="button"
              onClick={handleSave}
              variant="primary"
              disabled={saving || loadingPage}
              style={advancedFormBtnStyle}
            >
              {saving ? (
                <>
                  <CircularProgress size={14} sx={{ color: "inherit" }} />
                  Saving…
                </>
              ) : (
                "Save"
              )}
            </Btn>
            <Btn
              type="button"
              onClick={handleReset}
              variant="cancel"
              disabled={saving || loadingPage}
              style={advancedFormBtnStyle}
            >
              Reset
            </Btn>
          </div>
        )}
      </div>
    </AdvancedPageShell>
  );
};

export default FxsVoipSipPage;
