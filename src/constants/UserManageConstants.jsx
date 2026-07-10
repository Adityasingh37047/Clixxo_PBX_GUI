// Mirrors sidebarConstants exactly — all sections included.

export const PAGE_PERMISSION_GROUPS = [
  // ── Status ───────────────────────────────────────────────────────────────
  {
    id: "status",
    label: "Status",
    subGroups: [
      {
        id: "SystemStatus",
        label: "System Status",
        pages: [{ id: "systemInfo", label: "System Info" }],
      },
      {
        id: "pbxStatus",
        label: "PBX Status",
        pages: [
          { id: "pbxMonitor", label: "PBX Monitor" },
          { id: "ActiveCalls", label: "Active Calls" },
          { id: "activecallqueue", label: "Active Call Queue" },
          { id: "viewVoicemail", label: "View Voicemail" },
        ],
      },
    ],
  },

  // ── CDR ──────────────────────────────────────────────────────────────────
  {
    id: "cdr",
    label: "CDR",
    subGroups: [
      {
        id: "calldetailrecords",
        label: "Call Detail Records",
        pages: [{ id: "callCount", label: "Call Count" }],
      },
    ],
  },

  // ── PBX ──────────────────────────────────────────────────────────────────
  {
    id: "pbx",
    label: "PBX",
    subGroups: [
      {
        id: "extensions",
        label: "Extensions",
        pages: [
          { id: "pbxSipAccount", label: "Extensions" },
          { id: "pbxExtensionGroups", label: "Extension Groups" },
        ],
      },
      {
        id: "trunks",
        label: "Trunks",
        pages: [{ id: "sipRegister", label: "SIP Register" }],
      },
      {
        id: "callControl",
        label: "Call Control",
        pages: [
          { id: "callControlCcRoute", label: "CC Route" },
          { id: "callControlInboundRoutes", label: "Inbound Routes" },
          { id: "callControlOutboundRoutes", label: "Outbound Routes" },
          { id: "OutboundRestrictions", label: "Outbound Restrictions" },
        ],
      },
      {
        id: "callFeatures",
        label: "Call Features",
        pages: [
          { id: "callFeaturesBlockedList", label: "Blocked List" },
          { id: "callFeaturesCallBack", label: "CallBack" },
          { id: "callFeaturesOriginateCall", label: "Originate Call" },
          { id: "callFeaturesIVR", label: "IVR" },
          { id: "callFeaturesConference", label: "Conference" },
          { id: "callFeaturesCallQueue", label: "CallQueue" },
          { id: "callFeaturesPickupGroup", label: "Pickup Group" },
          { id: "callFeaturesRingGroup", label: "Ring Group" },
          { id: "callFeaturesPrivateGroup", label: "Private Group" },
          { id: "callFeaturesPaging", label: "Paging" },
          { id: "callFeaturesSpeedDial", label: "Speed Dial" },
          { id: "callFeaturesDisa", label: "DISA" },
        ],
      },
      {
        id: "recordSettings",
        label: "Record Settings",
        pages: [
          { id: "recordSettings", label: "Record Settings" },
        ],
      },
      {
        id: "voicePrompts",
        label: "Voice Prompts",
        pages: [{ id: "voicePromptsSettings", label: "Voice Prompts" }],
      },
      {
        id: "FeatureCode",
        label: "Feature Codes",
        pages: [{ id: "featureCodeSettings", label: "Feature Codes" }],
      },
      {
        id: "Voicemail",
        label: "Voicemail",
        pages: [{ id: "voicemailSettings", label: "Voicemail" }],
      },
      {
        id: "autoProvision",
        label: "Auto Provision",
        pages: [{ id: "autoProvisionSettings", label: "Auto Provision" }],
      },
    ],
  },

  // ── FXS ──────────────────────────────────────────────────────────────────
  {
    id: "fxs",
    label: "FXS",
    subGroups: [
      {
        id: "fxsVoip",
        label: "VoIP",
        pages: [
          { id: "fxsVoipSip", label: "SIP" },
          { id: "fxsVoipMedia", label: "Media" },
          { id: "fxsVoipCompatibility", label: "SIP Compatibility" },
          { id: "fxsVoipNatSettings", label: "NAT Settings" },
        ],
      },
      {
        id: "fxsAdvanced",
        label: "Advanced",
        pages: [
          { id: "fxsAdvancedGeneral", label: "General" },
          { id: "fxsAdvancedActionUrl", label: "Action Url" },
          { id: "fxsAdvancedAreaSelect", label: "Area Select" },
          { id: "fxsAdvancedCdrQuery", label: "CDR Query" },
          { id: "fxsAdvancedColorRing", label: "Color Ring" },
          { id: "fxsAdvancedCueTone", label: "Cue Tone" },
          { id: "fxsAdvancedDialingRule", label: "Dialing Rule" },
          { id: "fxsAdvancedDialingTimeout", label: "Dialing Timeout" },
          { id: "fxsAdvancedDtmf", label: "DTMF" },
          { id: "fxsAdvancedFunctionKey", label: "Function Key" },
          { id: "fxsAdvancedQos", label: "QoS" },
          { id: "fxsAdvancedRinging", label: "Ringing Scheme" },
          { id: "fxsAdvancedToneDetector", label: "Tone Detecter" },
          { id: "fxsAdvancedToneGenerator", label: "Tone Generator" },
        ],
      },
      {
        id: "fxsPort",
        label: "Port",
        pages: [
          { id: "fxsPortGroup", label: "Port Group" },
          { id: "fxsPortSettings", label: "FXS Settings" },
          { id: "fxsPortAdvanced", label: "FXS Advanced" },
        ],
      },
      {
        id: "fxsRoute",
        label: "Route",
        pages: [
          { id: "fxsRoutingParameters", label: "Routing Parameters" },
          { id: "fxsIpToPstn", label: "IP->Tel" },
          { id: "fxsPstnToIp", label: "Tel->IP" },
        ],
      },
      {
        id: "fxsNumManipulate",
        label: "Num Manipulate",
        pages: [
          { id: "fxsIpCallInCallerID", label: "IP Call In CallerID" },
          { id: "fxsIpCallInCalleeID", label: "IP Call In CalleeID" },
          { id: "fxsPstnCallInCallerID", label: "PSTN Call In CallerID" },
          { id: "fxsPstnCallInCalleeID", label: "PSTN Call In CalleeID" },
        ],
      },
    ],
  },

  // ── E1-PRI ────────────────────────────────────────────────────────────────
  {
    id: "E1-PRI",
    label: "E1-PRI",
    subGroups: [
      {
        id: "route",
        label: "Route",
        pages: [
          { id: "routingParameters", label: "Routing Parameters" },
          { id: "ipToPstn", label: "IP->PSTN" },
          { id: "ipToIp", label: "IP->IP" },
          { id: "pstnToIp", label: "PSTN->IP" },
        ],
      },
      {
        id: "numberfilter",
        label: "Number Filter",
        pages: [
          { id: "whitelist", label: "Whitelist" },
          { id: "blacklist", label: "Blacklist" },
          { id: "numberPool", label: "Number Pool" },
          { id: "filteringRule", label: "Filtering Rule" },
        ],
      },
      {
        id: "numbermanipulate",
        label: "Num Manipulate",
        pages: [
          { id: "ipCallInCallerID", label: "IP Call In CallerID" },
          { id: "ipCallInCalleeID", label: "IP Call In CalleeID" },
          { id: "ipCallInOriCalleeID", label: "IP Call In OriCalleeID" },
          { id: "pstnCallInCallerID", label: "PSTN Call In CallerID" },
          { id: "pstnCallInCalleeID", label: "PSTN Call In CalleeID" },
          { id: "pstnCallInOriCalleeID", label: "PSTN Call In OriCalleeID" },
        ],
      },
      {
        id: "pcm",
        label: "PCM",
        pages: [
          { id: "pcmPstn", label: "PSTN" },
          { id: "pcmCircuitMaintenance", label: "Circuit Maintenance" },
          { id: "pcmTrunkGroup", label: "PCM Trunk Group" },
          { id: "pcmNumReceivingRule", label: "Num-Receiving Rule" },
          { id: "pcmReceptionTimeout", label: "Reception Timeout" },
        ],
      },
      {
        id: "sip",
        label: "SIP",
        pages: [
          { id: "sipMain", label: "SIP" },
          { id: "sipToSipAccount", label: "SIP To SIP Account" },
          { id: "sipTrunkGroup", label: "SIP Trunk Group" },
          { id: "sipMedia", label: "Media" },
        ],
      },
    ],
  },

  // ── System ───────────────────────────────────────────────────────────────
  {
    id: "system",
    label: "System",
    subGroups: [
      {
        id: "systemSettings",
        label: "System Settings",
        pages: [
          { id: "sysNetwork", label: "Network" },
          { id: "sysStorage", label: "Storage" },
          { id: "sysRoutingInterface", label: "Routing Interface" },
          { id: "sysManagement", label: "Management" },
          { id: "sysGlobalSip", label: "Global SIP" },
          { id: "sysIpRoutingTable", label: "IP Route Table" },
          { id: "sysSipAccessControl", label: "SIP Access Control" },
          { id: "sysAccessControl", label: "Access Control" },
          { id: "sysVpn", label: "VPN" },
          { id: "sysCentralizedManage", label: "Centralized Manage" },
          { id: "sysDhcp", label: "DHCP" },
          { id: "sysPingTest", label: "Ping Test" },
          { id: "sysTracertTest", label: "Tracert Test" },
          { id: "sysAsteriskCLI", label: "Asterisk CLI" },
          { id: "sysLinuxCLI", label: "Linux CLI" },
        ],
      },
    ],
  },

  // ── Maintenance ───────────────────────────────────────────────────────────
  {
    id: "maintenance",
    label: "Maintenance",
    subGroups: [
      {
        id: "systemTools",
        label: "System Tools",
        pages: [
          { id: "authorization", label: "Authorization" },
          { id: "idsSettings", label: "IDS Settings" },
          { id: "ddosSettings", label: "DDOS Settings" },
          { id: "certificateManage", label: "Certificate Manage" },
          { id: "radius", label: "Radius" },
          { id: "sipAccountGenerator", label: "SIP Account Generator" },
          { id: "configFile", label: "Config File" },
          { id: "hosts", label: "Hosts" },
          { id: "signalingCapture", label: "Signaling Capture" },
          { id: "signalingCallTest", label: "Signaling Call Test" },
          { id: "signalingCallTrack", label: "Signaling Call Track" },
          { id: "modificationRecord", label: "Modification Record" },
          { id: "backupUpload", label: "Backup & Upload" },
          { id: "factoryReset", label: "Factory Reset" },
          { id: "upgrade", label: "Upgrade" },
          { id: "deviceLock", label: "Device Lock" },
          { id: "restart", label: "Restart" },
          { id: "licence", label: "Licence" },
          { id: "sqlUpload", label: "SQL Upload" },
          { id: "licenseLimits", label: "License Limits" },
        ],
      },
    ],
  },

  // ── User Manage ───────────────────────────────────────────────────────────
  {
    id: "userManage",
    label: "User Manage",
    subGroups: [
      {
        id: "userPermission",
        label: "User Permission",
        pages: [
          // { id: 'userList',      label: 'User Permission' },
          { id: "accountManage", label: "Account Manage" },
          { id: "changePassword", label: "Change Password" },
        ],
      },
    ],
  },
];

