import React, { useEffect, useState, useMemo, useRef } from "react";
import {
  CircularProgress,
  Checkbox,
  useMediaQuery,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
} from "@mui/material";
import { CALL_COUNT_FILTER_TOOLTIPS } from "../../constants/CallCountConstants";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import { fetchCdr, deleteCdr, downloadCdr } from "../../api/apiService";

const DEFAULT_FILTERS = {
  callStatus: "all",
  direction: "all",
  search: "",
  trunkName: "",
  callFrom: "",
  callTo: "",
  startDate: "",
  endDate: "",
};

const DEFAULT_MODIFY_DRAFT = {
  trunkName: "",
  callFrom: "",
  callTo: "",
  talkDurationOperator: ">",
  talkDurationSeconds: "",
};

const CALL_STATUS_OPTIONS = [
  { value: "all", label: "All" },
  { value: "answered", label: "Answered" },
  { value: "noanswer", label: "No Answer" },
  { value: "voicemail", label: "Voicemail" },
  { value: "cancelled", label: "Cancelled" },
  { value: "failed", label: "Failed" },
  { value: "ivr", label: "IVR" },
  { value: "call queue", label: "Call Queue" },
  { value: "conference", label: "Conference" },
];

const DIRECTION_OPTIONS = [
  { value: "all", label: "All" },
  { value: "inbound", label: "Inbound" },
  { value: "outbound", label: "Outbound" },
  { value: "local", label: "Local" },
  { value: "forwarded", label: "Forwarded" },
];

const TALK_DURATION_OPERATOR_OPTIONS = [
  { value: "<", label: "<" },
  { value: ">", label: ">" },
  { value: "<=", label: "<=" },
  { value: ">=", label: ">=" },
  { value: "=", label: "=" },
];

const TABLE_COLUMNS = [
  { key: "calldate", label: "Start", width: "12%" },
  { key: "src", label: "Call From", width: "8%", field: "src", titled: true },
  {
    key: "src_ip",
    label: "Call From IP",
    width: "10%",
    field: "src_ip",
    titled: true,
  },
  { key: "dst", label: "Call To", width: "8%", field: "dst", titled: true },
  {
    key: "dst_ip",
    label: "Call To IP",
    width: "10%",
    field: "dst_ip",
    titled: true,
  },
  {
    key: "call_direction",
    label: "Direction",
    width: "6%",
    compact: true,
    type: "direction",
  },
  {
    key: "disposition",
    label: "Call Status",
    width: "8%",
    compact: true,
    type: "disposition",
  },
  {
    key: "billsec",
    label: "Duration",
    width: "7%",
    compact: true,
    type: "duration",
  },
  {
    key: "dcontext",
    label: "Context",
    width: "5%",
    field: "dcontext",
    titled: true,
  },
  {
    key: "hangup_cause",
    label: "Hangup Cause",
    width: "16%",
    field: "hangup_cause",
    titled: true,
    last: true,
  },
];

const normalizeValue = (value) =>
  String(value || "")
    .toLowerCase()
    .trim();

const includesAny = (value, needles) => {
  const text = normalizeValue(value);
  return needles.some((needle) => text.includes(needle));
};

const getCanonicalDirectionFromValue = (value) => {
  const raw = normalizeValue(value);
  if (!raw) return "";

  if (
    raw === "from-external" ||
    raw.startsWith("from-external") ||
    raw.includes("from-trunk") ||
    raw.includes("from-pstn") ||
    raw === "inbound" ||
    raw.includes("inbound")
  ) {
    return "inbound";
  }

  if (
    raw === "from-internal" ||
    raw.startsWith("from-internal") ||
    raw === "local" ||
    raw === "internal" ||
    raw.includes("local") ||
    raw.includes("internal")
  ) {
    return "local";
  }

  if (
    raw === "outbound" ||
    raw.includes("outbound") ||
    raw.includes("outgoing")
  ) {
    return "outbound";
  }

  if (raw === "forwarded" || raw.includes("forwarded")) {
    return "forwarded";
  }

  if (
    raw.includes("voicemail") ||
    raw.includes("ivr") ||
    raw.includes("queue") ||
    raw.includes("conference") ||
    raw.includes("conf")
  ) {
    return "local";
  }

  return raw;
};

const getCanonicalDirections = (row) =>
  Array.from(
    new Set(
      [row.call_direction, row.direction, row.dcontext]
        .map(getCanonicalDirectionFromValue)
        .filter(Boolean),
    ),
  );

const getCanonicalDirection = (row) => getCanonicalDirections(row)[0] || "";

const getCanonicalStatusesFromValue = (value) => {
  const raw = normalizeValue(value);
  const compact = raw.replace(/[\s_-]+/g, "");
  const statuses = [];

  if (!raw) return statuses;

  if (includesAny(raw, ["conference", "confbridge", "conf"])) {
    statuses.push("conference");
  }
  if (includesAny(raw, ["call queue", "queue"])) {
    statuses.push("call queue");
  }
  if (includesAny(raw, ["voicemail", "voice mail", "vm"])) {
    statuses.push("voicemail");
  }
  if (includesAny(raw, ["ivr"])) {
    statuses.push("ivr");
  }

  if (
    raw === "no answer" ||
    raw === "no-answer" ||
    raw === "no_answer" ||
    compact === "noanswer" ||
    raw === "busy" ||
    includesAny(raw, ["miss", "unanswered"])
  ) {
    statuses.push("noanswer");
  }

  if (raw === "answered" || raw === "answer" || raw === "completed") {
    statuses.push("answered");
  }

  if (
    raw === "cancelled" ||
    raw === "canceled" ||
    includesAny(raw, ["cancel"])
  ) {
    statuses.push("cancelled");
  }

  if (
    raw === "failed" ||
    raw === "failure" ||
    raw === "congestion" ||
    raw === "chanunavail" ||
    raw === "channel unavailable" ||
    includesAny(raw, ["fail"])
  ) {
    statuses.push("failed");
  }

  if (!statuses.length) statuses.push(raw);

  return statuses;
};

