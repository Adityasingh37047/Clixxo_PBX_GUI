export const validatePcmNumReceivingRuleForm = (form) => {
  if (!form.number_data || !String(form.number_data).trim()) {
    return "Number Data is required";
  }
  if (!form.provider) {
    return "Provider is required";
  }
  return null;
};
