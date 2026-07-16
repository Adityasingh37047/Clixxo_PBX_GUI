import React from "react";
import { TONE_DETECTER_FIELD_TOOLTIPS, TONE_DETECTER_PAGE_BREADCRUMB_SECTION, TONE_DETECTER_PAGE_TITLE, TONE_DETECTER_MODAL_TITLE_EDIT, TONE_DETECTER_MODAL_TITLE_ADD, TONE_DETECTER_FIELDS } from "../../../../constants/ToneDetecterConstants";
import { Tooltip, TextField, MenuItem, FormControl, Select as MuiSelect } from "@mui/material";

import { FOCUS_RING_SHADOW, OUTLINED_BORDER, OUTLINED_FOCUS, OUTLINED_HOVER, C } from "../../../../theme/pbxTokens";
import { Btn, TH, ExtensionBreadcrumb as FxsChromeBreadcrumb, addNewModalFooterStyle as fxsAddNewModalFooterStyle, addNewModalFooterBtnStyle as fxsAddNewModalFooterBtnStyle, addNewModalFooterCancelBtnStyle as fxsAddNewModalFooterCancelBtnStyle } from "../../../../components/common";
export const fxsModalTitleStyle = {
  background: "#1e2d42",
  color: "#ffffff",
  fontWeight: 600,
  fontSize: 16,
  padding: "16px 24px",
  textAlign: "center",
  borderTopLeftRadius: 4,
  borderTopRightRadius: 4,
  flexShrink: 0,
};

export const fxsModalBackdropSlotProps = {
  backdrop: { sx: { backgroundColor: "rgba(0, 0, 0, 0.5)" } },
};

export const fxsModalDialogContentSx = {
  maxHeight: "calc(100vh - 220px)",
  overflowY: "auto",
  WebkitOverflowScrolling: "touch",
};

export const fxsDialogSx = {
  "& .MuiDialog-container": {
    alignItems: "center",
    justifyContent: "center",
  },
};

const FXS_DIALOG_MARGIN = 24;
const FXS_DIALOG_LAYOUT_OFFSET = 80;

export const createFxsDialogPaperSx = (width = 500) => ({
  margin: FXS_DIALOG_MARGIN,
  maxHeight: `calc(100vh - ${FXS_DIALOG_LAYOUT_OFFSET}px - ${FXS_DIALOG_MARGIN * 2}px)`,
  display: "flex",
  flexDirection: "column",
  width,
  maxWidth: "95vw",
  p: 0,
  borderRadius: "4px",
  overflow: "hidden",
  boxShadow:
    "0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)",
});

import {
  toneDetecterPageInnerStyle,
  toneDetecterPageWrapStyle,
} from "./ToneDetecterTableHelpers";

export const FIELD_LABEL_COLOR = "#3E5475";
export const TONE_DETECTER_FIELD_LABEL_WIDTH = 220;

export const FIELD_TOOLTIP_PROPS = {
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
        textTransform: "none",
        letterSpacing: "normal",
      },
    },
    arrow: { sx: { color: "#fff" } },
  },
};

