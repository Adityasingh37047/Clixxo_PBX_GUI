import React, { useState, useRef, useEffect } from "react";
import {
  PCM_NUM_RECEIVING_RULE_FIELDS,
  PCM_NUM_RECEIVING_RULE_INITIAL_FORM,
  PCM_NUM_RECEIVING_RULE_TABLE_COLUMNS,
  PCM_NUM_RECEIVING_RULE_FIELD_TOOLTIPS,
  PCM_NUM_RECEIVING_RULE_PAGE_BREADCRUMB_ROOT,
  PCM_NUM_RECEIVING_RULE_PAGE_BREADCRUMB_SECTION,
  PCM_NUM_RECEIVING_RULE_PAGE_TITLE,
  PCM_NUM_RECEIVING_RULE_EMPTY_MESSAGE,
  PCM_NUM_RECEIVING_RULE_MODAL_TITLE_ADD,
  PCM_NUM_RECEIVING_RULE_MODAL_TITLE_EDIT,
  PCM_NUM_RECEIVING_RULE_ADD_NEW_LABEL,
  PCM_NUM_RECEIVING_RULE_DELETE_LABEL,
  PCM_NUM_RECEIVING_RULE_SAVE_LABEL,
  PCM_NUM_RECEIVING_RULE_CLOSE_LABEL,
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
  Alert,
  CircularProgress,
  Checkbox,
  Tooltip,
  useMediaQuery,
} from "@mui/material";
const PCM_NUM_RECEIVING_RULE_COMPACT_MQ = "(max-width: 768px)";

const PCM_NUM_RECEIVING_RULE_ADD_NEW_DIALOG_MARGIN = 24;
const PCM_NUM_RECEIVING_RULE_ADD_NEW_DIALOG_LAYOUT_OFFSET = 80;

const PCM_NUM_RECEIVING_RULE_ADD_NEW_DIALOG_SX = {
  "& .MuiDialog-container": {
    alignItems: "center",
    justifyContent: "center",
  },
};

const PCM_NUM_RECEIVING_RULE_ADD_NEW_DIALOG_PAPER_SX = {
  margin: PCM_NUM_RECEIVING_RULE_ADD_NEW_DIALOG_MARGIN,
  maxHeight: `calc(100vh - ${PCM_NUM_RECEIVING_RULE_ADD_NEW_DIALOG_LAYOUT_OFFSET}px - ${PCM_NUM_RECEIVING_RULE_ADD_NEW_DIALOG_MARGIN * 2}px)`,
  display: "flex",
  flexDirection: "column",
  width: 500,
  maxWidth: "95vw",
  p: 0,
  borderRadius: "8px",
  overflow: "hidden",
  boxShadow:
    "0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)",
};
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

const PcmNumReceivingRuleFieldLabel = ({ tooltipKey, tooltips, children, style = {} }) => {
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

const PcmNumReceivingRuleFieldRow = ({
  label,
  tooltipKey,
  tooltips,
  children,
  labelWidth = 170,
}) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: 12,
    }}
  >
    <PcmNumReceivingRuleFieldLabel
      tooltipKey={tooltipKey}
      tooltips={tooltips}
      style={{
        width: labelWidth,
        flexShrink: 0,
        textAlign: "left",
        display: "inline-block",
      }}
    >
      {label}
    </PcmNumReceivingRuleFieldLabel>
    <div style={{ flex: 1, minWidth: 0, width: "100%" }}>{children}</div>
  </div>
);

// ── Color palette (matches Extensions page) ───────────────────────────────────
const C = {
  pageBg: "#f8fafc",
  cardBg: "#ffffff",
  cardBorder: "#d8dde5",
  divider: "#e2e6ec",
  labelText: "#3E5475",
  valueText: "#0f172a",
  mutedText: "#94a3b8",
  strongText: "#0f172a",
  accent: "#3E5475",
  amber: "#dc2626",
  errorRed: "#dc2626",
  successGreen: "#16a34a",
};

const PCM_NUM_RECV_RULE_CARD_RADIUS = 4;

const pcmNumRecvRulePageWrapStyle = {
  backgroundColor: C.pageBg,
  minHeight: "calc(100vh - 80px)",
  padding: 16,
  boxSizing: "border-box",
};

const pcmNumRecvRulePageInnerStyle = {
  width: "100%",
  maxWidth: "100%",
  margin: "0 auto",
};

