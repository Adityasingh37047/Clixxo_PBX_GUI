import React, { useState, useEffect, useRef } from "react";
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
  Tooltip,
  useMediaQuery,
} from "@mui/material";
import {
  listPstn,
  listPstnGroups,
  savePstnGroup,
  deletePstnGroup,
  listIpPstnRoutes,
  listNumberManipulations,
} from "../../../api/apiService";

const PCM_TRUNK_GROUP_COMPACT_MQ = "(max-width: 768px)";

const PCM_TRUNK_GROUP_ADD_NEW_DIALOG_MARGIN = 24;
const PCM_TRUNK_GROUP_ADD_NEW_DIALOG_LAYOUT_OFFSET = 80;

const PCM_TRUNK_GROUP_ADD_NEW_DIALOG_SX = {
  "& .MuiDialog-container": {
    alignItems: "center",
    justifyContent: "center",
  },
};

const PCM_TRUNK_GROUP_ADD_NEW_DIALOG_PAPER_SX = {
  margin: PCM_TRUNK_GROUP_ADD_NEW_DIALOG_MARGIN,
  maxHeight: `calc(100vh - ${PCM_TRUNK_GROUP_ADD_NEW_DIALOG_LAYOUT_OFFSET}px - ${PCM_TRUNK_GROUP_ADD_NEW_DIALOG_MARGIN * 2}px)`,
  display: "flex",
  flexDirection: "column",
  width: 500,
  maxWidth: "95vw",
  p: 0,
  borderRadius: "8px",
  overflow: "hidden",
  boxShadow:
    "0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)",
};

// ── Page-local field label tooltip UI (not shared) ──
const FIELD_LABEL_COLOR = "#3E5475";

const FIELD_TOOLTIP_PROPS = {
  arrow: true,
  placement: "top",
  slotProps: {
    tooltip: {
      sx: {
        backgroundColor: "#fff",
        color: "#333",
        border: "1px solid #d1d5db",
        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
        fontSize: 12,
        lineHeight: 1.45,
        maxWidth: 500,
        padding: "10px 12px",
        textTransform: "none",
        letterSpacing: "normal",
      },
    },
    arrow: { sx: { color: "#fff" } },
  },
};

const formatFieldTooltipTitle = (text) => {
  if (!text) return "";
  const normalized = text.replace(/<br\s*\/?>/gi, "\n").replace(/&quot;/g, '"');
  if (normalized.includes("\n")) {
    return (
      <span style={{ whiteSpace: "pre-line", display: "block" }}>
        {normalized}
      </span>
    );
  }
  return normalized;
};

const PcmTrunkGroupFieldLabel = ({ tooltipKey, tooltips, children, style = {} }) => {
  const tooltip = tooltipKey ? tooltips[tooltipKey] || "" : "";
  const labelNode = (
    <span
      style={{
        fontSize: 13,
        fontWeight: 600,
        color: FIELD_LABEL_COLOR,
        cursor: tooltip ? "help" : undefined,
        ...style,
      }}
    >
      {children}
    </span>
  );
  if (!tooltip) return labelNode;
  return (
    <Tooltip title={formatFieldTooltipTitle(tooltip)} {...FIELD_TOOLTIP_PROPS}>
      {labelNode}
    </Tooltip>
  );
};

// ── Color palette (matches Extensions) ────────────────────────────────────────
const C = {
  pageBg: "#f8fafc",
  cardBg: "#ffffff",
  cardBorder: "#d8dde5",
  divider: "#e2e6ec",
  labelText: "#3E5475",
  valueText: "#0f172a",
  mutedText: "#94a3b8",
  strongText: "#0f172a",
  accent: "#3E5475",
  amber: "#dc2626",
  errorRed: "#dc2626",
  successGreen: "#16a34a",
};

