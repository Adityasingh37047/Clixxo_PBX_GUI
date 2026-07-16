import React from "react";
import { Checkbox, CircularProgress, Tooltip } from "@mui/material";
import {
  DDOS_BREADCRUMB_ROOT,
  DDOS_BREADCRUMB_SECTION,
  DDOS_PAGE_TITLE,
  DDOS_TOOLTIPS,
  DDOS_BUTTON_LABELS,
  DDOS_LABEL_ENABLE,
  DDOS_LABEL_WEB_PORT,
  DDOS_LABEL_WEB_LIMIT,
  DDOS_LABEL_FTP_PORT,
  DDOS_LABEL_FTP_LIMIT,
  DDOS_LABEL_SSH_PORT,
  DDOS_LABEL_SSH_LIMIT,
  DDOS_LABEL_TELNET_PORT,
  DDOS_LABEL_TELNET_LIMIT,
  DDOS_LABEL_BLACKLIST_VALIDITY,
  DDOS_LABEL_BLACKLIST_TIME,
  DDOS_CARD_TITLE_INFO_LOG,
  DDOS_BLACKLIST_OPTION_FOREVER,
  DDOS_BLACKLIST_OPTION_IN_SET_TIME,
} from "../../../../constants/DDOSSettingsConstants";
import {
  C,
  OUTLINED_BORDER,
  OUTLINED_HOVER,
  OUTLINED_FOCUS,
  FOCUS_RING_SHADOW,
} from "../../../../theme/pbxTokens";
import { Btn, ExtensionBreadcrumb } from "../../../../components/common";
import {
  ddosPageWrapStyle,
  ddosPageInnerStyle,
  ddosTableContainerStyle,
  ddosHeaderStyle,
  ddosFixedAlertSx,
  ddosFooterBtnStyle,
  FIELD_RADIUS,
} from "./DDOSSettingsTableHelpers";

export const DDOS_COMPACT_MQ = "(max-width: 768px)";
export const DDOS_GRID_TWO_COL_MQ = "(min-width: 1100px)";
export const DDOS_LABEL_COL_WIDTH = 188;
export const DDOS_FIELD_COL_GAP = 16;
export const DDOS_FORM_PAD_X = 28;
export const DDOS_FIELD_BG_EDITABLE = "#ffffff";
export const DDOS_FIELD_BG_READONLY = "#f1f5f9";

export {
  ddosFixedAlertSx,
  ddosFooterBtnStyle,
  ddosTableContainerStyle,
  ddosHeaderStyle,
};

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
  backgroundColor: DDOS_FIELD_BG_EDITABLE,
  lineHeight: 1.35,
  minHeight: 36,
  height: 36,
  fontSize: 13,
  border: `1px solid ${OUTLINED_BORDER}`,
  outline: "none",
  color: C.labelText,
  boxShadow: "none",
  transition: "border-color 0.2s ease, box-shadow 0.2s ease",
};

export const ddosNumberInputStyle = {
  ...systemFieldInputStyle,
  maxWidth: 200,
};

export const ddosSelectStyle = {
  ...ddosNumberInputStyle,
  appearance: "auto",
  paddingTop: 7,
  paddingBottom: 7,
  cursor: "pointer",
  backgroundColor: DDOS_FIELD_BG_EDITABLE,
};

const ddosFieldRowStyle = (isCompact) => ({
  display: "flex",
  flexDirection: isCompact ? "column" : "row",
  alignItems: isCompact ? "stretch" : "flex-start",
  width: "100%",
  gap: isCompact ? 8 : DDOS_FIELD_COL_GAP,
});

const ddosFieldLabelWrapStyle = (isCompact) =>
  isCompact
    ? { width: "100%", minWidth: 0 }
    : {
        flex: `0 0 ${DDOS_LABEL_COL_WIDTH}px`,
        width: DDOS_LABEL_COL_WIDTH,
        minWidth: DDOS_LABEL_COL_WIDTH,
        maxWidth: DDOS_LABEL_COL_WIDTH,
        paddingTop: 9,
      };

const ddosFieldControlWrapStyle = {
  flex: "1 1 auto",
  minWidth: 0,
  width: "100%",
};

export const ddosCheckboxSx = {
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
        { name: "offset", options: { offset: [0, 8] } },
        { name: "preventOverflow", options: { padding: 8 } },
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

export const enableControlStyle = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  minHeight: 36,
};

export const ddosBodyStyle = {
  display: "flex",
  flexDirection: "column",
  gap: 20,
  padding: `20px ${DDOS_FORM_PAD_X}px 24px`,
  background: C.cardBg,
  boxSizing: "border-box",
};

export const ddosConfigPanelStyle = {
  background: C.cardBg,
  border: `1px solid ${C.divider}`,
  borderRadius: 8,
  overflow: "hidden",
  display: "flex",
  flexDirection: "column",
  minHeight: 372,
};

