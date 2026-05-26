import React, { useState, useEffect, useRef } from "react";
import {
  PCM_TRUNK_GROUP_FIELDS,
  PCM_TRUNK_GROUP_INITIAL_FORM,
  PCM_TRUNK_GROUP_TABLE_COLUMNS,
} from "../constants/PcmTrunkGroupConstants";
import EditDocumentIcon from "@mui/icons-material/EditDocument";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  TextField,
  Alert,
  CircularProgress,
  Checkbox,
} from "@mui/material";
import {
  listPstn,
  listPstnGroups,
  savePstnGroup,
  deletePstnGroup,
  listIpPstnRoutes,
  listNumberManipulations,
} from "../api/apiService";

// ── Color palette (matches Number-Receiving Rule) ─────────────────────────────
const C = {
  pageBg: "#f8fafc",
  cardBg: "#ffffff",
  cardBorder: "#e2e8f0",
  cardBorderSoft: "#f1f5f9",
  labelText: "#64748b",
  valueText: "#0f172a",
  mutedText: "#94a3b8",
  accent: "#3E5475",
  successGreen: "#22c55e",
  errorRed: "#ef4444",
  purple: "#8b5cf6",
  amber: "#dc2626",
};

const Btn = ({
  children,
  onClick,
  disabled,
  variant = "default",
  style: extraStyle,
  type,
}) => {
  const styles = {
    default: {
      background: C.cardBg,
      color: C.valueText,
      border: "1px solid #9ca3af",
    },
    primary: {
      background:
        "linear-gradient(to bottom, #5A6F8F 0%, #3E5475 60%, #2C3E57 100%)",
      color: "#fff",
      border: "1px solid #5A6F8F",
      fontWeight: 600,
      fontSize: 15,
      borderRadius: 6,
      textTransform: "none",
      padding: "6px 28px",
    },
    cancel: {
      background: "#cbd5e1",
      color: "#374151",
      border: "1px solid #cbd5e1",
      boxShadow: "0 1px 2px rgba(15, 23, 42, 0.08)",
    },
    outline: {
      background: C.cardBg,
      color: C.labelText,
      border: `0.5px solid ${C.cardBorder}`,
    },
  };

  const s = styles[variant] || styles.default;
  const hoverBg = (() => {
    switch (variant) {
      case "primary":
        return "linear-gradient(to bottom, #3E5475 0%, #5A6F8F 100%)";
      case "cancel":
        return "#b6c2d3";
      case "outline":
      case "default":
      default:
        return "#e2e8f0";
    }
  })();

  const baseBg = s.background;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "6px 14px",
        borderRadius: 10,
        fontSize: 12,
        fontWeight: 600,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.6 : 1,
        transition: "all 0.15s ease",
        height: 30,
        gap: 6,
        whiteSpace: "nowrap",
        ...s,
        ...extraStyle,
      }}
      onMouseEnter={(e) => {
        if (!disabled) e.currentTarget.style.background = hoverBg;
      }}
      onMouseLeave={(e) => {
        if (!disabled) e.currentTarget.style.background = baseBg;
      }}
    >
      {children}
    </button>
  );
};

const TH = ({ children, style: extra }) => (
  <th
    style={{
      background: "#f8fafc",
      color: C.labelText,
      fontWeight: 700,
      fontSize: 11,
      padding: "12px 14px",
      textAlign: "center",
      borderBottom: `1px solid ${C.cardBorder}`,
      borderRight: "1px solid #f1f5f9",
      whiteSpace: "nowrap",
      textTransform: "uppercase",
      letterSpacing: "0.14em",
      ...extra,
    }}
  >
    {children}
  </th>
);

// const LOCAL_STORAGE_KEY = 'pcmTrunkGroups';

