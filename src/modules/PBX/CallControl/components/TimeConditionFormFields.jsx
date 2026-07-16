import React from "react";
import { Checkbox, FormControlLabel, TextField, Tooltip } from "@mui/material";
import {
  C,
  FOCUS_RING_SHADOW,
  OUTLINED_BORDER,
  OUTLINED_FOCUS,
  OUTLINED_HOVER,
} from "../../../../theme/pbxTokens";
import { TIME_CONDITION_FIELD_TOOLTIPS } from "../../../../constants/TimeConditionConstants";
import { extensionTableCheckboxSx as timeConditionTableCheckboxSx } from "../../../../components/common";

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

export const timeConditionModalCancelBtnStyle = {
  ...addNewModalFooterBtnStyle,
  background: "#cbd5e1",
  color: "#374151",
  border: "1px solid #cbd5e1",
  borderRadius: 4,
  boxShadow: "0 1px 2px rgba(15, 23, 42, 0.08)",
};

const timeConditionOutlinedInputRootSx = {
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

export const timeConditionModalTextFieldFullSx = {
  width: "100%",
  "& .MuiOutlinedInput-root": {
    ...timeConditionOutlinedInputRootSx,
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

export const timeConditionModalPaperSx = {
  width: "fit-content",
  minWidth: 650,
  maxWidth: "90vw",
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

export const timeConditionModalTitleStyle = {
  background: "#1e2d42",
  color: "#ffffff",
  fontWeight: 600,
  fontSize: 16,
  padding: "16px 24px",
  textAlign: "center",
  borderTopLeftRadius: 4,
  borderTopRightRadius: 4,
};

export const timeConditionModalFormStyle = {
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

const TIME_CONDITION_TIME_SELECT_HEIGHT = 26;
const TIME_CONDITION_TIME_SELECT_WIDTH = 42;

const timeConditionTimeSelectStyle = {
  width: TIME_CONDITION_TIME_SELECT_WIDTH,
  minWidth: TIME_CONDITION_TIME_SELECT_WIDTH,
  maxWidth: TIME_CONDITION_TIME_SELECT_WIDTH,
  minHeight: TIME_CONDITION_TIME_SELECT_HEIGHT,
  height: TIME_CONDITION_TIME_SELECT_HEIGHT,
  padding: "3px 10px 3px 3px",
  fontSize: 12,
  lineHeight: 1.35,
  border: `1px solid ${OUTLINED_BORDER}`,
  borderRadius: 4,
  outline: "none",
  backgroundColor: "#fff",
  color: "#0f172a",
  boxSizing: "border-box",
  boxShadow: "none",
  transition: "border-color 0.2s ease, box-shadow 0.2s ease",
  appearance: "auto",
};

const TIME_CONDITION_TOOLTIP_PROPS = {
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

const formatTimeConditionTooltipTitle = (text) => {
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

export const TimeConditionFieldLabel = ({
  tooltipKey,
  label,
  required,
  style = {},
}) => {
  const tooltip = TIME_CONDITION_FIELD_TOOLTIPS[tooltipKey] || "";
  const content = (
    <>
      {label}
      {required && <span style={{ color: "#dc2626", marginLeft: 2 }}>*</span>}
    </>
  );
  const labelEl = (
    <span
      style={{
        fontSize: 13,
        fontWeight: 600,
        color: C.labelText,
        cursor: tooltip ? "help" : undefined,
        ...style,
      }}
    >
      {content}
    </span>
  );
  if (!tooltip) return labelEl;
  return (
    <Tooltip
      title={formatTimeConditionTooltipTitle(tooltip)}
      {...TIME_CONDITION_TOOLTIP_PROPS}
    >
      {labelEl}
    </Tooltip>
  );
};

export const FieldRow = ({ label, tooltipKey, required, children, fitContent }) => (
  <div
    style={{
      display: "flex",
      alignItems: "flex-start",
      gap: 16,
      marginBottom: 14,
      width: fitContent ? "max-content" : "100%",
    }}
  >
    {tooltipKey ? (
      <TimeConditionFieldLabel
        tooltipKey={tooltipKey}
        label={label}
        required={required}
        style={{
          width: 120,
          flexShrink: 0,
          paddingTop: 4,
          display: "inline-block",
        }}
      />
    ) : (
      <label
        style={{
          width: 120,
          flexShrink: 0,
          fontSize: 13,
          fontWeight: 600,
          color: C.labelText,
          paddingTop: 4,
        }}
      >
        {label}
        {required && <span style={{ color: "#dc2626", marginLeft: 2 }}>*</span>}
      </label>
    )}
    <div style={fitContent ? { flexShrink: 0 } : { flex: 1 }}>{children}</div>
  </div>
);

const timeConditionModalCheckboxLabelSx = {
  margin: 0,
  whiteSpace: "nowrap",
  "& .MuiFormControlLabel-label": {
    fontSize: 13,
    color: C.labelText,
    lineHeight: 1.2,
  },
};

const timeConditionModalCheckboxAllLabelSx = {
  ...timeConditionModalCheckboxLabelSx,
  "& .MuiFormControlLabel-label": {
    fontSize: 13,
    fontWeight: 600,
    color: C.accent,
    lineHeight: 1.2,
  },
};

export const CheckGroup = ({ items, checked, onChange, cols = 7 }) => {
  const allValues = items.map((item) =>
    typeof item === "object" ? item.value : item,
  );
  const allChecked =
    checked.length === allValues.length && allValues.length > 0;
  const someChecked = checked.length > 0 && checked.length < allValues.length;

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${cols}, auto)`,
        gap: "2px 10px",
        justifyContent: "start",
      }}
    >
      {items.map((item) => {
        const val = typeof item === "object" ? item.value : item;
        const lbl = typeof item === "object" ? item.label : item;
        return (
          <FormControlLabel
            key={val}
            control={
              <Checkbox
                size="small"
                checked={checked.includes(val)}
                onChange={() => onChange(val)}
                sx={timeConditionTableCheckboxSx}
              />
            }
            label={lbl}
            sx={timeConditionModalCheckboxLabelSx}
          />
        );
      })}
      <FormControlLabel
        control={
          <Checkbox
            size="small"
            checked={allChecked}
            indeterminate={someChecked}
            onChange={() => onChange("__ALL__")}
            sx={timeConditionTableCheckboxSx}
          />
        }
        label="All"
        sx={timeConditionModalCheckboxAllLabelSx}
      />
    </div>
  );
};

const TIME_COL_LABEL_STYLE = {
  fontSize: 11,
  color: C.labelText,
  fontWeight: 600,
  textAlign: "center",
  lineHeight: 1.2,
  minHeight: 15,
};

export const TIME_CONDITION_TIME_ROW_LABEL_STYLE = {
  fontSize: 12,
  fontWeight: 600,
  color: C.labelText,
  flexShrink: 0,
  paddingBottom: 2,
};

const TimeCol = ({ label, showLabel, children }) => (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "flex-start",
      gap: 2,
      flexShrink: 0,
    }}
  >
    <span
      style={{
        ...TIME_COL_LABEL_STYLE,
        visibility: showLabel ? "visible" : "hidden",
      }}
    >
      {label}
    </span>
    {children}
  </div>
);

const TimeColon = () => (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      gap: 2,
      flexShrink: 0,
    }}
  >
    <span
      style={{
        ...TIME_COL_LABEL_STYLE,
        visibility: "hidden",
      }}
    >
      :
    </span>
    <span
      style={{
        fontSize: 12,
        lineHeight: 1,
        display: "flex",
        alignItems: "center",
        alignSelf: "center",
        height: TIME_CONDITION_TIME_SELECT_HEIGHT,
      }}
    >
      :
    </span>
  </div>
);

export const TimeGroup = ({
  showLabel,
  hourValue,
  minuteValue,
  onHourChange,
  onMinuteChange,
  hourOptions,
  minuteOptions,
}) => (
  <div style={{ display: "flex", alignItems: "flex-end", gap: 4 }}>
    <TimeCol label="Hour" showLabel={showLabel}>
      <TimeSelect
        value={hourValue}
        onChange={onHourChange}
        options={hourOptions}
      />
    </TimeCol>
    <TimeColon />
    <TimeCol label="Minute" showLabel={showLabel}>
      <TimeSelect
        value={minuteValue}
        onChange={onMinuteChange}
        options={minuteOptions}
      />
    </TimeCol>
  </div>
);

const TimeSelect = ({ value, onChange, options }) => (
  <select
    value={value}
    onChange={(e) => onChange(e.target.value)}
    style={timeConditionTimeSelectStyle}
    {...nativeFieldInteraction}
  >
    {options.map((o) => (
      <option key={o} value={o}>
        {o}
      </option>
    ))}
  </select>
);
