// Radio options
export const SCTRACK_RADIO_OPTIONS = [
  { value: 'caller', label: 'Filter CallerID' },
  { value: 'callee', label: 'Filter CalleeID' },
  { value: 'none', label: 'Filter None' },
];

// Field labels
export const SCTRACK_LABELS = {
  filterValue: '', // No label, just input box
  trackMessage: 'Track Message',
};

// Button labels
export const SCTRACK_BUTTONS = {
  start: 'Start',
  stop: 'Stop',
  filter: 'Filter',
  clear: 'Clear',
  download: 'Download',
};

export const SCTRACK_LOG_CANDIDATES = [
  '/var/log/asterisk/messages',
  '/var/log/asterisk/full',
];

export const SCTRACK_POLL_MS = 2000;

export const SCTRACK_MESSAGES = {
  START_SUCCESS: "Call track started.",
  START_FAILED: "Failed to start call track.",
  STOP_SUCCESS: "Call track stopped.",
  STOP_FAILED: "Failed to stop call track.",

  FILTER_CLEARED: "Filter cleared. Showing all messages.",
  FILTER_APPLIED: (type, value) =>
    `Filter applied (${type}: ${value}).`,

  CLEAR_SUCCESS: "Track message cleared.",

  DOWNLOAD_EMPTY: "No track message to download.",
  DOWNLOAD_SUCCESS: "Track message downloaded.",
};

export const SCTRACK_ASTERISK_COMMANDS = {
  LOGGER_ON: "pjsip set logger on",
  LOGGER_OFF: "pjsip set logger off",
};


export const SCTRACK_LINUX_COMMANDS = {
  CHECK_READABLE: (path) =>
    `test -r '${path}' && echo OK || echo NO`,

  GET_LINE_COUNT: (path) =>
    `wc -l < '${path}' 2>/dev/null || echo 0`,

  TAIL_LINES: (count, path) =>
    `tail -n ${count} '${path}' 2>/dev/null`,
};

export const SCTRACK_CMD_RESULTS = {
  OK: "OK",
  NO: "NO",
};

export const SCTRACK_DEFAULT_TOAST = {
  msg: "",
  type: "success",
};

export const SCTRACK_TOAST_DURATION = 3500;

export const SCTRACK_BREADCRUMB = [
  "Maintenance",
  "System Tool",
  "Signaling Call Track",
];

export const SCTRACK_TRACE_HEADERS = {
  title: SCTRACK_BREADCRUMB[2],
};
export const SCTRACK_TOOLTIPS = {
  FILTER_TYPE: "Specifies the filter type.",
  FILTER_VALUE: "Specifies the filter value.",
  TRACK_MESSAGE: "Specifies the track message.",
};

