export const validateDisaForm = (form) => {
  if (!form.name.trim()) return "Name is required.";

  const respTimeout = Number(form.responseTimeout);
  if (!form.responseTimeout.trim() || isNaN(respTimeout) || respTimeout < 1) {
    return "Response Timeout must be 1 or greater.";
  }

  const digTimeout = Number(form.digitTimeout);
  if (!form.digitTimeout.trim() || isNaN(digTimeout) || digTimeout < 1) {
    return "Digit Timeout must be 1 or greater.";
  }

  if (form.pinType === "Single Pin" && !form.pin.trim()) {
    return "Pin number is required.";
  }

  return null;
};
