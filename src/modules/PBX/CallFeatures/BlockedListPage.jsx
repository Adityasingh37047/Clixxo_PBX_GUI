import React, { useState, useEffect, useRef } from "react";
import EditDocumentIcon from "@mui/icons-material/EditDocument";
import Tooltip from "@mui/material/Tooltip";
import {Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Select as MuiSelect,
  MenuItem,
  FormControl,
  Checkbox, useMediaQuery } from "@mui/material";

import {
  fetchBlockedList,
  createBlockedEntry,
  updateBlockedEntry,
  deleteBlockedEntry,
  listConferenceExtensions,
} from "../../../api/apiService";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";

const PBX_COMPACT_MQ = "(max-width: 768px)";
const CARD_RADIUS = 10;
const FIELD_RADIUS = 6;
const FIELD_LABEL_COLOR = "#374151";

// ── Color palette (aligned with FxsVoipMediaPage enterprise tokens) ───────────
const C = {
  pageBg: "var(--bg-main)",
  cardBg: "var(--bg-surface)",
  cardBorder: "#d8dde5",
  cardShadow: "0 2px 10px rgba(15, 23, 42, 0.07)",
  divider: "#e2e6ec",
  labelText: "var(--text-primary)",
  valueText: "var(--text-primary)",
  mutedText: "var(--text-muted)",
  strongText: "var(--text-primary)",
  accent: "var(--accent-brand)",
  accentDark: "#3E5475",
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
      color: FIELD_LABEL_COLOR,
      border: `1px solid ${C.cardBorder}`,
    },
    dialogPrimary: {
      background:
        "linear-gradient(to bottom, #5A6F8F 0%, #3E5475 60%, #2C3E57 100%)",
      color: "#fff",
      border: "1px solid #5A6F8F",
      minWidth: 100,
      height: 36,
      fontSize: 13,
      padding: "0 28px",
    },
    dialogCancel: {
      background: "#cbd5e1",
      color: "#374151",
      border: "1px solid #cbd5e1",
      boxShadow: "0 1px 2px rgba(15,23,42,0.08)",
      minWidth: 100,
      height: 33,
      fontSize: 13,
      padding: "0 14px",
    },
  };
  const s = styles[variant] || styles.default;
  const isLarge =
    variant === "primary" ||
    variant === "cancel" ||
    variant === "dialogPrimary" ||
    variant === "dialogCancel";
  const hoverBg =
    {
      primary: "linear-gradient(to bottom, #3E5475 0%, #5A6F8F 100%)",
      dialogPrimary: "linear-gradient(to bottom, #3E5475 0%, #5A6F8F 100%)",
      cancel: "#b6c2d3",
      dialogCancel: "#b6c2d3",
      danger: "#fca5a5",
      outline: "#e2e8f0",
      default: "#e2e8f0",
    }[variant] || "#e2e8f0";
  const activeBg =
    {
      primary: "linear-gradient(to bottom, #2C3E57 0%, #3E5475 100%)",
      dialogPrimary: "linear-gradient(to bottom, #2C3E57 0%, #3E5475 100%)",
      cancel: "#a3b1c2",
      dialogCancel: "#a3b1c2",
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
      variant === "primary" || variant === "dialogPrimary"
        ? "inset 0 2px 4px rgba(0, 0, 0, 0.25)"
        : variant === "cancel" || variant === "dialogCancel"
          ? "inset 0 2px 4px rgba(15, 23, 42, 0.15)"
          : "inset 0 1px 3px rgba(15, 23, 42, 0.12)";
  };

  return (
    <button
      type={type}
      title={title}
      onClick={onClick}
      disabled={disabled}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        padding: isLarge ? "8px 20px" : "6px 14px",
        borderRadius: 8,
        fontSize: isLarge ? 13 : 12,
        fontWeight: 600,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.6 : 1,
        transition:
          "background 0.15s ease, transform 0.1s ease, box-shadow 0.1s ease",
        height: isLarge ? (variant === "dialogPrimary" ? 36 : 34) : 30,
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


// ── Shared: Table Header ──────────────────────────────────────────────────────
const TH = ({ children, style: extra }) => (
  <th
    style={{
      background: "var(--table-header-bg)",
      color: FIELD_LABEL_COLOR,
      fontWeight: 700,
      fontSize: 11,
      padding: "10px 14px",
      textAlign: "center",
      borderBottom: `1px solid ${C.divider}`,
      borderRight: `1px solid ${C.divider}`,
      whiteSpace: "nowrap",
      textTransform: "uppercase",
      letterSpacing: "0.08em",
      ...extra,
    }}
  >
    {children}
  </th>
);

const tdStyle = {
  padding: "9px 14px",
  fontSize: 13,
  color: C.valueText,
  textAlign: "center",
  borderBottom: `1px solid ${C.divider}`,
  borderRight: `1px solid ${C.divider}`,
  whiteSpace: "nowrap",
};

const checkboxSx = {
  padding: "1px",
  color: "var(--text-primary)",
  "&.Mui-checked": { color: "#3E5475" },
  "&.MuiCheckbox-indeterminate": { color: "#3E5475" },
};

const blockedListPageWrapStyle = {
  backgroundColor: C.pageBg,
  minHeight: "calc(100vh - 80px)",
  width: "100%",
  maxWidth: "100%",
  padding: "24px 28px",
  boxSizing: "border-box",
};

const blockedListCardStyle = {
  width: "100%",
  maxWidth: "100%",
  margin: 0,
  background: C.cardBg,
  border: `1px solid ${C.cardBorder}`,
  borderRadius: CARD_RADIUS,
  boxShadow: C.cardShadow,
  overflow: "hidden",
};

const blockedListToolbarStyle = {
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 12,
  minHeight: 52,
  padding: "10px 16px",
  borderBottom: `1px solid ${C.divider}`,
  background: C.cardBg,
};

const blockedListPaginationStyle = {
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 12,
  padding: "10px 16px",
  borderTop: `1px solid ${C.divider}`,
  background: C.cardBg,
};

const blockedListModalPaperSx = {
  width: 560,
  maxWidth: "95vw",
  borderRadius: `${CARD_RADIUS}px`,
  overflow: "hidden",
  boxShadow: "0 8px 30px rgba(15, 23, 42, 0.12)",
};

const blockedListFieldSx = {
  "& .MuiOutlinedInput-root": {
    fontSize: 13,
    backgroundColor: "var(--bg-surface)",
    borderRadius: `${FIELD_RADIUS}px`,
    "& fieldset": { borderColor: "#d1d5db" },
    "&:hover fieldset": { borderColor: "#9ca3af" },
    "&.Mui-focused fieldset": {
      borderColor: "#3E5475",
      borderWidth: "1px",
    },
    "&.Mui-focused": {
      boxShadow: "0 0 0 2px rgba(62, 84, 117, 0.15)",
    },
  },
  "& .MuiSelect-select": {
    padding: "6px 10px",
    display: "flex",
    alignItems: "center",
  },
};

const pageTitleStyle = {
  fontSize: 22,
  fontWeight: 700,
  color: C.strongText,
  margin: "0 0 6px 0",
  letterSpacing: "-0.02em",
};

const STATUS_CHIP_TONES = {
  success: { bg: "#ecfdf5", color: "#16a34a", border: "#bbf7d0" },
  brand: { bg: "#e0f2fe", color: "#3E5475", border: "#bae6fd" },
  neutral: { bg: "#f1f5f9", color: "#475569", border: "#e2e8f0" },
  info: { bg: "#f8fafc", color: "#374151", border: "#e2e8f0" },
  warning: { bg: "#fffbeb", color: "#d97706", border: "#fde68a" },
};

const StatusChip = ({ tone = "neutral", children }) => {
  const t = STATUS_CHIP_TONES[tone] || STATUS_CHIP_TONES.neutral;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "3px 10px",
        borderRadius: 999,
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: "0.02em",
        background: t.bg,
        color: t.color,
        border: `1px solid ${t.border}`,
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </span>
  );
};

