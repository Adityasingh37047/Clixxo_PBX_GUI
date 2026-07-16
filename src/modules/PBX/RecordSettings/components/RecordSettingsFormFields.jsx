import React from "react";
import {
  FormControl,
  MenuItem,
  Select as MuiSelect,
  TextField,
  Tooltip,
  useMediaQuery,
} from "@mui/material";
import {
  RECORD_SETTINGS_DUAL_LIST_SECTIONS,
  RECORD_SETTINGS_FIELD_TOOLTIPS,
  RECORD_SETTINGS_FORM_FIELDS,
} from "../../../../constants/RecordSettingsConstants";
import {
  C,
  FOCUS_RING_SHADOW,
  OUTLINED_BORDER,
  OUTLINED_FOCUS,
  OUTLINED_HOVER,
} from "../../../../theme/pbxTokens";
import { ExtensionCodecDualList as RecordSettingsCodecDualList } from "../../../../components/common";
import { resolveDestinationLabel } from "../utils/RecordSettingsTransformers";
import {
  RECORD_SETTINGS_CARD_RADIUS,
  RECORD_SETTINGS_LAPTOP_NARROW_MQ,
  RECORD_SETTINGS_MAIN_SECTION_HEADING_LEFT,
  RECORD_SETTINGS_SECTION_HEADING_COLOR,
} from "./RecordSettingsTableHelpers";

export const recordSettingsFormBodyStyle = {
  width: "100%",
  maxWidth: 920,
  margin: "0 auto",
  boxSizing: "border-box",
};

export const recordSettingsFormGridStyle = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "16px 24px",
  width: "100%",
  marginBottom: 8,
};

export const recordSettingsFormColumnStyle = {
  display: "flex",
  flexDirection: "column",
  gap: 16,
  minWidth: 0,
};

export const recordSettingsHeaderStyle = {
  width: "100%",
  minHeight: 44,
  background: C.cardBg,
  borderTopLeftRadius: RECORD_SETTINGS_CARD_RADIUS,
  borderTopRightRadius: RECORD_SETTINGS_CARD_RADIUS,
  display: "flex",
  alignItems: "center",
  padding: "7px 14px",
  fontWeight: 700,
  fontSize: 13,
  color: C.labelText,
  borderBottom: `1px solid ${C.divider}`,
};

export const recordSettingsFooterStyle = {
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  justifyContent: "center",
  gap: 12,
  width: "100%",
  padding: "10px 28px",
  borderTop: `1px solid ${C.divider}`,
  boxSizing: "border-box",
  background: "#ffffff",
  borderBottomLeftRadius: RECORD_SETTINGS_CARD_RADIUS,
  borderBottomRightRadius: RECORD_SETTINGS_CARD_RADIUS,
};

export const recordSettingsFooterBtnStyle = {
  height: 30,
  padding: "6px 14px",
  fontSize: 12,
  minWidth: 100,
  borderRadius: 4,
};

const recordSettingsOutlinedInputRootSx = {
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

export const recordSettingsFieldControlFullSx = {
  width: "100%",
  maxWidth: "100%",
  "& .MuiOutlinedInput-root": {
    ...recordSettingsOutlinedInputRootSx,
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
    cursor: "text",
  },
};

export const recordSettingsSelectFullSx = {
  fontSize: 13,
  backgroundColor: "#fff",
  width: "100%",
  maxWidth: "100%",
  minHeight: 34,
  height: 34,
  ...recordSettingsOutlinedInputRootSx,
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
};

const RECORD_SETTINGS_TOOLTIP_PROPS = {
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

const RECORD_SETTINGS_FIELD_LABEL_WIDTH = 220;

export const RecordSettingsFieldRow = ({
  label,
  tooltipKey,
  children,
  isCompact,
  stacked = false,
}) => {
  const vertical = isCompact || stacked;
  return (
    <div
      style={{
        display: "flex",
        flexDirection: vertical ? "column" : "row",
        alignItems: vertical ? "stretch" : "center",
        padding: "8px 0",
        gap: vertical ? 6 : 12,
      }}
    >
      <Tooltip
        title={RECORD_SETTINGS_FIELD_TOOLTIPS[tooltipKey] || ""}
        {...RECORD_SETTINGS_TOOLTIP_PROPS}
      >
        <span
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: C.labelText,
            textAlign: "left",
            width: vertical ? "100%" : RECORD_SETTINGS_FIELD_LABEL_WIDTH,
            flexShrink: 0,
            lineHeight: 1.4,
            cursor: tooltipKey ? "help" : "default",
          }}
        >
          {label}
        </span>
      </Tooltip>
      <div style={{ minWidth: 0, width: vertical ? "100%" : undefined }}>
        {children}
      </div>
    </div>
  );
};

