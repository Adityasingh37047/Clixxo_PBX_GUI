export const SIP_SETTINGS_FIELDS = [
  { label: 'SIP Address', type: 'select', key: 'sipWan', options: ['LAN 1: 192.168.0.101', 'LAN 2: 192.168.1.101', 'LAN 1 IPv6: 111:2222:33'] },
  { label: 'SIP Port', type: 'text', key: 'sipPort', default: '5060', validation: 'integer' },
  
  { label: 'Register Status', type: 'readonly', key: 'registerStatus', default: 'Unregistered' },
  { label: 'Register Gateway', type: 'select', key: 'registerGateway', options: ['No', 'Yes'] },
  
  { label: 'Registrar IP Address', type: 'text', key: 'registrarIp', default: '192.168.0.46' },
  { label: 'Registrar Port', type: 'text', key: 'registrarPort', default: '5060', validation: 'integer' },
  { label: 'IMS Network', type: 'checkbox', key: 'imsNetwork', default: false },
  { label: 'Externally Bound Address', type: 'text', key: 'externalBoundAddress', default: '', conditional: 'imsNetwork' },
  { label: 'Externally Bound Port', type: 'text', key: 'externalBoundPort', default: '5060', conditional: 'imsNetwork' },
  
  { label: 'Spare Registrar Server', type: 'checkbox', key: 'spareRegistrarServer', default: true },
  { label: 'Spare Registrar IP Address', type: 'text', key: 'spareRegistrarIp', default: '111:2222:3333:4444::100', conditional: 'spareRegistrarServer' },
  { label: 'Spare Registrar Port', type: 'text', key: 'spareRegistrarPort', default: '5060', conditional: 'spareRegistrarServer' },
  { label: 'Spare IMS Network', type: 'checkbox', key: 'spareImsNetwork', default: false, conditional: 'spareRegistrarServer' },
  { label: 'Spare Externally Bound Address', type: 'text', key: 'spareExternalBoundAddress', default: '', conditional: 'spareImsNetwork' },
  { label: 'Spare Externally Bound Port', type: 'text', key: 'spareExternalBoundPort', default: '', conditional: 'spareImsNetwork' },
  
  { label: 'Register Interval Time(ms)', type: 'text', key: 'registerInterval', default: '0', validation: 'integer' },
  { label: 'Registry Validity Period (s)', type: 'text', key: 'registryValidity', default: '3600', validation: 'integer' },
  { label: 'Re-registration Interval(s)', type: 'text', key: 'reregistrationInterval', default: '32', validation: 'integer' },
  
  { label: 'Multi-Registrar Server Mode', type: 'checkbox', key: 'multiRegistrarMode', default: false },
  
  { label: 'SIP Transport Protocol', type: 'select', key: 'sipTransportProtocol', options: ['UDP', 'TCP', 'TLS'] },
  { label: 'SRTP', type: 'checkbox', key: 'srtp', default: false, conditional: 'sipTransportProtocol', conditionalValue: 'TLS' },
  
  { label: 'Switch Signal Port if SIP Registration Failed', type: 'checkbox', key: 'switchSignalPort', default: true },
  
  { label: 'TFTP Auto Update Register Info', type: 'checkbox', key: 'tftpAutoUpdate', default: false },
  { label: 'TFTP Server IP', type: 'text', key: 'tftpServerIp', default: '', conditional: 'tftpAutoUpdate' },
  { label: 'Configuration File Path', type: 'text', key: 'configFilePath', default: '', conditional: 'tftpAutoUpdate', helper: 'File path like file1/file2/file3. If TFTP server specifies path, leave empty.' },
];

export const SIP_SETTINGS_NOTE = '';

