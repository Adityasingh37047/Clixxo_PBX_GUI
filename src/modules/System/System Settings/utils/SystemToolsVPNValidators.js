export const isSystemToolsVPNCertificateValid = (file) =>
  !!file && /\.(cer|crt)$/i.test(file.name || "");

export const isSystemToolsVPNKeyValid = (file) =>
  !!file && /\.key$/i.test(file.name || "");

export const validateSystemToolsVPNSoftEtherForm = (form, authMethod, certFile, keyFile) => {
  const fields = [form.connectionName, form.server, form.hub, form.username, form.password, form.port];
  if (!fields.every((value) => String(value || "").trim().length > 0)) return "Please fill all fields (Connection Name, Server, Port, HUB, Username, Password).";
  if (authMethod === "certificate" && !isSystemToolsVPNCertificateValid(certFile)) return "Please upload a valid certificate file (.cer or .crt).";
  if (authMethod === "certificate" && !isSystemToolsVPNKeyValid(keyFile)) return "Please upload a valid key file (.key).";
  return null;
};
