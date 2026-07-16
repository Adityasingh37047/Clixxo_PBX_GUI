export const validateBlockedListForm = ({
  name,
  matchMode,
  blockedNumber,
  selectedExtension,
}) => {
  const trimmedName = name.trim();
  const trimmedNumber = blockedNumber.trim();
  const valueToBlock =
    matchMode === "Extension"
      ? String(selectedExtension || "").trim()
      : trimmedNumber;

  if (!trimmedName) return "Please enter a Name.";
  if (!valueToBlock) {
    return matchMode === "Extension"
      ? "Please select an Extension."
      : "Please enter a Blocked List Number.";
  }
  return null;
};
