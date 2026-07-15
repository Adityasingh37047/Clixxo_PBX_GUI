import React from "react";
import { Checkbox, Tooltip } from "@mui/material";
import {
  IDS_TYPES,
  IDS_BREADCRUMB_ROOT,
  IDS_BREADCRUMB_SECTION,
  IDS_PAGE_TITLE,
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
  IDS_BTN_RESET,
  IDS_BTN_SAVE,
  IDS_BTN_DOWNLOAD,
  IDS_LOG_NOTE,
} from "../../../../constants/IDSSettingsConstants";
import {
  C,
  OUTLINED_BORDER,
  OUTLINED_HOVER,
  OUTLINED_FOCUS,
  FOCUS_RING_SHADOW,
} from "../../../../theme/pbxTokens";
import { Btn, ExtensionBreadcrumb } from "../../../../components/common";
import {
  idsPageWrapStyle,
  idsPageInnerStyle,
  idsTableContainerStyle,
  idsHeaderStyle,
  idsFixedAlertSx,
  idsFooterBtnStyle,
} from "./IDSSettingsTableHelpers";

export const IDS_COMPACT_MQ = "(max-width: 768px)";
export const IDS_FIELD_BG_READONLY = "#f1f5f9";
export const IDS_LABEL_COL_WIDTH = 188;
export const IDS_FIELD_COL_GAP = 16;
export const IDS_FORM_PAD_X = 28;
export const FIELD_RADIUS = 6;

export { idsFixedAlertSx, idsFooterBtnStyle, idsTableContainerStyle, idsHeaderStyle };

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
  el.style.boxShadow = FOCUS_RING_SHADOW;
};

