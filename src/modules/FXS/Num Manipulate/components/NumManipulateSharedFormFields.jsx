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
  EXTENSION_TABLE_CARD_RADIUS as FXS_CARD_RADIUS,
  ExtensionBreadcrumb as FxsBreadcrumb,
  addNewModalFooterBtnStyle as fxsAddNewModalFooterBtnStyle,
  addNewModalFooterCancelBtnStyle as fxsAddNewModalFooterCancelBtnStyle,
  addNewModalFooterStyle as fxsAddNewModalFooterStyle,
  extensionCardStyle as fxsCardStyle,
  extensionPaginationStyle as fxsPaginationStyle,
  extensionToolbarStyle as fxsToolbarStyle,
} from "../../../../components/common";

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


export const NUM_MANIPULATE_CARD_RADIUS = FXS_CARD_RADIUS;
export const numManipulateCardStyle = fxsCardStyle;
export const numManipulateToolbarStyle = fxsToolbarStyle;
export const numManipulatePaginationStyle = fxsPaginationStyle;

export const numManipulateAddNewModalFooterStyle = fxsAddNewModalFooterStyle;
export const numManipulateAddNewModalFooterBtnStyle = fxsAddNewModalFooterBtnStyle;
export const numManipulateAddNewModalFooterCancelBtnStyle =
  fxsAddNewModalFooterCancelBtnStyle;
export const numManipulateAddNewModalBackdropSlotProps = fxsModalBackdropSlotProps;
export const numManipulateAddNewModalDialogContentSx = fxsModalDialogContentSx;

export { Btn as NumManipulateBtn };
export { TH as NumManipulateTH };
export { tdStyle as numManipulateTdStyle };

export const numManipulateMuiTextFieldSx = {
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

export const numManipulateMuiSelectSx = {
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

export const numManipulateCheckboxSx = {
  padding: "1px",
  color: "#3E5475",
  "&.Mui-checked": { color: "#0284c7" },
  "&.MuiCheckbox-indeterminate": { color: "#0284c7" },
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

export const formatNumManipulateTooltipTitle = (text) => {
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

export const NumManipulateFieldLabel = ({ tooltipKey, tooltips, children, style = {} }) => {
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
    <Tooltip title={formatNumManipulateTooltipTitle(tooltip)} {...FIELD_TOOLTIP_PROPS}>
      {labelNode}
    </Tooltip>
  );
};

export const NumManipulateModalFormFields = ({
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
        <NumManipulateFieldLabel
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
        </NumManipulateFieldLabel>
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
                sx={numManipulateMuiSelectSx}
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
              sx={numManipulateMuiTextFieldSx}
            />
          )}
        </div>
      </div>
    ))}
  </div>
);

export const createNumManipulateDialogConfig = () => ({
  dialogSx: fxsDialogSx,
  paperSx: createFxsDialogPaperSx(600),
  modalTitleStyle: fxsModalTitleStyle,
});

export const createNumManipulateBreadcrumb = (_root, section, title) =>
  function NumManipulateBreadcrumb() {
    return <FxsBreadcrumb root="FXS" section={section} current={title} />;
  };
