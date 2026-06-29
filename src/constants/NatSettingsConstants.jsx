export const FXS_NAT_SETTINGS_BREADCRUMB_ROOT = "FXS";
export const FXS_NAT_SETTINGS_BREADCRUMB_SECTION = "VoIP";
export const FXS_NAT_SETTINGS_PAGE_TITLE = "NAT Settings";
export const FXS_NAT_SETTINGS_CARD_TITLE = "NAT Settings";

export const FXS_NAT_SETTINGS_LEFT_SECTION_TITLE = "Core Networking";
export const FXS_NAT_SETTINGS_RIGHT_SECTION_TITLE = "Traversal & Options";

export const FXS_NAT_SETTINGS_SAVE_LABEL = "Save";
export const FXS_NAT_SETTINGS_RESET_LABEL = "Reset";
export const FXS_NAT_SETTINGS_NOTE_LABEL = "Note:";

/** Matches PBX main-page section headings */
export const FXS_NAT_SETTINGS_SECTION_HEADING_LEFT = -20;
export const FXS_NAT_SETTINGS_SECTION_HEADING_COLOR = "#30415A";

export const FXS_NAT_SETTINGS_LEFT_COLUMN_FIELD_KEYS = [
  "autoNat",
  "outerNetworkAddress",
  "stunServer",
  "natType",
  "stunServerAddress",
  "mappingContactIp",
  "mappingSdpIp",
];

export const FXS_NAT_SETTINGS_RIGHT_COLUMN_FIELD_KEYS = [
  "rport",
  "learnNat",
  "autoDetectNatIp",
  "rtpSelfAdaption",
];

export const NAT_SETTINGS_FIELDS = [
  // Local NAT Traversal - Method 1
  {
    section: "Local NAT Traversal",
    method: "Method 1 -",
    label: "Auto Nat",
    type: "select",
    key: "autoNat",
    options: ["DisableAutoNat", "Enable PMP", "Enable UPNP"],
    default: "DisableAutoNat",
  },
  {
    section: "Local NAT Traversal",
    method: "Method 1",
    label: "Outer Network Address",
    type: "readonly",
    key: "outerNetworkAddress",
    default: "Offline",
    conditional: "autoNat",
    conditionalValues: ["Enable PMP", "Enable UPNP"],
  },

  // Local NAT Traversal - Method 2
  {
    section: "Local NAT Traversal",
    method: "Method 2 -",
    label: "STUN Server",
    type: "checkbox",
    key: "stunServer",
    default: false,
  },
  {
    section: "Local NAT Traversal",
    method: "Method 2",
    label: "NAT Type",
    type: "readonly",
    key: "natType",
    default: "Unknown",
    conditional: "stunServer",
  },
  {
    section: "Local NAT Traversal",
    method: "Method 2",
    label: "STUN Server Address",
    type: "text",
    key: "stunServerAddress",
    default: "127.0.0.1",
    conditional: "stunServer",
  },

  // Local NAT Traversal - Method 3
  {
    section: "Local NAT Traversal",
    method: "Method 3 -",
    label: "Mapping Contact IP",
    type: "text",
    key: "mappingContactIp",
    default: "",
  },
  {
    section: "Local NAT Traversal",
    method: "Method 3 -",
    label: "Mapping SDP IP",
    type: "text",
    key: "mappingSdpIp",
    default: "",
  },

  // Local NAT Traversal - Method 4
  {
    section: "Local NAT Traversal",
    method: "Method 4 -",
    label: "Rport",
    type: "checkbox",
    key: "rport",
    default: true,
  },
  {
    section: "Local NAT Traversal",
    method: "Method 4 -",
    label: "Learn NAT",
    type: "checkbox",
    key: "learnNat",
    default: false,
  },
  {
    section: "Local NAT Traversal",
    method: "Method 4 -",
    label: "Auto Detect NAT IP",
    type: "checkbox",
    key: "autoDetectNatIp",
    default: false,
  },

  // Help Remote Device Complete NAT Traversal
  {
    section: "Help Remote Device Complete NAT Traversal",
    method: "",
    label: "RTP Self-adaption",
    type: "checkbox",
    key: "rtpSelfAdaption",
    default: false,
  },
];

export const NAT_SETTINGS_NOTE = `The non-professional person please do not modify the configuration on this page.
"Local NAT Traversal": Select one method for your network. "Auto Nat" needs router UPnP/PMP; "Mapping Contact IP" / "Mapping SDP IP" need SIP/RTP port forwarding to the gateway.
"Auto Detect NAT IP" applies only when "Rport" is enabled and the router maps the RTP port range to the gateway.`;

/** FXS VoIP NAT Settings — conditional visibility from NatSettingsPage.shouldShowField */
export const NAT_SETTINGS_FIELD_TOOLTIPS = {
  autoNat:
    "Local NAT Traversal — Method 1.\n" +
    "Options: DisableAutoNat, Enable PMP, Enable UPNP.\n" +
    "Default: DisableAutoNat.\n" +
    "When Enable PMP or Enable UPNP is selected, Outer Network Address is shown (read-only).",

  outerNetworkAddress:
    "Read-only outer network address reported by PMP/UPNP.\n" +
    "Shown only when Auto Nat is Enable PMP or Enable UPNP.\n" +
    "Default display: Offline.",

  stunServer:
    "Local NAT Traversal — Method 2.\n" +
    "Enable STUN server for NAT discovery.\n" +
    "When enabled, shows NAT Type (read-only) and STUN Server Address.\n" +
    "Default: disabled (false).",

  natType:
    "Read-only NAT type detected via STUN.\n" +
    "Shown only when STUN Server is enabled.\n" +
    "Default display: Unknown.",

  stunServerAddress:
    "STUN server IP or hostname.\n" +
    "Shown only when STUN Server is enabled.\n" +
    "Default: 127.0.0.1.",

  mappingContactIp:
    "Local NAT Traversal — Method 3.\n" +
    "Public IP mapped for SIP Contact header.\n" +
    "Requires router SIP port forwarding to the gateway.",

  mappingSdpIp:
    "Local NAT Traversal — Method 3.\n" +
    "Public IP mapped for SDP media.\n" +
    "Requires router RTP port range forwarding to the gateway.",

  rport:
    "Local NAT Traversal — Method 4.\n" +
    "Enable SIP rport parameter for NAT traversal.\n" +
    "Default: enabled (true).",

  learnNat:
    "Local NAT Traversal — Method 4.\n" +
    "Learn NAT address from incoming SIP traffic.\n" +
    "When unchecked, Auto Detect NAT IP is forced off and disabled.\n" +
    "Default: disabled (false).",

  autoDetectNatIp:
    "Local NAT Traversal — Method 4.\n" +
    "Automatically detect NAT IP for RTP.\n" +
    "Checkbox is disabled unless Learn NAT is enabled.\n" +
    "Valid only when Rport is enabled and router maps RTP port range.\n" +
    "Default: disabled (false).",

  rtpSelfAdaption:
    "Help Remote Device Complete NAT Traversal.\n" +
    "Enable RTP self-adaption to assist remote endpoints behind NAT.\n" +
    "Default: disabled (false).",
};
