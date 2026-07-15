import {
  SIP_ACCESS_CONTROL_ERR_NAME_REQUIRED,
  SIP_ACCESS_CONTROL_ERR_DUPLICATE_NAME,
  SIP_ACCESS_CONTROL_ERR_CIDR_OR_DOMAIN,
} from "../../../../constants/SipAccessControlConstants";

/**
 * Validate SIP Access Control add/edit form values.
 * @returns {{ valid: boolean, error: string|null, payload?: object }}
 */
export function validateSipAccessControlForm(form, rows = [], editingId = null) {
  const name = String(form?.name || "").trim();
  if (!name) {
    return { valid: false, error: SIP_ACCESS_CONTROL_ERR_NAME_REQUIRED };
  }

  const duplicate = rows.some(
    (row) =>
      row.id !== editingId &&
      String(row.name || "")
        .trim()
        .toLowerCase() === name.toLowerCase(),
  );
  if (duplicate) {
    return { valid: false, error: SIP_ACCESS_CONTROL_ERR_DUPLICATE_NAME };
  }

  const cidr = String(form?.cidr || "").trim();
  const domain = String(form?.domain || "").trim();
  if (!cidr && !domain) {
    return { valid: false, error: SIP_ACCESS_CONTROL_ERR_CIDR_OR_DOMAIN };
  }

  return {
    valid: true,
    error: null,
    payload: {
      name,
      cidr,
      domain,
      default: form?.default || "blacklist",
      description: String(form?.description || "").trim(),
    },
  };
}
