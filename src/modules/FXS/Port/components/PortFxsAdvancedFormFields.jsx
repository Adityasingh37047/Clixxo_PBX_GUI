import React from "react";
import {
  PORT_FXS_ADVANCED_PAGE_BREADCRUMB_SECTION, PORT_FXS_ADVANCED_PAGE_TITLE, PORT_FXS_ADVANCED_FIELD_TOOLTIPS, WEEK_DAYS, PORT_FXS_ADVANCED_TOTAL_PORTS, PORT_FXS_ADVANCED_BATCH_MODIFY_NOTES } from "../../../../constants/PortFxsAdvancedPageConstants";
import { Checkbox, Tooltip } from "@mui/material";

import { OUTLINED_BORDER, OUTLINED_FOCUS, OUTLINED_HOVER, C, FOCUS_RING_SHADOW } from "../../../../theme/pbxTokens";
import { Btn, ExtensionBreadcrumb as FxsBreadcrumb, extensionCardStyle as fxsCardStyle, extensionToolbarStyle as fxsToolbarStyle, addNewModalFooterBtnStyle as fxsToolbarBtnStyle, addNewModalFooterStyle as fxsAddNewModalFooterStyle, addNewModalFooterBtnStyle as fxsAddNewModalFooterBtnStyle, addNewModalFooterCancelBtnStyle as fxsAddNewModalFooterCancelBtnStyle, extensionPageWrapStyle as fxsPageWrapStyle, extensionPageInnerStyle as fxsPageInnerStyle, extensionPaginationStyle as fxsPaginationStyle, extensionCancelBtnStyle as fxsToolbarCancelBtnStyle, extensionPrimaryBtnStyle as fxsToolbarPrimaryBtnStyle,
  extensionTableCheckboxSx as portFxsAdvancedCheckboxSx,
} from "../../../../components/common";

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


const FIELD_LABEL_COLOR = "#3E5475";

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

