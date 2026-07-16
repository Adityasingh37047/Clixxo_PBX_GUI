import { isValidIPv4 } from "./NetworkValidators";

export const normalizeLanArray = (interfaces = []) =>
  (interfaces || []).map((lan, idx) => ({
    key: (lan?.interface || lan?.name || `index-${idx}`).toString(),
    ipAddress: lan?.ipAddress || "",
    subnetMask: lan?.subnetMask || "",
    defaultGateway: lan?.defaultGateway || "",
    ipv6Address: lan?.ipv6Address || "",
    ipv6Prefix: lan?.ipv6Prefix || "",
  }));

export const normalizeVlanSnapshot = (form = {}) => ({
  selectInterface: form.selectInterface || "lan1",
  lan1Ip: form.lan1Ip || "",
  lan1Mask: form.lan1Mask || "",
  lan1Gw: form.lan1Gw || "",
  vlan1Id: form.vlan1Id || "",
  vlan1Ip: form.vlan1Ip || "",
  vlan1Mask: form.vlan1Mask || "",
  vlan1Gw: form.vlan1Gw || "",
  vlan2Id: form.vlan2Id || "",
  vlan2Ip: form.vlan2Ip || "",
  vlan2Mask: form.vlan2Mask || "",
  vlan2Gw: form.vlan2Gw || "",
  vlan3Id: form.vlan3Id || "",
  vlan3Ip: form.vlan3Ip || "",
  vlan3Mask: form.vlan3Mask || "",
  vlan3Gw: form.vlan3Gw || "",
});

export const applyStaticDefaults = (lan) => {
  const next = { ...lan };
  const isLan1 = next.name === "LAN 1" || next.interface === "eth0";
  const isLan2 = next.name === "LAN 2" || next.interface === "eth1";

  // If we already have an IPv4 address (e.g. coming from DHCP) but no gateway,
  // derive a sensible default gateway from the IP itself (x.y.z.1) and a /24 mask.
  if (next.ipAddress && !next.defaultGateway && isValidIPv4(next.ipAddress)) {
    const parts = next.ipAddress.split(".");
    if (parts.length === 4) {
      next.defaultGateway = `${parts[0]}.${parts[1]}.${parts[2]}.1`;
    }
    if (!next.subnetMask) {
      next.subnetMask = "255.255.255.0";
    }
    return next;
  }

  // If there is no IP at all, fall back to our series defaults.
  if (isLan1) {
    if (!next.ipAddress) next.ipAddress = "192.168.0.101";
    if (!next.subnetMask) next.subnetMask = "255.255.255.0";
    if (!next.defaultGateway) next.defaultGateway = "192.168.0.1";
  } else if (isLan2) {
    if (!next.ipAddress) next.ipAddress = "192.168.1.101";
    if (!next.subnetMask) next.subnetMask = "255.255.255.0";
    if (!next.defaultGateway) next.defaultGateway = "192.168.1.1";
  }

  return next;
};

export const filterAndNormalizeLanInterfaces = (allIfaces = []) =>
  allIfaces
    .filter((iface) => {
      const kn = (iface.interface || "").toLowerCase();
      // Only physical LAN interfaces: eth0/eth1/... or enp4s0/enp4s1/...
      return /^eth\d+$/.test(kn) || /^enp\d+s\d+/.test(kn);
    })
    // Assign sequential "LAN 1", "LAN 2", … — ignore API name field which
    // may reflect a different device numbering (e.g. "LAN 6", "LAN 7")
    .map((iface, seqIdx) => ({
      ...iface,
      name: `LAN ${seqIdx + 1}`,
      ipv4Type: iface.ipv4Type || "Static",
    }))
    .sort((a, b) => {
      // Sort LAN 1, LAN 2, … in numeric order; unknown interfaces last
      const lanNum = (n) => {
        const m = String(n).match(/^LAN\s*(\d+)$/i);
        return m ? parseInt(m[1], 10) : 99;
      };
      return lanNum(a.name) - lanNum(b.name);
    });

export const findPrimaryVlanIface = (allIfaces, primaryKernelName) =>
  (allIfaces || []).find(
    (i) =>
      typeof i.interface === "string" &&
      i.interface.startsWith(`${primaryKernelName}.`) &&
      /\.\d+$/.test(i.interface),
  );

export const resolveVlanParentLan = (lanInterfaces = [], selectInterface = "lan1") => {
  const idx = selectInterface === "lan2" ? 1 : 0;
  return lanInterfaces[idx] || lanInterfaces[0] || {};
};

export const buildInitialVlanForm = ({
  lan1 = {},
  hasVlan,
  vlanIface,
  vlanGateway = "",
  selectInterface = "lan1",
}) => ({
  selectInterface,
  lan1Ip: lan1.ipAddress || "",
  lan1Mask: lan1.subnetMask || "",
  lan1Gw: lan1.defaultGateway || "",
  vlan1Id: hasVlan ? String(vlanIface.interface.split(".")[1] || "") : "",
  vlan1Ip: hasVlan ? vlanIface.ipAddress || "" : "",
  vlan1Mask: hasVlan ? vlanIface.subnetMask || "" : "",
  vlan1Gw: hasVlan ? vlanGateway || vlanIface.defaultGateway || "" : "",
  vlan2Id: "",
  vlan2Ip: "",
  vlan2Mask: "",
  vlan2Gw: "",
  vlan3Id: "",
  vlan3Ip: "",
  vlan3Mask: "",
  vlan3Gw: "",
});

export const emptyVlanForm = () => ({
  selectInterface: "lan1",
  lan1Ip: "",
  lan1Mask: "",
  lan1Gw: "",
  vlan1Id: "",
  vlan1Ip: "",
  vlan1Mask: "",
  vlan1Gw: "",
  vlan2Id: "",
  vlan2Ip: "",
  vlan2Mask: "",
  vlan2Gw: "",
  vlan3Id: "",
  vlan3Ip: "",
  vlan3Mask: "",
  vlan3Gw: "",
});

export const buildNetworkSavePayload = ({
  lanInterfaces,
  dnsServers,
  arpMode,
  vlanEnabled,
  vlanForm,
}) => {
  const lanArray = lanInterfaces.map((lan) => ({
    name: lan.interface,
    ipv4Type: lan.ipv4Type || "Static",
    ipAddress: lan.ipAddress,
    subnetMask: lan.subnetMask,
    defaultGateway: lan.defaultGateway,
    ipv6Address: lan.ipv6Address,
    ipv6Prefix: lan.ipv6Prefix,
  }));
  const dnsArray = [
    { preferredDns: dnsServers[0] },
    { standbyDns: dnsServers[1] },
  ];
  const arpArray = [{ defaultArpMode: arpMode }];
  return {
    vlanEnabled,
    vlan: vlanEnabled ? vlanForm : undefined,
    interfaces: vlanEnabled ? [] : lanArray,
    dnsServers: dnsArray,
    arpMode: arpArray,
  };
};

export const NETWORK_REBOOT_CMD =
  'nohup sh -c "sleep 5; reboot" >/dev/null 2>&1 & echo REBOOT_TRIGGERED';