const Btn = ({
  children,
  onClick,
  disabled,
  variant = "default",
  style: extraStyle,
  type,
  form,
  component,
  title,
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
    },
    cancel: {
      background: "#cbd5e1",
      color: "#374151",
      border: "1px solid #cbd5e1",
      boxShadow: "0 1px 2px rgba(15,23,42,0.08)",
    },
    danger: {
      background: "#fef2f2",
      color: C.amber,
      border: "0.5px solid #fecaca",
    },
    outline: {
      background: C.cardBg,
      color: C.labelText,
      border: `1px solid ${C.cardBorder}`,
    },
  };
  const s = styles[variant] || styles.default;
  const hoverBg =
    {
      primary: "linear-gradient(to bottom, #3E5475 0%, #5A6F8F 100%)",
      cancel: "#b6c2d3",
      danger: "#fca5a5",
      outline: "#e2e8f0",
      default: "#e2e8f0",
    }[variant] || "#e2e8f0";
  const activeBg =
    {
      primary: "linear-gradient(to bottom, #2C3E57 0%, #3E5475 100%)",
      cancel: "#a3b1c2",
      danger: "#f87171",
      outline: "#d1d9e6",
      default: "#d1d5db",
    }[variant] || "#d1d5db";
  const baseBg = extraStyle?.background ?? s.background;
  const baseShadow = extraStyle?.boxShadow ?? s.boxShadow ?? "none";

  const clearPressStyle = (el) => {
    el.style.transform = "";
    el.style.boxShadow = baseShadow;
  };

  const applyPressStyle = (el) => {
    el.style.background = activeBg;
    el.style.transform = "translateY(1px) scale(0.98)";
    el.style.boxShadow =
      variant === "primary"
        ? "inset 0 2px 4px rgba(0, 0, 0, 0.25)"
        : variant === "cancel"
          ? "inset 0 2px 4px rgba(15, 23, 42, 0.15)"
          : "inset 0 1px 3px rgba(15, 23, 42, 0.12)";
  };

  const Component = component || "button";
  return (
    <Component
      type={type}
      form={form}
      title={title}
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
        transition:
          "background 0.15s ease, transform 0.1s ease, box-shadow 0.1s ease",
        height: 30,
        gap: 6,
        whiteSpace: "nowrap",
        userSelect: "none",
        ...s,
        ...extraStyle,
      }}
      onMouseEnter={(e) => {
        if (disabled) return;
        e.currentTarget.style.background = hoverBg;
      }}
      onMouseLeave={(e) => {
        if (disabled) return;
        e.currentTarget.style.background = baseBg;
        clearPressStyle(e.currentTarget);
      }}
      onMouseDown={(e) => {
        if (disabled) return;
        applyPressStyle(e.currentTarget);
      }}
      onMouseUp={(e) => {
        if (disabled) return;
        e.currentTarget.style.background = hoverBg;
        clearPressStyle(e.currentTarget);
      }}
    >
      {children}
    </Component>
  );
};

const addNewModalFooterStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 12,
  width: "100%",
  margin: 0,
  padding: "16px 24px",
  boxSizing: "border-box",
  background: "#f8fafc",
  borderTop: `1px solid ${C.cardBorder}`,
  borderBottomLeftRadius: 8,
  borderBottomRightRadius: 8,
};

const addNewModalFooterBtnStyle = {
  height: 30,
  padding: "6px 14px",
  fontSize: 12,
  borderRadius: 10,
  minWidth: 100,
};

const pcmTrunkGroupModalCancelBtnStyle = {
  ...addNewModalFooterBtnStyle,
  background: "#cbd5e1",
  color: "#374151",
  border: "1px solid #cbd5e1",
  boxShadow: "0 1px 2px rgba(15, 23, 42, 0.08)",
};

const PCM_TRUNK_GROUP_OUTLINED_BORDER = "#d1d5db";
const PCM_TRUNK_GROUP_OUTLINED_HOVER = "#9ca3af";
const PCM_TRUNK_GROUP_OUTLINED_FOCUS = "#3E5475";
const PCM_TRUNK_GROUP_FOCUS_RING_SHADOW =
  "0 0 0 2px rgba(62, 84, 117, 0.15)";

const pcmTrunkGroupSetFieldDefault = (el) => {
  el.style.borderColor = PCM_TRUNK_GROUP_OUTLINED_BORDER;
  el.style.borderWidth = "1px";
  el.style.boxShadow = "none";
};

const pcmTrunkGroupSetFieldHover = (el) => {
  el.style.borderColor = PCM_TRUNK_GROUP_OUTLINED_HOVER;
  el.style.borderWidth = "1px";
  el.style.boxShadow = "none";
};

const pcmTrunkGroupSetFieldFocus = (el) => {
  el.style.borderColor = PCM_TRUNK_GROUP_OUTLINED_FOCUS;
  el.style.borderWidth = "1px";
  el.style.boxShadow = PCM_TRUNK_GROUP_FOCUS_RING_SHADOW;
};

