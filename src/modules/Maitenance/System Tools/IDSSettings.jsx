import React, { useState } from "react";
import { Tooltip } from "@mui/material";
import {
  IDS_TYPES,
  IDS_INITIAL_FORM,
  IDS_WARNING_LOG,
  IDS_LOG_NOTE,
  IDS_BREADCRUMB_ROOT,
  IDS_BREADCRUMB_SECTION,
  IDS_PAGE_TITLE,
  IDS_BREADCRUMB_SEPARATOR,
  IDS_CARD_TITLE,
  IDS_BTN_RESET,
  IDS_BTN_SAVE,
  IDS_BTN_DOWNLOAD,
  IDS_LABEL_SETTINGS,
  IDS_LABEL_ENABLE,
  IDS_TABLE_HEADER_TYPE,
  IDS_TABLE_HEADER_WARNING,
  IDS_TABLE_HEADER_BLACKLIST,
  IDS_TOOLTIPS,
  IDS_LABEL_BLACKLIST_VALIDITY,
  IDS_CARD_TITLE_WARNING_LOG,
  IDS_LABEL_WARNING_SHORT,
  IDS_LABEL_BLACKLIST_SHORT,
  IDS_MSG_SAVE_SUCCESS,
  IDS_MSG_RESET_SUCCESS,
  IDS_MSG_DOWNLOAD_STARTED,
  IDS_TOAST_DEFAULT,
  IDS_TOAST_DURATION,
} from "../../../constants/IDSSettingsConstants";
import { Alert, Checkbox } from "@mui/material";
// ── Color palette (same as AccountManage) ────────────────────────────────────
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
  el.style.boxShadow = FOCUS_RING_SHADOW(OUTLINED_FOCUS);
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

const inputInteraction = {
  onFocus: (e) => {
    if (e.target.disabled || e.target.readOnly) return;
    nativeFieldInteraction.onFocus(e);
  },
  onBlur: (e) => {
    if (e.target.disabled || e.target.readOnly) return;
    nativeFieldInteraction.onBlur(e);
  },
  onMouseEnter: (e) => {
    if (e.target.disabled || e.target.readOnly) return;
    nativeFieldInteraction.onMouseEnter(e);
  },
  onMouseLeave: (e) => {
    if (e.target.disabled || e.target.readOnly) return;
    nativeFieldInteraction.onMouseLeave(e);
  },
};

const getSystemToolsInputInteraction = (hasError, errorColor = "#dc2626") => {
  if (!hasError) return inputInteraction;
  const ring = (el, focused) => {
    el.style.borderColor = errorColor;
    el.style.borderWidth = "1px";
    el.style.boxShadow = focused ? `0 0 0 1px ${errorColor}` : "none";
  };
  return {
    onFocus: (e) => ring(e.target, true),
    onBlur: (e) => ring(e.target, false),
    onMouseEnter: (e) => ring(e.target, document.activeElement === e.target),
    onMouseLeave: (e) => ring(e.target, document.activeElement === e.target),
  };
};

const systemToolsFieldInputStyle = {
  padding: "6px 12px",
  borderRadius: 6,
  border: `1px solid ${OUTLINED_BORDER}`,
  fontSize: 14,
  width: "100%",
  backgroundColor: "#f8fafc",
  outline: "none",
  color: "#3E5475",
  transition: "border-color 0.2s ease, box-shadow 0.2s ease",
  boxSizing: "border-box",
  boxShadow: "none",
};

const SYSTEM_TOOLS_FILL_BG_EDITABLE = "#ffffff";
const SYSTEM_TOOLS_FILL_BG_READ_ONLY = "#f1f5f9";

