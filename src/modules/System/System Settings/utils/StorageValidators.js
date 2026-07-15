export const STORAGE_MAX_DEVICE_USAGE_MIN = 30;
export const STORAGE_MAX_DEVICE_USAGE_MAX = 90;
export const STORAGE_ERR_MAX_DEVICE_USAGE =
  "Value must be between 30 and 90.";

/**
 * Validates Auto Cleanup form fields.
 * @returns {{ valid: boolean, errors: Record<string, string> }}
 */
export function validateAutoCleanupForm(form = {}) {
  const errors = {};
  const usage = Number(form.maxDeviceUsage);

  if (
    Number.isNaN(usage) ||
    usage < STORAGE_MAX_DEVICE_USAGE_MIN ||
    usage > STORAGE_MAX_DEVICE_USAGE_MAX
  ) {
    errors.maxDeviceUsage = STORAGE_ERR_MAX_DEVICE_USAGE;
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}
