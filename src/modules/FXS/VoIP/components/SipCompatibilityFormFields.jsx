import React from "react";
import {
  SIP_COMPATIBILITY_FIELD_TOOLTIPS, FXS_SIP_COMPATIBILITY_SECTION_HEADING_LEFT, FXS_SIP_COMPATIBILITY_SECTION_HEADING_COLOR, FXS_SIP_COMPATIBILITY_BREADCRUMB_SECTION, FXS_SIP_COMPATIBILITY_PAGE_TITLE } from "../../../../constants/SipCompatibilityConstants";
import { Checkbox, Tooltip, useMediaQuery } from "@mui/material";


import {
  C,
  FOCUS_RING_SHADOW,
  OUTLINED_BORDER,
  OUTLINED_FOCUS,
  OUTLINED_HOVER,
} from "../../../../theme/pbxTokens";
import { ExtensionBreadcrumb as FxsBreadcrumb,
  extensionTableCheckboxSx as fxsSipCompatibilityCheckboxSx,
} from "../../../../components/common";
import { getSipCompatibilityFieldByKey } from "../utils/SipCompatibilityTransformers";
import { shouldShowSipCompatibilityField } from "../utils/SipCompatibilityValidators";
import {
  FXS_SIP_COMPATIBILITY_FIELD_RADIUS,
  FXS_SIP_COMPATIBILITY_LAPTOP_NARROW_MQ,
  fxsSipCompatibilityDashboardColumnStyle,
  fxsSipCompatibilityDashboardDividerCellStyle,
  fxsSipCompatibilityDashboardDividerLineStyle,
  fxsSipCompatibilityDashboardGridStyle,
  fxsSipCompatibilityFieldsColStyle,
  fxsSipCompatibilityNestedFieldsWrapStyle,
  fxsSipCompatibilityPageInnerStyle,
  fxsSipCompatibilityPageWrapStyle,
} from "./SipCompatibilityTableHelpers";


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