const PcmTrunkGroupPage = () => {
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
      alert(error?.message || "Failed to load PSTN groups");
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
        alert(
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
      alert("Please select a Group ID.");
      return;
    }

    if (!formData.description || formData.description.trim() === "") {
      alert("Please fill in the Description field.");
      return;
    }

    if (!formData.pstnIds || formData.pstnIds.length === 0) {
      alert("Please select at least one PSTN ID.");
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
      alert(
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

          alert(
            `Successfully created ${formData.pstnIds.length} PSTN group(s)!`,
          );
          setIsModalOpen(false);
          await fetchPcmTrunkGroupData();
        } else {
          alert("Failed to create some PSTN groups. Please try again.");
        }
      } else {
        const response = await savePstnGroup(
          finalIndex,
          formData.pstnIds,
          formData.description,
        );
        if (response?.response) {
          alert("PSTN Group saved successfully!");
          setIsModalOpen(false);
          await fetchPcmTrunkGroupData();
        } else {
          alert("Failed to save PSTN Group. Please try again.");
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

  const rootStyle = {
    background: "#fff",
    minHeight: "calc(100vh - 128px)",
    padding: "40px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: groups.length === 0 ? "center" : "flex-start",
    position: "relative",
    boxSizing: "border-box",
  };

  const addNewButtonStyleSip = {
    background: "linear-gradient(to bottom, #3bb6f5 0%, #0e8fd6 100%)",
    color: "#fff",
    fontSize: 16,
    padding: "7px 32px",
    border: "none",
    borderRadius: 6,
    boxShadow: "0 2px 4px rgba(0,0,0,0.10)",
    cursor: "pointer",
    minWidth: 120,
    marginTop: 0,
  };

  const handleSelectRow = (idx) => {
    setSelected((sel) =>
      sel.includes(idx) ? sel.filter((i) => i !== idx) : [...sel, idx],
    );
  };

  const tableStyle = {
    width: "100%",
    borderCollapse: "collapse",
  };
  const thStyle = {
    background: "#fff",
    color: "#222",
    fontWeight: 600,
    fontSize: 15,
    border: "1px solid #bbb",
    padding: "6px 8px",
    whiteSpace: "nowrap",
  };
  const tdStyle = {
    border: "1px solid #bbb",
    padding: "6px 8px",
    fontSize: 14,
    background: "#fff",
    textAlign: "center",
    whiteSpace: "nowrap",
  };

  // Add table scroll handler (for future custom scroll logic, matches SIP pages)
  const handleTableScroll = (e) => {
    // You can add custom scroll logic here if needed
  };

  // Add styles for table container, blue bar, scrollbar, buttons, and pagination (copied from SIP Register page)
  const tableContainerStyle = {
    width: "100%",
    maxWidth: "100%",
    margin: "0 auto",
    background: "#f8fafd",
    border: "2px solid #888",
    borderRadius: 8,
    boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
  };
  const blueBarStyle = {
    width: "100%",
    height: 36,
    background: "linear-gradient(#3E5475 100%)",
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    marginBottom: 0,
    display: "flex",
    alignItems: "center",
    fontWeight: 600,
    fontSize: 18,
    color: "#2266aa",
    justifyContent: "center",
    boxShadow: "0 2px 8px 0 rgba(80,160,255,0.10)",
  };
  const customScrollbarRowStyle = {
    width: "100%",
    margin: "0 auto",
    background: "#f4f6fa",
    display: "flex",
    alignItems: "center",
    height: 24,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    border: "2px solid #888",
    borderTop: "none",
    padding: "0 4px",
    boxSizing: "border-box",
  };
  const customScrollbarTrackStyle = {
    flex: 1,
    height: 12,
    background: "#e3e7ef",
    borderRadius: 8,
    position: "relative",
    margin: "0 4px",
    overflow: "hidden",
  };
  const customScrollbarThumbStyle = {
    position: "absolute",
    height: 12,
    background: "#888",
    borderRadius: 8,
    cursor: "pointer",
    top: 0,
  };
  const customScrollbarArrowStyle = {
    width: 18,
    height: 18,
    background: "#e3e7ef",
    border: "1px solid #bbb",
    borderRadius: 8,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 16,
    color: "#888",
    cursor: "pointer",
    userSelect: "none",
  };
  const tableButtonStyle = {
    background: "linear-gradient(to bottom, #e3e7ef 0%, #bfc6d1 100%)",
    color: "#222",
    fontSize: 15,
    padding: "4px 18px",
    border: "1px solid #bbb",
    borderRadius: 6,
    boxShadow: "0 1px 2px rgba(0,0,0,0.10)",
    cursor: "pointer",
    fontWeight: 500,
  };
  const addNewButtonStyle = {
    ...tableButtonStyle,
    background: "linear-gradient(to bottom, #3bb6f5 0%, #0e8fd6 100%)",
    color: "#fff",
  };
  const paginationButtonStyle = {
    ...tableButtonStyle,
    fontSize: 13,
    padding: "2px 10px",
    minWidth: 0,
    borderRadius: 4,
  };
  const pageSelectStyle = {
    fontSize: 13,
    padding: "2px 6px",
    borderRadius: 3,
    border: "1px solid #bbb",
    background: "#fff",
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
      alert("Please select at least one item to delete.");
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
          alert(
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
          alert(
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

  return (
    <div
      style={{
        backgroundColor: C.pageBg,
        minHeight: "calc(100vh - 80px)",
        padding: 16,
      }}
    >
      {/* Message Display */}
      {message.text && (
        <Alert
          severity={message.type}
          onClose={() => setMessage({ type: "", text: "" })}
          sx={{
            position: "fixed",
            top: 20,
            right: 20,
            zIndex: 9999,
            minWidth: 300,
            boxShadow: 3,
          }}
        >
          {message.text}
        </Alert>
      )}

      <div style={{ maxWidth: "100%", margin: "0 auto" }}>
        {/* Breadcrumb */}
        <div style={{ fontSize: 12, color: C.mutedText, marginBottom: 16, display: "flex", gap: 4 }}>
          E1-PRI &rsaquo; PCM &rsaquo;{" "}
          <span style={{ color: "#1e293b", fontWeight: 600 }}>
            PCM Trunk Group
          </span>
        </div>

        {/* Main Card */}
        <div
          style={{
            background: "#ffffff",
            borderRadius: 22,
            overflow: "hidden",
            border: `1px solid ${C.cardBorder}`,
            boxShadow: "0 10px 30px rgba(15,23,42,0.06)",
          }}
        >
          {/* Toolbar */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "14px 18px",
              borderBottom: "1px solid #e2e8f0",
              background: "#ffffff",
              flexWrap: "wrap",
              gap: 10,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span
                style={{
                  background: "#f1f5f9",
                  border: `1px solid #e2e8f0`,
                  color: C.labelText,
                  fontSize: 11,
                  fontWeight: 700,
                  padding: "5px 14px",
                  borderRadius: 999,
                }}
              >
                Page {page} · {groups.length} records
              </span>
              {selected.length > 0 && (
                <span
                  style={{
                    background: "#eff6ff",
                    color: C.accent,
                    fontSize: 11,
                    fontWeight: 700,
                    padding: "5px 12px",
                    borderRadius: 999,
                    border: `1px solid ${C.accent}`,
                  }}
                >
                  {selected.length} selected
                </span>
              )}
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                flexWrap: "wrap",
              }}
            >
              <Btn
                variant="cancel"
                onClick={handleInverse}
                disabled={isLoadingData}
                style={{ height: 30 }}
              >
                Inverse
              </Btn>
              <Btn
                variant="cancel"
                onClick={handleClearAll}
                disabled={isLoadingData || groups.length === 0}
                style={{ height: 30 }}
              >
                {isLoadingData ? (
                  <CircularProgress size={12} color="inherit" />
                ) : (
                  "Clear All"
                )}
              </Btn>
              <Btn
                variant="cancel"
                onClick={handleDeleteSelected}
                disabled={isLoadingData || selected.length === 0}
                style={{ height: 30 }}
              >
                {isLoadingData ? (
                  <CircularProgress size={12} color="inherit" />
                ) : (
                  <>
                    <DeleteOutlineOutlinedIcon sx={{ fontSize: 16 }} />
                    Delete
                  </>
                )}
              </Btn>
              <Btn
                variant="primary"
                onClick={() => handleOpenModal()}
                disabled={isLoadingSpans}
                style={{
                  height: 30,
                  padding: "6px 14px",
                  fontSize: 12,
                  borderRadius: 10,
                }}
              >
                + Add New
              </Btn>
            </div>
          </div>

          {/* Table */}
          <div style={{ overflowX: "auto" }}>
            {isLoadingData ? (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  padding: 48,
                }}
              >
                <CircularProgress size={28} style={{ color: C.accent }} />
              </div>
            ) : (
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  tableLayout: "auto",
                  minWidth: 900,
                }}
              >
                <thead>
                  <tr>
                    <TH style={{ width: 36 }}>
                      <Checkbox
                        size="small"
                        checked={allPageSelected}
                        indeterminate={somePageSelected}
                        onChange={handleToggleAll}
                        sx={{
                          padding: "1px",
                          color: C.accent,
                          "&.Mui-checked": { color: C.accent },
                          "&.MuiCheckbox-indeterminate": { color: C.accent },
                        }}
                      />
                    </TH>
                    {PCM_TRUNK_GROUP_TABLE_COLUMNS.filter(
                      (c) => c.key !== "check",
                    ).map((c) => (
                      <TH key={c.key}>{c.label}</TH>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {groups.length === 0 ? (
                    <tr>
                      <td
                        colSpan={PCM_TRUNK_GROUP_TABLE_COLUMNS.length}
                        style={{
                          textAlign: "center",
                          padding: "36px 0",
                          color: C.mutedText,
                          fontSize: 13,
                        }}
                      >
                        No PCM Trunk Groups found.
                      </td>
                    </tr>
                  ) : (
                    pagedGroups.map((item, idx) => {
                      const realIdx = (page - 1) * itemsPerPage + idx;
                      const isRowChecked = selected.includes(realIdx);
                      const rowBg = isRowChecked
                        ? "#e0f2fe"
                        : idx % 2 === 1
                          ? "#f8fafc"
                          : "#ffffff";

                      return (
                        <tr
                          key={realIdx}
                          style={{
                            background: rowBg,
                            borderBottom: "1px solid #f1f5f9",
                            transition: "background 0.15s ease",
                          }}
                          onMouseEnter={(e) => {
                            if (!isRowChecked)
                              e.currentTarget.style.background = "#f8fafc";
                          }}
                          onMouseLeave={(e) => {
                            if (!isRowChecked)
                              e.currentTarget.style.background = rowBg;
                          }}
                        >
                          <td
                            style={{
                              textAlign: "center",
                              padding: "10px 0",
                              borderRight: "1px solid #f1f5f9",
                            }}
                          >
                            <Checkbox
                              size="small"
                              checked={isRowChecked}
                              onChange={() => handleSelectRow(realIdx)}
                              disabled={isLoadingData}
                              sx={{
                                padding: "1px",
                                color: C.accent,
                                "&.Mui-checked": { color: C.accent },
                              }}
                            />
                          </td>

                          {PCM_TRUNK_GROUP_TABLE_COLUMNS.filter(
                            (col) => col.key !== "check",
                          ).map((col) => {
                            if (col.key === "modify") {
                              return (
                                <td
                                  key={col.key}
                                  style={{
                                    padding: "7px 8px",
                                    textAlign: "center",
                                  }}
                                >
                                  <EditDocumentIcon
                                    className="cursor-pointer text-blue-600 mx-auto opacity-70 hover:opacity-100 transition-opacity"
                                    titleAccess="Edit"
                                    onClick={() => {
                                      if (!isLoadingData) {
                                        handleOpenModal(item, realIdx);
                                      }
                                    }}
                                    style={{
                                      fontSize: 22,
                                      opacity: isLoadingData ? 0.4 : undefined,
                                      pointerEvents: isLoadingData
                                        ? "none"
                                        : "auto",
                                    }}
                                  />
                                </td>
                              );
                            }
                            if (col.key === "pstnIds") {
                              return (
                                <td
                                  key={col.key}
                                  style={{
                                    padding: "10px 14px",
                                    fontSize: 13,
                                    color: C.valueText,
                                    textAlign: "center",
                                    borderRight: "1px solid #f1f5f9",
                                  }}
                                >
                                  {item.pstnIds && item.pstnIds.length > 0 ? (
                                    item.pstnIds.join(", ")
                                  ) : (
                                    <span style={{ color: C.mutedText }}>
                                      —
                                    </span>
                                  )}
                                </td>
                              );
                            }
                            return (
                              <td
                                key={col.key}
                                style={{
                                  padding: "10px 14px",
                                  fontSize: 13,
                                  color: C.valueText,
                                  textAlign: "center",
                                  borderRight: "1px solid #f1f5f9",
                                }}
                              >
                                {item[col.key] !== undefined &&
                                item[col.key] !== "" ? (
                                  item[col.key]
                                ) : (
                                  <span style={{ color: C.mutedText }}>—</span>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination footer */}
          {!isLoadingData && groups.length > 0 && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "12px 18px",
                borderTop: `1px solid ${C.cardBorder}`,
                background: "#ffffff",
              }}
            >
              <span style={{ fontSize: 11, color: C.mutedText }}>
                Showing {pagedGroups.length} of {groups.length} group
                {groups.length !== 1 ? "s" : ""} · Page {page} of {totalPages}
              </span>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  flexWrap: "wrap",
                }}
              >
                <Btn
                  onClick={() => setPage(1)}
                  disabled={page === 1}
                  variant="outline"
                >
                  First
                </Btn>
                <Btn
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                  variant="outline"
                >
                  ← Prev
                </Btn>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: C.accent,
                    background: "#e0f2fe",
                    padding: "5px 14px",
                    borderRadius: 6,
                    border: `0.5px solid ${C.cardBorder}`,
                  }}
                >
                  Page {page}
                </span>
                <Btn
                  onClick={() => setPage(page + 1)}
                  disabled={page === totalPages}
                  variant="outline"
                >
                  Next →
                </Btn>
                <Btn
                  onClick={() => setPage(totalPages)}
                  disabled={page === totalPages}
                  variant="outline"
                >
                  Last
                </Btn>
                <span style={{ fontSize: 11, color: C.mutedText }}>Go to</span>
                <select
                  value={page}
                  onChange={(e) => setPage(Number(e.target.value))}
                  style={{
                    fontSize: 11,
                    borderRadius: 4,
                    border: `0.5px solid ${C.cardBorder}`,
                    padding: "3px 6px",
                    color: C.labelText,
                    background: "#fff",
                  }}
                >
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ),
                  )}
                </select>
              </div>
            </div>
          )}
        </div>
      </div>
      {/* Modal Dialog */}
      <Dialog
        open={isModalOpen}
        onClose={handleCloseModal}
        maxWidth={false}
        PaperProps={{
          sx: {
            width: 500,
            maxWidth: "95vw",
            p: 0,
            borderRadius: "8px",
            overflow: "hidden",
            boxShadow:
              "0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)",
          },
        }}
      >
        <DialogTitle
          style={{
            background: "#1e2d42",
            color: "#ffffff",
            fontWeight: 600,
            fontSize: 16,
            padding: "16px 24px",
            textAlign: "center",
            borderTopLeftRadius: 8,
            borderTopRightRadius: 8,
          }}
        >
          {formData.originalIndex !== undefined
            ? "Edit PCM Trunk Group"
            : "Add PCM Trunk Group"}
        </DialogTitle>
        <DialogContent
          style={{
            padding: "20px 24px",
            backgroundColor: "#f8fafc",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 12,
              width: "100%",
            }}
          >
            {PCM_TRUNK_GROUP_FIELDS.map((field) => (
              <div
                key={field.name}
                style={{
                  display: "flex",
                  alignItems: "center",
                  background: "#ffffff",
                  border: "1px solid #cbd5e1",
                  borderRadius: 6,
                  padding: "6px 12px",
                  gap: 12,
                  minHeight: 40,
                }}
              >
                <label
                  style={{
                    fontSize: 13,
                    color: "#1e293b",
                    fontWeight: 600,
                    whiteSpace: "nowrap",
                    width: 160,
                  }}
                >
                  {field.label}:
                </label>
                <div className="flex-1" style={{ maxWidth: 280 }}>
                  {field.type === "select" ? (
                    <Select
                      value={formData[field.name]}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          [field.name]: e.target.value,
                        }))
                      }
                      size="small"
                      fullWidth
                      variant="outlined"
                      MenuProps={{
                        PaperProps: {
                          style: { maxHeight: 240, width: "auto" },
                        },
                      }}
                      sx={{
                        fontSize: 13,
                        "& .MuiOutlinedInput-notchedOutline": {
                          borderColor: "#cbd5e1",
                        },
                        "&:hover .MuiOutlinedInput-notchedOutline": {
                          borderColor: "#94a3b8",
                        },
                        "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                          borderColor: "#1e2d42",
                        },
                      }}
                    >
                      {field.options.map((option) => (
                        <MenuItem
                          key={option.value}
                          value={option.value}
                          sx={{ fontSize: 13 }}
                        >
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  ) : (
                    <TextField
                      type={field.type}
                      value={formData[field.name] || ""}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          [field.name]: e.target.value,
                        }))
                      }
                      size="small"
                      fullWidth
                      variant="outlined"
                      placeholder={field.placeholder || ""}
                      sx={{
                        fontSize: 13,
                        "& .MuiOutlinedInput-notchedOutline": {
                          borderColor: "#cbd5e1",
                        },
                        "&:hover .MuiOutlinedInput-notchedOutline": {
                          borderColor: "#94a3b8",
                        },
                        "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                          borderColor: "#1e2d42",
                        },
                      }}
                      inputProps={{
                        style: { fontSize: 13, padding: "6px 8px" },
                      }}
                    />
                  )}
                </div>
              </div>
            ))}

            {/* PCM Trunks Block */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                background: "#ffffff",
                border: "1px solid #cbd5e1",
                borderRadius: 6,
                padding: "12px",
                gap: 8,
                marginTop: 4,
              }}
            >
              {/* Warning message for multiple trunk selection */}
              {formData.pstnIds && formData.pstnIds.length > 1 && (
                <div
                  style={{
                    padding: "8px 12px",
                    background: "#fffbeb",
                    border: "1px solid #fef3c7",
                    borderRadius: 6,
                    color: "#b45309",
                    fontSize: 12,
                    fontWeight: 500,
                  }}
                >
                  <strong>Note:</strong> You have selected{" "}
                  {formData.pstnIds.length} PSTN IDs. This will create{" "}
                  {formData.pstnIds.length} separate groups, each with a unique
                  Group ID.
                </div>
              )}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: 8,
                }}
              >
                <span
                  style={{
                    fontSize: 13,
                    color: "#1e293b",
                    fontWeight: 600,
                    whiteSpace: "nowrap",
                    width: 160,
                  }}
                >
                  PCM Trunks:
                </span>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-end",
                    gap: 2,
                  }}
                >
                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      fontSize: 12,
                      fontWeight: 600,
                      color: C.labelText,
                      cursor: "pointer",
                    }}
                  >
                    <Checkbox
                      size="small"
                      checked={(() => {
                        const isEditing = formData.originalIndex !== undefined;
                        const availableSpans = spansData.filter((span) =>
                          isSpanAvailable(
                            span.spanNo,
                            isEditing,
                            formData.originalIndex,
                          ),
                        );
                        return (
                          availableSpans.length > 0 &&
                          formData.pstnIds &&
                          formData.pstnIds.length === availableSpans.length
                        );
                      })()}
                      onChange={(e) => {
                        if (e.target.checked) {
                          const isEditing =
                            formData.originalIndex !== undefined;
                          const availableSpans = spansData
                            .filter((span) =>
                              isSpanAvailable(
                                span.spanNo,
                                isEditing,
                                formData.originalIndex,
                              ),
                            )
                            .map((span) => String(span.spanNo));
                          setFormData((prev) => ({
                            ...prev,
                            pstnIds: availableSpans,
                          }));
                        } else {
                          setFormData((prev) => ({ ...prev, pstnIds: [] }));
                        }
                      }}
                      sx={{
                        padding: "2px",
                        color: C.accent,
                        "&.Mui-checked": { color: C.accent },
                      }}
                    />
                    Check All
                  </label>
                  <span
                    style={{
                      fontSize: 10.5,
                      color: C.mutedText,
                      marginTop: 2,
                    }}
                  >
                    Selects all available PSTN spans
                    {(() => {
                      const isEditing = formData.originalIndex !== undefined;
                      const availableCount = spansData.filter((span) =>
                        isSpanAvailable(
                          span.spanNo,
                          isEditing,
                          formData.originalIndex,
                        ),
                      ).length;
                      const usedCount = spansData.length - availableCount;
                      return (
                        <span style={{ marginLeft: 4 }}>
                          ({availableCount} available
                          {usedCount > 0 ? `, ${usedCount} used` : ""})
                        </span>
                      );
                    })()}
                  </span>
                  {formData.pstnIds && formData.pstnIds.length > 1 && (
                    <span
                      style={{
                        fontSize: 10.5,
                        color: "#0284c7",
                        fontWeight: 600,
                        marginTop: 2,
                      }}
                    >
                      Will create {formData.pstnIds.length} separate groups
                    </span>
                  )}
                </div>
              </div>
              {/* Spans checklist grid */}
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 8,
                  marginTop: 8,
                  padding: "8px 0 0 0",
                  borderTop: "1px dashed #e2e8f0",
                }}
              >
                {isLoadingSpans ? (
                  <div style={{ fontSize: 12, color: C.mutedText }}>
                    Loading spans...
                  </div>
                ) : spansData.length > 0 ? (
                  spansData.map((span) => {
                    const isEditing = formData.originalIndex !== undefined;
                    const isAvailable = isSpanAvailable(
                      span.spanNo,
                      isEditing,
                      formData.originalIndex,
                    );
                    const isChecked =
                      formData.pstnIds &&
                      formData.pstnIds.includes(String(span.spanNo));
                    const isUsed = !isAvailable && !isChecked;

                    return (
                      <label
                        key={span.spanNo}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          background: isChecked ? "#f0f9ff" : "#ffffff",
                          border: `1px solid ${
                            isChecked ? "#0284c7" : "#cbd5e1"
                          }`,
                          borderRadius: 6,
                          padding: "2px 8px",
                          cursor: isAvailable ? "pointer" : "not-allowed",
                          opacity: isAvailable ? 1 : 0.6,
                          fontSize: 12,
                          fontWeight: 600,
                          color: isUsed ? C.errorRed : C.labelText,
                          transition: "all 0.15s ease",
                        }}
                      >
                        <Checkbox
                          size="small"
                          checked={isChecked}
                          disabled={!isAvailable}
                          onChange={() =>
                            handleTrunkCheckbox(String(span.spanNo))
                          }
                          sx={{
                            padding: "2px",
                            color: C.accent,
                            "&.Mui-checked": { color: C.accent },
                          }}
                        />
                        <span style={{ marginLeft: 4 }}>
                          {span.spanNo}
                          {isUsed && (
                            <span
                              style={{
                                fontSize: 10,
                                color: C.errorRed,
                                marginLeft: 4,
                              }}
                            >
                              (used)
                            </span>
                          )}
                        </span>
                      </label>
                    );
                  })
                ) : (
                  <div style={{ fontSize: 12, color: C.mutedText }}>
                    No spans available
                  </div>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
        <DialogActions
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 16,
            padding: "16px 24px",
            background: "#f8fafc",
            borderTop: "1px solid #e2e8f0",
            borderBottomLeftRadius: 8,
            borderBottomRightRadius: 8,
          }}
        >
          <Btn
            variant="primary"
            onClick={handleSave}
            disabled={isSaving}
            style={{ minWidth: 110, height: 34 }}
          >
            {isSaving ? "Saving..." : "Save"}
          </Btn>
          <Btn
            variant="cancel"
            onClick={handleCloseModal}
            disabled={isSaving}
            style={{ minWidth: 110, height: 34, borderRadius: 6 }}
          >
            Close
          </Btn>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default PcmTrunkGroupPage;