const buildInitialPermissions = () => {
  const perms = {};
  PAGE_PERMISSION_GROUPS.forEach((section) =>
    section.subGroups.forEach((sub) =>
      sub.pages.forEach((page) => {
        perms[page.id] = false;
      }),
    ),
  );
  return perms;
};

export const INITIAL_PERMISSIONS = buildInitialPermissions();

export const INITIAL_USER_FORM = {
  username: "",
  password: "",
};

export const USER_MANAGE_PAGE_TITLE = "User Manage";

export const USER_MANAGE_BREADCRUMB = [
  "User Manage",
  "User Permission",
  USER_MANAGE_PAGE_TITLE,
];

export const USER_MANAGE_CARD_TITLES = {
  USER_LIST: "User List",
  ADD_USER: "Add User",
  EDIT_USER_PREFIX: "Edit User — ",
  PAGE_PERMISSIONS: "Page Permissions",
  RESET_PASSWORD_PREFIX: "Reset Password — ",
};

export const USER_MANAGE_TABLE_HEADERS = {
  ID: "ID",
  USERNAME: "Username",
  ACCESS_TYPE: "Access Type",
  ROLE_PERMISSION: "Role Permission",
  SECTIONS: "Sections",
  ACTIONS: "Actions",
};

export const USER_MANAGE_LABELS = {
  USERNAME: "Username",
  PASSWORD: "Password",
  ACCESS_TYPE: "Access Type",
  ROLE_PERMISSION: "Role Permission",
  ALL_SECTIONS: "All",
};