const pcmTrunkGroupInputInteraction = {
  onFocus: (e) => {
    if (e.target.disabled) return;
    pcmTrunkGroupSetFieldFocus(e.target);
  },
  onBlur: (e) => {
    pcmTrunkGroupSetFieldDefault(e.target);
  },
  onMouseEnter: (e) => {
    if (e.target.disabled) return;
    if (document.activeElement === e.target) {
      pcmTrunkGroupSetFieldFocus(e.target);
    } else {
      pcmTrunkGroupSetFieldHover(e.target);
    }
  },
  onMouseLeave: (e) => {
    if (document.activeElement === e.target) {
      pcmTrunkGroupSetFieldFocus(e.target);
    } else {
      pcmTrunkGroupSetFieldDefault(e.target);
    }
  },
};

const pcmTrunkGroupInputStyle = {
  width: "100%",
  height: 32,
  padding: "0 10px",
  fontSize: 13,
  lineHeight: 1.35,
  border: `1px solid ${PCM_TRUNK_GROUP_OUTLINED_BORDER}`,
  borderRadius: 4,
  outline: "none",
  backgroundColor: "#fff",
  color: C.valueText,
  boxSizing: "border-box",
  transition: "border-color 0.2s ease, box-shadow 0.2s ease",
};

const pcmTrunkGroupSelectStyle = {
  ...pcmTrunkGroupInputStyle,
  padding: "0 28px 0 10px",
  appearance: "auto",
  cursor: "pointer",
};

const TH = ({ children, style: extra }) => (
  <th
    style={{
      background: "#F8FAFC",
      color: C.labelText,
      fontWeight: 700,
      fontSize: 11,
      padding: "9px 14px",
      textAlign: "center",
      borderBottom: `1px solid ${C.divider}`,
      borderRight: `1px solid ${C.divider}`,
      whiteSpace: "nowrap",
      textTransform: "uppercase",
      letterSpacing: "0.14em",
      position: "sticky",
      top: 0,
      zIndex: 10,
      ...extra,
    }}
  >
    {children}
  </th>
);

const tdStyle = {
  padding: "7px 14px",
  fontSize: 13,
  color: C.valueText,
  textAlign: "center",
  borderBottom: `1px solid ${C.divider}`,
  borderRight: `1px solid ${C.divider}`,
  whiteSpace: "nowrap",
};

const pcmTrunkGroupPageWrapStyle = {
  backgroundColor: C.pageBg,
  minHeight: "calc(100vh - 80px)",
  padding: 16,
  boxSizing: "border-box",
};

const pcmTrunkGroupPageInnerStyle = {
  width: "100%",
  maxWidth: "100%",
  margin: "0 auto",
};

const TableListLoading = () => (
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
);

const TableListEmptyState = ({
  message,
  onAddNew,
  buttonLabel = "+ Add New",
  showButton = true,
}) => (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      minHeight: 240,
      padding: 24,
      textAlign: "center",
    }}
  >
    <div
      style={{
        color: "#3E5475",
        fontSize: 13,
        fontWeight: 600,
        marginBottom: showButton && onAddNew ? 16 : 0,
      }}
    >
      {message}
    </div>
    {showButton && onAddNew ? (
      <Btn
        variant="cancel"
        onClick={onAddNew}
        style={{ height: 30, padding: "6px 14px", fontSize: 12, borderRadius: 10 }}
      >
        {buttonLabel}
      </Btn>
    ) : null}
  </div>
);

const PCM_TRUNK_GROUP_TABLE_CARD_RADIUS = 10;

const pcmTrunkGroupCardStyle = {
  background: "#ffffff",
  borderRadius: PCM_TRUNK_GROUP_TABLE_CARD_RADIUS,
  overflow: "hidden",
  border: `1px solid ${C.cardBorder}`,
  boxShadow: "0 0 14px rgba(0, 0, 0, 0.18), 0 0 5px rgba(0, 0, 0, 0.10)",
};

const pcmTrunkGroupToolbarStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  minHeight: 44,
  padding: "7px 14px",
  borderBottom: `1px solid ${C.divider}`,
  background: "#ffffff",
  flexWrap: "wrap",
  gap: 12,
  borderTopLeftRadius: PCM_TRUNK_GROUP_TABLE_CARD_RADIUS,
  borderTopRightRadius: PCM_TRUNK_GROUP_TABLE_CARD_RADIUS,
};

const pcmTrunkGroupPaginationStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "7px 14px",
  background: "#ffffff",
  borderTop: `1px solid ${C.divider}`,
  borderBottomLeftRadius: PCM_TRUNK_GROUP_TABLE_CARD_RADIUS,
  borderBottomRightRadius: PCM_TRUNK_GROUP_TABLE_CARD_RADIUS,
  overflow: "hidden",
};

