import { HOSTS_MESSAGES } from "../../../../constants/HostsConstants";

const IP_REGEX =
  /^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;

export function validateProxyIp(ip) {
  if (!ip || ip.trim() === "") {
    return HOSTS_MESSAGES.PROXY_IP_REQUIRED;
  }
  if (!IP_REGEX.test(ip)) {
    return HOSTS_MESSAGES.PROXY_IP_INVALID;
  }
  return null;
}

export function validateDomain() {
  return null;
}

export function validateHostsForm(form) {
  const errors = {};

  const ipError = validateProxyIp(form.proxyIp);
  if (ipError) errors.proxyIp = ipError;

  const domainError = validateDomain(form.domain);
  if (domainError) errors.domain = domainError;

  return errors;
}

export function validateHostsField(key, value) {
  switch (key) {
    case "proxyIp":
      return validateProxyIp(value);
    case "domain":
      return validateDomain(value);
    default:
      return null;
  }
}

export function shouldConfirmHostsDelete(confirmed) {
  return Boolean(confirmed);
}

export function shouldConfirmHostsClear(confirmed) {
  return Boolean(confirmed);
}
