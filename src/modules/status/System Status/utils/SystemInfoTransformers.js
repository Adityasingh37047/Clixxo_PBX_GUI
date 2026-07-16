import {
  SYSTEM_INFO_LAN_NAME_MAP,
  SYSTEM_INFO_LAN_SORT_ORDER,
} from "../../../../constants/SystemInfoConstants";

export const extractRawLanInterfaces = (details = {}) => {
  let rawInterfaces = [];

  if (Array.isArray(details.LAN_INTERFACES)) {
    rawInterfaces = details.LAN_INTERFACES;
  } else if (
    details.LAN_INTERFACES &&
    typeof details.LAN_INTERFACES === "object"
  ) {
    rawInterfaces = Object.entries(details.LAN_INTERFACES).map(
      ([name, data]) => ({ name, data }),
    );
  } else if (Array.isArray(details.interfaces)) {
    rawInterfaces = details.interfaces;
  } else if (details.network && Array.isArray(details.network.interfaces)) {
    rawInterfaces = details.network.interfaces;
  }

  return rawInterfaces;
};

export const filterAndNormalizeLanInterfaces = (rawInterfaces) =>
  (rawInterfaces || [])
    .filter((iface) => {
      const name = iface && iface.name ? String(iface.name) : "";
      const lower = name.toLowerCase();
      if (lower === "lo") return false;
      if (lower.startsWith("tap")) return false; // e.g., tap0
      if (lower.startsWith("tun")) return false; // e.g., tun0
      if (lower.includes("vpn")) return false; // e.g., openvpn
      return true;
    })
    .map((iface) => {
      if (iface.name === "eth0") {
        return { ...iface, name: SYSTEM_INFO_LAN_NAME_MAP.eth0 };
      }
      if (iface.name === "eth1") {
        return { ...iface, name: SYSTEM_INFO_LAN_NAME_MAP.eth1 };
      }
      return iface;
    })
    .sort((a, b) => {
      const aOrder = SYSTEM_INFO_LAN_SORT_ORDER[a.name] || 99;
      const bOrder = SYSTEM_INFO_LAN_SORT_ORDER[b.name] || 99;
      return aOrder - bOrder;
    });

export const updateVersionEntry = (versionInfo, label, value) => {
  const displayValue = value && value !== "" ? value : "Unavailable";
  const idx = (versionInfo || []).findIndex((item) => item.label === label);
  if (idx >= 0) {
    const next = [...(versionInfo || [])];
    next[idx] = { ...next[idx], value: displayValue };
    return next;
  }
  return [...(versionInfo || []), { label, value: displayValue }];
};

export const parseWebVersionPayload = (responseData) => {
  const parsedJson = JSON.parse(responseData || "{}");
  return parsedJson || null;
};

export const parseAstLicenseSerial = (responseData) => {
  const out = String(responseData || "");
  const lines = out.split(/\r?\n/);
  const astLicLine =
    lines.find((l) => l.trim().toLowerCase().startsWith("astlic:")) || "";
  if (!astLicLine) return "";
  const afterColon = astLicLine.split(":").slice(1).join(":");
  const fields = afterColon.split(",").map((s) => s.trim());
  if (fields.length >= 2 && fields[1]) {
    return fields[1];
  }
  return "";
};

export const getSystemInfoMetric = (systemInfo, keywords) => {
  const item = (systemInfo || []).find((i) =>
    keywords.some((k) =>
      (i.label || "").toLowerCase().includes(k.toLowerCase()),
    ),
  );
  return item?.value ?? null;
};