const getDispositionStatus = (row) => {
  const raw = normalizeValue(row.disposition);
  const compact = raw.replace(/[\s_-]+/g, "");

  if (!raw) return "";
  if (raw === "answered" || raw === "answer" || raw === "completed") {
    return "answered";
  }
  if (
    raw === "no answer" ||
    raw === "no-answer" ||
    raw === "no_answer" ||
    compact === "noanswer" ||
    compact === "noanswered" ||
    raw === "busy" ||
    includesAny(raw, ["miss", "unanswered"])
  ) {
    return "noanswer";
  }
  if (
    raw === "cancelled" ||
    raw === "canceled" ||
    includesAny(raw, ["cancel"])
  ) {
    return "cancelled";
  }
  if (
    raw === "failed" ||
    raw === "failure" ||
    raw === "congestion" ||
    raw === "chanunavail" ||
    raw === "channel unavailable" ||
    includesAny(raw, ["fail"])
  ) {
    return "failed";
  }

  return raw;
};

const getFallbackStatus = (row) =>
  getDispositionStatus({ disposition: row.call_status || row.status });

const getCanonicalCallStatuses = (row) => {
  const dispositionStatus = getDispositionStatus(row) || getFallbackStatus(row);
  const contextStatuses = [row.dcontext, row.hangup_cause].reduce(
    (statuses, value) => [
      ...statuses,
      ...getCanonicalStatusesFromValue(value).filter((status) =>
        ["voicemail", "ivr", "call queue", "conference"].includes(status),
      ),
    ],
    [],
  );

  return Array.from(
    new Set([dispositionStatus, ...contextStatuses].filter(Boolean)),
  );
};

const getDirection = (row) => {
  const direction = getCanonicalDirection(row);
  if (!direction) return "";
  if (direction === "inbound") return "Inbound";
  if (direction === "outbound") return "Outbound";
  if (direction === "local") return "Local";
  if (direction === "forwarded") return "Forwarded";
  return direction.charAt(0).toUpperCase() + direction.slice(1);
};

const formatDuration = (secs) => {
  const s = Number(secs) || 0;
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const pad = (n) => String(n).padStart(2, "0");
  return `${h}:${pad(m)}:${pad(sec)}`;
};

