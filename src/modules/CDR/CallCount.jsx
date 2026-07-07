import React, { useEffect, useState, useMemo, useRef } from "react";
import {
  CircularProgress,
  useMediaQuery,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
} from "@mui/material";
import {
  fetchCdr,
  deleteCdr,
  downloadCdr,
  fetchCdrRecording,
  deleteCdrRecording,
} from "../../api/apiService";
import {
  CALL_COUNT_BREADCRUMB_SEGMENTS,
  CALL_COUNT_COLUMNS,
  CALL_COUNT_COMPACT_MQ,
  CALL_COUNT_DEFAULT_FILTERS,
  CALL_COUNT_DIRECTION_OPTIONS,
  CALL_COUNT_EMPTY_MESSAGE,
  CALL_COUNT_FILTER_MODAL_TITLE,
  CALL_COUNT_FILTER_TOOLTIPS,
  CALL_COUNT_FOOTER_LIMIT_NOTE,
  CALL_COUNT_ITEMS_PER_PAGE,
  CALL_COUNT_MAX_PAGES,
  CALL_COUNT_STATUS_OPTIONS,
  CALL_COUNT_TABLE_MIN_WIDTH,
  CALL_COUNT_TALK_DURATION_OPERATOR_OPTIONS,
} from "../../constants/CallCountConstants";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import PlayArrowOutlinedIcon from "@mui/icons-material/PlayArrowOutlined";
import PauseOutlinedIcon from "@mui/icons-material/PauseOutlined";

// ── Shared PBX UI library (only the byte-identical primitives). CallCount keeps
//    its own Btn, CallCountPagination alias, Pill, and PageBreadcrumb. ──
import {
  C,
  OUTLINED_BORDER,
  OUTLINED_HOVER,
  OUTLINED_FOCUS,
  FOCUS_RING_SHADOW,
} from "../../theme/pbxTokens";
import {
  TH,
  ExtensionTableListLoading as TableListLoading,
  ExtensionTableListEmptyState as TableListEmptyState,
  ExtensionPagination as CallCountPagination,
  extensionPageWrapStyle as pbxPageWrapStyle,
  extensionPageInnerStyle as pbxPageInnerStyle,
  extensionCardStyle as callCountCardStyle,
  extensionToolbarStyle as callCountToolbarStyle,
  extensionSelectedBadgeStyle as callCountSelectedBadgeStyle,
  extensionCancelBtnStyle as callCountCancelBtnStyle,
  RecordingActionBtn,
  RecordingPlayerBar,
} from "../../components/common";

// ── Local page UI (inlined from cdrSharedUi) ────────────────────────────────
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
      fontSize: 15,
      textTransform: "none",
      padding: "6px 28px",
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
  const baseShadow = extraStyle?.boxShadow ?? s.boxShadow ?? "none";
  const Component = component || "button";

  const clearPressStyle = (el) => {
    el.style.transform = "";
    el.style.boxShadow = baseShadow;
  };

  const applyPressStyle = (el) => {
    el.style.background =
      {
        primary: "linear-gradient(to bottom, #2C3E57 0%, #3E5475 100%)",
        cancel: "#a3b1c2",
        danger: "#f87171",
        outline: "#d1d9e6",
        default: "#d1d5db",
      }[variant] || "#d1d5db";
    el.style.transform = "translateY(1px) scale(0.98)";
    el.style.boxShadow =
      variant === "primary"
        ? "inset 0 2px 4px rgba(0, 0, 0, 0.25)"
        : variant === "cancel"
          ? "inset 0 2px 4px rgba(15, 23, 42, 0.15)"
          : "inset 0 1px 3px rgba(15, 23, 42, 0.12)";
  };

  return (
    <Component
      type={type ?? "button"}
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
        userSelect: "none",
        ...s,
        ...extraStyle,
      }}
      onMouseEnter={(e) => {
        if (!disabled) e.currentTarget.style.background = hoverBg;
      }}
      onMouseLeave={(e) => {
        if (!disabled) {
          e.currentTarget.style.background = baseBg;
          clearPressStyle(e.currentTarget);
        }
      }}
      onMouseDown={(e) => {
        if (!disabled) applyPressStyle(e.currentTarget);
      }}
      onMouseUp={(e) => {
        if (!disabled) {
          e.currentTarget.style.background = hoverBg;
          clearPressStyle(e.currentTarget);
        }
      }}
    >
      {children}
    </Component>
  );
};

const PageBreadcrumb = ({ segments, style }) => (
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
    {segments.map((label, index) => (
      <React.Fragment key={`${label}-${index}`}>
        {index > 0 ? <span>&gt;</span> : null}
        <span
          style={
            index === segments.length - 1
              ? { color: "#1e293b", fontWeight: 600 }
              : undefined
          }
        >
          {label}
        </span>
      </React.Fragment>
    ))}
  </div>
);


const callCountToolbarFilterRefreshBtnStyle = {
  ...callCountCancelBtnStyle,
  width: 70,
  boxSizing: "border-box",
};

