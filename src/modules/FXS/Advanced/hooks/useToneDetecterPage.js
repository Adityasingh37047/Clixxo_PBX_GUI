import { useEffect, useState } from "react";
import {
  TONE_DETECTER_INITIAL_FORM,
  TONE_DETECTER_ITEMS_PER_PAGE,
} from "../../../../constants/ToneDetecterConstants";
import {
  LOCAL_STORAGE_KEY,
  applyToneChange,
  buildToneDetecterRule,
  formFromItem,
  newFormForAdd,
  parseStoredRules,
} from "../utils/ToneDetecterTransformers";
import { validateToneDetecterForm } from "../utils/ToneDetecterValidators";

export function useToneDetecterPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState(TONE_DETECTER_INITIAL_FORM);
  const [rules, setRules] = useState([]);
  const [selected, setSelected] = useState([]);
  const [page, setPage] = useState(1);
  const itemsPerPage = TONE_DETECTER_ITEMS_PER_PAGE;
  const totalPages = Math.max(1, Math.ceil(rules.length / itemsPerPage));
  const pagedRules = rules.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage,
  );
  const [loading, setLoading] = useState({
    fetch: false,
    save: false,
    delete: false,
  });
  const [editIndex, setEditIndex] = useState(null);
  const [toast, setToast] = useState({ msg: "", type: "success" });

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "success" }), 3500);
  };

  const clearToast = () => setToast({ msg: "", type: "success" });

  useEffect(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        setRules(parseStoredRules(stored));
      }
    } catch (error) {
      console.error("Error loading tone detector data:", error);
      setRules([]);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(rules));
    } catch (error) {
      console.error("Error saving tone detector data:", error);
    }
  }, [rules]);

  const handleOpenModal = (item = null, index = -1) => {
    if (item) {
      setFormData(formFromItem(item));
      setEditIndex(index);
    } else {
      setFormData(newFormForAdd(rules));
      setEditIndex(null);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => setIsModalOpen(false);

  const handleSave = () => {
    const validationError = validateToneDetecterForm(formData);
    if (validationError) {
      showToast(validationError, "error");
      return;
    }

    const normalized = buildToneDetecterRule(formData, editIndex, rules);

    setLoading((prev) => ({ ...prev, save: true }));
    try {
      if (editIndex !== null) {
        setRules((prev) =>
          prev.map((rule, idx) => (idx === editIndex ? normalized : rule)),
        );
        showToast("Tone parameter updated successfully!");
      } else {
        setRules((prev) => [...prev, normalized]);
        showToast("Tone parameter created successfully!");
      }

      handleCloseModal();
    } catch (error) {
      console.error("Error saving tone parameter:", error);
      showToast(error.message || "Failed to save tone parameter", "error");
    } finally {
      setLoading((prev) => ({ ...prev, save: false }));
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "tone") {
      setFormData((prev) => applyToneChange(prev, value));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handlePageChange = (newPage) => {
    setPage(Math.max(1, Math.min(totalPages, newPage)));
    setSelected([]);
  };

  const handleSelectRow = (idx) => {
    const realIdx = (page - 1) * itemsPerPage + idx;
    setSelected((sel) =>
      sel.includes(realIdx)
        ? sel.filter((i) => i !== realIdx)
        : [...sel, realIdx],
    );
  };

  const handleCheckAll = () => {
    const allIndices = pagedRules.map(
      (_, idx) => (page - 1) * itemsPerPage + idx,
    );
    setSelected(allIndices);
  };

  const handleUncheckAll = () => setSelected([]);

  const handleInverse = () =>
    setSelected(
      pagedRules
        .map((_, idx) => (page - 1) * itemsPerPage + idx)
        .filter((i) => !selected.includes(i)),
    );

  const handleDelete = () => {
    if (selected.length === 0) {
      showToast("Please select at least one item to delete.", "error");
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete ${selected.length} selected item(s)?`,
    );
    if (!confirmed) return;

    setLoading((prev) => ({ ...prev, delete: true }));
    try {
      setRules((prev) => prev.filter((_, idx) => !selected.includes(idx)));
      setSelected([]);
      showToast(`${selected.length} item(s) deleted successfully`);
    } catch (error) {
      console.error("Error deleting selected items:", error);
      showToast(error.message || "Failed to delete selected items", "error");
    } finally {
      setLoading((prev) => ({ ...prev, delete: false }));
    }
  };

  const handleClearAll = () => {
    if (rules.length === 0) {
      showToast("No data to clear", "error");
      return;
    }

    if (
      !window.confirm(
        "Are you sure you want to delete ALL tone parameters? This action cannot be undone.",
      )
    ) {
      return;
    }

    setLoading((prev) => ({ ...prev, delete: true }));
    try {
      setRules([]);
      setSelected([]);
      setPage(1);
      showToast(`All ${rules.length} item(s) deleted successfully`);
    } catch (error) {
      console.error("Error clearing all items:", error);
      showToast(error.message || "Failed to clear all items", "error");
    } finally {
      setLoading((prev) => ({ ...prev, delete: false }));
    }
  };

  const handleRefresh = () => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        setRules(parseStoredRules(stored));
      } else {
        setRules([]);
      }
    } catch (error) {
      console.error("Error refreshing tone detector data:", error);
    }
  };

  const pagedSelectedCount = pagedRules.filter((_, idx) =>
    selected.includes((page - 1) * itemsPerPage + idx),
  ).length;
  const allPagedChecked =
    pagedRules.length > 0 && pagedSelectedCount === pagedRules.length;

  return {
    isModalOpen,
    formData,
    rules,
    selected,
    page,
    itemsPerPage,
    totalPages,
    pagedRules,
    loading,
    editIndex,
    toast,
    clearToast,
    pagedSelectedCount,
    allPagedChecked,
    handleOpenModal,
    handleCloseModal,
    handleSave,
    handleInputChange,
    handlePageChange,
    handleSelectRow,
    handleCheckAll,
    handleUncheckAll,
    handleInverse,
    handleDelete,
    handleClearAll,
    handleRefresh,
  };
}
