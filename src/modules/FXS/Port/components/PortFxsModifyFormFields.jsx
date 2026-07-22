import React from "react";
import {
  Alert, Checkbox, Tooltip } from "@mui/material";
import {
  Btn,
  addNewModalFooterBtnStyle as fxsAddNewModalFooterBtnStyle,
  addNewModalFooterCancelBtnStyle as fxsAddNewModalFooterCancelBtnStyle,
  extensionTableCheckboxSx as portFxsModifyCheckboxSx,
} from "../../../../components/common";
import { C } from "../../../../theme/pbxTokens";
import {
  PORT_FXS_BATCH_MODIFY_NOTE,
  PORT_FXS_MODIFY_DIALOG_WIDTH,
  PORT_FXS_MODIFY_FIELDS,
  PORT_FXS_MODIFY_FIELD_TOOLTIPS,
  PORT_FXS_MODIFY_FORM_WIDTH,
} from "../../../../constants/PortFxsPageConstants";
import { getPortFxsModifySpacerBeforeField } from "../utils/PortFxsModifyTransformers";
import {
  FORM_LABEL_WIDTH,
  FORM_TABLE_WIDTH,
  getPortFxsModifyFieldKeyDown,
} from "./PortFxsModifyTableHelpers";


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

const MODIFY_C = {
  cardBg: "#ffffff",
  cardBorder: "#9CA3AF",
  labelText: "#3E5475",
  valueText: "#0f172a",
  divider: undefined,
};

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

export const PortFxsModifyFieldLabel = ({ tooltipKey, tooltips, children, style = {} }) => {
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

const OUTLINED_BORDER = "rgba(0, 0, 0, 0.23)";
const OUTLINED_HOVER = "rgba(0, 0, 0, 0.87)";
const OUTLINED_FOCUS = "#1976d2";
const FOCUS_RING_SHADOW = (color) => `0 0 0 1px ${color}`;

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
  el.style.boxShadow = FOCUS_RING_SHADOW(OUTLINED_FOCUS);
};

export const portFxsModifyNativeFieldInteraction = {
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
  height: 28,
  width: 200,
  padding: "0 8px",
  fontSize: 13,
  border: `1px solid ${OUTLINED_BORDER}`,
  borderRadius: 4,
  outline: "none",
  backgroundColor: "#fff",
  color: "#0f172a",
  boxSizing: "border-box",
  boxShadow: "none",
  transition: "border-color 0.2s ease, box-shadow 0.2s ease",
};

