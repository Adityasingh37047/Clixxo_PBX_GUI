// Incoming SIP Call Statistics
export const INCOMING_SIP_HEADERS = [
  'SIP Index', 'Description', 'SIP Trunk Address', 'Current', 'Sum', 'Connection Rate', 'Answering Rate', 'Average Call Length (s)', 'INVITE(Times/s)'
];
export const INCOMING_SIP_ROWS = [
  ['', '', '', '', '', '', '', '', ''],
];

// Outgoing SIP Call Statistics
export const OUTGOING_SIP_HEADERS = [
  'SIP Index', 'Description', 'SIP Trunk Address', 'Current', 'Sum', 'Connection Rate', 'Answering Rate', 'Average Call Length (s)'
];
export const OUTGOING_SIP_ROWS = [
  ['', '', '', '', '', '', '', ''],
];

// PSTN Call Statistics
export const PSTN_CALL_HEADERS = [
  'Trunk No.', 'Signaling Type', 'Current Number of IP->PSTN', 'Sum', 'Connection Rate', 'Answering Rate', 'Current Number of PSTN->IP', 'Sum', 'Connection Rate', 'Answering Rate'
];
export const PSTN_CALL_ROWS = [
  ['0', 'ISDN(user)', '0', '0', '--', '--', '0', '0', '--', '--'],
  ['Total', '---', '0', '0', '--', '--', '0', '0', '--', '--'],
];

// Statistics on IP->PSTN Release Cause
export const IP_PSTN_RELEASE_HEADERS = [
  'Release Cause', 'Normal Disconnection', 'Cancelled', 'Busy', 'No Answer', 'Route Failed', 'No Idle Resource', 'Unallocated Number', 'Rejected', 'Unspecified', 'Failed', 'Others'
];
export const IP_PSTN_RELEASE_ROWS = [
  ['Amount', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  ['Percentage', '--', '--', '--', '--', '--', '--', '--', '--', '--', '--', '--'],
];

// Statistics on PSTN->IP Release Cause
export const PSTN_IP_RELEASE_HEADERS = [
  'Release Reason', 'Normal Disconnection', 'Cancelled', 'Busy', 'No Answer', 'Route Failed', 'No Idle Resource', 'Failed', 'Others'
];
export const PSTN_IP_RELEASE_ROWS = [
  ['Number', 0, 0, 0, 0, 0, 0, 0, 0],
  ['Percentage', '--', '--', '--', '--', '--', '--', '--', '--'],
];

// Statistics on IP->IP Release Cause
export const IP_IP_RELEASE_HEADERS = [
  'Release Reason', 'Normal Disconnection', 'Cancelled', 'Busy', 'No Answer', 'Route Failed', 'No Idle Resource', 'Failed', 'Others'
];
export const IP_IP_RELEASE_ROWS = [
  ['Number', 0, 0, 0, 0, 0, 0, 0, 0],
  ['Percentage', '--', '--', '--', '--', '--', '--', '--', '--'],
];
