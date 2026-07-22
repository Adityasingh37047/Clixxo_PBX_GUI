import React from "react";
import {
  FXS_SIP_FIELD_TOOLTIPS, FXS_VOIP_SIP_SECTION_HEADING_LEFT, FXS_VOIP_SIP_SECTION_HEADING_COLOR, FXS_VOIP_SIP_BREADCRUMB_SECTION, FXS_VOIP_SIP_PAGE_TITLE } from "../../../../constants/FxsVoipSipConstants";
import { Checkbox, Tooltip, useMediaQuery } from "@mui/material";


import {
  C,
  FOCUS_RING_SHADOW,
  OUTLINED_BORDER,
  OUTLINED_FOCUS,
  OUTLINED_HOVER,
} from "../../../../theme/pbxTokens";
import { ExtensionBreadcrumb as FxsBreadcrumb,
  extensionTableCheckboxSx as fxsVoipSipCheckboxSx,
} from "../../../../components/common";
import { getFxsVoipSipRegisterStatusDisplay } from "../utils/FxsVoipSipTransformers";
import { shouldShowFxsVoipSipField } from "../utils/FxsVoipSipValidators";
import {
  FXS_VOIP_SIP_FIELD_RADIUS,
  FXS_VOIP_SIP_LAPTOP_NARROW_MQ,
  fxsVoipSipDashboardColumnStyle,
  fxsVoipSipDashboardDividerCellStyle,
  fxsVoipSipDashboardDividerLineStyle,
  fxsVoipSipDashboardGridStyle,
  fxsVoipSipFieldsColStyle,
  fxsVoipSipPageInnerStyle,
  fxsVoipSipPageWrapStyle,
} from "./FxsVoipSipTableHelpers";

export { fxsVoipSipCheckboxSx };


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

export const formatFxsVoipSipFieldTooltipTitle = (text) => {
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

export const getFxsVoipSipNativeFieldInteraction = (disabled) =>
  disabled ? {} : nativeFieldInteraction;

const nativeFieldInputStyle = {
  height: 36,
  width: "100%",
  maxWidth: 220,
  padding: "0 12px",
  fontSize: 13,
  border: `1px solid ${OUTLINED_BORDER}`,
  borderRadius: FXS_VOIP_SIP_FIELD_RADIUS,
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



export const FxsVoipSipFieldRow = ({ label, tooltipKey, children }) => {
  const tooltip = tooltipKey ? FXS_SIP_FIELD_TOOLTIPS[tooltipKey] || "" : "";
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
          title={formatFxsVoipSipFieldTooltipTitle(tooltip)}
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

export const FxsVoipSipSectionHeading = ({ title, isFirst = false }) => {
  const isLaptopNarrow = useMediaQuery(FXS_VOIP_SIP_LAPTOP_NARROW_MQ);
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
          left: isLaptopNarrow ? 0 : FXS_VOIP_SIP_SECTION_HEADING_LEFT,
          background: C.cardBg,
          paddingRight: 8,
          fontSize: 14,
          fontWeight: 600,
          color: FXS_VOIP_SIP_SECTION_HEADING_COLOR,
        }}
      >
        {title}
      </span>
    </div>
  );
};

export const FxsVoipSipBreadcrumb = () => (
  <FxsBreadcrumb
    root="FXS"
    section={FXS_VOIP_SIP_BREADCRUMB_SECTION}
    current={FXS_VOIP_SIP_PAGE_TITLE}
    style={{ flexShrink: 0 }}
  />
);

export const FxsVoipSipPageShell = ({ children }) => (
  <div style={fxsVoipSipPageWrapStyle} data-native-scroll>
    <div style={fxsVoipSipPageInnerStyle}>{children}</div>
  </div>
);

const valueColStyle = {
  flex: "1 1 auto",
  minWidth: 0,
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-end",
  justifyContent: "center",
};

const controlSlotStyle = {
  width: 220,
  maxWidth: "100%",
  flexShrink: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-start",
};