// ── Button (matches Extensions page) ─────────────────────────────────────────
const Btn = ({
  children,
  onClick,
  disabled,
  variant = "default",
  style: extraStyle,
  type,
  form,
  component,
  title,
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
    },
    cancel: {
      background: "#cbd5e1",
      color: "#374151",
      border: "1px solid #cbd5e1",
      boxShadow: "0 1px 2px rgba(15,23,42,0.08)",
    },
    danger: {
      background: "#fef2f2",
      color: C.amber,
      border: "0.5px solid #fecaca",
    },
    outline: {
      background: C.cardBg,
      color: C.labelText,
      border: `1px solid ${C.cardBorder}`,
    },
  };
  const s = styles[variant] || styles.default;
  const hoverBg =
    {
      primary: "linear-gradient(to bottom, #3E5475 0%, #5A6F8F 100%)",
      cancel: "#b6c2d3",
      danger: "#fca5a5",
      outline: "#e2e8f0",
      default: "#e2e8f0",
    }[variant] || "#e2e8f0";
  const activeBg =
    {
      primary: "linear-gradient(to bottom, #2C3E57 0%, #3E5475 100%)",
      cancel: "#a3b1c2",
      danger: "#f87171",
      outline: "#d1d9e6",
      default: "#d1d5db",
    }[variant] || "#d1d5db";
  const baseBg = extraStyle?.background ?? s.background;
  const baseShadow = extraStyle?.boxShadow ?? s.boxShadow ?? "none";

  const clearPressStyle = (el) => {
    el.style.transform = "";
    el.style.boxShadow = baseShadow;
  };

  const applyPressStyle = (el) => {
    el.style.background = activeBg;
    el.style.transform = "translateY(1px) scale(0.98)";
    el.style.boxShadow =
      variant === "primary"
        ? "inset 0 2px 4px rgba(0, 0, 0, 0.25)"
        : variant === "cancel"
          ? "inset 0 2px 4px rgba(15, 23, 42, 0.15)"
          : "inset 0 1px 3px rgba(15, 23, 42, 0.12)";
  };

  const Component = component || "button";
  return (
    <Component
      type={type}
      form={form}
      title={title}
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
        transition:
          "background 0.15s ease, transform 0.1s ease, box-shadow 0.1s ease",
        height: 30,
        gap: 6,
        whiteSpace: "nowrap",
        userSelect: "none",
        ...s,
        ...extraStyle,
      }}
      onMouseEnter={(e) => {
        if (disabled) return;
        e.currentTarget.style.background = hoverBg;
      }}
      onMouseLeave={(e) => {
        if (disabled) return;
        e.currentTarget.style.background = baseBg;
        clearPressStyle(e.currentTarget);
      }}
      onMouseDown={(e) => {
        if (disabled) return;
        applyPressStyle(e.currentTarget);
      }}
      onMouseUp={(e) => {
        if (disabled) return;
        e.currentTarget.style.background = hoverBg;
        clearPressStyle(e.currentTarget);
      }}
    >
      {children}
    </Component>
  );
};

const pcmNumRecvRuleCardStyle = {
  background: "#ffffff",
  borderRadius: PCM_NUM_RECV_RULE_CARD_RADIUS,
  overflow: "hidden",
  border: `1px solid ${C.cardBorder}`,
  boxShadow: "0 0 14px rgba(0, 0, 0, 0.18), 0 0 5px rgba(0, 0, 0, 0.10)",
};

const pcmNumRecvRuleToolbarStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  minHeight: 44,
  padding: "7px 14px",
  borderBottom: `1px solid ${C.divider}`,
  background: "#ffffff",
  flexWrap: "wrap",
  gap: 12,
  borderTopLeftRadius: PCM_NUM_RECV_RULE_CARD_RADIUS,
  borderTopRightRadius: PCM_NUM_RECV_RULE_CARD_RADIUS,
};

const pcmNumRecvRulePaginationStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "7px 14px",
  background: "#ffffff",
  borderTop: `1px solid ${C.divider}`,
  borderBottomLeftRadius: PCM_NUM_RECV_RULE_CARD_RADIUS,
  borderBottomRightRadius: PCM_NUM_RECV_RULE_CARD_RADIUS,
  overflow: "hidden",
};

