import React, { useState, useEffect } from "react";
import {
  NUMBER_FILTER_RULE_COLUMNS,
  NUMBER_FILTER_RULE_DROPDOWN_OPTIONS,
  NUMBER_FILTER_RULE_FIELD_TOOLTIPS,
  NUMBER_FILTER_RULE_PAGE_BREADCRUMB_ROOT,
  NUMBER_FILTER_RULE_PAGE_BREADCRUMB_SECTION,
  NUMBER_FILTER_RULE_PAGE_TITLE,
  NUMBER_FILTER_RULE_EMPTY_MESSAGE,
  NUMBER_FILTER_RULE_MODAL_TITLE_ADD,
  NUMBER_FILTER_RULE_MODAL_TITLE_EDIT,
  NUMBER_FILTER_RULE_ADD_NEW_LABEL,
  NUMBER_FILTER_RULE_ADD_NEW_EMPTY_LABEL,
  NUMBER_FILTER_RULE_DELETE_LABEL,
  NUMBER_FILTER_RULE_CLEAR_ALL_LABEL,
  NUMBER_FILTER_RULE_SAVE_LABEL,
  NUMBER_FILTER_RULE_CLOSE_LABEL,
} from "../../../constants/NumberFilterRuleConstants";
import {
  listFinalNumberFilter,
  createFinalNumberFilter,
  deleteFinalNumberFilter,
  fetchAllNumberFilters,
  listNumberPool,
} from "../../../api/apiService";
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
// Modify column disabled — uncomment when enabling modify column:
// import EditDocumentIcon from "@mui/icons-material/EditDocument";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
const NUMBER_FILTER_FILTERING_RULE_ADD_NEW_DIALOG_LAYOUT_OFFSET = 80;

const NUMBER_FILTER_FILTERING_RULE_ADD_NEW_DIALOG_SX = {
  "& .MuiDialog-container": {
    alignItems: "flex-start",
    justifyContent: "center",
    pt: 8,
  },
};

const NUMBER_FILTER_FILTERING_RULE_ADD_NEW_DIALOG_PAPER_SX = {
  mx: "auto",
  my: 0,
  maxHeight: `calc(100vh - ${NUMBER_FILTER_FILTERING_RULE_ADD_NEW_DIALOG_LAYOUT_OFFSET}px - 48px)`,
  display: "flex",
  flexDirection: "column",
  width: 600,
  maxWidth: "95vw",
  p: 0,
  borderRadius: "8px",
  overflow: "hidden",
  boxShadow:
    "0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)",
};


const FILTERING_RULE_COMPACT_MQ = "(max-width: 768px)";

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

const E1PriFieldRow = ({
  label,
  tooltipKey,
  tooltips,
  children,
  labelWidth = 240,
}) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 12,
    }}
  >
    <E1PriFieldLabel
      tooltipKey={tooltipKey}
      tooltips={tooltips}
      style={{
        fontSize: 13,
        fontWeight: 600,
        width: labelWidth,
        flexShrink: 0,
        whiteSpace: "nowrap",
        lineHeight: 1.2,
        textAlign: "left",
        display: "inline-block",
      }}
    >
      {label}
    </E1PriFieldLabel>
    <div style={{ width: "min(100%, 280px)" }}>{children}</div>
  </div>
);

// ── Color palette (matches Extensions) ───────────────────────────────────────
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

const FILTERING_RULE_CARD_RADIUS = 10;

const filteringRulePageWrapStyle = {
  backgroundColor: C.pageBg,
  minHeight: "calc(100vh - 80px)",
  padding: 16,
  boxSizing: "border-box",
};

const filteringRulePageInnerStyle = {
  width: "100%",
  maxWidth: "100%",
  margin: "0 auto",
};

// ── Native modal field UI ──
const OUTLINED_BORDER = "#d1d5db";
const OUTLINED_HOVER = "#9ca3af";
const OUTLINED_FOCUS = "#3E5475";
const FOCUS_RING_SHADOW = "0 0 0 2px rgba(62, 84, 117, 0.15)";

