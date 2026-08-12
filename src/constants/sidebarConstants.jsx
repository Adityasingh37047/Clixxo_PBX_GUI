// constants/sidebarConstants.js
import DashboardIcon from "@mui/icons-material/Dashboard";
import PeopleIcon from "@mui/icons-material/People";
import PhoneIcon from "@mui/icons-material/Phone";
import ComputerIcon from "@mui/icons-material/Computer";
import NetworkCheckIcon from "@mui/icons-material/NetworkCheck";
import FaxIcon from "@mui/icons-material/Fax";
import RouteIcon from "@mui/icons-material/Route";
import FilterListIcon from "@mui/icons-material/FilterList";
import EditIcon from "@mui/icons-material/Edit";
import VpnKeyIcon from "@mui/icons-material/VpnKey";
import DnsIcon from "@mui/icons-material/Dns";
import BuildIcon from "@mui/icons-material/Build";
import BusinessCenterIcon from "@mui/icons-material/BusinessCenter";
import PhoneInTalkIcon from "@mui/icons-material/PhoneInTalk";
import SettingsPhoneIcon from "@mui/icons-material/SettingsPhone";
import SecurityIcon from "@mui/icons-material/Security";
import { ROUTE_PATHS } from "./routeConstants";
import RecordVoiceOverIcon from "@mui/icons-material/RecordVoiceOver";
import PhoneCallbackIcon from "@mui/icons-material/PhoneCallback";
import TuneIcon from "@mui/icons-material/Tune";

