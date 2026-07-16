export const validatePrefix = (prefix) => {
  const validPrefixPattern = /^[\d*]+$/;
  return validPrefixPattern.test(prefix);
};

export const validateRoutePstnToIpForm = (formData) => {
  if (!validatePrefix(formData.callerIdPrefix)) {
    return "Invalid CallerID Prefix! Only numbers (0-9) and asterisks (*) are allowed.";
  }
  if (!validatePrefix(formData.calleeIdPrefix)) {
    return "Invalid CalleeID Prefix! Only numbers (0-9) and asterisks (*) are allowed.";
  }
  return null;
};
