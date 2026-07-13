import React, { useEffect, useState, useRef } from "react";
import EditDocumentIcon from "@mui/icons-material/EditDocument";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import {
  Alert,
  Checkbox,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Tooltip,
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
import {
  SPEED_DIAL_FIELD_TOOLTIPS,
  SPEED_DIAL_ITEMS_PER_PAGE,
  SPEED_DIAL_TITLE,
} from "../../../constants/SpeedDialConstants";
import {
  Btn,
  TH,
  tdStyle,
  ExtensionBreadcrumb as SpeedDialBreadcrumb,
  ExtensionTableListLoading as SpeedDialTableListLoading,
  ExtensionTableListEmptyState as SpeedDialTableListEmptyState,
  extensionTableCheckboxSx as speedDialTableCheckboxSx,
  extensionFixedAlertSx as speedDialFixedAlertSx,
  extensionPageWrapStyle as speedDialPageWrapStyle,
  extensionPageInnerStyle as speedDialPageInnerStyle,
  extensionCardStyle as speedDialCardStyle,
  extensionToolbarStyle as speedDialToolbarStyle,
  extensionSelectedBadgeStyle as speedDialSelectedBadgeStyle,
  extensionCancelBtnStyle as speedDialCancelBtnStyle,
  extensionPrimaryBtnStyle as speedDialPrimaryBtnStyle,
} from "../../../components/common";

const SPEED_DIAL_COMPACT_MQ = "(max-width: 768px)";

// ── Color palette ─────────────────────────────────────────────────────────────
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
  placeholderText: "#94a3b8",
  codecBoxBorder: "#c5ccd6",
};

// ── Local page UI ──


const SPEED_DIAL_TABLE_CARD_RADIUS = 4;

const speedDialPaginationStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "7px 14px",
  background: "#ffffff",
  borderTop: `1px solid ${C.divider}`,
  borderBottomLeftRadius: SPEED_DIAL_TABLE_CARD_RADIUS,
  borderBottomRightRadius: SPEED_DIAL_TABLE_CARD_RADIUS,
  overflow: "hidden",
};

const speedDialPageBadgeStyle = {
  fontSize: 11,
  fontWeight: 600,
  color: C.accent,
  background: "#e0f2fe",
  padding: "5px 14px",
  borderRadius: 4,
  border: `1px solid ${C.cardBorder}`,
};

const speedDialEditIconStyle = {
  cursor: "pointer",
  color: "#2563eb",
  fontSize: 22,
  opacity: 0.7,
  transition: "opacity 0.15s ease",
};

const handleSpeedDialEditIconHover = (e, entering) => {
  e.currentTarget.style.opacity = entering ? "1" : "0.7";
};

const OUTLINED_BORDER = "#d1d5db";
const OUTLINED_HOVER = "#9ca3af";
const OUTLINED_FOCUS = "#3E5475";
const FOCUS_RING_SHADOW = "0 0 0 2px rgba(62, 84, 117, 0.15)";

const speedDialOutlinedInputRootSx = {
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
};

const speedDialModalTextFieldFullSx = {
  width: "100%",
  "& .MuiOutlinedInput-root": {
    ...speedDialOutlinedInputRootSx,
    minHeight: 36,
    height: 36,
    fontSize: 13,
  },
  "& .MuiOutlinedInput-input": {
    padding: "7px 10px",
    fontSize: 13,
    boxSizing: "border-box",
    backgroundColor: "#fff",
  },
};

const speedDialModalPaperSx = {
  width: 560,
  maxWidth: "96vw",
  margin: 24,
  maxHeight: "calc(100vh - 80px - 48px)",
  display: "flex",
  flexDirection: "column",
  p: 0,
  borderRadius: 2,
  overflow: "hidden",
  boxShadow:
    "0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)",
};

const speedDialModalTitleStyle = {
  background: "#1e2d42",
  color: "#ffffff",
  fontWeight: 600,
  fontSize: 16,
  padding: "16px 24px",
  textAlign: "center",
  borderTopLeftRadius: 4,
  borderTopRightRadius: 4,
};

const speedDialModalFormStyle = {
  display: "flex",
  flexDirection: "column",
  gap: 14,
  width: "100%",
  background: "#f8fafc",
  border: `1px solid ${C.cardBorder}`,
  borderRadius: 4,
  padding: 20,
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
  borderBottomLeftRadius: 4,
  borderBottomRightRadius: 4,
};

const addNewModalFooterBtnStyle = {
  height: 30,
  padding: "6px 14px",
  fontSize: 12,
  borderRadius: 4,
  minWidth: 100,
};

const addNewModalFooterCancelBtnStyle = {
  ...addNewModalFooterBtnStyle,
  background: "#cbd5e1",
  color: "#374151",
  border: "1px solid #cbd5e1",
  boxShadow: "0 1px 2px rgba(15, 23, 42, 0.08)",
};

