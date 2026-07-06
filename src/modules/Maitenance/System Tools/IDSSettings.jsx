import React, { useState } from "react";
import { Alert, Checkbox, Tooltip, useMediaQuery } from "@mui/material";
import {
  IDS_TYPES,
  IDS_INITIAL_FORM,
  IDS_WARNING_LOG,
  IDS_LOG_NOTE,
  IDS_BREADCRUMB_ROOT,
  IDS_BREADCRUMB_SECTION,
  IDS_PAGE_TITLE,
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

const IDS_COMPACT_MQ = "(max-width: 768px)";
const IDS_FIELD_BG_READONLY = "#f1f5f9";
const IDS_LABEL_COL_WIDTH = 188;
const IDS_FIELD_COL_GAP = 16;
const IDS_FORM_PAD_X = 28;
const CARD_RADIUS = 10;
const FIELD_RADIUS = 6;

const C = {
  pageBg: "#f8fafc",
  cardBg: "#ffffff",
  cardBorder: "#d8dde5",
  cardShadow: "0 0 14px rgba(0, 0, 0, 0.18), 0 0 5px rgba(0, 0, 0, 0.10)",
  divider: "#e2e6ec",
  labelText: "#3E5475",
  valueText: "#30415A",
  mutedText: "#94a3b8",
  accent: "#3E5475",
  sectionHeading: "#30415A",
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

const systemFieldInputStyle = {
  width: "100%",
  minWidth: 0,
  maxWidth: "100%",
  padding: "0 12px",
  borderRadius: FIELD_RADIUS,
  boxSizing: "border-box",
  background: "#fff",
  lineHeight: 1.35,
  minHeight: 36,
  height: 36,
  fontSize: 13,
  border: `1px solid ${OUTLINED_BORDER}`,
  outline: "none",
  color: C.valueText,
  boxShadow: "none",
  transition: "border-color 0.2s ease, box-shadow 0.2s ease",
};

const idsNumberInputStyle = {
  ...systemFieldInputStyle,
  maxWidth: 140,
};

const idsFieldRowStyle = {
  display: "flex",
  flexDirection: "row",
  alignItems: "flex-start",
  width: "100%",
  gap: IDS_FIELD_COL_GAP,
};

const idsFieldLabelWrapStyle = {
  flex: `0 0 ${IDS_LABEL_COL_WIDTH}px`,
  width: IDS_LABEL_COL_WIDTH,
  minWidth: IDS_LABEL_COL_WIDTH,
  maxWidth: IDS_LABEL_COL_WIDTH,
  paddingTop: 9,
};

const idsFieldControlWrapStyle = {
  flex: "1 1 auto",
  minWidth: 0,
  width: "100%",
};

const idsFooterBtnStyle = {
  height: 30,
  padding: "6px 14px",
  fontSize: 12,
  borderRadius: 10,
  minWidth: 100,
};

const idsCheckboxSx = {
  padding: 0,
  margin: 0,
  color: "#3E5475",
  "&.Mui-checked": { color: "#0284c7" },
};

const tooltipProps = {
  arrow: true,
  placement: "top",
  slotProps: {
    popper: {
      modifiers: [
        {
          name: "offset",
          options: { offset: [0, 8] },
        },
        {
          name: "preventOverflow",
          options: { padding: 8 },
        },
      ],
    },
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
      },
    },
    arrow: { sx: { color: "#fff" } },
  },
};

const IDSTooltipLabel = ({ title, children, style }) => {
  const labelStyle = {
    display: "inline-block",
    maxWidth: "100%",
    ...style,
  };

  if (!title) {
    return <span style={labelStyle}>{children}</span>;
  }

  return (
    <Tooltip title={title} {...tooltipProps}>
      <span style={{ ...labelStyle, cursor: "help" }}>{children}</span>
    </Tooltip>
  );
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
    },
    cancel: {
      background: "#e2e8f0",
      color: "#475569",
      border: "1px solid #e2e8f0",
      boxShadow: "0 1px 2px rgba(15, 23, 42, 0.04)",
    },
  };

  const s = styles[variant] || styles.default;
  const hoverBg =
    {
      primary: "linear-gradient(to bottom, #3E5475 0%, #5A6F8F 100%)",
      cancel: "#d4dce6",
      default: "#f1f5f9",
    }[variant] || "#f1f5f9";
  const activeBg =
    {
      primary: "linear-gradient(to bottom, #2C3E57 0%, #3E5475 100%)",
      cancel: "#c5ced9",
      default: "#e2e8f0",
    }[variant] || "#e2e8f0";
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
      type={type || "button"}
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
        transition:
          "background 0.15s ease, transform 0.1s ease, box-shadow 0.1s ease",
        height: 30,
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

