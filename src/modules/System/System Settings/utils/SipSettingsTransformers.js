import { SIP_SETTINGS_INITIAL_FORM } from "../../../../constants/SipSettingsConstants";

const toYesNo = (value) => {
  if (value === true || value === 1 || value === "1" || value === "yes") return "yes";
  return "no";
};

const toBool = (value) =>
  value === true || value === 1 || value === "1" || value === "yes";

const toPortString = (value, fallback) => {
  if (value === undefined || value === null || value === "") return fallback;
  return String(value);
};

const toPortNumber = (value) => {
  const n = Number(String(value ?? "").trim());
  return Number.isFinite(n) ? n : 0;
};

/** GET data → UI form */
export const mapTlsWebrtcApiToForm = (data = {}) => {
  const tls = data.tls || {};
  const webrtc = data.webrtc || {};

  return {
    ...SIP_SETTINGS_INITIAL_FORM,
    enableTls: toBool(tls.enabled),
    tlsSipPort: toPortString(tls.port, SIP_SETTINGS_INITIAL_FORM.tlsSipPort),
    tlsVersion: tls.tlsVersion || SIP_SETTINGS_INITIAL_FORM.tlsVersion,
    verifyClient: toYesNo(tls.verifyClient ?? "no"),
    requireClientCert: toYesNo(tls.requireClientCert ?? "no"),
    tlsBindAddress:
      tls.bindIp != null && tls.bindIp !== ""
        ? String(tls.bindIp)
        : SIP_SETTINGS_INITIAL_FORM.tlsBindAddress,
    enableWebrtc: toBool(webrtc.enabled),
    wsPort: toPortString(webrtc.wsPort, SIP_SETTINGS_INITIAL_FORM.wsPort),
    wssPort: toPortString(webrtc.wssPort, SIP_SETTINGS_INITIAL_FORM.wssPort),
    bindAddress:
      webrtc.bindIp != null && webrtc.bindIp !== ""
        ? String(webrtc.bindIp)
        : SIP_SETTINGS_INITIAL_FORM.bindAddress,
  };
};

/** UI form → POST body */
export const buildTlsWebrtcPayload = (form = {}) => ({
  tls: {
    enabled: Boolean(form.enableTls),
    port: toPortNumber(form.tlsSipPort),
    tlsVersion: form.tlsVersion || "TLSv1.2",
    bindIp: String(form.tlsBindAddress || "0.0.0.0").trim(),
    verifyClient: form.verifyClient === "yes" ? "yes" : "no",
    requireClientCert:
      form.verifyClient === "yes" && form.requireClientCert === "yes"
        ? "yes"
        : "no",
  },
  webrtc: {
    enabled: Boolean(form.enableWebrtc),
    wsPort: toPortNumber(form.wsPort),
    wssPort: toPortNumber(form.wssPort),
    bindIp: String(form.bindAddress || "0.0.0.0").trim(),
  },
});