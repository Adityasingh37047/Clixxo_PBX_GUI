import { useEffect, useMemo, useRef, useState } from "react";
import { useMediaQuery } from "@mui/material";
import {
  createOutboundRestriction,
  deleteOutboundRestriction,
  listIvrDestinations,
  listOutboundRestrictions,
  listOutboundRouteExtensions,
  updateOutboundRestriction,
} from "../../../../api/apiService";
import {
  buildOutboundRestrictionApiPayload,
  mapDestinationExtensionsFromApi,
  mapOutboundRouteExtensionsFromApi,
  mapRestrictionFromApi,
  normalizeOutboundRestrictionList,
} from "../utils/OutboundRestrictionsTransformers";
import { validateOutboundRestrictionForm } from "../utils/OutboundRestrictionsValidators";

const OUTBOUND_RESTRICTION_COMPACT_MQ = "(max-width: 768px)";

export function useOutboundRestrictionsPage() {
  const isCompact = useMediaQuery(OUTBOUND_RESTRICTION_COMPACT_MQ);
  const [rows, setRows] = useState([]);
  const [selected, setSelected] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState({
    list: false,
    save: false,
    delete: false,
    extensions: false,
  });
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const hasLoadedExtensionsRef = useRef(false);

  const [editId, setEditId] = useState(null);
  const [name, setName] = useState("");
  const [timeLimit, setTimeLimit] = useState("");
  const [callsLimit, setCallsLimit] = useState("");
  const [autoCancelRestriction, setAutoCancelRestriction] = useState("No");
  const [enabled, setEnabled] = useState("Yes");
  const [availableExtensions, setAvailableExtensions] = useState([]);
  const [memberExtensions, setMemberExtensions] = useState([]);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);

  const itemsPerPage = 20;
  const [page, setPage] = useState(1);

  const [message, setMessage] = useState({ type: "", text: "" });
  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 5000);
  };
  const showAlert = (text) => showMessage("error", text);

  const filteredRows = useMemo(() => {
    if (!searchQuery.trim()) return rows;
    const q = searchQuery.toLowerCase();
    return rows.filter((row) => {
      const extStr = (row.memberExtensions || []).join(" ").toLowerCase();
      return (
        (row.name || "").toLowerCase().includes(q) ||
        (row.timeLimit || "").toLowerCase().includes(q) ||
        (row.callsLimit || "").toLowerCase().includes(q) ||
        (row.autoCancelRestriction || "").toLowerCase().includes(q) ||
        (row.enabled || "").toLowerCase().includes(q) ||
        extStr.includes(q)
      );
    });
  }, [rows, searchQuery]);

  const loadDestinations = async () => {
    try {
      const data = await listIvrDestinations();
      setAvailableExtensions(mapDestinationExtensionsFromApi(data));
    } catch (err) {
      console.error(err);
    }
  };

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

  const fetchRestrictions = async () => {
    setLoading((prev) => ({ ...prev, list: true }));
    try {
      const res = await listOutboundRestrictions();
      if (!res?.response) {
        showAlert(res?.message || "Failed to load outbound restrictions.");
        setRows([]);
        return;
      }
      setRows(normalizeOutboundRestrictionList(res).map(mapRestrictionFromApi));
    } catch (err) {
      showAlert(err?.message || "Failed to load outbound restrictions.");
      setRows([]);
    } finally {
      setLoading((prev) => ({ ...prev, list: false }));
      setIsInitialLoad(false);
    }
  };

  const loadExtensions = async () => {
    setLoading((prev) => ({ ...prev, extensions: true }));
    try {
      const res = await listOutboundRouteExtensions();
      setAvailableExtensions(mapOutboundRouteExtensionsFromApi(res));
      hasLoadedExtensionsRef.current = true;
    } catch (err) {
      showAlert(err?.message || "Failed to load extensions.");
      setAvailableExtensions([]);
    } finally {
      setLoading((prev) => ({ ...prev, extensions: false }));
    }
  };

  useEffect(() => {
    fetchRestrictions();
    loadDestinations();
  }, []);

  const extensionLabelMap = useMemo(() => {
    const map = new Map();
    availableExtensions.forEach((item) =>
      map.set(item.extension, item.label || item.extension),
    );
    return map;
  }, [availableExtensions]);

  const getExtensionLabel = (ext) => extensionLabelMap.get(ext) || ext;

  const allExtensionOptions = useMemo(
    () =>
      availableExtensions.map(({ extension, label }) => ({
        value: extension,
        label: label || extension,
      })),
    [availableExtensions],
  );

  const resetForm = () => {
    setEditId(null);
    setName("");
    setTimeLimit("");
    setCallsLimit("");
    setAutoCancelRestriction("No");
    setEnabled("Yes");
    setMemberExtensions([]);
  };

  const handleOpenAddModal = async () => {
    resetForm();
    setShowModal(true);
    // if (!hasLoadedExtensionsRef.current) await loadExtensions();
  };

  const handleOpenEditModal = async (row) => {
    setEditId(row.id);
    setName(row.name || "");
    setTimeLimit(row.timeLimit || "");
    setCallsLimit(row.callsLimit || "");
    setAutoCancelRestriction(row.autoCancelRestriction || "No");
    setEnabled(row.enabled || "Yes");
    setMemberExtensions(
      Array.isArray(row.memberExtensions) ? row.memberExtensions : [],
    );
    setShowModal(true);
    // if (!hasLoadedExtensionsRef.current) await loadExtensions();
  };

  const handleCloseModal = () => {
    if (loading.save) return;
    setShowModal(false);
    resetForm();
  };

  const handleSelectRow = (idx) => {
    setSelected((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx],
    );
  };

  const pageIndices = pagedRows.map((_, i) => (page - 1) * itemsPerPage + i);
  const allPageSelected =
    pageIndices.length > 0 && pageIndices.every((i) => selected.includes(i));
  const somePageSelected =
    pageIndices.some((i) => selected.includes(i)) && !allPageSelected;

  const handleToggleAll = () => {
    if (allPageSelected) {
      setSelected((prev) => prev.filter((i) => !pageIndices.includes(i)));
    } else {
      setSelected((prev) => Array.from(new Set([...prev, ...pageIndices])));
    }
  };

  const handleDelete = async () => {
    if (selected.length === 0) {
      showAlert("Please select at least one row to delete.");
      return;
    }
    if (
      !window.confirm(
        `Are you sure you want to delete ${selected.length} record(s)?`,
      )
    ) {
      return;
    }
    setLoading((prev) => ({ ...prev, delete: true }));
    try {
      const idsToDelete = selected
        .map((idx) => filteredRows[idx]?.id)
        .filter((id) => id != null);
      const results = await Promise.all(
        idsToDelete.map((id) => deleteOutboundRestriction(id)),
      );
      const failed = results.find((res) => !res?.response);
      if (failed) {
        showAlert(failed?.message || "Failed to delete one or more records.");
      } else {
        showMessage("success", "Outbound restriction(s) deleted successfully.");
      }
      await fetchRestrictions();
      setSelected([]);
      setPage(1);
    } catch (err) {
      showAlert(err?.message || "Failed to delete record(s).");
    } finally {
      setLoading((prev) => ({ ...prev, delete: false }));
    }
  };

  const handleSave = async () => {
    const validationError = validateOutboundRestrictionForm({
      name,
      memberExtensions,
    });
    if (validationError) {
      showAlert(validationError);
      return;
    }

    const apiPayload = buildOutboundRestrictionApiPayload({
      name,
      timeLimit,
      callsLimit,
      autoCancelRestriction,
      memberExtensions,
      enabled,
    });

    setLoading((prev) => ({ ...prev, save: true }));
    try {
      const response =
        editId != null
          ? await updateOutboundRestriction(editId, apiPayload)
          : await createOutboundRestriction(apiPayload);
      if (!response?.response) {
        showAlert(response?.message || "Failed to save outbound restriction.");
        return;
      }
      showMessage(
        "success",
        editId != null
          ? "Outbound restriction updated successfully."
          : "Outbound restriction created successfully.",
      );
      await fetchRestrictions();
      handleCloseModal();
    } catch (err) {
      showAlert(err?.message || "Failed to save outbound restriction.");
    } finally {
      setLoading((prev) => ({ ...prev, save: false }));
    }
  };

  const dataEmpty = !isInitialLoad && rows.length === 0;
  const searchEmpty =
    !isInitialLoad && rows.length > 0 && filteredRows.length === 0;

  return {
    isCompact,
    rows,
    selected,
    showModal,
    loading,
    isInitialLoad,
    editId,
    name,
    setName,
    timeLimit,
    setTimeLimit,
    callsLimit,
    setCallsLimit,
    autoCancelRestriction,
    setAutoCancelRestriction,
    enabled,
    setEnabled,
    memberExtensions,
    setMemberExtensions,
    searchQuery,
    setSearchQuery,
    searchFocused,
    setSearchFocused,
    itemsPerPage,
    page,
    setPage,
    totalPages,
    pagedRows,
    filteredRows,
    message,
    setMessage,
    allExtensionOptions,
    allPageSelected,
    somePageSelected,
    getExtensionLabel,
    handleOpenAddModal,
    handleOpenEditModal,
    handleCloseModal,
    handleSelectRow,
    handleToggleAll,
    handleDelete,
    handleSave,
    dataEmpty,
    searchEmpty,
  };
}
