import React from "react";
import { SIP_SIP_FIELD_TOOLTIPS, SIP_SIP_BREADCRUMB_ROOT, SIP_SIP_BREADCRUMB_SECTION, SIP_SIP_PAGE_TITLE, SIP_SIP_LABEL_EXTERNAL_BOUND, SIP_SIP_PLACEHOLDER_CALLED_PREFIX, SIP_SIP_CHECKBOX_ENABLE, SIP_SIP_RADIO_YES, SIP_SIP_RADIO_NO, SIP_SIP_SECTION_NETWORK, SIP_SIP_SECTION_REGISTRATION, SIP_SIP_NOTE, SIP_SIP_NOTE_LABEL } from "../../../../constants/SipSipConstants";
import { Checkbox, Tooltip, useMediaQuery } from "@mui/material";

import { Btn } from "../../../../components/common";
import { OUTLINED_BORDER, OUTLINED_HOVER, OUTLINED_FOCUS, FOCUS_RING_SHADOW } from "../../../../theme/pbxTokens";

import {
  SIP_NETWORK_SECTION_FIELDS,
  SIP_REGISTRATION_SECTION_FIELDS,
} from "../utils/SipSipTransformers";
import {
  isValidSipSipCalledPrefixInput,
  isValidSipSipDigitInput,
} from "../utils/SipSipValidators";
import {
  C,
  FIELD_RADIUS,
  SIP_SIP_COMPACT_MQ,
  SIP_SIP_SCROLL_CLASS,
  SIP_SIP_SECTION_HEADING_LEFT,
  SIP_SIP_SECTION_HEADING_COLOR,
  SIP_SIP_LABEL_COL_WIDTH,
  SIP_SIP_CONTROL_COL_WIDTH,
  SIP_SIP_FIELD_COL_GAP,
  SIP_SIP_LAPTOP_NARROW_MQ,
  sipFormTextStyle,
  advancedPageWrapStyle,
  advancedPageInnerStyle,
  valueColStyle,
  controlSlotStyle,
  checkboxSx,
  nativeRadioStyle,
  sipSipDashboardGridStyle,
  sipSipColumnStyle,
  sipSipDividerCellStyle,
  sipSipDividerLineStyle,
  dashboardFieldsStackStyle,
  formBodyStyle,
} from "./SipSipTableHelpers";

export { Btn as SipSipBtn };
export { SIP_SIP_COMPACT_MQ };

