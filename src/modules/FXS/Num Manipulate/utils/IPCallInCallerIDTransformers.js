import { IP_CALL_IN_CALLERID_INITIAL_FORM } from "../../../../constants/FxsIPCallInCallerIDConstants";

export const normalizeIPCallInCallerIDFormDigits = (formData) => ({
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

export const IPCallInCallerIDFormFromRow = (item) =>
  normalizeIPCallInCallerIDFormDigits({ ...item });

export const buildIPCallInCallerIDUpdatePayload = (normalized, editId) => ({
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

export const renderIPCallInCallerIDCellValue = (col, item) => {

  if (
    item[col.key] !== undefined &&
    item[col.key] !== null &&
    item[col.key] !== ""
  ) {
    return String(item[col.key]);
  }
  return "--";
};

