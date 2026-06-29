import React, { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Checkbox,
  FormControlLabel,
  Alert,
  Tooltip,
  useMediaQuery,
} from "@mui/material";

import {
  fetchSipAccounts,
  fetchExtensionGroups,
  createExtensionGroup,
  updateExtensionGroup,
  deleteExtensionGroup,
} from "../../../api/apiService";
import EditDocumentIcon from "@mui/icons-material/EditDocument";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import { EXT_GROUP_FIELD_TOOLTIPS } from "../../../constants/ExtensionGroupConstants";

const EXT_GROUP_COMPACT_MQ = "(max-width: 768px)";

// ── Color palette (matches Extensions page) ─────────────────────────────────

const C = {
  pageBg: "#f8fafc",
  cardBg: "#ffffff",
  cardBorder: "#d8dde5",
  divider: "#e2e6ec",
  labelText: "#3E5475",
  valueText: "#0f172a",
  mutedText: "#6b7280",
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
  title,
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
    accent: {
      background:
        "linear-gradient(to bottom, #5A6F8F 0%, #3E5475 60%, #2C3E57 100%)",
      color: "#fff",
      border: "1px solid #5A6F8F",
      fontWeight: 600,
    },
  };
  const s = styles[variant] || styles.default;
  const hoverBg =
    {
      primary: "linear-gradient(to bottom, #3E5475 0%, #5A6F8F 100%)",
      accent: "linear-gradient(to bottom, #3E5475 0%, #5A6F8F 100%)",
      cancel: "#b6c2d3",
      danger: "#fca5a5",
      outline: "#e2e8f0",
      default: "#e2e8f0",
    }[variant] || "#e2e8f0";
  const activeBg =
    {
      primary: "linear-gradient(to bottom, #2C3E57 0%, #3E5475 100%)",
      accent: "linear-gradient(to bottom, #2C3E57 0%, #3E5475 100%)",
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
      variant === "primary" || variant === "accent"
        ? "inset 0 2px 4px rgba(0, 0, 0, 0.25)"
        : variant === "cancel"
          ? "inset 0 2px 4px rgba(15, 23, 42, 0.15)"
          : "inset 0 1px 3px rgba(15, 23, 42, 0.12)";
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      title={title}
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
    </button>
  );
};

// ── ToolTips ──────────────────────────────────────────────────────
const EXT_GROUP_FIELD_TOOLTIP_PROPS = {
  arrow: true,
  placement: "top",
  slotProps: {
    tooltip: {
      sx: {
        backgroundColor: "#fff",
        color: "#333",
        border: "1px solid #d1d5db",
        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
        fontSize: 13,
        maxWidth: 500,
        padding: "12px 16px",
      },
    },
    arrow: {
      sx: { color: "#fff" },
    },
  },
};

