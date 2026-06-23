import React, { useState, useEffect, useRef } from "react";
import {
  PCM_TRUNK_GROUP_FIELDS,
  PCM_TRUNK_GROUP_INITIAL_FORM,
  PCM_TRUNK_GROUP_TABLE_COLUMNS,
} from "../../../constants/PcmTrunkGroupConstants";
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
} from "../../../api/apiService";
// ── Color palette (matches Number-Receiving Rule) ─────────────────────────────
const C = {
  pageBg: "var(--bg-main)",
  cardBg: "var(--bg-surface)",
  cardBorder: "var(--border-strong)",
  labelText: "var(--text-primary)",
  valueText: "var(--text-primary)",
  mutedText: "var(--text-muted)",
  strongText: "var(--text-primary)",
  accent: "var(--accent-brand)",
  successGreen: "#22c55e",
  errorRed: "#ef4444",
  purple: "#8b5cf6",
  amber: "#dc2626",
};

const BTN_BASE =
  "inline-flex items-center justify-center gap-[6px] h-[30px] px-[14px] py-[6px] rounded-[10px] text-[12px] font-semibold whitespace-nowrap transition-all duration-150 ease-in-out cursor-pointer border disabled:cursor-not-allowed disabled:opacity-60";
const BTN_DEFAULT = `${BTN_BASE} bg-[var(--bg-surface)] text-[var(--text-primary)] border-[var(--border-subtle)] hover:bg-[var(--row-alt)]`;
const BTN_OUTLINE = `${BTN_BASE} bg-[var(--bg-surface)] text-[var(--text-label)] border-[var(--border-strong)] hover:bg-[var(--row-alt)]`;
const BTN_CANCEL = `${BTN_BASE} bg-[#cbd5e1] text-[#374151] border-[#cbd5e1] shadow-[0_1px_2px_rgba(15,23,42,0.08)] hover:bg-[#b6c2d3]`;
const BTN_PRIMARY = `${BTN_BASE} text-white border-[#5A6F8F] bg-[linear-gradient(to_bottom,#5A6F8F_0%,#3E5475_60%,#2C3E57_100%)] hover:bg-[linear-gradient(to_bottom,#3E5475_0%,#5A6F8F_100%)]`;

const btnVariantCls = {
  default: BTN_DEFAULT,
  primary: BTN_PRIMARY,
  cancel: BTN_CANCEL,
  outline: BTN_OUTLINE,
  danger: `${BTN_BASE} bg-[#fef2f2] text-[#dc2626] border-[0.5px] border-[#fecaca] hover:bg-[#fca5a5]`,
};

const Btn = ({ children, onClick, disabled, variant = "default", className = "", style, type, title }) => (
  <button
    type={type}
    onClick={onClick}
    disabled={disabled}
    title={title}
    style={style}
    className={`${btnVariantCls[variant] || btnVariantCls.default} ${className}`.trim()}
  >
    {children}
  </button>
);

const CARD_RADIUS = 20;

// ── Local modal field UI (inlined from e1PriSharedUi) ──
const OUTLINED_BORDER = "var(--border-subtle)";
const OUTLINED_HOVER = "var(--border-strong)";
const OUTLINED_FOCUS = "var(--status-primary)";

const muiTextFieldSx = {
  "& .MuiOutlinedInput-root": {
    backgroundColor: "var(--bg-surface)",
    "& fieldset": { borderColor: OUTLINED_BORDER, transition: "border-color 0.2s ease" },
    "&:hover fieldset": { borderColor: OUTLINED_HOVER },
    "&.Mui-focused fieldset": { borderColor: OUTLINED_FOCUS, borderWidth: 2 },
    "&.Mui-focused:hover fieldset": { borderColor: OUTLINED_FOCUS, borderWidth: 2 },
  },
};

const muiSelectSx = {
  fontSize: 13,
  backgroundColor: "var(--bg-surface)",
  "& .MuiOutlinedInput-root": { minHeight: 36, backgroundColor: "var(--bg-surface)" },
  "& .MuiSelect-select": {
    display: "flex",
    alignItems: "center",
    padding: "7px 32px 7px 10px !important",
    lineHeight: 1.35,
    boxSizing: "border-box",
  },
  "& .MuiOutlinedInput-notchedOutline": {
    borderColor: OUTLINED_BORDER,
    transition: "border-color 0.2s ease",
  },
  "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: OUTLINED_HOVER },
  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
    borderColor: OUTLINED_FOCUS,
    borderWidth: 2,
  },
};

