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
  Checkbox,
  RadioGroup,
  FormControlLabel,
  Radio, useMediaQuery } from "@mui/material";

import {
  fetchSipAccounts,
  listTrunkIds,
  fetchCallbackRules,
  createCallbackRule,
  updateCallbackRule,
  deleteCallbackRule,
} from "../../../api/apiService";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";

const PBX_COMPACT_MQ = "(max-width: 768px)";

// ── Color palette (CDR / PBX Admin Theme) ───────────────────────────────────
const C = {
  pageBg: "#f8fafc",
  cardBg: "#ffffff",
  cardBorder: "#9CA3AF",
  labelText: "#3E5475",
  valueText: "#0f172a",
  mutedText: "#94a3b8",
  accent: "#3E5475",
  strongText: "#0f172a",
  amber: "#dc2626",
  successGreen: "#16a34a",
  errorRed: "#dc2626",
};

const BTN_BASE =
  "inline-flex items-center justify-center gap-[6px] h-[30px] px-[14px] py-[6px] rounded-[10px] text-[12px] font-semibold whitespace-nowrap transition-all duration-150 ease-in-out cursor-pointer border disabled:cursor-not-allowed disabled:opacity-60";
const BTN_DEFAULT = `${BTN_BASE} bg-white text-[#0f172a] border-[#9ca3af] hover:bg-[#e2e8f0]`;
const BTN_OUTLINE = `${BTN_BASE} bg-white text-[#3E5475] border-[#9CA3AF] hover:bg-[#e2e8f0]`;
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
      background: "#F8FAFC",
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
  color: "#3E5475",
  "&.Mui-checked": { color: "#0284c7" },
  "&.MuiCheckbox-indeterminate": { color: "#0284c7" },
};


const CALLBACK_PAGE_WRAP =
  "bg-[#f8fafc] min-h-[calc(100vh-80px)] p-[16px] box-border";
const CALLBACK_PAGE_INNER = "w-full max-w-full mx-auto";
const CALLBACK_CARD =
  "overflow-hidden rounded-[10px] border-[1.5px] border-[#9CA3AF] bg-white shadow-[0_10px_30px_rgba(15,23,42,0.06)]";
const CALLBACK_TOOLBAR =
  "flex min-h-[44px] flex-wrap items-center justify-between gap-[12px] border-b border-[#9CA3AF] bg-white px-[14px] py-[7px] rounded-t-[10px]";
const CALLBACK_TOOLBAR_COMPACT = "flex-col items-stretch gap-[10px]";
const CALLBACK_TOOLBAR_LEFT = "flex flex-wrap items-center gap-[8px]";
const CALLBACK_TOOLBAR_ACTIONS = "flex flex-wrap items-center gap-[8px]";
const CALLBACK_SELECTED_BADGE =
  "rounded-full border border-[#3E5475] bg-[#e0f2fe] px-[12px] py-[5px] text-[11px] font-bold text-[#3E5475]";
const CALLBACK_PAGE_BADGE =
  "rounded-[6px] border-[0.5px] border-[#9CA3AF] bg-[#e0f2fe] px-[14px] py-[5px] text-[11px] font-semibold text-[#3E5475]";
const CALLBACK_PAGINATION =
  "flex items-center justify-between border-t border-[#9CA3AF] bg-white px-[14px] py-[7px] rounded-b-[10px]";

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
      className="text-[13px] font-semibold text-[#3E5475]"
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

