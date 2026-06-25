import React, { useEffect, useState, useRef } from "react";
import EditDocumentIcon from "@mui/icons-material/EditDocument";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import Tooltip from "@mui/material/Tooltip";
import {Button,  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Checkbox,
  TextField,
  Alert,
  useMediaQuery,
} from "@mui/material";
import {
  createSpeedDial,
  deleteSpeedDial,
  listSpeedDials,
  updateSpeedDial,
  exportSpeedDialCsv,
  importSpeedDialCsv,
} from "../../../api/apiService";
const PBX_COMPACT_MQ = "(max-width: 768px)";

// ── Color Palette (CDR / PBX Admin Theme) ───────────────────────────────────
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
  successGreen: "#16a34a",
  errorRed: "#dc2626",
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


const SPEED_DIAL_PAGE_WRAP =
  "bg-[var(--bg-main)] min-h-[calc(100vh-80px)] p-[16px] box-border";
const SPEED_DIAL_PAGE_INNER = "w-full max-w-full mx-auto";
const SPEED_DIAL_CARD =
  "overflow-hidden rounded-[10px] border-[1.5px] border-[var(--border-strong)] bg-[var(--bg-surface)] shadow-[0_10px_30px_rgba(15,23,42,0.06)]";
const SPEED_DIAL_TOOLBAR =
  "flex min-h-[44px] flex-wrap items-center justify-between gap-[12px] border-b border-[var(--border-strong)] bg-[var(--bg-surface)] px-[14px] py-[7px] rounded-t-[10px]";
const SPEED_DIAL_TOOLBAR_COMPACT = "flex-col items-stretch gap-[10px]";
const SPEED_DIAL_TOOLBAR_LEFT = "flex flex-wrap items-center gap-[8px]";
const SPEED_DIAL_TOOLBAR_ACTIONS = "flex flex-wrap items-center gap-[8px]";
const SPEED_DIAL_SELECTED_BADGE =
  "rounded-[10px] border-[0.5px] border-[#3E5475] bg-[#e0f2fe] px-[10px] py-[3px] text-[11px] font-semibold text-[var(--text-label)]";
const SPEED_DIAL_PAGE_BADGE =
  "rounded-[6px] border-[0.5px] border-[var(--border-strong)] bg-[#e0f2fe] px-[14px] py-[5px] text-[11px] font-semibold text-[var(--text-label)]";
const SPEED_DIAL_PAGINATION =
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

const SpeedDialPagination = ({
  page,
  totalPages,
  recordCount,
  onPrev,
  onNext,
  disabled,
}) => (
  <div className={SPEED_DIAL_PAGINATION}>
    <span className="text-[11px] text-[#94a3b8]">
      Showing {recordCount} record{recordCount !== 1 ? "s" : ""} on page {page}
    </span>
    <div className="flex items-center gap-[8px]">
      <Btn onClick={onPrev} disabled={disabled || page <= 1} variant="outline">
        ← Prev
      </Btn>
      <span className={SPEED_DIAL_PAGE_BADGE}>
        Page {page} of {totalPages}
      </span>
      <Btn onClick={onNext} disabled={disabled || page >= totalPages} variant="outline">
        Next →
      </Btn>
    </div>
  </div>
);

const FieldRow = ({ label, children, required, align = "center" }) => (  <div style={{ display: "flex", alignItems: align, gap: 12, minHeight: 32 }}>
    <Tooltip
      title={tooltip || ""}
      {...tooltipProps}
      disableHoverListener={!tooltip}
    >
      <label
        style={{
          fontSize: 13,
          fontWeight: 600,
          color: C.labelText,
          width: 150,
          flexShrink: 0,
          paddingTop: align === "flex-start" ? 8 : 0,
          cursor: tooltip ? "help" : "default",
        }}
      >
        {label} {required && <span style={{ color: C.errorRed }}>*</span>}
      </label>
    </Tooltip>

    <div style={{ flex: 1, minWidth: 0 }}>{children}</div>
  </div>
);

const tooltipProps = {
  arrow: true,
  placement: "top",
  slotProps: {
    tooltip: {
      sx: {
        bgcolor: "#fff",
        color: "#334155",
        border: "1px solid #d1d5db",
        fontSize: 12,
        maxWidth: 500,
        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
      },
    },
    arrow: {
      sx: {
        color: "#fff",
      },
    },
  },
};
// ─────────────────────────────────────────────────────────────────────────────

