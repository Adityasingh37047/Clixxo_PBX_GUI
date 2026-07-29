export const getLocalIpDisplayLabel = (option, fallback = "") => {
  if (!option) return fallback;
  return option.shortLabel || option.label || fallback;
};

export const buildLanIpv4Option = (idx, ipAddress) => ({
  value: ipAddress || `lan${idx + 1}-unavailable`,
  label: ipAddress
    ? `LAN ${idx + 1} (${ipAddress})`
    : `LAN ${idx + 1} (Unavailable)`,
  shortLabel: ipAddress
    ? `LAN ${idx + 1} (${ipAddress})`
    : `LAN ${idx + 1} (Unavailable)`,
  disabled: !ipAddress,
});

export const buildLanIpv6Option = (idx, ipv6) => ({
  value: ipv6,
  label: `LAN ${idx + 1} IPv6 (${ipv6})`,
  shortLabel: `LAN ${idx + 1} IPv6`,
  title: ipv6,
});

export const filterLanInterfaces = (interfaces = []) =>
  interfaces.filter((iface) => {
    const name = (iface.interface || "").toLowerCase();
    return /^eth\d+$/.test(name) || /^enp\d+s\d+/.test(name);
  });

export const buildLocalIpOptions = (interfaces = [], currentValue = "") => {
  const lanIfaces = filterLanInterfaces(interfaces);
  const orderedOptions = [];

  lanIfaces.forEach((iface, idx) => {
    orderedOptions.push(buildLanIpv4Option(idx, iface.ipAddress));
    const ipv6 =
      iface.ipv6Address || iface.ipv6 || iface.ipv6_address || "";
    if (ipv6) {
      orderedOptions.push(buildLanIpv6Option(idx, ipv6));
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