export const USER_MANAGE_ACCESS_TYPE_LABELS = {
  custom: "Custom",
  superadmin: "Super Admin",
};

export const USER_MANAGE_ACCESS_TYPE_OPTIONS = [
  { value: "custom", label: USER_MANAGE_ACCESS_TYPE_LABELS.custom },
  { value: "superadmin", label: USER_MANAGE_ACCESS_TYPE_LABELS.superadmin },
];

export const USER_MANAGE_ROLE_PERMISSION_OPTIONS = [
  { value: "Read, Write", label: "Read, Write" },
  { value: "Read", label: "Read" },
];

export const USER_MANAGE_BUTTON_LABELS = {
  ADD_USER: "+ Add User",
  CANCEL: "Cancel",
  SAVE: "Save",
  SAVING: "Saving...",
};

export const USER_MANAGE_BUTTON_VARIANTS = {
  PRIMARY: "primary",
  CANCEL: "cancel",
};

/** Footer / modal Save & Cancel — matches PBX addNewModalFooterBtnStyle */
export const USER_MANAGE_BUTTON_STYLE = {
  height: 30,
  padding: "6px 14px",
  fontSize: 12,
  borderRadius: 4,
  minWidth: 100,
};

/** Toolbar primary (+ Add User) — natural PBX width, no forced min/max */
export const USER_MANAGE_TOOLBAR_PRIMARY_BUTTON_STYLE = {
  height: 30,
  padding: "6px 14px",
  fontSize: 12,
  borderRadius: 4,
};

