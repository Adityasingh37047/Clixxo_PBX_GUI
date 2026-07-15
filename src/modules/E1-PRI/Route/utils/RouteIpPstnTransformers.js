import { ROUTE_IP_PSTN_INITIAL_FORM } from "../../../../constants/RouteIPtoPstnConstants";

export const ROUTE_IP_PSTN_ROUTE_TYPE = "ip_to_pstn";
export const ROUTE_IP_PSTN_ITEMS_PER_PAGE = 20;
export const ROUTE_IP_PSTN_TABLE_WIDE_PX = 1200;

export const mapIpPstnRouteFromApi = (rule) => ({
  id: rule.id,
  callSource: rule.call_source,
  callerIdPrefix: rule.caller_id_prefix,
  calleeIdPrefix: rule.callee_id_prefix,
  callDestination: rule.call_destination,
  numberFilter: rule.number_filter,
  description: rule.description,
});

export const buildIpPstnApiPayload = (dataToSave) => ({
  call_source: dataToSave.callSource,
  caller_id_prefix: dataToSave.callerIdPrefix,
  callee_id_prefix: dataToSave.calleeIdPrefix,
  call_destination: dataToSave.callDestination,
  number_filter: dataToSave.numberFilter,
  description: dataToSave.description,
});

export const buildDefaultRouteIpPstnForm = (sipTrunkGroups, pcmTrunkGroups) => {
  const defaultFormData = { ...ROUTE_IP_PSTN_INITIAL_FORM };
  if (sipTrunkGroups && sipTrunkGroups.length > 0) {
    const firstSipGroup = sipTrunkGroups[0];
    defaultFormData.callSource = String(
      firstSipGroup.group_id || firstSipGroup.id || "",
    );
  }
  if (pcmTrunkGroups && pcmTrunkGroups.length > 0) {
    const firstPcmGroup = pcmTrunkGroups[0];
    defaultFormData.callDestination = String(
      firstPcmGroup.group_id || firstPcmGroup.id || firstPcmGroup,
    );
  }
  defaultFormData.originalIndex = -1;
  return defaultFormData;
};

export const routeIpPstnFormFromRow = (item, index) => ({
  ...item,
  originalIndex: index,
});

export const routeTableMinWidthForZoom = (widePx) => {
  const scale = window.visualViewport?.scale || 1;
  return scale >= 1.15 ? widePx : "100%";
};

export const formatRouteIpPstnDisplayValue = (
  key,
  value,
  rowIndex,
  page,
  itemsPerPage,
  pcmTrunkGroups,
) => {
  if (key === "index") {
    return (page - 1) * itemsPerPage + rowIndex + 1;
  }
  if (value === undefined || value === null || value === "") return "--";

  switch (key) {
    case "callSource":
      return `SIP Trunk Group [${String(value)}]`;
    case "callDestination": {
      const pcmGroup = pcmTrunkGroups.find(
        (group) =>
          String(group.group_id || group.id || group) === String(value),
      );
      if (pcmGroup) {
        const gid = pcmGroup.group_id ?? pcmGroup.id ?? value;
        return `PCM Trunk Group [${String(gid)}]`;
      }
      return `PCM Trunk Group [${String(value)}]`;
    }
    default:
      return String(value);
  }
};

export const groupOptionId = (g) => g.group_id ?? g.id ?? g;
