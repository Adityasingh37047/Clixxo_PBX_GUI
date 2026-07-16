import { useState, useEffect, useRef } from "react";
import useMediaQuery from "@mui/material/useMediaQuery";
import {
  PCM_TRUNK_GROUP_FIELDS,
  PCM_TRUNK_GROUP_INITIAL_FORM,
  PCM_TRUNK_GROUP_TABLE_COLUMNS,
  PCM_TRUNK_GROUP_FIELD_TOOLTIPS,
  PCM_TRUNK_GROUP_PAGE_BREADCRUMB_ROOT,
  PCM_TRUNK_GROUP_PAGE_BREADCRUMB_SECTION,
  PCM_TRUNK_GROUP_PAGE_TITLE,
  PCM_TRUNK_GROUP_EMPTY_MESSAGE,
  PCM_TRUNK_GROUP_MODAL_TITLE_ADD,
  PCM_TRUNK_GROUP_MODAL_TITLE_EDIT,
  PCM_TRUNK_GROUP_ADD_NEW_LABEL,
  PCM_TRUNK_GROUP_DELETE_LABEL,
  PCM_TRUNK_GROUP_SAVE_LABEL,
  PCM_TRUNK_GROUP_CLOSE_LABEL,
} from "../../../../constants/PcmTrunkGroupConstants";
import {
  listPstn,
  listPstnGroups,
  savePstnGroup,
  deletePstnGroup,
  listIpPstnRoutes,
  listNumberManipulations,
} from "../../../../api/apiService";
import { PCM_TRUNK_GROUP_COMPACT_MQ } from "../components/PcmTrunkGroupFormFields";

