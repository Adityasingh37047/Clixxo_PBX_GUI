import React from "react";

import { ExtensionBreadcrumb as FxsChromeBreadcrumb } from "../../../../components/common";

import { Tooltip } from "@mui/material";
import {
  CUE_TONE_FIELD_TOOLTIPS,
  CUE_TONE_PAGE_BREADCRUMB_SECTION,
  CUE_TONE_PAGE_TITLE,
} from "../../../../constants/CueToneConstants";
import {
  C,
  OUTLINED_BORDER,
  OUTLINED_FOCUS,
  OUTLINED_HOVER,
  FOCUS_RING_SHADOW,
} from "../../../../theme/pbxTokens";
import {
  cueToneFieldBg,
  cueTonePageInnerStyle,
  cueTonePageWrapStyle,
} from "./CueToneTableHelpers";

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
const CUE_TONE_LABEL_WIDTH = 170;
const CUE_TONE_FIELD_WIDTH = 320;

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
  maxWidth: CUE_TONE_FIELD_WIDTH,
  height: FIELD_CONTROL_HEIGHT,
  minHeight: FIELD_CONTROL_HEIGHT,
  padding: "0 28px 0 12px",
  fontSize: 13,
  lineHeight: `${FIELD_CONTROL_HEIGHT - 2}px`,
  border: `1px solid ${OUTLINED_BORDER}`,
  borderRadius: FIELD_RADIUS,
  outline: "none",
  backgroundColor: cueToneFieldBg,
  color: C.valueText,
  boxSizing: "border-box",
  boxShadow: "none",
  transition: "border-color 0.2s ease, box-shadow 0.2s ease",
  appearance: "auto",
  cursor: "pointer",
};

export const CueToneFieldRow = ({ label, tooltipKey, children, align = "center" }) => {
  const tooltip = tooltipKey ? CUE_TONE_FIELD_TOOLTIPS[tooltipKey] || "" : "";
  const labelNode = (
    <label
      style={{
        fontSize: 13,
        fontWeight: 600,
        color: FIELD_LABEL_COLOR,
        width: CUE_TONE_LABEL_WIDTH,
        flexShrink: 0,
        textAlign: "left",
        lineHeight: 1.45,
        cursor: tooltip ? "help" : undefined,
        whiteSpace: "normal",
        paddingTop: align === "flex-start" ? 8 : 0,
      }}
    >
      {label}
    </label>
  );

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        alignItems: align,
        justifyContent: "center",
        gap: 100,
        width: "fit-content",
        maxWidth: "100%",
        minHeight: align === "flex-start" ? undefined : 32,
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
      <div
        style={{
          width: CUE_TONE_FIELD_WIDTH,
          maxWidth: "100%",
          flexShrink: 0,
        }}
      >
        {children}
      </div>
    </div>
  );
};

export const CueToneBreadcrumb = () => (
  <FxsChromeBreadcrumb root="FXS"
    section={CUE_TONE_PAGE_BREADCRUMB_SECTION}
    current={CUE_TONE_PAGE_TITLE}
  />
);

export const CueTonePageShell = ({ children }) => (
  <div style={cueTonePageWrapStyle}>
    <div style={cueTonePageInnerStyle}>{children}</div>
  </div>
);
