export const SIGNALING_CALL_TRACK_TITLE = 'Signaling Call Track';
export const SIGNALING_CALL_TRACK_CARD_TITLE = SIGNALING_CALL_TRACK_TITLE;
export const SIGNALING_CALL_TRACK_SECTION_CONFIG = 'Track Configuration';
export const SIGNALING_CALL_TRACK_SECTION_OUTPUT = 'Track Message';
export const SIGNALING_CALL_TRACK_OUTPUT_PLACEHOLDER =
  'Track messages will appear here after you start tracking.';
export const SIGNALING_CALL_TRACK_SECTION_HEADING_COLOR = '#30415A';
export const SIGNALING_CALL_TRACK_FORM_PAD_X = 28;
export const SIGNALING_CALL_TRACK_LABEL_COL_WIDTH = 188;
export const SIGNALING_CALL_TRACK_FIELD_COL_GAP = 16;

export const SIGNALING_CALL_TRACK_RADIO_OPTIONS = [
  { value: 'caller', label: 'Filter CallerID' },
  { value: 'callee', label: 'Filter CalleeID' },
  { value: 'none', label: 'Filter None' },
];

export const SIGNALING_CALL_TRACK_LABELS = {
  filterType: 'Filter Type:',
  filterValue: 'Filter Value:',
  trackMessage: 'Track Message',
};

export const SIGNALING_CALL_TRACK_BUTTON_LABELS = {
  START: 'Start',
  STOP: 'Stop',
  FILTER: 'Filter',
  CLEAR: 'Clear',
  DOWNLOAD: 'Download',
  STARTING: 'Starting...',
  STOPPING: 'Stopping...',
};

export const SIGNALING_CALL_TRACK_BUTTON_VARIANTS = {
  PRIMARY: 'primary',
  CANCEL: 'cancel',
};

export const SIGNALING_CALL_TRACK_BUTTON_STYLE = {
  minWidth: 100,
  height: 30,
  fontSize: 12,
  borderRadius: 4,
  padding: '6px 14px',
};

export const SIGNALING_CALL_TRACK_LOG_CANDIDATES = [
  '/var/log/asterisk/messages',
  '/var/log/asterisk/full',
];

export const SIGNALING_CALL_TRACK_POLL_MS = 2000;

export const SIGNALING_CALL_TRACK_MESSAGES = {
  START_SUCCESS: 'Call track started.',
  START_FAILED: 'Failed to start call track.',
  STOP_SUCCESS: 'Call track stopped.',
  STOP_FAILED: 'Failed to stop call track.',
  FILTER_CLEARED: 'Filter cleared. Showing all messages.',
  FILTER_APPLIED: (type, value) => `Filter applied (${type}: ${value}).`,
  CLEAR_SUCCESS: 'Track message cleared.',
  DOWNLOAD_EMPTY: 'No track message to download.',
  DOWNLOAD_SUCCESS: 'Track message downloaded.',
};

export const SIGNALING_CALL_TRACK_ASTERISK_COMMANDS = {
  LOGGER_ON: 'pjsip set logger on',
  LOGGER_OFF: 'pjsip set logger off',
};

export const SIGNALING_CALL_TRACK_LINUX_COMMANDS = {
  CHECK_READABLE: (path) => `test -r '${path}' && echo OK || echo NO`,
  GET_LINE_COUNT: (path) => `wc -l < '${path}' 2>/dev/null || echo 0`,
  TAIL_LINES: (count, path) => `tail -n ${count} '${path}' 2>/dev/null`,
};

export const SIGNALING_CALL_TRACK_CMD_RESULTS = {
  OK: 'OK',
  NO: 'NO',
};

export const SIGNALING_CALL_TRACK_TOAST_DEFAULT = {
  msg: '',
  type: 'success',
};

export const SIGNALING_CALL_TRACK_TOAST_DURATION_MS = 3500;

export const SIGNALING_CALL_TRACK_BREADCRUMB = [
  'Maintenance',
  'System Tools',
  SIGNALING_CALL_TRACK_TITLE,
];

export const SIGNALING_CALL_TRACK_TRACE_HEADERS = {
  TITLE: SIGNALING_CALL_TRACK_TITLE,
};

export const SIGNALING_CALL_TRACK_TOOLTIPS = {
  filterType: 'Specifies the filter type.',
  filterValue: 'Specifies the filter value.',
  trackMessage: 'Displays signaling track messages.',
};