const IDSFieldRow = ({ label, tooltip, children, alignCenter = false }) => {
  const labelNode = (
    <label
      style={{
        fontSize: 13,
        fontWeight: 600,
        color: C.labelText,
        width: "100%",
        lineHeight: 1.4,
        wordBreak: "break-word",
        cursor: tooltip ? "help" : "default",
      }}
    >
      {label}
    </label>
  );

  return (
    <div
      style={{
        ...idsFieldRowStyle,
        alignItems: alignCenter ? "center" : "flex-start",
      }}
    >
      <div
        style={{
          ...idsFieldLabelWrapStyle,
          paddingTop: alignCenter ? 0 : 9,
        }}
      >
        {tooltip ? (
          <Tooltip title={tooltip} {...tooltipProps}>
            {labelNode}
          </Tooltip>
        ) : (
          labelNode
        )}
      </div>
      <div style={idsFieldControlWrapStyle}>{children}</div>
    </div>
  );
};

const idsPageWrapStyle = {
  backgroundColor: C.pageBg,
  minHeight: "calc(100vh - 80px)",
  padding: 16,
  boxSizing: "border-box",
};

const idsPageInnerStyle = {
  width: "100%",
  maxWidth: "100%",
  margin: "0 auto",
  display: "flex",
  flexDirection: "column",
};

const idsTableContainerStyle = {
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

const idsHeaderStyle = {
  width: "100%",
  minHeight: 44,
  background: C.cardBg,
  borderTopLeftRadius: CARD_RADIUS,
  borderTopRightRadius: CARD_RADIUS,
  display: "flex",
  alignItems: "center",
  padding: `10px ${IDS_FORM_PAD_X}px`,
  fontWeight: 700,
  fontSize: 13,
  color: C.labelText,
  borderBottom: `1px solid ${C.divider}`,
  boxSizing: "border-box",
};

const idsBodyStyle = {
  display: "flex",
  flexDirection: "column",
  gap: 20,
  padding: `20px ${IDS_FORM_PAD_X}px 24px`,
  background: C.cardBg,
  boxSizing: "border-box",
};

const idsConfigPanelStyle = {
  background: C.cardBg,
  border: `1px solid ${C.divider}`,
  borderRadius: 8,
  overflow: "hidden",
  display: "flex",
  flexDirection: "column",
  minHeight: 372,
};

const idsConfigBodyStyle = {
  flex: "1 1 auto",
  padding: "18px 18px 20px",
  display: "flex",
  flexDirection: "column",
  gap: 16,
  minHeight: 0,
};

const idsConfigFooterStyle = {
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  justifyContent: "center",
  gap: 10,
  padding: "10px 18px",
  borderTop: `1px solid ${C.divider}`,
  background: C.cardBg,
  boxSizing: "border-box",
  flexShrink: 0,
  borderBottomLeftRadius: 8,
  borderBottomRightRadius: 8,
  minHeight: 50,
};

const idsTableGridStyle = {
  display: "grid",
  gridTemplateColumns: "minmax(0, 1.4fr) minmax(0, 1fr) minmax(0, 1fr)",
  gap: "12px 16px",
  width: "100%",
  alignItems: "center",
};

const idsTableHeaderStyle = {
  fontSize: 12,
  fontWeight: 700,
  color: C.labelText,
  lineHeight: 1.35,
};

const idsTypeCellStyle = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  minWidth: 0,
};

const idsTypeLabelStyle = {
  fontSize: 13,
  color: C.valueText,
  fontWeight: 500,
  lineHeight: 1.35,
};

const idsMobileCardStyle = {
  padding: 14,
  borderRadius: 8,
  background: "#f8fafc",
  border: `1px solid ${C.divider}`,
  display: "flex",
  flexDirection: "column",
  gap: 12,
};

const idsMobileFieldGridStyle = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 12,
};

const idsMobileFieldLabelStyle = {
  fontSize: 12,
  color: C.labelText,
  fontWeight: 600,
  marginBottom: 6,
  display: "block",
};

const idsOutputPanelStyle = {
  border: `1px solid ${C.divider}`,
  borderRadius: 8,
  overflow: "hidden",
  background: C.cardBg,
  boxShadow: "0 1px 2px rgba(15, 23, 42, 0.02)",
};

const idsOutputHeaderStyle = {
  width: "100%",
  minHeight: 44,
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 12,
  flexWrap: "wrap",
  padding: "10px 18px",
  borderBottom: `1px solid ${C.divider}`,
  backgroundColor: C.cardBg,
  boxSizing: "border-box",
};

