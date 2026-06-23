import React, { useState } from "react";
import {
  ROUTE_SETTINGS_OPTIONS,
  ROUTE_SETTINGS_DEFAULTS,
} from "../../../constants/RouteRoutingParameterPageConstants";
import { Select, MenuItem, FormControl, CircularProgress, Alert } from "@mui/material";

// ── Local page UI (inlined from e1PriSharedUi) ──
const C = {
  pageBg: "var(--bg-main)",
  cardBg: "var(--bg-surface)",
  cardBorder: "var(--border-strong)",
  labelText: "var(--text-primary)",
  valueText: "var(--text-primary)",
  mutedText: "var(--text-muted)",
  strongText: "var(--text-primary)",
  accent: "var(--accent-brand)",
  amber: "#dc2626",
};

const CARD_RADIUS = 20;

const BTN_BASE =
  "inline-flex items-center justify-center gap-[6px] h-[30px] px-[14px] py-[6px] rounded-[10px] text-[12px] font-semibold whitespace-nowrap transition-all duration-150 ease-in-out cursor-pointer border disabled:cursor-not-allowed disabled:opacity-60";
const BTN_DEFAULT = `${BTN_BASE} bg-[var(--bg-surface)] text-[var(--text-primary)] border-[var(--border-subtle)] hover:bg-[var(--row-alt)]`;
const BTN_OUTLINE = `${BTN_BASE} bg-[var(--bg-surface)] text-[var(--text-label)] border-[var(--border-strong)] hover:bg-[var(--row-alt)]`;
const BTN_CANCEL = `${BTN_BASE} bg-[#cbd5e1] text-[#374151] border-[#cbd5e1] shadow-[0_1px_2px_rgba(15,23,42,0.08)] hover:bg-[#b6c2d3]`;
const BTN_PRIMARY = `${BTN_BASE} text-white border-[#5A6F8F] bg-[linear-gradient(to_bottom,#5A6F8F_0%,#3E5475_60%,#2C3E57_100%)] hover:bg-[linear-gradient(to_bottom,#3E5475_0%,#5A6F8F_100%)]`;

const btnVariantCls = {
  default: BTN_DEFAULT,
  primary: BTN_PRIMARY,
  cancel: BTN_CANCEL,
  outline: BTN_OUTLINE,
  danger: `${BTN_BASE} bg-[#fef2f2] text-[#dc2626] border-[0.5px] border-[#fecaca] hover:bg-[#fca5a5]`,
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

const E1_PAGE = "bg-[var(--bg-main)] min-h-[calc(100vh-80px)] p-[16px]";
const E1_INNER = "w-full max-w-full mx-auto";
const E1_CARD =
  "overflow-hidden rounded-[10px] border-[1.5px] border-[var(--border-strong)] bg-[var(--bg-surface)] shadow-[0_10px_30px_rgba(15,23,42,0.06)]";
const E1_TOOLBAR =
  "flex min-h-[44px] flex-wrap items-center justify-between gap-[12px] border-b border-[var(--border-strong)] bg-[var(--bg-surface)] px-[14px] py-[7px] rounded-t-[20px]";
const E1_TOOLBAR_LEFT = "flex flex-wrap items-center gap-[8px]";
const E1_TOOLBAR_ACTIONS = "flex flex-wrap items-center gap-[8px]";
const E1_SELECTED_BADGE =
  "rounded-full border border-[#3E5475] bg-[#eff6ff] px-[12px] py-[5px] text-[11px] font-bold text-[var(--text-label)]";
const E1_PAGINATION =
  "flex items-center justify-between overflow-hidden border-t border-[var(--border-strong)] bg-[var(--bg-surface)] px-[14px] py-[7px] rounded-b-[20px]";
const E1_PAGE_BADGE =
  "rounded-[6px] border border-[var(--border-strong)] bg-[#e0f2fe] px-[14px] py-[5px] text-[11px] font-semibold text-[var(--text-label)]";
const E1_TOAST_SX = {
  position: "fixed",
  top: 20,
  right: 20,
  zIndex: 9999,
  minWidth: 300,
  boxShadow: 3,
};

const modalInputProps = {
  style: { fontSize: 13, height: 32, padding: "0 8px", boxSizing: "border-box" },
};

const e1DialogTitleStyle = {
  background: "#1e2d42",
  color: "#ffffff",
  fontWeight: 600,
  fontSize: 16,
  padding: "16px 24px",
  textAlign: "center",
  borderTopLeftRadius: 8,
  borderTopRightRadius: 8,
};

const e1DialogContentStyle = { padding: "24px", backgroundColor: "var(--bg-surface)" };

const e1DialogFormStyle = {
  display: "flex",
  flexDirection: "column",
  gap: 14,
  background: "var(--row-alt)",
  border: "1px solid var(--border-subtle)",
  borderRadius: 8,
  padding: 20,
};

const e1DialogFieldRowStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 12,
};

const e1DialogFieldLabelStyle = {
  fontSize: 13,
  color: "var(--text-primary)",
  fontWeight: 600,
  whiteSpace: "nowrap",
  width: 170,
  lineHeight: 1.2,
  textAlign: "left",
};

const e1DialogFieldControlStyle = { width: "min(100%, 320px)" };

const e1DialogActionsStyle = {
  display: "flex",
  justifyContent: "center",
  gap: 16,
  padding: "16px 24px",
  background: "var(--row-alt)",
  borderTop: "1px solid #9CA3AF",
  borderBottomLeftRadius: 8,
  borderBottomRightRadius: 8,
};

