export const isValidSipSipIntegerInput = (value) =>
  value === "" || /^\d+$/.test(value);

export const isValidSipSipCalledPrefixInput = (value) =>
  /^[0-9:]*$/.test(value) && value.split(":").length <= 6;

export const isValidSipSipDigitInput = (value) =>
  /^\d*$/.test(value) || value === "";
