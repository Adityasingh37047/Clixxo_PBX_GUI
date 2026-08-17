export const validateConferenceForm = ({
  roomName,
  conferenceNumber,
  moderatorMembers,
  maxMembers,
}) => {
  if (!roomName.trim()) return "Room Name is required.";
  const trimmedConferenceNumber = conferenceNumber.trim();
  if (!trimmedConferenceNumber) return "Conference Center Number is required.";

  if (!/^\d{1,9}$/.test(trimmedConferenceNumber)) {
    return "Conference Center Number must be numeric, 1 to 9 digits.";
  }

  if (!Array.isArray(moderatorMembers) || moderatorMembers.length === 0) {
    return "Please select at least one Moderator Member.";
  }

  if (!moderatorMembers.some((member) => !String(member).startsWith("group:"))) {
    return "Please select at least one Moderator Member extension. Group only selection is not allowed.";
  }

  const maxMembersValue = parseInt(maxMembers, 10);
  if (Number.isNaN(maxMembersValue) || maxMembersValue < 1 || maxMembersValue > 200) {
    return "Max Members must be between 1 and 200.";
  }

  return null;
};