const SIP_SIP_TOOLTIP_PROPS = {
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
  labelColWidth = SIP_SIP_LABEL_COL_WIDTH,
}) => {
  const tooltip = tooltipKey ? SIP_SIP_FIELD_TOOLTIPS[tooltipKey] || "" : "";
  const labelNode = (
    <label
      style={{
        ...sipFormTextStyle,
        fontWeight: 600,
        flex: "0 0 auto",
        width: "100%",
        maxWidth: "100%",
        paddingRight: 0,
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
        gap: SIP_SIP_FIELD_COL_GAP,
      }}
    >
      <div style={labelWrapStyle}>
        {tooltip ? (
          <Tooltip
            title={formatFieldTooltipTitle(tooltip)}
            {...SIP_SIP_TOOLTIP_PROPS}
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
  el.style.boxShadow =
    typeof FOCUS_RING_SHADOW === "function"
      ? FOCUS_RING_SHADOW()
      : FOCUS_RING_SHADOW;
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
  width: SIP_SIP_CONTROL_COL_WIDTH,
  minWidth: SIP_SIP_CONTROL_COL_WIDTH,
  maxWidth: SIP_SIP_CONTROL_COL_WIDTH,
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
  width: SIP_SIP_CONTROL_COL_WIDTH,
  minWidth: SIP_SIP_CONTROL_COL_WIDTH,
  maxWidth: SIP_SIP_CONTROL_COL_WIDTH,
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

export const SipSipSectionHeading = ({ title, isFirst = false }) => {
  const isLaptopNarrow = useMediaQuery(SIP_SIP_LAPTOP_NARROW_MQ);
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
          left: isLaptopNarrow ? 0 : SIP_SIP_SECTION_HEADING_LEFT,
          background: C.cardBg,
          paddingRight: 8,
          fontSize: 14,
          fontWeight: 600,
          color: SIP_SIP_SECTION_HEADING_COLOR,
        }}
      >
        {title}
      </span>
    </div>
  );
};

export const SipSipScrollbarStyles = () => (
  <style>{`
    .${SIP_SIP_SCROLL_CLASS} {
      scroll-behavior: smooth;
      scrollbar-gutter: stable;
      scrollbar-width: thin;
      scrollbar-color: rgba(100, 116, 139, 0.45) transparent;
    }
    .${SIP_SIP_SCROLL_CLASS}::-webkit-scrollbar {
      width: 8px;
      height: 8px;
      transition: width 0.2s ease, height 0.2s ease;
    }
    .${SIP_SIP_SCROLL_CLASS}::-webkit-scrollbar:hover {
      width: 11px;
      height: 11px;
    }
    .${SIP_SIP_SCROLL_CLASS}::-webkit-scrollbar-corner {
      background: transparent;
    }
    .${SIP_SIP_SCROLL_CLASS}::-webkit-scrollbar-track {
      background: transparent;
    }
    .${SIP_SIP_SCROLL_CLASS}::-webkit-scrollbar-thumb {
      background-color: rgba(100, 116, 139, 0.45);
      border-radius: 6px;
      border: 2px solid transparent;
      background-clip: padding-box;
      transition: background-color 0.2s ease;
    }
    .${SIP_SIP_SCROLL_CLASS}::-webkit-scrollbar-thumb:hover {
      background-color: rgba(71, 85, 105, 0.65);
    }
  `}</style>
);

export const SipSipBreadcrumb = () => (
  <div
    style={{
      fontSize: 12,
      color: "#94a3b8",
      marginBottom: 16,
      fontWeight: 400,
      display: "flex",
      alignItems: "center",
      gap: 4,
      flexWrap: "wrap",
      flexShrink: 0,
      width: "100%",
    }}
  >
    <span>{SIP_SIP_BREADCRUMB_ROOT}</span>
    <span>&gt;</span>
    <span>{SIP_SIP_BREADCRUMB_SECTION}</span>
    <span>&gt;</span>
    <span style={{ color: "#1e293b", fontWeight: 600 }}>{SIP_SIP_PAGE_TITLE}</span>
  </div>
);

export const AdvancedPageShell = ({ children, isCompact }) => (
  <div
    className={SIP_SIP_SCROLL_CLASS}
    style={{
      ...advancedPageWrapStyle,
      ...(isCompact ? { padding: 8 } : {}),
    }}
    data-native-scroll
  >
    <div style={advancedPageInnerStyle}>{children}</div>
  </div>
);

export const renderSipSipFormField = ({
  field,
  form,
  isCompact,
  handleChange,
  handleCheckbox,
  isFieldVisible,
}) => {
  if (!isFieldVisible(field)) return null;

  const fieldLabel =
    field.key === "externalBound"
      ? SIP_SIP_LABEL_EXTERNAL_BOUND
      : field.label;

  const labelColWidth = isCompact ? 160 : SIP_SIP_LABEL_COL_WIDTH;

  return (
    <SipFieldRow
      key={field.key}
      label={fieldLabel}
      tooltipKey={field.key}
      labelColWidth={labelColWidth}
      labelStyle={
        field.key === "externalBound" ? { whiteSpace: "normal" } : {}
      }
    >
      <div style={valueColStyle}>
        <div style={controlSlotStyle}>
          {field.type === "text" && (
            <input
              type={field.key === "calledPrefix" ? "text" : "number"}
              value={form[field.key]}
              style={fieldInputStyle}
              {...nativeFieldInteraction}
              onChange={(e) => {
                const value = e.target.value;
                if (field.key === "calledPrefix") {
                  if (isValidSipSipCalledPrefixInput(value)) {
                    handleChange(field.key, value);
                  }
                } else if (isValidSipSipDigitInput(value)) {
                  handleChange(field.key, value);
                }
              }}
              placeholder={
                field.key === "calledPrefix"
                  ? SIP_SIP_PLACEHOLDER_CALLED_PREFIX
                  : ""
              }
            />
          )}

          {field.type === "select" && (
            <select
              value={form[field.key]}
              onChange={(e) => handleChange(field.key, e.target.value)}
              style={fieldSelectStyle}
              {...nativeFieldInteraction}
            >
              {field.options.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          )}

          {field.type === "checkbox" && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                minHeight: 32,
                gap: 8,
                width: SIP_SIP_CONTROL_COL_WIDTH,
                justifyContent: "flex-start",
              }}
            >
              <Checkbox
                size="small"
                checked={!!form[field.key]}
                onChange={() => handleCheckbox(field.key)}
                sx={checkboxSx}
              />
              {field.key === "workingPeriod" ? (
                field.labelAfter && (
                  <span style={sipFormTextStyle}>{field.labelAfter}</span>
                )
              ) : (
                <>
                  <span style={sipFormTextStyle}>{SIP_SIP_CHECKBOX_ENABLE}</span>
                  {field.labelAfter && (
                    <span style={sipFormTextStyle}>{field.labelAfter}</span>
                  )}
                </>
              )}
            </div>
          )}

          {field.type === "radio" && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                minHeight: 32,
                gap: 16,
                width: SIP_SIP_CONTROL_COL_WIDTH,
                justifyContent: "flex-start",
              }}
            >
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  cursor: "pointer",
                  ...sipFormTextStyle,
                }}
              >
                <input
                  type="radio"
                  name={field.key}
                  value="Yes"
                  checked={form[field.key] === "Yes"}
                  onChange={() => handleChange(field.key, "Yes")}
                  style={nativeRadioStyle}
                />
                {SIP_SIP_RADIO_YES}
              </label>
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  cursor: "pointer",
                  ...sipFormTextStyle,
                }}
              >
                <input
                  type="radio"
                  name={field.key}
                  value="No"
                  checked={form[field.key] === "No"}
                  onChange={() => handleChange(field.key, "No")}
                  style={nativeRadioStyle}
                />
                {SIP_SIP_RADIO_NO}
              </label>
            </div>
          )}
        </div>
      </div>
    </SipFieldRow>
  );
};

