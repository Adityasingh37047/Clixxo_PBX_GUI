export const sipRegisterFields = [
  { name: 'index', label: 'Index', type: 'text', defaultValue: '0' },
  { name: 'trunk_id', label: 'Trunk ID', type: 'text', defaultValue: '' },
  { name: 'username', label: 'Username', type: 'text', defaultValue: '' },
  { name: 'password', label: 'Password', type: 'password', defaultValue: '' },
  { name: 'context', label: 'Context', type: 'text', defaultValue: '' },
  { name: 'allow_codecs', label: 'Allow Codecs', type: 'checkbox', defaultValue: '' },
  { name: 'expire_in_sec', label: 'Expire In Sec', type: 'text', defaultValue: '' },
  { name: 'provider', label: 'Provider', type: 'text', defaultValue: '' },
  {name : 'sip_header', label: 'SIP Header', type: 'text', defaultValue: '' },
  {name : 'Domain name', label: 'Domain name', type: 'text', defaultValue: '' },
  {name : 'Contact User', label: 'Contact User', type: 'text', defaultValue: '' },
  {name : 'Outbound Proxy', label: 'Outbound Proxy', type: 'text', defaultValue: '' },
  {name: 'server_domain', label: 'Server Domain', type: 'text', defaultValue: '' },
  {name: 'client_domain', label: 'Client Domain', type: 'text', defaultValue: '' },
  {name: 'from_user', label: 'From User', type: 'text', defaultValue: '' },
  {name: 'identity_ip', label: 'Identifier IP', type: 'text', defaultValue: '' }
];

export const SIP_REGISTER_TABLE_COLUMNS = [
  { key: 'check', label: 'Check' },
  { key: 'index', label: 'Index' },
  { key: 'trunk_id', label: 'Trunk ID' },
  { key: 'username', label: 'Username' },
  { key: 'context', label: 'Context' },
  { key: 'allow_codecs', label: 'Allow Codecs' },
  { key: 'expire_in_sec', label: 'Expire In Sec' },
  { key: 'provider', label: 'Provider' },
  { key: 'sip_header', label: 'SIP Header' },
  { key: 'registerStatus', label: 'Status' },
  { key: 'modify', label: 'Modify' },
];

export const CODEC_OPTIONS = [
  { value: 'ulaw', label: 'ulaw' },
  { value: 'alaw', label: 'alaw' },
  { value: 'gsm', label: 'gsm' },
  { value: 'g726', label: 'g726' },
  { value: 'g722', label: 'g722' },
  { value: 'g729', label: 'g729' }
];

export const SIP_REGISTER_INITIAL_FORM = sipRegisterFields.reduce((acc, field) => {
  acc[field.name] = field.defaultValue;
  return acc;
}, {});
