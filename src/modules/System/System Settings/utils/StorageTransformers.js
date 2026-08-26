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

export const mapSftpSettingsToForm = (data = {}) => {
  const uploadModeStr = String(
    data.upload_mode || data.upload_time || data.uploadMode || data.uploadTime || ""
  )
    .toLowerCase()
    .trim();

  const isTiming =
    uploadModeStr === "timing" ||
    uploadModeStr === "schedule" ||
    uploadModeStr === "scheduled" ||
    uploadModeStr === "time";

  const isEnabled =
    data.enabled === true ||
    data.enabled === 1 ||
    String(data.enabled).toLowerCase() === "true" ||
    String(data.enabled).toLowerCase() === "yes" ||
    String(data.enable_sftp).toLowerCase() === "yes";

  const isDeleteSource =
    data.delete_source === true ||
    data.delete_source === 1 ||
    String(data.delete_source).toLowerCase() === "true" ||
    String(data.delete_source).toLowerCase() === "yes" ||
    String(data.delete_source_file).toLowerCase() === "yes";

  return {
    autoUploadFtp: isEnabled ? "Yes" : "No",
    ftpAddress: data.host || data.sftp_address || "",
    username: data.username || "",
    password: data.password || "",
    uploadTime: isTiming ? "Timing" : "Real Time",
    startHour: String(data.schedule_hour ?? data.hours ?? 0).padStart(2, "0"),
    startMinute: String(data.schedule_minute ?? data.minutes ?? 0).padStart(2, "0"),
    deleteSourceFile: isDeleteSource ? "Yes" : "No",
    lastRunAt: data.last_run_at || null,
    lastStatus: data.last_status || null,
    lastMessage: data.last_message || null,
  };
};

export const buildSftpSettingsPayload = (form = {}) => {
  const isTiming =
    form.uploadTime === "Timing" ||
    String(form.uploadTime).toLowerCase() === "timing" ||
    String(form.uploadTime).toLowerCase() === "schedule" ||
    String(form.uploadTime).toLowerCase() === "scheduled";

  const isEnabled = form.autoUploadFtp?.toLowerCase() === "yes";
  const isDelete = form.deleteSourceFile?.toLowerCase() === "yes";

  return {
    enable_sftp: isEnabled ? "yes" : "no",
    sftp_address: form.ftpAddress?.trim() || "",
    username: form.username?.trim() || "",
    password: form.password || "",
    upload_time: isTiming ? "timing" : "realtime",
    upload_mode: isTiming ? "timing" : "realtime",
    hours: parseInt(form.startHour ?? 0, 10) || 0,
    minutes: parseInt(form.startMinute ?? 0, 10) || 0,
    delete_source_file: isDelete ? "yes" : "no",
    delete_source: isDelete ? "yes" : "no",
  };
};
