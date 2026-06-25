import React, { useState, useRef, useEffect } from "react";
import {
  NUM_RECEIVING_RULE_FIELDS,
  NUM_RECEIVING_RULE_INITIAL_FORM,
  NUM_RECEIVING_RULE_TABLE_COLUMNS,
  NUM_RECEIVING_RULE_FIELD_TOOLTIPS,
} from "../../../constants/PcmNumReceivingRuleConstants";
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
  Tooltip,
} from "@mui/material";
// ── Page-local field label tooltip UI (not shared) ──
const FIELD_LABEL_COLOR = "#3E5475";

const FIELD_TOOLTIP_PROPS = {
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
        textTransform: "none",
        letterSpacing: "normal",
      },
    },
    arrow: { sx: { color: "#fff" } },
  },
};

const formatFieldTooltipTitle = (text) => {
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

const E1PriFieldLabel = ({ tooltipKey, tooltips, children, style = {} }) => {
  const tooltip = tooltipKey ? tooltips[tooltipKey] || "" : "";
  const labelNode = (
    <span
      style={{
        fontSize: 13,
        fontWeight: 600,
        color: FIELD_LABEL_COLOR,
        cursor: tooltip ? "help" : undefined,
        ...style,
      }}
    >
      {children}
    </span>
  );
  if (!tooltip) return labelNode;
  return (
    <Tooltip title={formatFieldTooltipTitle(tooltip)} {...FIELD_TOOLTIP_PROPS}>
      {labelNode}
    </Tooltip>
  );
};

// ── Color palette (matches Extensions page) ───────────────────────────────────
const C = {
  pageBg: "var(--bg-main)",
  cardBg: "var(--bg-surface)",
  cardBorder: "var(--border-strong)",
  labelText: "var(--text-primary)",
  valueText: "var(--text-primary)",
  mutedText: "var(--text-muted)",
  strongText: "var(--text-primary)",
  accent: "var(--accent-brand)",
  successGreen: "#22c55e",
  errorRed: "#ef4444",
  purple: "#8b5cf6",
  amber: "#dc2626",
};

// ── Button (Account Manage style; outline kept for pagination only) ───────────
const BTN_BASE =
  "inline-flex items-center justify-center gap-[6px] h-[30px] px-[14px] py-[6px] rounded-[10px] text-[12px] font-semibold whitespace-nowrap transition-all duration-150 ease-in-out cursor-pointer border disabled:cursor-not-allowed disabled:opacity-60";
const BTN_DEFAULT = `${BTN_BASE} bg-[var(--bg-surface)] text-[var(--text-primary)] border-[var(--border-subtle)] hover:bg-[var(--row-alt)]`;
const BTN_OUTLINE = `${BTN_BASE} bg-[var(--bg-surface)] text-[var(--text-label)] border-[var(--border-strong)] hover:bg-[var(--row-alt)]`;
const BTN_CANCEL = `${BTN_BASE} bg-[#cbd5e1] text-[#374151] border-[#cbd5e1] shadow-[0_1px_2px_rgba(15,23,42,0.08)] hover:bg-[#b6c2d3]`;
const BTN_PRIMARY = `${BTN_BASE} text-white border-[#5A6F8F] bg-[linear-gradient(to_bottom,#5A6F8F_0%,#3E5475_60%,#2C3E57_100%)] hover:bg-[linear-gradient(to_bottom,#3E5475_0%,#5A6F8F_100%)]`;

const btnVariantCls = {
  default: BTN_DEFAULT,
  primary: BTN_PRIMARY,
  cancel: BTN_CANCEL,
  outline: BTN_OUTLINE,
  danger: `${BTN_BASE} bg-[#fef2f2] text-[#dc2626] border-[0.5px] border-[#fecaca] hover:bg-[#fca5a5]`,
};

const Btn = ({ children, onClick, disabled, variant = "default", className = "", style, type, title }) => (
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

const CARD_RADIUS = 20;

// ── Local modal field UI (inlined from e1PriSharedUi) ──
const OUTLINED_BORDER = "var(--border-subtle)";
const OUTLINED_HOVER = "var(--border-strong)";
const OUTLINED_FOCUS = "var(--status-primary)";

const muiTextFieldSx = {
  "& .MuiOutlinedInput-root": {
    backgroundColor: "var(--bg-surface)",
    "& fieldset": { borderColor: OUTLINED_BORDER, transition: "border-color 0.2s ease" },
    "&:hover fieldset": { borderColor: OUTLINED_HOVER },
    "&.Mui-focused fieldset": { borderColor: OUTLINED_FOCUS, borderWidth: 2 },
    "&.Mui-focused:hover fieldset": { borderColor: OUTLINED_FOCUS, borderWidth: 2 },
  },
};

const muiSelectSx = {
  fontSize: 13,
  backgroundColor: "var(--bg-surface)",
  "& .MuiOutlinedInput-root": { minHeight: 36, backgroundColor: "var(--bg-surface)" },
  "& .MuiSelect-select": {
    display: "flex",
    alignItems: "center",
    padding: "7px 32px 7px 10px !important",
    lineHeight: 1.35,
    boxSizing: "border-box",
  },
  "& .MuiOutlinedInput-notchedOutline": {
    borderColor: OUTLINED_BORDER,
    transition: "border-color 0.2s ease",
  },
  "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: OUTLINED_HOVER },
  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
    borderColor: OUTLINED_FOCUS,
    borderWidth: 2,
  },
};

const modalTextFieldSx = {
  ...muiTextFieldSx,
  "& .MuiOutlinedInput-root": {
    ...muiTextFieldSx["& .MuiOutlinedInput-root"],
    height: 32,
  },
  "& .MuiOutlinedInput-input": {
    backgroundColor: "var(--bg-surface)",
  },
};

const modalSelectSx = {
  ...muiSelectSx,
  width: "100%",
  "& .MuiOutlinedInput-root": {
    minHeight: 36,
    height: 36,
    backgroundColor: "var(--bg-surface)",
  },
};

const addHostFormPanelStyle = {
  display: "flex",
  flexDirection: "column",
  gap: 14,
  background: "var(--row-alt)",
  border: `1px solid ${C.cardBorder}`,
  borderRadius: 8,
  padding: 20,
};

const E1_PAGE = "bg-[var(--bg-main)] min-h-[calc(100vh-80px)] p-[16px]";
const E1_INNER = "w-full max-w-full mx-auto";
const E1_CARD =
  "overflow-hidden rounded-[10px] border-[1.5px] border-[var(--border-strong)] bg-[var(--bg-surface)] shadow-[0_10px_30px_rgba(15,23,42,0.06)]";
const E1_TOOLBAR =
  "flex min-h-[44px] flex-wrap items-center justify-between gap-[12px] border-b border-[var(--border-strong)] bg-[var(--bg-surface)] px-[14px] py-[7px] rounded-t-[20px]";
const E1_TOOLBAR_LEFT = "flex flex-wrap items-center gap-[8px]";
const E1_TOOLBAR_ACTIONS = "flex flex-wrap items-center gap-[8px]";
const E1_SELECTED_BADGE =
  "rounded-full border border-[#3E5475] bg-[#eff6ff] px-[12px] py-[5px] text-[11px] font-bold text-[var(--text-label)]";
const E1_PAGINATION =
  "flex items-center justify-between overflow-hidden border-t border-[var(--border-strong)] bg-[var(--bg-surface)] px-[14px] py-[7px] rounded-b-[20px]";
const E1_PAGE_BADGE =
  "rounded-[6px] border border-[var(--border-strong)] bg-[#e0f2fe] px-[14px] py-[5px] text-[11px] font-semibold text-[var(--text-label)]";
const E1_TOAST_SX = {
  position: "fixed",
  top: 20,
  right: 20,
  zIndex: 9999,
  minWidth: 300,
  boxShadow: 3,
};

const modalInputProps = {
  style: { fontSize: 13, height: 32, padding: "0 8px", boxSizing: "border-box" },
};

const e1DialogTitleStyle = {
  background: "#1e2d42",
  color: "#ffffff",
  fontWeight: 600,
  fontSize: 16,
  padding: "16px 24px",
  textAlign: "center",
  borderTopLeftRadius: 8,
  borderTopRightRadius: 8,
};

const e1DialogContentStyle = { padding: "24px", backgroundColor: "var(--bg-surface)" };

const e1DialogFormStyle = {
  display: "flex",
  flexDirection: "column",
  gap: 14,
  background: "var(--row-alt)",
  border: "1px solid var(--border-subtle)",
  borderRadius: 8,
  padding: 20,
};

const e1DialogFieldRowStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 12,
};

