import { LICENSE_LIMITS_INITIAL_FORM } from "../../../../constants/LicenseLimitsConstants";

export function createLicenseLimitsForm() {
  return { ...LICENSE_LIMITS_INITIAL_FORM };
}

export function mapLicenseLimitsResponse(message) {
  const { max_extensions, max_fxs_ports, max_trunks } = message || {};
  return {
    max_extensions: max_extensions ?? "",
    max_fxs_ports: max_fxs_ports ?? "",
    max_trunks: max_trunks ?? "",
  };
}

export function toLicenseLimitsPayload(form) {
  return {
    max_extensions: Number(form.max_extensions),
    max_fxs_ports: Number(form.max_fxs_ports),
    max_trunks: Number(form.max_trunks),
  };
}
