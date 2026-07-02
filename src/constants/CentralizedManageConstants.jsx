export const CENTRALIZED_MANAGE_PAGE_BREADCRUMB_ROOT = "System";
export const CENTRALIZED_MANAGE_PAGE_BREADCRUMB_SECTION = "System Settings";
export const CENTRALIZED_MANAGE_PAGE_TITLE = "Centralized Manage";
export const CENTRALIZED_MANAGE_CARD_TITLE = "Centralized Manage";

export const CENTRALIZED_MANAGE_BTN_SAVE = "Save";
export const CENTRALIZED_MANAGE_BTN_RESET = "Reset";
export const CENTRALIZED_MANAGE_BTN_DOWNLOAD_MIB = "Download MIB";
export const CENTRALIZED_MANAGE_BTN_SAVING = "Connecting…";
export const CENTRALIZED_MANAGE_BTN_APPLYING = "Applying…";

export const CENTRALIZED_MANAGE_ENABLE_LABEL = "Enable";
export const CENTRALIZED_MANAGE_APPLY_STATUS_CONNECTING = "Connecting SNMP...";

export const CENTRALIZED_MANAGE_FIELDS = [
  { name: "centralizedManage", label: "Centralized Manage", type: "checkbox" },
  { name: "notificationSetting", label: "Notification Setting:", type: "checkbox" },
  { name: "trapServerPort", label: "Trap Server Port:", type: "text" },
  { name: "cpuUsage", label: "CPU Usage Threshold(%):", type: "text" },
  { name: "memoryUsage", label: "Memory Usage Threshold(%):", type: "text" },
  { name: "highCps", label: "High CPS Threshold(%):", type: "text" },
  { name: "lowConnRate", label: "Low Connection Rate Threshold(%):", type: "text" },
  { name: "autoChangeGateway", label: "Auto Change Default Gateway:", type: "checkbox" },
  { name: "managementPlatform", label: "Management Platform:", type: "select" },
  {
    name: "centralizedProtocol",
    label: "Centralized Management Protocol:",
    type: "select",
    conditional: true,
  },
  { name: "snmpVersion", label: "SNMP Version:", type: "select", conditional: true },
  { name: "snmpServerAddress", label: "SNMP Server Address:", type: "text", conditional: true },
  { name: "monitoringPort", label: "Monitoring Port", type: "checkbox", conditional: true },
  { name: "monitoringPortValue", label: "", type: "text", conditional: true },
  { name: "communityString", label: "Community String:", type: "text", conditional: true },
  { name: "companyName", label: "Company Name:", type: "text", dcmsOnly: true },
  { name: "gatewayDesc", label: "Gateway Description:", type: "text", dcmsOnly: true },
  { name: "snmpServer", label: "SNMP Server Address:", type: "text", dcmsOnly: true },
  {
    name: "authCode",
    label: "Authorization Code :",
    type: "text",
    placeholder: "Please input authorization code",
    dcmsOnly: true,
  },
  {
    name: "workingStatus",
    label: "Working Status:",
    type: "static",
    value: "Requesting authentication",
    dcmsOnly: true,
  },
];

export const MANAGEMENT_PLATFORM_OPTIONS = [
  { value: "DCMS", label: "DCMS" },
  { value: "Custom1", label: "Custom1" },
  { value: "Others", label: "Others" },
];

export const CENTRALIZED_MANAGE_BUTTONS = [
  { name: "save", label: CENTRALIZED_MANAGE_BTN_SAVE },
  { name: "reset", label: CENTRALIZED_MANAGE_BTN_RESET },
  { name: "download", label: CENTRALIZED_MANAGE_BTN_DOWNLOAD_MIB },
];

export const CENTRALIZED_PROTOCOL_OPTIONS = [{ value: "SNMP", label: "SNMP" }];

export const SNMP_VERSION_OPTIONS = [
  { value: "V1", label: "V1" },
  { value: "V2", label: "V2" },
  { value: "V3", label: "V3" },
];

export const CENTRALIZED_MANAGE_INITIAL_FORM = {
  centralizedManage: false,
  notificationSetting: false,
  trapServerPort: "162",
  cpuUsage: "90",
  memoryUsage: "90",
  highCps: "90",
  lowConnRate: "20",
  autoChangeGateway: false,
  managementPlatform: "DCMS",
  centralizedProtocol: "SNMP",
  snmpVersion: "V2",
  snmpServerAddress: "127.0.0.1",
  monitoringPort: false,
  monitoringPortValue: "161",
  communityString: "public",
  companyName: "",
  gatewayDesc: "",
  snmpServer: "127.0.0.1",
  authCode: "",
  workingStatus: "Requesting authentication",
};

export const CENTRALIZED_MANAGE_FIELD_TOOLTIPS = {
  centralizedManage:
    "Enable centralized management to allow remote monitoring and configuration of this device from a management platform.",
  notificationSetting:
    "Enable SNMP trap notifications when system resource thresholds are exceeded or connection rates fall below configured limits.",
  trapServerPort:
    "UDP port on the trap receiver host where SNMP alert notifications are sent. The standard trap port is 162.",
  cpuUsage:
    "CPU utilization percentage that triggers an SNMP trap when exceeded. Alerts the management platform of high processor load.",
  memoryUsage:
    "Memory utilization percentage that triggers an SNMP trap when exceeded. Alerts the management platform of low available memory.",
  highCps:
    "Calls-per-second percentage threshold that triggers an SNMP trap when call volume is unusually high.",
  lowConnRate:
    "Connection success rate percentage below which an SNMP trap is sent to indicate degraded call connectivity.",
  autoChangeGateway:
    "Automatically switch the default network gateway when directed by the centralized management platform.",
  managementPlatform:
    "Select the remote management system this device registers with. DCMS uses the Clixxo cloud platform; Custom1 and Others use direct SNMP configuration.",
  centralizedProtocol:
    "Protocol used for centralized management communication. Currently SNMP is supported for device monitoring and remote management.",
  snmpVersion:
    "SNMP protocol version used for management queries and traps. V2 is recommended for most deployments; V3 adds authentication and encryption.",
  snmpServerAddress:
    "IP address of the SNMP management station allowed to query this device. Use 'all' or '*' to permit any manager.",
  monitoringPort:
    "UDP port on which the local SNMP agent listens for management queries. The standard monitoring port is 161; enable the checkbox to use a custom port.",
  communityString:
    "SNMP community name used for authentication between this device and the management station. Must match the value configured on the manager.",
  companyName:
    "Company or organization name registered with the DCMS management platform for device identification.",
  gatewayDesc:
    "Descriptive label for this gateway device as displayed in the DCMS management console.",
  snmpServer:
    "IP address of the SNMP trap server used by DCMS to receive alerts and status updates from this device.",
  authCode:
    "Authorization code provided by DCMS to authenticate and register this device with the management platform.",
};
