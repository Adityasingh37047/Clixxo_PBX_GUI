import React from "react";
import { Checkbox, MenuItem, Select, Tooltip } from "@mui/material";
import {
  RADIUS_FIELDS,
  LOCAL_IP_OPTIONS,
  CALL_TYPE_OPTIONS,
  RADIUS_BREADCRUMB,
  RADIUS_BUTTON_LABELS,
  RADIUS_BUTTON_VARIANTS,
  RADIUS_TOOLTIPS,
  RADIUS_SELECT_LOCAL_IP_PLACEHOLDER,
} from "../../../../constants/RadiusConstants";
import {
  C,
  OUTLINED_BORDER,
  OUTLINED_HOVER,
  OUTLINED_FOCUS,
  FOCUS_RING_SHADOW,
} from "../../../../theme/pbxTokens";
import { Btn, ExtensionBreadcrumb } from "../../../../components/common";
import {
  radiusPageWrapStyle,
  radiusPageInnerStyle,
  radiusFixedAlertSx,
  radiusFooterBtnStyle,
  FIELD_RADIUS,
} from "./RadiusTableHelpers";

export const RADIUS_COMPACT_MQ = "(max-width: 768px)";
export const RADIUS_GRID_TWO_COL_MQ = "(min-width: 900px)";
export const RADIUS_FORM_MAX_WIDTH = 960;
export const RADIUS_FORM_PAD_X = 28;

export { radiusFixedAlertSx };

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

export const inputInteraction = {
  onFocus: (e) => {
    if (e.target.disabled || e.target.readOnly) return;
    setFieldFocus(e.target);
  },
  onBlur: (e) => {
    if (e.target.disabled || e.target.readOnly) return;
    setFieldDefault(e.target);
  },
  onMouseEnter: (e) => {
    if (e.target.disabled || e.target.readOnly) return;
    if (document.activeElement === e.target) {
      setFieldFocus(e.target);
    } else {
      setFieldHover(e.target);
    }
  },
  onMouseLeave: (e) => {
    if (e.target.disabled || e.target.readOnly) return;
    if (document.activeElement === e.target) {
      setFieldFocus(e.target);
    } else {
      setFieldDefault(e.target);
    }
  },
};

export const radiusFieldInputStyle = {
  width: "100%",
  minWidth: 0,
  padding: "0 12px",
  borderRadius: FIELD_RADIUS,
  boxSizing: "border-box",
  background: "#ffffff",
  lineHeight: 1.35,
  minHeight: 36,
  height: 36,
  fontSize: 13,
  border: `1px solid ${OUTLINED_BORDER}`,
  outline: "none",
  color: C.valueText,
  transition: "border-color 0.2s ease, box-shadow 0.2s ease",
};

export const radiusMuiSelectSx = {
  width: "100%",
  fontSize: 13,
  backgroundColor: "#fff",
  "& .MuiOutlinedInput-root": {
    minHeight: 36,
    backgroundColor: "#fff",
  },
  "& .MuiSelect-select": {
    padding: "7px 32px 7px 10px !important",
    lineHeight: 1.35,
  },
  "& .MuiOutlinedInput-notchedOutline": {
    borderColor: OUTLINED_BORDER,
  },
  "&:hover .MuiOutlinedInput-notchedOutline": {
    borderColor: OUTLINED_HOVER,
  },
  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
    borderColor: OUTLINED_FOCUS,
    borderWidth: "1px",
  },
};

export const radiusCheckboxSx = {
  padding: 0,
  margin: 0,
  color: "#3E5475",
  "&.Mui-checked": { color: "#0284c7" },
};

const tooltipProps = {
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
    arrow: { sx: { color: "#fff" } },
  },
};

export const radiusFormBodyStyle = {
  width: "100%",
  maxWidth: RADIUS_FORM_MAX_WIDTH,
  margin: "0 auto",
  padding: `20px ${RADIUS_FORM_PAD_X}px`,
  boxSizing: "border-box",
};

export const radiusFooterStyle = {
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  justifyContent: "center",
  gap: 10,
  padding: "10px 18px",
  borderTop: `1px solid ${C.divider}`,
  minHeight: 50,
};

export const radiusFormGridStyle = (isGridTwoCol) => ({
  display: "grid",
  gridTemplateColumns: isGridTwoCol ? "1fr 1fr" : "1fr",
  gap: isGridTwoCol ? "18px 32px" : 14,
  width: "100%",
  alignItems: "start",
});

export const radiusGridFieldStyle = {
  display: "flex",
  flexDirection: "column",
  gap: 8,
  minWidth: 0,
  width: "100%",
};

export const radiusGridLabelStyle = {
  fontSize: 13,
  fontWeight: 600,
  color: C.labelText,
  lineHeight: 1.4,
  wordBreak: "break-word",
  cursor: "help",
  display: "inline-flex",
  width: "fit-content",
};

export const radiusCallTypeGridStyle = (isGridTwoCol) => ({
  display: "grid",
  gridTemplateColumns: isGridTwoCol ? "1fr 1fr" : "1fr",
  gap: isGridTwoCol ? "10px 32px" : 8,
  width: "100%",
});

export const radiusFullWidthGridCellStyle = {
  gridColumn: "1 / -1",
};

export const radiusEnableRowStyle = (isCompact) => ({
  ...radiusFullWidthGridCellStyle,
  display: "flex",
  flexDirection: isCompact ? "column" : "row",
  alignItems: isCompact ? "stretch" : "center",
  flexWrap: isCompact ? "nowrap" : "wrap",
  gap: isCompact ? 12 : "10px 28px",
  width: "100%",
});