export const inputInteraction = {
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

export const systemFieldInputStyle = {
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

export const idsNumberInputStyle = {
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

export const idsCheckboxSx = {
  padding: 0,
  margin: 0,
  color: "#3E5475",
  "&.Mui-checked": { color: "#0284c7" },
};

export const tooltipProps = {
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

export const IDSTooltipLabel = ({ title, children, style }) => {
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

export const IDSFieldRow = ({ label, tooltip, children, alignCenter = false }) => {
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

export const idsBodyStyle = {
  display: "flex",
  flexDirection: "column",
  gap: 20,
  padding: `20px ${IDS_FORM_PAD_X}px 24px`,
  background: C.cardBg,
  boxSizing: "border-box",
};

export const idsConfigPanelStyle = {
  background: C.cardBg,
  border: `1px solid ${C.divider}`,
  borderRadius: 8,
  overflow: "hidden",
  display: "flex",
  flexDirection: "column",
  minHeight: 372,
};

export const idsConfigBodyStyle = {
  flex: "1 1 auto",
  padding: "18px 18px 20px",
  display: "flex",
  flexDirection: "column",
  gap: 16,
  minHeight: 0,
};

export const idsConfigFooterStyle = {
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

export const idsTableGridStyle = {
  display: "grid",
  gridTemplateColumns: "minmax(0, 1.4fr) minmax(0, 1fr) minmax(0, 1fr)",
  gap: "12px 16px",
  width: "100%",
  alignItems: "center",
};

export const idsTableHeaderStyle = {
  fontSize: 12,
  fontWeight: 700,
  color: C.labelText,
  lineHeight: 1.35,
};

export const idsTypeCellStyle = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  minWidth: 0,
};

export const idsTypeLabelStyle = {
  fontSize: 13,
  color: C.valueText,
  fontWeight: 500,
  lineHeight: 1.35,
};

export const idsMobileCardStyle = {
  padding: 14,
  borderRadius: 8,
  background: "#f8fafc",
  border: `1px solid ${C.divider}`,
  display: "flex",
  flexDirection: "column",
  gap: 12,
};

export const idsMobileFieldGridStyle = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 12,
};

export const idsMobileFieldLabelStyle = {
  fontSize: 12,
  color: C.labelText,
  fontWeight: 600,
  marginBottom: 6,
  display: "block",
};

export const idsOutputPanelStyle = {
  border: `1px solid ${C.divider}`,
  borderRadius: 8,
  overflow: "hidden",
  background: C.cardBg,
  boxShadow: "0 1px 2px rgba(15, 23, 42, 0.02)",
};

export const idsOutputHeaderStyle = {
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

export const idsOutputHeaderTitleStyle = {
  fontSize: 13,
  fontWeight: 700,
  color: C.labelText,
  lineHeight: 1.35,
};

export const idsOutputBodyStyle = {
  backgroundColor: IDS_FIELD_BG_READONLY,
  borderTopLeftRadius: 0,
  borderTopRightRadius: 0,
  borderBottomLeftRadius: 8,
  borderBottomRightRadius: 8,
  overflow: "hidden",
};

export const idsOutputTextareaStyle = {
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

export const IDSSettingsPageShell = ({ children, isCompact }) => (
  <div
    style={{
      ...idsPageWrapStyle,
      ...(isCompact ? { padding: 8 } : {}),
    }}
    data-native-scroll
  >
    <div
      style={{
        ...idsPageInnerStyle,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {children}
    </div>
  </div>
);

export const IDSSettingsBreadcrumb = () => (
  <ExtensionBreadcrumb
    root={IDS_BREADCRUMB_ROOT}
    section={IDS_BREADCRUMB_SECTION}
    current={IDS_PAGE_TITLE}
  />
);

export const IDSThresholdTable = ({
  form,
  isCompact,
  onCheckbox,
  onWarningThreshold,
  onBlacklistThreshold,
}) => {
  if (isCompact) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {IDS_TYPES.map((type, idx) => (
          <div key={type.key} style={idsMobileCardStyle}>
            <div style={idsTypeCellStyle}>
              <Checkbox
                size="small"
                checked={form[type.key]}
                onChange={() => onCheckbox(type.key)}
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
                    onWarningThreshold(idx, Number(e.target.value))
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
                    onBlacklistThreshold(idx, Number(e.target.value))
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
      {IDS_TYPES.map((type, idx) => (
        <div key={type.key} style={idsTableGridStyle}>
          <div style={idsTypeCellStyle}>
            <Checkbox
              size="small"
              checked={form[type.key]}
              onChange={() => onCheckbox(type.key)}
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
            onChange={(e) => onWarningThreshold(idx, Number(e.target.value))}
            style={idsNumberInputStyle}
            {...inputInteraction}
          />
          <input
            type="number"
            value={form.blacklistThresholds[idx]}
            onChange={(e) =>
              onBlacklistThreshold(idx, Number(e.target.value))
            }
            style={idsNumberInputStyle}
            {...inputInteraction}
          />
        </div>
      ))}
    </div>
  );
};

export const IDSConfigPanel = ({
  form,
  isCompact,
  onEnable,
  onCheckbox,
  onWarningThreshold,
  onBlacklistThreshold,
  onValidity,
  onReset,
  onSave,
}) => (
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
            onChange={onEnable}
            sx={idsCheckboxSx}
          />
          <Tooltip title={IDS_TOOLTIPS.enable} {...tooltipProps}>
            <span style={{ fontSize: 13, color: C.valueText }}>
              {IDS_LABEL_ENABLE}
            </span>
          </Tooltip>
        </div>
      </IDSFieldRow>

      <IDSThresholdTable
        form={form}
        isCompact={isCompact}
        onCheckbox={onCheckbox}
        onWarningThreshold={onWarningThreshold}
        onBlacklistThreshold={onBlacklistThreshold}
      />

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
            onChange={(e) => onValidity(Number(e.target.value))}
            style={idsNumberInputStyle}
            {...inputInteraction}
          />
        </IDSFieldRow>
      </div>
    </div>

    <div style={idsConfigFooterStyle}>
      <Btn type="button" variant="cancel" onClick={onReset} style={idsFooterBtnStyle}>
        {IDS_BTN_RESET}
      </Btn>
      <Btn type="button" variant="primary" onClick={onSave} style={idsFooterBtnStyle}>
        {IDS_BTN_SAVE}
      </Btn>
    </div>
  </div>
);

export const IDSWarningLogPanel = ({ log, onDownload }) => (
  <div style={idsOutputPanelStyle}>
    <div style={idsOutputHeaderStyle}>
      <span style={idsOutputHeaderTitleStyle}>{IDS_CARD_TITLE_WARNING_LOG}</span>
      <Btn variant="cancel" onClick={onDownload} style={idsFooterBtnStyle}>
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
);

export const IDSLogNote = ({ isCompact }) => (
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
);