const systemToolsEditableFieldInputStyle = {
  ...systemToolsFieldInputStyle,
  backgroundColor: SYSTEM_TOOLS_FILL_BG_EDITABLE,
};
const systemToolsEditableFieldInputStyleCompact = {
  ...systemToolsFieldInputStyle,
  padding: "4px 10px",
  backgroundColor: SYSTEM_TOOLS_FILL_BG_EDITABLE,
};
const systemToolsReadOnlyFieldTextAreaStyle = {
  fontSize: 13,
  padding: "12px",
  backgroundColor: SYSTEM_TOOLS_FILL_BG_READ_ONLY,
  border: `1px solid ${OUTLINED_BORDER}`,
  color: "#3E5475",
  outline: "none",
  fontFamily: "monospace",
  transition: "border-color 0.2s ease, box-shadow 0.2s ease",
  boxSizing: "border-box",
  boxShadow: "none",
  borderRadius: 6,
  width: "100%",
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


// ── Button Component (same as AccountManage) ─────────────────────────────────
const Btn = ({
  children,
  onClick,
  disabled,
  variant = "default",
  style: extraStyle,
  type,
  startIcon,

  component,
 
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
    error: {
      background: C.errorRed,
      color: C.cardBg,
      border: `1px solid ${C.errorRed}`,
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

const IDSSettingsPageWrapStyle = {
  backgroundColor: C.pageBg,
  minHeight: "calc(100vh - 80px)",
  padding: 16,
  boxSizing: "border-box",
};

const IDSSettingsPageInnerStyle = {
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
  marginBottom: 0,
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

const IDSSettings = () => {
  const [form, setForm] = useState(IDS_INITIAL_FORM);
  const [log, setLog] = useState(IDS_WARNING_LOG);
  const [toast, setToast] = useState(IDS_TOAST_DEFAULT);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(IDS_TOAST_DEFAULT), IDS_TOAST_DURATION);
  };

  const handleCheckbox = (key) => {
    setForm((prev) => ({ ...prev, [key]: !prev[key] }));
  };
  const handleEnable = () => {
    setForm((prev) => ({ ...prev, enable: !prev.enable }));
  };
  const handleWarningThreshold = (idx, value) => {
    const arr = [...form.warningThresholds];
    arr[idx] = value;
    setForm((prev) => ({ ...prev, warningThresholds: arr }));
  };
  const handleBlacklistThreshold = (idx, value) => {
    const arr = [...form.blacklistThresholds];
    arr[idx] = value;
    setForm((prev) => ({ ...prev, blacklistThresholds: arr }));
  };
  const handleValidity = (value) => {
    setForm((prev) => ({ ...prev, blacklistValidity: value }));
  };
  const handleSave = (e) => {
    e.preventDefault();
    showToast(IDS_MSG_SAVE_SUCCESS, "success");
  };
  
  const handleReset = () => {
    setForm(IDS_INITIAL_FORM);
    showToast(IDS_MSG_RESET_SUCCESS, "info");
  };
  
  const handleDownload = () => {
    showToast(IDS_MSG_DOWNLOAD_STARTED, "success");
  };
  return (
      <div style={IDSSettingsPageWrapStyle} data-native-scroll>
      <div style={IDSSettingsPageInnerStyle}>
      
      {/* ── Alerts ── */}
      {toast.msg && (
        <Alert
          severity={toast.type}
          onClose={() => setToast(IDS_TOAST_DEFAULT)}
          sx={{
            position: "fixed",
            top: 20,
            right: 20,
            zIndex: 9999,
            minWidth: 300,
            boxShadow: 3,
          }}
        >
          {toast.msg}
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
          <span>{IDS_BREADCRUMB_ROOT}</span>
          <span>{IDS_BREADCRUMB_SEPARATOR}</span>
          <span>{IDS_BREADCRUMB_SECTION}</span>
          <span>{IDS_BREADCRUMB_SEPARATOR}</span>
          <span style={{ color: C.strongText, fontWeight: 600 }}>
            {IDS_PAGE_TITLE}
          </span>
        </div>

        {/* IDS Settings Section */}
        <div style={tableContainerStyle}>
          <div style={blueBarStyle}>
            <span>{IDS_CARD_TITLE}</span>
          </div>

          <form onSubmit={handleSave} className="w-full">
            <div className="w-full px-5 pt-3 pb-0">
            <div
              className="w-full max-w-4xl mx-auto"
              style={{ marginBottom: 12 }}
            >
              {/* Enable Checkbox */}
              <div
                className="flex items-center gap-4 mb-3"
                style={{
                  borderBottom: `1px solid ${C.divider}`,
                  paddingBottom: 8,
                }}
              >
               <Tooltip
  title={IDS_TOOLTIPS.idsSettings}
  {...tooltipProps}
>
  <span
    style={{
      fontSize: 13,
      fontWeight: 600,
      color: C.labelText,
      minWidth: 100,
      display: "inline-block",
    }}
  >
    {IDS_LABEL_SETTINGS}
  </span>
</Tooltip>
                <div className="flex items-center gap-2">
                  <Checkbox
                    size="small"
                    checked={form.enable}
                    onChange={handleEnable}
                    sx={{
                      padding: "4px",
                      color: "#64748b",
                      "&.Mui-checked": { color: C.accent },
                    }}
                  />
  <Tooltip
    title={IDS_TOOLTIPS.enable}
    {...tooltipProps}
  >
    <span style={{ fontSize: 14, color: C.valueText }}>
      {IDS_LABEL_ENABLE}
    </span>
  </Tooltip>
                </div>
              </div>

              {/* Table Header - Hidden on mobile, shown on larger screens */}
              <div className="hidden md:grid md:grid-cols-3 gap-x-4 gap-y-2 items-center w-full mb-3 px-2 py-2 rounded">
              <Tooltip title={IDS_TOOLTIPS.type} {...tooltipProps}>
  <span
    style={{ fontSize: 12, fontWeight: 700, color: C.labelText }}
  >
    {IDS_TABLE_HEADER_TYPE}
  </span>
</Tooltip>

<Tooltip title={IDS_TOOLTIPS.warningThreshold} {...tooltipProps}>
  <span
    style={{ fontSize: 12, fontWeight: 700, color: C.labelText }}
  >
    {IDS_TABLE_HEADER_WARNING}
  </span>
</Tooltip>

<Tooltip title={IDS_TOOLTIPS.blacklistThreshold} {...tooltipProps}>
  <span
    style={{ fontSize: 12, fontWeight: 700, color: C.labelText }}
  >
    {IDS_TABLE_HEADER_BLACKLIST}
  </span>
</Tooltip>
                </div>

              {/* Desktop Layout - Grid table */}
              <div className="hidden md:grid md:grid-cols-3 gap-x-4 gap-y-3 items-center w-full px-2">
                {IDS_TYPES.map((type, idx) => (
                  <React.Fragment key={type.key}>
                    <div className="flex flex-row items-center gap-2 col-span-1">
                      <Checkbox
                        size="small"
                        checked={form[type.key]}
                        onChange={() => handleCheckbox(type.key)}
                        sx={{
                          padding: "4px",
                          color: "#64748b",
                          "&.Mui-checked": { color: C.accent },
                        }}
                      />
                  <Tooltip
  title={IDS_TOOLTIPS[type.label] || ""}
  {...tooltipProps}
>
  <span
    style={{
      fontSize: 13,
      color: C.valueText,
      fontWeight: 500,
    }}
  >
    {type.label}
  </span>
</Tooltip>
                    </div>
                    <div className="col-span-1 flex items-center">
                      <input
                        type="number"
                        value={form.warningThresholds[idx]}
                        onChange={(e) =>
                          handleWarningThreshold(idx, Number(e.target.value))
                        }
                        style={{
                          ...systemToolsEditableFieldInputStyleCompact,
                          maxWidth: 140,
                        }}
                        {...inputInteraction}
                      />
                    </div>
                    <div className="col-span-1 flex items-center">
                      <input
                        type="number"
                        value={form.blacklistThresholds[idx]}
                        onChange={(e) =>
                          handleBlacklistThreshold(idx, Number(e.target.value))
                        }
                        style={{
                          ...systemToolsEditableFieldInputStyleCompact,
                          maxWidth: 140,
                        }}
                        {...inputInteraction}
                      />
                    </div>
                  </React.Fragment>
                ))}
              </div>

              {/* Mobile Layout - Stacked cards */}
              <div className="md:hidden space-y-3">
                {IDS_TYPES.map((type, idx) => (
                  <div
                    key={type.key}
                    className="p-4 rounded-lg"
                    style={{
                      backgroundColor: "#f8fafc",
                      border: `1px solid ${C.cardBorder}`,
                    }}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <Checkbox
                        size="small"
                        checked={form[type.key]}
                        onChange={() => handleCheckbox(type.key)}
                        sx={{
                          padding: "4px",
                          color: "#64748b",
                          "&.Mui-checked": { color: C.accent },
                        }}
                      />
                      <span
                        style={{
                          fontSize: 13,
                          color: C.valueText,
                          fontWeight: 600,
                        }}
                      >
                        {type.label}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col">
                        <label
                          style={{
                            fontSize: 12,
                            color: C.labelText,
                            marginBottom: 4,
                          }}
                        >
                          {IDS_LABEL_WARNING_SHORT}
                        </label>
                        <input
                          type="number"
                          value={form.warningThresholds[idx]}
                          onChange={(e) =>
                            handleWarningThreshold(idx, Number(e.target.value))
                          }
                          style={{
                            ...systemToolsEditableFieldInputStyleCompact,
                          }}
                          {...inputInteraction}
                        />
                      </div>
                      <div className="flex flex-col">
                        <label
                          style={{
                            fontSize: 12,
                            color: C.labelText,
                            marginBottom: 4,
                          }}
                        >
                          {IDS_LABEL_BLACKLIST_SHORT}
                        </label>
                        <input
                          type="number"
                          value={form.blacklistThresholds[idx]}
                          onChange={(e) =>
                            handleBlacklistThreshold(
                              idx,
                              Number(e.target.value),
                            )
                          }
                          style={{
                            ...systemToolsEditableFieldInputStyleCompact,
                          }}
                          {...inputInteraction}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Blacklist Validity */}
              <div
  className="flex items-center gap-4 mt-3 pt-3"
  style={{
    borderTop: `1px solid ${C.divider}`,
  }}
>
  <div style={{ width: 290 }}>
    <Tooltip
      title={IDS_TOOLTIPS.blacklistValidity}
      {...tooltipProps}
    >
      <span
        style={{
          fontSize: 13,
          fontWeight: 600,
          color: C.labelText,
          display: "inline-block",
          width: "100%",
          marginLeft: 42,

        }}
      >
        {IDS_LABEL_BLACKLIST_VALIDITY}
      </span>
    </Tooltip>
  </div>

  <input
    type="number"
    value={form.blacklistValidity}
    onChange={(e) => handleValidity(Number(e.target.value))}
    style={{
      ...systemToolsEditableFieldInputStyle,
      width: 140,
    }}
    {...inputInteraction}
  />
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
                type="button"
                variant="cancel"
                onClick={handleReset}
                style={advancedFormBtnStyle}
              >
                {IDS_BTN_RESET}
              </Btn>
              <Btn type="submit" variant="primary" style={advancedFormBtnStyle}>
                {IDS_BTN_SAVE}
              </Btn>
            </div>
          </form>
        </div>

        {/* IDS Warning Log Section */}
        <div style={{
    ...tableContainerStyle,
    marginTop: 20,
  }}>
          <div style={blueBarStyle}>
            <span>{IDS_CARD_TITLE_WARNING_LOG}</span>
          </div>

          <div className="px-5 pt-3 pb-2">
            <div className="w-full max-w-4xl mx-auto flex flex-col gap-2">
              {/* Log Display Area */}
              <textarea
                className="w-full rounded resize-y"
                style={{
                  ...systemToolsReadOnlyFieldTextAreaStyle,
                  minHeight: 120,
                  maxHeight: 200,
                  color: C.valueText,
                }}
                value={log}
                readOnly
                {...inputInteraction}
              />

              {/* Download Button */}
              <div className="flex justify-center">
                <Btn
                  variant="primary"
                  onClick={handleDownload}
                  style={{ minWidth: 110, height: 34 }}
                >
                  {IDS_BTN_DOWNLOAD}
                </Btn>
              </div>
            </div>
          </div>
        </div>

        {/* Note */}
        <p
          style={{
            margin: "16px 0 0",
            textAlign: "center",
            fontSize: 12,
            color: C.accent,
            width: "100%",
            whiteSpace: "nowrap",
            overflowX: "auto",
            lineHeight: 1.45,
          }}
        >
          {IDS_LOG_NOTE}
        </p>
      </div>
    </div>
  );
};

export default IDSSettings;
