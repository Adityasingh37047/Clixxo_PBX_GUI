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

// Button labels
export const SCT_BUTTONS = {
  start: 'Start',
  clear: 'Clear',
};

// Trace label
export const SCT_TRACE_LABEL = 'Signaling Trace';
