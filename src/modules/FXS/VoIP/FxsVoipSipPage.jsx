import React, { useState, useEffect, useRef } from "react";
import { Alert, Checkbox, CircularProgress, Tooltip } from "@mui/material";
import {
  SIP_SETTINGS_FIELDS,
  SIP_SETTINGS_NOTE,
  FXS_SIP_FIELD_TOOLTIPS,
} from "../../../constants/FxsVoipSipConstants";
import {
  listFxsSipSettings,
  saveFxsSipSettings,
  resetFxsSipSettings,
  statusFxsSipSettings,
} from "../../../api/apiService";

// ── Page-local field label tooltip UI (not shared) ──
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

const formatFieldTooltipTitle = (text) => {
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

const FxsFieldLabel = ({ tooltipKey, tooltips, children, style = {} }) => {
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

// ── Local page UI (inlined from fxsSharedUi) ──
const C = {
  cardBg: "var(--bg-surface)",
  cardBorder: "var(--border-strong)",
  labelText: "var(--text-primary)",
  valueText: "var(--text-primary)",
  accent: "var(--accent-brand)",
  amber: "#dc2626",
};

const FXS_VOIP_SIP_PAGE_WRAP =
  "bg-[var(--bg-main)] min-h-[calc(100vh-80px)] p-[16px] box-border flex flex-col items-center";
const FXS_VOIP_SIP_PAGE_INNER = "w-full max-w-[1000px] mx-auto";
const FXS_VOIP_SIP_TABLE_CONTAINER =
  "w-full max-w-full mx-auto overflow-hidden rounded-[10px] border-[1.5px] border-[var(--border-strong)] bg-[var(--bg-surface)] shadow-[0_4px_20px_rgba(15,23,42,0.06)]";
const FXS_VOIP_SIP_BLUE_BAR =
  "flex w-full min-h-[44px] flex-wrap items-center justify-start gap-[12px] rounded-t-[10px] border-b border-[var(--border-strong)] bg-[var(--bg-surface)] px-[14px] py-[7px] text-[13px] font-bold text-[var(--text-label)]";
const FXS_VOIP_SIP_FORM_FOOTER =
  "flex w-full flex-wrap items-center justify-center gap-[12px] border-t border-[var(--border-strong)] box-border px-[20px] py-[10px]";

const BTN_FORM_PRIMARY =
  "inline-flex items-center justify-center box-border m-0 min-w-[110px] h-[34px] gap-[6px] px-[28px] py-0 rounded-[10px] text-[13px] font-semibold leading-[34px] whitespace-nowrap transition-all duration-150 ease-in-out cursor-pointer border text-white border-[#5A6F8F] bg-[linear-gradient(to_bottom,#5A6F8F_0%,#3E5475_60%,#2C3E57_100%)] hover:bg-[linear-gradient(to_bottom,#3E5475_0%,#5A6F8F_100%)] disabled:cursor-not-allowed disabled:opacity-60";

const BTN_FORM_CANCEL =
  "inline-flex items-center justify-center box-border m-0 min-w-[110px] h-[34px] gap-[6px] px-[28px] py-0 rounded-[10px] text-[13px] font-semibold leading-[34px] whitespace-nowrap transition-all duration-150 ease-in-out cursor-pointer border bg-[#cbd5e1] text-[#374151] border-[#cbd5e1] shadow-[0_1px_2px_rgba(15,23,42,0.08)] hover:bg-[#b6c2d3] disabled:cursor-not-allowed disabled:opacity-60";

const Btn = ({ children, onClick, disabled, variant = "formPrimary", type }) => (
  <button
    type={type}
    onClick={onClick}
    disabled={disabled}
    className={variant === "formCancel" ? BTN_FORM_CANCEL : BTN_FORM_PRIMARY}
  >
    {children}
  </button>
);

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

const FXS_VOIP_SIP_FIELD_INTERACTION = {
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

const getFxsNativeFieldInteraction = (disabled) =>
  disabled ? {} : FXS_VOIP_SIP_FIELD_INTERACTION;

const FXS_VOIP_SIP_INPUT_STYLE = {
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

const FxsVoipSipBreadcrumb = ({ current }) => (
  <div className="mb-[16px] flex flex-wrap items-center gap-[4px] text-[12px] font-normal text-[#94a3b8]">
    <span>FXS</span>
    <span>&gt;</span>
    <span>VoIP</span>
    <span>&gt;</span>
    <span className="font-semibold text-[#1e293b]">{current}</span>
  </div>
);

const FxsVoipSipPageShell = ({ children, fullWidth = false }) => (
  <div className={FXS_VOIP_SIP_PAGE_WRAP}>
    <div className={fullWidth ? "w-full max-w-full mx-auto" : FXS_VOIP_SIP_PAGE_INNER}>
      {children}
    </div>
  </div>
);

const checkboxSx = {
  padding: "4px",
  color: "#64748b",
  "&.Mui-checked": { color: "#0284c7" },
  "&.MuiCheckbox-indeterminate": { color: "#0284c7" },
  "& .MuiSvgIcon-root": { fontSize: 18 },
};

const FormEnableCheckbox = ({
  checked,
  onChange,
  name,
  label = "Enable",
  id,
}) => (
  <label
    style={{
      display: "flex",
      alignItems: "center",
      gap: 8,
      cursor: "pointer",
    }}
  >
    <Checkbox
      id={id || name}
      name={name}
      size="small"
      checked={!!checked}
      onChange={onChange}
      sx={checkboxSx}
    />
    <span style={{ fontSize: 13, color: C.valueText }}>{label}</span>
  </label>
);

const LOCAL_PBX_REGISTER_STATUS_TEXT = "Local PBX (registration not required)";

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
        mode === "local" ? res.message || LOCAL_PBX_REGISTER_STATUS_TEXT : "";
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
    ...FXS_VOIP_SIP_INPUT_STYLE,
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
    <FxsVoipSipPageShell>
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

      <FxsVoipSipBreadcrumb current="SIP Settings" />

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

      <div className={FXS_VOIP_SIP_TABLE_CONTAINER} style={{ marginBottom: 0 }}>
        <div className={FXS_VOIP_SIP_BLUE_BAR}>
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
                      <label style={labelColStyle}>
                        <FxsFieldLabel
                          tooltipKey={field.key}
                          tooltips={FXS_SIP_FIELD_TOOLTIPS}
                        >
                          {field.label}
                        </FxsFieldLabel>
                      </label>
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
          <div className={FXS_VOIP_SIP_FORM_FOOTER}>
            <Btn
              type="button"
              onClick={handleSave}
              variant="formPrimary"
              disabled={saving || loadingPage}
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
              variant="formCancel"
              disabled={saving || loadingPage}
            >
              Reset
            </Btn>
          </div>
        )}
      </div>
    </FxsVoipSipPageShell>
  );
};

export default FxsVoipSipPage;
