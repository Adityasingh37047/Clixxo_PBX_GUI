import React from "react";

import { ExtensionBreadcrumb as FxsChromeBreadcrumb } from "../../../../components/common";

import { Tooltip } from "@mui/material";
import {
  AREA_SELECT_FIELD_TOOLTIPS,
  AREA_SELECT_PAGE_BREADCRUMB_SECTION,
  AREA_SELECT_PAGE_TITLE,
} from "../../../../constants/AreaSelectConstants";
import {
  C,
  OUTLINED_BORDER,
  OUTLINED_FOCUS,
  OUTLINED_HOVER,
  FOCUS_RING_SHADOW,
} from "../../../../theme/pbxTokens";
import {
  areaSelectFieldBg,
  areaSelectPageWrapStyle,
  areaSelectPageInnerStyle,
} from "./AreaSelectTableHelpers";

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

const FIELD_RADIUS = 8;
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

export const nativeFieldSelectStyle = {
  width: "100%",
  height: FIELD_CONTROL_HEIGHT,
  minHeight: FIELD_CONTROL_HEIGHT,
  padding: "0 28px 0 12px",
  fontSize: 13,
  lineHeight: `${FIELD_CONTROL_HEIGHT - 2}px`,
  border: `1px solid ${OUTLINED_BORDER}`,
  borderRadius: FIELD_RADIUS,
  outline: "none",
  backgroundColor: areaSelectFieldBg,
  color: C.valueText,
  boxSizing: "border-box",
  boxShadow: "none",
  transition: "border-color 0.2s ease, box-shadow 0.2s ease",
  appearance: "auto",
  cursor: "pointer",
};

export const AreaSelectFieldRow = ({ label, tooltipKey, children }) => {
  const tooltip = tooltipKey ? AREA_SELECT_FIELD_TOOLTIPS[tooltipKey] || "" : "";
  const labelNode = (
    <label
      style={{
        fontSize: 13,
        fontWeight: 600,
        color: FIELD_LABEL_COLOR,
        width: "100%",
        textAlign: "left",
        lineHeight: 1.45,
        cursor: tooltip ? "help" : undefined,
        whiteSpace: "normal",
      }}
    >
      {label}
    </label>
  );

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        maxWidth: 420,
        gap: 8,
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

export const AreaSelectBreadcrumb = () => (
  <FxsChromeBreadcrumb root="FXS"
    section={AREA_SELECT_PAGE_BREADCRUMB_SECTION}
    current={AREA_SELECT_PAGE_TITLE}
  />
);

export const AreaSelectPageShell = ({ children }) => (
  <div style={areaSelectPageWrapStyle}>
    <div style={areaSelectPageInnerStyle}>{children}</div>
  </div>
);
