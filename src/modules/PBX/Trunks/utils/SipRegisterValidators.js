export const validateAllowCodecs = (allowCodecs) => {
  if (!allowCodecs || allowCodecs.trim() === "") {
    return "Allow Codecs is required";
  }
  return null;
};

export const validateTrunkId = (trunkId) => {
  if (!trunkId || trunkId.trim() === "") {
    return "Trunk ID is required";
  }
  return null;
};

export const validateUsername = (username) => {
  if (!username || username.trim() === "") {
    return "Username is required";
  }
  return null;
};

export const validatePassword = (password) => {
  if (!password || password.trim() === "") {
    return "Password is required";
  }
  return null;
};

export const validateContext = (context) => {
  if (!context || context.trim() === "") {
    return "Context is required";
  }
  return null;
};

export const validateExpireInSec = (expireInSec) => {
  const valueStr = expireInSec == null ? "" : String(expireInSec);
  if (valueStr.trim() === "") return "Expire In Sec is required";
  if (!/^\d+$/.test(valueStr)) return "Expire In Sec must be a number";
  return null;
};

export const validateProvider = (provider) => {
  if (!provider || provider.trim() === "") {
    return "Provider is required (e.g., example.com:5060)";
  }
  return null;
};

export const validateSipHeader = (sipHeader) => {
  if (!sipHeader || sipHeader.trim() === "") {
    return "SIP Header is required (e.g., example.com)";
  }
  return null;
};

export const validateServerDomain = (serverDomain) => {
  if (!serverDomain || serverDomain.trim() === "") {
    return "Server Domain is required (e.g., sip.domain.in)";
  }
  return null;
};

export const validateClientDomain = (clientDomain) => {
  if (!clientDomain || clientDomain.trim() === "") {
    return "Client Domain is required (e.g., +91XXXXXXXXXX@sip.domain.in)";
  }
  return null;
};

export const validateIdentityIp = (identityIp) => {
  if (!identityIp || identityIp.trim() === "") {
    return "Identity IP is required (e.g., 15.158.34.15)";
  }
  return null;
};

export const validateForm = (data) => {
  const errors = {};

  const merged = {
    ...data,
    expire_in_sec:
      data.ui_register === "No" ? "0" : data.expire_in_sec || "3600",
  };

  const isNonEmpty = (v) =>
    v !== undefined && v !== null && String(v).trim() !== "";

  const trunkIdError = validateTrunkId(merged.trunk_id);
  if (trunkIdError) errors.trunk_id = trunkIdError;

  if (!merged.ui_country || String(merged.ui_country).trim() === "") {
    errors.ui_country = "Country is required";
  }

  const allowCodecsError = validateAllowCodecs(merged.allow_codecs);
  if (allowCodecsError) errors.allow_codecs = allowCodecsError;

  const providerError = validateProvider(merged.provider);
  if (providerError) errors.provider = providerError;

  if (merged.ui_register === "Yes") {
    const usernameError = validateUsername(merged.username);
    if (usernameError) errors.username = usernameError;

    const passwordError = validatePassword(merged.password);
    if (passwordError) errors.password = passwordError;

    const expireInSecError = validateExpireInSec(merged.expire_in_sec);
    if (expireInSecError) errors.expire_in_sec = expireInSecError;

    const regFailRetry = merged.ui_reg_fail_retry;
    if (!regFailRetry || String(regFailRetry).trim() === "") {
      errors.ui_reg_fail_retry = "RegFail Retry is required";
    } else if (!/^\d+$/.test(String(regFailRetry).trim())) {
      errors.ui_reg_fail_retry = "RegFail Retry must be a number";
    }

    if (
      merged.ui_match_username !== "Yes" &&
      merged.ui_match_username !== "No"
    ) {
      errors.ui_match_username = "Match Username must be Yes or No";
    }

    if (merged.ui_enable_proxy) {
      const proxyIp = merged.ui_proxy_ip;
      if (!proxyIp || String(proxyIp).trim() === "") {
        errors.ui_proxy_ip = "Proxy IP is required";
      }
    }
  }

  if (isNonEmpty(merged.sip_header)) {
    const sipHeaderError = validateSipHeader(merged.sip_header);
    if (sipHeaderError) errors.sip_header = sipHeaderError;
  }

  if (isNonEmpty(merged.server_domain)) {
    const serverDomainError = validateServerDomain(merged.server_domain);
    if (serverDomainError) errors.server_domain = serverDomainError;
  }

  if (isNonEmpty(merged.client_domain)) {
    const clientDomainError = validateClientDomain(merged.client_domain);
    if (clientDomainError) errors.client_domain = clientDomainError;
  }

  if (isNonEmpty(merged.identity_ip)) {
    const identityIpError = validateIdentityIp(merged.identity_ip);
    if (identityIpError) errors.identity_ip = identityIpError;
  }

  return errors;
};
