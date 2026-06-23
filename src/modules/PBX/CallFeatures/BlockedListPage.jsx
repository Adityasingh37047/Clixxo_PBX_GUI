import React, { useState, useEffect, useRef } from "react";
import EditDocumentIcon from "@mui/icons-material/EditDocument";
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

// ── Color palette (CDR / PBX Admin Theme) ───────────────────────────────────
const C = {
  pageBg: "var(--bg-main)",
  cardBg: "var(--bg-surface)",
  cardBorder: "var(--border-strong)",
  labelText: "var(--text-primary)",
  valueText: "var(--text-primary)",
  mutedText: "var(--text-muted)",
  strongText: "var(--text-primary)",
  accent: "var(--accent-brand)",
  amber: "#dc2626",
  errorRed: "#dc2626",
  successGreen: "#16a34a",
};

const BTN_BASE =
  "inline-flex items-center justify-center gap-[6px] h-[30px] px-[14px] py-[6px] rounded-[10px] text-[12px] font-semibold whitespace-nowrap transition-all duration-150 ease-in-out cursor-pointer border disabled:cursor-not-allowed disabled:opacity-60";
const BTN_DEFAULT = `${BTN_BASE} bg-[var(--bg-surface)] text-[var(--text-primary)] border-[var(--border-subtle)] hover:bg-[var(--row-alt)]`;
const BTN_OUTLINE = `${BTN_BASE} bg-[var(--bg-surface)] text-[var(--text-label)] border-[var(--border-strong)] hover:bg-[var(--row-alt)]`;
const BTN_CANCEL = `${BTN_BASE} bg-[#cbd5e1] text-[#374151] border-[#cbd5e1] shadow-[0_1px_2px_rgba(15,23,42,0.08)] hover:bg-[#b6c2d3]`;
const BTN_PRIMARY = `${BTN_BASE} text-white border-[#5A6F8F] bg-[linear-gradient(to_bottom,#5A6F8F_0%,#3E5475_60%,#2C3E57_100%)] hover:bg-[linear-gradient(to_bottom,#3E5475_0%,#5A6F8F_100%)]`;
const BTN_DIALOG_PRIMARY =
  "inline-flex items-center justify-center gap-[6px] min-w-[100px] h-[36px] px-[28px] py-[6px] rounded-[10px] text-[13px] font-semibold whitespace-nowrap transition-all duration-150 ease-in-out cursor-pointer border text-white border-[#5A6F8F] bg-[linear-gradient(to_bottom,#5A6F8F_0%,#3E5475_60%,#2C3E57_100%)] hover:bg-[linear-gradient(to_bottom,#3E5475_0%,#5A6F8F_100%)] disabled:cursor-not-allowed disabled:opacity-60";
const BTN_DIALOG_CANCEL =
  "inline-flex items-center justify-center gap-[6px] min-w-[100px] h-[33px] px-[14px] py-[6px] rounded-[10px] text-[13px] font-semibold whitespace-nowrap transition-all duration-150 ease-in-out cursor-pointer border bg-[#cbd5e1] text-[#374151] border-[#cbd5e1] shadow-[0_1px_2px_rgba(15,23,42,0.08)] hover:bg-[#b6c2d3] disabled:cursor-not-allowed disabled:opacity-60";

const btnVariantCls = {
  default: BTN_DEFAULT,
  primary: BTN_PRIMARY,
  accent: BTN_PRIMARY,
  cancel: BTN_CANCEL,
  dialogPrimary: BTN_DIALOG_PRIMARY,
  dialogCancel: BTN_DIALOG_CANCEL,
  danger: `${BTN_BASE} bg-[#dc2626] text-white border-[0.5px] border-[#dc2626] hover:bg-[#b91c1c]`,
  outline: BTN_OUTLINE,
};

