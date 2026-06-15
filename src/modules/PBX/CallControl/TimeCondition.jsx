import React, { useEffect, useRef, useState } from "react";
import EditDocumentIcon from "@mui/icons-material/EditDocument";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import {
  Alert,
  Checkbox,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  TextField,
} from "@mui/material";
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
// ── Local page UI (inlined from pbxSharedUi) ──
const C = {
  pageBg: "#f8fafc",
  cardBg: "#ffffff",
  cardBorder: "#9CA3AF",
  labelText: "#3E5475",
  valueText: "#0f172a",
  mutedText: "#94a3b8",
  strongText: "#0f172a",
  accent: "#3E5475",
  amber: "#dc2626",
  errorRed: "#dc2626",
  successGreen: "#16a34a",
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
  const baseBg = extraStyle?.background ?? s.background;
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
    </Component>
  );
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

const pbxModalCancelBtnStyle = {
  minWidth: 100,
  height: 33,
  background: "#cbd5e1",
  color: "#374151",
  border: "1px solid #cbd5e1",
  boxShadow: "0 1px 2px rgba(15, 23, 42, 0.08)",
};

const pbxPageWrapStyle = {
  backgroundColor: C.pageBg,
  minHeight: "calc(100vh - 80px)",
  padding: 16,
  boxSizing: "border-box",
};

const pbxPageInnerStyle = {
  width: "100%",
  maxWidth: "100%",
  margin: "0 auto",
};

const PbxBreadcrumb = ({ section, current, style }) => (
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
      ...style,
    }}
  >
    <span>PBX</span>
    <span>&gt;</span>
    <span>{section}</span>
    <span>&gt;</span>
    <span style={{ color: "#1e293b", fontWeight: 600 }}>{current}</span>
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

const SIP_PCM_TABLE_CARD_RADIUS = 10;

const sipPcmCardStyle = {
  background: "#ffffff",
  borderRadius: SIP_PCM_TABLE_CARD_RADIUS,
  overflow: "hidden",
  border: `1.5px solid ${C.cardBorder}`,
  boxShadow: "0 10px 30px rgba(15, 23, 42, 0.06)",
};

const sipPcmToolbarStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  minHeight: 44,
  padding: "7px 14px",
  borderBottom: `1px solid ${C.cardBorder}`,
  background: "#ffffff",
  flexWrap: "wrap",
  gap: 12,
  borderTopLeftRadius: SIP_PCM_TABLE_CARD_RADIUS,
  borderTopRightRadius: SIP_PCM_TABLE_CARD_RADIUS,
};

const sipPcmPaginationStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "7px 14px",
  background: "#ffffff",
  borderTop: `1px solid ${C.cardBorder}`,
  borderBottomLeftRadius: SIP_PCM_TABLE_CARD_RADIUS,
  borderBottomRightRadius: SIP_PCM_TABLE_CARD_RADIUS,
  overflow: "hidden",
};

const sipPcmSelectedBadgeStyle = {
  background: "#eff6ff",
  color: C.accent,
  fontSize: 11,
  fontWeight: 700,
  padding: "5px 12px",
  borderRadius: 999,
  border: `1px solid ${C.accent}`,
};

const sipPcmCancelBtnStyle = {
  height: 30,
  background: "#cbd5e1",
  color: "#374151",
  border: "1px solid #cbd5e1",
  boxShadow: "0 1px 2px rgba(15, 23, 42, 0.08)",
};

const sipPcmPrimaryBtnStyle = {
  height: 30,
  padding: "6px 14px",
  fontSize: 12,
  borderRadius: 10,
};

const sipPcmPageBadgeStyle = {
  fontSize: 11,
  fontWeight: 600,
  color: C.accent,
  background: "#e0f2fe",
  padding: "5px 14px",
  borderRadius: 6,
  border: `1px solid ${C.cardBorder}`,
};

const SipPcmPagination = ({
  page,
  totalPages,
  recordCount,
  onPageChange,
  recordLabel = "record",
  style,
}) => (
  <div style={{ ...sipPcmPaginationStyle, ...style }}>
    <span style={{ fontSize: 11, color: C.mutedText }}>
      Showing {recordCount} {recordLabel}
      {recordCount !== 1 ? "s" : ""} on page {page}
    </span>
    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
      <Btn
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        variant="outline"
      >
        ← Prev
      </Btn>
      <span style={sipPcmPageBadgeStyle}>
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
    <div style={pbxPageWrapStyle}>
      <div style={pbxPageInnerStyle}>
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

        <div style={sipPcmCardStyle}>
          <div style={sipPcmToolbarStyle}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                flexWrap: "wrap",
              }}
            >
              {selected.length > 0 && (
                <span style={sipPcmSelectedBadgeStyle}>
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
                onClick={handleDelete}
                disabled={
                  loading.delete || loading.fetch || selected.length === 0
                }
                variant="cancel"
                style={sipPcmCancelBtnStyle}
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
                style={sipPcmPrimaryBtnStyle}
              >
                + Add New
              </Btn>
            </div>
          </div>

          <div style={{ overflowX: "auto", overflowY: "auto", flex: 1 }}>
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
            <SipPcmPagination
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
        PaperProps={{
          sx: {
            width: "max-content",
            maxWidth: "96vw",
            mx: "auto",
            borderRadius: "8px",
            boxShadow:
              "0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)",
            backgroundColor: "#ffffff",
            backgroundImage: "none",
          },
        }}
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
              width: "max-content",
              maxWidth: "100%",
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
            variant="primary"
            onClick={handleSave}
            disabled={loading.save}
            style={{ minWidth: 100, height: 33, fontSize: 13 }}
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
            variant="cancel"
            onClick={closeModal}
            disabled={loading.save}
            style={pbxModalCancelBtnStyle}
          >
            Close
          </Btn>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default TimeCondition;