const setFieldDefault = (el) => {
  el.style.borderColor = OUTLINED_BORDER;
  el.style.borderWidth = "1px";
  el.style.boxShadow = "none";
};

const setFieldHover = (el) => {
  el.style.borderColor = OUTLINED_HOVER;
  el.style.borderWidth = "1px";
  el.style.boxShadow = "none";
};

const setFieldFocus = (el) => {
  el.style.borderColor = OUTLINED_FOCUS;
  el.style.borderWidth = "1px";
  el.style.boxShadow = FOCUS_RING_SHADOW;
};

const inputInteraction = {
  onFocus: (e) => {
    if (e.target.disabled) return;
    setFieldFocus(e.target);
  },
  onBlur: (e) => {
    setFieldDefault(e.target);
  },
  onMouseEnter: (e) => {
    if (e.target.disabled) return;
    if (document.activeElement === e.target) {
      setFieldFocus(e.target);
    } else {
      setFieldHover(e.target);
    }
  },
  onMouseLeave: (e) => {
    if (document.activeElement === e.target) {
      setFieldFocus(e.target);
    } else {
      setFieldDefault(e.target);
    }
  },
};

const inputStyle = {
  width: "100%",
  height: 32,
  padding: "0 10px",
  fontSize: 13,
  lineHeight: 1.35,
  border: `1px solid ${OUTLINED_BORDER}`,
  borderRadius: 4,
  outline: "none",
  backgroundColor: "#fff",
  color: C.valueText,
  boxSizing: "border-box",
  transition: "border-color 0.2s ease, box-shadow 0.2s ease",
};

const selectStyle = {
  ...inputStyle,
  padding: "0 28px 0 10px",
  appearance: "auto",
  cursor: "pointer",
};

const disabledInputStyle = {
  ...inputStyle,
  backgroundColor: "#f1f5f9",
  color: "#64748b",
  cursor: "not-allowed",
};

const addHostFormPanelStyle = {
  display: "flex",
  flexDirection: "column",
  gap: 14,
  background: "#f8fafc",
  border: `1px solid ${C.cardBorder}`,
  borderRadius: 8,
  padding: 20,
};

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

const filteringRuleCardStyle = {
  background: "#ffffff",
  borderRadius: FILTERING_RULE_CARD_RADIUS,
  overflow: "hidden",
  border: `1px solid ${C.cardBorder}`,
  boxShadow: "0 0 14px rgba(0, 0, 0, 0.18), 0 0 5px rgba(0, 0, 0, 0.10)",
};

const filteringRuleToolbarStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  minHeight: 44,
  padding: "7px 14px",
  borderBottom: `1px solid ${C.divider}`,
  background: "#ffffff",
  flexWrap: "wrap",
  gap: 12,
  borderTopLeftRadius: FILTERING_RULE_CARD_RADIUS,
  borderTopRightRadius: FILTERING_RULE_CARD_RADIUS,
};

const filteringRuleFooterStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "7px 14px",
  background: "#ffffff",
  borderTop: `1px solid ${C.divider}`,
  borderBottomLeftRadius: FILTERING_RULE_CARD_RADIUS,
  borderBottomRightRadius: FILTERING_RULE_CARD_RADIUS,
  overflow: "hidden",
};

const filteringRuleSelectedBadgeStyle = {
  background: "#eff6ff",
  color: C.accent,
  fontSize: 11,
  fontWeight: 700,
  padding: "5px 12px",
  borderRadius: 999,
  border: `1px solid ${C.accent}`,
};

const filteringRuleCancelBtnStyle = {
  height: 30,
  padding: "6px 14px",
  fontSize: 12,
  borderRadius: 10,
  background: "#cbd5e1",
  color: "#374151",
  border: "1px solid #cbd5e1",
  boxShadow: "0 1px 2px rgba(15, 23, 42, 0.08)",
};

const filteringRulePrimaryBtnStyle = {
  height: 30,
  padding: "6px 14px",
  fontSize: 12,
  borderRadius: 10,
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
  borderRadius: 10,
  minWidth: 100,
};

