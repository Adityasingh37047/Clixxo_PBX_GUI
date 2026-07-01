// Media Parameters field definitions and initial values for SIP Media Page

export const SIP_MEDIA_PAGE_BREADCRUMB_ROOT = "E1-PRI";
export const SIP_MEDIA_PAGE_BREADCRUMB_SECTION = "SIP";
export const SIP_MEDIA_PAGE_TITLE = "Media Parameters";
export const SIP_MEDIA_CARD_TITLE = "Media Parameters";

export const SIP_MEDIA_SECTION_RTP_DTMF = "RTP & DTMF Settings";
export const SIP_MEDIA_SECTION_JITTER_CODEC = "Jitter & CODEC Settings";

export const SIP_MEDIA_SECTION_HEADING_LEFT = -20;
export const SIP_MEDIA_SECTION_HEADING_COLOR = "#30415A";

export const SIP_MEDIA_BTN_SAVE = "Save";
export const SIP_MEDIA_BTN_SAVING = "Saving...";
export const SIP_MEDIA_BTN_RESET = "Reset";
export const SIP_MEDIA_LOADING_TEXT = "Loading media parameters...";
export const SIP_MEDIA_MSG_SETTINGS_UPDATED = "Settings Updated!";
export const SIP_MEDIA_MSG_SAVE_FAILED = "Save failed";
export const SIP_MEDIA_MSG_LOAD_FAILED = "Failed to load media settings";
export const SIP_MEDIA_MSG_NETWORK_SAVE_FAILED = "Network error while saving";
export const SIP_MEDIA_MSG_RESET = "Form reset to defaults";

export const SIP_MEDIA_FIELDS = [
  { name: 'dtmfTransmitMode', label: 'DTMF Transmit Mode', type: 'select', options: [
    { value: 'RFC2833', label: 'RFC2833' },
    { value: 'SignAling', label: 'SignAling'},
    { value: 'In-Band', label: 'In-Band'},
    { value: 'RFC2833+SingAling', label: 'RFC2833+SingAling'},
    { value: 'In-Band+SingAling', label: 'In-Band+SingAling'}


  ]},
  { name: 'rfc2833Payload', label: 'RFC2833 Payload', type: 'text', conditional: 'dtmfTransmitMode', conditionalValues: ['RFC2833', 'RFC2833+SingAling'] },
  { name: 'rtpPortRange', label: 'RTP Port Range', type: 'text' },
  { name: 'silenceSuppression', label: 'Silence Suppression', type: 'select', options: [
    { value: 'Enable', label: 'Enable' },
    { value: 'Disable', label: 'Disable' },
  ]},
  { name: 'noiseReduction', label: 'Noise Reduction', type: 'select', options: [
    { value: 'Enable', label: 'Enable' },
    { value: 'Disable', label: 'Disable' },
  ]},
  { name: 'comfortNoise', label: 'Comfort Noise Generation', type: 'select', options: [
    { value: 'Enable', label: 'Enable' },
    { value: 'Disable', label: 'Disable' },
  ]},
  { name: 'jitterMode', label: 'JitterMode', type: 'select', options: [
    { value: 'Static Mode', label: 'Static Mode' },
    { value: 'Adaptive Mode', label: 'Adaptive Mode'}
  ]},
  { name: 'jitterBuffer', label: 'JitterBuffer(ms)', type: 'text' },
  { name: 'jitterUnderrunLead', label: 'JitterUnderrunLead(ms)', type: 'text', conditional: 'jitterMode', conditionalValue: 'Static Mode' },
  { name: 'jitterOverrunLead', label: 'JitterOverrunLead(ms)', type: 'text', conditional: 'jitterMode', conditionalValue: 'Static Mode' },
  { name: 'jitterMin', label: 'JitterMin(ms)', type: 'text', conditional: 'jitterMode', conditionalValue: 'Adaptive Mode' },
  { name: 'jitterDecreaseRatio', label: 'JitterDecreaseRatio(%)', type: 'text', conditional: 'jitterMode', conditionalValue: 'Adaptive Mode' },
  { name: 'jitterIncreaseMax', label: 'JitterIncreaseMax(ms)', type: 'text', conditional: 'jitterMode', conditionalValue: 'Adaptive Mode' },
  { name: 'ipOutputLevelControl', label: 'IP side output Level Control Mode', type: 'select', options: [
    { value: 'Manual', label: 'Manual' }
    
  ]},
  { name: 'voiceGainOutput', label: 'Voice Gain Output from IP(dB)', type: 'text' },
  { name: 'packTimeDefault', label: 'PackTime when negotiation fails is default value', type: 'select', options: [
    { value: 'Yes', label: 'Yes' },
    { value: 'No', label: 'No' },
  ]},
];

