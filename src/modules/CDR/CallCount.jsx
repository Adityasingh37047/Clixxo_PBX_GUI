import React, { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { CircularProgress, Checkbox } from "@mui/material";
import { fetchCdr, deleteCdr, downloadCdr } from "../../api/apiService";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import {
  C,
  Btn,
  TH,
  tdStyle,
  checkboxSx,
  PageBreadcrumb,
  pbxPageWrapStyle,
  pbxPageInnerStyle,
  TableListLoading,
  TableListEmptyState,
} from "../../sections/numManipulate/numManipulateSharedUi";
import {
  sipPcmCardStyle,
  sipPcmToolbarStyle,
  sipPcmSelectedBadgeStyle,
  sipPcmCancelBtnStyle,
  SipPcmPagination,
} from "../../sections/sip/sipPcmSharedUi";
import {
  TRUNK_TABLE_SCROLL_CLASS,
  trunkTableScrollStyle,
  trunkTableInnerStyle,
} from "../../sections/trunk/trunkSharedUi";

// ── Column definitions ────────────────────────────────────────────────────────
const columns = [
  { key: "calldate", label: "Start", width: "120px" },
  { key: "src", label: "Call From", width: "100px" },
  { key: "src_ip", label: "Call From IP", width: "100px" },
  { key: "dst", label: "Call To", width: "100px" },
  { key: "dst_ip", label: "Call To IP", width: "110px" },
  { key: "call_direction", label: "Direction", width: "80px" },
  { key: "disposition", label: "Call Status", width: "90px" },
  { key: "billsec", label: "Duration", width: "90px" },
  { key: "hangup_cause", label: "Hangup Cause", width: "110px" },
];

const cardBorderSoft = "#f1f5f9";
// ── Helpers ───────────────────────────────────────────────────────────────────
const normalizeValue = (value) => String(value || "").toLowerCase().trim();

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
  const directions = [
    row.call_direction,
    row.direction,
    row.dcontext,
  ]
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

  if (
    raw === "answered" ||
    raw === "answer" ||
    raw === "completed"
  ) {
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
  if (
    raw === "answered" ||
    raw === "answer" ||
    raw === "completed"
  ) {
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
  const contextStatuses = [
    row.dcontext,
    row.hangup_cause,
  ].reduce(
    (statuses, value) => [
      ...statuses,
      ...getCanonicalStatusesFromValue(value).filter((status) =>
        ["voicemail", "ivr", "call queue", "conference"].includes(status),
      ),
    ],
    [],
  );

  return Array.from(
    new Set(
      [dispositionStatus, ...contextStatuses].filter(Boolean),
    ),
  );
};

const getDirection = (row) => {
  const direction = getCanonicalDirection(row);
  if (!direction) return "";
  if (direction === "inbound") return "Inbound";
  if (direction === "outbound") return "Outbound";
  if (direction === "local") return "Local";

  return direction.charAt(0).toUpperCase() + direction.slice(1);
};

const directionStyle = (d) => {
  const v = String(d).toLowerCase();

  if (v === "outbound") return { color: "#2563eb" };
  if (v === "inbound") return { color: "#16A34A" };
  if (v === "local") return { color: "#64748b" };

  return { color: "#64748b" };
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

const DEFAULT_FILTERS = {
  callStatus: "all",
  direction: "all",
  search: "",
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
];

const matchesCallStatus = (row, status) => {
  const selectedStatus = normalizeValue(status);
  if (!selectedStatus || selectedStatus === "all") return true;

  if (["answered", "noanswer", "cancelled", "failed"].includes(selectedStatus)) {
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

// ── Pill badge ────────────────────────────────────────────────────────────────
const Pill = ({ text, bg, color }) => (
  <span
    style={{
      background: bg,
      color,
      padding: "2px 8px",
      borderRadius: 999,
      fontSize: 10,
      fontWeight: 600,
      whiteSpace: "nowrap",
      display: "inline-block",
    }}
  >
    {text}
  </span>
);

const controlBase = {
  height: 38,
  fontSize: 13,
  color: C.valueText,
  background: "#ffffff",
  border: `1px solid ${C.cardBorder}`,
  borderRadius: 10,
  padding: "0 12px",
  outline: "none",
  fontFamily: "Inter, sans-serif",
  transition: "border-color 0.15s ease, box-shadow 0.15s ease",
  width: "100%",
  boxSizing: "border-box",
};

const FilterLabel = ({ children }) => (
  <span
    style={{
      fontSize: 11,
      fontWeight: 600,
      color: C.labelText,
      letterSpacing: "0.04em",
      textTransform: "uppercase",
      marginBottom: 6,
      display: "block",
    }}
  >
    {children}
  </span>
);

const FilterField = ({ label, children, minWidth = 140 }) => (
  <div style={{ minWidth, flex: "0 0 auto" }}>{label && <FilterLabel>{label}</FilterLabel>}{children}</div>
);

const FilterSelect = ({ value, onChange, options, "aria-label": ariaLabel }) => (
  <select
    value={value}
    onChange={onChange}
    aria-label={ariaLabel}
    style={{
      ...controlBase,
      cursor: "pointer",
      appearance: "none",
      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
      backgroundRepeat: "no-repeat",
      backgroundPosition: "right 12px center",
      paddingRight: 32,
    }}
    onFocus={(e) => {
      e.target.style.borderColor = C.accent;
      e.target.style.boxShadow = `0 0 0 3px ${C.accent}18`;
    }}
    onBlur={(e) => {
      e.target.style.borderColor = C.cardBorder;
      e.target.style.boxShadow = "none";
    }}
  >
    {options.map((opt) => (
      <option key={opt.value} value={opt.value}>
        {opt.label}
      </option>
    ))}
  </select>
);

const FilterSearch = ({ value, onChange, onFocus, onBlur, focused }) => (
  <input
    type="text"
    value={value}
    onChange={onChange}
    onFocus={onFocus}
    onBlur={onBlur}
    placeholder="Extension, number, IP, destination…"
    style={{
      ...controlBase,
      borderColor: focused ? C.accent : C.cardBorder,
      boxShadow: focused ? `0 0 0 3px ${C.accent}18` : "none",
    }}
  />
);

const GhostBtn = ({ children, onClick, disabled, style: extraStyle = {}, hoverBackground = "#f8fafc" }) => {
  const baseBackground = extraStyle.background || "#ffffff";
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        height: 38,
        padding: "0 18px",
        fontSize: 13,
        fontWeight: 600,
        borderRadius: 10,
        border: `1px solid ${C.cardBorder}`,
        background: "#ffffff",
        color: C.labelText,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.55 : 1,
        transition: "background 0.15s ease, border-color 0.15s ease",
        whiteSpace: "nowrap",
        ...extraStyle,
      }}
      onMouseEnter={(e) => {
        if (!disabled) e.currentTarget.style.background = hoverBackground;
      }}
      onMouseLeave={(e) => {
        if (!disabled) e.currentTarget.style.background = baseBackground;
      }}
    >
      {children}
    </button>
  );
};

const CallCount = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const hasInitialLoadRef = useRef(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(50);
  const [selectedIds, setSelectedIds] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(null);

  const [filterDraft, setFilterDraft] = useState({ ...DEFAULT_FILTERS });
  const [appliedFilters, setAppliedFilters] = useState({ ...DEFAULT_FILTERS });
  const [searchFocused, setSearchFocused] = useState(false);

  const loadCdr = async (pageToLoad = page) => {
    try {
      setLoading(true);
      setError("");
      const data = await fetchCdr(pageToLoad, limit);
      if (data && data.success && Array.isArray(data.data)) {
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

  const handlePrev = () => {
    if (page <= 1) return;
    const p = page - 1;
    setPage(p);
    loadCdr(p);
  };

  const handleNext = () => {
    if (loading || !rows || rows.length < limit) return;
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

  const filteredData = useMemo(() => {
    return rows.filter((row) => {
      if (!matchesCallStatus(row, appliedFilters.callStatus)) return false;
      if (!matchesDirectionFilter(row, appliedFilters.direction)) return false;
      if (!matchesSearch(row, appliedFilters.search)) return false;
      return true;
    });
  }, [rows, appliedFilters]);

  const hasActiveFilters = useMemo(() => {
    return (
      appliedFilters.callStatus !== "all" ||
      appliedFilters.direction !== "all" ||
      !!appliedFilters.search.trim()
    );
  }, [appliedFilters]);

  const handleResetFilters = useCallback(() => {
    const resetFilters = { ...DEFAULT_FILTERS };
    setFilterDraft(resetFilters);
    setAppliedFilters(resetFilters);
    setSelectedIds([]);
    setSearchFocused(false);
    setPage(1);
  }, []);

  const handleToggleAll = () => {
    const pageIds = filteredData.map((r) => r.uniqueid).filter(Boolean);
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

  const allPageSelected =
    filteredData.length > 0 &&
    filteredData
      .map((r) => r.uniqueid)
      .filter(Boolean)
      .every((id) => selectedIds.includes(id));

  const somePageSelected =
    filteredData.some((r) => r.uniqueid && selectedIds.includes(r.uniqueid)) &&
    !allPageSelected;

  const totalPages = Math.max(
    1,
    page + (rows.length >= limit ? 1 : 0),
  );

  return (
    <div style={pbxPageWrapStyle}>
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
            segments={["CDR", "Call Detail Records", "Call Count"]}
            style={{ marginBottom: 0 }}
          />
          {lastUpdated && (
            <span style={{ fontSize: 12, color: C.mutedText, whiteSpace: "nowrap" }}>
              Last updated: {lastUpdated.toLocaleTimeString()}
            </span>
          )}
        </div>

        {/* Filter toolbar — SaaS / telecom admin panel */}
        <div
          style={{
            background: "#ffffff",
            border: `1.5px solid ${C.cardBorder}`,
            borderRadius: 10,
            boxShadow: "0 10px 30px rgba(15,23,42,0.06)",
            padding: "7px 14px",
            marginBottom: 16,
          }}
        >
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "flex-end",
              gap: 12,
            }}
          >
            
            <FilterField label="Call Status" minWidth={200}>
              <FilterSelect
                aria-label="Call Status"
                value={filterDraft.callStatus}
                onChange={(e) => {
                  const value = e.target.value;
                  setFilterDraft((f) => ({ ...f, callStatus: value }));
                  setAppliedFilters((f) => ({ ...f, callStatus: value }));
                  setPage(1);
                }}
                options={CALL_STATUS_OPTIONS}
              />
            </FilterField>

            <FilterField label="Direction" minWidth={200}>
              <FilterSelect
                aria-label="Direction"
                value={filterDraft.direction}
                onChange={(e) => {
                  const value = e.target.value;
                  setFilterDraft((f) => ({ ...f, direction: value }));
                  setAppliedFilters((f) => ({ ...f, direction: value }));
                  setPage(1);
                }}
                options={DIRECTION_OPTIONS}
              />
            </FilterField>

            <FilterField label="Search" minWidth={230}>
              <FilterSearch
                value={filterDraft.search}
                onChange={(e) => {
                  const value = e.target.value;
                  setFilterDraft((f) => ({ ...f, search: value }));
                  setAppliedFilters((f) => ({ ...f, search: value }));
                  setPage(1);
                }}
                focused={searchFocused}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
              />
            </FilterField>

            <div
              style={{
                display: "flex",
                alignItems: "flex-end",
                gap: 10,
                flex: "0 0 auto",
                paddingBottom: 0,
              }}
            >
           <GhostBtn
  onClick={handleResetFilters}
  disabled={loading}
  style={{
    height: 30,
    padding: "0 14px",
    fontSize: 12,
    background: "#cbd5e1",
    color: "#374151",
    border: "1px solid #cbd5e1",
    boxShadow: "0 1px 2px rgba(15, 23, 42, 0.08)",
  }}
  hoverBackground="#b6c2d3"
>
  Reset
</GhostBtn>
            </div>
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
              }}
            >
              <span
                style={{
                  background: "#eff6ff",
                  color: C.accent,
                  fontWeight: 600,
                  padding: "4px 10px",
                  borderRadius: 999,
                  fontSize: 11,
                }}
              >
                Filters active
              </span>
              <span>
                Showing {filteredData.length} of {rows.length} records on this
                page
              </span>
            </div>
          )}
        </div>

        <div style={sipPcmCardStyle}>
          <div style={sipPcmToolbarStyle}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              {selectedIds.length > 0 && (
                <span style={sipPcmSelectedBadgeStyle}>
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
              }}
            >
              <Btn
                onClick={() => loadCdr(page)}
                disabled={loading}
                variant="cancel"
                style={sipPcmCancelBtnStyle}
              >
                {loading ? (
                  <CircularProgress size={16} sx={{ color: "#374151" }} />
                ) : (
                  "Refresh"
                )}
              </Btn>
              <Btn
                onClick={handleDelete}
                disabled={loading || selectedIds.length === 0}
                variant="cancel"
                style={sipPcmCancelBtnStyle}
              >
                <DeleteOutlineOutlinedIcon sx={{ fontSize: 16 }} />
                Delete
              </Btn>
              <Btn
                onClick={handleDownload}
                disabled={loading}
                variant="cancel"
                style={sipPcmCancelBtnStyle}
              >
                ⬇ Download CDR
              </Btn>
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
          <div
            className={TRUNK_TABLE_SCROLL_CLASS}
            style={{ ...trunkTableScrollStyle, flex: 1 }}
          >
            <div style={trunkTableInnerStyle}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "separate",
                  borderSpacing: 0,
                  tableLayout: "auto",
                  minWidth: 900,
                }}
              >
                <colgroup>
                  <col style={{ width: "36px" }} />
                  <col style={{ width: "40px" }} />
                  {columns.map((col) => (
                    <col key={col.key} style={{ width: col.width }} />
                  ))}
                </colgroup>
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
                        checked={allPageSelected}
                        indeterminate={somePageSelected}
                        onChange={handleToggleAll}
                        sx={checkboxSx}
                      />
                    </TH>
                    <TH
                      style={{
                        width: 40,
                        position: "sticky",
                        top: 0,
                        zIndex: 10,
                      }}
                    >
                      ID
                    </TH>
                    {columns.map((col, colIdx) => (
                      <TH
                        key={col.key}
                        style={{
                          position: "sticky",
                          top: 0,
                          zIndex: 10,
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
                        colSpan={columns.length + 2}
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
                        row.uniqueid && selectedIds.includes(row.uniqueid);
                      const rowBg = isSelected
                        ? "#f0f9ff"
                        : idx % 2 === 1
                          ? "#f8fafc"
                          : "#ffffff";

                      return (
                        <tr
                          key={getRowKey(row, idx)}
                          style={{
                            background: rowBg,
                            transition: "background 0.15s ease",
                          }}
                          onMouseEnter={(e) => {
                            if (!isSelected)
                              e.currentTarget.style.background = "#f1f5f9";
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
                              disabled={!row.uniqueid}
                              checked={
                                !!row.uniqueid &&
                                selectedIds.includes(row.uniqueid)
                              }
                              onChange={() => handleToggleRow(row.uniqueid)}
                              sx={checkboxSx}
                            />
                          </td>

                          <td
                            style={{
                              ...tdStyle,
                              background: rowBg,
                              ...lastRowCellStyle,
                            }}
                          >
                            {(page - 1) * limit + idx + 1}
                          </td>

                          <td
                            style={{
                              ...tdStyle,
                              background: rowBg,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              ...lastRowCellStyle,
                            }}
                          >
                            {formatDate(row.calldate)}
                          </td>

                          <td
                            style={{
                              ...tdStyle,
                              background: rowBg,
                              fontWeight: 500,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              ...lastRowCellStyle,
                            }}
                          >
                            {row.src || (
                              <span style={{ color: C.mutedText }}>—</span>
                            )}
                          </td>

                          <td
                            style={{
                              ...tdStyle,
                              background: rowBg,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              ...lastRowCellStyle,
                            }}
                          >
                            {row.src_ip || (
                              <span style={{ color: C.mutedText }}>—</span>
                            )}
                          </td>

                          <td
                            style={{
                              ...tdStyle,
                              background: rowBg,
                              fontWeight: 500,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              ...lastRowCellStyle,
                            }}
                          >
                            {row.dst || (
                              <span style={{ color: C.mutedText }}>—</span>
                            )}
                          </td>

                          <td
                            style={{
                              ...tdStyle,
                              background: rowBg,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              ...lastRowCellStyle,
                            }}
                          >
                            {row.dst_ip || (
                              <span style={{ color: C.mutedText }}>—</span>
                            )}
                          </td>

                          <td
                            style={{
                              ...tdStyle,
                              background: rowBg,
                              ...lastRowCellStyle,
                            }}
                          >
                            {(() => {
                              const dir = getDirection(row);
                              if (!dir)
                                return (
                                  <span style={{ color: C.mutedText }}>—</span>
                                );
                              const s = directionStyle(dir);
                              return (
                                <Pill text={dir} bg={s.bg} color={s.color} />
                              );
                            })()}
                          </td>

                          <td
                            style={{
                              ...tdStyle,
                              background: rowBg,
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
                              ...tdStyle,
                              background: rowBg,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              ...lastRowCellStyle,
                            }}
                          >
                            {formatDuration(row.billsec)}
                          </td>

                          <td
                            style={{
                              ...tdStyle,
                              background: rowBg,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              borderRight: "none",
                              ...lastRowCellStyle,
                            }}
                            title={row.hangup_cause || ""}
                          >
                            {row.hangup_cause || (
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
          </div>

          {filteredData.length > 0 && (
            <SipPcmPagination
              page={page}
              totalPages={totalPages}
              recordCount={filteredData.length}
              recordLabel="record"
              onPageChange={(p) => {
                if (p < page) handlePrev();
                else if (p > page) handleNext();
              }}
              style={{ borderTop: "none" }}
            />
          )}
            </>
          )}
        </div>

        <div
          style={{
            width: "100%",
            display: "flex",
            justifyContent: "center",
            marginTop: 20,
            fontSize: 13,
            fontWeight: 700,
            color: "#DC2626",
          }}
        >
          <span>Only latest 500 records shown</span>
        </div>
      </div>
    </div>
  );
};

export default CallCount;
