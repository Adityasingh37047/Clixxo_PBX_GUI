export const validateCallBackForm = ({ name, delay, destination }) => {
  const trimmedName = name.trim();
  if (!trimmedName) return "Please enter a Name.";
  if (!delay) return "Please enter Delay (s).";
  if (!destination) return "Please select Destination.";
  return null;
};
