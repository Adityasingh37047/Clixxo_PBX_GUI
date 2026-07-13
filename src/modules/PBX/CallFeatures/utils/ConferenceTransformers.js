export const normalizeModeratorValue = (value) => String(value ?? "").trim();

export const normalizeExtensionValue = (value) => {
  const raw = String(value ?? "").trim();
  return raw ? raw.replace(/^extension:/i, "").replace(/^ext:/i, "") : "";
};

export const toDateTimeLocal = (value) => {
  if (!value) return "";
  try {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    const pad = (number) => String(number).padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  } catch {
    return "";
  }
};

export const mapConferenceApiToRow = (item) => ({
  id: item.id,
  roomName: item.name,
  conferenceNumber: String(item.conf_number),
  greeting: item.greeting,
  announce: item.announce ? "Yes" : "No",
  record: item.record ? "Yes" : "No",
  enabled: item.enabled ? "Yes" : "No",
  scheduleStart: toDateTimeLocal(item.schedule_start),
  scheduleEnd: toDateTimeLocal(item.schedule_end),
  pinEnabled: item.pin_enabled ? "Yes" : "No",
  moderatorPassword: item.moderator_pin || "",
  participantPassword: item.participant_pin || "",
  maxMembers: String(item.max_members ?? ""),
  waitForModerator: item.wait_for_moderator ? "Yes" : "No",
  sayYourName: item.say_your_name ? "Yes" : "No",
  muteParticipant: item.mute_participant ? "Yes" : "No",
  allowInvite: item.allow_participant_invite ? "Yes" : "No",
  moderatorMembers: Array.isArray(item.moderators)
    ? item.moderators.map(normalizeModeratorValue)
    : [],
});

export const mapConferenceApiToRows = (items) =>
  items.map(mapConferenceApiToRow);

export const mapConferenceDetailToRow = (row, detail) => ({
  ...row,
  roomName: detail?.name ?? row.roomName,
  conferenceNumber:
    detail?.conf_number != null ? String(detail.conf_number) : row.conferenceNumber,
  greeting: detail?.greeting ?? row.greeting,
  announce: typeof detail?.announce === "boolean" ? (detail.announce ? "Yes" : "No") : row.announce,
  record: typeof detail?.record === "boolean" ? (detail.record ? "Yes" : "No") : row.record,
  moderatorMembers: Array.isArray(detail?.moderators)
    ? detail.moderators.map(normalizeModeratorValue)
    : row.moderatorMembers,
  enabled: typeof detail?.enabled === "boolean" ? (detail.enabled ? "Yes" : "No") : row.enabled,
  scheduleStart: toDateTimeLocal(detail?.schedule_start) || row.scheduleStart,
  scheduleEnd: toDateTimeLocal(detail?.schedule_end) || row.scheduleEnd,
  pinEnabled: typeof detail?.pin_enabled === "boolean" ? (detail.pin_enabled ? "Yes" : "No") : row.pinEnabled,
  moderatorPassword: detail?.moderator_pin ?? row.moderatorPassword,
  participantPassword: detail?.participant_pin ?? row.participantPassword,
  maxMembers: detail?.max_members != null ? String(detail.max_members) : String(row.maxMembers || ""),
  waitForModerator: typeof detail?.wait_for_moderator === "boolean" ? (detail.wait_for_moderator ? "Yes" : "No") : row.waitForModerator,
  sayYourName: typeof detail?.say_your_name === "boolean" ? (detail.say_your_name ? "Yes" : "No") : row.sayYourName,
  muteParticipant: typeof detail?.mute_participant === "boolean" ? (detail.mute_participant ? "Yes" : "No") : row.muteParticipant,
  allowInvite: typeof detail?.allow_participant_invite === "boolean" ? (detail.allow_participant_invite ? "Yes" : "No") : row.allowInvite,
});

export const mapModeratorExtensions = (items) =>
  items
    .map((item) => {
      if (!item) return null;
      if (typeof item === "string" || typeof item === "number") return { value: String(item), label: String(item) };
      const value = normalizeExtensionValue(item.extension ?? item.value);
      return value ? { value, label: item.display_name || item.label || value } : null;
    })
    .filter(Boolean);

export const mapConferenceExtensions = (items) =>
  items.filter((item) => item && item.extension).map((item) => {
    const value = normalizeExtensionValue(item.extension);
    return { value, label: item.display_name || value };
  });

export const mapExtensionGroups = (items, useApiValue = false) =>
  items
    .map((item) => {
      if (!item) return null;
      const id = item.id != null ? String(item.id) : "";
      const value = String(
        useApiValue ? item.value || (id ? `group:${id}` : "") : id ? `group:${id}` : "",
      );
      if (!value) return null;
      return {
        id: id || value.replace(/^group:/, ""),
        name: useApiValue ? item.name || item.label || value : item.name || value,
        label: item.label || item.name || value,
        value,
      };
    })
    .filter(Boolean);

export const buildConferencePayload = (form) => ({
  name: form.roomName.trim(),
  conf_number: parseInt(form.conferenceNumber.trim(), 10),
  greeting: (form.greeting || "Default").toLowerCase(),
  announce: form.announce === "Yes",
  record: form.record === "Yes",
  enabled: form.enabled === "Yes",
  schedule_start: form.scheduleStart || null,
  schedule_end: form.scheduleEnd || null,
  pin_enabled: form.pinEnabled === "Yes",
  moderator_pin: form.pinEnabled === "Yes" ? form.moderatorPassword || null : null,
  participant_pin: form.pinEnabled === "Yes" ? form.participantPassword || null : null,
  max_members: parseInt(form.maxMembers, 10),
  wait_for_moderator: form.waitForModerator === "Yes",
  say_your_name: form.sayYourName === "Yes",
  mute_participant: form.muteParticipant === "Yes",
  allow_participant_invite: form.allowInvite === "Yes",
  moderators: form.moderatorMembers.map(String),
});
