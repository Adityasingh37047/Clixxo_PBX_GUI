// constants/routeConstants.js
export const ROUTE_PATHS = {
  HOME: '/',

  // Status
  STATUS: '/status/system-status/system-info',
  SYSTEM_INFO: '/status/system-status/system-info',
  PSTN_STATUS: '/status/system-status/pstn-status',
  PSM_INFO: '/status/system-status/psm-info',
  WARNING_INFO: '/status/system-status/warning-info',
  PBX_MONITOR: '/status/pbx-status/pbx-monitor',
  ACTIVE_CALLS: '/status/pbx-status/active-calls',
  ACTIVE_CALL_QUEUE: '/status/pbx-status/active-call-queue',
  VIEW_VOICEMAIL: '/status/pbx-status/view-voicemail',
  HA_STATUS: '/status/pbx-status/ha-status',

  // CDR
  CALL_COUNT: '/cdr/call-detail-records/call-count',

  // PBX
  EXTENSIONS: '/pbx/extensions/extensions',
  EXTENSION_GROUPS: '/pbx/extensions/extension-groups',
  SIP_REGISTER: '/pbx/trunks/sip-register',
  CC_ROUTE: '/pbx/call-control/cc-route',
  INBOUND_ROUTES: '/pbx/call-control/inbound-routes',
  OUTBOUND_ROUTES: '/pbx/call-control/outbound-routes',
  OUTBOUND_RESTRICTIONS: '/pbx/call-control/outbound-restrictions',
  TIME_CONDITION: '/pbx/call-control/time-condition',
  BLOCKED_LIST: '/pbx/call-features/blocked-list',
  CALLBACK: '/pbx/call-features/callback',
  ORIGINATE_CALL: '/pbx/call-features/originate-call',
  IVR: '/pbx/call-features/ivr',
  CONFERENCE: '/pbx/call-features/conference',
  CALL_QUEUE: '/pbx/call-features/call-queue',
  PICKUP_GROUP: '/pbx/call-features/pickup-group',
  RING_GROUP: '/pbx/call-features/ring-group',
  PRIVATE_GROUP: '/pbx/call-features/private-group',
  PAGING: '/pbx/call-features/paging',
  SPEED_DIAL: '/pbx/call-features/speed-dial',
  DISA: '/pbx/call-features/disa',
  RECORD_SETTINGS: '/pbx/record-settings/record-settings',
  VOICE_PROMPTS: '/pbx/voice-prompts/voice-prompts',
  FEATURE_CODE: '/pbx/feature-code/feature-code',
  VOICEMAIL: '/pbx/voicemail/voicemail',
  AUTO_PROVISION: '/pbx/auto-provision/auto-provision',

  // FXS → VoIP
  FXS_VOIP_SIP: '/fxs/voip/sip',
  FXS_VOIP_MEDIA: '/fxs/voip/media',
  SIP_COMPATIBILITY: '/fxs/voip/sip-compatibility',
  SIP_NAT_SETTINGS: '/fxs/voip/nat-settings',

  // FXS → Port
  PORT_GROUP: '/fxs/port/port-group',
  PORT_FXS: '/fxs/port/fxs-settings',
  PORT_FXS_ADVANCED: '/fxs/port/fxs-advanced',

  // FXS → Advanced
  FXS_GENERAL: '/fxs/advanced/general',
  FXS_ACTION_URL: '/fxs/advanced/action-url',
  FXS_AREA_SELECT: '/fxs/advanced/area-select',
  FXS_CDR_QUERY: '/fxs/advanced/cdr-query',
  FXS_COLOR_RING: '/fxs/advanced/color-ring',
  FXS_CUE_TONE: '/fxs/advanced/cue-tone',
  FXS_DIALING_RULE: '/fxs/advanced/dialing-rule',
  FXS_DIALING_TIMEOUT: '/fxs/advanced/dialing-timeout',
  FXS_DTMF: '/fxs/advanced/dtmf',
  FXS_FUNCTION_KEY: '/fxs/advanced/function-key',
  FXS_QOS: '/fxs/advanced/qos',
  FXS_RINGING_SCHEME: '/fxs/advanced/ringing-scheme',
  FXS_TONE_DETECTOR: '/fxs/advanced/tone-detector',
  FXS_TONE_GENERATOR: '/fxs/advanced/tone-generator',

  // FXS → Route
  FXS_ROUTE: '/fxs/route/routing-parameters',
  FXS_ROUTE_IP_TO_PSTN: '/fxs/route/ip-to-pstn',
  FXS_ROUTE_PSTN_TO_IP: '/fxs/route/pstn-to-ip',

  // FXS → Num Manipulate
  FXS_IP_CALL_IN_CALLERID: '/fxs/num-manipulate/ip-call-in-callerid',
  FXS_IP_CALL_IN_CALLEEID: '/fxs/num-manipulate/ip-call-in-calleeid',
  FXS_PSTN_CALL_IN_CALLERID: '/fxs/num-manipulate/pstn-call-in-callerid',
  FXS_PSTN_CALL_IN_CALLEEID: '/fxs/num-manipulate/pstn-call-in-calleeid',

  // E1-PRI → Route
  ROUTE: '/e1-pri/route/routing-parameters',
  E1_ROUTE_IP_TO_PSTN: '/e1-pri/route/ip-to-pstn',
  E1_ROUTE_IP_TO_IP: '/e1-pri/route/ip-to-ip',
  E1_ROUTE_PSTN_TO_IP: '/e1-pri/route/pstn-to-ip',

  // E1-PRI → Number Filter
  NUMBER_FILTER: '/e1-pri/number-filter',
  NUMBER_FILTER_WHITELIST: '/e1-pri/number-filter/whitelist',
  NUMBER_FILTER_BLACKLIST: '/e1-pri/number-filter/blacklist',
  NUMBER_FILTER_POOL: '/e1-pri/number-filter/number-pool',
  NUMBER_FILTER_RULE: '/e1-pri/number-filter/filtering-rule',

  // E1-PRI → Num Manipulate
  NUM_MANIPULATE: '/e1-pri/num-manipulate',
  IP_CALL_IN_CALLERID: '/e1-pri/num-manipulate/ip-call-in-callerid',
  IP_CALL_IN_CALLEEID: '/e1-pri/num-manipulate/ip-call-in-calleeid',
  IP_CALL_IN_ORICALLEEID: '/e1-pri/num-manipulate/ip-call-in-oricalleeid',
  PSTN_CALL_IN_CALLERID: '/e1-pri/num-manipulate/pstn-call-in-callerid',
  PSTN_CALL_IN_CALLEEID: '/e1-pri/num-manipulate/pstn-call-in-calleeid',
  PSTN_CALL_IN_ORICALLEEID: '/e1-pri/num-manipulate/pstn-call-in-oricalleeid',
  CALLERID_POOL: '/e1-pri/num-manipulate/callerid-pool',
  CALLERID_RESERVE_POOL: '/e1-pri/num-manipulate/callerid-reserve-pool',

  // E1-PRI → PCM
  PCM: '/e1-pri/pcm',
  PCM_PSTN: '/e1-pri/pcm/pstn',
  PCM_CIRCUIT_MAINTENANCE: '/e1-pri/pcm/circuit-maintenance',
  PCM_TRUNK_GROUP: '/e1-pri/pcm/pcm-trunk-group',
  PCM_NUM_RECEIVING_RULE: '/e1-pri/pcm/num-receiving-rule',
  PCM_RECEPTION_TIMEOUT: '/e1-pri/pcm/reception-timeout',

  // E1-PRI → SIP
  SIP: '/e1-pri/sip',
  SIP_SIP: '/e1-pri/sip/sip',
  SIP_TO_SIP_ACCOUNT: '/e1-pri/sip/sip-to-sip-account',
  SIP_TRUNK_GROUP: '/e1-pri/sip/sip-trunk-group',
  SIP_MEDIA: '/e1-pri/sip/media',

  // Legacy / unused section roots (kept for compatibility)
  ISDN: '/isdn',
  FAX: '/fax',
  VPN: '/vpn',
  DHCP: '/dhcp',

  // System → System Settings
  GLOBAL_SIP: '/system/system-settings/global-sip',
  SYSTEM_SETTINGS_SIP_SETTINGS: '/system/system-settings/sip-settings',
  SYSTEM_SETTINGS_HA_CONFIG: '/system/system-settings/ha-config',
  SYSTEM_SETTINGS_STORAGE: '/system/system-settings/storage',
  SYSTEM_SETTINGS_MANAGEMENT: '/system/system-settings/management',
  SYSTEM_SETTINGS_CENTRALIZED_MANAGE: '/system/system-settings/centralized-manage',
  SYSTEM_SETTINGS_ASTERISK_CLI: '/system/system-settings/asterisk-cli',
  SYSTEM_SETTINGS_LINUX_CLI: '/system/system-settings/linux-cli',

  // System → Network Settings
  NETWORK_SETTINGS_NETWORK: '/system/network-settings/network',
  NETWORK_SETTINGS_ROUTING_INTERFACE: '/system/network-settings/routing-interface',
  NETWORK_SETTINGS_IP_ROUTING_TABLE: '/system/network-settings/ip-routing-table',
  NETWORK_SETTINGS_DHCP: '/system/network-settings/dhcp',
  NETWORK_SETTINGS_PING_TEST: '/system/network-settings/ping-test',
  NETWORK_SETTINGS_TRACERT_TEST: '/system/network-settings/tracert-test',
  NETWORK_SETTINGS_VPN: '/system/network-settings/vpn',

  // System → Security Rules
  SECURITY_RULES_ACCESS_CONTROL: '/system/security-rules/access-control',
  SECURITY_RULES_SIP_ACCESS_CONTROL: '/system/security-rules/sip-access-control',

  // Maintenance → System Tools
  SYSTEM_TOOLS: '/maintenance/system-tools',
  AUTHORIZATION: '/maintenance/system-tools/authorization',
  IDS_SETTINGS: '/maintenance/system-tools/ids-settings',
  DDOS_SETTINGS: '/maintenance/system-tools/ddos-settings',
  CONFIG_FILE: '/maintenance/system-tools/config-file',
  HOSTS: '/maintenance/system-tools/hosts',
  SIGNALING_CAPTURE: '/maintenance/system-tools/signaling-capture',
  SIGNALING_CALL_TEST: '/maintenance/system-tools/signaling-call-test',
  SIGNALING_CALL_TRACK: '/maintenance/system-tools/signaling-call-track',
  MODIFICATION_RECORD: '/maintenance/system-tools/modification-record',
  OPERATIONS_LOG: '/maintenance/system-tools/operations-log',
  SIP_LOG_VIEWER: '/maintenance/system-tools/sip-log-viewer',
  BACKUP_UPLOAD: '/maintenance/system-tools/backup-upload',
  FACTORY_RESET: '/maintenance/system-tools/factory-reset',
  UPGRADE: '/maintenance/system-tools/upgrade',
  RESTART: '/maintenance/system-tools/restart',
  LICENCE: '/maintenance/system-tools/licence',
  LICENSE_LIMITS: '/maintenance/system-tools/license-limits',

  // User Manage > User Permission > {page}
  USER_MANAGE: '/user-manage/user-permission/user-manage',
  USER_PERMISSION_USERS_MANAGE: '/user-manage/user-permission/user-manage',
  USER_PERMISSION_ACCOUNT_MANAGE: '/user-manage/user-permission/account-manage',
  USER_PERMISSION_CHANGE_PASSWORD: '/user-manage/user-permission/change-password',
};
