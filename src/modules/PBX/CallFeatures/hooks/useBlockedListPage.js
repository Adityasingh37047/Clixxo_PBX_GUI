import { useEffect, useRef, useState } from "react";
import { useMediaQuery } from "@mui/material";
import {
  BLOCKED_LIST_DEFAULT_DIRECTION,
  BLOCKED_LIST_DEFAULT_ENABLED,
  BLOCKED_LIST_DEFAULT_MATCH_MODE,
} from "../../../../constants/BlockedListConstants";
import {
  createBlockedEntry,
  deleteBlockedEntry,
  fetchBlockedList,
  listConferenceExtensions,
  updateBlockedEntry,
} from "../../../../api/apiService";
import {
  blockedListFormFromRow,
  buildBlockedListApiPayload,
  mapBlockedListFromApi,
  mapConferenceExtensionsFromApi,
  normalizeBlockedListList,
} from "../utils/BlockedListTransformers";
import { validateBlockedListForm } from "../utils/BlockedListValidators";

const BLOCKED_LIST_COMPACT_MQ = "(max-width: 768px)";

export function useBlockedListPage() {
  const isCompact = useMediaQuery(BLOCKED_LIST_COMPACT_MQ);
  const [rows, setRows] = useState([]);
  const [selected, setSelected] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState({
    fetch: false,
    delete: false,
    save: false,
  });
  const [error, setError] = useState({ type: "", text: "" });
  const hasInitialLoadRef = useRef(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const itemsPerPage = 20;
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);

  const [editId, setEditId] = useState(null);
  const [name, setName] = useState("");
  const [matchMode, setMatchMode] = useState(BLOCKED_LIST_DEFAULT_MATCH_MODE);
  const [blockedNumber, setBlockedNumber] = useState("");
  const [selectedExtension, setSelectedExtension] = useState("");
  const [direction, setDirection] = useState(BLOCKED_LIST_DEFAULT_DIRECTION);
  const [enabled, setEnabled] = useState(BLOCKED_LIST_DEFAULT_ENABLED);
  const [availableExtensions, setAvailableExtensions] = useState([]);

  const showAlert = (type, text) => {
    setError({ type, text });
    setTimeout(() => setError({ type: "", text: "" }), 5000);
  };

  const loadRows = async () => {
    setLoading((prev) => ({ ...prev, fetch: true }));
    try {
      const res = await fetchBlockedList();
      const list = normalizeBlockedListList(res);
      setRows(list.map(mapBlockedListFromApi));
    } catch (err) {
      showAlert("error", err?.message || "Failed to load blocked list.");
    } finally {
      setLoading((prev) => ({ ...prev, fetch: false }));
      setIsInitialLoad(false);
    }
  };

  const loadAvailableExtensions = async () => {
    try {
      const extRes = await listConferenceExtensions();
      setAvailableExtensions(mapConferenceExtensionsFromApi(extRes));
    } catch (err) {
      console.error("Failed to load extensions for blocked list:", err);
      setAvailableExtensions([]);
    }
  };

  useEffect(() => {
    if (!hasInitialLoadRef.current) {
      hasInitialLoadRef.current = true;
      loadRows();
      loadAvailableExtensions();
    }
  }, []);

  const filteredRows = searchQuery.trim()
    ? rows.filter((r) =>
        [r.name, r.blockedNumber, r.matchMode].some((v) =>
          String(v || "")
            .toLowerCase()
            .includes(searchQuery.toLowerCase()),
        ),
      )
    : rows;

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

  const handleToggleRow = (idx) => {
    setSelected((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx],
    );
  };

  const handleToggleAll = () => {
    if (!pageIndices.length) return;
    setSelected((prev) =>
      allPageSelected
        ? prev.filter((i) => !pageIndices.includes(i))
        : Array.from(new Set([...prev, ...pageIndices])),
    );
  };

  const handleDelete = async () => {
    if (selected.length === 0) {
      showAlert("error", "Please select at least one row to delete.");
      return;
    }
    if (
      !window.confirm(
        `Are you sure you want to delete ${selected.length} records?`,
      )
    )
      return;

    setLoading((prev) => ({ ...prev, delete: true }));
    try {
      const ids = selected.map((i) => filteredRows[i]?.id).filter(Boolean);
      await Promise.all(ids.map((id) => deleteBlockedEntry(id)));
      setSelected([]);
      setPage(1);
      await loadRows();
      showAlert("success", `Deleted ${ids.length} item(s).`);
    } catch (err) {
      showAlert("error", err?.message || "Failed to delete.");
    } finally {
      setLoading((prev) => ({ ...prev, delete: false }));
    }
  };

  const resetForm = () => {
    setEditId(null);
    setName("");
    setMatchMode(BLOCKED_LIST_DEFAULT_MATCH_MODE);
    setBlockedNumber("");
    setSelectedExtension("");
    setDirection(BLOCKED_LIST_DEFAULT_DIRECTION);
    setEnabled(BLOCKED_LIST_DEFAULT_ENABLED);
  };

  const handleOpenAddModal = () => {
    resetForm();
    setShowModal(true);
  };

  const handleOpenEditModal = (row) => {
    const formState = blockedListFormFromRow(row);
    setEditId(formState.editId);
    setName(formState.name);
    setMatchMode(formState.matchMode || BLOCKED_LIST_DEFAULT_MATCH_MODE);
    setBlockedNumber(formState.blockedNumber);
    setSelectedExtension(formState.selectedExtension);
    setDirection(formState.direction || BLOCKED_LIST_DEFAULT_DIRECTION);
    setEnabled(formState.enabled || BLOCKED_LIST_DEFAULT_ENABLED);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    if (loading.save) return;
    setShowModal(false);
    resetForm();
  };

  const handleSave = async () => {
    const validationError = validateBlockedListForm({
      name,
      matchMode,
      blockedNumber,
      selectedExtension,
    });
    if (validationError) {
      showAlert("error", validationError);
      return;
    }

    const apiPayload = buildBlockedListApiPayload({
      name,
      matchMode,
      blockedNumber,
      selectedExtension,
      direction,
      enabled,
    });

    setLoading((prev) => ({ ...prev, save: true }));
    try {
      if (editId != null) {
        await updateBlockedEntry({ id: editId, ...apiPayload });
        showAlert("success", "Blocked entry updated.");
      } else {
        await createBlockedEntry(apiPayload);
        showAlert("success", "Blocked entry created.");
      }
      await loadRows();
      handleCloseModal();
    } catch (err) {
      showAlert("error", err?.message || "Failed to save.");
    } finally {
      setLoading((prev) => ({ ...prev, save: false }));
    }
  };

  return {
    isCompact,
    rows,
    selected,
    showModal,
    loading,
    error,
    setError,
    isInitialLoad,
    itemsPerPage,
    page,
    setPage,
    searchQuery,
    setSearchQuery,
    searchFocused,
    setSearchFocused,
    totalPages,
    pagedRows,
    filteredRows,
    editId,
    name,
    setName,
    matchMode,
    setMatchMode,
    blockedNumber,
    setBlockedNumber,
    selectedExtension,
    setSelectedExtension,
    direction,
    setDirection,
    enabled,
    setEnabled,
    availableExtensions,
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
