export const isValidNatSettingsIntegerInput = (value) =>
  value === "" || /^\d+$/.test(value);

export const shouldShowNatSettingsField = (form, field) => {
  if (!field.conditional) return true;

  const conditionalValue = form[field.conditional];

  if (field.conditionalValues) {
    return field.conditionalValues.includes(conditionalValue);
  }
  if (field.conditionalValue !== undefined) {
    return conditionalValue === field.conditionalValue;
  }
  return !!conditionalValue;
};

export const isNatSettingsCheckboxDisabled = (form, fieldKey) =>
  fieldKey === "autoDetectNatIp" && !form.learnNat;

export const buildNatSettingsCheckboxUpdate = (form, key) => {
  if (key === "autoDetectNatIp" && !form.learnNat) {
    return null;
  }

  const newValue = !form[key];
  const updates = { [key]: newValue };

  if (key === "learnNat" && !newValue) {
    updates.autoDetectNatIp = false;
  }

  return updates;
};
