import React from "react";
import { Tooltip } from "@mui/material";
import EditDocumentIcon from "@mui/icons-material/EditDocument";
import {
  SIP_ACCESS_CONTROL_PAGE_BREADCRUMB_ROOT,
  SIP_ACCESS_CONTROL_PAGE_BREADCRUMB_SECTION,
  SIP_ACCESS_CONTROL_PAGE_TITLE,
  SIP_ACCESS_CONTROL_EMPTY_MESSAGE,
  SIP_ACCESS_CONTROL_BTN_ADD_NEW,
  SIP_ACCESS_CONTROL_EDIT_TITLE_ACCESS,
  SIP_ACCESS_CONTROL_FIELD_TOOLTIPS,
} from "../../../../constants/SipAccessControlConstants";
import {
  C,
  OUTLINED_BORDER,
  OUTLINED_HOVER,
  OUTLINED_FOCUS,
  FOCUS_RING_SHADOW,
} from "../../../../theme/pbxTokens";
import { Btn, ExtensionBreadcrumb } from "../../../../components/common";
import {
  FIELD_RADIUS,
  sipAccessControlPageWrapStyle,
  sipAccessControlPageInnerStyle,
  sipAccessControlCardStyle,
  sipAccessControlToolbarStyle,
  sipAccessControlFixedAlertSx,
  sipAccessControlCancelBtnStyle,
  sipAccessControlPrimaryBtnStyle,
  addNewModalFooterBtnStyle,
  sipAccessControlSelectedBadgeStyle,
  sipAccessControlModalCancelBtnStyle,
  sipAccessControlPaginationStyle,
} from "./SipAccessControlTableHelpers";

export const SIP_ACCESS_CONTROL_SCROLL_CLASS = "sip-access-control-scroll";
export const SIP_ACCESS_CONTROL_COMPACT_MQ = "(max-width: 768px)";

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

export const systemModalFieldInputStyle = {
  minHeight: 32,
  height: 32,
  width: "100%",
  padding: "0 10px",
  fontSize: 13,
  border: `1px solid ${OUTLINED_BORDER}`,
  borderRadius: FIELD_RADIUS,
  outline: "none",
  backgroundColor: "#fff",
  color: C.valueText,
  boxSizing: "border-box",
  lineHeight: 1.35,
  transition: "border-color 0.2s ease, box-shadow 0.2s ease",
};

export const systemModalTextareaStyle = {
  ...systemModalFieldInputStyle,
  minHeight: 80,
  height: "auto",
  padding: "8px 10px",
  resize: "vertical",
  fontFamily: "inherit",
};

export const systemModalSelectSx = {
  fontSize: 13,
  backgroundColor: "#fff",
  width: "100%",
  minHeight: 36,
  height: 36,
  borderRadius: 4,
  transition: "border-color 0.2s ease, box-shadow 0.2s ease",
  "& .MuiOutlinedInput-root": {
    minHeight: 36,
    height: 36,
    backgroundColor: "#fff",
    borderRadius: 4,
    transition: "border-color 0.2s ease, box-shadow 0.2s ease",
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
  "& .MuiOutlinedInput-notchedOutline": {
    borderColor: OUTLINED_BORDER,
    borderRadius: 4,
    transition: "border-color 0.2s ease, box-shadow 0.2s ease",
  },
  "&:hover .MuiOutlinedInput-notchedOutline": {
    borderColor: OUTLINED_HOVER,
  },
  "&.Mui-focused": {
    boxShadow: FOCUS_RING_SHADOW,
  },
  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
    borderColor: OUTLINED_FOCUS,
    borderWidth: "1px",
  },
};

export const sipAccessControlTableContainerStyle = {
  ...sipAccessControlCardStyle,
  width: "100%",
  maxWidth: "100%",
  margin: 0,
  display: "flex",
  flexDirection: "column",
  overflow: "hidden",
  boxSizing: "border-box",
};

export {
  sipAccessControlToolbarStyle,
  sipAccessControlFixedAlertSx,
  sipAccessControlCancelBtnStyle,
  sipAccessControlPrimaryBtnStyle,
  addNewModalFooterBtnStyle,
  sipAccessControlSelectedBadgeStyle,
  sipAccessControlModalCancelBtnStyle,
  sipAccessControlPaginationStyle,
};

