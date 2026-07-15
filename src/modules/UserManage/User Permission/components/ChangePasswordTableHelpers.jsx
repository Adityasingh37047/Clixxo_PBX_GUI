import React from "react";
import {
  EXTENSION_TABLE_CARD_RADIUS as CARD_RADIUS,
  extensionPageWrapStyle as changePasswordPageWrapStyle,
  extensionPageInnerStyle as changePasswordPageInnerStyle,
  extensionCardStyle as changePasswordCardStyle,
  extensionToolbarStyle,
  extensionFixedAlertSx as changePasswordFixedAlertSx,
} from "../../../../components/common";
import {
  C,
  OUTLINED_BORDER,
  OUTLINED_HOVER,
  OUTLINED_FOCUS,
} from "../../../../theme/pbxTokens";

export const FIELD_RADIUS = 6;

export const changePasswordTableContainerStyle = {
  ...changePasswordCardStyle,
  width: "100%",
  maxWidth: "100%",
  margin: 0,
  display: "flex",
  flexDirection: "column",
  boxShadow:
    "0 0 14px rgba(0, 0, 0, 0.18), 0 0 5px rgba(0, 0, 0, 0.10)",
  overflow: "hidden",
  boxSizing: "border-box",
};

export const changePasswordToolbarStyle = {
  ...extensionToolbarStyle,
};

export const changePasswordFieldGroupStyle = {
  display: "flex",
  flexDirection: "column",
  gap: 18,
  width: "100%",
};

export const changePasswordCardFooterStyle = {
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

export const changePasswordNoteStyle = {
  margin: "16px 0 0",
  textAlign: "center",
  fontSize: 12,
  color: C.accent,
  width: "100%",
  lineHeight: 1.45,
  whiteSpace: "normal",
  overflowWrap: "break-word",
};

export const changePasswordTooltipProps = {
  arrow: true,
  placement: "top",
  slotProps: {
    tooltip: {
      sx: {
        backgroundColor: "#fff",
        color: "#333",
        border: "1px solid #d1d5db",
        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
        fontSize: 13,
        maxWidth: 500,
        padding: "12px 16px",
      },
    },
    arrow: { sx: { color: "#fff" } },
  },
};

export const getChangePasswordMuiTextFieldSx = ({
  hasError = false,
  disabled = false,
  readOnlyLook = false,
} = {}) => {
  const errorColor = C.errorRed;
  const borderDefault = hasError ? errorColor : OUTLINED_BORDER;
  const borderHover =
    disabled || readOnlyLook
      ? borderDefault
      : hasError
        ? errorColor
        : OUTLINED_HOVER;
  const borderFocus = hasError ? errorColor : OUTLINED_FOCUS;

  return {
    width: "100%",
    "& .MuiOutlinedInput-root": {
      height: 34,
      fontSize: 13,
      backgroundColor: readOnlyLook ? "#f1f5f9" : "#fff",
      borderRadius: `${FIELD_RADIUS}px`,
      transition: "border-color 0.2s ease, box-shadow 0.2s ease",
      "& fieldset": {
        borderColor: borderDefault,
        transition: "border-color 0.2s ease, box-shadow 0.2s ease",
      },
      "&:hover fieldset": {
        borderColor: borderHover,
      },
      "&.Mui-focused fieldset": {
        borderColor: borderFocus,
        borderWidth: "1px",
        boxShadow: hasError
          ? `0 0 0 2px rgba(220, 38, 38, 0.15)`
          : `0 0 0 2px rgba(62, 84, 117, 0.15)`,
      },
      "&.Mui-disabled fieldset": {
        borderColor: readOnlyLook ? "#e2e8f0" : OUTLINED_BORDER,
      },
    },
    "& .MuiInputBase-input": {
      fontSize: 13,
      padding: "6px 10px",
      color: C.valueText,
      ...(readOnlyLook ? { textAlign: "center" } : {}),
    },
    "& .MuiInputBase-input.Mui-disabled": readOnlyLook
      ? {
          color: C.mutedText,
          WebkitTextFillColor: C.mutedText,
          textAlign: "center",
        }
      : {},
  };
};

export const ChangePasswordPageShell = ({ children }) => (
  <div style={changePasswordPageWrapStyle} data-native-scroll>
    <div
      style={{
        ...changePasswordPageInnerStyle,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {children}
    </div>
  </div>
);

export const changePasswordFieldLabelStyle = {
  fontSize: 12,
  fontWeight: 600,
  color: C.labelText,
  width: "100%",
  maxWidth: 220,
  flexShrink: 0,
};

export const changePasswordFieldErrorStyle = {
  color: C.errorRed,
  fontSize: 12,
  marginTop: 4,
  fontWeight: 500,
};

export const changePasswordVisibilityBtnSx = {
  color: C.mutedText,
  "&:hover": {
    color: C.accent,
    backgroundColor: "rgba(62, 84, 117, 0.06)",
  },
};

export const changePasswordCardTitleStyle = {
  fontSize: 13,
  fontWeight: 700,
  color: C.labelText,
  letterSpacing: "0.02em",
};

export {
  CARD_RADIUS,
  changePasswordPageWrapStyle,
  changePasswordPageInnerStyle,
  changePasswordFixedAlertSx,
};