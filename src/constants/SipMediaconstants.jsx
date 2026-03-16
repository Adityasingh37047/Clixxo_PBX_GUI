// Media Parameters field definitions and initial values for SIP Media Page

export const SIP_MEDIA_FIELDS = [
  { name: 'dtmfTransmitMode', label: 'DTMF Transmit Mode', type: 'select', options: [
    { value: 'RFC2833', label: 'RFC2833' },
    { value: 'SignAling', label: 'SignAling'},
    { value: 'In-Band', label: 'In-Band'},
    { value: 'RFC2833+SingAling', label: 'RFC2833+SingAling'},
    { value: 'In-Band+SingAling', label: 'In-Band+SingAling'}


  ]},
  { name: 'rfc2833Payload', label: 'RFC2833 Payload', type: 'text', conditional: 'dtmfTransmitMode', conditionalValues: ['RFC2833', 'RFC2833+SingAling'] },
  { name: 'rtpPortRange', label: 'RTP Port Range', type: 'text' },
  { name: 'silenceSuppression', label: 'Silence Suppression', type: 'select', options: [
    { value: 'Enable', label: 'Enable' },
    { value: 'Disable', label: 'Disable' },
  ]},
  { name: 'noiseReduction', label: 'Noise Reduction', type: 'select', options: [
    { value: 'Enable', label: 'Enable' },
    { value: 'Disable', label: 'Disable' },
  ]},
  { name: 'comfortNoise', label: 'Comfort Noise Generation', type: 'select', options: [
    { value: 'Enable', label: 'Enable' },
    { value: 'Disable', label: 'Disable' },
  ]},
  { name: 'jitterMode', label: 'JitterMode', type: 'select', options: [
    { value: 'Static Mode', label: 'Static Mode' },
    { value: 'Adaptive Mode', label: 'Adaptive Mode'}
  ]},
  { name: 'jitterBuffer', label: 'JitterBuffer(ms)', type: 'text' },
  { name: 'jitterUnderrunLead', label: 'JitterUnderrunLead(ms)', type: 'text', conditional: 'jitterMode', conditionalValue: 'Static Mode' },
  { name: 'jitterOverrunLead', label: 'JitterOverrunLead(ms)', type: 'text', conditional: 'jitterMode', conditionalValue: 'Static Mode' },
  { name: 'jitterMin', label: 'JitterMin(ms)', type: 'text', conditional: 'jitterMode', conditionalValue: 'Adaptive Mode' },
  { name: 'jitterDecreaseRatio', label: 'JitterDecreaseRatio(%)', type: 'text', conditional: 'jitterMode', conditionalValue: 'Adaptive Mode' },
  { name: 'jitterIncreaseMax', label: 'JitterIncreaseMax(ms)', type: 'text', conditional: 'jitterMode', conditionalValue: 'Adaptive Mode' },
  { name: 'ipOutputLevelControl', label: 'IP side output Level Control Mode', type: 'select', options: [
    { value: 'Manual', label: 'Manual' }
    
  ]},
  { name: 'voiceGainOutput', label: 'Voice Gain Output from IP(dB)', type: 'text' },
  { name: 'packTimeDefault', label: 'PackTime when negotiation fails is default value', type: 'select', options: [
    { value: 'Yes', label: 'Yes' },
    { value: 'No', label: 'No' },
  ]},
];

export const SIP_MEDIA_CODEC_FIELD = {
  name: 'codecSetting',
  label: 'Gateway Negotiation Coding Sequence',
  type: 'select',
  options: [
    { value: 'Default Priority', label: 'Default Priority' },
    { value: 'User Defined Priority', label: 'User Defined Priority'}
    
  ],
};

export const SIP_MEDIA_INITIAL_FORM = {
  dtmfTransmitMode: 'RFC2833',
  rfc2833Payload: '',
  rtpPortRange: '',
  silenceSuppression: 'Disable',
  noiseReduction: 'Enable',
  comfortNoise: 'Enable',
  jitterMode: 'Static Mode',
  jitterBuffer: '100',
  jitterUnderrunLead: '100',
  jitterOverrunLead: '50',
  jitterMin: '80',
  jitterDecreaseRatio: '50',
  jitterIncreaseMax: '30',
  ipOutputLevelControl: 'Manual',
  voiceGainOutput: '',
  packTimeDefault: 'Yes',
  codecSetting: 'Default Priority',
};
