import { IP_CALL_IN_CALLEEID_INITIAL_FORM } from "../../../../constants/FxsIPCallInCalleeIDConstants";

export const normalizeIPCallInCalleeIDFormDigits = (formData) => ({
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

export const IPCallInCalleeIDFormFromRow = (item) =>
  normalizeIPCallInCalleeIDFormDigits({ ...item });

export const buildIPCallInCalleeIDUpdatePayload = (normalized, editId) => ({
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

export const renderIPCallInCalleeIDCellValue = (col, item) => {

  if (
    item[col.key] !== undefined &&
    item[col.key] !== null &&
    item[col.key] !== ""
  ) {
    return String(item[col.key]);
  }
  return "--";
};