const formatDate = (value) => {
  if (!value) return "";
  try {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;
    const pad = (n) => String(n).padStart(2, "0");
    return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())} ${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:${pad(d.getUTCSeconds())}`;
  } catch {
    return value;
  }
};

const matchesCallStatus = (row, status) => {
  const selectedStatus = normalizeValue(status);
  if (!selectedStatus || selectedStatus === "all") return true;

  if (
    ["answered", "noanswer", "cancelled", "failed"].includes(selectedStatus)
  ) {
    const visibleStatus = getDispositionStatus(row) || getFallbackStatus(row);
    return visibleStatus === selectedStatus;
  }

  return getCanonicalCallStatuses(row).includes(selectedStatus);
};

const matchesDirectionFilter = (row, direction) => {
  const selectedDirection = normalizeValue(direction);
  if (!selectedDirection || selectedDirection === "all") return true;
  return getCanonicalDirection(row) === selectedDirection;
};

const matchesSearch = (row, query) => {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const haystack = [
    row.src,
    row.dst,
    row.src_ip,
    row.dst_ip,
    row.dcontext,
    row.disposition,
    row.hangup_cause,
    row.call_direction,
    row.direction,
  ]
    .map((v) => String(v || "").toLowerCase())
    .join(" ");
  return haystack.includes(q);
};

const matchesFieldIncludes = (row, field, query) => {
  const q = String(query || "")
    .trim()
    .toLowerCase();
  if (!q) return true;
  return String(row[field] || "")
    .toLowerCase()
    .includes(q);
};

const matchesTalkDuration = (row, operator, seconds) => {
  const raw = String(seconds ?? "").trim();
  if (!raw) return true;
  const target = Number(raw);
  if (Number.isNaN(target)) return true;

  const actual = Number(row.duration ?? row.billsec ?? 0);
  if (Number.isNaN(actual)) return false;

  if (operator === "<") return actual < target;
  if (operator === ">") return actual > target;
  if (operator === "<=") return actual <= target;
  if (operator === ">=") return actual >= target;
  return actual === target;
};

const parseRowCallDate = (value) => {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
};

const matchesDateRange = (row, startDate, endDate) => {
  const rowDate = parseRowCallDate(row.calldate);
  if (!rowDate) return !startDate && !endDate;

  if (startDate) {
    const start = new Date(`${startDate}T00:00:00`);
    if (rowDate < start) return false;
  }
  if (endDate) {
    const end = new Date(`${endDate}T23:59:59.999`);
    if (rowDate > end) return false;
  }
  return true;
};

const rowMatchesFilters = (row, filters, talkDuration) =>
  matchesCallStatus(row, filters.callStatus) &&
  matchesDirectionFilter(row, filters.direction) &&
  matchesSearch(row, filters.search) &&
  matchesFieldIncludes(row, "trunk_name", filters.trunkName) &&
  matchesFieldIncludes(row, "src", filters.callFrom) &&
  matchesFieldIncludes(row, "dst", filters.callTo) &&
  matchesTalkDuration(
    row,
    talkDuration.talkDurationOperator,
    talkDuration.talkDurationSeconds,
  ) &&
  matchesDateRange(row, filters.startDate, filters.endDate);

const hasAnyActiveFilter = (filters, talkDurationSeconds) =>
  filters.callStatus !== "all" ||
  filters.direction !== "all" ||
  !!filters.search.trim() ||
  !!filters.trunkName.trim() ||
  !!filters.callFrom.trim() ||
  !!filters.callTo.trim() ||
  !!String(talkDurationSeconds || "").trim() ||
  !!filters.startDate ||
  !!filters.endDate;

const getRowKey = (row, idx) =>
  [
    row.uniqueid,
    row.calldate,
    row.src,
    row.dst,
    row.disposition,
    row.billsec,
    idx,
  ]
    .map((value) => normalizeValue(value))
    .join("|");

const CALL_COUNT_COMPACT_BREAKPOINT = "(max-width: 768px)";
const CHK = {
  padding: "1px",
  color: "var(--text-primary)",
  "&.Mui-checked": { color: "#0284c7" },
  "&.MuiCheckbox-indeterminate": { color: "#0284c7" },
};

const BTN_BASE =
  "inline-flex items-center justify-center gap-1.5 h-[30px] px-3.5 py-1.5 rounded-[10px] text-xs font-semibold whitespace-nowrap transition-all duration-150 cursor-pointer border disabled:cursor-not-allowed disabled:opacity-60";
const BTN_TOOLBAR = `${BTN_BASE} bg-[#cbd5e1] text-[#374151] border-[#cbd5e1] shadow-[0_1px_2px_rgba(15,23,42,0.08)] hover:bg-[#b6c2d3]`;
const BTN_OUTLINE = `${BTN_BASE} bg-[var(--bg-surface)] text-[var(--text-label)] border-[var(--border-strong)] hover:bg-[var(--row-alt)]`;
const BTN_CANCEL = BTN_TOOLBAR;
const BTN_PRIMARY = `${BTN_BASE} min-w-[100px] h-[33px] text-[13px] text-white border-[#5A6F8F] bg-gradient-to-b from-[#5A6F8F] via-[#3E5475] to-[#2C3E57] hover:from-[#3E5475] hover:via-[#5A6F8F] hover:to-[#5A6F8F]`;
const BTN_DIALOG_CANCEL =
  "inline-flex items-center justify-center gap-1.5 min-w-[100px] h-[33px] px-3.5 py-1.5 rounded-[10px] text-[13px] font-semibold whitespace-nowrap transition-all duration-150 cursor-pointer border bg-[#cbd5e1] text-[#374151] border-[#cbd5e1] shadow-[0_1px_2px_rgba(15,23,42,0.08)] hover:bg-[#b6c2d3] disabled:cursor-not-allowed disabled:opacity-60";
const BTN_DIALOG_PRIMARY =
  "inline-flex items-center justify-center gap-1.5 min-w-[100px] h-[33px] px-7 py-1.5 rounded-[10px] text-[13px] font-semibold whitespace-nowrap normal-case transition-all duration-150 cursor-pointer border text-white border-[#5A6F8F] bg-[linear-gradient(to_bottom,#5A6F8F_0%,#3E5475_60%,#2C3E57_100%)] hover:bg-[linear-gradient(to_bottom,#3E5475_0%,#5A6F8F_100%)] disabled:cursor-not-allowed disabled:opacity-60";

const DIALOG_TITLE_FILTER =
  "!m-0 !box-border !flex-[0_0_auto] bg-[#1e2d42] !text-[#ffffff] ![font-family:Roboto,Helvetica,Arial,sans-serif] ![font-size:16px] ![font-weight:600] ![line-height:1.6] ![letter-spacing:0.0075em] !text-center ![padding:16px_24px]";
const TH_BASE =
  "bg-[var(--table-header-bg)] text-[var(--text-label)] font-bold text-[11px] text-center border-b border-r border-[var(--border-strong)] whitespace-nowrap uppercase sticky top-0 z-10 box-border";
const TD_BASE =
  "text-[13px] text-[var(--text-primary)] text-center border-b border-r border-[var(--border-strong)] whitespace-nowrap overflow-hidden text-ellipsis box-border";
const INPUT_BASE =
  "w-full h-[38px] text-[13px] text-[var(--text-primary)] bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[10px] px-3 outline-none font-[Inter,sans-serif] transition-[border-color,box-shadow] duration-200 box-border shadow-none hover:border-[var(--border-strong)] focus:border-[var(--status-primary)] focus:shadow-[0_0_0_1px_var(--status-primary)] placeholder:text-[var(--text-muted)]";

const statusCls = (s) => {
  const v = String(s || "").toLowerCase();
  if (v === "answered") return "text-[#16A34A]";
  if (v === "failed") return "text-[#DC2626]";
  if (v === "busy") return "text-[#92400e]";
  if (v === "no answer" || v === "cancelled") return "text-[#c2410c]";
  return "text-[#64748b]";
};

const btnVariantCls = {
  toolbar: BTN_TOOLBAR,
  outline: BTN_OUTLINE,
  cancel: BTN_CANCEL,
  primary: BTN_PRIMARY,
  "dialog-cancel": BTN_DIALOG_CANCEL,
  "dialog-primary": BTN_DIALOG_PRIMARY,
};

const Btn = ({
  children,
  onClick,
  disabled,
  variant = "outline",
  className = "",
  type,
}) => (
  <button
    type={type}
    onClick={onClick}
    disabled={disabled}
    className={`${btnVariantCls[variant] || BTN_OUTLINE} ${className}`.trim()}
  >
    {children}
  </button>
);

const TH = ({ children, className = "", style }) => (
  <th className={`${TH_BASE} ${className}`.trim()} style={style}>
    {children}
  </th>
);

const PageBreadcrumb = ({ segments, flat }) => (
  <div
    className={`flex items-center flex-wrap gap-[4px] text-[12px] leading-normal text-[#94a3b8] font-normal${flat ? " mb-0" : " mb-4"}`}
  >
    {segments.map((label, i) => (
      <React.Fragment key={`${label}-${i}`}>
        {i > 0 ? <span>&gt;</span> : null}
        <span
          className={
            i === segments.length - 1
              ? "text-[#1e293b] font-semibold"
              : undefined
          }
        >
          {label}
        </span>
      </React.Fragment>
    ))}
  </div>
);

const TableListLoading = () => (
  <div className="flex justify-center items-center p-12">
    <CircularProgress size={28} sx={{ color: "var(--text-primary)" }} />
  </div>
);

const TableListEmptyState = ({
  message,
  onAddNew,
  buttonLabel = "+ Add New",
  showButton = true,
}) => (
  <div className="flex flex-col items-center justify-center min-h-[240px] p-6 text-center">
    <div
      className={`text-[#3e5475] text-[13px] font-semibold${showButton && onAddNew ? " mb-4" : ""}`}
    >
      {message}
    </div>
    {showButton && onAddNew ? (
      <Btn variant="cancel" onClick={onAddNew}>
        {buttonLabel}
      </Btn>
    ) : null}
  </div>
);

const SipPcmPagination = ({
  page,
  totalPages,
  recordCount,
  onPageChange,
  recordLabel = "record",
  compact = false,
}) => (
  <div
    className={`flex items-center justify-between py-[7px] px-3.5 bg-[var(--bg-surface)] border-t border-[var(--border-strong)] rounded-b-[10px] overflow-hidden${compact ? " flex-col items-stretch gap-[10px]" : ""}`}
  >
    <span
      className={`text-[11px] text-[#94a3b8]${compact ? " text-center" : " text-left"}`}
    >
      Showing {recordCount} {recordLabel}
      {recordCount !== 1 ? "s" : ""} on page {page}
    </span>
    <div
      className={`flex gap-2 items-center${compact ? " justify-center flex-wrap" : ""}`}
    >
      <Btn
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        variant="outline"
      >
        ← Prev
      </Btn>
      <span className="text-[11px] font-semibold text-[var(--text-label)] bg-[#e0f2fe] py-[5px] px-3.5 rounded-md border border-[var(--border-strong)]">
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

const Dash = () => <span className="text-[#94a3b8]">—</span>;

const CALL_COUNT_FILTER_TOOLTIP_PROPS = {
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
    arrow: {
      sx: { color: "#fff" },
    },
  },
};

const formatCallCountFilterTooltipTitle = (text) => {
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

const FilterLabel = ({ children, tooltipKey }) => {
  const tooltip = tooltipKey ? CALL_COUNT_FILTER_TOOLTIPS[tooltipKey] : "";
  const label = (
    <span
      className="block text-[11px] font-semibold text-[var(--text-label)] tracking-[0.04em] uppercase mb-[6px]"
      style={{ cursor: tooltip ? "help" : undefined, display: "inline-block" }}
    >
      {children}
    </span>
  );
  if (!tooltip) return label;
  return (
    <Tooltip
      title={formatCallCountFilterTooltipTitle(tooltip)}
      {...CALL_COUNT_FILTER_TOOLTIP_PROPS}
    >
      {label}
    </Tooltip>
  );
};

const FilterField = ({ label, tooltipKey, children, full, style: extraStyle }) => (
  <div
    className={
      full ? "min-w-0 w-full flex-[0_0_auto]" : "min-w-[140px] flex-[0_0_auto]"
    }
    style={extraStyle}
  >
    {label && <FilterLabel tooltipKey={tooltipKey}>{label}</FilterLabel>}
    {children}
  </div>
);

const FilterSelect = ({
  value,
  onChange,
  options,
  "aria-label": ariaLabel,
}) => (
  <select
    value={value}
    onChange={onChange}
    aria-label={ariaLabel}
    className={`${INPUT_BASE} cursor-pointer`}
  >
    {options.map((opt) => (
      <option key={opt.value} value={opt.value}>
        {opt.label}
      </option>
    ))}
  </select>
);

const FilterSearch = ({
  value,
  onChange,
  placeholder = "Extension, number, IP, context, destination…",
}) => (
  <input
    type="text"
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    className={INPUT_BASE}
  />
);

const FilterDate = ({ value, onChange, "aria-label": ariaLabel, small }) => (
  <input
    type="date"
    value={value}
    onChange={onChange}
    aria-label={ariaLabel}
    className={`${INPUT_BASE} cursor-pointer${small ? " rounded-[4px]" : ""}`}
  />
);

const ToolbarActionBtn = ({ onClick, disabled, children }) => (
  <Btn onClick={onClick} disabled={disabled} variant="toolbar">
    {children}
  </Btn>
);

const ModalFilterField = ({ label, tooltipKey, children }) => (
  <FilterField label={label} tooltipKey={tooltipKey} full>
    {children}
  </FilterField>
);

const FiltersActiveSummary = ({
  filteredCount,
  totalCount,
  startDate,
  endDate,
}) => (
  <div className="mt-[14px] pt-[7px] border-t border-[#f1f5f9] text-[12px] text-[#94a3b8] flex items-center gap-2 flex-wrap">
    <span className="bg-[#eff6ff] text-[var(--text-label)] font-semibold py-[4px] px-[10px] text-center rounded-full text-[11px]">
      Filters active
    </span>
    <span>
      Showing {filteredCount} of {totalCount} records on this page
      {(startDate || endDate) && (
        <>
          {" "}
          · {startDate || "…"} to {endDate || "…"}
        </>
      )}
    </span>
  </div>
);

const renderColumnCell = (col, row, helpers) => {
  const { formatDate, formatDuration, getDirection, statusCls: sc } = helpers;
  if (col.type === "direction") {
    const dir = getDirection(row);
    return dir || <Dash />;
  }
  if (col.type === "disposition") {
    if (!row.disposition) return <Dash />;
    return (
      <span
        className={`inline-block py-0.5 px-2 rounded-full text-[10px] font-medium whitespace-nowrap ${sc(row.disposition)}`}
      >
        {row.disposition}
      </span>
    );
  }
  if (col.type === "duration") return formatDuration(row.billsec);
  if (col.key === "calldate") return formatDate(row.calldate);
  const value = row[col.field || col.key];
  return value || <Dash />;
};

const getColumnTitle = (col, row, helpers) => {
  if (col.key === "calldate") return helpers.formatDate(row.calldate);
  if (col.titled) return row[col.field || col.key] || "";
  return undefined;
};

const getCellPadCls = (col) =>
  col.compact ? "py-[7px] px-[3px]" : "py-[7px] px-1.5";
const getHeaderPadCls = (col) =>
  col.compact ? "py-[9px] px-[3px]" : "py-[9px] px-1.5";

const CallCountTableRow = ({
  row,
  idx,
  totalRows,
  isSelected,
  onToggle,
  columns,
  helpers,
}) => {
  const rowBg = isSelected ? "var(--row-selected)" : idx % 2 === 1 ? "var(--row-alt)" : "var(--bg-surface)";
  const isLastRow = idx === totalRows - 1;
  const lastBorder = isLastRow ? " border-b-0" : "";
  return (
    <tr
      style={{ background: rowBg, transition: "background 0.15s ease" }}
      onMouseEnter={(e) => {
        if (!isSelected) e.currentTarget.style.background = "var(--row-alt)";
      }}
      onMouseLeave={(e) => {
        if (!isSelected) e.currentTarget.style.background = rowBg;
      }}
    >
      <td
        className={`${TD_BASE} py-1 px-0 w-[36px] border-l-0${lastBorder}`}
        style={{ background: rowBg }}
      >
        <Checkbox
          size="small"
          disabled={!row.uniqueid}
          checked={!!row.uniqueid && isSelected}
          onChange={onToggle}
          sx={CHK}
        />
      </td>
      {columns.map((col) => (
        <td
          key={col.key}
          title={getColumnTitle(col, row, helpers)}
          className={`${TD_BASE} ${getCellPadCls(col)}${col.last ? " border-r-0" : ""}${lastBorder}`}
          style={{ background: rowBg }}
        >
          {renderColumnCell(col, row, helpers)}
        </td>
      ))}
    </tr>
  );
};

const CallCountTable = ({
  columns,
  filteredData,
  appliedFilters,
  hasActiveFilters,
  allPageSelected,
  somePageSelected,
  selectedIds,
  onToggleAll,
  onToggleRow,
  helpers,
}) => (
  <div className="trunk-table-scroll overflow-x-auto overflow-y-auto flex-1 [-webkit-overflow-scrolling:touch]">
    <table className="w-full min-w-[1070px] border-separate border-spacing-0 table-auto">
      <colgroup>
        <col style={{ width: "2.5%" }} />
        <col style={{ width: "2.5%" }} />
        {columns.map((col) => (
          <col key={col.key} style={{ width: col.width }} />
        ))}
      </colgroup>
      <thead>
        <tr>
          <TH
            className="tracking-[0.14em] p-0 border-l-0"
            style={{ width: 36 }}
          >
            <Checkbox
              size="small"
              checked={allPageSelected}
              indeterminate={somePageSelected}
              onChange={onToggleAll}
              sx={CHK}
            />
          </TH>
          {columns.map((col) => (
            <TH
              key={col.key}
              style={{ width: col.width }}
              className={`tracking-[0.08em] ${getHeaderPadCls(col)}${col.last ? " border-r-0" : ""}`}
            >
              {col.label}
            </TH>
          ))}
        </tr>
      </thead>
      <tbody
        key={`${appliedFilters.callStatus}-${appliedFilters.direction}-${appliedFilters.search}`}
      >
        {filteredData.length === 0 ? (
          <tr>
            <td
              colSpan={columns.length + 2}
              className="text-center py-10 px-4 text-[#94a3b8] text-sm border-b-0"
            >
              {hasActiveFilters
                ? "No records match the current filters on this page."
                : "No records found."}
            </td>
          </tr>
        ) : (
          filteredData.map((row, idx) => (
            <CallCountTableRow
              key={helpers.getRowKey(row, idx)}
              row={row}
              idx={idx}
              totalRows={filteredData.length}
              isSelected={!!row.uniqueid && selectedIds.includes(row.uniqueid)}
              onToggle={() => onToggleRow(row.uniqueid)}
              columns={columns}
              helpers={helpers}
            />
          ))
        )}
      </tbody>
    </table>
  </div>
);

const TABLE_HELPERS = {
  formatDate,
  formatDuration,
  getDirection,
  getRowKey,
  statusCls,
};

const MODAL_FILTER_FIELDS = [
  {
    type: "select",
    label: "Call Status",
    field: "callStatus",
    tooltipKey: "call_status",
    options: CALL_STATUS_OPTIONS,
    syncModify: false,
  },
  {
    type: "select",
    label: "Direction",
    field: "direction",
    tooltipKey: "direction",
    options: DIRECTION_OPTIONS,
    syncModify: false,
  },
  {
    type: "search",
    label: "Call From",
    field: "callFrom",
    tooltipKey: "call_from",
    placeholder: "Call From",
    syncModify: true,
  },
  {
    type: "search",
    label: "Call To",
    field: "callTo",
    tooltipKey: "call_to",
    placeholder: "Call To",
    syncModify: true,
  },
  {
    type: "search",
    label: "Trunk Name",
    field: "trunkName",
    tooltipKey: "trunk_name",
    placeholder: "Trunk Name",
    syncModify: true,
  },
  { type: "talkDuration", label: "Talk Duration", tooltipKey: "talk_duration" },
  { type: "dateRange", label: "Time Range", tooltipKey: "time_range" },
];

const CallCount = () => {
  const isCompact = useMediaQuery(CALL_COUNT_COMPACT_BREAKPOINT);

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const hasInitialLoadRef = useRef(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(50);
  const [selectedIds, setSelectedIds] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [isModifyMode, setIsModifyMode] = useState(false);
  const [showModifyModal, setShowModifyModal] = useState(false);
  const [modifyDraft, setModifyDraft] = useState({ ...DEFAULT_MODIFY_DRAFT });
  const [filterDraft, setFilterDraft] = useState({ ...DEFAULT_FILTERS });
  const [appliedFilters, setAppliedFilters] = useState({ ...DEFAULT_FILTERS });

  const loadCdr = async (pageToLoad = page, filters = appliedFilters) => {
    try {
      setLoading(true);
      setError("");
      const data = await fetchCdr(pageToLoad, limit, {
        startdate: filters.startDate || undefined,
        enddate: filters.endDate || undefined,
        trunk_name: filters.trunkName || undefined,
      });
      if (data?.success && Array.isArray(data.data)) {
        setRows(data.data);
        setLastUpdated(new Date());
      } else {
        setRows([]);
      }
    } catch {
      setError("Failed to load call records. Please try again.");
      setRows([]);
    } finally {
      setLoading(false);
      setIsInitialLoad(false);
    }
  };

  useEffect(() => {
    if (!hasInitialLoadRef.current) {
      hasInitialLoadRef.current = true;
      loadCdr(1);
    }
  }, []);

  const filteredData = useMemo(
    () =>
      rows.filter((row) => rowMatchesFilters(row, appliedFilters, modifyDraft)),
    [
      rows,
      appliedFilters,
      modifyDraft.talkDurationOperator,
      modifyDraft.talkDurationSeconds,
    ],
  );

  const hasActiveFilters = useMemo(
    () => hasAnyActiveFilter(appliedFilters, modifyDraft.talkDurationSeconds),
    [appliedFilters, modifyDraft.talkDurationSeconds],
  );

  const pageIds = useMemo(
    () => filteredData.map((r) => r.uniqueid).filter(Boolean),
    [filteredData],
  );

  const allPageSelected =
    filteredData.length > 0 && pageIds.every((id) => selectedIds.includes(id));

  const somePageSelected =
    pageIds.some((id) => selectedIds.includes(id)) && !allPageSelected;

  const hasNextPage = isModifyMode
    ? filteredData.length >= limit
    : rows.length >= limit;

  const totalPages = Math.max(1, page + (hasNextPage ? 1 : 0));

  const updateSelectFilter = (field, value) => {
    setFilterDraft((f) => ({ ...f, [field]: value }));
    setAppliedFilters((f) => ({ ...f, [field]: value }));
    setPage(1);
  };

  const updateSearchFilter = (field, value) => {
    setModifyDraft((prev) => ({ ...prev, [field]: value }));
    setFilterDraft((f) => ({ ...f, [field]: value }));
    setAppliedFilters((f) => ({ ...f, [field]: value }));
    setPage(1);
  };

  const applyDateFilter = (field, value) => {
    const nextStart = field === "startDate" ? value : filterDraft.startDate;
    const nextEnd = field === "endDate" ? value : filterDraft.endDate;
    if (nextStart && nextEnd && nextStart > nextEnd) {
      setError("Start date cannot be after end date.");
      return;
    }
    setError("");
    const nextFilters = { ...filterDraft, [field]: value };
    setFilterDraft(nextFilters);
    setAppliedFilters(nextFilters);
    setPage(1);
    loadCdr(1, nextFilters);
  };

  const handleResetFilters = () => {
    const resetFilters = { ...DEFAULT_FILTERS };
    setFilterDraft(resetFilters);
    setAppliedFilters(resetFilters);
    setSelectedIds([]);
    setPage(1);
    setError("");
    loadCdr(1, resetFilters);
  };

  const handleModifyOpen = () => {
    setIsModifyMode(true);
    setShowModifyModal(true);
  };

  const handleModifyReset = () => {
    setShowModifyModal(false);
    setIsModifyMode(false);
    setModifyDraft({ ...DEFAULT_MODIFY_DRAFT });
    handleResetFilters();
  };

  const handlePrev = () => {
    if (page <= 1) return;
    const p = page - 1;
    setPage(p);
    loadCdr(p);
  };

  const handleNext = () => {
    const hasMoreRecords = isModifyMode
      ? filteredData.length >= limit
      : rows.length >= limit;
    if (loading || !hasMoreRecords) return;
    const p = page + 1;
    setPage(p);
    loadCdr(p);
  };

  const handleToggleRow = (uniqueid) => {
    if (!uniqueid) return;
    setSelectedIds((prev) =>
      prev.includes(uniqueid)
        ? prev.filter((id) => id !== uniqueid)
        : [...prev, uniqueid],
    );
  };

  const handleToggleAll = () => {
    if (!pageIds.length) return;
    const allSelected = pageIds.every((id) => selectedIds.includes(id));
    setSelectedIds((prev) =>
      allSelected
        ? prev.filter((id) => !pageIds.includes(id))
        : Array.from(new Set([...prev, ...pageIds])),
    );
  };

  const handleDelete = async () => {
    if (!selectedIds.length) {
      window.alert("Please select at least one record to delete.");
      return;
    }
    const msg =
      selectedIds.length === 1
        ? "Are you sure you want to delete this record?"
        : `Are you sure you want to delete ${selectedIds.length} records?`;
    if (!window.confirm(msg)) return;

    try {
      setLoading(true);
      for (const id of selectedIds) {
        try {
          await deleteCdr(id);
        } catch {
          /**/
        }
      }
      setSelectedIds([]);
      await loadCdr(page);
    } catch {
      setError("Failed to delete some records. Please refresh and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    try {
      setLoading(true);
      const response = await downloadCdr();
      const blob = response.data;
      const cd = response.headers?.["content-disposition"] || "";
      let fileName = "cdr.csv";
      const match = /filename\*=UTF-8''([^;]+)|filename="?([^";]+)"?/i.exec(cd);
      if (match)
        fileName = decodeURIComponent(match[1] || match[2] || fileName);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setError("Failed to download CDR file. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const renderModalField = (field) => {
    if (field.type === "select") {
      return (
        <ModalFilterField key={field.field} label={field.label} tooltipKey={field.tooltipKey}>
          <FilterSelect
            aria-label={field.label}
            value={filterDraft[field.field]}
            onChange={(e) => updateSelectFilter(field.field, e.target.value)}
            options={field.options}
          />
        </ModalFilterField>
      );
    }

    if (field.type === "search") {
      return (
        <ModalFilterField key={field.field} label={field.label} tooltipKey={field.tooltipKey}>
          <FilterSearch
            placeholder={field.placeholder}
            value={filterDraft[field.field]}
            onChange={(e) => updateSearchFilter(field.field, e.target.value)}
          />
        </ModalFilterField>
      );
    }

    if (field.type === "talkDuration") {
      return (
        <ModalFilterField key={field.type} label={field.label} tooltipKey={field.tooltipKey}>
          <div className="grid grid-cols-[110px_1fr] gap-2">
            <FilterSelect
              aria-label="Talk Duration Operator"
              value={modifyDraft.talkDurationOperator}
              onChange={(e) =>
                setModifyDraft((prev) => ({
                  ...prev,
                  talkDurationOperator: e.target.value,
                }))
              }
              options={TALK_DURATION_OPERATOR_OPTIONS}
            />
            <input
              type="number"
              min="0"
              value={modifyDraft.talkDurationSeconds}
              onChange={(e) =>
                setModifyDraft((prev) => ({
                  ...prev,
                  talkDurationSeconds: e.target.value,
                }))
              }
              placeholder="Seconds"
              className={INPUT_BASE}
            />
          </div>
        </ModalFilterField>
      );
    }

    if (field.type === "dateRange") {
      return (
        <ModalFilterField key={field.type} label={field.label} tooltipKey={field.tooltipKey}>
          <div className="grid grid-cols-2 gap-2">
            <FilterDate
              aria-label="Start Date"
              value={filterDraft.startDate}
              onChange={(e) => applyDateFilter("startDate", e.target.value)}
              small
            />
            <FilterDate
              aria-label="End Date"
              value={filterDraft.endDate}
              onChange={(e) => applyDateFilter("endDate", e.target.value)}
              small
            />
          </div>
        </ModalFilterField>
      );
    }

    return null;
  };

  return (
    <div
      className={`min-h-[calc(100vh-80px)] bg-[var(--bg-main)] box-border ${isCompact ? "p-3" : "p-4"}`}
    >
      <div className="w-full max-w-full mx-auto">
        {error && (
          <div className="flex items-center justify-between bg-red-50 border-l-[3px] border-l-red-600 text-red-600 py-2.5 px-3.5 rounded-lg mb-4 text-[13px]">
            <span>{error}</span>
            <span
              className="cursor-pointer text-base text-red-600"
              onClick={() => setError("")}
            >
              ✕
            </span>
          </div>
        )}

        <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
          <PageBreadcrumb
            segments={["CDR", "Call Detail Records", "Call Count"]}
            flat
          />
          {lastUpdated && (
            <span className="text-[12px] text-[#94a3b8] whitespace-nowrap">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </span>
          )}
        </div>

        <div className="bg-[var(--bg-surface)] rounded-[10px] overflow-hidden border-[1.5px] border-[var(--border-strong)] shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
          <div
            className={`flex items-center justify-between flex-wrap gap-3 min-h-[44px] py-[7px] px-3.5 border-b border-[var(--border-strong)] bg-[var(--bg-surface)] rounded-t-[10px]${isCompact ? " flex-col items-stretch" : ""}`}
          >
            <div className="flex items-center gap-2.5">
              {selectedIds.length > 0 && (
                <span className="bg-[#eff6ff] text-[var(--text-label)] text-[11px] font-bold py-[5px] px-3 rounded-full border border-[#3E5475]">
                  {selectedIds.length} selected
                </span>
              )}
            </div>

            <div
              className={`flex items-center gap-2.5 flex-wrap${isCompact ? " w-full justify-end" : ""}`}
            >
              {!isModifyMode ? (
                <ToolbarActionBtn onClick={handleModifyOpen} disabled={loading}>
                  Filter
                </ToolbarActionBtn>
              ) : (
                <ToolbarActionBtn
                  onClick={handleModifyReset}
                  disabled={loading}
                >
                  Reset
                </ToolbarActionBtn>
              )}
              <ToolbarActionBtn
                onClick={() => loadCdr(page)}
                disabled={loading}
              >
                {loading ? (
                  <CircularProgress size={16} sx={{ color: "var(--text-secondary)" }} />
                ) : (
                  "Refresh"
                )}
              </ToolbarActionBtn>
              <ToolbarActionBtn
                onClick={handleDelete}
                disabled={loading || selectedIds.length === 0}
              >
                <DeleteOutlineOutlinedIcon sx={{ fontSize: 16 }} />
                Delete
              </ToolbarActionBtn>
              <ToolbarActionBtn onClick={handleDownload} disabled={loading}>
                ⬇ Download CDR
              </ToolbarActionBtn>
            </div>
          </div>

          {isInitialLoad ? (
            <TableListLoading />
          ) : rows.length === 0 && !hasActiveFilters ? (
            <TableListEmptyState
              message="No call records found."
              showButton={false}
            />
          ) : (
            <>
              <CallCountTable
                columns={TABLE_COLUMNS}
                filteredData={filteredData}
                appliedFilters={appliedFilters}
                hasActiveFilters={hasActiveFilters}
                allPageSelected={allPageSelected}
                somePageSelected={somePageSelected}
                selectedIds={selectedIds}
                onToggleAll={handleToggleAll}
                onToggleRow={handleToggleRow}
                helpers={TABLE_HELPERS}
              />

              {filteredData.length > 0 && (
                <SipPcmPagination
                  page={page}
                  totalPages={totalPages}
                  recordCount={filteredData.length}
                  recordLabel="record"
                  compact={isCompact}
                  onPageChange={(p) => {
                    if (p < page) handlePrev();
                    else if (p > page) handleNext();
                  }}
                />
              )}
            </>
          )}
        </div>

        <Dialog
          open={showModifyModal}
          onClose={() => setShowModifyModal(false)}
          maxWidth={false}
          PaperProps={{
            sx: {
              width: 760,
              maxWidth: "96vw",
              mx: "auto",
              p: 0,
              borderRadius: "8px",
              overflow: "hidden",
            },
          }}
        >
          <DialogTitle className={DIALOG_TITLE_FILTER}>
            Filter Call Count
          </DialogTitle>

          <DialogContent className="!m-0 !bg-[var(--bg-surface)] ![padding:24px]">
            <div
              className={`grid gap-[14px] w-full bg-[var(--bg-main)] border border-[var(--border-strong)] rounded-[8px] ![padding:20px] ${isCompact ? "grid-cols-1" : "grid-cols-2"}`}
            >
              {MODAL_FILTER_FIELDS.map(renderModalField)}
            </div>

            {hasActiveFilters && (
              <FiltersActiveSummary
                filteredCount={filteredData.length}
                totalCount={rows.length}
                startDate={appliedFilters.startDate}
                endDate={appliedFilters.endDate}
              />
            )}
          </DialogContent>

          <DialogActions className="!flex !items-center !justify-center !gap-3 !m-0 bg-[var(--bg-main)] ![padding:12px_24px_16px] !border-t !border-[var(--border-strong)]">
            <Btn onClick={handleModifyReset} variant="dialog-cancel">
              Cancel
            </Btn>
            <Btn
              onClick={() => setShowModifyModal(false)}
              variant="dialog-primary"
            >
              Search
            </Btn>
          </DialogActions>
        </Dialog>

        <div
          className={`w-full flex justify-center text-center font-bold text-[#DC2626] ${isCompact ? "mt-[14px] px-1 text-xs" : "mt-5 text-[13px]"}`}
        >
          <span>Only latest 500 records shown</span>
        </div>
      </div>
    </div>
  );
};

export default CallCount;
