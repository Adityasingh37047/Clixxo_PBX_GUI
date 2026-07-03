export const RESTART_SECTIONS = [
  {
    key: 'service',
    title: 'Service Restart',
    instruction: "Click the button 'Restart' to restart the service.",
  },
  {
    key: 'system',
    title: 'System Restart',
    instruction: "Click the button 'Restart' to restart the system.",
  },
];

export const RESTART_BUTTON_LABEL = 'Restart';

export const RESTART_TITLE = 'Restart';

export const RESTART_BREADCRUMB = [
  "Maintenance",
  "System Tool",
  RESTART_TITLE,
];

export const RESTART_CONFIRM = {
  system: "Are you sure you want to restart the System?",
  service: "Are you sure you want to restart this Service?",
};

export const RESTART_MESSAGES = {
  systemRestarting: "System is restarting...",
  waitingOnline: "Waiting for device to come back online...",
  backOnline: "Device is back online. Redirecting to login...",
  deviceOffline:
    "Device did not come back online. Please check your network or try again later.",
  deviceInfoFailed:
    "Failed to get device info or start restart. Please try again.",
  systemRestartFailed: "Failed to initiate system restart.",
  permissionDenied: "Permission denied.",
  endpointNotFound: "Restart endpoint not found.",
  restartingService: "Restarting service...",
  serviceRestartingOverlay: "Service is restarting...",
  serviceRestartSuccess: "Service restart successful",
  serviceRestartFailed: "Failed to restart service.",
  serviceRestartTimeout: "Service restart timed out. Please try again.",
  serviceRestartServerError:
    "Server error during service restart. Please try again later.",
  serverNotConnected: "Server is not connected. Please check your connection.",
};

export const RESTART_DEFAULT_TOAST = {
  msg: "",
  type: "success",
};

export const RESTART_TOAST_DURATION = 3500;

export const RESTART_ERROR_HIDE_MS = 5000;

export const RESTART_TIMINGS = {
  pingTimeoutMs: 7000,
  pollInitialDelayMs: 5000,
  pollIntervalMs: 5000,
  maxPollAttempts: 48,
  redirectDelayMs: 3000,
};

export const RESTART_API = {
  servicePingPath: "/api/service-ping",
};

export const RESTART_ROUTES = {
  login: "/login",
};

export const RESTART_NETWORK_ERRORS = {
  networkError: "Network Error",
  failedToFetch: "Failed to fetch",
  timeout: "timeout",
};

export const RESTART_CONNECTION_CODES = {
  ECONNRESET: "ECONNRESET",
  ETIMEDOUT: "ETIMEDOUT",
  ECONNABORTED: "ECONNABORTED",
};
