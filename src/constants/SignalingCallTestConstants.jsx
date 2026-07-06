export const SIGNALING_CALL_TEST_TITLE = 'Signaling Call Test';
export const SIGNALING_CALL_TEST_CARD_TITLE = SIGNALING_CALL_TEST_TITLE;
export const SIGNALING_CALL_TEST_SECTION_CONFIG = 'Test Configuration';
export const SIGNALING_CALL_TEST_SECTION_OUTPUT = 'Signaling Trace';
export const SIGNALING_CALL_TEST_OUTPUT_PLACEHOLDER =
  'Signaling trace will appear here after you start a test.';
export const SIGNALING_CALL_TEST_SECTION_HEADING_COLOR = '#30415A';
export const SIGNALING_CALL_TEST_FORM_PAD_X = 28;
export const SIGNALING_CALL_TEST_LABEL_COL_WIDTH = 188;
export const SIGNALING_CALL_TEST_FIELD_COL_GAP = 16;

export const SIGNALING_CALL_TEST_LABELS = {
  testType: 'Test Type',
  trunkGroup: 'SIP Trunk Group No.',
  callerId: 'CallerID',
  calledId: 'CalledID',
  originalCallee: 'Original CalleeID/Redirecting Number',
};

export const SIGNALING_CALL_TEST_TYPE_OPTIONS = [
  { value: 'ip-pstn', label: 'IP->PSTN' },
  { value: 'pstn-ip', label: 'PSTN->IP' },
];

export const SIGNALING_CALL_TEST_TRUNK_GROUP_OPTIONS = [
  { value: 'group0', label: 'SIP Trunk Group[0]' },
  { value: 'group1', label: 'SIP Trunk Group[1]' },
];

export const SIGNALING_CALL_TEST_LOG_CANDIDATES = [
  '/var/log/asterisk/messages',
  '/var/log/asterisk/full',
];

export const SIGNALING_CALL_TEST_POLL_MS = 2000;
export const SIGNALING_CALL_TEST_POLL_DURATION_MS = 20000;

export const SIGNALING_CALL_TEST_BUTTON_LABELS = {
  START: 'Start',
  CLEAR: 'Clear',
  STARTING: 'Starting...',
};

export const SIGNALING_CALL_TEST_BUTTON_VARIANTS = {
  PRIMARY: 'primary',
  CANCEL: 'cancel',
};

export const SIGNALING_CALL_TEST_BUTTON_STYLE = {
  height: 30,
  padding: '6px 14px',
  fontSize: 12,
  borderRadius: 10,
  minWidth: 100,
};

export const SIGNALING_CALL_TEST_TRACE_LABEL = 'Signaling Trace';

export const SIGNALING_CALL_TEST_MESSAGES = {
  CALLED_ID_REQUIRED: 'CalledID is required to start the test.',
  SIGNALING_FINISHED: 'Signaling call test finished.',
  SIGNALING_STARTED: 'Signaling call test started.',
  START_FAILED: 'Failed to start signaling call test.',
  ORIGINATE_FAILED: 'Originate failed.',
  ORIGINATE_REQUEST_SENT: 'Originate request sent.',
  FORM_CLEARED: 'Form and trace cleared.',
  SENDING_ORIGINATE: 'Sending test originate request...',
  CAPTURE_ENDED: '=== Test capture ended ===',
  UNKNOWN_ERROR: 'Unknown error',
  FAILED_TO_START_TEST: 'Failed to start test.',
  STARTING: 'Starting...',
};

export const SIGNALING_CALL_TEST_TOOLTIPS = {
  testType: 'Specifies the test type.',
  trunkGroup: 'Specifies the SIP trunk group.',
  callerId: 'Specifies the caller ID.',
  calledId: 'Specifies the called ID.',
  originalCallee: 'Specifies the original callee ID.',
  trace: 'Displays signaling trace information.',
};

export const SIGNALING_CALL_TEST_BREADCRUMB = [
  'Maintenance',
  'System Tools',
  SIGNALING_CALL_TEST_TITLE,
];

export const SIGNALING_CALL_TEST_DEFAULTS = {
  toast: {
    msg: '',
    type: 'success',
  },
  toastTimeout: 3500,
};

export const SIGNALING_CALL_TEST_COMMANDS = {
  LOGGER_ON: 'pjsip set logger on',
  LOGGER_OFF: 'pjsip set logger off',
  CHECK_READABLE: (path) => `test -r '${path}' && echo OK || echo NO`,
  COUNT_LINES: (path) => `wc -l < '${path}' 2>/dev/null || echo 0`,
  TAIL_LINES: (count, path) => `tail -n ${count} '${path}' 2>/dev/null`,
};

export const SIGNALING_CALL_TEST_LOG_MESSAGES = {
  POLL_ERROR: 'Signaling call test poll error:',
  TRUNK_LOAD_ERROR: 'Failed to load SIP trunk groups:',
  SIGNALING_ERROR: 'Signaling call test error:',
};

export const SIGNALING_CALL_TEST_TRACE_HEADERS = {
  TITLE: SIGNALING_CALL_TEST_TITLE,
  TIME: 'Time',
  TEST_TYPE: 'Test Type',
  TRUNK_GROUP: 'SIP Trunk Group',
  CALLER_ID: 'CallerID',
  CALLED_ID: 'CalledID',
  ORIGINAL_CALLEE: 'Original CalleeID',
  EMPTY: '(empty)',
};
