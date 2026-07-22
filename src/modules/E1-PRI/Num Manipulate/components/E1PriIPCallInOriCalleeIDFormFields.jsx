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
  NUM_MANIPULATE_IP_CALL_IN_ORICALLEEID_PAGE_BREADCRUMB_SECTION,
  NUM_MANIPULATE_IP_CALL_IN_ORICALLEEID_PAGE_TITLE,
} from "../../../../constants/E1PriIPCallInOriCalleeIDConstants";

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


export const e1PriIPCallInOriCalleeIDSharedCardRadius = E1_PRI_CARD_RADIUS;
export const e1PriIPCallInOriCalleeIDCardRadius = E1_PRI_CARD_RADIUS;
export const e1PriIPCallInOriCalleeIDCardStyle = e1PriCardStyle;
export const e1PriIPCallInOriCalleeIDToolbarStyle = e1PriToolbarStyle;
export const e1PriIPCallInOriCalleeIDPaginationStyle = e1PriPaginationStyle;
export const e1PriIPCallInOriCalleeIDPageBadgeStyle = e1PriPageBadgeStyle;
export const e1PriIPCallInOriCalleeIDCancelBtnStyle = e1PriCancelBtnStyle;
export const e1PriIPCallInOriCalleeIDToolbarBtnStyle = e1PriToolbarBtnStyle;

export const E1_PRI_IP_CALL_IN_ORICALLEEID_COMPACT_MQ = "(max-width: 768px)";

export {
  ExtensionTableListLoading as E1PriIPCallInOriCalleeIDTableListLoading,
  ExtensionTableListEmptyState as E1PriIPCallInOriCalleeIDTableListEmptyState,
};

export const e1PriIPCallInOriCalleeIDAddNewModalFooterStyle = e1PriAddNewModalFooterStyle;
export const e1PriIPCallInOriCalleeIDAddNewModalFooterBtnStyle = e1PriToolbarBtnStyle;
export const e1PriIPCallInOriCalleeIDAddNewModalFooterCancelBtnStyle =
  e1PriAddNewModalFooterCancelBtnStyle;
export const e1PriIPCallInOriCalleeIDAddNewModalBackdropSlotProps =
  e1PriModalBackdropSlotProps;
export const e1PriIPCallInOriCalleeIDAddNewModalDialogContentSx =
  e1PriModalDialogContentSx;

export { Btn as E1PriIPCallInOriCalleeIDBtn };
export { TH as E1PriIPCallInOriCalleeIDTH };
export { tdStyle as e1PriIPCallInOriCalleeIDTdStyle };
export { C as e1PriIPCallInOriCalleeIDC };
export { extensionTableCheckboxSx as e1PriIPCallInOriCalleeIDCheckboxSx };

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

export const e1PriIPCallInOriCalleeIDInputInteraction = {
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

export const e1PriIPCallInOriCalleeIDInputStyle = {
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

export const e1PriIPCallInOriCalleeIDSelectStyle = {
  ...e1PriIPCallInOriCalleeIDInputStyle,
  padding: "0 28px 0 10px",
  appearance: "auto",
  cursor: "pointer",
};

export const e1PriIPCallInOriCalleeIDFormPanelStyle = {
  display: "flex",
  flexDirection: "column",
  gap: 14,
  background: "#f8fafc",
  border: `1px solid ${C.cardBorder}`,
  borderRadius: 4,
  padding: 20,
};

export const formatE1PriIPCallInOriCalleeIDTooltipTitle = (text) => {
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

export const E1PriIPCallInOriCalleeIDFieldLabel = ({
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
      title={formatE1PriIPCallInOriCalleeIDTooltipTitle(tooltip)}
      {...FIELD_TOOLTIP_PROPS}
    >
      {labelNode}
    </Tooltip>
  );
};

export const E1PriIPCallInOriCalleeIDFieldRow = ({
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
    <E1PriIPCallInOriCalleeIDFieldLabel
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
    </E1PriIPCallInOriCalleeIDFieldLabel>
    <div style={{ width: "min(100%, 320px)" }}>{children}</div>
  </div>
);

export const E1PriIPCallInOriCalleeIDModalFormFields = ({
  fields,
  fieldTooltips,
  formData,
  handleInputChange,
  labelWidth = 170,
}) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
    <div style={e1PriIPCallInOriCalleeIDFormPanelStyle}>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {fields.map((field) => (
          <E1PriIPCallInOriCalleeIDFieldRow
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
                style={e1PriIPCallInOriCalleeIDSelectStyle}
                {...e1PriIPCallInOriCalleeIDInputInteraction}
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
                style={e1PriIPCallInOriCalleeIDInputStyle}
                {...e1PriIPCallInOriCalleeIDInputInteraction}
              />
            )}
          </E1PriIPCallInOriCalleeIDFieldRow>
        ))}
      </div>
    </div>
  </div>
);


export const E1PriIPCallInOriCalleeIDBreadcrumb = () => (
  <E1PriBreadcrumb
    root="E1-PRI"
    section={NUM_MANIPULATE_IP_CALL_IN_ORICALLEEID_PAGE_BREADCRUMB_SECTION}
    current={NUM_MANIPULATE_IP_CALL_IN_ORICALLEEID_PAGE_TITLE}
  />
);

export const e1PriIPCallInOriCalleeIDDialogConfig = {
  dialogSx: e1PriDialogSx,
  paperSx: createE1PriDialogPaperSx(600),
  modalTitleStyle: e1PriModalTitleStyle,
};
