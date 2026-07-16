export const mapRingGroupFromApi = (r) => ({
  id: r.id,
  name: r.name || "",
  ringGroupNumber: String(r.rg_number ?? ""),
  ringStrategy: r.ring_strategy || "simultaneous",
  timeoutDestinationType: r.timeout_dest_type || "",
  timeoutDestinationValue: r.timeout_dest_value || "",
  ringTimeout: String(r.ring_timeout ?? "30"),
  enabled: r.enabled ? "Yes" : "No",
  alertInfo: r.alert_info || "",
  ringBack: r.ring_back || "us-ring",
  cidNamePrefix: r.cid_name_prefix || "",
  extensionAnswerConfirm: r.answer_confirm ? "Yes" : "No",
  members: Array.isArray(r.members) ? r.members.map(String) : [],
});

export const normalizeRingGroupList = (res) => {
  const list = Array.isArray(res?.message)
    ? res.message
    : Array.isArray(res?.data)
      ? res.data
      : [];
  return list;
};

export const normalizeRingBackOptions = (msg, emptyOptions) => {
  const normalized =
    msg && typeof msg === "object" && !Array.isArray(msg)
      ? msg
      : emptyOptions;
  return {
    moh_categories: Array.isArray(normalized.moh_categories)
      ? normalized.moh_categories
      : [],
    custom_prompts: Array.isArray(normalized.custom_prompts)
      ? normalized.custom_prompts
      : [],
    country_tones: Array.isArray(normalized.country_tones)
      ? normalized.country_tones
      : [],
  };
};

export const mapSipAccountsToExtensionOptions = (sipRes) => {
  const sipList = Array.isArray(sipRes?.message)
    ? sipRes.message
    : Array.isArray(sipRes?.data)
      ? sipRes.data
      : [];
  return sipList
    .filter((e) => e && e.extension)
    .map((e) => {
      const ext = String(e.extension);
      const display = (e.display_name || e.name || "").trim();
      return {
        value: ext,
        label: display ? `${ext}-${display}` : ext,
      };
    })
    .sort((a, b) => {
      const an = parseInt(a.value, 10);
      const bn = parseInt(b.value, 10);
      if (!Number.isNaN(an) && !Number.isNaN(bn) && an !== bn) return an - bn;
      return a.label.localeCompare(b.label);
    });
};

export const mapConferencesToDestinationOptions = (confRes) => {
  const confList = Array.isArray(confRes?.message)
    ? confRes.message
    : Array.isArray(confRes?.data)
      ? confRes.data
      : [];
  return confList.map((c) => ({
    value: String(c.conf_number ?? c.id ?? ""),
    label: String(c.conf_number ?? c.id ?? ""),
  }));
};

export const mapIvrsToDestinationOptions = (ivrRes) => {
  const ivrList = Array.isArray(ivrRes?.message)
    ? ivrRes.message
    : Array.isArray(ivrRes?.data)
      ? ivrRes.data
      : [];
  return ivrList.map((i) => ({
    value: String(i.ivr_number ?? i.id ?? ""),
    label: String(i.ivr_number ?? i.id ?? ""),
  }));
};

export const ringGroupFormFromRow = (row) => ({
  editId: row.id,
  name: row.name || "",
  ringGroupNumber: row.ringGroupNumber || "",
  ringStrategy: row.ringStrategy || "simultaneous",
  timeoutDestinationType: row.timeoutDestinationType || "",
  timeoutDestinationValue: row.timeoutDestinationValue || "",
  ringTimeout: row.ringTimeout || "30",
  enabled: row.enabled || "Yes",
  alertInfo: row.alertInfo || "",
  ringBack: row.ringBack || "us-ring",
  cidNamePrefix: row.cidNamePrefix || "",
  extensionAnswerConfirm: row.extensionAnswerConfirm || "No",
  memberExtensions: Array.isArray(row.members) ? row.members : [],
});

export const buildRingGroupApiPayload = ({
  name,
  ringGroupNumber,
  ringStrategy,
  ringTimeout,
  memberExtensions,
  enabled,
  alertInfo,
  ringBack,
  cidNamePrefix,
  extensionAnswerConfirm,
  timeoutDestinationType,
  timeoutDestinationValue,
}) => ({
  name: name.trim(),
  rg_number: parseInt(ringGroupNumber, 10),
  ring_strategy: ringStrategy,
  ring_timeout: parseInt(ringTimeout, 10),
  members: memberExtensions.map(String),
  enabled: enabled === "Yes",
  alert_info: alertInfo || "",
  ring_back: ringBack,
  cid_name_prefix: cidNamePrefix || "",
  answer_confirm: extensionAnswerConfirm === "Yes",
  timeout_dest_type: timeoutDestinationType || "",
  timeout_dest_value: timeoutDestinationValue || "",
});

export const getRingGroupTimeoutValueOptions = ({
  timeoutDestinationType,
  destinationData,
  rows,
  editId,
}) => {
  switch (timeoutDestinationType) {
    case "extensions":
    case "faxtoemail":
    case "voicemail":
      return destinationData.extensions;
    case "conference_rooms":
      return destinationData.conferenceRooms;
    case "ivr_menus":
      return destinationData.ivrMenus;
    case "ring_groups":
      return rows
        .filter((r) => String(r.id) !== String(editId))
        .map((r) => ({
          value: String(r.ringGroupNumber),
          label: `${r.name}-${r.ringGroupNumber}`,
        }));
    case "other":
      return [
        { value: "Hangup", label: "Hangup" },
        { value: "MusicOnHold", label: "MusicOnHold" },
      ];
    default:
      return [];
  }
};