const pcmNumRecvRuleSelectedBadgeStyle = {
  background: "#eff6ff",
  color: C.accent,
  fontSize: 11,
  fontWeight: 700,
  padding: "5px 12px",
  borderRadius: 999,
  border: `1px solid ${C.accent}`,
};

const pcmNumRecvRuleCancelBtnStyle = {
  height: 30,
  padding: "6px 14px",
  fontSize: 12,
  borderRadius: 4,
  background: "#cbd5e1",
  color: "#374151",
  border: "1px solid #cbd5e1",
  boxShadow: "0 1px 2px rgba(15, 23, 42, 0.08)",
};

const pcmNumRecvRulePrimaryBtnStyle = {
  height: 30,
  padding: "6px 14px",
  fontSize: 12,
  borderRadius: 4,
};

const pcmNumRecvRulePageBadgeStyle = {
  fontSize: 11,
  fontWeight: 600,
  color: C.accent,
  background: "#e0f2fe",
  padding: "5px 14px",
  borderRadius: 4,
  border: `1px solid ${C.cardBorder}`,
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
  borderBottomLeftRadius: 8,
  borderBottomRightRadius: 8,
};

const addNewModalFooterBtnStyle = {
  height: 30,
  padding: "6px 14px",
  fontSize: 12,
  borderRadius: 4,
  minWidth: 100,
};

const pcmNumRecvRuleModalCancelBtnStyle = {
  ...addNewModalFooterBtnStyle,
  background: "#cbd5e1",
  color: "#374151",
  border: "1px solid #cbd5e1",
  boxShadow: "0 1px 2px rgba(15, 23, 42, 0.08)",
  borderRadius: 4,
};

const PCM_NUM_RECV_RULE_OUTLINED_BORDER = "#d1d5db";
const PCM_NUM_RECV_RULE_OUTLINED_HOVER = "#9ca3af";
const PCM_NUM_RECV_RULE_OUTLINED_FOCUS = "#3E5475";
const PCM_NUM_RECV_RULE_FOCUS_RING_SHADOW =
  "0 0 0 2px rgba(62, 84, 117, 0.15)";

const pcmNumRecvRuleSetFieldDefault = (el) => {
  el.style.borderColor = PCM_NUM_RECV_RULE_OUTLINED_BORDER;
  el.style.borderWidth = "1px";
  el.style.boxShadow = "none";
};

const pcmNumRecvRuleSetFieldHover = (el) => {
  el.style.borderColor = PCM_NUM_RECV_RULE_OUTLINED_HOVER;
  el.style.borderWidth = "1px";
  el.style.boxShadow = "none";
};

const pcmNumRecvRuleSetFieldFocus = (el) => {
  el.style.borderColor = PCM_NUM_RECV_RULE_OUTLINED_FOCUS;
  el.style.borderWidth = "1px";
  el.style.boxShadow = PCM_NUM_RECV_RULE_FOCUS_RING_SHADOW;
};

const pcmNumRecvRuleInputInteraction = {
  onFocus: (e) => {
    if (e.target.disabled) return;
    pcmNumRecvRuleSetFieldFocus(e.target);
  },
  onBlur: (e) => {
    pcmNumRecvRuleSetFieldDefault(e.target);
  },
  onMouseEnter: (e) => {
    if (e.target.disabled) return;
    if (document.activeElement === e.target) {
      pcmNumRecvRuleSetFieldFocus(e.target);
    } else {
      pcmNumRecvRuleSetFieldHover(e.target);
    }
  },
  onMouseLeave: (e) => {
    if (document.activeElement === e.target) {
      pcmNumRecvRuleSetFieldFocus(e.target);
    } else {
      pcmNumRecvRuleSetFieldDefault(e.target);
    }
  },
};

const pcmNumRecvRuleInputStyle = {
  width: "100%",
  height: 32,
  padding: "0 10px",
  fontSize: 13,
  lineHeight: 1.35,
  border: `1px solid ${PCM_NUM_RECV_RULE_OUTLINED_BORDER}`,
  borderRadius: 4,
  outline: "none",
  backgroundColor: "#fff",
  color: C.valueText,
  boxSizing: "border-box",
  transition: "border-color 0.2s ease, box-shadow 0.2s ease",
};

const pcmNumRecvRuleSelectStyle = {
  ...pcmNumRecvRuleInputStyle,
  padding: "0 28px 0 10px",
  appearance: "auto",
  cursor: "pointer",
};