const speedDialModalCancelBtnStyle = {
  ...addNewModalFooterBtnStyle,
  background: "#cbd5e1",
  color: "#374151",
  border: "1px solid #cbd5e1",
  boxShadow: "0 1px 2px rgba(15, 23, 42, 0.08)",
  borderRadius: 4,
};

const SPEED_DIAL_TOOLTIP_PROPS = {
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
      },
    },
    arrow: {
      sx: { color: "#fff" },
    },
  },
};

const formatSpeedDialTooltipTitle = (text) => {
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

const SPEED_DIAL_MODAL_LABEL_WIDTH = 160;

const SpeedDialFieldLabel = ({
  tooltipKey,
  children,
  required,
  style = {},
}) => {
  const tooltip = SPEED_DIAL_FIELD_TOOLTIPS[tooltipKey] || "";
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
      {required ? (
        <span style={{ color: C.errorRed, marginLeft: 2 }}>*</span>
      ) : null}
    </span>
  );
  if (!tooltip) return label;
  return (
    <Tooltip
      title={formatSpeedDialTooltipTitle(tooltip)}
      {...SPEED_DIAL_TOOLTIP_PROPS}
    >
      {label}
    </Tooltip>
  );
};

const SpeedDialFieldRow = ({ label, tooltipKey, required, children }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
    {tooltipKey ? (
      <SpeedDialFieldLabel
        tooltipKey={tooltipKey}
        required={required}
        style={{
          width: SPEED_DIAL_MODAL_LABEL_WIDTH,
          flexShrink: 0,
        }}
      >
        {label}
      </SpeedDialFieldLabel>
    ) : (
      <label
        style={{
          fontSize: 13,
          fontWeight: 600,
          color: C.labelText,
          width: SPEED_DIAL_MODAL_LABEL_WIDTH,
          flexShrink: 0,
        }}
      >
        {label}
        {required ? (
          <span style={{ color: C.errorRed, marginLeft: 2 }}>*</span>
        ) : null}
      </label>
    )}
    <div style={{ flex: 1, minWidth: 0 }}>{children}</div>
  </div>
);

const speedDialImportDropzoneStyle = {
  textAlign: "center",
  border: `2px dashed ${C.codecBoxBorder}`,
  borderRadius: 8,
  padding: 32,
  cursor: "pointer",
  background: "#fff",
};

// ─────────────────────────────────────────────────────────────────────────────

