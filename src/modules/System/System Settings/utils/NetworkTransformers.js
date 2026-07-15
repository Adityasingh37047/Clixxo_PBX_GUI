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

export const VLAN_CFG_GATEWAY_CMD = `grep -E '^[[:space:]]*(#)?[[:space:]]*gateway[[:space:]]' /etc/network/interfaces.d/vlan.cfg 2>/dev/null | head -1 | sed 's/^[[:space:]]*#\\?[[:space:]]*gateway[[:space:]]*//' | awk '{print $1}'`;

export const parseVlanCfgGateway = (vlanCfgGwRes) => {
  const vlanCfgGw = (
    vlanCfgGwRes?.responseData ||
    vlanCfgGwRes?.response ||
    ""
  )
    .toString()
    .trim();
  if (
    vlanCfgGw &&
    /^[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}$/.test(vlanCfgGw)
  ) {
    return vlanCfgGw;
  }
  return "";
};

export const buildInitialVlanForm = ({
  lan1 = {},
  hasVlan,
  vlanIface,
  vlanGateway = "",
}) => ({
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

export const subnetMaskToCidr = (mask) => {
  const parts = (mask || "").split(".").map((n) => parseInt(n, 10));
  if (parts.length !== 4 || parts.some((p) => isNaN(p) || p < 0 || p > 255))
    return null;
  const bin = parts.map((p) => p.toString(2).padStart(8, "0")).join("");
  if (!/^1*0*$/.test(bin)) return null; // must be contiguous ones
  return bin.indexOf("0") === -1 ? 32 : bin.indexOf("0");
};

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

export const buildVlanEnableCmd = ({
  parentIface,
  vlanId,
  vlanIp,
  vlanMask,
  vlanGw,
  cidr,
}) => {
  const iface = `${parentIface}.${vlanId}`;
  const yaml = `network:\n  version: 2\n  renderer: networkd\n  ethernets:\n    ${parentIface}:\n      dhcp4: no\n  vlans:\n    ${iface}:\n      id: ${vlanId}\n      link: ${parentIface}\n      addresses: [${vlanIp}/${cidr}]${vlanGw ? `\n      routes:\n        - to: 0.0.0.0/0\n          via: ${vlanGw}` : ""}\n`;
  const interfacesCfg = `auto ${iface}\niface ${iface} inet static\n  address ${vlanIp}\n  netmask ${vlanMask}\n  vlan-raw-device ${parentIface}${vlanGw ? `\n  gateway ${vlanGw}` : ""}\n`;
  // Systemd boot persistence (most reliable across distros)
  // IMPORTANT:
  // - set PATH explicitly so systemd environment can find ip/ifconfig/modprobe on boot
  // - escape '$' later so it is not expanded during printf > file
  const bootScript = `#!/bin/sh\nPATH=/sbin:/bin:/usr/sbin:/usr/bin\nmodprobe 8021q 2>/dev/null || true\nparent=${parentIface}\nid=${vlanId}\niface=${parentIface}.${vlanId}\nip=${vlanIp}\ncidr=${cidr}\ngw=${vlanGw || ""}\n# Recreate idempotently\nip link set dev "$parent" up 2>/dev/null || ifconfig "$parent" up || true\nip link del dev "$iface" 2>/dev/null || vconfig rem "$iface" 2>/dev/null || true\nip link add link "$parent" name "$iface" type vlan id "$id" 2>/dev/null || vconfig add "$parent" "$id"\nip addr flush dev "$iface" 2>/dev/null || true\nip addr add "$ip/$cidr" dev "$iface" 2>/dev/null || ifconfig "$iface" "$ip" netmask ${vlanMask} up\nip link set dev "$iface" up 2>/dev/null || ifconfig "$iface" up 2>/dev/null || true\n[ -n "$gw" ] && (ip route add default via "$gw" dev "$iface" metric 200 2>/dev/null || true)\nexit 0\n`;
  // Escape $ and " so shell printf doesn't expand variables while writing the file
  const bootScriptEscaped = bootScript
    .replace(/\$/g, "\\$")
    .replace(/"/g, '\\"');
  const unitFile = `[Unit]\nDescription=Apply VLAN at boot\nAfter=network-online.target\nWants=network-online.target\n\n[Service]\nType=oneshot\nExecStart=/usr/local/bin/apply-vlan.sh\nRemainAfterExit=yes\n\n[Install] \nWantedBy=multi-user.target\n`;
  return [
    `modprobe 8021q 2>/dev/null || true`,
    // Write netplan persistence (do not apply now to avoid tearing down runtime VLAN)
    `if command -v netplan >/dev/null 2>&1; then printf '%s' "${yaml.replace(/"/g, '\\"')}" > /etc/netplan/99-vlan.yaml && sync || true; fi`,
    // Fallback to /etc/network/interfaces (+sync to ensure vlan.cfg is flushed)
    `if [ -f /etc/network/interfaces ] && ! command -v netplan >/dev/null 2>&1; then mkdir -p /etc/network/interfaces.d 2>/dev/null || true; printf '%s' "${interfacesCfg.replace(/"/g, '\\"')}" > /etc/network/interfaces.d/vlan.cfg 2>/dev/null && sync || { printf '%s' "${interfacesCfg.replace(/"/g, '\\"')}" >> /etc/network/interfaces && sync || true; }; fi`,
    // Systemd persistence fallback: write boot script and unit (+sync so they survive reboot)
    `mkdir -p /usr/local/bin 2>/dev/null || true && printf '%s' "${bootScriptEscaped}" > /usr/local/bin/apply-vlan.sh && chmod +x /usr/local/bin/apply-vlan.sh && sync || true`,
    `printf '%s' "${unitFile.replace(/"/g, '\\"')}" > /etc/systemd/system/apply-vlan.service && systemctl daemon-reload && systemctl enable apply-vlan.service 2>/dev/null && sync || true`,
    // Execute boot script once now to ensure VLAN is present immediately
    `/usr/local/bin/apply-vlan.sh 2>/dev/null || true`,
    // Bring up immediately (runtime)
    `ip link set dev ${parentIface} up 2>/dev/null || ifconfig ${parentIface} up || true`,
    `ip link del dev ${iface} 2>/dev/null || vconfig rem ${iface} 2>/dev/null || true`,
    `ip link add link ${parentIface} name ${iface} type vlan id ${vlanId} 2>/dev/null || vconfig add ${parentIface} ${vlanId}`,
    `ip addr flush dev ${iface} 2>/dev/null || true`,
    `ip addr add ${vlanIp}/${cidr} dev ${iface} 2>/dev/null || ifconfig ${iface} ${vlanIp} netmask ${vlanMask} up`,
    `ip link set dev ${iface} up 2>/dev/null || ifconfig ${iface} up || true`,
    // Add VLAN gateway as a HIGHER metric route so management path stays intact
    vlanGw
      ? `ip route add default via ${vlanGw} dev ${iface} metric 200 2>/dev/null || true`
      : "true",
    // Final verification
    `ip -o link show ${iface} 2>/dev/null | grep -q '${iface}' && echo "VLAN_CREATED ${iface} ${vlanIp}/${cidr}" || echo "VLAN_CREATE_FAILED ${iface}"`,
  ].join(" && ");
};

export const buildVlanDisableCmd = (parentIface) =>
  [
    // Runtime removal of VLAN links
    `for i in $(ip -o link | awk -F": " '/^\\d+: ${parentIface}\\.[0-9]+/ {print $2}'); do ip link set dev "$i" down 2>/dev/null || ifconfig "$i" down 2>/dev/null || true; ip link del "$i" 2>/dev/null || vconfig rem "$i" 2>/dev/null || true; done`,
    // Remove default routes via VLANs with high metrics (safety)
    `ip route | awk '/${parentIface}\\.[0-9]+/ && /default/ {print $0}' | while read line; do set -- $line; ip route del default via $3 dev $5 2>/dev/null || true; done`,
    // Remove netplan vlan file if present
    `[ -f /etc/netplan/99-vlan.yaml ] && rm -f /etc/netplan/99-vlan.yaml && (command -v netplan >/dev/null 2>&1 && netplan apply || true) || true`,
    // Remove interfaces.d config and clean legacy interfaces file
    `[ -d /etc/network/interfaces.d ] && rm -f /etc/network/interfaces.d/vlan.cfg || true`,
    `sed -i '/^auto ${parentIface}\\.[0-9]+$/,/^$/d' /etc/network/interfaces 2>/dev/null || true`,
    // Remove systemd boot persistence
    `systemctl disable --now apply-vlan.service 2>/dev/null || true`,
    `rm -f /etc/systemd/system/apply-vlan.service /usr/local/bin/apply-vlan.sh 2>/dev/null || true`,
    `systemctl daemon-reload 2>/dev/null || true`,
  ].join(" && ");

export const NETWORK_REBOOT_CMD =
  'nohup sh -c "sleep 5; reboot" >/dev/null 2>&1 & echo REBOOT_TRIGGERED';
