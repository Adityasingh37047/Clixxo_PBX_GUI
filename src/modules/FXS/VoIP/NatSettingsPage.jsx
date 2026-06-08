import React, { useState } from "react";
import { Alert } from "@mui/material";
import {
  NAT_SETTINGS_FIELDS,
  NAT_SETTINGS_NOTE,
} from "../../../sections/voip/constants/NatSettingsConstants";
import { nativeFieldInteraction } from "../../../sections/advanced/advancedSharedUi";

const ACCENT = "#3B6FE8";

const inputClass =
  "w-full h-9 px-3 text-sm text-slate-800 bg-slate-50 border border-slate-200 rounded-lg outline-none transition-colors hover:border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 focus:bg-white disabled:opacity-60 disabled:cursor-not-allowed";

const labelClass =
  "block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5";

const getInitialState = () => {
  const state = {};
  NAT_SETTINGS_FIELDS.forEach((f) => {
    if (f.type === "select") {
      state[f.key] = f.default || f.options[0] || "";
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
      className={`text-sm font-semibold text-slate-700 ${
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

const NatCard = ({ title, subtitle, children, className = "" }) => (
  <div
    className={`fxs-voip-nat-card bg-white border border-slate-200 rounded-xl shadow-sm p-5 md:p-[22px] transition-shadow duration-200 hover:shadow-md hover:border-slate-300 ${className}`}
  >
    <div className="mb-4">
      <h2 className="text-sm font-bold text-slate-800 leading-snug">{title}</h2>
      {subtitle && (
        <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
      )}
    </div>
    {children}
  </div>
);

const NatSettingsPage = () => {
  const [form, setForm] = useState(getInitialState());
  const [toast, setToast] = useState({ msg: "", type: "success" });

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "success" }), 3500);
  };

  const alert = (msg) => {
    const isSuccess = /successfully/i.test(String(msg));
    showToast(msg, isSuccess ? "success" : "error");
  };

  const handleChange = (key, value) => {
    const fieldDef = NAT_SETTINGS_FIELDS.find((f) => f.key === key);
    if (fieldDef && fieldDef.validation === "integer") {
      if (value === "" || /^\d+$/.test(value)) {
        setForm((prev) => ({ ...prev, [key]: value }));
      }
    } else {
      setForm((prev) => ({ ...prev, [key]: value }));
    }
  };

  const handleCheckbox = (key) => {
    if (key === "autoDetectNatIp" && !form.learnNat) {
      return;
    }

    setForm((prev) => {
      const newValue = !prev[key];
      const updates = { [key]: newValue };

      if (key === "learnNat" && !newValue) {
        updates.autoDetectNatIp = false;
      }

      return { ...prev, ...updates };
    });
  };

  const handleSave = () => {
    alert("Settings saved successfully!");
  };

  const handleReset = () => {
    setForm(getInitialState());
  };

  const showOuterNetwork = shouldShowField(
    NAT_SETTINGS_FIELDS.find((f) => f.key === "outerNetworkAddress"),
    form,
  );
  const showStunFields = shouldShowField(
    NAT_SETTINGS_FIELDS.find((f) => f.key === "stunServerAddress"),
    form,
  );

  return (
    <div className="fxs-voip-media-page">
      {toast.msg && (
        <Alert
          className="fxs-voip-media-toast"
          severity={toast.type}
          onClose={() => setToast({ msg: "", type: "success" })}
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
          {toast.msg}
        </Alert>
      )}

      {/* Breadcrumb & title */}
      <div className="mb-5">
        <nav
          className="flex items-center gap-1.5 text-xs text-slate-400 mb-2"
          aria-label="Breadcrumb"
        >
          <span>FXS</span>
          <span className="text-slate-300">/</span>
          <span>VoIP</span>
          <span className="text-slate-300">/</span>
          <span className="text-slate-800 font-semibold">NAT Settings</span>
        </nav>
        <h1 className="text-[26px] font-bold text-slate-900 tracking-tight m-0">
          NAT Settings
        </h1>
        <p className="text-sm text-slate-500 mt-1.5 max-w-xl">
          Configure local NAT traversal methods and remote device adaptation for
          VoIP sessions.
        </p>
      </div>

      {/* Card grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Card 1: STUN & Auto NAT */}
        <NatCard
          title="STUN & Auto NAT"
          subtitle="Automated network address translation discovery"
        >
          <div className="mb-4">
            <label htmlFor="autoNat" className={labelClass}>
              Auto Nat
            </label>
            <select
              id="autoNat"
              value={form.autoNat}
              onChange={(e) => handleChange("autoNat", e.target.value)}
              className={inputClass}
              {...nativeFieldInteraction}
            >
              <option value="DisableAutoNat">DisableAutoNat</option>
              <option value="Enable PMP">Enable PMP</option>
              <option value="Enable UPNP">Enable UPNP</option>
            </select>
          </div>

          {showOuterNetwork && (
            <div className="mb-4">
              <label className={labelClass}>Outer Network Address</label>
              <div
                className={`${inputClass} flex items-center bg-slate-100 text-slate-600 cursor-default`}
              >
                {form.outerNetworkAddress || "Offline"}
              </div>
            </div>
          )}

          <ToggleRow
            id="stunServer"
            label="STUN Server"
            checked={!!form.stunServer}
            onChange={() => handleCheckbox("stunServer")}
          />

          {showStunFields && (
            <>
              <div className="mt-3 mb-4">
                <label className={labelClass}>NAT Type</label>
                <div
                  className={`${inputClass} flex items-center bg-slate-100 text-slate-600 cursor-default`}
                >
                  {form.natType || "Unknown"}
                </div>
              </div>
              <div>
                <label htmlFor="stunServerAddress" className={labelClass}>
                  STUN Server Address
                </label>
                <input
                  id="stunServerAddress"
                  type="text"
                  value={form.stunServerAddress}
                  onChange={(e) =>
                    handleChange("stunServerAddress", e.target.value)
                  }
                  className={inputClass}
                  {...nativeFieldInteraction}
                />
              </div>
            </>
          )}
        </NatCard>

        {/* Card 2: IP Mapping */}
        <NatCard
          title="IP Mapping"
          subtitle="Static routing and signaling address mapping"
        >
          <div className="mb-4">
            <label htmlFor="mappingContactIp" className={labelClass}>
              Mapping Contact IP
            </label>
            <input
              id="mappingContactIp"
              type="text"
              value={form.mappingContactIp}
              onChange={(e) =>
                handleChange("mappingContactIp", e.target.value)
              }
              className={inputClass}
              {...nativeFieldInteraction}
            />
          </div>
          <div>
            <label htmlFor="mappingSdpIp" className={labelClass}>
              Mapping SDP IP
            </label>
            <input
              id="mappingSdpIp"
              type="text"
              value={form.mappingSdpIp}
              onChange={(e) => handleChange("mappingSdpIp", e.target.value)}
              className={inputClass}
              {...nativeFieldInteraction}
            />
          </div>
        </NatCard>

        {/* Card 3: Symmetric NAT & Port Control */}
        <NatCard
          title="Symmetric NAT & Port Control"
          subtitle="Rport handling and NAT detection parameters"
        >
          <ToggleRow
            id="rport"
            label="Rport"
            checked={!!form.rport}
            onChange={() => handleCheckbox("rport")}
          />
          <ToggleRow
            id="learnNat"
            label="Learn NAT"
            checked={!!form.learnNat}
            onChange={() => handleCheckbox("learnNat")}
          />
          <ToggleRow
            id="autoDetectNatIp"
            label="Auto Detect NAT IP"
            checked={!!form.autoDetectNatIp}
            onChange={() => handleCheckbox("autoDetectNatIp")}
            disabled={!form.learnNat}
          />
        </NatCard>

        {/* Card 4: Remote Device Configuration */}
        <NatCard
          title="Remote Device Configuration"
          subtitle="Help remote devices complete NAT traversal"
        >
          <ToggleRow
            id="rtpSelfAdaption"
            label="RTP Self-adaption"
            checked={!!form.rtpSelfAdaption}
            onChange={() => handleCheckbox("rtpSelfAdaption")}
          />
        </NatCard>
      </div>

      {/* Note + actions footer */}
      <div className="mt-4 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-3 bg-amber-50 border-b border-amber-200 text-xs leading-relaxed text-amber-900">
          <strong>Note:</strong>{" "}
          {NAT_SETTINGS_NOTE.split("\n").filter(Boolean).join(" ")}
        </div>
        <div className="flex items-center justify-end gap-2.5 px-5 py-3.5 flex-wrap">
          <button
            type="button"
            onClick={handleReset}
            className="h-9 px-[18px] text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-slate-300 hover:text-slate-800 transition-all active:translate-y-px"
          >
            Reset
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="h-9 px-[22px] text-sm font-bold text-white bg-blue-600 border border-blue-600 rounded-lg hover:bg-blue-700 hover:shadow-md hover:shadow-blue-500/30 transition-all active:translate-y-px"
          >
            Save changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default NatSettingsPage;
