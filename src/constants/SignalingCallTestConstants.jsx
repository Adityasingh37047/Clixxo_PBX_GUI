// Section title
export const SCT_TITLE = 'Signaling Call Test';

// Field labels
export const SCT_LABELS = {
  testType: 'Test Type',
  trunkGroup: 'SIP Trunk Group No.',
  callerId: 'CallerID',
  calledId: 'CalledID',
  originalCallee: 'Original CalleeID/Redirecting Number',
};

// Dropdown options
export const SCT_TEST_TYPE_OPTIONS = [
  { value: 'ip-pstn', label: 'IP->PSTN' },
  { value: 'pstn-ip', label: 'PSTN->IP' },
];
export const SCT_TRUNK_GROUP_OPTIONS = [
  { value: 'group0', label: 'SIP Trunk Group[0]' },
  { value: 'group1', label: 'SIP Trunk Group[1]' },
];

export const SCT_LOG_CANDIDATES = [
  '/var/log/asterisk/messages',
  '/var/log/asterisk/full',
];

export const SCT_POLL_MS = 2000;
export const SCT_POLL_DURATION_MS = 20000;

// Button labels
export const SCT_BUTTONS = {
  start: 'Start',
  clear: 'Clear',
};

// Trace label
export const SCT_TRACE_LABEL = 'Signaling Trace';

export const SCT_MESSAGES = {
  calledIdRequired: 'CalledID is required to start the test.',
  signalingFinished: 'Signaling call test finished.',
  signalingStarted: 'Signaling call test started.',
  startFailed: 'Failed to start signaling call test.',
  originateFailed: 'Originate failed.',
  originateRequestSent: 'Originate request sent.',
  formCleared: 'Form and trace cleared.',
  sendingOriginate: 'Sending test originate request...',
  captureEnded: '=== Test capture ended ===',
  unknownError: 'Unknown error',
  failedToStartTest: 'Failed to start test.',
  starting: 'Starting...',
};
export const SCT_TOOLTIPS = {
  testType: 'Specifies the test type.',
  trunkGroup: 'Specifies the SIP trunk group.',
  callerId: 'Specifies the caller ID.',
  calledId: 'Specifies the called ID.',
  originalCallee: 'Specifies the original callee ID.',
  trace: 'Displays signaling trace information.',
};
export const SCT_BREADCRUMBS = [
  'Maintenance',
  'System Tool',
  SCT_TITLE,
];
export const SCT_DEFAULTS = {
  toast: {
    msg: '',
    type: 'success',
  },

  toastTimeout: 3500,
};
export const SCT_COMMANDS = {
  loggerOn: 'pjsip set logger on',
  loggerOff: 'pjsip set logger off',

  checkReadable: (path) =>
    `test -r '${path}' && echo OK || echo NO`,

  countLines: (path) =>
    `wc -l < '${path}' 2>/dev/null || echo 0`,

  tailLines: (count, path) =>
    `tail -n ${count} '${path}' 2>/dev/null`,
};

export const SCT_LOG_MESSAGES = {
  pollError: 'Signaling call test poll error:',
  trunkLoadError: 'Failed to load SIP trunk groups:',
  signalingError: 'Signaling call test error:',
};

export const SCT_TRACE_HEADERS = {
  title: SCT_TITLE,
  time: 'Time',
  testType: 'Test Type',
  trunkGroup: 'SIP Trunk Group',
  callerId: 'CallerID',
  calledId: 'CalledID',
  originalCallee: 'Original CalleeID',
  empty: '(empty)',
};