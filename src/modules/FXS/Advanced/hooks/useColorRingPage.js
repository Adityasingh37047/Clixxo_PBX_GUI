import { useRef, useState } from "react";
import {
  COLOR_RING_INITIAL_FORM,
  COLOR_RING_ITEMS_PER_PAGE,
} from "../../../../constants/ColorRingConstants";
import {
  buildColorRingItem,
  colorRingFormFromItem,
  resetColorRingForm,
  transformColorRingFileChange,
} from "../utils/ColorRingTransformers";
import { validateColorRingUpload } from "../utils/ColorRingValidators";

export function useColorRingPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState(COLOR_RING_INITIAL_FORM);
  const [rules, setRules] = useState([]);
  const [selected, setSelected] = useState([]);
  const [page, setPage] = useState(1);
  const [fileName, setFileName] = useState("No file chosen");
  const [editIndex, setEditIndex] = useState(null);
  const fileInputRef = useRef(null);
  const [toast, setToast] = useState({ msg: "", type: "success" });
  const itemsPerPage = COLOR_RING_ITEMS_PER_PAGE;

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "success" }), 3500);
  };

  const clearToast = () => setToast({ msg: "", type: "success" });

  const totalPages = Math.max(1, Math.ceil(rules.length / itemsPerPage));
  const pagedRules = rules.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage,
  );

  const pagedSelectedCount = pagedRules.filter((_, idx) =>
    selected.includes((page - 1) * itemsPerPage + idx),
  ).length;
  const allPagedChecked =
    pagedRules.length > 0 && pagedSelectedCount === pagedRules.length;

  const handleOpenModal = (item = null, idx = -1) => {
    if (item) {
      setFormData(colorRingFormFromItem(item));
      setFileName(item.fileName || "No file chosen");
      setEditIndex(idx);
    } else {
      setFormData(resetColorRingForm());
      setFileName("No file chosen");
      setEditIndex(null);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormData(resetColorRingForm());
    setFileName("No file chosen");
  };

  const handleReturn = () => {
    handleCloseModal();
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    const { fileName: nextFileName, file: nextFile } =
      transformColorRingFileChange(file);
    setFileName(nextFileName);
    setFormData((prev) => ({ ...prev, file: nextFile }));
  };

  const handleUpload = () => {
    const validationError = validateColorRingUpload(formData);
    if (validationError) {
      showToast(validationError, "error");
      return;
    }

    const newItem = buildColorRingItem({ formData, editIndex, rules });

    try {
      if (editIndex !== null) {
        setRules((prev) =>
          prev.map((rule, idx) => (idx === editIndex ? newItem : rule)),
        );
        showToast("Color ring updated successfully!");
      } else {
        setRules((prev) => [...prev, newItem]);
        showToast("Color ring uploaded successfully!");
      }

      handleCloseModal();
    } catch (error) {
      console.error("Error saving color ring:", error);
      showToast(error.message || "Failed to save color ring", "error");
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

    if (!window.confirm("Are you sure to clear all color rings?")) {
      return;
    }

    try {
      setRules([]);
      setSelected([]);
      setPage(1);
      showToast("All color rings cleared successfully");
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

  const handleHeaderCheckboxChange = (checked) => {
    if (checked) handleCheckAll();
    else setSelected([]);
  };

  return {
    isModalOpen,
    formData,
    rules,
    selected,
    page,
    fileName,
    fileInputRef,
    toast,
    clearToast,
    itemsPerPage,
    totalPages,
    pagedRules,
    pagedSelectedCount,
    allPagedChecked,
    handleOpenModal,
    handleCloseModal,
    handleReturn,
    handleInputChange,
    handleFileChange,
    handleUpload,
    handleSelectRow,
    handleCheckAll,
    handleInverse,
    handleDelete,
    handleClearAll,
    handlePageChange,
    handleHeaderCheckboxChange,
  };
}
