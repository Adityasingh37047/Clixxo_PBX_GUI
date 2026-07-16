import React from "react";
import { CircularProgress, Tooltip } from "@mui/material";
import {
  AUTH_BREADCRUMB_ROOT,
  AUTH_BREADCRUMB_SECTION,
  AUTH_PAGE_TITLE,
  AUTH_CARD_TITLE,
  AUTH_LICENSE_NOTE,
  AUTH_TOOLTIPS,
} from "../../../../constants/AuthorizationConstants";
import { C } from "../../../../theme/pbxTokens";
import { ExtensionBreadcrumb } from "../../../../components/common";
import {
  CARD_RADIUS,
  authorizationPageWrapStyle,
  authorizationPageInnerStyle,
  authorizationCardStyle,
  authorizationToolbarStyle,
  authorizationFixedAlertSx,
  authorizationFooterBtnStyle,
} from "./AuthorizationTableHelpers";

export const AUTH_COMPACT_MQ = "(max-width: 768px)";
export const AUTH_FORM_MAX_WIDTH = 720;
export const AUTH_FORM_HORIZONTAL_PADDING = 24;
export const AUTH_FIELD_LABEL_WIDTH = 260;
export const AUTH_CONTROL_COL_WIDTH = 220;
export const AUTH_FIELD_MIDDLE_GAP = 24;

export {
  authorizationFixedAlertSx,
  authorizationFooterBtnStyle,
  authorizationCardStyle,
};

const AUTH_TOOLTIP_PROPS = {
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

const AUTH_READ_ONLY_BORDER = "#d1d5db";

const authReadOnlyInputStyle = (isCompact) => ({
  height: 32,
  width: isCompact ? "100%" : AUTH_CONTROL_COL_WIDTH,
  minWidth: 0,
  maxWidth: "100%",
  padding: "0 10px",
  fontSize: 13,
  border: `1px solid ${AUTH_READ_ONLY_BORDER}`,
  borderRadius: 6,
  outline: "none",
  backgroundColor: "#f8fafc",
  color: C.valueText,
  boxSizing: "border-box",
  textAlign: "center",
  cursor: "default",
  userSelect: "text",
});

export const authorizationHeaderStyle = {
  ...authorizationToolbarStyle,
  justifyContent: "flex-start",
  fontWeight: 700,
  fontSize: 13,
  color: C.labelText,
};

export const authorizationFooterStyle = {
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

export const authorizationFormBodyStyle = {
  width: "100%",
  maxWidth: AUTH_FORM_MAX_WIDTH,
  margin: "0 auto",
  padding: `0 ${AUTH_FORM_HORIZONTAL_PADDING}px`,
  boxSizing: "border-box",
};

export const AuthorizationPageShell = ({ children, isCompact }) => (
  <div
    style={{
      ...authorizationPageWrapStyle,
      ...(isCompact ? { padding: 8 } : {}),
    }}
    data-native-scroll
  >
    <div style={authorizationPageInnerStyle}>{children}</div>
  </div>
);

export const AuthorizationBreadcrumb = () => (
  <ExtensionBreadcrumb
    root={AUTH_BREADCRUMB_ROOT}
    section={AUTH_BREADCRUMB_SECTION}
    current={AUTH_PAGE_TITLE}
  />
);

export const AuthorizationFieldRow = ({
  label,
  tooltip,
  loading,
  value,
  isStatus,
  statusColor,
  isCompact,
}) => {
  const stacked = isCompact;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: stacked ? "column" : "row",
        alignItems: stacked ? "stretch" : "center",
        justifyContent: "flex-start",
        padding: "8px 0",
        gap: stacked ? 8 : AUTH_FIELD_MIDDLE_GAP,
        width: "100%",
      }}
    >
      <Tooltip title={tooltip || ""} {...AUTH_TOOLTIP_PROPS}>
        <span
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: C.labelText,
            textAlign: "left",
            width: stacked ? "100%" : "auto",
            maxWidth: stacked ? "100%" : AUTH_FIELD_LABEL_WIDTH,
            flexShrink: 0,
            lineHeight: 1.4,
            cursor: "help",
          }}
        >
          {label}
        </span>
      </Tooltip>

      <div
        style={{
          minWidth: 0,
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-start",
          gap: 8,
          width: stacked ? "100%" : AUTH_CONTROL_COL_WIDTH,
          marginLeft: stacked ? 0 : "auto",
        }}
      >
        <input
          type="text"
          value={value}
          readOnly
          tabIndex={-1}
          aria-readonly="true"
          onFocus={(e) => e.target.blur()}
          style={{
            ...authReadOnlyInputStyle(isCompact),
            fontWeight: isStatus ? 700 : 500,
            color: isStatus ? statusColor : C.valueText,
          }}
        />
        {loading && <CircularProgress size={16} sx={{ flexShrink: 0 }} />}
      </div>
    </div>
  );
};

export const AuthorizationCard = ({ children, footer, isCompact }) => (
  <div style={authorizationCardStyle}>
    <div style={authorizationHeaderStyle}>
      <span>{AUTH_CARD_TITLE}</span>
    </div>
    <div style={{ padding: "12px 0 0", boxSizing: "border-box" }}>
      <div style={{ ...authorizationFormBodyStyle, paddingBottom: 16 }}>
        {children}
      </div>
    </div>
    <div
      style={{
        ...authorizationFooterStyle,
        ...(isCompact ? { padding: "10px 12px" } : {}),
      }}
    >
      {footer}
    </div>
  </div>
);

export const AuthorizationLicenseNote = ({ isCompact }) => (
  <div
    style={{
      marginTop: 16,
      textAlign: "center",
      fontSize: 12,
      color: C.accent,
      width: "100%",
      lineHeight: 1.5,
      padding: isCompact ? "0 4px" : 0,
      boxSizing: "border-box",
    }}
  >
    {AUTH_LICENSE_NOTE}
  </div>
);

export { AUTH_TOOLTIPS };
