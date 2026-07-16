import { useEffect, useState } from "react";
import {
  PSTN_CALL_IN_ORICALLEEID_FIELDS,
  PSTN_CALL_IN_ORICALLEEID_INITIAL_FORM,
} from "../../../../constants/E1PriPSTNCallInOriCalleeIDConstants";
import {
  listNumberManipulations,
  createNumberManipulation,
  updateNumberManipulation,
  deleteNumberManipulation,
  listPstnGroups,
} from "../../../../api/apiService";
import {
  E1PriPSTNCallInOriCalleeIDFormFromRow,
  buildE1PriPSTNCallInOriCalleeIDUpdatePayload,
  normalizeE1PriPSTNCallInOriCalleeIDFormDigits,
  buildDefaultE1PriPSTNCallInOriCalleeIDForm,
  getE1PriPSTNCallInOriCalleeIDPcmGroupIdLabel,
  getE1PriPSTNCallInOriCalleeIDUpdatedFields,
  formatE1PriPSTNCallInOriCalleeIDDisplayValue,
} from "../utils/E1PriPSTNCallInOriCalleeIDTransformers";
import { validateE1PriPSTNCallInOriCalleeIDForm } from "../utils/E1PriPSTNCallInOriCalleeIDValidators";

const MANIPULATION_TYPE = "pstn_in_oricalleeid";
const ITEMS_PER_PAGE = 20;

