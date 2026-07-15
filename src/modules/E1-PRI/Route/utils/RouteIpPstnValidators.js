export const validatePrefix = (prefix) => /^[\d*]+$/.test(prefix || "");

export const validateRouteIpPstnForm = (dataToSave) => {
  if (!validatePrefix(dataToSave.callerIdPrefix)) {
    return "Invalid CallerID Prefix! Only numbers (0-9) and asterisks (*) are allowed.";
  }
  if (!validatePrefix(dataToSave.calleeIdPrefix)) {
    return "Invalid CalleeID Prefix! Only numbers (0-9) and asterisks (*) are allowed.";
  }
  return null;
};
