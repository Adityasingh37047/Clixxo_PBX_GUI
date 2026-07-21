import React from "react";
import { Tooltip } from "@mui/material";
import {
  C,
  OUTLINED_BORDER,
  OUTLINED_HOVER,
  OUTLINED_FOCUS,
  FOCUS_RING_SHADOW,
} from "../../theme/pbxTokens";
import { EXTENSION_TABLE_CARD_RADIUS } from "./modalKit";

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

const filterModalNativeFieldInteraction = {
  onFocus: (e) => {
    if (e.target.disabled) return;
    setFieldFocus(e.target);
  },
  onBlur: (e) => setFieldDefault(e.target),
  onMouseEnter: (e) => {
    if (e.target.disabled) return;
    if (document.activeElement === e.target) setFieldFocus(e.target);
    else setFieldHover(e.target);
  },
  onMouseLeave: (e) => {
    if (document.activeElement === e.target) setFieldFocus(e.target);
    else setFieldDefault(e.target);
  },
};

const filterModalControlBase = {
  height: 36,
  fontSize: 13,
  color: C.valueText,
  background: "#ffffff",
  border: `1px solid ${OUTLINED_BORDER}`,
  borderRadius: 4,
  padding: "0 12px",
  outline: "none",
  fontFamily: "Inter, sans-serif",
  transition: "border-color 0.2s ease, box-shadow 0.2s ease",
  boxSizing: "border-box",
  boxShadow: "none",
};

const filterModalBoxStyle = {
  ...filterModalControlBase,
  width: "100%",
};

const filterModalBoxFillStyle = {
  ...filterModalControlBase,
  width: "100%",
  minWidth: 0,
};

const FILTER_MODAL_FIELD_MAX_WIDTH = 260;
const FILTER_MODAL_TIME_RANGE_MAX_WIDTH = 260;
const FILTER_MODAL_COLUMN_GAP = 50;

const filterModalFieldStyle = {
  width: "100%",
  minWidth: 0,
  maxWidth: FILTER_MODAL_FIELD_MAX_WIDTH,
};

const FILTER_MODAL_TOOLTIP_PROPS = {
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

const filterModalLabelStyle = {
  fontSize: 11,
  fontWeight: 600,
  color: C.labelText,
  letterSpacing: "0.04em",
  textTransform: "uppercase",
  marginBottom: 6,
  display: "inline-block",
};

const filterModalPaperSx = {
  width: 660,
  maxWidth: "96vw",
  mx: "auto",
  p: 0,
  borderRadius: `${EXTENSION_TABLE_CARD_RADIUS}px`,
  overflow: "hidden",
  boxShadow:
    "0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)",
};

const filterModalTitleStyle = {
  background: "#1e2d42",
  color: "#ffffff",
  fontWeight: 600,
  fontSize: 16,
  textAlign: "center",
  padding: "16px 24px",
  borderTopLeftRadius: EXTENSION_TABLE_CARD_RADIUS,
  borderTopRightRadius: EXTENSION_TABLE_CARD_RADIUS,
};

const filterModalFormStyle = {
  width: "100%",
  background: "#f8fafc",
  border: `1px solid ${C.cardBorder}`,
  borderRadius: EXTENSION_TABLE_CARD_RADIUS,
  padding: 20,
  boxSizing: "border-box",
};

const filterModalGridStyle = (isCompact) => ({
  display: "grid",
  gridTemplateColumns: isCompact
    ? `${FILTER_MODAL_FIELD_MAX_WIDTH}px`
    : `${FILTER_MODAL_FIELD_MAX_WIDTH}px ${FILTER_MODAL_FIELD_MAX_WIDTH}px`,
  columnGap: FILTER_MODAL_COLUMN_GAP,
  rowGap: 8,
  width: "100%",
  justifyContent: "start",
});

const formatFilterModalTooltipTitle = (text) => {
  if (!text) return "";
  return text.replace(/<br\s*\/?>/gi, "\n").replace(/&quot;/g, '"');
};

const renderFilterModalTooltipTitle = (text) => {
  const normalized = formatFilterModalTooltipTitle(text);
  return normalized.includes("\n") ? (
    <span style={{ whiteSpace: "pre-line", display: "block" }}>{normalized}</span>
  ) : (
    normalized
  );
};

const FilterModalLabel = ({ children, tooltipKey, tooltips, style: extraStyle }) => {
  const tooltip = tooltipKey ? tooltips?.[tooltipKey] || "" : "";
  const label = (
    <span
      style={{
        ...filterModalLabelStyle,
        cursor: tooltip ? "help" : undefined,
        ...extraStyle,
      }}
    >
      {children}
    </span>
  );
  if (!tooltip) return label;
  return (
    <Tooltip title={renderFilterModalTooltipTitle(tooltip)} {...FILTER_MODAL_TOOLTIP_PROPS}>
      {label}
    </Tooltip>
  );
};

const FilterModalField = ({
  label,
  tooltipKey,
  tooltips,
  children,
  style: extraStyle,
  fieldStyle = filterModalFieldStyle,
}) => (
  <div style={{ ...fieldStyle, ...extraStyle }}>
    {label && (
      <FilterModalLabel tooltipKey={tooltipKey} tooltips={tooltips}>
        {label}
      </FilterModalLabel>
    )}
    {children}
  </div>
);

const FilterModalSelect = ({
  value,
  onChange,
  options,
  "aria-label": ariaLabel,
  fill = false,
  style: extraStyle,
}) => (
  <select
    value={value}
    onChange={onChange}
    aria-label={ariaLabel}
    style={{
      ...(fill ? filterModalBoxFillStyle : filterModalBoxStyle),
      cursor: "pointer",
      ...extraStyle,
    }}
    {...filterModalNativeFieldInteraction}
  >
    {options.map((opt) => (
      <option key={opt.value} value={opt.value}>
        {opt.label}
      </option>
    ))}
  </select>
);

const FilterModalSearch = ({
  value,
  onChange,
  placeholder = "Search…",
  style: extraStyle,
}) => (
  <input
    type="text"
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    style={{ ...filterModalBoxStyle, ...extraStyle }}
    {...filterModalNativeFieldInteraction}
  />
);

const FilterModalDate = ({
  value,
  onChange,
  "aria-label": ariaLabel,
  fill = false,
  style: extraStyle,
}) => (
  <input
    type="date"
    value={value}
    onChange={onChange}
    aria-label={ariaLabel}
    style={{
      ...(fill ? filterModalBoxFillStyle : filterModalBoxStyle),
      cursor: "pointer",
      ...extraStyle,
    }}
    {...filterModalNativeFieldInteraction}
  />
);

export {
  FILTER_MODAL_FIELD_MAX_WIDTH,
  FILTER_MODAL_TIME_RANGE_MAX_WIDTH,
  FILTER_MODAL_TOOLTIP_PROPS,
  FilterModalDate,
  FilterModalField,
  FilterModalLabel,
  FilterModalSearch,
  FilterModalSelect,
  filterModalBoxFillStyle,
  filterModalBoxStyle,
  filterModalFieldStyle,
  filterModalFormStyle,
  filterModalGridStyle,
  filterModalNativeFieldInteraction,
  filterModalPaperSx,
  filterModalTitleStyle,
  formatFilterModalTooltipTitle,
};
