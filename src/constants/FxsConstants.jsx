export const FXS_FIELDS = [
  { label: 'Tone Energy (dB)', type: 'text', key: 'toneEnergy', default: '-11', keyPressType: 'number-minus' },
  { label: 'Ringing Scheme Setting', type: 'checkbox', key: 'ringingSchemeEnabled', default: false},
  { label: 'Ringing Mode', type: 'text', key: 'ringMode', default: '', keyPressType: 'number-comma-minus', conditional: 'ringingSchemeEnabled', maxLength: 128 },
  { label: 'Hook-flash Detection', type: 'checkbox', key: 'hookFlashDetection', default: false },
  { label: 'Minimum Time Length of On-hook Detection (ms)', type: 'text', key: 'minHangupTime', default: '64', keyPressType: 'number', conditional: 'hookFlashDetection', conditionalValue: false, maxLength: 5 },
  { label: 'Minimum Time (ms)', type: 'text', key: 'hookFlashMinTime', default: '80', keyPressType: 'number', conditional: 'hookFlashDetection', conditionalValue: true, maxLength: 5 },
  { label: 'Maximum Time (ms)', type: 'text', key: 'hookFlashMaxTime', default: '700', keyPressType: 'number', conditional: 'hookFlashDetection', conditionalValue: true, maxLength: 5 },
  { label: 'Preferred 18x Response (NO valid P_Early_Media)', type: 'select', key: 'preferred18xResponse', options: [
    { value: '0', label: 'IMS Ringback' },
    { value: '1', label: 'Local Ringback' },
  ], default: '0' },
  { label: 'Enable Press-Key Call-Forward', type: 'checkbox', key: 'pressKeyCallForward', default: false},
  { label: 'Call-Forward Key', type: 'select', key: 'callForwardKey', options: [
    { value: '35', label: '#' },
    { value: '42', label: '*' },
  ], default: '35', conditional: 'pressKeyCallForward' },
  { label: 'Call-Forward Method', type: 'select', key: 'callForwardMethod', options: [
    { value: '0', label: 'Call Forward with Negotiation' },
    { value: '1', label: 'Blind Transfer' },
  ], default: '0', conditional: 'pressKeyCallForward' },
  { label: 'CID Transmit Mode', type: 'select', key: 'cidTransmitMode', options: [
    { value: '0', label: 'DTMF' },
    { value: '1', label: 'FSK' },
  ], default: '1' },
  { label: 'Occasion to Send FSK CallerID', type: 'select', key: 'occasionToSendFSKCallerID', options: [
    { value: '0', label: 'Before ring' },
    { value: '1', label: 'After the first ring' },
  ], default: '1', conditional: 'cidTransmitMode', conditionalValue: '1' },
  { label: 'Send Polarity Reversal Signal', type: 'checkbox', key: 'sendPolarityReversal', default: false},
  { label: 'Off-hook Dither Signal Duration (ms)', type: 'text', key: 'offHookDitherSignalDuration', default: '64', keyPressType: 'number', maxLength: 5 },
  { label: 'Handling of Call from Internal Station', type: 'select', key: 'handlingOfCallFromInternalStation', options: [
    { value: '0', label: 'Internal Handling' },
    { value: '1', label: 'Platform Handling' },
  ], default: '1' },
  { label: 'Light Up Mode for Voice Message', type: 'select', key: 'lightUpModeForVoiceMessage', options: [
    { value: '0', label: 'Not Light Up' },
    { value: '1', label: 'FSK Light Up' },
  ], default: '0' },
  { label: 'Open Session In Advance', type: 'checkbox', key: 'openSessionInAdvance', default: false },
  { label: 'Report FXS Status', type: 'checkbox', key: 'reportFXSStatus', default: false },
  { label: 'Enable Send DTMF while receiving 183', type: 'checkbox', key: 'enableSendDTMFWhileReceiving183', default: true },
];

