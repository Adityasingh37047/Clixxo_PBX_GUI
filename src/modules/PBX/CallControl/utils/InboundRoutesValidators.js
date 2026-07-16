import { INBOUND_ROUTE_DESTINATION_NEEDS_TARGET } from "../../../../constants/InboundRouteConstants";

export const validateInboundRouteForm = ({
  name,
  destination,
  priority,
  extensionRange,
  destinationTarget,
  destinationChoices,
}) => {
  const trimmedName = name.trim();
  if (!trimmedName) return "Name is required.";
  if (!destination) return "Destination is required.";
  const parsedPriority = Number(priority);
  if (
    !Number.isInteger(parsedPriority) ||
    parsedPriority < 1 ||
    parsedPriority > 9999
  ) {
    return "Priority must be a number between 1 and 9999.";
  }
  if (destination === "Extension_Range") {
    if (!extensionRange.trim()) {
      return "Extension range is required (example: 100-136).";
    }
    const rangePattern = /^\d+\s*-\s*\d+$/;
    if (!rangePattern.test(extensionRange.trim())) {
      return "Invalid extension range format. Use format like 100-136.";
    }
  } else if (destinationChoices.length > 0 && !destinationTarget) {
    return "Please select a destination target.";
  }
  return null;
};

export const inboundRouteNeedsDestinationTarget = (destination) =>
  INBOUND_ROUTE_DESTINATION_NEEDS_TARGET.has(destination);
