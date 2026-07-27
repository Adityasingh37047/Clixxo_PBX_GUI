import {
  SIP_ACCESS_CONTROL_INITIAL_ROW,
  SIP_ACCESS_CONTROL_DEFAULT_OPTIONS,
  SIP_ACCESS_CONTROL_MODAL_FIELDS,
  SIP_ACCESS_CONTROL_FORM_LAYOUT,
} from "../../../../constants/SipAccessControlConstants";

/** Empty Add/Edit form. */
export const createSipAccessControlEmptyForm = () => ({
  ...SIP_ACCESS_CONTROL_INITIAL_ROW,
});

/** Map a table row into the modal form state. */
export const rowToSipAccessControlForm = (row) => {
  const fromType =
    row?.type === "Whitelist"
      ? "whitelist"
      : row?.type === "Blacklist"
        ? "blacklist"
        : null;

  return {
    name: row?.name || "",
    cidr: row?.cidr || "",
    domain: row?.domain || "",
    default: row?.default || fromType || "blacklist",
    description: row?.description || "",
  };
};

/** Label for Blacklist/Whitelist display in the table. */
export const getSipAccessControlDefaultLabel = (value) =>
  SIP_ACCESS_CONTROL_DEFAULT_OPTIONS.find((o) => o.value === value)?.label ||
  value ||
  "—";

/** Build ordered modal field defs from FORM_LAYOUT. */
export const buildSipAccessControlModalFields = () => {
  const byKey = SIP_ACCESS_CONTROL_MODAL_FIELDS.reduce((acc, field) => {
    acc[field.key] = field;
    return acc;
  }, {});
  const names = SIP_ACCESS_CONTROL_FORM_LAYOUT.flat();
  return names.map((key) => byKey[key]).filter(Boolean);
};
