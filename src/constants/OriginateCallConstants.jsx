export const ORIGINATE_CALL_TITLE = "Originate Call";

export const ORIGINATE_CALL_DEFAULT_MODE = "simple";

export const ORIGINATE_CALL_DEFAULT_APPLICATION = "Wait";
export const ORIGINATE_CALL_DEFAULT_APP_DATA = "30";
export const ORIGINATE_CALL_DEFAULT_CONTEXT = "siproute";
export const ORIGINATE_CALL_DEFAULT_PRIORITY = "1";

/** Dialplan contexts for two-step originate */
export const ORIGINATE_CALL_CONTEXT_OPTIONS = [
  "siproute",
  "outbound-mobile",
  "from-internal",
  "default",
];

export const ORIGINATE_CALL_MODE_OPTIONS = [
  { value: "simple", label: "Simple (application — no context/exten)" },
  { value: "twostep", label: "Two-step (context + exten after A answers)" },
];

export const ORIGINATE_CALL_FORM_NOTE =
  "Bearer JWT is sent automatically when logged in. Simple mode sends application + appData only (no context/exten). Two-step sends context, exten, and priority.";

export const ORIGINATE_CALL_FIELD_TOOLTIPS = {
  extension:
    "Extension or endpoint to dial first (A leg). Required. Sent to AMI as extension — e.g. a SIP extension such as 1004.",

  name:
    "Optional display label for your reference only. This value is not sent to the AMI originate API.",

  callerIdName:
    "Caller ID name presented on the outbound call. Combined with Caller ID Number as \"Name\" <number> in the AMI callerid field.",

  callerIdNumber:
    "Caller ID number presented on the outbound call. Combined with Caller ID Name in standard Asterisk callerid format.",

  mode:
    "Originate mode. Simple uses application and appData only (no dialplan context). Two-step dials the extension first, then runs context, exten, and priority when the A leg answers.",

  useFixedApp:
    "When checked, uses the Asterisk Wait application with the App Data timeout below. Recommended for simple originate without a custom application.",

  application:
    "Asterisk dialplan application to run after the A leg answers (Simple mode, when fixed Wait is unchecked). Example: Wait, Playback, etc.",

  appData:
    "Data argument passed to the application. For Wait, the number of seconds to wait (default 30).",

  context:
    "Dialplan context for the B leg after the A leg answers (Two-step mode). Select from configured contexts such as siproute or from-internal.",

  exten:
    "Extension or pattern in the selected context to dial as the B leg after the A leg answers. Required in Two-step mode.",

  priority:
    "Dialplan priority in the selected context for the B leg. Default is 1.",
};
