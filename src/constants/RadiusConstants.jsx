export const RADIUS_FIELDS = [
  { name: 'radius', label: 'Radius:', type: 'checkbox', enableLabel: 'Enable' },
  { name: 'certification', label: 'Certification:', type: 'checkbox', enableLabel: 'enable' },
  { name: 'allowCalls', label: "Allow Calls even if Server doesn't Respond:", type: 'checkbox', enableLabel: 'enable' },
  { name: 'localIp', label: 'Local IP:', type: 'select' },
  { name: 'masterServer', label: 'Master Server:', type: 'text' },
  { name: 'sharedKey', label: 'Shared Key:', type: 'password' },
  { name: 'spareServer', label: 'Spare Server:', type: 'text' },
  { name: 'spareSharedKey', label: 'Shared Key:', type: 'password' },
  { name: 'timeout', label: 'Timeout (s):', type: 'text' },
  { name: 'retransmission', label: 'Retransmission Times:', type: 'text' },
  { name: 'transmitInterval', label: 'Transmit Interval of Charge Alive Package(s):', type: 'text' },
  { name: 'callType', label: 'Call Type (Records Output Required):', type: 'checkboxGroup' },
];

export const LOCAL_IP_OPTIONS = [
  { value: 'LAN1', label: 'LAN 1:192.168.1.101' },
  { value: 'LAN2', label: 'LAN 2:192.168.1.102' },
];

export const CALL_TYPE_OPTIONS = [
  { value: 'pstn2ip', label: 'PSTN->IP' },
  { value: 'ip2pstn', label: 'IP->PSTN' },
  { value: 'conversationStart', label: 'Conversation Start' },
  { value: 'accessFailure', label: 'Access Failure' },
];

export const RADIUS_BUTTONS = [
  { name: 'save', label: 'Save' },
  { name: 'reset', label: 'Reset' },
];