/** Toolbar cancel — same box as + Add User; width matched in UserManage via sizer */
export const USER_MANAGE_TOOLBAR_CANCEL_BUTTON_STYLE = {
  ...USER_MANAGE_TOOLBAR_PRIMARY_BUTTON_STYLE,
  background: "#cbd5e1",
  color: "#374151",
  border: "1px solid #cbd5e1",
  boxShadow: "0 1px 2px rgba(15, 23, 42, 0.08)",
};

export const USER_MANAGE_TOOLTIPS = {
  username: "The username of the user.",
  password: "The password of the user.",
  confirmPassword: "The confirmation password of the user.",
  accessType: "The access type of the user.",
  rolePermission: "The role permission of the user.",
};

export const USER_MANAGE_PLACEHOLDERS = {
  MIN_5_CHARS: "Min 5 characters",
  NEW_PASSWORD: "New password (min 5 chars)",
};

export const USER_MANAGE_MESSAGES = {
  loadFailed: "Failed to load users.",
  loadingUsers: "Loading users...",
  noUsers: "No users found.",
  usernameMinLength: "Username must be at least 5 characters.",
  passwordMinLength: "Password must be at least 5 characters.",
  createSuccess: "User created successfully.",
  createFailed: "Failed to create user.",
  updateSuccess: "User access updated successfully.",
  updateFailed: "Failed to update user access.",
  deleteConfirm: (username) =>
    `Are you sure you want to delete user "${username}"?`,
  deleteSuccess: "User deleted successfully.",
  deleteFailed: "Failed to delete user.",
};

export const USER_MANAGE_DEFAULT_TOAST = {
  msg: "",
  type: "success",
};

export const USER_MANAGE_TOAST_DURATION_MS = 5000;
export const USER_MANAGE_FORM_ERROR_HIDE_MS = 5000;

export const USER_MANAGE_DEFAULT_ACCESS_TYPE = "custom";
export const USER_MANAGE_DEFAULT_ROLE_PERMISSION = "Read, Write";

export const USER_MANAGE_ICON_COLORS = {
  EDIT: "#2563eb",
  DELETE: "#dc2626",
};
