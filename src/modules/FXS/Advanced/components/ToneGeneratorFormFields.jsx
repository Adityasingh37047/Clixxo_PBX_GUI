import React from "react";

import { ExtensionBreadcrumb as FxsChromeBreadcrumb } from "../../../../components/common";

import { Tooltip } from "@mui/material";
import {
  TONE_GENERATOR_FIELD_TOOLTIPS,
  TONE_GENERATOR_PAGE_BREADCRUMB_SECTION,
  TONE_GENERATOR_PAGE_TITLE,
} from "../../../../constants/ToneGeneratorConstants";
import {
  C,
  OUTLINED_BORDER,
  OUTLINED_FOCUS,
  OUTLINED_HOVER,
  FOCUS_RING_SHADOW,
} from "../../../../theme/pbxTokens";
import {
  toneGeneratorFieldBg,
  toneGeneratorHelpColumnStyle,
  toneGeneratorPageInnerStyle,
  toneGeneratorPageWrapStyle,
} from "./ToneGeneratorTableHelpers";

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

export const nativeInputStyle = {
  width: "100%",
  height: 36,
  padding: "0 12px",
  fontSize: 13,
  fontFamily: '"SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace',
  letterSpacing: "0.02em",
  border: `1px solid ${OUTLINED_BORDER}`,
  borderRadius: FIELD_RADIUS,
  outline: "none",
  backgroundColor: toneGeneratorFieldBg,
  color: C.valueText,
  boxSizing: "border-box",
  transition: "border-color 0.2s ease, box-shadow 0.2s ease",
};

export const ToneFieldRow = ({
  label,
  id,
  value,
  onChange,
  onKeyPress,
  tooltipKey,
}) => (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      gap: 6,
    }}
  >
    <FxsFieldLabel tooltipKey={tooltipKey} tooltips={TONE_GENERATOR_FIELD_TOOLTIPS}>
      {label}
    </FxsFieldLabel>
    <input
      id={id}
      type="text"
      value={value}
      onChange={onChange}
      onKeyPress={onKeyPress}
      maxLength={63}
      style={nativeInputStyle}
      {...nativeFieldInteraction}
    />
  </div>
);

export const ToneGeneratorHelpPanel = ({ blocks }) => (
  <div style={toneGeneratorHelpColumnStyle}>
    {blocks.map((block, idx) => (
      <div
        key={block.title}
        style={{ marginBottom: idx < blocks.length - 1 ? 16 : 0 }}
      >
        <p
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: C.labelText,
            margin: "0 0 6px",
            fontFamily:
              '"SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace',
          }}
        >
          {block.title}
        </p>
        <p
          style={{
            fontSize: 12,
            color: C.mutedText,
            lineHeight: 1.55,
            margin: 0,
          }}
        >
          {block.text}
        </p>
      </div>
    ))}
  </div>
);

export const ToneGeneratorBreadcrumb = () => (
  <FxsChromeBreadcrumb root="FXS"
    section={TONE_GENERATOR_PAGE_BREADCRUMB_SECTION}
    current={TONE_GENERATOR_PAGE_TITLE}
  />
);

export const ToneGeneratorPageShell = ({ children }) => (
  <div style={toneGeneratorPageWrapStyle}>
    <div style={toneGeneratorPageInnerStyle}>{children}</div>
  </div>
);
