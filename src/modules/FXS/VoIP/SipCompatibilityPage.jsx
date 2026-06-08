import React, { useState } from "react";
import { Alert } from "@mui/material";
import { SIP_COMPATIBILITY_FIELDS } from "../../../sections/voip/constants/SipCompatibilityConstants";
import { nativeFieldInteraction } from "../../../sections/advanced/advancedSharedUi";

const ACCENT = "#3B6FE8";

const inputClass =
  "w-full h-9 px-3 text-sm text-slate-800 bg-slate-50 border border-slate-200 rounded-lg outline-none transition-colors hover:border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 focus:bg-white disabled:opacity-60 disabled:cursor-not-allowed";

const labelClass =
  "block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5";

const getInitialState = () => {
  const state = {};
  SIP_COMPATIBILITY_FIELDS.forEach((f) => {
    if (f.type === "select") {
      state[f.key] = f.options[0] || f.default || "";
    } else if (f.type === "checkbox") {
      state[f.key] = f.default !== undefined ? f.default : false;
    } else {
      state[f.key] = f.default || "";
    }
  });
  return state;
};

const shouldShowField = (field, form) => {
  if (!field.conditional) return true;

  const conditionalValue = form[field.conditional];

  if (field.key === "key") {
    return !!form.sipEncryption;
  }

  if (field.conditionalValues) {
    return field.conditionalValues.includes(conditionalValue);
  }
  if (field.conditionalValue !== undefined) {
    return conditionalValue === field.conditionalValue;
  }
  return !!conditionalValue;
};

const getField = (key) => SIP_COMPATIBILITY_FIELDS.find((f) => f.key === key);

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

