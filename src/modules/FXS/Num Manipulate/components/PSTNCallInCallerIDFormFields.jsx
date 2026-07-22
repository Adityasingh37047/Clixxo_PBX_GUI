import React from "react";
import {
  FormControl,
  MenuItem,
  Select as MuiSelect,
  TextField,
  Tooltip,
} from "@mui/material";
import {
  OUTLINED_BORDER,
  OUTLINED_FOCUS,
  OUTLINED_HOVER,
  FOCUS_RING_SHADOW,
  C,
} from "../../../../theme/pbxTokens";
import {
  Btn,
  TH,
  tdStyle,
  ExtensionBreadcrumb,
  addNewModalFooterBtnStyle as pSTNCallInCallerIDAddNewModalFooterBtnStyle,
  addNewModalFooterCancelBtnStyle as pSTNCallInCallerIDAddNewModalFooterCancelBtnStyle,
  addNewModalFooterStyle as pSTNCallInCallerIDAddNewModalFooterStyle,
  extensionCardStyle as pSTNCallInCallerIDCardStyle,
  extensionPaginationStyle as pSTNCallInCallerIDPaginationStyle,
  extensionToolbarStyle as pSTNCallInCallerIDToolbarStyle,
  extensionTableCheckboxSx as pSTNCallInCallerIDCheckboxSx,
} from "../../../../components/common";
import {
  PSTN_CALL_IN_CALLERID_PAGE_BREADCRUMB_SECTION,
  PSTN_CALL_IN_CALLERID_PAGE_TITLE,
} from "../../../../constants/FxspSTNCallInCallerIDConstants";

export {
  Btn as PSTNCallInCallerIDBtn,
  TH as PSTNCallInCallerIDTH,
  tdStyle as pSTNCallInCallerIDTdStyle,
  pSTNCallInCallerIDCheckboxSx,
  pSTNCallInCallerIDCardStyle,
  pSTNCallInCallerIDToolbarStyle,
  pSTNCallInCallerIDPaginationStyle,
  pSTNCallInCallerIDAddNewModalFooterStyle,
  pSTNCallInCallerIDAddNewModalFooterBtnStyle,
  pSTNCallInCallerIDAddNewModalFooterCancelBtnStyle,
};

export const pSTNCallInCallerIDAddNewModalBackdropSlotProps = {
  backdrop: { sx: { backgroundColor: "rgba(0, 0, 0, 0.5)" } },
};

export const pSTNCallInCallerIDAddNewModalDialogContentSx = {
  maxHeight: "calc(100vh - 220px)",
  overflowY: "auto",
  WebkitOverflowScrolling: "touch",
};

const modalTitleStyle = {
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

const DIALOG_MARGIN = 24;
const DIALOG_LAYOUT_OFFSET = 80;

export const pSTNCallInCallerIDDialogConfig = {
  dialogSx: {
    "& .MuiDialog-container": {
      alignItems: "center",
      justifyContent: "center",
    },
  },
  paperSx: {
    margin: DIALOG_MARGIN,
    maxHeight: `calc(100vh - ${DIALOG_LAYOUT_OFFSET}px - ${DIALOG_MARGIN * 2}px)`,
    display: "flex",
    flexDirection: "column",
    width: 600,
    maxWidth: "95vw",
    p: 0,
    borderRadius: "4px",
    overflow: "hidden",
    boxShadow:
      "0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)",
  },
  modalTitleStyle,
};

export const pSTNCallInCallerIDMuiTextFieldSx = {
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

export const pSTNCallInCallerIDMuiSelectSx = {
  fontSize: 13,
  backgroundColor: "#fff",
  borderRadius: 4,
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

const FIELD_LABEL_COLOR = "#3E5475";

const FIELD_TOOLTIP_PROPS = {
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

const formatTooltipTitle = (text) => {
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

export const PSTNCallInCallerIDFieldLabel = ({
  tooltipKey,
  tooltips,
  children,
  style = {},
}) => {
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
    <Tooltip title={formatTooltipTitle(tooltip)} {...FIELD_TOOLTIP_PROPS}>
      {labelNode}
    </Tooltip>
  );
};

export const PSTNCallInCallerIDModalFormFields = ({
  fields,
  fieldTooltips,
  formData,
  handleInputChange,
}) => (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      gap: 14,
      background: "#f8fafc",
      border: `1px solid ${C.cardBorder}`,
      borderRadius: 4,
      padding: 20,
    }}
  >
    {fields.map((field) => (
      <div
        key={field.name}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 12,
        }}
      >
        <PSTNCallInCallerIDFieldLabel
          tooltipKey={field.name}
          tooltips={fieldTooltips}
          style={{
            fontSize: 13,
            width: 170,
            lineHeight: 1.2,
            textAlign: "left",
            whiteSpace: "nowrap",
            display: "inline-block",
          }}
        >
          {field.label}
        </PSTNCallInCallerIDFieldLabel>
        <div style={{ width: "min(100%, 320px)" }}>
          {field.type === "select" ? (
            <FormControl size="small" fullWidth>
              <MuiSelect
                value={formData[field.name] || ""}
                onChange={(e) =>
                  handleInputChange({
                    target: { name: field.name, value: e.target.value },
                  })
                }
                variant="outlined"
                sx={pSTNCallInCallerIDMuiSelectSx}
              >
                {field.options.map((opt) => (
                  <MenuItem
                    key={opt.value}
                    value={opt.value}
                    sx={{ fontSize: 14 }}
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
              inputProps={{
                style: {
                  fontSize: 13,
                  height: 32,
                  padding: "0 8px",
                  boxSizing: "border-box",
                },
              }}
              sx={pSTNCallInCallerIDMuiTextFieldSx}
            />
          )}
        </div>
      </div>
    ))}
  </div>
);

export const PSTNCallInCallerIDBreadcrumb = () => (
  <ExtensionBreadcrumb
    root="FXS"
    section={PSTN_CALL_IN_CALLERID_PAGE_BREADCRUMB_SECTION}
    current={PSTN_CALL_IN_CALLERID_PAGE_TITLE}
  />
);
