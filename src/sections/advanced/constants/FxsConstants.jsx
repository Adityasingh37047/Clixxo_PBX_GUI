export const FXS_FIELDS = [
  { label: 'Tone Energy (dB)', type: 'text', key: 'toneEnergy', default: '-11', keyPressType: 'number-minus' },
  { label: 'Ringing Scheme Setting', type: 'checkbox', key: 'ringingSchemeEnabled', default: false},
  { label: 'Ringing Mode', type: 'text', key: 'ringMode', default: '', keyPressType: 'number-comma-minus', conditional: 'ringingSchemeEnabled', maxLength: 128 },
  { label: 'Hook-flash Detection', type: 'checkbox', key: 'hookFlashDetection', default: false },
  { label: 'Minimum Time Length of On-hook Detection (ms)', type: 'text', key: 'minHangupTime', default: '64', keyPressType: 'number', conditional: 'hookFlashDetection', conditionalValue: false, maxLength: 5 },
  { label: 'Minimum Time (ms)', type: 'text', key: 'hookFlashMinTime', default: '80', keyPressType: 'number', conditional: 'hookFlashDetection', conditionalValue: true, maxLength: 5 },
  { label: 'Maximum Time (ms)', type: 'text', key: 'hookFlashMaxTime', default: '700', keyPressType: 'number', conditional: 'hookFlashDetection', conditionalValue: true, maxLength: 5 },
  { label: 'Preferred 18x Response (NO valid P_Early_Media)', type: 'select', key: 'preferred18xResponse', options: [
    { value: '0', label: 'IMS Ringback' },
    { value: '1', label: 'Local Ringback' },
  ], default: '0' },
  { label: 'Enable Press-Key Call-Forward', type: 'checkbox', key: 'pressKeyCallForward', default: false},
  { label: 'Call-Forward Key', type: 'select', key: 'callForwardKey', options: [
    { value: '35', label: '#' },
    { value: '42', label: '*' },
  ], default: '35', conditional: 'pressKeyCallForward' },
  { label: 'Call-Forward Method', type: 'select', key: 'callForwardMethod', options: [
    { value: '0', label: 'Call Forward with Negotiation' },
    { value: '1', label: 'Blind Transfer' },
  ], default: '0', conditional: 'pressKeyCallForward' },
  { label: 'CID Transmit Mode', type: 'select', key: 'cidTransmitMode', options: [
    { value: '0', label: 'DTMF' },
    { value: '1', label: 'FSK' },
  ], default: '1' },
  { label: 'Occasion to Send FSK CallerID', type: 'select', key: 'occasionToSendFSKCallerID', options: [
    { value: '0', label: 'Before ring' },
    { value: '1', label: 'After the first ring' },
  ], default: '1', conditional: 'cidTransmitMode', conditionalValue: '1' },
  { label: 'Send Polarity Reversal Signal', type: 'checkbox', key: 'sendPolarityReversal', default: false},
  { label: 'Off-hook Dither Signal Duration (ms)', type: 'text', key: 'offHookDitherSignalDuration', default: '64', keyPressType: 'number', maxLength: 5 },
  { label: 'Handling of Call from Internal Station', type: 'select', key: 'handlingOfCallFromInternalStation', options: [
    { value: '0', label: 'Internal Handling' },
    { value: '1', label: 'Platform Handling' },
  ], default: '1' },
  { label: 'Light Up Mode for Voice Message', type: 'select', key: 'lightUpModeForVoiceMessage', options: [
    { value: '0', label: 'Not Light Up' },
    { value: '1', label: 'FSK Light Up' },
  ], default: '0' },
  { label: 'Open Session In Advance', type: 'checkbox', key: 'openSessionInAdvance', default: false },
  { label: 'Report FXS Status', type: 'checkbox', key: 'reportFXSStatus', default: false },
  { label: 'Enable Send DTMF while receiving 183', type: 'checkbox', key: 'enableSendDTMFWhileReceiving183', default: true },
];

export const FXS_INITIAL_FORM = FXS_FIELDS.reduce((acc, field) => {
  acc[field.key] = field.default;
  return acc;
}, {});


