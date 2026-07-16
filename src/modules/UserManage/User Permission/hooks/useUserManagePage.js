import { useCallback, useEffect, useRef, useState } from "react";
import {
  createUser,
  deleteUser,
  fetchUserList,
  updateUserAccess,
} from "../../../../api/apiService";
import useAuth from "../../../../context/useAuth";
import {
  INITIAL_PERMISSIONS,
  USER_MANAGE_DEFAULT_ACCESS_TYPE,
  USER_MANAGE_DEFAULT_ROLE_PERMISSION,
  USER_MANAGE_DEFAULT_TOAST,
  USER_MANAGE_FORM_ERROR_HIDE_MS,
  USER_MANAGE_MESSAGES,
  USER_MANAGE_TOAST_DURATION_MS,
} from "../../../../constants/UserManageConstants";
import {
  buildPermsFromPages,
  collectSectionsAndPages,
  extractEditUserFields,
  normalizeUserList,
} from "../utils/UserManageTransformers";
import { validateAddUserForm } from "../utils/UserManageValidators";

export function useUserManagePage() {
  const { canWrite, showReadOnlyToast } = useAuth();
  const [users, setUsers] = useState([]);
  const [loadingList, setLoadingList] = useState(true);
  const [listError, setListError] = useState("");
  const [mode, setMode] = useState(null);
  const [editUser, setEditUser] = useState(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [accessType, setAccessType] = useState(USER_MANAGE_DEFAULT_ACCESS_TYPE);
  const [rolePermission, setRolePermission] = useState(
    USER_MANAGE_DEFAULT_ROLE_PERMISSION,
  );
  const [permissions, setPermissions] = useState({ ...INITIAL_PERMISSIONS });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const formErrorTimerRef = useRef(null);
  const [toast, setToast] = useState(USER_MANAGE_DEFAULT_TOAST);
  const toastTimerRef = useRef(null);

  const clearFormError = useCallback(() => {
    if (formErrorTimerRef.current) clearTimeout(formErrorTimerRef.current);
    formErrorTimerRef.current = null;
    setFormError("");
  }, []);

  const showFormError = useCallback((msg) => {
    setFormError(msg);
    if (formErrorTimerRef.current) clearTimeout(formErrorTimerRef.current);
    formErrorTimerRef.current = setTimeout(() => {
      setFormError("");
      formErrorTimerRef.current = null;
    }, USER_MANAGE_FORM_ERROR_HIDE_MS);
  }, []);

  const showToast = useCallback((msg, type = "success") => {
    setToast({ msg, type });
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => {
      setToast(USER_MANAGE_DEFAULT_TOAST);
      toastTimerRef.current = null;
    }, USER_MANAGE_TOAST_DURATION_MS);
  }, []);

  useEffect(() => {
    return () => {
      if (formErrorTimerRef.current) clearTimeout(formErrorTimerRef.current);
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  const loadUsers = useCallback(async () => {
    setLoadingList(true);
    setListError("");
    try {
      const data = await fetchUserList();
      setUsers(normalizeUserList(data));
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || "";
      if (msg.toLowerCase().includes("only superadmin")) {
        showToast(msg, "error");
      } else {
        setListError(USER_MANAGE_MESSAGES.loadFailed);
      }
    } finally {
      setLoadingList(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const openAdd = useCallback(() => {
    setMode("add");
    setEditUser(null);
    setUsername("");
    setPassword("");
    setAccessType(USER_MANAGE_DEFAULT_ACCESS_TYPE);
    setRolePermission(USER_MANAGE_DEFAULT_ROLE_PERMISSION);
    setPermissions({ ...INITIAL_PERMISSIONS });
    clearFormError();
  }, [clearFormError]);

  const openEdit = useCallback(
    (user) => {
      setMode("edit");
      setEditUser(user);
      setUsername(user.username || "");
      setPassword("");
      const { accessType: at, rolePermission: rp, pages } =
        extractEditUserFields(user);
      setAccessType(at ?? USER_MANAGE_DEFAULT_ACCESS_TYPE);
      setRolePermission(rp ?? USER_MANAGE_DEFAULT_ROLE_PERMISSION);
      setPermissions(buildPermsFromPages(pages));
      clearFormError();
    },
    [clearFormError],
  );

  const closeForm = useCallback(() => {
    setMode(null);
    setEditUser(null);
    clearFormError();
  }, [clearFormError]);

  const handleSave = useCallback(async () => {
    clearFormError();
    const { sections, pages } = collectSectionsAndPages(permissions);

    if (mode === "add") {
      const validationError = validateAddUserForm({ username, password });
      if (validationError) {
        showFormError(validationError);
        return;
      }
      setSaving(true);
      try {
        const res = await createUser({
          username: username.trim(),
          password,
          access_type: accessType,
          role_permission: rolePermission,
          sections,
          pages,
        });
        if (res?.response === false) {
          showFormError(res?.message || USER_MANAGE_MESSAGES.createFailed);
          return;
        }
        showToast(USER_MANAGE_MESSAGES.createSuccess);
        closeForm();
        loadUsers();
      } catch (err) {
        const msg =
          err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          USER_MANAGE_MESSAGES.createFailed;
        showFormError(typeof msg === "string" ? msg : JSON.stringify(msg));
      } finally {
        setSaving(false);
      }
    } else if (mode === "edit") {
      setSaving(true);
      try {
        const res = await updateUserAccess({
          id: editUser.id,
          access_type: accessType,
          role_permission: rolePermission,
          sections,
          pages,
        });
        if (res?.response === false) {
          showFormError(res?.message || USER_MANAGE_MESSAGES.updateFailed);
          return;
        }
        showToast(USER_MANAGE_MESSAGES.updateSuccess);
        closeForm();
        loadUsers();
      } catch (err) {
        const msg =
          err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          USER_MANAGE_MESSAGES.updateFailed;
        showFormError(typeof msg === "string" ? msg : JSON.stringify(msg));
      } finally {
        setSaving(false);
      }
    }
  }, [
    accessType,
    clearFormError,
    closeForm,
    editUser,
    loadUsers,
    mode,
    password,
    permissions,
    rolePermission,
    showFormError,
    showToast,
    username,
  ]);

  const handleDelete = useCallback(
    async (user) => {
      const isConfirmed = window.confirm(
        USER_MANAGE_MESSAGES.deleteConfirm(user.username),
      );
      if (!isConfirmed) return;
      try {
        await deleteUser(user.id);
        showToast(USER_MANAGE_MESSAGES.deleteSuccess);
        loadUsers();
      } catch {
        showToast(USER_MANAGE_MESSAGES.deleteFailed, "error");
      }
    },
    [loadUsers, showToast],
  );

  const clearToast = useCallback(() => {
    setToast(USER_MANAGE_DEFAULT_TOAST);
  }, []);

  return {
    canWrite,
    showReadOnlyToast,
    users,
    loadingList,
    listError,
    mode,
    editUser,
    username,
    setUsername,
    password,
    setPassword,
    accessType,
    setAccessType,
    rolePermission,
    setRolePermission,
    permissions,
    setPermissions,
    saving,
    formError,
    clearFormError,
    toast,
    clearToast,
    openAdd,
    openEdit,
    closeForm,
    handleSave,
    handleDelete,
  };
}