export const PortFxsAdvancedFieldLabel = ({ tooltipKey, tooltips, children, style = {} }) => {
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

export const portFxsAdvancedNativeFieldInteraction = {
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

const nativeFieldInputStyle = {
  height: 32,
  width: 200,
  padding: "0 10px",
  fontSize: 13,
  lineHeight: 1.35,
  border: `1px solid ${OUTLINED_BORDER}`,
  borderRadius: 4,
  outline: "none",
  backgroundColor: "#fff",
  color: C.valueText,
  boxSizing: "border-box",
  boxShadow: "none",
  transition: "border-color 0.2s ease, box-shadow 0.2s ease",
};

const nativeFieldSelectStyle = {
  width: nativeFieldInputStyle.width,
  height: 32,
  minHeight: 32,
  padding: "0 28px 0 10px",
  fontSize: nativeFieldInputStyle.fontSize,
  lineHeight: 1.35,
  border: nativeFieldInputStyle.border,
  borderRadius: nativeFieldInputStyle.borderRadius,
  outline: nativeFieldInputStyle.outline,
  backgroundColor: nativeFieldInputStyle.backgroundColor,
  color: nativeFieldInputStyle.color,
  boxSizing: nativeFieldInputStyle.boxSizing,
  transition: nativeFieldInputStyle.transition,
  appearance: "auto",
};

export const portFxsAdvancedInputStyle = {
  ...nativeFieldInputStyle,
  width: "100%",
};

export const portFxsAdvancedSelectStyle = {
  ...nativeFieldSelectStyle,
  width: "100%",
};



export const portFxsAdvancedPageWrapStyle = fxsPageWrapStyle;
export const portFxsAdvancedPageInnerStyle = fxsPageInnerStyle;
export const portFxsAdvancedCardStyle = fxsCardStyle;
export const portFxsAdvancedHeaderStyle = {
  ...fxsToolbarStyle,
  justifyContent: "flex-end",
};
export { fxsToolbarBtnStyle, fxsToolbarCancelBtnStyle, fxsToolbarPrimaryBtnStyle };

export const portFxsAdvancedTableBodyStyle = {
  overflowX: "auto",
  overflowY: "auto",
  width: "100%",
  boxSizing: "border-box",
};

export const portFxsAdvancedPaginationStyle = fxsPaginationStyle;
export const addNewModalFooterStyle = fxsAddNewModalFooterStyle;
export const addNewModalFooterBtnStyle = fxsAddNewModalFooterBtnStyle;
export const addNewModalFooterCancelBtnStyle = fxsAddNewModalFooterCancelBtnStyle;
export const addNewModalBackdropSlotProps = fxsModalBackdropSlotProps;
export const addNewModalDialogContentSx = fxsModalDialogContentSx;

export const PORT_FXS_ADVANCED_ADD_NEW_DIALOG_SX = fxsDialogSx;
export const PORT_FXS_ADVANCED_ADD_NEW_DIALOG_PAPER_SX = createFxsDialogPaperSx(720);

export const PortFxsAdvancedBreadcrumb = () => (
  <FxsBreadcrumb
    section={PORT_FXS_ADVANCED_PAGE_BREADCRUMB_SECTION}
    current={PORT_FXS_ADVANCED_PAGE_TITLE}
  />
);

export const advancedFormPanelStyle = {
  display: "flex",
  flexDirection: "column",
  gap: 14,
  background: "#f8fafc",
  border: `1px solid ${C.cardBorder}`,
  borderRadius: 4,
  padding: 20,
};

export const PortFxsAdvancedFieldRow = ({
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
      <PortFxsAdvancedFieldLabel
        tooltipKey={tooltipKey}
        tooltips={PORT_FXS_ADVANCED_FIELD_TOOLTIPS}
      >
        {label}
      </PortFxsAdvancedFieldLabel>
      {required && <span style={{ color: "#dc2626" }}> *</span>}
    </label>
    <div style={{ width: "min(100%, 320px)" }}>{children}</div>
  </div>
);

export const PortFxsAdvancedTimePeriods = ({
  batchForm,
  prohibitLimitCount,
  handleFormChange,
  handlePeriodCountChange,
}) => {
  if (
    !batchForm.forbidOutgoingCall ||
    batchForm.wayOfForbidOutgoingCall !== "Select time"
  ) {
    return null;
  }

  const periods = [];
  for (let i = 1; i <= prohibitLimitCount; i++) {
    periods.push(
      <div
        key={i}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 12,
          padding: "16px 12px",
          border: `1px solid ${C.cardBorder}`,
          borderRadius: 6,
          marginTop: 8,
          backgroundColor: "#f8fafc",
        }}
      >
        <div style={{ fontSize: 12, fontWeight: 700, color: C.labelText }}>
          Time Period {i}
        </div>
        {["1", "2", "3"].map((n) => (
          <PortFxsAdvancedFieldRow
            key={n}
            label={`Period ${n} (hh:mm:ss):`}
            tooltipKey="periodStart"
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <input
                type="text"
                value={batchForm[`period${i}Start${n}`] || "00:00:00"}
                onChange={(e) =>
                  handleFormChange(`period${i}Start${n}`, e.target.value)
                }
                style={{ ...portFxsAdvancedInputStyle, width: 100 }}
                {...portFxsAdvancedNativeFieldInteraction}
                maxLength={8}
                placeholder="00:00:00"
              />
              <span style={{ color: C.mutedText }}>-</span>
              <input
                type="text"
                value={batchForm[`period${i}End${n}`] || "00:00:00"}
                onChange={(e) =>
                  handleFormChange(`period${i}End${n}`, e.target.value)
                }
                style={{ ...portFxsAdvancedInputStyle, width: 100 }}
                {...portFxsAdvancedNativeFieldInteraction}
                maxLength={8}
                placeholder="00:00:00"
              />
            </div>
          </PortFxsAdvancedFieldRow>
        ))}
        <PortFxsAdvancedFieldRow label="Week:" tooltipKey="periodWeek">
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
            {WEEK_DAYS.map((day, idx) => (
              <label
                key={day}
                style={{
                  display: "flex",
                  alignItems: "center",
                  fontSize: 12,
                  fontWeight: 600,
                  color: C.labelText,
                  cursor: "pointer",
                }}
              >
                <Checkbox
                  size="small"
                  checked={!!batchForm[`period${i}Week${idx}`]}
                  onChange={() =>
                    handleFormChange(
                      `period${i}Week${idx}`,
                      !batchForm[`period${i}Week${idx}`],
                    )
                  }
                  sx={{ ...portFxsAdvancedCheckboxSx, marginRight: "4px" }}
                />
                {day}
              </label>
            ))}
          </div>
        </PortFxsAdvancedFieldRow>
      </div>,
    );
  }

  return (
    <>
      {periods}
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          marginTop: 8,
        }}
      >
        <div style={{ display: "flex", gap: 8 }}>
          {prohibitLimitCount < 5 && (
            <Btn
              variant="cancel"
              onClick={() => handlePeriodCountChange("plus")}
              style={fxsToolbarBtnStyle}
            >
              + Add Period
            </Btn>
          )}
          {prohibitLimitCount > 1 && (
            <Btn
              variant="cancel"
              onClick={() => handlePeriodCountChange("minus")}
              style={fxsToolbarBtnStyle}
            >
              - Remove Period
            </Btn>
          )}
        </div>
      </div>
    </>
  );
};

