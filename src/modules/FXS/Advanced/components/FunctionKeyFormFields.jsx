import React from "react";

import { ExtensionBreadcrumb as FxsChromeBreadcrumb } from "../../../../components/common";

import { Checkbox, Tooltip } from "@mui/material";
import {
  FUNCTION_KEY_FIELD_TOOLTIPS,
  FUNCTION_KEY_PAGE_BREADCRUMB_SECTION,
  FUNCTION_KEY_PAGE_TITLE,
} from "../../../../constants/FunctionKeyConstants";
import {
  C,
  OUTLINED_BORDER,
  OUTLINED_FOCUS,
  OUTLINED_HOVER,
  FOCUS_RING_SHADOW,
} from "../../../../theme/pbxTokens";
import {
  FK_CONTROL_HEIGHT,
  FK_CONTROL_WIDTH,
  FK_TD_STYLE,
  FK_TH_STYLE,
  functionKeyCheckboxSx,
  functionKeyPageWrapStyle,
  functionKeySectionBlockStyle,
  functionKeySectionTitleStyle,
  functionKeyTableShellStyle,
  functionKeyTableStyle,
  functionKeyThStyle,
  getFunctionKeyLastTdStyle,
  getFunctionKeyRowBg,
  getFunctionKeyTdStyle,
} from "./FunctionKeyTableHelpers";

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

export const keyInputStyle = (enabled) => ({
  width: "100%",
  maxWidth: FK_CONTROL_WIDTH,
  height: FK_CONTROL_HEIGHT,
  padding: "0 8px",
  fontSize: 12,
  fontFamily: '"SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace',
  letterSpacing: "0.03em",
  border: `1px solid ${OUTLINED_BORDER}`,
  borderRadius: 6,
  outline: "none",
  backgroundColor: enabled ? C.cardBg : "#f8fafc",
  color: enabled ? C.valueText : C.mutedText,
  boxSizing: "border-box",
  transition: "border-color 0.2s ease, box-shadow 0.2s ease",
});

export const modeSelectStyle = (enabled) => ({
  width: "100%",
  maxWidth: FK_CONTROL_WIDTH,
  height: FK_CONTROL_HEIGHT,
  padding: "0 8px",
  fontSize: 12,
  border: `1px solid ${OUTLINED_BORDER}`,
  borderRadius: 6,
  outline: "none",
  backgroundColor: enabled ? C.cardBg : "#f8fafc",
  color: enabled ? C.valueText : C.mutedText,
  boxSizing: "border-box",
  cursor: enabled ? "pointer" : "not-allowed",
  transition: "border-color 0.2s ease, box-shadow 0.2s ease",
});

const FunctionKeyTH = ({ children, align = "left", width, style: extraStyle }) => (
  <th
    style={{
      ...functionKeyThStyle,
      textAlign: align,
      width,
      ...extraStyle,
    }}
  >
    {children}
  </th>
);

export const FunctionKeyBreadcrumb = () => (
  <FxsChromeBreadcrumb root="FXS"
    section={FUNCTION_KEY_PAGE_BREADCRUMB_SECTION}
    current={FUNCTION_KEY_PAGE_TITLE}
  />
);

export const FunctionKeyPageShell = ({ children }) => (
  <div style={functionKeyPageWrapStyle}>{children}</div>
);

export const FunctionKeySectionTable = ({
  sectionName,
  fields,
  formData,
  onEnableChange,
  onModeChange,
  onFunctionKeyChange,
  onKeyPress,
}) => (
  <div
    style={functionKeySectionBlockStyle}
    id={`section-${sectionName.replace(/\s+/g, "-").toLowerCase()}`}
  >
    <div style={functionKeySectionTitleStyle}>{sectionName}</div>
    <div style={functionKeyTableShellStyle}>
      <table style={functionKeyTableStyle}>
        <colgroup>
          <col style={{ width: "46%" }} />
          <col style={{ width: "10%" }} />
          <col style={{ width: "22%" }} />
          <col style={{ width: "22%" }} />
        </colgroup>
        <thead>
          <tr>
            <FunctionKeyTH style={FK_TH_STYLE}>Function</FunctionKeyTH>
            <FunctionKeyTH align="center" style={FK_TH_STYLE}>
              Enable
            </FunctionKeyTH>
            <FunctionKeyTH align="center" style={FK_TH_STYLE}>
              Function Key
            </FunctionKeyTH>
            <FunctionKeyTH align="center" style={FK_TH_STYLE}>
              Mode
            </FunctionKeyTH>
          </tr>
        </thead>
        <tbody>
          {fields.map((field, idx) => {
            const enabled = formData[field.enableKey];
            const mode = formData[field.modeKey];
            const functionKey = formData[field.functionKeyKey];
            const isDefaultMode = mode === "0";
            const maxLength = field.isReboot ? 12 : 7;
            const rowBg = getFunctionKeyRowBg(enabled, idx);
            const isLast = idx === fields.length - 1;

            return (
              <tr
                key={field.id}
                style={{
                  background: rowBg,
                  opacity: enabled ? 1 : 0.72,
                }}
              >
                <td
                  style={{
                    ...FK_TD_STYLE,
                    fontSize: 12,
                    color: C.labelText,
                    fontWeight: 600,
                    ...getFunctionKeyTdStyle(isLast),
                  }}
                >
                  <FxsFieldLabel
                    tooltipKey={field.functionKeyKey}
                    tooltips={FUNCTION_KEY_FIELD_TOOLTIPS}
                  >
                    {field.name}
                  </FxsFieldLabel>
                </td>
                <td
                  style={{
                    ...FK_TD_STYLE,
                    textAlign: "center",
                    ...getFunctionKeyTdStyle(isLast),
                  }}
                >
                  <Checkbox
                    size="small"
                    checked={enabled}
                    onChange={() => onEnableChange(field)}
                    sx={functionKeyCheckboxSx}
                  />
                </td>
                <td
                  style={{
                    ...FK_TD_STYLE,
                    textAlign: "center",
                    ...getFunctionKeyTdStyle(isLast),
                  }}
                >
                  <input
                    id={field.functionKeyKey}
                    type="text"
                    value={functionKey}
                    onChange={(e) => onFunctionKeyChange(field, e.target.value)}
                    onKeyPress={onKeyPress}
                    disabled={!enabled || isDefaultMode}
                    maxLength={maxLength}
                    style={keyInputStyle(enabled && !isDefaultMode)}
                    {...nativeFieldInteraction}
                  />
                </td>
                <td
                  style={{
                    ...FK_TD_STYLE,
                    textAlign: "center",
                    ...getFunctionKeyLastTdStyle(isLast),
                  }}
                >
                  <select
                    value={mode}
                    onChange={(e) => onModeChange(field, e.target.value)}
                    disabled={!enabled}
                    style={modeSelectStyle(enabled)}
                    {...nativeFieldInteraction}
                  >
                    <option value="0">Default</option>
                    <option value="1">User-defined</option>
                  </select>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  </div>
);