const pcmTrunkGroupSelectedBadgeStyle = {
  background: "#eff6ff",
  color: C.accent,
  fontSize: 11,
  fontWeight: 700,
  padding: "5px 12px",
  borderRadius: 999,
  border: `1px solid ${C.accent}`,
};

const pcmTrunkGroupCancelBtnStyle = {
  height: 30,
  padding: "6px 14px",
  fontSize: 12,
  borderRadius: 10,
  background: "#cbd5e1",
  color: "#374151",
  border: "1px solid #cbd5e1",
  boxShadow: "0 1px 2px rgba(15, 23, 42, 0.08)",
};

const pcmTrunkGroupPrimaryBtnStyle = {
  height: 30,
  padding: "6px 14px",
  fontSize: 12,
  borderRadius: 10,
};

const pcmTrunkGroupPageBadgeStyle = {
  fontSize: 11,
  fontWeight: 600,
  color: C.accent,
  background: "#e0f2fe",
  padding: "5px 14px",
  borderRadius: 6,
  border: `1px solid ${C.cardBorder}`,
};

const PcmTrunkGroupPagination = ({
  page,
  totalPages,
  recordCount,
  onPageChange,
  recordLabel = "record",
  style,
}) => (
  <div style={{ ...pcmTrunkGroupPaginationStyle, ...style }}>
    <span style={{ fontSize: 11, color: C.mutedText }}>
      Showing {recordCount} {recordLabel}
      {recordCount !== 1 ? "s" : ""} on page {page}
    </span>
    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
      <Btn
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        variant="outline"
      >
        ← Prev
      </Btn>
      <span style={pcmTrunkGroupPageBadgeStyle}>
        Page {page} of {totalPages}
      </span>
      <Btn
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        variant="outline"
      >
        Next →
      </Btn>
    </div>
  </div>
);

// ── Local modal field UI (inlined from e1PriSharedUi) ──
const OUTLINED_BORDER = "rgba(0, 0, 0, 0.23)";
const OUTLINED_HOVER = "rgba(0, 0, 0, 0.87)";
const OUTLINED_FOCUS = "#1976d2";

const muiTextFieldSx = {
  "& .MuiOutlinedInput-root": {
    backgroundColor: "#fff",
    "& fieldset": {
      borderColor: OUTLINED_BORDER,
      transition: "border-color 0.2s ease",
    },
    "&:hover fieldset": { borderColor: OUTLINED_HOVER },
    "&.Mui-focused fieldset": {
      borderColor: OUTLINED_FOCUS,
      borderWidth: 2,
    },
    "&.Mui-focused:hover fieldset": {
      borderColor: OUTLINED_FOCUS,
      borderWidth: 2,
    },
  },
};

const muiSelectSx = {
  fontSize: 13,
  backgroundColor: "#fff",
  "& .MuiOutlinedInput-root": {
    minHeight: 36,
    backgroundColor: "#fff",
  },
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
  "&:hover .MuiOutlinedInput-notchedOutline": {
    borderColor: OUTLINED_HOVER,
  },
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
  "& .MuiOutlinedInput-input": { backgroundColor: "#fff" },
};

const modalSelectSx = {
  ...muiSelectSx,
  width: "100%",
  "& .MuiOutlinedInput-root": {
    minHeight: 36,
    height: 36,
    backgroundColor: "#fff",
  },
};

const pcmTrunkGroupModalFormPanelStyle = {
  display: "flex",
  flexDirection: "column",
  gap: 14,
  background: "#f8fafc",
  border: `1px solid ${C.cardBorder}`,
  borderRadius: 8,
  padding: 20,
};


const pcmTrunkGroupTableCheckboxSx = {
  padding: "1px",
  color: "#3E5475",
  "&.Mui-checked": { color: "#0284c7" },
  "&.MuiCheckbox-indeterminate": { color: "#0284c7" },
};

// const LOCAL_STORAGE_KEY = 'pcmTrunkGroups';

