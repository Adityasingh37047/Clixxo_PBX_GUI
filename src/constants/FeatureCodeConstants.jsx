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
]);
