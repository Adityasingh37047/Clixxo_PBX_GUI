import React, { useState, useEffect } from "react";
import {
  NUMBER_FILTER_POOL_COLUMNS,
  NUMBER_FILTER_POOL_GROUPS,
  NUMBER_FILTER_POOL_FIELD_TOOLTIPS,
  NUMBER_FILTER_POOL_PAGE_BREADCRUMB_ROOT,
  NUMBER_FILTER_POOL_PAGE_BREADCRUMB_SECTION,
  NUMBER_FILTER_POOL_PAGE_TITLE,
  NUMBER_FILTER_POOL_EMPTY_MESSAGE,
  NUMBER_FILTER_POOL_MODAL_TITLE_ADD,
  NUMBER_FILTER_POOL_MODAL_TITLE_EDIT,
  NUMBER_FILTER_POOL_ADD_NEW_LABEL,
  NUMBER_FILTER_POOL_ADD_NEW_EMPTY_LABEL,
  NUMBER_FILTER_POOL_DELETE_LABEL,
  NUMBER_FILTER_POOL_CLEAR_ALL_LABEL,
  NUMBER_FILTER_POOL_SAVE_LABEL,
  NUMBER_FILTER_POOL_CLOSE_LABEL,
} from "../../../constants/NumberFilterPoolConstants";
import {
  Checkbox,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
  Tooltip,
  useMediaQuery,
} from "@mui/material";
import {
  listNumberPool,
  createNumberPool,
  updateNumberPool,
  deleteNumberPool,
} from "../../../api/apiService";
import EditDocumentIcon from "@mui/icons-material/EditDocument";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
const NUMBER_FILTER_NUMBER_POOL_ADD_NEW_DIALOG_MARGIN = 24;
const NUMBER_FILTER_NUMBER_POOL_ADD_NEW_DIALOG_LAYOUT_OFFSET = 80;

const NUMBER_FILTER_NUMBER_POOL_ADD_NEW_DIALOG_SX = {
  "& .MuiDialog-container": {
    alignItems: "center",
    justifyContent: "center",
  },
};

const NUMBER_FILTER_NUMBER_POOL_ADD_NEW_DIALOG_PAPER_SX = {
  margin: NUMBER_FILTER_NUMBER_POOL_ADD_NEW_DIALOG_MARGIN,
  maxHeight: `calc(100vh - ${NUMBER_FILTER_NUMBER_POOL_ADD_NEW_DIALOG_LAYOUT_OFFSET}px - ${NUMBER_FILTER_NUMBER_POOL_ADD_NEW_DIALOG_MARGIN * 2}px)`,
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


const NUMBER_POOL_COMPACT_MQ = "(max-width: 768px)";

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
  labelWidth = 140,
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
        width: labelWidth,
        flexShrink: 0,
        textAlign: "left",
        display: "inline-block",
      }}
    >
      {label}
    </E1PriFieldLabel>
    <div style={{ width: "min(100%, 320px)" }}>{children}</div>
  </div>
);

// ── Color palette (matches Number-Receiving Rule) ─────────────────────────────
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

const NUMBER_POOL_CARD_RADIUS = 10;

const numberPoolPageWrapStyle = {
  backgroundColor: C.pageBg,
  minHeight: "calc(100vh - 80px)",
  padding: 16,
  boxSizing: "border-box",
};

const numberPoolPageInnerStyle = {
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

const numberPoolCardStyle = {
  background: "#ffffff",
  borderRadius: NUMBER_POOL_CARD_RADIUS,
  overflow: "hidden",
  border: `1px solid ${C.cardBorder}`,
  boxShadow: "0 0 14px rgba(0, 0, 0, 0.18), 0 0 5px rgba(0, 0, 0, 0.10)",
};

const numberPoolToolbarStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  minHeight: 44,
  padding: "7px 14px",
  borderBottom: `1px solid ${C.divider}`,
  background: "#ffffff",
  flexWrap: "wrap",
  gap: 12,
  borderTopLeftRadius: NUMBER_POOL_CARD_RADIUS,
  borderTopRightRadius: NUMBER_POOL_CARD_RADIUS,
};

const numberPoolFooterStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "7px 14px",
  background: "#ffffff",
  borderTop: `1px solid ${C.divider}`,
  borderBottomLeftRadius: NUMBER_POOL_CARD_RADIUS,
  borderBottomRightRadius: NUMBER_POOL_CARD_RADIUS,
  overflow: "hidden",
};

const numberPoolSelectedBadgeStyle = {
  background: "#eff6ff",
  color: C.accent,
  fontSize: 11,
  fontWeight: 700,
  padding: "5px 12px",
  borderRadius: 999,
  border: `1px solid ${C.accent}`,
};

const numberPoolCancelBtnStyle = {
  height: 30,
  background: "#cbd5e1",
  color: "#374151",
  border: "1px solid #cbd5e1",
  boxShadow: "0 1px 2px rgba(15, 23, 42, 0.08)",
};

