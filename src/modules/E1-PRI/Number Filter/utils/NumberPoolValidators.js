export const validateNumberRange = (start, end) => {
  if (!start || !end) return "";

  const startDigits = start.toString().length;
  const endDigits = end.toString().length;

  if (startDigits !== endDigits) {
    return `Error: Start and End numbers must have the same number of digits. Start has ${startDigits} digit(s), End has ${endDigits} digit(s).`;
  }

  if (parseInt(start) > parseInt(end)) {
    return "Error: Start number cannot be greater than End number.";
  }

  return "";
};

export const validateNumberPoolRequiredRange = (start, end) => {
  if (!start || !end) {
    return "Please fill the range.";
  }
  return null;
};