const modalTextFieldSx = {
  ...muiTextFieldSx,
  "& .MuiOutlinedInput-root": {
    ...muiTextFieldSx["& .MuiOutlinedInput-root"],
    height: 32,
  },
  "& .MuiOutlinedInput-input": { backgroundColor: "var(--bg-surface)" },
};

const modalSelectSx = {
  ...muiSelectSx,
  width: "100%",
  "& .MuiOutlinedInput-root": {
    minHeight: 36,
    height: 36,
    backgroundColor: "var(--bg-surface)",
  },
};

const addHostFormPanelStyle = {
  display: "flex",
  flexDirection: "column",
  gap: 14,
  background: "var(--row-alt)",
  border: `1px solid ${C.cardBorder}`,
  borderRadius: 8,
  padding: 20,
};

const E1_PAGE = "bg-[var(--bg-main)] min-h-[calc(100vh-80px)] p-[16px]";
const E1_INNER = "w-full max-w-full mx-auto";
const E1_CARD =
  "overflow-hidden rounded-[10px] border-[1.5px] border-[var(--border-strong)] bg-[var(--bg-surface)] shadow-[0_10px_30px_rgba(15,23,42,0.06)]";
const E1_TOOLBAR =
  "flex min-h-[44px] flex-wrap items-center justify-between gap-[12px] border-b border-[var(--border-strong)] bg-[var(--bg-surface)] px-[14px] py-[7px] rounded-t-[20px]";
const E1_TOOLBAR_LEFT = "flex flex-wrap items-center gap-[8px]";
const E1_TOOLBAR_ACTIONS = "flex flex-wrap items-center gap-[8px]";
const E1_SELECTED_BADGE =
  "rounded-full border border-[#3E5475] bg-[#eff6ff] px-[12px] py-[5px] text-[11px] font-bold text-[var(--text-label)]";
const E1_PAGINATION =
  "flex items-center justify-between overflow-hidden border-t border-[var(--border-strong)] bg-[var(--bg-surface)] px-[14px] py-[7px] rounded-b-[20px]";
const E1_PAGE_BADGE =
  "rounded-[6px] border border-[var(--border-strong)] bg-[#e0f2fe] px-[14px] py-[5px] text-[11px] font-semibold text-[var(--text-label)]";
const E1_TOAST_SX = {
  position: "fixed",
  top: 20,
  right: 20,
  zIndex: 9999,
  minWidth: 300,
  boxShadow: 3,
};

const modalInputProps = {
  style: { fontSize: 13, height: 32, padding: "0 8px", boxSizing: "border-box" },
};

const e1DialogTitleStyle = {
  background: "#1e2d42",
  color: "#ffffff",
  fontWeight: 600,
  fontSize: 16,
  padding: "16px 24px",
  textAlign: "center",
  borderTopLeftRadius: 8,
  borderTopRightRadius: 8,
};

const e1DialogContentStyle = { padding: "24px", backgroundColor: "var(--bg-surface)" };

const e1DialogFormStyle = {
  display: "flex",
  flexDirection: "column",
  gap: 14,
  background: "var(--row-alt)",
  border: "1px solid var(--border-subtle)",
  borderRadius: 8,
  padding: 20,
};

const e1DialogFieldRowStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 12,
};

const e1DialogFieldLabelStyle = {
  fontSize: 13,
  color: "var(--text-primary)",
  fontWeight: 600,
  whiteSpace: "nowrap",
  width: 170,
  lineHeight: 1.2,
  textAlign: "left",
};

const e1DialogFieldControlStyle = { width: "min(100%, 320px)" };

const e1DialogActionsStyle = {
  display: "flex",
  justifyContent: "center",
  gap: 16,
  padding: "16px 24px",
  background: "var(--row-alt)",
  borderTop: "1px solid #9CA3AF",
  borderBottomLeftRadius: 8,
  borderBottomRightRadius: 8,
};

const e1DialogPaperSx = {
  width: 600,
  maxWidth: "95vw",
  mx: "auto",
  p: 0,
  borderRadius: 2,
  overflow: "hidden",
  boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)",
};

const E1Breadcrumb = ({ section, current }) => (
  <div className="mb-[16px] flex flex-wrap items-center gap-[4px] text-[12px] font-normal text-[#94a3b8]">
    <span>E1-PRI</span>
    <span>&gt;</span>
    <span>{section}</span>
    <span>&gt;</span>
    <span className="font-semibold text-[#1e293b]">{current}</span>
  </div>
);


