export const validateRingGroupForm = ({
  name,
  ringGroupNumber,
  ringTimeout,
  timeoutDestinationType,
  timeoutDestinationValue,
  memberExtensions,
}) => {
  const trimmed = name.trim();
  if (!trimmed) return "Name is required.";
  if (!ringGroupNumber.trim()) return "Ring Group Number is required.";

  const rgNumber = parseInt(ringGroupNumber, 10);
  if (Number.isNaN(rgNumber)) return "Ring Group Number must be numeric.";

  const ringTimeoutInt = parseInt(ringTimeout, 10);
  if (Number.isNaN(ringTimeoutInt)) return "Ring Timeout must be numeric.";

  if (timeoutDestinationType && !timeoutDestinationValue) {
    return "Please select Timeout Destination value.";
  }
  if (!memberExtensions.length) {
    return "Please select at least one Member Extension.";
  }
  return null;
};
