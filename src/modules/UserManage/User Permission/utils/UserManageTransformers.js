import {
  INITIAL_PERMISSIONS,
  PAGE_PERMISSION_GROUPS,
} from "../../../../constants/UserManageConstants";

export function allChecked(pages, perms) {
  return pages.length > 0 && pages.every((p) => perms[p.id]);
}

export function someChecked(pages, perms) {
  const n = pages.filter((p) => perms[p.id]).length;
  return n > 0 && n < pages.length;
}

export function sectionPages(section) {
  return section.subGroups.flatMap((sg) => sg.pages);
}

export function buildPermsFromPages(pages = []) {
  const perms = { ...INITIAL_PERMISSIONS };
  pages.forEach((id) => {
    if (id in perms) perms[id] = true;
  });
  return perms;
}

export function collectSectionsAndPages(perms) {
  const sections = [];
  const pages = [];
  PAGE_PERMISSION_GROUPS.forEach((section) => {
    const secPages = sectionPages(section);
    const checkedPages = secPages.filter((p) => perms[p.id]).map((p) => p.id);
    if (checkedPages.length > 0) {
      sections.push(section.id);
      pages.push(...checkedPages);
    }
  });
  return { sections, pages };
}

export function getUserAccess(user) {
  return user.access || user || {};
}

export function getUserAccessType(user) {
  const access = getUserAccess(user);
  return access.access_type ?? user.access_type ?? user.role ?? "";
}

export function isSuperAdminUser(user) {
  const accessType = getUserAccessType(user);
  return accessType === "superadmin" || accessType === "admin";
}

export function getUserSectionsLabel(user) {
  const access = getUserAccess(user);
  return (access.sections ?? user.sections ?? []).join(", ") || "-";
}

export function getUserRolePermission(user) {
  const access = getUserAccess(user);
  return access.role_permission ?? user.role_permission ?? "-";
}

export function normalizeUserList(data) {
  return Array.isArray(data) ? data : [];
}

export function extractEditUserFields(user) {
  const access = getUserAccess(user);
  const accessType =
    access.access_type ?? user.access_type ?? undefined;
  const rolePermission =
    access.role_permission ?? user.role_permission ?? undefined;
  const pages = access.pages ?? user.pages ?? user.access_pages ?? [];
  return { accessType, rolePermission, pages };
}
