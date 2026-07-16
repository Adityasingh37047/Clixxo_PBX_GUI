export const isValidFxsVoipSipIntegerInput = (value) =>
  value === "" || /^\d+$/.test(value);

export const shouldShowFxsVoipSipField = (form, field) => {
  if (!field.conditional) return true;
  const conditionalValue = form[field.conditional];
  if (field.conditionalValues)
    return field.conditionalValues.includes(conditionalValue);
  if (field.conditionalValue !== undefined)
    return conditionalValue === field.conditionalValue;
  return !!conditionalValue;
};
