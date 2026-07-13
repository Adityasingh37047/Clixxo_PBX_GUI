import React from "react";
import { Tooltip, useMediaQuery } from "@mui/material";
import { OUTBOUND_ROUTE_FIELD_TOOLTIPS } from "../../../constants/OutboundRouteConstants";
import { C } from "./OutboundRoutesTableHelpers";

const addNewModalFooterStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 12,
  width: "100%",
  margin: 0,
  padding: "16px 24px",
  boxSizing: "border-box",
  background: "#f8fafc",
  borderTop: `1px solid ${C.cardBorder}`,
  borderBottomLeftRadius: 4,
  borderBottomRightRadius: 4,
};

const addNewModalFooterBtnStyle = {
  height: 30,
  padding: "6px 14px",
  fontSize: 12,
  borderRadius: 4,
  minWidth: 100,
};

const addNewModalFooterCancelBtnStyle = {
  ...addNewModalFooterBtnStyle,
  background: "#cbd5e1",
  color: "#374151",
  border: "1px solid #cbd5e1",
  boxShadow: "0 1px 2px rgba(15, 23, 42, 0.08)",
};

const outboundRouteModalCancelBtnStyle = {
  ...addNewModalFooterBtnStyle,
  background: "#cbd5e1",
  color: "#374151",
  border: "1px solid #cbd5e1",
  borderRadius: 4,
  boxShadow: "0 1px 2px rgba(15, 23, 42, 0.08)",
};

const OUTBOUND_ROUTE_LIST_TRUNCATE_THRESHOLD = 10;
const OUTBOUND_ROUTE_LIST_DISPLAY_LIMIT = 6;

const formatOutboundRouteItemListDisplay = (
  items,
  {
    threshold = OUTBOUND_ROUTE_LIST_TRUNCATE_THRESHOLD,
    limit = OUTBOUND_ROUTE_LIST_DISPLAY_LIMIT,
    mapItem = (x) => String(x),
    separator = ", ",
    ellipsis = "....",
  } = {},
) => {
  if (!items?.length) return "";
  const labels = items.map(mapItem).filter((v) => v !== "" && v != null);
  if (!labels.length) return "";
  if (labels.length <= threshold) {
    return labels.join(separator);
  }
  return `${labels.slice(0, limit).join(separator)}${ellipsis}`;
};

const OUTBOUND_ROUTE_MODAL_SECTION_BG = "#f8fafc";
const OUTBOUND_ROUTE_MODAL_SECTION_HEADING_COLOR = "#30415A";

const OUTBOUND_ROUTE_TOOLTIP_PROPS = {
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
      },
    },
    arrow: {
      sx: { color: "#fff" },
    },
  },
};

