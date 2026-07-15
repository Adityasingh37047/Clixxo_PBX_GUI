import {
  STORAGE_AUTO_CLEANUP_SECTIONS,
  STORAGE_BACKUP_FIELDS,
} from "../../../../constants/StorageConstants";

export const buildInitialForm = (sections) => {
  const form = {};
  sections.forEach((section) => {
    section.fields.forEach((field) => {
      form[field.name] = field.defaultValue;
    });
  });
  return form;
};

const allAutoCleanupFields = STORAGE_AUTO_CLEANUP_SECTIONS.flatMap(
  (s) => s.fields,
);

export const createAutoCleanupInitialForm = () =>
  buildInitialForm([{ fields: allAutoCleanupFields }]);

export const createBackupsInitialForm = () =>
  buildInitialForm([{ fields: STORAGE_BACKUP_FIELDS }]);

export const createEmptyStorageStatus = () => ({
  cdr: {
    count: "",
    size: "",
  },
  voicemail: {
    count: "",
    size: "",
  },
  recordings: {
    count: "",
    size: "",
  },
  disk: {
    total: {
      human: "",
    },
    used: {
      human: "",
    },
    avail: {
      human: "",
    },
    used_pct: "",
  },
});

export const mapStorageUsageToStatus = (data) => ({
  cdr: {
    count: data.cdr.count,
    size: data.cdr.size.human,
  },
  voicemail: {
    count: data.voicemail.files,
    size: data.voicemail.size.human,
  },
  recordings: {
    count: data.recordings.count,
    size: data.recordings.size.human,
  },
  disk: data.disk,
});

export const mapStorageSettingsToForm = (data) => ({
  maxCdr: data.cdr_max_count,
  cdrPreservationDuration: data.cdr_max_days,
  maxVoicemailFiles: data.vm_max_files,
  voicemailPreservationDuration: data.vm_max_days,
  maxDeviceUsage: data.rec_max_usage_pct,
  recPreservationDuration: data.rec_max_days,
  maxLogSize: data.log_max_size_mb,
  logsPreservationDuration: data.log_max_days,
  maxLogs: data.log_max_per_day,
});

export const buildStorageSettingsPayload = (form) => ({
  cdr_max_count: form.maxCdr,
  cdr_max_days: form.cdrPreservationDuration,
  vm_max_files: form.maxVoicemailFiles,
  vm_max_days: form.voicemailPreservationDuration,
  rec_max_usage_pct: form.maxDeviceUsage,
  rec_max_days: form.recPreservationDuration,
  log_max_size_mb: form.maxLogSize,
  log_max_days: form.logsPreservationDuration,
  log_max_per_day: form.maxLogs,
});
