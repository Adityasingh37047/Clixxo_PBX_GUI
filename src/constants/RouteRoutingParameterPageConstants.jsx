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
    "Dropdown for IP Incoming setting.\n" +
    "Options: Route after Number Manipulate (default), Route before Number Manipulate.",

  pstnIncoming:
    "Dropdown for PSTN Incoming setting.\n" +
    "Options: Route after Number Manipulate (default), Route before Number Manipulate.",
}; 