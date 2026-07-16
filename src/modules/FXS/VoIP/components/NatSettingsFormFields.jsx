import React from "react";
import { NAT_SETTINGS_FIELD_TOOLTIPS, FXS_NAT_SETTINGS_SECTION_HEADING_LEFT, FXS_NAT_SETTINGS_SECTION_HEADING_COLOR, FXS_NAT_SETTINGS_BREADCRUMB_SECTION, FXS_NAT_SETTINGS_PAGE_TITLE } from "../../../../constants/NatSettingsConstants";
import { Checkbox, Tooltip, useMediaQuery } from "@mui/material";


import {
  C,
  FOCUS_RING_SHADOW,
  OUTLINED_BORDER,
  OUTLINED_FOCUS,
  OUTLINED_HOVER,
} from "../../../../theme/pbxTokens";
import { ExtensionBreadcrumb as FxsBreadcrumb } from "../../../../components/common";
import {
  isNatSettingsCheckboxDisabled,
  shouldShowNatSettingsField,
} from "../utils/NatSettingsValidators";
import {
  FXS_NAT_SETTINGS_FIELD_RADIUS,
  FXS_NAT_SETTINGS_LAPTOP_NARROW_MQ,
  fxsNatSettingsDashboardColumnStyle,
  fxsNatSettingsDashboardDividerCellStyle,
  fxsNatSettingsDashboardDividerLineStyle,
  fxsNatSettingsDashboardGridStyle,
  fxsNatSettingsFieldsColStyle,
  fxsNatSettingsPageInnerStyle,
  fxsNatSettingsPageWrapStyle,
} from "./NatSettingsTableHelpers";

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

export const formatNatSettingsFieldTooltipTitle = (text) => {
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

export const natSettingsNativeFieldInteraction = {
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
  borderRadius: FXS_NAT_SETTINGS_FIELD_RADIUS,
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

export const fxsNatSettingsCheckboxSx = {
  padding: "1px",
  color: "#3E5475",
  "&.Mui-checked": { color: "#0284c7" },
  "&.MuiCheckbox-indeterminate": { color: "#0284c7" },
};

export const NatSettingsFieldRow = ({ label, tooltipKey, children }) => {
  const tooltip = tooltipKey
    ? NAT_SETTINGS_FIELD_TOOLTIPS[tooltipKey] || ""
    : "";
  const labelNode = (
    <label
      style={{
        fontSize: 13,
        fontWeight: 600,
        color: FIELD_LABEL_COLOR,
        flex: "1 1 auto",
        minWidth: 0,
        paddingRight: 16,
        textAlign: "left",
        lineHeight: 1.4,
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
        flexDirection: "row",
        alignItems: "center",
        width: "100%",
        minHeight: 36,
      }}
    >
      {tooltip ? (
        <Tooltip
          title={formatNatSettingsFieldTooltipTitle(tooltip)}
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

export const NatSettingsSectionHeading = ({ title, isFirst = false }) => {
  const isLaptopNarrow = useMediaQuery(FXS_NAT_SETTINGS_LAPTOP_NARROW_MQ);
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
          left: isLaptopNarrow ? 0 : FXS_NAT_SETTINGS_SECTION_HEADING_LEFT,
          background: C.cardBg,
          paddingRight: 8,
          fontSize: 14,
          fontWeight: 600,
          color: FXS_NAT_SETTINGS_SECTION_HEADING_COLOR,
        }}
      >
        {title}
      </span>
    </div>
  );
};

export const NatSettingsBreadcrumb = () => (
  <FxsBreadcrumb
    root="FXS"
    section={FXS_NAT_SETTINGS_BREADCRUMB_SECTION}
    current={FXS_NAT_SETTINGS_PAGE_TITLE}
    style={{ flexShrink: 0 }}
  />
);

export const NatSettingsPageShell = ({ children }) => (
  <div style={fxsNatSettingsPageWrapStyle} data-native-scroll>
    <div style={fxsNatSettingsPageInnerStyle}>{children}</div>
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

export const NatSettingsFieldControl = ({ field, form, onChange, onCheckbox }) => {
  if (!shouldShowNatSettingsField(form, field)) return null;

  const fieldInputStyle = { ...nativeFieldInputStyle, width: "100%" };
  const fieldSelectStyle = { ...nativeFieldSelectStyle, width: "100%" };
  const fieldReadonlyStyle = {
    ...fieldInputStyle,
    backgroundColor: "#f1f5f9",
    lineHeight: "36px",
    display: "flex",
    alignItems: "center",
  };

  const renderFieldControl = () => {
    if (field.type === "readonly") {
      return (
        <div style={{ ...fieldReadonlyStyle, width: "100%" }}>
          {form[field.key] || field.default || ""}
        </div>
      );
    }
    if (field.type === "text") {
      return (
        <input
          type="text"
          value={form[field.key]}
          onChange={(e) => onChange(field.key, e.target.value)}
          style={fieldInputStyle}
          {...natSettingsNativeFieldInteraction}
        />
      );
    }
    if (field.type === "select") {
      return (
        <select
          value={form[field.key]}
          onChange={(e) => onChange(field.key, e.target.value)}
          style={fieldSelectStyle}
          {...natSettingsNativeFieldInteraction}
        >
          {field.options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      );
    }
    if (field.type === "checkbox") {
      const disabled = isNatSettingsCheckboxDisabled(form, field.key);
      return (
        <Checkbox
          size="small"
          checked={!!form[field.key]}
          onChange={() => onCheckbox(field.key)}
          disabled={disabled}
          sx={fxsNatSettingsCheckboxSx}
        />
      );
    }
    return null;
  };

  return (
    <NatSettingsFieldRow key={field.key} label={field.label} tooltipKey={field.key}>
      <div style={valueColStyle}>
        <div style={controlSlotStyle}>{renderFieldControl()}</div>
      </div>
    </NatSettingsFieldRow>
  );
};

export const NatSettingsFormGrid = ({
  leftSectionTitle,
  rightSectionTitle,
  leftFields,
  rightFields,
  form,
  onChange,
  onCheckbox,
}) => (
  <div className="settings-dashboard-grid" style={fxsNatSettingsDashboardGridStyle}>
    <div style={fxsNatSettingsDashboardColumnStyle}>
      <NatSettingsSectionHeading title={leftSectionTitle} isFirst />
      <div style={fxsNatSettingsFieldsColStyle}>
        {leftFields.map((field) => (
          <NatSettingsFieldControl
            key={field.key}
            field={field}
            form={form}
            onChange={onChange}
            onCheckbox={onCheckbox}
          />
        ))}
      </div>
    </div>

    <div
      className="settings-dashboard-divider"
      style={fxsNatSettingsDashboardDividerCellStyle}
      aria-hidden="true"
    >
      <div style={fxsNatSettingsDashboardDividerLineStyle} />
    </div>

    <div style={fxsNatSettingsDashboardColumnStyle}>
      <NatSettingsSectionHeading title={rightSectionTitle} isFirst />
      <div style={fxsNatSettingsFieldsColStyle}>
        {rightFields.map((field) => (
          <NatSettingsFieldControl
            key={field.key}
            field={field}
            form={form}
            onChange={onChange}
            onCheckbox={onCheckbox}
          />
        ))}
      </div>
    </div>
  </div>
);
