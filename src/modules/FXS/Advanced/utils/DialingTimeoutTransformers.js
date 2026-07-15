export function formFromTimeoutData(timeoutData) {
  return {
    interDigitTimeout: String(timeoutData.interDigitTimeout),
    offHookTimeout: String(timeoutData.offHookTimeout),
    description: timeoutData.description || "example",
  };
}

export function buildSavedTimeoutData(timeoutData, formData) {
  const interDigit = parseInt(formData.interDigitTimeout, 10);
  const offHook = parseInt(formData.offHookTimeout, 10);

  return {
    ...timeoutData,
    interDigitTimeout: interDigit,
    offHookTimeout: offHook,
    description: formData.description.trim(),
  };
}

export function resetDialingTimeoutForm(initialForm) {
  return { ...initialForm };
}