const e1DialogPaperSx = {
  width: 600,
  maxWidth: "95vw",
  mx: "auto",
  p: 0,
  borderRadius: 2,
  overflow: "hidden",
  boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)",
};

const E1Breadcrumb = ({ section, current }) => (
  <div className="mb-[16px] flex flex-wrap items-center gap-[4px] text-[12px] font-normal text-[#94a3b8]">
    <span>E1-PRI</span>
    <span>&gt;</span>
    <span>{section}</span>
    <span>&gt;</span>
    <span className="font-semibold text-[#1e293b]">{current}</span>
  </div>
);

const OUTLINED_BORDER = "var(--border-subtle)";
const OUTLINED_HOVER = "var(--border-strong)";
const OUTLINED_FOCUS = "var(--status-primary)";

const muiTextFieldSx = {
  "& .MuiOutlinedInput-root": {
    backgroundColor: "var(--bg-surface)",
    "& fieldset": { borderColor: OUTLINED_BORDER, transition: "border-color 0.2s ease" },
    "&:hover fieldset": { borderColor: OUTLINED_HOVER },
    "&.Mui-focused fieldset": { borderColor: OUTLINED_FOCUS, borderWidth: 2 },
    "&.Mui-focused:hover fieldset": { borderColor: OUTLINED_FOCUS, borderWidth: 2 },
  },
};

const muiSelectSx = {
  fontSize: 13,
  backgroundColor: "var(--bg-surface)",
  "& .MuiOutlinedInput-root": { minHeight: 36, backgroundColor: "var(--bg-surface)" },
  "& .MuiSelect-select": {
    display: "flex",
    alignItems: "center",
    padding: "7px 32px 7px 10px !important",
    lineHeight: 1.35,
    boxSizing: "border-box",
  },
  "& .MuiOutlinedInput-notchedOutline": {
    borderColor: OUTLINED_BORDER,
    transition: "border-color 0.2s ease",
  },
  "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: OUTLINED_HOVER },
  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
    borderColor: OUTLINED_FOCUS,
    borderWidth: 2,
  },
};

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

const cardStyle = {
  background: C.cardBg,
  border: `1.5px solid ${C.cardBorder}`,
  borderRadius: 10,
  overflow: "hidden",
  boxShadow: "0 10px 30px rgba(15,23,42,0.06)",
};

const cardHeaderStyle = {
  width: "100%",
  minHeight: 44,
  background: C.cardBg,
  borderTopLeftRadius: CARD_RADIUS,
  borderTopRightRadius: CARD_RADIUS,
  display: "flex",
  alignItems: "center",
  padding: "7px 14px",
  fontWeight: 700,
  fontSize: 13,
  color: C.labelText,
  borderBottom: `1px solid ${C.cardBorder}`,
};

const labelStyle = {
  width: 320,
  marginRight: 10,
  lineHeight: 1.4,
  fontSize: 13,
  fontWeight: 600,
  color: C.labelText,
  textAlign: "left",
  whiteSpace: "nowrap",
  flexShrink: 0,
};

const RouteRoutingParameterPage = () => {
  const [settings, setSettings] = useState({ ...ROUTE_SETTINGS_DEFAULTS });
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ msg: "", type: "success" });

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "success" }), 5000);
  };

  const handleSave = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      showToast("Route settings saved successfully.");
    }, 800);
  };

  const handleChange = (name, value) => {
    setSettings((prev) => ({ ...prev, [name]: value }));
  };

  const renderSelect = (name) => (
    <FormControl size="small">
      <Select
        name={name}
        value={settings[name]}
        onChange={(e) => handleChange(name, e.target.value)}
        variant="outlined"
        sx={{ ...muiSelectSx, width: 240 }}
      >
        {ROUTE_SETTINGS_OPTIONS.map((opt) => (
          <MenuItem key={opt.value} value={opt.value} sx={{ fontSize: 13 }}>
            {opt.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );

  return (
    <div className={E1_PAGE}>
      {toast.msg && (
        <Alert
          severity={toast.type}
          onClose={() => setToast({ msg: "", type: "success" })}
          sx={E1_TOAST_SX}
        >
          {toast.msg}
        </Alert>
      )}

      <div style={{ width: "100%", maxWidth: 1000, margin: "0 auto" }}>
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
          <span>E1-PRI</span>
          <span>&gt;</span>
          <span>Route</span>
          <span>&gt;</span>
          <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>
            Route Settings
          </span>
        </div>

        <div style={cardStyle}>
          <div style={cardHeaderStyle}>Route Settings</div>

          <div style={{ padding: "24px 32px 0" }}>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 24,
                maxWidth: 640,
                margin: "0 auto",
                marginBottom: 12,
              }}
            >
              <div className="flex items-center justify-between">
                <label style={labelStyle}>IP Incoming</label>
                {renderSelect("ipIncoming")}
              </div>

              <div className="flex items-center justify-between">
                <label style={labelStyle}>PSTN Incoming</label>
                {renderSelect("pstnIncoming")}
              </div>
            </div>
          </div>

          <div
            style={{
              ...advancedFormInlineFooterStyle,
              width: "100%",
              marginLeft: 0,
              marginRight: 0,
            }}
          >
            <Btn
              variant="primary"
              onClick={handleSave}
              disabled={loading}
              style={advancedFormBtnStyle}
            >
              {loading ? (
                <>
                  <CircularProgress size={16} sx={{ color: "inherit" }} />
                  Saving...
                </>
              ) : (
                "Save"
              )}
            </Btn>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RouteRoutingParameterPage;
