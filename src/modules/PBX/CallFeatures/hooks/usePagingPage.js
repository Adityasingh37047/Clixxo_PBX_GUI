import { useEffect, useMemo, useRef, useState } from "react";
import { useMediaQuery } from "@mui/material";
import { PAGING_ITEMS_PER_PAGE } from "../../../../constants/PagingConstants";
import {
  createPagingGroup,
  deletePagingGroup,
  fetchSipAccounts,
  listPagingGroups,
  updatePagingGroup,
} from "../../../../api/apiService";
import {
  buildPagingSavePayload,
  mapPagingExtensionsFromApi,
  normalizePagingList,
  pagingFormFromRow,
} from "../utils/PagingTransformers";
import { validatePagingForm } from "../utils/PagingValidators";
import { getApiErrorMessage, cleanErrorText } from "../../../../utils/getApiErrorMessage";

const PAGING_COMPACT_MQ = "(max-width: 768px)";

export function usePagingPage() {
  const isCompact = useMediaQuery(PAGING_COMPACT_MQ);
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

  const itemsPerPage = PAGING_ITEMS_PER_PAGE;
  const [page, setPage] = useState(1);

  const [editId, setEditId] = useState(null);
  const [name, setName] = useState("");
  const [number, setNumber] = useState("");
  const [pagingType, setPagingType] = useState("one-way");
  const [callerIdNamePrefix, setCallerIdNamePrefix] = useState("");
  const [availableExtensions, setAvailableExtensions] = useState([]);
  const [memberExtensions, setMemberExtensions] = useState([]);

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 5000);
  };

  const refreshPagingGroups = async () => {
    setLoading((prev) => ({ ...prev, list: true }));
    try {
      const res = await listPagingGroups();
      if (res?.response === false) {
        showMessage("error", res?.message || "Failed to load paging groups.");
        setRows([]);
        return;
      }
      setRows(normalizePagingList(res));
    } catch (err) {
      showMessage("error", err?.message || "Failed to load paging groups.");
      setRows([]);
    } finally {
      setLoading((prev) => ({ ...prev, list: false }));
      setIsInitialLoad(false);
    }
  };

  useEffect(() => {
    refreshPagingGroups();
  }, []);

  const loadExtensions = async () => {
    setLoading((prev) => ({ ...prev, extensions: true }));
    try {
      const res = await fetchSipAccounts();
      if (res?.response === false) {
        showMessage("error", res?.message || "Failed to load extensions.");
        setAvailableExtensions([]);
        return;
      }
      setAvailableExtensions(mapPagingExtensionsFromApi(res));
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
    setNumber("");
    setPagingType("one-way");
    setCallerIdNamePrefix("");
    setMemberExtensions([]);
  };

  const handleOpenAddModal = async () => {
    resetForm();
    setShowModal(true);
    if (!hasLoadedExtensionsRef.current) await loadExtensions();
  };

  const handleOpenEditModal = async (row) => {
    const formState = pagingFormFromRow(row);
    setEditId(formState.editId);
    setName(formState.name);
    setNumber(formState.number);
    setPagingType(formState.pagingType);
    setCallerIdNamePrefix(formState.callerIdNamePrefix);
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
            const res = await deletePagingGroup(row.id);
            if (res?.response === false) {
              showMessage(
                "error",
                res?.message || "Failed to delete paging group.",
              );
              break;
            }
          }
        }
        setSelected([]);
        await refreshPagingGroups();
        showMessage("success", "Paging Group(s) deleted successfully.");
      } catch (err) {
        showMessage(
          "error",
          err?.message || "Failed to delete paging group(s).",
        );
      } finally {
        setLoading((prev) => ({ ...prev, delete: false }));
      }
    })();
  };

  const handleSave = () => {
    const validationError = validatePagingForm({
      name,
      number,
      memberExtensions,
    });
    if (validationError) return showMessage("error", validationError);

    setLoading((prev) => ({ ...prev, save: true }));
    (async () => {
      try {
        const payload = buildPagingSavePayload({
          name,
          number,
          pagingType,
          callerIdNamePrefix,
          memberExtensions,
        });
        if (editId != null) {
          const res = await updatePagingGroup(editId, payload);
          if (res?.response === false)
            return showMessage(
              "error",
              cleanErrorText(res?.message, "Failed to update paging group."),
            );
          showMessage("success", "Paging group updated successfully.");
        } else {
          const res = await createPagingGroup(payload);
          if (res?.response === false)
            return showMessage(
              "error",
              cleanErrorText(res?.message, "Failed to create paging group."),
            );
          showMessage("success", "Paging group created successfully.");
        }
        await refreshPagingGroups();
        handleCloseModal();
      } catch (err) {
        showMessage("error", getApiErrorMessage(err, "Failed to save paging group."));
      } finally {
        setLoading((prev) => ({ ...prev, save: false }));
      }
    })();
  };

  const allExtensionOptions = useMemo(
    () =>
      availableExtensions.map(({ value, label }) => ({
        value,
        label: label || value,
      })),
    [availableExtensions],
  );

  const extensionLabelMap = useMemo(() => {
    const map = new Map();
    allExtensionOptions.forEach((e) => map.set(e.value, e.label));
    return map;
  }, [allExtensionOptions]);

  const getExtLabel = (ext) => extensionLabelMap.get(ext) || ext;

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
    number,
    setNumber,
    pagingType,
    setPagingType,
    callerIdNamePrefix,
    setCallerIdNamePrefix,
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