export const formatFieldTooltipTitle = (text) => {
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

export const FxsFieldLabel = ({ tooltipKey, tooltips, children, style = {} }) => {
  const tooltip = tooltipKey ? tooltips[tooltipKey] || "" : "";
  const labelNode = (
    <span
      style={{
        fontSize: 13,
        fontWeight: 600,
        color: FIELD_LABEL_COLOR,
        cursor: tooltip ? "help" : undefined,
        ...style,
      }}
    >
      {children}
    </span>
  );
  if (!tooltip) return labelNode;
  return (
    <Tooltip title={formatFieldTooltipTitle(tooltip)} {...FIELD_TOOLTIP_PROPS}>
      {labelNode}
    </Tooltip>
  );
};

export const FieldRow = ({
  label,
  tooltipKey,
  children,
  required,
  align = "center",
  labelWidth = 170,
}) => (
  <div
    style={{
      display: "flex",
      alignItems: align,
      justifyContent: "center",
      gap: 12,
      minHeight: align === "flex-start" ? undefined : 32,
    }}
  >
    {tooltipKey ? (
      <FxsFieldLabel
        tooltipKey={tooltipKey}
        tooltips={TONE_DETECTER_FIELD_TOOLTIPS}
        style={{
          width: labelWidth,
          flexShrink: 0,
          textAlign: "left",
          paddingTop: align === "flex-start" ? 8 : 0,
        }}
      >
        {label}
        {required && <span style={{ color: "#dc2626" }}> *</span>}
      </FxsFieldLabel>
    ) : (
      <label
        style={{
          fontSize: 13,
          fontWeight: 600,
          color: C.labelText,
          width: labelWidth,
          flexShrink: 0,
          textAlign: "left",
          paddingTop: align === "flex-start" ? 8 : 0,
        }}
      >
        {label}
        {required && <span style={{ color: "#dc2626" }}> *</span>}
      </label>
    )}
    <div style={{ width: "min(100%, 320px)" }}>{children}</div>
  </div>
);

export const ToneDetecterBreadcrumb = () => (
  <FxsChromeBreadcrumb
    section={TONE_DETECTER_PAGE_BREADCRUMB_SECTION}
    current={TONE_DETECTER_PAGE_TITLE}
  />
);

export const ToneDetecterPageShell = ({ children }) => (
  <div style={toneDetecterPageWrapStyle}>
    <div style={toneDetecterPageInnerStyle}>{children}</div>
  </div>
);

const muiTextFieldSx = {
  "& .MuiOutlinedInput-root": {
    backgroundColor: "#fff",
    borderRadius: 4,
    "& fieldset": {
      borderColor: OUTLINED_BORDER,
      transition: "border-color 0.2s ease",
    },
    "&:hover fieldset": {
      borderColor: OUTLINED_HOVER,
    },
    "&.Mui-focused fieldset": {
      borderColor: OUTLINED_FOCUS,
      borderWidth: 1,
      boxShadow: FOCUS_RING_SHADOW,
    },
    "&.Mui-focused:hover fieldset": {
      borderColor: OUTLINED_FOCUS,
      borderWidth: 1,
      boxShadow: FOCUS_RING_SHADOW,
    },
  },
};

const muiSelectInnerSx = {
  "& .MuiOutlinedInput-root": {
    minHeight: 36,
    backgroundColor: "#fff",
    borderRadius: 4,
  },
  "& .MuiSelect-select": {
    display: "flex",
    alignItems: "center",
    padding: "7px 32px 7px 10px !important",
    lineHeight: 1.35,
    boxSizing: "border-box",
  },
};

export const toneDetecterMuiSelectSx = {
  fontSize: 13,
  backgroundColor: "#fff",
  borderRadius: 4,
  ...muiSelectInnerSx,
  "& .MuiOutlinedInput-notchedOutline": {
    borderColor: OUTLINED_BORDER,
    borderRadius: 4,
    transition: "border-color 0.2s ease",
  },
  "&:hover .MuiOutlinedInput-notchedOutline": {
    borderColor: OUTLINED_HOVER,
  },
  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
    borderColor: OUTLINED_FOCUS,
    borderWidth: 1,
    boxShadow: FOCUS_RING_SHADOW,
  },
};

export const toneDetecterTextFieldSx = {
  ...muiTextFieldSx,
  "& .MuiOutlinedInput-root": {
    ...muiTextFieldSx["& .MuiOutlinedInput-root"],
    height: 32,
  },
};

export const toneDetecterInputProps = {
  style: {
    fontSize: 13,
    height: 32,
    padding: "0 8px",
    boxSizing: "border-box",
  },
};

export const toneDetecterAddNewDialogSx = fxsDialogSx;
export const toneDetecterAddNewDialogPaperSx = createFxsDialogPaperSx(500);
export const toneDetecterModalTitleStyle = fxsModalTitleStyle;
export const toneDetecterModalBackdropSlotProps = fxsModalBackdropSlotProps;
export const toneDetecterModalDialogContentSx = fxsModalDialogContentSx;
export const toneDetecterModalFooterStyle = fxsAddNewModalFooterStyle;
export const toneDetecterModalFooterBtnStyle = fxsAddNewModalFooterBtnStyle;
export const toneDetecterModalFooterCancelBtnStyle =
  fxsAddNewModalFooterCancelBtnStyle;

export const toneDetecterModalFormPanelStyle = {
  display: "flex",
  flexDirection: "column",
  gap: 14,
  background: "#f8fafc",
  border: `1px solid ${C.cardBorder}`,
  borderRadius: 4,
  padding: 20,
};

export const getToneDetecterModalTitle = (editIndex) =>
  editIndex !== null
    ? TONE_DETECTER_MODAL_TITLE_EDIT
    : TONE_DETECTER_MODAL_TITLE_ADD;

export const ToneDetecterModalFormFields = ({ formData, handleInputChange }) => (
  <div style={toneDetecterModalFormPanelStyle}>
    {TONE_DETECTER_FIELDS.map((field) => (
      <FieldRow
        key={field.name}
        label={field.label}
        tooltipKey={field.name}
        labelWidth={TONE_DETECTER_FIELD_LABEL_WIDTH}
      >
        {field.type === "select" ? (
          <FormControl size="small" fullWidth>
            <MuiSelect
              value={formData[field.name] || ""}
              onChange={(e) =>
                handleInputChange({
                  target: { name: field.name, value: e.target.value },
                })
              }
              sx={toneDetecterMuiSelectSx}
            >
              {field.options.map((opt) => (
                <MenuItem
                  key={opt.value}
                  value={opt.value}
                  sx={{ fontSize: 13 }}
                >
                  {opt.label}
                </MenuItem>
              ))}
            </MuiSelect>
          </FormControl>
        ) : (
          <TextField
            type={field.type || "text"}
            name={field.name}
            value={formData[field.name] || ""}
            onChange={handleInputChange}
            size="small"
            fullWidth
            variant="outlined"
            sx={toneDetecterTextFieldSx}
            inputProps={toneDetecterInputProps}
          />
        )}
      </FieldRow>
    ))}
  </div>
);
