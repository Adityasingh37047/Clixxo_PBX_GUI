import React, { useState, useRef, useEffect } from "react";
import {
  NUM_RECEIVING_RULE_FIELDS,
  NUM_RECEIVING_RULE_INITIAL_FORM,
  NUM_RECEIVING_RULE_TABLE_COLUMNS,
} from "../../../constants/PcmNumReceivingRouleConstants";
import { listNumRecv, createNumRecv, deleteNumRecv } from "../../../api/apiService";
import EditDocumentIcon from "@mui/icons-material/EditDocument";
import EditIcon from "@mui/icons-material/Edit";
import {
  Button,
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
  IconButton,
} from "@mui/material";

// ── Theme tokens ──────────────────────────────────────────────────────────────
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

// ── Reusable Button ───────────────────────────────────────────────────────────
const Btn = ({
  children,
  onClick,
  disabled,
  variant = "default",
  style: extraStyle,
}) => {
  const variants = {
    default: {
      background: "#1e293b",
      color: "#fff",
      border: "1px solid #9ca3af",
    },
    outline: {
      background: C.cardBg,
      color: C.labelText,
      border: `0.5px solid ${C.cardBorder}`,
    },
    danger: {
      background: "#fef2f2",
      color: C.errorRed,
      border: "0.5px solid #fecaca",
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

// ── Reusable Table Header ─────────────────────────────────────────────────────
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
              "& .MuiOutlinedInput-notchedOutline": { borderColor: "#d1d5db" },
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
        background: C.pageBg,
        minHeight: "calc(100vh - 120px)",
        padding: "24px 20px",
        boxSizing: "border-box",
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
        <div style={{ fontSize: 11, color: C.mutedText, marginBottom: 12 }}>
          E1-PRI &rsaquo; PCM &rsaquo;{" "}
          <span style={{ color: C.valueText, fontWeight: 600 }}>
            Number-Receiving Rule
          </span>
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
            {/* Left: badges */}
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
                Page {page} · {rules.length} records
              </span>
              {selected.length > 0 && (
                <span
                  style={{
                    background: "#e0f2fe",
                    border: "0.5px solid #bae6fd",
                    color: "#0369a1",
                    fontSize: 10.5,
                    fontWeight: 600,
                    padding: "2px 10px",
                    borderRadius: 12,
                  }}
                >
                  {selected.length} selected
                </span>
              )}
            </div>
            {/* Right: action buttons */}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <Btn
                onClick={handleInverse}
                disabled={loading.delete}
                variant="outline"
              >
                Inverse
              </Btn>
              <Btn
                onClick={handleClearAll}
                disabled={loading.delete || rules.length === 0}
                variant="danger"
              >
                {loading.delete ? (
                  <CircularProgress size={12} color="inherit" />
                ) : (
                  "Clear All"
                )}
              </Btn>
              <Btn
                onClick={handleDelete}
                disabled={loading.delete || selected.length === 0}
                variant="danger"
              >
                {loading.delete ? (
                  <CircularProgress size={12} color="inherit" />
                ) : (
                  "🗑 Delete"
                )}
              </Btn>
              <Btn
                onClick={() => handleOpenModal()}
                disabled={loading.save}
                variant="accent"
              >
                + Add New
              </Btn>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto w-full">
            <table
              className="w-full min-w-[900px] border-collapse whitespace-nowrap"
              style={{ tableLayout: "auto" }}
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
                        color: C.accent,
                        "&.Mui-checked": { color: C.accent },
                        "&.MuiCheckbox-indeterminate": { color: C.accent },
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
                {loading.fetch ? (
                  <tr>
                    <td
                      colSpan={NUM_RECEIVING_RULE_TABLE_COLUMNS.length}
                      style={{
                        padding: "24px",
                        textAlign: "center",
                        borderBottom: `1px solid ${C.cardBorder}`,
                        fontSize: 13,
                        color: C.labelText,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 8,
                        }}
                      >
                        <CircularProgress size={20} sx={{ color: C.accent }} />
                        <span>Loading Number Receiving Rule data...</span>
                      </div>
                    </td>
                  </tr>
                ) : rules.length === 0 ? (
                  <tr>
                    <td
                      colSpan={NUM_RECEIVING_RULE_TABLE_COLUMNS.length}
                      style={{
                        padding: "36px 0",
                        textAlign: "center",
                        color: C.mutedText,
                        fontSize: 12,
                        borderBottom: `0.5px solid ${C.cardBorder}`,
                      }}
                    >
                      No data
                    </td>
                  </tr>
                ) : (
                  pagedRules.map((item, idx) => {
                    const realIdx = (page - 1) * itemsPerPage + idx;
                    const globalIndex = realIdx + 1;
                    const isRowChecked = selected.includes(realIdx);
                    const rowBg = isRowChecked
                      ? "#f0f9ff"
                      : idx % 2 === 0
                        ? "#ffffff"
                        : "#f8fafc";
                    return (
                      <tr
                        key={item.id || realIdx}
                        style={{
                          background: rowBg,
                          transition: "background-color 0.15s ease",
                        }}
                        onMouseEnter={(e) => {
                          if (!isRowChecked)
                            e.currentTarget.style.backgroundColor = "#f1f5f9";
                        }}
                        onMouseLeave={(e) => {
                          if (!isRowChecked)
                            e.currentTarget.style.backgroundColor = rowBg;
                        }}
                      >
                        {/* Checkbox cell */}
                        <td
                          style={{
                            padding: "6px 8px",
                            textAlign: "center",
                            borderBottom: "1px solid #e2e8f0",
                            borderRight: "0.5px solid #e2e8f0",
                            width: 36,
                          }}
                        >
                          <Checkbox
                            size="small"
                            checked={isRowChecked}
                            onChange={() => handleSelectRow(realIdx)}
                            sx={{
                              padding: "1px",
                              color: C.accent,
                              "&.Mui-checked": { color: C.accent },
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
                                  padding: "9px 8px",
                                  textAlign: "center",
                                  fontSize: 13,
                                  color: C.mutedText,
                                  borderBottom: "1px solid #e2e8f0",
                                  borderRight: "0.5px solid #e2e8f0",
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
                                  padding: "6px 8px",
                                  textAlign: "center",
                                  borderBottom: "1px solid #e2e8f0",
                                  borderRight: "0.5px solid #e2e8f0",
                                  width: 80,
                                }}
                              >
                                <IconButton
                                  onClick={() => handleOpenModal(item, realIdx)}
                                  sx={{
                                    padding: "4px",
                                    color: C.accent,
                                    "&:hover": { backgroundColor: "#e2e8f0" },
                                  }}
                                >
                                  <EditIcon sx={{ fontSize: 18 }} />
                                </IconButton>
                              </td>
                            );
                          }
                          return (
                            <td
                              key={col.key}
                              style={{
                                padding: "9px 8px",
                                textAlign: "center",
                                fontSize: 13,
                                color: C.valueText,
                                borderBottom: "1px solid #e2e8f0",
                                borderRight: "0.5px solid #e2e8f0",
                              }}
                            >
                              {item[col.key] !== undefined &&
                              item[col.key] !== ""
                                ? item[col.key]
                                : "--"}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination footer — matches PcmPstnPage exactly */}
          {rules.length > 0 && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "10px 14px",
                borderTop: `0.5px solid ${C.cardBorder}`,
                background: "#f8fafc",
                flexWrap: "wrap",
                gap: 12,
              }}
            >
              <span style={{ fontSize: 11, color: C.mutedText }}>
                Showing {pagedRules.length} record
                {pagedRules.length !== 1 ? "s" : ""} on page {page}
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
                  Page {page} of {totalPages}
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
                <span
                  style={{ fontSize: 11, color: C.mutedText, marginLeft: 8 }}
                >
                  Go to Page:
                </span>
                <select
                  value={page}
                  onChange={(e) => handlePageChange(Number(e.target.value))}
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    borderRadius: 6,
                    border: `0.5px solid ${C.cardBorder}`,
                    background: C.cardBg,
                    color: C.labelText,
                    padding: "4px 8px",
                    outline: "none",
                    cursor: "pointer",
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
            color: C.errorRed,
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
            textAlign: "center",
            padding: "16px 24px",
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
                          borderColor: "#94a3b8",
                        },
                        "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                          borderColor: "#1e2d42",
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
                        "&:hover .MuiOutlinedInput-notchedOutline": {
                          borderColor: "#94a3b8",
                        },
                        "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                          borderColor: "#1e2d42",
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
          }}
        >
          <Btn
            onClick={handleSave}
            disabled={loading.save}
            variant="accent"
            style={{ padding: "8px 24px", fontSize: 13, minWidth: 100 }}
          >
            {loading.save ? (
              <CircularProgress size={16} color="inherit" />
            ) : (
              "Save"
            )}
          </Btn>
          <Btn
            onClick={handleCloseModal}
            disabled={loading.save}
            variant="outline"
            style={{ padding: "8px 24px", fontSize: 13, minWidth: 100 }}
          >
            Close
          </Btn>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default PcmNumReceivingRulePage;
