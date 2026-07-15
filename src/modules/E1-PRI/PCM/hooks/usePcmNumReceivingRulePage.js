import { useState, useEffect, useRef } from "react";
import useMediaQuery from "@mui/material/useMediaQuery";
import {
  PCM_NUM_RECEIVING_RULE_FIELDS,
  PCM_NUM_RECEIVING_RULE_INITIAL_FORM,
  PCM_NUM_RECEIVING_RULE_TABLE_COLUMNS,
  PCM_NUM_RECEIVING_RULE_FIELD_TOOLTIPS,
  PCM_NUM_RECEIVING_RULE_PAGE_BREADCRUMB_ROOT,
  PCM_NUM_RECEIVING_RULE_PAGE_BREADCRUMB_SECTION,
  PCM_NUM_RECEIVING_RULE_PAGE_TITLE,
  PCM_NUM_RECEIVING_RULE_EMPTY_MESSAGE,
  PCM_NUM_RECEIVING_RULE_MODAL_TITLE_ADD,
  PCM_NUM_RECEIVING_RULE_MODAL_TITLE_EDIT,
  PCM_NUM_RECEIVING_RULE_ADD_NEW_LABEL,
  PCM_NUM_RECEIVING_RULE_DELETE_LABEL,
  PCM_NUM_RECEIVING_RULE_SAVE_LABEL,
  PCM_NUM_RECEIVING_RULE_CLOSE_LABEL,
} from "../../../../constants/PcmNumReceivingRuleConstants";
import {
  listNumRecv,
  createNumRecv,
  deleteNumRecv,
} from "../../../../api/apiService";
import { PCM_NUM_RECEIVING_RULE_COMPACT_MQ } from "../components/PcmNumReceivingRuleFormFields";

