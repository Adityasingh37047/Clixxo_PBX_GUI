// Mirrors sidebarConstants exactly — all sections included.

export const PAGE_PERMISSION_GROUPS = [

  // ── Status ───────────────────────────────────────────────────────────────
  {
    id: 'status',
    label: 'Status',
    subGroups: [
      {
        id: 'SystemStatus',
        label: 'System Status',
        pages: [
          { id: 'systemInfo', label: 'System Info' },
        ],
      },
      {
        id: 'pbxStatus',
        label: 'PBX Status',
        pages: [
          { id: 'pbxMonitor',      label: 'PBX Monitor' },
          { id: 'ActiveCalls',     label: 'Active Calls' },
          { id: 'activecallqueue', label: 'Active Call Queue' },
        ],
      },
    ],
  },

  // ── CDR ──────────────────────────────────────────────────────────────────
  {
    id: 'cdr',
    label: 'CDR',
    subGroups: [
      {
        id: 'calldetailrecords',
        label: 'Call Detail Records',
        pages: [
          { id: 'callCount', label: 'Call Count' },
        ],
      },
    ],
  },

  // ── PBX ──────────────────────────────────────────────────────────────────
  {
    id: 'pbx',
    label: 'PBX',
    subGroups: [
      {
        id: 'extensions',
        label: 'Extensions',
        pages: [
          { id: 'pbxSipAccount',       label: 'Extensions' },
          { id: 'pbxExtensionGroups',  label: 'Extension Groups' },
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
          { id: 'callControlCcRoute',          label: 'CC Route' },
          { id: 'callControlInboundRoutes',     label: 'Inbound Routes' },
          { id: 'callControlOutboundRoutes',    label: 'Outbound Routes' },
          { id: 'OutboundRestrictions',         label: 'Outbound Restrictions' },
        ],
      },
      {
        id: 'callFeatures',
        label: 'Call Features',
        pages: [
          { id: 'callFeaturesBlockedList',   label: 'Blocked List' },
          { id: 'callFeaturesCallBack',      label: 'CallBack' },
          { id: 'callFeaturesOriginateCall', label: 'Originate Call' },
          { id: 'callFeaturesIVR',           label: 'IVR' },
          { id: 'callFeaturesConference',    label: 'Conference' },
          { id: 'callFeaturesCallQueue',     label: 'CallQueue' },
          { id: 'callFeaturesPickupGroup',   label: 'Pickup Group' },
          { id: 'callFeaturesRingGroup',     label: 'Ring Group' },
          { id: 'callFeaturesPrivateGroup',  label: 'Private Group' },
          { id: 'callFeaturesPaging',        label: 'Paging' },
          { id: 'callFeaturesSpeedDial',     label: 'Speed Dial' },
          { id: 'callFeaturesDisa',          label: 'DISA' },
        ],
      },
      {
        id: 'voicePrompts',
        label: 'Voice Prompts',
        pages: [
          { id: 'voicePromptsSettings', label: 'Voice Prompts' },
        ],
      },
      {
        id: 'FeatureCode',
        label: 'Feature Codes',
        pages: [
          { id: 'featureCodeSettings', label: 'Feature Codes' },
        ],
      },
    ],
  },

  // ── FXS ──────────────────────────────────────────────────────────────────
  {
    id: 'fxs',
    label: 'FXS',
    subGroups: [
      {
        id: 'fxsVoip',
        label: 'VoIP',
        pages: [
          { id: 'fxsVoipSip',           label: 'SIP' },
          { id: 'fxsVoipMedia',         label: 'Media' },
          { id: 'fxsVoipCompatibility', label: 'SIP Compatibility' },
          { id: 'fxsVoipNatSettings',   label: 'NAT Settings' },
        ],
      },
      {
        id: 'fxsAdvanced',
        label: 'Advanced',
        pages: [
          { id: 'fxsAdvancedGeneral',         label: 'General' },
          { id: 'fxsAdvancedActionUrl',        label: 'Action Url' },
          { id: 'fxsAdvancedAreaSelect',       label: 'Area Select' },
          { id: 'fxsAdvancedCdrQuery',         label: 'CDR Query' },
          { id: 'fxsAdvancedColorRing',        label: 'Color Ring' },
          { id: 'fxsAdvancedCueTone',          label: 'Cue Tone' },
          { id: 'fxsAdvancedDialingRule',      label: 'Dialing Rule' },
          { id: 'fxsAdvancedDialingTimeout',   label: 'Dialing Timeout' },
          { id: 'fxsAdvancedDtmf',             label: 'DTMF' },
          { id: 'fxsAdvancedFunctionKey',      label: 'Function Key' },
          { id: 'fxsAdvancedQos',              label: 'QoS' },
          { id: 'fxsAdvancedRinging',          label: 'Ringing Scheme' },
          { id: 'fxsAdvancedToneDetector',     label: 'Tone Detecter' },
          { id: 'fxsAdvancedToneGenerator',    label: 'Tone Generator' },
        ],
      },
      {
        id: 'fxsPort',
        label: 'Port',
        pages: [
          { id: 'fxsPortGroup',    label: 'Port Group' },
          { id: 'fxsPortSettings', label: 'FXS Settings' },
          { id: 'fxsPortAdvanced', label: 'FXS Advanced' },
        ],
      },
      {
        id: 'fxsRoute',
        label: 'Route',
        pages: [
          { id: 'fxsRoutingParameters', label: 'Routing Parameters' },
          { id: 'fxsIpToPstn',          label: 'IP->Tel' },
          { id: 'fxsPstnToIp',          label: 'Tel->IP' },
        ],
      },
      {
        id: 'fxsNumManipulate',
        label: 'Num Manipulate',
        pages: [
          { id: 'fxsIpCallInCallerID',   label: 'IP Call In CallerID' },
          { id: 'fxsIpCallInCalleeID',   label: 'IP Call In CalleeID' },
          { id: 'fxsPstnCallInCallerID', label: 'PSTN Call In CallerID' },
          { id: 'fxsPstnCallInCalleeID', label: 'PSTN Call In CalleeID' },
        ],
      },
    ],
  },

  // ── E1-PRI ────────────────────────────────────────────────────────────────
  {
    id: 'E1-PRI',
    label: 'E1-PRI',
    subGroups: [
      {
        id: 'route',
        label: 'Route',
        pages: [
          { id: 'routingParameters', label: 'Routing Parameters' },
          { id: 'ipToPstn',          label: 'IP->PSTN' },
          { id: 'ipToIp',            label: 'IP->IP' },
          { id: 'pstnToIp',          label: 'PSTN->IP' },
        ],
      },
      {
        id: 'numberfilter',
        label: 'Number Filter',
        pages: [
          { id: 'whitelist',     label: 'Whitelist' },
          { id: 'blacklist',     label: 'Blacklist' },
          { id: 'numberPool',    label: 'Number Pool' },
          { id: 'filteringRule', label: 'Filtering Rule' },
        ],
      },
      {
        id: 'numbermanipulate',
        label: 'Num Manipulate',
        pages: [
          { id: 'ipCallInCallerID',      label: 'IP Call In CallerID' },
          { id: 'ipCallInCalleeID',      label: 'IP Call In CalleeID' },
          { id: 'ipCallInOriCalleeID',   label: 'IP Call In OriCalleeID' },
          { id: 'pstnCallInCallerID',    label: 'PSTN Call In CallerID' },
          { id: 'pstnCallInCalleeID',    label: 'PSTN Call In CalleeID' },
          { id: 'pstnCallInOriCalleeID', label: 'PSTN Call In OriCalleeID' },
        ],
      },
      {
        id: 'pcm',
        label: 'PCM',
        pages: [
          { id: 'pcmPstn',               label: 'PSTN' },
          { id: 'pcmCircuitMaintenance', label: 'Circuit Maintenance' },
          { id: 'pcmTrunkGroup',         label: 'PCM Trunk Group' },
          { id: 'pcmNumReceivingRule',   label: 'Num-Receiving Rule' },
          { id: 'pcmReceptionTimeout',   label: 'Reception Timeout' },
        ],
      },
      {
        id: 'sip',
        label: 'SIP',
        pages: [
          { id: 'sipMain',          label: 'SIP' },
          { id: 'sipToSipAccount',  label: 'SIP To SIP Account' },
          { id: 'sipTrunkGroup',    label: 'SIP Trunk Group' },
          { id: 'sipMedia',         label: 'Media' },
        ],
      },
    ],
  },

  // ── System ───────────────────────────────────────────────────────────────
  {
    id: 'system',
    label: 'System',
    subGroups: [
      {
        id: 'systemSettings',
        label: 'System Settings',
        pages: [
          { id: 'sysNetwork',           label: 'Network' },
          { id: 'sysManagement',        label: 'Management' },
          { id: 'sysIpRoutingTable',    label: 'IP Route Table' },
          { id: 'sysAccessControl',     label: 'Access Control' },
          { id: 'sysVpn',               label: 'VPN' },
          { id: 'sysCentralizedManage', label: 'Centralized Manage' },
          { id: 'sysDhcp',              label: 'DHCP' },
          { id: 'sysPingTest',          label: 'Ping Test' },
          { id: 'sysTracertTest',       label: 'Tracert Test' },
          { id: 'sysAsteriskCLI',       label: 'Asterisk CLI' },
          { id: 'sysLinuxCLI',          label: 'Linux CLI' },
        ],
      },
    ],
  },

  // ── Maintenance ───────────────────────────────────────────────────────────
  {
    id: 'maintenance',
    label: 'Maintenance',
    subGroups: [
      {
        id: 'systemTools',
        label: 'System Tools',
        pages: [
          { id: 'authorization',        label: 'Authorization' },
          { id: 'idsSettings',          label: 'IDS Settings' },
          { id: 'ddosSettings',         label: 'DDOS Settings' },
          { id: 'certificateManage',    label: 'Certificate Manage' },
          { id: 'radius',               label: 'Radius' },
          { id: 'sipAccountGenerator',  label: 'SIP Account Generator' },
          { id: 'configFile',           label: 'Config File' },
          { id: 'hosts',                label: 'Hosts' },
          { id: 'signalingCapture',     label: 'Signaling Capture' },
          { id: 'signalingCallTest',    label: 'Signaling Call Test' },
          { id: 'signalingCallTrack',   label: 'Signaling Call Track' },
          { id: 'modificationRecord',   label: 'Modification Record' },
          { id: 'backupUpload',         label: 'Backup & Upload' },
          { id: 'factoryReset',         label: 'Factory Reset' },
          { id: 'upgrade',              label: 'Upgrade' },
          { id: 'deviceLock',           label: 'Device Lock' },
          { id: 'restart',              label: 'Restart' },
          { id: 'licence',              label: 'Licence' },
          { id: 'sqlUpload',            label: 'SQL Upload' },
        ],
      },
    ],
  },

  // ── User Manage ───────────────────────────────────────────────────────────
  {
    id: 'userManage',
    label: 'User Manage',
    subGroups: [
      {
        id: 'userPermission',
        label: 'User Permission',
        pages: [
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
};
