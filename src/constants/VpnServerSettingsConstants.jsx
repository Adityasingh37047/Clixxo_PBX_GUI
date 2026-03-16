export const VPN_SERVER_SETTINGS_FIELDS = [
  { name: 'enabled', label: 'VPN Server:', type: 'checkbox' },
  { name: 'vpnType', label: 'VPN Type:', type: 'select', options: [
    { value: 'PPTP', label: 'PPTP' },
    { value: 'L2TP', label: 'L2TP' },
    { value: 'OpenVPN', label: 'OpenVPN' },
  ] },
  { name: 'identityProtocol', label: 'Identity Verification Protocol:', type: 'select', options: [
    { value: 'MS-CHAPv2 + MPPE', label: 'MS-CHAPv2 + MPPE' },
    { value: 'PAP', label: 'PAP' },
    { value: 'CHAP', label: 'CHAP' },
    { value: 'MS-CHAPv2', label: 'MS-CHAPv2' },
  ] },
  { name: 'clientIpRange', label: 'Client IP Range:', type: 'text' },
  { name: 'preferredWINS', label: 'Preferred WINS Address (Optional):', type: 'text' },
  { name: 'spareWINS', label: 'Spare WINS Address (Optional):', type: 'text' },
];

export const VPN_SERVER_SETTINGS_INITIAL_FORM = {
  enabled: false,
  vpnType: 'PPTP',
  identityProtocol: 'MS-CHAPv2 + MPPE',
  clientIpRange: '192.168.1.234-238',
  preferredWINS: '',
  spareWINS: '',
};
