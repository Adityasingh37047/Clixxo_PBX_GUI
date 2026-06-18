export const FEATURE_CODE_TOOLTIPS = {
  digits_timeout:
    "The maximum time waiting for the next feature code digit. The default value is 5000ms.",

  one_touch_record:
    "The feature code that is used to start call recording. The default feature code is *2.",

  check_voicemail:
    "The feature code that is used to check the voicemail. Press it and enter your password following the prompt. The default code is *97.",

    blind_transfer:
    "Dial this feature code an extension number to blind the transfer call. The defalt feature code is *1.",

    attended_transfer:
    "Dial this feature code and an extension number to transfer the call. Hang up after contacting the destination. Press # to cancel. The default feature code is *4.",

    group_intercept:
    "By pressing this feature code, an extension can answer an incoming call to another extension within the same intercept group. The default feature code is *8.",

    intercom:
    "By dialing this feature code plus an extension number, users can start an intercom call to this extension. The default feature code is *88.",

    agent_login_logout: `By dialing this feature code plus a queue number, the extension can follow the prompt to log in and out of the queue dynamically. The default feature code is *22.

    Dial *22 followed by the queue number on the extension. The system will prompt for the queue password (the password configured for that queue).
    
    If the extension is currently logged in, dialing *22 + queue number will log it out. If the extension is logged out, dialing *22 + queue number will log it in.
    
    For example, if 6700 is a queue number and Extension A is not a member of the queue, dialing *226700 will join the queue. Dialing *226700 again will leave the queue.`,
    
    agent_free_busy:
    `When the status of the agent in th queue is "on break", it is set to "available, and when the status is "available", it is set to "on break".`,
    agent_free_busy_ivr:
    `When the status of the agent in th queue is "on break", it is set to "available, and when the status is "available", it is set to "on break".`,
    attended_transfer_timeout:
    `When negotiating a transfer, when the destination is not specified. The call will be transferred back after the set time. The default value is 15 seconds.`,
    extension_intercept:
    `By dialing this feature code plus an extension number, users can answer incoming calls to this extension. The default feature code is**.`,
    agent_status_id:
    `By dialing this feature code plus a queue number, the extension can add or remove a designated extension from the queue. The default feature code is *23.

Dial *23 followed by the queue number on the extension. The system will prompt for the extension number and the queue password (the password configured for that queue).

If the designated extension is not a member of the queue, it will be added. If it is already a member, it will be removed.

For example, if 6700 is a queue number and Extension A is calling, dialing *236700 allows Extension A to add Extension B to the queue or remove Extension B from the queue.`
    
};


export const FEATURE_CODE_SECTIONS = [
  {
    title: "Feature Code Digits Timeout",
    fields: [
      [
        {
          key: "digits_timeout",
          label: "Digits Timeout (ms)",
          type: "number",
          span: 1,
        },
      ],
    ],
  },
  {
    title: "Recording",
    fields: [
      [
        { key: "one_touch_record", label: "One Touch Record", type: "text" },
        { key: "agent_free_busy_ivr", label: "Agent Free/Busy", type: "text" },
      ],
    ],
  },
  {
    title: "Transfer",
    fields: [
      [
        { key: "blind_transfer", label: "Blind Transfer", type: "text" },
        {
          key: "attended_transfer_timeout",
          label: "Attended Transfer TimeOut (s)",
          type: "number",
        },
      ],
      [
        {
          key: "attended_transfer",
          label: "Attended Transfer",
          type: "text",
          span: 1,
        },
      ],
    ],
  },
  {
    title: "Intercept",
    fields: [
      [
        { key: "group_intercept", label: "Group Intercept", type: "text" },
        {
          key: "extension_intercept",
          label: "Extension Intercept",
          type: "text",
        },
      ],
    ],
  },
  {
    title: "Intercom",
    fields: [[{ key: "intercom", label: "Intercom", type: "text", span: 1 }]],
  },
  {
    title: "Agent",
    fields: [
      [
        {
          key: "agent_login_logout",
          label: "Agent Login/Logout",
          type: "text",
        },
        { key: "agent_status_id", label: "Agent Status ID", type: "text" },
      ],
      [
        {
          key: "agent_free_busy",
          label: "Agent Free/Busy",
          type: "text",
          span: 1,
        },
      ],
    ],
  },

  {
    title: "Self Extension Check",
    fields: [
      [
        {
          key: "self_extension_check_code",
          label: "Self Extension Check",
          type: "text",
          span: 1,
        },
      ],
    ],
  },
  {
    title: "Multiparty Conference",
    fields: [
      [
        {
          key: "multiparty_conference_code",
          label: "Multiparty Conference",
          type: "text",
        },
        {
          key: "multiparty_conference_return_code",
          label: "Multiparty Conference Return",
          type: "text",
        },
      ],
    ],
  },
  {
    title: "CC Route",
    fields: [[{ key: "cc_route", label: "CC Route", type: "text", span: 1 }]],
  },
  {
    title: "Voicemail",
    fields: [
      [
        { key: "check_voicemail", label: "Check Voicemail", type: "text" },
        {
          key: "voicemail_main_menu",
          label: "Voicemail Main Menu",
          type: "text",
        },
      ],
      [
        {
          key: "voicemail_for_extension",
          label: "Voicemail For Extension",
          type: "text",
          span: 1,
        },
      ],
    ],
  },
  {
    title: "Call Parking",
    fields: [
      [
        { key: "call_parking", label: "Call Parking", type: "text" },
        {
          key: "park_extension_start",
          label: "Park Extension Start",
          type: "number",
        },
      ],
      [
        {
          key: "directed_call_parking",
          label: "Directed Call Parking",
          type: "text",
        },
        {
          key: "park_extension_end",
          label: "Park Extension End",
          type: "number",
        },
      ],
      [
        { key: "park_extension", label: "Park Extension", type: "number" },
        { key: "park_timeout", label: "Park TimeOut (s)", type: "number" },
      ],
      [
        {
          key: "timeout_destinations",
          label: "Timeout Destinations",
          type: "select",
          colRight: true,
        },
      ],
    ],
  },
  {
    title: "Call Monitor",
    fields: [
      [
        { key: "monitor_listen", label: "Listen", type: "text" },
        { key: "monitor_barge_in", label: "Barge-in", type: "text" },
      ],
      [
        { key: "monitor_whisper", label: "Whisper", type: "text" },
        { key: "monitor_force_hangup", label: "Force Hangup", type: "text" },
      ],
      [
        { key: "monitor_listen_local", label: "Listen Local", type: "text" },
        { key: "monitor_listen_remote", label: "Listen Remote", type: "text" },
      ],
      [
        {
          key: "monitor_force_hangup_on_monitor",
          label: "Force Hangup on monitor",
          type: "text",
          span: 1,
        },
      ],
    ],
  },
];

