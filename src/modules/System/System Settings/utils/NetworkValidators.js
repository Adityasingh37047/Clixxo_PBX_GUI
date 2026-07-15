import {
  NETWORK_ERR_DHCP_ONLY_ONE,
  NETWORK_ERR_INVALID_ARP,
  NETWORK_ERR_INVALID_GATEWAY,
  NETWORK_ERR_INVALID_IP,
  NETWORK_ERR_INVALID_SUBNET,
} from "../../../../constants/NetworkConstants";

export function isValidIPv4(ip) {
  return /^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(
    ip,
  );
}

export function isValidSubnetMask(mask) {
  if (!/^(\d{1,3}\.){3}\d{1,3}$/.test(mask)) return false;
  const parts = mask.split(".").map(Number);
  if (parts.some((p) => p < 0 || p > 255)) return false;
  // Valid mask: contiguous 1-bits followed by contiguous 0-bits.
  // When inverted, the result must be of the form 2^n - 1 (all trailing 1s),
  // which satisfies (inverted & (inverted + 1)) === 0.
  const num = parts.reduce((acc, p) => (acc << 8) | p, 0) >>> 0;
  const inverted = ~num >>> 0;
  return (inverted & (inverted + 1)) === 0;
}

export function isValidArpMode(mode) {
  return mode === "1" || mode === "2";
}

/**
 * Validates network form fields and builds the pending IP redirect candidate list.
 * DHCP-only-one is checked first; callers should toast NETWORK_ERR_DHCP_ONLY_ONE when dhcpOnlyOne is true.
 */
export function validateNetworkForm({
  lanInterfaces = [],
  dnsServers = ["", ""],
  arpMode = "1",
  originalLanSnapshot = [],
  currentHost = "",
} = {}) {
  const dhcpCount = (lanInterfaces || []).reduce((count, lan) => {
    const type = (lan?.ipv4Type || "Static").toUpperCase();
    return count + (type === "DHCP" ? 1 : 0);
  }, 0);

  if (dhcpCount > 1) {
    return {
      dhcpOnlyOne: true,
      dhcpOnlyOneMessage: NETWORK_ERR_DHCP_ONLY_ONE,
      valid: false,
      ipErrs: [],
      subnetErrs: [],
      gatewayErrs: [],
      dnsErrs: ["", ""],
      arpErr: "",
      pendingList: [],
    };
  }

  let valid = true;
  const ipErrs = new Array(lanInterfaces.length).fill("");
  const subnetErrs = new Array(lanInterfaces.length).fill("");
  const gatewayErrs = new Array(lanInterfaces.length).fill("");
  const dnsErrs = ["", ""];
  let arpErr = "";
  const candidatePriorities = new Map();
  const baselineMap = new Map(
    (originalLanSnapshot || []).map((item) => [item.key, item]),
  );

  lanInterfaces.forEach((lan, idx) => {
    const type = (lan.ipv4Type || "Static").toUpperCase();

    // For DHCP, skip IPv4-related validation and candidate IP selection
    if (type === "DHCP") {
      ipErrs[idx] = "";
      subnetErrs[idx] = "";
      gatewayErrs[idx] = "";
      return;
    }

    if (!isValidIPv4(lan.ipAddress)) {
      ipErrs[idx] = NETWORK_ERR_INVALID_IP;
      valid = false;
    } else {
      ipErrs[idx] = "";
    }
    if (!isValidSubnetMask(lan.subnetMask)) {
      subnetErrs[idx] = NETWORK_ERR_INVALID_SUBNET;
      valid = false;
    } else {
      subnetErrs[idx] = "";
    }
    if (!isValidIPv4(lan.defaultGateway)) {
      gatewayErrs[idx] = NETWORK_ERR_INVALID_GATEWAY;
      valid = false;
    } else {
      gatewayErrs[idx] = "";
    }

    const key = (lan.interface || lan.name || `index-${idx}`).toString();
    const baseline = baselineMap.get(key);
    const candidateIp = (lan.ipAddress || "").trim();
    const previousIp = (baseline?.ipAddress || "").trim();
    const ifaceName = (lan.interface || "").toLowerCase();
    const displayName = (lan.name || "").toLowerCase();
    const isPrimaryIface = ifaceName === "eth0" || displayName === "lan 1";

    const addCandidate = (ip, priority) => {
      if (!ip) return;
      const value = ip.trim();
      if (!value) return;
      const existing = candidatePriorities.get(value);
      if (existing === undefined || priority < existing) {
        candidatePriorities.set(value, priority);
      }
    };

    if (candidateIp && previousIp && candidateIp !== previousIp) {
      addCandidate(candidateIp, isPrimaryIface ? 0 : 1);
      addCandidate(previousIp, isPrimaryIface ? 2 : 3);
    } else if (candidateIp) {
      addCandidate(candidateIp, isPrimaryIface ? 0 : 5);
    }
  });

  if (dnsServers[0] && !isValidIPv4(dnsServers[0])) {
    dnsErrs[0] = NETWORK_ERR_INVALID_IP;
    valid = false;
  }
  if (dnsServers[1] && !isValidIPv4(dnsServers[1])) {
    dnsErrs[1] = NETWORK_ERR_INVALID_IP;
    valid = false;
  }
  if (!isValidArpMode(arpMode)) {
    arpErr = NETWORK_ERR_INVALID_ARP;
    valid = false;
  }

  if (currentHost) {
    const existing = candidatePriorities.get(currentHost);
    candidatePriorities.set(
      currentHost,
      existing === undefined ? 10 : Math.min(existing, 10),
    );
  }

  const pendingList = Array.from(candidatePriorities.entries())
    .sort((a, b) => a[1] - b[1])
    .map(([ip]) => ip);

  return {
    dhcpOnlyOne: false,
    dhcpOnlyOneMessage: null,
    valid,
    ipErrs,
    subnetErrs,
    gatewayErrs,
    dnsErrs,
    arpErr,
    pendingList,
  };
}
