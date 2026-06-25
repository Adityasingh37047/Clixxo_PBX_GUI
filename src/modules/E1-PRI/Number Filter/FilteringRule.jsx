import React, { useState, useEffect } from "react";
import {
  FILTERING_RULE_COLUMNS,
  FILTERING_RULE_DROPDOWN_OPTIONS,
  FILTERING_RULE_FIELD_TOOLTIPS,
} from "../../../constants/FilteringRuleConstants";
import {
  listFinalNumberFilter,
  createFinalNumberFilter,
  deleteFinalNumberFilter,
  fetchAllNumberFilters,
  listNumberPool,
} from "../../../api/apiService";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select as MuiSelect,
  MenuItem,
  Alert,
  CircularProgress,
  Checkbox,
  Tooltip,
} from "@mui/material";
// Modify column disabled — uncomment when enabling modify column:
// import EditDocumentIcon from "@mui/icons-material/EditDocument";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";

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

// ── Color palette (matches Number-Receiving Rule) ─────────────────────────────
const C = {
  pageBg: "var(--bg-main)",
  cardBg: "var(--bg-surface)",
  cardBorder: "var(--border-strong)",
  labelText: "var(--text-primary)",
  valueText: "var(--text-primary)",
  mutedText: "var(--text-muted)",
  strongText: "var(--text-primary)",
  accent: "var(--accent-brand)",
  amber: "#dc2626",
};

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

const BTN_BASE =
  "inline-flex items-center justify-center gap-[6px] h-[30px] px-[14px] py-[6px] rounded-[10px] text-[12px] font-semibold whitespace-nowrap transition-all duration-150 ease-in-out cursor-pointer border disabled:cursor-not-allowed disabled:opacity-60";
const BTN_DEFAULT = `${BTN_BASE} bg-[var(--bg-surface)] text-[var(--text-primary)] border-[var(--border-subtle)] hover:bg-[var(--row-alt)]`;
const BTN_OUTLINE = `${BTN_BASE} bg-[var(--bg-surface)] text-[var(--text-label)] border-[var(--border-strong)] hover:bg-[var(--row-alt)]`;
const BTN_CANCEL = `${BTN_BASE} bg-[#cbd5e1] text-[#374151] border-[#cbd5e1] shadow-[0_1px_2px_rgba(15,23,42,0.08)] hover:bg-[#b6c2d3]`;
const BTN_PRIMARY = `${BTN_BASE} text-white border-[#5A6F8F] bg-[linear-gradient(to_bottom,#5A6F8F_0%,#3E5475_60%,#2C3E57_100%)] hover:bg-[linear-gradient(to_bottom,#3E5475_0%,#5A6F8F_100%)]`;
const BTN_GREY_DEFAULT = `${BTN_BASE} bg-[#cbd5e1] text-[var(--text-primary)] border-[var(--border-subtle)] hover:bg-[var(--row-alt)]`;

