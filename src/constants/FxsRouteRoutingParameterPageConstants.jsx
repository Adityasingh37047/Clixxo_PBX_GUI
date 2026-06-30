// Route mode options
export const ROUTE_MODE_OPTIONS = [
  { value: '0', label: 'Route after Number Manipulate' },
  { value: '1', label: 'Route before Number Manipulate' },
];

// Initial form data
export const ROUTE_ROUTING_PARAMETER_INITIAL_FORM = {
  ipInRouteMode: '0', // Route before Number Manipulate (default)
  pstnToIPRouteMode: '0', // Route before Number Manipulate (default)
  routeCheckPeriod: '0', // Route Detection Cycle
};

export const ROUTE_ROUTING_PARAMETER_PAGE_BREADCRUMB_ROOT = "FXS";
export const ROUTE_ROUTING_PARAMETER_PAGE_BREADCRUMB_SECTION = "Route";
export const ROUTE_ROUTING_PARAMETER_PAGE_TITLE = "Routing Parameters";
export const ROUTE_ROUTING_PARAMETER_CARD_TITLE = "Routing Parameters";
export const ROUTE_ROUTING_PARAMETER_SAVE_LABEL = "Save";
export const ROUTE_ROUTING_PARAMETER_RESET_LABEL = "Reset";

/** FXS Routing Parameters page */
export const ROUTE_ROUTING_PARAMETER_TOOLTIPS = {
  ipInRouteMode:
    "Saved as ipInRouteMode. Controls IP->TEL route timing.\n" +
    "0: Route after Number Manipulate. 1: Route before Number Manipulate. Default: 0.",

  pstnToIPRouteMode:
    "Saved as pstnToIPRouteMode. Controls TEL->IP route timing.\n" +
    "0: Route after Number Manipulate. 1: Route before Number Manipulate. Default: 0.",

  routeCheckPeriod:
    "Saved as routeCheckPeriod. Route Detection Cycle in seconds.\n" +
    "Digits only (0–9). Max length 31. Default: 0.",
};

