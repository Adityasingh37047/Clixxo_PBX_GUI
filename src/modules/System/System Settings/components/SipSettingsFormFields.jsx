import React, { useEffect, useRef } from "react";
import Tooltip from "@mui/material/Tooltip";
import { Checkbox, useMediaQuery } from "@mui/material";
import {
  SIP_SETTINGS_BTN_CHOOSE_FILE,
  SIP_SETTINGS_FIELD_TOOLTIPS,
  SIP_SETTINGS_NO_FILE_CHOSEN,
  SIP_SETTINGS_SECTION_HEADING_LEFT,
  SIP_SETTINGS_CURRENT_CERT_TITLE,
  SIP_SETTINGS_CURRENT_CERT_SUBJECT,
  SIP_SETTINGS_CURRENT_CERT_VALID,
  SIP_SETTINGS_CURRENT_CERT_COVERS,
  SIP_SETTINGS_CURRENT_CERT_VIRTUAL_IP,
} from "../../../../constants/SipSettingsConstants";
import { Btn } from "../../../../components/common";
import {
  C,
  OUTLINED_BORDER,
  OUTLINED_FOCUS,
  OUTLINED_HOVER,
  FOCUS_RING_SHADOW,
} from "../../../../theme/pbxTokens";
import {
  CARD_RADIUS,
  sipSettingsCardStyle,
  sipSettingsToolbarStyle,
  sipSettingsCheckboxSx,
  sipSettingsCancelBtnStyle,
  sipSettingsFormBtnStyle as sipSettingsFormBtnStyleFromCommon,
} from "./SipSettingsTableHelpers";

export const SIP_SETTINGS_COMPACT_MQ = "(max-width: 768px)";
export const SIP_SETTINGS_LAPTOP_NARROW_MQ = "(max-width: 1366px)";
export const SIP_SETTINGS_LABEL_WIDTH = 200;
export const SIP_SETTINGS_CONTROL_WIDTH = 220;
export const SIP_SETTINGS_FIELD_COL_GAP = 8;
export const SIP_SETTINGS_FORM_PAD_X = 28;
const SIP_SETTINGS_COLUMN_GAP = 12;
const SIP_SETTINGS_FIELDS_STACK_GAP = 12;
const SIP_SETTINGS_COLUMN_PADDING_DESKTOP = "16px 36px 20px";

const SIP_SETTINGS_SECTION_HEADING_COLOR = "#30415A";
const SIP_SETTINGS_SECTION_HEADING_FIRST_MARGIN = "12px 0 24px 0";
const SIP_SETTINGS_SECTION_HEADING_NEXT_MARGIN = "28px 0 24px 0";

export const SIP_SETTINGS_TOOLTIP_PROPS = {
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
        padding: "10px 12px",
      },
    },
    arrow: {
      sx: {
        color: "#fff",
      },
    },
  },
};

const sipSettingsOutlinedInputRootSx = {
  backgroundColor: "#fff",
  transition: "border-color 0.2s ease, box-shadow 0.2s ease",
  "& fieldset": {
    borderColor: OUTLINED_BORDER,
    transition: "border-color 0.2s ease, box-shadow 0.2s ease",
  },
  "&:hover fieldset": {
    borderColor: OUTLINED_HOVER,
  },
  "&.Mui-focused": {
    boxShadow: FOCUS_RING_SHADOW,
  },
  "&.Mui-focused fieldset": {
    borderColor: OUTLINED_FOCUS,
    borderWidth: "1px",
  },
  "&.Mui-focused:hover fieldset": {
    borderColor: OUTLINED_FOCUS,
    borderWidth: "1px",
  },
};

