import { FXS_FIELDS } from "../../../../constants/FxsConstants";

export function getFieldByKey(key) {
  return FXS_FIELDS.find((field) => field.key === key);
}

export function shouldShowField(field, formData) {
  if (!field?.conditional) return true;
  const conditionalValue = formData[field.conditional];
  if (field.conditionalValue !== undefined) {
    return conditionalValue === field.conditionalValue;
  }
  return !!conditionalValue;
}

export function resetFxsForm(initialForm) {
  return { ...initialForm };
}
