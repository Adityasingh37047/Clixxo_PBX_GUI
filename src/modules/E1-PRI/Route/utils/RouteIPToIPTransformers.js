import { ROUTE_IP_IP_INITIAL_FORM } from "../../../../constants/RouteIPIPConstants";

export const ROUTE_IP_TO_IP_ROUTE_TYPE = "ip_to_ip";
export const ROUTE_IP_TO_IP_ITEMS_PER_PAGE = 20;
export const ROUTE_IP_TO_IP_TABLE_WIDE_PX = 1200;

export const mapIpToIpRouteFromApi = (rule) => ({
  id: rule.id,
  callSource: rule.call_source,
  callerIdPrefix: rule.caller_id_prefix,
  calleeIdPrefix: rule.callee_id_prefix,
  callDestination: rule.call_destination,
  numberFilter: rule.number_filter,
  description: rule.description,
});

export const buildIpToIpApiPayload = (dataToSave) => ({
  call_source: dataToSave.callSource,
  caller_id_prefix: dataToSave.callerIdPrefix,
  callee_id_prefix: dataToSave.calleeIdPrefix,
  call_destination: dataToSave.callDestination,
  number_filter: dataToSave.numberFilter,
  description: dataToSave.description,
});

export const buildDefaultRouteIPToIPForm = () => ({
  ...ROUTE_IP_IP_INITIAL_FORM,
  callSource: "",
  callDestination: "",
  originalIndex: -1,
});

export const routeIPToIPFormFromRow = (item, index) => ({
  ...item,
  originalIndex: index,
});

export const routeTableMinWidthForZoom = (widePx) => {
  const scale = window.visualViewport?.scale || 1;
  return scale >= 1.15 ? widePx : "100%";
};

export const formatRouteIPToIPDisplayValue = (
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
    case "callSource":
      return `SIP Trunk Group [${value}]`;
    case "callDestination":
      return `SIP Trunk Group [${value}]`;
    default:
      return String(value);
  }
};

export const groupOptionId = (g) => g.group_id ?? g.id ?? g;

export const applyRouteIPToIPSourceDestConstraint = (prev, key, value) => {
  const newData = { ...prev, [key]: value };
  let validationMessage = "";

  if (key === "callSource" && value === prev.callDestination && value !== "") {
    newData.callDestination = "";
    validationMessage =
      "Call source and call destination cannot be the same. Call destination has been cleared.";
  } else if (
    key === "callDestination" &&
    value === prev.callSource &&
    value !== ""
  ) {
    newData.callSource = "";
    validationMessage =
      "Call source and call destination cannot be the same. Call source has been cleared.";
  }

  return { newData, validationMessage };
};