/** Modal footer aligns with shared 4px dialog radius. */
export const sipAccessControlModalFooterStyle = {
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

export const SIP_ACCESS_CONTROL_FIELD_TOOLTIP_PROPS = {
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

export const SipAccessControlFieldLabel = ({
  tooltipKey,
  children,
  style = {},
}) => {
  const tooltip = tooltipKey
    ? SIP_ACCESS_CONTROL_FIELD_TOOLTIPS[tooltipKey] || ""
    : "";
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
    <Tooltip title={tooltip} {...SIP_ACCESS_CONTROL_FIELD_TOOLTIP_PROPS}>
      {labelNode}
    </Tooltip>
  );
};

const SipAccessControlScrollbarStyles = () => (
  <style>{`
    .${SIP_ACCESS_CONTROL_SCROLL_CLASS} {
      scroll-behavior: smooth;
      scrollbar-gutter: stable;
      scrollbar-width: thin;
      scrollbar-color: rgba(100, 116, 139, 0.45) transparent;
    }
    .${SIP_ACCESS_CONTROL_SCROLL_CLASS}::-webkit-scrollbar {
      width: 8px;
      height: 8px;
      transition: width 0.2s ease, height 0.2s ease;
    }
    .${SIP_ACCESS_CONTROL_SCROLL_CLASS}::-webkit-scrollbar:hover {
      width: 11px;
      height: 11px;
    }
    .${SIP_ACCESS_CONTROL_SCROLL_CLASS}::-webkit-scrollbar-corner {
      background: transparent;
    }
    .${SIP_ACCESS_CONTROL_SCROLL_CLASS}::-webkit-scrollbar-track {
      background: transparent;
    }
    .${SIP_ACCESS_CONTROL_SCROLL_CLASS}::-webkit-scrollbar-thumb {
      background-color: rgba(100, 116, 139, 0.45);
      border-radius: 6px;
      border: 2px solid transparent;
      background-clip: padding-box;
      transition: background-color 0.2s ease;
    }
    .${SIP_ACCESS_CONTROL_SCROLL_CLASS}::-webkit-scrollbar-thumb:hover {
      background-color: rgba(71, 85, 105, 0.65);
    }
  `}</style>
);

export const SipAccessControlPageShell = ({ children, isCompact }) => (
  <>
    <SipAccessControlScrollbarStyles />
    <div
      className={SIP_ACCESS_CONTROL_SCROLL_CLASS}
      style={{
        ...sipAccessControlPageWrapStyle,
        ...(isCompact ? { padding: 8 } : {}),
      }}
      data-native-scroll
    >
      <div style={sipAccessControlPageInnerStyle}>{children}</div>
    </div>
  </>
);

export const SipAccessControlBreadcrumb = () => (
  <ExtensionBreadcrumb
    root={SIP_ACCESS_CONTROL_PAGE_BREADCRUMB_ROOT}
    section={SIP_ACCESS_CONTROL_PAGE_BREADCRUMB_SECTION}
    current={SIP_ACCESS_CONTROL_PAGE_TITLE}
  />
);

export const SipAccessControlTableEmptyState = ({
  message = SIP_ACCESS_CONTROL_EMPTY_MESSAGE,
  onAddNew,
  disabled,
  buttonLabel = SIP_ACCESS_CONTROL_BTN_ADD_NEW,
}) => (
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
      {message}
    </div>
    <Btn
      variant="cancel"
      onClick={onAddNew}
      disabled={disabled}
      style={{ padding: "8px 24px", fontSize: 12, borderRadius: 4 }}
    >
      {buttonLabel}
    </Btn>
  </div>
);

export const SipAccessControlEditIcon = ({ onClick }) => (
  <EditDocumentIcon
    titleAccess={SIP_ACCESS_CONTROL_EDIT_TITLE_ACCESS}
    onClick={onClick}
    style={{
      cursor: "pointer",
      color: "#2563eb",
      fontSize: 22,
      opacity: 0.7,
      transition: "opacity 0.15s ease",
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.opacity = "1";
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.opacity = "0.7";
    }}
  />
);
