export const isValidSipCompatibilityIntegerInput = (value) =>
  value === "" || /^\d+$/.test(value);

export const shouldShowSipCompatibilityField = (form, field) => {
  if (!field.conditional) return true;

  const conditionalValue = form[field.conditional];

  if (field.key === "key") {
    return !!form.sipEncryption;
  }

  if (field.conditionalValues) {
    return field.conditionalValues.includes(conditionalValue);
  }
  if (field.conditionalValue !== undefined) {
    return conditionalValue === field.conditionalValue;
  }
  return !!conditionalValue;
};
