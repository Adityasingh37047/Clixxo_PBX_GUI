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

const formatCertDate = (value) => {
  if (value == null || value === "") return "";
  const raw = String(value).trim();
  // Already a calendar date — keep as-is (avoid UTC day shift).
  const dateOnly = raw.match(/^(\d{4}-\d{2}-\d{2})/);
  if (dateOnly) return dateOnly[1];

  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return raw;

  // Local calendar date — do not use toISOString() (UTC can move the day back).
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

const normalizeCoverEntry = (entry) => {
  if (entry == null || entry === "") return null;
  if (typeof entry === "string") {
    return { label: entry, isVirtualIp: false };
  }
  const label =
    entry.label ||
    entry.name ||
    entry.value ||
    entry.host ||
    entry.ip ||
    "";
  if (!label) return null;
  return {
    label: String(label),
    isVirtualIp: Boolean(
      entry.isVirtualIp ||
        entry.virtualIp ||
        entry.virtual_ip ||
        entry.type === "virtual_ip" ||
        entry.type === "vip",
    ),
  };
};

/** API certificate object → display model for CURRENT CERTIFICATE panel */
export const mapCertificateInfoToView = (certInfo) => {
  if (!certInfo || typeof certInfo !== "object") return null;

  const present =
    certInfo.present === true ||
    certInfo.uploaded === true ||
    certInfo.hasCertificate === true ||
    Boolean(certInfo.subject || certInfo.cn || certInfo.validFrom || certInfo.notBefore);

  if (!present) return null;

  let subject = certInfo.subject ? String(certInfo.subject) : "";
  if (!subject && certInfo.cn) {
    subject = String(certInfo.cn).includes("=")
      ? String(certInfo.cn)
      : `CN = ${certInfo.cn}`;
  }

  const validFrom = formatCertDate(
    certInfo.validFrom ?? certInfo.notBefore ?? certInfo.valid_from,
  );
  const validTo = formatCertDate(
    certInfo.validTo ?? certInfo.notAfter ?? certInfo.valid_to,
  );

  const rawCovers =
    certInfo.covers ??
    certInfo.sans ??
    certInfo.altNames ??
    certInfo.alt_names ??
    certInfo.subjectAltNames ??
    [];

  let covers = [];
  if (Array.isArray(rawCovers)) {
    covers = rawCovers.map(normalizeCoverEntry).filter(Boolean);
  } else if (typeof rawCovers === "string" && rawCovers.trim()) {
    covers = rawCovers
      .split(/[,;\n]+/)
      .map((s) => normalizeCoverEntry(s.trim()))
      .filter(Boolean);
  }

  if (!covers.length && certInfo.coverList && Array.isArray(certInfo.coverList)) {
    covers = certInfo.coverList.map(normalizeCoverEntry).filter(Boolean);
  }

  return {
    subject: subject || null,
    validFrom,
    validTo,
    covers,
  };
};