const TH = ({ children, style: extra }) => (
  <th
    style={{
      background: "var(--table-header-bg)",
      color: C.labelText,
      fontWeight: 700,
      fontSize: 11,
      padding: "8px 14px",
      textAlign: "center",
      borderBottom: `1px solid ${C.cardBorder}`,
      borderRight: `1px solid ${C.cardBorder}`,
      whiteSpace: "nowrap",
      textTransform: "uppercase",
      letterSpacing: "0.14em",
      ...extra,
    }}
  >
    {children}
  </th>
);

const checkboxSx = {
  padding: "1px",
  color: "var(--text-primary)",
  "&.Mui-checked": { color: "#0284c7" },
  "&.MuiCheckbox-indeterminate": { color: "#0284c7" },
};

const tdStyle = {
  padding: "6px 14px",
  fontSize: 13,
  color: C.valueText,
  textAlign: "center",
  background: "var(--bg-surface)",
  borderBottom: `1px solid ${C.cardBorder}`,
  borderRight: `1px solid ${C.cardBorder}`,
  whiteSpace: "nowrap",
};

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

  return (
    <div className={E1_PAGE}>
      {/* Message Display */}
      {message.text && (
        <Alert
          severity={message.type}
          onClose={() => setMessage({ type: "", text: "" })}
          sx={E1_TOAST_SX}
        >
          {message.text}
        </Alert>
      )}

      <div style={{ maxWidth: "100%", margin: "0 auto" }}>
        <E1Breadcrumb section="PCM" current="PCM Trunk Group" />

        {/* Main Card */}
        <div
          style={{
            background: "var(--bg-surface)",
            borderRadius: 10,
            overflow: "hidden",
            border: `1.5px solid ${C.cardBorder}`,
            boxShadow: "0 10px 30px rgba(15,23,42,0.06)",
          }}
        >
          {/* Toolbar */}
          <div className={E1_TOOLBAR}>
            <div className={E1_TOOLBAR_LEFT}>
              {selected.length > 0 && (
                <span className={E1_SELECTED_BADGE}>
                  {selected.length} selected
                </span>
              )}
            </div>

            <div className={E1_TOOLBAR_ACTIONS}>
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
          ) : groups.length === 0 ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                minHeight: 240,
                padding: 24,
                textAlign: "center",
                borderBottomLeftRadius: CARD_RADIUS,
                borderBottomRightRadius: CARD_RADIUS,
              }}
            >
              <div
                style={{
                  color: "var(--text-primary)",
                  fontSize: 13,
                  fontWeight: 600,
                  marginBottom: 16,
                }}
              >
                No PCM Trunk Groups found.
              </div>
              <Btn
                variant="cancel"
                onClick={() => handleOpenModal()}
                disabled={isLoadingSpans}
                style={{ padding: "8px 24px", fontSize: 12, borderRadius: 6 }}
              >
                + Add New
              </Btn>
            </div>
          ) : (
            <>
              <div style={{ overflowX: "auto" }}>
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "separate",
                    borderSpacing: 0,
                    tableLayout: "auto",
                    minWidth: 900,
                  }}
                >
                  <thead>
                    <tr>
                      <TH style={{ width: 36, borderLeft: "none" }}>
                        <Checkbox
                          size="small"
                          checked={allPageSelected}
                          indeterminate={somePageSelected}
                          onChange={handleToggleAll}
                          sx={checkboxSx}
                        />
                      </TH>
                      {PCM_TRUNK_GROUP_TABLE_COLUMNS.filter(
                        (c) => c.key !== "check",
                      ).map((c) => (
                        <TH
                          key={c.key}
                          style={
                            c.key === "modify"
                              ? { borderRight: "none" }
                              : undefined
                          }
                        >
                          {c.label}
                        </TH>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {pagedGroups.map((item, idx) => {
                      const realIdx = (page - 1) * itemsPerPage + idx;
                      const isRowChecked = selected.includes(realIdx);
                      const isLastRow = idx === pagedGroups.length - 1;
                      const rowBg = isRowChecked
                        ? "#e0f2fe"
                        : idx % 2 === 1
                          ? "#f8fafc"
                          : "#ffffff";
                      const lastRowCellStyle = isLastRow
                        ? { borderBottom: "none" }
                        : {};

                      return (
                        <tr
                          key={realIdx}
                          style={{
                            background: rowBg,
                            transition: "background 0.15s ease",
                          }}
                          onMouseEnter={(e) => {
                            if (!isRowChecked)
                              e.currentTarget.style.background = "var(--row-alt)";
                          }}
                          onMouseLeave={(e) => {
                            if (!isRowChecked)
                              e.currentTarget.style.background = rowBg;
                          }}
                        >
                          <td
                            style={{
                              ...tdStyle,
                              background: rowBg,
                              padding: "6px 0",
                              borderLeft: "none",
                              ...lastRowCellStyle,
                            }}
                          >
                            <Checkbox
                              size="small"
                              checked={isRowChecked}
                              onChange={() => handleSelectRow(realIdx)}
                              disabled={isLoadingData}
                              sx={checkboxSx}
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
                                    ...tdStyle,
                                    background: rowBg,
                                    padding: "6px 8px",
                                    borderRight: "none",
                                    ...lastRowCellStyle,
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
                                    ...tdStyle,
                                    background: rowBg,
                                    ...lastRowCellStyle,
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
                                  ...tdStyle,
                                  background: rowBg,
                                  ...lastRowCellStyle,
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
                    })}
                  </tbody>
                </table>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "7px 14px",
                  borderTop: `1px solid ${C.cardBorder}`,
                  background: "var(--bg-surface)",
                  borderBottomLeftRadius: CARD_RADIUS,
                  borderBottomRightRadius: CARD_RADIUS,
                  overflow: "hidden",
                }}
              >
                <span style={{ fontSize: 11, color: C.mutedText }}>
                  Showing {pagedGroups.length} record
                  {pagedGroups.length !== 1 ? "s" : ""} on page {page}
                </span>
                <div style={{ display: "flex", gap: 8 }}>
                  <Btn
                    onClick={() => setPage(page - 1)}
                    disabled={page <= 1}
                    variant="outline"
                  >
                    ← Prev
                  </Btn>
                  <span className={E1_PAGE_BADGE}>
                    Page {page} of {totalPages}
                  </span>
                  <Btn
                    onClick={() => setPage(page + 1)}
                    disabled={page >= totalPages}
                    variant="outline"
                  >
                    Next →
                  </Btn>
                </div>
              </div>
            </>
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
        <DialogContent style={{ padding: "24px", backgroundColor: "var(--bg-surface)" }}>
          <div style={addHostFormPanelStyle}>
            {PCM_TRUNK_GROUP_FIELDS.map((field) => (
              <div
                key={field.name}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 12,
                }}
              >
                <label
                  style={{
                    fontSize: 13,
                    color: C.labelText,
                    fontWeight: 600,
                    whiteSpace: "nowrap",
                    width: 170,
                    textAlign: "left",
                  }}
                >
                  {field.label}:
                </label>
                <div style={{ width: "min(100%, 320px)" }}>
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
                      sx={modalSelectSx}
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
                      sx={{ fontSize: 13, ...modalTextFieldSx }}
                      inputProps={{
                        style: {
                          fontSize: 13,
                          height: 32,
                          padding: "0 8px",
                          boxSizing: "border-box",
                        },
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
                background: "var(--bg-surface)",
                border: `1px solid ${C.cardBorder}`,
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
                   color: C.labelText,
                    fontWeight: 600,
                    whiteSpace: "nowrap",
                    width: 160,
                    
                    marginTop: 2,
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
                        color: "#64748b",
                        "&.Mui-checked": { color: "#0284c7" },
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
                          background: isChecked ? "var(--row-selected)" : "#ffffff",
                          border: `1px solid ${
                            isChecked ? "#0284c7" : C.cardBorder
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
                            color: "#64748b",
                            "&.Mui-checked": { color: "#0284c7" },
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
            background: "var(--row-alt)",
            borderTop: `1px solid ${C.cardBorder}`,
            borderBottomLeftRadius: 8,
            borderBottomRightRadius: 8,
          }}
        >
          <Btn
            variant="primary"
            onClick={handleSave}
            disabled={isSaving}
            style={{ minWidth: 100, height: 33, fontSize: 13, padding: "6px 28px", textTransform: "none" }}
          >
            {isSaving ? "Saving..." : "Save"}
          </Btn>
          <Btn
            variant="cancel"
            onClick={handleCloseModal}
            disabled={isSaving}
            style={{ minWidth: 100, height: 33 }}
          >
            Close
          </Btn>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default PcmTrunkGroupPage;
