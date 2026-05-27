import React, { useState, useEffect } from "react";
import {
  NUMBER_POOL_COLUMNS,
  NUMBER_POOL_GROUPS,
} from "../../../constants/NumberPoolConstants";
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
} from "../../../api/apiService";
import EditDocumentIcon from "@mui/icons-material/EditDocument";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import { Checkbox } from "@mui/material";

// ── Color palette (matches Number-Receiving Rule) ─────────────────────────────
const C = {
  pageBg: "#f8fafc",
  cardBg: "#ffffff",
  cardBorder: "#9CA3AF",
  labelText: "#3E5475",
  valueText: "#0f172a",
  mutedText: "#94a3b8",
  accent: "#3E5475",
  amber: "#dc2626",
};

const CARD_RADIUS = 20;

const Btn = ({
  children,
  onClick,
  disabled,
  variant = "default",
  style: extraStyle,
  type,
}) => {
  const styles = {
    default: {
      background: " #cbd5e1",
      color: C.valueText,
      border: "1px solid #9ca3af",
    },
    primary: {
      background:
        "linear-gradient(to bottom, #5A6F8F 0%, #3E5475 60%, #2C3E57 100%)",
      color: "#fff",
      border: "1px solid #5A6F8F",
      fontWeight: 600,
      fontSize: 15,
      borderRadius: 6,
      textTransform: "none",
      padding: "6px 28px",
    },
    cancel: {
      background: "#cbd5e1",
      color: "#374151",
      border: "1px solid #cbd5e1",
      boxShadow: "0 1px 2px rgba(15, 23, 42, 0.08)",
    },
    danger: {
      background: "#fef2f2",
      color: C.amber,
      border: `0.5px solid #fecaca`,
    },
    outline: {
      background: C.cardBg,
      color: C.labelText,
      border: `1px solid ${C.cardBorder}`,
    },
  };

  const s = styles[variant] || styles.default;
  const hoverBg = (() => {
    switch (variant) {
      case "primary":
        return "linear-gradient(to bottom, #3E5475 0%, #5A6F8F 100%)";
      case "cancel":
        return "#b6c2d3";
      case "danger":
        return "#fca5a5";
      case "outline":
      case "default":
      default:
        return "#e2e8f0";
    }
  })();

  const baseBg = s.background;

  return (
    <button
      type={type}
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
        transition: "all 0.15s ease",
        height: 30,
        gap: 6,
        whiteSpace: "nowrap",
        ...s,
        ...extraStyle,
      }}
      onMouseEnter={(e) => {
        if (!disabled) e.currentTarget.style.background = hoverBg;
      }}
      onMouseLeave={(e) => {
        if (!disabled) e.currentTarget.style.background = baseBg;
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
      padding: "12px 14px",
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
  padding: "10px 14px",
  fontSize: 13,
  color: C.valueText,
  textAlign: "center",
  background: "#ffffff",
  borderBottom: `1px solid ${C.cardBorder}`,
  borderRight: `1px solid ${C.cardBorder}`,
  whiteSpace: "nowrap",
};

const checkboxSx = {
  padding: "1px",
  color: "#3E5475",
  "&.Mui-checked": { color: "#0284c7" },
};

const MIN_ROWS = 14;

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
  const [toast, setToast] = useState({ msg: "", type: "success" });

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "success" }), 3500);
  };

  const alert = (msg) => {
    const isErr =
      /error|failed|required|please/i.test(msg) && !/successfully/i.test(msg);
    showToast(msg, isErr ? "error" : "success");
  };

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

  return (
    <div
      style={{
        backgroundColor: C.pageBg,
        minHeight: "calc(100vh - 80px)",
        padding: 16,
      }}
    >
      {/* Alerts */}
      {toast.msg && (
        <Alert
          severity={toast.type}
          onClose={() => setToast({ msg: "", type: "success" })}
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
          {toast.msg}
        </Alert>
      )}

      <div style={{ maxWidth: "100%", margin: "0 auto" }}>
        {/* Breadcrumb / Title area */}
        <div
          style={{
            fontSize: 12,
            color: C.mutedText,
            marginBottom: 16,
            display: "flex",
            gap: 4,
          }}
        >
          E1-PRI &rsaquo; Number Filter &rsaquo;{" "} 
          <span style={{ color: C.valueText, fontWeight: 600 }}>
            Number Pool
          </span>
        </div>

        {/* Main Card */}
        <div
          style={{
            background: C.cardBg,
            border: `1.5px solid ${C.cardBorder}`,
            borderRadius: 10,
            overflow: "hidden",
            boxShadow: "0 10px 30px rgba(15,23,42,0.06)",
          }}
        >
          {/* Top Actions Bar */}
          <div
            style={{
              padding: "14px 18px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 10,
              background: "#ffffff",
              borderBottom: `1px solid ${C.cardBorder}`,
              borderTopLeftRadius: CARD_RADIUS,
              borderTopRightRadius: CARD_RADIUS,
            }}
          >
            {/* Left Section */}
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              {rows.some((r) => r.checked) && (
                <span
                  style={{
                    background: "#eff6ff",
                    color: C.accent,
                    fontSize: 11,
                    fontWeight: 700,
                    padding: "5px 12px",
                    borderRadius: 999,
                    border: `1px solid ${C.accent}`,
                  }}
                >
                  {rows.filter((r) => r.checked).length} selected
                </span>
              )}
            </div>

            {/* Right Section: Actions */}
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
                onClick={handleDelete}
                disabled={!rows.some((r) => r.checked) || isDeleting}
                style={{ height: 30 }}
              >
                {isDeleting ? (
                  <CircularProgress size={12} color="inherit" />
                ) : (
                  <>
                    <DeleteOutlineOutlinedIcon sx={{ fontSize: 16 }} />
                    Delete
                  </>
                )}
              </Btn>
              <Btn
                variant="cancel"
                onClick={handleClearAll}
                disabled={rows.length === 0 || isDeleting}
                style={{ height: 30 }}
              >
                Clear All
              </Btn>
              <Btn
                variant="primary"
                onClick={() => openModal()}
                disabled={isDeleting}
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

          <div
            style={{
              overflowX: "auto",
              overflowY: "auto",
              flex: 1,
            }}
          >
            {rows.length === 0 ? (
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
                    marginBottom: 16,
                  }}
                >
                  No Number Pool Entries Configured!
                </div>
                <Btn
                  onClick={() => openModal()}
                  variant="cancel"
                  style={{ padding: "8px 24px", fontSize: 12, borderRadius: 6 }}
                >
                  + Add New Entry
                </Btn>
              </div>
            ) : (
              <table
                style={{
                  width: "100%",
                  borderCollapse: "separate",
                  borderSpacing: 0,
                  minWidth: "600px",
                }}
              >
                <thead>
                  <tr>
                    <TH style={{ width: 60, borderLeft: "none" }}>Check</TH>
                    <TH>Group No.</TH>
                    <TH>Number Range</TH>
                    <TH style={{ width: 80, borderRight: "none" }}>Modify</TH>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, idx) => {
                    const realIdx = idx;
                    const isChecked = row?.checked || false;
                    const isLastRow = idx === rows.length - 1;
                    const rowBg = isChecked
                      ? "#f0f9ff"
                      : realIdx % 2 === 1
                        ? "#f8fafc"
                        : "#ffffff";
                    const lastRowCellStyle = isLastRow
                      ? { borderBottom: "none" }
                      : {};
                    return (
                      <tr
                        key={row.id || realIdx}
                        style={{
                          background: rowBg,
                          transition: "background 0.1s ease",
                        }}
                        onMouseEnter={(e) => {
                          if (!isChecked)
                            e.currentTarget.style.background = "#f1f5f9";
                        }}
                        onMouseLeave={(e) => {
                          if (!isChecked)
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
                            checked={isChecked}
                            onChange={() => handleCheck(realIdx)}
                            size="small"
                            sx={checkboxSx}
                          />
                        </td>
                        <td style={{ ...tdStyle, background: rowBg, ...lastRowCellStyle }}>
                          {row.groupNo}
                        </td>
                        <td style={{ ...tdStyle, background: rowBg, ...lastRowCellStyle }}>
                          {row.numberRange}
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
                              style={{
                                cursor: "pointer",
                                color: "#2563eb",
                                fontSize: 22,
                                opacity: 0.7,
                                transition: "opacity 0.15s ease",
                              }}
                              onClick={() => openModal(realIdx)}
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

          {rows.length > 0 && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "10px 14px",
                background: "#ffffff",
                borderTop: `1px solid ${C.cardBorder}`,
                borderBottomLeftRadius: CARD_RADIUS,
                borderBottomRightRadius: CARD_RADIUS,
              }}
            >
              <span style={{ fontSize: 11, color: C.mutedText }}>
                Showing {rows.length} record
                {rows.length !== 1 ? "s" : ""}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      <Dialog
        open={modalOpen}
        onClose={closeModal}
        maxWidth={false}
        className="z-50"
        PaperProps={{
          sx: {
            width: 500,
            maxWidth: "95vw",
            mx: "auto",
            p: 0,
            borderRadius: 2,
            overflow: "hidden",
            boxShadow:
              "0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)",
          },
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
            textAlign: "center",
            padding: "16px 24px",
          }}
        >
          {editIndex !== null ? "Edit" : "Add"} Number Pool Entry
        </DialogTitle>
        <DialogContent style={{ padding: "24px", backgroundColor: "#f8fafc" }}>
          <div
            style={{
              background: "#fff",
              border: `1px solid ${C.cardBorder}`,
              borderRadius: 8,
              padding: 20,
              display: "flex",
              flexDirection: "column",
              gap: 16,
            }}
          >
            {/* Group No */}
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <label
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: C.labelText,
                  width: 140,
                  whiteSpace: "normal",
                  lineHeight: 1.2,
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
                sx={{
                  fontSize: 13,
                  height: 36,
                  backgroundColor: "#fff",
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: C.cardBorder,
                    transition: "border-color 0.2s ease",
                  },
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#64748b",
                  },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#0284c7 !important",
                    borderWidth: "1px !important",
                  },
                }}
              >
                {NUMBER_POOL_GROUPS.map((g) => (
                  <MenuItem key={g.value} value={g.value} sx={{ fontSize: 13 }}>
                    {g.label}
                  </MenuItem>
                ))}
              </MuiSelect>
            </div>

            {/* Number Range */}
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <label
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: C.labelText,
                  width: 140,
                  whiteSpace: "normal",
                  lineHeight: 1.2,
                }}
              >
                Range:
              </label>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
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
                  inputProps={{ style: { fontSize: 13, height: 16 } }}
                  sx={{
                    backgroundColor: "#fff",
                    "& .MuiOutlinedInput-root": {
                      "& fieldset": {
                        borderColor: C.cardBorder,
                        transition: "border-color 0.2s ease",
                      },
                      "&:hover fieldset": {
                        borderColor: "#64748b",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "#0284c7",
                        borderWidth: 1,
                      },
                    },
                  }}
                />
                <span style={{ color: C.mutedText, fontWeight: 600 }}>-</span>
                <TextField
                  name="numberRangeEnd"
                  value={form.numberRangeEnd}
                  onChange={handleFormChange}
                  size="small"
                  fullWidth
                  placeholder="End"
                  inputProps={{ style: { fontSize: 13, height: 16 } }}
                  sx={{
                    backgroundColor: "#fff",
                    "& .MuiOutlinedInput-root": {
                      "& fieldset": {
                        borderColor: C.cardBorder,
                        transition: "border-color 0.2s ease",
                      },
                      "&:hover fieldset": {
                        borderColor: "#64748b",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "#0284c7",
                        borderWidth: 1,
                      },
                    },
                  }}
                />
              </div>
            </div>

            {validationError && (
              <Alert severity="error" sx={{ fontSize: 12, py: 0, mt: 1 }}>
                {validationError}
              </Alert>
            )}
          </div>
        </DialogContent>
        <DialogActions
          style={{
            background: "#ffffff",
            padding: "16px 24px",
            borderTop: `1px solid ${C.cardBorder}`,
            display: "flex",
            justifyContent: "center",
            gap: 12,
          }}
        >
          <Btn
            onClick={handleSave}
            variant="primary"
            style={{ width: 120, height: 38 }}
            disabled={loading}
          >
            {loading ? (
              <CircularProgress size={16} style={{ color: "#fff" }} />
            ) : (
              "Save"
            )}
          </Btn>
          <Btn
            onClick={closeModal}
            variant="cancel"
            style={{ width: 120, height: 38 }}
            disabled={loading}
          >
            Cancel
          </Btn>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default NumberPool;
