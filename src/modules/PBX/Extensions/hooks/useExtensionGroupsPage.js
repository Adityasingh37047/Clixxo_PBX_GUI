import { useEffect, useMemo, useRef, useState } from "react";
import {
  createExtensionGroup,
  deleteExtensionGroup,
  fetchExtensionGroups,
  fetchSipAccounts,
  updateExtensionGroup,
} from "../../../../api/apiService";
import { attachExtGroupModalSmoothWheelScroll } from "../components/ExtensionGroupsTableHelpers";
import {
  buildExtensionGroupPayload,
  mapAvailableExtensionsResponse,
  mapExtensionGroupsResponse,
} from "../utils/ExtensionGroupsTransformers";
import { validateExtensionGroup } from "../utils/ExtensionGroupsValidators";

export const useExtensionGroupsPage = () => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState({
    fetch: false, delete: false, save: false, extensions: false,
  });
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [selectedIds, setSelectedIds] = useState([]);
  const hasInitialLoadRef = useRef(false);
  const modalScrollRef = useRef(null);
  const [showModal, setShowModal] = useState(false);
  const [editGroupId, setEditGroupId] = useState(null);
  const [groupName, setGroupName] = useState("");
  const [availableExtensions, setAvailableExtensions] = useState([]);
  const [selectedExtensions, setSelectedExtensions] = useState([]);

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 5000);
  };

  const loadGroups = async () => {
    setLoading((p) => ({ ...p, fetch: true }));
    setMessage({ type: "", text: "" });
    try {
      const res = await fetchExtensionGroups();
      setGroups(mapExtensionGroupsResponse(res));
    } catch (err) {
      showMessage("error", err?.message || "Failed to load extension groups.");
    } finally {
      setLoading((p) => ({ ...p, fetch: false }));
      setIsInitialLoad(false);
    }
  };

  useEffect(() => {
    if (!hasInitialLoadRef.current) {
      hasInitialLoadRef.current = true;
      loadGroups();
    }
  }, []);

  useEffect(() => {
    if (!showModal) return undefined;
    let detach = () => {};
    const frame = requestAnimationFrame(() => {
      if (modalScrollRef.current) {
        detach = attachExtGroupModalSmoothWheelScroll(modalScrollRef.current);
      }
    });
    return () => {
      cancelAnimationFrame(frame);
      detach();
    };
  }, [showModal]);

  const totalPages = Math.max(1, Math.ceil(groups.length / limit));
  const pagedGroups = groups.slice((page - 1) * limit, page * limit);
  const dataEmpty = groups.length === 0;
  const pageIds = pagedGroups.map((g) => g.id);
  const allPageSelected =
    pageIds.length > 0 && pageIds.every((id) => selectedIds.includes(id));
  const somePageSelected =
    pagedGroups.some((g) => selectedIds.includes(g.id)) && !allPageSelected;

  const handleToggleRow = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };
  const handleToggleAll = () => {
    if (!pageIds.length) return;
    setSelectedIds((prev) =>
      allPageSelected
        ? prev.filter((id) => !pageIds.includes(id))
        : Array.from(new Set([...prev, ...pageIds])),
    );
  };
  const handleDelete = async () => {
    if (!selectedIds.length) {
      showMessage("error", "Please select at least one record to delete.");
      return;
    }
    const msg = selectedIds.length === 1
      ? "Are you sure you want to delete this group?"
      : `Are you sure you want to delete ${selectedIds.length} groups?`;
    if (!window.confirm(msg)) return;
    setLoading((p) => ({ ...p, delete: true }));
    setMessage({ type: "", text: "" });
    const deleteCount = selectedIds.length;
    try {
      await Promise.all(selectedIds.map((id) => deleteExtensionGroup(id)));
      setSelectedIds([]);
      await loadGroups();
      showMessage("success", deleteCount === 1
        ? "Extension group deleted successfully."
        : `${deleteCount} extension groups deleted successfully.`);
    } catch (err) {
      showMessage("error", err?.message || "Failed to delete some groups.");
    } finally {
      setLoading((p) => ({ ...p, delete: false }));
    }
  };

  const openExtensionList = () => {
    setLoading((p) => ({ ...p, extensions: true }));
    fetchSipAccounts()
      .then((res) => setAvailableExtensions(mapAvailableExtensionsResponse(res)))
      .catch(() => {
        setAvailableExtensions([]);
        showMessage("error", "Failed to load available extensions for the modal.");
      })
      .finally(() => setLoading((p) => ({ ...p, extensions: false })));
  };
  const resetModalState = () => {
    setEditGroupId(null);
    setGroupName("");
    setSelectedExtensions([]);
  };
  const handleOpenAddModal = () => {
    resetModalState();
    setShowModal(true);
    openExtensionList();
  };
  const handleOpenEditModal = (group) => {
    setEditGroupId(group.id);
    setGroupName(group.name || "");
    setSelectedExtensions(Array.isArray(group.extensions) ? [...group.extensions] : []);
    setShowModal(true);
    openExtensionList();
  };
  const handleCloseModal = () => {
    setShowModal(false);
    resetModalState();
  };
  const getExtensionLabel = (extension) => {
    const found = availableExtensions.find((e) => e.extension === extension);
    if (!found) return String(extension);
    return found.name ? `${found.extension} — ${found.name}` : found.extension;
  };
  const allExtensionOptions = useMemo(() => availableExtensions.map(({ extension, name }) => ({
    value: extension, label: name ? `${extension} — ${name}` : extension,
  })), [availableExtensions]);
  const handleSaveGroup = async () => {
    const { name, error } = validateExtensionGroup(groupName, selectedExtensions);
    if (error) return showMessage("error", error);
    const payload = buildExtensionGroupPayload(name, selectedExtensions);
    setLoading((p) => ({ ...p, save: true }));
    setMessage({ type: "", text: "" });
    try {
      const isUpdate = editGroupId != null;
      if (isUpdate) {
        await updateExtensionGroup({ id: editGroupId, ...payload });
      } else {
        await createExtensionGroup(payload);
      }
      await loadGroups();
      handleCloseModal();
      showMessage("success", isUpdate
        ? "Extension group updated successfully."
        : "Extension group created successfully.");
    } catch (err) {
      showMessage("error", err?.message || "Failed to save group.");
    } finally {
      setLoading((p) => ({ ...p, save: false }));
    }
  };

  return {
    allExtensionOptions, allPageSelected, availableExtensions, dataEmpty,
    editGroupId, getExtensionLabel, groupName, groups, handleCloseModal,
    handleDelete, handleOpenAddModal, handleOpenEditModal, handleSaveGroup,
    handleToggleAll, handleToggleRow, isInitialLoad, limit, loading,
    message, modalScrollRef, page, pagedGroups, selectedExtensions,
    selectedIds, setGroupName, setMessage, setPage, setSelectedExtensions,
    showModal, somePageSelected, totalPages,
  };
};