export const FxsVoipSipFieldControl = ({
  field,
  form,
  registrationMode,
  saving,
  onChange,
  onCheckbox,
}) => {
  if (!shouldShowFxsVoipSipField(form, field)) return null;

  const fieldInputStyle = { ...nativeFieldInputStyle, width: "100%" };
  const fieldSelectStyle = { ...nativeFieldSelectStyle, width: "100%" };
  const sipFieldInteraction = getFxsVoipSipNativeFieldInteraction(saving);
  const fieldReadonlyStyle = {
    ...fieldInputStyle,
    backgroundColor: "#f1f5f9",
    lineHeight: "36px",
    height: 36,
    whiteSpace: "normal",
    wordBreak: "break-word",
  };

  return (
    <FxsVoipSipFieldRow key={field.key} label={field.label} tooltipKey={field.key}>
      <div style={valueColStyle}>
        {field.type === "readonly" && (
          <div style={controlSlotStyle}>
            <div
              style={{
                ...fieldReadonlyStyle,
                width: "100%",
                ...(field.key === "registerStatus"
                  ? {
                      whiteSpace: "nowrap",
                      textAlign: "center",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }
                  : {}),
              }}
            >
              {field.key === "registerStatus"
                ? getFxsVoipSipRegisterStatusDisplay(
                    registrationMode,
                    form.registerStatus,
                  )
                : form[field.key]}
            </div>
          </div>
        )}

        {field.type === "text" && (
          <div style={controlSlotStyle}>
            <input
              type="text"
              value={form[field.key] || ""}
              onChange={(e) => onChange(field.key, e.target.value)}
              style={fieldInputStyle}
              disabled={saving}
              {...sipFieldInteraction}
            />
          </div>
        )}

        {field.type === "select" && (
          <div style={controlSlotStyle}>
            <select
              value={form[field.key] || ""}
              onChange={(e) => onChange(field.key, e.target.value)}
              style={fieldSelectStyle}
              disabled={saving}
              {...sipFieldInteraction}
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
              disabled={saving}
              sx={fxsVoipSipCheckboxSx}
            />
          </div>
        )}

        {field.helper && (
          <div
            style={{
              width: 220,
              maxWidth: "100%",
              color: C.amber,
              fontSize: 11,
              marginTop: 4,
              wordWrap: "break-word",
              textAlign: "left",
            }}
          >
            {field.helper}
          </div>
        )}
      </div>
    </FxsVoipSipFieldRow>
  );
};

export const FxsVoipSipFormGrid = ({
  leftSectionTitle,
  rightSectionTitle,
  leftFields,
  rightFields,
  note,
  form,
  registrationMode,
  saving,
  onChange,
  onCheckbox,
}) => (
  <div className="settings-dashboard-grid" style={fxsVoipSipDashboardGridStyle}>
    <div style={fxsVoipSipDashboardColumnStyle}>
      <FxsVoipSipSectionHeading title={leftSectionTitle} isFirst />
      <div style={fxsVoipSipFieldsColStyle}>
        {leftFields.map((field) => (
          <FxsVoipSipFieldControl
            key={field.key}
            field={field}
            form={form}
            registrationMode={registrationMode}
            saving={saving}
            onChange={onChange}
            onCheckbox={onCheckbox}
          />
        ))}
      </div>
    </div>

    <div
      className="settings-dashboard-divider"
      style={fxsVoipSipDashboardDividerCellStyle}
      aria-hidden="true"
    >
      <div style={fxsVoipSipDashboardDividerLineStyle} />
    </div>

    <div style={fxsVoipSipDashboardColumnStyle}>
      <FxsVoipSipSectionHeading title={rightSectionTitle} isFirst />
      <div style={fxsVoipSipFieldsColStyle}>
        {rightFields.map((field) => (
          <FxsVoipSipFieldControl
            key={field.key}
            field={field}
            form={form}
            registrationMode={registrationMode}
            saving={saving}
            onChange={onChange}
            onCheckbox={onCheckbox}
          />
        ))}
      </div>
      {note ? <div style={{ fontSize: 11, color: C.amber, marginTop: 16, textAlign: "left", lineHeight: 1.45 }}>{note}</div> : null}
    </div>
  </div>
);
