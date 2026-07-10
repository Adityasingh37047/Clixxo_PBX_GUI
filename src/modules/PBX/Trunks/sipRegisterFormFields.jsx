import React from "react";
import { Tooltip, useMediaQuery } from "@mui/material";
import {
  C,
  OUTLINED_BORDER,
  OUTLINED_HOVER,
  OUTLINED_FOCUS,
  FOCUS_RING_SHADOW,
} from "../../../theme/pbxTokens";
import { SIP_REGISTER_TOOLTIPS } from "../../../constants/SipRegisterConstants";

export const trunkFormCheckboxLabelSx = {
  margin: 0,
  marginLeft: 0,
  marginRight: 0,
  alignItems: "center",
};

export const sipRegisterOutlinedInputRootSx = {
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

export const sipRegisterModalTextFieldSx = {
  "& .MuiOutlinedInput-root": sipRegisterOutlinedInputRootSx,
  "& .MuiOutlinedInput-input": {
    backgroundColor: "#fff",
    fontSize: 13,
    padding: "8px 12px",
  },
};

export const sipRegisterModalSelectSx = {
  fontSize: 13,
  backgroundColor: "#fff",
  width: "100%",
  "& .MuiOutlinedInput-root": {
    ...sipRegisterOutlinedInputRootSx,
    minHeight: 36,
    height: 36,
  },
  "& .MuiSelect-select": {
    display: "flex",
    alignItems: "center",
    padding: "7px 32px 7px 10px !important",
    lineHeight: 1.35,
    boxSizing: "border-box",
  },
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

export const SIP_REGISTER_FIELD_TOOLTIP_PROPS = {
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
    arrow: {
      sx: { color: "#fff" },
    },
  },
};

const formatSipRegisterTooltipTitle = (text) => {
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

const TRUNK_FIELD_LABEL_CLASS =
  "text-[13px] font-semibold text-[#3E5475] sm:w-[11rem] sm:text-right shrink-0";

export const SipRegisterFieldLabel = ({
  tooltipKey,
  children,
  style = {},
  className,
}) => {
  const tooltip = SIP_REGISTER_TOOLTIPS[tooltipKey] || "";
  const LabelTag = className ? "label" : "span";

  const label = (
    <LabelTag
      className={className}
      style={{
        fontSize: 13,
        fontWeight: 600,
        color: C.labelText,
        cursor: tooltip ? "help" : undefined,
        ...style,
      }}
    >
      {children}
    </LabelTag>
  );

  if (!tooltip) return label;

  return (
    <Tooltip
      title={formatSipRegisterTooltipTitle(tooltip)}
      {...SIP_REGISTER_FIELD_TOOLTIP_PROPS}
    >
      {label}
    </Tooltip>
  );
};

export const TrunkFieldLabel = ({
  tooltipKey,
  children,
  className,
  required,
  style,
}) => (
  <SipRegisterFieldLabel
    tooltipKey={tooltipKey}
    className={className || TRUNK_FIELD_LABEL_CLASS}
    style={style}
  >
    {children}
    {required ? <span className="text-red-500"> *</span> : null}
  </SipRegisterFieldLabel>
);

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

export const TRUNK_SECTION_HEADING_COLOR = "#30415A";
export const TRUNK_FIELD_LABEL_COLOR = "#3E5475";
export const SIP_REGISTER_MODAL_SECTION_BG = "#f8fafc";

export const TrunkModalSectionHeading = ({
  title,
  isFirst = false,
  labelBackground = SIP_REGISTER_MODAL_SECTION_BG,
  titleLeft = -6,
}) => {
  const isLaptopNarrow = useMediaQuery("(max-width: 1366px)");
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
      <span
        style={{
          position: "absolute",
          top: -10,
          left: isLaptopNarrow ? 0 : titleLeft,
          background: labelBackground,
          paddingRight: 8,
          fontSize: 14,
          fontWeight: 600,
          color: TRUNK_SECTION_HEADING_COLOR,
        }}
      >
        {title}
      </span>
    </div>
  );
};

export const parseCodecList = (value) =>
  (value || "")
    .split(",")
    .map((c) => c.trim())
    .filter(Boolean);

export const trunkModalPaperSx = {
  width: 900,
  maxWidth: "95vw",
  mx: "auto",
  my: 0,
  maxHeight: "calc(100vh - 80px - 48px)",
  display: "flex",
  flexDirection: "column",
  p: 0,
  borderRadius: "8px",
  overflow: "hidden",
  boxShadow:
    "0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)",
};

export const sipRegisterModalDialogContentSx = {
  maxHeight: "calc(100vh - 220px)",
  overflowY: "auto",
  WebkitOverflowScrolling: "touch",
};

export const trunkModalTitleStyle = {
  background: "#1e2d42",
  color: "#ffffff",
  fontWeight: 600,
  fontSize: 16,
  padding: "16px 24px",
  textAlign: "center",
  borderTopLeftRadius: 8,
  borderTopRightRadius: 8,
};

export const trunkModalFormPanelStyle = {
  display: "flex",
  flexDirection: "column",
  gap: 14,
  width: "100%",
  background: "#f8fafc",
  border: `1px solid ${C.cardBorder}`,
  borderRadius: 8,
  paddingTop: 0,
  paddingBottom: 0,
  boxSizing: "border-box",
};

export const addNewModalFooterStyle = {
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
  borderBottomLeftRadius: 8,
  borderBottomRightRadius: 8,
};

export const addNewModalFooterBtnStyle = {
  height: 30,
  padding: "6px 14px",
  fontSize: 12,
  borderRadius: 10,
  minWidth: 100,
};

export const trunkModalCancelBtnStyle = {
  ...addNewModalFooterBtnStyle,
  background: "#cbd5e1",
  color: "#374151",
  border: "1px solid #cbd5e1",
  boxShadow: "0 1px 2px rgba(15, 23, 42, 0.08)",
};

export const trunkAdaptRowGridColumns = "1fr 1fr 1fr 32px";

export const trunkDnisRowGridColumns = "1fr 1fr 32px";

export const trunkAdaptTextFieldSx = {
  ...sipRegisterModalTextFieldSx,
};

export const trunkAdaptRowActionBtnSx = {
  border: "1px solid #cbd5e1",
  borderRadius: 1,
  width: 32,
  height: 32,
  padding: 0,
  backgroundColor: "#cbd5e1",
  color: "#374151",
  "&:hover": {
    backgroundColor: "#b6c2d3",
  },
};

export const trunkDodCompactInputStyle = {
  height: 28,
  width: "100%",
  padding: "8px 12px",
  fontSize: 13,
  border: `1px solid ${OUTLINED_BORDER}`,
  borderRadius: 4,
  outline: "none",
  backgroundColor: "#fff",
  color: "#0f172a",
  boxSizing: "border-box",
  boxShadow: "none",
  transition: "border-color 0.2s ease, box-shadow 0.2s ease",
  cursor: "text",
};

export const trunkDodToolbarBtnStyle = {
  height: 30,
  fontSize: 12,
  padding: "6px 14px",
  borderRadius: 10,
};

export const Pill = ({ text, bg, color }) => (
  <span
    style={{
      background: bg,
      color,
      padding: "4px 8px",
      borderRadius: 999,
      fontSize: 11,
      fontWeight: 700,
      letterSpacing: "0.01em",
      whiteSpace: "nowrap",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      textAlign: "center",
      maxWidth: "100%",
    }}
  >
    {text}
  </span>
);
