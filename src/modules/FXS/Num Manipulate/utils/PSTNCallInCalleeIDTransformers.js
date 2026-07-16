import { PSTN_CALL_IN_CALLEEID_INITIAL_FORM } from "../../../../constants/FxsPSTNCallInCalleeIDConstants";

export const normalizePSTNCallInCalleeIDFormDigits = (formData) => ({
  ...formData,
  stripped_digits_from_left:
    formData.stripped_digits_from_left === "" ||
    formData.stripped_digits_from_left == null
      ? "0"
      : String(formData.stripped_digits_from_left),
  stripped_digits_from_right:
    formData.stripped_digits_from_right === "" ||
    formData.stripped_digits_from_right == null
      ? "0"
      : String(formData.stripped_digits_from_right),
  reserved_digits_from_right:
    formData.reserved_digits_from_right === "" ||
    formData.reserved_digits_from_right == null
      ? "0"
      : String(formData.reserved_digits_from_right),
});

export const PSTNCallInCalleeIDFormFromRow = (item) =>
  normalizePSTNCallInCalleeIDFormDigits({ ...item });

export const buildPSTNCallInCalleeIDUpdatePayload = (normalized, editId) => ({
  id: editId,
  call_initiator: normalized.call_initiator,
  callerid_prefix: normalized.callerid_prefix,
  calleeid_prefix: normalized.calleeid_prefix,
  with_original_calleeid: normalized.with_original_calleeid || "No",
  stripped_digits_from_left: normalized.stripped_digits_from_left,
  stripped_digits_from_right: normalized.stripped_digits_from_right,
  reserved_digits_from_right: normalized.reserved_digits_from_right,
  prefix_to_add: normalized.prefix_to_add,
  suffix_to_add: normalized.suffix_to_add,
  description: normalized.description,
});

export const renderPSTNCallInCalleeIDCellValue = (col, item, pcmTrunkGroups, getPcmGroupIdLabel) => {
  if (col.key === "call_initiator") {
    return `PCM Trunk Group [${getPcmGroupIdLabel(item[col.key])}]`;
  }
  if (
    item[col.key] !== undefined &&
    item[col.key] !== null &&
    item[col.key] !== ""
  ) {
    return String(item[col.key]);
  }
  return "--";
};

export const getPSTNCallInCalleeIDPcmGroupIdLabel = (groupId, pcmTrunkGroups) => {
  const group = pcmTrunkGroups.find(
    (g) => String(g.group_id || g.id || g) === String(groupId),
  );
  const gid = group ? (group.group_id ?? group.id ?? groupId) : groupId;
  return String(gid);
};

export const getPSTNCallInCalleeIDUpdatedFields = (fields, pcmTrunkGroups) =>
  fields.map((field) => {
    if (field.name === "call_initiator") {
      return {
        ...field,
        options: pcmTrunkGroups.map((group) => ({
          value: String(group.group_id ?? group.id ?? group),
          label: `PCM Trunk Group [${String(group.group_id ?? group.id ?? group)}]`,
        })),
      };
    }
    return field;
  });

export const buildDefaultPSTNCallInCalleeIDForm = (initialForm, pcmTrunkGroups) => {
  const defaultForm = { ...initialForm };
  if (pcmTrunkGroups.length > 0) {
    const firstGroupId =
      pcmTrunkGroups[0].group_id ||
      pcmTrunkGroups[0].id ||
      pcmTrunkGroups[0];
    defaultForm.call_initiator = String(firstGroupId);
  }
  return defaultForm;
};