export const SIDEBAR_SECTIONS = [
  // Status

  {
    id: "status",
    title: "Status",
    icon: DashboardIcon,
    hasSubmenu: true,
    path: "/status",
    submenuItems: [
      {
        id: "SystemStatus",
        title: "System Status",
        icon: PhoneInTalkIcon,
        items: [
          {
            id: "systemInfo",
            title: "System Info",
            path: ROUTE_PATHS.SYSTEM_INFO,
          },
        ],
      },
      {
        id: "pbxStatus",
        title: "PBX Status",
        icon: PhoneInTalkIcon,
        items: [
          {
            id: "pbxMonitor",
            title: "PBX Monitor",
            path: ROUTE_PATHS.PBX_MONITOR,
          },
          {
            id: "ActiveCalls",
            title: "Active Calls",
            path: ROUTE_PATHS.ACTIVE_CALLS,
          },
          {
            id: "activecallqueue",
            title: "Active Call Queue",
            path: ROUTE_PATHS.ACTIVE_CALL_QUEUE,
          },
          {
            id: "viewVoicemail",
            title: "View Voicemail",
            path: ROUTE_PATHS.VIEW_VOICEMAIL,
          },
          {
            id: "haStatus",
            title: "HA Status",
            path: ROUTE_PATHS.HA_STATUS,
          },
        ],
      },
    ],
  },

  // CDR

  {
    id: "cdr",
    title: "CDR",
    icon: PhoneInTalkIcon,
    hasSubmenu: true,
    path: "/cdr",
    submenuItems: [
      {
        id: "calldetailrecords",
        title: "Call Detail Records",
        icon: PhoneInTalkIcon,
        items: [
          {
            id: "callCount",
            title: "Call Count",
            path: ROUTE_PATHS.CALL_COUNT,
          },
        ],
      },
    ],
  },

  // PBX

  {
    id: "pbx",
    title: "PBX",
    icon: BusinessCenterIcon,
    hasSubmenu: true,
    path: "/pbx",
    submenuItems: [
      {
        id: "extensions",
        title: "Extensions",
        icon: PhoneInTalkIcon,
        items: [
          {
            id: "pbxSipAccount",
            title: "Extensions",
            path: ROUTE_PATHS.EXTENSIONS,
          },
          {
            id: "pbxExtensionGroups",
            title: "Extension Groups",
            path: ROUTE_PATHS.EXTENSION_GROUPS,
          },
        ],
      },
      {
        id: "trunks",
        title: "Trunks",
        icon: PhoneInTalkIcon,
        items: [
          {
            id: "sipRegister",
            title: "SIP Register",
            path: ROUTE_PATHS.SIP_REGISTER,
          },
        ],
      },

      {
        id: "callControl",
        title: "Call Control",
        icon: SettingsPhoneIcon,
        items: [
          {
            id: "callControlCcRoute",
            title: "CC Route",
            path: ROUTE_PATHS.CC_ROUTE,
          },
          {
            id: "callControlInboundRoutes",
            title: "Inbound Routes",
            path: ROUTE_PATHS.INBOUND_ROUTES,
          },
          {
            id: "callControlOutboundRoutes",
            title: "Outbound Routes",
            path: ROUTE_PATHS.OUTBOUND_ROUTES,
          },
          {
            id: "OutboundRestrictions",
            title: "Outbound Restrictions",
            path: ROUTE_PATHS.OUTBOUND_RESTRICTIONS,
          },
          {
            id: "callControlTimeCondition",
            title: "Time Condition",
            path: ROUTE_PATHS.TIME_CONDITION,
          },
        ],
      },

      {
        id: "callFeatures",
        title: "Call Features",
        icon: FilterListIcon,
        items: [
          {
            id: "callFeaturesBlockedList",
            title: "Blocked List",
            path: ROUTE_PATHS.BLOCKED_LIST,
          },
          {
            id: "callFeaturesCallBack",
            title: "CallBack",
            path: ROUTE_PATHS.CALLBACK,
          },
          {
            id: "callFeaturesOriginateCall",
            title: "Originate Call",
            path: ROUTE_PATHS.ORIGINATE_CALL,
          },
          { id: "callFeaturesIVR", title: "IVR", path: ROUTE_PATHS.IVR },
          {
            id: "callFeaturesConference",
            title: "Conference",
            path: ROUTE_PATHS.CONFERENCE,
          },
          {
            id: "callFeaturesCallQueue",
            title: "CallQueue",
            path: ROUTE_PATHS.CALL_QUEUE,
          },
          {
            id: "callFeaturesPickupGroup",
            title: "Pickup Group",
            path: ROUTE_PATHS.PICKUP_GROUP,
          },
          {
            id: "callFeaturesRingGroup",
            title: "Ring Group",
            path: ROUTE_PATHS.RING_GROUP,
          },
          {
            id: "callFeaturesPrivateGroup",
            title: "Private Group",
            path: ROUTE_PATHS.PRIVATE_GROUP,
          },
          {
            id: "callFeaturesPaging",
            title: "Paging",
            path: ROUTE_PATHS.PAGING,
          },
          {
            id: "callFeaturesSpeedDial",
            title: "Speed Dial",
            path: ROUTE_PATHS.SPEED_DIAL,
          },
          {
            id: "callFeaturesDisa",
            title: "DISA",
            path: ROUTE_PATHS.DISA,
          },
        ],
      },
      {
        id: "recordSettings",
        title: "Record Settings",
        icon: RecordVoiceOverIcon,
        items: [
          {
            id: "recordSettingsPage",
            title: "Record Settings",
            path: ROUTE_PATHS.RECORD_SETTINGS,
          },
        ],
      },
      {
        id: "voicePrompts",
        title: "Voice Prompts",
        icon: RecordVoiceOverIcon,
        items: [
          {
            id: "voicePromptsSettings",
            title: "Voice Prompts",
            path: ROUTE_PATHS.VOICE_PROMPTS,
          },
        ],
      },

      {
        id: "FeatureCode",
        title: "Feature Codes",
        icon: TuneIcon,
        items: [
          {
            id: "featureCodeSettings",
            title: "Feature Codes",
            path: ROUTE_PATHS.FEATURE_CODE,
          },
        ],
      },

      {
        id: "Voicemail",
        title: "Voicemail",
        icon: TuneIcon,
        items: [
          {
            id: "voicemailSettings",
            title: "Voicemail",
            path: ROUTE_PATHS.VOICEMAIL,
          },
        ],
      },
      {
        id: "autoProvision",
        title: "Auto Provision",
        icon: TuneIcon,
        items: [
          {
            id: "autoProvisionSettings",
            title: "Auto Provision",
            path: ROUTE_PATHS.AUTO_PROVISION,
          },
        ],
      },
    ],
  },

  // FXS

  {
    id: "fxs",
    title: "FXS",
    icon: FaxIcon,
    hasSubmenu: true,
    path: ROUTE_PATHS.PORT_FXS,
    submenuItems: [
      {
        id: "fxsVoip",
        title: "VoIP",
        icon: PhoneIcon,
        items: [
          { id: "fxsVoipSip", title: "SIP", path: ROUTE_PATHS.FXS_VOIP_SIP },
          {
            id: "fxsVoipMedia",
            title: "Media",
            path: ROUTE_PATHS.FXS_VOIP_MEDIA,
          },
          {
            id: "fxsVoipCompatibility",
            title: "SIP Compatibility",
            path: ROUTE_PATHS.SIP_COMPATIBILITY,
          },
          {
            id: "fxsVoipNatSettings",
            title: "NAT Settings",
            path: ROUTE_PATHS.SIP_NAT_SETTINGS,
          },
        ],
      },
      {
        id: "fxsAdvanced",
        title: "Advanced",
        icon: TuneIcon,
        items: [
          {
            id: "fxsAdvancedGeneral",
            title: "General",
            path: ROUTE_PATHS.FXS_GENERAL,
          },
          {
            id: "fxsAdvancedActionUrl",
            title: "Action Url",
            path: ROUTE_PATHS.FXS_ACTION_URL,
          },
          {
            id: "fxsAdvancedAreaSelect",
            title: "Area Select",
            path: ROUTE_PATHS.FXS_AREA_SELECT,
          },
          {
            id: "fxsAdvancedCdrQuery",
            title: "CDR Query",
            path: ROUTE_PATHS.FXS_CDR_QUERY,
          },
          {
            id: "fxsAdvancedColorRing",
            title: "Color Ring",
            path: ROUTE_PATHS.FXS_COLOR_RING,
          },
          {
            id: "fxsAdvancedCueTone",
            title: "Cue Tone",
            path: ROUTE_PATHS.FXS_CUE_TONE,
          },
          {
            id: "fxsAdvancedDialingRule",
            title: "Dialing Rule",
            path: ROUTE_PATHS.FXS_DIALING_RULE,
          },
          {
            id: "fxsAdvancedDialingTimeout",
            title: "Dialing Timeout",
            path: ROUTE_PATHS.FXS_DIALING_TIMEOUT,
          },
          { id: "fxsAdvancedDtmf", title: "DTMF", path: ROUTE_PATHS.FXS_DTMF },
          {
            id: "fxsAdvancedFunctionKey",
            title: "Function Key",
            path: ROUTE_PATHS.FXS_FUNCTION_KEY,
          },
          { id: "fxsAdvancedQos", title: "QoS", path: ROUTE_PATHS.FXS_QOS },
          {
            id: "fxsAdvancedRinging",
            title: "Ringing Scheme",
            path: ROUTE_PATHS.FXS_RINGING_SCHEME,
          },
          {
            id: "fxsAdvancedToneDetector",
            title: "Tone Detecter",
            path: ROUTE_PATHS.FXS_TONE_DETECTOR,
          },
          {
            id: "fxsAdvancedToneGenerator",
            title: "Tone Generator",
            path: ROUTE_PATHS.FXS_TONE_GENERATOR,
          },
        ],
      },
      {
        id: "fxsPort",
        title: "Port",
        icon: PeopleIcon,
        items: [
          {
            id: "fxsPortGroup",
            title: "Port Group",
            path: ROUTE_PATHS.PORT_GROUP,
          },
          {
            id: "fxsPortSettings",
            title: "FXS Settings",
            path: ROUTE_PATHS.PORT_FXS,
          },
          {
            id: "fxsPortAdvanced",
            title: "FXS Advanced",
            path: ROUTE_PATHS.PORT_FXS_ADVANCED,
          },
        ],
      },
      {
        id: "fxsRoute",
        title: "Route",
        icon: RouteIcon,
        items: [
          {
            id: "fxsRoutingParameters",
            title: "Routing Parameters",
            path: ROUTE_PATHS.FXS_ROUTE,
          },
          {
            id: "fxsIpToPstn",
            title: "IP->Tel",
            path: ROUTE_PATHS.FXS_ROUTE_IP_TO_PSTN,
          },
          {
            id: "fxsPstnToIp",
            title: "Tel->IP",
            path: ROUTE_PATHS.FXS_ROUTE_PSTN_TO_IP,
          },
        ],
      },
      {
        id: "fxsNumManipulate",
        title: "Num Manipulate",
        icon: EditIcon,
        items: [
          {
            id: "fxsIpCallInCallerID",
            title: "IP Call In CallerID",
            path: ROUTE_PATHS.FXS_IP_CALL_IN_CALLERID,
          },
          {
            id: "fxsIpCallInCalleeID",
            title: "IP Call In CalleeID",
            path: ROUTE_PATHS.FXS_IP_CALL_IN_CALLEEID,
          },
          {
            id: "fxsPstnCallInCallerID",
            title: "PSTN Call In CallerID",
            path: ROUTE_PATHS.FXS_PSTN_CALL_IN_CALLERID,
          },
          {
            id: "fxsPstnCallInCalleeID",
            title: "PSTN Call In CalleeID",
            path: ROUTE_PATHS.FXS_PSTN_CALL_IN_CALLEEID,
          },
        ],
      },
    ],
  },

  //E1-PRI

  {
    id: "E1-PRI",
    title: "E1-PRI",
    icon: PhoneCallbackIcon,
    hasSubmenu: true,
    path: "/e1-pri",
    submenuItems: [
      {
        id: "route",
        title: "Route",
        icon: RouteIcon,
        hasSubmenu: true,
        path: ROUTE_PATHS.ROUTE,
        items: [
          {
            id: "routingParameters",
            title: "Routing Parameters",
            path: ROUTE_PATHS.ROUTE,
          },
          {
            id: "ipToPstn",
            title: "IP->PSTN",
            path: ROUTE_PATHS.E1_ROUTE_IP_TO_PSTN,
          },
          {
            id: "ipToIp",
            title: "IP->IP",
            path: ROUTE_PATHS.E1_ROUTE_IP_TO_IP,
          },
          {
            id: "pstnToIp",
            title: "PSTN->IP",
            path: ROUTE_PATHS.E1_ROUTE_PSTN_TO_IP,
          },
        ],
      },

      {
        id: "numberfilter",
        title: "Number Filter",
        icon: FilterListIcon,
        hasSubmenu: true,
        path: ROUTE_PATHS.NUMBER_FILTER,
        items: [
          {
            id: "whitelist",
            title: "Whitelist",
            path: ROUTE_PATHS.NUMBER_FILTER_WHITELIST,
          },
          {
            id: "blacklist",
            title: "Blacklist",
            path: ROUTE_PATHS.NUMBER_FILTER_BLACKLIST,
          },
          {
            id: "numberPool",
            title: "Number Pool",
            path: ROUTE_PATHS.NUMBER_FILTER_POOL,
          },
          {
            id: "filteringRule",
            title: "Filtering Rule",
            path: ROUTE_PATHS.NUMBER_FILTER_RULE,
          },
        ],
      },

      {
        id: "numbermanipulate",
        title: "Num Manipulate",
        icon: EditIcon,
        hasSubmenu: true,
        path: ROUTE_PATHS.NUM_MANIPULATE,
        items: [
          {
            id: "ipCallInCallerID",
            title: "IP Call In CallerID",
            path: ROUTE_PATHS.IP_CALL_IN_CALLERID,
          },
          {
            id: "ipCallInCalleeID",
            title: "IP Call In CalleeID",
            path: ROUTE_PATHS.IP_CALL_IN_CALLEEID,
          },
          {
            id: "ipCallInOriCalleeID",
            title: "IP Call In OriCalleeID",
            path: ROUTE_PATHS.IP_CALL_IN_ORICALLEEID,
          },
          {
            id: "pstnCallInCallerID",
            title: "PSTN Call In CallerID",
            path: ROUTE_PATHS.PSTN_CALL_IN_CALLERID,
          },
          {
            id: "pstnCallInCalleeID",
            title: "PSTN Call In CalleeID",
            path: ROUTE_PATHS.PSTN_CALL_IN_CALLEEID,
          },
          {
            id: "pstnCallInOriCalleeID",
            title: "PSTN Call In OriCalleeID",
            path: ROUTE_PATHS.PSTN_CALL_IN_ORICALLEEID,
          },
          // { id: 'callerIDPool', title: 'CallerID Pool', path: ROUTE_PATHS.CALLERID_POOL },
          // { id: 'callerIDReservePool', title: 'CallerID Reserve Pool', path: ROUTE_PATHS.CALLERID_RESERVE_POOL },
        ],
      },
      {
        id: "pcm",
        title: "PCM",
        icon: ComputerIcon,
        hasSubmenu: true,
        path: ROUTE_PATHS.PCM,
        items: [
          { id: "pcmPstn", title: "PSTN", path: ROUTE_PATHS.PCM_PSTN },
          {
            id: "pcmCircuitMaintenance",
            title: "Circuit Maintenance",
            path: ROUTE_PATHS.PCM_CIRCUIT_MAINTENANCE,
          },
          {
            id: "pcmTrunkGroup",
            title: "PCM Trunk Group",
            path: ROUTE_PATHS.PCM_TRUNK_GROUP,
          },
          {
            id: "pcmNumReceivingRule",
            title: "Num-Receiving Rule",
            path: ROUTE_PATHS.PCM_NUM_RECEIVING_RULE,
          },
          {
            id: "pcmReceptionTimeout",
            title: "Reception Timeout",
            path: ROUTE_PATHS.PCM_RECEPTION_TIMEOUT,
          },
        ],
      },
      {
        id: "sip",
        title: "SIP",
        icon: PhoneIcon,
        hasSubmenu: true,
        path: ROUTE_PATHS.SIP,
        items: [
          { id: "sipMain", title: "SIP", path: ROUTE_PATHS.SIP_SIP },
          // { id: 'sipHa', title: 'HA', path: '/sip/ha' },
          {
            id: "sipToSipAccount",
            title: "SIP To SIP Account",
            path: ROUTE_PATHS.SIP_TO_SIP_ACCOUNT,
          },
          {
            id: "sipTrunkGroup",
            title: "SIP Trunk Group",
            path: ROUTE_PATHS.SIP_TRUNK_GROUP,
          },
          { id: "sipMedia", title: "Media", path: ROUTE_PATHS.SIP_MEDIA },
        ],
      },
    ],
  },

  // System

  {
    id: "system",
    title: "System",
    icon: ComputerIcon,
    hasSubmenu: true,
    path: ROUTE_PATHS.SYSTEM_SETTINGS_STORAGE,
    submenuItems: [
      {
        id: "systemSettings",
        title: "System Settings",
        icon: TuneIcon,
        items: [
          {
            id: "sysStorage",
            title: "Storage",
            path: ROUTE_PATHS.SYSTEM_SETTINGS_STORAGE,
          },
          {
            id: "sysManagement",
            title: "Management",
            path: ROUTE_PATHS.SYSTEM_SETTINGS_MANAGEMENT,
          },
          {
            id: "sysGlobalSip",
            title: "Global SIP",
            path: ROUTE_PATHS.GLOBAL_SIP,
          },
          {
            id: "sysSipSettings",
            title: "SIP Settings",
            path: ROUTE_PATHS.SYSTEM_SETTINGS_SIP_SETTINGS,
          },
          {
            id: "sysHaConfig",
            title: "High Availability",
            path: ROUTE_PATHS.SYSTEM_SETTINGS_HA_CONFIG,
          },
          {
            id: "sysCentralizedManage",
            title: "Centralized Manage",
            path: ROUTE_PATHS.SYSTEM_SETTINGS_CENTRALIZED_MANAGE,
          },
          {
            id: "sysAsteriskCLI",
            title: "Asterisk CLI",
            path: ROUTE_PATHS.SYSTEM_SETTINGS_ASTERISK_CLI,
          },
          {
            id: "sysLinuxCLI",
            title: "Linux CLI",
            path: ROUTE_PATHS.SYSTEM_SETTINGS_LINUX_CLI,
          },
        ],
      },
      {
        id: "networkSettings",
        title: "Network Settings",
        icon: NetworkCheckIcon,
        items: [
          { id: "sysNetwork", title: "Network", path: ROUTE_PATHS.NETWORK_SETTINGS_NETWORK },
          {
            id: "sysRoutingInterface",
            title: "Routing Interface",
            path: ROUTE_PATHS.NETWORK_SETTINGS_ROUTING_INTERFACE,
          },
          {
            id: "sysIpRoutingTable",
            title: "IP Route Table",
            path: ROUTE_PATHS.NETWORK_SETTINGS_IP_ROUTING_TABLE,
          },
          { id: "sysDhcp", title: "DHCP", path: ROUTE_PATHS.NETWORK_SETTINGS_DHCP },
          {
            id: "sysPingTest",
            title: "Ping Test",
            path: ROUTE_PATHS.NETWORK_SETTINGS_PING_TEST,
          },
          {
            id: "sysTracertTest",
            title: "Tracert Test",
            path: ROUTE_PATHS.NETWORK_SETTINGS_TRACERT_TEST,
          },
          { id: "sysVpn", title: "VPN", path: ROUTE_PATHS.NETWORK_SETTINGS_VPN },
        ],
      },
      {
        id: "securityRules",
        title: "Security Rules",
        icon: SecurityIcon,
        items: [
          {
            id: "sysAccessControl",
            title: "Access Control",
            path: ROUTE_PATHS.SECURITY_RULES_ACCESS_CONTROL,
          },
          {
            id: "sysSipAccessControl",
            title: "SIP Access Control",
            path: ROUTE_PATHS.SECURITY_RULES_SIP_ACCESS_CONTROL,
          },
        ],
      },
    ],
  },

  //Maintenance

  {
    id: "maintenance",
    title: "Maintenance",
    icon: BuildIcon,
    hasSubmenu: true,
    path: ROUTE_PATHS.SYSTEM_TOOLS,
    submenuItems: [
      {
        id: "systemTools",
        title: "System Tools",
        icon: BuildIcon,
        hasSubmenu: true,
        path: ROUTE_PATHS.SYSTEM_TOOLS,
        items: [
          {
            id: "authorization",
            title: "Authorization",
            path: ROUTE_PATHS.AUTHORIZATION,
          },
          {
            id: "idsSettings",
            title: "IDS Settings",
            path: ROUTE_PATHS.IDS_SETTINGS,
          },
          {
            id: "ddosSettings",
            title: "DDOS Settings",
            path: ROUTE_PATHS.DDOS_SETTINGS,
          },
          {
            id: "configFile",
            title: "Config File",
            path: ROUTE_PATHS.CONFIG_FILE,
          },
          { id: "hosts", title: "Hosts", path: ROUTE_PATHS.HOSTS },
          {
            id: "signalingCapture",
            title: "Signaling Capture",
            path: ROUTE_PATHS.SIGNALING_CAPTURE,
          },
          {
            id: "signalingCallTest",
            title: "Signaling Call Test",
            path: ROUTE_PATHS.SIGNALING_CALL_TEST,
          },
          {
            id: "signalingCallTrack",
            title: "Signaling Call Track",
            path: ROUTE_PATHS.SIGNALING_CALL_TRACK,
          },
          {
            id: "modificationRecord",
            title: "Modification Record",
            path: ROUTE_PATHS.MODIFICATION_RECORD,
          },
          {
            id: "operationsLog",
            title: "Operation Log",
            path: ROUTE_PATHS.OPERATIONS_LOG,
          },
          {
            id: "sipLogViewer",
            title: "SIP Log Viewer",
            path: ROUTE_PATHS.SIP_LOG_VIEWER,
          },
          {
            id: "backupUpload",
            title: "Backup & Upload",
            path: ROUTE_PATHS.BACKUP_UPLOAD,
          },
          {
            id: "factoryReset",
            title: "Factory Reset",
            path: ROUTE_PATHS.FACTORY_RESET,
          },
          { id: "upgrade", title: "Upgrade", path: ROUTE_PATHS.UPGRADE },
          { id: "restart", title: "Restart", path: ROUTE_PATHS.RESTART },
          { id: "licence", title: "Licence", path: ROUTE_PATHS.LICENCE },
          {
            id: "licenseLimits",
            title: "License Limits",
            path: ROUTE_PATHS.LICENSE_LIMITS,
          },
        ],
      },
    ],
  },

  {
    id: "userManage",
    title: "User Manage",
    icon: PeopleIcon,
    hasSubmenu: true,
    path: ROUTE_PATHS.USER_MANAGE,
    submenuItems: [
      {
        id: "userPermission",
        title: "User Permission",
        icon: VpnKeyIcon,
        items: [
          { id: "userList", title: "User Manage", path: ROUTE_PATHS.USER_PERMISSION_USERS_MANAGE },
          {
            id: "accountManage",
            title: "Account Manage",
            path: ROUTE_PATHS.USER_PERMISSION_ACCOUNT_MANAGE,
          },
          {
            id: "changePassword",
            title: "Change Password",
            path: ROUTE_PATHS.USER_PERMISSION_CHANGE_PASSWORD,
          },
        ],
      },
    ],
  },
];