export function usePcmTrunkGroupPage() {
const isCompact = useMediaQuery(PCM_TRUNK_GROUP_COMPACT_MQ);
  const tableScrollRef = useRef(null);
  const [groups, setGroups] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState(PCM_TRUNK_GROUP_INITIAL_FORM);
  const [checkAll, setCheckAll] = useState(false);
  const [selected, setSelected] = useState([]);
  const [page, setPage] = useState(1);
  const [spansData, setSpansData] = useState([]);
  const [isLoadingSpans, setIsLoadingSpans] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState({ type: "", text: "" });
  const itemsPerPage = 20;
  const totalPages = Math.max(1, Math.ceil(groups.length / itemsPerPage));
  const pagedGroups = groups.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage,
  );

  // Message handling
  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 5000);
  };

  // useEffect(() => {
  //   localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(groups));
  // }, [groups]);

  // Fetch PCM trunk group data on component mount

  useEffect(() => {
    fetchPcmTrunkGroupData();
  }, []);

  const fetchSpansData = async () => {
    setIsLoadingSpans(true);
    try {
      const res = await listPstn();

      // Support various shapes: res.message, res.data, top-level array, or nested
      let raw = [];
      if (Array.isArray(res)) raw = res;
      else if (Array.isArray(res?.message)) raw = res.message;
      else if (Array.isArray(res?.data)) raw = res.data;
      else if (Array.isArray(res?.data?.message)) raw = res.data.message;
      if (!raw.length && res && typeof res === "object") {
        const v = Object.values(res).find(
          (x) =>
            Array.isArray(x) &&
            x.length &&
            (x[0]?.span_id != null || x[0]?.span != null),
        );
        if (v) raw = v;
      }

      const mapped = raw
        .map((it) => {
          const spanId = it?.span_id ?? it?.span ?? it?.spanNo ?? it?.id;
          return spanId != null ? { spanNo: String(spanId) } : null;
        })
        .filter(Boolean);

      setSpansData(mapped);
      if (!mapped.length)
        console.warn("PSTN list returned no spans. Raw:", res);
    } catch (error) {
      console.error("Error fetching spans data:", error);
    } finally {
      setIsLoadingSpans(false);
    }
  };

  const fetchPcmTrunkGroupData = async () => {
    setIsLoadingData(true);
    setError(null); // Clear any previous errors
    try {
      const response = await listPstnGroups();
      if (response?.response && Array.isArray(response.message)) {
        const mapped = response.message.map((g) => ({
          groupId: g.group_id,
          pstnIds: g.pstn_ids || [],
          description: g.description || "",
        }));
        setGroups(mapped);
      } else {
        setGroups([]);
      }
    } catch (error) {
      console.error("Error fetching PSTN groups:", error);
      showMessage("error", error?.message || "Failed to load PSTN groups");
      // On error, keep empty array
      setGroups([]);
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleOpenModal = async (item = null, index = -1) => {
    // Always fetch fresh spans data when opening modal
    await fetchSpansData();

    if (item) {
      // Editing existing item
      setFormData({
        ...item,
        groupId:
          String(item.groupId) !== undefined
            ? Number(item.groupId)
            : item.groupId,
        originalIndex: index,
      });
    } else {
      setFormData({ ...PCM_TRUNK_GROUP_INITIAL_FORM });
    }
    setIsModalOpen(true);
  };

  // Helper function to get used PSTN spans from existing groups
  const getUsedPstnSpans = () => {
    const usedSpans = new Set();
    groups.forEach((group) => {
      if (group.pstnIds && Array.isArray(group.pstnIds)) {
        group.pstnIds.forEach((span) => usedSpans.add(String(span)));
      }
    });
    return usedSpans;
  };

  // Helper function to check if a span is available for selection
  const isSpanAvailable = (
    spanNo,
    isEditing = false,
    editingGroupIndex = null,
  ) => {
    const usedSpans = getUsedPstnSpans();
    const spanStr = String(spanNo);

    // If we're editing an existing group, the spans used by that group should still be available
    if (isEditing && editingGroupIndex !== null) {
      const editingGroup = groups[editingGroupIndex];
      if (
        editingGroup &&
        editingGroup.pstnIds &&
        editingGroup.pstnIds.includes(spanStr)
      ) {
        return true; // This span is used by the group we're editing, so it's available
      }
    }

    return !usedSpans.has(spanStr);
  };
  const handleCloseModal = () => setIsModalOpen(false);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    // Special validation for index field
    if (name === "index") {
      const newIndex = parseInt(value);

      // Check if this index is already used by another item (excluding current item being edited)
      const existingIndexes = groups.map((group) => parseInt(group.index));
      const currentIndex =
        formData.originalIndex !== undefined
          ? parseInt(groups[formData.originalIndex]?.index)
          : null;

      // Remove current item's index from the check if we're editing
      const otherIndexes = existingIndexes.filter(
        (idx) => idx !== currentIndex,
      );

      if (otherIndexes.includes(newIndex)) {
        showMessage(
          "error",
          `Index ${newIndex} is already in use. Please select a different index.`,
        );
        return; // Don't update the form data
      }
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // PSTN IDs (checkboxes), use span.spanNo as pstn id string
  const handleTrunkCheckbox = (spanNo) => {
    const isEditing = formData.originalIndex !== undefined;
    const isAvailable = isSpanAvailable(
      spanNo,
      isEditing,
      formData.originalIndex,
    );

    // Don't allow selection of unavailable spans
    if (!isAvailable) {
      return;
    }

    setFormData((prev) => {
      const idStr = String(spanNo);
      const next = prev.pstnIds?.includes(idStr)
        ? prev.pstnIds.filter((t) => t !== idStr)
        : [...(prev.pstnIds || []), idStr];
      return { ...prev, pstnIds: next };
    });
  };
  const handleCheckAll = () => {
    setCheckAll(true);
    // Check all available spans only
    const isEditing = formData.originalIndex !== undefined;
    const available = spansData
      .filter((span) =>
        isSpanAvailable(span.spanNo, isEditing, formData.originalIndex),
      )
      .map((span) => String(span.spanNo));
    setFormData((prev) => ({ ...prev, pstnIds: available }));
  };
  const handleUncheckAll = () => {
    setCheckAll(false);
    setFormData((prev) => ({ ...prev, pstnIds: [] }));
  };

  const handleSave = async () => {
    // Validate form data with better checks
    // Check if groupId is null, undefined, or empty string (but allow 0 as valid)
    if (
      formData.groupId === null ||
      formData.groupId === undefined ||
      formData.groupId === ""
    ) {
      showMessage("error", "Please select a Group ID.");
      return;
    }

    if (!formData.description || formData.description.trim() === "") {
      showMessage("error", "Please fill in the Description field.");
      return;
    }

    if (!formData.pstnIds || formData.pstnIds.length === 0) {
      showMessage("error", "Please select at least one PSTN ID.");
      return;
    }

    // Additional validation for duplicate index
    const newIndex = parseInt(formData.groupId);
    const existingIndexes = groups.map((group) => parseInt(group.groupId));
    const currentIndex =
      formData.originalIndex !== undefined
        ? parseInt(groups[formData.originalIndex]?.groupId)
        : null;
    const otherIndexes = existingIndexes.filter((idx) => idx !== currentIndex);

    if (otherIndexes.includes(newIndex)) {
      showMessage(
        "error",
        `Index ${newIndex} is already in use. Please select a different index.`,
      );
      return;
    }

    setIsSaving(true);

    try {
      // Auto-upgrade index if it's a new entry (not editing existing)
      let finalIndex = parseInt(formData.groupId);
      if (formData.originalIndex === undefined) {
        const existingIndexes = groups.map((group) => parseInt(group.groupId));
        let nextIndex = 0;
        while (existingIndexes.includes(nextIndex)) {
          nextIndex++;
        }
        finalIndex = nextIndex;
      }

      // Check if we're trying to create multiple trunk groups at once
      // If so, we need to create separate entries for each trunk
      if (formData.pstnIds.length > 1 && formData.originalIndex === undefined) {
        // Create multiple trunk groups - one for each selected trunk
        const savePromises = formData.pstnIds.map(
          async (pstnId, trunkIndex) => {
            const trunkGroupIndex = finalIndex + trunkIndex;
            return await savePstnGroup(
              trunkGroupIndex,
              [pstnId],
              `${formData.description}`,
            );
          },
        );

        const results = await Promise.all(savePromises);
        const allSuccessful = results.every(
          (result) => result && result.response,
        );
        if (allSuccessful) {
          const newGroups = formData.pstnIds.map((pstnId, trunkIndex) => ({
            groupId: String(finalIndex + trunkIndex),
            description: formData.description,
            pstnIds: [pstnId],
          }));

          setGroups((prev) => [...prev, ...newGroups]);

          showMessage(
            "success",
            `Successfully created ${formData.pstnIds.length} PSTN group(s)!`,
          );
          setIsModalOpen(false);
          await fetchPcmTrunkGroupData();
        } else {
          showMessage(
            "error",
            "Failed to create some PSTN groups. Please try again.",
          );
        }
      } else {
        const response = await savePstnGroup(
          finalIndex,
          formData.pstnIds,
          formData.description,
        );
        if (response?.response) {
          showMessage("success", "PSTN Group saved successfully!");
          setIsModalOpen(false);
          await fetchPcmTrunkGroupData();
        } else {
          showMessage("error", "Failed to save PSTN Group. Please try again.");
        }
      }
    } catch (error) {
      console.error("Error saving PSTN group:", error);
      if (error.message === "Network Error") {
        showMessage("error", "Network error. Please check your connection.");
      } else {
        showMessage("error", error.message || "Failed to save PSTN group");
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleSelectRow = (idx) => {
    setSelected((sel) =>
      sel.includes(idx) ? sel.filter((i) => i !== idx) : [...sel, idx],
    );
  };

  const pagedRowIndexes = pagedGroups.map(
    (_, idx) => (page - 1) * itemsPerPage + idx,
  );
  const allPageSelected =
    pagedRowIndexes.length > 0 &&
    pagedRowIndexes.every((idx) => selected.includes(idx));
  const somePageSelected =
    pagedRowIndexes.length > 0 &&
    pagedRowIndexes.some((idx) => selected.includes(idx)) &&
    !allPageSelected;

  const handleToggleAll = () => {
    if (allPageSelected) {
      setSelected((prev) =>
        prev.filter((idx) => !pagedRowIndexes.includes(idx)),
      );
    } else {
      setSelected((prev) => {
        const next = [...prev];
        pagedRowIndexes.forEach((idx) => {
          if (!next.includes(idx)) next.push(idx);
        });
        return next;
      });
    }
  };

  const handleInverse = () => {
    const otherPageSelections = selected.filter(
      (idx) => !pagedRowIndexes.includes(idx),
    );
    const invertedPagedSelections = pagedRowIndexes.filter(
      (idx) => !selected.includes(idx),
    );
    setSelected([...otherPageSelections, ...invertedPagedSelections]);
  };

  const handleCheckAllRows = () => {
    setSelected(pagedRowIndexes);
  };
  const handleUncheckAllRows = () => {
    setSelected([]);
  };

  // Check if PCM trunk group is referenced by routing rules or number manipulations
  const isPcmGroupReferenced = async (groupId) => {
    try {
      const gid = String(groupId);

      // Check routes (PSTN to IP routes use call_source field for PCM trunk groups)
      try {
        const routeRes = await listIpPstnRoutes("pstn_to_ip");
        const routeList =
          (routeRes && (routeRes.message || routeRes.data)) || [];
        const foundInRoutes = routeList.some((item) => {
          try {
            // In RoutePstnToIPpage, callInitiator is mapped to call_source in the API
            const candidates = [
              item?.call_source,
              item?.callSource,
              item?.call_source_id,
              item?.callInitiator,
              item?.call_initiator,
              item?.callInitiatorId,
              item?.call_initiator_id,
              item?.pcm_trunk_group,
              item?.pcm_trunk_group_id,
            ]
              .filter((v) => v !== undefined && v !== null)
              .map((v) => String(v));
            return candidates.some((v) => v === gid);
          } catch {
            return false;
          }
        });
        if (foundInRoutes) return true;
      } catch (e) {
        console.warn("Route reference check failed:", e?.message);
      }

      // Check number manipulations (if they use PCM trunk groups)
      try {
        const manipRes = await listNumberManipulations();
        const manipList =
          (manipRes && (manipRes.message || manipRes.data)) || [];
        const foundInManip = manipList.some((item) => {
          try {
            const candidates = [
              item?.call_source,
              item?.callSource,
              item?.callInitiator,
              item?.call_initiator,
              item?.callInitiatorId,
              item?.call_initiator_id,
              item?.pcm_trunk_group,
              item?.pcm_trunk_group_id,
            ]
              .filter((v) => v !== undefined && v !== null)
              .map((v) => String(v));
            return candidates.some((v) => v === gid);
          } catch {
            return false;
          }
        });
        if (foundInManip) return true;
      } catch (e) {
        console.warn("Number manipulation reference check failed:", e?.message);
      }

      return false;
    } catch (e) {
      console.warn("Reference check failed:", e?.message);
      return false;
    }
  };

  // Delete individual PCM trunk group
  const handleDeleteSelected = async () => {
    if (selected.length === 0) {
      showMessage("error", "Please select at least one item to delete.");
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete ${selected.length} selected item(s)?`,
    );
    if (!confirmed) return;

    setIsLoadingData(true);
    try {
      let deletedCount = 0;
      let skippedCount = 0;

      for (const idx of selected) {
        const item = groups[idx];
        if (!item || item.groupId == null) continue;

        // Check if group is referenced before deleting
        const inUse = await isPcmGroupReferenced(item.groupId);
        if (inUse) {
          showMessage(
            "error",
            "The PCM trunk group cannot be deleted because it is quoted by the routing rule!",
          );
          skippedCount++;
          continue;
        }

        // Delete the group
        try {
          const response = await deletePstnGroup(String(item.groupId));
          if (response?.response) {
            deletedCount++;
          } else {
            console.warn(
              `Failed to delete group ${item.groupId}:`,
              response?.message,
            );
          }
        } catch (deleteError) {
          console.error(`Error deleting group ${item.groupId}:`, deleteError);
        }
      }

      // Refresh data from server
      await fetchPcmTrunkGroupData();
      setSelected([]);

      if (deletedCount > 0) {
        showMessage(
          "success",
          `Successfully deleted ${deletedCount} item(s)${skippedCount > 0 ? `, ${skippedCount} skipped (in use)` : ""}`,
        );
      } else if (skippedCount > 0) {
        showMessage(
          "warning",
          `No items deleted. ${skippedCount} item(s) are in use and cannot be deleted.`,
        );
      } else {
        showMessage("info", "No items were deleted.");
      }
    } catch (error) {
      console.error("Error deleting selected items:", error);
      if (error.message === "Network Error") {
        showMessage("error", "Network error. Please check your connection.");
      } else {
        showMessage(
          "error",
          error.message || "Failed to delete selected items",
        );
      }
    } finally {
      setIsLoadingData(false);
    }
  };

  // Delete all PCM trunk groups
  const handleClearAll = async () => {
    if (groups.length === 0) {
      showMessage("info", "No PCM trunk groups to clear");
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to delete ALL PCM trunk groups? This action cannot be undone.",
    );
    if (!confirmed) return;

    setIsLoadingData(true);
    try {
      let deletedCount = 0;
      let skippedCount = 0;

      for (const group of groups) {
        // Check if group is referenced before deleting
        const inUse = await isPcmGroupReferenced(group.groupId);
        if (inUse) {
          showMessage(
            "error",
            "The PCM trunk group cannot be deleted because it is quoted by the routing rule!",
          );
          skippedCount++;
          continue;
        }

        // Delete the group
        try {
          const response = await deletePstnGroup(String(group.groupId));
          if (response?.response) {
            deletedCount++;
          } else {
            console.warn(
              `Failed to delete group ${group.groupId}:`,
              response?.message,
            );
          }
        } catch (deleteError) {
          console.error(`Error deleting group ${group.groupId}:`, deleteError);
        }
      }

      // Refresh data from server
      await fetchPcmTrunkGroupData();
      setSelected([]);
      setPage(1);

      if (deletedCount > 0) {
        showMessage(
          "success",
          `Successfully deleted ${deletedCount} PCM trunk group(s)${skippedCount > 0 ? `, ${skippedCount} skipped (in use)` : ""}`,
        );
      } else if (skippedCount > 0) {
        showMessage(
          "warning",
          `No groups deleted. ${skippedCount} group(s) are in use and cannot be deleted.`,
        );
      } else {
        showMessage("info", "No groups were deleted.");
      }
    } catch (error) {
      console.error("Error deleting all PCM trunk groups:", error);
      if (error.message === "Network Error") {
        showMessage("error", "Network error. Please check your connection.");
      } else {
        showMessage(
          "error",
          error.message || "Failed to delete all PCM trunk groups",
        );
      }
    } finally {
      setIsLoadingData(false);
    }
  };

  return {
    groups,
    isModalOpen,
    formData,
    setFormData,
    checkAll,
    selected,
    page,
    setPage,
    spansData,
    isLoadingSpans,
    isSaving,
    isLoadingData,
    message,
    setMessage,
    isCompact,
    tableScrollRef,
    itemsPerPage,
    totalPages,
    pagedGroups,
    showMessage,
    fetchSpansData,
    fetchPcmTrunkGroupData,
    handleOpenModal,
    getUsedPstnSpans,
    isSpanAvailable,
    handleCloseModal,
    handleInputChange,
    handleTrunkCheckbox,
    handleCheckAll,
    handleUncheckAll,
    handleSave,
    handleSelectRow,
    pagedRowIndexes,
    allPageSelected,
    somePageSelected,
    handleToggleAll,
    handleInverse,
    handleCheckAllRows,
    handleUncheckAllRows,
    isPcmGroupReferenced,
    handleDeleteSelected,
    handleClearAll,
  };
}
