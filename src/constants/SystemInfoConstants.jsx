export const SYSTEM_INFO_TITLE = "System Info";

export const SYSTEM_INFO_BREADCRUMB_SEGMENTS = [
  "Status",
  "System Status",
  "System Info",
];

export const SYSTEM_INFO_REFRESH_INTERVAL_MS = 5000;

export const SYSTEM_INFO_STAT_LABELS = {
  runtime: "RUNTIME",
  cpuUsage: "CPU USAGE",
  memoryUsage: "MEMORY USAGE",
  packetLoss: "PACKET LOSS (RX)",
};

export const SYSTEM_INFO_CARD_TITLES = {
  versionInfo: "Version Info",
  systemDetails: "System Details",
  storageDetails: "Storage Details",
  systemResources: "System Resources",
  hardDrives: "Hard Drives",
};

export const SYSTEM_INFO_RESOURCE_LABELS = {
  cpu: "CPU",
  ram: "RAM",
  swap: "SWAP",
  cpuInfo: "CPU Info",
  uptime: "Uptime",
  cpuSpeed: "CPU Speed",
  memoryUsage: "Memory usage",
  used: "Used",
  available: "Available",
  hardDiskCapacity: "Hard Disk Capacity",
  mountPoint: "Mount Point",
  availableSpace: "Available Space",
};

export const SYSTEM_INFO_RESOURCE_COLORS = {
  gaugeUsed: "#b4e33d",
  gaugeTrack: "#e5e7eb",
  diskUsed: "#3184d5",
  diskAvailable: "#6e407e",
  bodyText: "#4b5563",
  valueText: "#374151",
  gaugeGreen: "#16A34A",
gaugeYellow: "#EAB308",
gaugeOrange: "#EA580C",
gaugeRed: "#DC2626",
};

/** Usage thresholds for CPU / RAM / SWAP circular progress colors. */
export const SYSTEM_INFO_USAGE_GAUGE_THRESHOLDS = {
  cpu: [
    { max: 50, color: "gaugeGreen" },
    { max: 70, color: "gaugeYellow" },
    { max: 85, color: "gaugeOrange" },
    { max: 100, color: "gaugeRed" },
  ],
  ram: [
    { max: 60, color: "gaugeGreen" },
    { max: 80, color: "gaugeYellow" },
    { max: 90, color: "gaugeOrange" },
    { max: 100, color: "gaugeRed" },
  ],
  swap: [
    { max: 10, color: "gaugeGreen" },
    { max: 30, color: "gaugeYellow" },
    { max: 60, color: "gaugeOrange" },
    { max: 100, color: "gaugeRed" },
  ],
};

export const SYSTEM_INFO_LAN_NAME_MAP = {
  eth0: "LAN 1",
  eth1: "LAN 2",
};

export const SYSTEM_INFO_LAN_SORT_ORDER = {
  "LAN 1": 1,
  "LAN 2": 2,
};
