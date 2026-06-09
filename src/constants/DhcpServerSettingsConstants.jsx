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
  ipRange1: '',
  subnetMask1: '',
  defaultGateway1: '',
  dnsServer1: '',
  enabled2: false,
  ipRange2: '',
  subnetMask2: '',
  defaultGateway2: '',
  dnsServer2: '',
};
