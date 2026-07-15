import React from "react";

import { ExtensionBreadcrumb as FxsChromeBreadcrumb } from "../../../../components/common";

import { Tooltip } from "@mui/material";
import {
  RINGING_SCHEME_FIELD_TOOLTIPS,
  RINGING_SCHEME_MATCHING_OPTIONS,
  RINGING_SCHEME_PAGE_BREADCRUMB_SECTION,
  RINGING_SCHEME_PAGE_TITLE,
} from "../../../../constants/RingingSchemeConstants";
import {
  C,
  OUTLINED_BORDER,
  OUTLINED_FOCUS,
  OUTLINED_HOVER,
  FOCUS_RING_SHADOW,
} from "../../../../theme/pbxTokens";
import {
  RS_TD_STYLE,
  RS_TH_STYLE,
  getRingingSchemeLastTdStyle,
  getRingingSchemeMatchTdStyle,
  getRingingSchemeRowBg,
  ringingSchemePageWrapStyle,
  ringingSchemeTableShellStyle,
  ringingSchemeTableStyle,
  ringingSchemeThStyle,
  ringingSchemeFieldBg,
} from "./RingingSchemeTableHelpers";

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
const MATCHING_SELECT_WIDTH = 240;
const FIELD_CONTROL_HEIGHT = 32;

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

export const nativeSelectStyle = {
  width: "100%",
  minWidth: MATCHING_SELECT_WIDTH,
  maxWidth: MATCHING_SELECT_WIDTH,
  height: FIELD_CONTROL_HEIGHT,
  padding: "0 10px",
  fontSize: 13,
  border: `1px solid ${OUTLINED_BORDER}`,
  borderRadius: FIELD_RADIUS,
  outline: "none",
  backgroundColor: ringingSchemeFieldBg,
  color: C.valueText,
  boxSizing: "border-box",
  cursor: "pointer",
  transition: "border-color 0.2s ease, box-shadow 0.2s ease",
};

export const nativeInputStyle = {
  width: "100%",
  height: FIELD_CONTROL_HEIGHT,
  padding: "0 10px",
  fontSize: 12,
  border: `1px solid ${OUTLINED_BORDER}`,
  borderRadius: 6,
  outline: "none",
  backgroundColor: ringingSchemeFieldBg,
  color: C.valueText,
  boxSizing: "border-box",
  transition: "border-color 0.2s ease, box-shadow 0.2s ease",
};

const RingingSchemeTH = ({ children, align = "left", style: extraStyle }) => (
  <th
    style={{
      ...ringingSchemeThStyle,
      textAlign: align,
      ...extraStyle,
    }}
  >
    {children}
  </th>
);

export const RingingSchemeBreadcrumb = () => (
  <FxsChromeBreadcrumb root="FXS"
    section={RINGING_SCHEME_PAGE_BREADCRUMB_SECTION}
    current={RINGING_SCHEME_PAGE_TITLE}
  />
);

export const RingingSchemePageShell = ({ children }) => (
  <div style={ringingSchemePageWrapStyle}>{children}</div>
);

export const MatchingSchemeRow = ({ children }) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: 16,
      flexWrap: "wrap",
    }}
  >
    <div style={{ minWidth: 160, flexShrink: 0 }}>
      <FxsFieldLabel tooltipKey="ringScheme" tooltips={RINGING_SCHEME_FIELD_TOOLTIPS}>
        Matching Scheme
      </FxsFieldLabel>
    </div>
    <div style={{ flex: "0 0 auto" }}>{children}</div>
  </div>
);

export const RingingSchemeTable = ({
  formData,
  isCallerId,
  matchColumnLabel,
  matchColumnTooltip,
  onInputChange,
  onKeyPress,
  onKeyPress1,
}) => (
  <div style={ringingSchemeTableShellStyle}>
    <table style={ringingSchemeTableStyle}>
      <colgroup>
        <col style={{ width: "14%" }} />
        <col style={{ width: "38%" }} />
        <col style={{ width: "48%" }} />
      </colgroup>
      <thead>
        <tr>
          <RingingSchemeTH style={RS_TH_STYLE}>Scheme</RingingSchemeTH>
          <RingingSchemeTH style={RS_TH_STYLE}>
            <FxsFieldLabel
              tooltipKey={matchColumnTooltip}
              tooltips={RINGING_SCHEME_FIELD_TOOLTIPS}
            >
              {matchColumnLabel}
            </FxsFieldLabel>
          </RingingSchemeTH>
          <RingingSchemeTH style={{ ...RS_TH_STYLE, borderRight: "none" }}>
            <FxsFieldLabel
              tooltipKey="ringMode1"
              tooltips={RINGING_SCHEME_FIELD_TOOLTIPS}
            >
              Ringing Mode
            </FxsFieldLabel>
          </RingingSchemeTH>
        </tr>
      </thead>
      <tbody>
        {[1, 2, 3, 4].map((n, idx) => {
          const isLast = idx === 3;
          const rowBg = getRingingSchemeRowBg(idx);
          const matchField = isCallerId
            ? `ringCallerId${n}`
            : `ringAlertInfo${n}`;
          const matchTooltip = isCallerId
            ? `ringCallerId${n}`
            : `ringAlertInfo${n}`;

          return (
            <tr key={n} style={{ background: rowBg }}>
              <td
                style={{
                  ...RS_TD_STYLE,
                  fontSize: 12,
                  fontWeight: 600,
                  color: C.labelText,
                  ...getRingingSchemeMatchTdStyle(isLast),
                }}
              >
                Scheme {n}
              </td>
              <td
                style={{
                  ...RS_TD_STYLE,
                  ...getRingingSchemeMatchTdStyle(isLast),
                }}
              >
                <input
                  id={matchField}
                  type="text"
                  value={formData[matchField]}
                  onChange={(e) => onInputChange(matchField, e.target.value)}
                  onKeyPress={onKeyPress1}
                  maxLength={128}
                  style={nativeInputStyle}
                  title={RINGING_SCHEME_FIELD_TOOLTIPS[matchTooltip] || ""}
                  {...nativeFieldInteraction}
                />
              </td>
              <td
                style={{
                  ...RS_TD_STYLE,
                  ...getRingingSchemeLastTdStyle(isLast),
                }}
              >
                <input
                  id={`ringMode${n}`}
                  type="text"
                  value={formData[`ringMode${n}`]}
                  onChange={(e) =>
                    onInputChange(`ringMode${n}`, e.target.value)
                  }
                  onKeyPress={onKeyPress}
                  maxLength={128}
                  style={nativeInputStyle}
                  title={RINGING_SCHEME_FIELD_TOOLTIPS[`ringMode${n}`] || ""}
                  {...nativeFieldInteraction}
                />
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  </div>
);

export const RingingSchemeMatchingSelect = ({ value, onSchemeChange }) => (
  <select
    id="ringScheme"
    value={value}
    onChange={(e) => onSchemeChange(e.target.value)}
    style={nativeSelectStyle}
    {...nativeFieldInteraction}
  >
    {RINGING_SCHEME_MATCHING_OPTIONS.map((opt) => (
      <option key={opt.value} value={opt.value}>
        {opt.label}
      </option>
    ))}
  </select>
);