const filteringRuleModalCancelBtnStyle = {
  ...addNewModalFooterBtnStyle,
  background: "#cbd5e1",
  color: "#374151",
  border: "1px solid #cbd5e1",
  boxShadow: "0 1px 2px rgba(15, 23, 42, 0.08)",
};

const FilteringRuleBreadcrumb = () => (
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
    <span>{NUMBER_FILTER_RULE_PAGE_BREADCRUMB_ROOT}</span>
    <span>&gt;</span>
    <span>{NUMBER_FILTER_RULE_PAGE_BREADCRUMB_SECTION}</span>
    <span>&gt;</span>
    <span style={{ color: "#1e293b", fontWeight: 600 }}>
      {NUMBER_FILTER_RULE_PAGE_TITLE}
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

const TableListEmptyState = ({
  message,
  onAddNew,
  buttonLabel = NUMBER_FILTER_RULE_ADD_NEW_EMPTY_LABEL,
  showButton = true,
}) => (
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
        marginBottom: showButton && onAddNew ? 16 : 0,
      }}
    >
      {message}
    </div>
    {showButton && onAddNew ? (
      <Btn
        variant="cancel"
        onClick={onAddNew}
        style={{ height: 30, padding: "6px 14px", fontSize: 12, borderRadius: 10 }}
      >
        {buttonLabel}
      </Btn>
    ) : null}
  </div>
);

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

const tdStyle = {
  padding: "7px 14px",
  fontSize: 13,
  color: C.valueText,
  textAlign: "center",
  borderBottom: `1px solid ${C.divider}`,
  borderRight: `1px solid ${C.divider}`,
  whiteSpace: "nowrap",
};

const filteringRuleTableCheckboxSx = {
  padding: "1px",
  color: "#3E5475",
  "&.Mui-checked": { color: "#0284c7" },
  "&.MuiCheckbox-indeterminate": { color: "#0284c7" },
};
const initialForm = {
  id: 0,
  callerIdWhitelist: "none",
  calleeIdWhitelist: "none",
  callerIdBlacklist: "none",
  calleeIdBlacklist: "none",
  callerIdPoolWhitelist: "none",
  callerIdPoolBlacklist: "none",
  calleeIdPoolWhitelist: "none",
  calleeIdPoolBlacklist: "none",
  originalCallerIdPoolWhitelist: "none",
  originalCallerIdPoolBlacklist: "none",
};

