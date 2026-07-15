import React from "react";
import { Alert, Checkbox, Tooltip } from "@mui/material";
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
  addNewModalFooterBtnStyle as fxsAddNewModalFooterBtnStyle,
  addNewModalFooterCancelBtnStyle as fxsAddNewModalFooterCancelBtnStyle,
} from "../../../../components/common";
import {
  PORT_FXS_BATCH_MODIFY_FIELDS,
  PORT_FXS_BATCH_MODIFY_FIELD_TOOLTIPS,
  PORT_FXS_BATCH_MODIFY_NOTE,
  PORT_FXS_BATCH_MODIFY_TITLE,
  PORT_FXS_MODIFY_DIALOG_WIDTH,
  PORT_FXS_MODIFY_FORM_WIDTH,
} from "../../../../constants/PortFxsPageConstants";
import { getPortFxsBatchSpacerBeforeField } from "../utils/PortFxsBatchModifyTransformers";
import {
  BATCH_FORM_TABLE_WIDTH,
  BATCH_LABEL_WIDTH,
  getPortFxsBatchFieldKeyDown,
} from "./PortFxsBatchModifyTableHelpers";

export const fxsFormInlineFooterStyle = {
  display: "flex",
  justifyContent: "center",
  gap: 12,
  padding: "10px 28px",
  borderTop: `1px solid ${C.divider}`,
  background: C.cardBg,
  boxSizing: "border-box",
};

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

