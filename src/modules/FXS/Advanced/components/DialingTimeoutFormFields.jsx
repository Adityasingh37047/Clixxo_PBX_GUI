import React from "react";
import { DIALING_TIMEOUT_FIELD_TOOLTIPS, DIALING_TIMEOUT_PAGE_BREADCRUMB_SECTION, DIALING_TIMEOUT_PAGE_TITLE } from "../../../../constants/DialingTimeoutConstants";
import { Tooltip } from "@mui/material";

import { OUTLINED_BORDER, OUTLINED_FOCUS, OUTLINED_HOVER, FOCUS_RING_SHADOW, C } from "../../../../theme/pbxTokens";
import { Btn, TH, ExtensionBreadcrumb as FxsChromeBreadcrumb, addNewModalFooterStyle as fxsAddNewModalFooterStyle, addNewModalFooterBtnStyle as fxsAddNewModalFooterBtnStyle, addNewModalFooterCancelBtnStyle as fxsAddNewModalFooterCancelBtnStyle } from "../../../../components/common";
export const fxsModalTitleStyle = {
  background: "#1e2d42",
  color: "#ffffff",
  fontWeight: 600,
  fontSize: 16,
  padding: "16px 24px",
  textAlign: "center",
  borderTopLeftRadius: 4,
  borderTopRightRadius: 4,
  flexShrink: 0,
};

export const fxsModalBackdropSlotProps = {
  backdrop: { sx: { backgroundColor: "rgba(0, 0, 0, 0.5)" } },
};

export const fxsModalDialogContentSx = {
  maxHeight: "calc(100vh - 220px)",
  overflowY: "auto",
  WebkitOverflowScrolling: "touch",
};

export const fxsDialogSx = {
  "& .MuiDialog-container": {
    alignItems: "center",
    justifyContent: "center",
  },
};

const FXS_DIALOG_MARGIN = 24;
const FXS_DIALOG_LAYOUT_OFFSET = 80;

export const createFxsDialogPaperSx = (width = 500) => ({
  margin: FXS_DIALOG_MARGIN,
  maxHeight: `calc(100vh - ${FXS_DIALOG_LAYOUT_OFFSET}px - ${FXS_DIALOG_MARGIN * 2}px)`,
  display: "flex",
  flexDirection: "column",
  width,
  maxWidth: "95vw",
  p: 0,
  borderRadius: "4px",
  overflow: "hidden",
  boxShadow:
    "0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)",
});

import {
  dialingTimeoutPageInnerStyle,
  dialingTimeoutPageWrapStyle,
} from "./DialingTimeoutTableHelpers";

export const FIELD_LABEL_COLOR = "#3E5475";

export const FIELD_TOOLTIP_PROPS = {
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
        textTransform: "none",
        letterSpacing: "normal",
      },
    },
    arrow: { sx: { color: "#fff" } },
  },
};

export const formatFieldTooltipTitle = (text) => {
  if (!text) return "";
  const normalized = text.replace(/<br\s*\/?>/gi, "\n").replace(/&quot;/g, '"');
  if (normalized.includes("\n")) {
    return (
      <span style={{ whiteSpace: "pre-line", display: "block" }}>
        {normalized}
      </span>
    );
  }
  return normalized;
};

export const FxsFieldLabel = ({ tooltipKey, tooltips, children, style = {} }) => {
  const tooltip = tooltipKey ? tooltips[tooltipKey] || "" : "";
  const labelNode = (
    <span
      style={{
        fontSize: 13,
        fontWeight: 600,
        color: FIELD_LABEL_COLOR,
        cursor: tooltip ? "help" : undefined,
        ...style,
      }}
    >
      {children}
    </span>
  );
  if (!tooltip) return labelNode;
  return (
    <Tooltip title={formatFieldTooltipTitle(tooltip)} {...FIELD_TOOLTIP_PROPS}>
      {labelNode}
    </Tooltip>
  );
};

