import React, { useState, useEffect } from "react";
import { Alert } from "@mui/material";
import {
  getLicenseLimits,
  updateLicenseLimits,
} from "../../../api/apiService";

const C = {
  pageBg: "#f8fafc",
  cardBg: "#ffffff",
  cardBorder: "#9CA3AF",
  divider: "#9CA3AF",
  cardShadow: "0 4px 20px rgba(15,23,42,0.06)",
  labelText: "#3E5475",
  valueText: "#1e293b",
  strongText: "#0f172a",
  mutedText: "#94a3b8",
  primary: "#2563eb",
  errorRed: "#dc2626",
};

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
      borderRadius: 6,
      textTransform: "none",
      padding: "6px 28px",
    },
  };
  const s = styles[variant] || styles.default;
  const hoverBg =
    variant === "primary"
      ? "linear-gradient(to bottom, #3E5475 0%, #5A6F8F 100%)"
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

const tableContainerStyle = {
  width: "100%",
  maxWidth: "100%",
  margin: "0 auto",
  background: C.cardBg,
  border: `1px solid ${C.cardBorder}`,
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
  justifyContent: "flex-start",
  padding: "7px 14px",
  flexWrap: "wrap",
  gap: 12,
  fontWeight: 700,
  fontSize: 13,
  color: "#3E5475",
  borderBottom: `1px solid ${C.divider}`,
};

const INITIAL_FORM = {
  max_extensions: "",
  max_fxs_ports: "",
  max_trunks: "",
};

const FIELDS = [
  { key: "max_extensions", label: "Maximum Extensions" },
  { key: "max_fxs_ports", label: "Maximum FXS Port" },
  { key: "max_trunks", label: "Maximum Trunks" },
];

const LicenseLimits = () => {
  const [form, setForm] = useState(INITIAL_FORM);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    if (message.text) {
      const t = setTimeout(() => setMessage({ type: "", text: "" }), 4000);
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
          text: err?.message || "Failed to load license limits.",
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
          text: "License limits saved successfully.",
        });
      } else {
        setMessage({
          type: "error",
          text:
            typeof res?.message === "string"
              ? res.message
              : "Failed to save license limits.",
        });
      }
    } catch (err) {
      setMessage({
        type: "error",
        text: err?.message || "Failed to save license limits.",
      });
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
        {message.text && (
          <Alert
            severity={message.type}
            onClose={() => setMessage({ type: "", text: "" })}
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
          }}
        >
          <span>Maintenance</span>
          <span>&gt;</span>
          <span>System Tool</span>
          <span>&gt;</span>
          <span style={{ color: C.strongText, fontWeight: 600 }}>
            License Limits
          </span>
        </div>

        <div style={tableContainerStyle}>
          <div style={blueBarStyle}>
            <span>License Limits</span>
          </div>

          <div className="w-full pt-3 flex flex-col items-center">
            <form
              onSubmit={handleSave}
              className="w-full max-w-2xl px-5 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 items-center"
            >
              {FIELDS.map(({ key, label }) => (
                <React.Fragment key={key}>
                  <label style={labelStyle}>{label}</label>
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
                style={{ minHeight: 88, padding: "10px 20px 12px" }}
              >
                <Btn
                  variant="primary"
                  type="button"
                  disabled={loading}
                  onClick={handleSave}
                  style={{ minWidth: 100, height: 33, fontSize: 13 }}
                >
                  {loading ? "Saving..." : "Save"}
                </Btn>
                <p
                  style={{
                    fontSize: 12,
                    color: C.mutedText,
                    textAlign: "center",
                    margin: "6px 0 0",
                    lineHeight: 1.35,
                    maxWidth: 480,
                  }}
                >
                  Set maximum allowed extensions, FXS ports, and trunks for this
                  system.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LicenseLimits;