// --------------------------------------------------------------------------------------------------------

// FXS Routing

// {
//   id: 'fxsRouting',
//   title: 'FXS Routing',
//   icon: RouteIcon,
//   items: [
//     { id: 'fxsRoutingParameters', title: 'Routing Parameters', path: ROUTE_PATHS.ROUTE },
//     { id: 'fxsRoutingIpToPstn', title: 'IP->PSTN', path: '/route/ip-to-pstn' },
//     { id: 'fxsRoutingIpToIp', title: 'IP->IP', path: '/route/ip-to-ip' },
//     { id: 'fxsRoutingPstnToIp', title: 'PSTN->IP', path: '/route/pstn-to-ip' },
//   ]
// },
// {
//   id: 'fxsNumberManipulate',
//   title: 'FXS Number Manipulate',
//   icon: EditIcon,
//   items: [
//     { id: 'fxsIpCallInCallerID', title: 'IP Call In CallerID', path: ROUTE_PATHS.IP_CALL_IN_CALLERID },
//     { id: 'fxsIpCallInCalleeID', title: 'IP Call In CalleeID', path: ROUTE_PATHS.IP_CALL_IN_CALLEEID },
//     { id: 'fxsIpCallInOriCalleeID', title: 'IP Call In OriCalleeID', path: ROUTE_PATHS.IP_CALL_IN_ORICALLEEID },
//     { id: 'fxsPstnCallInCallerID', title: 'PSTN Call In CallerID', path: ROUTE_PATHS.PSTN_CALL_IN_CALLERID },
//     { id: 'fxsPstnCallInCalleeID', title: 'PSTN Call In CalleeID', path: ROUTE_PATHS.PSTN_CALL_IN_CALLEEID },
//     { id: 'fxsPstnCallInOriCalleeID', title: 'PSTN Call In OriCalleeID', path: ROUTE_PATHS.PSTN_CALL_IN_ORICALLEEID },
//     { id: 'fxsCallerIDPool', title: 'CallerID Pool', path: ROUTE_PATHS.CALLERID_POOL },
//     { id: 'fxsCallerIDReservePool', title: 'CallerID Reserve Pool', path: ROUTE_PATHS.CALLERID_RESERVE_POOL },
//   ]
// },

// ISDN

// {
//   id: 'isdn',
//   title: 'ISDN',
//   icon: NetworkCheckIcon,
//   hasSubmenu: true,
//   path: ROUTE_PATHS.ISDN,
//   submenuItems: [
//     { id: 'isdnMain', title: 'ISDN', path: '/isdn/isdn' },
//     { id: 'isdnNumberParameter', title: 'Number Parameter', path: '/isdn/number-parameter' }
//   ]
// },

// FAX

// {
//   id: 'fax',
//   title: 'FAX',
//   icon: FaxIcon,
//   hasSubmenu: true,
//   path: ROUTE_PATHS.FAX,
//   submenuItems: [
//     { id: 'faxMain', title: 'Fax', path: '/fax' }
//   ]
// },

// VPN

// {
//   id: 'vpn',
//   title: 'VPN',
//   icon: VpnKeyIcon,
//   hasSubmenu: true,
//   path: '/vpn',
//   submenuItems: [
//     { id: 'vpnServerSettings', title: 'VPN Server Settings', path: '/vpn/server-settings' },
//     { id: 'vpnAccount', title: 'VPN Account', path: '/vpn/account' },
//   ]
// },

// DHCP
