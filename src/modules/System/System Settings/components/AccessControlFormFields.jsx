import React from "react";
import { Tooltip } from "@mui/material";
import EditDocumentIcon from "@mui/icons-material/EditDocument";
import {
  ACCESS_CONTROL_PAGE_BREADCRUMB_ROOT,
  ACCESS_CONTROL_PAGE_BREADCRUMB_SECTION,
  ACCESS_CONTROL_PAGE_TITLE,
  ACCESS_CONTROL_EMPTY_MESSAGE,
  ACCESS_CONTROL_EMPTY_BTN,
  ACCESS_CONTROL_FIELD_TOOLTIPS,
} from "../../../../constants/AccessControlConstants";
import {
  C,
  OUTLINED_BORDER,
  OUTLINED_HOVER,
  OUTLINED_FOCUS,
  FOCUS_RING_SHADOW,
} from "../../../../theme/pbxTokens";
import {
  Btn,
  ExtensionBreadcrumb as AccessControlPageBreadcrumb,
} from "../../../../components/common";
import {
  CARD_RADIUS,
  FIELD_RADIUS,
  accessControlPageWrapStyle,
  accessControlPageInnerStyle,
  accessControlCardStyle,
  accessControlToolbarStyle,
  accessControlFixedAlertSx,
  accessControlCancelBtnStyle,
  accessControlPrimaryBtnStyle,
  addNewModalFooterBtnStyle,
  accessControlSelectedBadgeStyle,
  accessControlModalCancelBtnStyle,
} from "./AccessControlTableHelpers";

export const ACCESS_CONTROL_SCROLL_CLASS = "access-control-scroll";

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

const nativeFieldInputStyle = {
  height: 32,
  width: 200,
  padding: "0 10px",
  fontSize: 13,
  border: `1px solid ${OUTLINED_BORDER}`,
  borderRadius: FIELD_RADIUS,
  outline: "none",
  backgroundColor: "#fff",
  color: C.valueText,
  boxSizing: "border-box",
  boxShadow: "none",
  transition: "border-color 0.2s ease, box-shadow 0.2s ease",
};

