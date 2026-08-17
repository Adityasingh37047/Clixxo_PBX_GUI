export const validateIvrName = (name) => {
  const trimmedName = String(name || "").trim();
  if (!trimmedName) return "Name is required.";
  return /^[A-Za-z0-9_]+$/.test(trimmedName) ? null : "Name may contain only letters, numbers, and underscore.";
};
export const validateIvrNumber = (value) => {
  const trimmed = String(value || "").trim();
  if (!trimmed) return "IVR Number is required.";
  return /^\d{1,9}$/.test(trimmed) ? null : "IVR Number must be numeric, 1 to 9 digits.";
};
export const validateResponseTimeout = (value) => {
  const number = parseInt(value, 10);
  return !Number.isNaN(number) && number >= 1000 && number <= 60000 ? null : "Response Timeout must be between 1000 and 60000 ms.";
};
export const validateInterDigitTimeout = (value) => {
  const number = parseInt(value, 10);
  return !Number.isNaN(number) && number >= 500 && number <= 10000 ? null : "Inter-Digit Timeout must be between 500 and 10000 ms.";
};
export const validateDigitLength = (value) => {
  const number = parseInt(value, 10);
  return !Number.isNaN(number) && number >= 1 && number <= 20 ? null : "Digit Length must be between 1 and 20.";
};
export const validateIvrForm = ({ name, ivrNumber, responseTimeout, interDigitTimeout, digitLength, directOutbound, selectedOutboundRouteIds }) =>
  validateIvrName(name) || validateIvrNumber(ivrNumber) || validateResponseTimeout(responseTimeout) || validateInterDigitTimeout(interDigitTimeout) || validateDigitLength(digitLength) ||
  (directOutbound && selectedOutboundRouteIds.length === 0 ? "Please select at least one outbound route when Direct Outbound is enabled." : null);
