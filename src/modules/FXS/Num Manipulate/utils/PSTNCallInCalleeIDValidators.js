export const validatePSTNCallInCalleeIDForm = (formData) => {
  if (!formData.call_initiator) {
    return "Source Port Group is required.";
  }
  if (!formData.callerid_prefix) {
    return "CallerID Prefix is required.";
  }
  if (!formData.calleeid_prefix) {
    return "CalleeID Prefix is required.";
  }
  return null;
};