const PcmNumRecvRuleBreadcrumb = () => (
  <div
    style={{
      fontSize: 12,
      color: "#94a3b8",
      marginBottom: 16,
      fontWeight: 400,
      display: "flex",
      alignItems: "center",
      gap: 4,
      flexWrap: "wrap",
    }}
  >
    <span>{PCM_NUM_RECEIVING_RULE_PAGE_BREADCRUMB_ROOT}</span>
    <span>&gt;</span>
    <span>{PCM_NUM_RECEIVING_RULE_PAGE_BREADCRUMB_SECTION}</span>
    <span>&gt;</span>
    <span style={{ color: "#1e293b", fontWeight: 600 }}>
      {PCM_NUM_RECEIVING_RULE_PAGE_TITLE}
    </span>
  </div>
);

const TableListLoading = () => (
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
);

const TableListEmptyState = ({ message, onAddNew, buttonLabel = "+ Add New" }) => (
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
      {message}
    </div>
    <Btn
      variant="cancel"
      onClick={onAddNew}
      style={{ height: 30, padding: "6px 14px", fontSize: 12, borderRadius: 4 }}
    >
      {buttonLabel}
    </Btn>
  </div>
);

const PcmNumRecvRulePagination = ({
  page,
  totalPages,
  recordCount,
  onPageChange,
}) => (
  <div style={pcmNumRecvRulePaginationStyle}>
    <span style={{ fontSize: 11, color: C.mutedText }}>
      Showing {recordCount} record
      {recordCount !== 1 ? "s" : ""} on page {page}
    </span>
    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
      <Btn
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        variant="outline"
        style={{ borderRadius: 4 }}
      >
        ← Prev
      </Btn>
      <span style={pcmNumRecvRulePageBadgeStyle}>
        Page {page} of {totalPages}
      </span>
      <Btn
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        variant="outline"
        style={{ borderRadius: 4 }}
      >
        Next →
      </Btn>
    </div>
  </div>
);

// ── Local modal field UI (inlined from e1PriSharedUi) ──
const OUTLINED_BORDER = "rgba(0, 0, 0, 0.23)";
const OUTLINED_HOVER = "rgba(0, 0, 0, 0.87)";
const OUTLINED_FOCUS = "#1976d2";

const muiTextFieldSx = {
  "& .MuiOutlinedInput-root": {
    backgroundColor: "#fff",
    "& fieldset": {
      borderColor: OUTLINED_BORDER,
      transition: "border-color 0.2s ease",
    },
    "&:hover fieldset": {
      borderColor: OUTLINED_HOVER,
    },
    "&.Mui-focused fieldset": {
      borderColor: OUTLINED_FOCUS,
      borderWidth: 2,
    },
    "&.Mui-focused:hover fieldset": {
      borderColor: OUTLINED_FOCUS,
      borderWidth: 2,
    },
  },
};

const muiSelectSx = {
  fontSize: 13,
  backgroundColor: "#fff",
  "& .MuiOutlinedInput-root": {
    minHeight: 36,
    backgroundColor: "#fff",
  },
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
  "&:hover .MuiOutlinedInput-notchedOutline": {
    borderColor: OUTLINED_HOVER,
  },
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
    backgroundColor: "#fff",
  },
};

const modalSelectSx = {
  ...muiSelectSx,
  width: "100%",
  "& .MuiOutlinedInput-root": {
    minHeight: 36,
    height: 36,
    backgroundColor: "#fff",
  },
};

const pcmNumReceivingRuleModalFormPanelStyle = {
  display: "flex",
  flexDirection: "column",
  gap: 14,
  background: "#f8fafc",
  border: `1px solid ${C.cardBorder}`,
  borderRadius: 8,
  padding: 20,
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
      borderBottom: `1px solid ${C.divider}`,
      borderRight: `1px solid ${C.divider}`,
      whiteSpace: "nowrap",
      textTransform: "uppercase",
      letterSpacing: "0.14em",
      position: "sticky",
      top: 0,
      zIndex: 10,
      ...extra,
    }}
  >
    {children}
  </th>
);

const pcmNumRecvRuleTableCheckboxSx = {
  padding: "1px",
  color: "#3E5475",
  "&.Mui-checked": { color: "#0284c7" },
  "&.MuiCheckbox-indeterminate": { color: "#0284c7" },
};

