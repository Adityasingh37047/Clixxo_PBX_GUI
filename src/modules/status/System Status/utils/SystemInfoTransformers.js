import {
  SYSTEM_INFO_LAN_NAME_MAP,
  SYSTEM_INFO_LAN_SORT_ORDER,
} from "../../../../constants/SystemInfoConstants";

const parsePercent = (value) => {
  if (value === null || value === undefined || value === "") return 0;
  if (typeof value === "number") return value;
  const n = parseFloat(String(value).replace("%", "").trim());
  return Number.isNaN(n) ? 0 : n;
};

const formatHumanPair = (used, total) => {
  const usedHuman = used?.human;
  const totalHuman = total?.human;
  if (usedHuman == null && totalHuman == null) return null;
  return `${usedHuman ?? "—"} / ${totalHuman ?? "—"}`;
};

/** Build System Resources view-model from /system-info details. */
export const mapSystemResourcesFromDetails = (details = {}) => {
  const cpu = details.CPU_INFO || {};
  const mem = details.MEMORY_INFO || {};
  const ram = mem.ram || {};
  const swap = mem.swap || {};
  const systemInfo = details.SYSTEM_INFO || [];

  const runtimeItem = systemInfo.find((item) => item.label === "Runtime");

  const speedMhz = cpu.speedMHz;
  const memoryUsage = formatHumanPair(ram.used, ram.total);
  const swapUsage = formatHumanPair(swap.used, swap.total);

  return {
    cpuPercent: cpu.usage ?? null,
    ramPercent: ram.used_pct ?? null,
    swapPercent: swap.used_pct ?? null,
    cpuInfo: cpu.model ?? null,
    uptime: runtimeItem?.value ?? null,
    cpuSpeed:
      speedMhz != null && speedMhz !== ""
        ? `${speedMhz} MHz`
        : null,
    memoryUsage:
      memoryUsage && swapUsage
        ? `RAM: ${memoryUsage}  SWAP: ${swapUsage}`
        : memoryUsage || swapUsage
          ? `RAM: ${memoryUsage ?? "— / —"}  SWAP: ${swapUsage ?? "— / —"}`
          : null,
  };
};

/** Build Hard Drives view-model from /system-info DISK_INFO. */
export const mapHardDrivesFromDetails = (details = {}) => {
  const disk = details.DISK_INFO || {};

  return {
    usedPercent: disk.used_pct ?? null,
    availablePercent:
      disk.used_pct != null && disk.used_pct !== ""
        ? Math.max(0, Math.min(100, 100 - parsePercent(disk.used_pct)))
        : null,
    capacity: disk.total?.human ?? null,
    usedSpace: disk.used?.human ?? null,
    availableSpace: disk.available?.human ?? null,
    mountPoint: disk.mountPoint ?? null,
  };
};

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
      if (lower.startsWith("tap")) return false;
      if (lower.startsWith("tun")) return false;
      if (lower.includes("vpn")) return false;
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
