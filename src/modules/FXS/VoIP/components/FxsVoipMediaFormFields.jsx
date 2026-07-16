import React from "react";
import { FXS_MEDIA_FIELD_TOOLTIPS, FXS_VOIP_MEDIA_SECTION_HEADING_COLOR, FXS_VOIP_MEDIA_SECTION_HEADING_LEFT, FXS_VOIP_MEDIA_BREADCRUMB_SECTION, FXS_VOIP_MEDIA_PAGE_TITLE, FXS_VOIP_MEDIA_NOTE_LABEL, MEDIA_PARAMETERS_NOTE } from "../../../../constants/MediaParametersConstants";
import { Tooltip, useMediaQuery } from "@mui/material";


import {
  C,
  FOCUS_RING_SHADOW,
  OUTLINED_BORDER,
  OUTLINED_FOCUS,
  OUTLINED_HOVER,
} from "../../../../theme/pbxTokens";
import { ExtensionBreadcrumb as FxsBreadcrumb, ExtensionCodecDualList as FxsVoipMediaCodecDualList } from "../../../../components/common";
import { handleFxsVoipMediaKeyPress } from "../utils/FxsVoipMediaValidators";
import {
  FXS_VOIP_MEDIA_FIELD_RADIUS,
  FXS_VOIP_MEDIA_LAPTOP_NARROW_MQ,
  fxsVoipMediaDashboardColumnStyle,
  fxsVoipMediaDashboardDividerCellStyle,
  fxsVoipMediaDashboardDividerLineStyle,
  fxsVoipMediaDashboardGridStyle,
  fxsVoipMediaFieldsColStyle,
  fxsVoipMediaNoteLineStyle,
  fxsVoipMediaNoteTitleStyle,
  fxsVoipMediaPageInnerStyle,
  fxsVoipMediaPageWrapStyle,
} from "./FxsVoipMediaTableHelpers";

const FIELD_LABEL_COLOR = "#3E5475";

const MEDIA_FIELD_TOOLTIP_PROPS = {
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

export const formatFxsVoipMediaTooltipTitle = (text) => {
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

export const FxsVoipMediaTooltipLabel = ({ tooltipKey, children, style = {} }) => {
  const tooltip = tooltipKey ? FXS_MEDIA_FIELD_TOOLTIPS[tooltipKey] || "" : "";
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
      title={formatFxsVoipMediaTooltipTitle(tooltip)}
      {...MEDIA_FIELD_TOOLTIP_PROPS}
    >
      {labelNode}
    </Tooltip>
  );
};

export const FxsVoipMediaFieldRow = ({ label, tooltipKey, children, labelStyle = {} }) => {
  const tooltip = tooltipKey ? FXS_MEDIA_FIELD_TOOLTIPS[tooltipKey] || "" : "";
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
        ...labelStyle,
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
          title={formatFxsVoipMediaTooltipTitle(tooltip)}
          {...MEDIA_FIELD_TOOLTIP_PROPS}
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

export const fxsVoipMediaNativeFieldInteraction = {
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
  height: 32,
  width: "100%",
  maxWidth: 220,
  padding: "0 10px",
  fontSize: 13,
  border: `1px solid ${OUTLINED_BORDER}`,
  borderRadius: FXS_VOIP_MEDIA_FIELD_RADIUS,
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
  minHeight: 32,
  height: 32,
  padding: "4px 28px 4px 10px",
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
  justifyContent: "flex-end",
};

export const FxsVoipMediaSectionHeading = ({
  title,
  tooltipKey,
  isFirst = false,
}) => {
  const isLaptopNarrow = useMediaQuery(FXS_VOIP_MEDIA_LAPTOP_NARROW_MQ);
  const titleStyle = {
    fontSize: 14,
    fontWeight: 600,
    color: FXS_VOIP_MEDIA_SECTION_HEADING_COLOR,
  };
  const titleNode = tooltipKey ? (
    <FxsVoipMediaTooltipLabel tooltipKey={tooltipKey} style={titleStyle}>
      {title}
    </FxsVoipMediaTooltipLabel>
  ) : (
    <span style={titleStyle}>{title}</span>
  );

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
          left: isLaptopNarrow ? 0 : FXS_VOIP_MEDIA_SECTION_HEADING_LEFT,
          background: C.cardBg,
          paddingRight: 8,
          display: "inline-flex",
          alignItems: "center",
        }}
      >
        {titleNode}
      </span>
    </div>
  );
};