/** Separator line left of vertical scrollbar only — see index.css `.trunk-table-scroll` */
const TRUNK_TABLE_SCROLL_CLASS = "trunk-table-scroll";

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

// Wider columns for long data; tighter left/right gap on short-value columns
const callCountCellPadding = "7px 6px";
const callCountHeaderPadding = "9px 6px";
const callCountCompactCellPadding = "7px 3px";
const callCountCompactHeaderPadding = "9px 3px";

const callCountTableTdStyle = {
  fontSize: 13,
  color: C.valueText,
  textAlign: "center",
  background: "#ffffff",
  borderBottom: `1px solid ${C.divider}`,
  borderRight: `1px solid ${C.divider}`,
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
  boxSizing: "border-box",
};

const callCountTableThStyle = {
  letterSpacing: "0.08em",
  boxSizing: "border-box",
};

// ── Column definitions ────────────────────────────────────────────────────────
const columns = CALL_COUNT_COLUMNS;

const getCallCountCellPadding = (key) => {
  const col = columns.find((c) => c.key === key);
  return col?.compact ? callCountCompactCellPadding : callCountCellPadding;
};

const getCallCountHeaderPadding = (key) => {
  const col = columns.find((c) => c.key === key);
  return col?.compact ? callCountCompactHeaderPadding : callCountHeaderPadding;
};

const cardBorderSoft = C.divider;

const callCountFilterModalPaperSx = {
  width: 660,
  maxWidth: "96vw",
  mx: "auto",
  p: 0,
  borderRadius: 2,
  overflow: "hidden",
  boxShadow:
    "0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)",
};

const callCountFilterModalTitleStyle = {
  background: "#1e2d42",
  color: "#ffffff",
  fontWeight: 600,
  fontSize: 16,
  textAlign: "center",
  padding: "16px 24px",
  borderTopLeftRadius: 8,
  borderTopRightRadius: 8,
};

const callCountFilterModalFormStyle = {
  width: "100%",
  background: "#f8fafc",
  border: `1px solid ${C.cardBorder}`,
  borderRadius: 8,
  padding: 20,
  boxSizing: "border-box",
};