export function usePcmNumReceivingRulePage() {
const isCompact = useMediaQuery(PCM_NUM_RECEIVING_RULE_COMPACT_MQ);
  // State
  const [rules, setRules] = useState([]);
  const [allData, setAllData] = useState([]);
  const [selected, setSelected] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(PCM_NUM_RECEIVING_RULE_INITIAL_FORM);
  const [editIndex, setEditIndex] = useState(null);
  const [loading, setLoading] = useState({
    fetch: false,
    save: false,
    delete: false,
  });
  const [message, setMessage] = useState({ type: "", text: "" });
  const hasInitialLoadRef = useRef(false);
  const [page, setPage] = useState(1);
  const itemsPerPage = 20;
  const totalPages = Math.max(1, Math.ceil(rules.length / itemsPerPage));
  const pagedRules = rules.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage,
  );

  // Show message function
  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 5000);
  };

  // Load data function
  const loadNumRecvData = async (isRefresh = false) => {
    if (loading.fetch) {
      return;
    }
    setLoading((prev) => ({ ...prev, fetch: true }));
    try {
      // console.log('Attempting to load Number Receiving Rule data...');
      const response = await listNumRecv();
      // console.log('Number Receiving Rule response:', response);

      if (response && response.response && Array.isArray(response.message)) {
        setAllData(response.message);
        setRules(response.message);
        // console.log('Number Receiving Rule data loaded successfully:', response.message.length, 'items');
        // console.log('Sample data structure:', response.message[0]); // Debug: show first item structure
      } else {
        // console.log('Invalid response format:', response);
        if (!isRefresh) {
          showMessage("error", "Failed to load Number Receiving Rule data");
        }
      }
    } catch (error) {
      console.error("Error loading Number Receiving Rule data:", error);
      if (!isRefresh) {
        if (error.message === "Network Error") {
          showMessage("error", "Network error. Please check your connection.");
        } else if (error.response?.status === 500) {
          showMessage(
            "error",
            "Server error. The Number Receiving Rule endpoint may have issues.",
          );
        } else if (error.response?.status === 404) {
          showMessage(
            "error",
            "Number Receiving Rule API endpoint not found. The server does not have the /numrecv endpoint implemented yet.",
          );
        } else {
          showMessage(
            "error",
            error.message || "Failed to load Number Receiving Rule data",
          );
        }
        setAllData([]);
        setRules([]);
      } else {
        console.warn("Refresh failed, keeping existing data:", error.message);
        // For refresh failures, show a warning but don't clear data
        showMessage(
          "warning",
          "Failed to refresh data. Please refresh the page manually.",
        );
      }
    } finally {
      setLoading((prev) => ({ ...prev, fetch: false }));
    }
  };

  // Initial load
  useEffect(() => {
    if (!hasInitialLoadRef.current) {
      hasInitialLoadRef.current = true;
      loadNumRecvData();
    }
  }, []);

  // Modal handlers
  const handleOpenModal = (item = null, index = -1) => {
    if (item) {
      setForm({
        number_data: item.number_data || "",
        provider: item.provider || "bsnl",
      });
      setEditIndex(item.id);
    } else {
      setForm(PCM_NUM_RECEIVING_RULE_INITIAL_FORM);
      setEditIndex(null);
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setForm(PCM_NUM_RECEIVING_RULE_INITIAL_FORM);
    setEditIndex(null);
  };

  const handleInputChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  // Save function
  const handleSave = async () => {
    if (loading.save) return;

    // Validation
    if (!form.number_data.trim()) {
      showMessage("error", "Number Data is required");
      return;
    }
    if (!form.provider) {
      showMessage("error", "Provider is required");
      return;
    }

    setLoading((prev) => ({ ...prev, save: true }));
    try {
      const apiData = {
        number_data: form.number_data.trim(),
        provider: form.provider,
      };

      //    console.log('Saving Number Receiving Rule:', apiData);
      const response = await createNumRecv(apiData);
      // console.log('Save response:', response);

      if (response && response.response) {
        showMessage("success", "Number Receiving Rule saved successfully!");
        handleCloseModal();

        // Small delay to ensure modal closes before refreshing
        setTimeout(async () => {
          try {
            await loadNumRecvData(true);
          } catch (reloadError) {
            console.warn("Failed to reload data after save:", reloadError);
            // If reload fails, add the new item to local state as fallback
            const newItem = {
              id: Date.now(), // Temporary ID for local state
              ...apiData,
            };
            setRules((prev) => [...prev, newItem]);
            setAllData((prev) => [...prev, newItem]);
            showMessage(
              "warning",
              "Data saved but failed to refresh. New item added to table.",
            );
          }
        }, 100);
      } else {
        showMessage("error", "Failed to save Number Receiving Rule");
      }
    } catch (error) {
      console.error("Error saving Number Receiving Rule:", error);
      showMessage(
        "error",
        error.message || "Failed to save Number Receiving Rule",
      );
    } finally {
      setLoading((prev) => ({ ...prev, save: false }));
    }
  };

  // Delete function
  const handleDelete = async () => {
    if (selected.length === 0) {
      showMessage("warning", "Please select items to delete");
      return;
    }

    if (loading.delete) return;

    const isConfirmed = window.confirm(
      `Are you sure you want to delete ${selected.length} selected item(s)?`,
    );
    if (!isConfirmed) return;

    setLoading((prev) => ({ ...prev, delete: true }));
    try {
      const deletePromises = selected.map((index) => {
        const rule = rules[index];
        return deleteNumRecv(rule.id);
      });

      const results = await Promise.allSettled(deletePromises);
      const successful = results.filter((r) => r.status === "fulfilled").length;
      const failed = results.filter((r) => r.status === "rejected").length;

      if (successful > 0) {
        showMessage("success", `Successfully deleted ${successful} item(s)`);
      }
      if (failed > 0) {
        showMessage("error", `Failed to delete ${failed} item(s)`);
      }

      setSelected([]);

      // Reload data
      try {
        await loadNumRecvData(true);
      } catch (reloadError) {
        console.warn("Failed to reload data after delete:", reloadError);
        // Update local state as fallback
        setRules((prev) =>
          prev.filter((_, index) => !selected.includes(index)),
        );
      }
    } catch (error) {
      console.error("Error deleting Number Receiving Rules:", error);
      showMessage(
        "error",
        error.message || "Failed to delete Number Receiving Rules",
      );
    } finally {
      setLoading((prev) => ({ ...prev, delete: false }));
    }
  };

  // Clear all function
  const handleClearAll = async () => {
    if (rules.length === 0) {
      showMessage("warning", "No data to clear");
      return;
    }

    if (loading.delete) return;

    const isConfirmed = window.confirm(
      `Are you sure you want to delete all ${rules.length} Number-Receiving Rule(s)? This action cannot be undone.`,
    );
    if (!isConfirmed) return;

    setLoading((prev) => ({ ...prev, delete: true }));
    try {
      const deletePromises = rules.map((rule) => deleteNumRecv(rule.id));
      const results = await Promise.allSettled(deletePromises);
      const successful = results.filter((r) => r.status === "fulfilled").length;
      const failed = results.filter((r) => r.status === "rejected").length;

      if (successful > 0) {
        showMessage("success", `Successfully cleared ${successful} item(s)`);
      }
      if (failed > 0) {
        showMessage("error", `Failed to clear ${failed} item(s)`);
      }

      setSelected([]);
      setPage(1);

      // Reload data
      try {
        await loadNumRecvData(true);
      } catch (reloadError) {
        console.warn("Failed to reload data after clear all:", reloadError);
        // Update local state as fallback
        setRules([]);
        setAllData([]);
      }
    } catch (error) {
      console.error("Error clearing all Number Receiving Rules:", error);
      showMessage(
        "error",
        error.message || "Failed to clear all Number Receiving Rules",
      );
    } finally {
      setLoading((prev) => ({ ...prev, delete: false }));
    }
  };

  // Selection handlers
  const handleSelectRow = (index) => {
    setSelected((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index],
    );
  };

  const handleCheckAllRows = () => {
    setSelected(pagedRules.map((_, idx) => (page - 1) * itemsPerPage + idx));
  };

  const handleUncheckAllRows = () => {
    setSelected([]);
  };

  const handleInverse = () => {
    const currentPageIndices = pagedRules.map(
      (_, idx) => (page - 1) * itemsPerPage + idx,
    );
    setSelected(currentPageIndices.filter((i) => !selected.includes(i)));
  };

  // Pagination handlers
  const handlePageChange = (newPage) => {
    setPage(Math.max(1, Math.min(totalPages, newPage)));
  };

  return {
    rules,
    allData,
    selected,
    showModal,
    form,
    editIndex,
    loading,
    message,
    setMessage,
    page,
    setPage,
    isCompact,
    itemsPerPage,
    totalPages,
    pagedRules,
    showMessage,
    loadNumRecvData,
    handleOpenModal,
    handleCloseModal,
    handleInputChange,
    handleSave,
    handleDelete,
    handleClearAll,
    handleSelectRow,
    handleCheckAllRows,
    handleUncheckAllRows,
    handleInverse,
    handlePageChange,
  };
}
