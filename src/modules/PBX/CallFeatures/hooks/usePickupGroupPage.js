import { useEffect, useMemo, useRef, useState } from "react";
import { useMediaQuery } from "@mui/material";
import { PICKUP_GROUP_ITEMS_PER_PAGE } from "../../../../constants/PickupGroupConstants";
import {
  createPickupGroup,
  deletePickupGroup,
  listPickupGroupExtensions,
  listPickupGroups,
  updatePickupGroup,
} from "../../../../api/apiService";
import {
  buildPickupGroupUpdatePayload,
  mapPickupGroupExtensionsFromApi,
  normalizePickupGroupList,
  pickupGroupFormFromRow,
} from "../utils/PickupGroupTransformers";
import { validatePickupGroupForm } from "../utils/PickupGroupValidators";

const PICKUP_GROUP_COMPACT_MQ = "(max-width: 768px)";

export function usePickupGroupPage() {
  const isCompact = useMediaQuery(PICKUP_GROUP_COMPACT_MQ);
  const [rows, setRows] = useState([]);
  const [selected, setSelected] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState({
    save: false,
    delete: false,
    extensions: false,
    list: false,
  });
  const [message, setMessage] = useState({ type: "", text: "" });
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const hasLoadedExtensionsRef = useRef(false);

  const itemsPerPage = PICKUP_GROUP_ITEMS_PER_PAGE;
  const [page, setPage] = useState(1);

  const [editId, setEditId] = useState(null);
  const [name, setName] = useState("");
  const [availableExtensions, setAvailableExtensions] = useState([]);
  const [memberExtensions, setMemberExtensions] = useState([]);

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 5000);
  };

  const refreshPickupGroups = async () => {
    setLoading((prev) => ({ ...prev, list: true }));
    try {
      const res = await listPickupGroups();
      if (res?.response === false) {
        showMessage("error", res?.message || "Failed to list pickup groups.");
        setRows([]);
        return;
      }
      setRows(normalizePickupGroupList(res));
    } catch (err) {
      showMessage("error", err?.message || "Failed to list pickup groups.");
      setRows([]);
    } finally {
      setLoading((prev) => ({ ...prev, list: false }));
      setIsInitialLoad(false);
    }
  };

  useEffect(() => {
    refreshPickupGroups();
  }, []);

  const loadExtensions = async () => {
    setLoading((prev) => ({ ...prev, extensions: true }));
    try {
      const res = await listPickupGroupExtensions();
      if (res?.response === false) {
        showMessage("error", res?.message || "Failed to load extensions.");
        setAvailableExtensions([]);
        return;
      }
      setAvailableExtensions(mapPickupGroupExtensionsFromApi(res));
      hasLoadedExtensionsRef.current = true;
    } catch (err) {
      showMessage("error", err?.message || "Failed to load extensions.");
      setAvailableExtensions([]);
    } finally {
      setLoading((prev) => ({ ...prev, extensions: false }));
    }
  };

  const filteredRows = rows;

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / itemsPerPage));
  const pagedRows = filteredRows.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage,
  );

  useEffect(() => {
    setPage((current) =>
      Math.min(
        Math.max(1, current),
        Math.max(1, Math.ceil(filteredRows.length / itemsPerPage)),
      ),
    );
  }, [filteredRows.length]);

  const pageIndices = pagedRows.map(
    (_, idx) => (page - 1) * itemsPerPage + idx,
  );
  const allPageSelected =
    pageIndices.length > 0 && pageIndices.every((i) => selected.includes(i));
  const somePageSelected =
    pageIndices.some((i) => selected.includes(i)) && !allPageSelected;

  const handleToggleRow = (idx) =>
    setSelected((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx],
    );

  const handleToggleAll = () => {
    if (!pageIndices.length) return;
    setSelected((prev) =>
      allPageSelected
        ? prev.filter((i) => !pageIndices.includes(i))
        : Array.from(new Set([...prev, ...pageIndices])),
    );
  };

  const resetForm = () => {
    setEditId(null);
    setName("");
    setMemberExtensions([]);
  };

  const handleOpenAddModal = async () => {
    resetForm();
    setShowModal(true);
    if (!hasLoadedExtensionsRef.current) await loadExtensions();
  };

  const handleOpenEditModal = async (row) => {
    const formState = pickupGroupFormFromRow(row);
    setEditId(formState.editId);
    setName(formState.name);
    setMemberExtensions(formState.memberExtensions);
    setShowModal(true);
    if (!hasLoadedExtensionsRef.current) await loadExtensions();
  };

  const handleCloseModal = () => {
    if (loading.save) return;
    setShowModal(false);
    resetForm();
  };

  const handleDelete = () => {
    if (selected.length === 0)
      return showMessage("error", "Please select at least one row to delete.");
    if (
      !window.confirm(
        `Are you sure you want to delete ${selected.length} records?`,
      )
    )
      return;

    setLoading((prev) => ({ ...prev, delete: true }));
    (async () => {
      try {
        const toDelete = filteredRows.filter((_, idx) =>
          selected.includes(idx),
        );
        for (const row of toDelete) {
          if (row.id != null) {
            const res = await deletePickupGroup(row.id);
            if (res?.response === false) {
              showMessage(
                "error",
                res?.message || "Failed to delete pickup group.",
              );
              break;
            }
          }
        }
        setSelected([]);
        await refreshPickupGroups();
        showMessage("success", "Pickup Group(s) deleted successfully.");
      } catch (err) {
        showMessage(
          "error",
          err?.message || "Failed to delete pickup group(s).",
        );
      } finally {
        setLoading((prev) => ({ ...prev, delete: false }));
      }
    })();
  };

  const handleSave = () => {
    const validationError = validatePickupGroupForm({ name, memberExtensions });
    if (validationError) return showMessage("error", validationError);

    const trimmed = name.trim();
    const members = memberExtensions.map(String);

    setLoading((prev) => ({ ...prev, save: true }));
    (async () => {
      try {
        if (editId != null) {
          const res = await updatePickupGroup(
            editId,
            buildPickupGroupUpdatePayload({ name: trimmed, memberExtensions }),
          );
          if (res?.response === false)
            return showMessage(
              "error",
              res?.message || "Failed to update pickup group.",
            );
          await refreshPickupGroups();
          showMessage("success", "Pickup group updated successfully.");
        } else {
          const res = await createPickupGroup(trimmed, members);
          if (res?.response === false)
            return showMessage(
              "error",
              res?.message || "Failed to create pickup group.",
            );
          setRows(normalizePickupGroupList(res));
          showMessage("success", "Pickup group created successfully.");
        }
        handleCloseModal();
      } catch (err) {
        showMessage("error", err?.message || "Failed to save pickup group.");
      } finally {
        setLoading((prev) => ({ ...prev, save: false }));
      }
    })();
  };

  const getExtLabel = (ext) => {
    const found = availableExtensions.find((e) => e.value === ext);
    return found?.label || ext;
  };

  const allExtensionOptions = useMemo(
    () => availableExtensions.map(({ value, label }) => ({ value, label })),
    [availableExtensions],
  );

  const availableMemberEmptyText = loading.extensions
    ? "Loading..."
    : "No extension";

  return {
    isCompact,
    rows,
    selected,
    showModal,
    loading,
    message,
    setMessage,
    isInitialLoad,
    itemsPerPage,
    page,
    setPage,
    totalPages,
    pagedRows,
    filteredRows,
    editId,
    name,
    setName,
    memberExtensions,
    setMemberExtensions,
    allExtensionOptions,
    getExtLabel,
    availableMemberEmptyText,
    allPageSelected,
    somePageSelected,
    handleToggleRow,
    handleToggleAll,
    handleDelete,
    handleOpenAddModal,
    handleOpenEditModal,
    handleCloseModal,
    handleSave,
  };
}
