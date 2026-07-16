export const validateE1PriCallerIDReservePoolForm = (formData, fields) => {
  const newErrors = {};
  fields.forEach((field) => {
    if (
      !formData[field.name] ||
      formData[field.name].toString().trim() === ""
    ) {
      newErrors[field.name] = `${field.label} is required.`;
    }
  });
  return newErrors;
};