export const PortFxsAdvancedBatchModifyForm = ({
  batchForm,
  prohibitLimitCount,
  handleFormChange,
  handleCheckbox,
  handlePeriodCountChange,
  handleSave,
  shouldShowField,
}) => (
  <form onSubmit={handleSave}>
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <PortFxsAdvancedFieldRow label="Port:" tooltipKey="port">
        <select
          value={batchForm.port}
          onChange={(e) => handleFormChange("port", e.target.value)}
          style={portFxsAdvancedSelectStyle}
          {...portFxsAdvancedNativeFieldInteraction}
        >
          {Array.from({ length: PORT_FXS_ADVANCED_TOTAL_PORTS }, (_, i) => (
            <option key={i + 1} value={String(i + 1)}>
              {i + 1}
            </option>
          ))}
        </select>
      </PortFxsAdvancedFieldRow>

      <PortFxsAdvancedFieldRow label="Type:" tooltipKey="type">
        <input
          type="text"
          value={batchForm.type || "FXS"}
          onChange={(e) => handleFormChange("type", e.target.value)}
          style={{ ...portFxsAdvancedInputStyle, backgroundColor: "#f3f4f6" }}
          {...portFxsAdvancedNativeFieldInteraction}
          readOnly
        />
      </PortFxsAdvancedFieldRow>

      <PortFxsAdvancedFieldRow label="Forbid Outgoing Call:" tooltipKey="forbidOutgoingCall">
        <label
          style={{
            display: "flex",
            alignItems: "center",
            fontSize: 13,
            color: C.valueText,
            cursor: "pointer",
          }}
        >
          <Checkbox
            size="small"
            checked={!!batchForm.forbidOutgoingCall}
            onChange={() => handleCheckbox("forbidOutgoingCall")}
            sx={portFxsAdvancedCheckboxSx}
          />
          Enable
        </label>
      </PortFxsAdvancedFieldRow>

      {shouldShowField({ conditional: "forbidOutgoingCall" }) && (
        <PortFxsAdvancedFieldRow
          label="Way Of Forbid Outgoing Call:"
          tooltipKey="wayOfForbidOutgoingCall"
        >
          <select
            value={batchForm.wayOfForbidOutgoingCall}
            onChange={(e) =>
              handleFormChange("wayOfForbidOutgoingCall", e.target.value)
            }
            style={portFxsAdvancedSelectStyle}
            {...portFxsAdvancedNativeFieldInteraction}
          >
            <option value="All time">All time</option>
            <option value="Select time">Select time</option>
          </select>
        </PortFxsAdvancedFieldRow>
      )}

      {batchForm.forbidOutgoingCall &&
        batchForm.wayOfForbidOutgoingCall === "Select time" && (
          <PortFxsAdvancedTimePeriods
            batchForm={batchForm}
            prohibitLimitCount={prohibitLimitCount}
            handleFormChange={handleFormChange}
            handlePeriodCountChange={handlePeriodCountChange}
          />
        )}

      <PortFxsAdvancedFieldRow
        label="Blacklist of FXS Out Calls:"
        align="flex-start"
        tooltipKey="blacklistOfFxsOutCalls"
      >
        <textarea
          value={batchForm.blacklistOfFxsOutCalls}
          onChange={(e) =>
            handleFormChange("blacklistOfFxsOutCalls", e.target.value)
          }
          style={{
            ...portFxsAdvancedInputStyle,
            height: "80px",
            resize: "vertical",
            padding: "8px 10px",
            lineHeight: 1.4,
          }}
          {...portFxsAdvancedNativeFieldInteraction}
          maxLength={1000}
        />
      </PortFxsAdvancedFieldRow>
    </div>

    <div
      style={{
        marginTop: 24,
        padding: "0 4px",
        fontSize: 12,
        color: "#dc2626",
        textAlign: "center",
      }}
    >
      <div
        style={{
          lineHeight: 1.6,
          display: "inline-grid",
          gridTemplateColumns: "40px auto",
          textAlign: "left",
          columnGap: 0,
          color: C.accent,
        }}
      >
        <div>Note:</div>
        <div>{PORT_FXS_ADVANCED_BATCH_MODIFY_NOTES[0].replace(/^Note:/, "")}</div>
        <div></div>
        <div>{PORT_FXS_ADVANCED_BATCH_MODIFY_NOTES[1]}</div>
      </div>
    </div>
  </form>
);
