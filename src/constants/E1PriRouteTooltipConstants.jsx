/**
 * E1-PRI Route tooltips — derived from frontend code only.
 * Verified in: RouteIpPstnPage, RoutePstnToIPpage, RouteIPToIPPage,
 * RouteRoutingParameterPage, route constants, apiService (/ip_pstn_route).
 */

const PREFIX_RULES =
  "Only digits (0-9) and * are allowed. Default: *.";

/** Field tooltips — IP to PSTN (route_type: ip_to_pstn) */
export const ROUTE_IP_PSTN_FIELD_TOOLTIPS = {
  callSource:
    "Saved as call_source.\n" +
    "Select a SIP trunk group from the loaded SIP trunk group list.",

  callerIdPrefix:
    "Saved as caller_id_prefix.\n" + PREFIX_RULES,

  calleeIdPrefix:
    "Saved as callee_id_prefix.\n" + PREFIX_RULES,

  callDestination:
    "Saved as call_destination.\n" +
    "Select a PCM trunk group from the loaded PCM trunk group list.",

  numberFilter:
    "Saved as number_filter.\n" +
    "Only option shown in this UI: none. Default: none.",

  description:
    "Saved as description. Free-text field. Default: default.",
};

/** Field tooltips — PSTN to IP (route_type: pstn_to_ip) */
export const ROUTE_PSTN_IP_FIELD_TOOLTIPS = {
  callInitiator:
    "Label shown as Call Initiator; saved as call_source.\n" +
    "Select a PCM trunk group from the loaded PCM trunk group list.",

  callerIdPrefix:
    "Saved as caller_id_prefix.\n" + PREFIX_RULES,

  calleeIdPrefix:
    "Saved as callee_id_prefix.\n" + PREFIX_RULES,

  callDestination:
    "Saved as call_destination.\n" +
    "Select a SIP trunk group from the loaded SIP trunk group list.",

  numberFilter:
    "Saved as number_filter.\n" +
    "Only option shown in this UI: none. Default: none.",

  description:
    "Saved as description. Free-text field. Default: default.",
};

/** Field tooltips — IP to IP (route_type: ip_to_ip) */
export const ROUTE_IP_IP_FIELD_TOOLTIPS = {
  index:
    "Table ID column shows the row number.\n" +
    "This form field is not sent when the route is saved.",

  callSource:
    "Saved as call_source.\n" +
    "SIP trunk group from the loaded list. Cannot be the same as Call Destination.",

  callerIdPrefix:
    "Saved as caller_id_prefix.\n" + PREFIX_RULES,

  calleeIdPrefix:
    "Saved as callee_id_prefix.\n" + PREFIX_RULES,

  callDestination:
    "Saved as call_destination.\n" +
    "SIP trunk group from the loaded list. Cannot be the same as Call Source.",

  numberFilter:
    "Saved as number_filter.\n" +
    "Only option shown in this UI: No. Default: No.",

  description:
    "Saved as description. Free-text field. Default: default.",
};

/** Field tooltips — Route Settings */
export const ROUTE_ROUTING_PARAMETER_TOOLTIPS = {
  ipIncoming:
    "Dropdown for IP Incoming setting.\n" +
    "Options: Route after Number Manipulate (default), Route before Number Manipulate.",

  pstnIncoming:
    "Dropdown for PSTN Incoming setting.\n" +
    "Options: Route after Number Manipulate (default), Route before Number Manipulate.",
};
