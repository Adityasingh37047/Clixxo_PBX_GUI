export const validateSpeedDialForm = ({ name, speedDialNumber, destination }) => {
  const trimmedName = name.trim();
  const trimmedSpeed = speedDialNumber.trim();
  const trimmedDest = destination.trim();

  if (!trimmedName) return "Name is required.";
  if (!trimmedSpeed) return "Speed Dial Number is required.";
  if (!trimmedDest) return "Destination is required.";
  return null;
};