const getMatchModeTone = (mode) => {
  if (mode === "Regex Match") return "brand";
  if (mode === "Extension") return "warning";
  return "info";
};

const getDirectionTone = (direction) => {
  if (direction === "Inbound") return "success";
  if (direction === "Outbound") return "brand";
  return "neutral";
};

const PbxBreadcrumb = ({ section, current }) => (
  <div
    style={{
      fontSize: 12,
      color: "#94a3b8",
      marginBottom: 20,
      fontWeight: 400,
      display: "flex",
      alignItems: "center",
      gap: 4,
      flexWrap: "wrap",
    }}
  >
    <span>PBX</span>
    <span>&gt;</span>
    <span>{section}</span>
    <span>&gt;</span>
    <span style={{ color: "#1e293b", fontWeight: 600 }}>{current}</span>
  </div>
);

const TableListLoading = () => (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: 12,
      padding: "56px 24px",
    }}
  >
    <CircularProgress size={28} sx={{ color: C.accentDark }} />
    <span style={{ fontSize: 13, color: C.mutedText, fontWeight: 500 }}>
      Loading blocked entries…
    </span>
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
      minHeight: 260,
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "32px 24px",
      textAlign: "center",
    }}
  >
    <div
      style={{
        width: 48,
        height: 48,
        borderRadius: 12,
        background: "#f1f5f9",
        border: `1px solid ${C.divider}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 22,
        marginBottom: 14,
      }}
    >
      🚫
    </div>
    <div
      style={{
        fontSize: 14,
        fontWeight: 600,
        color: FIELD_LABEL_COLOR,
        marginBottom: showButton && onAddNew ? 16 : 0,
      }}
    >
      {message}
    </div>
    {showButton && onAddNew ? (
      <Btn variant="primary" onClick={onAddNew}>
        {buttonLabel}
      </Btn>
    ) : null}
  </div>
);

const BlockedListPagination = ({
  page,
  totalPages,
  recordCount,
  totalCount,
  onPrev,
  onNext,
  disabled,
}) => (
  <div style={blockedListPaginationStyle}>
    <span style={{ fontSize: 12, color: C.mutedText, fontWeight: 500 }}>
      Showing {recordCount} of {totalCount} record{totalCount !== 1 ? "s" : ""}{" "}
      · Page {page} of {totalPages}
    </span>
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <Btn onClick={onPrev} disabled={disabled || page <= 1} variant="outline">
        ← Prev
      </Btn>
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          padding: "4px 12px",
          borderRadius: 6,
          fontSize: 11,
          fontWeight: 600,
          color: "#3E5475",
          background: "#e0f2fe",
          border: `1px solid #bae6fd`,
        }}
      >
        {page} / {totalPages}
      </span>
      <Btn
        onClick={onNext}
        disabled={disabled || page >= totalPages}
        variant="outline"
      >
        Next →
      </Btn>
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
const tooltipProps = {
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
    arrow: { sx: { color: "#fff" } },
  },
};