const formatOutboundTooltipTitle = (text) => {
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

const OutboundFieldLabel = ({ tooltipKey, children, style = {} }) => {
  const tooltip = OUTBOUND_ROUTE_FIELD_TOOLTIPS[tooltipKey] || "";
  const label = (
    <span
      style={{
        fontSize: 13,
        color: C.labelText,
        fontWeight: 600,
        whiteSpace: "nowrap",
        cursor: tooltip ? "help" : undefined,
        ...style,
      }}
    >
      {children}
    </span>
  );
  if (!tooltip) return label;
  return (
    <Tooltip
      title={formatOutboundTooltipTitle(tooltip)}
      {...OUTBOUND_ROUTE_TOOLTIP_PROPS}
    >
      {label}
    </Tooltip>
  );
};

const OutboundRouteModalSectionHeading = ({ title, tooltipKey, isFirst = false }) => {
  const isLaptopNarrow = useMediaQuery("(max-width: 1366px)");
  const heading = (
    <span
      style={{
        position: "absolute",
        top: -10,
        left: isLaptopNarrow ? 0 : -6,
        background: OUTBOUND_ROUTE_MODAL_SECTION_BG,
        paddingRight: 8,
        fontSize: 14,
        fontWeight: 600,
        color: OUTBOUND_ROUTE_MODAL_SECTION_HEADING_COLOR,
        cursor: tooltipKey ? "help" : undefined,
      }}
    >
      {title}
    </span>
  );
  const tooltip = tooltipKey ? OUTBOUND_ROUTE_FIELD_TOOLTIPS[tooltipKey] : "";
  return (
    <div
      style={{
        margin: isFirst
          ? isLaptopNarrow
            ? "16px 0 24px 0"
            : "0 0 24px 0"
          : "16px 0 24px 0",
        position: "relative",
        width: "100%",
      }}
    >
      <div style={{ borderTop: `1px solid ${C.cardBorder}` }} />
      {tooltip ? (
        <Tooltip
          title={formatOutboundTooltipTitle(tooltip)}
          {...OUTBOUND_ROUTE_TOOLTIP_PROPS}
        >
          {heading}
        </Tooltip>
      ) : (
        heading
      )}
    </div>
  );
};

const OUTLINED_BORDER = "#d1d5db";
const OUTLINED_HOVER = "#9ca3af";
const OUTLINED_FOCUS = "#3E5475";
const FOCUS_RING_SHADOW = "0 0 0 2px rgba(62, 84, 117, 0.15)";

const outboundRouteOutlinedInputRootSx = {
  backgroundColor: "#fff",
  transition: "border-color 0.2s ease, box-shadow 0.2s ease",
  "& fieldset": {
    borderColor: OUTLINED_BORDER,
    transition: "border-color 0.2s ease, box-shadow 0.2s ease",
  },
  "&:hover fieldset": {
    borderColor: OUTLINED_HOVER,
  },
  "&.Mui-focused": {
    boxShadow: FOCUS_RING_SHADOW,
  },
  "&.Mui-focused fieldset": {
    borderColor: OUTLINED_FOCUS,
    borderWidth: "1px",
  },
  "&.Mui-focused:hover fieldset": {
    borderColor: OUTLINED_FOCUS,
    borderWidth: "1px",
  },
};

const outboundRouteModalTextFieldSx = {
  "& .MuiOutlinedInput-root": outboundRouteOutlinedInputRootSx,
  "& .MuiOutlinedInput-input": {
    backgroundColor: "#fff",
    fontSize: 13,
    padding: "8px 12px",
  },
};

const outboundRouteModalTextFieldFullSx = {
  ...outboundRouteModalTextFieldSx,
  width: "100%",
  "& .MuiOutlinedInput-root": {
    ...outboundRouteOutlinedInputRootSx,
    minHeight: 36,
    height: 36,
    fontSize: 13,
  },
  "& .MuiOutlinedInput-input": {
    padding: "7px 10px",
    fontSize: 13,
    boxSizing: "border-box",
    backgroundColor: "#fff",
  },
};

const outboundRouteModalSelectSx = {
  fontSize: 13,
  backgroundColor: "#fff",
  width: "100%",
  minHeight: 36,
  height: 36,
  ...outboundRouteOutlinedInputRootSx,
  "& .MuiOutlinedInput-notchedOutline": {
    borderColor: OUTLINED_BORDER,
    transition: "border-color 0.2s ease, box-shadow 0.2s ease",
  },
  "&:hover .MuiOutlinedInput-notchedOutline": {
    borderColor: OUTLINED_HOVER,
  },
  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
    borderColor: OUTLINED_FOCUS,
    borderWidth: "1px",
  },
  "& .MuiSelect-select": {
    display: "flex",
    alignItems: "center",
    padding: "7px 32px 7px 10px !important",
    lineHeight: 1.35,
    boxSizing: "border-box",
    fontSize: 13,
    backgroundColor: "#fff",
  },
};

