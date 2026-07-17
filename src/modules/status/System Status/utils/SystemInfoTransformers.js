import {
  SYSTEM_INFO_LAN_NAME_MAP,
  SYSTEM_INFO_LAN_SORT_ORDER,
  SYSTEM_INFO_STORAGE_DETAIL_ROW_DEFS,
} from "../../../../constants/SystemInfoConstants";
import { STORAGE_DEVICE_LOCAL_DISK } from "../../../../constants/StorageConstants";

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

/** Prefer API-mapped rows; otherwise show label rows with empty values for layout. */
export const resolveStorageDetailRows = (rowsFromApi) => {
  if (Array.isArray(rowsFromApi) && rowsFromApi.length > 0) {
    return rowsFromApi;
  }
  return SYSTEM_INFO_STORAGE_DETAIL_ROW_DEFS.map(({ label }) => ({
    label,
    value: "",
  }));
};

/**
 * Maps Storage Settings get_usage payload to System Info row shape.
 * Wire via setSTORAGE_DETAILS when the API is integrated.
 */
export const mapStorageUsageToDetailRows = (data) => {
  const disk = data?.disk;
  if (!disk) return [];

  const labelByKey = Object.fromEntries(
    SYSTEM_INFO_STORAGE_DETAIL_ROW_DEFS.map(({ key, label }) => [key, label]),
  );

  const usedPct = disk.used_pct;
  const usageValue =
    usedPct !== undefined && usedPct !== null && usedPct !== ""
      ? `${usedPct}%`
      : "";

  return [
    { label: labelByKey.storage, value: STORAGE_DEVICE_LOCAL_DISK },
    { label: labelByKey.totalCapacity, value: disk.total?.human ?? "" },
    { label: labelByKey.usedSpace, value: disk.used?.human ?? "" },
    { label: labelByKey.availableSpace, value: disk.avail?.human ?? "" },
    { label: labelByKey.usage, value: usageValue },
  ];
};
