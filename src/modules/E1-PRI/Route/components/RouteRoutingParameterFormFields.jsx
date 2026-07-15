import React from "react";
import { ROUTE_ROUTING_PARAMETER_TOOLTIPS, ROUTE_ROUTING_PARAMETER_PAGE_BREADCRUMB_SECTION, ROUTE_ROUTING_PARAMETER_PAGE_TITLE, ROUTE_SETTINGS_OPTIONS } from "../../../../constants/RouteRoutingParameterPageConstants";
import { Tooltip } from "@mui/material";

import { C, OUTLINED_BORDER, OUTLINED_FOCUS, OUTLINED_HOVER, FOCUS_RING_SHADOW } from "../../../../theme/pbxTokens";
import { Btn, extensionPageWrapStyle as e1PriPageWrapStyle, extensionPageInnerStyle as e1PriPageInnerStyle, extensionCardStyle as e1PriCardStyle, extensionToolbarStyle as e1PriToolbarStyle, addNewModalFooterBtnStyle as e1PriToolbarBtnStyle, ExtensionBreadcrumb as E1PriBreadcrumb } from "../../../../components/common";
export const e1PriFormInlineFooterStyle = {
  display: "flex",
  justifyContent: "center",
  gap: 12,
  padding: "10px 28px",
  borderTop: `1px solid ${C.divider}`,
  background: C.cardBg,
  boxSizing: "border-box",
};

import { ROUTE_ROUTING_PARAMETER_SETTING_ROWS } from "../utils/RouteRoutingParameterTransformers";

export { Btn as RouteRoutingParameterBtn };

const FIELD_LABEL_COLOR = "#3E5475";
const FIELD_RADIUS = 6;

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
        fontSize: 13,
        maxWidth: 500,
        padding: "12px 16px",
      },
    },
    arrow: { sx: { color: "#fff" } },
  },
};

const formatFieldTooltipTitle = (text) => {
  if (!text) return "";
  const normalized = text
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
  if (normalized.includes("\n")) {
    return (
      <span style={{ whiteSpace: "pre-line", display: "block" }}>
        {normalized}
      </span>
    );
  }
  return normalized;
};

const RouteFieldRow = ({ label, tooltipKey, children, labelStyle = {} }) => {
  const tooltip = tooltipKey
    ? ROUTE_ROUTING_PARAMETER_TOOLTIPS[tooltipKey] || ""
    : "";
  const labelNode = (
    <label
      style={{
        fontSize: 13,
        fontWeight: 600,
        color: FIELD_LABEL_COLOR,
        width: 180,
        flexShrink: 0,
        paddingRight: 32,
        textAlign: "left",
        lineHeight: 1.4,
        cursor: tooltip ? "help" : undefined,
        ...labelStyle,
      }}
    >
      {label}
    </label>
  );

  return (
    <div
      className="flex flex-row items-center w-full"
      style={{
        minHeight: 34,
        justifyContent: "center",
        gap: 80,
      }}
    >
      {tooltip ? (
        <Tooltip
          title={formatFieldTooltipTitle(tooltip)}
          {...FIELD_TOOLTIP_PROPS}
        >
          {labelNode}
        </Tooltip>
      ) : (
        labelNode
      )}
      {children}
    </div>
  );
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

const fieldSelectStyle = {
  width: "100%",
  maxWidth: 400,
  minHeight: 32,
  height: 36,
  padding: "4px 28px 4px 10px",
  fontSize: 13,
  lineHeight: 1.35,
  border: `1px solid ${OUTLINED_BORDER}`,
  borderRadius: FIELD_RADIUS,
  outline: "none",
  backgroundColor: "#fff",
  color: C.labelText,
  boxSizing: "border-box",
  transition: "border-color 0.2s ease, box-shadow 0.2s ease",
  appearance: "auto",
  cursor: "pointer",
};

export const routeRoutingParameterPageWrapStyle = e1PriPageWrapStyle;
export const routeRoutingParameterPageInnerStyle = e1PriPageInnerStyle;
export const routeRoutingParameterCardStyle = e1PriCardStyle;

export const routeRoutingParameterCardTitleBarStyle = {
  ...e1PriToolbarStyle,
  fontWeight: 700,
  fontSize: 13,
  color: C.labelText,
};

export const routeRoutingParameterFormBodyStyle = {
  padding: "20px 28px 8px",
  display: "flex",
  flexDirection: "column",
  maxWidth: 720,
  width: "100%",
  margin: "0 auto",
  boxSizing: "border-box",
  gap: 10,
};

export const routeRoutingParameterFooterStyle = e1PriFormInlineFooterStyle;
export const routeRoutingParameterFooterBtnStyle = e1PriToolbarBtnStyle;

export const RouteRoutingParameterBreadcrumb = () => (
  <E1PriBreadcrumb root="E1-PRI"
    section={ROUTE_ROUTING_PARAMETER_PAGE_BREADCRUMB_SECTION}
    current={ROUTE_ROUTING_PARAMETER_PAGE_TITLE}
  />
);

export const RouteRoutingParameterFormBody = ({
  settings,
  loading,
  handleChange,
}) => (
  <div style={routeRoutingParameterFormBodyStyle}>
    {ROUTE_ROUTING_PARAMETER_SETTING_ROWS.map((row) => (
      <RouteFieldRow
        key={row.name}
        label={row.label}
        tooltipKey={row.tooltipKey}
      >
        <select
          name={row.name}
          value={settings[row.name]}
          onChange={(e) => handleChange(row.name, e.target.value)}
          style={fieldSelectStyle}
          disabled={loading}
          {...(loading ? {} : nativeFieldInteraction)}
        >
          {ROUTE_SETTINGS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </RouteFieldRow>
    ))}
  </div>
);
