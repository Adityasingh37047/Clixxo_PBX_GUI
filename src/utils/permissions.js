export function isReadOnlyUser(user) {
  if (!user) return false;
  // API flagged this session as read-only
  if (user.read_only === true) return true;
  const access = user.access;
  if (!access) return false;
  if (access.access_type === 'superadmin' || user.role === 'superadmin') return false;
  if (access.can_write === false) return true;
  const rp = String(access.role_permission || user.role_permission || '')
    .toLowerCase()
    .replace(/\s+/g, '');
  return rp === 'read';
}

export function canWrite(user) {
  return !isReadOnlyUser(user);
}