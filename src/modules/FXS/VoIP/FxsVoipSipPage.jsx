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
  getFxsNativeFieldInteraction,
} from "../../../sections/advanced/advancedSharedUi";

const ACCENT = "#3B6FE8";
const LOCAL_PBX_REGISTER_STATUS_TEXT =
  "Local PBX (registration not required)";

const inputClass =
  "w-full max-w-xs h-9 px-3 text-sm text-slate-800 bg-slate-50 border border-slate-200 rounded-lg outline-none transition-colors hover:border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 focus:bg-white disabled:opacity-60 disabled:cursor-not-allowed";

const labelClass =
  "block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5";

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
      state[f.key] = f.default !== undefined ? f.default : false;
    } else if (f.type === "readonly") {
      state[f.key] = f.default || "";
    } else {
      state[f.key] = f.default || "";
    }
  });
  return state;
};

const shouldShowField = (field, form) => {
  if (!field.conditional) return true;
  const conditionalValue = form[field.conditional];
  if (field.conditionalValues) {
    return field.conditionalValues.includes(conditionalValue);
  }
  if (field.conditionalValue !== undefined) {
    return conditionalValue === field.conditionalValue;
  }
  return !!conditionalValue;
};

const getField = (key) =>
  SIP_SETTINGS_FIELDS.find((f) => f.key === key);

const ToggleSwitch = ({ checked, onChange, id, disabled }) => (
  <button
    type="button"
    id={id}
    role="switch"
    aria-checked={checked}
    disabled={disabled}
    onClick={() => !disabled && onChange(!checked)}
    className={`relative w-11 h-6 rounded-full border-none p-0 shrink-0 bg-transparent ${
      disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
    }`}
  >
    <span
      className="block w-full h-full rounded-full transition-colors duration-200"
      style={{ backgroundColor: checked ? ACCENT : "#cbd5e1" }}
    />
    <span
      className="absolute top-[3px] w-[18px] h-[18px] rounded-full bg-white shadow transition-all duration-200"
      style={{ left: checked ? 23 : 3 }}
    />
  </button>
);

const ToggleRow = ({ label, checked, onChange, id, disabled }) => (
  <div className="flex items-center justify-between gap-4 py-3 border-t border-slate-100 first:border-t-0 first:pt-0">
    <span
      className={`text-sm font-semibold text-slate-700 leading-snug ${
        disabled ? "opacity-60" : ""
      }`}
    >
      {label}
    </span>
    <div className="flex items-center gap-2 shrink-0">
      <span className="text-xs font-medium text-slate-500">Enable</span>
      <ToggleSwitch
        id={id}
        checked={checked}
        onChange={onChange}
        disabled={disabled}
      />
    </div>
  </div>
);

const SipCard = ({ title, subtitle, children }) => (
  <div className="fxs-voip-sip-card bg-white border border-slate-200 rounded-xl shadow-sm p-5 md:p-[22px] transition-shadow duration-200 hover:shadow-md hover:border-slate-300">
    <div className="mb-4">
      <h2 className="text-sm font-bold text-slate-800 leading-snug">{title}</h2>
      {subtitle && (
        <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
      )}
    </div>
    {children}
  </div>
);

const FieldInput = ({ id, label, value, onChange, disabled, interaction }) => (
  <div className="mb-4 last:mb-0">
    <label htmlFor={id} className={labelClass}>
      {label}
    </label>
    <input
      id={id}
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className={inputClass}
      {...interaction}
    />
  </div>
);