const nativeFieldInputStyle = {
  height: 28,
  width: 200,
  padding: "0 8px",
  fontSize: 13,
  border: `1px solid ${OUTLINED_BORDER}`,
  borderRadius: 4,
  outline: "none",
  backgroundColor: "#fff",
  color: "#0f172a",
  boxSizing: "border-box",
  boxShadow: "none",
  transition: "border-color 0.2s ease, box-shadow 0.2s ease",
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

const getNativeFieldInteraction = (disabled) =>
  disabled ? {} : nativeFieldInteraction;

const outboundRouteModalPaperSx = {
  width: 900,
  maxWidth: "95vw",
  margin: 24,
  maxHeight: "calc(100vh - 80px - 48px)",
  display: "flex",
  flexDirection: "column",
  p: 0,
  borderRadius: 2,
  overflow: "hidden",
  boxShadow:
    "0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)",
};

const outboundRouteModalDialogContentSx = {
  maxHeight: "calc(100vh - 180px)",
  overflowY: "auto",
  WebkitOverflowScrolling: "touch",
};

const outboundRouteModalTitleStyle = {
  background: "#1e2d42",
  color: "#ffffff",
  fontWeight: 600,
  fontSize: 16,
  padding: "16px 24px",
  textAlign: "center",
  borderTopLeftRadius: 4,
  borderTopRightRadius: 4,
};

const outboundRouteModalFormStyle = {
  display: "flex",
  flexDirection: "column",
  gap: 14,
  width: "100%",
  maxWidth: "100%",
  boxSizing: "border-box",
  overflow: "hidden",
  background: "#f8fafc",
  border: `1px solid ${C.cardBorder}`,
  borderRadius: 4,
  padding: 20,
};

const OutboundRoutePagination = ({
  page,
  totalPages,
  recordCount,
  onPageChange,
  recordLabel = "record",
  style,
}) => (
  <div style={{ ...outboundRoutePaginationStyle, ...style }}>
    <span style={{ fontSize: 11, color: C.mutedText }}>
      Showing {recordCount} {recordLabel}
      {recordCount !== 1 ? "s" : ""} on page {page}
    </span>
    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
      <Btn
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        variant="outline"
        style={{ borderRadius: 4 }}
      >
        ← Prev
      </Btn>
      <span style={outboundRoutePageBadgeStyle}>
        Page {page} of {totalPages}
      </span>
      <Btn
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        variant="outline"
        style={{ borderRadius: 4 }}
      >
        Next →
      </Btn>
    </div>
  </div>
);

const OUTBOUND_ROUTE_MODAL_LABEL_WIDTH = 185;
const OUTBOUND_ROUTE_MODAL_FIELD_WIDTH = 210;
const OUTBOUND_ROUTE_RIGHT_LABEL_PADDING_LEFT = 28;

const FieldRow = ({
  label,
  tooltipKey,
  children,
  wide = false,
  labelWidth = 130,
}) => (
  <div
    style={{
      display: "flex",
      alignItems: wide ? "flex-start" : "center",
      gap: 12,
      width: "100%",
      minHeight: 36,
    }}
  >
    {tooltipKey ? (
      <OutboundFieldLabel
        tooltipKey={tooltipKey}
        style={{
          textAlign: "left",
          minWidth: labelWidth,
          width: "auto",
          flexShrink: 0,
          paddingTop: wide ? 4 : 0,
        }}
      >
        {label}
      </OutboundFieldLabel>
    ) : (
      <label
        style={{
          fontSize: 13,
          color: C.labelText,
          fontWeight: 600,
          whiteSpace: "nowrap",
          textAlign: "left",
          minWidth: labelWidth,
          width: "auto",
          flexShrink: 0,
          paddingTop: wide ? 4 : 0,
        }}
      >
        {label}
      </label>
    )}
    <div style={{ flex: 1, minWidth: 0, width: "100%" }}>{children}</div>
  </div>
);

const outboundRouteModalControlSx = {
  ...outboundRouteModalTextFieldFullSx,
  "& .MuiOutlinedInput-root": {
    ...outboundRouteModalTextFieldFullSx["& .MuiOutlinedInput-root"],
    height: 36,
    minHeight: 36,
  },
};

const OutboundLeftField = ({ children }) => (
  <div
    style={{
      width: OUTBOUND_ROUTE_MODAL_FIELD_WIDTH,
      maxWidth: "100%",
      minHeight: 36,
      display: "flex",
      alignItems: "center",
    }}
  >
    {children}
  </div>
);

const OutboundRightRow = ({
  label,
  tooltipKey,
  children,
  fieldWidth = OUTBOUND_ROUTE_MODAL_FIELD_WIDTH,
}) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: 12,
      width: "100%",
      minHeight: 36,
    }}
  >
    {tooltipKey ? (
      <OutboundFieldLabel
        tooltipKey={tooltipKey}
        style={{
          textAlign: "left",
          width: OUTBOUND_ROUTE_MODAL_LABEL_WIDTH,
          minWidth: OUTBOUND_ROUTE_MODAL_LABEL_WIDTH,
          flexShrink: 0,
          paddingLeft: OUTBOUND_ROUTE_RIGHT_LABEL_PADDING_LEFT,
          boxSizing: "border-box",
        }}
      >
        {label}
      </OutboundFieldLabel>
    ) : (
      <label
        style={{
          fontSize: 13,
          color: C.labelText,
          fontWeight: 600,
          whiteSpace: "nowrap",
          textAlign: "left",
          width: OUTBOUND_ROUTE_MODAL_LABEL_WIDTH,
          minWidth: OUTBOUND_ROUTE_MODAL_LABEL_WIDTH,
          flexShrink: 0,
          paddingLeft: OUTBOUND_ROUTE_RIGHT_LABEL_PADDING_LEFT,
          boxSizing: "border-box",
        }}
      >
        {label}
      </label>
    )}
    <div style={{ width: fieldWidth, flexShrink: 0 }}>{children}</div>
  </div>
);

