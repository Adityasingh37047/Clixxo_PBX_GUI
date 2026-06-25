import React, { useState, useEffect } from "react";
import {
  TONE_DETECTER_FIELDS,
  TONE_DETECTER_TABLE_COLUMNS,
  TONE_DETECTER_INITIAL_FORM,
  TONE_DETECTER_FIELD_TOOLTIPS,
} from "../../../constants/ToneDetecterConstants";
import EditDocumentIcon from "@mui/icons-material/EditDocument";
import {
  Checkbox,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select as MuiSelect,
  MenuItem,
  FormControl,
  Alert,
  Tooltip,
} from "@mui/material";

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

const FxsFieldLabel = ({ tooltipKey, tooltips, children, style = {} }) => {
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

const C = {
  pageBg: "var(--bg-main)",
  cardBg: "var(--bg-surface)",
  cardBorder: "var(--border-strong)",
  labelText: "var(--text-primary)",
  valueText: "var(--text-primary)",
  mutedText: "var(--text-muted)",
  accent: "var(--accent-brand)",
  amber: "#dc2626",
};

const BTN_BASE =
  "inline-flex items-center justify-center gap-[6px] h-[30px] px-[14px] py-[6px] rounded-[10px] text-[12px] font-semibold whitespace-nowrap transition-all duration-150 ease-in-out cursor-pointer border disabled:cursor-not-allowed disabled:opacity-60";
const BTN_OUTLINE = `${BTN_BASE} bg-[var(--bg-surface)] text-[var(--text-primary)] border-[var(--border-subtle)] hover:bg-[var(--row-alt)]`;
const BTN_CANCEL = `${BTN_BASE} bg-[#cbd5e1] text-[#374151] border-[#cbd5e1] shadow-[0_1px_2px_rgba(15,23,42,0.08)] hover:bg-[#b6c2d3]`;
const BTN_PRIMARY = `${BTN_BASE} text-white border-[#5A6F8F] bg-[linear-gradient(to_bottom,#5A6F8F_0%,#3E5475_60%,#2C3E57_100%)] hover:bg-[linear-gradient(to_bottom,#3E5475_0%,#5A6F8F_100%)]`;
const BTN_FORM_PRIMARY =
  "inline-flex items-center justify-center gap-[6px] min-w-[100px] h-[34px] px-[14px] py-[6px] rounded-[10px] text-[13px] font-semibold whitespace-nowrap transition-all duration-150 ease-in-out cursor-pointer border text-white border-[#5A6F8F] bg-[linear-gradient(to_bottom,#5A6F8F_0%,#3E5475_60%,#2C3E57_100%)] hover:bg-[linear-gradient(to_bottom,#3E5475_0%,#5A6F8F_100%)] disabled:cursor-not-allowed disabled:opacity-60";
const BTN_FORM_CANCEL =
  "inline-flex items-center justify-center gap-[6px] min-w-[100px] h-[34px] px-[14px] py-[6px] rounded-[10px] text-[13px] font-semibold whitespace-nowrap transition-all duration-150 ease-in-out cursor-pointer border bg-[#cbd5e1] text-[#374151] border-[#cbd5e1] shadow-[0_1px_2px_rgba(15,23,42,0.08)] hover:bg-[#b6c2d3] disabled:cursor-not-allowed disabled:opacity-60";

const btnVariantCls = {
  default: BTN_OUTLINE,
  primary: BTN_PRIMARY,
  cancel: BTN_CANCEL,
  outline: BTN_OUTLINE,
  formPrimary: BTN_FORM_PRIMARY,
  formCancel: BTN_FORM_CANCEL,
  danger: `${BTN_BASE} bg-[#fef2f2] text-[#dc2626] border-[0.5px] border-[#fecaca] hover:bg-[#fca5a5]`,
};

const Btn = ({
  children,
  onClick,
  disabled,
  variant = "default",
  className = "",
  style,
  type,
  title,
}) => (
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

const OUTLINED_BORDER = "var(--border-subtle)";
const OUTLINED_HOVER = "var(--border-strong)";
const OUTLINED_FOCUS = "var(--status-primary)";

const muiTextFieldSx = {
  "& .MuiOutlinedInput-root": {
    backgroundColor: "var(--bg-surface)",
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

const muiSelectInnerSx = {
  "& .MuiOutlinedInput-root": {
    minHeight: 36,
    backgroundColor: "var(--bg-surface)",
  },
  "& .MuiSelect-select": {
    display: "flex",
    alignItems: "center",
    padding: "7px 32px 7px 10px !important",
    lineHeight: 1.35,
    boxSizing: "border-box",
  },
};

const muiSelectSx = {
  fontSize: 13,
  backgroundColor: "var(--bg-surface)",
  ...muiSelectInnerSx,
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
  borderBottom: `1px solid ${C.cardBorder}`,
  borderRight: `1px solid ${C.cardBorder}`,
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
};

const TONE_DETECTER_PAGE_WRAP =
  "bg-[var(--bg-main)] min-h-[calc(100vh-80px)] p-[16px] box-border flex flex-col items-center";
const TONE_DETECTER_PAGE_INNER = "w-full max-w-full mx-auto";
const TONE_DETECTER_CARD =
  "overflow-hidden rounded-[10px] border-[1.5px] border-[var(--border-strong)] bg-[var(--bg-surface)] shadow-[0_10px_30px_rgba(15,23,42,0.06)]";
const TONE_DETECTER_TOOLBAR =
  "flex min-h-[44px] flex-wrap items-center justify-between gap-[12px] border-b border-[var(--border-strong)] bg-[var(--bg-surface)] px-[14px] py-[7px] rounded-t-[10px]";
const TONE_DETECTER_TOOLBAR_LEFT = "flex items-center gap-[8px]";
const TONE_DETECTER_TOOLBAR_ACTIONS =
  "flex flex-wrap items-center gap-[8px]";
const TONE_DETECTER_SELECTED_BADGE =
  "rounded-full border border-[#3E5475] bg-[#eff6ff] px-[12px] py-[5px] text-[11px] font-bold text-[var(--text-label)]";
const TONE_DETECTER_PAGE_BADGE =
  "rounded-[6px] border border-[var(--border-strong)] bg-[#e0f2fe] px-[14px] py-[5px] text-[11px] font-semibold text-[var(--text-label)]";
const TONE_DETECTER_PAGINATION =
  "flex items-center justify-between overflow-hidden border-t border-[var(--border-strong)] bg-[var(--bg-surface)] px-[14px] py-[7px] rounded-b-[10px]";

const FxsAdvancedBreadcrumb = ({ current, className = "" }) => (
  <div
    className={`mb-[16px] flex flex-wrap items-center gap-[4px] text-[12px] font-normal text-[#94a3b8] ${className}`.trim()}
  >
    <span>FXS</span>
    <span>&gt;</span>
    <span>Advanced</span>
    <span>&gt;</span>
    <span className="font-semibold text-[#1e293b]">{current}</span>
  </div>
);

const FieldRow = ({
  label,
  tooltipKey,
  children,
  required,
  align = "center",
  labelWidth = 170,
}) => (
  <div
    style={{
      display: "flex",
      alignItems: align,
      justifyContent: "center",
      gap: 12,
      minHeight: align === "flex-start" ? undefined : 32,
    }}
  >
    {tooltipKey ? (
      <FxsFieldLabel
        tooltipKey={tooltipKey}
        tooltips={TONE_DETECTER_FIELD_TOOLTIPS}
        style={{
          width: labelWidth,
          flexShrink: 0,
          textAlign: "left",
          paddingTop: align === "flex-start" ? 8 : 0,
        }}
      >
        {label}
        {required && <span style={{ color: "#dc2626" }}> *</span>}
      </FxsFieldLabel>
    ) : (
      <label
        style={{
          fontSize: 13,
          fontWeight: 600,
          color: C.labelText,
          width: labelWidth,
          flexShrink: 0,
          textAlign: "left",
          paddingTop: align === "flex-start" ? 8 : 0,
        }}
      >
        {label}
        {required && <span style={{ color: "#dc2626" }}> *</span>}
      </label>
    )}
    <div style={{ width: "min(100%, 320px)" }}>{children}</div>
  </div>
);

const toneDetecterModalPaperSx = {
  width: 500,
  maxWidth: "95vw",
  borderRadius: "8px",
  overflow: "hidden",
  boxShadow:
    "0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)",
};

const toneDetecterModalTitleStyle = {
  background: "#1e2d42",
  color: "#ffffff",
  fontWeight: 600,
  fontSize: 16,
  padding: "16px 24px",
  textAlign: "center",
};

const toneDetecterModalContentStyle = {
  padding: "20px 24px",
  paddingBottom: "16px",
  backgroundColor: "var(--bg-surface)",
};

const toneDetecterModalFormPanelStyle = {
  display: "flex",
  flexDirection: "column",
  gap: 14,
  background: "var(--row-alt)",
  border: `1px solid ${C.cardBorder}`,
  borderRadius: 8,
  padding: 20,
};

const toneDetecterModalFooterStyle = {
  display: "flex",
  justifyContent: "center",
  gap: 12,
  padding: "10px 16px",
  borderTop: `1px solid ${C.cardBorder}`,
  background: "var(--row-alt)",
};

const LOCAL_STORAGE_KEY = "toneDetectorRules";

const TONE_DETECTER_FIELD_LABEL_WIDTH = 220;

const toneDetecterTextFieldSx = {
  ...muiTextFieldSx,
  "& .MuiOutlinedInput-root": {
    ...muiTextFieldSx["& .MuiOutlinedInput-root"],
    height: 32,
  },
};

const toneDetecterInputProps = {
  style: {
    fontSize: 13,
    height: 32,
    padding: "0 8px",
    boxSizing: "border-box",
  },
};

const DATA_COLUMNS = TONE_DETECTER_TABLE_COLUMNS.filter(
  (c) => c.key !== "check" && c.key !== "modify",
);

const TONE_DETECTER_TH_GAP = { padding: "8px 14px" };
const TONE_DETECTER_TD_GAP = { padding: "6px 14px", lineHeight: 1.2 };
const TONE_DETECTER_CHECKBOX_SX = {
  padding: "1px",
  color: "var(--text-primary)",
  "&.Mui-checked": { color: "#0284c7" },
  "&.MuiCheckbox-indeterminate": { color: "#0284c7" },
};

const ToneDetecterPagination = ({
  page,
  totalPages,
  recordCount,
  onPrev,
  onNext,
}) => (
  <div className={TONE_DETECTER_PAGINATION}>
    <span className="text-[11px] text-[#94a3b8]">
      Showing {recordCount} record{recordCount !== 1 ? "s" : ""} on page {page}
    </span>
    <div className="flex items-center gap-[8px]">
      <Btn onClick={onPrev} disabled={page <= 1} variant="outline">
        ← Prev
      </Btn>
      <span className={TONE_DETECTER_PAGE_BADGE}>
        Page {page} of {totalPages}
      </span>
      <Btn onClick={onNext} disabled={page >= totalPages} variant="outline">
        Next →
      </Btn>
    </div>
  </div>
);

const ToneDetecterPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState(TONE_DETECTER_INITIAL_FORM);
  const [rules, setRules] = useState([]);
  const [selected, setSelected] = useState([]);
  const [page, setPage] = useState(1);
  const itemsPerPage = 20;
  const totalPages = Math.max(1, Math.ceil(rules.length / itemsPerPage));
  const pagedRules = rules.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage,
  );
  const [loading, setLoading] = useState({
    fetch: false,
    save: false,
    delete: false,
  });
  const [editIndex, setEditIndex] = useState(null);
  const [toast, setToast] = useState({ msg: "", type: "success" });

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "success" }), 3500);
  };

  useEffect(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setRules(Array.isArray(parsed) ? parsed : []);
      }
    } catch (error) {
      console.error("Error loading tone detector data:", error);
      setRules([]);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(rules));
    } catch (error) {
      console.error("Error saving tone detector data:", error);
    }
  }, [rules]);

  const handleOpenModal = (item = null, index = -1) => {
    if (item) {
      setFormData({
        ...item,
        index: item.index !== undefined ? String(item.index) : "0",
        first_mid_frequency:
          item.first_mid_frequency !== undefined
            ? String(item.first_mid_frequency)
            : "450",
        second_mid_frequency:
          item.second_mid_frequency !== undefined
            ? String(item.second_mid_frequency)
            : "0",
        duration_on_state:
          item.duration_on_state !== undefined
            ? String(item.duration_on_state)
            : "1500",
        duration_off_state:
          item.duration_off_state !== undefined
            ? String(item.duration_off_state)
            : "0",
        period_count:
          item.period_count !== undefined ? String(item.period_count) : "0",
        duration_error:
          item.duration_error !== undefined
            ? String(item.duration_error)
            : "20",
      });
      setEditIndex(index);
    } else {
      const nextIndex =
        rules.length > 0
          ? Math.max(...rules.map((r) => Number(r.index) || 0)) + 1
          : 0;
      setFormData({
        ...TONE_DETECTER_INITIAL_FORM,
        index: String(nextIndex),
      });
      setEditIndex(null);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => setIsModalOpen(false);

  const handleSave = () => {
    if (!formData.tone) {
      showToast("Tone is required.", "error");
      return;
    }
    if (
      formData.first_mid_frequency === "" ||
      formData.first_mid_frequency == null
    ) {
      showToast("The 1st Mid-frequency is required.", "error");
      return;
    }
    if (formData.duration_error === "" || formData.duration_error == null) {
      showToast("Duration Error at ON/OFF State is required.", "error");
      return;
    }

    const normalized = {
      ...formData,
      index: String(formData.index || "0"),
      first_mid_frequency: String(formData.first_mid_frequency || "0"),
      second_mid_frequency: String(formData.second_mid_frequency || "0"),
      duration_on_state: String(formData.duration_on_state || "0"),
      duration_off_state: String(formData.duration_off_state || "0"),
      period_count: String(formData.period_count || "0"),
      duration_error: String(formData.duration_error || "20"),
      id: editIndex !== null ? rules[editIndex].id : Date.now(),
    };

    setLoading((prev) => ({ ...prev, save: true }));
    try {
      if (editIndex !== null) {
        setRules((prev) =>
          prev.map((rule, idx) => (idx === editIndex ? normalized : rule)),
        );
        showToast("Tone parameter updated successfully!");
      } else {
        setRules((prev) => [...prev, normalized]);
        showToast("Tone parameter created successfully!");
      }

      handleCloseModal();
    } catch (error) {
      console.error("Error saving tone parameter:", error);
      showToast(error.message || "Failed to save tone parameter", "error");
    } finally {
      setLoading((prev) => ({ ...prev, save: false }));
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "tone") {
      const toneDefaults = {
        "Dial Tone": {
          first_mid_frequency: "450",
          second_mid_frequency: "0",
          duration_on_state: "600",
          duration_off_state: "0",
          period_count: "0",
          duration_error: "20",
        },
        "Busy Tone": {
          first_mid_frequency: "450",
          second_mid_frequency: "0",
          duration_on_state: "350",
          duration_off_state: "350",
          period_count: "2",
          duration_error: "20",
        },
        "Ringback Tone": {
          first_mid_frequency: "450",
          second_mid_frequency: "0",
          duration_on_state: "1000",
          duration_off_state: "4000",
          period_count: "1",
          duration_error: "20",
        },
        "Fax F1": {
          first_mid_frequency: "1100",
          second_mid_frequency: "0",
          duration_on_state: "250",
          duration_off_state: "0",
          period_count: "0",
          duration_error: "20",
        },
        "Fax F2": {
          first_mid_frequency: "2100",
          second_mid_frequency: "0",
          duration_on_state: "250",
          duration_off_state: "0",
          period_count: "0",
          duration_error: "20",
        },
      };

      const defaults = toneDefaults[value] || {};
      setFormData((prev) => ({ ...prev, [name]: value, ...defaults }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handlePageChange = (newPage) => {
    setPage(Math.max(1, Math.min(totalPages, newPage)));
    setSelected([]);
  };

  const handleSelectRow = (idx) => {
    const realIdx = (page - 1) * itemsPerPage + idx;
    setSelected((sel) =>
      sel.includes(realIdx)
        ? sel.filter((i) => i !== realIdx)
        : [...sel, realIdx],
    );
  };

  const handleCheckAll = () => {
    const allIndices = pagedRules.map(
      (_, idx) => (page - 1) * itemsPerPage + idx,
    );
    setSelected(allIndices);
  };
  const handleUncheckAll = () => setSelected([]);
  const handleInverse = () =>
    setSelected(
      pagedRules
        .map((_, idx) => (page - 1) * itemsPerPage + idx)
        .filter((i) => !selected.includes(i)),
    );

  const handleDelete = () => {
    if (selected.length === 0) {
      showToast("Please select at least one item to delete.", "error");
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete ${selected.length} selected item(s)?`,
    );
    if (!confirmed) return;

    setLoading((prev) => ({ ...prev, delete: true }));
    try {
      setRules((prev) => prev.filter((_, idx) => !selected.includes(idx)));
      setSelected([]);
      showToast(`${selected.length} item(s) deleted successfully`);
    } catch (error) {
      console.error("Error deleting selected items:", error);
      showToast(error.message || "Failed to delete selected items", "error");
    } finally {
      setLoading((prev) => ({ ...prev, delete: false }));
    }
  };

  const handleClearAll = () => {
    if (rules.length === 0) {
      showToast("No data to clear", "error");
      return;
    }

    if (
      !window.confirm(
        "Are you sure you want to delete ALL tone parameters? This action cannot be undone.",
      )
    ) {
      return;
    }

    setLoading((prev) => ({ ...prev, delete: true }));
    try {
      setRules([]);
      setSelected([]);
      setPage(1);
      showToast(`All ${rules.length} item(s) deleted successfully`);
    } catch (error) {
      console.error("Error clearing all items:", error);
      showToast(error.message || "Failed to clear all items", "error");
    } finally {
      setLoading((prev) => ({ ...prev, delete: false }));
    }
  };

  const handleRefresh = () => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setRules(Array.isArray(parsed) ? parsed : []);
      } else {
        setRules([]);
      }
    } catch (error) {
      console.error("Error refreshing tone detector data:", error);
    }
  };

  const pagedSelectedCount = pagedRules.filter((_, idx) =>
    selected.includes((page - 1) * itemsPerPage + idx),
  ).length;
  const allPagedChecked =
    pagedRules.length > 0 && pagedSelectedCount === pagedRules.length;

  return (
    <div className={TONE_DETECTER_PAGE_WRAP}>
      <div className={TONE_DETECTER_PAGE_INNER}>
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
        <FxsAdvancedBreadcrumb current="Tone Detector" />

        <div className={TONE_DETECTER_CARD}>
          <div className={TONE_DETECTER_TOOLBAR}>
            <div className={TONE_DETECTER_TOOLBAR_LEFT}>
              {selected.length > 0 && (
                <span className={TONE_DETECTER_SELECTED_BADGE}>
                  {selected.length} selected
                </span>
              )}
            </div>
            <div className={TONE_DETECTER_TOOLBAR_ACTIONS}>
              <Btn
                variant="cancel"
                onClick={handleInverse}
                disabled={loading.delete || rules.length === 0}
              >
                Inverse
              </Btn>
              <Btn
                variant="cancel"
                onClick={handleDelete}
                disabled={loading.delete || selected.length === 0}
              >
                {loading.delete ? "Deleting..." : "Delete"}
              </Btn>
              <Btn
                variant="cancel"
                onClick={handleClearAll}
                disabled={loading.delete || rules.length === 0}
              >
                {loading.delete ? "Clearing..." : "Clear All"}
              </Btn>
              <Btn
                variant="primary"
                onClick={() => handleOpenModal()}
                disabled={loading.save}
              >
                {loading.save ? "Saving..." : "+ Add New"}
              </Btn>
            </div>
          </div>

          <div style={{ overflowX: "auto", overflowY: "auto", flex: 1 }}>
            {rules.length === 0 ? (
              <div className="flex min-h-[240px] flex-col items-center justify-center p-[24px] text-center">
                <div className="mb-[16px] text-[13px] font-semibold text-[var(--text-label)]">
                  No available tone detector parameter!
                </div>
                <Btn
                  variant="cancel"
                  onClick={() => handleOpenModal()}
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
                }}
              >
                <thead>
                  <tr>
                    <TH
                      style={{
                        width: 40,
                        padding: 0,
                        borderLeft: "none",
                      }}
                    >
                      <Checkbox
                        size="small"
                        checked={allPagedChecked}
                        indeterminate={
                          pagedSelectedCount > 0 && !allPagedChecked
                        }
                        onChange={(e) => {
                          if (e.target.checked) handleCheckAll();
                          else handleUncheckAll();
                        }}
                        sx={TONE_DETECTER_CHECKBOX_SX}
                      />
                    </TH>
                    {DATA_COLUMNS.map((col) => (
                      <TH key={col.key} style={TONE_DETECTER_TH_GAP}>
                        {col.label}
                      </TH>
                    ))}
                    <TH
                      style={{
                        width: 70,
                        borderRight: "none",
                        ...TONE_DETECTER_TH_GAP,
                      }}
                    >
                      Modify
                    </TH>
                  </tr>
                </thead>
                <tbody>
                  {pagedRules.map((item, idx) => {
                    const realIdx = (page - 1) * itemsPerPage + idx;
                    const isSelected = selected.includes(realIdx);
                    const isLastRow = idx === pagedRules.length - 1;
                    const rowBg = isSelected
                      ? "#f0f9ff"
                      : idx % 2 === 1
                        ? "#f8fafc"
                        : "#ffffff";
                    const lastRowCellStyle = isLastRow
                      ? { borderBottom: `1px solid ${C.cardBorder}` }
                      : {};

                    return (
                      <tr key={realIdx} style={{ background: rowBg }}>
                        <td
                          style={{
                            ...tdStyle,
                            ...TONE_DETECTER_TD_GAP,
                            background: rowBg,
                            borderLeft: "none",
                            width: 36,
                            ...lastRowCellStyle,
                          }}
                        >
                          <Checkbox
                            size="small"
                            checked={isSelected}
                            onChange={() => handleSelectRow(idx)}
                            sx={TONE_DETECTER_CHECKBOX_SX}
                          />
                        </td>
                        {DATA_COLUMNS.map((col) => (
                          <td
                            key={col.key}
                            style={{
                              ...tdStyle,
                              ...TONE_DETECTER_TD_GAP,
                              background: rowBg,
                              ...lastRowCellStyle,
                            }}
                          >
                            {item[col.key]}
                          </td>
                        ))}
                        <td
                          style={{
                            ...tdStyle,
                            ...TONE_DETECTER_TD_GAP,
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
                              onMouseEnter={(e) => {
                                e.currentTarget.style.opacity = "1";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.opacity = "0.7";
                              }}
                              onClick={() => handleOpenModal(item, realIdx)}
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

          {rules.length > 0 && (
            <ToneDetecterPagination
              page={page}
              totalPages={totalPages}
              recordCount={pagedRules.length}
              onPrev={() => handlePageChange(page - 1)}
              onNext={() => handlePageChange(page + 1)}
            />
          )}
      </div>
      <Dialog
        open={isModalOpen}
        onClose={handleCloseModal}
        maxWidth={false}
        className="z-50"
        PaperProps={{ sx: advancedModalPaperSx }}
        disableRestoreFocus
        disableEnforceFocus
      >
        <DialogTitle style={advancedModalTitleStyle}>
          {editIndex !== null ? "Edit Tone Parameters" : "Add Tone Parameters"}
        </DialogTitle>
        <DialogContent style={addHostModalContentStyle}>
          <div style={addHostFormPanelStyle}>
            {TONE_DETECTER_FIELDS.map((field) => (
                <FieldRow
                  key={field.name}
                  label={field.label}
                  tooltipKey={field.name}
                  labelWidth={TONE_DETECTER_FIELD_LABEL_WIDTH}
                >
                  {field.type === "select" ? (
                    <FormControl size="small" fullWidth>
                      <MuiSelect
                        value={formData[field.name] || ""}
                        onChange={(e) =>
                          handleInputChange({
                            target: { name: field.name, value: e.target.value },
                          })
                        }
                        sx={muiSelectSx}
                      >
                        {field.options.map((opt) => (
                          <MenuItem
                            key={opt.value}
                            value={opt.value}
                            sx={{ fontSize: 13 }}
                          >
                            {opt.label}
                          </MenuItem>
                        ))}
                      </MuiSelect>
                    </FormControl>
                  ) : (
                    <TextField
                      type={field.type || "text"}
                      name={field.name}
                      value={formData[field.name] || ""}
                      onChange={handleInputChange}
                      size="small"
                      fullWidth
                      variant="outlined"
                      sx={toneDetecterTextFieldSx}
                      inputProps={toneDetecterInputProps}
                    />
                  )}
                </FieldRow>
              ))}
            </div>
          </DialogContent>
          <DialogActions style={toneDetecterModalFooterStyle}>
            <Btn
              variant="formPrimary"
              onClick={handleSave}
              disabled={loading.save}
            >
              Save
            </Btn>
            <Btn variant="formCancel" onClick={handleCloseModal}>
              Close
            </Btn>
          </DialogActions>
        </Dialog>
      </div>
    </div>
  );
};

export default ToneDetecterPage;
