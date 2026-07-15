import { FUNCTION_KEY_FIELDS } from "../../../../constants/FunctionKeyConstants";

const pattern1 = /^\*\d{0,9}\*{0,1}$/;
const pattern2 = /^\*#\d{0,9}\*#$/;

export function validateFunctionKeyForm(formData) {
  const funkeyArr = [];

  for (const field of FUNCTION_KEY_FIELDS) {
    if (!formData[field.enableKey]) continue;

    const functionKey = formData[field.functionKeyKey];
    const mode = formData[field.modeKey];
    const pattern = field.isReboot ? pattern2 : pattern1;

    if (mode === "1" && !pattern.test(functionKey)) {
      return {
        message: field.isReboot
          ? `Please input the function key for '${field.name}' in the right format, like *#88921532*#`
          : `Please input the function key for '${field.name}', in the right format, like ${field.defaultValue}`,
        field,
      };
    }

    if (functionKey && funkeyArr.includes(functionKey)) {
      return {
        message: "Function key repeated!",
        field,
      };
    }
    if (functionKey) funkeyArr.push(functionKey);
  }

  return null;
}
