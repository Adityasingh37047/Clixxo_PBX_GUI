export const NETWORK_PAGE_BREADCRUMB_ROOT = "System";
export const NETWORK_PAGE_BREADCRUMB_SECTION = "Network Settings";
export const NETWORK_PAGE_TITLE = "Network";
export const NETWORK_CARD_TITLE = "Network";

export const NETWORK_SECTION_HEADING_LEFT = -20;
export const NETWORK_SECTION_HEADING_COLOR = "#30415A";

export const NETWORK_SECTION_DNS = "DNS Server Set";
export const NETWORK_SECTION_ARP = "ARP Mode";

export const NETWORK_BTN_SAVE = "Save";
export const NETWORK_BTN_SAVING = "Saving...";
export const NETWORK_BTN_RESET = "Reset";
export const NETWORK_BTN_RESETTING = "Resetting...";

export const NETWORK_LOADING_TEXT = "Loading network settings...";
export const NETWORK_PROGRESS_RESTART_DEFAULT = "Restarting network service...";
export const NETWORK_PROGRESS_CHECKING = "Checking device availability...";
export const NETWORK_PROGRESS_BACK_ONLINE =
  "Device is back online. Redirecting to login...";
export const NETWORK_PROGRESS_SAVED_REBOOTING =
  "Network settings saved. Rebooting device...";
export const NETWORK_PROGRESS_WAITING_REBOOT =
  "Device is rebooting. Waiting for it to come back online...";

export const NETWORK_LABEL_IPV4_TYPE = "IPV4 Network Type (M):";
export const NETWORK_LABEL_IP_ADDRESS = "IP Address (I):";
export const NETWORK_LABEL_SUBNET_MASK = "Subnet Mask (U):";
export const NETWORK_LABEL_DEFAULT_GATEWAY = "Default Gateway (D):";
export const NETWORK_LABEL_IPV6_ADDRESS = "IPV6 Address (I):";
export const NETWORK_LABEL_IPV6_PREFIX = "IPV6 Address Prefix (U):";
export const NETWORK_LABEL_VLAN_ENABLE = "VLAN Enable:";
export const NETWORK_LABEL_PREFERRED_DNS = "Preferred DNS Server (P):";
export const NETWORK_LABEL_STANDBY_DNS = "Standby DNS Server (P):";
export const NETWORK_LABEL_DEFAULT_MODE = "Default Mode:";
export const NETWORK_RADIO_YES = "Yes";
export const NETWORK_RADIO_NO = "No";
export const NETWORK_OPTION_STATIC = "Static";
export const NETWORK_OPTION_DHCP = "DHCP";

/** Fallback only — live options come from /get-vlan-settings `parents`. */
export const NETWORK_VLAN_INTERFACE_OPTIONS = [];

export const NETWORK_VLAN_LAN1_FIELDS = [
  {
    label: "Select Interfaces:",
    key: "selectInterface",
    type: "select",
    options: NETWORK_VLAN_INTERFACE_OPTIONS,
  },
  { label: "LAN 1 IP Address (I):", key: "lan1Ip" },
  { label: "LAN 1 Subnet Mask (U):", key: "lan1Mask" },
  { label: "LAN 1 Default Gateway (D):", key: "lan1Gw" },
];

export const NETWORK_VLAN1_FIELDS = [
  { label: "Vlan 1 Vlan ID (D):", key: "vlan1Id" },
  { label: "Vlan 1 IP Address (I):", key: "vlan1Ip" },
  { label: "Vlan 1 Subnet Mask (U):", key: "vlan1Mask" },
  { label: "Vlan 1 Default Gateway (D):", key: "vlan1Gw" },
];

export const NETWORK_VLAN2_FIELDS = [
  { label: "Vlan 2 Vlan ID (D):", key: "vlan2Id" },
  { label: "Vlan 2 IP Address (I):", key: "vlan2Ip" },
  { label: "Vlan 2 Subnet Mask (U):", key: "vlan2Mask" },
  { label: "Vlan 2 Default Gateway (D):", key: "vlan2Gw" },
];

export const NETWORK_VLAN3_FIELDS = [
  { label: "Vlan 3 Vlan ID (D):", key: "vlan3Id" },
  { label: "Vlan 3 IP Address (I):", key: "vlan3Ip" },
  { label: "Vlan 3 Subnet Mask (U):", key: "vlan3Mask" },
  { label: "Vlan 3 Default Gateway (D):", key: "vlan3Gw" },
];

export const NETWORK_FIELD_TOOLTIPS = {
  ipv4NetworkType:
    "Select the IPv4 network configuration type. Static allows manual IP configuration, while DHCP obtains settings automatically.",
  ipAddress: "Specify the IPv4 address assigned to this interface.",
  subnetMask:
    "Specify the subnet mask used for the IPv4 network. It defines the network and host portions of the IP address.",
  defaultGateway:
    "Specify the default gateway IP address used to route traffic outside the local network.",
  ipv6Address:
    "Specify the IPv6 address assigned to this interface for IPv6 network communication.",
  ipv6Prefix:
    "Specify the prefix length for the IPv6 address assigned to this interface. The prefix length is the number of bits in the prefix.",
  vlanEnable:
    "Enable VLAN tagging for this interface. When enabled, network traffic will be associated with the configured VLAN ID.",
  selectInterface:
    "Select which LAN interface the VLAN will be created on. Options: LAN 1 or LAN 2.",
  preferredDnsServer:
    "Specify the preferred DNS server used for domain name resolution. This server will be queried first when resolving hostnames.",
  standbyDnsServer:
    "Specify the standby (secondary) DNS server. It will be used if the preferred DNS server is unavailable.",
  defaultMode:
    "Select the default network mode for this interface. The selected mode determines how the device obtains and manages network connectivity.",
};