export const radiusEnableItemStyle = (isCompact) => ({
  display: "flex",
  alignItems: "center",
  gap: 8,
  minHeight: 36,
  flex: isCompact ? "none" : "1 1 0",
  minWidth: isCompact ? "100%" : 180,
});

export const radiusEnableLabelStyle = {
  fontSize: 13,
  fontWeight: 600,
  color: C.labelText,
  lineHeight: 1.35,
  whiteSpace: "nowrap",
  flexShrink: 0,
  cursor: "help",
  display: "inline-flex",
  width: "fit-content",
};

const ENABLE_FIELDS = RADIUS_FIELDS.filter((f) => f.type === "checkbox");
const INPUT_FIELDS = RADIUS_FIELDS.filter(
  (f) => f.type !== "checkbox" && f.type !== "checkboxGroup",
);
const CALL_TYPE_FIELD = RADIUS_FIELDS.find((f) => f.type === "checkboxGroup");

export const RadiusPageShell = ({ children, isCompact }) => (
  <div
    style={{
      ...radiusPageWrapStyle,
      ...(isCompact ? { padding: 8 } : {}),
    }}
    data-native-scroll
  >
    <div style={radiusPageInnerStyle}>{children}</div>
  </div>
);

export const RadiusBreadcrumb = () => (
  <ExtensionBreadcrumb
    root={RADIUS_BREADCRUMB[0]}
    section={RADIUS_BREADCRUMB[1]}
    current={RADIUS_BREADCRUMB[2]}
  />
);

export const RadiusGridField = ({ label, tooltip, children }) => (
  <div style={radiusGridFieldStyle}>
    <div style={{ width: "fit-content" }}>
      <Tooltip title={tooltip || ""} {...tooltipProps}>
        <span style={radiusGridLabelStyle}>{label}</span>
      </Tooltip>
    </div>
    {children}
  </div>
);

export const EnableCheckbox = ({ checked, onChange, name }) => (
  <Checkbox
    size="small"
    checked={checked}
    onChange={onChange}
    name={name}
    sx={radiusCheckboxSx}
  />
);

export const CallTypeRow = ({ checked, value, label, onChange }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 8, minHeight: 32 }}>
    <Checkbox
      size="small"
      checked={checked}
      onChange={onChange}
      name="callType"
      value={value}
      sx={radiusCheckboxSx}
    />
    <span style={{ fontSize: 13, color: C.valueText }}>{label}</span>
  </div>
);

const renderControl = (field, form, onChange) => {
  if (field.type === "select") {
    return (
      <Select
        value={form[field.name] || ""}
        onChange={onChange}
        name={field.name}
        size="small"
        variant="outlined"
        displayEmpty
        sx={radiusMuiSelectSx}
      >
        <MenuItem value="">
          <em>{RADIUS_SELECT_LOCAL_IP_PLACEHOLDER}</em>
        </MenuItem>
        {LOCAL_IP_OPTIONS.map((opt) => (
          <MenuItem key={opt.value} value={opt.value}>
            {opt.label}
          </MenuItem>
        ))}
      </Select>
    );
  }

  return (
    <input
      type={field.type === "password" ? "password" : "text"}
      name={field.name}
      value={form[field.name] || ""}
      onChange={onChange}
      style={radiusFieldInputStyle}
      {...inputInteraction}
    />
  );
};

export const RadiusFormPanel = ({
  form,
  isCompact,
  isGridTwoCol,
  onChange,
  onCallTypeChange,
}) => (
  <div style={radiusFormBodyStyle}>
    <div style={radiusFormGridStyle(isGridTwoCol)}>
      <div style={radiusEnableRowStyle(isCompact)}>
        {ENABLE_FIELDS.map((field) => (
          <div key={field.name} style={radiusEnableItemStyle(isCompact)}>
            <Tooltip
              title={RADIUS_TOOLTIPS[field.name] || ""}
              {...tooltipProps}
            >
              <span style={radiusEnableLabelStyle}>{field.label}</span>
            </Tooltip>
            <EnableCheckbox
              checked={!!form[field.name]}
              onChange={onChange}
              name={field.name}
            />
          </div>
        ))}
      </div>

      {CALL_TYPE_FIELD ? (
        <div style={isGridTwoCol ? radiusFullWidthGridCellStyle : undefined}>
          <RadiusGridField
            label={CALL_TYPE_FIELD.label}
            tooltip={RADIUS_TOOLTIPS.callType}
          >
            <div style={radiusCallTypeGridStyle(isGridTwoCol)}>
              {CALL_TYPE_OPTIONS.map((opt) => (
                <CallTypeRow
                  key={opt.value}
                  value={opt.value}
                  label={opt.label}
                  checked={form.callType.includes(opt.value)}
                  onChange={onCallTypeChange}
                />
              ))}
            </div>
          </RadiusGridField>
        </div>
      ) : null}

      {INPUT_FIELDS.map((field) => (
        <RadiusGridField
          key={field.name}
          label={field.label}
          tooltip={RADIUS_TOOLTIPS[field.name]}
        >
          {renderControl(field, form, onChange)}
        </RadiusGridField>
      ))}
    </div>
  </div>
);

export const RadiusActionFooter = ({ onReset }) => (
  <div style={radiusFooterStyle}>
    <Btn
      type="button"
      variant={RADIUS_BUTTON_VARIANTS.RESET}
      onClick={onReset}
      style={radiusFooterBtnStyle}
    >
      {RADIUS_BUTTON_LABELS.RESET}
    </Btn>
    <Btn
      type="submit"
      variant={RADIUS_BUTTON_VARIANTS.SAVE}
      style={radiusFooterBtnStyle}
    >
      {RADIUS_BUTTON_LABELS.SAVE}
    </Btn>
  </div>
);
