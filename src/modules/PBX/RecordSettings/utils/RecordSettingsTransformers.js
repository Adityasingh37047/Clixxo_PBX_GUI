import { RECORD_SETTINGS_FORM_FIELDS } from "../../../../constants/RecordSettingsConstants";

const DIRECTION_TO_API = { both: "both", incoming: "in", outgoing: "out" };
const DIRECTION_FROM_API = { both: "both", in: "incoming", out: "outgoing" };

const truthy = (v) =>
  v === true ||
  ["true", "yes", "1", "on", "enabled"].includes(String(v).toLowerCase());

export const normalizeDestinationList = (list) => {
  if (!Array.isArray(list)) return [];
  return list
    .map((item) => {
      if (item == null) return null;
      if (typeof item === "string" || typeof item === "number") {
        const value = String(item).trim();
        return value ? { value, label: value } : null;
      }
      const value = String(
        item.value ?? item.extension ?? item.id ?? "",
      ).trim();
      const label = String(
        item.label ?? item.display_name ?? item.name ?? value,
      ).trim();
      if (!value) return null;
      return { value, label: label || value };
    })
    .filter(Boolean);
};

export const resolveDestinationLabel = (available, id) => {
  const found = available.find((entry) => entry.value === String(id));
  return found?.label || String(id);
};

export const toValueArray = (raw) => {
  if (Array.isArray(raw)) {
    return raw.map((v) => String(v).trim()).filter(Boolean);
  }
  if (raw == null || raw === "") return [];
  return String(raw)
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
};

export const apiToForm = (msg = {}) => ({
  enableRecording: truthy(msg.enabled) ? "enabled" : "disabled",
  internalPrompt: msg.internal_prompt ?? "none",
  outboundInboundPrompt: msg.external_prompt ?? "none",
  recordStart: msg.record_start ?? "after_answer",
  recordDirection: DIRECTION_FROM_API[msg.record_direction] ?? "both",
  recordSampleRate: String(msg.sample_rate ?? "8000"),
  recordingFileFormat: msg.file_format ?? "wav",
  recordpath: msg.record_path ?? "",
});

export const formToApi = (form, trunks, extensions, conferences) => ({
  enabled: form.enableRecording === "enabled",
  internal_prompt: form.internalPrompt,
  external_prompt: form.outboundInboundPrompt,
  record_start: form.recordStart,
  record_direction: DIRECTION_TO_API[form.recordDirection] ?? "both",
  sample_rate: Number(form.recordSampleRate) || 8000,
  file_format: form.recordingFileFormat,
  record_path: form.recordpath || "",
  record_trunks: trunks,
  record_extensions: extensions,
  record_conferences: conferences,
});

export const buildInitialForm = () => {
  const form = apiToForm();
  RECORD_SETTINGS_FORM_FIELDS.forEach((field) => {
    form[field.key] = field.defaultValue;
  });
  return form;
};

export const mapRecordSettingsDestinationsFromApi = (data) => {
  const msg = data?.message ?? data?.data ?? data ?? {};
  return {
    trunks: normalizeDestinationList(msg.Trunks || msg.trunks),
    extensions: normalizeDestinationList(msg.Extensions || msg.extensions),
    conferences: normalizeDestinationList(
      msg.ConferenceRooms || msg.Conferences || msg.conferences,
    ),
  };
};

export const applyRecordSettingsApiMessage = (msg) => ({
  form: apiToForm(msg),
  selectedTrunks: toValueArray(msg.record_trunks),
  selectedExtensions: toValueArray(msg.record_extensions),
  selectedConferences: toValueArray(msg.record_conferences),
});
