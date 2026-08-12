export const normalizeHaStatusNode = (node = {}) => ({
  enabled: node.enabled ?? "",
  role: node.role ?? "",
  mode: node.mode ?? "",
  vip: node.vip ?? "",
  interface: node.interface ?? "",
  peer: node.peer ?? "",
  peerStatus:
    typeof node.peer_status === "string"
      ? node.peer_status
      : typeof node.peerStatus === "string"
        ? node.peerStatus
        : "",
  keepalived: node.keepalived ?? "",
  asterisk: node.asterisk ?? "",
  health: node.health ?? "",
  replication: node.replication ?? "",
  replicationLag: node.replicationLag ?? node.replication_lag ?? null,
  vpn: node.vpn ?? "",
  certificate: node.certificate ?? "",
  contacts: node.contacts ?? "",
  trunks: node.trunks ?? "",
  maintenance: node.maintenance,
  lastChange: node.lastChange ?? node.last_change ?? "",
});

export const normalizeHaPeerStatus = (api = {}) => ({
  reachable: Boolean(api.reachable),
  peer: api.peer ?? "",
  error: api.error || "",
  status: normalizeHaStatusNode(api.status || {}),
});

export const isHaStatusEnabled = (node = {}) =>
  String(node.enabled || "").toLowerCase() === "yes";

export const getHaStatusErrorMessage = (error, fallback) => {
  const status = error?.response?.status;
  const data = error?.response?.data;

  if (typeof data === "string" && data.trim()) {
    return data.trim();
  }

  if (status === 409 || data?.busy) {
    return data?.message || data?.error || fallback;
  }

  const message = data?.message || data?.error || error?.message || "";
  const text = String(message).trim();
  if (!text) return fallback;
  if (/<html/i.test(text)) return fallback;
  return text;
};

export const formatHaCommandOutput = (command, body) => {
  const timestamp = new Date().toLocaleString();
  const text = String(body || "").replace(/\s+$/, "");
  return `[${timestamp}] $ ${command}\n${text}\n${"=".repeat(80)}\n`;
};

export const formatHaPhoneCheckOutput = (res = {}) => {
  const lines = [];
  if (res.message) lines.push(String(res.message));
  if (res.split_brain) lines.push("split_brain: true");
  if (res.bypassing_vip) lines.push("bypassing_vip: true");
  if (Array.isArray(res.servers)) {
    res.servers.forEach((server) => {
      const name = server?.name || "server";
      const role = server?.role ? ` (${server.role})` : "";
      const contacts =
        server?.contacts === undefined || server?.contacts === null
          ? ""
          : `: ${server.contacts} contact(s)`;
      lines.push(`${name}${role}${contacts}`);
    });
  }
  return lines.join("\n") || JSON.stringify(res, null, 2);
};

export const assertHaApiOk = (res, fallback) => {
  if (res?.response === false) {
    throw new Error(res?.message || res?.error || fallback);
  }
  return res || {};
};
