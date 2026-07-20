import React from "react";
import {
  SIP_MEDIA_FIELD_TOOLTIPS,
  SIP_MEDIA_SECTION_HEADING_LEFT,
  SIP_MEDIA_PAGE_BREADCRUMB_ROOT,
  SIP_MEDIA_PAGE_BREADCRUMB_SECTION,
  SIP_MEDIA_PAGE_TITLE,
  SIP_MEDIA_CODEC_FIELD,
  SIP_MEDIA_SECTION_RTP_DTMF,
  SIP_MEDIA_SECTION_JITTER_CODEC,
  SIP_MEDIA_SECTION_HEADING_COLOR,
} from "../../../../constants/SipMediaConstants";
import { Tooltip, useMediaQuery } from "@mui/material";

import { Btn, ExtensionBreadcrumb } from "../../../../components/common";
import {
  C,
  OUTLINED_BORDER,
  OUTLINED_HOVER,
  OUTLINED_FOCUS,
  FOCUS_RING_SHADOW,
} from "../../../../theme/pbxTokens";

import {
  MEDIA_LEFT_COLUMN_FIELDS,
  MEDIA_RIGHT_COLUMN_FIELDS,
} from "../utils/SipMediaTransformers";
import {
  FIELD_RADIUS,
  SIP_MEDIA_COMPACT_MQ,
  SIP_MEDIA_SCROLL_CLASS,
  SIP_MEDIA_LABEL_COL_WIDTH,
  SIP_MEDIA_CONTROL_COL_WIDTH,
  SIP_MEDIA_FIELD_COL_GAP,
  SIP_MEDIA_LAPTOP_NARROW_MQ,
  sipFormTextStyle,
  advancedPageWrapStyle,
  advancedPageInnerStyle,
  sipMediaDashboardGridStyle,
  sipMediaColumnStyle,
  sipMediaDividerCellStyle,
  sipMediaDividerLineStyle,
  dashboardFieldsStackStyle,
  valueColStyle,
  controlSlotStyle,
} from "./SipMediaTableHelpers";

export { Btn as SipMediaBtn };
export { SIP_MEDIA_COMPACT_MQ };

const SIP_MEDIA_TOOLTIP_PROPS = {
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

export const SipFieldRow = ({
  label,
  tooltipKey,
  children,
  labelStyle = {},
  labelColWidth = SIP_MEDIA_LABEL_COL_WIDTH,
}) => {
  const tooltip = tooltipKey ? SIP_MEDIA_FIELD_TOOLTIPS[tooltipKey] || "" : "";
  const labelNode = (
    <label
      style={{
        ...sipFormTextStyle,
        fontWeight: 600,
        flex: "0 0 auto",
        width: "100%",
        maxWidth: "100%",
        textAlign: "left",
        lineHeight: 1.4,
        whiteSpace: "normal",
        overflowWrap: "break-word",
        wordBreak: "break-word",
        cursor: tooltip ? "help" : undefined,
        ...labelStyle,
      }}
    >
      {label}
    </label>
  );

  const labelWrapStyle = {
    flex: `0 0 ${labelColWidth}px`,
    width: labelColWidth,
    maxWidth: labelColWidth,
    minWidth: labelColWidth,
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        alignItems: "flex-start",
        width: "100%",
        minHeight: 36,
        gap: SIP_MEDIA_FIELD_COL_GAP,
      }}
    >
      <div style={labelWrapStyle}>
        {tooltip ? (
          <Tooltip
            title={formatFieldTooltipTitle(tooltip)}
            {...SIP_MEDIA_TOOLTIP_PROPS}
          >
            {labelNode}
          </Tooltip>
        ) : (
          labelNode
        )}
      </div>
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

export const fieldInputStyle = {
  height: 32,
  width: SIP_MEDIA_CONTROL_COL_WIDTH,
  minWidth: SIP_MEDIA_CONTROL_COL_WIDTH,
  maxWidth: SIP_MEDIA_CONTROL_COL_WIDTH,
  padding: "0 10px",
  fontSize: 13,
  border: `1px solid ${OUTLINED_BORDER}`,
  borderRadius: FIELD_RADIUS,
  outline: "none",
  backgroundColor: "#fff",
  color: C.labelText,
  boxSizing: "border-box",
  boxShadow: "none",
  transition: "border-color 0.2s ease, box-shadow 0.2s ease",
};

export const fieldSelectStyle = {
  width: SIP_MEDIA_CONTROL_COL_WIDTH,
  minWidth: SIP_MEDIA_CONTROL_COL_WIDTH,
  maxWidth: SIP_MEDIA_CONTROL_COL_WIDTH,
  minHeight: 32,
  height: 32,
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

export const SipMediaSectionHeading = ({ title, isFirst = false }) => {
  const isLaptopNarrow = useMediaQuery(SIP_MEDIA_LAPTOP_NARROW_MQ);
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
          left: isLaptopNarrow ? 0 : SIP_MEDIA_SECTION_HEADING_LEFT,
          background: C.cardBg,
          paddingRight: 8,
          fontSize: 14,
          fontWeight: 600,
          color: SIP_MEDIA_SECTION_HEADING_COLOR,
        }}
      >
        {title}
      </span>
    </div>
  );
};

