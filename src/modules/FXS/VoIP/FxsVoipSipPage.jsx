import React, { useState, useEffect, useRef } from "react";
import { Alert, CircularProgress } from "@mui/material";
import {
  SIP_SETTINGS_FIELDS,
  SIP_SETTINGS_NOTE,
} from "../../../sections/voip/constants/SipSipConstants";
import {
  listFxsSipSettings,
  saveFxsSipSettings,
  resetFxsSipSettings,
  statusFxsSipSettings,
} from "../../../api/apiService";
import {
  C,
  Btn,
  FormEnableCheckbox,
  AdvancedPageShell,
  VoipBreadcrumb,
  advancedTableContainerStyle,
  advancedBlueBarStyle,
  advancedFormBtnStyle,
  advancedFormInlineFooterStyle,
  nativeFieldInputStyle,
  getFxsNativeFieldInteraction,
} from "../../../sections/advanced/advancedSharedUi";

const LOCAL_PBX_REGISTER_STATUS_TEXT =
  "Local PBX (registration not required)";

/** Same width for all fill boxes (matches Register Status) */
const CONTROL_FIELD_WIDTH = 238;

const getRegisterStatusDisplay = (mode, status, localMsg) => {
  if (mode === "local") {
    return LOCAL_PBX_REGISTER_STATUS_TEXT;
  }
  return status || "";
};

const getInitialState = () => {
  const state = {};
  SIP_SETTINGS_FIELDS.forEach((f) => {
    if (f.type === "select") {
      state[f.key] = f.options[0] || f.default || "";
    } else if (f.type === "checkbox") {
      state[f.key] = f.default || false;
    } else if (f.type === "readonly") {
      state[f.key] = f.default || "";
    } else {
      state[f.key] = f.default || "";
    }
  });
  return state;
};

