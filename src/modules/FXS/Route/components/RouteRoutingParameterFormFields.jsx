import React from "react";
import { ROUTE_MODE_OPTIONS } from "../../../../constants/FxsRouteRoutingParameterPageConstants";
import { ROUTE_ROUTING_PARAMETER_PAGE_BREADCRUMB_SECTION, ROUTE_ROUTING_PARAMETER_PAGE_TITLE, ROUTE_ROUTING_PARAMETER_TOOLTIPS } from "../../../../constants/RouteRoutingParameterPageConstants";
import { Tooltip } from "@mui/material";

import { OUTLINED_BORDER, OUTLINED_FOCUS, OUTLINED_HOVER, FOCUS_RING_SHADOW, C } from "../../../../theme/pbxTokens";
import { Btn, TH, ExtensionBreadcrumb as FxsBreadcrumb, extensionCardStyle as fxsCardStyle, addNewModalFooterBtnStyle as fxsToolbarBtnStyle, extensionPageWrapStyle as fxsPageWrapStyle } from "../../../../components/common";
export const fxsFormInlineFooterStyle = {
  display: "flex",
  justifyContent: "center",
  gap: 12,
  padding: "10px 28px",
  borderTop: `1px solid ${C.divider}`,
  background: C.cardBg,
  boxSizing: "border-box",
};


const FIELD_LABEL_COLOR = "#3E5475";

const FIELD_TOOLTIP_PROPS = {
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

export const formatRouteRoutingParameterTooltipTitle = (text) => {
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

export const RouteRoutingParameterFieldLabel = ({
  tooltipKey,
  tooltips,
  children,
  style = {},
}) => {
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
    <Tooltip
      title={formatRouteRoutingParameterTooltipTitle(tooltip)}
      {...FIELD_TOOLTIP_PROPS}
    >
      {labelNode}
    </Tooltip>
  );
};

export const routeRoutingParameterPageWrapStyle = fxsPageWrapStyle;

export const routeRoutingParameterCardStyle = fxsCardStyle;

export const routeRoutingParameterCardTitleBarStyle = {
  width: "100%",
  minHeight: 44,
  display: "flex",
  alignItems: "center",
  padding: "7px 14px",
  fontWeight: 700,
  fontSize: 13,
  color: C.labelText,
  borderBottom: `1px solid ${C.divider}`,
  boxSizing: "border-box",
  background: C.cardBg,
};

export const routeRoutingParameterFormBodyStyle = {
  padding: "20px 28px 8px",
  display: "flex",
  flexDirection: "column",
  maxWidth: 720,
  width: "100%",
  margin: "0 auto",
  boxSizing: "border-box",
};

export const routeRoutingParameterFooterStyle = fxsFormInlineFooterStyle;
export const routeRoutingParameterFooterBtnStyle = fxsToolbarBtnStyle;

const FIELD_CONTROL_WIDTH = 240;
const FIELD_CONTROL_HEIGHT = 36;
const FIELD_RADIUS = 8;

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

export const routeRoutingParameterNativeFieldInteraction = {
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

export const routeRoutingParameterNativeFieldInputStyle = {
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
  backgroundColor: "#ffffff",
  color: "#1f2937",
  boxSizing: "border-box",
  boxShadow: "none",
  transition: "border-color 0.2s ease, box-shadow 0.2s ease",
};

export const routeRoutingParameterNativeFieldSelectStyle = {
  ...routeRoutingParameterNativeFieldInputStyle,
  padding: "0 28px 0 12px",
  lineHeight: 1.35,
  appearance: "auto",
};

export const RouteRoutingParameterBreadcrumb = () => (
  <FxsBreadcrumb
    section={ROUTE_ROUTING_PARAMETER_PAGE_BREADCRUMB_SECTION}
    current={ROUTE_ROUTING_PARAMETER_PAGE_TITLE}
  />
);

export const RouteRoutingParameterFieldRow = ({ label, tooltipKey, children }) => (
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
      <RouteRoutingParameterFieldLabel
        tooltipKey={tooltipKey}
        tooltips={ROUTE_ROUTING_PARAMETER_TOOLTIPS}
      >
        {label}
      </RouteRoutingParameterFieldLabel>
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

export const RouteRoutingParameterFormBody = ({
  formData,
  handleInputChange,
  handleNumberKeyPress,
}) => (
  <div style={routeRoutingParameterFormBodyStyle}>
    <RouteRoutingParameterFieldRow label="IP->TEL" tooltipKey="ipInRouteMode">
      <select
        name="ipInRouteMode"
        value={formData.ipInRouteMode}
        onChange={(e) => handleInputChange("ipInRouteMode", e.target.value)}
        style={routeRoutingParameterNativeFieldSelectStyle}
        {...routeRoutingParameterNativeFieldInteraction}
      >
        {ROUTE_MODE_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </RouteRoutingParameterFieldRow>

    <RouteRoutingParameterFieldRow label="TEL->IP" tooltipKey="pstnToIPRouteMode">
      <select
        name="pstnToIPRouteMode"
        value={formData.pstnToIPRouteMode}
        onChange={(e) =>
          handleInputChange("pstnToIPRouteMode", e.target.value)
        }
        style={routeRoutingParameterNativeFieldSelectStyle}
        {...routeRoutingParameterNativeFieldInteraction}
      >
        {ROUTE_MODE_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </RouteRoutingParameterFieldRow>

    <RouteRoutingParameterFieldRow
      label="Route Detection Cycle (s)"
      tooltipKey="routeCheckPeriod"
    >
      <input
        id="RouteCheckPeriod"
        type="text"
        value={formData.routeCheckPeriod || ""}
        onChange={(e) =>
          handleInputChange("routeCheckPeriod", e.target.value)
        }
        onKeyPress={handleNumberKeyPress}
        maxLength={31}
        style={routeRoutingParameterNativeFieldInputStyle}
        {...routeRoutingParameterNativeFieldInteraction}
        autoComplete="off"
      />
    </RouteRoutingParameterFieldRow>
  </div>
);
