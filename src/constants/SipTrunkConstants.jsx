export const SIP_TRUNK_FIELDS = [
  { name: 'index', label: 'Index', type: 'select', options: Array.from({ length: 10 }, (_, i) => ({value: i.toString(), label: i.toString()})), defaultValue: '1' },
  { name: 'description', label: 'Description', type: 'text', defaultValue: 'Global SIP Settings' },
  // Temporarily hidden per request (toggle back by uncommenting):
  // { name: 'sip_agent', label: 'SIP Agent', type: 'checkbox', defaultValue: false },
  // { name: 'username', label: 'UserName', type: 'text', defaultValue: '', conditionalField: { dependsOn: 'sip_agent', value: true } },
  // { name: 'password', label: 'Password', type: 'password', defaultValue: '', conditionalField: { dependsOn: 'sip_agent', value: true } },
  // { name: 'remote Address', label: 'Remote Address', type: 'text', defaultValue: '' },
  // { name: 'Remote Port', label: 'Remote Port', type: 'text', defaultValue: '5060' },
  { name: 'local_ip', label: 'Local IP', type: 'select', options: [{ value: '0.0.0.0', label: 'Any LAN (0.0.0.0)' }], defaultValue: '0.0.0.0' },
  { name: 'local_port', label: 'Local SIP Port', type: 'text', defaultValue: '5060' },
  // { name: 'allow_codecs', label: 'Allow Codecs', type: 'checkbox', defaultValue: '' },
  { name: 'transport_mode', label: 'Transport Mode', type: 'select', options: [ {value: 'UDP', label: 'UDP'}, {value: 'TCP', label: 'TCP'}   ], defaultValue: 'UDP' },
  { name: 'srtp_mode', label: 'SRTP Mode', type: 'select', options: [
    { value: 'no', label: 'plain RTP' },
    { value: 'sdes', label: 'Session Description Protocol Security Descriptions' },
    { value: 'dtls', label: 'DTLS-SRTP (Datagram TLS)' }
  ], defaultValue: 'no' },
  // { name: 'Outgoing Voice Resource', label: 'Outgoing Voice Resource', type: 'text', defaultValue: '64' },
  // {name: 'Incoming Voice Resource', label: 'Incoming Voice Resource', type: 'text', defaultValue: '64' },
  { name: 'dtmf_mode', label: 'DTMF Mode', type: 'select', options: [
    { value: 'rfc4733', label: 'Sends DTMF as out-of-band RTP events' },
    { value: 'inband', label: 'Sends DTMF within the audio stream' },
    { value: 'info', label: 'Sends DTMF using SIP INFO messages' },
    { value: 'auto', label: 'Automatically negotiate' }
  ], defaultValue: 'info' },
  // { name: 'Fax Mode', label: 'Fax Mode', type: 'select', options: [ {value: 'Global', label: 'Global'}, {value: 'T38', label: 'T38'}, {value: 'T30', label: 'T30'}   ], defaultValue: 'Global' },
  // { name: 'Working Period', label: 'Working Period', type: 'checkbox', defaultValue: true },
  // { name: 'Working Period Text', label: '', type: 'text', defaultValue: '24 Hour' },
  // { name: 'VOS1.1 SIP Encryption', label: 'VOS1.1 SIP Encryption', type: 'select', options: [ {value: 'No Encryption', label: 'No Encryption'}, {value: 'Gateway Encryption', label: 'Gateway Encryption'}  ], defaultValue: 'No Encryption' },
  // { name: 'Encrypt Key', label: 'Encrypt Key', type: 'text', defaultValue: '', conditionalField: { dependsOn: 'VOS1.1 SIP Encryption', value: 'Gateway Encryption' } },
  // { name: 'VOS1.1 RTP EncryptKey', label: 'VOS1.1 RTP EncryptKey', type: 'checkbox', defaultValue: false },
  { name: 'external_bound_flag', label: 'Externally Bound Enable', type: 'select', options: [ {value: 'Y', label: 'Yes'}, {value: 'N', label: 'No'}   ], defaultValue: 'N' },
  { name: 'external_bound_address', label: 'Externally Bound Address', type: 'text', defaultValue: '', conditionalField: { dependsOn: 'external_bound_flag', value: 'Y' } },
  { name: 'external_bound_port', label: 'Externally Bound Port', type: 'text', defaultValue: '', conditionalField: { dependsOn: 'external_bound_flag', value: 'Y' } },
];

export const SIP_TRUNK_TABLE_COLUMNS = [
  { key: 'index', label: 'Index' },
  { key: 'description', label: 'Description' },
  { key: 'local_ip', label: 'Local IP' },
  { key: 'local_port', label: 'Local SIP Port' },
  { key: 'transport_mode', label: 'Transport Mode' },
  { key: 'srtp_mode', label: 'SRTP Mode' },
  { key: 'dtmf_mode', label: 'DTMF Mode' },
  { key: 'external_bound_flag', label: 'Externally Bound Enable' },
];

export const TRUNK_CODEC_OPTIONS = [
  { value: 'ulaw', label: 'ulaw' },
  { value: 'alaw', label: 'alaw' },
  { value: 'gsm', label: 'gsm' },
  { value: 'g726', label: 'g726' },
  { value: 'g722', label: 'g722' },
  { value: 'g729', label: 'g729' }
];

export const SIP_TRUNK_INITIAL_FORM = SIP_TRUNK_FIELDS.reduce((acc, field) => {
  acc[field.name] = field.defaultValue;
  return acc;
}, {});