const Btn = ({
  children,
  onClick,
  disabled,
  variant = "default",
  className = "",
  style,
  type,
  title,
}) => (
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


// ── Shared: Table Header ──────────────────────────────────────────────────────
const TH = ({ children, style: extra }) => (
  <th
    style={{
      background: "var(--table-header-bg)",
      color: C.labelText,
      fontWeight: 700,
      fontSize: 11,
      padding: "9px 14px",
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

const tdStyle = {
  padding: "7px 14px",
  fontSize: 13,
  color: C.valueText,
  textAlign: "center",
  borderBottom: `1px solid ${C.cardBorder}`,
  borderRight: `1px solid ${C.cardBorder}`,
  whiteSpace: "nowrap",
};

const checkboxSx = {
  padding: "1px",
  color: "var(--text-primary)",
  "&.Mui-checked": { color: "#0284c7" },
  "&.MuiCheckbox-indeterminate": { color: "#0284c7" },
};

const BLOCKED_LIST_PAGE_WRAP =
  "bg-[var(--bg-main)] min-h-[calc(100vh-80px)] p-[16px] box-border";
const BLOCKED_LIST_PAGE_INNER = "w-full max-w-full mx-auto";
const BLOCKED_LIST_CARD =
  "overflow-hidden rounded-[10px] border-[1.5px] border-[var(--border-strong)] bg-[var(--bg-surface)] shadow-[0_10px_30px_rgba(15,23,42,0.06)]";
const BLOCKED_LIST_TOOLBAR =
  "flex min-h-[44px] flex-wrap items-center justify-between gap-[12px] border-b border-[var(--border-strong)] bg-[var(--bg-surface)] px-[14px] py-[7px] rounded-t-[10px]";
const BLOCKED_LIST_TOOLBAR_COMPACT = "flex-col items-stretch gap-[10px]";
const BLOCKED_LIST_TOOLBAR_LEFT = "flex flex-wrap items-center gap-[8px]";
const BLOCKED_LIST_TOOLBAR_ACTIONS = "flex flex-wrap items-center gap-[8px]";
const BLOCKED_LIST_SELECTED_BADGE =
  "rounded-full border border-[#3E5475] bg-[#e0f2fe] px-[12px] py-[5px] text-[11px] font-bold text-[var(--text-label)]";
const BLOCKED_LIST_PAGE_BADGE =
  "rounded-[6px] border-[0.5px] border-[var(--border-strong)] bg-[#e0f2fe] px-[14px] py-[5px] text-[11px] font-semibold text-[var(--text-label)]";
const BLOCKED_LIST_PAGINATION =
  "flex items-center justify-between border-t border-[var(--border-strong)] bg-[var(--bg-surface)] px-[14px] py-[7px] rounded-b-[10px]";

const PbxBreadcrumb = ({ section, current, className = "" }) => (
  <div
    className={`mb-[16px] flex flex-wrap items-center gap-[4px] text-[12px] font-normal text-[#94a3b8] ${className}`.trim()}
  >
    <span>PBX</span>
    <span>&gt;</span>
    <span>{section}</span>
    <span>&gt;</span>
    <span className="font-semibold text-[#1e293b]">{current}</span>
  </div>
);

const TableListLoading = () => (
  <div className="flex items-center justify-center p-[48px]">
    <CircularProgress size={28} sx={{ color: C.accent }} />
  </div>
);

const TableListEmptyState = ({
  message,
  onAddNew,
  buttonLabel = "+ Add New",
  showButton = true,
}) => (
  <div className="flex min-h-[240px] flex-col items-center justify-center p-[24px] text-center">
    <div
      className="text-[13px] font-semibold text-[var(--text-label)]"
      style={{ marginBottom: showButton && onAddNew ? 16 : 0 }}
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

const BlockedListPagination = ({
  page,
  totalPages,
  recordCount,
  onPrev,
  onNext,
  disabled,
}) => (
  <div className={BLOCKED_LIST_PAGINATION}>
    <span className="text-[11px] text-[#94a3b8]">
      Showing {recordCount} record{recordCount !== 1 ? "s" : ""} on page {page}
    </span>
    <div className="flex items-center gap-[8px]">
      <Btn onClick={onPrev} disabled={disabled || page <= 1} variant="outline">
        ← Prev
      </Btn>
      <span className={BLOCKED_LIST_PAGE_BADGE}>
        Page {page} of {totalPages}
      </span>
      <Btn onClick={onNext} disabled={disabled || page >= totalPages} variant="outline">
        Next →
      </Btn>
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────

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
    <div className={`${BLOCKED_LIST_PAGE_WRAP} ${isCompact ? "p-[8px]" : ""}`.trim()}>
      <div className={BLOCKED_LIST_PAGE_INNER}>
        {/* Error / Success Banner */}
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
              boxShadow: 3,
            }}
          >
            {error.text}
          </Alert>
        )}

        <PbxBreadcrumb section="Call Features" current="Blocked List" />

        <div className={BLOCKED_LIST_CARD}>
          <div
            className={`${BLOCKED_LIST_TOOLBAR} ${isCompact ? BLOCKED_LIST_TOOLBAR_COMPACT : ""}`.trim()}
          >
            <div className={BLOCKED_LIST_TOOLBAR_LEFT}>
              {selected.length > 0 && (
                <span className={BLOCKED_LIST_SELECTED_BADGE}>
                  {selected.length} selected
                </span>
              )}
            </div>

            <div className={BLOCKED_LIST_TOOLBAR_ACTIONS}>
              <Btn
                onClick={handleDelete}
                disabled={
                  loading.delete || loading.fetch || selected.length === 0
                }
                variant="cancel"
              >
                <DeleteOutlineOutlinedIcon sx={{ fontSize: 16 }} />
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
                        ? "#f8fafc"
                        : "#ffffff";

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
                          }}
                        >
                          {realIdx + 1}
                        </td>
                        <td
                          style={{
                            ...tdStyle,
                            background: rowBg,
                            ...lastRowCellStyle,
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
                          <span
                            style={{
                              color: C.valueText,
                              fontSize: 11,
                              fontWeight: 700,
                              letterSpacing: "0.01em",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {row.matchMode}
                          </span>
                        </td>
                        <td
                          style={{
                            ...tdStyle,
                            background: rowBg,
                            ...lastRowCellStyle,
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
                          <span
                            style={{
                              color:
                                row.direction === "Inbound"
                                  ? "#16a34a"
                                  : row.direction === "Outbound"
                                    ? C.accent
                                    : "#475569",
                              fontSize: 11,
                              fontWeight: 700,
                              letterSpacing: "0.01em",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {row.direction}
                          </span>
                        </td>
                        <td
                          style={{
                            ...tdStyle,
                            background: rowBg,
                            ...lastRowCellStyle,
                          }}
                        >
                          <span
                            style={{
                              color:
                                row.enabled === "Yes" ? "#16a34a" : "#475569",
                              fontSize: 11,
                              fontWeight: 700,
                              letterSpacing: "0.01em",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {row.enabled}
                          </span>
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
                            <EditDocumentIcon
                              titleAccess="Edit"
                              onClick={() => handleOpenEditModal(row)}
                              style={{
                                cursor: "pointer",
                                color: "#2563eb",
                                fontSize: 22,
                                opacity: 0.7,
                                transition: "opacity 0.15s ease",
                              }}
                              onMouseEnter={(e) =>
                                (e.currentTarget.style.opacity = "1")
                              }
                              onMouseLeave={(e) =>
                                (e.currentTarget.style.opacity = "0.7")
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

          {!isInitialLoad && rows.length > 0 && filteredRows.length > 0 && (
            <BlockedListPagination
              page={page}
              totalPages={totalPages}
              recordCount={pagedRows.length}
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
        PaperProps={{ sx: { width: 560, maxWidth: "95vw", borderRadius: 2 } }}
      >
        <DialogTitle
          style={{
            background: "#1e2d42",
            color: "#fff",
            fontWeight: 700,
            fontSize: 16,
            textAlign: "center",
            padding: "14px 24px",
          }}
        >
          {editId != null ? "Edit Blocked Entry" : "Add Blocked Entry"}
        </DialogTitle>

        <DialogContent style={{ padding: "20px 24px", background: "var(--bg-surface)" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div
  style={{
    background: "#f5f7fa",
    border: `1px solid ${C.cardBorder}`,
    borderRadius: 6,
    padding: 16,
  }}
>
              <div
                style={{ display: "flex", flexDirection: "column", gap: 16 }}
              >
                <div
                  style={{ display: "flex", alignItems: "center", gap: 12 }}
                >
                  <label
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: C.labelText,
                      width: 160,
                      flexShrink: 0,
                    }}
                  >
                    Name <span style={{ color: C.errorRed }}>*</span>
                  </label>
                  <TextField
                    size="small"
                    fullWidth
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    inputProps={{
                      style: {
                        fontSize: 13,
                        padding: "6px 8px",
                        backgroundColor: "var(--bg-surface)",
                      },
                    }}
                  />
                </div>

                <div
                  style={{ display: "flex", alignItems: "center", gap: 12 }}
                >
                  <label
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: C.labelText,
                      width: 160,
                      flexShrink: 0,
                    }}
                  >
                    Match Mode <span style={{ color: C.errorRed }}>*</span>
                  </label>
                  <FormControl size="small" fullWidth>
                    <MuiSelect
                      value={matchMode}
                      onChange={(e) => {
                        const val = e.target.value;
                        setMatchMode(val);
                        if (val === "Extension") setBlockedNumber("");
                        else setSelectedExtension("");
                      }}
                      sx={{
                        fontSize: 13,
                        backgroundColor: "var(--bg-surface)",
                        height: 32,
                        "& .MuiSelect-select": {
                          padding: "6px 8px",
                          display: "flex",
                          alignItems: "center",
                        },
                      }}
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
                        color: C.labelText,
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
                        sx={{ fontSize: 13 }}
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
                    <label
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: C.labelText,
                        width: 160,
                        flexShrink: 0,
                      }}
                    >
                      Blocked List Number{" "}
                      <span style={{ color: C.errorRed }}>*</span>
                    </label>
                    <TextField
                      fullWidth
                      size="small"
                      value={blockedNumber}
                      onChange={(e) => setBlockedNumber(e.target.value)}
                      inputProps={{
                        style: {
                          fontSize: 13,
                          padding: "6px 8px",
                          backgroundColor: "var(--bg-surface)",
                        },
                      }}
                    />
                  </div>
                )}

                <div
                  style={{ display: "flex", alignItems: "center", gap: 12 }}
                >
                  <label
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: C.labelText,
                      width: 160,
                      flexShrink: 0,
                    }}
                  >
                    Blocked List Direction{" "}
                    <span style={{ color: C.errorRed }}>*</span>
                  </label>
                  <FormControl size="small" fullWidth>
                    <MuiSelect
                      value={direction}
                      onChange={(e) => setDirection(e.target.value)}
                      sx={{
                        fontSize: 13,
                        backgroundColor: "var(--bg-surface)",
                        height: 32,
                        "& .MuiSelect-select": {
                          padding: "6px 8px",
                          display: "flex",
                          alignItems: "center",
                        },
                      }}
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
                  <label
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: C.labelText,
                      width: 160,
                      flexShrink: 0,
                    }}
                  >
                    Enable <span style={{ color: C.errorRed }}>*</span>
                  </label>
                  <FormControl size="small" fullWidth>
                    <MuiSelect
                      value={enabled}
                      onChange={(e) => setEnabled(e.target.value)}
                      sx={{
                        fontSize: 13,
                        backgroundColor: "var(--bg-surface)",
                        height: 32,
                        "& .MuiSelect-select": {
                          padding: "6px 8px",
                          display: "flex",
                          alignItems: "center",
                        },
                      }}
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
          style={{
            padding: "16px 24px",
            background: C.pageBg,
            borderTop: `1px solid ${C.cardBorder}`,
            justifyContent: "center",
            gap: 12,
          }}
        >
          <Btn
            onClick={handleSave}
            disabled={loading.save}
            variant="primary"
            style={{ minWidth: 100, height: 33, fontSize: 13 }}
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
