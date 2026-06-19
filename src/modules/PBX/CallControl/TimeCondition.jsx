import React, { useEffect, useRef, useState } from "react";
import EditDocumentIcon from "@mui/icons-material/EditDocument";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import {Alert,
  Checkbox,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  TextField, useMediaQuery } from "@mui/material";
import {
  TC_TITLE,
  TC_TYPES,
  TC_DAYS_OF_WEEK,
  TC_MONTHS,
  TC_HOURS,
  TC_MINUTES,
  TC_DAYS_OF_MONTH,
  TC_TABLE_COLUMNS,
  TC_INITIAL_FORM,
} from "../../../constants/TimeComditionConstants";
import {
  fetchTimeConditions,
  createTimeCondition,
  updateTimeCondition,
  deleteTimeCondition,
  deleteAllTimeConditions,
} from "../../../api/apiService";
const PBX_COMPACT_MQ = "(max-width: 768px)";

const C = {
  pageBg: "#f8fafc",
  cardBg: "#ffffff",
  cardBorder: "#9CA3AF",
  labelText: "#3E5475",
  valueText: "#0f172a",
  mutedText: "#94a3b8",
  accent: "#3E5475",
};

const BTN_BASE =
  "inline-flex items-center justify-center gap-[6px] h-[30px] px-[14px] py-[6px] rounded-[10px] text-[12px] font-semibold whitespace-nowrap transition-all duration-150 ease-in-out cursor-pointer border disabled:cursor-not-allowed disabled:opacity-60";
const BTN_OUTLINE = `${BTN_BASE} bg-white text-[#0f172a] border-[#9ca3af] hover:bg-[#e2e8f0]`;
const BTN_CANCEL = `${BTN_BASE} bg-[#cbd5e1] text-[#374151] border-[#cbd5e1] shadow-[0_1px_2px_rgba(15,23,42,0.08)] hover:bg-[#b6c2d3]`;
const BTN_PRIMARY = `${BTN_BASE} text-white border-[#5A6F8F] bg-[linear-gradient(to_bottom,#5A6F8F_0%,#3E5475_60%,#2C3E57_100%)] hover:bg-[linear-gradient(to_bottom,#3E5475_0%,#5A6F8F_100%)]`;
const BTN_DIALOG_PRIMARY =
  "inline-flex items-center justify-center gap-[6px] min-w-[100px] h-[33px] px-[28px] py-[6px] rounded-[10px] text-[13px] font-semibold whitespace-nowrap transition-all duration-150 ease-in-out cursor-pointer border text-white border-[#5A6F8F] bg-[linear-gradient(to_bottom,#5A6F8F_0%,#3E5475_60%,#2C3E57_100%)] hover:bg-[linear-gradient(to_bottom,#3E5475_0%,#5A6F8F_100%)] disabled:cursor-not-allowed disabled:opacity-60";
const BTN_DIALOG_CANCEL =
  "inline-flex items-center justify-center gap-[6px] min-w-[100px] h-[33px] px-[14px] py-[6px] rounded-[10px] text-[13px] font-semibold whitespace-nowrap transition-all duration-150 ease-in-out cursor-pointer border bg-[#cbd5e1] text-[#374151] border-[#cbd5e1] shadow-[0_1px_2px_rgba(15,23,42,0.08)] hover:bg-[#b6c2d3] disabled:cursor-not-allowed disabled:opacity-60";

