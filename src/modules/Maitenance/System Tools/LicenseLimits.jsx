import React, { useState, useEffect } from "react";
import Tooltip from "@mui/material/Tooltip";
import { Alert } from "@mui/material";
import {
  LICENSE_LIMITS_BREADCRUMB,
  LICENSE_LIMITS_CARD_TITLE,
  LICENSE_LIMITS_FIELDS,
  LICENSE_LIMITS_INITIAL_FORM,
  LICENSE_LIMITS_TOOLTIPS,
  LICENSE_LIMITS_BUTTON_LABELS,
  LICENSE_LIMITS_BUTTON_VARIANTS,
  LICENSE_LIMITS_BUTTON_STYLE,
  LICENSE_LIMITS_NOTE,
  LICENSE_LIMITS_MESSAGES,
  LICENSE_LIMITS_MESSAGE_DEFAULT,
  LICENSE_LIMITS_MESSAGE_TIMEOUT_MS,
} from "../../../constants/LicenseLimitsConstants";
import {
  getLicenseLimits,
  updateLicenseLimits,
} from "../../../api/apiService";

const C = {
  pageBg: "#f8fafc",
  cardBg: "#ffffff",
  cardBorder: "#d8dde5",
  cardShadow:
  "0 0 14px rgba(0, 0, 0, 0.18), 0 0 5px rgba(0, 0, 0, 0.10)",
  divider: "#e2e6ec",
  labelText: "#3E5475",
  valueText: "#1f2937",
  mutedText: "#94a3b8",
  strongText: "#1e293b",
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
  el.style.boxShadow = FOCUS_RING_SHADOW(OUTLINED_FOCUS);
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
    if (document.activeElement === e.target) setFieldFocus(e.target);
    else setFieldHover(e.target);
  },
  onMouseLeave: (e) => {
    if (e.target.disabled || e.target.readOnly) return;
    if (document.activeElement === e.target) setFieldFocus(e.target);
    else setFieldDefault(e.target);
  },
};

const inputStyle = {
  padding: "6px 12px",
  borderRadius: 8,
  border: `1px solid ${OUTLINED_BORDER}`,
  fontSize: 14,
  width: "100%",
  backgroundColor: "#ffffff",
  outline: "none",
  color: "#3E5475",
  transition: "border-color 0.2s ease, box-shadow 0.2s ease",
  boxSizing: "border-box",
  boxShadow: "none",
};

const labelStyle = {
  fontSize: 13,
  fontWeight: 600,
  color: C.labelText,
  textAlign: "left",
};

const Btn = ({
  children,
  onClick,
  disabled,
  variant = "default",
  style: extraStyle,
  type,
  component,
  startIcon,
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
  };
  const s = styles[variant] || styles.default;
  const hoverBg =
    {
      primary: "linear-gradient(to bottom, #3E5475 0%, #5A6F8F 100%)",
      cancel: "#b6c2d3",
      danger: "#fca5a5",
      outline: "#e2e8f0",
      error: "#b91c1c",
      default: "#e2e8f0",
    }[variant] || "#e2e8f0";
  const activeBg =
    {
      primary: "linear-gradient(to bottom, #2C3E57 0%, #3E5475 100%)",
      cancel: "#a3b1c2",
      danger: "#f87171",
      outline: "#d1d9e6",
      error: "#991b1b",
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
        fontSize: 13,
        fontWeight: 600,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.6 : 1,
        transition:
          "background 0.15s ease, transform 0.1s ease, box-shadow 0.1s ease",
        height: 36,
        gap: 6,
        whiteSpace: "nowrap",
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
      {startIcon && (
        <span style={{ display: "inline-flex" }}>
          {startIcon}
        </span>
      )}
      {children}
    </Component>
  );
};

const tableContainerStyle = {
  width: "100%",
  maxWidth: "100%",
  margin: 0,
  display: "flex",
  flexDirection: "column",
  background: C.cardBg,
  border: `1.5px solid ${C.cardBorder}`,
  borderRadius: CARD_RADIUS,
  boxShadow: C.cardShadow,
  overflow: "hidden",
  boxSizing: "border-box",
};

const LicenseLimitsPageWrapStyle = {
  backgroundColor: C.pageBg,
  minHeight: "calc(100vh - 80px)",
  padding: 16,
  boxSizing: "border-box",
};

const LicenseLimitsPageInnerStyle = {
  width: "100%",
  maxWidth: "100%",
  margin: "0 auto",
};

