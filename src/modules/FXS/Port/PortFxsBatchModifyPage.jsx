import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  PORT_FXS_BATCH_MODIFY_FIELDS,
  PORT_FXS_BATCH_MODIFY_NOTE,
  PORT_FXS_BATCH_MODIFY_TITLE,
  PORT_FXS_MODIFY_DIALOG_WIDTH,
  PORT_FXS_MODIFY_FORM_WIDTH,
  PORT_FXS_TOTAL_PORTS,
} from "../../../constants/PortFxsPageConstants";
import { saveFxsBatch } from "../../../api/apiService";
import { Alert, Checkbox } from "@mui/material";

// ── Local page UI (inlined from fxsSharedUi) ──

const C = {
  pageBg: "var(--bg-main)",
  cardBg: "var(--bg-surface)",
  cardBorder: "var(--border-strong)",
  labelText: "var(--text-primary)",
  valueText: "var(--text-primary)",
  mutedText: "var(--text-muted)",
  strongText: "var(--text-primary)",
  accent: "var(--accent-brand)",
  amber: "#dc2626",
};

const CARD_RADIUS = 10;

const Btn = ({
  children,
  onClick,
  disabled,
  variant = "default",
  style: extraStyle,
  type,
  form,
  component,
  title,
}) => {
  const styles = {
    default: {
      background: C.cardBg,
      color: C.valueText,
      border: "1px solid var(--border-subtle)",
    },
    primary: {
      background:
        "linear-gradient(to bottom, #5A6F8F 0%, #3E5475 60%, #2C3E57 100%)",
      color: "#fff",
      border: "1px solid #5A6F8F",
      fontWeight: 600,
      fontSize: 15,
      textTransform: "none",
      padding: "6px 28px",
    },
    cancel: {
      background: "#cbd5e1",
      color: "var(--text-secondary)",
      border: "1px solid #cbd5e1",
      boxShadow: "0 1px 2px rgba(15,23,42,0.08)",
    },
    danger: {
      background: "#fef2f2",
      color: C.amber,
      border: "0.5px solid #fecaca",
    },
    outline: {
      background: C.cardBg,
      color: C.labelText,
      border: `1px solid ${C.cardBorder}`,
    },
  };
  const s = styles[variant] || styles.default;
  const hoverBg =
    {
      primary: "linear-gradient(to bottom, #3E5475 0%, #5A6F8F 100%)",
      cancel: "#b6c2d3",
      danger: "#fca5a5",
      outline: "#e2e8f0",
      default: "#e2e8f0",
    }[variant] || "#e2e8f0";
  const baseBg = extraStyle?.background ?? s.background;
  const Component = component || "button";
  return (
    <Component
      type={type}
      form={form}
      title={title}
      onClick={onClick}
      disabled={disabled}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "6px 14px",
        borderRadius: 10,
        fontSize: 12,
        fontWeight: 600,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.6 : 1,
        transition: "all 0.15s ease",
        height: 30,
        gap: 6,
        whiteSpace: "nowrap",
        ...s,
        ...extraStyle,
      }}
      onMouseEnter={(e) => {
        if (!disabled) e.currentTarget.style.background = hoverBg;
      }}
      onMouseLeave={(e) => {
        if (!disabled) e.currentTarget.style.background = baseBg;
      }}
    >
      {children}
    </Component>
  );
};


const OUTLINED_BORDER = "var(--border-subtle)";
const OUTLINED_HOVER = "var(--border-strong)";
const OUTLINED_FOCUS = "var(--status-primary)";


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