export function useE1PriPSTNCallInOriCalleeIDPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState(PSTN_CALL_IN_ORICALLEEID_INITIAL_FORM);
  const [rules, setRules] = useState([]);
  const [selected, setSelected] = useState([]);
  const [page, setPage] = useState(1);
  const itemsPerPage = ITEMS_PER_PAGE;
  const totalPages = Math.max(1, Math.ceil(rules.length / itemsPerPage));
  const pagedRules = rules.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage,
  );
  const [pcmTrunkGroups, setPcmTrunkGroups] = useState([]);
  const [loading, setLoading] = useState({
    fetch: false,
    save: false,
    delete: false,
  });
  const [editIndex, setEditIndex] = useState(null);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [tableMinWidth, setTableMinWidth] = useState("100%");

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 5000);
  };

  const alert = (msg) => {
    const isErr =
      /error|failed|required|please/i.test(msg) && !/successfully/i.test(msg);
    showMessage(isErr ? "error" : "success", msg);
  };

  const fetchPcmTrunkGroups = async () => {
    try {
      const response = await listPstnGroups();
      if (response.response && response.message) {
        const pcmGroups = Array.isArray(response.message)
          ? response.message
          : [response.message];
        setPcmTrunkGroups(pcmGroups);
        if (pcmGroups.length > 0 && formData.call_initiator === "") {
          const firstGroupId =
            pcmGroups[0].group_id || pcmGroups[0].id || pcmGroups[0];
          setFormData((prev) => ({
            ...prev,
            call_initiator: String(firstGroupId),
          }));
        }
      } else {
        setPcmTrunkGroups([]);
      }
    } catch (error) {
      console.error("Error fetching PCM trunk groups:", error);
      if (error.message === "Network Error") {
        alert("Network error. Please check your connection.");
      } else {
        alert(error.message || "Failed to load PCM trunk groups");
      }
      setPcmTrunkGroups([]);
    }
  };

  const fetchNumberManipulations = async () => {
    setLoading((prev) => ({ ...prev, fetch: true }));
    try {
      const response = await listNumberManipulations(MANIPULATION_TYPE);
      if (response.response && response.message) {
        setRules(response.message);
      } else {
        setRules([]);
      }
    } catch (error) {
      console.error("Error fetching number manipulations:", error);
      if (error.message === "Network Error") {
        alert("Network error. Please check your connection.");
      } else if (error.response?.status === 500) {
        alert(
          "Server error. The number manipulations endpoint may have issues.",
        );
      } else {
        alert(error.message || "Failed to load number manipulations");
      }
      setRules([]);
    } finally {
      setLoading((prev) => ({ ...prev, fetch: false }));
    }
  };

  useEffect(() => {
    fetchNumberManipulations();
    fetchPcmTrunkGroups();
  }, []);

  useEffect(() => {
    const updateTableWidthForZoom = () => {
      const scale = window.visualViewport?.scale || 1;
      setTableMinWidth(scale >= 1.15 ? 900 : "100%");
    };

    updateTableWidthForZoom();
    window.addEventListener("resize", updateTableWidthForZoom);
    window.visualViewport?.addEventListener("resize", updateTableWidthForZoom);

    return () => {
      window.removeEventListener("resize", updateTableWidthForZoom);
      window.visualViewport?.removeEventListener(
        "resize",
        updateTableWidthForZoom,
      );
    };
  }, []);

  const handleRefresh = async () => {
    await fetchNumberManipulations();
  };

  const getPcmGroupIdLabel = (groupId) =>
    getE1PriPSTNCallInOriCalleeIDPcmGroupIdLabel(groupId, pcmTrunkGroups);

  const getUpdatedFields = () =>
    getE1PriPSTNCallInOriCalleeIDUpdatedFields(PSTN_CALL_IN_ORICALLEEID_FIELDS, pcmTrunkGroups);

  const formatDisplayValue = (key, value, rowIndex = 0) =>
    formatE1PriPSTNCallInOriCalleeIDDisplayValue(
      key,
      value,
      rowIndex,
      page,
      itemsPerPage,
      getPcmGroupIdLabel,
    );

  const handleOpenModal = (item = null) => {
    if (item) {
      setFormData(E1PriPSTNCallInOriCalleeIDFormFromRow(item));
      setEditIndex(item.id);
    } else {
      setFormData(buildDefaultE1PriPSTNCallInOriCalleeIDForm({ ...PSTN_CALL_IN_ORICALLEEID_INITIAL_FORM }, pcmTrunkGroups));
      setEditIndex(null);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => setIsModalOpen(false);

  const handleSave = async () => {
    const validationError = validateE1PriPSTNCallInOriCalleeIDForm(formData);
    if (validationError) {
      alert(validationError);
      return;
    }

    const normalized = normalizeE1PriPSTNCallInOriCalleeIDFormDigits(formData);

    setLoading((prev) => ({ ...prev, save: true }));
    try {
      let response;
      if (editIndex !== null) {
        response = await updateNumberManipulation(
          buildE1PriPSTNCallInOriCalleeIDUpdatePayload(normalized, editIndex),
          MANIPULATION_TYPE,
        );
        if (response.response) {
          alert(
            response.message || "Number manipulation updated successfully!",
          );
          try {
            await new Promise((resolve) => setTimeout(resolve, 500));
            await fetchNumberManipulations();
          } catch {
            setRules((prev) =>
              prev.map((rule) =>
                rule.id === editIndex ? { ...rule, ...normalized } : rule,
              ),
            );
          }
        } else {
          alert("Failed to update number manipulation");
        }
      } else {
        response = await createNumberManipulation(
          normalized,
          MANIPULATION_TYPE,
        );
        if (response.response) {
          alert(
            response.message || "Number manipulation created successfully!",
          );
          try {
            await new Promise((resolve) => setTimeout(resolve, 500));
            await fetchNumberManipulations();
          } catch {
            const newItem = {
              ...normalized,
              id: Date.now(),
              manipulation_type: MANIPULATION_TYPE,
            };
            setRules((prev) => [...prev, newItem]);
          }
        } else {
          alert("Failed to create number manipulation");
        }
      }
      handleCloseModal();
    } catch (error) {
      console.error("Error saving number manipulation:", error);
      if (error.message === "Network Error") {
        alert("Network error. Please check your connection.");
      } else {
        alert(error.message || "Failed to save number manipulation");
      }
    } finally {
      setLoading((prev) => ({ ...prev, save: false }));
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePageChange = (newPage) =>
    setPage(Math.max(1, Math.min(totalPages, newPage)));

  const handleSelectRow = (idx) => {
    const realIdx = (page - 1) * itemsPerPage + idx;
    setSelected((sel) =>
      sel.includes(realIdx)
        ? sel.filter((i) => i !== realIdx)
        : [...sel, realIdx],
    );
  };

  const handleCheckAll = () => setSelected(rules.map((_, idx) => idx));
  const handleUncheckAll = () => setSelected([]);
  const handleInverse = () =>
    setSelected(
      rules
        .map((_, idx) => (!selected.includes(idx) ? idx : null))
        .filter((i) => i !== null),
    );

  const handleDelete = async () => {
    if (selected.length === 0) {
      alert("Please select items to delete");
      return;
    }
    const confirmed = window.confirm(
      `Are you sure you want to delete ${selected.length} selected item(s)?`,
    );
    if (!confirmed) return;

    setLoading((prev) => ({ ...prev, delete: true }));
    try {
      const deletePromises = selected.map(async (idx) => {
        const item = rules[idx];
        if (item && item.id) {
          return await deleteNumberManipulation(item.id);
        }
        return null;
      });

      const results = await Promise.allSettled(deletePromises);
      const successCount = results.filter(
        (result) =>
          result.status === "fulfilled" &&
          result.value &&
          result.value.response,
      ).length;
      const failCount = results.length - successCount;

      if (successCount > 0) {
        alert(`${successCount} item(s) deleted successfully`);
        try {
          await fetchNumberManipulations();
        } catch {
          const selectedIds = selected.map((idx) => rules[idx].id);
          setRules((prev) =>
            prev.filter((item) => !selectedIds.includes(item.id)),
          );
        }
        setSelected([]);
      }
      if (failCount > 0) {
        alert(`Failed to delete ${failCount} item(s)`);
      }
    } catch (error) {
      console.error("Error deleting selected items:", error);
      if (error.message === "Network Error") {
        alert("Network error. Please check your connection.");
      } else {
        alert(error.message || "Failed to delete selected items");
      }
    } finally {
      setLoading((prev) => ({ ...prev, delete: false }));
    }
  };

  const handleClearAll = async () => {
    if (rules.length === 0) {
      alert("No data to clear");
      return;
    }
    if (
      !window.confirm(
        "Are you sure you want to delete ALL number manipulations? This action cannot be undone.",
      )
    ) {
      return;
    }

    setLoading((prev) => ({ ...prev, delete: true }));
    try {
      const deletePromises = rules.map(async (item) => {
        if (item && item.id) {
          return await deleteNumberManipulation(item.id);
        }
        return null;
      });

      const results = await Promise.allSettled(deletePromises);
      const successCount = results.filter(
        (result) =>
          result.status === "fulfilled" &&
          result.value &&
          result.value.response,
      ).length;
      const failCount = results.length - successCount;

      if (successCount > 0) {
        alert(`All ${successCount} item(s) deleted successfully`);
        try {
          await fetchNumberManipulations();
        } catch {
          setRules([]);
        }
        setSelected([]);
        setPage(1);
      }
      if (failCount > 0) {
        alert(`Failed to delete ${failCount} item(s)`);
      }
    } catch (error) {
      console.error("Error clearing all items:", error);
      if (error.message === "Network Error") {
        alert("Network error. Please check your connection.");
      } else {
        alert(error.message || "Failed to clear all items");
      }
    } finally {
      setLoading((prev) => ({ ...prev, delete: false }));
    }
  };

  return {
    isModalOpen,
    formData,
    rules,
    selected,
    page,
    loading,
    editIndex,
    message,
    setMessage,
    tableMinWidth,
    itemsPerPage,
    totalPages,
    pagedRules,
    pcmTrunkGroups,
    getPcmGroupIdLabel,
    getUpdatedFields,
    formatDisplayValue,
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
