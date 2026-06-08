export const SIP_TO_SIP_FIELDS = [
  { name: 'extension', label: 'Extension', type: 'text', defaultValue: '' },
  { name: 'context', label: 'Context', type: 'text', defaultValue: '' },
  { name: 'allow_codecs', label: 'Allow Codecs', type: 'checkbox', defaultValue: '' },
  { name: 'contact', label: 'Contact', type: 'text', defaultValue: '' },
  { name: 'password', label: 'Password', type: 'password', defaultValue: '' },
  { name: 'from_domain', label: 'Domain Name', type: 'text', defaultValue: '' },
  {name: 'contact_user', label: 'Contact User', type: 'text', defaultValue: ''},
  {name: 'outbound_proxy', label: 'Outbound Proxy', type: 'text', defaultValue: ''},
];

export const SIP_TO_SIP_TABLE_COLUMNS = [
  { key: 'check', label: 'Check' },
  { key: 'index', label: 'Index' },
  { key: 'extension', label: 'Extension' },
  { key: 'context', label: 'Context' },
  { key: 'allow_codecs', label: 'Allow Codecs' },
  { key: 'contact', label: 'Contact' },
  { key: 'password', label: 'Password' },
  { key: 'status', label: 'Status' },
  { key: 'modify', label: 'Modify' },
];

export const SIP_TO_SIP_INITIAL_FORM = SIP_TO_SIP_FIELDS.reduce((acc, field) => {
  acc[field.name] = field.defaultValue;
  return acc;
}, {});

/** Add/Edit modal — codec boxes (row 2) */
export const SIP_TO_SIP_CODEC_OPTIONS = [
  { value: "ulaw", label: "ulaw" },
  { value: "alaw", label: "alaw" },
  { value: "gsm", label: "gsm" },
  { value: "g726", label: "g726" },
  { value: "g722", label: "g722" },
  { value: "g729", label: "g729" },
  { value: "h264", label: "h264" },
];

/** Add/Edit modal — field rows */
export const SIP_TO_SIP_FORM_LAYOUT = [
  ["extension", "context"],
  ["allow_codecs"],
  ["contact", "password"],
  ["from_domain", "contact_user"],
  ["outbound_proxy"],
];