export const RecordSettingsSectionHeading = ({
  title,
  isFirst = false,
  onClick,
  expanded,
}) => {
  const isLaptopNarrow = useMediaQuery(RECORD_SETTINGS_LAPTOP_NARROW_MQ);
  const inner = (
    <div
      style={{
        margin: isFirst
          ? isLaptopNarrow
            ? "24px 0 24px 0"
            : "20px 0 24px 0"
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
          left: isLaptopNarrow
            ? 0
            : RECORD_SETTINGS_MAIN_SECTION_HEADING_LEFT,
          background: C.cardBg,
          paddingRight: 8,
          fontSize: 14,
          fontWeight: 600,
          color: RECORD_SETTINGS_SECTION_HEADING_COLOR,
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
        }}
      >
        {onClick ? (
          <span
            style={{
              display: "inline-block",
              fontSize: 10,
              color: C.accent,
              transform: expanded ? "rotate(90deg)" : "rotate(0deg)",
              transition: "transform 0.15s ease",
            }}
          >
            ▶
          </span>
        ) : null}
        {title}
      </span>
    </div>
  );

  if (!onClick) return inner;

  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: "block",
        width: "100%",
        margin: 0,
        padding: 0,
        border: "none",
        background: "none",
        cursor: "pointer",
        fontFamily: "inherit",
        textAlign: "left",
      }}
    >
      {inner}
    </button>
  );
};

export const RecordSettingsCollapsibleSection = ({
  title,
  expanded,
  onToggle,
  available,
  selected,
  onChange,
  isCompact,
  isFirst = false,
}) => (
  <div style={{ marginBottom: 8 }}>
    <RecordSettingsSectionHeading
      title={title}
      isFirst={isFirst}
      onClick={onToggle}
      expanded={expanded}
    />
    {expanded && (
      <div style={{ marginTop: 8 }}>
        <RecordSettingsCodecDualList
          allOptions={available}
          selected={selected}
          onChange={onChange}
          getLabel={(id) => resolveDestinationLabel(available, id)}
          emptyTextAvailable="No available items"
          emptyTextSelected="No selected items"
          isCompact={isCompact}
        />
      </div>
    )}
  </div>
);

const recordSettingsLeftFields = RECORD_SETTINGS_FORM_FIELDS.slice(0, 4);
const recordSettingsRightFields = RECORD_SETTINGS_FORM_FIELDS.slice(4, 8);

export const renderRecordSettingsField = (
  field,
  { form, handleChange, isCompact, stacked = false },
) => (
  <RecordSettingsFieldRow
    key={field.key}
    label={field.label}
    tooltipKey={field.tooltipKey}
    isCompact={isCompact}
    stacked={stacked}
  >
    {field.type === "text" ? (
      <TextField
        size="small"
        fullWidth
        variant="outlined"
        value={form[field.key]}
        onChange={(e) => handleChange(field.key, e.target.value)}
        sx={recordSettingsFieldControlFullSx}
      />
    ) : (
      <FormControl size="small" fullWidth variant="outlined">
        <MuiSelect
          variant="outlined"
          value={form[field.key]}
          onChange={(e) => handleChange(field.key, e.target.value)}
          sx={recordSettingsSelectFullSx}
        >
          {field.options.map((opt) => (
            <MenuItem key={opt.value} value={opt.value} sx={{ fontSize: 13 }}>
              {opt.label}
            </MenuItem>
          ))}
        </MuiSelect>
      </FormControl>
    )}
  </RecordSettingsFieldRow>
);

export const RecordSettingsFormBody = ({
  form,
  handleChange,
  isCompact,
  dualListConfig,
}) => (
  <div
    style={{
      ...recordSettingsFormBodyStyle,
      paddingTop: 4,
      paddingBottom: 16,
    }}
  >
    {isCompact ? (
      RECORD_SETTINGS_FORM_FIELDS.map((field) =>
        renderRecordSettingsField(field, { form, handleChange, isCompact, stacked: true }),
      )
    ) : (
      <div style={recordSettingsFormGridStyle}>
        <div style={recordSettingsFormColumnStyle}>
          {recordSettingsLeftFields.map((field) =>
            renderRecordSettingsField(field, { form, handleChange, isCompact, stacked: true }),
          )}
        </div>
        <div style={recordSettingsFormColumnStyle}>
          {recordSettingsRightFields.map((field) =>
            renderRecordSettingsField(field, { form, handleChange, isCompact, stacked: true }),
          )}
        </div>
      </div>
    )}

    {RECORD_SETTINGS_DUAL_LIST_SECTIONS.map((section, idx) => {
      const config = dualListConfig[section.key];
      return (
        <RecordSettingsCollapsibleSection
          key={section.key}
          title={section.title}
          isFirst={idx === 0}
          expanded={config.expanded}
          available={config.available}
          selected={config.selected}
          onChange={config.onChange}
          isCompact={isCompact}
        />
      );
    })}
  </div>
);