export const FXS_INITIAL_FORM = FXS_FIELDS.reduce((acc, field) => {
  acc[field.key] = field.default;
  return acc;
}, {});

const fxsFieldOpts = (field) => {
  if (!field.options) return "";
  const opts = field.options.map((o) => o.label ?? o.value);
  return `Options: ${opts.join(", ")}.`;
};

const buildFxsFieldTooltips = () => {
  const tooltips = {};
  FXS_FIELDS.forEach((field) => {
    const parts = [];
    if (field.type === "checkbox") {
      parts.push(`Enable checkbox. Default: ${field.default ? "enabled" : "disabled"}.`);
    } else if (field.type === "select") {
      parts.push(fxsFieldOpts(field));
      parts.push(`Default: ${field.default}.`);
    } else {
      parts.push(`Text input. Default: ${field.default}.`);
      if (field.keyPressType === "number-minus") {
        parts.push("Allows digits and minus sign.");
      } else if (field.keyPressType === "number-comma-minus") {
        parts.push("Allows digits, comma, and minus sign.");
      } else if (field.keyPressType === "number") {
        parts.push("Digits only.");
      }
      if (field.maxLength) parts.push(`Max length: ${field.maxLength}.`);
    }
    if (field.conditional) {
      const condVal =
        field.conditionalValue !== undefined
          ? ` when ${field.conditional} is ${field.conditionalValue}`
          : ` when ${field.conditional} is enabled`;
      parts.push(`Shown${condVal}.`);
    }
    tooltips[field.key] = parts.join("\n");
  });

  tooltips.toneEnergy +=
    "\nValid range: -35~15 dB. Saved with FXS advanced settings.";
  tooltips.ringingSchemeEnabled +=
    "\nWhen enabled, Ringing Mode must be set in comma-separated scheme format.";
  tooltips.ringMode +=
    "\nRequired when Ringing Scheme Setting is enabled.\nFormat type 1: 1,ON_ms,OFF_ms (3 values).\nFormat type 2: 2,T1,T2,T3,T4 (5 values).\nEach ON/OFF duration: 50~12000 ms; sum of all durations ≤ 16000 ms.";
  tooltips.hookFlashDetection +=
    "\nWhen disabled, Minimum Time Length of On-hook Detection applies.\nWhen enabled, Minimum/Maximum Time (ms) apply instead.";
  tooltips.minHangupTime +=
    "\nValid range: 64~2000 ms. Used when Hook-flash Detection is off.";
  tooltips.hookFlashMinTime +=
    "\nMust be ≥ 80 ms and ≤ Maximum Time. Used when Hook-flash Detection is on.";
  tooltips.hookFlashMaxTime +=
    "\nValid range: 80~2000 ms. Must be ≥ Minimum Time.";
  tooltips.preferred18xResponse +=
    "\nSelects ringback source when 18x response has no valid P_Early_Media.";
  tooltips.pressKeyCallForward +=
    "\nWhen enabled, Call-Forward Key and Call-Forward Method fields are shown.";
  tooltips.callForwardKey += "\nDTMF key used to trigger call forward (# or *).";
  tooltips.callForwardMethod +=
    "\nCall Forward with Negotiation or Blind Transfer.";
  tooltips.cidTransmitMode += "\nCaller ID transmission: DTMF or FSK.";
  tooltips.occasionToSendFSKCallerID +=
    "\nShown when CID Transmit Mode is FSK. Before ring or after first ring.";
  tooltips.offHookDitherSignalDuration +=
    "\nMust be > 0 and a multiple of 16 ms.";
  tooltips.enableSendDTMFWhileReceiving183 +=
    "\nDefault: enabled. Allows DTMF transmission during 183 Session Progress.";

  return tooltips;
};

/** FXS advanced settings (FxsPage) — local form state */
export const FXS_FIELD_TOOLTIPS = buildFxsFieldTooltips();

