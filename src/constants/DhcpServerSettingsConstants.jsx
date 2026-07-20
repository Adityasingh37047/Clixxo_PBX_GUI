export const DHCP_SERVER_PAGE_BREADCRUMB_ROOT = "System";
export const DHCP_SERVER_PAGE_BREADCRUMB_SECTION = "Network Settings";
export const DHCP_SERVER_PAGE_TITLE = "DHCP Server";
export const DHCP_SERVER_CARD_TITLE = "DHCP Server";

export const DHCP_SERVER_SECTION_HEADING_LEFT = -20;
export const DHCP_SERVER_SECTION_HEADING_COLOR = "#30415A";

export const DHCP_SERVER_BTN_SAVE = "Save";
export const DHCP_SERVER_BTN_RESET = "Reset";
export const DHCP_SERVER_BTN_SAVING = "Saving...";
export const DHCP_SERVER_BTN_RESETTING = "Resetting...";

export const DHCP_SERVER_ENABLE_LABEL = "Enable";
export const DHCP_SERVER_LOADING_TEXT = "Loading DHCP settings...";
export const DHCP_SERVER_EMPTY_MESSAGE = "No connected LAN ports found.";

export const DHCP_SERVER_SUCCESS_SAVE = "DHCP settings saved successfully!";
export const DHCP_SERVER_SUCCESS_RESET = "DHCP settings reset successfully!";

export const DHCP_SERVER_FIELD_TOOLTIPS = {
  enabled:
    "Enable the DHCP server on this LAN interface. When enabled, connected devices can automatically obtain IP addresses from the configured address pool.",
  ipRange:
    "Specify the range of IP addresses the DHCP server can assign to clients on this interface. Typically entered as a start and end address (e.g., 192.168.1.100-192.168.1.200).",
  subnetMask:
    "Specify the subnet mask for the DHCP address pool. It must match the subnet of this LAN interface.",
  defaultGateway:
    "Specify the default gateway IP address assigned to DHCP clients. Clients will use this address to route traffic outside the local network.",
  dnsServer:
    "Specify the DNS server IP address provided to DHCP clients for domain name resolution.",
};

export const getDhcpInterfaceLabel = (_port, index) => `LAN ${index + 1}`;

export const buildDhcpLanSections = (lanPorts = []) =>
  lanPorts.map((port, index) => {
    const lanNumber = index + 1;
    return {
      lan: getDhcpInterfaceLabel(port, index),
      fields: [
        { name: `enabled${lanNumber}`, label: "DHCP Server:", type: "checkbox" },
        { name: `ipRange${lanNumber}`, label: "IP Range:", type: "text" },
        { name: `subnetMask${lanNumber}`, label: "Subnet Mask:", type: "text" },
        {
          name: `defaultGateway${lanNumber}`,
          label: "Default Gateway:",
          type: "text",
        },
        { name: `dnsServer${lanNumber}`, label: "DNS Server:", type: "text" },
      ],
    };
  });

export const DHCP_SERVER_SETTINGS_INITIAL_FORM = {
  enabled1: false,
  ipRange1: "",
  subnetMask1: "",
  defaultGateway1: "",
  dnsServer1: "",
  enabled2: false,
  ipRange2: "",
  subnetMask2: "",
  defaultGateway2: "",
  dnsServer2: "",
};