const callCountFilterModalFooterStyle = {
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

const callCountFilterModalFooterBtnStyle = {
  height: 30,
  padding: "6px 14px",
  fontSize: 12,
  borderRadius: 10,
  minWidth: 100,
};

const callCountFilterModalCancelBtnStyle = {
  ...callCountFilterModalFooterBtnStyle,
  background: "#cbd5e1",
  color: "#374151",
  border: "1px solid #cbd5e1",
  boxShadow: "0 1px 2px rgba(15, 23, 42, 0.08)",
};
// ── Helpers ───────────────────────────────────────────────────────────────────
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

const getCanonicalDirections = (row) => {
  const directions = [row.call_direction, row.direction, row.dcontext]
    .map(getCanonicalDirectionFromValue)
    .filter(Boolean);

  return Array.from(new Set(directions));
};

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
    raw === "no answer" ||
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

  if (!statuses.length) {
    statuses.push(raw);
  }

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

const statusStyle = (s) => {
  const v = String(s || "").toLowerCase();

  if (v === "answered") return { color: "#16A34A" };
  if (v === "failed") return { color: "#DC2626" };
  if (v === "busy") return { color: "#92400e" };

  if (v === "no answer" || v === "cancelled") {
    return { color: "#c2410c" };
  }

  return { color: "#64748b" };
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

const DEFAULT_FILTERS = { ...CALL_COUNT_DEFAULT_FILTERS };

const DEFAULT_APPLIED_MODIFY_DRAFT = {
  talkDurationOperator: ">",
  talkDurationSeconds: "",
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

const matchesTrunkName = (row, trunkName) => {
  const q = String(trunkName || "")
    .trim()
    .toLowerCase();
  if (!q) return true;
  return String(row.trunk_name || "")
    .toLowerCase()
    .includes(q);
};

const matchesCallFrom = (row, callFrom) => {
  const q = String(callFrom || "")
    .trim()
    .toLowerCase();
  if (!q) return true;
  return String(row.src || "")
    .toLowerCase()
    .includes(q);
};

const matchesCallTo = (row, callTo) => {
  const q = String(callTo || "")
    .trim()
    .toLowerCase();
  if (!q) return true;
  return String(row.dst || "")
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

const hasRecording = (row) => {
  const f = row?.recordingfile;
  return typeof f === "string" && f.trim() !== "";
};

// ── Pill badge ────────────────────────────────────────────────────────────────
const Pill = ({ text, bg, color }) => (
  <span
    style={{
      background: bg,
      color,
      padding: "2px 8px",
      borderRadius: 999,
      fontSize: 10,
      fontWeight: 500,
      whiteSpace: "nowrap",
      display: "inline-block",
    }}
  >
    {text}
  </span>
);

const callCountFilterControlBase = {
  height: 36,
  fontSize: 13,
  color: C.valueText,
  background: "#ffffff",
  border: `1px solid ${OUTLINED_BORDER}`,
  borderRadius: 10,
  padding: "0 12px",
  outline: "none",
  fontFamily: "Inter, sans-serif",
  transition: "border-color 0.2s ease, box-shadow 0.2s ease",
  boxSizing: "border-box",
  boxShadow: "none",
};

const callCountFilterBoxStyle = {
  ...callCountFilterControlBase,
  width: "100%",
};

const callCountFilterBoxFillStyle = {
  ...callCountFilterControlBase,
  width: "100%",
  minWidth: 0,
};

const CALL_COUNT_FILTER_FIELD_MAX_WIDTH = 260;
const CALL_COUNT_FILTER_TIME_RANGE_MAX_WIDTH = 260;
const CALL_COUNT_FILTER_COLUMN_GAP = 50;

const callCountFilterModalGridStyle = (isCompact) => ({
  display: "grid",
  gridTemplateColumns: isCompact
    ? `${CALL_COUNT_FILTER_FIELD_MAX_WIDTH}px`
    : `${CALL_COUNT_FILTER_FIELD_MAX_WIDTH}px ${CALL_COUNT_FILTER_FIELD_MAX_WIDTH}px`,
  columnGap: CALL_COUNT_FILTER_COLUMN_GAP,
  rowGap: 8,
  width: "100%",
  justifyContent: "start",
});

const callCountFilterFieldStyle = {
  width: "100%",
  minWidth: 0,
  maxWidth: CALL_COUNT_FILTER_FIELD_MAX_WIDTH,
};

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
      style={{
        fontSize: 11,
        fontWeight: 600,
        color: C.labelText,
        letterSpacing: "0.04em",
        textTransform: "uppercase",
        marginBottom: 6,
        display: "inline-block",
        cursor: tooltip ? "help" : undefined,
      }}
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

const FilterField = ({ label, tooltipKey, children, style: extraStyle }) => (
  <div style={{ ...callCountFilterFieldStyle, ...extraStyle }}>
    {label && <FilterLabel tooltipKey={tooltipKey}>{label}</FilterLabel>}
    {children}
  </div>
);

const FilterSelect = ({
  value,
  onChange,
  options,
  "aria-label": ariaLabel,
  fill = false,
  style: extraStyle,
}) => (
  <select
    value={value}
    onChange={onChange}
    aria-label={ariaLabel}
    style={{
      ...(fill ? callCountFilterBoxFillStyle : callCountFilterBoxStyle),
      cursor: "pointer",
      ...extraStyle,
    }}
    {...nativeFieldInteraction}
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
    style={callCountFilterBoxStyle}
    {...nativeFieldInteraction}
  />
);

const FilterDate = ({
  value,
  onChange,
  "aria-label": ariaLabel,
  fill = false,
  style: extraStyle,
}) => (
  <input
    type="date"
    value={value}
    onChange={onChange}
    aria-label={ariaLabel}
    style={{
      ...(fill ? callCountFilterBoxFillStyle : callCountFilterBoxStyle),
      cursor: "pointer",
      ...extraStyle,
    }}
    {...nativeFieldInteraction}
  />
);

const CallCount = () => {
  const isCompact = useMediaQuery(CALL_COUNT_COMPACT_MQ);

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const hasInitialLoadRef = useRef(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(CALL_COUNT_ITEMS_PER_PAGE);
  const [selectedIds, setSelectedIds] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [showModifyModal, setShowModifyModal] = useState(false);
  const [modifyDraft, setModifyDraft] = useState({
    trunkName: "",
    callFrom: "",
    callTo: "",
    ...DEFAULT_APPLIED_MODIFY_DRAFT,
  });

  const [filterDraft, setFilterDraft] = useState({ ...DEFAULT_FILTERS });
  const [appliedFilters, setAppliedFilters] = useState({ ...DEFAULT_FILTERS });
  const [appliedModifyDraft, setAppliedModifyDraft] = useState({
    ...DEFAULT_APPLIED_MODIFY_DRAFT,
  });
  const [recording, setRecording] = useState({
    uniqueid: null,
    url: "",
    loading: false,
  });
  const audioRef = useRef(null);
  const recordingUrlRef = useRef("");

  useEffect(() => {
    recordingUrlRef.current = recording.url;
  }, [recording.url]);

  useEffect(
    () => () => {
      if (recordingUrlRef.current) URL.revokeObjectURL(recordingUrlRef.current);
    },
    [],
  );

  useEffect(() => {
    if (recording.url && audioRef.current) {
      audioRef.current.play().catch(() => {});
    }
  }, [recording.url]);

  const stopRecording = () => {
    if (recordingUrlRef.current) URL.revokeObjectURL(recordingUrlRef.current);
    setRecording({ uniqueid: null, url: "", loading: false });
  };

  const handlePlayRecording = async (row) => {
    const uniqueid = row?.uniqueid;
    if (!uniqueid) return;
    if (recording.uniqueid === uniqueid && recording.url) {
      stopRecording();
      return;
    }
    if (recordingUrlRef.current) URL.revokeObjectURL(recordingUrlRef.current);
    setError("");
    setRecording({ uniqueid, url: "", loading: true });
    try {
      const blob = await fetchCdrRecording(uniqueid);
      const url = URL.createObjectURL(blob);
      setRecording({ uniqueid, url, loading: false });
    } catch (err) {
      const status = err?.response?.status;
      setError(
        status === 404
          ? "Recording not found for this call."
          : "Failed to load recording. Please try again.",
      );
      setRecording({ uniqueid: null, url: "", loading: false });
    }
  };

  const handleDeleteRecording = async (row) => {
    const uniqueid = row?.uniqueid;
    if (!uniqueid) return;
    if (
      !window.confirm(
        "Delete the recording for this call? This cannot be undone.",
      )
    ) {
      return;
    }
    try {
      setLoading(true);
      const res = await deleteCdrRecording(uniqueid);
      if (res && res.response === false) {
        setError(res.message || "Failed to delete recording.");
        return;
      }
      if (recording.uniqueid === uniqueid) stopRecording();
      setRows((prev) =>
        prev.map((r) =>
          r.uniqueid === uniqueid ? { ...r, recordingfile: "" } : r,
        ),
      );
    } catch {
      setError("Failed to delete recording. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const loadCdr = async (pageToLoad = page, filters = appliedFilters) => {
    try {
      setLoading(true);
      setError("");
      const data = await fetchCdr(pageToLoad, limit, {
        startdate: filters.startDate || undefined,
        enddate: filters.endDate || undefined,
        trunk_name: filters.trunkName || undefined,
      });
      if (data && data.success && Array.isArray(data.data)) {
        const pageRows = data.data;
        setRows(pageRows);
        setLastUpdated(new Date());
        const rowCount = pageRows.length;
        setTotalPages((prev) => {
          if (rowCount < limit) {
            return Math.max(1, pageToLoad);
          }
          return Math.min(
            CALL_COUNT_MAX_PAGES,
            Math.max(prev, pageToLoad + 1),
          );
        });
      } else {
        setRows([]);
        setTotalPages(1);
      }
    } catch {
      setError("Failed to load call records. Please try again.");
      setRows([]);
      setTotalPages(1);
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

  const handlePageChange = (nextPage) => {
    const next = Math.min(totalPages, Math.max(1, nextPage));
    if (next === page || loading) return;
    setPage(next);
    loadCdr(next);
  };

  const handleToggleRow = (uniqueid) => {
    const id = String(uniqueid ?? "");
    if (!id) return;
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const filteredData = useMemo(() => {
    return rows.filter((row) => {
      if (!matchesCallStatus(row, appliedFilters.callStatus)) return false;
      if (!matchesDirectionFilter(row, appliedFilters.direction)) return false;
      if (!matchesSearch(row, appliedFilters.search)) return false;
      if (!matchesTrunkName(row, appliedFilters.trunkName)) return false;
      if (!matchesCallFrom(row, appliedFilters.callFrom)) return false;
      if (!matchesCallTo(row, appliedFilters.callTo)) return false;
      if (
        !matchesTalkDuration(
          row,
          appliedModifyDraft.talkDurationOperator,
          appliedModifyDraft.talkDurationSeconds,
        )
      ) {
        return false;
      }
      if (
        !matchesDateRange(row, appliedFilters.startDate, appliedFilters.endDate)
      ) {
        return false;
      }
      return true;
    });
  }, [
    rows,
    appliedFilters,
    appliedModifyDraft.talkDurationOperator,
    appliedModifyDraft.talkDurationSeconds,
  ]);

  const handleToggleAll = () => {
    const pageIds = filteredData
      .map((r) => String(r.uniqueid ?? ""))
      .filter(Boolean);
    if (!pageIds.length) return;
    const allSelected = pageIds.every((id) => selectedIds.includes(id));
    setSelectedIds((prev) =>
      allSelected
        ? prev.filter((id) => !pageIds.includes(id))
        : Array.from(new Set([...prev, ...pageIds])),
    );
  };

  const handleClearAll = () => {
    setSelectedIds([]);
  };

  const hasActiveFilters = useMemo(() => {
    return (
      appliedFilters.callStatus !== "all" ||
      appliedFilters.direction !== "all" ||
      !!appliedFilters.search.trim() ||
      !!appliedFilters.trunkName.trim() ||
      !!appliedFilters.callFrom.trim() ||
      !!appliedFilters.callTo.trim() ||
      !!String(appliedModifyDraft.talkDurationSeconds || "").trim() ||
      !!appliedFilters.startDate ||
      !!appliedFilters.endDate
    );
  }, [appliedFilters, appliedModifyDraft.talkDurationSeconds]);

  const updateFilterDraftDate = (field, value) => {
    const nextStart = field === "startDate" ? value : filterDraft.startDate;
    const nextEnd = field === "endDate" ? value : filterDraft.endDate;
    if (nextStart && nextEnd && nextStart > nextEnd) {
      setError("Start date cannot be after end date.");
      return;
    }
    setError("");
    setFilterDraft((f) => ({ ...f, [field]: value }));
  };

  const handleResetFilters = () => {
    const resetFilters = { ...DEFAULT_FILTERS };
    setFilterDraft(resetFilters);
    setAppliedFilters(resetFilters);
    setAppliedModifyDraft({ ...DEFAULT_APPLIED_MODIFY_DRAFT });
    setModifyDraft({
      trunkName: "",
      callFrom: "",
      callTo: "",
      ...DEFAULT_APPLIED_MODIFY_DRAFT,
    });
    setSelectedIds([]);
    setPage(1);
    setTotalPages(1);
    setError("");
    loadCdr(1, resetFilters);
  };

  const handleModifyOpen = () => {
    setFilterDraft({ ...appliedFilters });
    setModifyDraft((m) => ({
      ...m,
      talkDurationOperator: appliedModifyDraft.talkDurationOperator,
      talkDurationSeconds: appliedModifyDraft.talkDurationSeconds,
    }));
    setShowModifyModal(true);
  };

  const handleFilterSearch = () => {
    const { startDate, endDate } = filterDraft;
    if (startDate && endDate && startDate > endDate) {
      setError("Start date cannot be after end date.");
      return;
    }
    setError("");
    setAppliedFilters({ ...filterDraft });
    setAppliedModifyDraft({
      talkDurationOperator: modifyDraft.talkDurationOperator,
      talkDurationSeconds: modifyDraft.talkDurationSeconds,
    });
    setPage(1);
    setTotalPages(1);
    loadCdr(1, filterDraft);
    setShowModifyModal(false);
  };

  const handleFilterCancel = () => {
    setFilterDraft({ ...appliedFilters });
    setModifyDraft((m) => ({
      ...m,
      talkDurationOperator: appliedModifyDraft.talkDurationOperator,
      talkDurationSeconds: appliedModifyDraft.talkDurationSeconds,
    }));
    setShowModifyModal(false);
  };

  const handleModifyReset = () => {
    setShowModifyModal(false);
    handleResetFilters();
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

  return (
    <div style={{ ...pbxPageWrapStyle, padding: isCompact ? 12 : 16 }}>
      <div style={pbxPageInnerStyle}>
        {/* Error banner */}
        {error && (
          <div
            style={{
              background: "#fef2f2",
              borderLeft: `3px solid ${C.amber}`,
              color: "#DC2626",
              padding: "10px 14px",
              borderRadius: 8,
              marginBottom: 16,
              fontSize: 13,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <span>{error}</span>
            <span
              onClick={() => setError("")}
              style={{ cursor: "pointer", fontSize: 16, color: "#DC2626" }}
            >
              ✕
            </span>
          </div>
        )}

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 12,
            marginBottom: 16,
          }}
        >
          <PageBreadcrumb
            segments={CALL_COUNT_BREADCRUMB_SEGMENTS}
            style={{ marginBottom: 0 }}
          />
          {lastUpdated && (
            <span
              style={{ fontSize: 12, color: C.mutedText, whiteSpace: "nowrap" }}
            >
              Last updated: {lastUpdated.toLocaleTimeString()}
            </span>
          )}
        </div>

        <div style={callCountCardStyle}>
          <div
            style={{
              ...callCountToolbarStyle,
              ...(isCompact
                ? { flexDirection: "column", alignItems: "stretch" }
                : {}),
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              {selectedIds.length > 0 && (
                <span style={callCountSelectedBadgeStyle}>
                  {selectedIds.length} selected
                </span>
              )}
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                flexWrap: "wrap",
                ...(isCompact
                  ? { width: "100%", justifyContent: "flex-end" }
                  : {}),
              }}
            >
              {!hasActiveFilters ? (
                <Btn
                  onClick={handleModifyOpen}
                  disabled={loading}
                  variant="cancel"
                  style={callCountToolbarFilterRefreshBtnStyle}
                >
                  Filter
                </Btn>
              ) : (
                <Btn
                  onClick={handleModifyReset}
                  disabled={loading}
                  variant="cancel"
                  style={callCountToolbarFilterRefreshBtnStyle}
                >
                  Reset
                </Btn>
              )}
              <Btn
                onClick={() => loadCdr(page)}
                disabled={loading}
                variant="cancel"
                style={callCountToolbarFilterRefreshBtnStyle}
              >
                {loading ? (
                  <CircularProgress size={11} style={{ color: "#374151" }} />
                ) : (
                  "Refresh"
                )}
              </Btn>
              <Btn
                onClick={handleDelete}
                disabled={loading || selectedIds.length === 0}
                variant="cancel"
                style={callCountCancelBtnStyle}
              >
                <DeleteOutlineOutlinedIcon sx={{ fontSize: 16 }} />
                Delete
              </Btn>
              <Btn
                type="button"
                onClick={handleToggleAll}
                disabled={filteredData.length === 0}
                variant="cancel"
                style={callCountCancelBtnStyle}
              >
                Select All
              </Btn>
              <Btn
                type="button"
                onClick={handleClearAll}
                variant="cancel"
                style={callCountCancelBtnStyle}
              >
                Clear All
              </Btn>
              <Btn
                onClick={handleDownload}
                disabled={loading}
                variant="cancel"
                style={callCountCancelBtnStyle}
              >
                ⬇ Download CDR
              </Btn>
            </div>
          </div>

          {isInitialLoad ? (
            <TableListLoading />
          ) : rows.length === 0 && !hasActiveFilters ? (
            <TableListEmptyState
              message={CALL_COUNT_EMPTY_MESSAGE}
              showButton={false}
            />
          ) : (
            <>
              <div
                className={TRUNK_TABLE_SCROLL_CLASS}
                style={{
                  overflowX: "auto",
                  overflowY: "auto",
                  flex: 1,
                  WebkitOverflowScrolling: "touch",
                }}
              >
                <table
                  style={{
                    width: "100%",
                    minWidth: CALL_COUNT_TABLE_MIN_WIDTH,
                    borderCollapse: "separate",
                    borderSpacing: 0,
                    tableLayout: "auto",
                  }}
                >
                  <colgroup>
                    {columns.map((col) => (
                      <col key={col.key} style={{ width: col.width }} />
                    ))}
                  </colgroup>
                  <thead>
                    <tr>
                      {columns.map((col, colIdx) => (
                        <TH
                          key={col.key}
                          style={{
                            ...callCountTableThStyle,
                            width: col.width,
                            padding: getCallCountHeaderPadding(col.key),
                            position: "sticky",
                            top: 0,
                            zIndex: 10,
                            ...(colIdx === 0 ? { borderLeft: "none" } : {}),
                            ...(colIdx === columns.length - 1
                              ? { borderRight: "none" }
                              : {}),
                          }}
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
                          colSpan={columns.length}
                          style={{
                            textAlign: "center",
                            padding: "40px 16px",
                            color: C.mutedText,
                            fontSize: 14,
                            borderBottom: "none",
                          }}
                        >
                          {hasActiveFilters
                            ? "No records match the current filters on this page."
                            : "No records found."}
                        </td>
                      </tr>
                    ) : (
                      filteredData.map((row, idx) => {
                        const isLastRow = idx === filteredData.length - 1;
                        const lastRowCellStyle = isLastRow
                          ? { borderBottom: "none" }
                          : {};
                        const isSelected =
                          row.uniqueid &&
                          selectedIds.includes(String(row.uniqueid));
                        const rowBg = isSelected
                          ? "#eff6ff"
                          : idx % 2 === 1
                            ? "#f8fafc"
                            : "#ffffff";

                        return (
                          <tr
                            key={`${getRowKey(row, idx)}-${isSelected ? "1" : "0"}`}
                            onClick={() => {
                              if (row.uniqueid) {
                                handleToggleRow(String(row.uniqueid));
                              }
                            }}
                            style={{
                              background: rowBg,
                              transition: "background 0.15s ease",
                              cursor: row.uniqueid ? "pointer" : "default",
                            }}
                            onMouseEnter={(e) => {
                              if (!isSelected) {
                                e.currentTarget.style.background = "#f1f5f9";
                              }
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = rowBg;
                            }}
                          >
                            <td
                              title={formatDate(row.calldate)}
                              style={{
                                ...callCountTableTdStyle,
                                padding: getCallCountCellPadding("calldate"),
                                background: "inherit",
                                borderLeft: "none",
                                ...lastRowCellStyle,
                              }}
                            >
                              {formatDate(row.calldate)}
                            </td>

                            <td
                              title={row.src || ""}
                              style={{
                                ...callCountTableTdStyle,
                                padding: getCallCountCellPadding("src"),
                                background: "inherit",
                                ...lastRowCellStyle,
                              }}
                            >
                              {row.src || (
                                <span style={{ color: C.mutedText }}>—</span>
                              )}
                            </td>

                            <td
                              title={row.src_ip || ""}
                              style={{
                                ...callCountTableTdStyle,
                                padding: getCallCountCellPadding("src_ip"),
                                background: "inherit",
                                ...lastRowCellStyle,
                              }}
                            >
                              {row.src_ip || (
                                <span style={{ color: C.mutedText }}>—</span>
                              )}
                            </td>

                            <td
                              title={row.dst || ""}
                              style={{
                                ...callCountTableTdStyle,
                                padding: getCallCountCellPadding("dst"),
                                background: "inherit",
                                ...lastRowCellStyle,
                              }}
                            >
                              {row.dst || (
                                <span style={{ color: C.mutedText }}>—</span>
                              )}
                            </td>

                            <td
                              title={row.dst_ip || ""}
                              style={{
                                ...callCountTableTdStyle,
                                padding: getCallCountCellPadding("dst_ip"),
                                background: "inherit",
                                ...lastRowCellStyle,
                              }}
                            >
                              {row.dst_ip || (
                                <span style={{ color: C.mutedText }}>—</span>
                              )}
                            </td>

                            <td
                              style={{
                                ...callCountTableTdStyle,
                                padding:
                                  getCallCountCellPadding("call_direction"),
                                background: "inherit",
                                ...lastRowCellStyle,
                              }}
                            >
                              {getDirection(row) || (
                                <span style={{ color: C.mutedText }}>—</span>
                              )}
                            </td>

                            <td
                              style={{
                                ...callCountTableTdStyle,
                                padding: getCallCountCellPadding("disposition"),
                                background: "inherit",
                                ...lastRowCellStyle,
                              }}
                            >
                              {row.disposition ? (
                                (() => {
                                  const s = statusStyle(row.disposition);
                                  return (
                                    <Pill
                                      text={row.disposition}
                                      bg={s.bg}
                                      color={s.color}
                                    />
                                  );
                                })()
                              ) : (
                                <span style={{ color: C.mutedText }}>—</span>
                              )}
                            </td>

                            <td
                              style={{
                                ...callCountTableTdStyle,
                                padding: getCallCountCellPadding("billsec"),
                                background: "inherit",
                                ...lastRowCellStyle,
                              }}
                            >
                              {formatDuration(row.billsec)}
                            </td>

                            <td
                              title={row.dcontext || ""}
                              style={{
                                ...callCountTableTdStyle,
                                padding: getCallCountCellPadding("dcontext"),
                                background: "inherit",
                                ...lastRowCellStyle,
                              }}
                            >
                              {row.dcontext || (
                                <span style={{ color: C.mutedText }}>—</span>
                              )}
                            </td>

                            <td
                              title={row.hangup_cause || ""}
                              style={{
                                ...callCountTableTdStyle,
                                padding:
                                  getCallCountCellPadding("hangup_cause"),
                                background: "inherit",
                                ...lastRowCellStyle,
                              }}
                            >
                              {row.hangup_cause || (
                                <span style={{ color: C.mutedText }}>—</span>
                              )}
                            </td>

                            <td
                              style={{
                                ...callCountTableTdStyle,
                                padding: getCallCountCellPadding("recording"),
                                background: "inherit",
                                borderRight: "none",
                                whiteSpace: "nowrap",
                                overflow: "visible",
                                ...lastRowCellStyle,
                              }}
                            >
                              {hasRecording(row) ? (
                                <div
                                  onClick={(e) => e.stopPropagation()}
                                  style={{
                                    display: "inline-flex",
                                    gap: 6,
                                    justifyContent: "center",
                                  }}
                                >
                                  <RecordingActionBtn
                                    variant="play"
                                    title={
                                      recording.uniqueid === row.uniqueid &&
                                      recording.url
                                        ? "Stop"
                                        : "Play recording"
                                    }
                                    onClick={() => handlePlayRecording(row)}
                                    disabled={
                                      recording.loading &&
                                      recording.uniqueid === row.uniqueid
                                    }
                                  >
                                    {recording.loading &&
                                    recording.uniqueid === row.uniqueid ? (
                                      <CircularProgress
                                        size={13}
                                        sx={{ color: C.accent }}
                                      />
                                    ) : recording.uniqueid === row.uniqueid &&
                                      recording.url ? (
                                      <PauseOutlinedIcon
                                        sx={{ fontSize: 14 }}
                                      />
                                    ) : (
                                      <PlayArrowOutlinedIcon
                                        sx={{ fontSize: 14 }}
                                      />
                                    )}
                                  </RecordingActionBtn>
                                  <RecordingActionBtn
                                    variant="delete"
                                    title="Delete recording"
                                    onClick={() => handleDeleteRecording(row)}
                                  >
                                    <DeleteOutlineOutlinedIcon
                                      sx={{ fontSize: 14 }}
                                    />
                                  </RecordingActionBtn>
                                </div>
                              ) : (
                                <span style={{ color: C.mutedText }}>—</span>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {filteredData.length > 0 && (
                <CallCountPagination
                  page={page}
                  totalPages={totalPages}
                  recordCount={filteredData.length}
                  recordLabel="record"
                  onPageChange={handlePageChange}
                />
              )}
            </>
          )}
        </div>

        <RecordingPlayerBar
          ref={audioRef}
          open={Boolean(recording.url || recording.loading)}
          loading={recording.loading}
          label="Recording"
          src={recording.url}
          onEnded={stopRecording}
          onClose={stopRecording}
          isCompact={isCompact}
          accentColor={C.accent}
        />

        <Dialog
          open={showModifyModal}
          onClose={() => setShowModifyModal(false)}
          maxWidth={false}
          PaperProps={{ sx: callCountFilterModalPaperSx }}
        >
          <DialogTitle style={callCountFilterModalTitleStyle}>
            {CALL_COUNT_FILTER_MODAL_TITLE}
          </DialogTitle>

          <DialogContent
            style={{ padding: "24px", backgroundColor: "#ffffff" }}
          >
            <div style={callCountFilterModalFormStyle}>
              <div style={callCountFilterModalGridStyle(isCompact)}>
                <FilterField label="Call Status" tooltipKey="call_status">
                  <FilterSelect
                    aria-label="Call Status"
                    value={filterDraft.callStatus}
                    onChange={(e) => {
                      const value = e.target.value;
                      setFilterDraft((f) => ({ ...f, callStatus: value }));
                    }}
                    options={CALL_COUNT_STATUS_OPTIONS}
                  />
                </FilterField>

                <FilterField label="Direction" tooltipKey="direction">
                  <FilterSelect
                    aria-label="Direction"
                    value={filterDraft.direction}
                    onChange={(e) => {
                      const value = e.target.value;
                      setFilterDraft((f) => ({ ...f, direction: value }));
                    }}
                    options={CALL_COUNT_DIRECTION_OPTIONS}
                  />
                </FilterField>

                <FilterField label="Call From" tooltipKey="call_from">
                  <FilterSearch
                    placeholder="Call From"
                    value={filterDraft.callFrom}
                    onChange={(e) => {
                      const value = e.target.value;
                      setFilterDraft((f) => ({ ...f, callFrom: value }));
                    }}
                  />
                </FilterField>

                <FilterField label="Call To" tooltipKey="call_to">
                  <FilterSearch
                    placeholder="Call To"
                    value={filterDraft.callTo}
                    onChange={(e) => {
                      const value = e.target.value;
                      setFilterDraft((f) => ({ ...f, callTo: value }));
                    }}
                  />
                </FilterField>

                <FilterField label="Trunk Name" tooltipKey="trunk_name">
                  <FilterSearch
                    placeholder="Trunk Name"
                    value={filterDraft.trunkName}
                    onChange={(e) => {
                      const value = e.target.value;
                      setFilterDraft((f) => ({ ...f, trunkName: value }));
                    }}
                  />
                </FilterField>

                <FilterField label="Talk Duration" tooltipKey="talk_duration">
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "72px 1fr",
                      gap: 8,
                      width: "100%",
                    }}
                  >
                    <FilterSelect
                      aria-label="Talk Duration Operator"
                      fill
                      value={modifyDraft.talkDurationOperator}
                      onChange={(e) =>
                        setModifyDraft((prev) => ({
                          ...prev,
                          talkDurationOperator: e.target.value,
                        }))
                      }
                      options={CALL_COUNT_TALK_DURATION_OPERATOR_OPTIONS}
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
                      style={callCountFilterBoxFillStyle}
                      {...nativeFieldInteraction}
                    />
                  </div>
                </FilterField>

                <FilterField
                  label="Time Range"
                  tooltipKey="time_range"
                  style={{ maxWidth: CALL_COUNT_FILTER_TIME_RANGE_MAX_WIDTH }}
                >
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 8,
                      width: "100%",
                    }}
                  >
                    <FilterDate
                      fill
                      aria-label="Start Date"
                      value={filterDraft.startDate}
                      onChange={(e) =>
                        updateFilterDraftDate("startDate", e.target.value)
                      }
                    />
                    <FilterDate
                      fill
                      aria-label="End Date"
                      value={filterDraft.endDate}
                      onChange={(e) =>
                        updateFilterDraftDate("endDate", e.target.value)
                      }
                    />
                  </div>
                </FilterField>
              </div>

              {hasActiveFilters && (
                <div
                  style={{
                    marginTop: 14,
                    paddingTop: 7,
                    borderTop: `1px solid ${cardBorderSoft}`,
                    fontSize: 12,
                    color: C.mutedText,
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    flexWrap: "wrap",
                    width: "100%",
                  }}
                >
                  <span
                    style={{
                      background: "#eff6ff",
                      color: C.accent,
                      fontWeight: 600,
                      padding: "4px 10px",
                      textAlign: "center",
                      borderRadius: 999,
                      fontSize: 11,
                    }}
                  >
                    Filters active
                  </span>
                  <span>
                    Showing {filteredData.length} of {rows.length} records on
                    this page
                    {(appliedFilters.startDate || appliedFilters.endDate) && (
                      <>
                        {" "}
                        · {appliedFilters.startDate || "…"} to{" "}
                        {appliedFilters.endDate || "…"}
                      </>
                    )}
                  </span>
                </div>
              )}
            </div>
          </DialogContent>

          <DialogActions
            sx={{ p: 0, m: 0 }}
            style={callCountFilterModalFooterStyle}
          >
            <Btn
              onClick={handleFilterSearch}
              variant="primary"
              style={callCountFilterModalFooterBtnStyle}
            >
              Search
            </Btn>
            <Btn
              onClick={handleFilterCancel}
              variant="cancel"
              style={callCountFilterModalCancelBtnStyle}
            >
              Cancel
            </Btn>
          </DialogActions>
        </Dialog>

        <div
          style={{
            width: "100%",
            display: "flex",
            justifyContent: "center",
            marginTop: isCompact ? 14 : 20,
            padding: isCompact ? "0 4px" : 0,
            fontSize: isCompact ? 12 : 13,
            fontWeight: 700,
            color: "#DC2626",
            textAlign: "center",
          }}
        >
          <span>{CALL_COUNT_FOOTER_LIMIT_NOTE}</span>
        </div>
      </div>
    </div>
  );
};

export default CallCount;
