import { useEffect, useRef, useState } from "react";
import {
  IP_CALL_IN_CALLEEID_FIELDS,
  IP_CALL_IN_CALLEEID_INITIAL_FORM,
} from "../../../../constants/E1PriIPCallInCalleeIDConstants";
import {
  listNumberManipulations,
  createNumberManipulation,
  updateNumberManipulation,
  deleteNumberManipulation,
  listGroups,
} from "../../../../api/apiService";
import {
  E1PriIPCallInCalleeIDFormFromRow,
  buildE1PriIPCallInCalleeIDUpdatePayload,
  normalizeE1PriIPCallInCalleeIDFormDigits,
} from "../utils/E1PriIPCallInCalleeIDTransformers";
import { validateE1PriIPCallInCalleeIDForm } from "../utils/E1PriIPCallInCalleeIDValidators";

const E1PRI_IPCALLINCALLEEID_ITEMS_PER_PAGE = 20;
const MANIPULATION_TYPE = "ip_in_calleeid";

export function useE1PriIPCallInCalleeIDPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState(IP_CALL_IN_CALLEEID_INITIAL_FORM);
  const [rules, setRules] = useState([]);
  const [selected, setSelected] = useState([]);
  const [page, setPage] = useState(1);
  const itemsPerPage = E1PRI_IPCALLINCALLEEID_ITEMS_PER_PAGE;
  const totalPages = Math.max(1, Math.ceil(rules.length / itemsPerPage));
  const pagedRules = rules.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage,
  );
  const [sipTrunkGroups, setSipTrunkGroups] = useState([]);
  const [loading, setLoading] = useState({
    fetch: false,
    save: false,
    delete: false,
  });
  const [editIndex, setEditIndex] = useState(null);
  const [toast, setToast] = useState({ msg: "", type: "success" });
  const tableScrollRef = useRef(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "success" }), 3500);
  };

  const alert = (msg) => {
    const isErr =
      /error|failed|required|please/i.test(msg) && !/successfully/i.test(msg);
    showToast(msg, isErr ? "error" : "success");
  };

  const fetchSipTrunkGroups = async () => {
    try {
      const response = await listGroups();
      if (response.response && response.message) {
        const sipGroups = Array.isArray(response.message)
          ? response.message
          : [response.message];
        setSipTrunkGroups(sipGroups);

        if (sipGroups.length > 0 && formData.call_initiator === "") {
          const firstGroupId =
            sipGroups[0].group_id || sipGroups[0].id || sipGroups[0];
          setFormData((prev) => ({ ...prev, call_initiator: firstGroupId }));
        }
      } else {
        setSipTrunkGroups([]);
      }
    } catch (error) {
      console.error("Error fetching SIP trunk groups:", error);
      if (error.message === "Network Error") {
        alert("Network error. Please check your connection.");
      } else {
        alert(error.message || "Failed to load SIP trunk groups");
      }
      setSipTrunkGroups([]);
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

  const handleOpenModal = (item = null) => {
    if (item) {
      setFormData(E1PriIPCallInCalleeIDFormFromRow(item));
      setEditIndex(item.id);
    } else {
      const defaultForm = { ...IP_CALL_IN_CALLEEID_INITIAL_FORM };
      if (sipTrunkGroups.length > 0) {
        const firstGroupId =
          sipTrunkGroups[0].group_id ||
          sipTrunkGroups[0].id ||
          sipTrunkGroups[0];
        defaultForm.call_initiator = firstGroupId;
      }
      setFormData(defaultForm);
      setEditIndex(null);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => setIsModalOpen(false);

  const handleSave = async () => {
    const validationError = validateE1PriIPCallInCalleeIDForm(formData);
    if (validationError) {
      alert(validationError);
      return;
    }

    const normalized = normalizeE1PriIPCallInCalleeIDFormDigits(formData);

    setLoading((prev) => ({ ...prev, save: true }));
    try {
      let response;
      if (editIndex !== null) {
        response = await updateNumberManipulation(
          buildE1PriIPCallInCalleeIDUpdatePayload(normalized, editIndex),
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
        } catch (reloadError) {
          console.warn(
            "Failed to reload after delete, removing from local state:",
            reloadError,
          );
          const selectedItems = selected.map((idx) => rules[idx]);
          const selectedIds = selectedItems.map((item) => item.id);
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
        } catch (reloadError) {
          console.warn(
            "Failed to reload after clear all, clearing local state:",
            reloadError,
          );
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

  const handleTableScroll = (e) => {
    if (tableScrollRef.current) {
      tableScrollRef.current.scrollLeft = e.target.scrollLeft;
    }
  };

  useEffect(() => {
    fetchNumberManipulations();
    fetchSipTrunkGroups();
  }, []);

  const handleRefresh = async () => {
    await fetchNumberManipulations();
  };

  const getUpdatedFields = () =>
    IP_CALL_IN_CALLEEID_FIELDS.map((field) => {
      if (field.name === "call_initiator") {
        return {
          ...field,
          options: sipTrunkGroups.map((group) => ({
            value: group.group_id || group.id || group,
            label: `SIP Trunk Group [${group.group_id || group.id || group}]`,
          })),
        };
      }
      return field;
    });

  return {
    isModalOpen,
    formData,
    rules,
    selected,
    page,
    loading,
    editIndex,
    toast,
    setToast,
    tableScrollRef,
    itemsPerPage,
    totalPages,
    pagedRules,
    getUpdatedFields,
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
    handleTableScroll,
    handleRefresh,
  };
}
