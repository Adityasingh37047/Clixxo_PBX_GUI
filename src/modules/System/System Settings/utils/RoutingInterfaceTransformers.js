import {
  ROUTING_INTERFACE_DEFAULT_METRIC,
  ROUTING_INTERFACE_EMPTY_CURRENT,
} from "../../../../constants/RoutingInterfaceConstants";

export const createEmptyCurrent = () => ({ ...ROUTING_INTERFACE_EMPTY_CURRENT });

export const createEmptyFormErrors = () => ({ gateway: "", metric: "" });

export const createInitialSwitchForm = () => ({
  interface: "",
  gateway: "",
  metric: ROUTING_INTERFACE_DEFAULT_METRIC,
});

export const mapRoutingInfoToState = (data = {}) => ({
  current: data.current || createEmptyCurrent(),
  activeRoutes: data.activeRoutes || [],
  interfaces: data.interfaces || [],
});

export const buildSwitchFormFromInterface = (iface = {}) => ({
  form: {
    interface: iface.interface || "",
    gateway: iface.configuredGateway || "",
    metric: String(
      iface.metric ?? parseInt(ROUTING_INTERFACE_DEFAULT_METRIC, 10),
    ),
  },
  formIp: iface.ipAddress || "",
  formSubnet: iface.subnetMask || "",
});

export const buildChangeRoutingPayload = (form = {}) => ({
  interface: form.interface,
  gateway: form.gateway,
  metric: parseInt(form.metric, 10),
});
