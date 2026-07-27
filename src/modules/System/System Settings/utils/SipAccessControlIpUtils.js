import {
  SIP_ACCESS_CONTROL_ACTION_PERMIT,
  SIP_ACCESS_CONTROL_ACTION_DENY,
} from "../../../../constants/SipAccessControlConstants";

const IPV4_OCTET = "(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])";
const IPV4_RE = new RegExp(`^${IPV4_OCTET}(\\.${IPV4_OCTET}){3}$`);

// Widely-used "compressed or full" IPv6 regex — frontend feedback only, the
// server remains the source of truth for anything ambiguous.
const IPV6_RE = new RegExp(
  "^(" +
    "([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|" +
    "([0-9a-fA-F]{1,4}:){1,7}:|" +
    "([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|" +
    "([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|" +
    "([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|" +
    "([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|" +
    "([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|" +
    "[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|" +
    ":((:[0-9a-fA-F]{1,4}){1,7}|:)" +
    ")$",
);

export const isValidIPv4 = (value) => IPV4_RE.test(value);
export const isValidIPv6 = (value) => IPV6_RE.test(value);

const ipv4ToBinaryString = (ip) =>
  ip
    .split(".")
    .map((octet) => Number(octet).toString(2).padStart(8, "0"))
    .join("");

/** A netmask is valid ACL syntax only if it's contiguous: all 1-bits then all 0-bits. */
export const isContiguousNetmask = (ip) => {
  if (!isValidIPv4(ip)) return false;
  return /^1*0*$/.test(ipv4ToBinaryString(ip));
};

const maskToPrefixLength = (ip) =>
  ipv4ToBinaryString(ip).split("").filter((bit) => bit === "1").length;

/**
 * Classify a bare IP / CIDR / dotted-netmask string the same way the backend does.
 * @returns {{ valid: boolean, family?: 'v4'|'v6', prefix?: number }}
 */
export const classifyIpOrCidr = (raw) => {
  const value = String(raw ?? "").trim();
  if (!value) return { valid: false };

  const slashIdx = value.indexOf("/");
  if (slashIdx === -1) {
    if (isValidIPv4(value)) return { valid: true, family: "v4", prefix: 32 };
    if (isValidIPv6(value)) return { valid: true, family: "v6", prefix: 128 };
    return { valid: false };
  }

  const address = value.slice(0, slashIdx);
  const suffix = value.slice(slashIdx + 1);
  if (!address || !suffix) return { valid: false };

  if (isValidIPv4(address)) {
    if (/^\d{1,2}$/.test(suffix)) {
      const prefix = Number(suffix);
      return prefix >= 0 && prefix <= 32
        ? { valid: true, family: "v4", prefix }
        : { valid: false };
    }
    if (isContiguousNetmask(suffix)) {
      return { valid: true, family: "v4", prefix: maskToPrefixLength(suffix) };
    }
    return { valid: false };
  }

  if (isValidIPv6(address)) {
    if (/^\d{1,3}$/.test(suffix)) {
      const prefix = Number(suffix);
      return prefix >= 0 && prefix <= 128
        ? { valid: true, family: "v6", prefix }
        : { valid: false };
    }
    return { valid: false };
  }

  return { valid: false };
};

export const isCatchAllIp = (raw, family) => {
  const result = classifyIpOrCidr(raw);
  return result.valid && result.family === family && result.prefix === 0;
};

export const normalizeAction = (raw) => {
  const value = String(raw ?? "").trim().toLowerCase();
  return value === SIP_ACCESS_CONTROL_ACTION_PERMIT ||
    value === SIP_ACCESS_CONTROL_ACTION_DENY
    ? value
    : "";
};