export const FxsVoipMediaBreadcrumb = () => (
  <FxsBreadcrumb
    root="FXS"
    section={FXS_VOIP_MEDIA_BREADCRUMB_SECTION}
    current={FXS_VOIP_MEDIA_PAGE_TITLE}
    style={{ flexShrink: 0 }}
  />
);

export const FxsVoipMediaPageShell = ({ children }) => (
  <div style={fxsVoipMediaPageWrapStyle} data-native-scroll>
    <div style={fxsVoipMediaPageInnerStyle}>{children}</div>
  </div>
);

export const FxsVoipMediaFormGrid = ({
  leftSectionTitle,
  rightSectionTitle,
  mediaParameterRows,
  formData,
  onInputChange,
  allCodecOptions,
  selectedCodecs,
  onCodecChange,
  getCodecLabel,
}) => {
  const fieldStyle = { ...nativeFieldInputStyle, width: "100%" };
  const fieldSelectStyle = { ...nativeFieldSelectStyle, width: "100%" };

  return (
    <div className="settings-dashboard-grid" style={fxsVoipMediaDashboardGridStyle}>
      <div style={fxsVoipMediaDashboardColumnStyle}>
        <FxsVoipMediaSectionHeading title={leftSectionTitle} isFirst />
        <div style={fxsVoipMediaFieldsColStyle}>
          {mediaParameterRows.map((row) => (
            <FxsVoipMediaFieldRow
              key={row.name}
              label={row.label}
              tooltipKey={row.name}
            >
              <div style={valueColStyle}>
                <div style={controlSlotStyle}>
                  {row.type === "select" ? (
                    <select
                      name={row.name}
                      value={formData[row.name]}
                      onChange={onInputChange}
                      style={fieldSelectStyle}
                      {...fxsVoipMediaNativeFieldInteraction}
                    >
                      {row.options.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      name={row.name}
                      value={formData[row.name]}
                      onChange={onInputChange}
                      onKeyPress={(e) =>
                        handleFxsVoipMediaKeyPress(e, row.keyPress || "number")
                      }
                      style={fieldStyle}
                      {...fxsVoipMediaNativeFieldInteraction}
                      maxLength="31"
                    />
                  )}
                </div>
              </div>
            </FxsVoipMediaFieldRow>
          ))}
        </div>
      </div>

      <div
        className="settings-dashboard-divider"
        style={fxsVoipMediaDashboardDividerCellStyle}
        aria-hidden="true"
      >
        <div style={fxsVoipMediaDashboardDividerLineStyle} />
      </div>

      <div style={fxsVoipMediaDashboardColumnStyle}>
        <FxsVoipMediaSectionHeading
          title={rightSectionTitle}
          tooltipKey="codecPriority"
          isFirst
        />
        <FxsVoipMediaCodecDualList
          allOptions={allCodecOptions}
          selected={selectedCodecs}
          onChange={onCodecChange}
          getLabel={getCodecLabel}
          emptyTextAvailable="Available codecs"
          emptyTextSelected="No selected codecs"
        />

        <div style={{ marginTop: 12 }}>
          <div style={fxsVoipMediaNoteTitleStyle}>{FXS_VOIP_MEDIA_NOTE_LABEL}</div>
          <div style={{ width: "100%", boxSizing: "border-box" }}>
            {MEDIA_PARAMETERS_NOTE.split("\n")
              .filter(Boolean)
              .map((line, index) => (
                <p
                  key={index}
                  style={{
                    ...fxsVoipMediaNoteLineStyle,
                    margin: index === 0 ? 0 : "8px 0 0",
                  }}
                >
                  {line}
                </p>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};
