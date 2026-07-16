import { useEffect, useRef, useState } from "react";
import { useMediaQuery } from "@mui/material";
import { CALL_BACK_DEFAULT_DELAY } from "../../../../constants/CallBackConstants";
import {
  createCallbackRule,
  deleteCallbackRule,
  fetchCallbackRules,
  fetchSipAccounts,
  listTrunkIds,
  updateCallbackRule,
} from "../../../../api/apiService";
import {
  buildCallBackApiPayload,
  callBackFormFromRow,
  mapCallBackFromApi,
  mapSipExtensionsFromApi,
  mapTrunkIdsFromApi,
  normalizeCallBackList,
} from "../utils/CallBackTransformers";
import { validateCallBackForm } from "../utils/CallBackValidators";

const CALL_BACK_COMPACT_MQ = "(max-width: 768px)";

export function useCallBackPage() {
  const isCompact = useMediaQuery(CALL_BACK_COMPACT_MQ);
  const [rows, setRows] = useState([]);
  const [selected, setSelected] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState({
    fetch: false,
    delete: false,
    save: false,
    extensions: false,
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
  const [delay, setDelay] = useState(CALL_BACK_DEFAULT_DELAY);
  const [strip, setStrip] = useState("");
  const [prepend, setPrepend] = useState("");
  const [destination, setDestination] = useState("");
  const [, setThroughAuto] = useState(true);
  const [throughFromComeIn, setThroughFromComeIn] = useState(false);
  const [throughSelect, setThroughSelect] = useState(false);
  const [extensionOptions, setExtensionOptions] = useState([]);
  const [trunkOptions, setTrunkOptions] = useState([]);

  const showAlert = (type, text) => {
    setError({ type, text });
    setTimeout(() => setError({ type: "", text: "" }), 5000);
  };

  const loadRows = async () => {
    setLoading((prev) => ({ ...prev, fetch: true }));
    try {
      const res = await fetchCallbackRules();
      const list = normalizeCallBackList(res);
      setRows(list.map(mapCallBackFromApi));
    } catch (err) {
      showAlert("error", err?.message || "Failed to load callbacks.");
    } finally {
      setLoading((prev) => ({ ...prev, fetch: false }));
      setIsInitialLoad(false);
    }
  };

  const loadExtensions = async () => {
    setLoading((prev) => ({ ...prev, extensions: true }));
    try {
      const res = await fetchSipAccounts();
      setExtensionOptions(mapSipExtensionsFromApi(res));
    } catch (err) {
      showAlert("error", err?.message || "Failed to load extensions.");
      setExtensionOptions([]);
    } finally {
      setLoading((prev) => ({ ...prev, extensions: false }));
    }
  };

  const loadTrunks = async () => {
    try {
      const res = await listTrunkIds();
      setTrunkOptions(mapTrunkIdsFromApi(res));
    } catch (err) {
      console.error("Failed to load trunk IDs for callback:", err);
      setTrunkOptions([]);
    }
  };

  useEffect(() => {
    if (!hasInitialLoadRef.current) {
      hasInitialLoadRef.current = true;
      loadRows();
    }
  }, []);

  const filteredRows = searchQuery.trim()
    ? rows.filter((r) =>
        [r.name, r.destination, r.delay].some((v) =>
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
      await Promise.all(ids.map((id) => deleteCallbackRule(id)));
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
    setDelay(CALL_BACK_DEFAULT_DELAY);
    setStrip("");
    setPrepend("");
    setDestination("");
    setThroughAuto(true);
    setThroughFromComeIn(false);
    setThroughSelect(false);
  };

  const handleOpenAddModal = async () => {
    resetForm();
    setShowModal(true);
    await Promise.all([loadExtensions(), loadTrunks()]);
  };

  const handleOpenEditModal = async (row) => {
    const formState = callBackFormFromRow(row);
    setEditId(formState.editId);
    setName(formState.name);
    setDelay(formState.delay);
    setStrip(formState.strip);
    setPrepend(formState.prepend);
    setDestination(formState.destination);
    setThroughAuto(formState.throughAuto);
    setThroughFromComeIn(formState.throughFromComeIn);
    setThroughSelect(formState.throughSelect);
    setShowModal(true);
    await Promise.all([loadExtensions(), loadTrunks()]);
  };

  const handleCloseModal = () => {
    if (loading.save) return;
    setShowModal(false);
    resetForm();
  };

  const handleSave = async () => {
    const validationError = validateCallBackForm({ name, delay, destination });
    if (validationError) {
      showAlert("error", validationError);
      return;
    }

    const apiPayload = buildCallBackApiPayload({
      name,
      delay,
      strip,
      prepend,
      destination,
      throughSelect,
      throughFromComeIn,
    });

    setLoading((prev) => ({ ...prev, save: true }));
    try {
      if (editId != null) {
        await updateCallbackRule({ id: editId, ...apiPayload });
        showAlert("success", "Callback updated.");
      } else {
        await createCallbackRule(apiPayload);
        showAlert("success", "Callback created.");
      }
      await loadRows();
      handleCloseModal();
    } catch (err) {
      showAlert("error", err?.message || "Failed to save.");
    } finally {
      setLoading((prev) => ({ ...prev, save: false }));
    }
  };

  const handleThroughChange = (val) => {
    setThroughAuto(val === "auto");
    setThroughFromComeIn(val === "from_in");
    setThroughSelect(val === "select");
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
    delay,
    setDelay,
    strip,
    setStrip,
    prepend,
    setPrepend,
    destination,
    setDestination,
    throughFromComeIn,
    throughSelect,
    extensionOptions,
    trunkOptions,
    allPageSelected,
    somePageSelected,
    handleToggleRow,
    handleToggleAll,
    handleDelete,
    handleOpenAddModal,
    handleOpenEditModal,
    handleCloseModal,
    handleSave,
    handleThroughChange,
  };
}
