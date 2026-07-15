export const validateIPAddress = (ip) => {
  if (!ip || ip === "" || ip === "*") return true;
  const ipRegex = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/;
  if (!ipRegex.test(ip)) return false;
  const parts = ip.split(".");
  if (parseInt(parts[0]) === 0 || parseInt(parts[3]) === 0) return false;
  for (let i = 0; i < parts.length; i++) {
    if (parseInt(parts[i]) > 254) return false;
  }
  return true;
};

export const validatePrefix = (prefix) => {
  if (!prefix || prefix === "") return false;
  const regTest = /^[^\%\&\~\!\|\(\)\;\"\'\=\\]*$/;
  return regTest.test(prefix);
};

export const validateRouteIpToTelForm = ({
  formData,
  editIndex,
  rules,
}) => {
  if (!formData.index || formData.index === "") {
    return "Index is required.";
  }
  const indexNum = parseInt(formData.index);
  if (isNaN(indexNum) || indexNum < 0 || indexNum > 63) {
    return "Index must be between 0 and 63.";
  }

  if (editIndex === null) {
    if (rules.some((r) => r.index === indexNum)) {
      return "Index already exists. Please choose a different index.";
    }
  } else if (
    rules.some((r, idx) => idx !== editIndex && r.index === indexNum)
  ) {
    return "Index already exists. Please choose a different index.";
  }

  if (!formData.description || formData.description === "") {
    return "Description is required.";
  }
  if (!validatePrefix(formData.description)) {
    return "Description cannot contain special characters like ~, !, &, | and =";
  }

  if (
    formData.sourceIP &&
    formData.sourceIP !== "" &&
    formData.sourceIP !== "*" &&
    !validateIPAddress(formData.sourceIP)
  ) {
    return "Please enter a valid Source IP Address!";
  }

  if (!formData.callerIdPrefix || formData.callerIdPrefix === "") {
    return "Please enter a CallerID Prefix!";
  }
  if (!validatePrefix(formData.callerIdPrefix)) {
    return "CallerID Prefix cannot contain special characters like ~, !, &, | and =";
  }

  if (!formData.calleeIdPrefix || formData.calleeIdPrefix === "") {
    return "Please enter a CalleeID Prefix!";
  }
  if (!validatePrefix(formData.calleeIdPrefix)) {
    return "CalleeID Prefix cannot contain special characters like ~, !, &, | and =";
  }

  if (formData.routeByNumber) {
    if (!formData.callDestination || formData.callDestination === "") {
      return "Please select a Destination Port Group!";
    }
  }

  return null;
};