const tdStyle = {
  padding: "7px 14px",
  fontSize: 13,
  color: C.valueText,
  textAlign: "center",
  borderBottom: `1px solid ${C.divider}`,
  borderRight: `1px solid ${C.divider}`,
  whiteSpace: "nowrap",
};

const PcmNumReceivingRulePage = () => {
  const isCompact = useMediaQuery(PCM_NUM_RECEIVING_RULE_COMPACT_MQ);
  // State
  const [rules, setRules] = useState([]);
  const [allData, setAllData] = useState([]);
  const [selected, setSelected] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(PCM_NUM_RECEIVING_RULE_INITIAL_FORM);
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
      setForm(PCM_NUM_RECEIVING_RULE_INITIAL_FORM);
      setEditIndex(null);
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setForm(PCM_NUM_RECEIVING_RULE_INITIAL_FORM);
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

  return (
    <div
      style={{
        ...pcmNumRecvRulePageWrapStyle,
        ...(isCompact ? { padding: 8 } : {}),
      }}
    >
      <div style={pcmNumRecvRulePageInnerStyle}>
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

        <PcmNumRecvRuleBreadcrumb />

        <div style={pcmNumRecvRuleCardStyle}>
          <div
            style={{
              ...pcmNumRecvRuleToolbarStyle,
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
                flex: 1,
                minWidth: 0,
              }}
            >
              {selected.length > 0 && (
                <span style={pcmNumRecvRuleSelectedBadgeStyle}>
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
                variant="cancel"
                onClick={handleInverse}
                disabled={loading.delete || loading.fetch || rules.length === 0}
                style={pcmNumRecvRuleCancelBtnStyle}
              >
                Inverse
              </Btn>
              <Btn
                variant="cancel"
                onClick={handleDelete}
                disabled={
                  loading.delete || loading.fetch || selected.length === 0
                }
                style={pcmNumRecvRuleCancelBtnStyle}
              >
                {loading.delete ? (
                  <CircularProgress size={11} style={{ color: "#374151" }} />
                ) : null}
                <DeleteOutlineOutlinedIcon sx={{ fontSize: 16 }} />
                {PCM_NUM_RECEIVING_RULE_DELETE_LABEL}
              </Btn>
              <Btn
                variant="cancel"
                onClick={handleClearAll}
                disabled={loading.delete || loading.fetch || rules.length === 0}
                style={pcmNumRecvRuleCancelBtnStyle}
              >
                {loading.delete ? (
                  <CircularProgress size={11} style={{ color: "#374151" }} />
                ) : (
                  "Clear All"
                )}
              </Btn>
              <Btn
                variant="primary"
                onClick={() => handleOpenModal()}
                disabled={loading.save || loading.fetch}
                style={pcmNumRecvRulePrimaryBtnStyle}
              >
                {PCM_NUM_RECEIVING_RULE_ADD_NEW_LABEL}
              </Btn>
            </div>
          </div>

          {loading.fetch ? (
            <TableListLoading />
          ) : rules.length === 0 ? (
            <TableListEmptyState
              message={PCM_NUM_RECEIVING_RULE_EMPTY_MESSAGE}
              onAddNew={() => handleOpenModal()}
            />
          ) : (
            <>
              <div style={{ overflowX: "auto", overflowY: "auto", flex: 1 }}>
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "separate",
                    borderSpacing: 0,
                    tableLayout: "auto",
                    minWidth: 900,
                    ...(isCompact ? { minWidth: 720 } : {}),
                  }}
                >
                  <thead>
                    <tr>
                      <TH style={{ width: 40, padding: 0, borderLeft: "none" }}>
                        <Checkbox
                          size="small"
                          checked={
                            pagedRules.length > 0 &&
                            pagedRules.every((_, idx) =>
                              selected.includes(
                                (page - 1) * itemsPerPage + idx,
                              ),
                            )
                          }
                          indeterminate={
                            pagedRules.some((_, idx) =>
                              selected.includes(
                                (page - 1) * itemsPerPage + idx,
                              ),
                            ) &&
                            !pagedRules.every((_, idx) =>
                              selected.includes(
                                (page - 1) * itemsPerPage + idx,
                              ),
                            )
                          }
                          onChange={() => {
                            const allSelected = pagedRules.every((_, idx) =>
                              selected.includes(
                                (page - 1) * itemsPerPage + idx,
                              ),
                            );
                            if (allSelected) handleUncheckAllRows();
                            else handleCheckAllRows();
                          }}
                          sx={pcmNumRecvRuleTableCheckboxSx}
                        />
                      </TH>
                      {PCM_NUM_RECEIVING_RULE_TABLE_COLUMNS.filter(
                        (c) => c.key !== "check",
                      ).map((c) => (
                        <TH
                          key={c.key}
                          style={
                            c.key === "modify"
                              ? { width: 70, borderRight: "none" }
                              : undefined
                          }
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
                        ? "#eff6ff"
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
                              e.currentTarget.style.background = "#f8fafc";
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
                            }}
                          >
                            <Checkbox
                              size="small"
                              checked={isRowChecked}
                              onChange={() => handleSelectRow(realIdx)}
                              disabled={loading.delete}
                              sx={pcmNumRecvRuleTableCheckboxSx}
                            />
                          </td>
                          {PCM_NUM_RECEIVING_RULE_TABLE_COLUMNS.filter(
                            (col) => col.key !== "check",
                          ).map((col) => {
                            if (col.key === "index") {
                              return (
                                <td
                                  key={col.key}
                                  style={{
                                    ...tdStyle,
                                    background: rowBg,
                                    fontWeight: 400,
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
                                  fontWeight: 400,
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
              </div>

              <PcmNumRecvRulePagination
                page={page}
                totalPages={totalPages}
                recordCount={pagedRules.length}
                onPageChange={handlePageChange}
              />
            </>
          )}
        </div>

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

      <Dialog
        open={showModal}
        onClose={() => {
          if (loading.save) return;
          handleCloseModal();
        }}
        maxWidth={false}
        sx={PCM_NUM_RECEIVING_RULE_ADD_NEW_DIALOG_SX}
        PaperProps={{
          sx: PCM_NUM_RECEIVING_RULE_ADD_NEW_DIALOG_PAPER_SX,
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
            padding: "16px 24px",
            textAlign: "center",
            borderTopLeftRadius: 8,
            borderTopRightRadius: 8,
            flexShrink: 0,
          }}
        >
          {editIndex !== null
            ? PCM_NUM_RECEIVING_RULE_MODAL_TITLE_EDIT
            : PCM_NUM_RECEIVING_RULE_MODAL_TITLE_ADD}
        </DialogTitle>
        <DialogContent
          style={{
            padding: "24px",
            backgroundColor: "#ffffff",
            overflowY: "auto",
            flex: "1 1 auto",
          }}
        >
          <div style={pcmNumReceivingRuleModalFormPanelStyle}>
            {PCM_NUM_RECEIVING_RULE_FIELDS.map((field) => (
              <PcmNumReceivingRuleFieldRow
                key={field.name}
                label={`${field.label}:`}
                tooltipKey={field.name}
                tooltips={PCM_NUM_RECEIVING_RULE_FIELD_TOOLTIPS}
              >
                {field.type === "select" ? (
                  <select
                    name={field.name}
                    value={form[field.name]}
                    onChange={(e) =>
                      handleInputChange(field.name, e.target.value)
                    }
                    style={pcmNumRecvRuleSelectStyle}
                    {...pcmNumRecvRuleInputInteraction}
                  >
                    {field.options.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={field.type || "text"}
                    name={field.name}
                    value={form[field.name] || ""}
                    onChange={(e) =>
                      handleInputChange(field.name, e.target.value)
                    }
                    placeholder={field.placeholder || ""}
                    style={pcmNumRecvRuleInputStyle}
                    {...pcmNumRecvRuleInputInteraction}
                  />
                )}
              </PcmNumReceivingRuleFieldRow>
            ))}
          </div>
        </DialogContent>
        <DialogActions sx={{ p: 0, m: 0 }} style={addNewModalFooterStyle}>
          <Btn
            variant="primary"
            onClick={handleSave}
            disabled={loading.save}
            style={addNewModalFooterBtnStyle}
          >
            {loading.save ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              PCM_NUM_RECEIVING_RULE_SAVE_LABEL
            )}
          </Btn>
          <Btn
            variant="cancel"
            onClick={handleCloseModal}
            disabled={loading.save}
            style={pcmNumRecvRuleModalCancelBtnStyle}
          >
            {PCM_NUM_RECEIVING_RULE_CLOSE_LABEL}
          </Btn>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default PcmNumReceivingRulePage;
