import React from "react";
import { Tooltip } from "@mui/material";
import { ExtensionBreadcrumb } from "../../../components/common";
import {
  CALL_COUNT_BREADCRUMB_SEGMENTS,
  CALL_COUNT_FILTER_TOOLTIPS,
} from "../../../constants/CallCountConstants";
import { C } from "../../../theme/pbxTokens";
import {
  CALL_COUNT_FILTER_TOOLTIP_PROPS,
  callCountFilterBoxFillStyle,
  callCountFilterBoxStyle,
  callCountFilterFieldStyle,
  nativeFieldInteraction,
} from "./CallCountTableHelpers";
import { formatCallCountFilterTooltipTitle } from "../utils/CallCountTransformers";

export const CallCountBreadcrumb = ({ style } = {}) => (
  <ExtensionBreadcrumb
    root={CALL_COUNT_BREADCRUMB_SEGMENTS[0]}
    section={CALL_COUNT_BREADCRUMB_SEGMENTS[1]}
    current={CALL_COUNT_BREADCRUMB_SEGMENTS[2]}
    style={style}
  />
);

export const Pill = ({ text, bg, color }) => (
  <span style={{ background: bg, color, padding: "2px 8px", borderRadius: 999, fontSize: 10, fontWeight: 500, whiteSpace: "nowrap", display: "inline-block" }}>{text}</span>
);
const renderTooltipTitle = (text) => {
  const normalized = formatCallCountFilterTooltipTitle(text);
  return normalized.includes("\n") ? <span style={{ whiteSpace: "pre-line", display: "block" }}>{normalized}</span> : normalized;
};
export const FilterLabel = ({ children, tooltipKey }) => {
  const tooltip = tooltipKey ? CALL_COUNT_FILTER_TOOLTIPS[tooltipKey] : "";
  const label = <span style={{ fontSize: 11, fontWeight: 600, color: C.labelText, letterSpacing: "0.04em", textTransform: "uppercase", marginBottom: 6, display: "inline-block", cursor: tooltip ? "help" : undefined }}>{children}</span>;
  if (!tooltip) return label;
  return <Tooltip title={renderTooltipTitle(tooltip)} {...CALL_COUNT_FILTER_TOOLTIP_PROPS}>{label}</Tooltip>;
};
export const FilterField = ({ label, tooltipKey, children, style: extraStyle }) => (
  <div style={{ ...callCountFilterFieldStyle, ...extraStyle }}>{label && <FilterLabel tooltipKey={tooltipKey}>{label}</FilterLabel>}{children}</div>
);
export const FilterSelect = ({ value, onChange, options, "aria-label": ariaLabel, fill = false, style: extraStyle }) => (
  <select value={value} onChange={onChange} aria-label={ariaLabel} style={{ ...(fill ? callCountFilterBoxFillStyle : callCountFilterBoxStyle), cursor: "pointer", ...extraStyle }} {...nativeFieldInteraction}>
    {options.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
  </select>
);
export const FilterSearch = ({ value, onChange, placeholder = "Extension, number, IP, context, destination…" }) => (
  <input type="text" value={value} onChange={onChange} placeholder={placeholder} style={callCountFilterBoxStyle} {...nativeFieldInteraction} />
);
export const FilterDate = ({ value, onChange, "aria-label": ariaLabel, fill = false, style: extraStyle }) => (
  <input type="date" value={value} onChange={onChange} aria-label={ariaLabel} style={{ ...(fill ? callCountFilterBoxFillStyle : callCountFilterBoxStyle), cursor: "pointer", ...extraStyle }} {...nativeFieldInteraction} />
);
