import { ROUTE_IP_PSTN_INITIAL_FORM } from "../../../../constants/FxsRouteIPtoPstnConstants";

export const getAvailableRouteIpToTelIndices = (rules, currentEditIndex = null) => {
  const currentIndex =
    currentEditIndex !== null && rules[currentEditIndex]
      ? rules[currentEditIndex].index
      : null;
  const usedIndices = rules
    .map((rule, idx) =>
      currentEditIndex !== null && idx === currentEditIndex ? null : rule.index,
    )
    .filter((idx) => idx !== null && idx !== undefined);
  return Array.from({ length: 64 }, (_, i) => i)
    .filter((idx) => !usedIndices.includes(idx) || idx === currentIndex)
    .map((idx) => ({ value: String(idx), label: String(idx) }));
};

export const routeIpToTelFormFromRow = (item) => ({
  index: String(item.index || ""),
  description: item.description || "default",
  sourceIP: item.sourceIP || "",
  callerIdPrefix: item.callerIdPrefix || "*",
  calleeIdPrefix: item.calleeIdPrefix || "*",
  routeByNumber: item.routeByNumber || false,
  callDestination: item.callDestination ? String(item.callDestination) : "",
});

export const buildDefaultRouteIpToTelForm = (rules) => {
  const defaultFormData = { ...ROUTE_IP_PSTN_INITIAL_FORM };
  const available = getAvailableRouteIpToTelIndices(rules);
  const firstAvailable = available.length > 0 ? available[0].value : "0";
  defaultFormData.index = firstAvailable;
  return { defaultFormData, firstAvailable };
};

export const normalizeRouteIpToTelRule = (formData, editIndex, rules) => {
  const indexNum = parseInt(formData.index);
  return {
    index: indexNum,
    description: formData.description,
    sourceIP: formData.sourceIP || "*",
    callerIdPrefix: formData.callerIdPrefix,
    calleeIdPrefix: formData.calleeIdPrefix,
    routeByNumber: formData.routeByNumber,
    callDestination: formData.routeByNumber ? formData.callDestination : "",
    id: editIndex !== null ? rules[editIndex].id : Date.now(),
  };
};

export const formatRouteIpToTelDisplayValue = (key, value, pcmTrunkGroups) => {
  if (value === undefined || value === null || value === "") return "--";

  switch (key) {
    case "routeByNumber":
      return value ? "Enable" : "--";
    case "callDestination": {
      if (!value) return "--";
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

export const getBrowserZoomPercent = () => {
  const scale = window.visualViewport?.scale;
  if (typeof scale === "number" && scale > 0) {
    return Math.round(scale * 100);
  }
  return 100;
};

export const routeTableMinWidthForZoom = (widePx) => {
  const scale = window.visualViewport?.scale ?? 1;
  if (scale >= 1.15) return widePx;
  const zoomPct = getBrowserZoomPercent();
  return zoomPct >= 130 ? widePx : "100%";
};
