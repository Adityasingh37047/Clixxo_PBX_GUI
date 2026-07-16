import React from "react";
import {
  Checkbox,
  FormControl,
  MenuItem,
  Select as MuiSelect,
  Tooltip,
  useMediaQuery,
} from "@mui/material";
import { VOICEMAIL_FIELD_TOOLTIPS } from "../../../../constants/VoicemailConstants";
import {
  C,
  FOCUS_RING_SHADOW,
  OUTLINED_BORDER,
  OUTLINED_FOCUS,
  OUTLINED_HOVER,
} from "../../../../theme/pbxTokens";
import {
  VOICEMAIL_FIELD_LABEL_WIDTH,
  VOICEMAIL_FIELD_MIDDLE_GAP,
  VOICEMAIL_INPUT_WIDTH,
  VOICEMAIL_LAPTOP_NARROW_MQ,
  VOICEMAIL_MAIN_SECTION_HEADING_LEFT,
  VOICEMAIL_SECTION_HEADING_COLOR,
} from "./VoicemailTableHelpers";

export const VOICEMAIL_TOOLTIP_PROPS = {
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

const voicemailOutlinedInputRootSx = {
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

export const voicemailSelectSx = (isCompact) => ({
  fontSize: 13,
  backgroundColor: "#fff",
  width: isCompact ? "100%" : VOICEMAIL_INPUT_WIDTH,
  maxWidth: isCompact ? "100%" : VOICEMAIL_INPUT_WIDTH,
  minHeight: 34,
  height: 34,
  ...voicemailOutlinedInputRootSx,
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
  "&.Mui-focused:hover .MuiOutlinedInput-notchedOutline": {
    borderColor: OUTLINED_FOCUS,
    borderWidth: "1px",
  },
  "& .MuiSelect-select": {
    padding: "7px 32px 7px 10px !important",
    display: "flex",
    alignItems: "center",
    color: C.valueText,
    cursor: "pointer",
  },
});

export const voicemailCheckboxSx = {
  padding: 0,
  margin: 0,
  color: "#3E5475",
  "&.Mui-checked": { color: "#0284c7" },
  "&.MuiCheckbox-indeterminate": { color: "#0284c7" },
};

export const VoicemailSectionHeading = ({
  title,
  isFirst = false,
  isCompact = false,
}) => {
  const isLaptopNarrow = useMediaQuery(VOICEMAIL_LAPTOP_NARROW_MQ);
  const tightenSpacing = isLaptopNarrow || isCompact;
  return (
    <div
      style={{
        margin: isFirst
          ? tightenSpacing
            ? "20px 0 24px 0"
            : "16px 0 24px 0"
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
          left: tightenSpacing ? 0 : VOICEMAIL_MAIN_SECTION_HEADING_LEFT,
          background: C.cardBg,
          paddingRight: 8,
          fontSize: 14,
          fontWeight: 600,
          color: VOICEMAIL_SECTION_HEADING_COLOR,
        }}
      >
        {title}
      </span>
    </div>
  );
};

export const VoicemailFieldRow = ({ label, tooltipKey, isCompact, children }) => {
  const stacked = isCompact;
  return (
    <div
      style={{
        display: "flex",
        flexDirection: stacked ? "column" : "row",
        alignItems: stacked ? "stretch" : "center",
        justifyContent: "flex-start",
        padding: "8px 0",
        gap: stacked ? 8 : VOICEMAIL_FIELD_MIDDLE_GAP,
        width: "100%",
      }}
    >
      <Tooltip
        title={VOICEMAIL_FIELD_TOOLTIPS[tooltipKey] || ""}
        {...VOICEMAIL_TOOLTIP_PROPS}
      >
        <span
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: C.labelText,
            textAlign: "left",
            width: stacked ? "100%" : "auto",
            maxWidth: stacked ? "100%" : VOICEMAIL_FIELD_LABEL_WIDTH,
            flexShrink: 0,
            lineHeight: 1.4,
            cursor: "help",
          }}
        >
          {label}
        </span>
      </Tooltip>
      <div
        style={{
          minWidth: 0,
          flexShrink: 0,
          display: "flex",
          justifyContent: "flex-start",
          width: stacked ? "100%" : VOICEMAIL_INPUT_WIDTH,
          marginLeft: stacked ? 0 : "auto",
        }}
      >
        {children}
      </div>
    </div>
  );
};

export const VoicemailSelectField = ({
  fieldKey,
  value,
  onChange,
  options,
  isCompact,
  getLabel,
}) => (
  <FormControl
    size="small"
    sx={{ width: isCompact ? "100%" : VOICEMAIL_INPUT_WIDTH }}
  >
    <MuiSelect
      value={value}
      onChange={(e) => onChange(fieldKey, e.target.value)}
      sx={voicemailSelectSx(isCompact)}
    >
      {options.map((opt) => {
        const optValue = typeof opt === "string" ? opt : opt.value;
        const label = getLabel
          ? getLabel(opt)
          : typeof opt === "string"
            ? opt
            : opt.label;
        return (
          <MenuItem key={optValue} value={optValue} sx={{ fontSize: 13 }}>
            {label}
          </MenuItem>
        );
      })}
    </MuiSelect>
  </FormControl>
);
