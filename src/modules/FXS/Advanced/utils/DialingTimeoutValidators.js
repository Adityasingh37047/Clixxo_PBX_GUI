export function validateDialingTimeoutForm(formData) {
  if (!formData.description || formData.description.trim() === "") {
    return "Description is required.";
  }

  if (
    !formData.interDigitTimeout ||
    formData.interDigitTimeout.trim() === ""
  ) {
    return "Inter Digit Timeout is required.";
  }

  const interDigit = parseInt(formData.interDigitTimeout, 10);
  if (isNaN(interDigit) || interDigit < 0) {
    return "Inter Digit Timeout must be a valid positive number.";
  }

  if (!formData.offHookTimeout || formData.offHookTimeout.trim() === "") {
    return "Off-hook Waiting Keypress Timeout is required.";
  }

  const offHook = parseInt(formData.offHookTimeout, 10);
  if (isNaN(offHook) || offHook < 0) {
    return "Off-hook Waiting Keypress Timeout must be a valid positive number.";
  }

  return null;
}
