export const CENTRALIZED_MANAGE_FIELDS = [
  { name: 'centralizedManage', label: 'Centralized Manage', type: 'checkbox' },
  { name: 'notificationSetting', label: 'Notification Setting:', type: 'checkbox' },
  { name: 'trapServerPort', label: 'Trap Server Port:', type: 'text' },
  { name: 'cpuUsage', label: 'CPU Usage Threshold(%):', type: 'text' },
  { name: 'memoryUsage', label: 'Memory Usage Threshold(%):', type: 'text' },
  { name: 'highCps', label: 'High CPS Threshold(%):', type: 'text' },
  { name: 'lowConnRate', label: 'Low Connection Rate Threshold(%):', type: 'text' },
  { name: 'autoChangeGateway', label: 'Auto Change Default Gateway:', type: 'checkbox' },
  { name: 'managementPlatform', label: 'Management Platform:', type: 'select' },
  { name: 'centralizedProtocol', label: 'Centralized Management Protocol:', type: 'select', conditional: true },
  { name: 'snmpVersion', label: 'SNMP Version:', type: 'select', conditional: true },
  { name: 'snmpServerAddress', label: 'SNMP Server Address:', type: 'text', conditional: true },
  { name: 'monitoringPort', label: 'Monitoring Port', type: 'checkbox', conditional: true },
  { name: 'monitoringPortValue', label: '', type: 'text', conditional: true },
  { name: 'communityString', label: 'Community String:', type: 'text', conditional: true },
  { name: 'companyName', label: 'Company Name:', type: 'text', dcmsOnly: true },
  { name: 'gatewayDesc', label: 'Gateway Description:', type: 'text', dcmsOnly: true },
  { name: 'snmpServer', label: 'SNMP Server Address:', type: 'text', dcmsOnly: true },
  { name: 'authCode', label: 'Authorization Code :', type: 'text', placeholder: 'Please input authorization code', dcmsOnly: true },
  { name: 'workingStatus', label: 'Working Status:', type: 'static', value: 'Requesting authentication', dcmsOnly: true },
];

export const MANAGEMENT_PLATFORM_OPTIONS = [
  { value: 'DCMS', label: 'DCMS' },
  { value: 'Custom1', label: 'Custom1' },
  { value: 'Others', label: 'Others' },
];

export const CENTRALIZED_MANAGE_BUTTONS = [
  { name: 'save', label: 'Save' },
  { name: 'reset', label: 'Reset' },
  { name: 'download', label: 'Download MIB' },
];

export const CENTRALIZED_PROTOCOL_OPTIONS = [
  { value: 'SNMP', label: 'SNMP' },
];

export const SNMP_VERSION_OPTIONS = [
  { value: 'V1', label: 'V1' },
  { value: 'V2', label: 'V2' },
  { value: 'V3', label: 'V3' },
];