const nativeFieldSelectStyle = {
  width: nativeFieldInputStyle.width,
  minHeight: 32,
  padding: "6px 28px 6px 8px",
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



export const addNewModalFooterBtnStyle = fxsAddNewModalFooterBtnStyle;
export const addNewModalFooterCancelBtnStyle = fxsAddNewModalFooterCancelBtnStyle;

export const pageFooterStyle = fxsFormInlineFooterStyle;

export const fxsModifyFormShellStyle = {
  width: PORT_FXS_MODIFY_FORM_WIDTH,
  maxWidth: "100%",
  margin: "0 auto",
};

const labelCellStyle = {
  fontSize: 13,
  fontWeight: 600,
  color: MODIFY_C.labelText,
  textAlign: "left",
  verticalAlign: "middle",
  width: FORM_LABEL_WIDTH,
  minWidth: FORM_LABEL_WIDTH,
  maxWidth: FORM_LABEL_WIDTH,
  padding: "6px 12px 6px 0",
  whiteSpace: "normal",
  lineHeight: 1.35,
};

const valueCellStyle = {
  fontSize: 13,
  textAlign: "left",
  verticalAlign: "middle",
  padding: "6px 0",
};

export const PortFxsModifyFormBody = ({
  formId,
  form,
  portOptions,
  inDialog,
  saving,
  message,
  setMessage,
  handleSave,
  handleReset,
  handleCancel,
  handleChange,
  handleCheckbox,
  shouldShowField,
}) => {
  const dialogFieldStyle = {
    ...nativeFieldInputStyle,
    height: 32,
    width: "180px",
  };
  const legacyFieldStyle = {
    height: "22px",
    width: "180px",
    fontSize: "12px",
  };
  const fieldStyle = inDialog
    ? dialogFieldStyle
    : { ...dialogFieldStyle, ...legacyFieldStyle };
  const wideFieldStyle = inDialog
    ? { ...dialogFieldStyle, width: "200px" }
    : { ...dialogFieldStyle, ...legacyFieldStyle, width: "200px" };
  const fieldClassName = inDialog
    ? undefined
    : "border border-gray-400 rounded-sm px-1 bg-white";

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
        <form id={formId} onSubmit={handleSave} style={fxsModifyFormShellStyle}>
          <div
            style={
              inDialog
                ? {
                    display: "flex",
                    flexDirection: "column",
                    gap: 14,
                    background: "#f8fafc",
                    border: `1px solid ${MODIFY_C.cardBorder}`,
                    borderRadius: 8,
                    padding: 20,
                    width: "100%",
                    boxSizing: "border-box",
                  }
                : undefined
            }
            className={
              inDialog
                ? undefined
                : "bg-[#dde0e4] border-2 rounded-b-lg border-gray-400 border-t-0 shadow-sm py-2 text-xs w-full"
            }
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
                  width: FORM_TABLE_WIDTH,
                  maxWidth: "100%",
                  tableLayout: "fixed",
                  textAlign: "left",
                }}
              >
                <colgroup>
                  <col style={{ width: FORM_LABEL_WIDTH }} />
                  <col />
                </colgroup>
                <tbody>
                  {PORT_FXS_MODIFY_FIELDS.map((field, idx) => {
                    if (!shouldShowField(field)) return null;

                    const prevField =
                      idx > 0
                        ? PORT_FXS_MODIFY_FIELDS.slice(0, idx)
                            .reverse()
                            .find((f) => shouldShowField(f))
                        : null;
                    const needsSpacer = getPortFxsModifySpacerBeforeField(prevField);

                    return (
                      <React.Fragment key={field.key}>
                        {needsSpacer && (
                          <tr>
                            <td colSpan={2} style={{ height: 10 }} />
                          </tr>
                        )}

                        <tr>
                          <td style={labelCellStyle}>
                            <PortFxsModifyFieldLabel
                              tooltipKey={field.key}
                              tooltips={PORT_FXS_MODIFY_FIELD_TOOLTIPS}
                            >
                              {field.label}
                            </PortFxsModifyFieldLabel>
                          </td>
                          <td style={valueCellStyle}>
                            {field.type === "checkbox" ? (
                              <label
                                style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: 4,
                                  fontSize: 13,
                                  color: MODIFY_C.valueText,
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
                                  sx={portFxsModifyCheckboxSx}
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
                                className={fieldClassName}
                                style={fieldStyle}
                                {...portFxsModifyNativeFieldInteraction}
                                maxLength={field.maxLength || 31}
                                onKeyDown={getPortFxsModifyFieldKeyDown(field)}
                              />
                            ) : field.type === "password" ? (
                              <input
                                type="password"
                                value={form[field.key]}
                                onChange={(e) =>
                                  handleChange(field.key, e.target.value)
                                }
                                className={fieldClassName}
                                style={fieldStyle}
                                {...portFxsModifyNativeFieldInteraction}
                                maxLength={field.maxLength || 63}
                              />
                            ) : field.type === "select" ? (
                              <select
                                value={form[field.key]}
                                onChange={(e) =>
                                  handleChange(field.key, e.target.value)
                                }
                                className={fieldClassName}
                                style={
                                  field.key.includes("Parameter")
                                    ? wideFieldStyle
                                    : fieldStyle
                                }
                                {...portFxsModifyNativeFieldInteraction}
                              >
                                {(field.key === "startingPort"
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

                        {field.key === "startingPort" && (
                          <tr>
                            <td style={labelCellStyle}>
                              <PortFxsModifyFieldLabel
                                tooltipKey="type"
                                tooltips={PORT_FXS_MODIFY_FIELD_TOOLTIPS}
                              >
                                Type
                              </PortFxsModifyFieldLabel>
                            </td>
                            <td style={valueCellStyle}>
                              <input
                                type="text"
                                value="FXS"
                                readOnly
                                className={fieldClassName}
                                style={fieldStyle}
                                {...portFxsModifyNativeFieldInteraction}
                              />
                            </td>
                          </tr>
                        )}
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
                type="submit"
                disabled={saving}
                style={addNewModalFooterBtnStyle}
              >
                {saving ? "Saving..." : "Modify"}
              </Btn>
              <Btn
                variant="cancel"
                type="button"
                onClick={handleReset}
                style={addNewModalFooterCancelBtnStyle}
              >
                Reset
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

export const PortFxsModifyStandaloneShell = ({ children }) => (
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
        <div className="w-full h-8 bg-[#3E5475] flex items-center justify-center font-semibold text-lg text-white shadow mb-0">
          <span>FXS-Modify</span>
        </div>
        {children}
      </div>
    </div>
  </div>
);
