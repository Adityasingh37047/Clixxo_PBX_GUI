import React, { useEffect, useState, useRef } from "react";
import EditDocumentIcon from "@mui/icons-material/EditDocument";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Checkbox,
  TextField,
  Alert,
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
  PbxBreadcrumb,
  TableListLoading,
  TableListEmptyState,
  pbxPageWrapStyle,
  pbxPageInnerStyle,
} from "../../../sections/numManipulate/numManipulateSharedUi";
import {
  sipPcmCardStyle,
  sipPcmToolbarStyle,
  sipPcmSelectedBadgeStyle,
  sipPcmCancelBtnStyle,
  SipPcmPagination,
} from "../../../sections/sip/sipPcmSharedUi";

// ── Color Palette (CDR / PBX Admin Theme) ───────────────────────────────────
const C = {
pageBg: "#f8fafc",
cardBg: "#ffffff",
cardBorder: "#9CA3AF",
labelText: "#3E5475",
valueText: "#0f172a",
mutedText: "#94a3b8",
strongText: "#0f172a",
accent: "#3E5475",
amber: "#dc2626",
};

const CARD_RADIUS = 10; 
// ── Shared UI Components ──────────────────────────────────────────────────────
const Btn = ({
  children,
  onClick,
  disabled,
  variant = "default",
  style: extraStyle,
  title,
  type,
  hoverBehavior = "background",
}) => {
  const variants = {
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
    danger: {
      background: C.errorRed,
      color: C.cardBg,
      border: `0.5px solid ${C.errorRed}`,
    },
   cancel: {
      background: "#cbd5e1",
      color: "#374151",
      border: "1px solid #cbd5e1",
      boxShadow: "0 1px 2px rgba(15, 23, 42, 0.08)",
    },
    outline: {
      background: C.cardBg,
      color: C.valueText,
      border: "1px solid #9ca3af",
    },
    accent: {
      background:
        "linear-gradient(to bottom, #5A6F8F 0%, #3E5475 60%, #2C3E57 100%)",
      color: "#fff",
      border: "1px solid #5A6F8F",
    },
  };

  const s = variants[variant] || variants.default;
  const hoverBg = (() => {
    switch (variant) {
      case "primary":
      case "accent":
        return "linear-gradient(to bottom, #3E5475 0%, #5A6F8F 100%)";
      case "danger":
        return "#b91c1c";
      case "cancel":
        return "#e2e8f0";
      case "outline":
      case "default":
      default:
        return "#e2e8f0";
    }
  })();

  const baseBg = extraStyle?.background || s.background;

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
        transition: "all 0.15s ease",
        height: 30,
        gap: 6,
        whiteSpace: "nowrap",
        ...s,
        ...extraStyle,
      }}
      onMouseEnter={(e) => {
        if (!disabled) {
          if (hoverBehavior === "opacity") {
            e.currentTarget.style.opacity = "0.82";
          } else {
            e.currentTarget.style.background = hoverBg;
          }
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled) {
          if (hoverBehavior === "opacity") {
            e.currentTarget.style.opacity = "1";
          } else {
            e.currentTarget.style.background = baseBg;
          }
        }
      }}
    >
      {children}
    </button>
  );
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

const FieldRow = ({ label, children, required, align = "center" }) => (
  <div style={{ display: "flex", alignItems: align, gap: 12, minHeight: 32 }}>
    <label
      style={{
        fontSize: 13,
        fontWeight: 600,
        color: C.labelText,
        width: 150,
        flexShrink: 0,
        paddingTop: align === "flex-start" ? 8 : 0,
      }}
    >
      {label} {required && <span style={{ color: C.errorRed }}>*</span>}
    </label>
    <div style={{ flex: 1, minWidth: 0 }}>{children}</div>
  </div>
);

