import {
  SIP_MEDIA_FIELDS,
  SIP_MEDIA_INITIAL_FORM,
} from "../../../../constants/SipMediaConstants";

export const SIP_MEDIA_UI_TO_API = {
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

export const getSipMediaApiToUi = () => {
  const r = {};
  Object.entries(SIP_MEDIA_UI_TO_API).forEach(([u, a]) => {
    r[a] = u;
  });
  return r;
};

export const mergeSipMediaApiSettings = (settings, apiToUi) => {
  const next = { ...SIP_MEDIA_INITIAL_FORM };
  Object.entries(settings).forEach(([k, v]) => {
    const uiKey = apiToUi[k];
    if (!uiKey) return;
    next[uiKey] = v ?? next[uiKey];
  });
  return next;
};

export const buildSipMediaPayload = (formData) => {
  const payload = { id: 1 };
  Object.entries(SIP_MEDIA_UI_TO_API).forEach(([u, a]) => {
    payload[a] = formData[u] ?? null;
  });
  return payload;
};

export const isSipMediaFieldVisible = (field, formData) => {
  if (!field.conditional) return true;
  const condVal = formData[field.conditional];
  if (field.conditionalValues) {
    return field.conditionalValues.includes(condVal);
  }
  if (field.conditionalValue) {
    return condVal === field.conditionalValue;
  }
  return true;
};

const MEDIA_COLUMN_SPLIT_INDEX = Math.ceil(SIP_MEDIA_FIELDS.length / 2);
export const MEDIA_LEFT_COLUMN_FIELDS = SIP_MEDIA_FIELDS.slice(
  0,
  MEDIA_COLUMN_SPLIT_INDEX,
);
export const MEDIA_RIGHT_COLUMN_FIELDS = SIP_MEDIA_FIELDS.slice(
  MEDIA_COLUMN_SPLIT_INDEX,
);
