export const normalizeE1PriPSTNCallInCalleeIDFormDigits = (formData) => ({
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

export const E1PriPSTNCallInCalleeIDFormFromRow = (item) =>
  normalizeE1PriPSTNCallInCalleeIDFormDigits({
    ...item,
  });

export const buildE1PriPSTNCallInCalleeIDUpdatePayload = (normalized, editId) => ({
  id: editId,
  call_initiator: normalized.call_initiator,
  callerid_prefix: normalized.callerid_prefix,
  calleeid_prefix: normalized.calleeid_prefix,
  with_original_calleeid: normalized.with_original_calleeid,
  stripped_digits_from_left: normalized.stripped_digits_from_left,
  stripped_digits_from_right: normalized.stripped_digits_from_right,
  reserved_digits_from_right: normalized.reserved_digits_from_right,
  prefix_to_add: normalized.prefix_to_add,
  suffix_to_add: normalized.suffix_to_add,
  description: normalized.description,
});

export const formatE1PriPSTNCallInCalleeIDDisplayValue = (
  key,
  value,
  rowIndex,
  page,
  itemsPerPage,
  getPcmGroupIdLabel,
) => {
  if (key === "index") {
    return (page - 1) * itemsPerPage + rowIndex + 1;
  }
  if (value === undefined || value === null || value === "") return "--";
  if (key === "call_initiator") {
    return `PCM Trunk Group [${getPcmGroupIdLabel(value)}]`;
  }
  return String(value);
};

export const getE1PriPSTNCallInCalleeIDPcmGroupIdLabel = (groupId, pcmTrunkGroups) => {
  const group = pcmTrunkGroups.find(
    (g) => String(g.group_id || g.id || g) === String(groupId),
  );
  const gid = group ? (group.group_id ?? group.id ?? groupId) : groupId;
  return String(gid);
};

export const getE1PriPSTNCallInCalleeIDUpdatedFields = (fields, pcmTrunkGroups) =>
  fields.map((field) => {
    if (field.name === "call_initiator") {
      return {
        ...field,
        options: pcmTrunkGroups.map((group) => ({
          value: String(group.group_id ?? group.id ?? group),
          label: `PCM Trunk Group [${String(group.group_id ?? group.id ?? group)}]`,
        })),
        emptyOptionLabel: "PCM Trunk Group [Any]",
      };
    }
    return field;
  });

export const buildDefaultE1PriPSTNCallInCalleeIDForm = (initialForm, pcmTrunkGroups) => {
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