const formatExtGroupTooltipTitle = (text) => {
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

const ExtGroupFieldLabel = ({ tooltipKey, children, style = {} }) => {
  const tooltip = EXT_GROUP_FIELD_TOOLTIPS[tooltipKey] || "";

  const label = (
    <span
      style={{
        fontSize: 13,
        fontWeight: 600,
        color: C.labelText,
        cursor: tooltip ? "help" : undefined,
        ...style,
      }}
    >
      {children}
    </span>
  );

  if (!tooltip) return label;

  return (
    <Tooltip
      title={formatExtGroupTooltipTitle(tooltip)}
      {...EXT_GROUP_FIELD_TOOLTIP_PROPS}
    >
      {label}
    </Tooltip>
  );
};

// ── Shared: Table Header ──────────────────────────────────────────────────────
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
const extGroupTableCheckboxSx = {
  padding: "1px",
  color: "#3E5475",
  "&.Mui-checked": { color: "#0284c7" },
  "&.MuiCheckbox-indeterminate": { color: "#0284c7" },
};

// ── Local page UI (inlined from pbxSharedUi) ──
const EXT_GROUP_LIST_TRUNCATE_THRESHOLD = 10;
const EXT_GROUP_LIST_DISPLAY_LIMIT = 6;

const formatExtGroupItemListDisplay = (
  items,
  {
    threshold = EXT_GROUP_LIST_TRUNCATE_THRESHOLD,
    limit = EXT_GROUP_LIST_DISPLAY_LIMIT,
    mapItem = (x) => String(x),
    separator = ", ",
    ellipsis = "....",
  } = {},
) => {
  if (!items?.length) return "";
  const labels = items.map(mapItem).filter((v) => v !== "" && v != null);
  if (!labels.length) return "";
  if (labels.length <= threshold) {
    return labels.join(separator);
  }
  return `${labels.slice(0, limit).join(separator)}${ellipsis}`;
};

const extGroupModalCancelBtnStyle = {
  minWidth: 100,
  height: 33,
  background: "#cbd5e1",
  color: "#374151",
  border: "1px solid #cbd5e1",
  boxShadow: "0 1px 2px rgba(15, 23, 42, 0.08)",
};

const extGroupPageWrapStyle = {
  backgroundColor: C.pageBg,
  minHeight: "calc(100vh - 80px)",
  padding: 16,
  boxSizing: "border-box",
};

const extGroupPageInnerStyle = {
  width: "100%",
  maxWidth: "100%",
  margin: "0 auto",
};

const ExtGroupBreadcrumb = ({ section, current, style }) => (
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
      ...style,
    }}
  >
    <span>PBX</span>
    <span>&gt;</span>
    <span>{section}</span>
    <span>&gt;</span>
    <span style={{ color: "#1e293b", fontWeight: 600 }}>{current}</span>
  </div>
);
const ExtGroupTableListLoading = () => (
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

const ExtGroupTableListEmptyState = ({
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
        style={{ padding: "8px 24px", fontSize: 12, borderRadius: 6 }}
      >
        {buttonLabel}
      </Btn>
    ) : null}
  </div>
);

const EXT_GROUP_TABLE_CARD_RADIUS = 10;

const extGroupCardStyle = {
  background: "#ffffff",
  borderRadius: EXT_GROUP_TABLE_CARD_RADIUS,
  overflow: "hidden",
  border: `1px solid ${C.cardBorder}`,
  boxShadow: "0 0 14px rgba(0, 0, 0, 0.18), 0 0 5px rgba(0, 0, 0, 0.10)",
};

const extGroupToolbarStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  minHeight: 44,
  padding: "7px 14px",
  borderBottom: `1px solid ${C.divider}`,
  background: "#ffffff",
  flexWrap: "wrap",
  gap: 12,
  borderTopLeftRadius: EXT_GROUP_TABLE_CARD_RADIUS,
  borderTopRightRadius: EXT_GROUP_TABLE_CARD_RADIUS,
};

const extGroupPaginationStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "7px 14px",
  background: "#ffffff",
  borderTop: `1px solid ${C.divider}`,
  borderBottomLeftRadius: EXT_GROUP_TABLE_CARD_RADIUS,
  borderBottomRightRadius: EXT_GROUP_TABLE_CARD_RADIUS,
  overflow: "hidden",
};

const extGroupSelectedBadgeStyle = {
  background: "#eff6ff",
  color: C.accent,
  fontSize: 11,
  fontWeight: 700,
  padding: "5px 12px",
  borderRadius: 999,
  border: `1px solid ${C.accent}`,
};

const extGroupCancelBtnStyle = {
  height: 30,
  background: "#cbd5e1",
  color: "#374151",
  border: "1px solid #cbd5e1",
  boxShadow: "0 1px 2px rgba(15, 23, 42, 0.08)",
};

const extGroupPrimaryBtnStyle = {
  height: 30,
  padding: "6px 14px",
  fontSize: 12,
  borderRadius: 10,
};

const extGroupPageBadgeStyle = {
  fontSize: 11,
  fontWeight: 600,
  color: C.accent,
  background: "#e0f2fe",
  padding: "5px 14px",
  borderRadius: 6,
  border: `1px solid ${C.cardBorder}`,
};