export const inputInteraction = {
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

const { height: _nativeHeight, ...nativeFieldBase } = nativeFieldInputStyle;

export const systemModalFieldInputStyle = {
  ...nativeFieldBase,
  minHeight: 32,
  height: 32,
  width: "100%",
  padding: "0 10px",
  lineHeight: 1.35,
  color: C.valueText,
  borderRadius: FIELD_RADIUS,
};

export const disabledInputStyle = {
  ...systemModalFieldInputStyle,
  background: "#f1f5f9",
  color: "#94a3b8",
  cursor: "not-allowed",
  borderColor: "#e2e8f0",
};

export const accessControlTableContainerStyle = {
  ...accessControlCardStyle,
  width: "100%",
  maxWidth: "100%",
  margin: 0,
  display: "flex",
  flexDirection: "column",
  overflow: "hidden",
  boxSizing: "border-box",
};

export {
  accessControlToolbarStyle,
  accessControlFixedAlertSx,
  accessControlCancelBtnStyle,
  accessControlPrimaryBtnStyle,
  addNewModalFooterBtnStyle,
  accessControlSelectedBadgeStyle,
  accessControlModalCancelBtnStyle,
};

export const accessControlFooterStyle = {
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

/** Modal footer aligns with shared 4px dialog radius. */
export const accessControlModalFooterStyle = {
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

export const accessControlLogSectionStyle = {
  width: "100%",
  maxWidth: "100%",
  marginTop: 16,
  display: "flex",
  flexDirection: "column",
  alignItems: "stretch",
};

export const accessControlLogTitleStyle = {
  fontSize: 15,
  fontWeight: 600,
  color: C.labelText,
  marginTop: 10,
  marginBottom: 8,
  textAlign: "center",
  letterSpacing: "0.01em",
};

export const accessControlLogBoxStyle = {
  width: "100%",
  background: C.cardBg,
  border: `1px solid ${C.cardBorder}`,
  borderRadius: CARD_RADIUS,
  boxShadow: "0 0 14px rgba(0, 0, 0, 0.18), 0 0 5px rgba(0, 0, 0, 0.10)",
  overflowY: "auto",
  padding: 12,
  resize: "vertical",
  minHeight: 140,
  maxHeight: 320,
  boxSizing: "border-box",
};

export const accessControlLogPreStyle = {
  width: "100%",
  minHeight: 120,
  maxHeight: 260,
  background: C.cardBg,
  color: C.valueText,
  fontSize: 11,
  fontFamily:
    "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
  whiteSpace: "pre-wrap",
  margin: 0,
  padding: 0,
};

export const accessControlLogNotesStyle = {
  marginTop: 8,
  fontSize: 11,
  textAlign: "center",
  color: C.accent,
  lineHeight: 1.5,
};

export const ACCESS_CONTROL_FIELD_TOOLTIP_PROPS = {
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

export const AccessControlFieldLabel = ({ tooltipKey, children, style = {} }) => {
  const tooltip = ACCESS_CONTROL_FIELD_TOOLTIPS[tooltipKey] || "";
  const labelNode = (
    <label
      style={{
        fontSize: 13,
        fontWeight: 600,
        color: C.labelText,
        width: 130,
        flexShrink: 0,
        textAlign: "left",
        whiteSpace: "nowrap",
        cursor: tooltip ? "help" : undefined,
        display: "block",
        ...style,
      }}
    >
      {children}
    </label>
  );
  if (!tooltip) return labelNode;
  return (
    <Tooltip title={tooltip} {...ACCESS_CONTROL_FIELD_TOOLTIP_PROPS}>
      {labelNode}
    </Tooltip>
  );
};

const AccessControlScrollbarStyles = () => (
  <style>{`
    .${ACCESS_CONTROL_SCROLL_CLASS} {
      scroll-behavior: smooth;
      scrollbar-gutter: stable;
      scrollbar-width: thin;
      scrollbar-color: rgba(100, 116, 139, 0.45) transparent;
    }
    .${ACCESS_CONTROL_SCROLL_CLASS}::-webkit-scrollbar {
      width: 8px;
      height: 8px;
      transition: width 0.2s ease, height 0.2s ease;
    }
    .${ACCESS_CONTROL_SCROLL_CLASS}::-webkit-scrollbar:hover {
      width: 11px;
      height: 11px;
    }
    .${ACCESS_CONTROL_SCROLL_CLASS}::-webkit-scrollbar-corner {
      background: transparent;
    }
    .${ACCESS_CONTROL_SCROLL_CLASS}::-webkit-scrollbar-track {
      background: transparent;
    }
    .${ACCESS_CONTROL_SCROLL_CLASS}::-webkit-scrollbar-thumb {
      background-color: rgba(100, 116, 139, 0.45);
      border-radius: 6px;
      border: 2px solid transparent;
      background-clip: padding-box;
      transition: background-color 0.2s ease;
    }
    .${ACCESS_CONTROL_SCROLL_CLASS}::-webkit-scrollbar-thumb:hover {
      background-color: rgba(71, 85, 105, 0.65);
    }
  `}</style>
);

export const AccessControlPageShell = ({ children }) => (
  <>
    <AccessControlScrollbarStyles />
    <div
      className={ACCESS_CONTROL_SCROLL_CLASS}
      style={accessControlPageWrapStyle}
      data-native-scroll
    >
      <div style={accessControlPageInnerStyle}>{children}</div>
    </div>
  </>
);

export const AccessControlBreadcrumb = () => (
  <AccessControlPageBreadcrumb
    root={ACCESS_CONTROL_PAGE_BREADCRUMB_ROOT}
    section={ACCESS_CONTROL_PAGE_BREADCRUMB_SECTION}
    current={ACCESS_CONTROL_PAGE_TITLE}
  />
);

export const AccessControlTableEmptyState = ({ onAddNew, disabled }) => (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      minHeight: 240,
      padding: 24,
      textAlign: "center",
    }}
  >
    <div
      style={{
        color: "#3E5475",
        fontSize: 13,
        fontWeight: 600,
        marginBottom: 16,
      }}
    >
      {ACCESS_CONTROL_EMPTY_MESSAGE}
    </div>
    <Btn
      variant="cancel"
      onClick={onAddNew}
      disabled={disabled}
      style={{ padding: "8px 24px", fontSize: 12, borderRadius: 4 }}
    >
      {ACCESS_CONTROL_EMPTY_BTN}
    </Btn>
  </div>
);

/** Same as shared ExtensionEditIcon plus pointerEvents when disabled. */
export const AccessControlEditIcon = ({ disabled, onClick }) => (
  <EditDocumentIcon
    titleAccess="Edit"
    onClick={() => {
      if (!disabled) onClick();
    }}
    style={{
      cursor: disabled ? "not-allowed" : "pointer",
      color: "#2563eb",
      fontSize: 22,
      opacity: disabled ? 0.4 : 0.7,
      transition: "opacity 0.15s ease",
      pointerEvents: disabled ? "none" : "auto",
    }}
    onMouseEnter={(e) => {
      if (!disabled) e.currentTarget.style.opacity = "1";
    }}
    onMouseLeave={(e) => {
      if (!disabled) e.currentTarget.style.opacity = "0.7";
    }}
  />
);
