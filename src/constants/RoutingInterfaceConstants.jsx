export const ROUTING_INTERFACE_PAGE_BREADCRUMB_ROOT = "System";
export const ROUTING_INTERFACE_PAGE_BREADCRUMB_SECTION = "System Settings";
export const ROUTING_INTERFACE_PAGE_TITLE = "Routing Interface";
export const ROUTING_INTERFACE_CARD_TITLE = "Routing Interface";

export const ROUTING_INTERFACE_SECTION_CURRENT_ACTIVE =
  "Current Active Routing";
export const ROUTING_INTERFACE_SECTION_ACTIVE_ROUTES = "Active Routes";
export const ROUTING_INTERFACE_SECTION_TARGET_CONFIG =
  "Target Interface Configuration";

export const ROUTING_INTERFACE_BTN_SWITCH = "Switch Routing Interface";
export const ROUTING_INTERFACE_BTN_CANCEL = "Cancel";
export const ROUTING_INTERFACE_BTN_APPLY = "Apply & Switch";
export const ROUTING_INTERFACE_BTN_APPLYING = "Applying...";

export const ROUTING_INTERFACE_LOADING_TEXT =
  "Loading routing information...";

export const ROUTING_INTERFACE_TABLE_COL_INTERFACE = "Interface";
export const ROUTING_INTERFACE_TABLE_COL_GATEWAY = "Gateway";
export const ROUTING_INTERFACE_TABLE_COL_METRIC = "Metric";
export const ROUTING_INTERFACE_TABLE_COL_STATUS = "Status";

export const ROUTING_INTERFACE_STATUS_ACTIVE = "Active";
export const ROUTING_INTERFACE_STATUS_STANDBY = "Standby";

export const ROUTING_INTERFACE_EMPTY_PLACEHOLDER = "—";

export const ROUTING_INTERFACE_DEFAULT_METRIC = "100";

export const ROUTING_INTERFACE_PLACEHOLDER_GATEWAY = "e.g. 192.168.1.1";
export const ROUTING_INTERFACE_PLACEHOLDER_METRIC = "Default: 100";

export const ROUTING_INTERFACE_ERROR_LOAD_FAILED =
  "Failed to load routing information.";
export const ROUTING_INTERFACE_ERROR_GET_ROUTING_INFO =
  "Failed to get routing info";
export const ROUTING_INTERFACE_ERROR_CHANGE_ROUTING =
  "Failed to change routing";
export const ROUTING_INTERFACE_ERROR_APPLY_FAILED =
  "Failed to apply routing changes.";
export const ROUTING_INTERFACE_ERROR_GATEWAY_INVALID =
  "Enter a valid gateway IP address.";
export const ROUTING_INTERFACE_ERROR_METRIC_INVALID =
  "Metric must be a number between 0 and 9999.";

export const ROUTING_INTERFACE_CONFIRM_SWITCH = (
  iface,
  gateway,
  metric,
) =>
  `Switch default routing to ${iface}?\n\nGateway: ${gateway}\nMetric: ${metric}\n\nThis will update the active routing interface.`;

export const ROUTING_INTERFACE_SUCCESS_SWITCHED = (iface) =>
  `Routing interface switched to ${iface} successfully.`;

export const ROUTING_INTERFACE_LABEL_ACTIVE_INTERFACE = "Active Interface:";
export const ROUTING_INTERFACE_LABEL_IP_ADDRESS = "IP Address:";
export const ROUTING_INTERFACE_LABEL_SUBNET_MASK = "Subnet Mask:";
export const ROUTING_INTERFACE_LABEL_GATEWAY = "Gateway IP:";
export const ROUTING_INTERFACE_LABEL_METRIC = "Metric:";
export const ROUTING_INTERFACE_LABEL_SELECT_INTERFACE = "Select Interface (M):";
export const ROUTING_INTERFACE_LABEL_GATEWAY_REQUIRED = "Gateway IP (M):";

export const ROUTING_INTERFACE_FIELD_TOOLTIPS = {
  activeInterface:
    "The interface that is currently active and being used for routing.",
  currentIpAddress: "The IP address of the current active interface.",
  currentSubnetMask: "The subnet mask of the current active interface.",
  currentGateway: "The gateway IP address of the current active interface.",
  currentMetric: "The metric of the current active interface.",
  selectInterface: "Select the interface to switch to.",
  formIpAddress: "The IP address of the selected interface.",
  formSubnetMask: "The subnet mask of the selected interface.",
  formGateway: "The gateway IP address of the selected interface.",
  formMetric: "The metric of the selected interface.",
};

export const ROUTING_INTERFACE_CURRENT_FIELDS = [
  {
    key: "interface",
    label: ROUTING_INTERFACE_LABEL_ACTIVE_INTERFACE,
    tooltipKey: "activeInterface",
  },
  {
    key: "ipAddress",
    label: ROUTING_INTERFACE_LABEL_IP_ADDRESS,
    tooltipKey: "currentIpAddress",
  },
  {
    key: "subnetMask",
    label: ROUTING_INTERFACE_LABEL_SUBNET_MASK,
    tooltipKey: "currentSubnetMask",
  },
  {
    key: "gateway",
    label: ROUTING_INTERFACE_LABEL_GATEWAY,
    tooltipKey: "currentGateway",
  },
  {
    key: "metric",
    label: ROUTING_INTERFACE_LABEL_METRIC,
    tooltipKey: "currentMetric",
  },
];

export const ROUTING_INTERFACE_EMPTY_CURRENT = {
  interface: ROUTING_INTERFACE_EMPTY_PLACEHOLDER,
  gateway: ROUTING_INTERFACE_EMPTY_PLACEHOLDER,
  ipAddress: ROUTING_INTERFACE_EMPTY_PLACEHOLDER,
  subnetMask: ROUTING_INTERFACE_EMPTY_PLACEHOLDER,
  metric: ROUTING_INTERFACE_EMPTY_PLACEHOLDER,
};