const numberPoolPrimaryBtnStyle = {
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

const numberPoolModalCancelBtnStyle = {
  ...addNewModalFooterBtnStyle,
  background: "#cbd5e1",
  color: "#374151",
  border: "1px solid #cbd5e1",
  boxShadow: "0 1px 2px rgba(15, 23, 42, 0.08)",
};

const NumberPoolBreadcrumb = () => (
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
    <span>{NUMBER_FILTER_POOL_PAGE_BREADCRUMB_ROOT}</span>
    <span>&gt;</span>
    <span>{NUMBER_FILTER_POOL_PAGE_BREADCRUMB_SECTION}</span>
    <span>&gt;</span>
    <span style={{ color: "#1e293b", fontWeight: 600 }}>
      {NUMBER_FILTER_POOL_PAGE_TITLE}
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
  buttonLabel = "+ Add New",
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
        style={{ padding: "8px 24px", fontSize: 12, borderRadius: 6 }}
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

const numberPoolTableCheckboxSx = {
  padding: "1px",
  color: "#3E5475",
  "&.Mui-checked": { color: "#0284c7" },
  "&.MuiCheckbox-indeterminate": { color: "#0284c7" },
};

const NumberPool = () => {
  const isCompact = useMediaQuery(NUMBER_POOL_COMPACT_MQ);
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
  const [isInitialLoad, setIsInitialLoad] = useState(true);
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
    if (!form.numberRangeStart || !form.numberRangeEnd) {
      const msg = "Please fill the range.";
      setValidationError(msg);
      showToast(msg, "error");
      return;
    }

    const error = validateNumberRange(
      form.numberRangeStart,
      form.numberRangeEnd,
    );
    if (error) {
      setValidationError(error);
      showToast(error, "error");
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
      const isEdit =
        editIndex !== null && rows[editIndex] && Boolean(rows[editIndex].id);
      let didUpdate = false;

      if (editIndex !== null && rows[editIndex]?.id) {
        await updateNumberPool(rows[editIndex].id, apiData);
        didUpdate = Boolean(isEdit);
      } else {
        await createNumberPool(apiData);
      }
      await refreshNumberPoolWithRetry();
      showToast(didUpdate ? "Updated successfully" : "Saved successfully");
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

  const allRowsChecked = rows.length > 0 && rows.every((r) => r.checked);
  const someRowsChecked = rows.some((r) => r.checked) && !allRowsChecked;

  const handleCheckAll = () => {
    const selectAll = !allRowsChecked;
    setRows((prev) => prev.map((row) => ({ ...row, checked: selectAll })));
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
      setIsInitialLoad(false);
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
        ...numberPoolPageWrapStyle,
        ...(isCompact ? { padding: 8 } : {}),
      }}
    >
      <div style={numberPoolPageInnerStyle}>
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

        <NumberPoolBreadcrumb />

        <div style={numberPoolCardStyle}>
          <div
            style={{
              ...numberPoolToolbarStyle,
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
                <span style={numberPoolSelectedBadgeStyle}>
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
                style={numberPoolCancelBtnStyle}
              >
                {isDeleting ? (
                  <CircularProgress size={11} style={{ color: "#374151" }} />
                ) : null}
                <DeleteOutlineOutlinedIcon sx={{ fontSize: 16 }} />
                {NUMBER_FILTER_POOL_DELETE_LABEL}
              </Btn>
              <Btn
                variant="cancel"
                onClick={handleClearAll}
                disabled={isInitialLoad || rows.length === 0 || isDeleting}
                style={numberPoolCancelBtnStyle}
              >
                {NUMBER_FILTER_POOL_CLEAR_ALL_LABEL}
              </Btn>
              <Btn
                variant="primary"
                onClick={() => openModal()}
                disabled={isInitialLoad || isDeleting || loading}
                style={numberPoolPrimaryBtnStyle}
              >
                {NUMBER_FILTER_POOL_ADD_NEW_LABEL}
              </Btn>
            </div>
          </div>

          {isInitialLoad ? (
            <TableListLoading />
          ) : rows.length === 0 ? (
            <TableListEmptyState
              message={NUMBER_FILTER_POOL_EMPTY_MESSAGE}
              onAddNew={() => openModal()}
              buttonLabel={NUMBER_FILTER_POOL_ADD_NEW_EMPTY_LABEL}
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
                    minWidth: 600,
                    ...(isCompact ? { minWidth: 480 } : {}),
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
                          checked={allRowsChecked}
                          indeterminate={someRowsChecked}
                          onChange={handleCheckAll}
                          size="small"
                          sx={numberPoolTableCheckboxSx}
                          disabled={rows.length === 0}
                        />
                      </TH>
                      {NUMBER_FILTER_POOL_COLUMNS.filter(
                        (col) => col.key !== "check" && col.key !== "modify",
                      ).map((col) => (
                        <TH
                          key={col.key}
                          style={{ position: "sticky", top: 0, zIndex: 10 }}
                        >
                          {col.label}
                        </TH>
                      ))}
                      <TH
                        style={{
                          width: 70,
                          borderRight: "none",
                          position: "sticky",
                          top: 0,
                          zIndex: 10,
                        }}
                      >
                        {NUMBER_FILTER_POOL_COLUMNS.find(
                          (col) => col.key === "modify",
                        )?.label || "Modify"}
                      </TH>
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
                          <td
                            style={{
                              ...tdStyle,
                              background: rowBg,
                              width: 36,
                              borderLeft: "none",
                              ...lastRowCellStyle,
                            }}
                          >
                            <Checkbox
                              checked={isChecked}
                              onChange={() => handleCheck(realIdx)}
                              size="small"
                              disabled={isDeleting}
                              sx={numberPoolTableCheckboxSx}
                            />
                          </td>
                          <td
                            style={{
                              ...tdStyle,
                              background: rowBg,
                              fontWeight: 400,
                              ...lastRowCellStyle,
                            }}
                          >
                            {row.groupNo}
                          </td>
                          <td
                            style={{
                              ...tdStyle,
                              background: rowBg,
                              fontWeight: 400,
                              ...lastRowCellStyle,
                            }}
                          >
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
                                onClick={() => {
                                  if (!isDeleting) openModal(realIdx);
                                }}
                                style={{
                                  cursor: isDeleting
                                    ? "not-allowed"
                                    : "pointer",
                                  color: "#2563eb",
                                  fontSize: 22,
                                  opacity: isDeleting ? 0.4 : 0.7,
                                  transition: "opacity 0.15s ease",
                                }}
                                onMouseEnter={(e) => {
                                  if (!isDeleting)
                                    e.currentTarget.style.opacity = "1";
                                }}
                                onMouseLeave={(e) => {
                                  if (!isDeleting)
                                    e.currentTarget.style.opacity = "0.7";
                                }}
                              />
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div style={numberPoolFooterStyle}>
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
          if (loading) return;
          closeModal();
        }}
        maxWidth={false}
        sx={NUMBER_FILTER_NUMBER_POOL_ADD_NEW_DIALOG_SX}
        PaperProps={{
          sx: NUMBER_FILTER_NUMBER_POOL_ADD_NEW_DIALOG_PAPER_SX,
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
            ? NUMBER_FILTER_POOL_MODAL_TITLE_EDIT
            : NUMBER_FILTER_POOL_MODAL_TITLE_ADD}
        </DialogTitle>
        <DialogContent
          style={{
            padding: "24px",
            backgroundColor: "#ffffff",
            overflowY: "auto",
            flex: "1 1 auto",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={addHostFormPanelStyle}>
              <div
                style={{ display: "flex", flexDirection: "column", gap: 14 }}
              >
                <E1PriFieldRow
                  label="Group No.:"
                  tooltipKey="groupNo"
                  tooltips={NUMBER_FILTER_POOL_FIELD_TOOLTIPS}
                >
                  <select
                    name="groupNo"
                    value={form.groupNo}
                    onChange={handleFormChange}
                    style={selectStyle}
                    {...inputInteraction}
                  >
                    {NUMBER_FILTER_POOL_GROUPS.map((g) => (
                      <option key={g.value} value={g.value}>
                        {g.label}
                      </option>
                    ))}
                  </select>
                </E1PriFieldRow>

                <E1PriFieldRow
                  label="Range:"
                  tooltipKey="range"
                  tooltips={NUMBER_FILTER_POOL_FIELD_TOOLTIPS}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <input
                      type="text"
                      name="numberRangeStart"
                      value={form.numberRangeStart}
                      onChange={handleFormChange}
                      placeholder="Start"
                      style={inputStyle}
                      {...inputInteraction}
                    />
                    <span
                      style={{
                        color: C.mutedText,
                        fontWeight: 600,
                        flexShrink: 0,
                      }}
                    >
                      -
                    </span>
                    <input
                      type="text"
                      name="numberRangeEnd"
                      value={form.numberRangeEnd}
                      onChange={handleFormChange}
                      placeholder="End"
                      style={inputStyle}
                      {...inputInteraction}
                    />
                  </div>
                </E1PriFieldRow>
              </div>
            </div>
          </div>
        </DialogContent>
        <DialogActions sx={{ p: 0, m: 0 }} style={addNewModalFooterStyle}>
          <Btn
            onClick={handleSave}
            variant="primary"
            style={addNewModalFooterBtnStyle}
            disabled={loading}
          >
            {loading ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              NUMBER_FILTER_POOL_SAVE_LABEL
            )}
          </Btn>
          <Btn
            onClick={closeModal}
            variant="cancel"
            style={numberPoolModalCancelBtnStyle}
            disabled={loading}
          >
            {NUMBER_FILTER_POOL_CLOSE_LABEL}
          </Btn>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default NumberPool;
