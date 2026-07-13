export const validateOutboundRouteForm = ({ name, priority, passwordType, singlePin, memberExtensions, memberTrunks, timeConditions }) => {
  if (!name.trim()) return "Name is required.";
  const parsedPriority = Number(priority);
  if (!Number.isInteger(parsedPriority) || parsedPriority < 1 || parsedPriority > 99999) return "Priority must be a number between 1 and 99999.";
  if (passwordType === "Single Pin" && !singlePin.trim()) return "Please enter password for Single Pin.";
  if (passwordType === "Single Pin" && !/^\d{1,16}$/.test(singlePin.trim())) return "Password PIN must be digits only (1–16 digits).";
  if (memberExtensions.length === 0) return "Please select at least one member extension.";
  if (memberTrunks.length === 0) return "Please select at least one member trunk.";
  if (timeConditions.includes("Holiday") && !timeConditions.includes("All")) return "Holiday is only valid when All is checked.";
  return null;
};