const SpeedDialPage = () => {
  const isCompact = useMediaQuery(SPEED_DIAL_COMPACT_MQ);
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
  const itemsPerPage = SPEED_DIAL_ITEMS_PER_PAGE;
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
    <div
      style={{
        ...speedDialPageWrapStyle,
        ...(isCompact ? { padding: 8 } : {}),
      }}
    >
      <div style={speedDialPageInnerStyle}>
        {message.text && (
          <Alert
            severity={
              message.type === "error"
                ? "error"
                : message.type === "success"
                  ? "success"
                  : "info"
            }
            onClose={() => setMessage({ type: "", text: "" })}
            sx={speedDialFixedAlertSx}
          >
            {message.text}
          </Alert>
        )}

        <SpeedDialBreadcrumb
          section="Call Features"
          current={SPEED_DIAL_TITLE}
        />

        <div style={speedDialCardStyle}>
          <div
            style={{
              ...speedDialToolbarStyle,
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
                flexWrap: "wrap",
              }}
            >
              {selected.length > 0 && (
                <span style={speedDialSelectedBadgeStyle}>
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
                onClick={handleDelete}
                disabled={
                  loading.delete || loading.list || selected.length === 0
                }
                variant="cancel"
                style={speedDialCancelBtnStyle}
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
                style={speedDialCancelBtnStyle}
              >
                ⬇ Import
              </Btn>
              <Btn
                onClick={handleExport}
                variant="cancel"
                style={speedDialCancelBtnStyle}
              >
                ⬆ Export
              </Btn>
              <Btn
                onClick={handleOpenAddModal}
                disabled={loading.list}
                variant="primary"
                style={speedDialPrimaryBtnStyle}
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
              <SpeedDialTableListLoading />
            ) : rows.length === 0 ? (
              <SpeedDialTableListEmptyState
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
                        sx={speedDialTableCheckboxSx}
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
                    const rowBg = isSelected
                      ? "#e0f2fe"
                      : idx % 2 === 1
                        ? "#f8fafc"
                        : "#ffffff";
                    const lastRowCellStyle = {
                      borderBottom: isLastRow
                        ? "none"
                        : tdStyle.borderBottom,
                    };

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
                            ...lastRowCellStyle,
                          }}
                        >
                          <Checkbox
                            size="small"
                            checked={isSelected}
                            onChange={() => handleToggleRow(realIdx)}
                            sx={speedDialTableCheckboxSx}
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
                          {row.speedDialNumber}
                        </td>
                        <td
                          style={{
                            ...tdStyle,
                            background: rowBg,
                            ...lastRowCellStyle,
                          }}
                        >
                          {row.destination}
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
                              style={speedDialEditIconStyle}
                              onMouseEnter={(e) =>
                                handleSpeedDialEditIconHover(e, true)
                              }
                              onMouseLeave={(e) =>
                                handleSpeedDialEditIconHover(e, false)
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
            <div style={speedDialPaginationStyle}>
              <span style={{ fontSize: 11, color: C.mutedText }}>
                Showing {pagedRows.length} record
                {pagedRows.length !== 1 ? "s" : ""} on page {page}
              </span>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <Btn
                  onClick={handlePrev}
                  disabled={loading.list || page <= 1}
                  variant="outline"   
                  style={{ borderRadius: 4 }}
                >
                  ← Prev
                </Btn>
                <span style={speedDialPageBadgeStyle}>
                  Page {page} of {totalPages}
                </span>
                <Btn
                  onClick={handleNext}
                  disabled={loading.list || page >= totalPages}
                  variant="outline"
                  style={{ borderRadius: 4 }}
                >
                  Next →
                </Btn>
              </div>
            </div>
          )}
        </div>
      </div>

      <Dialog
        open={showModal}
        onClose={loading.save ? null : handleCloseModal}
        maxWidth={false}
        sx={{
          "& .MuiDialog-container": {
            alignItems: "center",
            justifyContent: "center",
          },
        }}
        PaperProps={{ sx: { ...speedDialModalPaperSx, borderRadius: editId == null ? "4px" : speedDialModalPaperSx.borderRadius } }}
      >
        <DialogTitle style={speedDialModalTitleStyle}>
          {editId != null
            ? `Edit ${SPEED_DIAL_TITLE}`
            : `Add ${SPEED_DIAL_TITLE}`}
        </DialogTitle>

        <DialogContent style={{ padding: "24px", backgroundColor: "#ffffff" }}>
          <div style={speedDialModalFormStyle}>
            <SpeedDialFieldRow label="Name" tooltipKey="name" required>
              <TextField
                size="small"
                fullWidth
                value={name}
                onChange={(e) => setName(e.target.value)}
                sx={speedDialModalTextFieldFullSx}
              />
            </SpeedDialFieldRow>

            <SpeedDialFieldRow
              label="Speed Dial Number"
              tooltipKey="speed_dial_number"
              required
            >
              <TextField
                size="small"
                fullWidth
                value={speedDialNumber}
                onChange={(e) => setSpeedDialNumber(e.target.value)}
                sx={speedDialModalTextFieldFullSx}
              />
            </SpeedDialFieldRow>

            <SpeedDialFieldRow
              label="Destination"
              tooltipKey="destination"
              required
            >
              <TextField
                size="small"
                fullWidth
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                sx={speedDialModalTextFieldFullSx}
              />
            </SpeedDialFieldRow>
          </div>
        </DialogContent>
        <DialogActions sx={{ p: 0, m: 0 }} style={addNewModalFooterStyle}>
          <Btn
            onClick={handleSave}
            disabled={loading.save}
            variant="primary"
            style={addNewModalFooterBtnStyle}
          >
            {loading.save ? (
              <>
                <CircularProgress size={13} sx={{ color: "#fff", mr: 1 }} />
                Saving...
              </>
            ) : editId != null ? (
              "Update Speed Dial"
            ) : (
              "Create Speed Dial"
            )}
          </Btn>
          <Btn
            onClick={handleCloseModal}
            disabled={loading.save}
            variant="cancel"
            style={speedDialModalCancelBtnStyle}
          >
            Cancel
          </Btn>
        </DialogActions>
      </Dialog>

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
        sx={{
          "& .MuiDialog-container": {
            alignItems: "center",
            justifyContent: "center",
          },
        }}
        PaperProps={{ sx: speedDialModalPaperSx }}
      >
        <DialogTitle style={speedDialModalTitleStyle}>
          Import {SPEED_DIAL_TITLE}
        </DialogTitle>
        <DialogContent style={{ padding: "24px", backgroundColor: "#ffffff" }}>
          <div
            style={speedDialImportDropzoneStyle}
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
                  color: "#374151",
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
        <DialogActions sx={{ p: 0, m: 0 }} style={addNewModalFooterStyle}>
          <Btn
            onClick={handleImportSubmit}
            disabled={importLoading || !importFile}
            variant="primary"
            style={addNewModalFooterBtnStyle}
          >
            {importLoading ? (
              <>
                <CircularProgress size={13} sx={{ color: "#fff", mr: 1 }} />
                Importing...
              </>
            ) : (
              "Import"
            )}
          </Btn>
          <Btn
            onClick={() => {
              setShowImportModal(false);
              setImportFile(null);
              setImportResult(null);
            }}
            disabled={importLoading}
            variant="cancel"
            style={speedDialModalCancelBtnStyle}
          >
            Cancel
          </Btn>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default SpeedDialPage;