export const SipSipFormBody = ({
  form,
  isCompact,
  handleChange,
  handleCheckbox,
  isFieldVisible,
}) => (
  <div style={formBodyStyle}>
    <div className="settings-dashboard-grid" style={sipSipDashboardGridStyle(isCompact)}>
      <div style={sipSipColumnStyle(isCompact)}>
        <SipSipSectionHeading title={SIP_SIP_SECTION_NETWORK} isFirst />
        <div style={dashboardFieldsStackStyle}>
          {SIP_NETWORK_SECTION_FIELDS.map((field) =>
            renderSipSipFormField({
              field,
              form,
              isCompact,
              handleChange,
              handleCheckbox,
              isFieldVisible,
            }),
          )}
        </div>
      </div>

      {!isCompact && (
        <div className="settings-dashboard-divider" style={sipSipDividerCellStyle} aria-hidden="true">
          <div style={sipSipDividerLineStyle} />
        </div>
      )}

      <div style={sipSipColumnStyle(isCompact)}>
        <SipSipSectionHeading title={SIP_SIP_SECTION_REGISTRATION} isFirst />
        <div style={dashboardFieldsStackStyle}>
          {SIP_REGISTRATION_SECTION_FIELDS.map((field) =>
            renderSipSipFormField({
              field,
              form,
              isCompact,
              handleChange,
              handleCheckbox,
              isFieldVisible,
            }),
          )}
        </div>

        {SIP_SIP_NOTE && (
          <div style={{ marginTop: 12 }}>
            <div
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: C.strongText,
                marginBottom: 8,
              }}
            >
              {SIP_SIP_NOTE_LABEL}
            </div>
            <div style={{ width: "100%", boxSizing: "border-box" }}>
              <p
                style={{
                  margin: 0,
                  color: C.mutedText,
                  fontSize: 11,
                  lineHeight: 1.5,
                  whiteSpace: "normal",
                  overflowWrap: "break-word",
                  wordBreak: "break-word",
                  textAlign: "left",
                }}
              >
                {SIP_SIP_NOTE.replace(/^Note:\s*/i, "")}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  </div>
);