export const SIP_MEDIA_CODEC_FIELD = {
  name: 'codecSetting',
  label: 'Gateway Negotiation Coding Sequence',
  type: 'select',
  options: [
    { value: 'Default Priority', label: 'Default Priority' },
    { value: 'User Defined Priority', label: 'User Defined Priority'}
    
  ],
};

export const SIP_MEDIA_INITIAL_FORM = {
  dtmfTransmitMode: 'RFC2833',
  rfc2833Payload: '',
  rtpPortRange: '',
  silenceSuppression: 'Disable',
  noiseReduction: 'Enable',
  comfortNoise: 'Enable',
  jitterMode: 'Static Mode',
  jitterBuffer: '100',
  jitterUnderrunLead: '100',
  jitterOverrunLead: '50',
  jitterMin: '80',
  jitterDecreaseRatio: '50',
  jitterIncreaseMax: '30',
  ipOutputLevelControl: 'Manual',
  voiceGainOutput: '',
  packTimeDefault: 'Yes',
  codecSetting: 'Default Priority',
};

const SIP_MEDIA_UI_TO_API = {
  dtmfTransmitMode: "dtmf_transmit_mode",
  rfc2833Payload: "rfc2833_payload",
  rtpPortRange: "rtp_port_range",
  silenceSuppression: "slience_suppression",
  noiseReduction: "noise_reduction",
  comfortNoise: "comfort_noise_generation",
  jitterMode: "jitter_mode",
  jitterBuffer: "jitter_buffer_ms",
  jitterUnderrunLead: "jitter_under_run_lead_ms",
  jitterOverrunLead: "jitter_over_run_lead_ms",
  ipOutputLevelControl: "ip_side_output_level_control_mode",
  voiceGainOutput: "voice_gain_output_from_ip_db",
  packTimeDefault: "pack_time_when_nego_fail_default_value",
  codecSetting: "codec_seq_setting",
};

const sipFieldOpts = (field) => {
  if (!field.options) return "";
  const opts = field.options.map((o) =>
    typeof o === "object" ? o.value ?? o.label : o
  );
  return `Options: ${opts.join(", ")}.`;
};

const buildSipMediaTooltips = () => {
  const tooltips = {};
  [...SIP_MEDIA_FIELDS, SIP_MEDIA_CODEC_FIELD].forEach((field) => {
    const apiKey = SIP_MEDIA_UI_TO_API[field.name];
    const parts = [];
    if (apiKey) {
      parts.push(
        `Saved as ${apiKey} via updateMediaSettings (id: 1).`
      );
    } else {
      parts.push(
        "Shown in media settings form. Not sent in updateMediaSettings payload."
      );
    }
    const opts = sipFieldOpts(field);
    if (opts) parts.push(opts);
    if (field.conditional) {
      parts.push(`Conditionally shown based on ${field.conditional}.`);
    }
    tooltips[field.name] = parts.join("\n");
  });
  return tooltips;
};

/** SIP Media (SipMediaPage) — listMediaSettings / updateMediaSettings */
export const SIP_MEDIA_FIELD_TOOLTIPS = buildSipMediaTooltips();