const SpeedDialPage = () => {
  const isCompact = useMediaQuery(PBX_COMPACT_MQ);
  const [rows, setRows] = useState([]);
  const [selected, setSelected] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState({
    list: false,
    save: false,
    delete: false,
  });
  const [message, setMessage] = useState({ type: "", text: "" });
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Search & Pagination
  const itemsPerPage = 20;
  const [page, setPage] = useState(1);

  // Form state
  const [editId, setEditId] = useState(null);
  const [name, setName] = useState("");
  const [speedDialNumber, setSpeedDialNumber] = useState("");
  const [destination, setDestination] = useState("");

  // Import / Export State
  const [showImportModal, setShowImportModal] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [importLoading, setImportLoading] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const importFileRef = useRef(null);

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 5000);
  };

  const normalizeList = (raw) => {
    const list = raw?.message ?? raw?.data ?? raw;
    return Array.isArray(list) ? list : [];
  };

  const mapFromApi = (item) => ({
    id: item?.id,
    name: String(item?.name || ""),
    speedDialNumber: String(item?.speed_number || ""),
    destination: String(item?.destination || ""),
  });

  const fetchSpeedDials = async () => {
    setLoading((prev) => ({ ...prev, list: true }));
    try {
      const res = await listSpeedDials();
      if (!res?.response) {
        showMessage("error", res?.message || "Failed to load speed dials.");
        setRows([]);
        return;
      }
      setRows(normalizeList(res).map(mapFromApi));
    } catch (err) {
      showMessage("error", err?.message || "Failed to load speed dials.");
      setRows([]);
    } finally {
      setLoading((prev) => ({ ...prev, list: false }));
      setIsInitialLoad(false);
    }
  };

  useEffect(() => {
    fetchSpeedDials();
  }, []);

  // ── Search & Pagination Logic ──
  const filteredRows = rows;

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

  // ── Form Handlers ──
  const resetForm = () => {
    setEditId(null);
    setName("");
    setSpeedDialNumber("");
    setDestination("");
  };

  const handleOpenAddModal = () => {
    resetForm();
    setShowModal(true);
  };

  const handleOpenEditModal = (row) => {
    setEditId(row.id);
    setName(row.name || "");
    setSpeedDialNumber(row.speedDialNumber || "");
    setDestination(row.destination || "");
    setShowModal(true);
  };

  const handleCloseModal = () => {
    if (loading.save) return;
    setShowModal(false);
    resetForm();
  };

  const handleDelete = async () => {
    if (selected.length === 0) {
      showMessage("error", "Please select at least one row to delete.");
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
      const idsToDelete = selected
        .map((idx) => filteredRows[idx]?.id)
        .filter((id) => id != null);
      const results = await Promise.all(
        idsToDelete.map((id) => deleteSpeedDial(id)),
      );
      const failed = results.find((r) => !r?.response);
      if (failed) {
        showMessage(
          "error",
          failed?.message || "Failed to delete one or more speed dials.",
        );
      } else {
        showMessage("success", "Speed dial(s) deleted successfully.");
      }
      await fetchSpeedDials();
      setSelected([]);
      setPage(1);
    } catch (err) {
      showMessage("error", err?.message || "Failed to delete speed dial(s).");
    } finally {
      setLoading((prev) => ({ ...prev, delete: false }));
    }
  };

  const handleSave = async () => {
    const trimmedName = name.trim();
    const trimmedSpeed = speedDialNumber.trim();
    const trimmedDest = destination.trim();

    if (!trimmedName) return showMessage("error", "Name is required.");
    if (!trimmedSpeed)
      return showMessage("error", "Speed Dial Number is required.");
    if (!trimmedDest) return showMessage("error", "Destination is required.");

    const apiPayload = {
      name: trimmedName,
      speed_number: trimmedSpeed,
      destination: trimmedDest,
    };

    setLoading((prev) => ({ ...prev, save: true }));
    try {
      const res =
        editId != null
          ? await updateSpeedDial(editId, apiPayload)
          : await createSpeedDial(apiPayload);

      if (!res?.response) {
        showMessage("error", res?.message || "Failed to save speed dial.");
        return;
      }
      showMessage(
        "success",
        editId != null
          ? "Speed dial updated successfully."
          : "Speed dial created successfully.",
      );
      await fetchSpeedDials();
      handleCloseModal();
    } catch (err) {
      showMessage("error", err?.message || "Failed to save speed dial.");
    } finally {
      setLoading((prev) => ({ ...prev, save: false }));
    }
  };

  // ── Import / Export Logic ──
  const handleExport = async () => {
    try {
      const { blob, filename } = await exportSpeedDialCsv();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      showMessage("error", e?.message || "Export failed");
    }
  };

  const handleImportSubmit = async () => {
    if (!importFile) {
      showMessage("error", "Please select a CSV file");
      return;
    }
    setImportLoading(true);
    setImportResult(null);
    try {
      const csv = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = () => reject(new Error("Failed to read file"));
        reader.readAsText(importFile);
      });
      const res = await importSpeedDialCsv({ csv, dryRun: false });
      setImportResult(res);
      if (res?.response) {
        const fresh = await listSpeedDials();
        setRows(normalizeList(fresh).map(mapFromApi));
        if (!res.validation_errors?.length && !res.runtime_errors?.length) {
          setShowImportModal(false);
          setImportFile(null);
          setImportResult(null);
          showMessage("success", "Speed Dials imported successfully.");
        }
      }
    } catch (e) {
      showMessage("error", e?.message || "Import failed");
    } finally {
      setImportLoading(false);
    }
  };

  return (
    <div className={`${SPEED_DIAL_PAGE_WRAP} ${isCompact ? "p-[8px]" : ""}`.trim()}>
      <div className={SPEED_DIAL_PAGE_INNER}>
        {/* Error / Success Banner */}
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

        <PbxBreadcrumb section="Call Features" current="Speed Dial" />

        <div className={SPEED_DIAL_CARD}>
          <div
            className={`${SPEED_DIAL_TOOLBAR} ${isCompact ? SPEED_DIAL_TOOLBAR_COMPACT : ""}`.trim()}
          >
            <div className={SPEED_DIAL_TOOLBAR_LEFT}>
              {selected.length > 0 && (
                <span className={SPEED_DIAL_SELECTED_BADGE}>
                  {selected.length} selected
                </span>
              )}
            </div>

            <div className={SPEED_DIAL_TOOLBAR_ACTIONS}>
              <Btn
                onClick={handleDelete}
                disabled={
                  loading.delete || loading.list || selected.length === 0
                }
                variant="cancel"
              >
                <DeleteOutlineOutlinedIcon sx={{ fontSize: 16 }} />
                Delete
              </Btn>
              <Btn
                onClick={() => {
                  setImportFile(null);
                  setShowImportModal(true);
                  setImportResult(null);
                }}
                variant="cancel"
              >
                ⬇ Import
              </Btn>
              <Btn onClick={handleExport} variant="outline">
                ⬆ Export
              </Btn>

              <Btn
                onClick={handleOpenAddModal}
                disabled={loading.list}
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
                message="No speed dials found."
                onAddNew={handleOpenAddModal}
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
                      Speed Dial Number
                    </TH>
                    <TH style={{ position: "sticky", top: 0, zIndex: 10 }}>
                      Destination
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
                    const rowBgColor = isSelected
                      ? "#e0f2fe"
                      : idx % 2 === 1
                        ? "#f8fafc"
                        : "#ffffff";

                    return (
                      <tr
                        key={row.id || realIdx}
                        style={{
                          background: rowBgColor,
                          transition: "background 0.15s ease",
                        }}
                        onMouseEnter={(e) => {
                          if (!isSelected)
                            e.currentTarget.style.background = "var(--row-alt)";
                        }}
                        onMouseLeave={(e) => {
                          if (!isSelected)
                            e.currentTarget.style.background = rowBgColor;
                        }}
                      >
                        <td
                          style={{
                            ...tdStyle,
                            background: rowBgColor,
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
                            background: rowBgColor,
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
                            background: rowBgColor,
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
    background: rowBgColor,
    borderBottom: isLastRow
      ? "none"
      : tdStyle.borderBottom,
  }}
>
  {row.speedDialNumber}
</td>
                        <td
                          style={{
                            ...tdStyle,
                            background: rowBgColor,
                            borderBottom: isLastRow
                              ? "none"
                              : tdStyle.borderBottom,
                          }}
                        >
                          {row.destination}
                        </td>
                        <td
                          style={{
                            textAlign: "center",
                            padding: "4px 8px",
                            ...tdStyle,
                            background: rowBgColor,
                            borderRight: "none",
                            borderBottom: isLastRow
                              ? "none"
                              : tdStyle.borderBottom,
                           
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
            <SpeedDialPagination
              page={page}
              totalPages={totalPages}
              recordCount={pagedRows.length}
              onPrev={handlePrev}
              onNext={handleNext}
              disabled={loading.list}
            />
          )}
        </div>
      </div>

      {/* ── Add/Edit Modal ── */}
      <Dialog
        open={showModal}
        onClose={loading.save ? null : handleCloseModal}
        maxWidth={false}
        PaperProps={{ sx: { width: 560, maxWidth: "96vw", borderRadius: 2 } }}
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
          {editId != null ? "Edit Speed Dial" : "Add Speed Dial"}
        </DialogTitle>

        <DialogContent
          style={{ padding: "20px 24px", backgroundColor: "var(--bg-surface)" }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div
              style={{
                background: "#f5f7fa",
                border: `1px solid ${C.cardBorder}`,
                borderRadius: 6,
                padding: "20px 24px 16px",
              }}
            >
              <div
                style={{ display: "flex", flexDirection: "column", gap: 16 }}
              >
                <FieldRow label="Name" required tooltip="User-defined name of a speed dial. It must be filled in: otherwise the configuration will fail to be saved. You can user letters, digits, chinese,_ only. Maximum 32 characters.">
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
                </FieldRow>

                <FieldRow label="Speed Dial Number" required tooltip="The number dialed to reach this speed dial. The default range is 6200–6299 and can be modified in PBX → Preference → Extension Preferences. This field is empty by default and must be filled in, otherwise the configuration cannot be saved.">
                  <TextField
                    size="small"
                    fullWidth
                    value={speedDialNumber}
                    onChange={(e) => setSpeedDialNumber(e.target.value)}
                    inputProps={{
                      style: {
                        fontSize: 13,
                        padding: "6px 8px",
                        backgroundColor: "var(--bg-surface)",
                      },
                    }}
                  />
                </FieldRow>

                <FieldRow label="Destination" required tooltip="Select the destination to ring when the speed dial is dialed. Call Queue: Ring the call queue. CallBacks: Ring the callbacks. Conference Rooms: Ring the conference rooms. DISA: Ring the DISA. Extensions: Ring the extensions. Fax To Mail: Ring the fax to mail. IVR Menus: Ring the IVR menus. Ring Group: Ring the ring group. Voicemails: Ring the voicemails. Other: Hang up the call.">
                  <TextField
                    size="small"
                    fullWidth
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    inputProps={{
                      style: {
                        fontSize: 13,
                        padding: "6px 8px",
                        backgroundColor: "var(--bg-surface)",
                      },
                    }}
                  />
                </FieldRow>
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
              <CircularProgress size={13} sx={{ color: "#fff", mr: 1 }} />
            ) : null}

            {loading.save
              ? "Saving..."
              : editId != null
                ? "Update Speed Dial"
                : "Create Speed Dial"}
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

      {/* ── Import Modal ── */}
      <Dialog
        open={showImportModal}
        onClose={() => {
          if (!importLoading) {
            setShowImportModal(false);
            setImportFile(null);
            setImportResult(null);
          }
        }}
        maxWidth={false}
        PaperProps={{ sx: { width: 560, maxWidth: "96vw", borderRadius: 2 } }}
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
          Import Speed Dial
        </DialogTitle>
        <DialogContent
          style={{ padding: "24px 16px", backgroundColor: C.pageBg }}
        >
          <div
            style={{
              textAlign: "center",
              border: `2px dashed ${C.cardBorder}`,
              borderRadius: 8,
              padding: 32,
              cursor: "pointer",
              background: "var(--bg-main)",
            }}
            onClick={() => importFileRef.current?.click()}
          >
            <div
              style={{
                fontSize: 13,
                color: importFile ? C.successGreen : C.mutedText,
                fontWeight: importFile ? 600 : 400,
              }}
            >
              {importFile ? importFile.name : "Click to choose CSV file"}
            </div>
            <input
              ref={importFileRef}
              type="file"
              accept=".csv"
              style={{ display: "none" }}
              onChange={(e) => {
                setImportFile(e.target.files?.[0] || null);
                setImportResult(null);
              }}
            />
          </div>

          {importResult && (
            <div
              style={{
                background: importResult.response ? "#f0fdf4" : "#fef2f2",
                border: `1px solid ${importResult.response ? "#86efac" : "#fca5a5"}`,
                borderRadius: 6,
                padding: "10px 14px",
                marginTop: 16,
              }}
            >
              <p
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: importResult.response ? C.successGreen : C.errorRed,
                  marginBottom: 4,
                }}
              >
                {importResult.response
                  ? "Import complete"
                  : importResult.error ||
                    "Validation failed — fix errors and retry"}
              </p>
              <div
                style={{
                  fontSize: 12,
                  color: "var(--text-secondary)",
                  display: "flex",
                  gap: 16,
                  flexWrap: "wrap",
                }}
              >
                {importResult.total != null && (
                  <span>
                    Total: <b>{importResult.total}</b>
                  </span>
                )}
                {importResult.created_count != null && (
                  <span>
                    Created:{" "}
                    <b style={{ color: C.successGreen }}>
                      {importResult.created_count}
                    </b>
                  </span>
                )}
                {importResult.invalid_rows != null &&
                  importResult.invalid_rows > 0 && (
                    <span>
                      Invalid rows:{" "}
                      <b style={{ color: "#d97706" }}>
                        {importResult.invalid_rows}
                      </b>
                    </span>
                  )}
                {importResult.would_create != null && (
                  <span>
                    Would create:{" "}
                    <b style={{ color: C.successGreen }}>
                      {importResult.would_create}
                    </b>
                  </span>
                )}
              </div>
              {importResult.validation_errors?.length > 0 && (
                <div
                  style={{ marginTop: 8, maxHeight: 180, overflowY: "auto" }}
                >
                  <p
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: C.errorRed,
                      marginBottom: 4,
                    }}
                  >
                    Validation Errors (
                    {importResult.invalid_rows ??
                      importResult.validation_errors.length}{" "}
                    row{importResult.validation_errors.length !== 1 ? "s" : ""})
                  </p>
                  <table
                    style={{
                      width: "100%",
                      borderCollapse: "collapse",
                      fontSize: 11,
                    }}
                  >
                    <thead>
                      <tr style={{ background: "#fee2e2" }}>
                        {["Row", "Speed Number", "Field", "Error"].map((h) => (
                          <th
                            key={h}
                            style={{
                              padding: "3px 6px",
                              textAlign: "left",
                              borderBottom: "1px solid #fca5a5",
                              color: "#7f1d1d",
                              fontWeight: 600,
                            }}
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {importResult.validation_errors.flatMap((ve, vi) =>
                        (ve.errors || []).map((err, ei) => (
                          <tr
                            key={`${vi}-${ei}`}
                            style={{
                              background: vi % 2 === 0 ? "#fff" : "#fff7f7",
                            }}
                          >
                            <td
                              style={{
                                padding: "2px 6px",
                                borderBottom: "1px solid #fee2e2",
                              }}
                            >
                              {ve.row}
                            </td>
                            <td
                              style={{
                                padding: "2px 6px",
                                borderBottom: "1px solid #fee2e2",
                                fontFamily: "monospace",
                              }}
                            >
                              {ve.speed_number ?? "—"}
                            </td>
                            <td
                              style={{
                                padding: "2px 6px",
                                borderBottom: "1px solid #fee2e2",
                                fontFamily: "monospace",
                              }}
                            >
                              {err.field}
                            </td>
                            <td
                              style={{
                                padding: "2px 6px",
                                borderBottom: "1px solid #fee2e2",
                                color: C.errorRed,
                              }}
                            >
                              {err.error}
                            </td>
                          </tr>
                        )),
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
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
            onClick={handleImportSubmit}
            disabled={importLoading || !importFile}
            variant="primary"
            style={{ minWidth: 100, height: 33, fontSize: 13 }}
          >
            {importLoading ? (
              <CircularProgress size={14} sx={{ color: "#64748b", mr: 1 }} />
            ) : null}
            {importLoading ? "Importing..." : "Import"}
          </Btn>
          <Btn
            onClick={() => {
              setShowImportModal(false);
              setImportFile(null);
              setImportResult(null);
            }}
            disabled={importLoading}
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

export default SpeedDialPage;
