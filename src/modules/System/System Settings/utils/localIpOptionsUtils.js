export const getLocalIpDisplayLabel = (option, fallback = "") => {
  if (!option) return fallback;
  return option.shortLabel || option.label || fallback;
};

const readIfaceIpv4 = (iface = {}) =>
  iface.ipAddress || iface.ip || iface.ipv4 || iface.ipv4Address || "";

const readIfaceIpv6 = (iface = {}) =>
  iface.ipv6Address || iface.ipv6 || iface.ipv6_address || "";

/**
 * VPN / tunnel / loopback interfaces that must NOT appear in Local IP lists.
 * Kernel names differ per server (eno1, eth0, enp4s0, …) — those are allowed.
 */
export const isVpnOrVirtualInterface = (kernelName = "") => {
  const name = String(kernelName || "").trim().toLowerCase();
  if (!name || name === "lo") return true;
  return (
    /^tap\d*$/.test(name) ||
    /^top\d*$/.test(name) ||
    /^tun\d*$/.test(name) ||
    /^wg\d*$/.test(name) ||
    /^vpn/.test(name) ||
    name.includes("vpn")
  );
};

const formatLanLabel = (iface, idx) => {
  const rawName = String(iface?.name || "").trim();
  if (rawName) {
    // "LAN1" / "LAN 1" → "LAN 1"
    const match = rawName.match(/^LAN\s*(\d+)$/i);
    if (match) return `LAN ${match[1]}`;
    return rawName;
  }
  return `LAN ${idx + 1}`;
};

export const buildLanIpv4Option = (idx, ipAddress, displayName) => {
  const labelName = displayName || `LAN ${idx + 1}`;
  return {
    value: ipAddress || `lan${idx + 1}-unavailable`,
    label: ipAddress
      ? `${labelName} (${ipAddress})`
      : `${labelName} (Unavailable)`,
    shortLabel: ipAddress
      ? `${labelName} (${ipAddress})`
      : `${labelName} (Unavailable)`,
    disabled: !ipAddress,
  };
};

export const buildLanIpv6Option = (idx, ipv6, displayName) => {
  const labelName = displayName || `LAN ${idx + 1}`;
  return {
    value: ipv6,
    label: `${labelName} IPv6 (${ipv6})`,
    shortLabel: `${labelName} IPv6`,
    title: ipv6,
  };
};

/** Keep every NIC from the API except VPN/tunnel/loopback. */
export const filterLanInterfaces = (interfaces = []) =>
  interfaces.filter(
    (iface) => !isVpnOrVirtualInterface(iface.interface || iface.ifname || ""),
  );

export const buildLocalIpOptions = (interfaces = [], currentValue = "") => {
  const lanIfaces = filterLanInterfaces(interfaces);
  const orderedOptions = [];

  lanIfaces.forEach((iface, idx) => {
    const displayName = formatLanLabel(iface, idx);
    orderedOptions.push(
      buildLanIpv4Option(idx, readIfaceIpv4(iface), displayName),
    );
    const ipv6 = readIfaceIpv6(iface);
    if (ipv6) {
      orderedOptions.push(buildLanIpv6Option(idx, ipv6, displayName));
    }
  });

  orderedOptions.push({ value: "0.0.0.0", label: "Any LAN (0.0.0.0)" });

  if (
    currentValue &&
    !orderedOptions.some((opt) => opt.value === currentValue)
  ) {
    orderedOptions.unshift({
      value: currentValue,
      label: currentValue,
    });
  }

  return orderedOptions;
};

/** HA Interface options: value = kernel name (eno1 / eth0 / …), label = name (ip). */
export const buildHaInterfaceOptions = (interfaces = [], currentValue = "") => {
  const lanIfaces = filterLanInterfaces(interfaces);
  const options = lanIfaces.map((iface, idx) => {
    const name = (iface.interface || "").trim();
    const ip = readIfaceIpv4(iface);
    const displayName = name || `lan${idx + 1}-unavailable`;
    return {
      value: displayName,
      label: ip ? `${displayName} (${ip})` : `${displayName} (Unavailable)`,
      shortLabel: ip ? `${displayName} (${ip})` : `${displayName} (Unavailable)`,
      disabled: !name,
    };
  });

  const value =
    currentValue && currentValue !== "0.0.0.0" ? currentValue : "";
  if (value && !options.some((opt) => opt.value === value)) {
    options.unshift({ value, label: value });
  }
  return options;
};

export const pickDefaultLocalIpValue = (options = []) => {
  const first = options.find(
    (opt) =>
      opt?.value &&
      !opt.disabled &&
      opt.value !== "0.0.0.0" &&
      !String(opt.value).endsWith("-unavailable"),
  );
  return first?.value || "";
};

export const LOCAL_IP_FALLBACK_OPTIONS = [
  {
    value: "lan1-unavailable",
    label: "LAN 1 (Unavailable)",
    disabled: true,
  },
  {
    value: "lan2-unavailable",
    label: "LAN 2 (Unavailable)",
    disabled: true,
  },
  { value: "0.0.0.0", label: "Any LAN (0.0.0.0)" },
];

export const HA_INTERFACE_FALLBACK_OPTIONS = LOCAL_IP_FALLBACK_OPTIONS.filter(
  (opt) => opt.value !== "0.0.0.0",
);