const BlockedListSearchBox = ({
  value,
  onChange,
  onClear,
  focused,
  onFocus,
  onBlur,
  isCompact,
}) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: 8,
      flex: isCompact ? "1 1 100%" : "0 1 auto",
      minWidth: isCompact ? 0 : 220,
      background: "var(--bg-main)",
      border: `1px solid ${focused ? "#3E5475" : C.cardBorder}`,
      borderRadius: 8,
      padding: "6px 12px",
      boxShadow: focused ? "0 0 0 2px rgba(62, 84, 117, 0.12)" : "none",
      transition: "border-color 0.15s ease, box-shadow 0.15s ease",
    }}
  >
    <span
      style={{
        fontSize: 13,
        color: focused ? "#3E5475" : C.mutedText,
        lineHeight: 1,
      }}
    >
      🔍
    </span>
    <input
      type="text"
      value={value}
      onChange={onChange}
      onFocus={onFocus}
      onBlur={onBlur}
      placeholder="Search by name, number, or match mode…"
      style={{
        border: "none",
        background: "transparent",
        fontSize: 12,
        color: C.valueText,
        outline: "none",
        width: "100%",
        minWidth: 0,
        fontWeight: 500,
      }}
    />
    {value ? (
      <button
        type="button"
        onClick={onClear}
        style={{
          border: "none",
          background: "#e2e8f0",
          color: "#64748b",
          borderRadius: 999,
          width: 18,
          height: 18,
          fontSize: 10,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 0,
          flexShrink: 0,
        }}
      >
        ✕
      </button>
    ) : null}
  </div>
);

