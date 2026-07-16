import { VOICEMAIL_INITIAL_FORM } from "../../../../constants/VoicemailConstants";

export const mapVoicemailApiToForm = (d) => ({
  max_messages: String(d.max_messages ?? VOICEMAIL_INITIAL_FORM.max_messages),
  max_message_time: String(
    d.max_message_time ?? VOICEMAIL_INITIAL_FORM.max_message_time,
  ),
  min_message_time: String(
    d.min_message_time ?? VOICEMAIL_INITIAL_FORM.min_message_time,
  ),
  press5_enabled: d.press5_enabled ?? VOICEMAIL_INITIAL_FORM.press5_enabled,
  busy_prompt: d.busy_prompt ?? VOICEMAIL_INITIAL_FORM.busy_prompt,
  noanswer_prompt: d.noanswer_prompt ?? VOICEMAIL_INITIAL_FORM.noanswer_prompt,
  announce_callerid:
    d.announce_callerid ?? VOICEMAIL_INITIAL_FORM.announce_callerid,
  announce_duration:
    d.announce_duration ?? VOICEMAIL_INITIAL_FORM.announce_duration,
  announce_arrival_time:
    d.announce_arrival_time ?? VOICEMAIL_INITIAL_FORM.announce_arrival_time,
});

export const buildVoicemailApiPayload = (form) => ({
  max_messages: Number(form.max_messages),
  max_message_time: Number(form.max_message_time),
  min_message_time: Number(form.min_message_time),
  press5_enabled: form.press5_enabled,
  busy_prompt: form.busy_prompt,
  noanswer_prompt: form.noanswer_prompt,
  announce_callerid: form.announce_callerid,
  announce_duration: form.announce_duration,
  announce_arrival_time: form.announce_arrival_time,
});