export const SipMediaScrollbarStyles = () => (
  <style>{`
    .${SIP_MEDIA_SCROLL_CLASS} {
      scroll-behavior: smooth;
      scrollbar-gutter: stable;
      scrollbar-width: thin;
      scrollbar-color: rgba(100, 116, 139, 0.45) transparent;
    }
    .${SIP_MEDIA_SCROLL_CLASS}::-webkit-scrollbar {
      width: 8px;
      height: 8px;
      transition: width 0.2s ease, height 0.2s ease;
    }
    .${SIP_MEDIA_SCROLL_CLASS}::-webkit-scrollbar:hover {
      width: 11px;
      height: 11px;
    }
    .${SIP_MEDIA_SCROLL_CLASS}::-webkit-scrollbar-corner {
      background: transparent;
    }
    .${SIP_MEDIA_SCROLL_CLASS}::-webkit-scrollbar-track {
      background: transparent;
    }
    .${SIP_MEDIA_SCROLL_CLASS}::-webkit-scrollbar-thumb {
      background-color: rgba(100, 116, 139, 0.45);
      border-radius: 6px;
      border: 2px solid transparent;
      background-clip: padding-box;
      transition: background-color 0.2s ease;
    }
    .${SIP_MEDIA_SCROLL_CLASS}::-webkit-scrollbar-thumb:hover {
      background-color: rgba(71, 85, 105, 0.65);
    }
  `}</style>
);

export const SipMediaBreadcrumb = () => (
  <ExtensionBreadcrumb
    root={SIP_MEDIA_PAGE_BREADCRUMB_ROOT}
    section={SIP_MEDIA_PAGE_BREADCRUMB_SECTION}
    current={SIP_MEDIA_PAGE_TITLE}
  />
);

export const AdvancedPageShell = ({ children, isCompact }) => (
  <div
    className={SIP_MEDIA_SCROLL_CLASS}
    style={{
      ...advancedPageWrapStyle,
      ...(isCompact ? { padding: 8 } : {}),
    }}
    data-native-scroll
  >
    <div style={advancedPageInnerStyle}>{children}</div>
  </div>
);

export const renderSipMediaFormField = ({
  field,
  formData,
  isCompact,
  handleInputChange,
  isFieldVisible,
}) => {
  if (!isFieldVisible(field)) return null;

  const labelColWidth = isCompact ? 160 : SIP_MEDIA_LABEL_COL_WIDTH;

  return (
    <SipFieldRow
      key={field.name}
      label={field.label}
      tooltipKey={field.name}
      labelColWidth={labelColWidth}
      labelStyle={
        field.name === SIP_MEDIA_CODEC_FIELD.name
          ? { whiteSpace: "normal" }
          : {}
      }
    >
      <div style={valueColStyle}>
        <div style={controlSlotStyle}>
          {field.type === "select" ? (
            <select
              name={field.name}
              value={formData[field.name]}
              onChange={handleInputChange}
              style={fieldSelectStyle}
              {...nativeFieldInteraction}
            >
              {field.options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          ) : (
            <input
              type="text"
              name={field.name}
              value={formData[field.name]}
              onChange={handleInputChange}
              style={fieldInputStyle}
              {...nativeFieldInteraction}
            />
          )}
        </div>
      </div>
    </SipFieldRow>
  );
};

export const SipMediaFormBody = ({
  formData,
  isCompact,
  handleInputChange,
  isFieldVisible,
}) => (
  <div className="settings-dashboard-grid" style={sipMediaDashboardGridStyle(isCompact)}>
    <div style={sipMediaColumnStyle(isCompact)}>
      <SipMediaSectionHeading title={SIP_MEDIA_SECTION_RTP_DTMF} isFirst />
      <div style={dashboardFieldsStackStyle}>
        {MEDIA_LEFT_COLUMN_FIELDS.map((field) =>
          renderSipMediaFormField({
            field,
            formData,
            isCompact,
            handleInputChange,
            isFieldVisible,
          }),
        )}
      </div>
    </div>

    {!isCompact && (
      <div
        className="settings-dashboard-divider"
        style={sipMediaDividerCellStyle}
        aria-hidden="true"
      >
        <div style={sipMediaDividerLineStyle} />
      </div>
    )}

    <div style={sipMediaColumnStyle(isCompact)}>
      <SipMediaSectionHeading title={SIP_MEDIA_SECTION_JITTER_CODEC} isFirst />
      <div style={dashboardFieldsStackStyle}>
        {MEDIA_RIGHT_COLUMN_FIELDS.map((field) =>
          renderSipMediaFormField({
            field,
            formData,
            isCompact,
            handleInputChange,
            isFieldVisible,
          }),
        )}
        {renderSipMediaFormField({
          field: SIP_MEDIA_CODEC_FIELD,
          formData,
          isCompact,
          handleInputChange,
          isFieldVisible,
        })}
      </div>
    </div>
  </div>
);