export const PortFxsBatchFieldLabel = ({ tooltipKey, tooltips, children, style = {} }) => {
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

export const portFxsBatchNativeFieldInteraction = {
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

export const portFxsBatchDialogFieldStyle = {
  ...nativeFieldInputStyle,
  width: "200px",
};

export const portFxsBatchCheckboxSx = {
  padding: "1px",
  color: "#3E5475",
  "&.Mui-checked": { color: "#0284c7" },
  "&.MuiCheckbox-indeterminate": { color: "#0284c7" },
};

export const addNewModalFooterBtnStyle = fxsAddNewModalFooterBtnStyle;
export const addNewModalFooterCancelBtnStyle = fxsAddNewModalFooterCancelBtnStyle;

export const pageFooterStyle = fxsFormInlineFooterStyle;

export const fxsBatchModifyFormShellStyle = {
  width: PORT_FXS_MODIFY_FORM_WIDTH,
  maxWidth: "100%",
  margin: "0 auto",
};

const batchLabelCellStyle = {
  fontSize: 13,
  fontWeight: 600,
  color: C.labelText,
  textAlign: "left",
  verticalAlign: "middle",
  width: BATCH_LABEL_WIDTH,
  minWidth: BATCH_LABEL_WIDTH,
  maxWidth: BATCH_LABEL_WIDTH,
  padding: "6px 12px 6px 0",
  whiteSpace: "normal",
  lineHeight: 1.35,
};

const batchValueCellStyle = {
  fontSize: 13,
  textAlign: "left",
  verticalAlign: "middle",
  padding: "6px 0",
};

export const PortFxsBatchModifyFormBody = ({
  formId,
  form,
  portOptions,
  inDialog,
  message,
  setMessage,
  handleSave,
  handleCancel,
  handleChange,
  handleCheckbox,
  shouldShowField,
}) => {
  const fieldStyle = portFxsBatchDialogFieldStyle;
  const wideFieldStyle = { ...portFxsBatchDialogFieldStyle, width: "200px" };

  return (
    <>
      {message.text && (
        <Alert
          severity={
            message.type === "error"
              ? "error"
              : message.type === "success"
                ? "success"
                : "info"
          }
          onClose={() => setMessage({ type: "", text: "" })}
          sx={{
            position: "fixed",
            top: 20,
            right: 20,
            zIndex: 9999,
            minWidth: 300,
            boxShadow: 3,
          }}
        >
          {message.text}
        </Alert>
      )}

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 16,
          width: "100%",
        }}
      >
        <form id={formId} onSubmit={handleSave} style={fxsBatchModifyFormShellStyle}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 14,
              background: "#f8fafc",
              border: `1px solid ${C.cardBorder}`,
              borderRadius: 4,
              padding: 20,
              width: "100%",
              boxSizing: "border-box",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                width: "100%",
              }}
            >
              <table
                cellSpacing="0"
                cellPadding="0"
                style={{
                  width: BATCH_FORM_TABLE_WIDTH,
                  maxWidth: "100%",
                  tableLayout: "fixed",
                  textAlign: "left",
                }}
              >
                <colgroup>
                  <col style={{ width: BATCH_LABEL_WIDTH }} />
                  <col />
                </colgroup>
                <tbody>
                  {PORT_FXS_BATCH_MODIFY_FIELDS.map((field, idx) => {
                    if (!shouldShowField(field)) return null;

                    const prevField =
                      idx > 0 ? PORT_FXS_BATCH_MODIFY_FIELDS[idx - 1] : null;
                    const needsSpacer = getPortFxsBatchSpacerBeforeField(
                      prevField,
                      shouldShowField,
                    );

                    return (
                      <React.Fragment key={field.key}>
                        {needsSpacer && (
                          <tr>
                            <td colSpan={2} style={{ height: 10 }} />
                          </tr>
                        )}

                        <tr>
                          <td style={batchLabelCellStyle}>
                            <PortFxsBatchFieldLabel
                              tooltipKey={field.key}
                              tooltips={PORT_FXS_BATCH_MODIFY_FIELD_TOOLTIPS}
                            >
                              {field.label}
                            </PortFxsBatchFieldLabel>
                          </td>
                          <td style={batchValueCellStyle}>
                            {field.type === "checkbox" ? (
                              <label
                                style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: 4,
                                  fontSize: 13,
                                  color: C.valueText,
                                  cursor:
                                    field.key === "dnd" && form.callForward
                                      ? "not-allowed"
                                      : field.key === "callForward" && form.dnd
                                        ? "not-allowed"
                                        : "pointer",
                                }}
                              >
                                <Checkbox
                                  size="small"
                                  checked={!!form[field.key]}
                                  onChange={() => handleCheckbox(field.key)}
                                  disabled={
                                    field.key === "dnd"
                                      ? !!form.callForward
                                      : field.key === "callForward"
                                        ? !!form.dnd
                                        : false
                                  }
                                  sx={portFxsBatchCheckboxSx}
                                />
                                Enable
                              </label>
                            ) : field.type === "text" ? (
                              <input
                                type="text"
                                value={form[field.key]}
                                onChange={(e) =>
                                  handleChange(field.key, e.target.value)
                                }
                                style={fieldStyle}
                                {...portFxsBatchNativeFieldInteraction}
                                maxLength={field.maxLength || 31}
                                onKeyDown={getPortFxsBatchFieldKeyDown(field)}
                              />
                            ) : field.type === "password" ? (
                              <input
                                type="password"
                                value={form[field.key]}
                                onChange={(e) =>
                                  handleChange(field.key, e.target.value)
                                }
                                style={fieldStyle}
                                {...portFxsBatchNativeFieldInteraction}
                                maxLength={field.maxLength || 63}
                              />
                            ) : field.type === "select" ? (
                              <select
                                value={form[field.key]}
                                onChange={(e) =>
                                  handleChange(field.key, e.target.value)
                                }
                                style={
                                  field.key.includes("Parameter")
                                    ? wideFieldStyle
                                    : fieldStyle
                                }
                                {...portFxsBatchNativeFieldInteraction}
                              >
                                {(field.key === "startingPort" ||
                                field.key === "endingPort"
                                  ? portOptions
                                  : field.options
                                ).map((opt) => (
                                  <option key={opt} value={opt}>
                                    {opt}
                                  </option>
                                ))}
                              </select>
                            ) : null}
                          </td>
                        </tr>
                      </React.Fragment>
                    );
                  })}

                  <tr>
                    <td colSpan={2} style={{ height: 8 }} />
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {!inDialog && (
            <div style={pageFooterStyle}>
              <Btn
                variant="primary"
                type="button"
                onClick={handleSave}
                style={addNewModalFooterBtnStyle}
              >
                Save
              </Btn>
              <Btn
                variant="cancel"
                type="button"
                onClick={handleCancel}
                style={addNewModalFooterCancelBtnStyle}
              >
                Close
              </Btn>
            </div>
          )}
        </form>

        <div
          style={{
            textAlign: "center",
            fontSize: 12,
            color: "#dc2626",
            width: "100%",
            whiteSpace: "nowrap",
            overflowX: "auto",
          }}
        >
          {PORT_FXS_BATCH_MODIFY_NOTE}
        </div>
      </div>
    </>
  );
};

export const PortFxsBatchModifyStandaloneShell = ({ children }) => (
  <div
    className="bg-gray-50 min-h-[calc(100vh-128px)] py-1"
    style={{ backgroundColor: "#dde0e4" }}
  >
    <div className="flex justify-center" style={{ padding: "0 16px" }}>
      <div
        style={{
          width: "100%",
          maxWidth: PORT_FXS_MODIFY_DIALOG_WIDTH,
          margin: "0 auto",
        }}
      >
        <div className="rounded-t-lg w-full h-8 bg-[#3E5475] flex items-center justify-center font-semibold text-lg text-white shadow mb-0">
          <span>{PORT_FXS_BATCH_MODIFY_TITLE}</span>
        </div>
        {children}
      </div>
    </div>
  </div>
);
