export const validateOutboundRestrictionForm = ({ name, memberExtensions }) => {
  const trimmedName = name.trim();
  if (!trimmedName) return "Name is required.";
  if (memberExtensions.length === 0) {
    return "Please select at least one member extension.";
  }
  return null;
};
