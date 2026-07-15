export const validateExtensionGroup = (groupName, selectedExtensions) => {
  const name = groupName?.trim();
  if (!name) return { name: "", error: "Please enter a group name." };
  if (selectedExtensions.length === 0) {
    return { name: "", error: "Please select at least one extension." };
  }
  return { name, error: "" };
};