const FieldSelect = ({ id, label, value, options, onChange, disabled, interaction }) => (
  <div className="mb-4 last:mb-0">
    <label htmlFor={id} className={labelClass}>
      {label}
    </label>
    <select
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className={inputClass}
      {...interaction}
    >
      {options.map((opt) => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>
  </div>
);

const InfoIcon = () => (
  <svg
    className="w-4 h-4 shrink-0 text-amber-600"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

const FxsVoipSipPage = () => {
  const [form, setForm] = useState(getInitialState());
  const [message, setMessage] = useState({ type: "", text: "" });
  const [loadingPage, setLoadingPage] = useState(true);
  const [saving, setSaving] = useState(false);
  const [registrationMode, setRegistrationMode] = useState("local");
  const [localModeMsg, setLocalModeMsg] = useState("");
  const statusPollRef = useRef(null);

  const sipFieldInteraction = getFxsNativeFieldInteraction(saving);

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

  const registerStatusText = getRegisterStatusDisplay(
    registrationMode,
    form.registerStatus,
    localModeMsg,
  );

  const showBanner = registrationMode === "local" && localModeMsg;
  const noteText = SIP_SETTINGS_NOTE?.trim();

  return (
    <div className="fxs-voip-media-page">
      {message.text && (
        <Alert
          className="fxs-voip-media-toast"
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

      {/* Breadcrumb & title */}
      <div className="mb-4">
        <nav
          className="flex items-center gap-1.5 text-xs text-slate-400 mb-2"
          aria-label="Breadcrumb"
        >
          <span>FXS</span>
          <span className="text-slate-300">/</span>
          <span>VoIP</span>
          <span className="text-slate-300">/</span>
          <span className="text-slate-800 font-semibold">SIP Settings</span>
        </nav>
        <h1 className="text-[26px] font-bold text-slate-900 tracking-tight m-0">
          SIP Settings
        </h1>
        <p className="text-sm text-slate-500 mt-1.5 max-w-2xl">
          Configure core SIP registration endpoints, primary/failover proxy
          servers, and transport protocols.
        </p>
      </div>

      {/* Information banner */}
      {(showBanner || noteText) && (
        <div className="mb-4 flex items-start gap-2.5 px-4 py-3 bg-amber-50 border border-amber-200 rounded-lg text-xs leading-relaxed text-amber-900">
          <InfoIcon />
          <div>
            {showBanner && (
              <p className="m-0">
                <strong>Local PBX mode:</strong> {localModeMsg}
              </p>
            )}
            {noteText && (
              <p className={showBanner ? "mt-1 mb-0" : "m-0"}>
                <strong>Note:</strong> {noteText}
              </p>
            )}
          </div>
        </div>
      )}

      {loadingPage ? (
        <div className="flex justify-center items-center py-16">
          <CircularProgress size={32} sx={{ color: ACCENT }} />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Card 1: Primary Registrar Configuration */}
            <SipCard
              title="Primary Registrar Configuration"
              subtitle="Define server endpoints for SIP account authentication"
            >
              <div className="mb-4">
                <span className={labelClass}>Register Status</span>
                <div className="max-w-xs">
                  <span className="inline-flex items-center justify-center w-full min-h-9 px-3 text-xs font-semibold text-slate-700 bg-slate-100 border border-slate-200 rounded-lg text-center">
                    {registerStatusText}
                  </span>
                </div>
              </div>

              <FieldInput
                id="registrarIp"
                label="Registrar IP Address"
                value={form.registrarIp || ""}
                onChange={(v) => handleChange("registrarIp", v)}
                disabled={saving}
                interaction={sipFieldInteraction}
              />
              <FieldInput
                id="registrarPort"
                label="Registrar Port"
                value={form.registrarPort || ""}
                onChange={(v) => handleChange("registrarPort", v)}
                disabled={saving}
                interaction={sipFieldInteraction}
              />

              <ToggleRow
                id="spareRegistrarServer"
                label="Spare Registrar Server"
                checked={!!form.spareRegistrarServer}
                onChange={() => handleCheckbox("spareRegistrarServer")}
                disabled={saving}
              />

              {shouldShowField(getField("spareRegistrarIp"), form) && (
                <div className="mt-3">
                  <FieldInput
                    id="spareRegistrarIp"
                    label="Spare Registrar IP Address"
                    value={form.spareRegistrarIp || ""}
                    onChange={(v) => handleChange("spareRegistrarIp", v)}
                    disabled={saving}
                    interaction={sipFieldInteraction}
                  />
                </div>
              )}

              {shouldShowField(getField("spareRegistrarPort"), form) && (
                <FieldInput
                  id="spareRegistrarPort"
                  label="Spare Registrar Port"
                  value={form.spareRegistrarPort || ""}
                  onChange={(v) => handleChange("spareRegistrarPort", v)}
                  disabled={saving}
                  interaction={sipFieldInteraction}
                />
              )}

              <ToggleRow
                id="multiRegistrarMode"
                label="Multi-Registrar Server Mode"
                checked={!!form.multiRegistrarMode}
                onChange={() => handleCheckbox("multiRegistrarMode")}
                disabled={saving}
              />
            </SipCard>

            {/* Card 2: Timers & Transport Protocols */}
            <SipCard
              title="Timers & Transport Protocols"
              subtitle="Fine-tune heartbeat intervals and network transport rules"
            >
              <FieldInput
                id="registerInterval"
                label="Register Interval Time (ms)"
                value={form.registerInterval || ""}
                onChange={(v) => handleChange("registerInterval", v)}
                disabled={saving}
                interaction={sipFieldInteraction}
              />
              <FieldInput
                id="registryValidity"
                label="Registry Validity Period (s)"
                value={form.registryValidity || ""}
                onChange={(v) => handleChange("registryValidity", v)}
                disabled={saving}
                interaction={sipFieldInteraction}
              />
              <FieldInput
                id="reregistrationInterval"
                label="Re-registration Interval (s)"
                value={form.reregistrationInterval || ""}
                onChange={(v) => handleChange("reregistrationInterval", v)}
                disabled={saving}
                interaction={sipFieldInteraction}
              />
              <FieldSelect
                id="sipTransportProtocol"
                label="SIP Transport Protocol"
                value={form.sipTransportProtocol || ""}
                options={getField("sipTransportProtocol").options}
                onChange={(v) => handleChange("sipTransportProtocol", v)}
                disabled={saving}
                interaction={sipFieldInteraction}
              />
              <ToggleRow
                id="switchSignalPort"
                label="Switch Signal Port if SIP Registration Failed"
                checked={!!form.switchSignalPort}
                onChange={() => handleCheckbox("switchSignalPort")}
                disabled={saving}
              />
            </SipCard>
          </div>

          {/* Action buttons */}
          <div className="mt-4 bg-white border border-slate-200 rounded-xl shadow-sm px-5 py-3.5 flex items-center justify-end gap-2.5 flex-wrap">
            <button
              type="button"
              onClick={handleReset}
              disabled={saving || loadingPage}
              className="h-9 px-[18px] text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-slate-300 hover:text-slate-800 transition-all active:translate-y-px disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Reset
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving || loadingPage}
              className="h-9 px-[22px] text-sm font-bold text-white bg-blue-600 border border-blue-600 rounded-lg hover:bg-blue-700 hover:shadow-md hover:shadow-blue-500/30 transition-all active:translate-y-px disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
            >
              {saving ? (
                <>
                  <CircularProgress size={14} sx={{ color: "inherit" }} />
                  Saving…
                </>
              ) : (
                "Save changes"
              )}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default FxsVoipSipPage;
