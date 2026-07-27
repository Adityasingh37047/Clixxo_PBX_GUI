import {
  SIP_ACCESS_CONTROL_MODE_WHITELIST,
  SIP_ACCESS_CONTROL_MODE_BLACKLIST,
  SIP_ACCESS_CONTROL_MODE_LABELS,
  SIP_ACCESS_CONTROL_ACTION_PERMIT,
  SIP_ACCESS_CONTROL_ACTION_DENY,
  SIP_ACCESS_CONTROL_IPV4_CATCHALL,
  SIP_ACCESS_CONTROL_IPV6_CATCHALL,
} from "../../../../constants/SipAccessControlConstants";
import { isCatchAllIp, normalizeAction } from "./SipAccessControlIpUtils";

const isDenyCatchAll = (rule, family) =>
  !!rule &&
  normalizeAction(rule.action) === SIP_ACCESS_CONTROL_ACTION_DENY &&
  isCatchAllIp(rule.ip, family);

/**
 * Inspect a raw rules array (as returned by the server) and split it into the
 * locked catch-all prefix (whitelist mode markers) plus the user-editable rules.
 */
export function analyzeAclRules(rules) {
  const list = Array.isArray(rules) ? rules : [];
  let idx = 0;
  let hasIpv4CatchAll = false;
  let hasIpv6CatchAll = false;

  if (isDenyCatchAll(list[idx], "v4")) {
    hasIpv4CatchAll = true;
    idx += 1;
  }
  if (isDenyCatchAll(list[idx], "v6")) {
    hasIpv6CatchAll = true;
    idx += 1;
  }

  const mode = hasIpv4CatchAll
    ? SIP_ACCESS_CONTROL_MODE_WHITELIST
    : SIP_ACCESS_CONTROL_MODE_BLACKLIST;

  return {
    mode,
    blockIpv6: hasIpv6CatchAll,
    editableRules: list.slice(idx).map((rule) => ({
      action: normalizeAction(rule?.action) || SIP_ACCESS_CONTROL_ACTION_DENY,
      ip: String(rule?.ip ?? ""),
    })),
  };
}

/** Default action for a freshly-added rule row, based on the current mode. */
export const getDefaultRuleAction = (mode) =>
  mode === SIP_ACCESS_CONTROL_MODE_WHITELIST
    ? SIP_ACCESS_CONTROL_ACTION_PERMIT
    : SIP_ACCESS_CONTROL_ACTION_DENY;

/** Build the final, ordered {action, ip} rules array the API expects from form state. */
export function buildAclRulesFromForm(form) {
  const rules = [];
  if (form?.mode === SIP_ACCESS_CONTROL_MODE_WHITELIST) {
    rules.push({ action: SIP_ACCESS_CONTROL_ACTION_DENY, ip: SIP_ACCESS_CONTROL_IPV4_CATCHALL });
    if (form?.blockIpv6) {
      rules.push({ action: SIP_ACCESS_CONTROL_ACTION_DENY, ip: SIP_ACCESS_CONTROL_IPV6_CATCHALL });
    }
  }

  (form?.rules || []).forEach((rule) => {
    rules.push({
      action: rule?.action || getDefaultRuleAction(form?.mode),
      ip: String(rule?.ip ?? "").trim(),
    });
  });

  return rules;
}

/** Empty Add form: blacklist mode, one blank deny rule to start from. */
export const createSipAccessControlEmptyForm = () => ({
  name: "",
  mode: SIP_ACCESS_CONTROL_MODE_BLACKLIST,
  blockIpv6: false,
  rules: [{ action: SIP_ACCESS_CONTROL_ACTION_DENY, ip: "" }],
});

/** Map a table row (full ACL incl. rules) into the modal's editable form state. */
export const rowToSipAccessControlForm = (row) => {
  const { mode, blockIpv6, editableRules } = analyzeAclRules(row?.rules);
  return {
    name: row?.name || "",
    mode,
    blockIpv6,
    rules:
      editableRules.length > 0
        ? editableRules
        : [{ action: getDefaultRuleAction(mode), ip: "" }],
  };
};

/** Human label for the Whitelist/Blacklist mode badge. */
export const getSipAccessControlModeLabel = (mode) =>
  SIP_ACCESS_CONTROL_MODE_LABELS[mode] || mode || "—";

/** Compact "permit 192.168.1.0/24" style summary for a single rule. */
export const formatAclRuleSummary = (rule) =>
  `${normalizeAction(rule?.action) || rule?.action || "?"} ${rule?.ip ?? ""}`.trim();