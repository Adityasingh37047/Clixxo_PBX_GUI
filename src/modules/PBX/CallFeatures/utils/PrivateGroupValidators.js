export const validatePrivateGroupForm = ({ name, memberExtensions }) => {
  const trimmed = name.trim();
  if (!trimmed) return "Name is required.";
  if (!/^[A-Za-z0-9_]+$/.test(trimmed)) {
    return "Name may contain only letters, numbers, and underscore.";
  }
  if (!memberExtensions.length) return "Please select at least one Member.";
  return null;
};
