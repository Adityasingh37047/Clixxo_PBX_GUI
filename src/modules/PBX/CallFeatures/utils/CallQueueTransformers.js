import { CALL_QUEUE_INITIAL_FORM, RING_STRATEGY_OPTIONS } from "../../../../constants/CallQueueConstants";

export const ACTION_TO_DEST_KEY = {
  extensions: "Extensions", voicemail: "Voicemails", ivr_menus: "IVR",
  conference_rooms: "ConferenceRooms", ring_groups: "RingGroups", disa: "DISA",
  call_queue: "CallQueue", callbacks: "Callbacks", faxtoemail: "FaxToMail", other: "Other",
};

export const getDestOptions = (destinations, action) => {
  if (!action) return [];
  const key = ACTION_TO_DEST_KEY[action];
  return key ? destinations[key] || [] : [];
};

export const mapCustomPrompts = (list) =>
  list
    .map((it) => ({
      value: String(it?.filename || it?.file_name || it?.file || it?.recording_name || "").replace(/\.[^/.]+$/, ""),
      label: String(it?.recording_name || it?.name || it?.filename || "").replace(/\.[^/.]+$/, ""),
    }))
    .filter((it) => it.value);

export const normalizeRingBackOptions = (message) => {
  const normalized = message && typeof message === "object" && !Array.isArray(message) ? message : {};
  return {
    moh_categories: Array.isArray(normalized.moh_categories) ? normalized.moh_categories : [],
    custom_prompts: Array.isArray(normalized.custom_prompts) ? normalized.custom_prompts : [],
    country_tones: Array.isArray(normalized.country_tones) ? normalized.country_tones : [],
  };
};

export const mapCallQueueApiToForm = (q) => ({
  ...CALL_QUEUE_INITIAL_FORM, _id: q.id, queue_name: q.name || "", queue_number: String(q.queue_number || ""),
  pin: q.pin_required ? "yes" : "no", agent_password: q.dynamic_pin || "", ring_strategy: q.ring_strategy || "ring_all",
  timeout_action: q.timeout_dest_type || "", timeout_action_dest: q.timeout_dest_value || "", caller_id_prefix: q.cid_name_prefix || "",
  overflow_action: q.overflow_dest_type || "", overflow_action_dest: q.overflow_dest_value || "", agents_initial_status: q.agents_initial_status || "logged_in",
  agent_call_timeout: q.agent_timeout ?? 15, agent_announcement: q.agent_announcement || "", agent_retry_time: q.agent_retry ?? 30,
  wrap_up_time: q.wrapup_time ?? 30, max_no_answer: q.max_no_answer ?? 0, discard_abandoned_after: q.discard_abandoned_after ?? 0,
  max_wait_time: q.max_wait_time ?? 0, max_queue_length: q.max_queue_length ?? 20, alert_info: q.alert_info || "",
  music_on_hold: q.moh_mode === "default" ? "default" : q.moh_value || "default", max_wait_no_agent: q.max_wait_no_agent_sec ?? 90,
  queue_busy_resume: q.queue_busy_resume ? "enable" : "disable", transfer_prompt: q.transfer_prompt || "",
  agent_busy_announce: q.agent_busy_announce || "", answer_announce: q.answer_announce_caller || "", join_when_no_agent: !!q.join_when_no_agent,
  join_announce: q.join_announce === "default" ? "default" : q.join_announce_custom || "default", join_announce_playtime: q.join_announce_playtime ?? 0,
  answer_type: q.answer_type || "answer", no_agent_announce: q.no_agent_announce || "", announce_position: q.announce_position !== false,
  announce_hold_time: q.announce_hold_time !== false, call_duration: q.call_duration_est_sec ?? 60,
  announce_frequency: q.announce_position_frequency ?? 30, periodic_sound: q.announce_sound || "default", periodic_frequency: q.announce_sound_frequency ?? 0,
  busy_callback: q.busy_callback_enabled ? "yes" : "no", busy_callback_key: String(q.busy_callback_key ?? "2"),
  busy_callback_announce: q.busy_callback_announce || "default", selected_agents: Array.isArray(q.members) ? q.members.map(String) : [],
});

export const getMohFields = (value, ringBackOptions) => {
  if (!value || value === "default") return { moh_mode: "default", moh_value: null };
  if (ringBackOptions.moh_categories.includes(value)) return { moh_mode: "moh", moh_value: value };
  if (ringBackOptions.custom_prompts.includes(value)) return { moh_mode: "custom", moh_value: value };
  if (ringBackOptions.country_tones.includes(value)) return { moh_mode: "tone", moh_value: value };
  return { moh_mode: "default", moh_value: null };
};

export const nullIfEmpty = (value) => (value === "" || value == null ? null : value);

export const buildCallQueuePayload = (f, ringBackOptions) => ({
  ...(f._id != null ? { id: f._id } : {}), name: f.queue_name, queue_number: Number(f.queue_number), enabled: true,
  pin_required: f.pin === "yes", dynamic_pin: f.pin === "yes" ? f.agent_password : null, ring_strategy: f.ring_strategy,
  timeout_dest_type: f.timeout_action || null, timeout_dest_value: nullIfEmpty(f.timeout_action_dest), overflow_dest_type: f.overflow_action || null,
  overflow_dest_value: nullIfEmpty(f.overflow_action_dest), cid_name_prefix: nullIfEmpty(f.caller_id_prefix), agents_initial_status: f.agents_initial_status,
  agent_timeout: Number(f.agent_call_timeout), agent_announcement: nullIfEmpty(f.agent_announcement), agent_retry: Number(f.agent_retry_time),
  wrapup_time: Number(f.wrap_up_time), max_no_answer: Number(f.max_no_answer), discard_abandoned_after: Number(f.discard_abandoned_after) || null,
  max_wait_time: Number(f.max_wait_time), max_queue_length: Number(f.max_queue_length), alert_info: nullIfEmpty(f.alert_info),
  ...getMohFields(f.music_on_hold, ringBackOptions), max_wait_no_agent_sec: Number(f.max_wait_no_agent), queue_busy_resume: f.queue_busy_resume === "enable",
  transfer_prompt: nullIfEmpty(f.transfer_prompt), agent_busy_announce: nullIfEmpty(f.agent_busy_announce), answer_announce_caller: nullIfEmpty(f.answer_announce),
  join_when_no_agent: !!f.join_when_no_agent, join_announce: f.join_announce === "default" ? "default" : "custom",
  join_announce_custom: f.join_announce === "default" ? null : f.join_announce, join_announce_playtime: Number(f.join_announce_playtime),
  answer_type: f.answer_type, no_agent_announce: nullIfEmpty(f.no_agent_announce), announce_position: !!f.announce_position,
  announce_hold_time: !!f.announce_hold_time, call_duration_est_sec: Number(f.call_duration), announce_position_frequency: Number(f.announce_frequency),
  announce_sound: f.periodic_sound || "default", announce_sound_frequency: Number(f.periodic_frequency), busy_callback_enabled: f.busy_callback === "yes",
  busy_callback_key: String(f.busy_callback_key), busy_callback_announce: nullIfEmpty(f.busy_callback_announce), members: f.selected_agents,
});

export const formatRingStrategyLabel = (value) => RING_STRATEGY_OPTIONS.find((option) => option.value === value)?.label || value;
