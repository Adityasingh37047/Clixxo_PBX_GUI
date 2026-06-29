export const VOICEMAIL_TITLE = "Voicemail";
export const VOICEMAIL_BREADCRUMB_SECTION = "Voicemail";

export const VOICEMAIL_FIELD_TOOLTIPS = {
  max_messages:
    "This option sets the maximum number of messages per extension. The default is 100.",
  max_message_time:
    "This option sets the maximum lengthof a single voicemail message (in seconds).",
  min_message_time:
    "This option sets the minimum length of a single voicemail message (in seconds). Messages below this threshold will be automatically deleted.",
  press5_enabled:
    "If this option is ticke, you will hear the prompt: The phone you dial is unavailable now. Please press 5 to leave your message: if it is unticket, you will hear the prompt: The phone you dial is unavailable noew. By default it is ticked.",
  busy_prompt:
    "Select the greeting that will be played when the extension is busy. The default setting is Default.",
  noanswer_prompt:
    "Select the greeting that will be played when the extension is unavailable. The default setting is Default.",
  announce_callerid:
    "If this option is ticked, the extension number of the caller who left the message will be announced before the content of this message. By default it is unticket.",
  announce_duration:
    "If this option is ticked, you will hear the duration of the message when the message is played back.",
  announce_arrival_time:
    "If this option is ticked, you will hear the arrival time of the message when the message is played back.",
};

export const VOICEMAIL_SECTIONS = {
  message_options: "Message Options",
  greeting_options: "Greeting Options",
  playback_options: "PlayBack Options",
};

export const VOICEMAIL_INITIAL_FORM = {
  max_messages: "100",
  max_message_time: "300",
  min_message_time: "3",
  press5_enabled: true,
  busy_prompt: "default",
  noanswer_prompt: "default",
  announce_callerid: true,
  announce_duration: true,
  announce_arrival_time: true,
};

export const VOICEMAIL_MAX_MESSAGES_OPTIONS = ["10", "25", "100", "250"];

export const VOICEMAIL_MAX_MESSAGE_TIME_OPTIONS = ["60", "120", "300", "600"];

export const VOICEMAIL_MIN_MESSAGE_TIME_OPTIONS = ["1", "2", "3", "4", "5"];

export const VOICEMAIL_PROMPT_OPTIONS = [{ value: "default", label: "Default" }];