const outboundRightColStyle = {
  display: "flex",
  flexDirection: "column",
  gap: 8,
  width: "100%",
};

const SectionCard = ({ title, tooltipKey, children, isFirst = false }) => (
  <div style={{ marginBottom: 8 }}>
    <OutboundRouteModalSectionHeading
      title={title}
      tooltipKey={tooltipKey}
      isFirst={isFirst}
    />
    <div>{children}</div>
  </div>
);

const outboundCompactInputStyle = {
  ...nativeFieldInputStyle,
  width: "100%",
  height: 36,
  padding: "7px 10px",
};

const outboundRouteDialPatternGridColumns =
  "1.2fr 0.8fr 0.8fr 0.8fr 0.8fr 36px";

const outboundRouteDialPatternIconSx = {
  fontSize: 18,
  fontWeight: 600,
  color: "#374151",
};

const OutboundRouteDialPatternActionBtn = ({
  onClick,
  "aria-label": ariaLabel,
  children,
  disabled = false,
}) => {
  const baseBg = "#cbd5e1";
  const hoverBg = "#b6c2d3";
  const activeBg = "#a3b1c2";
  const baseShadow = "0 1px 2px rgba(15, 23, 42, 0.08)";

  const clearPressStyle = (el) => {
    el.style.transform = "";
    el.style.boxShadow = baseShadow;
  };

  const applyPressStyle = (el) => {
    el.style.background = activeBg;
    el.style.transform = "translateY(1px) scale(0.98)";
    el.style.boxShadow = "inset 0 2px 4px rgba(15, 23, 42, 0.15)";
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        border: "1px solid #cbd5e1",
        borderRadius: 7,
        width: 36,
        height: 36,
        minWidth: 36,
        minHeight: 36,
        padding: 0,
        background: baseBg,
        color: "#374151",
        boxShadow: baseShadow,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.6 : 1,
        userSelect: "none",
        transition:
          "background 0.15s ease, transform 0.1s ease, box-shadow 0.1s ease",
      }}
      onMouseEnter={(e) => {
        if (disabled) return;
        e.currentTarget.style.background = hoverBg;
      }}
      onMouseLeave={(e) => {
        if (disabled) return;
        e.currentTarget.style.background = baseBg;
        clearPressStyle(e.currentTarget);
      }}
      onMouseDown={(e) => {
        if (disabled) return;
        applyPressStyle(e.currentTarget);
      }}
      onMouseUp={(e) => {
        if (disabled) return;
        e.currentTarget.style.background = hoverBg;
        clearPressStyle(e.currentTarget);
      }}
    >
      {children}
    </button>
  );
};

export {
  addNewModalFooterStyle, addNewModalFooterBtnStyle, addNewModalFooterCancelBtnStyle,
  outboundRouteModalCancelBtnStyle, OUTBOUND_ROUTE_MODAL_SECTION_BG,
  OUTBOUND_ROUTE_TOOLTIP_PROPS, formatOutboundTooltipTitle, OutboundFieldLabel,
  OutboundRouteModalSectionHeading, outboundRouteOutlinedInputRootSx,
  outboundRouteModalTextFieldSx, outboundRouteModalTextFieldFullSx,
  outboundRouteModalSelectSx, nativeFieldInputStyle, getNativeFieldInteraction,
  outboundRouteModalPaperSx, outboundRouteModalDialogContentSx,
  outboundRouteModalTitleStyle, outboundRouteModalFormStyle, FieldRow,
  outboundRouteModalControlSx, OutboundLeftField, OutboundRightRow,
  outboundRightColStyle, SectionCard, outboundCompactInputStyle,
  outboundRouteDialPatternGridColumns, outboundRouteDialPatternIconSx,
  OutboundRouteDialPatternActionBtn,
};
