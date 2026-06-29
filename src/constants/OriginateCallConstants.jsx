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
