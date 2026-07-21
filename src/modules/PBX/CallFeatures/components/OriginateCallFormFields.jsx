import React from "react";
import { Tooltip } from "@mui/material";
import {
  C,
  FOCUS_RING_SHADOW,
  OUTLINED_BORDER,
  OUTLINED_FOCUS,
  OUTLINED_HOVER,
} from "../../../../theme/pbxTokens";
import { ORIGINATE_CALL_FIELD_TOOLTIPS } from "../../../../constants/OriginateCallConstants";
import { extensionTableCheckboxSx as originateCallFormCheckboxSx } from "../../../../components/common";

export { originateCallFormCheckboxSx };

export const ORIGINATE_CALL_CARD_RADIUS = 4;

export const originateCallFormContentStyle = {
  width: "100%",
  maxWidth: 640,
  margin: "0 auto",
  boxSizing: "border-box",
};

export const originateCallFormRowStyle = {
  display: "flex",
  flexDirection: "row",
  alignItems: "flex-start",
  width: "100%",
};

export const originateCallLabelColStyle = {
  fontSize: 13,
  fontWeight: 600,
  color: C.labelText,
  flex: "0 0 48%",
  maxWidth: "48%",
  paddingRight: 24,
  textAlign: "left",
  lineHeight: 1.35,
};

export const originateCallValueColStyle = {
  flex: "1 1 52%",
  minWidth: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
};

export const originateCallControlSlotStyle = {
  width: 220,
  flexShrink: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-start",
};

export const originateCallControlSlotWideStyle = {
  ...originateCallControlSlotStyle,
  width: 280,
};

export const originateCallHeaderStyle = {
  width: "100%",
  minHeight: 44,
  background: C.cardBg,
  borderTopLeftRadius: ORIGINATE_CALL_CARD_RADIUS,
  borderTopRightRadius: ORIGINATE_CALL_CARD_RADIUS,
  display: "flex",
  alignItems: "center",
  padding: "7px 14px",
  fontWeight: 700,
  fontSize: 13,
  color: C.labelText,
  borderBottom: `1px solid ${C.divider}`,
};

const ORIGINATE_CALL_FIELD_HEIGHT = 36;

export const originateCallFormInputStyle = {
  padding: "7px 10px",
  borderRadius: 6,
  border: `1px solid ${OUTLINED_BORDER}`,
  fontSize: 13,
  width: "100%",
  backgroundColor: "#ffffff",
  outline: "none",
  color: C.valueText,
  transition: "border-color 0.2s ease, box-shadow 0.2s ease",
  boxSizing: "border-box",
  boxShadow: "none",
  height: ORIGINATE_CALL_FIELD_HEIGHT,
  minHeight: ORIGINATE_CALL_FIELD_HEIGHT,
  lineHeight: 1.35,
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
    if (document.activeElement === e.target) setFieldFocus(e.target);
    else setFieldHover(e.target);
  },
  onMouseLeave: (e) => {
    if (document.activeElement === e.target) setFieldFocus(e.target);
    else setFieldDefault(e.target);
  },
};

export const originateCallFormInputInteraction = {
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

const originateCallOutlinedInputRootSx = {
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

export const originateCallFormSelectSx = {
  fontSize: 13,
  backgroundColor: "#fff",
  width: "100%",
  minHeight: ORIGINATE_CALL_FIELD_HEIGHT,
  height: ORIGINATE_CALL_FIELD_HEIGHT,
  ...originateCallOutlinedInputRootSx,
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
    backgroundColor: "#fff",
  },
};

export const originateCallFormNoteStyle = {
  fontSize: 12,
  color: C.mutedText,
  margin: "0 auto 16px",
  padding: "0 32px",
  textAlign: "center",
  width: "100%",
  maxWidth: "100%",
  lineHeight: 1.5,
  boxSizing: "border-box",
};

export const originateCallFormFooterStyle = {
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  justifyContent: "center",
  gap: 12,
  width: "100%",
  padding: "10px 28px",
  borderTop: `1px solid ${C.divider}`,
  background: "#f8fafc",
  boxSizing: "border-box",
  borderBottomLeftRadius: ORIGINATE_CALL_CARD_RADIUS,
  borderBottomRightRadius: ORIGINATE_CALL_CARD_RADIUS,
};

export const originateCallFormBtnStyle = {
  height: 30,
  padding: "6px 14px",
  fontSize: 12,
  borderRadius: 4,
  minWidth: 100,
};

export const originateCallRadioSx = {
  p: 0.5,
  color: C.labelText,
  "&.Mui-checked": { color: C.accent },
};

export const originateCallFieldInputStyle = {
  ...originateCallFormInputStyle,
  width: "100%",
  maxWidth: "100%",
};

const ORIGINATE_CALL_TOOLTIP_PROPS = {
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
      },
    },
    arrow: {
      sx: { color: "#fff" },
    },
  },
};

export const OriginateCallFieldRow = ({
  label,
  tooltipKey,
  required = false,
  children,
  align = "center",
  wide = false,
  hideLabel = false,
}) => (
  <div
    style={{
      ...originateCallFormRowStyle,
      alignItems: align === "flex-start" ? "flex-start" : "center",
    }}
  >
    {hideLabel ? (
      <span style={originateCallLabelColStyle} aria-hidden="true" />
    ) : (
      <Tooltip
        title={ORIGINATE_CALL_FIELD_TOOLTIPS[tooltipKey] || ""}
        {...ORIGINATE_CALL_TOOLTIP_PROPS}
      >
        <label
          style={{
            ...originateCallLabelColStyle,
            cursor: tooltipKey ? "help" : "default",
          }}
        >
          {label}
          {required ? <span style={{ color: C.amber }}> *</span> : null}
        </label>
      </Tooltip>
    )}
    <div style={originateCallValueColStyle}>
      <div
        style={
          wide
            ? originateCallControlSlotWideStyle
            : originateCallControlSlotStyle
        }
      >
        {children}
      </div>
    </div>
  </div>
);

export const OriginateCallFixedAppLabel = ({ htmlFor, children }) => (
  <Tooltip
    title={ORIGINATE_CALL_FIELD_TOOLTIPS.useFixedApp || ""}
    {...ORIGINATE_CALL_TOOLTIP_PROPS}
  >
    <label
      htmlFor={htmlFor}
      style={{
        fontSize: 13,
        color: C.labelText,
        cursor: "help",
        fontWeight: 500,
      }}
    >
      {children}
    </label>
  </Tooltip>
);