const nativeFieldInteraction = {
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
  backgroundColor: "var(--bg-surface)",
  color: "var(--text-primary)",
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

const fxsNativeFieldInputStyle = nativeFieldInputStyle;
const fxsNativeFieldSelectStyle = nativeFieldSelectStyle;
const fxsNativeFieldInteraction = nativeFieldInteraction;


const checkboxSx = {
  padding: "4px",
  color: "#64748b",
  "&.Mui-checked": { color: "#0284c7" },
  "&.MuiCheckbox-indeterminate": { color: "#0284c7" },
  "& .MuiSvgIcon-root": { fontSize: 18 },
};

const FWD_TYPE_TO_API = {
  "No Reply": "no_reply",
  Unconditional: "unconditional",
  Busy: "busy",
};
import { ROUTE_PATHS } from "../../../constants/routeConstatns";
const dialogFieldStyle = {
  ...fxsNativeFieldInputStyle,
  height: 32,
  width: "180px",
};

const legacyFieldStyle = {
  height: "22px",
  width: "180px",
  fontSize: "12px",
};

const BATCH_LABEL_WIDTH = 200;
const BATCH_INPUT_COL_WIDTH = 200;
const BATCH_FORM_TABLE_WIDTH = BATCH_LABEL_WIDTH + BATCH_INPUT_COL_WIDTH;

const fxsModifyFormShellStyle = {
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

// Initialize batch modify form
const getInitialBatchForm = (initialPorts = null) => {
  const form = {};
  PORT_FXS_BATCH_MODIFY_FIELDS.forEach((field) => {
    if (field.type === "select") {
      form[field.key] = field.options[0] || field.default || "";
    } else if (field.type === "checkbox") {
      form[field.key] = field.default || false;
    } else {
      form[field.key] = field.default || "";
    }
  });

  // Override with initial port values if provided
  if (initialPorts) {
    if (initialPorts.startingPort) {
      form.startingPort = initialPorts.startingPort;
    }
    if (initialPorts.endingPort) {
      form.endingPort = initialPorts.endingPort;
    }
  }

  return form;
};

const PortFxsBatchModifyPage = ({
  initialPorts: propInitialPorts,
  maxPorts,
  onClose,
  onSaved,
  inDialog = false,
  formId = "fxs-batch-modify-form",
} = {}) => {
  // Dynamic port options — use API-reported maxPorts if available
  const portOptions = Array.from(
    { length: maxPorts || PORT_FXS_TOTAL_PORTS },
    (_, i) => String(i + 1),
  );
  const navigate = useNavigate();
  const location = useLocation();

  // Key handlers to mimic original page restrictions
  const handleRestrictedChars = (e) => {
    // Disallow a set of special characters for general text fields
    const forbidden = /[%&~\|\(\);\\"'=\\\u007C]/;
    if (forbidden.test(e.key)) {
      e.preventDefault();
    }
  };

  const handleDigitsOnly = (e) => {
    if (
      !/^[0-9]$/.test(e.key) &&
      e.key !== "Backspace" &&
      e.key !== "ArrowLeft" &&
      e.key !== "ArrowRight" &&
      e.key !== "Tab"
    ) {
      e.preventDefault();
    }
  };

  const handleDigitsHyphen = (e) => {
    if (
      !/^[0-9-]$/.test(e.key) &&
      e.key !== "Backspace" &&
      e.key !== "ArrowLeft" &&
      e.key !== "ArrowRight" &&
      e.key !== "Tab"
    ) {
      e.preventDefault();
    }
  };

  const handleAutoDialKey = (e) => {
    if (
      !/^[0-9abc#*]$/.test(e.key) &&
      e.key !== "Backspace" &&
      e.key !== "ArrowLeft" &&
      e.key !== "ArrowRight" &&
      e.key !== "Tab"
    ) {
      e.preventDefault();
    }
  };

  const [form, setForm] = useState(() => {
    // Prefer propInitialPorts when provided, else use navigation state
    const initialPorts = propInitialPorts || location.state || null;
    return getInitialBatchForm(initialPorts);
  });
  const [message, setMessage] = useState({ type: "", text: "" });

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 5000);
  };

  // Handle form changes
  const handleChange = (key, value) => {
    const fieldDef = PORT_FXS_BATCH_MODIFY_FIELDS.find((f) => f.key === key);
    if (fieldDef && fieldDef.validation === "integer") {
      if (value === "" || /^-?\d+$/.test(value)) {
        setForm((prev) => ({ ...prev, [key]: value }));
      }
    } else {
      setForm((prev) => ({ ...prev, [key]: value }));
    }
  };

  const handleCheckbox = (key) => {
    setForm((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      // make DND and Call Forward mutually exclusive
      if (key === "dnd" && !prev.dnd) {
        // turning DND on -> turn Call Forward off
        next.callForward = false;
      }
      if (key === "callForward" && !prev.callForward) {
        // turning Call Forward on -> turn DND off
        next.dnd = false;
      }
      return next;
    });
  };

  // Check if field should be shown based on conditional logic
  const shouldShowField = (field) => {
    // No condition - always show
    if (!field.conditional) return true;

    // Check primary condition
    const conditionalValue = form[field.conditional];
    if (!conditionalValue) return false;

    // Handle nested conditions (conditionalParent)
    if (field.conditionalParent) {
      const parentValue = form[field.conditionalParent];

      if (field.conditionalParentValue !== undefined) {
        if (Array.isArray(field.conditionalParentValue)) {
          return field.conditionalParentValue.includes(parentValue);
        } else {
          return parentValue === field.conditionalParentValue;
        }
      }

      // If conditionalParent exists but no specific value, just check if parent is truthy
      return !!parentValue;
    }

    // Handle step size fields that depend on rule fields
    if (
      field.conditionalParentValue !== undefined &&
      field.key.includes("StepSize")
    ) {
      const ruleKey = field.key
        .replace("StepSize", "Rule")
        .replace("Length", "Rule");
      const ruleValue = form[ruleKey];

      if (Array.isArray(field.conditionalParentValue)) {
        return field.conditionalParentValue.includes(ruleValue);
      }
      // For "All Same" rule, don't show step size
      return ruleValue !== field.conditionalParentValue;
    }

    return true;
  };

  // Handle form submission
  const handleSave = (e) => {
    if (e && e.preventDefault) e.preventDefault();

    // Validation
    if (parseInt(form.startingPort) > parseInt(form.endingPort)) {
      showMessage(
        "error",
        "The starting port number cannot be larger than the ending port one!",
      );
      return;
    }

    if (form.batchAccount) {
      // Allow empty starting SIP account (user may intentionally clear it).
      // Only validate SIP step size when a starting SIP account is provided.
      if (form.startingSipAccount && !form.sipAccountBatchStepSize) {
        showMessage(
          "error",
          "Please enter the batch step size of SIP account!",
        );
        return;
      }
      if (
        form.displayNameBatchRule !== "All Same" &&
        !form.displayNameBatchStepSize
      ) {
        showMessage(
          "error",
          "Please enter the batch step size of display name!",
        );
        return;
      }
      if (form.registerPort === "Yes" && form.batchRegister) {
        if (!form.startingAuthPassword) {
          showMessage("error", "Please enter your password!");
          return;
        }
        if (
          form.authPasswordBatchRule !== "All Same" &&
          !form.authPasswordBatchStepSize
        ) {
          showMessage(
            "error",
            "Please enter the batch step size of authentication password!",
          );
          return;
        }
      }
    }

    if (form.batchConfigure) {
      if (form.autoDialNumberEnable && !form.autoDialNumber) {
        showMessage("error", "Please enter 'Auto Dial Number'!");
        return;
      }
      if (form.autoDialNumberEnable && !form.waitTimeBeforeAutoDial) {
        showMessage("error", "Please enter 'Wait Time before Auto Dial'!");
        return;
      }
      if (!form.inputGain || form.inputGain < -6 || form.inputGain > 6) {
        showMessage("error", "The value range of Input Gain is -6~6!");
        return;
      }
      if (!form.outputGain || form.outputGain < -6 || form.outputGain > 6) {
        showMessage("error", "The value range of Output Gain is -6~6!");
        return;
      }
      if (form.callForward && !form.forwardNumber) {
        showMessage("error", "Please enter an forward number!");
        return;
      }
      if (form.forwardType === "No Reply" && !form.noAnswerDelayTime) {
        showMessage("error", "Please enter a time threshold for 'No Reply'!");
        return;
      }
    }

    // Build payload matching save-batch API spec exactly
    const payload = {
      startingPort: parseInt(form.startingPort, 10),
      endingPort: parseInt(form.endingPort, 10),
      batchRegisterEnabled: !!form.batchRegister,
      registerPort: form.registerPort === "Yes" ? "yes" : "no",
      batchAccountEnabled: !!form.batchAccount,
      startingSipAccount: form.startingSipAccount,
      startingDisplayName: form.startingDisplayName,
      startingAuthenticationPassword: form.startingAuthPassword,
      displayNamePreferred: !!form.displayNamePreferred,
      sipAccountBatchRule: form.sipAccountBatchRule
        ? String(form.sipAccountBatchRule).toLowerCase()
        : "increase",
      sipAccountBatchStepSize: Number(form.sipAccountBatchStepSize) || 1,
      displayNameBatchRule: form.displayNameBatchRule
        ? String(form.displayNameBatchRule).toLowerCase()
        : "increase",
      displayNameBatchStepSize: Number(form.displayNameBatchStepSize) || 1,
      authPasswordBatchRule: form.authPasswordBatchRule
        ? String(form.authPasswordBatchRule).toLowerCase()
        : "increase",
      authPasswordBatchStepSize: Number(form.authPasswordBatchStepSize) || 1,
      batchConfigureEnabled: !!form.batchConfigure,
      autoDialEnabled: !!form.autoDialNumberEnable,
      autoDialNumber: form.autoDialNumber || "",
      autoDialWaitSec: Number(form.waitTimeBeforeAutoDial) || 0,
      inputGain: Number(form.inputGain) || 0,
      outputGain: Number(form.outputGain) || 0,
      cidEnabled: !!form.cid,
      echoCanceller: !!form.echoCanceller,
      callWaiting: !!form.callWaiting,
      dnd: !!form.dnd,
      callForwardEnabled: !!form.callForward,
      forwardType: FWD_TYPE_TO_API[form.forwardType] ?? "unconditional",
      forwardNumber: form.forwardNumber || "",
      noReplyDelaySec: Number(form.noAnswerDelayTime) || 0,
    };

    // Call API
    (async () => {
      try {
        const res = await saveFxsBatch(payload);
        if (!res?.success) throw new Error(res?.message || "Batch save failed");
        showMessage(
          "success",
          res?.message || "Batch modify settings saved successfully!",
        );
        if (typeof onSaved === "function") {
          await onSaved();
        } else if (typeof onClose === "function") {
          onClose();
        } else {
          navigate(ROUTE_PATHS.PORT_FXS);
        }
      } catch (err) {
        console.error("Batch modify API failed:", err);
        showMessage(
          "error",
          err?.message || "Failed to save batch modify settings",
        );
      }
    })();
  };

  const handleCancel = () => {
    if (typeof onClose === "function") {
      onClose();
    } else {
      navigate(ROUTE_PATHS.PORT_FXS);
    }
  };

  const fieldStyle = inDialog
    ? dialogFieldStyle
    : { ...dialogFieldStyle, ...legacyFieldStyle };
  const wideFieldStyle = inDialog
    ? { ...dialogFieldStyle, width: "200px" }
    : { ...dialogFieldStyle, ...legacyFieldStyle, width: "200px" };
  const fieldClassName = inDialog
    ? undefined
    : "border border-[var(--border-subtle)] rounded-sm px-1 bg-[var(--bg-surface)]";

  const formBody = (
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
                    background: "var(--row-alt)",
                    border: `1px solid ${C.cardBorder}`,
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
                : "bg-[#dde0e4] border-2 rounded-b-lg border-[var(--border-subtle)] border-t-0 shadow-sm py-2 text-xs w-full"
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

                      // Check if we need a spacer row before this field
                      const prevField =
                        idx > 0 ? PORT_FXS_BATCH_MODIFY_FIELDS[idx - 1] : null;
                      const needsSpacer =
                        prevField &&
                        shouldShowField(prevField) &&
                        (prevField.key === "endingPort" ||
                          prevField.key === "registerPort" ||
                          prevField.key === "displayNamePreferred" ||
                          prevField.key === "waitTimeBeforeAutoDial" ||
                          prevField.key === "echoCanceller" ||
                          prevField.key === "impedanceParameter");

                      return (
                        <React.Fragment key={field.key}>
                          {/* Spacer row between sections */}
                          {needsSpacer && (
                            <tr>
                              <td colSpan={2} style={{ height: 10 }} />
                            </tr>
                          )}

                          <tr>
                            <td style={batchLabelCellStyle}>{field.label}</td>
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
                                        : field.key === "callForward" &&
                                            form.dnd
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
                                    sx={checkboxSx}
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
                                  {...fxsNativeFieldInteraction}
                                  maxLength={field.maxLength || 31}
                                  onKeyDown={
                                    field.validation === "integer"
                                      ? handleDigitsOnly
                                      : field.key === "inputGain" ||
                                          field.key === "outputGain"
                                        ? handleDigitsHyphen
                                        : field.key === "autoDialNumber"
                                          ? handleAutoDialKey
                                          : handleRestrictedChars
                                  }
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
                                  {...fxsNativeFieldInteraction}
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
                                  {...fxsNativeFieldInteraction}
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

                    {/* Spacer at the end */}
                    <tr>
                      <td colSpan={2} style={{ height: 8 }} />
                    </tr>
                  </tbody>
                </table>
              </div>
          </div>

          {!inDialog && (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: 12,
                padding: "24px 0",
              }}
            >
              <Btn
                variant="primary"
                type="button"
                onClick={handleSave}
                style={{ minWidth: 100, height: 33, fontSize: 13 }}
              >
                Save
              </Btn>
              <Btn
                variant="cancel"
                type="button"
                onClick={handleCancel}
                style={{ minWidth: 100, height: 33 }}
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

  if (inDialog) return formBody;

  return (
    <div
      className="bg-gray-50 min-h-[calc(100vh-128px)] py-1"
      style={{ backgroundColor: "var(--bg-muted)" }}
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
          {formBody}
        </div>
      </div>
    </div>
  );
};

export default PortFxsBatchModifyPage;
