import React, { useState, useEffect } from "react";
import Tooltip from "@mui/material/Tooltip";
import { InfoOutlined } from "@mui/icons-material"; 
import { Alert } from "@mui/material";
import {
  getLicenseLimits,
  updateLicenseLimits,
} from "../../../api/apiService";

const C = {
  pageBg: "var(--bg-main)",
  cardBg: "var(--bg-surface)",
  cardBorder: "var(--border-strong)",
  divider: "var(--border-subtle)",
  cardShadow: "var(--shadow-soft)",
  labelText: "var(--text-primary)",
  valueText: "var(--text-primary)",
  strongText: "var(--text-primary)",
  mutedText: "var(--text-muted)",
  primary: "#2563eb",
  errorRed: "#dc2626",
};

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
  backgroundColor: "var(--bg-main)",
  outline: "none",
  color: "var(--text-primary)",
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

const Btn = ({ children, onClick, disabled, variant = "default", className = "", style, type, title, form }) => (
  <button
    type={type}
    form={form}
    onClick={onClick}
    disabled={disabled}
    title={title}
    style={style}
    className={`${btnVariantCls[variant] || btnVariantCls.default} ${className}`.trim()}
  >
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
  color: "var(--text-primary)",
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
  max_extensions: "The maximum number of extensions allowed for this system.",
  max_fxs_ports: "The maximum number of FXS ports allowed for this system.",
  max_trunks: "The maximum number of trunks allowed for this system.",
};

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
      className="clixxo-system-settings theme-page-bg min-h-[calc(100vh-80px)] p-4 flex flex-col items-center"
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
                  <Tooltip title={tooltips[key]} {...tooltipProps}>
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