const btnVariantCls = {
  default: BTN_OUTLINE,
  primary: BTN_PRIMARY,
  cancel: BTN_CANCEL,
  dialogPrimary: BTN_DIALOG_PRIMARY,
  dialogCancel: BTN_DIALOG_CANCEL,
  danger: `${BTN_BASE} bg-[#fef2f2] text-[#dc2626] border-[0.5px] border-[#fecaca] hover:bg-[#fca5a5]`,
  outline: `${BTN_BASE} bg-white text-[#3E5475] border-[#9CA3AF] hover:bg-[#e2e8f0]`,
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

const TH = ({ children, style: extra }) => (
  <th
    style={{
      background: "#F8FAFC",
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
};

const checkboxSx = {
  padding: "1px",
  color: "#3E5475",
  "&.Mui-checked": { color: "#0284c7" },
  "&.MuiCheckbox-indeterminate": { color: "#0284c7" },
};

const PbxBreadcrumb = ({ section, current, className = "" }) => (
  <div
    className={`mb-[16px] flex flex-wrap items-center gap-[4px] text-[12px] font-normal text-[#94a3b8] ${className}`.trim()}
  >
    <span>PBX</span>
    <span>&gt;</span>
    <span>{section}</span>
    <span>&gt;</span>
    <span className="font-semibold text-[#1e293b]">{current}</span>
  </div>
);

const TableListLoading = () => (
  <div className="flex items-center justify-center p-[48px]">
    <CircularProgress size={28} sx={{ color: C.accent }} />
  </div>
);

const TableListEmptyState = ({
  message,
  onAddNew,
  buttonLabel = "+ Add New",
  showButton = true,
}) => (
  <div className="flex min-h-[240px] flex-col items-center justify-center p-[24px] text-center">
    <div
      className="text-[13px] font-semibold text-[#3E5475]"
      style={{ marginBottom: showButton && onAddNew ? 16 : 0 }}
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

const TIME_CONDITION_CARD =
  "overflow-hidden rounded-[10px] border-[1.5px] border-[#9CA3AF] bg-white shadow-[0_10px_30px_rgba(15,23,42,0.06)]";
const TIME_CONDITION_TOOLBAR =
  "flex min-h-[44px] flex-wrap items-center justify-between gap-[12px] border-b border-[#9CA3AF] bg-white px-[14px] py-[7px] rounded-t-[10px]";
const TIME_CONDITION_TOOLBAR_COMPACT = "flex-col items-stretch gap-[10px]";
const TIME_CONDITION_TOOLBAR_LEFT = "flex flex-wrap items-center gap-[8px]";
const TIME_CONDITION_TOOLBAR_ACTIONS = "flex flex-wrap items-center gap-[8px]";
const TIME_CONDITION_SELECTED_BADGE =
  "rounded-full border border-[#3E5475] bg-[#eff6ff] px-[12px] py-[5px] text-[11px] font-bold text-[#3E5475]";
const TIME_CONDITION_PAGE_BADGE =
  "rounded-[6px] border border-[#9CA3AF] bg-[#e0f2fe] px-[14px] py-[5px] text-[11px] font-semibold text-[#3E5475]";
const TIME_CONDITION_PAGINATION =
  "flex items-center justify-between overflow-hidden border-t border-[#9CA3AF] bg-white px-[14px] py-[7px] rounded-b-[10px]";

const TimeConditionPagination = ({
  page,
  totalPages,
  recordCount,
  onPageChange,
  recordLabel = "record",
  className = "",
}) => (
  <div className={`${TIME_CONDITION_PAGINATION} ${className}`.trim()}>
    <span className="text-[11px] text-[#94a3b8]">
      Showing {recordCount} {recordLabel}
      {recordCount !== 1 ? "s" : ""} on page {page}
    </span>
    <div className="flex items-center gap-[8px]">
      <Btn
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        variant="outline"
      >
        ← Prev
      </Btn>
      <span className={TIME_CONDITION_PAGE_BADGE}>
        Page {page} of {totalPages}
      </span>
      <Btn
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        variant="outline"
      >
        Next →
      </Btn>
    </div>
  </div>
);

const timeConditionModalPaperSx = {
  width: "max-content",
  maxWidth: "96vw",
  mx: "auto",
  borderRadius: "8px",
  boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)",
  backgroundColor: "#ffffff",
  backgroundImage: "none",
};

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

const modalTextFieldFullSx = {
  ...muiTextFieldSx,
  width: "100%",
  "& .MuiOutlinedInput-root": {
    ...muiTextFieldSx["& .MuiOutlinedInput-root"],
    minHeight: 36,
    height: 36,
    fontSize: 13,
  },
  "& .MuiOutlinedInput-input": {
    padding: "7px 10px",
    fontSize: 13,
    boxSizing: "border-box",
    backgroundColor: "#fff",
  },
};

const FOCUS_RING_SHADOW = (color) => `0 0 0 1px ${color}`;

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
  el.style.boxShadow = FOCUS_RING_SHADOW(OUTLINED_FOCUS);
};

const nativeFieldInteraction = {
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

const TC_TIME_SELECT_HEIGHT = 26;
const TC_TIME_SELECT_WIDTH = 42;

const timeSelectStyle = {
  width: TC_TIME_SELECT_WIDTH,
  minWidth: TC_TIME_SELECT_WIDTH,
  maxWidth: TC_TIME_SELECT_WIDTH,
  minHeight: TC_TIME_SELECT_HEIGHT,
  height: TC_TIME_SELECT_HEIGHT,
  padding: "3px 10px 3px 3px",
  fontSize: 12,
  lineHeight: 1.35,
  border: `1px solid ${OUTLINED_BORDER}`,
  borderRadius: 4,
  outline: "none",
  backgroundColor: "#fff",
  color: "#0f172a",
  boxSizing: "border-box",
  boxShadow: "none",
  transition: "border-color 0.2s ease, box-shadow 0.2s ease",
  appearance: "auto",
};

// ─── helpers ─────────────────────────────────────────────────────────────────
const pad = (n) => String(n ?? 0).padStart(2, "0");
const typeLabel = (v) => TC_TYPES.find((t) => t.value === v)?.label ?? v;

const settingsSummary = (row) => {
  if (row.type === "worktime") {
    const ranges = (row.timeSlots || [])
      .map(
        (r) =>
          `${pad(r.start_hour)}:${pad(r.start_minute)}–${pad(r.end_hour)}:${pad(r.end_minute)}`,
      )
      .join(", ");
    const days =
      (row.daysOfWeek || [])
        .map((d) => d.charAt(0).toUpperCase() + d.slice(1))
        .join(", ") || "—";
    return `${ranges || "—"}  |  ${days}`;
  }
  const months =
    (row.months || [])
      .map((m) => m.charAt(0).toUpperCase() + m.slice(1))
      .join(", ") || "—";
  const days = (row.daysOfMonth || []).join(", ") || "—";
  return `${months}  |  Day: ${days}`;
};

// API → internal form state
const normalizeFromApi = (item) => ({
  id: item.id,
  name: item.name || "",
  type: item.type === "work_time" ? "worktime" : item.type || "worktime",
  // time_slots from API: [{start_hour, start_minute, end_hour, end_minute}] (numbers)
  timeSlots: Array.isArray(item.time_slots) ? item.time_slots : [],
  daysOfWeek: Array.isArray(item.days_of_week) ? item.days_of_week : [],
  months: Array.isArray(item.months) ? item.months : [],
  daysOfMonth: Array.isArray(item.days_of_month) ? item.days_of_month : [],
});

// Internal form → time_slots for API (strings → numbers)
const formToTimeSlots = (timeRanges) =>
  timeRanges.map((r) => ({
    start_hour: parseInt(r.startHour, 10),
    start_minute: parseInt(r.startMinute, 10),
    end_hour: parseInt(r.endHour, 10),
    end_minute: parseInt(r.endMinute, 10),
  }));

// API time_slots → form timeRanges (numbers → padded strings)
const apiSlotsToFormRanges = (slots) =>
  slots.map((s) => ({
    startHour: pad(s.start_hour),
    startMinute: pad(s.start_minute),
    endHour: pad(s.end_hour),
    endMinute: pad(s.end_minute),
  }));

// ─── sub-components ───────────────────────────────────────────────────────────
const FieldRow = ({ label, required, children, fitContent }) => (
  <div
    style={{
      display: "flex",
      alignItems: "flex-start",
      gap: 16,
      marginBottom: 14,
      width: fitContent ? "max-content" : "100%",
    }}
  >
    <label
      style={{
        width: 120,
        flexShrink: 0,
        fontSize: 13,
        fontWeight: 600,
        color: "#30415A",
        paddingTop: 4,
      }}
    >
      {label}
      {required && <span style={{ color: "#dc2626", marginLeft: 2 }}>*</span>}
    </label>
    <div style={fitContent ? { flexShrink: 0 } : { flex: 1 }}>{children}</div>
  </div>
);

const modalCheckboxLabelSx = {
  margin: 0,
  whiteSpace: "nowrap",
  "& .MuiFormControlLabel-label": {
    fontSize: 13,
    color: "#30415A",
    lineHeight: 1.2,
  },
};

const modalCheckboxAllLabelSx = {
  ...modalCheckboxLabelSx,
  "& .MuiFormControlLabel-label": {
    fontSize: 13,
    fontWeight: 600,
    color: C.accent,
    lineHeight: 1.2,
  },
};

const CheckGroup = ({ items, checked, onChange, cols = 7 }) => {
  const allValues = items.map((item) =>
    typeof item === "object" ? item.value : item,
  );
  const allChecked =
    checked.length === allValues.length && allValues.length > 0;
  const someChecked =
    checked.length > 0 && checked.length < allValues.length;

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${cols}, auto)`,
        gap: "2px 10px",
        justifyContent: "start",
      }}
    >
      {items.map((item) => {
        const val = typeof item === "object" ? item.value : item;
        const lbl = typeof item === "object" ? item.label : item;
        return (
          <FormControlLabel
            key={val}
            control={
              <Checkbox
                size="small"
                checked={checked.includes(val)}
                onChange={() => onChange(val)}
                sx={checkboxSx}
              />
            }
            label={lbl}
            sx={modalCheckboxLabelSx}
          />
        );
      })}
      <FormControlLabel
        control={
          <Checkbox
            size="small"
            checked={allChecked}
            indeterminate={someChecked}
            onChange={() => onChange("__ALL__")}
            sx={checkboxSx}
          />
        }
        label="All"
        sx={modalCheckboxAllLabelSx}
      />
    </div>
  );
};

const TIME_COL_LABEL_STYLE = {
  fontSize: 11,
  color: C.labelText,
  fontWeight: 600,
  textAlign: "center",
  lineHeight: 1.2,
  minHeight: 15,
};

const TIME_ROW_LABEL_STYLE = {
  fontSize: 12,
  fontWeight: 600,
  color: "#30415A",
  flexShrink: 0,
  paddingBottom: 2,
};

const TimeCol = ({ label, showLabel, children }) => (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "flex-start",
      gap: 2,
      flexShrink: 0,
    }}
  >
    <span
      style={{
        ...TIME_COL_LABEL_STYLE,
        visibility: showLabel ? "visible" : "hidden",
      }}
    >
      {label}
    </span>
    {children}
  </div>
);

const TimeColon = () => (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      gap: 2,
      flexShrink: 0,
    }}
  >
    <span
      style={{
        ...TIME_COL_LABEL_STYLE,
        visibility: "hidden",
      }}
    >
      :
    </span>
    <span
      style={{
        fontSize: 12,
        lineHeight: 1,
        display: "flex",
        alignItems: "center",
        alignSelf: "center",
        height: TC_TIME_SELECT_HEIGHT,
      }}
    >
      :
    </span>
  </div>
);

const TimeGroup = ({
  showLabel,
  hourValue,
  minuteValue,
  onHourChange,
  onMinuteChange,
  hourOptions,
  minuteOptions,
}) => (
  <div style={{ display: "flex", alignItems: "flex-end", gap: 4 }}>
    <TimeCol label="Hour" showLabel={showLabel}>
      <TimeSelect
        value={hourValue}
        onChange={onHourChange}
        options={hourOptions}
      />
    </TimeCol>
    <TimeColon />
    <TimeCol label="Minute" showLabel={showLabel}>
      <TimeSelect
        value={minuteValue}
        onChange={onMinuteChange}
        options={minuteOptions}
      />
    </TimeCol>
  </div>
);

const TimeSelect = ({ value, onChange, options }) => (
  <select
    value={value}
    onChange={(e) => onChange(e.target.value)}
    style={timeSelectStyle}
    {...nativeFieldInteraction}
  >
    {options.map((o) => (
      <option key={o} value={o}>
        {o}
      </option>
    ))}
  </select>
);

// ─── main component ──────────────────────────────────────────────────────────
const TimeCondition = () => {
  const isCompact = useMediaQuery(PBX_COMPACT_MQ);
  const [rows, setRows] = useState([]);
  const [selected, setSelected] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ ...TC_INITIAL_FORM });
  const [loading, setLoading] = useState({
    fetch: false,
    save: false,
    delete: false,
  });
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [toast, setToast] = useState({ msg: "", type: "" });
  const hasLoaded = useRef(false);

  const itemsPerPage = 20;
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(rows.length / itemsPerPage));
  const pagedRows = rows.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "" }), 4000);
  };

  // ── load ──────────────────────────────────────────────────────────────────
  const loadRows = async () => {
    setLoading((p) => ({ ...p, fetch: true }));
    try {
      const res = await fetchTimeConditions();
      const list = Array.isArray(res?.message)
        ? res.message
        : Array.isArray(res?.data)
          ? res.data
          : [];
      setRows(list.map(normalizeFromApi));
    } catch (e) {
      showToast(e?.message || "Failed to load time conditions", "error");
    } finally {
      setLoading((p) => ({ ...p, fetch: false }));
      setIsInitialLoad(false);
    }
  };

  useEffect(() => {
    if (!hasLoaded.current) {
      hasLoaded.current = true;
      loadRows();
    }
  }, []);

  // ── select helpers ────────────────────────────────────────────────────────
  const handleCheckAll = () => setSelected(rows.map((_, i) => i));
  const handleUncheckAll = () => setSelected([]);
  const handleSelectRow = (idx) =>
    setSelected((s) =>
      s.includes(idx) ? s.filter((i) => i !== idx) : [...s, idx],
    );

  const allRowsSelected =
    rows.length > 0 && rows.every((_, index) => selected.includes(index));
  const someRowsSelected =
    rows.some((_, index) => selected.includes(index)) && !allRowsSelected;

  // ── delete ────────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!selected.length) return;
    if (!window.confirm(`Delete ${selected.length} item(s)?`)) return;
    setLoading((p) => ({ ...p, delete: true }));
    try {
      const ids = selected.map((idx) => rows[idx].id);
      if (ids.length === 1) {
        await deleteTimeCondition(ids[0]);
      } else {
        await deleteAllTimeConditions(ids);
      }
      setSelected([]);
      await loadRows();
      showToast("Deleted successfully");
    } catch (e) {
      showToast(e?.message || "Delete failed", "error");
    } finally {
      setLoading((p) => ({ ...p, delete: false }));
    }
  };

  // ── modal ─────────────────────────────────────────────────────────────────
  const openAdd = () => {
    setForm({
      ...TC_INITIAL_FORM,
      timeRanges: [
        { startHour: "09", startMinute: "00", endHour: "18", endMinute: "00" },
      ],
    });
    setEditId(null);
    setShowModal(true);
  };

  const openEdit = (row) => {
    setForm({
      name: row.name,
      type: row.type,
      timeRanges: row.timeSlots.length
        ? apiSlotsToFormRanges(row.timeSlots)
        : [
            {
              startHour: "09",
              startMinute: "00",
              endHour: "18",
              endMinute: "00",
            },
          ],
      daysOfWeek: row.daysOfWeek,
      months: row.months,
      daysOfMonth: row.daysOfMonth,
    });
    setEditId(row.id);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditId(null);
  };

  // ── form helpers ──────────────────────────────────────────────────────────
  const allDayValues = TC_DAYS_OF_WEEK.map((d) => d.value);
  const allMonthValues = TC_MONTHS.map((m) => m.value);
  const allDomValues = TC_DAYS_OF_MONTH.map(String);

  const toggleCheck = (key, value, allValues) => {
    setForm((prev) => {
      const list = prev[key];
      if (value === "__ALL__") {
        return {
          ...prev,
          [key]: list.length === allValues.length ? [] : [...allValues],
        };
      }
      return {
        ...prev,
        [key]: list.includes(value)
          ? list.filter((v) => v !== value)
          : [...list, value],
      };
    });
  };

  const addTimeRange = () =>
    setForm((p) => ({
      ...p,
      timeRanges: [
        ...p.timeRanges,
        { startHour: "00", startMinute: "00", endHour: "00", endMinute: "00" },
      ],
    }));

  const removeTimeRange = (idx) =>
    setForm((p) => ({
      ...p,
      timeRanges: p.timeRanges.filter((_, i) => i !== idx),
    }));

  const updateTimeRange = (idx, field, val) =>
    setForm((p) => {
      const tr = [...p.timeRanges];
      tr[idx] = { ...tr[idx], [field]: val };
      return { ...p, timeRanges: tr };
    });

  // ── save ──────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!form.name.trim()) {
      showToast("Name is required", "error");
      return;
    }
    if (form.type === "worktime" && !form.daysOfWeek.length) {
      showToast("Select at least one Day of Week", "error");
      return;
    }
    if (form.type === "worktime" && !form.timeRanges.length) {
      showToast("Add at least one time range", "error");
      return;
    }
    if (form.type === "holiday" && !form.months.length) {
      showToast("Select at least one Month", "error");
      return;
    }
    if (form.type === "holiday" && !form.daysOfMonth.length) {
      showToast("Select at least one Day of Month", "error");
      return;
    }

    setLoading((p) => ({ ...p, save: true }));
    try {
      const common = {
        name: form.name.trim(),
        condition_type: form.type,
      };

      const typeFields =
        form.type === "worktime"
          ? {
              time_slots: formToTimeSlots(form.timeRanges),
              days_of_week: form.daysOfWeek,
            }
          : {
              months: form.months,
              days_of_month: form.daysOfMonth.map(Number),
            };

      const payload =
        editId !== null
          ? { id: editId, ...common, ...typeFields }
          : { ...common, ...typeFields };

      const res =
        editId !== null
          ? await updateTimeCondition(payload)
          : await createTimeCondition(payload);

      if (res?.response === false) {
        showToast(res.message || "Save failed", "error");
        return;
      }
      showToast(
        editId !== null ? "Updated successfully" : "Created successfully",
      );
      closeModal();
      await loadRows();
    } catch (e) {
      showToast(e?.message || "Save failed", "error");
    } finally {
      setLoading((p) => ({ ...p, save: false }));
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div
      className={`box-border min-h-[calc(100vh-80px)] bg-[#f8fafc] ${isCompact ? "p-[8px]" : "p-[16px]"}`}
    >
      <div className="mx-auto w-full max-w-full">
        {toast.msg && (
          <Alert
            severity={toast.type === "error" ? "error" : "success"}
            onClose={() => setToast({ msg: "", type: "" })}
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

        <PbxBreadcrumb section="Call Control" current={TC_TITLE} />

        <div className={TIME_CONDITION_CARD}>
          <div
            className={`${TIME_CONDITION_TOOLBAR} ${isCompact ? TIME_CONDITION_TOOLBAR_COMPACT : ""}`.trim()}
          >
            <div className={TIME_CONDITION_TOOLBAR_LEFT}>
              {selected.length > 0 && (
                <span className={TIME_CONDITION_SELECTED_BADGE}>
                  {selected.length} selected
                </span>
              )}
            </div>

            <div className={TIME_CONDITION_TOOLBAR_ACTIONS}>
              <Btn
                onClick={handleDelete}
                disabled={
                  loading.delete || loading.fetch || selected.length === 0
                }
                variant="cancel"
              >
                {loading.delete ? (
                  <CircularProgress size={12} />
                ) : (
                  <DeleteOutlineOutlinedIcon sx={{ fontSize: 16 }} />
                )}
                Delete
              </Btn>
              <Btn
                onClick={openAdd}
                disabled={loading.save || loading.fetch}
                variant="primary"
              >
                + Add New
              </Btn>
            </div>
          </div>

          <div style={{ overflowX: "auto", overflowY: "auto", flex: 1 , ...(isCompact ? { overflowX: "auto", WebkitOverflowScrolling: "touch" } : {}) }}>
            {isInitialLoad ? (
              <TableListLoading />
            ) : rows.length === 0 ? (
              <TableListEmptyState
                message="No time conditions found."
                onAddNew={openAdd}
              />
            ) : (
              <table
                style={{
                  width: "100%",
                  borderCollapse: "separate",
                  borderSpacing: 0,
                  tableLayout: "auto",
                  minWidth: 900, ...(isCompact ? { minWidth: 720 } : {}),
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
                        checked={allRowsSelected}
                        indeterminate={someRowsSelected}
                        onChange={() =>
                          allRowsSelected
                            ? handleUncheckAll()
                            : handleCheckAll()
                        }
                        disabled={loading.delete || loading.fetch}
                        sx={checkboxSx}
                      />
                    </TH>
                    <TH
                      style={{
                        width: 36,
                        position: "sticky",
                        top: 0,
                        zIndex: 10,
                      }}
                    >
                      ID
                    </TH>
                    {TC_TABLE_COLUMNS.map((c) => (
                      <TH
                        key={c.key}
                        style={{ position: "sticky", top: 0, zIndex: 10 }}
                      >
                        {c.label}
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
                      Modify
                    </TH>
                  </tr>
                </thead>
                <tbody>
                  {pagedRows.map((row, idx) => {
                    const realIdx = (page - 1) * itemsPerPage + idx;
                    const isSelected = selected.includes(realIdx);
                    const isLastRow = idx === pagedRows.length - 1;
                    const lastRowCellStyle = isLastRow
                      ? { borderBottom: "none" }
                      : {};
                    const rowBg = isSelected
                      ? "#eff6ff"
                      : idx % 2 === 1
                        ? "#f8fafc"
                        : "#ffffff";

                    return (
                      <tr
                        key={row.id}
                        style={{
                          background: rowBg,
                          transition: "background 0.15s ease",
                        }}
                        onMouseEnter={(e) => {
                          if (!isSelected)
                            e.currentTarget.style.background = "#f8fafc";
                        }}
                        onMouseLeave={(e) => {
                          if (!isSelected)
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
                            size="small"
                            checked={isSelected}
                            onChange={() => handleSelectRow(realIdx)}
                            disabled={loading.delete}
                            sx={checkboxSx}
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
                          {realIdx + 1}
                        </td>
                        <td
                          style={{
                            ...tdStyle,
                            background: rowBg,
                            fontWeight: 400,
                            ...lastRowCellStyle,
                          }}
                        >
                          {row.name}
                        </td>
                        <td
                          style={{
                            ...tdStyle,
                            background: rowBg,
                            fontWeight: 400,
                            ...lastRowCellStyle,
                          }}
                        >
                          {typeLabel(row.type)}
                        </td>
                        <td
                          style={{
                            ...tdStyle,
                            background: rowBg,
                            fontWeight: 400,
                            maxWidth: 320,
                            whiteSpace: "normal",
                            ...lastRowCellStyle,
                          }}
                        >
                          {settingsSummary(row)}
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
                              onClick={() => openEdit(row)}
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
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {!isInitialLoad && rows.length > 0 && (
            <TimeConditionPagination
              page={page}
              totalPages={totalPages}
              recordCount={pagedRows.length}
              onPageChange={(p) =>
                setPage(Math.min(totalPages, Math.max(1, p)))
              }
            />
          )}
        </div>
      </div>

      <Dialog
      sx={{
        "& .MuiDialog-container": {
          alignItems: "flex-start",
          paddingTop: "80px",
        },
      }}
        open={showModal}
        onClose={() => {
          if (loading.save) return;
          closeModal();
        }}
        maxWidth={false}
        className="z-50"
        slotProps={{
          backdrop: { sx: { backgroundColor: "rgba(0, 0, 0, 0.5)" } },
        }}
        PaperProps={{ sx: timeConditionModalPaperSx }}
        disableRestoreFocus
      >
        <DialogTitle
          sx={{
            fontWeight: 600,
            fontSize: "16px",
            color: "#ffffff",
            backgroundColor: "#1e2d42",
            borderBottom: `1px solid ${C.cardBorder}`,
            px: 3,
            py: 2,
            textAlign: "center",
            borderTopLeftRadius: "8px",
            borderTopRightRadius: "8px",
          }}
        >
          {editId !== null ? "Edit Time Condition" : "Add Time Condition"}
        </DialogTitle>

        <DialogContent sx={{ p: "24px", backgroundColor: "#ffffff" }}>
         <div
  style={{
    display: "flex",
    flexDirection: "column",
    gap: 14,
    background: "#f8fafc",
    border: `1px solid ${C.cardBorder}`,
    borderRadius: 8,
    padding: 20,
    marginTop: 22,
    width: "100%",
    boxSizing: "border-box",
  }}
>
            {/* Name */}
            <FieldRow label="Name" required>
              <TextField
                value={form.name}
                onChange={(e) =>
                  setForm((p) => ({ ...p, name: e.target.value }))
                }
                placeholder="Enter name"
                size="small"
                fullWidth
                variant="outlined"
                sx={modalTextFieldFullSx}
              />
            </FieldRow>

            {/* Type */}
            <FieldRow label="Type" required>
              <div style={{ display: "flex", gap: 20 }}>
                {TC_TYPES.map((t) => (
                  <label
                    key={t.value}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      fontSize: 13,
                      cursor: "pointer",
                      fontWeight: form.type === t.value ? 600 : 400,
                    }}
                  >
                    <input
                      type="radio"
                      name="tc_type"
                      value={t.value}
                      checked={form.type === t.value}
                      onChange={() => setForm((p) => ({ ...p, type: t.value }))}
                      style={{ accentColor: "#3b82f6" }}
                    />
                    {t.label}
                  </label>
                ))}
              </div>
            </FieldRow>

            {/* ── WorkTime fields ── */}
            {form.type === "worktime" && (
              <>
                <FieldRow label="Settings" required fitContent>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 6,
                    }}
                  >
                    {form.timeRanges.map((tr, i) => (
                      <div
                        key={i}
                        style={{
                          display: "flex",
                          alignItems: "flex-end",
                          gap: 8,
                        }}
                      >
                        <span style={{ ...TIME_ROW_LABEL_STYLE, width: 70 }}>
                          StartTime
                        </span>
                        <TimeGroup
                          showLabel={i === 0}
                          hourValue={tr.startHour}
                          minuteValue={tr.startMinute}
                          onHourChange={(v) =>
                            updateTimeRange(i, "startHour", v)
                          }
                          onMinuteChange={(v) =>
                            updateTimeRange(i, "startMinute", v)
                          }
                          hourOptions={TC_HOURS}
                          minuteOptions={TC_MINUTES}
                        />
                        <span
                          style={{ ...TIME_ROW_LABEL_STYLE, marginLeft: 4 }}
                        >
                          EndTime
                        </span>
                        <TimeGroup
                          showLabel={i === 0}
                          hourValue={tr.endHour}
                          minuteValue={tr.endMinute}
                          onHourChange={(v) => updateTimeRange(i, "endHour", v)}
                          onMinuteChange={(v) =>
                            updateTimeRange(i, "endMinute", v)
                          }
                          hourOptions={TC_HOURS}
                          minuteOptions={TC_MINUTES}
                        />
                        {i === form.timeRanges.length - 1 ? (
                          <button
                            onClick={addTimeRange}
                            style={{
                              width: 24,
                              height: 24,
                              borderRadius: 4,
                              background: "#64748b",
                              color: "#fff",
                              border: "none",
                              fontSize: 16,
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            +
                          </button>
                        ) : (
                          <button
                            onClick={() => removeTimeRange(i)}
                            style={{
                              width: 24,
                              height: 24,
                              borderRadius: 4,
                              background: "#e2e8f0",
                              color: "#64748b",
                              border: "none",
                              fontSize: 16,
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            ×
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </FieldRow>

                <FieldRow label="Day of Week" required>
                  <CheckGroup
                    items={TC_DAYS_OF_WEEK}
                    checked={form.daysOfWeek}
                    onChange={(v) => toggleCheck("daysOfWeek", v, allDayValues)}
                    cols={4}
                  />
                </FieldRow>
              </>
            )}

            {/* ── Holiday fields ── */}
            {form.type === "holiday" && (
              <>
                <FieldRow label="Month" required>
                  <CheckGroup
                    items={TC_MONTHS}
                    checked={form.months}
                    onChange={(v) => toggleCheck("months", v, allMonthValues)}
                    cols={6}
                  />
                </FieldRow>

                <FieldRow label="Day of Month" required>
                  <CheckGroup
                    items={TC_DAYS_OF_MONTH.map(String)}
                    checked={form.daysOfMonth.map(String)}
                    onChange={(v) => {
                      if (v === "__ALL__") {
                        setForm((p) => ({
                          ...p,
                          daysOfMonth:
                            p.daysOfMonth.length === allDomValues.length
                              ? []
                              : allDomValues,
                        }));
                      } else {
                        setForm((p) => {
                          const cur = p.daysOfMonth.map(String);
                          return {
                            ...p,
                            daysOfMonth: cur.includes(v)
                              ? cur.filter((d) => d !== v)
                              : [...cur, v],
                          };
                        });
                      }
                    }}
                    cols={7}
                  />
                </FieldRow>
              </>
            )}
          </div>
        </DialogContent>

        <DialogActions
          sx={{
            justifyContent: "center",
            gap: 2,
            py: "10px",
            px: "16px",
            borderTop: `1px solid ${C.cardBorder}`,
            backgroundColor: "#f8fafc",
          }}
        >
          <Btn
            variant="dialogPrimary"
            onClick={handleSave}
            disabled={loading.save}
          >
            {loading.save ? (
              <>
                <CircularProgress size={14} sx={{ color: "#fff" }} />
                Saving...
              </>
            ) : (
              "Save"
            )}
          </Btn>
          <Btn
            variant="dialogCancel"
            onClick={closeModal}
            disabled={loading.save}
          >
            Close
          </Btn>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default TimeCondition;
