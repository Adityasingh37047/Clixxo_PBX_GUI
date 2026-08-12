export const HA_CONFIG_PAGE_BREADCRUMB_ROOT = "System";
export const HA_CONFIG_PAGE_BREADCRUMB_SECTION = "System Settings";
export const HA_CONFIG_PAGE_TITLE = "High Availability";
export const HA_CONFIG_CARD_TITLE = "High Availability";
export const HA_CONFIG_SECTION_CONFIG = "HA Config";

export const HA_CONFIG_BTN_SAVE = "Save";
export const HA_CONFIG_BTN_RESET = "Reset";
export const HA_CONFIG_BTN_SAVING = "Saving…";
export const HA_CONFIG_LOADING_TEXT = "Loading HA configuration…";

export const HA_CONFIG_LABEL_HA_ENABLED = "HA Enabled";
export const HA_CONFIG_LABEL_VIRTUAL_IP = "Virtual IP";
export const HA_CONFIG_LABEL_INTERFACE = "Interface";
export const HA_CONFIG_LABEL_MODE = "Mode";
export const HA_CONFIG_LABEL_PEER_SERVER_IP = "Peer Server IP";
export const HA_CONFIG_LABEL_AUTO_FAILBACK = "Auto Failback";

export const HA_CONFIG_MODE_OPTIONS = [
  { value: "Primary", label: "Primary" },
  { value: "Backup", label: "Backup" },
];

export const HA_CONFIG_INTERFACE_PLACEHOLDER = "Select Interface";

export const HA_CONFIG_INITIAL_FORM = {
  haEnabled: false,
  virtualIp: "",
  interface: "",
  mode: "Primary",
  peerServerIp: "",
  autoFailback: false,
};

export const HA_CONFIG_MESSAGES = {
  saved: "HA configuration saved.",
  reset: "HA configuration reset.",
  loadFailed: "Failed to load HA configuration.",
  saveFailed: "Failed to save HA configuration.",
  busy: "Another HA operation is already running. Please wait.",
  invalidVirtualIp: "Enter a valid Virtual IP (IPv4) when HA is enabled.",
  invalidPeerIp: "Enter a valid Peer Server IP (IPv4) when HA is enabled.",
  invalidInterface: "Select an Interface when HA is enabled.",
};

export const HA_CONFIG_FIELD_TOOLTIPS = {
  haEnabled:
    "Enable high availability. When off, other HA fields are disabled.",
  virtualIp: "Shared virtual IP address used for HA failover.",
  interface:
    "Local LAN IPv4/IPv6 interface for HA, same source as SIP Settings Bind Address.",
  mode: "Primary or Backup role for this node. Default: Primary.",
  peerServerIp: "IP address of the peer HA server.",
  autoFailback:
    "When enabled, automatically fail back to the primary node when it recovers.",
};
