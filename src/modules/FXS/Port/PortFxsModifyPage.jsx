import React, {
  useEffect,
  useState,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from "react";
import { Alert, Checkbox } from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import { ROUTE_PATHS } from "../../../constants/routeConstatns";
import {
  PORT_FXS_BATCH_MODIFY_FIELDS,
  PORT_FXS_BATCH_MODIFY_NOTE,
  PORT_FXS_MODIFY_DIALOG_WIDTH,
  PORT_FXS_MODIFY_FORM_WIDTH,
  PORT_FXS_MODIFY_FIELDS,
  PORT_FXS_TOTAL_PORTS,
} from "../../../sections/port/constants/PortFxsPageConstants";
import { fetchFxsPorts, saveFxsPort } from "../../../api/apiService";
import {
  C,
  Btn,
  checkboxSx,
  fxsNativeFieldInputStyle,
  fxsNativeFieldInteraction,
} from "../../../sections/fxs/fxsSharedUi";

const FWD_TYPE_TO_UI = {
  no_reply: "No Reply",
  unconditional: "Unconditional",
  busy: "Busy",
};
const FWD_TYPE_TO_API = {
  "No Reply": "no_reply",
  Unconditional: "unconditional",
  Busy: "busy",
};

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

const FORM_LABEL_WIDTH = 200;
const FORM_INPUT_COL_WIDTH = 200;
const FORM_TABLE_WIDTH = FORM_LABEL_WIDTH + FORM_INPUT_COL_WIDTH;

const fxsModifyFormShellStyle = {
  width: PORT_FXS_MODIFY_FORM_WIDTH,
  maxWidth: "100%",
  margin: "0 auto",
};

const labelCellStyle = {
  fontSize: 13,
  fontWeight: 600,
  color: C.labelText,
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

const getInitialModifyForm = (port = "1") => {
  const form = {};
  PORT_FXS_BATCH_MODIFY_FIELDS.forEach((field) => {
    if (field.type === "select") {
      form[field.key] = field.default ?? field.options?.[0] ?? "";
    } else if (field.type === "checkbox") {
      form[field.key] = field.default ?? false;
    } else {
      form[field.key] = field.default ?? "";
    }
  });
  form.batchRegister = true;
  form.batchAccount = true;
  form.batchConfigure = true;
  form.startingPort = port;
  form.endingPort = port;
  return form;
};

const mapPortToForm = (p, base) => ({
  ...base,
  startingPort: String(p.port ?? p.id),
  endingPort: String(p.port ?? p.id),
  registerPort: p.enabled ? "Yes" : "No",
  startingSipAccount: p.sipAccount ?? "",
  startingDisplayName: p.displayName ?? "",
  startingAuthPassword: p.authPassword ?? "",
  displayNamePreferred: !!p.displayNamePreferred,
  autoDialNumberEnable: !!(p.autoDialEnabled ?? p.autoDialNumber),
  autoDialNumber: p.autoDialNumber ?? "",
  waitTimeBeforeAutoDial: String(p.autoDialWaitSec ?? 0),
  inputGain: String(p.inputGain ?? 0),
  outputGain: String(p.outputGain ?? 0),
  echoCanceller: !!p.echoCanceller,
  cid: !!p.cidEnabled,
  callWaiting: !!p.callWaiting,
  dnd: !!p.dnd,
  callForward: !!p.callForwardEnabled,
  forwardType: FWD_TYPE_TO_UI[p.forwardType] ?? "Unconditional",
  forwardNumber: p.forwardNumber ?? "",
  noAnswerDelayTime: String(p.noReplyDelaySec ?? 0),
  advancedConfiguration: !!p.advancedConfiguration,
  ringingParameter: p.ringingParameter ?? "RING_ABS120V_DEF",
  feedVoltageParameter: p.feedVoltageParameter ?? "DCFEED_48V_21MA_DEF",
  impedanceParameter: p.impedanceParameter ?? "ZSYN_200_680_100_30_0",
  batchRegister: true,
  batchAccount: true,
  batchConfigure: true,
});

const PortFxsModifyPage = forwardRef(
  (
    {
      port: propPort,
      initialPortData,
      onSaved,
      onClose,
      inDialog = false,
      formId = "fxs-modify-form",
      maxPorts: propMaxPorts,
      onSavingChange,
    },
    ref,
  ) => {
    const portCount = propMaxPorts || PORT_FXS_TOTAL_PORTS;
    const navigate = useNavigate();
    const location = useLocation();
    const initialPort =
      propPort ||
      (location.state && location.state.port
        ? String(location.state.port)
        : "1");

    const portOptions = Array.from({ length: portCount }, (_, i) =>
      String(i + 1),
    );

    const buildFormState = useCallback(
      (portData) => {
        const base = getInitialModifyForm(initialPort);
        return portData ? mapPortToForm(portData, base) : base;
      },
      [initialPort],
    );

    const [form, setForm] = useState(() => buildFormState(initialPortData));
    const [loading, setLoading] = useState(() => !inDialog);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: "", text: "" });

    const showMessage = (type, text) => {
      setMessage({ type, text });
      setTimeout(() => setMessage({ type: "", text: "" }), 5000);
    };

    const loadPortData = useCallback(async () => {
      if (!inDialog) setLoading(true);
      try {
        const res = await fetchFxsPorts();
        const list = Array.isArray(res?.data) ? res.data : [];
        const p = list.find(
          (item) => String(item.port ?? item.id) === String(initialPort),
        );
        if (p) {
          setForm(
            mapPortToForm(p, getInitialModifyForm(String(p.port ?? p.id))),
          );
        }
      } catch (err) {
        console.warn("Failed to load port data for modify:", err);
      } finally {
        if (!inDialog) setLoading(false);
      }
    }, [initialPort, inDialog]);

    useEffect(() => {
      setForm(buildFormState(initialPortData));
    }, [initialPortData, buildFormState]);

    useEffect(() => {
      if (inDialog && initialPortData) return;
      loadPortData();
    }, [loadPortData, inDialog, initialPortData]);

    useImperativeHandle(ref, () => ({ reset: loadPortData }), [loadPortData]);

    useEffect(() => {
      if (inDialog && onSavingChange) onSavingChange(saving);
    }, [saving, inDialog, onSavingChange]);

    const handleRestrictedChars = (e) => {
      const forbidden = /[%&~\|\(\);\\"'=\\\u007C]/;
      if (forbidden.test(e.key)) e.preventDefault();
    };

    const handleDigitsOnly = (e) => {
      if (
        !/^[0-9]$/.test(e.key) &&
        !["Backspace", "ArrowLeft", "ArrowRight", "Tab"].includes(e.key)
      ) {
        e.preventDefault();
      }
    };

    const handleDigitsHyphen = (e) => {
      if (
        !/^[0-9-]$/.test(e.key) &&
        !["Backspace", "ArrowLeft", "ArrowRight", "Tab"].includes(e.key)
      ) {
        e.preventDefault();
      }
    };

    const handleAutoDialKey = (e) => {
      if (
        !/^[0-9abc#*]$/.test(e.key) &&
        !["Backspace", "ArrowLeft", "ArrowRight", "Tab"].includes(e.key)
      ) {
        e.preventDefault();
      }
    };

    const handleChange = (key, value) => {
      const fieldDef = PORT_FXS_MODIFY_FIELDS.find((f) => f.key === key);
      if (fieldDef?.validation === "integer") {
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
        if (key === "dnd" && !prev.dnd) next.callForward = false;
        if (key === "callForward" && !prev.callForward) next.dnd = false;
        return next;
      });
    };

    const shouldShowField = (field) => {
      const view = {
        ...form,
        batchRegister: true,
        batchAccount: true,
        batchConfigure: true,
      };
      if (!field.conditional) return true;
      const conditionalValue = view[field.conditional];
      if (!conditionalValue) return false;
      if (field.conditionalParent) {
        const parentValue = view[field.conditionalParent];
        if (field.conditionalParentValue !== undefined) {
          if (Array.isArray(field.conditionalParentValue)) {
            return field.conditionalParentValue.includes(parentValue);
          }
          return parentValue === field.conditionalParentValue;
        }
        return !!parentValue;
      }
      return true;
    };

    const handleSave = async (e) => {
      e.preventDefault();
      if (form.autoDialNumberEnable && !form.autoDialNumber) {
        showMessage("error", "Please enter 'Auto Dial Number'!");
        return;
      }
      if (form.autoDialNumberEnable && !form.waitTimeBeforeAutoDial) {
        showMessage("error", "Please enter 'Wait Time before Auto Dial'!");
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

      setSaving(true);
      try {
        const payload = {
          port: Number(form.startingPort),
          enabled: form.registerPort === "Yes",
          registerPort: form.registerPort === "Yes" ? "yes" : "no",
          sipAccount: form.startingSipAccount,
          displayName: form.startingDisplayName,
          authPassword: form.startingAuthPassword,
          displayNamePreferred: !!form.displayNamePreferred,
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

        const res = await saveFxsPort(payload);
        if (!res?.success) throw new Error(res?.message || "Save failed");
        if (typeof onSaved === "function") await onSaved();
        showMessage("success", res?.message || "Port saved successfully!");
        if (typeof onClose === "function") onClose();
        else navigate(ROUTE_PATHS.PORT_FXS);
      } catch (err) {
        console.error("Failed to update port:", err);
        showMessage("error", err?.message || "Failed to update port");
      } finally {
        setSaving(false);
      }
    };

    const handleReset = () => loadPortData();

    const handleCancel = () => {
      if (typeof onClose === "function") onClose();
      else navigate(ROUTE_PATHS.PORT_FXS);
    };

    if (loading && !inDialog)
      return <div style={{ padding: 20, textAlign: "center" }}>Loading...</div>;

    const fieldStyle = inDialog
      ? dialogFieldStyle
      : { ...dialogFieldStyle, ...legacyFieldStyle };
    const wideFieldStyle = inDialog
      ? { ...dialogFieldStyle, width: "200px" }
      : { ...dialogFieldStyle, ...legacyFieldStyle, width: "200px" };
    const fieldClassName = inDialog
      ? undefined
      : "border border-gray-400 rounded-sm px-1 bg-white";

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
          <form
            id={formId}
            onSubmit={handleSave}
            style={fxsModifyFormShellStyle}
          >
            <div
              style={
                inDialog
                  ? {
                      display: "flex",
                      flexDirection: "column",
                      gap: 14,
                      background: "#f8fafc",
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
                      const needsSpacer =
                        prevField &&
                        (prevField.key === "startingPort" ||
                          prevField.key === "registerPort" ||
                          prevField.key === "displayNamePreferred" ||
                          prevField.key === "waitTimeBeforeAutoDial" ||
                          prevField.key === "echoCanceller" ||
                          prevField.key === "impedanceParameter");

                      return (
                        <React.Fragment key={field.key}>
                          {needsSpacer && (
                            <tr>
                              <td colSpan={2} style={{ height: 10 }} />
                            </tr>
                          )}

                          <tr>
                            <td style={labelCellStyle}>{field.label}</td>
                            <td style={valueCellStyle}>
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
                              <td style={labelCellStyle}>Type</td>
                              <td style={valueCellStyle}>
                                <input
                                  type="text"
                                  value="FXS"
                                  readOnly
                                  className={fieldClassName}
                                  style={fieldStyle}
                                  {...fxsNativeFieldInteraction}
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
                  type="submit"
                  disabled={saving}
                  style={{ minWidth: 100, height: 33, fontSize: 13 }}
                >
                  {saving ? "Saving..." : "Modify"}
                </Btn>
                <Btn
                  variant="cancel"
                  type="button"
                  onClick={handleReset}
                  style={{ minWidth: 100, height: 33 }}
                >
                  Reset
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
            {formBody}
          </div>
        </div>
      </div>
    );
  },
);

PortFxsModifyPage.displayName = "PortFxsModifyPage";

export default PortFxsModifyPage;
