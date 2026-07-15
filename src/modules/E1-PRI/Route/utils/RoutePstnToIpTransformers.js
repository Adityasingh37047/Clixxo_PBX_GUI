import { ROUTE_PSTN_IP_INITIAL_FORM } from "../../../../constants/RoutePstnToIPConstants";

export const ROUTE_PSTN_TO_IP_ROUTE_TYPE = "pstn_to_ip";
export const ROUTE_PSTN_TO_IP_ITEMS_PER_PAGE = 20;
export const ROUTE_PSTN_TO_IP_TABLE_WIDE_PX = 1600;

export const mapPstnToIpRouteFromApi = (rule) => ({
  ...rule,
  callInitiator: rule.call_source,
  callerIdPrefix: rule.caller_id_prefix,
  calleeIdPrefix: rule.callee_id_prefix,
  callDestination: rule.call_destination,
  numberFilter: rule.number_filter,
});

export const buildPstnToIpApiPayload = (formDataToSave) => ({
  call_source: formDataToSave.callInitiator,
  caller_id_prefix: formDataToSave.callerIdPrefix,
  callee_id_prefix: formDataToSave.calleeIdPrefix,
  call_destination: formDataToSave.callDestination,
  number_filter: formDataToSave.numberFilter,
  description: formDataToSave.description,
});

export const buildDefaultRoutePstnToIpForm = (
  pcmTrunkGroups,
  sipTrunkGroups,
) => {
  const defaultFormData = { ...ROUTE_PSTN_IP_INITIAL_FORM };
  if (pcmTrunkGroups && pcmTrunkGroups.length > 0) {
    const firstPcmGroup = pcmTrunkGroups[0];
    defaultFormData.callInitiator = String(
      firstPcmGroup.group_id || firstPcmGroup.id || firstPcmGroup,
    );
  }
  if (sipTrunkGroups && sipTrunkGroups.length > 0) {
    const firstSipGroup = sipTrunkGroups[0];
    defaultFormData.callDestination = String(
      firstSipGroup.group_id || firstSipGroup.id || "",
    );
  }
  return defaultFormData;
};

/** Edit path uses API snake_case fields (item kept via spread on list map). */
export const routePstnToIpFormFromRow = (item, index) => ({
  callInitiator: item.call_source,
  callerIdPrefix: item.caller_id_prefix,
  calleeIdPrefix: item.callee_id_prefix,
  callDestination: String(item.call_destination),
  numberFilter: item.number_filter,
  description: item.description,
  originalIndex: index,
});

export const routeTableMinWidthForZoom = (widePx) => {
  const scale = window.visualViewport?.scale || 1;
  return scale >= 1.15 ? widePx : "100%";
};

export const formatRoutePstnToIpDisplayValue = (
  key,
  value,
  rowIndex,
  page,
  itemsPerPage,
) => {
  if (key === "index") {
    return (page - 1) * itemsPerPage + rowIndex + 1;
  }
  if (value === undefined || value === null || value === "") return "--";

  switch (key) {
    case "callInitiator":
      return `PCM Trunk Group [${String(value)}]`;
    case "callDestination":
      return `SIP Trunk Group [${String(value)}]`;
    default:
      return String(value);
  }
};

export const groupOptionId = (g) => g.group_id ?? g.id ?? g;
