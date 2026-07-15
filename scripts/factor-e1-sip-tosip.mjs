#!/usr/bin/env node
/**
 * Factor SipToSipAccountPage from scripts/_head_sip backup.
 * Strategy: UI primitives → FormFields; styles → TableHelpers;
 * validators/transformers → utils; logic → hook; table+modal JSX → thin Page.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const SIP = path.join(ROOT, "src/modules/E1-PRI/SIP");
const HEAD = path.join(ROOT, "scripts/_head_sip/SipToSipAccountPage.jsx");

function write(rel, content) {
  const full = path.join(SIP, rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content.replace(/\r\n/g, "\n"), "utf8");
  console.log("wrote", rel, content.split("\n").length, "lines");
}

const src = fs.readFileSync(HEAD, "utf8").replace(/\r\n/g, "\n");
const lines = src.split("\n");
console.log("source lines", lines.length);

// Find boundaries
const pageStart = lines.findIndex((l) => l.startsWith("const SipToSipAccountPage"));
const returnIdx = (() => {
  // find the main return ( after renderFormField )
  for (let i = pageStart; i < lines.length; i++) {
    if (lines[i].trim() === "return (" && lines[i - 1]?.includes("renderFormField")) {
      // wrong - renderFormField ends just before return
    }
  }
  // The main component return is the last `  return (` before export, at indent 2 spaces after pageStart
  for (let i = pageStart; i < lines.length; i++) {
    if (lines[i] === "  return (") return i;
  }
  return -1;
})();
console.log({ pageStart: pageStart + 1, returnIdx: returnIdx + 1 });

// ── Validators ──
write(
  "utils/SipToSipAccountValidators.js",
  `import {
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
  const contactRegex = /^(?:sip:)?(?:\\d{1,3}\\.){3}\\d{1,3}$/;
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
`,
);

// ── Transformers ──
write(
  "utils/SipToSipAccountTransformers.js",
  `export const parseCodecList = (value) => {
  if (!value) return [];
  if (typeof value === "object" && !Array.isArray(value)) {
    return Object.entries(value)
      .filter(([, enabled]) => !!enabled)
      .map(([codec]) => codec);
  }
  return String(value)
    .split(",")
    .map((c) => c.trim())
    .filter(Boolean);
};

export const normalizeAllowCodecs = (value) => parseCodecList(value).join(",");

export const transformSipToSipAccountList = (list) => {
  const sorted = [...list].sort(
    (a, b) => (parseInt(a.extension) || 0) - (parseInt(b.extension) || 0),
  );
  return sorted.map((it, i) => ({
    index: (i + 1).toString(),
    extension: it.extension,
    context: it.context,
    allow_codecs: normalizeAllowCodecs(it.codecs || it.allow_codecs),
    password: it.password,
    contact: it.contact,
    from_domain: it.from_domain || it["Domain name"] || "",
    contact_user: it.contact_user || it["Contact User"] || "",
    outbound_proxy: it.outbound_proxy || it["Outbound Proxy"] || "",
    status: it.status || "",
  }));
};

export const transformSipToSipAccountUiToApi = (uiData) => ({
  extension: uiData.extension,
  context: uiData.context,
  allow_codecs: uiData.allow_codecs,
  password: uiData.password,
  contact:
    uiData.contact && String(uiData.contact).trim().startsWith("sip:")
      ? uiData.contact
      : \`sip:\${String(uiData.contact || "").trim()}\`,
  from_domain: uiData.from_domain,
  contact_user: uiData.contact_user,
  outbound_proxy: uiData.outbound_proxy,
});
`,
);

console.log("validators/transformers done");