const CallbackPagination = ({
  page,
  totalPages,
  recordCount,
  onPrev,
  onNext,
  disabled,
}) => (
  <div className={CALLBACK_PAGINATION}>
    <span className="text-[11px] text-[#94a3b8]">
      Showing {recordCount} record{recordCount !== 1 ? "s" : ""} on page {page}
    </span>
    <div className="flex items-center gap-[8px]">
      <Btn onClick={onPrev} disabled={disabled || page <= 1} variant="outline">
        ← Prev
      </Btn>
      <span className={CALLBACK_PAGE_BADGE}>
        Page {page} of {totalPages}
      </span>
      <Btn onClick={onNext} disabled={disabled || page >= totalPages} variant="outline">
        Next →
      </Btn>
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────

const CallBackPage = () => {
  const isCompact = useMediaQuery(PBX_COMPACT_MQ);
  const [rows, setRows] = useState([]);
  const [selected, setSelected] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState({
    fetch: false,
    delete: false,
    save: false,
    extensions: false,
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
  const [delay, setDelay] = useState("10");
  const [strip, setStrip] = useState("");
  const [prepend, setPrepend] = useState("");
  const [destination, setDestination] = useState("");
  const [, setThroughAuto] = useState(true);
  const [throughFromComeIn, setThroughFromComeIn] = useState(false);
  const [throughSelect, setThroughSelect] = useState(false);
  const [extensionOptions, setExtensionOptions] = useState([]);
  const [trunkOptions, setTrunkOptions] = useState([]);
  const orderOptions = Array.from({ length: 21 }, (_, i) => i * 5);

  const showAlert = (type, text) => {
    setError({ type, text });
    setTimeout(() => setError({ type: "", text: "" }), 5000);
  };

  const loadRows = async () => {
    setLoading((prev) => ({ ...prev, fetch: true }));
    try {
      const res = await fetchCallbackRules();
      const raw = res?.message ?? res?.data ?? res;
      const list = Array.isArray(raw) ? raw : [];
      setRows(
        list.map((item) => ({
          id: item.id,
          name: item.name || "",
          delay: item.delay_sec != null ? String(item.delay_sec) : "10",
          strip: item.strip_digits != null ? String(item.strip_digits) : "",
          prepend: item.prepend || "",
          destination: item.destination || "",
          throughAuto: item.through_mode === "auto",
          throughFromComeIn: item.through_mode === "from_in",
          throughSelect: item.through_mode === "select",
        })),
      );
    } catch (err) {
      showAlert("error", err?.message || "Failed to load callbacks.");
    } finally {
      setLoading((prev) => ({ ...prev, fetch: false }));
      setIsInitialLoad(false);
    }
  };

  const loadExtensions = async () => {
    setLoading((prev) => ({ ...prev, extensions: true }));
    try {
      const res = await fetchSipAccounts();
      const list = Array.isArray(res?.message)
        ? res.message
        : Array.isArray(res)
          ? res
          : [];
      const exts = list
        .map((item) => String(item.extension ?? ""))
        .filter((x) => x)
        .sort((a, b) => (parseInt(a) || 0) - (parseInt(b) || 0));
      setExtensionOptions(exts);
    } catch (err) {
      showAlert("error", err?.message || "Failed to load extensions.");
      setExtensionOptions([]);
    } finally {
      setLoading((prev) => ({ ...prev, extensions: false }));
    }
  };

  const loadTrunks = async () => {
    try {
      const res = await listTrunkIds();
      const raw = res?.message ?? res?.data ?? res;
      const list = Array.isArray(raw) ? raw : [];
      const trunks = list
        .map((t) => t?.trunk_id || t?.id || t)
        .filter(Boolean)
        .map(String);
      setTrunkOptions(trunks);
    } catch (err) {
      console.error("Failed to load trunk IDs for callback:", err);
      setTrunkOptions([]);
    }
  };

  useEffect(() => {
    if (!hasInitialLoadRef.current) {
      hasInitialLoadRef.current = true;
      loadRows();
    }
  }, []);

  // ── Search & Pagination Logic ──
  const filteredRows = searchQuery.trim()
    ? rows.filter((r) =>
        [r.name, r.destination, r.delay].some((v) =>
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
      await Promise.all(ids.map((id) => deleteCallbackRule(id)));
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
    setDelay("10");
    setStrip("");
    setPrepend("");
    setDestination("");
    setThroughAuto(true);
    setThroughFromComeIn(false);
    setThroughSelect(false);
  };

  const handleOpenAddModal = async () => {
    resetForm();
    setShowModal(true);
    await Promise.all([loadExtensions(), loadTrunks()]);
  };

  const handleOpenEditModal = async (row) => {
    setEditId(row.id);
    setName(row.name || "");
    setDelay(row.delay ?? "");
    setStrip(row.strip ?? "");
    setPrepend(row.prepend ?? "");
    setDestination(row.destination || "");
    setThroughAuto(!!row.throughAuto);
    setThroughFromComeIn(!!row.throughFromComeIn);
    setThroughSelect(!!row.throughSelect);
    setShowModal(true);
    await Promise.all([loadExtensions(), loadTrunks()]);
  };

  const handleCloseModal = () => {
    if (loading.save) return;
    setShowModal(false);
    resetForm();
  };

  const handleSave = async () => {
    const trimmedName = name.trim();
    if (!trimmedName) return showAlert("error", "Please enter a Name.");
    if (!delay) return showAlert("error", "Please enter Delay (s).");
    if (!destination) return showAlert("error", "Please select Destination.");

    const delaySec = Number(delay) || 0;
    const stripDigits = strip === "" ? 0 : Number(strip) || 0;

    let through_mode = "auto";
    if (throughSelect) through_mode = "select";
    else if (throughFromComeIn) through_mode = "from_in";

    const apiPayload = {
      name: trimmedName,
      delay_sec: delaySec,
      strip_digits: stripDigits,
      prepend,
      destination,
      through_mode,
      enabled: true,
      trunks: [], // Logic kept exactly as original
    };

    setLoading((prev) => ({ ...prev, save: true }));
    try {
      if (editId != null) {
        await updateCallbackRule({ id: editId, ...apiPayload });
        showAlert("success", "Callback updated.");
      } else {
        await createCallbackRule(apiPayload);
        showAlert("success", "Callback created.");
      }
      await loadRows();
      handleCloseModal();
    } catch (err) {
      showAlert("error", err?.message || "Failed to save.");
    } finally {
      setLoading((prev) => ({ ...prev, save: false }));
    }
  };

  const renderThrough = (row) => {
    const labels = [];
    if (row.throughAuto) labels.push("Auto");
    if (row.throughFromComeIn) labels.push("From Come in");
    if (row.throughSelect) labels.push("Select");
    return labels.join(", ") || "Auto";
  };

  return (
    <div className={`${CALLBACK_PAGE_WRAP} ${isCompact ? "p-[8px]" : ""}`.trim()}>
      <div className={CALLBACK_PAGE_INNER}>
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

        <PbxBreadcrumb section="Call Features" current="CallBack" />

        <div className={CALLBACK_CARD}>
          <div
            className={`${CALLBACK_TOOLBAR} ${isCompact ? CALLBACK_TOOLBAR_COMPACT : ""}`.trim()}
          >
            <div className={CALLBACK_TOOLBAR_LEFT}>
              {selected.length > 0 && (
                <span className={CALLBACK_SELECTED_BADGE}>
                  {selected.length} selected
                </span>
              )}
            </div>

            <div className={CALLBACK_TOOLBAR_ACTIONS}>
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
          <div style={{ overflowX: "hidden", overflowY: "auto", flex: 1 , ...(isCompact ? { overflowX: "auto", WebkitOverflowScrolling: "touch" } : {}) }}>
            {isInitialLoad ? (
              <TableListLoading />
            ) : rows.length === 0 ? (
              <TableListEmptyState
                message="No callbacks found."
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
                      Delay (s)
                    </TH>
                    <TH style={{ position: "sticky", top: 0, zIndex: 10 }}>
                      Strip
                    </TH>
                    <TH style={{ position: "sticky", top: 0, zIndex: 10 }}>
                      Prepend
                    </TH>
                    <TH style={{ position: "sticky", top: 0, zIndex: 10 }}>
                      Destination
                    </TH>
                    <TH style={{ position: "sticky", top: 0, zIndex: 10 }}>
                      Through
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
                            e.currentTarget.style.background = "#f8fafc";
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
                            borderBottom: isLastRow
                              ? "none"
                              : tdStyle.borderBottom,
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
                            borderBottom: isLastRow
                              ? "none"
                              : tdStyle.borderBottom,
                          }}
                        >
                          {realIdx + 1}
                        </td>
                        <td
                          style={{
                            ...tdStyle,
                            background: rowBg,
                            borderBottom: isLastRow
                              ? "none"
                              : tdStyle.borderBottom,
                          }}
                        >
                          {row.name}
                        </td>
                        <td
                          style={{
                            ...tdStyle,
                            background: rowBg,
                            borderBottom: isLastRow
                              ? "none"
                              : tdStyle.borderBottom,
                          }}
                        >
                          <span
                            style={{
                              color: C.valueText,
                              padding: "4px 11px",
                              borderRadius: 999,
                              fontSize: 11,
                              fontWeight: 700,
                              letterSpacing: "0.01em",
                              whiteSpace: "nowrap",
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            {row.delay}
                          </span>
                        </td>
                        <td
                          style={{
                            ...tdStyle,
                            background: rowBg,
                            borderBottom: isLastRow
                              ? "none"
                              : tdStyle.borderBottom,
                          }}
                        >
                          {row.strip || "—"}
                        </td>
                        <td
                          style={{
                            ...tdStyle,
                            background: rowBg,
                            borderBottom: isLastRow
                              ? "none"
                              : tdStyle.borderBottom,
                          }}
                        >
                          {row.prepend || "—"}
                        </td>
                        <td
                          style={{
                            ...tdStyle,
                            background: rowBg,
                            borderBottom: isLastRow
                              ? "none"
                              : tdStyle.borderBottom,
                          }}
                        >
                          {row.destination || "—"}
                        </td>
                        <td
                          style={{
                            ...tdStyle,
                            background: rowBg,
                            borderBottom: isLastRow
                              ? "none"
                              : tdStyle.borderBottom,
                          }}
                        >
                          <span
                            style={{
                              color: row.throughAuto
                                ? "#16a34a"
                                : row.throughFromComeIn
                                  ? C.accent
                                  : "#475569",
                              fontSize: 11,
                              fontWeight: 700,
                              letterSpacing: "0.01em",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {renderThrough(row)}
                          </span>
                        </td>
                        <td
                          style={{
                            ...tdStyle,
                            background: rowBg,
                            borderBottom: isLastRow
                              ? "none"
                              : tdStyle.borderBottom,
                            borderRight: "none",
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
                            onMouseEnter={(e) => {
                              e.currentTarget.style.opacity = "1";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.opacity = "0.7";
                            }}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {!isInitialLoad && rows.length > 0 && filteredRows.length > 0 && (
            <CallbackPagination
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
  PaperProps={{
    sx: {
      width: 560,
      maxWidth: "95vw",
      borderRadius: 2,
      mt:16,       // top se fixed gap
      alignSelf: "flex-start",
    },
  }}
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
          {editId != null ? "Edit CallBack Rule" : "Add CallBack"}
        </DialogTitle>

        <DialogContent
          style={{ padding: "20px 24px", backgroundColor: "#ffffff" }}
        >
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
                      width: 100,
                      flexShrink: 0,
                    }}
                  >
                    Name <span style={{ color: C.labelText }}>:</span>
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
                        backgroundColor: "#fff",
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
                      width: 100,
                      flexShrink: 0,
                    }}
                  >
                    Strip :
                  </label>
                  <TextField
                    size="small"
                    fullWidth
                    type="number"
                    value={strip}
                    onChange={(e) => setStrip(e.target.value)}
                    inputProps={{
                      style: {
                        fontSize: 13,
                        padding: "6px 8px",
                        backgroundColor: "#fff",
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
                      width: 100,
                      flexShrink: 0,
                    }}
                  >
                    Destination <span style={{ color: C.labelText }}>:</span>
                  </label>
                  <FormControl size="small" fullWidth>
                    <MuiSelect
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                      displayEmpty
                      sx={{
                        fontSize: 13,
                        backgroundColor: "#fff",
                        height: 32,
                        "& .MuiSelect-select": {
                          padding: "6px 8px",
                          display: "flex",
                          alignItems: "center",
                        },
                      }}
                    >
                      <MenuItem value="" disabled sx={{ fontSize: 13 }}>
                        <span style={{ color: C.mutedText }}>
                          {loading.extensions
                            ? "Loading..."
                            : "Select Destination"}
                        </span>
                      </MenuItem>
                      {extensionOptions.map((ext) => (
                        <MenuItem key={ext} value={ext} sx={{ fontSize: 13 }}>
                          {ext}
                        </MenuItem>
                      ))}
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
                      width: 100,
                      flexShrink: 0,
                    }}
                  >
                    Delay (s) <span style={{ color: C.labelText }}>:</span>
                  </label>
                  <TextField
                    size="small"
                    fullWidth
                    type="number"
                    value={delay}
                    onChange={(e) => setDelay(e.target.value)}
                    inputProps={{
                      style: {
                        fontSize: 13,
                        padding: "6px 8px",
                        backgroundColor: "#fff",
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
                      width: 100,
                      flexShrink: 0,
                    }}
                  >
                    Prepend :
                  </label>
                  <TextField
                    size="small"
                    fullWidth
                    value={prepend}
                    onChange={(e) => setPrepend(e.target.value)}
                    inputProps={{
                      style: {
                        fontSize: 13,
                        padding: "6px 8px",
                        backgroundColor: "#fff",
                      },
                    }}
                  />
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 12,
                  }}
                >
                  <label
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: C.labelText,
                      width: 100,
                      flexShrink: 0,
                      marginTop: 4,
                    }}
                  >
                    Through :
                  </label>
                  <RadioGroup
                    value={
                      throughSelect
                        ? "select"
                        : throughFromComeIn
                          ? "from_in"
                          : "auto"
                    }
                    onChange={(e) => {
                      const val = e.target.value;
                      setThroughAuto(val === "auto");
                      setThroughFromComeIn(val === "from_in");
                      setThroughSelect(val === "select");
                    }}
                    sx={{ display: "flex", flexDirection: "column", gap: 0 }}
                  >
                    <FormControlLabel
                      value="auto"
                      control={<Radio size="small" sx={{ p: 0.5 }} />}
                      label={<span style={{ fontSize: 13 }}>Auto</span>}
                      sx={{ m: 0 }}
                    />
                    <FormControlLabel
                      value="from_in"
                      control={<Radio size="small" sx={{ p: 0.5 }} />}
                      label={
                        <span style={{ fontSize: 13 }}>From come in</span>
                      }
                      sx={{ m: 0 }}
                    />
                    <FormControlLabel
                      value="select"
                      control={<Radio size="small" sx={{ p: 0.5 }} />}
                      label={<span style={{ fontSize: 13 }}>Select</span>}
                      sx={{ m: 0 }}
                    />
                  </RadioGroup>
                </div>
              </div>

              {/* Dynamic Select Trunks (Visible only if Through == Select) */}
              {throughSelect && (
                <div
                  style={{
                    marginTop: 16,
                    paddingTop: 16,
                   
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      marginBottom: 8,
                      paddingLeft: 0,
                    }}
                  >
                    <div
                      style={{
                        flex: 1,
                        fontSize: 12,
                        fontWeight: 600,
                        color: C.labelText,
                      }}
                    >
                      Trunk
                    </div>
                    <div
                      style={{
                        width: 80,
                        fontSize: 12,
                        fontWeight: 600,
                        color: C.labelText,
                        textAlign: "center",
                      }}
                    >
                      Order
                    </div>
                  </div>
                  {[0, 1, 2, 3, 4].map((idx) => (
                    <div
                      key={idx}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        marginBottom: 8,
                      }}
                    >
                      
                      <div style={{ flex: 1 }}>
                        <FormControl size="small" fullWidth>
                          <MuiSelect
                            value=""
                            displayEmpty
                            sx={{
                              fontSize: 13,
                              
                              backgroundColor: "#fff",
                              height: 32,
                              "& .MuiSelect-select": {
                                padding: "6px 8px",
                                display: "flex",
                                alignItems: "center",
                              },
                            }}
                          >
                            <MenuItem
                              value=""
                              disabled
                              sx={{
                                fontSize: 13,
                                backgroundColor: "#fff",
                                height: 32,
                                "& .MuiSelect-select": {
                                  padding: "6px 8px",
                                  display: "flex",
                                  alignItems: "center",
                                },
                              }}
                            >
                              {trunkOptions.length
                                ? "Select trunk"
                                : "No trunks"}
                            </MenuItem>
                            {trunkOptions.map((t) => (
                              <MenuItem
                                key={t}
                                value={t}
                                sx={{
                                  fontSize: 13,
                                  backgroundColor: "#fff",
                                  height: 32,
                                  "& .MuiSelect-select": {
                                    padding: "6px 8px",
                                    display: "flex",
                                    alignItems: "center",
                                  },
                                }}
                              >
                                {t}
                              </MenuItem>
                            ))}
                          </MuiSelect>
                        </FormControl>
                      </div>
                      <div style={{ width: 80 }}>
                        <FormControl size="small" fullWidth>
                          <MuiSelect
                            value={0}
                            sx={{
                              fontSize: 13,
                              backgroundColor: "#fff",
                              height: 32,
                              "& .MuiSelect-select": {
                                padding: "6px 8px",
                                display: "flex",
                                alignItems: "center",
                              },
                            }}
                          >
                            {orderOptions.map((val) => (
                              <MenuItem
                                key={val}
                                value={val}
                                sx={{
                                  fontSize: 13,
                                  backgroundColor: "#fff",
                                  height: 32,
                                  "& .MuiSelect-select": {
                                    padding: "6px 8px",
                                    display: "flex",
                                    alignItems: "center",
                                  },
                                }}
                              >
                                {val}
                              </MenuItem>
                            ))}
                          </MuiSelect>
                        </FormControl>
                      </div>
                    </div>
                  ))}
                </div>
              )}
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
            {loading.save ? <CircularProgress /> : null}
            {loading.save
              ? "Saving..."
              : editId != null
                ? "Update Rule"
                : "Create"}
          </Btn>
          <Btn
            onClick={handleCloseModal}
            disabled={loading.save}
            variant="cancel"
            style={{ minWidth: 100, height: 33 }}
          >
            Cancel
          </Btn>
        </DialogActions>
      </Dialog>

    </div>
  );
};

export default CallBackPage;
