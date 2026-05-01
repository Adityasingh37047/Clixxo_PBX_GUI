export const AUTHORITY_OPTIONS = [
  { value: 'read_write', label: 'Read-Write' },
];

// 3-level hierarchy: Section → SubGroup → Pages (mirrors sidebarConstants)
export const PAGE_PERMISSION_GROUPS = [
  {
    id: 'pbx',
    label: 'PBX',
    subGroups: [
      {
        id: 'extensions',
        label: 'Extensions',
        pages: [
          { id: 'pbxExtensions', label: 'Extensions' },
          { id: 'extensionGroups', label: 'Extension Groups' },
        ],
      },
      {
        id: 'trunks',
        label: 'Trunks',
        pages: [
          { id: 'sipRegister', label: 'SIP Register' },
        ],
      },
      {
        id: 'callControl',
        label: 'Call Control',
        pages: [
          { id: 'ccRoute', label: 'CC Route' },
          { id: 'inboundRoutes', label: 'Inbound Routes' },
          { id: 'outboundRoutes', label: 'Outbound Routes' },
          { id: 'outboundRestrictions', label: 'Outbound Restrictions' },
        ],
      },
      {
        id: 'callFeatures',
        label: 'Call Features',
        pages: [
          { id: 'blockedList', label: 'Blocked List' },
          { id: 'callBack', label: 'CallBack' },
          { id: 'originateCall', label: 'Originate Call' },
          { id: 'ivr', label: 'IVR' },
          { id: 'conference', label: 'Conference' },
          { id: 'callQueue', label: 'CallQueue' },
          { id: 'pickupGroup', label: 'Pickup Group' },
          { id: 'ringGroup', label: 'Ring Group' },
          { id: 'privateGroup', label: 'Private Group' },
          { id: 'paging', label: 'Paging' },
          { id: 'speedDial', label: 'Speed Dial' },
          { id: 'disa', label: 'DISA' },
        ],
      },
      {
        id: 'voicePrompts',
        label: 'Voice Prompts',
        pages: [
          { id: 'voicePrompts', label: 'Voice Prompts' },
        ],
      },
      {
        id: 'featureCodes',
        label: 'Feature Codes',
        pages: [
          { id: 'featureCodes', label: 'Feature Codes' },
        ],
      },
    ],
  },
  {
    id: 'fxs',
    label: 'FXS',
    subGroups: [
      {
        id: 'fxsVoip',
        label: 'VoIP',
        pages: [
          { id: 'fxsSip', label: 'SIP' },
          { id: 'fxsMedia', label: 'Media' },
          { id: 'fxsSipCompatibility', label: 'SIP Compatibility' },
          { id: 'fxsNatSettings', label: 'NAT Settings' },
        ],
      },
      {
        id: 'fxsAdvanced',
        label: 'Advanced',
        pages: [
          { id: 'fxsGeneral', label: 'General' },
          { id: 'fxsActionUrl', label: 'Action Url' },
          { id: 'fxsAreaSelect', label: 'Area Select' },
          { id: 'fxsCdrQuery', label: 'CDR Query' },
          { id: 'fxsColorRing', label: 'Color Ring' },
          { id: 'fxsCueTone', label: 'Cue Tone' },
          { id: 'fxsDialingRule', label: 'Dialing Rule' },
          { id: 'fxsDialingTimeout', label: 'Dialing Timeout' },
          { id: 'fxsDtmf', label: 'DTMF' },
          { id: 'fxsFunctionKey', label: 'Function Key' },
          { id: 'fxsQos', label: 'QoS' },
          { id: 'fxsRingingScheme', label: 'Ringing Scheme' },
          { id: 'fxsToneDetector', label: 'Tone Detecter' },
          { id: 'fxsToneGenerator', label: 'Tone Generator' },
        ],
      },
      {
        id: 'fxsPort',
        label: 'Port',
        pages: [
          { id: 'fxsPortGroup', label: 'Port Group' },
          { id: 'fxsSettings', label: 'FXS Settings' },
          { id: 'fxsAdvancedPort', label: 'FXS Advanced' },
        ],
      },
    ],
  },
  {
    id: 'e1pri',
    label: 'E1-PRI',
    subGroups: [
      {
        id: 'route',
        label: 'Route',
        pages: [
          { id: 'routingParameters', label: 'Routing Parameters' },
          { id: 'ipToPstn', label: 'IP->PSTN' },
          { id: 'ipToIp', label: 'IP->IP' },
          { id: 'pstnToIp', label: 'PSTN->IP' },
        ],
      },
      {
        id: 'numberFilter',
        label: 'Number Filter',
        pages: [
          { id: 'whitelist', label: 'Whitelist' },
          { id: 'blacklist', label: 'Blacklist' },
          { id: 'numberPool', label: 'Number Pool' },
          { id: 'filteringRule', label: 'Filtering Rule' },
        ],
      },
      {
        id: 'numManipulate',
        label: 'Num Manipulate',
        pages: [
          { id: 'ipCallInCallerID', label: 'IP Call In CallerID' },
          { id: 'ipCallInCalleeID', label: 'IP Call In CalleeID' },
          { id: 'ipCallInOriCalleeID', label: 'IP Call In OriCalleeID' },
          { id: 'pstnCallInCallerID', label: 'PSTN Call In CallerID' },
          { id: 'pstnCallInCalleeID', label: 'PSTN Call In CalleeID' },
          { id: 'pstnCallInOriCalleeID', label: 'PSTN Call In OriCalleeID' },
        ],
      },
      {
        id: 'pcm',
        label: 'PCM',
        pages: [
          { id: 'pcmPstn', label: 'PSTN' },
          { id: 'circuitMaintenance', label: 'Circuit Maintenance' },
          { id: 'pcmTrunkGroup', label: 'PCM Trunk Group' },
          { id: 'numReceivingRule', label: 'Num-Receiving Rule' },
          { id: 'receptionTimeout', label: 'Reception Timeout' },
        ],
      },
      {
        id: 'e1Sip',
        label: 'SIP',
        pages: [
          { id: 'e1SipMain', label: 'SIP' },
          { id: 'sipToSipAccount', label: 'SIP To SIP Account' },
          { id: 'sipTrunkGroup', label: 'SIP Trunk Group' },
          { id: 'sipMedia', label: 'Media' },
        ],
      },
    ],
  },
  {
    id: 'maintenance',
    label: 'Maintenance',
    subGroups: [
      {
        id: 'systemTools',
        label: 'System Tools',
        pages: [
          { id: 'authorization', label: 'Authorization' },
          { id: 'idsSettings', label: 'IDS Settings' },
          { id: 'ddosSettings', label: 'DDOS Settings' },
          { id: 'certificateManage', label: 'Certificate Manage' },
          { id: 'radius', label: 'Radius' },
          { id: 'sipAccountGenerator', label: 'SIP Account Generator' },
          { id: 'configFile', label: 'Config File' },
          { id: 'hosts', label: 'Hosts' },
          { id: 'signalingCapture', label: 'Signaling Capture' },
          { id: 'signalingCallTest', label: 'Signaling Call Test' },
          { id: 'signalingCallTrack', label: 'Signaling Call Track' },
          { id: 'modificationRecord', label: 'Modification Record' },
          { id: 'backupUpload', label: 'Backup & Upload' },
          { id: 'factoryReset', label: 'Factory Reset' },
          { id: 'upgrade', label: 'Upgrade' },
          { id: 'deviceLock', label: 'Device Lock' },
          { id: 'restart', label: 'Restart' },
          { id: 'licence', label: 'Licence' },
    
        ],
      },
    ],
  },
  {
    id: 'userManage',
    label: 'User Manage',
    subGroups: [
      {
        id: 'userPermission',
        label: 'User Permission',
        pages: [
          { id: 'accountManage', label: 'Account Manage' },
          { id: 'changePassword', label: 'Change Password' },
        ],
      },
    ],
  },
];

const buildInitialPermissions = () => {
  const perms = {};
  PAGE_PERMISSION_GROUPS.forEach(section =>
    section.subGroups.forEach(sub =>
      sub.pages.forEach(page => { perms[page.id] = false; })
    )
  );
  return perms;
};

export const INITIAL_PERMISSIONS = buildInitialPermissions();

export const INITIAL_USER_FORM = {
  username: '',
  password: '',
  authority: 'read_write',
};
