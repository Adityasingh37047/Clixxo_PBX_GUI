import React, { useState, useRef, useEffect } from "react";
import {
  NUMBER_POOL_COLUMNS,
  NUMBER_POOL_GROUPS,
} from "../constants/NumberPoolConstants";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select as MuiSelect,
  MenuItem,
  CircularProgress,
  Alert,
} from "@mui/material";
import {
  listNumberPool,
  createNumberPool,
  updateNumberPool,
  deleteNumberPool,
} from "../api/apiService";
import EditDocumentIcon from "@mui/icons-material/EditDocument";

// ── Color Palette & Shared Styles ─────────────────────────────────────────────
const C = {
  pageBg: "#eef2f7",
  cardBg: "#ffffff",
  cardBorder: "#9ca3af",
  labelText: "#1e293b",
  valueText: "#1e293b",
  mutedText: "#94a3b8",
  accent: "#1e293b",
  errorRed: "#dc2626",
};

// ── Shared: Action Button ─────────────────────────────────────────────────────
const Btn = ({
  children,
  onClick,
  disabled,
  variant = "default",
  style: extraStyle,
  title,
}) => {
  const variants = {
    default: {
      background: "#1e293b",
      color: "#fff",
      border: "1px solid #9ca3af",
    },
    outline: {
      background: "#fff",
      color: "#1e293b",
      border: "1px solid #9ca3af",
    },
    danger: {
      background: "#fef2f2",
      color: C.errorRed,
      border: `0.5px solid #fecaca`,
    },
    accent: {
      background: C.cardBg,
      color: C.accent,
      border: `0.5px solid ${C.cardBorder}`,
    },
  };
  const s = variants[variant] || variants.default;
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      style={{
        ...s,
        fontSize: 11,
        fontWeight: 600,
        padding: "5px 14px",
        borderRadius: 6,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 5,
        transition: "opacity 0.15s ease",
        whiteSpace: "nowrap",
        ...extraStyle,
      }}
      onMouseEnter={(e) => {
        if (!disabled) e.currentTarget.style.opacity = "0.82";
      }}
      onMouseLeave={(e) => {
        if (!disabled) e.currentTarget.style.opacity = "1";
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
      background: "#f3f4f6",
      color: C.labelText,
      fontWeight: 700,
      fontSize: 10.5,
      padding: "9px 8px",
      textAlign: "center",
      borderBottom: `1px solid ${C.cardBorder}`,
      borderRight: `0.5px solid #9ca3af`,
      whiteSpace: "nowrap",
      textTransform: "uppercase",
      letterSpacing: "0.04em",
      ...extra,
    }}
  >
    {children}
  </th>
);

const MIN_ROWS = 12;