const idsOutputHeaderTitleStyle = {
  fontSize: 13,
  fontWeight: 700,
  color: C.labelText,
  lineHeight: 1.35,
};

const idsOutputBodyStyle = {
  backgroundColor: IDS_FIELD_BG_READONLY,
  borderTopLeftRadius: 0,
  borderTopRightRadius: 0,
  borderBottomLeftRadius: 8,
  borderBottomRightRadius: 8,
  overflow: "hidden",
};

const idsOutputTextareaStyle = {
  display: "block",
  width: "100%",
  minHeight: 160,
  maxHeight: 280,
  margin: 0,
  padding: "12px 16px 16px",
  border: "none",
  borderRadius: 0,
  outline: "none",
  resize: "vertical",
  boxSizing: "border-box",
  fontSize: 13,
  lineHeight: 1.6,
  fontFamily: "monospace",
  color: C.labelText,
  backgroundColor: "transparent",
  whiteSpace: "pre-wrap",
  cursor: "default",
};

const idsFixedAlertSx = {
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

const IDSBreadcrumb = () => (
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
    <span>{IDS_BREADCRUMB_ROOT}</span>
    <span>&gt;</span>
    <span>{IDS_BREADCRUMB_SECTION}</span>
    <span>&gt;</span>
    <span style={{ color: "#1e293b", fontWeight: 600 }}>{IDS_PAGE_TITLE}</span>
  </div>
);

const IDSSettings = () => {
  const isCompact = useMediaQuery(IDS_COMPACT_MQ);
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
    e?.preventDefault?.();
    showToast(IDS_MSG_SAVE_SUCCESS, "success");
  };

  const handleReset = () => {
    setForm(IDS_INITIAL_FORM);
    showToast(IDS_MSG_RESET_SUCCESS, "info");
  };

  const handleDownload = () => {
    showToast(IDS_MSG_DOWNLOAD_STARTED, "success");
  };

  const renderThresholdTableHeader = () => (
    <div style={idsTableGridStyle}>
      <div style={{ minWidth: 0 }}>
        <IDSTooltipLabel title={IDS_TOOLTIPS.type} style={idsTableHeaderStyle}>
          {IDS_TABLE_HEADER_TYPE}
        </IDSTooltipLabel>
      </div>
      <div style={{ minWidth: 0 }}>
        <IDSTooltipLabel
          title={IDS_TOOLTIPS.warningThreshold}
          style={idsTableHeaderStyle}
        >
          {IDS_TABLE_HEADER_WARNING}
        </IDSTooltipLabel>
      </div>
      <div style={{ minWidth: 0 }}>
        <IDSTooltipLabel
          title={IDS_TOOLTIPS.blacklistThreshold}
          style={idsTableHeaderStyle}
        >
          {IDS_TABLE_HEADER_BLACKLIST}
        </IDSTooltipLabel>
      </div>
    </div>
  );

  const renderThresholdRow = (type, idx) => (
    <div key={type.key} style={idsTableGridStyle}>
      <div style={idsTypeCellStyle}>
        <Checkbox
          size="small"
          checked={form[type.key]}
          onChange={() => handleCheckbox(type.key)}
          sx={idsCheckboxSx}
        />
        <IDSTooltipLabel
          title={IDS_TOOLTIPS[type.label] || ""}
          style={idsTypeLabelStyle}
        >
          {type.label}
        </IDSTooltipLabel>
      </div>
      <input
        type="number"
        value={form.warningThresholds[idx]}
        onChange={(e) => handleWarningThreshold(idx, Number(e.target.value))}
        style={idsNumberInputStyle}
        {...inputInteraction}
      />
      <input
        type="number"
        value={form.blacklistThresholds[idx]}
        onChange={(e) =>
          handleBlacklistThreshold(idx, Number(e.target.value))
        }
        style={idsNumberInputStyle}
        {...inputInteraction}
      />
    </div>
  );

  const renderThresholdTable = () => {
    if (isCompact) {
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {IDS_TYPES.map((type, idx) => (
            <div key={type.key} style={idsMobileCardStyle}>
              <div style={idsTypeCellStyle}>
                <Checkbox
                  size="small"
                  checked={form[type.key]}
                  onChange={() => handleCheckbox(type.key)}
                  sx={idsCheckboxSx}
                />
                <IDSTooltipLabel
                  title={IDS_TOOLTIPS[type.label] || ""}
                  style={{ ...idsTypeLabelStyle, fontWeight: 600 }}
                >
                  {type.label}
                </IDSTooltipLabel>
              </div>
              <div style={idsMobileFieldGridStyle}>
                <div>
                  <span style={idsMobileFieldLabelStyle}>
                    {IDS_LABEL_WARNING_SHORT}
                  </span>
                  <input
                    type="number"
                    value={form.warningThresholds[idx]}
                    onChange={(e) =>
                      handleWarningThreshold(idx, Number(e.target.value))
                    }
                    style={systemFieldInputStyle}
                    {...inputInteraction}
                  />
                </div>
                <div>
                  <span style={idsMobileFieldLabelStyle}>
                    {IDS_LABEL_BLACKLIST_SHORT}
                  </span>
                  <input
                    type="number"
                    value={form.blacklistThresholds[idx]}
                    onChange={(e) =>
                      handleBlacklistThreshold(idx, Number(e.target.value))
                    }
                    style={systemFieldInputStyle}
                    {...inputInteraction}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      );
    }

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {renderThresholdTableHeader()}
        {IDS_TYPES.map((type, idx) => renderThresholdRow(type, idx))}
      </div>
    );
  };

  return (
    <div
      style={{
        ...idsPageWrapStyle,
        ...(isCompact ? { padding: 8 } : {}),
      }}
      data-native-scroll
    >
      <div style={idsPageInnerStyle}>
        {toast.msg && (
          <Alert
            severity={toast.type}
            onClose={() => setToast(IDS_TOAST_DEFAULT)}
            sx={{
              ...idsFixedAlertSx,
              ...(isCompact
                ? { left: 8, right: 8, top: 12, minWidth: 0, maxWidth: "none" }
                : {}),
            }}
          >
            {toast.msg}
          </Alert>
        )}

        <IDSBreadcrumb />

        <div style={idsTableContainerStyle}>
          <div style={idsHeaderStyle}>
            <span>{IDS_PAGE_TITLE}</span>
          </div>

          <div style={idsBodyStyle}>
            <div style={idsConfigPanelStyle}>
              <div style={idsConfigBodyStyle}>
                <IDSFieldRow
                  label={IDS_LABEL_SETTINGS}
                  tooltip={IDS_TOOLTIPS.idsSettings}
                  alignCenter
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      minHeight: 36,
                    }}
                  >
                    <Checkbox
                      size="small"
                      checked={form.enable}
                      onChange={handleEnable}
                      sx={idsCheckboxSx}
                    />
                    <Tooltip title={IDS_TOOLTIPS.enable} {...tooltipProps}>
                      <span style={{ fontSize: 13, color: C.valueText }}>
                        {IDS_LABEL_ENABLE}
                      </span>
                    </Tooltip>
                  </div>
                </IDSFieldRow>

                {renderThresholdTable()}

                <div
                  style={{
                    borderTop: `1px solid ${C.divider}`,
                    paddingTop: 16,
                  }}
                >
                  <IDSFieldRow
                    label={IDS_LABEL_BLACKLIST_VALIDITY}
                    tooltip={IDS_TOOLTIPS.blacklistValidity}
                    alignCenter
                  >
                    <input
                      type="number"
                      value={form.blacklistValidity}
                      onChange={(e) => handleValidity(Number(e.target.value))}
                      style={idsNumberInputStyle}
                      {...inputInteraction}
                    />
                  </IDSFieldRow>
                </div>
              </div>

              <div style={idsConfigFooterStyle}>
                <Btn
                  type="button"
                  variant="cancel"
                  onClick={handleReset}
                  style={idsFooterBtnStyle}
                >
                  {IDS_BTN_RESET}
                </Btn>
                <Btn
                  type="button"
                  variant="primary"
                  onClick={handleSave}
                  style={idsFooterBtnStyle}
                >
                  {IDS_BTN_SAVE}
                </Btn>
              </div>
            </div>

            <div style={idsOutputPanelStyle}>
              <div style={idsOutputHeaderStyle}>
                <span style={idsOutputHeaderTitleStyle}>
                  {IDS_CARD_TITLE_WARNING_LOG}
                </span>
                <Btn
                  variant="cancel"
                  onClick={handleDownload}
                  style={idsFooterBtnStyle}
                >
                  {IDS_BTN_DOWNLOAD}
                </Btn>
              </div>
              <div style={idsOutputBodyStyle}>
                <textarea
                  style={idsOutputTextareaStyle}
                  value={log}
                  readOnly
                  tabIndex={-1}
                  onFocus={(e) => e.target.blur()}
                />
              </div>
            </div>
          </div>
        </div>

        <p
          style={{
            margin: "16px 0 0",
            textAlign: "center",
            fontSize: 12,
            color: C.accent,
            width: "100%",
            lineHeight: 1.5,
            padding: isCompact ? "0 4px" : 0,
            boxSizing: "border-box",
          }}
        >
          {IDS_LOG_NOTE}
        </p>
      </div>
    </div>
  );
};

export default IDSSettings;