const blueBarStyle = {
  width: "100%",
  minHeight: 44,
  background: C.cardBg,
  borderTopLeftRadius: 10,
  borderTopRightRadius: 10,
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

const LicenseLimits = () => {
  const [form, setForm] = useState(LICENSE_LIMITS_INITIAL_FORM);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(LICENSE_LIMITS_MESSAGE_DEFAULT);

  useEffect(() => {
    if (message.text) {
      const t = setTimeout(
        () => setMessage(LICENSE_LIMITS_MESSAGE_DEFAULT),
        LICENSE_LIMITS_MESSAGE_TIMEOUT_MS,
      );
      return () => clearTimeout(t);
    }
  }, [message.text]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getLicenseLimits();
        if (res?.response && res?.message) {
          const { max_extensions, max_fxs_ports, max_trunks } = res.message;
          setForm({
            max_extensions: max_extensions ?? "",
            max_fxs_ports: max_fxs_ports ?? "",
            max_trunks: max_trunks ?? "",
          });
        }
      } catch (err) {
        setMessage({
          type: "error",
          text: err?.message || LICENSE_LIMITS_MESSAGES.loadFailed,
        });
      }
    };
    load();
  }, []);

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await updateLicenseLimits({
        max_extensions: Number(form.max_extensions),
        max_fxs_ports: Number(form.max_fxs_ports),
        max_trunks: Number(form.max_trunks),
      });
      if (res?.response) {
        setMessage({
          type: "success",
          text: LICENSE_LIMITS_MESSAGES.saveSuccess,
        });
      } else {
        setMessage({
          type: "error",
          text:
            typeof res?.message === "string"
              ? res.message
              : LICENSE_LIMITS_MESSAGES.saveFailed,
        });
      }
    } catch (err) {
      setMessage({
        type: "error",
        text: err?.message || LICENSE_LIMITS_MESSAGES.saveFailed,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
   <div style={LicenseLimitsPageWrapStyle} data-native-scroll>
      <div style={LicenseLimitsPageInnerStyle}>
        {message.text && (
          <Alert
            severity={message.type}
            onClose={() => setMessage(LICENSE_LIMITS_MESSAGE_DEFAULT)}
            sx={{
              position: "fixed",
              top: 16,
              right: 16,
              zIndex: 9999,
              boxShadow: C.cardShadow,
            }}
          >
            {message.text}
          </Alert>
        )}

        <div
          style={{
            fontSize: 12,
            color: C.mutedText,
            marginBottom: 16,
            fontWeight: 400,
            display: "flex",
            alignItems: "center",
            gap: 4,
            flexWrap: "wrap",
          }}
        >
          <span>{LICENSE_LIMITS_BREADCRUMB[0]}</span>
          <span>&gt;</span>
          <span>{LICENSE_LIMITS_BREADCRUMB[1]}</span>
          <span>&gt;</span>
          <span style={{ color: C.strongText, fontWeight: 600 }}>
            {LICENSE_LIMITS_BREADCRUMB[2]}
          </span>
        </div>

        <div style={tableContainerStyle}>
          <div style={blueBarStyle}>
            <span>{LICENSE_LIMITS_CARD_TITLE}</span>
          </div>

          <div className="w-full pt-3 flex flex-col items-center">
            <form
              onSubmit={handleSave}
              className="w-full max-w-2xl px-5 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 items-center"
            >
              {LICENSE_LIMITS_FIELDS.map(({ key, label }) => (
                <React.Fragment key={key}>
                  <Tooltip title={LICENSE_LIMITS_TOOLTIPS[key]} {...tooltipProps}>
                    <label style={labelStyle}>{label}</label>
                  </Tooltip>
                  <input
                    type="number"
                    min={0}
                    value={form[key]}
                    onChange={(e) => handleChange(key, e.target.value)}
                    style={inputStyle}
                    onFocus={inputInteraction.onFocus}
                    onBlur={inputInteraction.onBlur}
                    onMouseEnter={inputInteraction.onMouseEnter}
                    onMouseLeave={inputInteraction.onMouseLeave}
                  />
                </React.Fragment>
              ))}
            </form>

            <div
              className="w-full mt-3 flex flex-col items-center"
              style={{ borderTop: `1px solid ${C.divider}` }}
            >
           <div
  className="w-full flex flex-col items-center justify-center"
  style={{
    minHeight: 53,
    padding: "9px 20px",
  }}
>
              <Btn
                variant={LICENSE_LIMITS_BUTTON_VARIANTS.SAVE}
                type="button"
                disabled={loading}
                onClick={handleSave}
                style={LICENSE_LIMITS_BUTTON_STYLE}
              >
                {loading
                  ? LICENSE_LIMITS_BUTTON_LABELS.SAVING
                  : LICENSE_LIMITS_BUTTON_LABELS.SAVE}
              </Btn>
            </div>
            </div>
          </div>
        </div>
        <div
          style={{
            marginTop: 16,
            textAlign: "center",
            fontSize: 12,
            color: C.accent,
            width: "100%",
            lineHeight: 1.5,
            boxSizing: "border-box",
          }}
        >
          {LICENSE_LIMITS_NOTE}
        </div>
      </div>
    </div>
  );
};

export default LicenseLimits;
