/** AutoProvision is read-only — no form validators. */
export const getAutoProvisionLoadErrorMessage = (err, fallbackMessage) =>
  err?.message ||
  err?.response?.data?.message ||
  fallbackMessage;
