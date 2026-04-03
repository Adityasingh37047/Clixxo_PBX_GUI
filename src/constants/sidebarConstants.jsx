// constants/sidebarConstants.js
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import PhoneIcon from '@mui/icons-material/Phone';
import ComputerIcon from '@mui/icons-material/Computer';
import NetworkCheckIcon from '@mui/icons-material/NetworkCheck';
import FaxIcon from '@mui/icons-material/Fax';
import RouteIcon from '@mui/icons-material/Route';
import FilterListIcon from '@mui/icons-material/FilterList';
import EditIcon from '@mui/icons-material/Edit';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import DnsIcon from '@mui/icons-material/Dns';
import BuildIcon from '@mui/icons-material/Build';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import PhoneInTalkIcon from '@mui/icons-material/PhoneInTalk';
import SettingsPhoneIcon from '@mui/icons-material/SettingsPhone';
import { ROUTE_PATHS } from './routeConstatns';
import RecordVoiceOverIcon from '@mui/icons-material/RecordVoiceOver';
import PhoneCallbackIcon from '@mui/icons-material/PhoneCallback';
import TuneIcon from '@mui/icons-material/Tune';

export const SIDEBAR_SECTIONS = [
  {
    id: 'operationInfo',
    title: 'Operation Info',
    icon: DashboardIcon,
    hasSubmenu: true,
    path: ROUTE_PATHS.OPERATION_INFO,
    submenuItems: [
      { 
        id: 'systemInfo', 
        title: 'System Info',
        path: ROUTE_PATHS.SYSTEM_INFO 
      },
      { 
        id: 'pstnStatus', 
        title: 'PSTN Status',
        path: ROUTE_PATHS.PSTN_STATUS 
      },
      { 
        id: 'pcmInfo', 
        title: 'PCM Info',
        path: ROUTE_PATHS.PSM_INFO 
      },
      { 
        id: 'callCount', 
        title: 'Call Count',
        path: ROUTE_PATHS.CALL_COUNT 
      },
      { 
        id: 'warningInfo', 
        title: 'Warning Info',
        path: ROUTE_PATHS.WARNING_INFO 
      },
    ]
  },
  {
    id: 'sip',
    title: 'SIP',
    icon: PhoneIcon,
    hasSubmenu: true,
    path: '/sip',
    submenuItems: [
      { id: 'sipMain', title: 'SIP', path: '/sip' },
      { id: 'sipHa', title: 'HA', path: '/sip/ha' },
      { id: 'sipTrunk', title: 'SIP Trunk', path: '/sip/trunk' }, // Hidden from navigation
      { id: 'sipRegister', title: 'SIP Register', path: '/sip/register' },
      { id: 'sipToSipAccount', title: 'SIP To SIP Account', path: '/sip/sip-to-sip-account' },
      { id: 'sipTrunkGroup', title: 'SIP Trunk Group', path: '/sip/trunk-group' },
      { id: 'sipMedia', title: 'Media', path: '/sip/media' },
      { id: 'sipCompatibility', title: 'SIP Compatibility', path: ROUTE_PATHS.SIP_COMPATIBILITY },
      { id: 'sipNatSettings', title: 'NAT Settings', path: ROUTE_PATHS.SIP_NAT_SETTINGS },
    ]
  },
  
  {
    id: 'pbxConfiguration',
    title: 'PBX Configuration',
    icon: BusinessCenterIcon,
    hasSubmenu: true,
    path: '/pbx-status/active-calls',
    submenuItems: [
      {
        id: 'pbxStatus',
        title: 'PBX Status',
        icon: PhoneInTalkIcon,
        items: [
          { id: 'pbxMonitor', title: 'PBX Monitor', path: '/pbx-monitor' },
          { id: 'pbxStatusActiveCalls', title: 'Active Calls', path: '/pbx-status/active-calls' },
        ]
      },
      {
        id: 'pbxCore',
        title: 'PBX',
        icon: BusinessCenterIcon,
        items: [
          { id: 'pbxSipAccount', title: 'Extensions', path: '/sip/account' },
          { id: 'pbxExtensionGroups', title: 'Extension Groups', path: '/sip/extension-groups' },
        ]
      },
      {
        id: 'callFeatures',
        title: 'Call Features',
        icon: FilterListIcon,
        items: [
          { id: 'callFeaturesBlockedList', title: 'Blocked List', path: '/call-features/blocked-list' },
          { id: 'callFeaturesCallBack', title: 'CallBack', path: '/call-features/callback' },
          { id: 'callFeaturesOriginateCall', title: 'Originate Call', path: '/call-features/originate-call' },
          { id: 'callFeaturesIVR', title: 'IVR', path: '/call-features/ivr' },
          { id: 'callFeaturesConference', title: 'Conference', path: ROUTE_PATHS.CONFERENCE },
          { id: 'callFeaturesPickupGroup', title: 'Pickup Group', path: '/call-features/pickup-group' },
          { id: 'callFeaturesRingGroup', title: 'Ring Group', path: '/call-features/ring-group' },
          { id: 'callFeaturesPrivateGroup', title: 'Private Group', path: '/call-features/private-group' },
          { id: 'callFeaturesPaging', title: 'Paging', path: '/call-features/paging' },
          { id: 'callFeaturesSpeedDial', title: 'Speed Dial', path: '/call-features/speed-dial' },
          { id: 'callFeaturesDisa', title: 'DISA', path: '/call-features/disa' },
        ]
      },
      {
        id: 'callControl',
        title: 'Call Control',
        icon: SettingsPhoneIcon,
        items: [
          { id: 'callControlCcRoute', title: 'CC Route', path: '/call-control/cc-route' },
          { id: 'callControlInboundRoutes', title: 'Inbound Routes', path: '/call-control/inbound-routes' },
          { id: 'callControlOutboundRoutes', title: 'Outbound Routes', path: '/call-control/outbound-routes' },
        ]
      },
      {
        id: 'voicePrompts',
        title: 'Voice Prompts',
        icon: RecordVoiceOverIcon,
        items: [
          { id: 'voicePromptsSettings', title: 'Voice Prompts', path: '/voice-prompts' },
        ]
      },
    ]
  },
  {
    id: 'fxsConfiguration',
    title: 'FXS Configuration',
    icon: PhoneCallbackIcon,
    hasSubmenu: true,
    path: ROUTE_PATHS.PORT_FXS,
    submenuItems: [
      {
        id: 'fxsVoip',
        title: 'VoIP',
        icon: PhoneIcon,
        items: [
          { id: 'fxsVoipSip', title: 'FXS SIP', path: '/sip' },
          { id: 'fxsVoipMedia', title: 'FXS SIP Media', path: '/sip/media' },
          { id: 'fxsVoipCompatibility', title: 'FXS SIP Compatibility', path: ROUTE_PATHS.SIP_COMPATIBILITY },
          { id: 'fxsVoipNatSettings', title: 'FXS NAT Settings', path: ROUTE_PATHS.SIP_NAT_SETTINGS },
        ]
      },
      {
        id: 'fxsAdvanced',
        title: 'Advanced',
        icon: TuneIcon,
        items: [
          { id: 'fxsAdvancedGeneral', title: 'FXS General', path: ROUTE_PATHS.FXS_GENERAL },
          { id: 'fxsAdvancedActionUrl', title: 'FXS Action Url', path: ROUTE_PATHS.FXS_ACTION_URL },
          { id: 'fxsAdvancedAreaSelect', title: 'FXS Area Select', path: ROUTE_PATHS.FXS_AREA_SELECT },
          { id: 'fxsAdvancedCdrQuery', title: 'FXS CDR Query', path: ROUTE_PATHS.FXS_CDR_QUERY },
          { id: 'fxsAdvancedColorRing', title: 'FXS Color Ring', path: ROUTE_PATHS.FXS_COLOR_RING },
          { id: 'fxsAdvancedCueTone', title: 'FXS Cue Tone', path: ROUTE_PATHS.FXS_CUE_TONE },
          { id: 'fxsAdvancedDialingRule', title: 'FXS Dialing Rule', path: ROUTE_PATHS.FXS_DIALING_RULE },
          { id: 'fxsAdvancedDialingTimeout', title: 'FXS Dialing Timeout', path: ROUTE_PATHS.FXS_DIALING_TIMEOUT },
          { id: 'fxsAdvancedDtmf', title: 'FXS DTMF', path: ROUTE_PATHS.FXS_DTMF },
          { id: 'fxsAdvancedFunctionKey', title: 'FXS Function Key', path: ROUTE_PATHS.FXS_FUNCTION_KEY },
          { id: 'fxsAdvancedQos', title: 'FXS QoS', path: ROUTE_PATHS.FXS_QOS },
          { id: 'fxsAdvancedRinging', title: 'FXS Ringing Scheme', path: ROUTE_PATHS.FXS_RINGING_SCHEME },
          { id: 'fxsAdvancedToneDetector', title: 'FXS Tone Detecter', path: ROUTE_PATHS.FXS_TONE_DETECTOR },
          { id: 'fxsAdvancedToneGenerator', title: 'FXS Tone Generator', path: ROUTE_PATHS.FXS_TONE_GENERATOR },
        ]
      },
      {
        id: 'fxsPort',
        title: 'Port',
        icon: PeopleIcon,
        items: [
          { id: 'fxsPortGroup', title: 'FXS Port Group', path: ROUTE_PATHS.PORT_GROUP },
          { id: 'fxsPortSettings', title: 'FXS Settings', path: ROUTE_PATHS.PORT_FXS },
          { id: 'fxsPortAdvanced', title: 'FXS Advanced', path: ROUTE_PATHS.PORT_FXS_ADVANCED },
        ]
      },
      {
        id: 'fxsRouting',
        title: 'FXS Routing',
        icon: RouteIcon,
        items: [
          { id: 'fxsRoutingParameters', title: 'FXS Routing Parameters', path: '/route' },
          { id: 'fxsRoutingIpToPstn', title: 'FXS IP->PSTN', path: '/route/ip-to-pstn' },
          { id: 'fxsRoutingIpToIp', title: 'FXS IP->IP', path: '/route/ip-to-ip' },
          { id: 'fxsRoutingPstnToIp', title: 'FXS PSTN->IP', path: '/route/pstn-to-ip' },
        ]
      },
      {
        id: 'fxsNumberManipulate',
        title: 'FXS Number Manipulate',
        icon: EditIcon,
        items: [
          { id: 'fxsIpCallInCallerID', title: 'FXS IP Call In CallerID', path: ROUTE_PATHS.IP_CALL_IN_CALLERID },
          { id: 'fxsIpCallInCalleeID', title: 'FXS IP Call In CalleeID', path: ROUTE_PATHS.IP_CALL_IN_CALLEEID },
          { id: 'fxsPstnCallInCallerID', title: 'FXS PSTN Call In CallerID', path: ROUTE_PATHS.PSTN_CALL_IN_CALLERID },
          { id: 'fxsPstnCallInCalleeID', title: 'FXS PSTN Call In CalleeID', path: ROUTE_PATHS.PSTN_CALL_IN_CALLEEID },
        ]
      },
    ]
  },

  {
    id: 'pcm',
    title: 'PCM',
    icon: ComputerIcon,
    hasSubmenu: true,
    path: ROUTE_PATHS.PCM,
    submenuItems: [
      { id: 'pcmPstn', title: 'PSTN', path: '/pcm/pstn' },
      { id: 'pcmCircuitMaintenance', title: 'Circuit Maintenance', path: '/pcm/circuit-maintenance' },
      // { id: 'pcmPcm', title: 'PCM', path: '/pcm/pcm' },
      // { id: 'pcmTrunk', title: 'PCM Trunk', path: '/pcm/trunk' },
      { id: 'pcmTrunkGroup', title: 'PCM Trunk Group', path: '/pcm/trunk-group' },
      { id: 'pcmNumReceivingRule', title: 'Num-Receiving Rule', path: '/pcm/num-receiving-rule' },
      { id: 'pcmReceptionTimeout', title: 'Reception Timeout', path: '/pcm/reception-timeout' },
    ]
  },
  {
    id: 'isdn',
    title: 'ISDN',
    icon: NetworkCheckIcon,
    hasSubmenu: true,
    path: ROUTE_PATHS.ISDN,
    submenuItems: [
      { id: 'isdnMain', title: 'ISDN', path: '/isdn/isdn' },
      { id: 'isdnNumberParameter', title: 'Number Parameter', path: '/isdn/number-parameter' }
    ]
  },
  {
    id: 'fax',
    title: 'FAX',
    icon: FaxIcon,
    hasSubmenu: true,
    path: ROUTE_PATHS.FAX,
    submenuItems: [
      { id: 'faxMain', title: 'Fax', path: '/fax' }
    ]
  },
  {
    id: 'route',
    title: 'Route',
    icon: RouteIcon,
    hasSubmenu: true,
    path: ROUTE_PATHS.ROUTE,
    submenuItems: [
      { id: 'routingParameters', title: 'Routing Parameters', path: '/route' },
      { id: 'ipToPstn', title: 'IP->PSTN', path: '/route/ip-to-pstn' },
      { id: 'ipToIp', title: 'IP->IP', path: '/route/ip-to-ip' },
      { id: 'pstnToIp', title: 'PSTN->IP', path: '/route/pstn-to-ip' }
    ]
  },
  {
    id: 'numberFilter',
    title: 'Number Filter',
    icon: FilterListIcon,
    hasSubmenu: true,
    path: ROUTE_PATHS.NUMBER_FILTER,
    submenuItems: [
      { id: 'whitelist', title: 'Whitelist', path: '/number-filter/whitelist' },
      { id: 'blacklist', title: 'Blacklist', path: '/number-filter/blacklist' },
      { id: 'numberPool', title: 'Number Pool', path: '/number-filter/number-pool' },
      { id: 'filteringRule', title: 'Filtering Rule', path: '/number-filter/filtering-rule' },
    ]
  },
  {
    id: 'manipulate',
    title: 'Num Manipulate',
    icon: EditIcon,
    hasSubmenu: true,
    path: ROUTE_PATHS.NUM_MANIPULATE,
    submenuItems: [
      { id: 'ipCallInCallerID', title: 'IP Call In CallerID', path: ROUTE_PATHS.IP_CALL_IN_CALLERID },
      { id: 'ipCallInCalleeID', title: 'IP Call In CalleeID', path: ROUTE_PATHS.IP_CALL_IN_CALLEEID },
      { id: 'ipCallInOriCalleeID', title: 'IP Call In OriCalleeID', path: ROUTE_PATHS.IP_CALL_IN_ORICALLEEID },
      { id: 'pstnCallInCallerID', title: 'PSTN Call In CallerID', path: ROUTE_PATHS.PSTN_CALL_IN_CALLERID },
      { id: 'pstnCallInCalleeID', title: 'PSTN Call In CalleeID', path: ROUTE_PATHS.PSTN_CALL_IN_CALLEEID },
      { id: 'pstnCallInOriCalleeID', title: 'PSTN Call In OriCalleeID', path: ROUTE_PATHS.PSTN_CALL_IN_ORICALLEEID },
      { id: 'callerIDPool', title: 'CallerID Pool', path: ROUTE_PATHS.CALLERID_POOL },
      { id: 'callerIDReservePool', title: 'CallerID Reserve Pool', path: ROUTE_PATHS.CALLERID_RESERVE_POOL },
    ]
  },
  {
    id: 'vpn',
    title: 'VPN',
    icon: VpnKeyIcon,
    hasSubmenu: true,
    path: '/vpn',
    submenuItems: [
      { id: 'vpnServerSettings', title: 'VPN Server Settings', path: '/vpn/server-settings' },
      { id: 'vpnAccount', title: 'VPN Account', path: '/vpn/account' },
    ]
  },
  {
    id: 'dhcp',
    title: 'DHCP',
    icon: DnsIcon,
    hasSubmenu: true,
    path: ROUTE_PATHS.DHCP,
    submenuItems: [
      { id: 'dhcpServerSettings', title: 'DHCP Server Settings', path: '/dhcp/server-settings' },
    ]
  },
  {
    id: 'systemTools',
    title: 'System Tools',
    icon: BuildIcon,
    hasSubmenu: true,
    path: ROUTE_PATHS.SYSTEM_TOOLS,
    submenuItems: [
      { id: 'network', title: 'Network', path: '/system-tools/network' },
      { id: 'authorization', title: 'Authorization', path: '/system-tools/authorization' },
      { id: 'management', title: 'Management', path: '/system-tools/management' },
      { id: 'ipRoutingTable', title: 'IP Routing Table', path: '/system-tools/ip-routing-table' },
      { id: 'accessControl', title: 'Access Control', path: '/system-tools/access-control' },
      { id: 'idsSettings', title: 'IDS Settings', path: '/system-tools/ids-settings' },
      { id: 'ddosSettings', title: 'DDOS Settings', path: '/system-tools/ddos-settings' },
      { id: 'vpn', title: 'VPN', path: '/system-tools/vpn' },
      { id: 'certificateManage', title: 'Certificate Manage', path: '/system-tools/certificate-manage' },
      { id: 'centralizedManage', title: 'Centralized Manage', path: '/system-tools/centralized-manage' },
      { id: 'radius', title: 'Radius', path: '/system-tools/radius' },
      { id: 'sipAccountGenerator', title: 'SIP Account Generator', path: '/system-tools/sip-account-generator' },
      { id: 'configFile', title: 'Config File', path: '/system-tools/config-file' },
      { id: 'hosts', title: 'Hosts', path: '/system-tools/hosts' },
      { id: 'signalingCapture', title: 'Signaling Capture', path: '/system-tools/signaling-capture' },
      { id: 'signalingCallTest', title: 'Signaling Call Test', path: '/system-tools/signaling-call-test' },
      { id: 'signalingCallTrack', title: 'Signaling Call Track', path: '/system-tools/signaling-call-track' },
      { id: 'pingTest', title: 'PING Test', path: '/system-tools/ping-test' },
      { id: 'tracertTest', title: 'TRACERT Test', path: '/system-tools/tracert-test' },
      { id: 'modificationRecord', title: 'Modification Record', path: '/system-tools/modification-record' },
      { id: 'backupUpload', title: 'Backup & Upload', path: '/system-tools/backup-upload' },
      { id: 'factoryReset', title: 'Factory Reset', path: '/system-tools/factory-reset' },
      { id: 'upgrade', title: 'Upgrade', path: '/system-tools/upgrade' },
      { id: 'accountManage', title: 'Account Manage', path: '/system-tools/account-manage' },
      { id: 'changePassword', title: 'Change Password', path: '/system-tools/change-password' },
      { id: 'deviceLock', title: 'Device Lock', path: '/system-tools/device-lock' },
      { id: 'restart', title: 'Restart', path: '/system-tools/restart' },
      { id: 'licence', title: 'Licence', path: '/system-tools/licence' },
      { id: 'asteriskCLI', title: 'Asterisk CLI', path: '/system-tools/asterisk-cli' },
      { id: 'linuxCLI', title: 'Linux CLI', path: '/system-tools/linux-cli' },
      { id: 'sqlUpload', title: 'SQL Upload', path: '/system-tools/sql-upload' },
    ]
  }
];
