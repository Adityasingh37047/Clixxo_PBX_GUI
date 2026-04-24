// constants/routeConstants.js
export const ROUTE_PATHS = {
  HOME: '/',


  STATUS: '/system-status/system-info',
  SYSTEM_INFO: '/system-status/system-info',
  // PSTN_STATUS: '/operation-info/pstn-status',
  // PSM_INFO: '/operation-info/psm-info',
  CALL_COUNT: '/call-detail-records/call-count',
  // WARNING_INFO: '/operation-info/warning-info',

  // Main routes
  SIP: '/sip',
  SIP_COMPATIBILITY: '/voip/sip-compatibility',
  SIP_NAT_SETTINGS: '/voip/nat-settings',
  /** FXS Configuration → VoIP (section UI; main SIP uses /sip) */
  FXS_VOIP_SIP: '/voip/sip',
  FXS_VOIP_MEDIA: '/voip/media',
  PCM: '/pcm',
  ISDN: '/isdn',
  FAX: '/fax',
  ROUTE: '/route/routing-parameters',
  NUMBER_FILTER: '/number-filter',
  NUM_MANIPULATE: '/num-manipulate',
  VPN: '/vpn',
  DHCP: '/dhcp',
  SYSTEM_TOOLS: '/system-tools',
  // Call Features
  CONFERENCE: '/call-features/conference',
  IP_CALL_IN_CALLERID: '/num-manipulate/ip-call-in-callerid',
  IP_CALL_IN_CALLEEID: '/num-manipulate/ip-call-in-calleeid',
  IP_CALL_IN_ORICALLEEID: '/num-manipulate/ip-call-in-oricalleeid',
  PSTN_CALL_IN_CALLERID: '/num-manipulate/pstn-call-in-callerid',
  PSTN_CALL_IN_CALLEEID: '/num-manipulate/pstn-call-in-calleeid',
  PSTN_CALL_IN_ORICALLEEID: '/num-manipulate/pstn-call-in-oricalleeid',
  CALLERID_POOL: '/num-manipulate/callerid-pool',
  CALLERID_RESERVE_POOL: '/num-manipulate/callerid-reserve-pool',
  PORT_GROUP: '/port/port-group',

  // FXS Configuration (sections/port + sections/advanced)
  PORT_FXS: '/port/fxs-settings',
  PORT_FXS_ADVANCED: '/port/fxs-advanced',
  FXS_GENERAL: '/advanced/general',
  FXS_ACTION_URL: '/advanced/action-url',
  FXS_AREA_SELECT: '/advanced/area-select',
  FXS_CDR_QUERY: '/advanced/cdr-query',
  FXS_COLOR_RING: '/advanced/color-ring',
  FXS_CUE_TONE: '/advanced/cue-tone',
  FXS_DIALING_RULE: '/advanced/dialing-rule',
  FXS_DIALING_TIMEOUT: '/advanced/dialing-timeout',
  FXS_DTMF: '/advanced/dtmf',
  FXS_FUNCTION_KEY: '/advanced/function-key',
  FXS_QOS: '/advanced/qos',
  FXS_RINGING_SCHEME: '/advanced/ringing-scheme',
  FXS_TONE_DETECTOR: '/advanced/tone-detector',
  FXS_TONE_GENERATOR: '/advanced/tone-generator',
};


