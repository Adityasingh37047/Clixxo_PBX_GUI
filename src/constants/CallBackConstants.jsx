export const CALL_BACK_TITLE = "CallBack";

export const CALL_BACK_DEFAULT_DELAY = "10";

export const CALL_BACK_ORDER_OPTIONS = Array.from({ length: 21 }, (_, i) => i * 5);

export const CALL_BACK_THROUGH_OPTIONS = [
  { value: "auto", label: "Auto" },
  { value: "from_in", label: "From come in" },
  { value: "select", label: "Select" },
];

export const CALL_BACK_TRUNK_ROW_COUNT = 5;

/** Field tooltips for CallBack */
export const CALL_BACK_FIELD_TOOLTIPS = {
  name:
    "User-defined name of a callback, which must be unique. It is null by default and must be filled in: otherwise the configuration will fail to be saved. You can user letters, digits, chinese,_only.",

  strip:
    "Set how many digits will be stripped from the call number before the callback is placed. It is null by default.",

  destination:
    "The destination which the callback will direct the call to. It is null by default and must be filled in; otherwise the configuration will fail to be saved.",

  delay:
    "The3 delay time to call back after rejecting an incoming call. Default is 10s.",

  prepend:
    "Set the digits to prefix the callback number before the callback is placed. It is null by default.",

  through:
    "Select the callback through type. Auto: The system will choose the outgoing path from the outgoing one. From coming in: From which trunk call in, from which trunk call in, from which trunk call out. Select: You can select trunk call out manually.",
};
