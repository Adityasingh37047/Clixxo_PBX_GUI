import { ROUTE_PSTN_IP_INITIAL_FORM } from "../../../../constants/FxsRoutePstnToIPConstants";
import {
  getAvailableRouteIpToTelIndices,
  routeTableMinWidthForZoom,
} from "./RouteIpToTelTransformers";

export {
  getAvailableRouteIpToTelIndices as getAvailableRouteTelToIpIndices,
  routeTableMinWidthForZoom,
};

export const routeTelToIpFormFromRow = (item) => ({
  index: String(item.index || ""),
  description: item.description || "default",
  sourcePortGroup: item.sourcePortGroup || "*",
  callerIdPrefix: item.callerIdPrefix || "*",
  calleeIdPrefix: item.calleeIdPrefix || "*",
  routeSelf: item.routeSelf || false,
  destinationAddress: item.destinationAddress || "",
  destinationPort: item.destinationPort || "5060",
});

export const buildDefaultRouteTelToIpForm = (rules) => {
  const defaultFormData = { ...ROUTE_PSTN_IP_INITIAL_FORM };
  const available = getAvailableRouteIpToTelIndices(rules);
  const firstAvailable = available.length > 0 ? available[0].value : "0";
  defaultFormData.index = firstAvailable;
  return { defaultFormData, firstAvailable };
};

export const normalizeRouteTelToIpRule = (formData, editIndex, rules) => {
  const indexNum = parseInt(formData.index);
  return {
    index: indexNum,
    description: formData.description,
    sourcePortGroup: formData.sourcePortGroup || "*",
    callerIdPrefix: formData.callerIdPrefix,
    calleeIdPrefix: formData.calleeIdPrefix,
    routeSelf: formData.routeSelf,
    destinationAddress: formData.routeSelf ? "" : formData.destinationAddress,
    destinationPort: formData.routeSelf ? "5060" : formData.destinationPort,
    id: editIndex !== null ? rules[editIndex].id : Date.now(),
  };
};

export const formatRouteTelToIpDisplayValue = (key, value, portGroups) => {
  if (value === undefined || value === null || value === "") return "--";

  switch (key) {
    case "sourcePortGroup": {
      const portGroup = portGroups.find(
        (group) =>
          String(group.group_id || group.id || group) === String(value),
      );
      if (portGroup) {
        const gid = portGroup.group_id ?? portGroup.id ?? value;
        return String(gid);
      }
      return String(value);
    }
    default:
      return String(value);
  }
};
