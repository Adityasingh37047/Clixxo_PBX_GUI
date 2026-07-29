import { SIP_SETTINGS_INITIAL_FORM } from "../../../../constants/SipSettingsConstants";

export const SIP_SETTINGS_UI_TO_API = {
  enableTls: "tls_enable",
  tlsSipPort: "sip_tls_signaling_port",
  tlsVersion: "sip_tls_version",
  enableWebrtc: "webrtc_enable",
  wsPort: "webrtc_ws_port",
  wssPort: "webrtc_wss_port",
  bindAddress: "webrtc_bind_address",
};

const WEBRTC_API_ALIASES = {
  webrtc_ws_port: ["ws_port", "webrtc_ws_port"],
  webrtc_wss_port: ["wss_port", "webrtc_wss_port"],
  webrtc_bind_address: ["bind_address", "webrtc_bind_address"],
  webrtc_enable: ["webrtc_enable"],
};

const getApiValue = (settings, apiKey) => {
  if (settings[apiKey] !== undefined && settings[apiKey] !== null) {
    return settings[apiKey];
  }
  const aliases = WEBRTC_API_ALIASES[apiKey];
  if (!aliases) return undefined;
  for (const alias of aliases) {
    if (settings[alias] !== undefined && settings[alias] !== null) {
      return settings[alias];
    }
  }
  return undefined;
};

export const mapSipSettingsApiToForm = (settings = {}) => {
  const next = { ...SIP_SETTINGS_INITIAL_FORM };
  const apiToUi = Object.fromEntries(
    Object.entries(SIP_SETTINGS_UI_TO_API).map(([ui, api]) => [api, ui]),
  );

  Object.entries(SIP_SETTINGS_UI_TO_API).forEach(([uiKey, apiKey]) => {
    const value = getApiValue(settings, apiKey);
    if (value === undefined || value === null) return;

    if (uiKey === "enableTls" || uiKey === "enableWebrtc") {
      next[uiKey] = value === "1" || value === 1 || value === true;
      return;
    }

    next[uiKey] = String(value);
  });

  Object.entries(settings).forEach(([apiKey, value]) => {
    const uiKey = apiToUi[apiKey];
    if (!uiKey || value === undefined || value === null) return;
    if (uiKey === "enableTls" || uiKey === "enableWebrtc") {
      next[uiKey] = value === "1" || value === 1 || value === true;
    } else {
      next[uiKey] = String(value);
    }
  });

  return next;
};

export const buildSipSettingsPayload = (form) => {
  const settingsPayload = { id: 1 };

  Object.entries(SIP_SETTINGS_UI_TO_API).forEach(([uiKey, apiKey]) => {
    const value = form[uiKey];
    if (uiKey === "enableTls" || uiKey === "enableWebrtc") {
      settingsPayload[apiKey] = value ? "1" : null;
    } else {
      settingsPayload[apiKey] = value?.trim?.() ? value.trim() : null;
    }
  });

  return settingsPayload;
};