const ExtGroupPagination = ({
  page,
  totalPages,
  recordCount,
  onPageChange,
  recordLabel = "record",
  style,
}) => (
  <div style={{ ...extGroupPaginationStyle, ...style }}>
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
      <span style={extGroupPageBadgeStyle}>
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

const OUTLINED_BORDER = "#d1d5db";
const OUTLINED_HOVER = "#9ca3af";
const OUTLINED_FOCUS = "#3E5475";
const FOCUS_RING_SHADOW = "0 0 0 2px rgba(62, 84, 117, 0.15)";

const extGroupFixedAlertSx = {
  position: "fixed",
  top: 20,
  right: 20,
  zIndex: 9999,
  minWidth: 300,
  boxShadow: 3,
};

const extGroupTableStyle = {
  width: "100%",
  borderCollapse: "separate",
  borderSpacing: 0,
  tableLayout: "auto",
};

const extGroupEditIconStyle = {
  cursor: "pointer",
  color: "#2563eb",
  fontSize: 22,
  opacity: 0.7,
  transition: "opacity 0.15s ease",
};

const handleExtGroupEditIconHover = (e, entering) => {
  e.currentTarget.style.opacity = entering ? "1" : "0.7";
};

const getExtGroupTdStyle = (rowBg, lastRowCellStyle, extra = {}) => ({
  ...tdStyle,
  background: rowBg,
  ...lastRowCellStyle,
  ...extra,
});

const getExtGroupRowBg = (isSelected, idx) =>
  isSelected ? "#eff6ff" : idx % 2 === 1 ? "#f8fafc" : "#ffffff";

const extGroupModalTitleStyle = {
  background: "#1e2d42",
  color: "#ffffff",
  fontWeight: 600,
  fontSize: 16,
  textAlign: "center",
  padding: "16px 24px",
  borderTopLeftRadius: 8,
  borderTopRightRadius: 8,
};

const extGroupModalFormStyle = {
  display: "flex",
  flexDirection: "column",
  gap: 14,
  background: "#f8fafc",
  border: `1px solid ${C.cardBorder}`,
  borderRadius: 8,
  padding: 20,
};

const extGroupModalActionsStyle = {
  display: "flex",
  justifyContent: "center",
  gap: 16,
  padding: "16px 24px",
  background: "#f8fafc",
  borderTop: `1px solid ${C.cardBorder}`,
  borderBottomLeftRadius: 8,
  borderBottomRightRadius: 8,
};

const extGroupDialogPaperSx = {
  width: 500,
  maxWidth: "95vw",
  mx: "auto",
  p: 0,
  borderRadius: "8px",
  overflow: "hidden",
};

const extGroupExtensionsListStyle = {
  background: "#f8fafc",
  border: `1px solid ${C.cardBorder}`,
  borderRadius: 6,
  overflow: "hidden",
};

const extGroupModalTextFieldSx = {
  "& .MuiOutlinedInput-root": {
    backgroundColor: "#fff",
    transition: "border-color 0.2s ease, box-shadow 0.2s ease",
    "& fieldset": {
      borderColor: OUTLINED_BORDER,
      transition: "border-color 0.2s ease, box-shadow 0.2s ease",
    },
    "&:hover fieldset": {
      borderColor: OUTLINED_HOVER,
    },
    "&.Mui-focused": {
      boxShadow: FOCUS_RING_SHADOW,
    },
    "&.Mui-focused fieldset": {
      borderColor: OUTLINED_FOCUS,
      borderWidth: "1px",
    },
    "&.Mui-focused:hover fieldset": {
      borderColor: OUTLINED_FOCUS,
      borderWidth: "1px",
    },
  },
  "& .MuiOutlinedInput-input": {
    backgroundColor: "#fff",
    fontSize: 13,
    padding: "8px 12px",
  },
};

const EXT_GROUP_MODAL_SCROLL_EASE = 0.1;
const EXT_GROUP_MODAL_SCROLL_DELTA_SCALE = 0.75;

const getExtGroupModalScrollParent = (el, root) => {
  let node = el;
  while (node && node !== root) {
    const style = window.getComputedStyle(node);
    const overflowY = style.overflowY;
    const canScrollY =
      (overflowY === "auto" || overflowY === "scroll") &&
      node.scrollHeight > node.clientHeight;
    if (canScrollY) return node;
    node = node.parentElement;
  }
  return root;
};

const attachExtGroupModalSmoothWheelScroll = (container) => {
  if (!container) return () => {};

  const state = new WeakMap();
  const activeRafs = new Set();

  const getState = (el) => {
    if (!state.has(el)) {
      state.set(el, {
        target: el.scrollTop,
        current: el.scrollTop,
        rafId: null,
      });
    }
    return state.get(el);
  };

  const clamp = (el, value) =>
    Math.max(0, Math.min(value, el.scrollHeight - el.clientHeight));

  const tick = (el) => {
    const s = getState(el);
    const diff = s.target - s.current;
    if (Math.abs(diff) < 0.5) {
      s.current = s.target;
      el.scrollTop = s.current;
      if (s.rafId != null) activeRafs.delete(s.rafId);
      s.rafId = null;
      return;
    }
    s.current += diff * EXT_GROUP_MODAL_SCROLL_EASE;
    el.scrollTop = s.current;
    const rafId = requestAnimationFrame(() => tick(el));
    if (s.rafId != null) activeRafs.delete(s.rafId);
    s.rafId = rafId;
    activeRafs.add(rafId);
  };

  const onWheel = (e) => {
    const scrollEl = getExtGroupModalScrollParent(e.target, container);
    const s = getState(scrollEl);

    e.preventDefault();
    s.target = clamp(
      scrollEl,
      s.target + e.deltaY * EXT_GROUP_MODAL_SCROLL_DELTA_SCALE,
    );
    if (!s.rafId) {
      s.current = scrollEl.scrollTop;
      const rafId = requestAnimationFrame(() => tick(scrollEl));
      s.rafId = rafId;
      activeRafs.add(rafId);
    }
  };

  container.addEventListener("wheel", onWheel, { passive: false });

  return () => {
    container.removeEventListener("wheel", onWheel);
    activeRafs.forEach((rafId) => cancelAnimationFrame(rafId));
    activeRafs.clear();
  };
};

// ─────────────────────────────────────────────────────────────────────────────

const ExtensionGroupsPage = () => {
  const isCompact = useMediaQuery(EXT_GROUP_COMPACT_MQ);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState({
    fetch: false,
    delete: false,
    save: false,
    extensions: false,
  });
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [message, setMessage] = useState({ type: "", text: "" });

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 5000);
  };
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [selectedIds, setSelectedIds] = useState([]);

  const hasInitialLoadRef = useRef(false);
  const modalScrollRef = useRef(null);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editGroupId, setEditGroupId] = useState(null);
  const [groupName, setGroupName] = useState("");
  const [availableExtensions, setAvailableExtensions] = useState([]);
  const [selectedExtensions, setSelectedExtensions] = useState([]);

  // ── Load Data ──
  const loadGroups = async () => {
    setLoading((p) => ({ ...p, fetch: true }));
    setMessage({ type: "", text: "" });
    try {
      const res = await fetchExtensionGroups();
      const raw = res?.message ?? res?.data ?? res;
      const list = Array.isArray(raw) ? raw : [];
      setGroups(
        list.map((g) => ({
          id: g.id,
          name: g.name || "",
          extensions: Array.isArray(g.extensions)
            ? g.extensions.map(String)
            : [],
        })),
      );
    } catch (err) {
      showMessage("error", err?.message || "Failed to load extension groups.");
    } finally {
      setLoading((p) => ({ ...p, fetch: false }));
      setIsInitialLoad(false);
    }
  };

  useEffect(() => {
    if (!hasInitialLoadRef.current) {
      hasInitialLoadRef.current = true;
      loadGroups();
    }
  }, []);

  useEffect(() => {
    if (!showModal) return undefined;

    let detach = () => {};
    const frame = requestAnimationFrame(() => {
      if (modalScrollRef.current) {
        detach = attachExtGroupModalSmoothWheelScroll(modalScrollRef.current);
      }
    });

    return () => {
      cancelAnimationFrame(frame);
      detach();
    };
  }, [showModal]);

  const totalPages = Math.max(1, Math.ceil(groups.length / limit));
  const pagedGroups = groups.slice((page - 1) * limit, page * limit);
  const dataEmpty = groups.length === 0;

  // ── Checkbox Selection Logic ──
  const pageIds = pagedGroups.map((g) => g.id);
  const allPageSelected =
    pageIds.length > 0 && pageIds.every((id) => selectedIds.includes(id));
  const somePageSelected =
    pagedGroups.some((g) => selectedIds.includes(g.id)) && !allPageSelected;

  const handleToggleRow = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const handleToggleAll = () => {
    if (!pageIds.length) return;
    setSelectedIds((prev) =>
      allPageSelected
        ? prev.filter((id) => !pageIds.includes(id))
        : Array.from(new Set([...prev, ...pageIds])),
    );
  };

  // ── Delete ──
  const handleDelete = async () => {
    if (!selectedIds.length) {
      showMessage("error", "Please select at least one record to delete.");
      return;
    }
    const msg =
      selectedIds.length === 1
        ? "Are you sure you want to delete this group?"
        : `Are you sure you want to delete ${selectedIds.length} groups?`;

    if (!window.confirm(msg)) return;

    setLoading((p) => ({ ...p, delete: true }));
    setMessage({ type: "", text: "" });
    const deleteCount = selectedIds.length;
    try {
      await Promise.all(selectedIds.map((id) => deleteExtensionGroup(id)));
      setSelectedIds([]);
      await loadGroups();
      showMessage(
        "success",
        deleteCount === 1
          ? "Extension group deleted successfully."
          : `${deleteCount} extension groups deleted successfully.`,
      );
    } catch (err) {
      showMessage("error", err?.message || "Failed to delete some groups.");
    } finally {
      setLoading((p) => ({ ...p, delete: false }));
    }
  };

  // ── Modal Actions ──
  const openExtensionList = () => {
    setLoading((p) => ({ ...p, extensions: true }));
    fetchSipAccounts()
      .then((res) => {
        const list = res?.message ?? [];
        const exts = (Array.isArray(list) ? list : [])
          .map((item) => ({
            extension: String(item.extension ?? ""),
            name: item.name || item.display_name || item.extension || "",
          }))
          .filter((e) => e.extension);
        setAvailableExtensions(exts);
      })
      .catch(() => {
        setAvailableExtensions([]);
        showMessage(
          "error",
          "Failed to load available extensions for the modal.",
        );
      })
      .finally(() => setLoading((p) => ({ ...p, extensions: false })));
  };

  const handleOpenAddModal = () => {
    resetModalState();
    setShowModal(true);
    openExtensionList();
  };

  const handleOpenEditModal = (group) => {
    setEditGroupId(group.id);
    setGroupName(group.name || "");
    setSelectedExtensions(
      Array.isArray(group.extensions) ? [...group.extensions] : [],
    );
    setShowModal(true);
    openExtensionList();
  };

  const resetModalState = () => {
    setEditGroupId(null);
    setGroupName("");
    setSelectedExtensions([]);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    resetModalState();
  };

  const toggleExtension = (ext) => {
    setSelectedExtensions((prev) =>
      prev.includes(ext) ? prev.filter((e) => e !== ext) : [...prev, ext],
    );
  };

  const handleSaveGroup = async () => {
    const name = groupName?.trim();
    if (!name) return showMessage("error", "Please enter a group name.");
    if (selectedExtensions.length === 0)
      return showMessage("error", "Please select at least one extension.");

    const extensions = [...selectedExtensions].sort(
      (a, b) => (parseInt(a) || 0) - (parseInt(b) || 0),
    );
    setLoading((p) => ({ ...p, save: true }));
    setMessage({ type: "", text: "" });

    try {
      const isUpdate = editGroupId != null;
      if (isUpdate) {
        await updateExtensionGroup({ id: editGroupId, name, extensions });
      } else {
        await createExtensionGroup({ name, extensions });
      }
      await loadGroups();
      handleCloseModal();
      showMessage(
        "success",
        isUpdate
          ? "Extension group updated successfully."
          : "Extension group created successfully.",
      );
    } catch (err) {
      showMessage("error", err?.message || "Failed to save group.");
    } finally {
      setLoading((p) => ({ ...p, save: false }));
    }
  };

  return (
    <div style={{ ...extGroupPageWrapStyle, ...(isCompact ? { padding: 8 } : {}) }}>
      <div style={extGroupPageInnerStyle}>
        {/* Error Banner */}
        {/* ── Error / Success Floating Banner ── */}
        {message.text && (
          <Alert
            severity={message.type}
            onClose={() => setMessage({ type: "", text: "" })}
            sx={extGroupFixedAlertSx}
          >
            {message.text}
          </Alert>
        )}

        <ExtGroupBreadcrumb section="Extensions" current="Extension Group" />

        <div style={extGroupCardStyle}>
          <div
            style={{
              ...extGroupToolbarStyle,
              ...(isCompact
                ? { flexDirection: "column", alignItems: "stretch", gap: 10 }
                : {}),
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {selectedIds.length > 0 && (
                <span style={extGroupSelectedBadgeStyle}>
                  {selectedIds.length} selected
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
                onClick={handleDelete}
                disabled={
                  loading.delete || loading.fetch || selectedIds.length === 0
                }
                variant="cancel"
                style={extGroupCancelBtnStyle}
              >
                {loading.delete ? (
                  <CircularProgress size={11} style={{ color: "#374151" }} />
                ) : null}
                <DeleteOutlineOutlinedIcon sx={{ fontSize: 16 }} />
                Delete
              </Btn>
              <Btn
                onClick={handleOpenAddModal}
                disabled={loading.fetch}
                variant="primary"
                style={extGroupPrimaryBtnStyle}
              >
                + Add New
              </Btn>
            </div>
          </div>

          {/* Table */}
          <div
            style={{
              overflowX: "hidden",
              overflowY: "auto",
              flex: 1,
              ...(isCompact
                ? { overflowX: "auto", WebkitOverflowScrolling: "touch" }
                : {}),
            }}
          >
            {isInitialLoad ? (
              <ExtGroupTableListLoading />
            ) : dataEmpty ? (
              <ExtGroupTableListEmptyState
                message="No extension groups found."
                onAddNew={handleOpenAddModal}
              />
            ) : (
              <table style={extGroupTableStyle}>
                <thead>
                  <tr>
                    <TH
                      style={{
                        width: 40,
                        padding: 0,
                        borderLeft: "none",
                      }}
                    >
                      <Checkbox
                        size="small"
                        checked={allPageSelected}
                        indeterminate={somePageSelected}
                        onChange={handleToggleAll}
                        sx={extGroupTableCheckboxSx}
                      />
                    </TH>
                    <TH style={{ width: 36 }}>ID</TH>
                    <TH>Group Name</TH>
                    <TH>Extensions</TH>
                    <TH style={{ width: 70, borderRight: "none" }}>Modify</TH>
                  </tr>
                </thead>
                <tbody>
                  {pagedGroups.map((row, idx) => {
                    const isSelected = selectedIds.includes(row.id);
                    const isLastRow = idx === pagedGroups.length - 1;
                    const lastRowCellStyle = isLastRow
                      ? { borderBottom: "none" }
                      : {};
                    const rowBg = getExtGroupRowBg(isSelected, idx);
                    const realIndex = (page - 1) * limit + idx + 1;

                    return (
                      <tr
                        key={row.id}
                        style={{
                          background: rowBg,
                          transition: "background 0.15s ease",
                        }}
                        onMouseEnter={(e) => {
                          if (!isSelected)
                            e.currentTarget.style.background = "#f8fafc";
                        }}
                        onMouseLeave={(e) => {
                          if (!isSelected)
                            e.currentTarget.style.background = rowBg;
                        }}
                      >
                        <td
                          style={getExtGroupTdStyle(rowBg, lastRowCellStyle, {
                            width: 36,
                            borderLeft: "none",
                          })}
                        >
                          <Checkbox
                            size="small"
                            checked={isSelected}
                            onChange={() => handleToggleRow(row.id)}
                            disabled={loading.delete}
                            sx={extGroupTableCheckboxSx}
                          />
                        </td>
                        <td
                          style={getExtGroupTdStyle(rowBg, lastRowCellStyle, {
                            width: 36,
                          })}
                        >
                          {realIndex}
                        </td>
                        <td style={getExtGroupTdStyle(rowBg, lastRowCellStyle)}>
                          {row.name}
                        </td>
                        <td
                          style={getExtGroupTdStyle(rowBg, lastRowCellStyle, {
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          })}
                        >
                          {row.extensions?.length > 0 ? (
                            <span
                              title={
                                row.extensions.length >
                                EXT_GROUP_LIST_TRUNCATE_THRESHOLD
                                  ? row.extensions.join(", ")
                                  : undefined
                              }
                            >
                              {formatExtGroupItemListDisplay(row.extensions)}
                            </span>
                          ) : (
                            <span style={{ color: C.mutedText }}></span>
                          )}
                        </td>
                        <td
                          style={getExtGroupTdStyle(rowBg, lastRowCellStyle, {
                            borderRight: "none",
                          })}
                        >
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "center",
                            }}
                          >
                            <EditDocumentIcon
                              titleAccess="Edit"
                              onClick={() => handleOpenEditModal(row)}
                              style={extGroupEditIconStyle}
                              onMouseEnter={(e) =>
                                handleExtGroupEditIconHover(e, true)
                              }
                              onMouseLeave={(e) =>
                                handleExtGroupEditIconHover(e, false)
                              }
                            />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {!isInitialLoad && groups.length > 0 && (
            <ExtGroupPagination
              page={page}
              totalPages={totalPages}
              recordCount={pagedGroups.length}
              onPageChange={(p) =>
                setPage(Math.min(totalPages, Math.max(1, p)))
              }
            />
          )}
        </div>
      </div>

      {/* ── Add/Edit Modal ── */}
      <Dialog
        open={showModal}
        onClose={loading.save ? null : handleCloseModal}
        maxWidth={false}
        slotProps={{
          backdrop: { sx: { backgroundColor: "rgba(0, 0, 0, 0.5)" } },
        }}
        PaperProps={{ sx: extGroupDialogPaperSx }}
      >
        <DialogTitle style={extGroupModalTitleStyle}>
          {editGroupId != null
            ? "Edit Extension Group"
            : "Add New Extension Group"}
        </DialogTitle>

        <DialogContent
          ref={modalScrollRef}
          className="app-main-scroll"
          style={{ padding: "24px", backgroundColor: "#ffffff" }}
          sx={{
            maxHeight: "calc(100vh - 180px)",
            overflowY: "auto",
            WebkitOverflowScrolling: "touch",
          }}
        >
          <div style={extGroupModalFormStyle}>
            {/* Group Name Field */}
            <div>
              <div style={{ marginBottom: 6 }}>
                <ExtGroupFieldLabel tooltipKey="group_name">
                  Group Name
                </ExtGroupFieldLabel>
              </div>
              <TextField
                fullWidth
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="e.g. Sales, Support"
                size="small"
                variant="outlined"
                sx={extGroupModalTextFieldSx}
              />
            </div>

            {/* Extensions Selection */}
            <div>
              <div style={{ marginBottom: 6 }}>
                <ExtGroupFieldLabel tooltipKey="selected_extensions">
                  Select Extensions
                </ExtGroupFieldLabel>
              </div>
              <div style={extGroupExtensionsListStyle}>
                <div style={{ maxHeight: 220, overflowY: "auto", padding: 12 }}>
                  {loading.extensions ? (
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        padding: 30,
                      }}
                    >
                      <CircularProgress size={20} />
                    </div>
                  ) : availableExtensions.length === 0 ? (
                    <p
                      style={{
                        textAlign: "center",
                        fontSize: 12,
                        color: C.mutedText,
                        margin: "20px 0",
                      }}
                    >
                      No extensions found. Create SIP accounts first.
                    </p>
                  ) : (
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 4,
                      }}
                    >
                      {availableExtensions.map(({ extension, name }) => (
                        <FormControlLabel
                          key={extension}
                          control={
                            <Checkbox
                              checked={selectedExtensions.includes(extension)}
                              onChange={() => toggleExtension(extension)}
                              size="small"
                              sx={extGroupTableCheckboxSx}
                            />
                          }
                          label={
                            <span style={{ fontSize: 13, color: C.valueText }}>
                              {extension} {name ? `— ${name}` : ""}
                            </span>
                          }
                          sx={{ margin: 0 }}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div
              style={{ fontSize: 11, color: C.mutedText, textAlign: "right" }}
            >
              {selectedExtensions.length} extension(s) selected
            </div>
          </div>
        </DialogContent>

        <DialogActions style={extGroupModalActionsStyle}>
          <Btn
            onClick={handleSaveGroup}
            disabled={loading.save}
            variant="primary"
            style={{ minWidth: 100, height: 33, fontSize: 13 }}
          >
            {loading.save ? (
              <CircularProgress size={11} style={{ color: "#fff" }} />
            ) : null}
            {loading.save ? "Saving..." : "Save Group"}
          </Btn>
          <Btn
            onClick={handleCloseModal}
            disabled={loading.save}
            variant="cancel"
            style={extGroupModalCancelBtnStyle}
          >
            Cancel
          </Btn>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default ExtensionGroupsPage;