const btnVariantCls = {
  default: BTN_GREY_DEFAULT,
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

const tdStyle = {
  padding: "7px 14px",
  fontSize: 13,
  color: C.valueText,
  textAlign: "center",
  background: "var(--bg-surface)",
  borderBottom: `1px solid ${C.cardBorder}`,
  borderRight: `1px solid ${C.cardBorder}`,
  whiteSpace: "nowrap",
};

const checkboxSx = {
  padding: "1px",
  color: "var(--text-primary)",
  "&.Mui-checked": { color: "#0284c7" },
};

const headerCheckThStyle = {
  padding: "1px 14px",
  lineHeight: 1,
};

const MIN_ROWS = 14;
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
    }
  };

  useEffect(() => {
    loadRows();
  }, []);

  return (
    <div className={E1_PAGE}>
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
        <E1Breadcrumb section="Number Filter" current="Filtering Rule" />

        {/* Main Card */}
        <div className={E1_CARD}>
          {/* Top Actions Bar */}
          <div
            style={{
              minHeight: 44,
              padding: "7px 14px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 12,
              background: "var(--bg-surface)",
              borderBottom: `1px solid ${C.cardBorder}`,
              borderTopLeftRadius: CARD_RADIUS,
              borderTopRightRadius: CARD_RADIUS,
            }}
          >
            {/* Left Section */}
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              {rows.some((r) => r.checked) && (
                <span className={E1_SELECTED_BADGE}>
                  {rows.filter((r) => r.checked).length} selected
                </span>
              )}
            </div>

            {/* Right Section: Actions */}
            <div className={E1_TOOLBAR_ACTIONS}>
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
                    color: "var(--text-primary)",
                    fontSize: 13,
                    fontWeight: 600,
                    marginBottom: 16,
                  }}
                >
                  No Filtering Rules Configured!
                </div>
                <Btn
                  onClick={() => openModal()}
                  variant="cancel"
                  style={{ padding: "8px 24px", fontSize: 12, borderRadius: 6 }}
                >
                  + Add New Rule
                </Btn>
              </div>
            ) : (
              <table
                style={{
                  width: "100%",
                  borderCollapse: "separate",
                  borderSpacing: 0,
                  minWidth: "1800px",
                }}
              >
                <thead>
                  <tr>
                    {FILTERING_RULE_COLUMNS.map((col) => (
                      <TH
                        key={col.key}
                        style={{
                          ...(col.key === "check"
                            ? { borderLeft: "none", ...headerCheckThStyle }
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
                              ? 60
                              /* : col.key === "modify" ? 80 */
                              : col.key === "description"
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
                            sx={checkboxSx}
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
                      ? "#f0f9ff"
                      : realIdx % 2 === 1
                        ? "#f8fafc"
                        : "#ffffff";
                    const lastRowCellStyle = isLastRow
                      ? { borderBottom: `1px solid ${C.cardBorder}` }
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
                            e.currentTarget.style.background = "var(--row-alt)";
                        }}
                        onMouseLeave={(e) => {
                          if (!isChecked)
                            e.currentTarget.style.background = rowBg;
                        }}
                      >
                        {FILTERING_RULE_COLUMNS.map((col) => (
                          <td
                            key={col.key}
                            style={{
                              ...tdStyle,
                              background: rowBg,
                              ...(col.key === "check"
                                ? { borderLeft: "none" }
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
                                sx={checkboxSx}
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
            )}
          </div>

          {rows.length > 0 && (
            <div className={E1_PAGINATION}>
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
            width: 600,
            maxWidth: "95vw",
            mx: "auto",
            p: 0,
            borderRadius: 2,
            overflow: "hidden",
            maxHeight: "95vh",
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
          {editIndex !== null ? "Edit" : "Add"} Filtering Rule
        </DialogTitle>
        <DialogContent
          style={{
            padding: "16px 20px",
            backgroundColor: "var(--bg-surface)",
            overflowY: "visible",
          }}
        >
          <div style={{ ...addHostFormPanelStyle, padding: 14, gap: 10 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 12,
              }}
            >
              <E1PriFieldLabel
                tooltipKey="id"
                tooltips={FILTERING_RULE_FIELD_TOOLTIPS}
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  width: 240,
                  whiteSpace: "nowrap",
                  lineHeight: 1.2,
                  textAlign: "left",
                  display: "inline-block",
                }}
              >
                No.:
              </E1PriFieldLabel>
              <div style={{ width: "min(100%, 280px)" }}>
                <TextField
                  name="id"
                  value={editIndex !== null ? editIndex + 1 : rows.length + 1}
                  disabled
                  size="small"
                  fullWidth
                  inputProps={{ style: { fontSize: 13, height: 16 } }}
                  sx={{
                    backgroundColor: "var(--bg-muted)",
                    "& .MuiOutlinedInput-root": {
                      "& fieldset": {
                        borderColor: C.cardBorder,
                        transition: "border-color 0.2s ease",
                      },
                    },
                    "& .Mui-disabled": {
                      WebkitTextFillColor: "#64748b",
                    },
                  }}
                />
              </div>
            </div>
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
              <div
                key={field.key}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 12,
                }}
              >
                <E1PriFieldLabel
                  tooltipKey={field.key}
                  tooltips={FILTERING_RULE_FIELD_TOOLTIPS}
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    width: 240,
                    whiteSpace: "nowrap",
                    lineHeight: 1.2,
                    textAlign: "left",
                    display: "inline-block",
                  }}
                >
                  {field.label}
                </E1PriFieldLabel>
                <div style={{ width: "min(100%, 280px)" }}>
                  <MuiSelect
                    name={field.key}
                    value={form[field.key] || "none"}
                    onChange={handleFormChange}
                    size="small"
                    fullWidth
                    sx={modalSelectSx}
                  >
                    {[
                      "none",
                      ...Array.from(
                        new Set(
                          (field.options || []).filter((o) => o !== "none"),
                        ),
                      ),
                    ].map((opt) => (
                      <MenuItem key={opt} value={opt} sx={{ fontSize: 13 }}>
                        {opt === "none" ? "None" : opt}
                      </MenuItem>
                    ))}
                  </MuiSelect>
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
        <DialogActions
          style={{
            background: "var(--row-alt)",
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
            style={{ minWidth: 100, height: 33, fontSize: 13, padding: "6px 28px", textTransform: "none" }}
            disabled={isLoading}
          >
            {isLoading ? (
              <CircularProgress size={16} style={{ color: "#fff" }} />
            ) : (
              "Save"
            )}
          </Btn>
          <Btn
            onClick={closeModal}
            variant="cancel"
            style={{ minWidth: 100, height: 33 }}
            disabled={isLoading}
          >
            Cancel
          </Btn>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default FilteringRule;
