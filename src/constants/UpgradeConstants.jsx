// Table headers
export const UPGRADE_TABLE_HEADERS = [
  'Serial Number',
  'WEB',
  'Service',
  'Uboot',
  'Kernel',
  'Firmware',
];

// Example version data (can be replaced with real data)
export const UPGRADE_VERSION_DATA = [
  ['Serial Number', ''],
  ['WEB', '1.8.0_2024120914'],
  ['Service', '1.8.0_2024120914'],
  ['Uboot', '1.3.0_202404_clixxo'],
  ['Kernel', '#207 SMP PREEMPT Wed Sep 25 20:14:48 CST 2024'],
  ['Firmware', '0'],
];

// Field labels
export const UPGRADE_LABELS = {
  currentVersion: 'Current Version',
  selectFile: 'Select an Update File',
  noFile: 'No file chosen',
};

// Button labels
export const UPGRADE_BUTTON_LABELS = {
  UPDATE: 'Update',
  RESET: 'Reset',
  CHOOSE_FILE: 'Choose File',
};

export const UPGRADE_BUTTON_VARIANTS = {
  UPDATE: 'primary',
  RESET: 'cancel',
  CHOOSE_FILE: 'cancel',
};

export const UPGRADE_BUTTON_STYLE = {
  height: 30,
  minWidth: 100,
  fontSize: 12,
  borderRadius: 4,
  padding: '6px 14px',
};

export const UPGRADE_PAGE_TITLE = 'Upgrade';

export const UPGRADE_BREADCRUMB = [
  "Maintenance",
  "System Tools",
  UPGRADE_PAGE_TITLE,
];

export const UPGRADE_STATUS = {
  loading: "Loading...",
  unavailable: "Unavailable",
};

export const UPGRADE_BUTTON_STATUS = {
  uploading: "Uploading...",
  rebooting: "Rebooting...",
};

export const UPGRADE_TOOLTIPS = {
  serialNumber: "The serial number of the device.",
  webVersion: "The web version of the device.",
  service: "The service of the device.",
  uboot: "The uboot of the device.",
  kernel: "The kernel of the device.",
  firmware: "The firmware of the device.",
};

export const UPGRADE_MESSAGES = {
  invalidResponse: "Invalid response",
  parseFailed: "Failed to parse version data",
  loadVersionFailed: "Failed to load current version details.",
  selectFileRequired: "Please select a .tar update package to upload.",
  tarOnly: "Only .tar update packages are supported.",
  uploadFailed: "Failed to upload update package.",
  uploadSuccess: "Update package uploaded successfully.",
  uploading: "Uploading update package...",
  preparingReboot:
    "Update uploaded successfully. Preparing to reboot in a few seconds...",
  initiatingReboot: "Update uploaded. Initiating reboot...",
  rebootingWait: "Device is rebooting. Waiting for it to come back online...",
  backOnline: "Device is back online. Redirecting to login...",
  deviceOfflineTimeout:
    "Device did not come back online. Please verify manually.",
  rebootingPleaseWait: "Device is rebooting. Please wait...",
};

export const UPGRADE_TIMINGS = {
  alertHideMs: 5000,
  pingTimeoutMs: 4000,
  pingIntervalMs: 5000,
  rebootDelayMs: 5000,
  redirectDelayMs: 3000,
  preRebootWaitMs: 4500,
  maxPingAttempts: 60,
};

export const UPGRADE_FILE = {
  tarRegex: /\.tar$/i,
};

export const UPGRADE_COMMANDS = {
  readVersion: "cat /home/clixxo/server/config/web_version.json",
  reboot: "reboot",
};

export const UPGRADE_ROUTES = {
  login: "/login",
};

export const UPGRADE_API = {
  servicePing: "/service-ping",
};
