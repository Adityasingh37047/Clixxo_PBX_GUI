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
  selectInterface: form.selectInterface || "",
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

/** Build Select Interfaces options from /get-vlan-settings `parents`. */
export const buildVlanInterfaceOptions = (parents = [], lanInterfaces = []) => {
  const fromParents = (parents || []).filter(Boolean);
  const ports = fromParents.length
    ? fromParents
    : (lanInterfaces || []).map((lan) => lan.interface).filter(Boolean);

  return ports.map((parent, idx) => {
    const lan = (lanInterfaces || []).find((l) => l.interface === parent);
    return {
      value: parent,
      label: lan?.name || `LAN ${idx + 1}`,
    };
  });
};

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

export const resolveVlanParentLan = (lanInterfaces = [], selectInterface = "") => {
  // Legacy lan1/lan2 values (older form state)
  if (selectInterface === "lan1" || selectInterface === "lan2") {
    const idx = selectInterface === "lan2" ? 1 : 0;
    return lanInterfaces[idx] || lanInterfaces[0] || {};
  }
  // API parent interface names: eth0, eth1, …
  return (
    (lanInterfaces || []).find((lan) => lan.interface === selectInterface) ||
    lanInterfaces[0] ||
    {}
  );
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

export const emptyVlanSlots = () => ({
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

export const emptyVlanForm = (selectInterface = "") => ({
  selectInterface,
  lan1Ip: "",
  lan1Mask: "",
  lan1Gw: "",
  ...emptyVlanSlots(),
});

export const extractVlanSlots = (form = {}) => ({
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

const VLAN_SLOT_KEYS = [1, 2, 3];

/** Map API vlan list for one parent → vlan1/2/3 form slots. */
export const mapApiVlansToSlots = (parentVlans = []) => {
  const slots = emptyVlanSlots();
  const sorted = [...(parentVlans || [])].sort(
    (a, b) => Number(a?.vlanId) - Number(b?.vlanId),
  );
  sorted.slice(0, 3).forEach((vlan, idx) => {
    const n = idx + 1;
    slots[`vlan${n}Id`] = vlan?.vlanId != null ? String(vlan.vlanId) : "";
    slots[`vlan${n}Ip`] = vlan?.ipAddress || "";
    slots[`vlan${n}Mask`] = vlan?.subnetMask || "";
    slots[`vlan${n}Gw`] = vlan?.gateway || "";
  });
  return slots;
};

/**
 * Build per-parent drafts from /get-vlan-settings.
 * parents without vlans get empty slots.
 */
export const buildVlanDraftsFromApi = (vlans = [], parents = []) => {
  const byParent = {};
  (vlans || []).forEach((vlan) => {
    const parent = vlan?.parentInterface;
    if (!parent) return;
    if (!byParent[parent]) byParent[parent] = [];
    byParent[parent].push(vlan);
  });

  const parentKeys = [
    ...new Set([...(parents || []), ...Object.keys(byParent)]),
  ].filter(Boolean);

  const drafts = {};
  parentKeys.forEach((parent) => {
    drafts[parent] = mapApiVlansToSlots(byParent[parent] || []);
  });
  return drafts;
};

/** One filled slot → API vlan entry (or null if incomplete/empty). */
export const slotToVlanEntry = (parentInterface, slots, slotNum) => {
  const vlanId = String(slots[`vlan${slotNum}Id`] || "").trim();
  const ipAddress = String(slots[`vlan${slotNum}Ip`] || "").trim();
  const subnetMask = String(slots[`vlan${slotNum}Mask`] || "").trim();
  const gateway = String(slots[`vlan${slotNum}Gw`] || "").trim();

  if (!vlanId && !ipAddress && !subnetMask && !gateway) return null;

  if (!vlanId || !ipAddress || !subnetMask) {
    return {
      error: `Please fill VLAN ${slotNum} ID, IP address and subnet mask.`,
    };
  }

  const idNum = Number(vlanId);
  if (!Number.isFinite(idNum) || idNum <= 0) {
    return { error: `VLAN ${slotNum} ID must be a valid number.` };
  }

  return {
    entry: {
      parentInterface,
      vlanId: idNum,
      ipAddress,
      subnetMask,
      gateway,
    },
  };
};

/**
 * Merge current form into drafts, then build save payload vlans[].
 * Returns { vlans, error }.
 */
export const buildVlanEnablePayloadFromDrafts = (
  draftsByParent = {},
  currentForm = {},
) => {
  const drafts = { ...draftsByParent };
  const currentParent = currentForm.selectInterface;
  if (currentParent) {
    drafts[currentParent] = extractVlanSlots(currentForm);
  }

  const vlans = [];
  for (const [parentInterface, slots] of Object.entries(drafts)) {
    if (!parentInterface) continue;
    for (const slotNum of VLAN_SLOT_KEYS) {
      const result = slotToVlanEntry(parentInterface, slots || {}, slotNum);
      if (!result) continue;
      if (result.error) return { vlans: [], error: result.error };
      vlans.push(result.entry);
    }
  }

  if (vlans.length === 0) {
    return {
      vlans: [],
      error: "Please fill at least one VLAN (ID, IP address and subnet mask).",
    };
  }

  return { vlans, error: "" };
};

export const buildVlanFormForParent = (
  parentInterface,
  draftsByParent = {},
  lanInterfaces = [],
) => {
  const lan = resolveVlanParentLan(lanInterfaces, parentInterface);
  return {
    selectInterface: parentInterface,
    lan1Ip: lan.ipAddress || "",
    lan1Mask: lan.subnetMask || "",
    lan1Gw: lan.defaultGateway || "",
    ...(draftsByParent[parentInterface] || emptyVlanSlots()),
  };
};

export const buildNetworkSavePayload = ({
  lanInterfaces,
  dnsServers,
  arpMode,
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
    interfaces: lanArray,
    dnsServers: dnsArray,
    arpMode: arpArray,
  };
};

export const NETWORK_REBOOT_CMD =
  'nohup sh -c "sleep 5; reboot" >/dev/null 2>&1 & echo REBOOT_TRIGGERED';

/** Source IP dropdown options for PING / TRACERT (LAN + all VLAN parents + VPN). */
export const buildNetworkSourceIpOptions = (allIfaces = []) => {
  const lanIfaces = (allIfaces || []).filter((i) => {
    const kn = (i.interface || "").toLowerCase();
    return /^eth\d+$/.test(kn) || /^enp\d+s\d+/.test(kn);
  });

  const options = [];
  const seen = new Set();

  const push = (value, label) => {
    const ip = String(value || "").trim();
    if (!ip || seen.has(ip)) return;
    seen.add(ip);
    options.push({ value: ip, label });
  };

  lanIfaces
    .filter((i) => i.ipAddress)
    .forEach((iface, idx) => {
      push(iface.ipAddress, `LAN ${idx + 1}:${iface.ipAddress}`);
    });

  const lanKernelNames = lanIfaces.map((i) => i.interface).filter(Boolean);
  for (const iface of allIfaces || []) {
    const kn = (iface.interface || "").toString();
    const parent = lanKernelNames.find(
      (p) => kn.startsWith(`${p}.`) && /\.\d+$/.test(kn),
    );
    if (!parent || !iface.ipAddress) continue;
    const vlanId = kn.split(".")[1] || "";
    push(iface.ipAddress, `VLAN ${vlanId}:${iface.ipAddress}`);
  }

  const lanIfaceSet = new Set(lanIfaces.map((i) => i.interface));
  for (const iface of allIfaces || []) {
    const kn = (iface.interface || "").toLowerCase();
    if (
      iface.ipAddress &&
      !lanIfaceSet.has(iface.interface) &&
      kn !== "lo" &&
      !/^eth\d+\.\d+$/.test(kn)
    ) {
      push(
        iface.ipAddress,
        `VPN (${iface.interface}):${iface.ipAddress}`,
      );
    }
  }

  return options;
};
