import React from "react";

import { ExtensionBreadcrumb as FxsChromeBreadcrumb } from "../../../../components/common";

import { Tooltip } from "@mui/material";
import {
  QOS_FIELD_TOOLTIPS,
  QOS_PAGE_BREADCRUMB_SECTION,
  QOS_PAGE_TITLE,
} from "../../../../constants/QosConstants";
import {
  C,
  OUTLINED_BORDER,
  OUTLINED_FOCUS,
  OUTLINED_HOVER,
  FOCUS_RING_SHADOW,
} from "../../../../theme/pbxTokens";
import { qosFieldBg, qosPageWrapStyle } from "./QosTableHelpers";

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

const FIELD_RADIUS = 8;
const FIELD_CONTROL_WIDTH = 160;
const FIELD_CONTROL_HEIGHT = 36;

export const setFieldDefault = (el) => {
  el.style.borderColor = OUTLINED_BORDER;
  el.style.borderWidth = "1px";
  el.style.boxShadow = "none";
};

export const setFieldHover = (el) => {
  el.style.borderColor = OUTLINED_HOVER;
  el.style.borderWidth = "1px";
  el.style.boxShadow = "none";
};

export const setFieldFocus = (el) => {
  el.style.borderColor = OUTLINED_FOCUS;
  el.style.borderWidth = "1px";
  el.style.boxShadow = FOCUS_RING_SHADOW;
};

export const nativeFieldInteraction = {
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

export const nativeFieldInputStyle = {
  width: "100%",
  minWidth: FIELD_CONTROL_WIDTH,
  maxWidth: FIELD_CONTROL_WIDTH,
  height: FIELD_CONTROL_HEIGHT,
  minHeight: FIELD_CONTROL_HEIGHT,
  padding: "0 12px",
  fontSize: 13,
  lineHeight: `${FIELD_CONTROL_HEIGHT - 2}px`,
  border: `1px solid ${OUTLINED_BORDER}`,
  borderRadius: FIELD_RADIUS,
  outline: "none",
  backgroundColor: qosFieldBg,
  color: "#1f2937",
  boxSizing: "border-box",
  boxShadow: "none",
  transition: "border-color 0.2s ease, box-shadow 0.2s ease",
};

export const QosFieldRow = ({ label, tooltipKey, children }) => (
  <div
    style={{
      display: "flex",
      flexDirection: "row",
      width: "100%",
      minHeight: 36,
      alignItems: "center",
      marginBottom: 10,
    }}
  >
    <div
      style={{
        flex: "1 1 auto",
        minWidth: 0,
        paddingRight: 24,
        textAlign: "left",
        lineHeight: 1.45,
      }}
    >
      <FxsFieldLabel tooltipKey={tooltipKey} tooltips={QOS_FIELD_TOOLTIPS}>
        {label}
      </FxsFieldLabel>
    </div>
    <div
      style={{
        flex: "0 0 auto",
        width: FIELD_CONTROL_WIDTH,
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-start",
      }}
    >
      {children}
    </div>
  </div>
);

export const QosBreadcrumb = () => (
  <FxsChromeBreadcrumb root="FXS"
    section={QOS_PAGE_BREADCRUMB_SECTION}
    current={QOS_PAGE_TITLE}
  />
);

export const QosPageShell = ({ children }) => (
  <div style={qosPageWrapStyle}>{children}</div>
);
