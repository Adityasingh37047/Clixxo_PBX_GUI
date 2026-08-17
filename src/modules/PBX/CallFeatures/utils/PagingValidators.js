export const validatePagingForm = ({
  name,
  number,
  memberExtensions,
}) => {
  const trimmedName = name.trim();
  const trimmedNumber = number.trim();
  if (!trimmedName) return "Name is required.";
  if (!trimmedNumber) return "Number is required.";
  if (!/^\d{1,9}$/.test(trimmedNumber))
    return "Number must be numeric, 1 to 9 digits.";
  if (!memberExtensions.length)
    return "Please select at least one Member.";
  return null;
};
