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
  FEATURE_CODE_SECTIONS,
  FEATURE_CODE_TOOLTIPS,
} from "../../../../constants/FeatureCodeConstants";
import {
  C,
  FOCUS_RING_SHADOW,
  OUTLINED_BORDER,
  OUTLINED_FOCUS,
  OUTLINED_HOVER,
} from "../../../../theme/pbxTokens";
import {
  FEATURE_CODE_LAPTOP_NARROW_MQ,
  FEATURE_CODE_MAIN_SECTION_HEADING_LEFT,
} from "./FeatureCodeTableHelpers";

const FEATURE_CODE_SECTION_HEADING_COLOR = "#30415A";

export const FEATURE_CODE_TOOLTIP_PROPS = {
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

const FEATURE_CODE_FIELD_LABEL_WIDTH = 220;
const FEATURE_CODE_INPUT_WIDTH = 150;
export const FEATURE_CODE_GRID_COLUMN_GAP = 56;

const featureCodeOutlinedInputRootSx = {
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

export const featureCodeFieldControlSx = (isCompact) => ({
  width: isCompact ? "100%" : FEATURE_CODE_INPUT_WIDTH,
  maxWidth: isCompact ? "100%" : FEATURE_CODE_INPUT_WIDTH,
  "& .MuiOutlinedInput-root": {
    ...featureCodeOutlinedInputRootSx,
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
});

export const featureCodeSelectSx = (isCompact) => ({
  fontSize: 13,
  backgroundColor: "#fff",
  width: isCompact ? "100%" : FEATURE_CODE_INPUT_WIDTH,
  maxWidth: isCompact ? "100%" : FEATURE_CODE_INPUT_WIDTH,
  minHeight: 34,
  height: 34,
  ...featureCodeOutlinedInputRootSx,
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

export const FeatureCodeSectionHeading = ({
  title,
  isFirst = false,
  isCompact = false,
}) => {
  const isLaptopNarrow = useMediaQuery(FEATURE_CODE_LAPTOP_NARROW_MQ);
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
          left: tightenSpacing ? 0 : FEATURE_CODE_MAIN_SECTION_HEADING_LEFT,
          background: C.cardBg,
          paddingRight: 8,
          fontSize: 14,
          fontWeight: 600,
          color: FEATURE_CODE_SECTION_HEADING_COLOR,
        }}
      >
        {title}
      </span>
    </div>
  );
};

export const FeatureCodeFieldRow = ({ field, isCompact, children }) => {
  const stacked = isCompact;
  return (
    <div
      style={{
        display: "flex",
        flexDirection: stacked ? "column" : "row",
        alignItems: stacked ? "stretch" : "center",
        padding: "8px 0",
        gap: stacked ? 6 : 12,
      }}
    >
      <Tooltip
        title={FEATURE_CODE_TOOLTIPS[field.key] || ""}
        {...FEATURE_CODE_TOOLTIP_PROPS}
      >
        <span
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: C.labelText,
            textAlign: "left",
            width: stacked ? "100%" : FEATURE_CODE_FIELD_LABEL_WIDTH,
            flexShrink: 0,
            lineHeight: 1.4,
            cursor: "help",
          }}
        >
          {field.label}
        </span>
      </Tooltip>
      <div
        style={{
          minWidth: 0,
          flexShrink: 0,
          width: stacked ? "100%" : undefined,
        }}
      >
        {children}
      </div>
    </div>
  );
};

export const FeatureCodeFieldControl = ({
  field,
  form,
  isCompact,
  timeoutDestinationOptions,
  onChange,
}) => {
  if (field.type === "select") {
    const options = field.options
      ? field.options
      : field.key === "timeout_destinations"
        ? timeoutDestinationOptions
        : [];
    return (
      <FormControl
        size="small"
        sx={{ width: isCompact ? "100%" : FEATURE_CODE_INPUT_WIDTH }}
      >
        <MuiSelect
          value={form[field.key] ?? ""}
          onChange={(e) => onChange(field.key, e.target.value)}
          sx={featureCodeSelectSx(isCompact)}
        >
          {options.map((opt) => (
            <MenuItem key={opt.value} value={opt.value} sx={{ fontSize: 13 }}>
              {opt.label}
            </MenuItem>
          ))}
        </MuiSelect>
      </FormControl>
    );
  }
  return (
    <TextField
      size="small"
      variant="outlined"
      type={field.type === "number" ? "number" : "text"}
      value={form[field.key] ?? ""}
      onChange={(e) => onChange(field.key, e.target.value)}
      sx={featureCodeFieldControlSx(isCompact)}
    />
  );
};

export const FeatureCodeFormSections = ({
  form,
  isCompact,
  stackFieldPairs,
  timeoutDestinationOptions,
  onChange,
}) => {
  const renderFieldCell = (field) => (
    <FeatureCodeFieldRow field={field} isCompact={isCompact}>
      <FeatureCodeFieldControl
        field={field}
        form={form}
        isCompact={isCompact}
        timeoutDestinationOptions={timeoutDestinationOptions}
        onChange={onChange}
      />
    </FeatureCodeFieldRow>
  );

  return (
    <>
      {FEATURE_CODE_SECTIONS.map((section, sectionIdx) => (
        <div key={section.title}>
          <FeatureCodeSectionHeading
            title={section.title}
            isFirst={sectionIdx === 0}
            isCompact={isCompact}
          />
          <div>
            {section.fields.map((row, rowIdx) => {
              if (row.length === 1) {
                const field = row[0];
                const isRight = !!field.colRight;
                return (
                  <div
                    key={rowIdx}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: stackFieldPairs
                        ? 0
                        : `0 ${FEATURE_CODE_GRID_COLUMN_GAP}px`,
                      ...(stackFieldPairs
                        ? { gridTemplateColumns: "1fr" }
                        : {}),
                    }}
                  >
                    {isRight && !stackFieldPairs && <div />}
                    <div style={{ padding: "0 0 0 0" }}>
                      {renderFieldCell(field)}
                    </div>
                    {!isRight && !stackFieldPairs && <div />}
                  </div>
                );
              }
              return (
                <div
                  key={rowIdx}
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    alignItems: stackFieldPairs ? "stretch" : "flex-start",
                    gap: stackFieldPairs
                      ? "0"
                      : `${FEATURE_CODE_GRID_COLUMN_GAP}px`,
                    ...(stackFieldPairs ? { flexDirection: "column" } : {}),
                  }}
                >
                  {row.map((field) => (
                    <div
                      key={field.key}
                      style={stackFieldPairs ? { width: "100%" } : undefined}
                    >
                      {renderFieldCell(field)}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </>
  );
};
