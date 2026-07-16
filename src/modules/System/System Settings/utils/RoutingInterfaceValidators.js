import {
  ROUTING_INTERFACE_ERROR_GATEWAY_INVALID,
  ROUTING_INTERFACE_ERROR_METRIC_INVALID,
} from "../../../../constants/RoutingInterfaceConstants";

export function isValidIPv4(ip) {
  return /^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(
    ip,
  );
}

/**
 * Validates routing switch form fields.
 * @returns {{ valid: boolean, errors: { gateway: string, metric: string } }}
 */
export function validateRoutingForm(form = {}) {
  const errors = { gateway: "", metric: "" };
  let valid = true;

  if (!isValidIPv4(form.gateway)) {
    errors.gateway = ROUTING_INTERFACE_ERROR_GATEWAY_INVALID;
    valid = false;
  }

  const m = parseInt(form.metric, 10);
  if (isNaN(m) || m < 0 || m > 9999) {
    errors.metric = ROUTING_INTERFACE_ERROR_METRIC_INVALID;
    valid = false;
  }

  return { valid, errors };
}
