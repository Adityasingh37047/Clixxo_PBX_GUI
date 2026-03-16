export const IDS_TYPES = [
  { key: 'tlsFailed', label: 'TLS Connection Failed' },
  { key: 'malformedSIP', label: 'Malformed SIP Datagram' },
  { key: 'registrationFailed', label: 'Registration Failed' },
  { key: 'callFailed', label: 'Call Failed' },
  { key: 'sipException', label: 'SIP Exception Flow' },
];

export const IDS_INITIAL_FORM = {
  enable: false,
  tlsFailed: false,
  malformedSIP: false,
  registrationFailed: false,
  callFailed: false,
  sipException: false,
  warningThresholds: [0, 0, 0, 0, 0],
  blacklistThresholds: [0, 0, 0, 0, 0],
  blacklistValidity: 60,
};

export const IDS_WARNING_LOG = '';

export const IDS_LOG_NOTE =
  'Note: Only the latest 100 pieces of warning information will be displayed. To check all the information, please click the Download button.';