const SectionHeading = ({ title }) => (
  <div style={{ margin: "16px 0 16px 0", position: "relative" }}>
    <div style={{ borderTop: `1px solid ${C.cardBorder}` }} />
    <span
      style={{
        position: "absolute",
        top: -10,
        left: 0,
        background: "#fff",
        paddingRight: 8,
        fontSize: 13,
        fontWeight: 600,
        color: C.mutedText,
      }}
    >
      {title}
    </span>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────

const SpeedDialPage = () => {
  const [rows, setRows] = useState([]);
  const [selected, setSelected] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState({
    list: false,
    save: false,
    delete: false,
  });
  const [message, setMessage] = useState({ type: "", text: "" });
  const [lastUpdated, setLastUpdated] = useState(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Search & Pagination
  const itemsPerPage = 20;
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);

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
      setLastUpdated(new Date());
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
  const filteredRows = searchQuery.trim()
    ? rows.filter((r) =>
        [r.name, r.speedDialNumber, r.destination].some((v) =>
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
    <div style={pbxPageWrapStyle}>
      <div style={pbxPageInnerStyle}>
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

        {/* Main Card */}
        <div style={sipPcmCardStyle}>
          {/* Toolbar */}
          <div style={sipPcmToolbarStyle}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            
              {selected.length > 0 && (
                <span style={sipPcmSelectedBadgeStyle}>
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
                variant="danger"
                style={sipPcmCancelBtnStyle}
              >  <DeleteOutlineOutlinedIcon sx={{ fontSize: 16 }} />
              Delete
              </Btn>
              <Btn
                onClick={() => {
                  setImportFile(null);
                  setShowImportModal(true);
                  setImportResult(null);
                }}
                variant="outline"
                style={sipPcmCancelBtnStyle}
              >
                ⬇ Import
              </Btn>
              <Btn onClick={handleExport} variant="outline"
              style={sipPcmCancelBtnStyle}
              >
                ⬆ Export
              </Btn>

              {/* <Btn
                onClick={fetchSpeedDials}
                disabled={loading.list}
                variant="default"
              >
                {loading.list ? (
                  <CircularProgress size={11} style={{ color: "#fff" }} />
                ) : (
                  "Refresh"
                )}
              </Btn> */}
              
              <Btn
  onClick={handleOpenAddModal}
  disabled={loading.list}
  variant="primary"
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
          <div style={{ 
overflowX: "auto",
overflowY: "auto",
flex: 1,}}>
            {isInitialLoad ? (
              <TableListLoading />
            ) : rows.length === 0 ? (
              <TableListEmptyState
                message="No speed dials found."
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
minWidth: 900,
                }}
              >
                <thead>
                  <tr>
                    <TH style={{ width: 40,
                        padding: 0,
                        borderLeft: "none",
                        position: "sticky",
                        top: 0,
                        zIndex: 10, }}>
                      <Checkbox
                        size="small"
                        checked={allPageSelected}
                        indeterminate={somePageSelected}
                        onChange={handleToggleAll}
                        sx={checkboxSx}
                      />
                    </TH>
                    <TH style={{ width: 36, position: "sticky", top: 0, zIndex: 10  }}>ID</TH>
                    <TH style={{ position: "sticky", top: 0, zIndex: 10 }}>
                      Name
                    </TH>
                    <TH style={{ position: "sticky", top: 0, zIndex: 10 }}>Speed Dial Number</TH>
                    <TH style={{ position: "sticky", top: 0, zIndex: 10 }}>Destination</TH>
                    <TH style={{width: 70,
                        borderRight: "none",
                        position: "sticky",
                        top: 0,
                        zIndex: 10}}>Modify</TH>
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
                            borderBottom: "1px solid #f1f5f9",
                            transition: "background 0.15s ease",
                          }}
                          onMouseEnter={(e) => {
                            if (!isSelected)
                              e.currentTarget.style.background = "#f8fafc";
                          }}
                          onMouseLeave={(e) => {
                            if (!isSelected)
                              e.currentTarget.style.background = rowBgColor;
                          }}
                        >
                          <td
                            style={{
                              ...tdStyle, background: rowBgColor,
  borderBottom: isLastRow ? "none" : tdStyle.borderBottom,
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
                              ...tdStyle, background: rowBgColor,
                               borderBottom: isLastRow ? "none" : tdStyle.borderBottom,
                            }}
                          >
                            {realIdx + 1}
                          </td>
                          <td
                            style={{
                              ...tdStyle, background: rowBgColor,
                               borderBottom: isLastRow ? "none" : tdStyle.borderBottom,
                              
                            }}
                          >
                            {row.name}
                          </td>
                          <td
                            style={{
                           ...tdStyle, background: rowBgColor,
                            borderBottom: isLastRow ? "none" : tdStyle.borderBottom,
                            }}
                          >
                            <span
                              style={{
                                background: "#f1f5f9",
                                padding: "2px 8px",
                                borderRadius: 10,
                                fontSize: 10,
                                fontWeight: 600,
                              }}
                            >
                              {row.speedDialNumber}
                            </span>
                          </td>
                          <td
                            style={{
                              ...tdStyle, background: rowBgColor,
                               borderBottom: isLastRow ? "none" : tdStyle.borderBottom,
                            }}
                          >
                            {row.destination}
                          </td>
                          <td
                            style={{ textAlign: "center", padding: "4px 8px" ,  ...tdStyle, background: rowBgColor, borderBottom: isLastRow ? "none" : tdStyle.borderBottom,}}
                          >
                           <EditDocumentIcon
  className="cursor-pointer text-blue-600 mx-auto opacity-70 hover:opacity-100 transition-opacity"
  titleAccess="Edit"
  onClick={() => handleOpenEditModal(row)}
/>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            )}
          </div>

          {/* Footer Pagination */}
          {!isInitialLoad && rows.length > 0 && filteredRows.length > 0 && (
            <SipPcmPagination
              page={page}
              totalPages={totalPages}
              recordCount={pagedRows.length}
              recordLabel="record"
              onPageChange={(p) => setPage(p)}
            />
          )}
        </div>
      </div>

      {/* ── Add/Edit Modal ── */}
      <Dialog
        open={showModal}
        onClose={loading.save ? null : handleCloseModal}
        maxWidth={false}
        PaperProps={{ sx: { width: 760, maxWidth: "96vw", borderRadius: 2 } }}
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
          style={{ padding: "20px 24px", backgroundColor:"#ffffff", }}
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
              <SectionHeading title="General Settings" />

              {/* TOP-TO-BOTTOM GRID FOR FORM FIELDS */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "16px 32px",
                }}
              >
                {/* ── LEFT COLUMN ── */}
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 16 }}
                >
                  <FieldRow label="Name" required>
                    <TextField
                      size="small"
                      fullWidth
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      inputProps={{
                        style: { fontSize: 13, padding: "6px 8px",backgroundColor: "#fff" },
                      }}
                    />
                  </FieldRow>

                  <FieldRow label="Speed Dial Number" required>
                    <TextField
                      size="small"
                      fullWidth
                      value={speedDialNumber}
                      onChange={(e) => setSpeedDialNumber(e.target.value)}
                      inputProps={{
                        style: { fontSize: 13, padding: "6px 8px", backgroundColor: "#fff" },
                      }}
                    />
                  </FieldRow>
                </div>

                {/* ── RIGHT COLUMN ── */}
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 16 }}
                >
                  <FieldRow label="Destination" required>
                    <TextField
                      size="small"
                      fullWidth
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                      inputProps={{
                        style: { fontSize: 13, padding: "6px 8px", backgroundColor: "#fff"},
                      }}
                    />
                  </FieldRow>
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
      sx={{ color: "#fff", mr: 1 }}
    />
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
              background: "#fff",
            }}
            onClick={() => importFileRef.current?.click()}
          >
            <div
              style={{
                fontSize: 13,
                color: importFile ? "#15803d" : C.mutedText,
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
                  color: importResult.response ? "#15803d" : "#b91c1c",
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
                    <b style={{ color: "#16a34a" }}>
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
                    <b style={{ color: "#16a34a" }}>
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
                      color: "#b91c1c",
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
                                color: "#b91c1c",
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