const FilteringRule = () => {
  const isCompact = useMediaQuery(FILTERING_RULE_COMPACT_MQ);
  const [rows, setRows] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [groupOptions, setGroupOptions] = useState({
    wlCaller: ["none"],
    wlCallee: ["none"],
    blCaller: ["none"],
    blCallee: ["none"],
    poolGroups: ["none"],
  });
  const [toast, setToast] = useState({ msg: "", type: "success" });
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  const displayToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "success" }), 3500);
  };

  const alert = (msg) => {
    const isErr =
      /error|failed|required|please/i.test(msg) && !/successfully/i.test(msg);
    displayToast(msg, isErr ? "error" : "success");
  };

  const openModal = (rowIdx = null) => {
    setEditIndex(rowIdx);
    if (rowIdx !== null) {
      setForm(rows[rowIdx]);
    } else {
      setForm(initialForm);
    }
    setModalOpen(true);
  };

  const loadGroupOptions = async () => {
    try {
      const [filtersRes, poolRes] = await Promise.all([
        fetchAllNumberFilters().catch(() => ({ success: false, data: [] })),
        listNumberPool().catch(() => ({})),
      ]);

      const data = filtersRes && filtersRes.data ? filtersRes.data : [];
      const unique = (arr) =>
        Array.from(new Set(arr)).sort((a, b) => Number(a) - Number(b));
      const wlCaller = unique(
        data
          .filter(
            (i) =>
              i.type === "whitelist" &&
              i.caller_id !== null &&
              i.group !== undefined,
          )
          .map((i) => String(i.group)),
      );
      const wlCallee = unique(
        data
          .filter(
            (i) =>
              i.type === "whitelist" &&
              i.callee_id !== null &&
              i.group !== undefined,
          )
          .map((i) => String(i.group)),
      );
      const blCaller = unique(
        data
          .filter(
            (i) =>
              i.type === "blacklist" &&
              i.caller_id !== null &&
              i.group !== undefined,
          )
          .map((i) => String(i.group)),
      );
      const blCallee = unique(
        data
          .filter(
            (i) =>
              i.type === "blacklist" &&
              i.callee_id !== null &&
              i.group !== undefined,
          )
          .map((i) => String(i.group)),
      );

      const poolArray = poolRes?.data || poolRes?.message || [];
      const poolGroups = unique(
        Array.isArray(poolArray)
          ? poolArray
              .map((e) => e?.group ?? e?.group_no ?? e?.groupNo)
              .filter((v) => v !== undefined)
              .map(String)
          : [],
      );

      setGroupOptions({
        wlCaller: wlCaller.length ? wlCaller : ["none"],
        wlCallee: wlCallee.length ? wlCallee : ["none"],
        blCaller: blCaller.length ? blCaller : ["none"],
        blCallee: blCallee.length ? blCallee : ["none"],
        poolGroups: poolGroups.length ? poolGroups : ["none"],
      });
    } catch (e) {
      setGroupOptions({
        wlCaller: ["none"],
        wlCallee: ["none"],
        blCaller: ["none"],
        blCallee: ["none"],
        poolGroups: ["none"],
      });
    }
  };

  useEffect(() => {
    loadGroupOptions();
  }, []);

  const closeModal = () => {
    setModalOpen(false);
    setEditIndex(null);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    const payload = {
      caller_id_white_list: String(form.callerIdWhitelist),
      callee_id_white_list: String(form.calleeIdWhitelist),
      caller_id_black_list: String(form.callerIdBlacklist),
      callee_id_black_list: String(form.calleeIdBlacklist),
      caller_id_pool_in_white_list: String(form.callerIdPoolWhitelist),
      callee_id_pool_in_white_list: String(form.calleeIdPoolWhitelist),
      caller_id_pool_in_black_list: String(form.callerIdPoolBlacklist),
      callee_id_pool_in_black_list: String(form.calleeIdPoolBlacklist),
      original_caller_id_pool_in_white_list: String(
        form.originalCallerIdPoolWhitelist,
      ),
      original_caller_id_pool_in_black_list: String(
        form.originalCallerIdPoolBlacklist,
      ),
    };
    try {
      setIsLoading(true);
      await createFinalNumberFilter(payload);
      await loadRows();
      displayToast("Filtering rule saved successfully.", "success");
      closeModal();
    } catch (e) {
      console.error("Failed to save filtering rule", e);
      displayToast("Failed to save filtering rule.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheck = (idx) => {
    setRows((prev) =>
      prev.map((row, i) =>
        i === idx ? { ...row, checked: !row.checked } : row,
      ),
    );
  };

  const allRowsChecked = rows.length > 0 && rows.every((r) => r.checked);
  const someRowsChecked = rows.some((r) => r.checked) && !allRowsChecked;

  const handleCheckAll = () => {
    const selectAll = !allRowsChecked;
    setRows((prev) => prev.map((row) => ({ ...row, checked: selectAll })));
  };

  const handleDelete = async () => {
    const toDelete = rows.filter((r) => r.checked).map((r) => r.id);
    if (toDelete.length === 0) return;
    const confirmed = window.confirm(
      `Are you sure you want to delete ${toDelete.length} selected item(s)?`,
    );
    if (!confirmed) return;
    setIsDeleting(true);
    try {
      for (const id of toDelete) {
        await deleteFinalNumberFilter(id);
      }
      await loadRows();
      displayToast(
        `Deleted ${toDelete.length} item(s) successfully.`,
        "success",
      );
    } catch (e) {
      console.error("Delete filtering rule failed", e);
      displayToast("Delete failed. Please try again.", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleClearAll = async () => {
    if (rows.length === 0) return;
    const confirmed = window.confirm(
      `Are you sure you want to delete ALL ${rows.length} item(s)?`,
    );
    if (!confirmed) return;
    setIsDeleting(true);
    try {
      const ids = rows.map((r) => r.id).filter(Boolean);
      for (const id of ids) {
        await deleteFinalNumberFilter(id);
      }
      await loadRows();
      displayToast(
        `Cleared all ${ids.length} item(s) successfully.`,
        "success",
      );
    } catch (e) {
      console.error("Clear all filtering rules failed", e);
      displayToast("Clear all failed.", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  const loadRows = async () => {
    try {
      const res = await listFinalNumberFilter();
      if (res?.response && Array.isArray(res.message)) {
        const mapped = res.message.map((item) => ({
          id: item.id,
          callerIdWhitelist: item.caller_id_white_list,
          calleeIdWhitelist: item.callee_id_white_list,
          callerIdBlacklist: item.caller_id_black_list,
          calleeIdBlacklist: item.callee_id_black_list,
          callerIdPoolWhitelist: item.caller_id_pool_in_white_list,
          callerIdPoolBlacklist: item.caller_id_pool_in_black_list,
          calleeIdPoolWhitelist: item.callee_id_pool_in_white_list,
          calleeIdPoolBlacklist: item.callee_id_pool_in_black_list,
          originalCallerIdPoolWhitelist:
            item.original_caller_id_pool_in_white_list,
          originalCallerIdPoolBlacklist:
            item.original_caller_id_pool_in_black_list,
        }));
        setRows(mapped);
      } else {
        setRows([]);
      }
    } catch (e) {
      console.error("Failed to load filtering rules", e);
      setRows([]);
    } finally {
      setIsInitialLoad(false);
    }
  };

  useEffect(() => {
    loadRows();
  }, []);

  return (
    <div
      style={{
        ...filteringRulePageWrapStyle,
        ...(isCompact ? { padding: 8 } : {}),
      }}
    >
      <div style={filteringRulePageInnerStyle}>
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
              boxShadow: 3,
            }}
          >
            {toast.msg}
          </Alert>
        )}

        <FilteringRuleBreadcrumb />

        <div style={filteringRuleCardStyle}>
          <div
            style={{
              ...filteringRuleToolbarStyle,
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
              {rows.some((r) => r.checked) && (
                <span style={filteringRuleSelectedBadgeStyle}>
                  {rows.filter((r) => r.checked).length} selected
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
                onClick={handleDelete}
                disabled={
                  isInitialLoad ||
                  !rows.some((r) => r.checked) ||
                  isDeleting
                }
                style={filteringRuleCancelBtnStyle}
              >
                {isDeleting ? (
                  <CircularProgress size={11} style={{ color: "#374151" }} />
                ) : null}
                <DeleteOutlineOutlinedIcon sx={{ fontSize: 16 }} />
                {NUMBER_FILTER_RULE_DELETE_LABEL}
              </Btn>
              <Btn
                variant="cancel"
                onClick={handleClearAll}
                disabled={isInitialLoad || rows.length === 0 || isDeleting}
                style={filteringRuleCancelBtnStyle}
              >
                {NUMBER_FILTER_RULE_CLEAR_ALL_LABEL}
              </Btn>
              <Btn
                variant="primary"
                onClick={() => openModal()}
                disabled={isInitialLoad || isDeleting || isLoading}
                style={filteringRulePrimaryBtnStyle}
              >
                {NUMBER_FILTER_RULE_ADD_NEW_LABEL}
              </Btn>
            </div>
          </div>

          {isInitialLoad ? (
            <TableListLoading />
          ) : rows.length === 0 ? (
            <TableListEmptyState
              message={NUMBER_FILTER_RULE_EMPTY_MESSAGE}
              onAddNew={() => openModal()}
              buttonLabel={NUMBER_FILTER_RULE_ADD_NEW_EMPTY_LABEL}
            />
          ) : (
            <>
              <div
                style={{
                  overflowX: "auto",
                  overflowY: "auto",
                  flex: 1,
                }}
              >
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "separate",
                    borderSpacing: 0,
                    tableLayout: "auto",
                    minWidth: 1800,
                    ...(isCompact ? { minWidth: 1200 } : {}),
                  }}
                >
                  <thead>
                    <tr>
                      {NUMBER_FILTER_RULE_COLUMNS.map((col) => (
                        <TH
                          key={col.key}
                          style={{
                            ...(col.key === "check"
                              ? {
                                  borderLeft: "none",
                                  width: 40,
                                  padding: 0,
                                }
                              : {}),
                            ...(col.key === "originalCallerIdPoolBlacklist"
                              ? { borderRight: "none" }
                              : {}),
                            /* Modify column disabled:
                            ...(col.key === "modify"
                              ? { borderRight: "none" }
                              : {}),
                            */
                            width:
                              col.key === "check"
                                ? 40
                                : /* : col.key === "modify" ? 70 */
                                  col.key === "description"
                                  ? 180
                                  : [
                                        "callerIdPoolWhitelist",
                                        "callerIdPoolBlacklist",
                                        "calleeIdPoolWhitelist",
                                        "calleeIdPoolBlacklist",
                                        "originalCallerIdPoolWhitelist",
                                        "originalCallerIdPoolBlacklist",
                                      ].includes(col.key)
                                    ? 160
                                    : [
                                          "callerIdWhitelist",
                                          "calleeIdWhitelist",
                                          "callerIdBlacklist",
                                          "calleeIdBlacklist",
                                        ].includes(col.key)
                                      ? 140
                                      : 100,
                          }}
                        >
                          {col.key === "check" ? (
                            <Checkbox
                              checked={allRowsChecked}
                              indeterminate={someRowsChecked}
                              onChange={handleCheckAll}
                              size="small"
                              sx={filteringRuleTableCheckboxSx}
                              disabled={rows.length === 0}
                            />
                          ) : (
                            col.label
                          )}
                        </TH>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row, idx) => {
                      const realIdx = idx;
                      const isChecked = row?.checked || false;
                      const isLastRow = idx === rows.length - 1;
                      const rowBg = isChecked
                        ? "#eff6ff"
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
                            transition: "background 0.15s ease",
                          }}
                          onMouseEnter={(e) => {
                            if (!isChecked)
                              e.currentTarget.style.background = "#f8fafc";
                          }}
                          onMouseLeave={(e) => {
                            if (!isChecked)
                              e.currentTarget.style.background = rowBg;
                          }}
                        >
                          {NUMBER_FILTER_RULE_COLUMNS.map((col) => (
                            <td
                              key={col.key}
                              style={{
                                ...tdStyle,
                                background: rowBg,
                                fontWeight: col.key === "check" ? undefined : 400,
                                ...(col.key === "check"
                                  ? { borderLeft: "none", width: 36 }
                                  : {}),
                                ...(col.key === "originalCallerIdPoolBlacklist"
                                  ? { borderRight: "none" }
                                  : {}),
                                /* Modify column disabled:
                                ...(col.key === "modify"
                                  ? { borderRight: "none" }
                                  : {}),
                                */
                                ...lastRowCellStyle,
                              }}
                            >
                              {col.key === "check" ? (
                                <Checkbox
                                  checked={isChecked}
                                  onChange={() => handleCheck(realIdx)}
                                  size="small"
                                  disabled={isDeleting}
                                  sx={filteringRuleTableCheckboxSx}
                                />
                              ) : col.key === "id" ? (
                                realIdx + 1
                              ) : (
                                row[col.key]
                              )}
                              {/* Modify column disabled — uncomment block below + constants modify column:
                              ) : col.key === "modify" ? (
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
                              */}
                            </td>
                          ))}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div style={filteringRuleFooterStyle}>
                <span style={{ fontSize: 11, color: C.mutedText }}>
                  Showing {rows.length} record
                  {rows.length !== 1 ? "s" : ""}
                </span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Modal */}
      <Dialog
        open={modalOpen}
        onClose={() => {
          if (isLoading) return;
          closeModal();
        }}
        maxWidth={false}
        sx={NUMBER_FILTER_FILTERING_RULE_ADD_NEW_DIALOG_SX}
        PaperProps={{
          sx: NUMBER_FILTER_FILTERING_RULE_ADD_NEW_DIALOG_PAPER_SX,
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
            borderTopLeftRadius: 8,
            borderTopRightRadius: 8,
            flexShrink: 0,
          }}
        >
          {editIndex !== null
            ? NUMBER_FILTER_RULE_MODAL_TITLE_EDIT
            : NUMBER_FILTER_RULE_MODAL_TITLE_ADD}
        </DialogTitle>
        <DialogContent
          style={{
            padding: "24px",
            backgroundColor: "#ffffff",
            overflowY: "auto",
            flex: "1 1 auto",
          }}
        >
          <div style={addHostFormPanelStyle}>
            <E1PriFieldRow
              label="No.:"
              tooltipKey="id"
              tooltips={NUMBER_FILTER_RULE_FIELD_TOOLTIPS}
            >
              <input
                type="text"
                name="id"
                value={editIndex !== null ? editIndex + 1 : rows.length + 1}
                disabled
                readOnly
                style={disabledInputStyle}
              />
            </E1PriFieldRow>
            {[
              {
                key: "callerIdWhitelist",
                label: "CallerID Whitelist:",
                options: groupOptions.wlCaller,
              },
              {
                key: "calleeIdWhitelist",
                label: "CalleeID Whitelist:",
                options: groupOptions.wlCallee,
              },
              {
                key: "callerIdBlacklist",
                label: "CallerID Blacklist:",
                options: groupOptions.blCaller,
              },
              {
                key: "calleeIdBlacklist",
                label: "CalleeID Blacklist:",
                options: groupOptions.blCallee,
              },
              {
                key: "callerIdPoolWhitelist",
                label: "CallerID Pool in Whitelist:",
                options: groupOptions.poolGroups,
              },
              {
                key: "callerIdPoolBlacklist",
                label: "CallerID Pool in Blacklist:",
                options: groupOptions.poolGroups,
              },
              {
                key: "calleeIdPoolWhitelist",
                label: "CalleeID Pool in Whitelist:",
                options: groupOptions.poolGroups,
              },
              {
                key: "calleeIdPoolBlacklist",
                label: "CalleeID Pool in Blacklist:",
                options: groupOptions.poolGroups,
              },
              {
                key: "originalCallerIdPoolWhitelist",
                label: "Original CallerID Pool in Whitelist:",
                options: groupOptions.poolGroups,
              },
              {
                key: "originalCallerIdPoolBlacklist",
                label: "Original CallerID Pool in Blacklist:",
                options: groupOptions.poolGroups,
              },
            ].map((field) => (
              <E1PriFieldRow
                key={field.key}
                label={field.label}
                tooltipKey={field.key}
                tooltips={NUMBER_FILTER_RULE_FIELD_TOOLTIPS}
              >
                <select
                  name={field.key}
                  value={form[field.key] || "none"}
                  onChange={handleFormChange}
                  style={selectStyle}
                  {...inputInteraction}
                >
                  {[
                    ...NUMBER_FILTER_RULE_DROPDOWN_OPTIONS,
                    ...Array.from(
                      new Set(
                        (field.options || []).filter((o) => o !== "none"),
                      ),
                    ),
                  ].map((opt) => (
                    <option key={opt} value={opt}>
                      {opt === "none" ? "None" : opt}
                    </option>
                  ))}
                </select>
              </E1PriFieldRow>
            ))}
          </div>
        </DialogContent>
        <DialogActions sx={{ p: 0, m: 0 }} style={addNewModalFooterStyle}>
          <Btn
            onClick={handleSave}
            variant="primary"
            style={addNewModalFooterBtnStyle}
            disabled={isLoading}
          >
            {isLoading ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              NUMBER_FILTER_RULE_SAVE_LABEL
            )}
          </Btn>
          <Btn
            onClick={closeModal}
            variant="cancel"
            style={filteringRuleModalCancelBtnStyle}
            disabled={isLoading}
          >
            {NUMBER_FILTER_RULE_CLOSE_LABEL}
          </Btn>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default FilteringRule;
