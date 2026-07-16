export const E1_PRI_IP_CALL_IN_CALLERID_DISPLAY_COLUMNS = [
  { key: "call_initiator", label: "Call Initiator" },
  { key: "callerid_prefix", label: "CallerID Prefix" },
  { key: "calleeid_prefix", label: "CalleeID Prefix" },
  { key: "stripped_digits_from_right", label: "Stripped Digits from Right" },
  { key: "reserved_digits_from_right", label: "Reserved Digits from Right" },
];

export const normalizeE1PriIPCallInCallerIDFormDigits = (formData) => ({
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

export const E1PriIPCallInCallerIDFormFromRow = (item) =>
  normalizeE1PriIPCallInCallerIDFormDigits({ ...item });

export const buildE1PriIPCallInCallerIDUpdatePayload = (normalized, editId) => ({
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

export const renderE1PriIPCallInCallerIDCellValue = (col, item) => {
  if (col.key === "call_initiator") {
    return `SIP Trunk Group [${item.call_initiator}]`;
  }
  if (
    item[col.key] !== undefined &&
    item[col.key] !== null &&
    item[col.key] !== ""
  ) {
    return String(item[col.key]);
  }
  return item[col.key] ?? "";
};
