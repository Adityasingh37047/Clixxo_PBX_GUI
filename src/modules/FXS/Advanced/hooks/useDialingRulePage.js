import { useState } from "react";
import {
  DIALING_RULE_INITIAL_FORM,
  DIALING_RULE_INITIAL_DATA,
  DIALING_RULE_ITEMS_PER_PAGE,
} from "../../../../constants/DialingRuleConstants";
import {
  buildDialingRuleItem,
  getAvailableIndices,
  getFirstAvailableIndex,
  normalizeDialingRuleForm,
} from "../utils/DialingRuleTransformers";
import { validateDialingRuleForm } from "../utils/DialingRuleValidators";

export function useDialingRulePage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState(DIALING_RULE_INITIAL_FORM);
  const [rules, setRules] = useState(DIALING_RULE_INITIAL_DATA);
  const [selected, setSelected] = useState([]);
  const [page, setPage] = useState(1);
  const itemsPerPage = DIALING_RULE_ITEMS_PER_PAGE;
  const totalPages = Math.max(1, Math.ceil(rules.length / itemsPerPage));
  const pagedRules = rules.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage,
  );
  const [editIndex, setEditIndex] = useState(null);
  const [indexSelect, setIndexSelect] = useState("");
  const [toast, setToast] = useState({ msg: "", type: "success" });

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "success" }), 3500);
  };

  const getAvailableIndicesForEdit = (currentEditIndex = null) =>
    getAvailableIndices(rules, currentEditIndex);

  const handleOpenModal = (item = null, idx = -1) => {
    if (item) {
      setFormData(normalizeDialingRuleForm(item));
      setIndexSelect(String(item.index));
      setEditIndex(idx);
    } else {
      const firstAvailable = getFirstAvailableIndex(rules);
      setFormData({
        ...DIALING_RULE_INITIAL_FORM,
        index: firstAvailable,
      });
      setIndexSelect(firstAvailable);
      setEditIndex(null);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormData(DIALING_RULE_INITIAL_FORM);
    setIndexSelect("");
  };

  const handleIndexSelectChange = (value) => {
    setIndexSelect(value);
    setFormData((prev) => ({ ...prev, index: value }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    const validationError = validateDialingRuleForm(formData, rules, editIndex);
    if (validationError) {
      showToast(validationError, "error");
      return;
    }

    const normalized = buildDialingRuleItem(formData, editIndex, rules);

    try {
      if (editIndex !== null) {
        setRules((prev) =>
          prev.map((rule, idx) => (idx === editIndex ? normalized : rule)),
        );
        showToast("Dialing rule updated successfully!");
      } else {
        setRules((prev) => [...prev, normalized]);
        showToast("Dialing rule created successfully!");
      }

      handleCloseModal();
    } catch (error) {
      console.error("Error saving dialing rule:", error);
      showToast(error.message || "Failed to save dialing rule", "error");
    }
  };

  const handleSelectRow = (idx) => {
    const realIdx = (page - 1) * itemsPerPage + idx;
    setSelected((prev) =>
      prev.includes(realIdx)
        ? prev.filter((i) => i !== realIdx)
        : [...prev, realIdx],
    );
  };

  const handleCheckAll = () => {
    const allIndices = pagedRules.map(
      (_, idx) => (page - 1) * itemsPerPage + idx,
    );
    setSelected(allIndices);
  };

  const handleUncheckAll = () => {
    setSelected([]);
  };

  const handleInverse = () => {
    const allIndices = pagedRules.map(
      (_, idx) => (page - 1) * itemsPerPage + idx,
    );
    setSelected((prev) => allIndices.filter((idx) => !prev.includes(idx)));
  };

  const handleDelete = () => {
    if (selected.length === 0) {
      showToast("Please select at least one item to delete.", "error");
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete ${selected.length} selected item(s)?`,
    );
    if (!confirmed) return;

    try {
      setRules((prev) => prev.filter((_, idx) => !selected.includes(idx)));
      setSelected([]);
      if (page > Math.ceil((rules.length - selected.length) / itemsPerPage)) {
        setPage(
          Math.max(
            1,
            Math.ceil((rules.length - selected.length) / itemsPerPage),
          ),
        );
      }
      showToast(`${selected.length} item(s) deleted successfully`);
    } catch (error) {
      console.error("Error deleting selected items:", error);
      showToast(error.message || "Failed to delete selected items", "error");
    }
  };

  const handleClearAll = () => {
    if (rules.length === 0) {
      showToast("No data to clear", "error");
      return;
    }

    if (!window.confirm("Are you sure to clear all dialing rules?")) {
      return;
    }

    try {
      setRules([]);
      setSelected([]);
      setPage(1);
      showToast("All dialing rules cleared successfully");
    } catch (error) {
      console.error("Error clearing all items:", error);
      showToast(error.message || "Failed to clear all items", "error");
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
      setSelected([]);
    }
  };

  const pagedSelectedCount = pagedRules.filter((_, idx) =>
    selected.includes((page - 1) * itemsPerPage + idx),
  ).length;
  const allPagedChecked =
    pagedRules.length > 0 && pagedSelectedCount === pagedRules.length;

  const clearToast = () => setToast({ msg: "", type: "success" });

  return {
    isModalOpen,
    formData,
    rules,
    selected,
    page,
    itemsPerPage,
    totalPages,
    pagedRules,
    editIndex,
    indexSelect,
    toast,
    clearToast,
    getAvailableIndices: getAvailableIndicesForEdit,
    handleOpenModal,
    handleCloseModal,
    handleIndexSelectChange,
    handleInputChange,
    handleSave,
    handleSelectRow,
    handleCheckAll,
    handleUncheckAll,
    handleInverse,
    handleDelete,
    handleClearAll,
    handlePageChange,
    pagedSelectedCount,
    allPagedChecked,
  };
}