const PcmTrunkGroupPage = () => {
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

  return (
    <div
      style={{
        ...pcmTrunkGroupPageWrapStyle,
        ...(isCompact ? { padding: 8 } : {}),
      }}
    >
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

      <div style={pcmTrunkGroupPageInnerStyle}>
        <div
          style={{
            fontSize: 12,
            color: "#94a3b8",
            marginBottom: 16,
            fontWeight: 400,
            display: "flex",
            alignItems: "center",
            gap: 4,
            flexWrap: "wrap",
          }}
        >
          <span>{PCM_TRUNK_GROUP_PAGE_BREADCRUMB_ROOT}</span>
          <span>&gt;</span>
          <span>{PCM_TRUNK_GROUP_PAGE_BREADCRUMB_SECTION}</span>
          <span>&gt;</span>
          <span style={{ color: "#1e293b", fontWeight: 600 }}>
            {PCM_TRUNK_GROUP_PAGE_TITLE}
          </span>
        </div>

        <div style={pcmTrunkGroupCardStyle}>
          <div
            style={{
              ...pcmTrunkGroupToolbarStyle,
              ...(isCompact
                ? { flexDirection: "column", alignItems: "stretch", gap: 10 }
                : {}),
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                flex: 1,
                minWidth: 0,
              }}
            >
              {selected.length > 0 && (
                <span style={pcmTrunkGroupSelectedBadgeStyle}>
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
                disabled={isLoadingData || groups.length === 0}
                style={pcmTrunkGroupCancelBtnStyle}
              >
                Inverse
              </Btn>
              <Btn
                variant="cancel"
                onClick={handleClearAll}
                disabled={isLoadingData || groups.length === 0}
                style={pcmTrunkGroupCancelBtnStyle}
              >
                {isLoadingData ? (
                  <CircularProgress size={11} style={{ color: "#374151" }} />
                ) : (
                  "Clear All"
                )}
              </Btn>
              <Btn
                variant="cancel"
                onClick={handleDeleteSelected}
                disabled={isLoadingData || selected.length === 0}
                style={pcmTrunkGroupCancelBtnStyle}
              >
                {isLoadingData ? (
                  <CircularProgress size={11} style={{ color: "#374151" }} />
                ) : (
                  <>
                    <DeleteOutlineOutlinedIcon sx={{ fontSize: 16 }} />
                    {PCM_TRUNK_GROUP_DELETE_LABEL}
                  </>
                )}
              </Btn>
              <Btn
                variant="primary"
                onClick={() => handleOpenModal()}
                disabled={isLoadingSpans}
                style={pcmTrunkGroupPrimaryBtnStyle}
              >
                {PCM_TRUNK_GROUP_ADD_NEW_LABEL}
              </Btn>
            </div>
          </div>

          {isLoadingData ? (
            <TableListLoading />
          ) : groups.length === 0 ? (
            <TableListEmptyState
              message={PCM_TRUNK_GROUP_EMPTY_MESSAGE}
              onAddNew={() => handleOpenModal()}
            />
          ) : (
            <>
              <div
                style={{
                  overflowX: "auto",
                  overflowY: "auto",
                  flex: 1,
                }}
              >
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "separate",
                    borderSpacing: 0,
                    tableLayout: "auto",
                    minWidth: 900,
                    ...(isCompact ? { minWidth: 720 } : {}),
                  }}
                >
                  <thead>
                    <tr>
                      <TH
                        style={{
                          width: 40,
                          padding: 0,
                          borderLeft: "none",
                          position: "sticky",
                          top: 0,
                          zIndex: 10,
                        }}
                      >
                        <Checkbox
                          size="small"
                          checked={allPageSelected}
                          indeterminate={somePageSelected}
                          onChange={handleToggleAll}
                          sx={pcmTrunkGroupTableCheckboxSx}
                        />
                      </TH>
                      {PCM_TRUNK_GROUP_TABLE_COLUMNS.filter(
                        (c) => c.key !== "check",
                      ).map((c) => (
                        <TH
                          key={c.key}
                          style={{
                            position: "sticky",
                            top: 0,
                            zIndex: 10,
                            ...(c.key === "modify" ? { borderRight: "none" } : {}),
                          }}
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
                        ? "#eff6ff"
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
                              e.currentTarget.style.background = "#f8fafc";
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
                              width: 36,
                              borderLeft: "none",
                              ...lastRowCellStyle,
                            }}
                          >
                            <Checkbox
                              size="small"
                              checked={isRowChecked}
                              onChange={() => handleSelectRow(realIdx)}
                              disabled={isLoadingData}
                              sx={pcmTrunkGroupTableCheckboxSx}
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
                                    borderRight: "none",
                                    ...lastRowCellStyle,
                                  }}
                                >
                                  <div
                                    style={{
                                      display: "flex",
                                      justifyContent: "center",
                                    }}
                                  >
                                    <EditDocumentIcon
                                      titleAccess="Edit"
                                      onClick={() => {
                                        if (!isLoadingData) {
                                          handleOpenModal(item, realIdx);
                                        }
                                      }}
                                      style={{
                                        cursor: isLoadingData
                                          ? "not-allowed"
                                          : "pointer",
                                        color: "#2563eb",
                                        fontSize: 22,
                                        opacity: isLoadingData ? 0.4 : 0.7,
                                        transition: "opacity 0.15s ease",
                                      }}
                                      onMouseEnter={(e) => {
                                        if (!isLoadingData)
                                          e.currentTarget.style.opacity = "1";
                                      }}
                                      onMouseLeave={(e) => {
                                        if (!isLoadingData)
                                          e.currentTarget.style.opacity = "0.7";
                                      }}
                                    />
                                  </div>
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

              {groups.length > 0 && (
                <PcmTrunkGroupPagination
                  page={page}
                  totalPages={totalPages}
                  recordCount={pagedGroups.length}
                  recordLabel="PCM trunk group"
                  onPageChange={(p) => setPage(p)}
                />
              )}
            </>
          )}
        </div>
      </div>
      {/* Modal Dialog */}
      <Dialog
        open={isModalOpen}
        onClose={handleCloseModal}
        maxWidth={false}
        sx={PCM_TRUNK_GROUP_ADD_NEW_DIALOG_SX}
        PaperProps={{
          sx: PCM_TRUNK_GROUP_ADD_NEW_DIALOG_PAPER_SX,
        }}
        disableRestoreFocus
        disableEnforceFocus
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
            flexShrink: 0,
          }}
        >
          {formData.originalIndex !== undefined
            ? PCM_TRUNK_GROUP_MODAL_TITLE_EDIT
            : PCM_TRUNK_GROUP_MODAL_TITLE_ADD}
        </DialogTitle>
        <DialogContent
          style={{
            padding: "24px",
            backgroundColor: "#ffffff",
            overflowY: "auto",
            flex: "1 1 auto",
          }}
        >
          <div style={pcmTrunkGroupModalFormPanelStyle}>
            {PCM_TRUNK_GROUP_FIELDS.map((field) => (
              <div
                key={field.name}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                <PcmTrunkGroupFieldLabel
                  tooltipKey={field.name}
                  tooltips={PCM_TRUNK_GROUP_FIELD_TOOLTIPS}
                  style={{
                    fontSize: 13,
                    whiteSpace: "nowrap",
                    width: 170,
                    flexShrink: 0,
                    textAlign: "left",
                    display: "inline-block",
                  }}
                >
                  {field.label}:
                </PcmTrunkGroupFieldLabel>
                <div style={{ flex: 1, minWidth: 0, width: "100%" }}>
                  {field.type === "select" ? (
                    <select
                      name={field.name}
                      value={formData[field.name]}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          [field.name]: e.target.value,
                        }))
                      }
                      style={pcmTrunkGroupSelectStyle}
                      {...pcmTrunkGroupInputInteraction}
                    >
                      {field.options.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={field.type || "text"}
                      name={field.name}
                      value={formData[field.name] || ""}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          [field.name]: e.target.value,
                        }))
                      }
                      placeholder={field.placeholder || ""}
                      style={pcmTrunkGroupInputStyle}
                      {...pcmTrunkGroupInputInteraction}
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
                <PcmTrunkGroupFieldLabel
                  tooltipKey="pstnIds"
                  tooltips={PCM_TRUNK_GROUP_FIELD_TOOLTIPS}
                  style={{
                    fontSize: 13,
                    whiteSpace: "nowrap",
                    width: 160,
                    marginTop: 2,
                    display: "inline-block",
                  }}
                >
                  PCM Trunks:
                </PcmTrunkGroupFieldLabel>
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
                          background: isChecked ? "#f0f9ff" : "#ffffff",
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
        <DialogActions sx={{ p: 0, m: 0 }} style={addNewModalFooterStyle}>
          <Btn
            variant="primary"
            onClick={handleSave}
            disabled={isSaving}
            style={addNewModalFooterBtnStyle}
          >
            {isSaving ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              PCM_TRUNK_GROUP_SAVE_LABEL
            )}
          </Btn>
          <Btn
            variant="cancel"
            onClick={handleCloseModal}
            disabled={isSaving}
            style={pcmTrunkGroupModalCancelBtnStyle}
          >
            {PCM_TRUNK_GROUP_CLOSE_LABEL}
          </Btn>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default PcmTrunkGroupPage;
