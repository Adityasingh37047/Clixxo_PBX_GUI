export const FEATURE_CODE_TOOLTIPS = {
  digits_timeout:
    "The maximum time waiting for the next feature code digit. The default value is 5000ms.",

  one_touch_record:
    "The feature code that is used to start call recording. The default feature code is *2.",

  check_voicemail:
    "The feature code that is used to check the voicemail. Press it and enter your password following the prompt. The default code is *97.",

  blind_transfer:
    "Dial this feature code and an extension number to blind transfer the call. The default feature code is *1.",

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
    `When the status of the agent in the queue is "on break", it is set to "available", and when the status is "available", it is set to "on break".`,

  agent_free_busy_ivr:
    `When the status of the agent in the queue is "on break", it is set to "available", and when the status is "available", it is set to "on break".`,

  attended_transfer_timeout:
    `When negotiating a transfer, if the destination is not specified, the call will be transferred back after the configured time. The default value is 15 seconds.`,

  extension_intercept:
    `By dialing this feature code plus an extension number, users can answer incoming calls to this extension. The default feature code is **.`,

  agent_status_id:
    `By dialing this feature code plus a queue number, the extension can add or remove a designated extension from the queue. The default feature code is *23.

Dial *23 followed by the queue number on the extension. The system will prompt for the extension number and the queue password (the password configured for that queue).

If the designated extension is not a member of the queue, it will be added. If it is already a member, it will be removed.

For example, if 6700 is a queue number and Extension A is calling, dialing *236700 allows Extension A to add Extension B to the queue or remove Extension B from the queue.`,

  self_extension_check_code:
    `By dialing this feature code, an extension can check its own extension number. This feature is useful for identifying the current extension without accessing the PBX management interface.

The default feature code is *22.`,

multiparty_conference_code:
`Multiparty Conference:

1. Extension A calls Extension B and establishes a conversation.

2. To invite Extension B into a conference, Extension A presses *0. A dial tone is played, allowing Extension A to dial Extension C.

3. After establishing a conversation with Extension C, Extension A presses *0 again to invite Extension C into the conference. A three-way conference is then established.

4. If Extension A and Extension C do not establish a conversation, only Extension A joins the conference.

5. To invite additional participants, Extension A presses *0 again. A dial tone is played, allowing Extension A to dial another extension (for example, Extension D). Repeat the process from Step 3 to add more members.

6. Press *# to return to the conference and disconnect the other participants.

The default feature code is *0.`, 

multiparty_conference_return_code:
`Multiparty Conference Return:

By dialing this feature code, a user can return to an active multiparty conference after temporarily leaving the conference to invite another participant.

This feature allows the conference initiator to switch back to the conference and continue the conversation with all connected participants.

The default feature code is *#.`,
cc_route:
`When extension is busy, dial the feature code to realize the callback function. The default feature code is *7.`,

monitor_listen:
`Dial this feature code plus an extension number to monitor the extension. If this feature will work or not is realted to the setting of monitor authority.
The default feature code is *90.
Note: to monitor an extension, you need to configure the Monitor settings for this extension first.`,

monitor_barge_in:
`Dial this feature code plus an extension number to enter the call of this extension for moniotring. If this feature will work or not is realted to the setting of monitor authority. The default feature code is *92.
Note: to monitor an extension, yyou need to configure the Monitor Settings for this extension first.`,

monitor_whisper:
`Dial this feature code plus an extension number to whisper to the extension. The default feature code is *91.`,

monitor_force_hangup:
`Dial this feature code plus an extension number to force hang up the call. The default feature code is *6.`,

monitor_listen_local:
`Dial this feature code plus an extension number to listen to the local call of this extension. The default feature code is *93.`,

monitor_listen_remote:
`Dial this feature code plus an extension number to listen to the remote call of this extension. The default feature code is *94.`,

monitor_force_hangup_on_monitor:
`Dial this feature code plus an extension number to force hang up the call on monitor. The default feature code is *64.`, 
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
