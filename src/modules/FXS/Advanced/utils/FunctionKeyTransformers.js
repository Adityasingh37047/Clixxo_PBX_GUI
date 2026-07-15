import { FUNCTION_KEY_FIELDS } from "../../../../constants/FunctionKeyConstants";

export function groupFieldsBySection(fields = FUNCTION_KEY_FIELDS) {
  return fields.reduce((acc, field) => {
    if (!acc[field.section]) acc[field.section] = [];
    acc[field.section].push(field);
    return acc;
  }, {});
}

export function applyEnableChange(prev, field) {
  const newData = { ...prev };
  const enabled = !prev[field.enableKey];
  newData[field.enableKey] = enabled;
  if (enabled && prev[field.modeKey] === "0") {
    newData[field.functionKeyKey] = field.defaultValue;
  }
  return newData;
}

export function applyModeChange(prev, field, value) {
  const newData = { ...prev, [field.modeKey]: value };
  if (value === "0") {
    newData[field.functionKeyKey] = field.defaultValue;
  }
  return newData;
}

export function resetFunctionKeyForm(initialForm) {
  return { ...initialForm };
}