const SipCard = ({ title, subtitle, children, className = "" }) => (
  <div
    className={`fxs-sip-compat-card bg-white border border-slate-200 rounded-xl shadow-sm p-5 md:p-[22px] transition-shadow duration-200 hover:shadow-md hover:border-slate-300 ${className}`}
  >
    <div className="mb-4">
      <h2 className="text-sm font-bold text-slate-800 leading-snug">{title}</h2>
      {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
    </div>
    {children}
  </div>
);

const FieldSelect = ({ id, label, value, options, onChange }) => (
  <div className="mb-4 last:mb-0">
    <label htmlFor={id} className={labelClass}>
      {label}
    </label>
    <select
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={inputClass}
      {...nativeFieldInteraction}
    >
      {options.map((opt) => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>
  </div>
);

const FieldInput = ({ id, label, value, onChange, suffix }) => (
  <div className="mb-4 last:mb-0">
    <label htmlFor={id} className={labelClass}>
      {label}
    </label>
    <div className={suffix ? "flex items-center gap-1.5" : undefined}>
      <input
        id={id}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={inputClass}
        {...nativeFieldInteraction}
      />
      {suffix && (
        <span className="text-sm text-slate-600 shrink-0">{suffix}</span>
      )}
    </div>
  </div>
);

const SipCompatibilityPage = () => {
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
    const fieldDef = SIP_COMPATIBILITY_FIELDS.find((f) => f.key === key);
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

  const handleSave = () => {
    alert("Settings saved successfully!");
  };

  const handleReset = () => {
    setForm(getInitialState());
  };

  const visible = (key) => {
    const field = getField(key);
    return field ? shouldShowField(field, form) : false;
  };

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
          <span className="text-slate-800 font-semibold">
            SIP Compatibility
          </span>
        </nav>
        <h1 className="text-[26px] font-bold text-slate-900 tracking-tight m-0">
          SIP Compatibility
        </h1>
        <p className="text-sm text-slate-500 mt-1.5 max-w-2xl">
          Manage SIP header adaptations, call routing protocols, and encryption
          parameters.
        </p>
      </div>

      {/* Card grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Card 1: Caller & Callee ID Headers */}
        <SipCard
          title="Caller & Callee ID Headers"
          subtitle="Configure header parsing for identification"
        >
          <FieldSelect
            id="obtainCalleeId"
            label="Obtain CalleeID from"
            value={form.obtainCalleeId}
            options={getField("obtainCalleeId").options}
            onChange={(v) => handleChange("obtainCalleeId", v)}
          />
          <FieldSelect
            id="callerIdPosition"
            label="Set CallerID position"
            value={form.callerIdPosition}
            options={getField("callerIdPosition").options}
            onChange={(v) => handleChange("callerIdPosition", v)}
          />
          <FieldSelect
            id="obtainCallerId"
            label="Obtain CallerID from"
            value={form.obtainCallerId}
            options={getField("obtainCallerId").options}
            onChange={(v) => handleChange("obtainCallerId", v)}
          />
        </SipCard>

        {/* Card 2: Call Handling & Routing */}
        <SipCard
          title="Call Handling & Routing"
          subtitle="Manage dialing modes and transfer rules"
        >
          <ToggleRow
            id="twoStageDialing"
            label="Two Stage Dialing for SIP Incoming Call"
            checked={!!form.twoStageDialing}
            onChange={() => handleCheckbox("twoStageDialing")}
          />
          <div className="mt-3">
            <FieldSelect
              id="callTransferMode"
              label="Call Transfer Mode"
              value={form.callTransferMode}
              options={getField("callTransferMode").options}
              onChange={(v) => handleChange("callTransferMode", v)}
            />
          </div>
          {visible("internalHandle") && (
            <FieldSelect
              id="internalHandle"
              label="Internal Handle"
              value={form.internalHandle}
              options={getField("internalHandle").options}
              onChange={(v) => handleChange("internalHandle", v)}
            />
          )}
          <FieldSelect
            id="callFlashMode"
            label="Call Flash Mode"
            value={form.callFlashMode}
            options={getField("callFlashMode").options}
            onChange={(v) => handleChange("callFlashMode", v)}
          />
          {visible("holdMusicSource") && (
            <FieldSelect
              id="holdMusicSource"
              label="Hold Music Source"
              value={form.holdMusicSource}
              options={getField("holdMusicSource").options}
              onChange={(v) => handleChange("holdMusicSource", v)}
            />
          )}
          <FieldSelect
            id="manageRefer"
            label="Manage Refer"
            value={form.manageRefer}
            options={getField("manageRefer").options}
            onChange={(v) => handleChange("manageRefer", v)}
          />
          {visible("fxoHangupTime") && (
            <FieldInput
              id="fxoHangupTime"
              label="FXO HangUp Time"
              value={form.fxoHangupTime}
              onChange={(v) => handleChange("fxoHangupTime", v)}
              suffix="s"
            />
          )}
        </SipCard>

        {/* Card 3: Timers & Core Identification */}
        <SipCard
          title="Timers & Core Identification"
          subtitle="Timeout parameters and session identification"
        >
          <FieldInput
            id="maxWaitAnswer"
            label="Maximum Wait Answer Time (s)"
            value={form.maxWaitAnswer}
            onChange={(v) => handleChange("maxWaitAnswer", v)}
          />
          <FieldInput
            id="maxWaitRtp"
            label="Maximum Wait RTP Time (s)"
            value={form.maxWaitRtp}
            onChange={(v) => handleChange("maxWaitRtp", v)}
          />
          <FieldInput
            id="sipIdentifying"
            label="Set SIP Identifying"
            value={form.sipIdentifying}
            onChange={(v) => handleChange("sipIdentifying", v)}
          />
        </SipCard>

        {/* Card 4: Security, Encryption & Networking */}
        <SipCard
          title="Security, Encryption & Networking"
          subtitle="SIP security hardening and protocol behavior"
        >
          <ToggleRow
            id="sipEncryption"
            label="SIP Encryption"
            checked={!!form.sipEncryption}
            onChange={() => handleCheckbox("sipEncryption")}
          />
          {visible("encryptionCriterion") && (
            <div className="mb-1">
              <FieldSelect
                id="encryptionCriterion"
                label="Encryption Criterion"
                value={form.encryptionCriterion}
                options={getField("encryptionCriterion").options}
                onChange={(v) => handleChange("encryptionCriterion", v)}
              />
            </div>
          )}
          {visible("identifier") && (
            <FieldInput
              id="identifier"
              label="Identifier"
              value={form.identifier}
              onChange={(v) => handleChange("identifier", v)}
            />
          )}
          {visible("key") && (
            <FieldInput
              id="key"
              label="Key"
              value={form.key}
              onChange={(v) => handleChange("key", v)}
            />
          )}
          <ToggleRow
            id="rtpEncryption"
            label="RTP Encryption"
            checked={!!form.rtpEncryption}
            onChange={() => handleCheckbox("rtpEncryption")}
          />
          <ToggleRow
            id="useIptables"
            label="Use Iptables"
            checked={!!form.useIptables}
            onChange={() => handleCheckbox("useIptables")}
          />
          <ToggleRow
            id="useSourceAddress"
            label="Use Source Address"
            checked={!!form.useSourceAddress}
            onChange={() => handleCheckbox("useSourceAddress")}
          />
          <ToggleRow
            id="useContactAddress"
            label="Use Contact Address"
            checked={!!form.useContactAddress}
            onChange={() => handleCheckbox("useContactAddress")}
          />
          <ToggleRow
            id="abnormalHangup"
            label="Call Abnormal Hangup Detection"
            checked={!!form.abnormalHangup}
            onChange={() => handleCheckbox("abnormalHangup")}
          />
          {visible("abnormalHangupCycle") && (
            <FieldInput
              id="abnormalHangupCycle"
              label="Cycle(s)"
              value={form.abnormalHangupCycle}
              onChange={(v) => handleChange("abnormalHangupCycle", v)}
            />
          )}
          <ToggleRow
            id="serverStatusDetection"
            label="Server Status Detection"
            checked={!!form.serverStatusDetection}
            onChange={() => handleCheckbox("serverStatusDetection")}
          />
          {visible("cycle") && (
            <FieldInput
              id="cycle"
              label="Cycle(s)"
              value={form.cycle}
              onChange={(v) => handleChange("cycle", v)}
            />
          )}
          {visible("sendCueTone") && (
            <ToggleRow
              id="sendCueTone"
              label="Send Cue Tone"
              checked={!!form.sendCueTone}
              onChange={() => handleCheckbox("sendCueTone")}
            />
          )}
          <ToggleRow
            id="invite100rel"
            label="INVITE 100rel"
            checked={!!form.invite100rel}
            onChange={() => handleCheckbox("invite100rel")}
          />
          <ToggleRow
            id="ignoreAck"
            label="Ignore ACK"
            checked={!!form.ignoreAck}
            onChange={() => handleCheckbox("ignoreAck")}
          />
          <ToggleRow
            id="userDefinedSipCode"
            label="User-defined SIP Code"
            checked={!!form.userDefinedSipCode}
            onChange={() => handleCheckbox("userDefinedSipCode")}
          />
          {visible("noIdlePort") && (
            <FieldInput
              id="noIdlePort"
              label="No Idle Port in Port Group"
              value={form.noIdlePort}
              onChange={(v) => handleChange("noIdlePort", v)}
            />
          )}
          {visible("calledPartyDisconnected") && (
            <FieldInput
              id="calledPartyDisconnected"
              label="Called Party Disconnected (Talking, Power off, Rejected, No Response, Not in Service)"
              value={form.calledPartyDisconnected}
              onChange={(v) => handleChange("calledPartyDisconnected", v)}
            />
          )}
          {visible("routeFailed") && (
            <FieldInput
              id="routeFailed"
              label="Route Failed"
              value={form.routeFailed}
              onChange={(v) => handleChange("routeFailed", v)}
            />
          )}
        </SipCard>
      </div>

      {/* Action buttons */}
      <div className="mt-4 bg-white border border-slate-200 rounded-xl shadow-sm px-5 py-3.5 flex items-center justify-end gap-2.5 flex-wrap">
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
  );
};

export default SipCompatibilityPage;
