import { useEffect, useState } from "react";
import {
  listFinalNumberFilter,
  createFinalNumberFilter,
  deleteFinalNumberFilter,
  fetchAllNumberFilters,
  listNumberPool,
} from "../../../../api/apiService";
import {
  FILTERING_RULE_INITIAL_FORM,
  FILTERING_RULE_EMPTY_GROUP_OPTIONS,
  mapFilteringRuleApiToRows,
  buildFilteringRulePayload,
  mapFilteringRuleGroupOptions,
} from "../utils/FilteringRuleTransformers";

export function useFilteringRulePage() {
  const [rows, setRows] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [form, setForm] = useState(FILTERING_RULE_INITIAL_FORM);
  const [groupOptions, setGroupOptions] = useState(
    FILTERING_RULE_EMPTY_GROUP_OPTIONS,
  );
  const [toast, setToast] = useState({ msg: "", type: "success" });
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  const displayToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "success" }), 3500);
  };

  const alert = (msg) => {
    const isErr =
      /error|failed|required|please/i.test(msg) && !/successfully/i.test(msg);
    displayToast(msg, isErr ? "error" : "success");
  };

  const openModal = (rowIdx = null) => {
    setEditIndex(rowIdx);
    if (rowIdx !== null) {
      setForm(rows[rowIdx]);
    } else {
      setForm(FILTERING_RULE_INITIAL_FORM);
    }
    setModalOpen(true);
  };

  const loadGroupOptions = async () => {
    try {
      const [filtersRes, poolRes] = await Promise.all([
        fetchAllNumberFilters().catch(() => ({ success: false, data: [] })),
        listNumberPool().catch(() => ({})),
      ]);

      setGroupOptions(mapFilteringRuleGroupOptions(filtersRes, poolRes));
    } catch (e) {
      setGroupOptions(FILTERING_RULE_EMPTY_GROUP_OPTIONS);
    }
  };

  useEffect(() => {
    loadGroupOptions();
  }, []);

  const closeModal = () => {
    setModalOpen(false);
    setEditIndex(null);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    const payload = buildFilteringRulePayload(form);
    try {
      setIsLoading(true);
      await createFinalNumberFilter(payload);
      await loadRows();
      displayToast("Filtering rule saved successfully.", "success");
      closeModal();
    } catch (e) {
      console.error("Failed to save filtering rule", e);
      displayToast("Failed to save filtering rule.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheck = (idx) => {
    setRows((prev) =>
      prev.map((row, i) =>
        i === idx ? { ...row, checked: !row.checked } : row,
      ),
    );
  };

  const allRowsChecked = rows.length > 0 && rows.every((r) => r.checked);
  const someRowsChecked = rows.some((r) => r.checked) && !allRowsChecked;

  const handleCheckAll = () => {
    const selectAll = !allRowsChecked;
    setRows((prev) => prev.map((row) => ({ ...row, checked: selectAll })));
  };

  const handleDelete = async () => {
    const toDelete = rows.filter((r) => r.checked).map((r) => r.id);
    if (toDelete.length === 0) return;
    const confirmed = window.confirm(
      `Are you sure you want to delete ${toDelete.length} selected item(s)?`,
    );
    if (!confirmed) return;
    setIsDeleting(true);
    try {
      for (const id of toDelete) {
        await deleteFinalNumberFilter(id);
      }
      await loadRows();
      displayToast(
        `Deleted ${toDelete.length} item(s) successfully.`,
        "success",
      );
    } catch (e) {
      console.error("Delete filtering rule failed", e);
      displayToast("Delete failed. Please try again.", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleClearAll = async () => {
    if (rows.length === 0) return;
    const confirmed = window.confirm(
      `Are you sure you want to delete ALL ${rows.length} item(s)?`,
    );
    if (!confirmed) return;
    setIsDeleting(true);
    try {
      const ids = rows.map((r) => r.id).filter(Boolean);
      for (const id of ids) {
        await deleteFinalNumberFilter(id);
      }
      await loadRows();
      displayToast(
        `Cleared all ${ids.length} item(s) successfully.`,
        "success",
      );
    } catch (e) {
      console.error("Clear all filtering rules failed", e);
      displayToast("Clear all failed.", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  const loadRows = async () => {
    try {
      const res = await listFinalNumberFilter();
      if (res?.response && Array.isArray(res.message)) {
        setRows(mapFilteringRuleApiToRows(res.message));
      } else {
        setRows([]);
      }
    } catch (e) {
      console.error("Failed to load filtering rules", e);
      setRows([]);
    } finally {
      setIsInitialLoad(false);
    }
  };

  useEffect(() => {
    loadRows();
  }, []);

  return {
    rows,
    modalOpen,
    editIndex,
    form,
    groupOptions,
    toast,
    setToast,
    isLoading,
    isInitialLoad,
    isDeleting,
    allRowsChecked,
    someRowsChecked,
    openModal,
    closeModal,
    handleFormChange,
    handleSave,
    handleCheck,
    handleCheckAll,
    handleDelete,
    handleClearAll,
    alert,
  };
}