const NumberPool = () => {
  const [rows, setRows] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [form, setForm] = useState({
    groupNo: 0,
    noInGroup: 0,
    numberRangeStart: "",
    numberRangeEnd: "",
  });
  const [validationError, setValidationError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Custom scrollbar state
  const tableScrollRef = useRef(null);
  const [scrollState, setScrollState] = useState({
    top: 0,
    height: 0,
    scrollHeight: 0,
  });

  const handleTableScroll = (e) => {
    setScrollState({
      top: e.target.scrollTop,
      height: e.target.clientHeight,
      scrollHeight: e.target.scrollHeight,
    });
  };

  useEffect(() => {
    if (tableScrollRef.current) {
      setScrollState({
        top: tableScrollRef.current.scrollTop,
        height: tableScrollRef.current.clientHeight,
        scrollHeight: tableScrollRef.current.scrollHeight,
      });
    }
  }, [rows.length]);

  const validateNumberRange = (start, end) => {
    if (!start || !end) return "";

    const startDigits = start.toString().length;
    const endDigits = end.toString().length;

    if (startDigits !== endDigits) {
      return `Error: Start and End numbers must have the same number of digits. Start has ${startDigits} digit(s), End has ${endDigits} digit(s).`;
    }

    if (parseInt(start) > parseInt(end)) {
      return "Error: Start number cannot be greater than End number.";
    }

    return "";
  };

  const openModal = (rowIdx = null) => {
    setEditIndex(rowIdx);
    setValidationError("");
    if (rowIdx !== null) {
      const row = rows[rowIdx];
      // Split numberRange if possible
      let start = "",
        end = "";
      if (row.numberRange && row.numberRange.includes("--")) {
        [start, end] = row.numberRange.split("--");
      }
      setForm({
        groupNo: row.groupNo,
        noInGroup: row.noInGroup,
        numberRangeStart: start,
        numberRangeEnd: end,
      });
    } else {
      // Calculate the next "No. in Group" value based on existing entries in the selected group
      const selectedGroup = 0; // Default group
      const entriesInGroup = rows.filter(
        (row) => row.groupNo === selectedGroup,
      );
      const nextNoInGroup = entriesInGroup.length;
      setForm({
        groupNo: selectedGroup,
        noInGroup: nextNoInGroup,
        numberRangeStart: "",
        numberRangeEnd: "",
      });
    }
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditIndex(null);
    setValidationError("");
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    if (name === "groupNo") {
      // When Group No. changes, recalculate No. in Group based on entries in the new group
      const newGroupNo = Number(value);
      const entriesInGroup = rows.filter((row) => row.groupNo === newGroupNo);
      const nextNoInGroup = entriesInGroup.length;
      setForm((prev) => ({
        ...prev,
        [name]: newGroupNo,
        noInGroup: nextNoInGroup,
      }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));

      // Validate number range when either start or end changes
      if (name === "numberRangeStart" || name === "numberRangeEnd") {
        const newForm = { ...form, [name]: value };
        const error = validateNumberRange(
          newForm.numberRangeStart,
          newForm.numberRangeEnd,
        );
        setValidationError(error);
      }
    }
  };

  const handleSave = async () => {
    // Final validation before saving
    const error = validateNumberRange(
      form.numberRangeStart,
      form.numberRangeEnd,
    );
    if (error) {
      setValidationError(error);
      return;
    }

    const numberRange =
      form.numberRangeStart && form.numberRangeEnd
        ? `${form.numberRangeStart}--${form.numberRangeEnd}`
        : "";
    const apiData = {
      group: String(form.groupNo),
      no_in_groups: String(form.noInGroup),
      number_range: String(numberRange).replace("--", "-"),
    };

    try {
      setLoading(true);
      if (editIndex !== null && rows[editIndex]?.id) {
        await updateNumberPool(rows[editIndex].id, apiData);
      } else {
        await createNumberPool(apiData);
      }
      await refreshNumberPoolWithRetry();
      closeModal();
    } catch (e) {
      console.error("Save Number Pool failed:", e);
      alert("Failed to save number pool.");
    } finally {
      setLoading(false);
    }
  };

  const handleCheck = (idx) => {
    setRows((prev) =>
      prev.map((row, i) =>
        i === idx ? { ...row, checked: !row.checked } : row,
      ),
    );
  };

  const handleDelete = async () => {
    const idsToDelete = rows.filter((r) => r.checked && r.id).map((r) => r.id);
    if (idsToDelete.length === 0) {
      return;
    }
    if (
      !window.confirm(
        `Are you sure you want to delete ${idsToDelete.length} selected item(s)?`,
      )
    ) {
      return;
    }
    setIsDeleting(true);
    try {
      for (const id of idsToDelete) {
        await deleteNumberPool(id);
      }
      await refreshNumberPoolWithRetry();
      alert("Selected items deleted successfully!");
    } catch (e) {
      console.error("Delete Number Pool failed:", e);
      alert("Delete failed. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleClearAll = async () => {
    const ids = rows.filter((r) => r.id).map((r) => r.id);
    if (ids.length === 0) {
      alert("There are no items to clear.");
      return;
    }
    if (
      !window.confirm(
        `Are you sure you want to delete ALL ${ids.length} item(s)? This action cannot be undone.`,
      )
    ) {
      return;
    }
    setIsDeleting(true);
    try {
      for (const id of ids) {
        await deleteNumberPool(id);
      }
      await refreshNumberPoolWithRetry();
      alert("All items deleted successfully!");
    } catch (e) {
      console.error("Clear all Number Pool failed:", e);
      alert("Clear all failed. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  const fetchNumberPool = async () => {
    try {
      setLoading(true);
      const response = await listNumberPool();
      if (response.response && Array.isArray(response.message)) {
        const mapped = response.message.map((item) => ({
          id: item.id,
          checked: false,
          groupNo: Number(item.group),
          noInGroup: Number(item.no_in_groups),
          numberRange: (item.number_range || "").replace("-", "--"),
        }));
        setRows(mapped);
      } else {
        setRows([]);
      }
    } catch (e) {
      console.error("List Number Pool failed:", e);
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  // Retry once after a short delay in case the backend write hasn't propagated
  const refreshNumberPoolWithRetry = async () => {
    await fetchNumberPool();
    // If still empty but we just performed a write, try one quick retry
    if (rows.length === 0) {
      await new Promise((r) => setTimeout(r, 400));
      await fetchNumberPool();
    }
  };

  useEffect(() => {
    fetchNumberPool();
  }, []);

  // Fill up to MIN_ROWS for grid look
  const displayRows = [
    ...rows,
    ...Array.from({ length: Math.max(0, MIN_ROWS - rows.length) }).map(
      () => null,
    ),
  ];

  return (
    <div
      style={{
        backgroundColor: C.pageBg,
        minHeight: "calc(100vh - 80px)",
        padding: 16,
      }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        {/* Breadcrumb / Title area */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 12,
          }}
        >
          <div style={{ fontSize: 11, color: C.mutedText }}>
            E1-PRI &rsaquo; Number Filter &rsaquo;{" "}
            <span style={{ color: C.valueText, fontWeight: 600 }}>
              Number Pool
            </span>
          </div>
        </div>

        {/* Main Card */}
        <div
          style={{
            background: C.cardBg,
            border: `1px solid ${C.cardBorder}`,
            borderRadius: 8,
            overflow: "hidden",
            boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
          }}
        >
          {/* Toolbar */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "10px 14px",
              borderBottom: `1px solid ${C.cardBorder}`,
              background: "#DCE6F2",
              flexWrap: "wrap",
              gap: 8,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span
                style={{
                  background: "#f1f5f9",
                  border: `0.5px solid ${C.cardBorder}`,
                  color: "#475569",
                  fontSize: 11,
                  fontWeight: 600,
                  padding: "3px 12px",
                  borderRadius: 20,
                }}
              >
                {rows.length} records
              </span>
              {rows.some((r) => r.checked) && (
                <span
                  style={{
                    background: "#e0f2fe",
                    color: C.accent,
                    fontSize: 11,
                    fontWeight: 600,
                    padding: "3px 10px",
                    borderRadius: 20,
                    border: `0.5px solid ${C.accent}`,
                  }}
                >
                  {rows.filter((r) => r.checked).length} selected
                </span>
              )}
            </div>
            <div
              style={{
                // background: "#f3f4f6",
                color: "#000",
                fontWeight: 700,
                fontSize: 13,
                textAlign: "center",
                letterSpacing: "0.02em",
                // borderBottom: "0.5px solid #9ca3af",
              }}
            >
              Number Pool
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Btn
                onClick={handleDelete}
                disabled={!rows.some((r) => r.checked) || isDeleting}
                variant="danger"
              >
                {isDeleting ? (
                  <CircularProgress size={11} style={{ color: C.errorRed }} />
                ) : null}
                🗑 Delete
              </Btn>
              <Btn
                onClick={handleClearAll}
                disabled={rows.length === 0 || isDeleting}
                variant="danger"
              >
                Clear All
              </Btn>
              <Btn
                onClick={() => openModal()}
                disabled={isDeleting}
                variant="accent"
              >
                + Add New
              </Btn>
            </div>
          </div>

          {/* Table Header Title */}

          {/* Table Area */}
          <div style={{ overflowX: "auto", overflowY: "auto", maxHeight: 400 }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                minWidth: 600,
              }}
            >
              <thead>
                <tr>
                  <TH style={{ width: 80 }}>Check</TH>
                  <TH>Group No.</TH>
                  <TH>Number Range</TH>
                  <TH style={{ width: 100 }}>Modify</TH>
                </tr>
              </thead>
              <tbody>
                {displayRows.map((row, idx) => {
                  const isChecked = row?.checked || false;
                  const rowBg = isChecked
                    ? "#f0f9ff"
                    : idx % 2 === 1
                      ? "#f8fafc"
                      : "#ffffff";
                  return (
                    <tr
                      key={idx}
                      style={{
                        background: rowBg,
                        borderBottom: "0.5px solid #9ca3af",
                        transition: "background 0.1s ease",
                      }}
                    >
                      {row ? (
                        <>
                          <td
                            style={{
                              textAlign: "center",
                              padding: "6px 4px",
                              borderRight: "0.5px solid #edf2f7",
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => handleCheck(idx)}
                              style={{
                                width: 14,
                                height: 14,
                                cursor: "pointer",
                                accentColor: C.accent,
                              }}
                            />
                          </td>
                          <td
                            style={{
                              textAlign: "center",
                              padding: "7px 8px",
                              fontSize: 12,
                              color: C.valueText,
                              borderRight: "0.5px solid #edf2f7",
                            }}
                          >
                            {row.groupNo}
                          </td>
                          <td
                            style={{
                              textAlign: "center",
                              padding: "7px 8px",
                              fontSize: 12,
                              color: C.valueText,
                              borderRight: "0.5px solid #edf2f7",
                            }}
                          >
                            {row.numberRange}
                          </td>
                          <td
                            style={{ textAlign: "center", padding: "4px 8px" }}
                          >
                            <Btn
                              onClick={() => openModal(idx)}
                              variant="outline"
                              style={{
                                fontSize: 10,
                                padding: "3px 10px",
                                margin: "0 auto",
                              }}
                            >
                              Edit
                            </Btn>
                          </td>
                        </>
                      ) : (
                        <>
                          <td
                            style={{
                              height: 32,
                              borderRight: "0.5px solid #edf2f7",
                            }}
                          >
                            &nbsp;
                          </td>
                          <td
                            style={{ borderRight: "0.5px solid #edf2f7" }}
                          ></td>
                          <td
                            style={{ borderRight: "0.5px solid #edf2f7" }}
                          ></td>
                          <td></td>
                        </>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              padding: "8px 14px",
              borderTop: `0.5px solid ${C.cardBorder}`,
              background: "#f8fafc",
            }}
          >
            <span style={{ fontSize: 11, color: C.mutedText }}>
              {rows.length} record{rows.length !== 1 ? "s" : ""} total
            </span>
          </div>
        </div>
      </div>

      {/* Modal */}
      <Dialog
        open={modalOpen}
        onClose={closeModal}
        maxWidth={false}
        PaperProps={{ sx: { width: 420, borderRadius: 2 } }}
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
          {editIndex !== null ? "Edit" : "Add"} Number Pool Entry
        </DialogTitle>
        <DialogContent
          style={{ padding: "20px 24px", backgroundColor: "#eef2f7" }}
        >
          <div
            style={{
              background: "#fff",
              border: `1px solid ${C.cardBorder}`,
              borderRadius: 6,
              padding: 16,
              display: "flex",
              flexDirection: "column",
              gap: 14,
            }}
          >
            {/* Group No */}
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <label
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: C.labelText,
                  width: 100,
                }}
              >
                Group No.:
              </label>
              <MuiSelect
                name="groupNo"
                value={form.groupNo}
                onChange={handleFormChange}
                size="small"
                fullWidth
                sx={{ fontSize: 12, height: 32, backgroundColor: "#fff" }}
              >
                {NUMBER_POOL_GROUPS.map((g) => (
                  <MenuItem key={g.value} value={g.value} sx={{ fontSize: 12 }}>
                    {g.label}
                  </MenuItem>
                ))}
              </MuiSelect>
            </div>

            {/* Number Range */}
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <label
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: C.labelText,
                  width: 100,
                }}
              >
                Range:
              </label>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  flex: 1,
                }}
              >
                <TextField
                  name="numberRangeStart"
                  value={form.numberRangeStart}
                  onChange={handleFormChange}
                  size="small"
                  fullWidth
                  placeholder="Start"
                  inputProps={{ style: { fontSize: 12, height: 16 } }}
                  sx={{ backgroundColor: "#fff" }}
                />
                <span style={{ color: C.mutedText }}>-</span>
                <TextField
                  name="numberRangeEnd"
                  value={form.numberRangeEnd}
                  onChange={handleFormChange}
                  size="small"
                  fullWidth
                  placeholder="End"
                  inputProps={{ style: { fontSize: 12, height: 16 } }}
                  sx={{ backgroundColor: "#fff" }}
                />
              </div>
            </div>

            {validationError && (
              <Alert severity="error" sx={{ fontSize: 11, py: 0 }}>
                {validationError}
              </Alert>
            )}
          </div>
        </DialogContent>
        <DialogActions
          style={{
            padding: "16px 24px",
            background: "#eef2f7",
            borderTop: `1px solid ${C.cardBorder}`,
            justifyContent: "center",
            gap: 12,
          }}
        >
          <Btn
            onClick={handleSave}
            disabled={loading}
            style={{ padding: "8px 32px" }}
          >
            {loading ? <CircularProgress size={16} color="inherit" /> : "Save"}
          </Btn>
          <Btn
            onClick={closeModal}
            variant="outline"
            style={{ padding: "8px 32px" }}
          >
            Cancel
          </Btn>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default NumberPool;
