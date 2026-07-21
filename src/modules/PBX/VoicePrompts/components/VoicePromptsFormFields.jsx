import React from "react";
import { Tooltip, useMediaQuery } from "@mui/material";
import {
  C,
  FOCUS_RING_SHADOW,
  OUTLINED_BORDER,
  OUTLINED_FOCUS,
  OUTLINED_HOVER,
} from "../../../../theme/pbxTokens";
import { VOICE_PROMPTS_FIELD_TOOLTIPS } from "../../../../constants/VoicePromptsConstants";
import { extensionTableCheckboxSx as voicePromptsCheckboxSx } from "../../../../components/common";

export { voicePromptsCheckboxSx };

export const VOICE_PROMPTS_CARD_RADIUS = 4;

export const voicePromptsPrimaryBtnStyle = {
  height: 30,
  padding: "6px 14px",
  fontSize: 12,
  borderRadius: 4,
  minWidth: 100,
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

export const addNewModalFooterCancelBtnStyle = {
  ...addNewModalFooterBtnStyle,
  background: "#cbd5e1",
  color: "#374151",
  border: "1px solid #cbd5e1",
  boxShadow: "0 1px 2px rgba(15, 23, 42, 0.08)",
};

export const voicePromptsModalCancelBtnStyle = {
  ...addNewModalFooterBtnStyle,
  background: "#cbd5e1",
  color: "#374151",
  border: "1px solid #cbd5e1",
  boxShadow: "0 1px 2px rgba(15, 23, 42, 0.08)",
};

export const VOICE_PROMPTS_TOOLTIP_PROPS = {
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

export const tooltipProps = VOICE_PROMPTS_TOOLTIP_PROPS;

export const voicePromptsTabHeaderStyle = {
  width: "100%",
  minHeight: 44,
  background: C.cardBg,
  borderTopLeftRadius: VOICE_PROMPTS_CARD_RADIUS,
  borderTopRightRadius: VOICE_PROMPTS_CARD_RADIUS,
  display: "flex",
  alignItems: "center",
  padding: "10px 28px 10px 14px",
  borderBottom: `1px solid ${C.divider}`,
  flexWrap: "wrap",
  gap: 8,
  boxSizing: "border-box",
  flexShrink: 0,
};

export const voicePromptsHeaderLeftStyle = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  flexWrap: "wrap",
  minWidth: 0,
};

export const voicePromptsTabBtnStyle = {
  height: 30,
  borderRadius: 4,
};

export const voicePromptsChooseFileBtnStyle = {
  height: 30,
  padding: "6px 14px",
  fontSize: 12,
  minWidth: "auto",
  borderRadius: 4,
};

export const voicePromptsPanelStyle = {
  background: "#f8fafc",
  padding: 16,
  borderRadius: 4,
  border: `1px solid ${C.cardBorder}`,
};

export const voicePromptsTableCardStyle = {
  overflowX: "auto",
  border: `1px solid ${C.cardBorder}`,
  borderRadius: 4,
  background: "#ffffff",
};

const VOICE_PROMPTS_SECTION_HEADING_COLOR = "#30415A";

const voicePromptsOutlinedInputRootSx = {
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

export const voicePromptsTextFieldSx = {
  width: "100%",
  "& .MuiOutlinedInput-root": {
    ...voicePromptsOutlinedInputRootSx,
    minHeight: 34,
    height: 34,
    fontSize: 13,
  },
  "& .MuiOutlinedInput-input": {
    padding: "7px 10px",
    fontSize: 13,
    boxSizing: "border-box",
    backgroundColor: "#fff",
    color: C.valueText,
  },
};

export const voicePromptsSelectSx = {
  fontSize: 13,
  backgroundColor: "#fff",
  width: "100%",
  minHeight: 34,
  height: 34,
  ...voicePromptsOutlinedInputRootSx,
  "& .MuiOutlinedInput-notchedOutline": {
    borderColor: OUTLINED_BORDER,
    transition: "border-color 0.2s ease, box-shadow 0.2s ease",
  },
  "&:hover .MuiOutlinedInput-notchedOutline": {
    borderColor: OUTLINED_HOVER,
  },
  "&.Mui-focused": {
    boxShadow: FOCUS_RING_SHADOW,
  },
  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
    borderColor: OUTLINED_FOCUS,
    borderWidth: "1px",
  },
  "& .MuiSelect-select": {
    padding: "7px 32px 7px 10px !important",
    display: "flex",
    alignItems: "center",
    color: C.valueText,
  },
};

export const voicePromptsModalPaperSx = {
  width: 560,
  maxWidth: "96vw",
  margin: 24,
  maxHeight: "calc(100vh - 80px - 48px)",
  display: "flex",
  flexDirection: "column",
  p: 0,
  borderRadius: "4px",
  overflow: "hidden",
  boxShadow:
    "0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)",
};

export const voicePromptsModalTitleStyle = {
  background: "#1e2d42",
  color: "#ffffff",
  fontWeight: 600,
  fontSize: 16,
  padding: "16px 24px",
  textAlign: "center",
  borderTopLeftRadius: 4,
  borderTopRightRadius: 4,
  margin: 0,
};

export const voicePromptsModalContentStyle = {
  padding: "24px",
  paddingTop: 24,
  backgroundColor: "#ffffff",
  boxSizing: "border-box",
};

export const voicePromptsModalSectionStyle = {
  display: "flex",
  flexDirection: "column",
  gap: 16,
  width: "100%",
  background: "#f8fafc",
  border: `1px solid ${C.cardBorder}`,
  borderRadius: 4,
  padding: 20,
};

export const VoicePromptsSectionHeading = ({ title, isFirst = false }) => {
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
          left: 0,
          background: C.cardBg,
          paddingRight: 8,
          fontSize: 14,
          fontWeight: 600,
          color: VOICE_PROMPTS_SECTION_HEADING_COLOR,
        }}
      >
        {title}
      </span>
    </div>
  );
};

export const VoicePromptsFieldRow = ({
  label,
  children,
  required,
  align = "center",
}) => (
  <div style={{ display: "flex", alignItems: align, gap: 12, minHeight: 32 }}>
    <label
      style={{
        fontSize: 13,
        fontWeight: 600,
        color: C.labelText,
        width: 170,
        flexShrink: 0,
        paddingTop: align === "flex-start" ? 8 : 0,
      }}
    >
      {label}{" "}
      {required && <span style={{ color: C.errorRed }}>*</span>}
    </label>
    <div style={{ flex: 1, minWidth: 0 }}>{children}</div>
  </div>
);

export const VoicePromptsTooltipLabel = ({ tooltipKey, children }) => (
  <Tooltip
    title={VOICE_PROMPTS_FIELD_TOOLTIPS[tooltipKey] || ""}
    {...tooltipProps}
  >
    <span style={{ cursor: "help" }}>{children}</span>
  </Tooltip>
);

