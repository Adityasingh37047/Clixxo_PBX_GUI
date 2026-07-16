export function sanitizeQosDigits(value) {
  return String(value || "").replace(/\D/g, "");
}

export function resetQosForm(initialForm) {
  return { ...initialForm };
}
