import {
  SIGNALING_CAPTURE_DEFAULTS,
  SIGNALING_CAPTURE_FALLBACK_NETWORK_OPTIONS,
  SIGNALING_CAPTURE_DATA_DIR,
  SIGNALING_CAPTURE_DATA_CAPTURE_PATTERN,
} from "../../../../constants/SignalingCaptureConstants";

export function extractCmdOutput(res) {
  return String(res?.responseData ?? res?.data ?? "").trim();
}

export function getDateStr() {
  return new Date().toISOString().split("T")[0].replace(/-/g, "_");
}

export function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function parsePcmIndex(pcm) {
  const n = parseInt(String(pcm).replace(/\D/g, ""), 10);
  return Number.isFinite(n) ? n : 0;
}

export function parseTsNumber(ts) {
  const n = parseInt(String(ts).replace(/\D/g, ""), 10);
  return Number.isFinite(n) ? n : 16;
}

export function dahdiChannelFromPcmTs(pcm, ts) {
  return parsePcmIndex(pcm) * 32 + parseTsNumber(ts);
}

export function emptySlotSessions() {
  return { ts: [null, null], e1: [null, null] };
}

export function getIpFromInterfaceData(data) {
  if (!data) return "";
  if (Array.isArray(data["IP Address"]) && data["IP Address"][0]) {
    return data["IP Address"][0];
  }
  if (Array.isArray(data["Ip Address"]) && data["Ip Address"][0]) {
    return data["Ip Address"][0];
  }
  if (Array.isArray(data["ip_address"]) && data["ip_address"][0]) {
    return data["ip_address"][0];
  }
  return "";
}

export function buildNetworkOptionsFromSystemInfo(data) {
  if (!data?.success || !data?.details) {
    return SIGNALING_CAPTURE_FALLBACK_NETWORK_OPTIONS;
  }

  const details = data.details;
  let rawInterfaces = [];

  if (Array.isArray(details.LAN_INTERFACES)) {
    rawInterfaces = details.LAN_INTERFACES;
  } else if (
    details.LAN_INTERFACES &&
    typeof details.LAN_INTERFACES === "object"
  ) {
    rawInterfaces = Object.entries(details.LAN_INTERFACES).map(
      ([name, ifaceData]) => ({ name, data: ifaceData }),
    );
  }

  const filteredInterfaces = (rawInterfaces || [])
    .filter((iface) => {
      const name = iface && iface.name ? String(iface.name) : "";
      const lower = name.toLowerCase();
      if (lower === "lo") return false;
      if (lower.startsWith("tap")) return false;
      if (lower.startsWith("tun")) return false;
      if (lower.includes("vpn")) return false;
      return true;
    })
    .map((iface) => {
      const name = iface.name;
      let displayName = name;
      const ipAddress = getIpFromInterfaceData(iface.data);

      if (name === "eth0") {
        displayName = "LAN 1";
      } else if (name === "eth1") {
        displayName = "LAN 2";
      }

      return {
        value: name,
        label: `${displayName}${ipAddress ? `(${ipAddress})` : ""}`,
        ip: ipAddress,
      };
    })
    .sort((a, b) => {
      const order = { eth0: 1, eth1: 2 };
      const aOrder = order[a.value] || 99;
      const bOrder = order[b.value] || 99;
      return aOrder - bOrder;
    });

  return [
    SIGNALING_CAPTURE_FALLBACK_NETWORK_OPTIONS[0],
    ...filteredInterfaces,
  ];
}

export function resolveCaptureInterfaceName(network) {
  if (network === SIGNALING_CAPTURE_DEFAULTS.NETWORK) {
    return "any";
  }
  if (network === "eth0" || network === "eth1") {
    return network;
  }
  return network;
}

export function getLanDisplayName(network) {
  if (network === SIGNALING_CAPTURE_DEFAULTS.NETWORK) {
    return SIGNALING_CAPTURE_FALLBACK_NETWORK_OPTIONS[0].label;
  }
  if (network === "eth0") return "LAN 1";
  if (network === "eth1") return "LAN 2";
  return network;
}

export function buildCaptureFileName(dateStr) {
  return `${SIGNALING_CAPTURE_DATA_DIR}/${SIGNALING_CAPTURE_DATA_CAPTURE_PATTERN}_${dateStr}.pcap`;
}

export function buildTcpdumpFilterExpr(syslogEnabled, syslogDest) {
  const dest = syslogDest.trim();
  if (syslogEnabled && dest) {
    return `host ${dest} and (udp port 514 or tcp port 514)`;
  }
  return "";
}

export function triggerBlobDownload(blob, downloadName) {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = downloadName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

export function assembleChunkedBinary(binaryParts) {
  const totalSize = binaryParts.reduce((sum, part) => sum + part.length, 0);
  const byteArray = new Uint8Array(totalSize);
  let offset = 0;
  for (const part of binaryParts) {
    byteArray.set(part, offset);
    offset += part.length;
  }
  return byteArray;
}

export function decodeBase64Chunk(chunkB64) {
  const raw = atob(chunkB64);
  const bytes = new Uint8Array(raw.length);
  for (let j = 0; j < raw.length; j++) bytes[j] = raw.charCodeAt(j);
  return bytes;
}

export function isAnySlotRecording(slotRecording) {
  return slotRecording.ts.some(Boolean) || slotRecording.e1.some(Boolean);
}

export function setSlotFlag(prev, section, row, value) {
  const next = { ...prev, [section]: [...prev[section]] };
  next[section][row] = value;
  return next;
}