export const sipSettingsTextFieldSx = {
  width: "100%",
  maxWidth: SIP_SETTINGS_CONTROL_WIDTH,
  "& .MuiOutlinedInput-root": sipSettingsOutlinedInputRootSx,
  "& .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline": {
    borderColor: OUTLINED_BORDER,
    transition: "border-color 0.2s ease, box-shadow 0.2s ease",
  },
  "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline": {
    borderColor: OUTLINED_HOVER,
  },
  "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
    borderColor: OUTLINED_FOCUS,
    borderWidth: "1px",
  },
  "& .MuiOutlinedInput-input": {
    backgroundColor: "#fff",
    fontSize: 13,
    color: C.valueText,
    padding: "8px 12px",
  },
};

export const sipSettingsSelectSx = {
  ...sipSettingsTextFieldSx,
  fontSize: 13,
  backgroundColor: "#fff",
  minHeight: 36,
  height: 36,
  "& .MuiOutlinedInput-notchedOutline": {
    borderColor: OUTLINED_BORDER,
    transition: "border-color 0.2s ease, box-shadow 0.2s ease",
  },
  "&:hover .MuiOutlinedInput-notchedOutline": {
    borderColor: OUTLINED_HOVER,
  },
  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
    borderColor: OUTLINED_FOCUS,
    borderWidth: "1px",
  },
  "& .MuiSelect-select": {
    display: "flex",
    alignItems: "center",
    padding: "7px 32px 7px 10px !important",
    lineHeight: 1.35,
    boxSizing: "border-box",
    fontSize: 13,
    color: C.valueText,
    backgroundColor: "#fff",
  },
};

export const sipSettingsBindAddressSelectSx = {
  ...sipSettingsSelectSx,
  "& .MuiSelect-select": {
    ...sipSettingsSelectSx["& .MuiSelect-select"],
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    display: "block",
    maxWidth: "100%",
  },
};

export const sipSettingsTableContainerStyle = {
  ...sipSettingsCardStyle,
  width: "100%",
  maxWidth: "100%",
  margin: 0,
  display: "flex",
  flexDirection: "column",
  boxSizing: "border-box",
};

export const sipSettingsHeaderStyle = {
  ...sipSettingsToolbarStyle,
  justifyContent: "flex-start",
  fontWeight: 700,
  fontSize: 13,
  color: C.labelText,
  boxSizing: "border-box",
};

export const sipSettingsFormOuterStyle = {
  padding: 0,
  boxSizing: "border-box",
};

export const sipSettingsDashboardGridStyle = (isCompact) => ({
  display: "grid",
  gridTemplateColumns: isCompact
    ? "1fr"
    : "minmax(0, 1fr) 1px minmax(0, 1fr)",
  width: "100%",
  alignItems: "stretch",
  alignContent: "start",
  minHeight: "100%",
});

export const sipSettingsDashboardColumnStyle = (isCompact) => ({
  display: "flex",
  flexDirection: "column",
  gap: SIP_SETTINGS_COLUMN_GAP,
  minWidth: 0,
  padding: isCompact
    ? `16px ${SIP_SETTINGS_FORM_PAD_X}px 20px`
    : SIP_SETTINGS_COLUMN_PADDING_DESKTOP,
  background: C.cardBg,
  boxSizing: "border-box",
});

export const sipSettingsDashboardDividerCellStyle = {
  display: "flex",
  flexDirection: "column",
  alignSelf: "stretch",
  padding: "14px 0",
  boxSizing: "border-box",
};

export const sipSettingsDashboardDividerLineStyle = {
  flex: 1,
  width: 1,
  background: C.divider,
  margin: "0 auto",
};

export const sipSettingsDashboardFieldsStackStyle = {
  display: "flex",
  flexDirection: "column",
  width: "100%",
  minWidth: 0,
  gap: 0,
};

export const sipSettingsFieldGroupStyle = {
  display: "flex",
  flexDirection: "column",
  gap: SIP_SETTINGS_FIELDS_STACK_GAP,
  width: "100%",
};

export const sipSettingsFooterStyle = {
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  justifyContent: "center",
  gap: 12,
  width: "100%",
  margin: 0,
  padding: "10px 28px",
  borderTop: `1px solid ${C.divider}`,
  background: C.cardBg,
  boxSizing: "border-box",
  flexShrink: 0,
  borderBottomLeftRadius: CARD_RADIUS,
  borderBottomRightRadius: CARD_RADIUS,
};

