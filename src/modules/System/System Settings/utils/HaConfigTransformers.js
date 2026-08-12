import { HA_CONFIG_INITIAL_FORM } from "../../../../constants/HaConfigConstants";

const toUiMode = (mode) => {
  const raw = String(mode || "").trim().toLowerCase();
  if (raw === "backup") return "Backup";
  if (raw === "primary") return "Primary";
  return HA_CONFIG_INITIAL_FORM.mode;
};

const toHaEnabled = (value) => {
  if (typeof value === "boolean") return value;
  const raw = String(value ?? "").trim().toLowerCase();
  return raw === "yes" || raw === "true" || raw === "1";
};

export const mapHaConfigApiToForm = (api = {}) => ({
  haEnabled: toHaEnabled(api.enabled),
  virtualIp: api.vip || "",
  interface: api.configured === false ? "" : api.iface || "",
  mode: toUiMode(api.mode),
  peerServerIp: api.peer || "",
  autoFailback: Boolean(api.autoFailback),
});

export const buildHaConfigPayload = (form = {}) => ({
  enabled: Boolean(form.haEnabled),
  vip: String(form.virtualIp || "").trim(),
  mode: String(form.mode || "Primary").toLowerCase(),
  iface: String(form.interface || "").trim(),
  peer: String(form.peerServerIp || "").trim(),
  autoFailback: Boolean(form.autoFailback),
});

export const getHaConfigErrorMessage = (error, fallback) => {
  const status = error?.response?.status;
  const data = error?.response?.data;

  if (status === 409 || data?.busy) {
    return data?.message || data?.error || fallback;
  }

  const message = data?.message || data?.error || error?.message || "";
  const text = String(message).trim();
  if (!text) return fallback;
  if (text.includes("<")) return fallback;
  return text;
};
