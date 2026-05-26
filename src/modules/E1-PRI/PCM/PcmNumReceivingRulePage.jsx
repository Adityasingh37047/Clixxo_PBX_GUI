import React, { useState, useRef, useEffect } from "react";
import {
  NUM_RECEIVING_RULE_FIELDS,
  NUM_RECEIVING_RULE_INITIAL_FORM,
  NUM_RECEIVING_RULE_TABLE_COLUMNS,
} from "../../../constants/PcmNumReceivingRouleConstants";
import {
  listNumRecv,
  createNumRecv,
  deleteNumRecv,
} from "../../../api/apiService";
import EditDocumentIcon from "@mui/icons-material/EditDocument";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Checkbox,
} from "@mui/material";

// ── Color palette (matches Extensions page) ───────────────────────────────────
const C = {
  pageBg: "#f8fafc",
  cardBg: "#ffffff",
  cardBorder: "#e2e8f0",
  cardBorderSoft: "#f1f5f9",
  labelText: "#64748b",
  valueText: "#0f172a",
  mutedText: "#94a3b8",
  accent: "#3E5475",
  successGreen: "#22c55e",
  errorRed: "#ef4444",
  purple: "#8b5cf6",
  amber: "#dc2626",
};

// ── Button (Account Manage style; outline kept for pagination only) ───────────
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
    outline: {
      background: C.cardBg,
      color: C.labelText,
      border: `0.5px solid ${C.cardBorder}`,
    },
  };

  const s = styles[variant] || styles.default;
  const hoverBg = (() => {
    switch (variant) {
      case "primary":
        return "linear-gradient(to bottom, #3E5475 0%, #5A6F8F 100%)";
      case "cancel":
        return "#b6c2d3";
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

// ── Reusable Table Header ─────────────────────────────────────────────────────
const TH = ({ children, style: extra }) => (
  <th
    style={{
      background: "#f8fafc",
      color: C.labelText,
      fontWeight: 700,
      fontSize: 11,
      padding: "12px 14px",
      textAlign: "center",
      borderBottom: `1px solid ${C.cardBorder}`,
      borderRight: "1px solid #f1f5f9",
      whiteSpace: "nowrap",
      textTransform: "uppercase",
      letterSpacing: "0.14em",
      ...extra,
    }}
  >
    {children}
  </th>
);

const PcmNumReceivingRulePage = () => {
  // State
  const [rules, setRules] = useState([]);
  const [allData, setAllData] = useState([]);
  const [selected, setSelected] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(NUM_RECEIVING_RULE_INITIAL_FORM);
  const [editIndex, setEditIndex] = useState(null);
  const [loading, setLoading] = useState({
    fetch: false,
    save: false,
    delete: false,
  });
  const [message, setMessage] = useState({ type: "", text: "" });
  const hasInitialLoadRef = useRef(false);
  const [page, setPage] = useState(1);
  const itemsPerPage = 20;
  const totalPages = Math.max(1, Math.ceil(rules.length / itemsPerPage));
  const pagedRules = rules.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage,
  );

  // Show message function
  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 5000);
  };

  // Load data function
  const loadNumRecvData = async (isRefresh = false) => {
    if (loading.fetch) {
      return;
    }
    setLoading((prev) => ({ ...prev, fetch: true }));
    try {
      // console.log('Attempting to load Number Receiving Rule data...');
      const response = await listNumRecv();
      // console.log('Number Receiving Rule response:', response);

      if (response && response.response && Array.isArray(response.message)) {
        setAllData(response.message);
        setRules(response.message);
        // console.log('Number Receiving Rule data loaded successfully:', response.message.length, 'items');
        // console.log('Sample data structure:', response.message[0]); // Debug: show first item structure
      } else {
        // console.log('Invalid response format:', response);
        if (!isRefresh) {
          showMessage("error", "Failed to load Number Receiving Rule data");
        }
      }
    } catch (error) {
      console.error("Error loading Number Receiving Rule data:", error);
      if (!isRefresh) {
        if (error.message === "Network Error") {
          showMessage("error", "Network error. Please check your connection.");
        } else if (error.response?.status === 500) {
          showMessage(
            "error",
            "Server error. The Number Receiving Rule endpoint may have issues.",
          );
        } else if (error.response?.status === 404) {
          showMessage(
            "error",
            "Number Receiving Rule API endpoint not found. The server does not have the /numrecv endpoint implemented yet.",
          );
        } else {
          showMessage(
            "error",
            error.message || "Failed to load Number Receiving Rule data",
          );
        }
        setAllData([]);
        setRules([]);
      } else {
        console.warn("Refresh failed, keeping existing data:", error.message);
        // For refresh failures, show a warning but don't clear data
        showMessage(
          "warning",
          "Failed to refresh data. Please refresh the page manually.",
        );
      }
    } finally {
      setLoading((prev) => ({ ...prev, fetch: false }));
    }
  };

  // Initial load
  useEffect(() => {
    if (!hasInitialLoadRef.current) {
      hasInitialLoadRef.current = true;
      loadNumRecvData();
    }
  }, []);

  // Modal handlers
  const handleOpenModal = (item = null, index = -1) => {
    if (item) {
      setForm({
        number_data: item.number_data || "",
        provider: item.provider || "bsnl",
      });
      setEditIndex(item.id);
    } else {
      setForm(NUM_RECEIVING_RULE_INITIAL_FORM);
      setEditIndex(null);
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setForm(NUM_RECEIVING_RULE_INITIAL_FORM);
    setEditIndex(null);
  };

  const handleInputChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  // Save function
  const handleSave = async () => {
    if (loading.save) return;

    // Validation
    if (!form.number_data.trim()) {
      showMessage("error", "Number Data is required");
      return;
    }
    if (!form.provider) {
      showMessage("error", "Provider is required");
      return;
    }

    setLoading((prev) => ({ ...prev, save: true }));
    try {
      const apiData = {
        number_data: form.number_data.trim(),
        provider: form.provider,
      };

      //    console.log('Saving Number Receiving Rule:', apiData);
      const response = await createNumRecv(apiData);
      // console.log('Save response:', response);

      if (response && response.response) {
        showMessage("success", "Number Receiving Rule saved successfully!");
        handleCloseModal();

        // Small delay to ensure modal closes before refreshing
        setTimeout(async () => {
          try {
            await loadNumRecvData(true);
          } catch (reloadError) {
            console.warn("Failed to reload data after save:", reloadError);
            // If reload fails, add the new item to local state as fallback
            const newItem = {
              id: Date.now(), // Temporary ID for local state
              ...apiData,
            };
            setRules((prev) => [...prev, newItem]);
            setAllData((prev) => [...prev, newItem]);
            showMessage(
              "warning",
              "Data saved but failed to refresh. New item added to table.",
            );
          }
        }, 100);
      } else {
        showMessage("error", "Failed to save Number Receiving Rule");
      }
    } catch (error) {
      console.error("Error saving Number Receiving Rule:", error);
      showMessage(
        "error",
        error.message || "Failed to save Number Receiving Rule",
      );
    } finally {
      setLoading((prev) => ({ ...prev, save: false }));
    }
  };

  // Delete function
  const handleDelete = async () => {
    if (selected.length === 0) {
      showMessage("warning", "Please select items to delete");
      return;
    }

    if (loading.delete) return;

    const isConfirmed = window.confirm(
      `Are you sure you want to delete ${selected.length} selected item(s)?`,
    );
    if (!isConfirmed) return;

    setLoading((prev) => ({ ...prev, delete: true }));
    try {
      const deletePromises = selected.map((index) => {
        const rule = rules[index];
        return deleteNumRecv(rule.id);
      });

      const results = await Promise.allSettled(deletePromises);
      const successful = results.filter((r) => r.status === "fulfilled").length;
      const failed = results.filter((r) => r.status === "rejected").length;

      if (successful > 0) {
        showMessage("success", `Successfully deleted ${successful} item(s)`);
      }
      if (failed > 0) {
        showMessage("error", `Failed to delete ${failed} item(s)`);
      }

      setSelected([]);

      // Reload data
      try {
        await loadNumRecvData(true);
      } catch (reloadError) {
        console.warn("Failed to reload data after delete:", reloadError);
        // Update local state as fallback
        setRules((prev) =>
          prev.filter((_, index) => !selected.includes(index)),
        );
      }
    } catch (error) {
      console.error("Error deleting Number Receiving Rules:", error);
      showMessage(
        "error",
        error.message || "Failed to delete Number Receiving Rules",
      );
    } finally {
      setLoading((prev) => ({ ...prev, delete: false }));
    }
  };

  // Clear all function
  const handleClearAll = async () => {
    if (rules.length === 0) {
      showMessage("warning", "No data to clear");
      return;
    }

    if (loading.delete) return;

    const isConfirmed = window.confirm(
      `Are you sure you want to delete all ${rules.length} Number-Receiving Rule(s)? This action cannot be undone.`,
    );
    if (!isConfirmed) return;

    setLoading((prev) => ({ ...prev, delete: true }));
    try {
      const deletePromises = rules.map((rule) => deleteNumRecv(rule.id));
      const results = await Promise.allSettled(deletePromises);
      const successful = results.filter((r) => r.status === "fulfilled").length;
      const failed = results.filter((r) => r.status === "rejected").length;

      if (successful > 0) {
        showMessage("success", `Successfully cleared ${successful} item(s)`);
      }
      if (failed > 0) {
        showMessage("error", `Failed to clear ${failed} item(s)`);
      }

      setSelected([]);
      setPage(1);

      // Reload data
      try {
        await loadNumRecvData(true);
      } catch (reloadError) {
        console.warn("Failed to reload data after clear all:", reloadError);
        // Update local state as fallback
        setRules([]);
        setAllData([]);
      }
    } catch (error) {
      console.error("Error clearing all Number Receiving Rules:", error);
      showMessage(
        "error",
        error.message || "Failed to clear all Number Receiving Rules",
      );
    } finally {
      setLoading((prev) => ({ ...prev, delete: false }));
    }
  };

  // Selection handlers
  const handleSelectRow = (index) => {
    setSelected((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index],
    );
  };

  const handleCheckAllRows = () => {
    setSelected(pagedRules.map((_, idx) => (page - 1) * itemsPerPage + idx));
  };

  const handleUncheckAllRows = () => {
    setSelected([]);
  };

  const handleInverse = () => {
    const currentPageIndices = pagedRules.map(
      (_, idx) => (page - 1) * itemsPerPage + idx,
    );
    setSelected(currentPageIndices.filter((i) => !selected.includes(i)));
  };

  // Pagination handlers
  const handlePageChange = (newPage) => {
    setPage(Math.max(1, Math.min(totalPages, newPage)));
  };

  // Render form field
  const renderFormField = (field) => (
    <div
      key={field.name}
      className="flex flex-row items-center border border-gray-300 rounded px-3 py-2 gap-3 w-full bg-white mb-2"
    >
      <label className="text-[15px] text-gray-700 font-medium whitespace-nowrap text-left min-w-[120px] mr-2">
        {field.label}:
      </label>
      <div className="flex-1 min-w-0">
        {field.type === "select" ? (
          <Select
            value={form[field.name]}
            onChange={(e) => handleInputChange(field.name, e.target.value)}
            size="small"
            fullWidth
            variant="outlined"
            className="bg-white"
            sx={{
              maxWidth: "100%",
              minWidth: 0,
              backgroundColor: "#ffffff",
              "& .MuiOutlinedInput-notchedOutline": { borderColor: "#cbd5e1" },
              "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#64748b" },
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#0284c7", borderWidth: 1 },
            }}
          >
            {field.options.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        ) : (
          <TextField
            type={field.type}
            value={form[field.name] || ""}
            onChange={(e) => handleInputChange(field.name, e.target.value)}
            size="small"
            fullWidth
            variant="outlined"
            className="bg-white"
            sx={{
              maxWidth: "100%",
              minWidth: 0,
              backgroundColor: "#ffffff",
              "& .MuiOutlinedInput-notchedOutline": { borderColor: "#cbd5e1" },
              "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#64748b" },
              "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#0284c7", borderWidth: 1 },
            }}
            placeholder={field.placeholder || ""}
          />
        )}
      </div>
    </div>
  );

  // Render table row
  const renderTableRow = (item, idx) => {
    const realIdx = (page - 1) * itemsPerPage + idx;
    const globalIndex = realIdx + 1; // Auto-incrementing index starting from 1
    return (
      <tr key={item.id || realIdx} style={{ minHeight: 32 }}>
        <td
          className="border border-gray-300 text-center bg-white"
          style={{
            border: "1px solid #bbb",
            padding: "6px 8px",
            minHeight: 32,
            whiteSpace: "nowrap",
          }}
        >
          <input
            type="checkbox"
            checked={selected.includes(realIdx)}
            onChange={() => handleSelectRow(realIdx)}
          />
        </td>
        {NUM_RECEIVING_RULE_TABLE_COLUMNS.filter(
          (col) => col.key !== "check",
        ).map((col) => {
          if (col.key === "index") {
            return (
              <td
                key={col.key}
                className="border border-gray-300 text-center bg-white"
                style={{
                  border: "1px solid #bbb",
                  padding: "6px 8px",
                  minHeight: 32,
                  whiteSpace: "nowrap",
                }}
              >
                {globalIndex}
              </td>
            );
          }
          if (col.key === "modify") {
            return (
              <td
                key={col.key}
                className="border border-gray-300 text-center bg-white"
                style={{
                  border: "1px solid #bbb",
                  padding: "6px 8px",
                  minHeight: 32,
                  whiteSpace: "nowrap",
                }}
              >
                <EditDocumentIcon
                  className="cursor-pointer text-blue-600 mx-auto"
                  onClick={() => handleOpenModal(item, realIdx)}
                  style={{ fontSize: 22 }}
                />
              </td>
            );
          }
          return (
            <td
              key={col.key}
              className="border border-gray-300 text-center bg-white"
              style={{
                border: "1px solid #bbb",
                padding: "6px 8px",
                minHeight: 32,
                whiteSpace: "nowrap",
              }}
            >
              {item[col.key] !== undefined && item[col.key] !== ""
                ? item[col.key]
                : "--"}
            </td>
          );
        })}
      </tr>
    );
  };

  return (
    <div
      style={{
        backgroundColor: C.pageBg,
        minHeight: "calc(100vh - 80px)",
        padding: 16,
      }}
    >
      {/* Message Display */}
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

      <div style={{ maxWidth: "100%", margin: "0 auto" }}>
        {/* Breadcrumb */}
        <div style={{ fontSize: 12, color: C.mutedText, marginBottom: 16, display: "flex", gap: 4 }}>
          E1-PRI &rsaquo; PCM &rsaquo;{" "}
          <span style={{ color: "#1e293b", fontWeight: 600 }}>
            Number-Receiving Rule
          </span>
        </div>

        {/* Main Card */}
        <div
          style={{
            background: "#ffffff",
            borderRadius: 22,
            overflow: "hidden",
            border: `1px solid ${C.cardBorder}`,
            boxShadow: "0 10px 30px rgba(15,23,42,0.06)",
          }}
        >
          {/* Toolbar */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "14px 18px",
              borderBottom: "1px solid #e2e8f0",
              background: "#ffffff",
              flexWrap: "wrap",
              gap: 10,
            }}
          >
            {/* Left: badges */}
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span
                style={{
                  background: "#f1f5f9",
                  border: `1px solid #e2e8f0`,
                  color: C.labelText,
                  fontSize: 11,
                  fontWeight: 700,
                  padding: "5px 14px",
                  borderRadius: 999,
                }}
              >
                Page {page} · {rules.length} records
              </span>
              {selected.length > 0 && (
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
                  {selected.length} selected
                </span>
              )}
            </div>
            {/* Right: action buttons */}
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
                disabled={loading.delete || loading.fetch}
                style={{ height: 30 }}
              >
                Inverse
              </Btn>
              <Btn
                variant="cancel"
                onClick={handleClearAll}
                disabled={loading.delete || loading.fetch || rules.length === 0}
                style={{ height: 30 }}
              >
                {loading.delete ? (
                  <CircularProgress size={12} color="inherit" />
                ) : (
                  "Clear All"
                )}
              </Btn>
              <Btn
                variant="cancel"
                onClick={handleDelete}
                disabled={
                  loading.delete || loading.fetch || selected.length === 0
                }
                style={{ height: 30 }}
              >
                {loading.delete ? (
                  <CircularProgress size={12} color="inherit" />
                ) : (
                  <>
                    <DeleteOutlineOutlinedIcon sx={{ fontSize: 16 }} />
                    Delete
                  </>
                )}
              </Btn>
              <Btn
                variant="primary"
                onClick={() => handleOpenModal()}
                disabled={loading.save || loading.fetch}
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
          <div style={{ overflowX: "auto" }}>
            {loading.fetch ? (
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
            ) : (
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  tableLayout: "auto",
                  minWidth: 900,
                }}
              >
                <thead>
                  <tr>
                    <TH style={{ width: 36 }}>
                      <Checkbox
                        size="small"
                        checked={
                          pagedRules.length > 0 &&
                          pagedRules.every((_, idx) =>
                            selected.includes((page - 1) * itemsPerPage + idx),
                          )
                        }
                        indeterminate={
                          pagedRules.some((_, idx) =>
                            selected.includes((page - 1) * itemsPerPage + idx),
                          ) &&
                          !pagedRules.every((_, idx) =>
                            selected.includes((page - 1) * itemsPerPage + idx),
                          )
                        }
                        onChange={() => {
                          const allSelected = pagedRules.every((_, idx) =>
                            selected.includes((page - 1) * itemsPerPage + idx),
                          );
                          if (allSelected) handleUncheckAllRows();
                          else handleCheckAllRows();
                        }}
                        sx={{
                          padding: "1px",
                          color: "#64748b",
                          "&.Mui-checked": { color: "#0284c7" },
                          "&.MuiCheckbox-indeterminate": { color: "#0284c7" },
                        }}
                      />
                    </TH>
                    {NUM_RECEIVING_RULE_TABLE_COLUMNS.filter(
                      (c) => c.key !== "check",
                    ).map((c) => (
                      <TH key={c.key}>{c.label}</TH>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rules.length === 0 ? (
                    <tr>
                      <td
                        colSpan={NUM_RECEIVING_RULE_TABLE_COLUMNS.length}
                        style={{
                          textAlign: "center",
                          padding: "36px 0",
                          color: C.mutedText,
                          fontSize: 13,
                        }}
                      >
                        No Number-Receiving Rules found.
                      </td>
                    </tr>
                  ) : (
                    pagedRules.map((item, idx) => {
                      const realIdx = (page - 1) * itemsPerPage + idx;
                      const globalIndex = realIdx + 1;
                      const isRowChecked = selected.includes(realIdx);
                      const rowBg = isRowChecked
                        ? "#e0f2fe"
                        : idx % 2 === 1
                          ? "#f8fafc"
                          : "#ffffff";
                      return (
                        <tr
                          key={item.id || realIdx}
                          style={{
                            background: rowBg,
                            borderBottom: "1px solid #f1f5f9",
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
                          {/* Checkbox cell */}
                          <td
                            style={{
                              textAlign: "center",
                              padding: "10px 0",
                              borderRight: "1px solid #f1f5f9",
                            }}
                          >
                            <Checkbox
                              size="small"
                              checked={isRowChecked}
                              onChange={() => handleSelectRow(realIdx)}
                              disabled={loading.delete}
                              sx={{
                                padding: "1px",
                                color: "#64748b",
                                "&.Mui-checked": { color: "#0284c7" },
                              }}
                            />
                          </td>
                          {/* Data cells */}
                          {NUM_RECEIVING_RULE_TABLE_COLUMNS.filter(
                            (col) => col.key !== "check",
                          ).map((col) => {
                            if (col.key === "index") {
                              return (
                                <td
                                  key={col.key}
                                  style={{
                                    textAlign: "center",
                                    padding: "10px 6px",
                                    fontSize: 11,
                                    color: C.mutedText,
                                    borderRight: "1px solid #f1f5f9",
                                  }}
                                >
                                  {globalIndex}
                                </td>
                              );
                            }
                            if (col.key === "modify") {
                              return (
                                <td
                                  key={col.key}
                                  style={{
                                    padding: "7px 8px",
                                    textAlign: "center",
                                  }}
                                >
                                  <EditDocumentIcon
                                    className="cursor-pointer text-blue-600 mx-auto opacity-70 hover:opacity-100 transition-opacity"
                                    titleAccess="Edit"
                                    onClick={() => {
                                      if (!loading.delete) {
                                        handleOpenModal(item, realIdx);
                                      }
                                    }}
                                    style={{
                                      fontSize: 22,
                                      opacity: loading.delete ? 0.4 : undefined,
                                      pointerEvents: loading.delete
                                        ? "none"
                                        : "auto",
                                    }}
                                  />
                                </td>
                              );
                            }
                            return (
                              <td
                                key={col.key}
                                style={{
                                  padding: "10px 14px",
                                  fontSize: 13,
                                  color: C.valueText,
                                  textAlign: "center",
                                  borderRight: "1px solid #f1f5f9",
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
                    })
                  )}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination footer */}
          {!loading.fetch && rules.length > 0 && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "12px 18px",
                borderTop: `1px solid ${C.cardBorder}`,
                background: "#ffffff",
              }}
            >
              <span style={{ fontSize: 11, color: C.mutedText }}>
                Showing {pagedRules.length} of {rules.length} rule
                {rules.length !== 1 ? "s" : ""} · Page {page} of {totalPages}
              </span>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  flexWrap: "wrap",
                }}
              >
                <Btn
                  onClick={() => handlePageChange(1)}
                  disabled={page === 1}
                  variant="outline"
                >
                  First
                </Btn>
                <Btn
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1}
                  variant="outline"
                >
                  ← Prev
                </Btn>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: C.accent,
                    background: "#e0f2fe",
                    padding: "5px 14px",
                    borderRadius: 6,
                    border: `0.5px solid ${C.cardBorder}`,
                  }}
                >
                  Page {page}
                </span>
                <Btn
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page === totalPages}
                  variant="outline"
                >
                  Next →
                </Btn>
                <Btn
                  onClick={() => handlePageChange(totalPages)}
                  disabled={page === totalPages}
                  variant="outline"
                >
                  Last
                </Btn>
                <span style={{ fontSize: 11, color: C.mutedText }}>Go to</span>
                <select
                  value={page}
                  onChange={(e) => handlePageChange(Number(e.target.value))}
                  style={{
                    fontSize: 11,
                    borderRadius: 4,
                    border: `0.5px solid ${C.cardBorder}`,
                    padding: "3px 6px",
                    color: C.labelText,
                    background: "#fff",
                  }}
                >
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ),
                  )}
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Rule note */}
        <div
          style={{
            fontSize: 11,
            color: C.amber,
            marginTop: 12,
            textAlign: "center",
          }}
        >
          Rule: "x"(lowercase) indicates a random number, "*" indicates multiple
          random characters.
        </div>
      </div>

      {/* Modal */}
      <Dialog
        open={showModal}
        onClose={handleCloseModal}
        maxWidth={false}
        PaperProps={{
          sx: {
            width: 500,
            maxWidth: "95vw",
            p: 0,
            borderRadius: "8px",
            overflow: "hidden",
            boxShadow:
              "0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)",
          },
        }}
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
          }}
        >
          {editIndex !== null
            ? "Edit Number-Receiving Rule"
            : "Add Number-Receiving Rule"}
        </DialogTitle>
        <DialogContent
          style={{ padding: "20px 24px", backgroundColor: "#f8fafc" }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 12,
              width: "100%",
            }}
          >
            {NUM_RECEIVING_RULE_FIELDS.map((field) => (
              <div
                key={field.name}
                style={{
                  display: "flex",
                  alignItems: "center",
                  background: "#ffffff",
                  border: "1px solid #cbd5e1",
                  borderRadius: 6,
                  padding: "6px 12px",
                  gap: 12,
                  minHeight: 40,
                }}
              >
                <label
                  style={{
                    fontSize: 13,
                    color: "#1e293b",
                    fontWeight: 600,
                    whiteSpace: "nowrap",
                    width: 140,
                  }}
                >
                  {field.label}:
                </label>
                <div className="flex-1" style={{ maxWidth: 300 }}>
                  {field.type === "select" ? (
                    <Select
                      value={form[field.name]}
                      onChange={(e) =>
                        handleInputChange(field.name, e.target.value)
                      }
                      size="small"
                      fullWidth
                      variant="outlined"
                      MenuProps={{ PaperProps: { style: { maxHeight: 240 } } }}
                      sx={{
                        fontSize: 13,
                        "& .MuiOutlinedInput-notchedOutline": {
                          borderColor: "#cbd5e1",
                        },
                        "&:hover .MuiOutlinedInput-notchedOutline": {
                          borderColor: "#64748b",
                        },
                        "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                          borderColor: "#0284c7",
                          borderWidth: 1,
                        },
                      }}
                    >
                      {field.options.map((option) => (
                        <MenuItem
                          key={option.value}
                          value={option.value}
                          sx={{ fontSize: 13 }}
                        >
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  ) : (
                    <TextField
                      type={field.type}
                      value={form[field.name] || ""}
                      onChange={(e) =>
                        handleInputChange(field.name, e.target.value)
                      }
                      size="small"
                      fullWidth
                      variant="outlined"
                      placeholder={field.placeholder || ""}
                      sx={{
                        fontSize: 13,
                        "& .MuiOutlinedInput-notchedOutline": {
                          borderColor: "#cbd5e1",
                        },
                        "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline": {
                          borderColor: "#64748b",
                        },
                        "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
                          borderColor: "#0284c7",
                          borderWidth: 1,
                        },
                      }}
                      inputProps={{
                        style: { fontSize: 13, padding: "6px 8px" },
                      }}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
        <DialogActions
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 16,
            padding: "16px 24px",
            background: "#f8fafc",
            borderTop: "1px solid #e2e8f0",
            borderBottomLeftRadius: 8,
            borderBottomRightRadius: 8,
          }}
        >
          <Btn
            variant="primary"
            onClick={handleSave}
            disabled={loading.save}
            style={{ minWidth: 110, height: 34 }}
          >
            {loading.save ? "Saving..." : "Save"}
          </Btn>
          <Btn
            variant="cancel"
            onClick={handleCloseModal}
            disabled={loading.save}
            style={{ minWidth: 110, height: 34, borderRadius: 6 }}
          >
            Cancel
          </Btn>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default PcmNumReceivingRulePage;
