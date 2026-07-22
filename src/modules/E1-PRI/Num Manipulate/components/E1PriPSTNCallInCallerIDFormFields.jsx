import React from "react";
import { Tooltip } from "@mui/material";
import {
  C,
  OUTLINED_BORDER,
  OUTLINED_FOCUS,
  OUTLINED_HOVER,
  FOCUS_RING_SHADOW,
} from "../../../../theme/pbxTokens";
import {
  Btn,
  TH,
  tdStyle,
  EXTENSION_TABLE_CARD_RADIUS as E1_PRI_CARD_RADIUS,
  ExtensionBreadcrumb as E1PriBreadcrumb,
  addNewModalFooterBtnStyle as e1PriToolbarBtnStyle,
  addNewModalFooterCancelBtnStyle as e1PriAddNewModalFooterCancelBtnStyle,
  addNewModalFooterStyle as e1PriAddNewModalFooterStyle,
  extensionCancelBtnStyle as e1PriCancelBtnStyle,
  extensionCardStyle as e1PriCardStyle,
  extensionPageBadgeStyle as e1PriPageBadgeStyle,
  extensionPaginationStyle as e1PriPaginationStyle,
  extensionToolbarStyle as e1PriToolbarStyle,
  extensionTableCheckboxSx,
  ExtensionTableListEmptyState,
  ExtensionTableListLoading,
} from "../../../../components/common";
import {
  NUM_MANIPULATE_PSTN_CALL_IN_CALLERID_PAGE_BREADCRUMB_SECTION,
  NUM_MANIPULATE_PSTN_CALL_IN_CALLERID_PAGE_TITLE,
} from "../../../../constants/E1PriPSTNCallInCallerIDConstants";

export const e1PriModalTitleStyle = {
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

export const e1PriModalBackdropSlotProps = {
  backdrop: { sx: { backgroundColor: "rgba(0, 0, 0, 0.5)" } },
};

export const e1PriModalDialogContentSx = {
  maxHeight: "calc(100vh - 220px)",
  overflowY: "auto",
  WebkitOverflowScrolling: "touch",
};

export const e1PriDialogSx = {
  "& .MuiDialog-container": {
    alignItems: "center",
    justifyContent: "center",
  },
};

const E1_DIALOG_MARGIN = 24;
const E1_DIALOG_LAYOUT_OFFSET = 80;

export const createE1PriDialogPaperSx = (width = 600) => ({
  margin: E1_DIALOG_MARGIN,
  maxHeight: `calc(100vh - ${E1_DIALOG_LAYOUT_OFFSET}px - ${E1_DIALOG_MARGIN * 2}px)`,
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


export const e1PriPSTNCallInCallerIDSharedCardRadius = E1_PRI_CARD_RADIUS;
export const e1PriPSTNCallInCallerIDCardRadius = E1_PRI_CARD_RADIUS;
export const e1PriPSTNCallInCallerIDCardStyle = e1PriCardStyle;
export const e1PriPSTNCallInCallerIDToolbarStyle = e1PriToolbarStyle;
export const e1PriPSTNCallInCallerIDPaginationStyle = e1PriPaginationStyle;
export const e1PriPSTNCallInCallerIDPageBadgeStyle = e1PriPageBadgeStyle;
export const e1PriPSTNCallInCallerIDCancelBtnStyle = e1PriCancelBtnStyle;
export const e1PriPSTNCallInCallerIDToolbarBtnStyle = e1PriToolbarBtnStyle;

export const E1_PRI_PSTN_CALL_IN_CALLERID_COMPACT_MQ = "(max-width: 768px)";

export {
  ExtensionTableListLoading as E1PriPSTNCallInCallerIDTableListLoading,
  ExtensionTableListEmptyState as E1PriPSTNCallInCallerIDTableListEmptyState,
};

export const e1PriPSTNCallInCallerIDAddNewModalFooterStyle = e1PriAddNewModalFooterStyle;
export const e1PriPSTNCallInCallerIDAddNewModalFooterBtnStyle = e1PriToolbarBtnStyle;
export const e1PriPSTNCallInCallerIDAddNewModalFooterCancelBtnStyle =
  e1PriAddNewModalFooterCancelBtnStyle;
export const e1PriPSTNCallInCallerIDAddNewModalBackdropSlotProps =
  e1PriModalBackdropSlotProps;
export const e1PriPSTNCallInCallerIDAddNewModalDialogContentSx =
  e1PriModalDialogContentSx;

export { Btn as E1PriPSTNCallInCallerIDBtn };
export { TH as E1PriPSTNCallInCallerIDTH };
export { tdStyle as e1PriPSTNCallInCallerIDTdStyle };
export { C as e1PriPSTNCallInCallerIDC };
export { extensionTableCheckboxSx as e1PriPSTNCallInCallerIDCheckboxSx };

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

export const e1PriPSTNCallInCallerIDInputInteraction = {
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

export const e1PriPSTNCallInCallerIDInputStyle = {
  width: "100%",
  height: 32,
  padding: "0 10px",
  fontSize: 13,
  lineHeight: 1.35,
  border: `1px solid ${OUTLINED_BORDER}`,
  borderRadius: 4,
  outline: "none",
  backgroundColor: "#fff",
  color: C.valueText,
  boxSizing: "border-box",
  transition: "border-color 0.2s ease, box-shadow 0.2s ease",
};

export const e1PriPSTNCallInCallerIDSelectStyle = {
  ...e1PriPSTNCallInCallerIDInputStyle,
  padding: "0 28px 0 10px",
  appearance: "auto",
  cursor: "pointer",
};

export const e1PriPSTNCallInCallerIDFormPanelStyle = {
  display: "flex",
  flexDirection: "column",
  gap: 14,
  background: "#f8fafc",
  border: `1px solid ${C.cardBorder}`,
  borderRadius: 4,
  padding: 20,
};

export const formatE1PriPSTNCallInCallerIDTooltipTitle = (text) => {
  if (!text) return "";
  const normalized = text
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
  if (normalized.includes("\n")) {
    return (
      <span style={{ whiteSpace: "pre-line", display: "block" }}>
        {normalized}
      </span>
    );
  }
  return normalized;
};

export const E1PriPSTNCallInCallerIDFieldLabel = ({
  tooltipKey,
  tooltips,
  children,
  style = {},
}) => {
  const tooltip = tooltipKey ? tooltips?.[tooltipKey] || "" : "";
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
    <Tooltip
      title={formatE1PriPSTNCallInCallerIDTooltipTitle(tooltip)}
      {...FIELD_TOOLTIP_PROPS}
    >
      {labelNode}
    </Tooltip>
  );
};

export const E1PriPSTNCallInCallerIDFieldRow = ({
  label,
  tooltipKey,
  tooltips,
  children,
  labelWidth = 170,
}) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 12,
    }}
  >
    <E1PriPSTNCallInCallerIDFieldLabel
      tooltipKey={tooltipKey}
      tooltips={tooltips}
      style={{
        width: labelWidth,
        flexShrink: 0,
        textAlign: "left",
        display: "inline-block",
        whiteSpace: "normal",
        lineHeight: 1.2,
      }}
    >
      {label}
    </E1PriPSTNCallInCallerIDFieldLabel>
    <div style={{ width: "min(100%, 320px)" }}>{children}</div>
  </div>
);