export const ddosConfigBodyStyle = {
  flex: "1 1 auto",
  padding: "18px 18px 20px",
  display: "flex",
  flexDirection: "column",
  gap: 16,
  minHeight: 0,
};

export const ddosConfigFooterStyle = {
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

export const ddosConfigGridStyle = (isGridTwoCol) => ({
  display: "grid",
  gridTemplateColumns: isGridTwoCol ? "1fr 1fr" : "1fr",
  gap: isGridTwoCol ? 24 : 16,
  width: "100%",
  minWidth: 0,
  alignItems: "start",
});

export const ddosConfigColumnStyle = {
  display: "flex",
  flexDirection: "column",
  gap: 16,
  minWidth: 0,
};

export const ddosConfigFullWidthStyle = {
  gridColumn: "1 / -1",
  borderTop: `1px solid ${C.divider}`,
  paddingTop: 16,
};

export const ddosOutputPanelStyle = {
  border: `1px solid ${C.divider}`,
  borderRadius: 8,
  overflow: "hidden",
  backgroundColor: C.cardBg,
  boxShadow: "0 1px 2px rgba(15, 23, 42, 0.02)",
};

export const ddosOutputHeaderStyle = {
  width: "100%",
  minHeight: 44,
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 12,
  flexWrap: "wrap",
  padding: `10px 18px`,
  borderBottom: `1px solid ${C.divider}`,
  backgroundColor: C.cardBg,
  boxSizing: "border-box",
};

export const ddosOutputHeaderTitleStyle = {
  fontSize: 13,
  fontWeight: 700,
  color: C.labelText,
  lineHeight: 1.35,
};

export const ddosOutputBodyStyle = {
  backgroundColor: DDOS_FIELD_BG_READONLY,
  borderTopLeftRadius: 0,
  borderTopRightRadius: 0,
  borderBottomLeftRadius: 8,
  borderBottomRightRadius: 8,
  overflow: "hidden",
};

export const ddosOutputTextareaStyle = {
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

export const DDOSFieldRow = ({
  label,
  tooltip,
  children,
  alignCenter = false,
  isCompact,
}) => {
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
        ...ddosFieldRowStyle(isCompact),
        alignItems: isCompact
          ? "stretch"
          : alignCenter
            ? "center"
            : "flex-start",
      }}
    >
      <div
        style={{
          ...ddosFieldLabelWrapStyle(isCompact),
          paddingTop: isCompact || alignCenter ? 0 : 9,
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
      <div style={ddosFieldControlWrapStyle}>{children}</div>
    </div>
  );
};

export const DDOSSettingsPageShell = ({ children, isCompact }) => (
  <div
    style={{
      ...ddosPageWrapStyle,
      ...(isCompact ? { padding: 8 } : {}),
    }}
    data-native-scroll
  >
    <div
      style={{
        ...ddosPageInnerStyle,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {children}
    </div>
  </div>
);

export const DDOSSettingsBreadcrumb = () => (
  <ExtensionBreadcrumb
    root={DDOS_BREADCRUMB_ROOT}
    section={DDOS_BREADCRUMB_SECTION}
    current={DDOS_PAGE_TITLE}
  />
);

export const DDOSEnableRow = ({
  label,
  tooltipKey,
  fieldKey,
  form,
  isCompact,
  onChange,
}) => (
  <DDOSFieldRow
    label={label}
    tooltip={DDOS_TOOLTIPS[tooltipKey]}
    alignCenter
    isCompact={isCompact}
  >
    <div style={enableControlStyle}>
      <Checkbox
        size="small"
        checked={!!form[fieldKey]}
        onChange={() => onChange(fieldKey, !form[fieldKey], "checkbox")}
        sx={ddosCheckboxSx}
      />
      <span style={{ fontSize: 13, color: C.valueText }}>{DDOS_LABEL_ENABLE}</span>
    </div>
  </DDOSFieldRow>
);

export const DDOSLimitRow = ({
  label,
  tooltipKey,
  fieldKey,
  form,
  isCompact,
  onChange,
}) => (
  <DDOSFieldRow
    label={label}
    tooltip={DDOS_TOOLTIPS[tooltipKey]}
    isCompact={isCompact}
  >
    <input
      type="number"
      value={form[fieldKey] || ""}
      onChange={(e) => onChange(fieldKey, Number(e.target.value), "number")}
      style={ddosNumberInputStyle}
      {...inputInteraction}
    />
  </DDOSFieldRow>
);

export const DDOSConfigPanel = ({
  form,
  isCompact,
  isGridTwoCol,
  loading,
  onChange,
  onReset,
  onSave,
  onSimulate,
}) => (
  <div style={ddosConfigPanelStyle}>
    <div style={ddosConfigBodyStyle}>
      <div style={ddosConfigGridStyle(isGridTwoCol)}>
        <div style={ddosConfigColumnStyle}>
          <DDOSEnableRow
            label={DDOS_LABEL_WEB_PORT}
            tooltipKey="webPortAttack"
            fieldKey="webPortAttack"
            form={form}
            isCompact={isCompact}
            onChange={onChange}
          />
          {form.webPortAttack && (
            <DDOSLimitRow
              label={DDOS_LABEL_WEB_LIMIT}
              tooltipKey="webLimit"
              fieldKey="webLimit"
              form={form}
              isCompact={isCompact}
              onChange={onChange}
            />
          )}

          <DDOSEnableRow
            label={DDOS_LABEL_FTP_PORT}
            tooltipKey="ftpPortAttack"
            fieldKey="ftpPortAttack"
            form={form}
            isCompact={isCompact}
            onChange={onChange}
          />
          {form.ftpPortAttack && (
            <DDOSLimitRow
              label={DDOS_LABEL_FTP_LIMIT}
              tooltipKey="ftpLimit"
              fieldKey="ftpLimit"
              form={form}
              isCompact={isCompact}
              onChange={onChange}
            />
          )}
        </div>

        <div style={ddosConfigColumnStyle}>
          <DDOSEnableRow
            label={DDOS_LABEL_SSH_PORT}
            tooltipKey="sshPortAttack"
            fieldKey="sshPortAttack"
            form={form}
            isCompact={isCompact}
            onChange={onChange}
          />
          {form.sshPortAttack && (
            <DDOSLimitRow
              label={DDOS_LABEL_SSH_LIMIT}
              tooltipKey="sshLimit"
              fieldKey="sshLimit"
              form={form}
              isCompact={isCompact}
              onChange={onChange}
            />
          )}

          <DDOSEnableRow
            label={DDOS_LABEL_TELNET_PORT}
            tooltipKey="telnetPortAttack"
            fieldKey="telnetPortAttack"
            form={form}
            isCompact={isCompact}
            onChange={onChange}
          />
          {form.telnetPortAttack && (
            <DDOSLimitRow
              label={DDOS_LABEL_TELNET_LIMIT}
              tooltipKey="telnetLimit"
              fieldKey="telnetLimit"
              form={form}
              isCompact={isCompact}
              onChange={onChange}
            />
          )}
        </div>

        <div style={ddosConfigFullWidthStyle}>
          <DDOSFieldRow
            label={DDOS_LABEL_BLACKLIST_VALIDITY}
            tooltip={DDOS_TOOLTIPS.blacklistValidity}
            isCompact={isCompact}
          >
            <select
              value={form.blacklistValidityType}
              onChange={(e) =>
                onChange("blacklistValidityType", e.target.value, "select")
              }
              style={ddosSelectStyle}
              {...inputInteraction}
            >
              <option value="forever">{DDOS_BLACKLIST_OPTION_FOREVER}</option>
              <option value="inSetTime">
                {DDOS_BLACKLIST_OPTION_IN_SET_TIME}
              </option>
            </select>
          </DDOSFieldRow>

          {form.blacklistValidityType === "inSetTime" && (
            <DDOSLimitRow
              label={DDOS_LABEL_BLACKLIST_TIME}
              tooltipKey="blacklistTime"
              fieldKey="blacklistTime"
              form={form}
              isCompact={isCompact}
              onChange={onChange}
            />
          )}
        </div>
      </div>
    </div>

    <div style={ddosConfigFooterStyle}>
      <Btn
        type="button"
        variant="cancel"
        onClick={onReset}
        disabled={loading}
        style={ddosFooterBtnStyle}
      >
        {DDOS_BUTTON_LABELS.RESET}
      </Btn>
      <Btn
        type="button"
        variant="primary"
        onClick={onSave}
        disabled={loading}
        style={ddosFooterBtnStyle}
      >
        {loading ? (
          <>
            <CircularProgress size={14} color="inherit" />
            {DDOS_BUTTON_LABELS.CONFIGURING}
          </>
        ) : (
          DDOS_BUTTON_LABELS.SAVE
        )}
      </Btn>
      <Btn
        type="button"
        variant="cancel"
        onClick={onSimulate}
        disabled={loading}
        style={ddosFooterBtnStyle}
      >
        {DDOS_BUTTON_LABELS.SIMULATE_ATTACK}
      </Btn>
    </div>
  </div>
);

export const DDOSInfoLogPanel = ({ log, loading, onClearLogs }) => (
  <div style={ddosOutputPanelStyle}>
    <div style={ddosOutputHeaderStyle}>
      <span style={ddosOutputHeaderTitleStyle}>{DDOS_CARD_TITLE_INFO_LOG}</span>
      <Btn
        variant="cancel"
        onClick={onClearLogs}
        disabled={loading}
        style={ddosFooterBtnStyle}
      >
        {DDOS_BUTTON_LABELS.CLEAR_LOGS}
      </Btn>
    </div>
    <div style={ddosOutputBodyStyle}>
      <textarea
        style={ddosOutputTextareaStyle}
        value={log}
        readOnly
        tabIndex={-1}
        onFocus={(e) => e.target.blur()}
      />
    </div>
  </div>
);