export const formatSipCompatibilityFieldTooltipTitle = (text) => {
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

export const sipCompatibilityNativeFieldInteraction = {
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

const nativeFieldInputStyle = {
  height: 36,
  width: "100%",
  maxWidth: 220,
  padding: "0 12px",
  fontSize: 13,
  border: `1px solid ${OUTLINED_BORDER}`,
  borderRadius: FXS_SIP_COMPATIBILITY_FIELD_RADIUS,
  outline: "none",
  backgroundColor: "#ffffff",
  color: C.valueText,
  boxSizing: "border-box",
  boxShadow: "none",
  transition: "border-color 0.2s ease, box-shadow 0.2s ease",
};

const nativeFieldSelectStyle = {
  width: "100%",
  maxWidth: 220,
  minHeight: 36,
  height: 36,
  padding: "0 28px 0 12px",
  fontSize: nativeFieldInputStyle.fontSize,
  lineHeight: 1.35,
  border: nativeFieldInputStyle.border,
  borderRadius: nativeFieldInputStyle.borderRadius,
  outline: nativeFieldInputStyle.outline,
  backgroundColor: nativeFieldInputStyle.backgroundColor,
  color: nativeFieldInputStyle.color,
  boxSizing: nativeFieldInputStyle.boxSizing,
  transition: nativeFieldInputStyle.transition,
  appearance: "auto",
  cursor: "pointer",
};



export const SipCompatibilityFieldRow = ({
  label,
  tooltipKey,
  children,
  nested = false,
}) => {
  const tooltip = tooltipKey
    ? SIP_COMPATIBILITY_FIELD_TOOLTIPS[tooltipKey] || ""
    : "";
  const isLongLabel = label.length > 48;
  const labelNode = (
    <label
      style={{
        fontSize: 13,
        fontWeight: 600,
        color: nested ? "#6b7280" : FIELD_LABEL_COLOR,
        flex: "1 1 auto",
        minWidth: 0,
        paddingRight: 16,
        textAlign: "left",
        lineHeight: 1.45,
        cursor: tooltip ? "help" : undefined,
        whiteSpace: "normal",
        overflowWrap: "break-word",
        wordBreak: "break-word",
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
        width: "100%",
        minHeight: 36,
        alignItems: isLongLabel ? "flex-start" : "center",
        paddingTop: isLongLabel ? 6 : 0,
        paddingBottom: isLongLabel ? 6 : 0,
      }}
    >
      {tooltip ? (
        <Tooltip
          title={formatSipCompatibilityFieldTooltipTitle(tooltip)}
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

export const SipCompatibilitySectionHeading = ({ title, isFirst = false }) => {
  const isLaptopNarrow = useMediaQuery(FXS_SIP_COMPATIBILITY_LAPTOP_NARROW_MQ);
  return (
    <div
      style={{
        margin: isFirst
          ? isLaptopNarrow
            ? "20px 0 24px 0"
            : "12px 0 24px 0"
          : "28px 0 24px 0",
        position: "relative",
        width: "100%",
      }}
    >
      <div style={{ borderTop: `1px solid ${C.divider}` }} />
      <span
        style={{
          position: "absolute",
          top: -10,
          left: isLaptopNarrow ? 0 : FXS_SIP_COMPATIBILITY_SECTION_HEADING_LEFT,
          background: C.cardBg,
          paddingRight: 8,
          fontSize: 14,
          fontWeight: 600,
          color: FXS_SIP_COMPATIBILITY_SECTION_HEADING_COLOR,
        }}
      >
        {title}
      </span>
    </div>
  );
};

export const SipCompatibilityBreadcrumb = () => (
  <FxsBreadcrumb
    root="FXS"
    section={FXS_SIP_COMPATIBILITY_BREADCRUMB_SECTION}
    current={FXS_SIP_COMPATIBILITY_PAGE_TITLE}
    style={{ flexShrink: 0 }}
  />
);

export const SipCompatibilityPageShell = ({ children }) => (
  <div style={fxsSipCompatibilityPageWrapStyle} data-native-scroll>
    <div style={fxsSipCompatibilityPageInnerStyle}>{children}</div>
  </div>
);

const valueColStyle = {
  flex: "1 1 auto",
  minWidth: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
};

const controlSlotStyle = {
  width: 220,
  maxWidth: "100%",
  flexShrink: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-start",
};

export const SipCompatibilityFieldControl = ({
  field,
  form,
  onChange,
  onCheckbox,
  nested = false,
}) => {
  if (!field || !shouldShowSipCompatibilityField(form, field)) return null;

  const fieldInputStyle = { ...nativeFieldInputStyle, width: "100%" };
  const fieldSelectStyle = { ...nativeFieldSelectStyle, width: "100%" };

  return (
    <SipCompatibilityFieldRow
      key={field.key}
      label={field.label}
      tooltipKey={field.key}
      nested={nested}
    >
      <div style={valueColStyle}>
        {field.type === "text" && (
          <div
            style={{
              ...controlSlotStyle,
              width: field.key === "fxoHangupTime" ? "auto" : 220,
              minWidth: 220,
            }}
          >
            <input
              type="text"
              value={form[field.key]}
              onChange={(e) => onChange(field.key, e.target.value)}
              style={fieldInputStyle}
              {...sipCompatibilityNativeFieldInteraction}
            />
            {field.key === "fxoHangupTime" && (
              <span
                style={{
                  color: C.valueText,
                  fontSize: 13,
                  flexShrink: 0,
                  marginLeft: 4,
                }}
              >
                s
              </span>
            )}
          </div>
        )}

        {field.type === "select" && (
          <div style={controlSlotStyle}>
            <select
              value={form[field.key]}
              onChange={(e) => onChange(field.key, e.target.value)}
              style={fieldSelectStyle}
              {...sipCompatibilityNativeFieldInteraction}
            >
              {field.options.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        )}

        {field.type === "checkbox" && (
          <div style={controlSlotStyle}>
            <Checkbox
              size="small"
              checked={!!form[field.key]}
              onChange={() => onCheckbox(field.key)}
              sx={fxsSipCompatibilityCheckboxSx}
            />
          </div>
        )}
      </div>
    </SipCompatibilityFieldRow>
  );
};

export const SipCompatibilityFormGrid = ({
  leftSectionTitle,
  rightSectionTitle,
  leftLayout,
  rightLayout,
  form,
  onChange,
  onCheckbox,
}) => {
  const renderField = (field, nested = false) => (
    <SipCompatibilityFieldControl
      key={field?.key}
      field={field}
      form={form}
      onChange={onChange}
      onCheckbox={onCheckbox}
      nested={nested}
    />
  );

  const renderConditionalGroup = (parentKey, childKeys) => {
    const parentField = getSipCompatibilityFieldByKey(parentKey);
    if (!parentField) return null;

    const parentRow = renderField(parentField);
    if (!parentRow) return null;

    const visibleChildren = childKeys
      .map((key) => getSipCompatibilityFieldByKey(key))
      .filter((field) => field && shouldShowSipCompatibilityField(form, field));

    return (
      <div
        key={parentKey}
        style={{ display: "flex", flexDirection: "column", gap: 8 }}
      >
        {parentRow}
        {visibleChildren.length > 0 ? (
          <div style={fxsSipCompatibilityNestedFieldsWrapStyle}>
            {visibleChildren.map((field) => renderField(field, true))}
          </div>
        ) : null}
      </div>
    );
  };

  const renderColumnLayout = (layout) =>
    layout.map((block, index) => {
      if (block.type === "fields") {
        return block.keys.map((key) =>
          renderField(getSipCompatibilityFieldByKey(key)),
        );
      }

      if (block.type === "group") {
        return (
          <React.Fragment key={block.parent || index}>
            {renderConditionalGroup(block.parent, block.children)}
          </React.Fragment>
        );
      }

      return null;
    });

  return (
    <div
      className="settings-dashboard-grid"
      style={fxsSipCompatibilityDashboardGridStyle}
    >
      <div style={fxsSipCompatibilityDashboardColumnStyle}>
        <SipCompatibilitySectionHeading title={leftSectionTitle} isFirst />
        <div style={fxsSipCompatibilityFieldsColStyle}>
          {renderColumnLayout(leftLayout)}
        </div>
      </div>

      <div
        className="settings-dashboard-divider"
        style={fxsSipCompatibilityDashboardDividerCellStyle}
        aria-hidden="true"
      >
        <div style={fxsSipCompatibilityDashboardDividerLineStyle} />
      </div>

      <div style={fxsSipCompatibilityDashboardColumnStyle}>
        <SipCompatibilitySectionHeading title={rightSectionTitle} isFirst />
        <div style={fxsSipCompatibilityFieldsColStyle}>
          {renderColumnLayout(rightLayout)}
        </div>
      </div>
    </div>
  );
};
