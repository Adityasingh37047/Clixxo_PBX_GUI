export const validatePcmTrunkGroupForm = (formData, groups) => {
  if (
    formData.groupId === null ||
    formData.groupId === undefined ||
    formData.groupId === ""
  ) {
    return "Please select a Group ID.";
  }

  if (!formData.description || formData.description.trim() === "") {
    return "Please fill in the Description field.";
  }

  if (!formData.pstnIds || formData.pstnIds.length === 0) {
    return "Please select at least one PSTN ID.";
  }

  const newIndex = parseInt(formData.groupId);
  const existingIndexes = groups.map((group) => parseInt(group.groupId));
  const currentIndex =
    formData.originalIndex !== undefined
      ? parseInt(groups[formData.originalIndex]?.groupId)
      : null;
  const otherIndexes = existingIndexes.filter((idx) => idx !== currentIndex);

  if (otherIndexes.includes(newIndex)) {
    return `Index ${newIndex} is already in use. Please select a different index.`;
  }

  return null;
};
