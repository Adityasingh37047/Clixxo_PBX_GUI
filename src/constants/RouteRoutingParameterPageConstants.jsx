export const ROUTE_SETTINGS_OPTIONS = [
  {
    value: 'after',
    label: 'Route after Number Manipulate',
  },
  {
    value: 'before',
    label: 'Route before Number Manipulate',
  },
];

export const ROUTE_SETTINGS_DEFAULTS = {
  ipIncoming: 'after',
  pstnIncoming: 'after',
};

/** Route Settings */
export const ROUTE_ROUTING_PARAMETER_TOOLTIPS = {
  ipIncoming:
    "Controls whether IP incoming calls are routed before or after number manipulation.\n" +
    "Options: Route after Number Manipulate (default), Route before Number Manipulate.\n" +
    "Note: Save currently shows a confirmation only; settings are not persisted to the device API.",

  pstnIncoming:
    "Controls whether PSTN incoming calls are routed before or after number manipulation.\n" +
    "Options: Route after Number Manipulate (default), Route before Number Manipulate.\n" +
    "Note: Save currently shows a confirmation only; settings are not persisted to the device API.",
}; 