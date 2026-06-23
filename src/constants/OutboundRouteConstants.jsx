/** Field tooltips for Outbound Routes — concise, 1–4 lines */
export const OUTBOUND_ROUTE_FIELD_TOOLTIPS = {
  name:
    "User-defined route name. Required — the route cannot be saved without it.",

  priority:
    "Matching order — lower values have higher priority. Default: 1000.",

  description: "Optional description for this outbound route.",

  rememory_hunt:
    "Round-robin with memory — remembers the last trunk used and selects the next available trunk.",

  next_route:
    "When enabled, if this route matches but the call is not completed, the next route is tried. Default: on.",

  enabled: "Enable or disable this route. Default: Yes.",

  password:
    "Outbound PIN protection.\n" +
    "None — calls proceed without a PIN.\n" +
    "PIN List — entered PIN must match a PIN in the selected Pin Numbers list.\n" +
    "Single Pin — caller must enter the configured PIN.",

  enter_password:
    "PIN required when Password is Single Pin. Digits only, 1–16 characters.",

  time_condition:
    "Restrict this route to selected time periods (WorkTime, Holiday, All).\nLeave unchecked for no time limits.",

  dial_patterns:
    "Outbound calls matching these dial patterns use this route.",

  caller_number_conversion:
    "Modify the caller ID for outbound calls — strip digits, add prefix (Front), or suffix.",

  member_extensions:
    "Extensions permitted to place calls on this route. At least one extension is required.",

  member_trunks:
    "Trunks used for outbound calls on this route. At least one trunk is required.",
};
