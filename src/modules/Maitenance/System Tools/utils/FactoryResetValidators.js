/** Factory reset uses confirm dialogs — no form-field validators. */

export function shouldProceedFactoryReset(firstConfirm, secondConfirm) {
  return Boolean(firstConfirm && secondConfirm);
}
