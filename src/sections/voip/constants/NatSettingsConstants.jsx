export const NAT_SETTINGS_FIELDS = [
  // Local NAT Traversal - Method 1
  { section: 'Local NAT Traversal', method: 'Method 1', label: 'Auto Nat', type: 'select', key: 'autoNat', options: ['DisableAutoNat', 'Enable PMP', 'Enable UPNP'], default: 'DisableAutoNat' },
  { section: 'Local NAT Traversal', method: 'Method 1', label: 'Outer Network Address', type: 'readonly', key: 'outerNetworkAddress', default: 'Offline', conditional: 'autoNat', conditionalValues: ['Enable PMP', 'Enable UPNP'] },
  
  // Local NAT Traversal - Method 2
  { section: 'Local NAT Traversal', method: 'Method 2', label: 'STUN Server', type: 'checkbox', key: 'stunServer', default: false },
  { section: 'Local NAT Traversal', method: 'Method 2', label: 'NAT Type', type: 'readonly', key: 'natType', default: 'Unknown', conditional: 'stunServer' },
  { section: 'Local NAT Traversal', method: 'Method 2', label: 'STUN Server Address', type: 'text', key: 'stunServerAddress', default: '127.0.0.1', conditional: 'stunServer' },
  
  // Local NAT Traversal - Method 3
  { section: 'Local NAT Traversal', method: 'Method 3', label: 'Mapping Contact IP', type: 'text', key: 'mappingContactIp', default: '' },
  { section: 'Local NAT Traversal', method: 'Method 3', label: 'Mapping SDP IP', type: 'text', key: 'mappingSdpIp', default: '' },
  
  // Local NAT Traversal - Method 4
  { section: 'Local NAT Traversal', method: 'Method 4', label: 'Rport', type: 'checkbox', key: 'rport', default: true },
  { section: 'Local NAT Traversal', method: 'Method 4', label: 'Learn NAT', type: 'checkbox', key: 'learnNat', default: false },
  { section: 'Local NAT Traversal', method: 'Method 4', label: 'Auto Detect NAT IP', type: 'checkbox', key: 'autoDetectNatIp', default: false },
  
  // Help Remote Device Complete NAT Traversal
  { section: 'Help Remote Device Complete NAT Traversal', method: '', label: 'RTP Self-adaption', type: 'checkbox', key: 'rtpSelfAdaption', default: false },
];

export const NAT_SETTINGS_NOTE = `The non-professional person please do not modify the configuration on this page.
"Local NAT Traversal": Please select one method according to your current network environment.
"Auto Nat": It is required to enable the feature of upon or pmp for the router.
"Mapping Contact IP": It is required to set the router to map the SIP port to the gateway.
"Mapping SDP IP": It is required to set the router to map the RTP port range to the gateway.
"Auto Detect NAT IP": It is valid only when the feature "Rport" is enabled and the router is set to map the RTP port range to the gateway.`;


