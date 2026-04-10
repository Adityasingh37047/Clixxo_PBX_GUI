/** Path to the Licence management page (must match router + sidebar). */
export const LICENCE_PAGE_PATH = '/system-tools/licence';

/**
 * Licence is restricted to the built-in admin account (not e.g. "clixxo").
 * Matches login `user.username` from AuthContext / localStorage.
 */
export function canAccessLicence(user) {
  if (!user) return false;
  return String(user.username || '').toLowerCase() === 'admin';
}