export const E1PriPSTNCallInCallerIDModalFormFields = ({
  fields,
  fieldTooltips,
  formData,
  handleInputChange,
  labelWidth = 170,
}) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
    <div style={e1PriPSTNCallInCallerIDFormPanelStyle}>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {fields.map((field) => (
          <E1PriPSTNCallInCallerIDFieldRow
            key={field.name}
            label={field.label}
            tooltipKey={field.name}
            tooltips={fieldTooltips}
            labelWidth={labelWidth}
          >
            {field.type === "select" ? (
              <select
                name={field.name}
                value={formData[field.name] || ""}
                onChange={handleInputChange}
                style={e1PriPSTNCallInCallerIDSelectStyle}
                {...e1PriPSTNCallInCallerIDInputInteraction}
              >
                {(field.options || []).length > 0 ? (
                  field.options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))
                ) : field.emptyOptionLabel != null ? (
                  <option value="">{field.emptyOptionLabel}</option>
                ) : null}
              </select>
            ) : (
              <input
                type={field.type || "text"}
                name={field.name}
                value={formData[field.name] || ""}
                onChange={handleInputChange}
                style={e1PriPSTNCallInCallerIDInputStyle}
                {...e1PriPSTNCallInCallerIDInputInteraction}
              />
            )}
          </E1PriPSTNCallInCallerIDFieldRow>
        ))}
      </div>
    </div>
  </div>
);


export const E1PriPSTNCallInCallerIDBreadcrumb = () => (
  <E1PriBreadcrumb
    root="E1-PRI"
    section={NUM_MANIPULATE_PSTN_CALL_IN_CALLERID_PAGE_BREADCRUMB_SECTION}
    current={NUM_MANIPULATE_PSTN_CALL_IN_CALLERID_PAGE_TITLE}
  />
);

export const e1PriPSTNCallInCallerIDDialogConfig = {
  dialogSx: e1PriDialogSx,
  paperSx: createE1PriDialogPaperSx(600),
  modalTitleStyle: e1PriModalTitleStyle,
};
