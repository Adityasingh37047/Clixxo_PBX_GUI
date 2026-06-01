export const SIP_SETTINGS_FIELDS = [
  { label: 'Register Status', type: 'readonly', key: 'registerStatus', default: 'Unregistered' },

  { label: 'Registrar IP Address', type: 'text', key: 'registrarIp', default: '' },
  { label: 'Registrar Port', type: 'text', key: 'registrarPort', default: '5060', validation: 'integer' },

  { label: 'Spare Registrar Server', type: 'checkbox', key: 'spareRegistrarServer', default: true },
  { label: 'Spare Registrar IP Address', type: 'text', key: 'spareRegistrarIp', default: '', conditional: 'spareRegistrarServer' },
  { label: 'Spare Registrar Port', type: 'text', key: 'spareRegistrarPort', default: '5060', conditional: 'spareRegistrarServer' },

  { label: 'Register Interval Time(ms)', type: 'text', key: 'registerInterval', default: '0', validation: 'integer' },
  { label: 'Registry Validity Period (s)', type: 'text', key: 'registryValidity', default: '3600', validation: 'integer' },
  { label: 'Re-registration Interval(s)', type: 'text', key: 'reregistrationInterval', default: '32', validation: 'integer' },

  { label: 'Multi-Registrar Server Mode', type: 'checkbox', key: 'multiRegistrarMode', default: false },

  { label: 'SIP Transport Protocol', type: 'select', key: 'sipTransportProtocol', options: ['UDP', 'TCP'] },

  { label: 'Switch Signal Port if SIP Registration Failed', type: 'checkbox', key: 'switchSignalPort', default: true },
];

export const SIP_SETTINGS_NOTE = '';

