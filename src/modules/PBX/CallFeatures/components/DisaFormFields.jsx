import React from "react";
import { Tooltip, useMediaQuery } from "@mui/material";
import {
  C,
  FOCUS_RING_SHADOW,
  OUTLINED_BORDER,
  OUTLINED_FOCUS,
  OUTLINED_HOVER,
} from "../../../../theme/pbxTokens";
import { DISA_FIELD_TOOLTIPS } from "../../../../constants/DisaConstants";

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
  borderBottomLeftRadius: 4,
  borderBottomRightRadius: 4,
};

export const addNewModalFooterBtnStyle = {
  height: 30,
  padding: "6px 14px",
  fontSize: 12,
  borderRadius: 4,
  minWidth: 100,
};

export const disaModalCancelBtnStyle = {
  ...addNewModalFooterBtnStyle,
  background: "#cbd5e1",
  color: "#374151",
  border: "1px solid #cbd5e1",
  boxShadow: "0 1px 2px rgba(15, 23, 42, 0.08)",
  borderRadius: 4,
};

const disaOutlinedInputRootSx = {
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

export const disaModalTextFieldFullSx = {
  width: "100%",
  "& .MuiOutlinedInput-root": {
    ...disaOutlinedInputRootSx,
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

export const disaModalSelectSx = {
  fontSize: 13,
  backgroundColor: "#fff",
  width: "100%",
  minHeight: 36,
  height: 36,
  ...disaOutlinedInputRootSx,
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

export const disaModalPaperSx = {
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

export const disaModalTitleStyle = {
  background: "#1e2d42",
  color: "#ffffff",
  fontWeight: 600,
  fontSize: 16,
  padding: "16px 24px",
  textAlign: "center",
  borderTopLeftRadius: 4,
  borderTopRightRadius: 4,
};

export const disaModalSectionStyle = {
  display: "flex",
  flexDirection: "column",
  gap: 14,
  width: "100%",
  background: "#f8fafc",
  border: `1px solid ${C.cardBorder}`,
  borderRadius: 4,
  padding: "20px 24px 24px",
  marginTop: 24,
};

export const disaModalContentWrapStyle = {
  display: "flex",
  flexDirection: "column",
  gap: 16,
  paddingBottom: 4,
};

export const disaModalDialogContentSx = {
  maxHeight: "calc(100vh - 220px)",
  overflowY: "auto",
  WebkitOverflowScrolling: "touch",
};

export const disaModalDialogContainerSx = {
  "& .MuiDialog-container": {
    alignItems: "center",
    justifyContent: "center",
  },
};

const DISA_TOOLTIP_PROPS = {
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

const formatDisaTooltipTitle = (text) => {
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

export const DISA_MODAL_LABEL_WIDTH = 150;

const DisaFieldLabel = ({
  tooltipKey,
  children,
  required,
  style = {},
}) => {
  const tooltip = DISA_FIELD_TOOLTIPS[tooltipKey] || "";
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
      {required ? (
        <span style={{ color: C.errorRed, marginLeft: 2 }}>*</span>
      ) : null}
    </span>
  );
  if (!tooltip) return label;
  return (
    <Tooltip
      title={formatDisaTooltipTitle(tooltip)}
      {...DISA_TOOLTIP_PROPS}
    >
      {label}
    </Tooltip>
  );
};

export const DisaFieldRow = ({
  label,
  tooltipKey,
  required,
  children,
  alignTop,
}) => (
  <div
    style={{
      display: "flex",
      alignItems: alignTop ? "flex-start" : "center",
      gap: 12,
      minHeight: alignTop ? undefined : 32,
    }}
  >
    {tooltipKey ? (
      <DisaFieldLabel
        tooltipKey={tooltipKey}
        required={required}
        style={{
          width: DISA_MODAL_LABEL_WIDTH,
          flexShrink: 0,
          marginTop: alignTop ? 4 : 0,
        }}
      >
        {label}
      </DisaFieldLabel>
    ) : (
      <label
        style={{
          fontSize: 13,
          fontWeight: 600,
          color: C.labelText,
          width: DISA_MODAL_LABEL_WIDTH,
          flexShrink: 0,
          marginTop: alignTop ? 4 : 0,
        }}
      >
        {label}
        {required ? (
          <span style={{ color: C.errorRed, marginLeft: 2 }}>*</span>
        ) : null}
      </label>
    )}
    <div style={{ flex: 1, minWidth: 0 }}>{children}</div>
  </div>
);

const DISA_MODAL_SECTION_BG = "#f8fafc";
const DISA_MODAL_SECTION_HEADING_COLOR = "#30415A";

export const DisaSectionHeading = ({
  title,
  isFirst = false,
  required = false,
  tooltipKey,
}) => {
  const isLaptopNarrow = useMediaQuery("(max-width: 1366px)");
  const heading = (
    <span
      style={{
        position: "absolute",
        top: -10,
        left: isLaptopNarrow ? 0 : -6,
        background: DISA_MODAL_SECTION_BG,
        paddingRight: 8,
        fontSize: 14,
        fontWeight: 600,
        color: DISA_MODAL_SECTION_HEADING_COLOR,
        cursor: tooltipKey ? "help" : undefined,
      }}
    >
      {title}
      {required ? <span style={{ color: C.errorRed }}> *</span> : null}
    </span>
  );
  const tooltip = tooltipKey ? DISA_FIELD_TOOLTIPS[tooltipKey] : "";
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
      {tooltip ? (
        <Tooltip
          title={formatDisaTooltipTitle(tooltip)}
          {...DISA_TOOLTIP_PROPS}
        >
          {heading}
        </Tooltip>
      ) : (
        heading
      )}
    </div>
  );
};
