import React from "react";

import { ExtensionBreadcrumb as FxsChromeBreadcrumb } from "../../../../components/common";

import { Tooltip } from "@mui/material";
import {
  CDR_QUERY_FIELD_TOOLTIPS,
  CDR_QUERY_PAGE_BREADCRUMB_SECTION,
  CDR_QUERY_PAGE_TITLE,
} from "../../../../constants/CdrQueryConstants";
import {
  C,
  OUTLINED_BORDER,
  OUTLINED_FOCUS,
  OUTLINED_HOVER,
  FOCUS_RING_SHADOW,
} from "../../../../theme/pbxTokens";
import { getCdrQueryFields } from "../utils/CdrQueryTransformers";
import {
  cdrQueryFieldBg,
  cdrQueryFieldsColStyle,
  cdrQueryFormBodyStyle,
  cdrQueryPageInnerStyle,
  cdrQueryPageWrapStyle,
} from "./CdrQueryTableHelpers";

export const FIELD_LABEL_COLOR = "#3E5475";
const CDR_LABEL_WIDTH = 190;
const CDR_FIELD_WIDTH = 132;
const CDR_DURATION_FIELD_WIDTH = 56;

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

const nativeFieldBaseStyle = {
  height: FIELD_CONTROL_HEIGHT,
  minHeight: FIELD_CONTROL_HEIGHT,
  padding: "0 12px",
  fontSize: 13,
  lineHeight: `${FIELD_CONTROL_HEIGHT - 2}px`,
  border: `1px solid ${OUTLINED_BORDER}`,
  borderRadius: FIELD_RADIUS,
  outline: "none",
  backgroundColor: cdrQueryFieldBg,
  color: C.valueText,
  boxSizing: "border-box",
  boxShadow: "none",
  transition: "border-color 0.2s ease, box-shadow 0.2s ease",
};

export const compactFieldStyle = {
  ...nativeFieldBaseStyle,
  width: CDR_FIELD_WIDTH,
  minWidth: CDR_FIELD_WIDTH,
  maxWidth: CDR_FIELD_WIDTH,
};

export const durationFieldStyle = {
  ...nativeFieldBaseStyle,
  width: CDR_DURATION_FIELD_WIDTH,
  minWidth: CDR_DURATION_FIELD_WIDTH,
  maxWidth: CDR_DURATION_FIELD_WIDTH,
  padding: "0 8px",
};

export const nativeFieldSelectStyle = {
  ...compactFieldStyle,
  padding: "0 28px 0 12px",
  appearance: "auto",
  cursor: "pointer",
};

export const CdrQueryFieldRow = ({ label, tooltipKey, children }) => {
  const tooltip = tooltipKey ? CDR_QUERY_FIELD_TOOLTIPS[tooltipKey] || "" : "";
  const labelNode = (
    <label
      style={{
        width: CDR_LABEL_WIDTH,
        flexShrink: 0,
        fontSize: 13,
        fontWeight: 600,
        color: FIELD_LABEL_COLOR,
        textAlign: "left",
        lineHeight: 1.45,
        cursor: tooltip ? "help" : undefined,
      }}
    >
      {label}
    </label>
  );

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 16,
        width: "fit-content",
        maxWidth: "100%",
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
      <div style={{ flexShrink: 0 }}>{children}</div>
    </div>
  );
};

export const CdrQueryBreadcrumb = () => (
  <FxsChromeBreadcrumb root="FXS"
    section={CDR_QUERY_PAGE_BREADCRUMB_SECTION}
    current={CDR_QUERY_PAGE_TITLE}
  />
);

export const CdrQueryPageShell = ({ children }) => (
  <div style={cdrQueryPageWrapStyle}>
    <div style={cdrQueryPageInnerStyle}>{children}</div>
  </div>
);

export const renderFieldControl = (
  field,
  { formData, handleInputChange, handleStringKeyPress, handleNumberKeyPress },
) => {
  if (field.type === "date") {
    return (
      <input
        id={field.key}
        type="date"
        name={field.key}
        value={formData[field.key] || ""}
        onChange={handleInputChange}
        style={compactFieldStyle}
        {...nativeFieldInteraction}
      />
    );
  }

  if (field.type === "select") {
    return (
      <select
        id={field.key}
        name={field.key}
        value={formData[field.key]}
        onChange={handleInputChange}
        style={nativeFieldSelectStyle}
        {...nativeFieldInteraction}
      >
        {field.options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    );
  }

  if (field.type === "duration") {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
        <input
          id={field.minKey}
          type="text"
          name={field.minKey}
          value={formData[field.minKey] || ""}
          onChange={handleInputChange}
          onKeyPress={handleNumberKeyPress}
          style={durationFieldStyle}
          {...nativeFieldInteraction}
        />
        <span style={{ fontSize: 13, color: C.mutedText }}>—</span>
        <input
          id={field.maxKey}
          type="text"
          name={field.maxKey}
          value={formData[field.maxKey] || ""}
          onChange={handleInputChange}
          onKeyPress={handleNumberKeyPress}
          style={durationFieldStyle}
          {...nativeFieldInteraction}
        />
      </div>
    );
  }

  return (
    <input
      id={field.key}
      type="text"
      name={field.key}
      value={formData[field.key] || ""}
      onChange={handleInputChange}
      onKeyPress={
        field.keyPressType === "string" ? handleStringKeyPress : undefined
      }
      style={compactFieldStyle}
      {...nativeFieldInteraction}
    />
  );
};

export const CdrQueryFieldsSection = ({
  formData,
  handleInputChange,
  handleStringKeyPress,
  handleNumberKeyPress,
}) => (
  <div style={cdrQueryFormBodyStyle}>
    <div style={cdrQueryFieldsColStyle}>
      {getCdrQueryFields().map((field) => (
        <CdrQueryFieldRow
          key={field.key}
          label={field.label}
          tooltipKey={field.tooltipKey || field.key}
        >
          {renderFieldControl(field, {
            formData,
            handleInputChange,
            handleStringKeyPress,
            handleNumberKeyPress,
          })}
        </CdrQueryFieldRow>
      ))}
    </div>
  </div>
);