export { sipSettingsFormBtnStyleFromCommon as sipSettingsFormBtnStyle };

export const sipSettingsFieldRowStyle = (isCompact) => ({
  display: "flex",
  flexDirection: isCompact ? "column" : "row",
  alignItems: isCompact ? "stretch" : "flex-start",
  width: "100%",
  minHeight: 36,
  gap: SIP_SETTINGS_FIELD_COL_GAP,
});

export const sipSettingsLabelWrapStyle = (labelColWidth = SIP_SETTINGS_LABEL_WIDTH) => ({
  flex: `0 0 ${labelColWidth}px`,
  width: labelColWidth,
  maxWidth: labelColWidth,
  minWidth: labelColWidth,
});

export const sipSettingsValueColStyle = {
  flex: "1 1 auto",
  minWidth: SIP_SETTINGS_CONTROL_WIDTH,
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-end",
  justifyContent: "flex-start",
  paddingTop: 2,
};

export const sipSettingsFieldControlStyle = {
  width: SIP_SETTINGS_CONTROL_WIDTH,
  minWidth: SIP_SETTINGS_CONTROL_WIDTH,
  maxWidth: SIP_SETTINGS_CONTROL_WIDTH,
  flexShrink: 0,
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
  justifyContent: "flex-start",
  gap: 8,
};

export const sipSettingsLabelStyle = {
  fontSize: 13,
  fontWeight: 600,
  color: C.labelText,
  width: "100%",
  lineHeight: 1.4,
  whiteSpace: "normal",
  overflowWrap: "break-word",
  wordBreak: "break-word",
};

export const sipSettingsChooseFileBtnStyle = {
  ...sipSettingsCancelBtnStyle,
  minWidth: "auto",
};

export const sipSettingsFilePickerActionsStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-start",
  flexWrap: "wrap",
  gap: 8,
  width: "100%",
  minWidth: 0,
};

export const sipSettingsFileNameStyle = {
  fontSize: 12,
  color: C.mutedText,
  minWidth: 0,
  flex: 1,
  maxWidth: "100%",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
};