const e1DialogFieldLabelStyle = {
  fontSize: 13,
  color: "var(--text-primary)",
  fontWeight: 600,
  whiteSpace: "nowrap",
  width: 170,
  lineHeight: 1.2,
  textAlign: "left",
};

const e1DialogFieldControlStyle = { width: "min(100%, 320px)" };

const e1DialogActionsStyle = {
  display: "flex",
  justifyContent: "center",
  gap: 16,
  padding: "16px 24px",
  background: "var(--row-alt)",
  borderTop: "1px solid #9CA3AF",
  borderBottomLeftRadius: 8,
  borderBottomRightRadius: 8,
};

const e1DialogPaperSx = {
  width: 600,
  maxWidth: "95vw",
  mx: "auto",
  p: 0,
  borderRadius: 2,
  overflow: "hidden",
  boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)",
};

const E1Breadcrumb = ({ section, current }) => (
  <div className="mb-[16px] flex flex-wrap items-center gap-[4px] text-[12px] font-normal text-[#94a3b8]">
    <span>E1-PRI</span>
    <span>&gt;</span>
    <span>{section}</span>
    <span>&gt;</span>
    <span className="font-semibold text-[#1e293b]">{current}</span>
  </div>
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

const checkboxSx = {
  padding: "1px",
  color: "var(--text-primary)",
  "&.Mui-checked": { color: "#0284c7" },
  "&.MuiCheckbox-indeterminate": { color: "#0284c7" },
};

const tdStyle = {
  padding: "7px 14px",
  fontSize: 13,
  color: C.valueText,
  textAlign: "center",
  borderBottom: `1px solid ${C.cardBorder}`,
  borderRight: `1px solid ${C.cardBorder}`,
  whiteSpace: "nowrap",
};

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
      className="flex flex-row items-center border border-[var(--border-subtle)] rounded px-3 py-2 gap-3 w-full bg-[var(--bg-surface)] mb-2"
    >
      <label className="text-[15px] text-[var(--text-secondary)] font-medium whitespace-nowrap text-left min-w-[120px] mr-2">
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
            className="bg-[var(--bg-surface)]"
            sx={{
              maxWidth: "100%",
              minWidth: 0,
              ...modalSelectSx,
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
            className="bg-[var(--bg-surface)]"
            sx={{
              maxWidth: "100%",
              minWidth: 0,
              ...modalTextFieldSx,
            }}
            placeholder={field.placeholder || ""}
          />
        )}
      </div>
    </div>
  );

  return (
    <div className={E1_PAGE}>
      {/* Message Display */}
      {message.text && (
        <Alert
          severity={message.type}
          onClose={() => setMessage({ type: "", text: "" })}
          sx={E1_TOAST_SX}
        >
          {message.text}
        </Alert>
      )}

      <div style={{ maxWidth: "100%", margin: "0 auto" }}>
        <E1Breadcrumb section="PCM" current="Number-Receiving Rule" />

        {/* Main Card */}
        <div
          style={{
            background: "var(--bg-surface)",
            borderRadius: 10,
            overflow: "hidden",
            border: `1.5px solid ${C.cardBorder}`,
            boxShadow: "0 10px 30px rgba(15,23,42,0.06)",
          }}
        >
          {/* Toolbar */}
          <div className={E1_TOOLBAR}>
            <div className={E1_TOOLBAR_LEFT}>
              {selected.length > 0 && (
                <span className={E1_SELECTED_BADGE}>
                  {selected.length} selected
                </span>
              )}
            </div>
            {/* Right: action buttons */}
            <div className={E1_TOOLBAR_ACTIONS}>
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
          <div
            style={{
              overflowX: "auto",
              overflowY: "auto",
              flex: 1,
            }}
          >
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
            ) : rules.length === 0 ? (
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
                    color: "var(--text-primary)",
                    fontSize: 13,
                    fontWeight: 600,
                    marginBottom: 16,
                  }}
                >
                  No Number-Receiving Rules found.
                </div>
                <Btn
                  variant="cancel"
                  onClick={() => handleOpenModal()}
                  disabled={loading.save || loading.fetch}
                  style={{ padding: "8px 24px", fontSize: 12, borderRadius: 6 }}
                >
                  + Add New
                </Btn>
              </div>
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
                        sx={checkboxSx}
                      />
                    </TH>
                    {NUM_RECEIVING_RULE_TABLE_COLUMNS.filter(
                      (c) => c.key !== "check",
                    ).map((c) => (
                      <TH
                        key={c.key}
                        style={{
                          position: "sticky",
                          top: 0,
                          zIndex: 10,
                          ...(c.key === "modify"
                            ? { width: 70, borderRight: "none" }
                            : {}),
                        }}
                      >
                        {c.label}
                      </TH>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {pagedRules.map((item, idx) => {
                      const realIdx = (page - 1) * itemsPerPage + idx;
                      const globalIndex = realIdx + 1;
                      const isRowChecked = selected.includes(realIdx);
                      const isLastRow = idx === pagedRules.length - 1;
                      const rowBg = isRowChecked
                        ? "#f0f9ff"
                        : idx % 2 === 1
                          ? "#f8fafc"
                          : "#ffffff";
                      const lastRowCellStyle = isLastRow
                        ? { borderBottom: "none" }
                        : {};
                      return (
                        <tr
                          key={item.id || realIdx}
                          style={{
                            background: rowBg,
                            transition: "background 0.15s ease",
                          }}
                          onMouseEnter={(e) => {
                            if (!isRowChecked)
                              e.currentTarget.style.background = "var(--row-alt)";
                          }}
                          onMouseLeave={(e) => {
                            if (!isRowChecked)
                              e.currentTarget.style.background = rowBg;
                          }}
                        >
                          <td
                            style={{
                              ...tdStyle,
                              background: rowBg,
                              borderLeft: "none",
                              width: 36,
                              ...lastRowCellStyle,
                              ...(isLastRow
                                ? { borderBottomLeftRadius: CARD_RADIUS }
                                : {}),
                            }}
                          >
                            <Checkbox
                              size="small"
                              checked={isRowChecked}
                              onChange={() => handleSelectRow(realIdx)}
                              disabled={loading.delete}
                              sx={checkboxSx}
                            />
                          </td>
                          {NUM_RECEIVING_RULE_TABLE_COLUMNS.filter(
                            (col) => col.key !== "check",
                          ).map((col) => {
                            if (col.key === "index") {
                              return (
                                <td
                                  key={col.key}
                                  style={{
                                    ...tdStyle,
                                    background: rowBg,
                                    ...lastRowCellStyle,
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
                                    ...tdStyle,
                                    background: rowBg,
                                    borderRight: "none",
                                    ...lastRowCellStyle,
                                    ...(isLastRow
                                      ? { borderBottomRightRadius: CARD_RADIUS }
                                      : {}),
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
                                      onClick={() => {
                                        if (!loading.delete) {
                                          handleOpenModal(item, realIdx);
                                        }
                                      }}
                                      style={{
                                        cursor: loading.delete
                                          ? "not-allowed"
                                          : "pointer",
                                        color: "#2563eb",
                                        fontSize: 22,
                                        opacity: loading.delete ? 0.4 : 0.7,
                                        transition: "opacity 0.15s ease",
                                        pointerEvents: loading.delete
                                          ? "none"
                                          : "auto",
                                      }}
                                      onMouseEnter={(e) => {
                                        if (!loading.delete)
                                          e.currentTarget.style.opacity = "1";
                                      }}
                                      onMouseLeave={(e) => {
                                        if (!loading.delete)
                                          e.currentTarget.style.opacity = "0.7";
                                      }}
                                    />
                                  </div>
                                </td>
                              );
                            }
                            return (
                              <td
                                key={col.key}
                                style={{
                                  ...tdStyle,
                                  background: rowBg,
                                  ...lastRowCellStyle,
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
                    })}
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
                padding: "7px 14px",
                borderTop: `1px solid ${C.cardBorder}`,
                background: "var(--bg-surface)",
                borderBottomLeftRadius: CARD_RADIUS,
                borderBottomRightRadius: CARD_RADIUS,
                overflow: "hidden",
              }}
            >
              <span style={{ fontSize: 11, color: C.mutedText }}>
                Showing {pagedRules.length} record
                {pagedRules.length !== 1 ? "s" : ""} on page {page}
              </span>
              <div style={{ display: "flex", gap: 8 }}>
                <Btn
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page <= 1}
                  variant="outline"
                >
                  ← Prev
                </Btn>
                <span className={E1_PAGE_BADGE}>
                  Page {page} of {totalPages}
                </span>
                <Btn
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page >= totalPages}
                  variant="outline"
                >
                  Next →
                </Btn>
              </div>
            </div>
          )}
        </div>

        {/* Rule note */}
        {rules.length > 0 && (
          <div
            style={{
              fontSize: 11,
              color: C.amber,
              marginTop: 12,
              textAlign: "center",
            }}
          >
            Rule: "x"(lowercase) indicates a random number, "*" indicates
            multiple random characters.
          </div>
        )}
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
        <DialogContent style={{ padding: "24px", backgroundColor: "var(--bg-surface)" }}>
          <div style={addHostFormPanelStyle}>
            {NUM_RECEIVING_RULE_FIELDS.map((field) => (
              <div
                key={field.name}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 12,
                }}
              >
                <E1PriFieldLabel
                  tooltipKey={field.name}
                  tooltips={NUM_RECEIVING_RULE_FIELD_TOOLTIPS}
                  style={{
                    fontSize: 13,
                    whiteSpace: "nowrap",
                    width: 170,
                    textAlign: "left",
                    display: "inline-block",
                  }}
                >
                  {field.label}:
                </E1PriFieldLabel>
                <div style={{ width: "min(100%, 320px)" }}>
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
                      sx={modalSelectSx}
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
                      sx={{ fontSize: 13, ...modalTextFieldSx }}
                      inputProps={{
                        style: {
                          fontSize: 13,
                          height: 32,
                          padding: "0 8px",
                          boxSizing: "border-box",
                        },
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
            background: "var(--row-alt)",
            borderTop: `1px solid ${C.cardBorder}`,
            borderBottomLeftRadius: 8,
            borderBottomRightRadius: 8,
          }}
        >
          <Btn
            variant="primary"
            onClick={handleSave}
            disabled={loading.save}
            style={{ minWidth: 100, height: 33, fontSize: 13, padding: "6px 28px", textTransform: "none" }}
          >
            {loading.save ? "Saving..." : "Save"}
          </Btn>
          <Btn
            variant="cancel"
            onClick={handleCloseModal}
            disabled={loading.save}
            style={{ minWidth: 100, height: 33 }}
          >
            Cancel
          </Btn>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default PcmNumReceivingRulePage;