export const NETWORK_CONFIRM_SAVE = "Are you sure you want to save changes?";

export const NETWORK_ERR_INVALID_DATA =
  "Invalid data format received from server";
export const NETWORK_ERR_LOAD_TIMEOUT =
  "Request timeout. Please check your connection and try again.";
export const NETWORK_ERR_LOAD_NOT_FOUND =
  "Network configuration not found. Please contact administrator.";
export const NETWORK_ERR_LOAD_SERVER =
  "Server error. Please try again later or contact support.";
export const NETWORK_ERR_LOAD_NETWORK =
  "Network connection failed. Please check your internet connection.";
export const NETWORK_ERR_LOAD_FAILED =
  "Failed to load network settings. Please refresh the page and try again.";
export const NETWORK_ERR_RESET_SUCCESS = "Network settings reset successfully.";
export const NETWORK_ERR_RESET_FAILED = "Reset operation failed";
export const NETWORK_ERR_RESET_TIMEOUT =
  "Reset timeout. Please check your connection and try again.";
export const NETWORK_ERR_RESET_SERVER =
  "Server error during reset. Please try again later.";
export const NETWORK_ERR_RESET_NETWORK =
  "Network connection failed during reset. Please check your connection.";
export const NETWORK_ERR_RESET_FAILED_GENERIC =
  "Failed to reset network settings. Please try again.";
export const NETWORK_ERR_RESTART_TIMEOUT =
  "Network service restart timed out. Please verify device connectivity.";
export const NETWORK_ERR_REBOOT_FAILED =
  "Failed to reboot device. Please reboot manually.";
export const NETWORK_ERR_SAVE_FAILED = "Save operation failed";
export const NETWORK_ERR_SAVE_FAILED_GENERIC =
  "Failed to save network settings.";
export const NETWORK_ERR_SAVE_TIMEOUT =
  "Save operation timed out. Please check your connection and try again.";
export const NETWORK_ERR_SAVE_INVALID =
  "Invalid network configuration. Please check your settings and try again.";
export const NETWORK_ERR_SAVE_SERVER =
  "Server error during save. Please try again later or contact support.";
export const NETWORK_ERR_SAVE_NETWORK =
  "Network connection failed during save. Please check your connection.";
export const NETWORK_ERR_DHCP_ONLY_ONE =
  "Only one interface can be set to DHCP at a time. Please change the others back to Static and try again.";
export const NETWORK_ERR_INVALID_IP = "Please enter a valid IP address.";
export const NETWORK_ERR_INVALID_SUBNET = "Please enter a valid subnet mask.";
export const NETWORK_ERR_INVALID_GATEWAY =
  "Please enter a valid gateway address.";
export const NETWORK_ERR_INVALID_ARP = "Please select a valid ARP mode.";

export const NETWORK_SETTINGS_FIELDS = [
  {
    section: "LAN 1",
    fields: [
      {
        name: "ipv4Type1",
        label: "IPV4 Network Type (M):",
        type: "select",
        options: [
          { value: "Static", label: "Static" },
          { value: "DHCP", label: "DHCP" },
        ],
      },
      { name: "ipAddress1", label: "IP Address (I):", type: "text" },
      { name: "subnetMask1", label: "Subnet Mask (U):", type: "text" },
      { name: "defaultGateway1", label: "Default Gateway (D):", type: "text" },
      { name: "ipv6Address1", label: "IPV6 Address (I):", type: "text" },
      { name: "ipv6Prefix1", label: "IPV6 Address Prefix (U):", type: "text" },
    ],
  },
  {
    section: "LAN 2",
    fields: [
      {
        name: "ipv4Type2",
        label: "IPV4 Network Type (M):",
        type: "select",
        options: [
          { value: "Static", label: "Static" },
          { value: "DHCP", label: "DHCP" },
        ],
      },
      { name: "ipAddress2", label: "IP Address (I):", type: "text" },
      { name: "subnetMask2", label: "Subnet Mask (U):", type: "text" },
      { name: "defaultGateway2", label: "Default Gateway (D):", type: "text" },
      { name: "ipv6Address2", label: "IPV6 Address (I):", type: "text" },
      { name: "ipv6Prefix2", label: "IPV6 Address Prefix (U):", type: "text" },
    ],
  },
  {
    section: "DNS Server Set",
    fields: [
      {
        name: "preferredDns",
        label: "Preferred DNS Server (P):",
        type: "text",
      },
      { name: "standbyDns", label: "Standby DNS Server (P):", type: "text" },
    ],
  },
  {
    section: "ARP Mode",
    fields: [
      {
        name: "defaultArpMode",
        label: "Default Mode:",
        type: "select",
        options: [
          { value: "1", label: "1" },
          { value: "2", label: "2" },
        ],
      },
    ],
  },
];

export const NETWORK_SETTINGS_INITIAL_FORM = {
  ipv4Type1: "",
  ipAddress1: "",
  subnetMask1: "",
  defaultGateway1: "",
  ipv6Address1: "",
  ipv6Prefix1: "",
  ipv4Type2: "",
  ipAddress2: "",
  subnetMask2: "",
  defaultGateway2: "",
  ipv6Address2: "",
  ipv6Prefix2: "",
  preferredDns: "",
  standbyDns: "",
  defaultArpMode: "",
};
