import React from "react";
import { COLOR_RING_FIELD_TOOLTIPS, COLOR_RING_PAGE_BREADCRUMB_SECTION, COLOR_RING_PAGE_TITLE, COLOR_RING_MODAL_TITLE, COLOR_RING_INDEX_OPTIONS } from "../../../../constants/ColorRingConstants";
import { Tooltip, TextField, MenuItem, FormControl, Select as MuiSelect, Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";

import { FOCUS_RING_SHADOW, OUTLINED_BORDER, OUTLINED_FOCUS, OUTLINED_HOVER, C } from "../../../../theme/pbxTokens";
import { Btn, ExtensionBreadcrumb as FxsChromeBreadcrumb, addNewModalFooterStyle as fxsAddNewModalFooterStyle, addNewModalFooterBtnStyle as fxsAddNewModalFooterBtnStyle, addNewModalFooterCancelBtnStyle as fxsAddNewModalFooterCancelBtnStyle } from "../../../../components/common";
export const fxsModalTitleStyle = {
  background: "#1e2d42",
  color: "#ffffff",
  fontWeight: 600,
  fontSize: 16,
  padding: "16px 24px",
  textAlign: "center",
  borderTopLeftRadius: 8,
  borderTopRightRadius: 8,
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
  borderRadius: "8px",
  overflow: "hidden",
  boxShadow:
    "0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)",
});

import {
  colorRingPageInnerStyle,
  colorRingPageWrapStyle,
} from "./ColorRingTableHelpers";

export const FIELD_LABEL_COLOR = "#3E5475";

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
        tooltips={COLOR_RING_FIELD_TOOLTIPS}
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

const muiTextFieldSx = {
  "& .MuiOutlinedInput-root": {
    backgroundColor: "#fff",
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
  },
  "& .MuiSelect-select": {
    display: "flex",
    alignItems: "center",
    padding: "7px 32px 7px 10px !important",
    lineHeight: 1.35,
    boxSizing: "border-box",
  },
};

export const colorRingModalSelectSx = {
  fontSize: 13,
  backgroundColor: "#fff",
  ...muiSelectInnerSx,
  "& .MuiOutlinedInput-notchedOutline": {
    borderColor: OUTLINED_BORDER,
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

export const colorRingModalTextFieldSx = muiTextFieldSx;

export const colorRingModalDialogSx = fxsDialogSx;
export const colorRingModalPaperSx = createFxsDialogPaperSx(500);
export const colorRingModalTitleStyle = fxsModalTitleStyle;
export const colorRingModalBackdropSlotProps = fxsModalBackdropSlotProps;
export const colorRingModalDialogContentSx = fxsModalDialogContentSx;
export const addNewModalFooterStyle = fxsAddNewModalFooterStyle;
export const addNewModalFooterBtnStyle = fxsAddNewModalFooterBtnStyle;
export const addNewModalFooterCancelBtnStyle =
  fxsAddNewModalFooterCancelBtnStyle;

export const colorRingModalFormPanelStyle = {
  display: "flex",
  flexDirection: "column",
  gap: 14,
  background: "#f8fafc",
  border: `1px solid ${C.cardBorder}`,
  borderRadius: 8,
  padding: 20,
};

export const colorRingWavFileNoteStyle = {
  fontSize: 12,
  color: C.mutedText,
  margin: 0,
  lineHeight: 1.45,
  whiteSpace: "normal",
  overflowWrap: "break-word",
  textAlign: "center",
  width: "100%",
};

export const colorRingChooseFileBtnStyle = {
  height: 30,
  fontSize: 12,
  borderRadius: 4,
};

export const ColorRingBreadcrumb = () => (
  <FxsChromeBreadcrumb
    section={COLOR_RING_PAGE_BREADCRUMB_SECTION}
    current={COLOR_RING_PAGE_TITLE}
  />
);

export const ColorRingPageShell = ({ children }) => (
  <div style={colorRingPageWrapStyle}>
    <div style={colorRingPageInnerStyle}>{children}</div>
  </div>
);

export const ColorRingUploadModal = ({
  open,
  onClose,
  formData,
  fileName,
  fileInputRef,
  onInputChange,
  onFileChange,
  onUpload,
  onReturn,
}) => (
  <Dialog
    open={open}
    onClose={onClose}
    maxWidth={false}
    slotProps={colorRingModalBackdropSlotProps}
    sx={colorRingModalDialogSx}
    PaperProps={{ sx: colorRingModalPaperSx }}
    disableRestoreFocus
    disableEnforceFocus
  >
    <DialogTitle style={colorRingModalTitleStyle}>
      {COLOR_RING_MODAL_TITLE}
    </DialogTitle>
    <DialogContent
      style={{
        padding: "24px",
        backgroundColor: "#ffffff",
        flex: "1 1 auto",
      }}
      sx={colorRingModalDialogContentSx}
    >
      <div style={colorRingModalFormPanelStyle}>
        <FieldRow label="Index" tooltipKey="index">
          <FormControl size="small" fullWidth>
            <MuiSelect
              value={formData.index}
              onChange={(e) =>
                onInputChange({
                  target: { name: "index", value: e.target.value },
                })
              }
              sx={colorRingModalSelectSx}
            >
              {COLOR_RING_INDEX_OPTIONS.map((opt) => (
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
        </FieldRow>
        <FieldRow label="Description" tooltipKey="description">
          <TextField
            name="description"
            value={formData.description || ""}
            onChange={onInputChange}
            size="small"
            fullWidth
            variant="outlined"
            sx={colorRingModalTextFieldSx}
            inputProps={{
              maxLength: 23,
              style: { fontSize: 13, padding: "6px 8px" },
            }}
          />
        </FieldRow>
        <FieldRow label="Color Ring" align="flex-start" tooltipKey="file">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              flexWrap: "wrap",
              width: "100%",
            }}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".wav"
              onChange={onFileChange}
              style={{ display: "none" }}
            />
            <Btn
              variant="cancel"
              onClick={() => fileInputRef.current?.click()}
              style={colorRingChooseFileBtnStyle}
            >
              Choose file
            </Btn>
            <span style={{ fontSize: 13, color: C.mutedText }}>{fileName}</span>
          </div>
        </FieldRow>
        <p style={{ ...colorRingWavFileNoteStyle, color: C.accent }}>
          Note: The file should be a wav file with 8000Hz sampling rate, 16-bit
          mono, A-law formatted, and less than 200KB in size.
        </p>
      </div>
    </DialogContent>
    <DialogActions sx={{ p: 0, m: 0 }} style={addNewModalFooterStyle}>
      <Btn
        variant="primary"
        onClick={onUpload}
        style={addNewModalFooterBtnStyle}
      >
        Upload
      </Btn>
      <Btn
        variant="cancel"
        onClick={onReturn}
        style={addNewModalFooterCancelBtnStyle}
      >
        Return
      </Btn>
    </DialogActions>
  </Dialog>
);
