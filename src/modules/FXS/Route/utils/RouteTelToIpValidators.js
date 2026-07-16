import {
  validateIPAddress,
  validatePrefix,
} from "./RouteIpToTelValidators";

export { validateIPAddress, validatePrefix };

export const validateRouteTelToIpForm = ({
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

  if (!formData.routeSelf) {
    if (!formData.destinationAddress || formData.destinationAddress === "") {
      return "Please enter a Destination Address!";
    }
    if (!validateIPAddress(formData.destinationAddress)) {
      return "Please enter a valid Destination Address!";
    }
    if (!formData.destinationPort || formData.destinationPort === "") {
      return "Please enter a Destination Port!";
    }
  }

  return null;
};