const FxsVoipSipPage = () => {
  const [form, setForm] = useState(getInitialState());
  const [message, setMessage] = useState({ type: "", text: "" });
  const [loadingPage, setLoadingPage] = useState(true);
  const [saving, setSaving] = useState(false);
  const [registrationMode, setRegistrationMode] = useState("local");
  const [localModeMsg, setLocalModeMsg] = useState("");
  const statusPollRef = useRef(null);

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 6000);
  };

  const applyApiData = (data) => {
    if (!data) return;
    setForm((prev) => {
      const next = { ...prev };
      SIP_SETTINGS_FIELDS.forEach((f) => {
        if (data[f.key] !== undefined) next[f.key] = data[f.key];
      });
      if (data.registerStatus !== undefined)
        next.registerStatus = data.registerStatus;
      return next;
    });
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const settingsRes = await listFxsSipSettings().catch((e) => {
          console.warn("Failed to load FXS SIP settings:", e);
          return null;
        });
        if (!mounted) return;
        if (settingsRes?.success) {
          const mode = settingsRes.registrationMode || "local";
          setRegistrationMode(mode);
          const localMsg =
            mode === "local"
              ? settingsRes.message || LOCAL_PBX_REGISTER_STATUS_TEXT
              : "";
          setLocalModeMsg(localMsg);
          applyApiData(settingsRes.data || {});
          if (mode === "local") {
            setForm((prev) => ({
              ...prev,
              registerStatus: LOCAL_PBX_REGISTER_STATUS_TEXT,
            }));
          }
        }
      } catch (e) {
        console.warn("Error during initial load:", e);
      } finally {
        if (mounted) setLoadingPage(false);
      }
    })();
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (statusPollRef.current) clearInterval(statusPollRef.current);
    if (registrationMode === "remote") {
      statusPollRef.current = setInterval(async () => {
        try {
          const res = await statusFxsSipSettings();
          if (res?.success && res.registerStatus) {
            setForm((prev) => ({
              ...prev,
              registerStatus: res.registerStatus,
            }));
          }
        } catch (_) {}
      }, 30000);
    }
    return () => {
      if (statusPollRef.current) clearInterval(statusPollRef.current);
    };
  }, [registrationMode]);

  const handleChange = (key, value) => {
    const fieldDef = SIP_SETTINGS_FIELDS.find((f) => f.key === key);
    if (fieldDef && fieldDef.validation === "integer") {
      if (value === "" || /^\d+$/.test(value)) {
        setForm((prev) => ({ ...prev, [key]: value }));
      }
    } else {
      setForm((prev) => ({ ...prev, [key]: value }));
    }
  };

  const handleCheckbox = (key) => {
    setForm((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await saveFxsSipSettings(form);
      if (!res?.success) {
        showMessage("error", res?.message || "Failed to save settings.");
        return;
      }
      const mode = res.registrationMode || "local";
      setRegistrationMode(mode);
      const localMsg =
        mode === "local"
          ? res.message || LOCAL_PBX_REGISTER_STATUS_TEXT
          : "";
      setLocalModeMsg(localMsg);
      if (res.data) applyApiData(res.data);
      if (mode === "local") {
        setForm((prev) => ({
          ...prev,
          registerStatus: LOCAL_PBX_REGISTER_STATUS_TEXT,
        }));
      } else if (res.registerStatus) {
        setForm((prev) => ({ ...prev, registerStatus: res.registerStatus }));
      }
      showMessage("success", res.message || "Settings saved successfully!");
    } catch (err) {
      showMessage("error", err?.message || "Failed to save settings.");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    try {
      const res = await resetFxsSipSettings();
      if (res?.success && res.data) {
        applyApiData(res.data);
        showMessage("info", res.message || "Settings reset to defaults.");
      } else {
        setForm(getInitialState());
      }
    } catch (_) {
      setForm(getInitialState());
    }
  };

  const shouldShowField = (field) => {
    if (!field.conditional) return true;
    const conditionalValue = form[field.conditional];
    if (field.conditionalValues)
      return field.conditionalValues.includes(conditionalValue);
    if (field.conditionalValue !== undefined)
      return conditionalValue === field.conditionalValue;
    return !!conditionalValue;
  };

  const fieldInputStyle = {
    ...nativeFieldInputStyle,
    width: CONTROL_FIELD_WIDTH,
    maxWidth: "100%",
  };

  const sipFieldInteraction = getFxsNativeFieldInteraction(saving);

  const fieldReadonlyStyle = {
    ...fieldInputStyle,
    backgroundColor: "#e5e7eb",
    lineHeight: 1.35,
    minHeight: 28,
    height: "auto",
    padding: "4px 8px",
    whiteSpace: "normal",
    wordBreak: "break-word",
  };

  const labelColStyle = {
    fontSize: 13,
    fontWeight: 600,
    color: C.labelText,
    flex: "0 0 48%",
    maxWidth: "48%",
    paddingRight: 24,
    textAlign: "left",
    lineHeight: 1.35,
  };

  const valueColStyle = {
    flex: "1 1 52%",
    minWidth: 0,
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
  };

  const controlSlotStyle = {
    width: CONTROL_FIELD_WIDTH,
    maxWidth: "100%",
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-start",
  };

  return (
    <AdvancedPageShell>
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
            boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
            fontWeight: 500,
          }}
        >
          {message.text}
        </Alert>
      )}

      <VoipBreadcrumb current="SIP Settings" />

      {registrationMode === "local" && localModeMsg && (
        <div
          style={{
            background: "#fffbeb",
            border: "1px solid #fcd34d",
            borderRadius: 6,
            padding: "10px 16px",
            marginBottom: 12,
            fontSize: 12,
            color: C.amber,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <span style={{ fontWeight: 700 }}>ℹ Local PBX mode:</span>
          <span>{localModeMsg}</span>
        </div>
      )}

      <div style={{ ...advancedTableContainerStyle, marginBottom: 0 }}>
        <div style={advancedBlueBarStyle}>
          <span>SIP Settings</span>
        </div>

        {loadingPage ? (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              padding: 60,
            }}
          >
            <CircularProgress size={32} sx={{ color: C.accent }} />
          </div>
        ) : (
          <div style={{ padding: "24px 32px 0" }}>
            <div style={{ marginBottom: 12 }}>
            <div
              className="flex flex-col gap-3"
              style={{
                width: "100%",
                maxWidth: 640,
                margin: "0 auto",
              }}
            >
              {SIP_SETTINGS_FIELDS.map((field) => {
                if (!shouldShowField(field)) return null;

                return (
                  <div
                    key={field.key}
                    className="flex flex-row items-start w-full"
                  >
                    <label style={labelColStyle}>{field.label}</label>
                    <div style={valueColStyle}>
                      {field.type === "readonly" && (
                        <div style={controlSlotStyle}>
                          <div
                            style={{
                              ...fieldReadonlyStyle,
                              width: "100%",
                              ...(field.key === "registerStatus"
                                ? {
                                    whiteSpace: "nowrap",
                                    lineHeight: "28px",
                                    height: 28,
                                    padding: "0 8px",
                                    textAlign: "center",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                  }
                                : {}),
                            }}
                          >
                            {field.key === "registerStatus"
                              ? getRegisterStatusDisplay(
                                  registrationMode,
                                  form.registerStatus,
                                  localModeMsg,
                                )
                              : form[field.key]}
                          </div>
                        </div>
                      )}

                      {field.type === "text" && (
                        <div style={controlSlotStyle}>
                          <input
                            type="text"
                            value={form[field.key] || ""}
                            onChange={(e) =>
                              handleChange(field.key, e.target.value)
                            }
                            style={fieldInputStyle}
                            disabled={saving}
                            {...sipFieldInteraction}
                          />
                        </div>
                      )}

                      {field.type === "select" && (
                        <div style={controlSlotStyle}>
                          <select
                            value={form[field.key] || ""}
                            onChange={(e) =>
                              handleChange(field.key, e.target.value)
                            }
                            style={fieldInputStyle}
                            disabled={saving}
                            {...sipFieldInteraction}
                          >
                            {field.options.map((opt) => (
                              <option key={opt} value={opt}>
                                {opt}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}

                      {field.type === "checkbox" && (
                        <div style={controlSlotStyle}>
                          <FormEnableCheckbox
                            checked={!!form[field.key]}
                            onChange={() => handleCheckbox(field.key)}
                            name={field.key}
                          />
                        </div>
                      )}

                      {field.helper && (
                        <div
                          style={{
                            width: CONTROL_FIELD_WIDTH,
                            maxWidth: "100%",
                            color: C.amber,
                            fontSize: 11,
                            marginTop: 4,
                            wordWrap: "break-word",
                            textAlign: "left",
                          }}
                        >
                          {field.helper}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            {SIP_SETTINGS_NOTE ? (
              <div
                style={{
                  fontSize: 11,
                  color: C.amber,
                  marginTop: 16,
                  maxWidth: 640,
                  marginLeft: "auto",
                  marginRight: "auto",
                  textAlign: "left",
                  lineHeight: 1.45,
                }}
              >
                {SIP_SETTINGS_NOTE}
              </div>
            ) : null}
            </div>
          </div>
        )}

        {!loadingPage && (
        <div
          style={{
            ...advancedFormInlineFooterStyle,
            width: "100%",
            marginLeft: 0,
            marginRight: 0,
          }}
        >
          <Btn
            type="button"
            onClick={handleSave}
            variant="primary"
            disabled={saving || loadingPage}
            style={advancedFormBtnStyle}
          >
            {saving ? (
              <>
                <CircularProgress size={14} sx={{ color: "inherit" }} />
                Saving…
              </>
            ) : (
              "Save"
            )}
          </Btn>
          <Btn
            type="button"
            onClick={handleReset}
            variant="cancel"
            disabled={saving || loadingPage}
            style={advancedFormBtnStyle}
          >
            Reset
          </Btn>
        </div>
        )}
      </div>
    </AdvancedPageShell>
  );
};

export default FxsVoipSipPage;