export const FEATURE_CODE_INITIAL_FORM = {
  digits_timeout: "5000",
  one_touch_record: "*2",
  agent_free_busy_ivr: "",
  blind_transfer: "*1",
  attended_transfer_timeout: "15",
  attended_transfer: "*4",
  group_intercept: "*8",
  extension_intercept: "**",
  intercom: "*88",
  agent_login_logout: "*22",
  agent_status_id: "*23",
  agent_free_busy: "*24",
  self_extension_check_code: "*22",
  multiparty_conference_code: "*0",
  multiparty_conference_return_code: "",
  cc_route: "*7",
  check_voicemail: "*97",
  voicemail_main_menu: "*98",
  voicemail_for_extension: "*99",
  call_parking: "*5",
  directed_call_parking: "*50",
  park_extension: "5900",
  park_extension_start: "5901",
  park_extension_end: "5999",
  park_timeout: "90",
  timeout_destinations: "hangup",
  monitor_listen: "*90",
  monitor_barge_in: "*92",
  monitor_whisper: "*91",
  monitor_force_hangup: "*6",
  monitor_listen_local: "*93",
  monitor_listen_remote: "*94",
  monitor_force_hangup_on_monitor: "*64",
};

export const FORM_TO_API = {
  digits_timeout: "feature_digit_timeout_ms",
  one_touch_record: "recording_onetouch_code",
  agent_free_busy_ivr: "agent_free_busy_ivr",
  blind_transfer: "blind_transfer_code",
  attended_transfer_timeout: "attended_transfer_timeout_s",
  attended_transfer: "attended_transfer_code",
  group_intercept: "group_intercept_code",
  extension_intercept: "extension_intercept_code",
  intercom: "intercom_code",
  agent_login_logout: "agent_login_logout_code",
  agent_status_id: "agent_status_id_code",
  agent_free_busy: "agent_free_busy_code",
  self_extension_check_code: "self_extension_check_code",
  multiparty_conference_code: "multiparty_conference_code",
  multiparty_conference_return_code: "multiparty_conference_return_code",
  cc_route: "cc_route",
  check_voicemail: "check_voicemail_code",
  voicemail_main_menu: "voicemail_main_menu_code",
  voicemail_for_extension: "voicemail_for_extension_code",
  call_parking: "call_parking_code",
  directed_call_parking: "directed_call_parking_code",
  park_extension: "park_extension",
  park_extension_start: "park_extension_start",
  park_extension_end: "park_extension_end",
  park_timeout: "park_timeout_s",
  timeout_destinations: "park_timeout_destination",
  monitor_listen: "monitor_listen_code",
  monitor_barge_in: "monitor_barge_code",
  monitor_whisper: "monitor_whisper_code",
  monitor_force_hangup: "force_hangup_code",
  monitor_listen_local: "monitor_listen_local_code",
  monitor_listen_remote: "monitor_listen_remote_code",
  monitor_force_hangup_on_monitor: "force_hangup_monitor_code",
};

export const API_TO_FORM = Object.fromEntries(
  Object.entries(FORM_TO_API).map(([formKey, apiKey]) => [apiKey, formKey]),
);

export const NUMERIC_KEYS = new Set([
  "digits_timeout",
  "attended_transfer_timeout",
  "park_extension",
  "park_extension_start",
  "park_extension_end",
  "park_timeout",
]);
