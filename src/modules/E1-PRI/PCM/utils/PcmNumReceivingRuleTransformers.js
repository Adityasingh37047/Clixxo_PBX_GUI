export const buildPcmNumReceivingRulePayload = (form) => ({
  number_data: form.number_data.trim(),
  provider: form.provider,
});

export const formatPcmNumReceivingRuleDisplayValue = (value) =>
  value === undefined || value === null || value === "" ? "--" : String(value);
