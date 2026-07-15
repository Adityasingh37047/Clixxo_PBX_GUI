export const validateCcRouteForm = ({ selectedExtensions }) => {
  if (!selectedExtensions?.length) {
    return "Please select at least one member extension.";
  }
  return null;
};
