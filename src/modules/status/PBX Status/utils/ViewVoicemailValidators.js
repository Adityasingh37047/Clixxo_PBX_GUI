/** ViewVoicemail has no dedicated form validators beyond API error handling in the hook. */
export const validateViewVoicemailExtensionInput = (value) =>
  value == null ? "" : String(value);
