import {
  SIP_ACCESS_CONTROL_NAME_REGEX,
  SIP_ACCESS_CONTROL_NAME_MAX_LENGTH,
  SIP_ACCESS_CONTROL_ERR_NAME_REQUIRED,
  SIP_ACCESS_CONTROL_ERR_NAME_INVALID,
  SIP_ACCESS_CONTROL_ERR_NAME_TOO_LONG,
  SIP_ACCESS_CONTROL_ERR_DUPLICATE_NAME,
  SIP_ACCESS_CONTROL_ERR_NO_RULES,
  SIP_ACCESS_CONTROL_ERR_RULE_ACTION,
  SIP_ACCESS_CONTROL_ERR_RULE_IP,
} from "../../../../constants/SipAccessControlConstants";
import { buildAclRulesFromForm } from "./SipAccessControlTransformers";
import {
  isValidIPv4,
  isValidIPv6,
  isContiguousNetmask,
  classifyIpOrCidr,
  isCatchAllIp,
  normalizeAction,
} from "./SipAccessControlIpUtils";

export {
  isValidIPv4,
  isValidIPv6,
  isContiguousNetmask,
  classifyIpOrCidr,
  isCatchAllIp,
  normalizeAction,
};

export const isValidAclName = (name) => SIP_ACCESS_CONTROL_NAME_REGEX.test(name);

/** Validate a single {action, ip} rule. Returns the normalized rule on success. */
export function validateAclRule(rule) {
  const action = normalizeAction(rule?.action);
  if (!action) {
    return { valid: false, error: SIP_ACCESS_CONTROL_ERR_RULE_ACTION };
  }

  const ip = String(rule?.ip ?? "").trim();
  const classified = classifyIpOrCidr(ip);
  if (!classified.valid) {
    return { valid: false, error: SIP_ACCESS_CONTROL_ERR_RULE_IP(rule?.ip ?? "") };
  }

  return { valid: true, rule: { action, ip } };
}

/**
 * Validate the full Add/Edit ACL form (name + mode/catch-all + rule rows).
 * @returns {{ valid: boolean, error: string|null, payload?: { name: string, rules: Array } }}
 */
export function validateSipAccessControlForm(form, rows = [], editingId = null) {
  const name = String(form?.name || "").trim();
  if (!name) {
    return { valid: false, error: SIP_ACCESS_CONTROL_ERR_NAME_REQUIRED };
  }
  if (name.length > SIP_ACCESS_CONTROL_NAME_MAX_LENGTH) {
    return { valid: false, error: SIP_ACCESS_CONTROL_ERR_NAME_TOO_LONG };
  }
  if (!isValidAclName(name)) {
    return { valid: false, error: SIP_ACCESS_CONTROL_ERR_NAME_INVALID };
  }

  const duplicate = rows.some(
    (row) =>
      row.id !== editingId &&
      String(row.name || "").trim().toLowerCase() === name.toLowerCase(),
  );
  if (duplicate) {
    return { valid: false, error: SIP_ACCESS_CONTROL_ERR_DUPLICATE_NAME };
  }

  const rawRules = buildAclRulesFromForm(form);
  if (!rawRules.length) {
    return { valid: false, error: SIP_ACCESS_CONTROL_ERR_NO_RULES };
  }

  const rules = [];
  for (const rawRule of rawRules) {
    const result = validateAclRule(rawRule);
    if (!result.valid) {
      return { valid: false, error: result.error };
    }
    rules.push(result.rule);
  }

  return { valid: true, error: null, payload: { name, rules } };
}