export function SipSettingsFilePicker({
  label,
  accept,
  file,
  disabled,
  onChange,
  isCompact,
  labelColWidth = SIP_SETTINGS_LABEL_WIDTH,
  tooltipKey,
}) {
  const inputRef = useRef(null);

  useEffect(() => {
    if (!file && inputRef.current) {
      inputRef.current.value = "";
    }
  }, [file]);

  const fileName = file?.name || SIP_SETTINGS_NO_FILE_CHOSEN;

  return (
    <div style={sipSettingsFieldRowStyle(isCompact)}>
      <SipSettingsFieldLabel
        tooltipKey={tooltipKey}
        isCompact={isCompact}
        labelColWidth={labelColWidth}
      >
        {label}
      </SipSettingsFieldLabel>
      <div style={isCompact ? { width: "100%" } : sipSettingsValueColStyle}>
        <div style={sipSettingsFieldControlStyle}>
          <div style={sipSettingsFilePickerActionsStyle}>
            <input
              ref={inputRef}
              type="file"
              accept={accept}
              disabled={disabled}
              onChange={(e) => onChange(e.target.files?.[0] || null)}
              style={{ display: "none" }}
            />
            <Btn
              type="button"
              variant="cancel"
              disabled={disabled}
              onClick={() => inputRef.current?.click()}
              style={sipSettingsChooseFileBtnStyle}
            >
              {SIP_SETTINGS_BTN_CHOOSE_FILE}
            </Btn>
            <span style={sipSettingsFileNameStyle} title={fileName}>
              {fileName}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export const sipSettingsCertUploadActionsStyle = {
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "flex-start",
  flexWrap: "wrap",
  gap: 8,
  width: "max-content",
  maxWidth: "100%",
};

export const sipSettingsModalFooterStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 12,
  width: "100%",
  margin: 0,
  padding: "16px 24px",
  boxSizing: "border-box",
  background: "#f8fafc",
  borderTop: `1px solid ${C.cardBorder}`,
  borderBottomLeftRadius: 4,
  borderBottomRightRadius: 4,
};

export function SipSettingsSectionHeading({
  title,
  isFirst = false,
  titleLeft,
}) {
  const isLaptopNarrow = useMediaQuery(SIP_SETTINGS_LAPTOP_NARROW_MQ);
  const resolvedTitleLeft =
    titleLeft !== undefined
      ? titleLeft
      : isLaptopNarrow
        ? 0
        : SIP_SETTINGS_SECTION_HEADING_LEFT;
  return (
    <div
      style={{
        margin: isFirst
          ? isLaptopNarrow
            ? "20px 0 24px 0"
            : SIP_SETTINGS_SECTION_HEADING_FIRST_MARGIN
          : SIP_SETTINGS_SECTION_HEADING_NEXT_MARGIN,
        position: "relative",
        width: "100%",
      }}
    >
      <div style={{ borderTop: `1px solid ${C.divider}` }} />
      <span
        style={{
          position: "absolute",
          top: -10,
          left: resolvedTitleLeft,
          background: C.cardBg,
          paddingRight: 8,
          fontSize: 14,
          fontWeight: 600,
          color: SIP_SETTINGS_SECTION_HEADING_COLOR,
        }}
      >
        {title}
      </span>
    </div>
  );
}

export function SipSettingsFieldLabel({
  tooltipKey,
  fieldTooltips = SIP_SETTINGS_FIELD_TOOLTIPS,
  children,
  style,
  isCompact = false,
  labelColWidth = SIP_SETTINGS_LABEL_WIDTH,
}) {
  const label = (
    <span
      style={{
        ...sipSettingsLabelStyle,
        ...style,
        cursor: tooltipKey ? "help" : "default",
      }}
    >
      {children}
    </span>
  );
  const wrapped = (
    <div style={isCompact ? { width: "100%" } : sipSettingsLabelWrapStyle(labelColWidth)}>
      {tooltipKey && fieldTooltips[tooltipKey] ? (
        <Tooltip title={fieldTooltips[tooltipKey]} {...SIP_SETTINGS_TOOLTIP_PROPS}>
          {label}
        </Tooltip>
      ) : (
        label
      )}
    </div>
  );
  return wrapped;
}

export function SipSettingsFieldRow({
  label,
  tooltipKey,
  fieldTooltips = SIP_SETTINGS_FIELD_TOOLTIPS,
  isCompact = false,
  labelColWidth = SIP_SETTINGS_LABEL_WIDTH,
  wideControl = false,
  children,
}) {
  return (
    <div style={sipSettingsFieldRowStyle(isCompact)}>
      {label ? (
        <SipSettingsFieldLabel
          tooltipKey={tooltipKey}
          fieldTooltips={fieldTooltips}
          isCompact={isCompact}
          labelColWidth={labelColWidth}
        >
          {label}
        </SipSettingsFieldLabel>
      ) : (
        <div
          style={
            isCompact ? { width: "100%", display: "none" } : sipSettingsLabelWrapStyle(labelColWidth)
          }
          aria-hidden
        />
      )}
      <div
        style={
          isCompact
            ? { width: "100%" }
            : wideControl
              ? {
                  ...sipSettingsValueColStyle,
                  alignItems: "flex-start",
                  minWidth: 0,
                }
              : sipSettingsValueColStyle
        }
      >
        <div
          style={
            wideControl
              ? {
                  ...sipSettingsFieldControlStyle,
                  width: "auto",
                  minWidth: SIP_SETTINGS_CONTROL_WIDTH,
                  maxWidth: "100%",
                }
              : sipSettingsFieldControlStyle
          }
        >
          {children}
        </div>
      </div>
    </div>
  );
}

export function SipSettingsSectionEnableRow({
  label,
  tooltipKey,
  checked,
  onChange,
  isCompact,
  labelColWidth = SIP_SETTINGS_LABEL_WIDTH,
}) {
  return (
    <SipSettingsFieldRow
      label={label}
      tooltipKey={tooltipKey}
      isCompact={isCompact}
      labelColWidth={labelColWidth}
    >
      <Checkbox
        size="small"
        checked={checked}
        onChange={onChange}
        sx={sipSettingsCheckboxSx}
      />
    </SipSettingsFieldRow>
  );
}

const sipSettingsCurrentCertPanelStyle = {
  marginTop: 12,
  width: "100%",
  maxWidth: 420,
  marginLeft: "auto",
  padding: "14px 16px",
  background: "#f8fafc",
  border: `1px solid ${C.cardBorder}`,
  borderRadius: 6,
  boxSizing: "border-box",
};

const sipSettingsCurrentCertTitleStyle = {
  fontSize: 13,
  fontWeight: 700,
  letterSpacing: "0.02em",
  color: C.labelText,
  marginBottom: 12,
};

const sipSettingsCurrentCertRowStyle = {
  display: "flex",
  gap: 12,
  marginBottom: 8,
  fontSize: 12,
  lineHeight: 1.45,
};

const sipSettingsCurrentCertLabelStyle = {
  flex: "0 0 52px",
  fontWeight: 600,
  color: C.labelText,
};

export function SipSettingsCurrentCertificate({ view }) {
  if (!view) return null;

  if (view.empty) {
    return (
      <div style={sipSettingsCurrentCertPanelStyle}>
        <div style={{ fontSize: 12, color: C.mutedText, lineHeight: 1.45 }}>
          {view.message}
        </div>
      </div>
    );
  }

  const validRange =
    view.validFrom && view.validTo
      ? `${view.validFrom}  →  ${view.validTo}`
      : view.validFrom || view.validTo || null;

  return (
    <div style={sipSettingsCurrentCertPanelStyle}>
      <div style={sipSettingsCurrentCertTitleStyle}>
        {SIP_SETTINGS_CURRENT_CERT_TITLE}
      </div>
      {view.warning ? (
        <div
          style={{
            fontSize: 12,
            color: C.errorRed,
            lineHeight: 1.45,
            marginBottom: 12,
          }}
        >
          {view.warning}
        </div>
      ) : null}
      {view.subject ? (
        <div style={sipSettingsCurrentCertRowStyle}>
          <span style={sipSettingsCurrentCertLabelStyle}>
            {SIP_SETTINGS_CURRENT_CERT_SUBJECT}
          </span>
          <span style={{ color: C.valueText, flex: 1, minWidth: 0 }}>
            {view.subject}
          </span>
        </div>
      ) : null}
      {validRange ? (
        <div style={sipSettingsCurrentCertRowStyle}>
          <span style={sipSettingsCurrentCertLabelStyle}>
            {SIP_SETTINGS_CURRENT_CERT_VALID}
          </span>
          <span style={{ color: C.valueText, flex: 1 }}>{validRange}</span>
        </div>
      ) : null}
      {view.covers?.length ? (
        <div style={{ ...sipSettingsCurrentCertRowStyle, marginBottom: 0 }}>
          <span style={sipSettingsCurrentCertLabelStyle}>
            {SIP_SETTINGS_CURRENT_CERT_COVERS}
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            {view.covers.map((cover, idx) => (
              <div
                key={`${cover.label}-${idx}`}
                style={{
                  color: C.valueText,
                  marginBottom: idx < view.covers.length - 1 ? 4 : 0,
                }}
              >
                <span style={{ color: C.successGreen, marginRight: 6 }}>●</span>
                {cover.label}
                {cover.isVirtualIp ? (
                  <span style={{ color: C.mutedText }}>
                    {" "}
                    ({SIP_SETTINGS_CURRENT_CERT_VIRTUAL_IP})
                  </span>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
