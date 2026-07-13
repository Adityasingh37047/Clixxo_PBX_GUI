import React from "react";
import { Tooltip, useMediaQuery } from "@mui/material";
import { CALL_QUEUE_FIELD_TOOLTIPS } from "../../../constants/CallQueueConstants";
import { C } from "./CallQueueTableHelpers";

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

const callQueueModalCancelBtnStyle = {
  ...addNewModalFooterBtnStyle,
  background: "#cbd5e1",
  color: "#374151",
  border: "1px solid #cbd5e1",
  boxShadow: "0 1px 2px rgba(15, 23, 42, 0.08)",  
  borderRadius: 4,
};

const OUTLINED_BORDER = "#d1d5db";
const OUTLINED_HOVER = "#9ca3af";
const OUTLINED_FOCUS = "#3E5475";
const FOCUS_RING_SHADOW = "0 0 0 2px rgba(62, 84, 117, 0.15)";

const callQueueOutlinedInputRootSx = {
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

const callQueueModalTextFieldFullSx = {
  width: "100%",
  "& .MuiOutlinedInput-root": {
    ...callQueueOutlinedInputRootSx,
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

const callQueueModalSelectSx = {
  fontSize: 13,
  backgroundColor: "#fff",
  width: "100%",
  minHeight: 36,
  height: 36,
  ...callQueueOutlinedInputRootSx,
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

const callQueueModalPaperSx = {
  width: 900,
  maxWidth: "96vw",
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

const callQueueModalTitleStyle = {
  background: "#1e2d42",
  color: "#ffffff",
  fontWeight: 600,
  fontSize: 16,
  padding: "16px 24px",
  textAlign: "center",
  borderTopLeftRadius: 4,
  borderTopRightRadius: 4,
};

const callQueueModalFormStyle = {
  display: "flex",
  flexDirection: "column",
  gap: 14,
  width: "100%",
  background: "#f8fafc",
  border: `1px solid ${C.cardBorder}`,
  borderRadius: 4,
  padding: 20,
};

const callQueueModalDialogContentSx = {
  maxHeight: "calc(100vh - 220px)",
  overflowY: "auto",
  WebkitOverflowScrolling: "touch",
};

const CALL_QUEUE_TOOLTIP_PROPS = {
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

const formatCallQueueTooltipTitle = (text) => {
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

const callQueueModalTabBarStyle = {
  borderBottom: `1px solid ${C.divider}`,
  background: "#ffffff",
};

const callQueueModalTabsSx = {
  minHeight: 45,
  "& .MuiTab-root": {
    color: "#374151",
    fontSize: 12,
    fontWeight: 500,
    textTransform: "none",
    minHeight: 45,
  },
  "& .MuiTab-root.Mui-selected": {
    color: C.accent,
    fontWeight: 700,
  },
};


const CALL_QUEUE_MODAL_LABEL_WIDTH = 175;

const CallQueueFieldLabel = ({ tooltipKey, children, style = {} }) => {
  const tooltip = CALL_QUEUE_FIELD_TOOLTIPS[tooltipKey] || "";
  const label = (
    <span
      style={{
        fontSize: 13,
        fontWeight: 600,
        color: C.labelText,
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
      title={formatCallQueueTooltipTitle(tooltip)}
      {...CALL_QUEUE_TOOLTIP_PROPS}
    >
      {label}
    </Tooltip>
  );
};

const CallQueueFieldRow = ({
  label,
  tooltipKey,
  children,
  required = false,
  alignTop = false,
  labelWidth = CALL_QUEUE_MODAL_LABEL_WIDTH,
}) => (
  <div
    style={{
      display: "flex",
      alignItems: alignTop ? "flex-start" : "center",
      gap: 12,
      minHeight: alignTop ? undefined : 32,
    }}
  >
    <CallQueueFieldLabel
      tooltipKey={tooltipKey}
      style={{
        width: labelWidth,
        flexShrink: 0,
        marginTop: alignTop ? 4 : 0,
      }}
    >
      {label}
      {required ? <span style={{ color: C.errorRed }}> *</span> : null}
    </CallQueueFieldLabel>
    <div style={{ flex: 1, minWidth: 0 }}>{children}</div>
  </div>
);

const CALL_QUEUE_MODAL_SECTION_BG = "#f8fafc";

const CallQueueSectionHeading = ({
  title,
  isFirst = false,
  required = false,
}) => {
  const isLaptopNarrow = useMediaQuery("(max-width: 1366px)");
  return (
  <div
    style={{
      margin: isFirst
        ? isLaptopNarrow
          ? "16px 0 24px 0"
          : "0 0 24px 0"
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
        left: isLaptopNarrow ? 0 : -6,
        background: CALL_QUEUE_MODAL_SECTION_BG,
        paddingRight: 8,
        fontSize: 14,
        fontWeight: 600,
        color: "#30415A",
      }}
    >
      {title}
      {required ? <span style={{ color: C.errorRed }}> *</span> : null}
    </span>
  </div>
  );
};


const SectionCard = ({ title, children, isFirst = false }) => (
  <div style={{ marginBottom: 8 }}>
    <CallQueueSectionHeading title={title} isFirst={isFirst} />
    <div>{children}</div>
  </div>
);
export {
  addNewModalFooterStyle, addNewModalFooterBtnStyle, addNewModalFooterCancelBtnStyle,
  callQueueModalCancelBtnStyle, callQueueOutlinedInputRootSx,
  callQueueModalTextFieldFullSx, callQueueModalSelectSx, callQueueModalPaperSx,
  callQueueModalTitleStyle, callQueueModalFormStyle, callQueueModalDialogContentSx,
  CALL_QUEUE_TOOLTIP_PROPS, formatCallQueueTooltipTitle, callQueueModalTabBarStyle,
  callQueueModalTabsSx, CALL_QUEUE_MODAL_LABEL_WIDTH, CALL_QUEUE_MODAL_SECTION_BG,
  CallQueueFieldLabel, CallQueueFieldRow, CallQueueSectionHeading, SectionCard,
};