const BlockedListPage = () => {
  const isCompact = useMediaQuery(PBX_COMPACT_MQ);
  const [rows, setRows] = useState([]);
  const [selected, setSelected] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState({
    fetch: false,
    delete: false,
    save: false,
  });
  const [error, setError] = useState({ type: "", text: "" });
  const hasInitialLoadRef = useRef(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Search & Pagination
  const itemsPerPage = 20;
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);

  // Add/Edit modal state
  const [editId, setEditId] = useState(null);
  const [name, setName] = useState("");
  const [matchMode, setMatchMode] = useState("Exact Match");
  const [blockedNumber, setBlockedNumber] = useState("");
  const [selectedExtension, setSelectedExtension] = useState("");
  const [direction, setDirection] = useState("Inbound");
  const [enabled, setEnabled] = useState("Yes");
  const [availableExtensions, setAvailableExtensions] = useState([]);

  const showAlert = (type, text) => {
    setError({ type, text });
    setTimeout(() => setError({ type: "", text: "" }), 5000);
  };

  const loadRows = async () => {
    setLoading((prev) => ({ ...prev, fetch: true }));
    try {
      const res = await fetchBlockedList();
      const raw = res?.message ?? res?.data ?? res;
      const list = Array.isArray(raw) ? raw : [];
      setRows(
        list.map((item) => ({
          id: item.id,
          name: item.name || "",
          matchMode:
            item.match_mode === "regex"
              ? "Regex Match"
              : item.match_mode === "extension"
                ? "Extension"
                : "Exact Match",
          blockedNumber: item.pattern || "",
          direction: (() => {
            const d = (item.direction || "").toLowerCase();
            if (d === "outbound") return "Outbound";
            if (d === "internal") return "Internal";
            return "Inbound";
          })(),
          enabled:
            item.enabled === false ||
            String(item.enabled).toLowerCase() === "no"
              ? "No"
              : "Yes",
        })),
      );
    } catch (err) {
      showAlert("error", err?.message || "Failed to load blocked list.");
    } finally {
      setLoading((prev) => ({ ...prev, fetch: false }));
      setIsInitialLoad(false);
    }
  };

  const loadAvailableExtensions = async () => {
    try {
      const extRes = await listConferenceExtensions();
      const extRaw = Array.isArray(extRes?.message)
        ? extRes.message
        : Array.isArray(extRes?.data)
          ? extRes.data
          : [];
      const extList = extRaw
        .filter((e) => e && e.extension)
        .map((e) => ({
          value: String(e.extension),
          label: e.display_name
            ? `${e.display_name} (${e.extension})`
            : String(e.extension),
        }));
      setAvailableExtensions(extList);
    } catch (err) {
      console.error("Failed to load extensions for blocked list:", err);
      setAvailableExtensions([]);
    }
  };

  useEffect(() => {
    if (!hasInitialLoadRef.current) {
      hasInitialLoadRef.current = true;
      loadRows();
      loadAvailableExtensions();
    }
  }, []);

  // ── Search & Pagination Logic ──
  const filteredRows = searchQuery.trim()
    ? rows.filter((r) =>
        [r.name, r.blockedNumber, r.matchMode].some((v) =>
          String(v || "")
            .toLowerCase()
            .includes(searchQuery.toLowerCase()),
        ),
      )
    : rows;

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / itemsPerPage));
  const pagedRows = filteredRows.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage,
  );

  useEffect(() => {
    setPage((current) =>
      Math.min(
        Math.max(1, current),
        Math.max(1, Math.ceil(filteredRows.length / itemsPerPage)),
      ),
    );
  }, [filteredRows.length]);

  const handlePrev = () => setPage((p) => Math.max(1, p - 1));
  const handleNext = () => setPage((p) => Math.min(totalPages, p + 1));

  // ── Checkbox Logic ──
  const pageIndices = pagedRows.map(
    (_, idx) => (page - 1) * itemsPerPage + idx,
  );
  const allPageSelected =
    pageIndices.length > 0 && pageIndices.every((i) => selected.includes(i));
  const somePageSelected =
    pageIndices.some((i) => selected.includes(i)) && !allPageSelected;

  const handleToggleRow = (idx) => {
    setSelected((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx],
    );
  };

  const handleToggleAll = () => {
    if (!pageIndices.length) return;
    setSelected((prev) =>
      allPageSelected
        ? prev.filter((i) => !pageIndices.includes(i))
        : Array.from(new Set([...prev, ...pageIndices])),
    );
  };

  const handleDelete = async () => {
    if (selected.length === 0) {
      showAlert("error", "Please select at least one row to delete.");
      return;
    }
    if (
      !window.confirm(
        `Are you sure you want to delete ${selected.length} records?`,
      )
    )
      return;

    setLoading((prev) => ({ ...prev, delete: true }));
    try {
      const ids = selected.map((i) => filteredRows[i]?.id).filter(Boolean);
      await Promise.all(ids.map((id) => deleteBlockedEntry(id)));
      setSelected([]);
      setPage(1);
      await loadRows();
      showAlert("success", `Deleted ${ids.length} item(s).`);
    } catch (err) {
      showAlert("error", err?.message || "Failed to delete.");
    } finally {
      setLoading((prev) => ({ ...prev, delete: false }));
    }
  };

  // ── Form Modal Handlers ──
  const resetForm = () => {
    setEditId(null);
    setName("");
    setMatchMode("Exact Match");
    setBlockedNumber("");
    setSelectedExtension("");
    setDirection("Inbound");
    setEnabled("Yes");
  };

  const handleOpenAddModal = () => {
    resetForm();
    setShowModal(true);
  };

  const handleOpenEditModal = (row) => {
    setEditId(row.id);
    setName(row.name || "");
    setMatchMode(row.matchMode || "Exact Match");
    setBlockedNumber(row.blockedNumber || "");
    setSelectedExtension(
      row.matchMode === "Extension" ? row.blockedNumber || "" : "",
    );
    setDirection(row.direction || "Inbound");
    setEnabled(row.enabled || "Yes");
    setShowModal(true);
  };

  const handleCloseModal = () => {
    if (loading.save) return;
    setShowModal(false);
    resetForm();
  };

  const handleSave = async () => {
    const trimmedName = name.trim();
    const trimmedNumber = blockedNumber.trim();
    const valueToBlock =
      matchMode === "Extension"
        ? String(selectedExtension || "").trim()
        : trimmedNumber;

    if (!trimmedName) {
      showAlert("error", "Please enter a Name.");
      return;
    }
    if (!valueToBlock) {
      showAlert(
        "error",
        matchMode === "Extension"
          ? "Please select an Extension."
          : "Please enter a Blocked List Number.",
      );
      return;
    }

    const apiPayload = {
      name: trimmedName,
      match_mode:
        matchMode === "Regex Match"
          ? "regex"
          : matchMode === "Extension"
            ? "extension"
            : "exact",
      pattern: valueToBlock,
      direction: direction.toLowerCase(),
      enabled: enabled === "Yes",
    };

    setLoading((prev) => ({ ...prev, save: true }));
    try {
      if (editId != null) {
        await updateBlockedEntry({ id: editId, ...apiPayload });
        showAlert("success", "Blocked entry updated.");
      } else {
        await createBlockedEntry(apiPayload);
        showAlert("success", "Blocked entry created.");
      }
      await loadRows();
      handleCloseModal();
    } catch (err) {
      showAlert("error", err?.message || "Failed to save.");
    } finally {
      setLoading((prev) => ({ ...prev, save: false }));
    }
  };

  return (
    <div
      style={{
        ...blockedListPageWrapStyle,
        padding: isCompact ? "12px 14px" : blockedListPageWrapStyle.padding,
      }}
    >
      <div style={{ width: "100%", maxWidth: "100%", margin: 0 }}>
        {error.text && (
          <Alert
            severity={
              error.type === "error"
                ? "error"
                : error.type === "success"
                  ? "success"
                  : "info"
            }
            onClose={() => setError({ type: "", text: "" })}
            sx={{
              position: "fixed",
              top: 20,
              right: 20,
              zIndex: 9999,
              minWidth: 300,
              boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
              fontWeight: 500,
            }}
          >
            {error.text}
          </Alert>
        )}

        <h1 style={pageTitleStyle}>Blocked List</h1>
        <PbxBreadcrumb section="Call Features" current="Blocked List" />

        <div style={blockedListCardStyle}>
          <div
            style={{
              ...blockedListToolbarStyle,
              ...(isCompact
                ? { flexDirection: "column", alignItems: "stretch" }
                : {}),
            }}
          >
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                gap: 10,
                flex: "1 1 auto",
                minWidth: 0,
              }}
            >
              <BlockedListSearchBox
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
                onClear={() => {
                  setSearchQuery("");
                  setPage(1);
                }}
                focused={searchFocused}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                isCompact={isCompact}
              />
              {!isInitialLoad && rows.length > 0 && (
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: C.mutedText,
                    whiteSpace: "nowrap",
                  }}
                >
                  {filteredRows.length} entr
                  {filteredRows.length !== 1 ? "ies" : "y"}
                </span>
              )}
              {selected.length > 0 && (
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    padding: "4px 12px",
                    borderRadius: 999,
                    fontSize: 11,
                    fontWeight: 700,
                    color: "#3E5475",
                    background: "#e0f2fe",
                    border: "1px solid #bae6fd",
                  }}
                >
                  {selected.length} selected
                </span>
              )}
            </div>

            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                gap: 8,
                ...(isCompact ? { width: "100%" } : {}),
              }}
            >
              <Btn
                onClick={handleDelete}
                disabled={
                  loading.delete || loading.fetch || selected.length === 0
                }
                variant="cancel"
              >
                {loading.delete ? (
                  <CircularProgress size={12} sx={{ color: "#374151" }} />
                ) : (
                  <DeleteOutlineOutlinedIcon sx={{ fontSize: 16 }} />
                )}
                Delete
              </Btn>
              <Btn
                onClick={handleOpenAddModal}
                disabled={loading.fetch}
                variant="primary"
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
              <TableListLoading />
            ) : rows.length === 0 ? (
              <TableListEmptyState
                message="No blocked entries found."
                onAddNew={handleOpenAddModal}
              />
            ) : searchQuery && filteredRows.length === 0 ? (
              <TableListEmptyState
                message={`No results for "${searchQuery}"`}
                showButton={false}
              />
            ) : (
              <table
                style={{
                  width: "100%",
                  borderCollapse: "separate",
                  borderSpacing: 0,
                  tableLayout: "auto",
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
                        sx={checkboxSx}
                      />
                    </TH>
                    <TH
                      style={{
                        width: 36,
                        position: "sticky",
                        top: 0,
                        zIndex: 10,
                      }}
                    >
                      ID
                    </TH>
                    <TH style={{ position: "sticky", top: 0, zIndex: 10 }}>
                      Name
                    </TH>
                    <TH style={{ position: "sticky", top: 0, zIndex: 10 }}>
                      Match Mode
                    </TH>
                    <TH style={{ position: "sticky", top: 0, zIndex: 10 }}>
                      Blocked List Number
                    </TH>
                    <TH style={{ position: "sticky", top: 0, zIndex: 10 }}>
                      Direction
                    </TH>
                    <TH style={{ position: "sticky", top: 0, zIndex: 10 }}>
                      Enable
                    </TH>
                    <TH
                      style={{
                        width: 70,
                        borderRight: "none",
                        position: "sticky",
                        top: 0,
                        zIndex: 10,
                      }}
                    >
                      Modify
                    </TH>
                  </tr>
                </thead>
                <tbody>
                  {pagedRows.map((row, idx) => {
                    const realIdx = (page - 1) * itemsPerPage + idx;
                    const isSelected = selected.includes(realIdx);
                    const isLastRow = idx === pagedRows.length - 1;
                    const lastRowCellStyle = isLastRow
                      ? { borderBottom: "none" }
                      : {};
                    const rowBg = isSelected
                      ? "#e0f2fe"
                      : idx % 2 === 1
                        ? "var(--row-alt)"
                        : "var(--bg-surface)";

                    return (
                      <tr
                        key={row.id || realIdx}
                        style={{
                          background: rowBg,
                          transition: "background 0.15s ease",
                        }}
                        onMouseEnter={(e) => {
                          if (!isSelected)
                            e.currentTarget.style.background = "var(--row-alt)";
                        }}
                        onMouseLeave={(e) => {
                          if (!isSelected)
                            e.currentTarget.style.background = rowBg;
                        }}
                      >
                        <td
                          style={{
                            ...tdStyle,
                            background: rowBg,
                            borderLeft: "none",
                            ...lastRowCellStyle,
                          }}
                        >
                          <Checkbox
                            size="small"
                            checked={isSelected}
                            onChange={() => handleToggleRow(realIdx)}
                            sx={checkboxSx}
                          />
                        </td>
                        <td
                          style={{
                            ...tdStyle,
                            background: rowBg,
                            ...lastRowCellStyle,
                            fontWeight: 600,
                            color: C.mutedText,
                          }}
                        >
                          {realIdx + 1}
                        </td>
                        <td
                          style={{
                            ...tdStyle,
                            background: rowBg,
                            ...lastRowCellStyle,
                            fontWeight: 600,
                            textAlign: "left",
                          }}
                        >
                          {row.name}
                        </td>
                        <td
                          style={{
                            ...tdStyle,
                            background: rowBg,
                            ...lastRowCellStyle,
                          }}
                        >
                          <StatusChip tone={getMatchModeTone(row.matchMode)}>
                            {row.matchMode}
                          </StatusChip>
                        </td>
                        <td
                          style={{
                            ...tdStyle,
                            background: rowBg,
                            ...lastRowCellStyle,
                            fontFamily: "ui-monospace, monospace",
                            fontSize: 12,
                          }}
                        >
                          {row.blockedNumber}
                        </td>
                        <td
                          style={{
                            ...tdStyle,
                            background: rowBg,
                            ...lastRowCellStyle,
                          }}
                        >
                          <StatusChip tone={getDirectionTone(row.direction)}>
                            {row.direction}
                          </StatusChip>
                        </td>
                        <td
                          style={{
                            ...tdStyle,
                            background: rowBg,
                            ...lastRowCellStyle,
                          }}
                        >
                          <StatusChip
                            tone={row.enabled === "Yes" ? "success" : "neutral"}
                          >
                            {row.enabled}
                          </StatusChip>
                        </td>
                        <td
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
                            <button
                              type="button"
                              title="Edit"
                              onClick={() => handleOpenEditModal(row)}
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                justifyContent: "center",
                                width: 32,
                                height: 32,
                                border: "none",
                                borderRadius: 8,
                                background: "transparent",
                                color: "#3E5475",
                                cursor: "pointer",
                                transition:
                                  "background 0.15s ease, color 0.15s ease",
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = "#e0f2fe";
                                e.currentTarget.style.color = "#2563eb";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = "transparent";
                                e.currentTarget.style.color = "#3E5475";
                              }}
                            >
                              <EditDocumentIcon sx={{ fontSize: 20 }} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {!isInitialLoad && rows.length > 0 && filteredRows.length > 0 && (
            <BlockedListPagination
              page={page}
              totalPages={totalPages}
              recordCount={pagedRows.length}
              totalCount={filteredRows.length}
              onPrev={handlePrev}
              onNext={handleNext}
              disabled={loading.fetch}
            />
          )}
        </div>
      </div>

      {/* ── Add/Edit Modal ── */}
      <Dialog
        open={showModal}
        onClose={loading.save ? null : handleCloseModal}
        maxWidth={false}
        PaperProps={{ sx: blockedListModalPaperSx }}
      >
        <DialogTitle
          sx={{
            background: "#1e2d42",
            color: "#fff",
            fontWeight: 700,
            fontSize: "16px !important",
            lineHeight: "1.4 !important",
            textAlign: "center",
            padding: "14px 24px !important",
            letterSpacing: "-0.01em",
          }}
        >
          {editId != null ? "Edit Blocked Entry" : "Add Blocked Entry"}
        </DialogTitle>

        <DialogContent
          sx={{
            padding: "24px !important",
            background: "var(--bg-surface)",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div
              style={{
                background: "var(--bg-main)",
                border: `1px solid ${C.divider}`,
                borderRadius: FIELD_RADIUS,
                padding: 20,
              }}
            >
              <div
                style={{ display: "flex", flexDirection: "column", gap: 16 }}
              >
                <div
                  style={{ display: "flex", alignItems: "center", gap: 12 }}
                >
                 <Tooltip
  title="User-defined name of a blocked list. It must be filled in: otherwise the configuration will fail to be saved. You can user letters, digits, chinese,_only."
  {...tooltipProps}
>
  <label
    style={{
      fontSize: 13,
      fontWeight: 600,
      color: FIELD_LABEL_COLOR,
      width: 160,
      flexShrink: 0,
      cursor: "help",
    }}
  >
    Name <span style={{ color: C.errorRed }}>*</span>
  </label>
</Tooltip>
                  <TextField
                    size="small"
                    fullWidth
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    sx={blockedListFieldSx}
                  />
                </div>

                <div
                  style={{ display: "flex", alignItems: "center", gap: 12 }}
                >
                     <Tooltip
  title="Select match mode. You can select Exact Match, Regex Match, or Extension. The pattern that selects the exact match number can match the excact number, the pattern that selects the regex match mode can match the regex expression. For example, enter 888*, so can matches anythings starting with 888(include 888)."
  {...tooltipProps}
>
  <label
    style={{
      fontSize: 13,
      fontWeight: 600,
      color: FIELD_LABEL_COLOR,
      width: 160,
      flexShrink: 0,
      cursor: "help",
    }}
  >
    Match Mode <span style={{ color: C.errorRed }}>*</span>
  </label>
</Tooltip>
                  <FormControl size="small" fullWidth>
                    <MuiSelect
                      value={matchMode}
                      onChange={(e) => {
                        const val = e.target.value;
                        setMatchMode(val);
                        if (val === "Extension") setBlockedNumber("");
                        else setSelectedExtension("");
                      }}
                      sx={blockedListFieldSx}
                    >
                      <MenuItem
                        value="Exact Match"
                        sx={{ fontSize: 13, fontWeight: 400 }}
                      >
                        Exact Match
                      </MenuItem>
                      <MenuItem
                        value="Regex Match"
                        sx={{ fontSize: 13, fontWeight: 400 }}
                      >
                        Regex Match
                      </MenuItem>
                      <MenuItem
                        value="Extension"
                        sx={{ fontSize: 13, fontWeight: 400 }}
                      >
                        Extension
                      </MenuItem>
                    </MuiSelect>
                  </FormControl>
                </div>

                {matchMode === "Extension" ? (
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 12 }}
                  >
                    <label
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: FIELD_LABEL_COLOR,
                        width: 160,
                        flexShrink: 0,
                      }}
                    >
                      Extension <span style={{ color: C.errorRed }}>*</span>
                    </label>
                    <FormControl size="small" fullWidth>
                      <MuiSelect
                        value={selectedExtension}
                        onChange={(e) => setSelectedExtension(e.target.value)}
                        displayEmpty
                        sx={blockedListFieldSx}
                      >
                        <MenuItem value="" disabled sx={{ fontSize: 13 }}>
                          <span style={{ color: C.mutedText }}>
                            Select Extension
                          </span>
                        </MenuItem>
                        {availableExtensions.map((ext) => (
                          <MenuItem
                            key={ext.value}
                            value={ext.value}
                            sx={{ fontSize: 13 }}
                          >
                            {ext.label}
                          </MenuItem>
                        ))}
                      </MuiSelect>
                    </FormControl>
                  </div>
                ) : (
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 12 }}
                  >
                 <Tooltip
  title="Enter or select the blocked list number that will be used to identify and block matching calls."
  {...tooltipProps}
>
  <label
    style={{
      fontSize: 13,
      fontWeight: 600,
      color: FIELD_LABEL_COLOR,
      width: 160,
      flexShrink: 0,
      cursor: "help",
    }}
  >
    Blocked List Number{" "}
    <span style={{ color: C.errorRed }}>*</span>
  </label>
</Tooltip>
                    <TextField
                      fullWidth
                      size="small"
                      value={blockedNumber}
                      onChange={(e) => setBlockedNumber(e.target.value)}
                      sx={blockedListFieldSx}
                    />
                  </div>
                )}

                <div
                  style={{ display: "flex", alignItems: "center", gap: 12 }}
                >
                   <Tooltip
  title="Select the call direction for which the blocked list will be applied, such as inbound, outbound, or both."
  {...tooltipProps}
>
  <label
    style={{
      fontSize: 13,
      fontWeight: 600,
      color: FIELD_LABEL_COLOR,
      width: 160,
      flexShrink: 0,
      cursor: "help",
    }}
  >
    Blocked List Direction{" "}
    <span style={{ color: C.errorRed }}>*</span>
  </label>
</Tooltip>
                  <FormControl size="small" fullWidth>
                    <MuiSelect
                      value={direction}
                      onChange={(e) => setDirection(e.target.value)}
                      sx={blockedListFieldSx}
                    >
                      <MenuItem value="Inbound" sx={{ fontSize: 13 }}>
                        Inbound
                      </MenuItem>
                      <MenuItem value="Outbound" sx={{ fontSize: 13 }}>
                        Outbound
                      </MenuItem>
                      <MenuItem value="Internal" sx={{ fontSize: 13 }}>
                        Internal
                      </MenuItem>
                    </MuiSelect>
                  </FormControl>
                </div>

                <div
                  style={{ display: "flex", alignItems: "center", gap: 12 }}
                >
                <Tooltip
  title="Enable or disable this configuration. When enabled, the settings in this section will be applied and become active."
  {...tooltipProps}
>
  <label
    style={{
      fontSize: 13,
      fontWeight: 600,
      color: FIELD_LABEL_COLOR,
      width: 160,
      flexShrink: 0,
      cursor: "help",
    }}
  >
    Enable <span style={{ color: C.errorRed }}>*</span>
  </label>
</Tooltip>
                  <FormControl size="small" fullWidth>
                    <MuiSelect
                      value={enabled}
                      onChange={(e) => setEnabled(e.target.value)}
                      sx={blockedListFieldSx}
                    >
                      <MenuItem value="Yes" sx={{ fontSize: 13 }}>
                        Yes
                      </MenuItem>
                      <MenuItem value="No" sx={{ fontSize: 13 }}>
                        No
                      </MenuItem>
                    </MuiSelect>
                  </FormControl>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>

        <DialogActions
          sx={{
            padding: "16px 24px !important",
            background: C.pageBg,
            borderTop: `1px solid ${C.divider}`,
            justifyContent: "center !important",
            gap: "12px",
          }}
        >
          <Btn
            onClick={handleSave}
            disabled={loading.save}
            variant="dialogPrimary"
          >
            {loading.save ? (
              <CircularProgress
                size={13}
                style={{ color: "#fff", marginRight: 8 }}
              />
            ) : null}

            {loading.save
              ? "Saving..."
              : editId != null
                ? "Update Entry"
                : "Create"}
          </Btn>
          <Btn
            onClick={handleCloseModal}
            disabled={loading.save}
            variant="dialogCancel"
          >
            Cancel
          </Btn>
        </DialogActions>
      </Dialog>

    </div>
  );
};

export default BlockedListPage;
