import { useCallback, useEffect, useMemo, useState } from "react";
import {
  fetchAccountManageDelete,
  fetchAccountManageGetAll,
  fetchAccountManageRegister,
  fetchAccountManageUpdate,
} from "../../../../api/apiService";
import useAuth from "../../../../context/useAuth";
import {
  ACCOUNT_MANAGE_DEFAULT_TOAST,
  ACCOUNT_MANAGE_ERROR_HIDE_MS,
  ACCOUNT_MANAGE_INITIAL_FORM,
  ACCOUNT_MANAGE_MESSAGES,
  ACCOUNT_MANAGE_TOAST_DURATION_MS,
} from "../../../../constants/AccountManageConstants";
import {
  buildClearAllPayload,
  buildDeleteUsersPayload,
  buildSavePayload,
  getSelectableIndices,
  mapClearAllError,
  mapDeleteError,
  mapLoadError,
  mapSaveError,
  mapUpdateError,
  mapUsersWithAdminFlag,
} from "../utils/AccountManageTransformers";
import { validateAccountForm } from "../utils/AccountManageValidators";

export function useAccountManagePage() {
  const { canWrite, showReadOnlyToast } = useAuth();
  const [accounts, setAccounts] = useState([]);
  const [selected, setSelected] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState(ACCOUNT_MANAGE_INITIAL_FORM);
  const [editIdx, setEditIdx] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(ACCOUNT_MANAGE_DEFAULT_TOAST);

  const combinedAccounts = accounts;

  const showToast = useCallback((msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(
      () => setToast(ACCOUNT_MANAGE_DEFAULT_TOAST),
      ACCOUNT_MANAGE_TOAST_DURATION_MS,
    );
  }, []);

  const clearToast = useCallback(() => {
    setToast(ACCOUNT_MANAGE_DEFAULT_TOAST);
  }, []);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(
        () => setError(null),
        ACCOUNT_MANAGE_ERROR_HIDE_MS,
      );
      return () => clearTimeout(timer);
    }
  }, [error]);

  const fetchAllUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetchAccountManageGetAll();
      if (response && response.response === true && response.data) {
        setAccounts(mapUsersWithAdminFlag(response.data));
      } else {
        throw new Error(response?.message || "Failed to fetch users");
      }
    } catch (err) {
      console.error("Error fetching users:", err);
      setError(mapLoadError(err));
      setAccounts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllUsers();
  }, [fetchAllUsers]);

  const saveUser = useCallback(
    async (userData) => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetchAccountManageRegister(userData);
        if (response && response.response === true) {
          await fetchAllUsers();
          showToast(ACCOUNT_MANAGE_MESSAGES.saveSuccess);
          return true;
        }
        throw new Error(response?.message || "Failed to save user");
      } catch (err) {
        console.error("Error saving user:", err);
        setError(mapSaveError(err));
        return false;
      } finally {
        setLoading(false);
      }
    },
    [fetchAllUsers, showToast],
  );

  const updateUser = useCallback(
    async (userData) => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetchAccountManageUpdate(userData);
        if (response && response.response === true) {
          await fetchAllUsers();
          showToast(ACCOUNT_MANAGE_MESSAGES.updateSuccess);
          return true;
        }
        throw new Error(response?.message || "Failed to update user");
      } catch (err) {
        console.error("Error updating user:", err);
        setError(mapUpdateError(err));
        return false;
      } finally {
        setLoading(false);
      }
    },
    [fetchAllUsers, showToast],
  );

  const deleteUsers = useCallback(
    async (userData) => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetchAccountManageDelete(userData);
        if (response && response.response === true) {
          await fetchAllUsers();
          const skipped = response.data?.skipped ?? [];
          if (skipped.length > 0) {
            showToast(
              ACCOUNT_MANAGE_MESSAGES.deleteSkipped(
                skipped.map((u) => u.username),
              ),
              "warning",
            );
          } else {
            showToast(ACCOUNT_MANAGE_MESSAGES.deleteSuccess);
          }
          return true;
        }
        throw new Error(response?.message || "Failed to delete user");
      } catch (err) {
        console.error("Error deleting user:", err);
        setError(mapDeleteError(err));
        return false;
      } finally {
        setLoading(false);
      }
    },
    [fetchAllUsers, showToast],
  );

  const deleteAllUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const allUsersData = buildClearAllPayload(accounts);
      const response = await fetchAccountManageDelete({ users: allUsersData });
      if (response && response.response === true) {
        setAccounts([]);
        setSelected([]);
        showToast(ACCOUNT_MANAGE_MESSAGES.clearAllSuccess);
        return true;
      }
      throw new Error(response?.message || "Failed to clear all users");
    } catch (err) {
      console.error("Error clearing all users:", err);
      setError(mapClearAllError(err));
      return false;
    } finally {
      setLoading(false);
    }
  }, [accounts, showToast]);

  const pageSelectableIndices = useMemo(
    () => getSelectableIndices(combinedAccounts),
    [combinedAccounts],
  );

  const allPageSelected =
    pageSelectableIndices.length > 0 &&
    pageSelectableIndices.every((idx) => selected.includes(idx));

  const somePageSelected =
    pageSelectableIndices.some((idx) => selected.includes(idx)) &&
    !allPageSelected;

  const handleSelectRow = useCallback((idx) => {
    setSelected((sel) =>
      sel.includes(idx) ? sel.filter((i) => i !== idx) : [...sel, idx],
    );
  }, []);

  const handleToggleAll = useCallback(() => {
    if (!pageSelectableIndices.length) return;
    setSelected((prev) =>
      allPageSelected
        ? prev.filter((id) => !pageSelectableIndices.includes(id))
        : Array.from(new Set([...prev, ...pageSelectableIndices])),
    );
  }, [allPageSelected, pageSelectableIndices]);

  const handleInverse = useCallback(() => {
    const selectableIndices = getSelectableIndices(combinedAccounts);
    setSelected(selectableIndices.filter((i) => !selected.includes(i)));
  }, [combinedAccounts, selected]);

  const handleDelete = useCallback(async () => {
    if (selected.length === 0) {
      setError(ACCOUNT_MANAGE_MESSAGES.deleteSelectRequired);
      return;
    }

    const selectedUsers = buildDeleteUsersPayload(selected, combinedAccounts);
    if (selectedUsers.length === 0) {
      showToast(ACCOUNT_MANAGE_MESSAGES.adminCannotDelete, "error");
      return;
    }

    const isConfirmed = window.confirm(
      ACCOUNT_MANAGE_MESSAGES.deleteConfirm(selectedUsers.length),
    );
    if (isConfirmed) {
      const success = await deleteUsers({ users: selectedUsers });
      if (success) setSelected([]);
    }
  }, [combinedAccounts, deleteUsers, selected, showToast]);

  const handleClearAll = useCallback(async () => {
    if (accounts.length === 0) {
      setError(ACCOUNT_MANAGE_MESSAGES.clearAllEmpty);
      return;
    }
    const isConfirmed = window.confirm(ACCOUNT_MANAGE_MESSAGES.clearAllConfirm);
    if (isConfirmed) await deleteAllUsers();
  }, [accounts.length, deleteAllUsers]);

  const handleOpenModal = useCallback(
    (item = null, idx = null) => {
      if (item) {
        if (item.isCurrentUser) {
          setError(ACCOUNT_MANAGE_MESSAGES.cannotEditCurrentUser);
          return;
        }
        setFormData({
          index: idx + 1,
          userName: item.username,
          password: "",
          authority: item.authority ?? "Read",
        });
        setEditIdx(idx);
      } else {
        const nextIndex = combinedAccounts.length + 1;
        setFormData({ ...ACCOUNT_MANAGE_INITIAL_FORM, index: nextIndex });
        setEditIdx(null);
      }
      setIsModalOpen(true);
    },
    [combinedAccounts.length],
  );

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setError(null);
  }, []);

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleSave = useCallback(async () => {
    const validationError = validateAccountForm(formData);
    if (validationError) {
      setError(validationError);
      return;
    }

    const userData = buildSavePayload(formData);
    const success =
      editIdx !== null ? await updateUser(userData) : await saveUser(userData);

    if (success) {
      setIsModalOpen(false);
      setError(null);
    }
  }, [editIdx, formData, saveUser, updateUser]);

  return {
    canWrite,
    showReadOnlyToast,
    accounts,
    combinedAccounts,
    selected,
    isModalOpen,
    formData,
    editIdx,
    loading,
    error,
    setError,
    toast,
    clearToast,
    pageSelectableIndices,
    allPageSelected,
    somePageSelected,
    handleSelectRow,
    handleToggleAll,
    handleInverse,
    handleDelete,
    handleClearAll,
    handleOpenModal,
    handleCloseModal,
    handleInputChange,
    handleSave,
    showToast,
  };
}