export const DialingTimeoutFieldRow = ({
  label,
  children,
  required,
  align = "center",
  labelWidth = 170,
  tooltipKey,
}) => (
  <div
    style={{
      display: "flex",
      alignItems: align,
      justifyContent: "center",
      gap: 12,
      minHeight: align === "flex-start" ? undefined : 32,
    }}
  >
    <label
      style={{
        fontSize: 13,
        fontWeight: 600,
        color: C.labelText,
        width: labelWidth,
        flexShrink: 0,
        textAlign: "left",
        paddingTop: align === "flex-start" ? 8 : 0,
      }}
    >
      <FxsFieldLabel
        tooltipKey={tooltipKey}
        tooltips={DIALING_TIMEOUT_FIELD_TOOLTIPS}
      >
        {label}
      </FxsFieldLabel>
      {required && <span style={{ color: "#dc2626" }}> *</span>}
    </label>
    <div style={{ width: "min(100%, 320px)" }}>{children}</div>
  </div>
);

export const DialingTimeoutBreadcrumb = () => (
  <FxsChromeBreadcrumb
    section={DIALING_TIMEOUT_PAGE_BREADCRUMB_SECTION}
    current={DIALING_TIMEOUT_PAGE_TITLE}
  />
);

export const DialingTimeoutPageShell = ({ children }) => (
  <div style={dialingTimeoutPageWrapStyle}>
    <div style={dialingTimeoutPageInnerStyle}>{children}</div>
  </div>
);

export const DIALING_TIMEOUT_FIELD_LABEL_WIDTH = 220;

export const DIALING_TIMEOUT_ADD_NEW_DIALOG_SX = fxsDialogSx;
export const DIALING_TIMEOUT_ADD_NEW_DIALOG_PAPER_SX =
  createFxsDialogPaperSx(500);
export const dialingTimeoutAdvancedModalTitleStyle = fxsModalTitleStyle;
export const dialingTimeoutAddNewModalBackdropSlotProps =
  fxsModalBackdropSlotProps;
export const dialingTimeoutAddNewModalDialogContentSx =
  fxsModalDialogContentSx;
export const dialingTimeoutAddNewModalFooterStyle = fxsAddNewModalFooterStyle;
export const dialingTimeoutAddNewModalFooterBtnStyle =
  fxsAddNewModalFooterBtnStyle;
export const dialingTimeoutAddNewModalFooterCancelBtnStyle =
  fxsAddNewModalFooterCancelBtnStyle;

export const dialingTimeoutAddHostFormPanelStyle = {
  display: "flex",
  flexDirection: "column",
  gap: 14,
  background: "#f8fafc",
  border: `1px solid ${C.cardBorder}`,
  borderRadius: 4,
  padding: 20,
};

export const dialingTimeoutModalDialogContentStyle = {
  padding: "24px",
  backgroundColor: "#ffffff",
  flex: "1 1 auto",
};

export const muiTextFieldSx = {
  "& .MuiOutlinedInput-root": {
    backgroundColor: "#fff",
    borderRadius: 4,
    "& fieldset": {
      borderColor: OUTLINED_BORDER,
      transition: "border-color 0.2s ease",
    },
    "&:hover fieldset": {
      borderColor: OUTLINED_HOVER,
    },
    "&.Mui-focused fieldset": {
      borderColor: OUTLINED_FOCUS,
      borderWidth: 1,
      boxShadow: FOCUS_RING_SHADOW,
    },
    "&.Mui-focused:hover fieldset": {
      borderColor: OUTLINED_FOCUS,
      borderWidth: 1,
      boxShadow: FOCUS_RING_SHADOW,
    },
  },
};

export const dialingTimeoutTextFieldSx = {
  ...muiTextFieldSx,
  "& .MuiOutlinedInput-root": {
    ...muiTextFieldSx["& .MuiOutlinedInput-root"],
    height: 32,
  },
};

export const dialingTimeoutInputProps = {
  style: {
    fontSize: 13,
    height: 32,
    padding: "0 8px",
    boxSizing: "border-box",
  },
};
