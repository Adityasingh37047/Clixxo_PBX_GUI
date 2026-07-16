import {
  SIP_TO_SIP_ACCOUNT_ERR_EXTENSION_REQUIRED,
  SIP_TO_SIP_ACCOUNT_ERR_PASSWORD_REQUIRED,
  SIP_TO_SIP_ACCOUNT_ERR_CONTEXT_REQUIRED,
  SIP_TO_SIP_ACCOUNT_ERR_ALLOW_CODECS_REQUIRED,
  SIP_TO_SIP_ACCOUNT_ERR_CONTACT_REQUIRED,
  SIP_TO_SIP_ACCOUNT_ERR_CONTACT_FORMAT,
  SIP_TO_SIP_ACCOUNT_ERR_DOMAIN_REQUIRED,
  SIP_TO_SIP_ACCOUNT_ERR_CONTACT_USER_REQUIRED,
  SIP_TO_SIP_ACCOUNT_ERR_OUTBOUND_PROXY_REQUIRED,
} from "../../../../constants/SipToSipAccountConstants";

export const validateExtension = (extension) => {
  if (!extension || extension.trim() === "") {
    return SIP_TO_SIP_ACCOUNT_ERR_EXTENSION_REQUIRED;
  }
  return null;
};

export const validatePassword = (password) => {
  if (!password || password.trim() === "") {
    return SIP_TO_SIP_ACCOUNT_ERR_PASSWORD_REQUIRED;
  }
  return null;
};

export const validateContext = (context) => {
  if (!context || context.trim() === "") {
    return SIP_TO_SIP_ACCOUNT_ERR_CONTEXT_REQUIRED;
  }
  return null;
};

export const validateAllowCodecs = (allowCodecs) => {
  if (!allowCodecs || allowCodecs.trim() === "") {
    return SIP_TO_SIP_ACCOUNT_ERR_ALLOW_CODECS_REQUIRED;
  }
  return null;
};

export const validateContact = (contact) => {
  if (!contact || String(contact).trim() === "") {
    return SIP_TO_SIP_ACCOUNT_ERR_CONTACT_REQUIRED;
  }
  const contactRegex = /^(?:sip:)?(?:\d{1,3}\.){3}\d{1,3}$/;
  if (!contactRegex.test(String(contact).trim())) {
    return SIP_TO_SIP_ACCOUNT_ERR_CONTACT_FORMAT;
  }
  return null;
};

export const validateDomainName = (domainName) => {
  if (!domainName || domainName.trim() === "") {
    return SIP_TO_SIP_ACCOUNT_ERR_DOMAIN_REQUIRED;
  }
  return null;
};

export const validateContactUser = (contactUser) => {
  if (!contactUser || contactUser.trim() === "") {
    return SIP_TO_SIP_ACCOUNT_ERR_CONTACT_USER_REQUIRED;
  }
  return null;
};

export const validateOutboundProxy = (outboundProxy) => {
  if (!outboundProxy || outboundProxy.trim() === "") {
    return SIP_TO_SIP_ACCOUNT_ERR_OUTBOUND_PROXY_REQUIRED;
  }
  return null;
};

export const validateSipToSipAccountForm = (form) => {
  const errors = {};

  const extensionError = validateExtension(form.extension);
  if (extensionError) errors.extension = extensionError;

  const passwordError = validatePassword(form.password);
  if (passwordError) errors.password = passwordError;

  const contextError = validateContext(form.context);
  if (contextError) errors.context = contextError;

  const allowCodecsError = validateAllowCodecs(form.allow_codecs);
  if (allowCodecsError) errors.allow_codecs = allowCodecsError;

  const contactError = validateContact(form.contact);
  if (contactError) errors.contact = contactError;

  const domainNameError = validateDomainName(form.from_domain);
  if (domainNameError) errors.from_domain = domainNameError;

  const contactUserError = validateContactUser(form.contact_user);
  if (contactUserError) errors.contact_user = contactUserError;

  const outboundProxyError = validateOutboundProxy(form.outbound_proxy);
  if (outboundProxyError) errors.outbound_proxy = outboundProxyError;

  return errors;
};
