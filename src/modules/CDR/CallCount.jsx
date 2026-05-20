import React, { useEffect, useState, useMemo, useCallback } from "react";
import { CircularProgress, Checkbox } from "@mui/material";
import { fetchCdr, deleteCdr, downloadCdr } from "../../api/apiService";

// ── Column definitions ────────────────────────────────────────────────────────
const columns = [
  { key: "calldate", label: "Start", width: "130px" },
  { key: "src", label: "Call From", width: "110px" },
  { key: "src_ip", label: "Call From IP", width: "110px" },
  { key: "dst", label: "Call To", width: "110px" },
  { key: "dst_ip", label: "Call To IP", width: "120px" },
  { key: "call_direction", label: "Direction", width: "90px" },
  { key: "disposition", label: "Call Status", width: "100px" },
  { key: "billsec", label: "Talk Duration", width: "100px" },
  { key: "hangup_cause", label: "Hangup Cause", width: "120px" },
  { key: "dcontext", label: "Context", width: "110px" },
];

// ── Color palette (matches PbxMonitor.jsx) ───────────────────────────────────
const C = {
  pageBg: "#f8fafc",
  cardBg: "#ffffff",
  cardBorder: "#e2e8f0",
  cardBorderSoft: "#f1f5f9",
  labelText: "#64748b",
  valueText: "#0f172a",
  mutedText: "#94a3b8",
  accent: "#2563eb",
  successGreen: "#22c55e",
  errorRed: "#ef4444",
  purple: "#8b5cf6",
  amber: "#d97706",
};

// ── Helpers ───────────────────────────────────────────────────────────────────
const getDirection = (row) =>
  row.call_direction || row.direction || row.dcontext || "";

const directionStyle = (d) => {
  const v = String(d).toLowerCase();
  if (v === "outbound") return { bg: "#eff6ff", color: "#2563eb" };
  if (v === "inbound") return { bg: "#dcfce7", color: "#166534" };
  if (v === "local") return { bg: "#f1f5f9", color: "#64748b" };
  return { bg: "#f1f5f9", color: "#64748b" };
};

const statusStyle = (s) => {
  const v = String(s || "").toLowerCase();
  if (v === "answered") return { bg: "#dcfce7", color: "#166534" };
  if (v === "failed") return { bg: "#fee2e2", color: "#991b1b" };
  if (v === "busy") return { bg: "#fef3c7", color: "#92400e" };
  if (v === "no answer" || v === "cancelled")
    return { bg: "#ffedd5", color: "#c2410c" };
  return { bg: "#f1f5f9", color: "#64748b" };
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
  { value: "missed", label: "Missed" },
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
  if (!status || status === "all") return true;
  const disp = String(row.disposition || "").toLowerCase();
  const ctx = String(row.dcontext || "").toLowerCase();
  const cause = String(row.hangup_cause || "").toLowerCase();

  switch (status) {
    case "answered":
      return disp === "answered";
    case "missed":
      return (
        disp === "no answer" ||
        disp === "busy" ||
        disp.includes("miss") ||
        disp.includes("unanswered")
      );
    case "voicemail":
      return (
        ctx.includes("voicemail") ||
        ctx.includes("vm") ||
        cause.includes("voicemail") ||
        disp.includes("voicemail")
      );
    case "cancelled":
      return disp === "cancelled" || disp.includes("cancel");
    case "failed":
      return disp === "failed" || disp.includes("fail");
    case "ivr":
      return ctx.includes("ivr");
    case "call queue":
      return ctx.includes("queue");
    case "conference":
      return ctx.includes("conf") || ctx.includes("conference");
    default:
      return true;
  }
};

const matchesDirectionFilter = (row, direction) => {
  if (!direction || direction === "all") return true;
  const d = String(getDirection(row)).toLowerCase();
  if (direction === "inbound") return d === "inbound" || d.includes("inbound");
  if (direction === "outbound") return d === "outbound" || d.includes("outbound");
  if (direction === "local") return d === "local" || d.includes("local");
  return true;
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

// ── Shared: action button ────────────────────────────────────────────────────
const Btn = ({
  children,
  onClick,
  disabled,
  variant = "default",
  style: extraStyle,
}) => {
  const variants = {
    default: {
      background: C.pageBg,
      color: C.valueText,
      border: `1px solid ${C.cardBorder}`,
    },
    outline: {
      background: C.cardBg,
      color: C.labelText,
      border: `1px solid ${C.cardBorder}`,
    },
    danger: {
      background: "#fef2f2",
      color: C.errorRed,
      border: "1px solid #fecaca",
    },
    accent: {
      background: "#eff6ff",
      color: C.accent,
      border: `1px solid ${C.cardBorder}`,
    },
  };
  const s = variants[variant] || variants.default;
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        ...s,
        fontSize: 11,
        fontWeight: 600,
        padding: "5px 14px",
        borderRadius: 6,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
        display: "flex",
        alignItems: "center",
        gap: 5,
        transition: "opacity 0.15s ease",
        whiteSpace: "nowrap",
        ...extraStyle,
      }}
      onMouseEnter={(e) => {
        if (!disabled) e.currentTarget.style.opacity = "0.82";
      }}
      onMouseLeave={(e) => {
        if (!disabled) e.currentTarget.style.opacity = "1";
      }}
    >
      {children}
    </button>
  );
};

// ── Pill badge ────────────────────────────────────────────────────────────────
const Pill = ({ text, bg, color }) => (
  <span
    style={{
      background: bg,
      color,
      padding: "4px 10px",
      borderRadius: 999,
      fontSize: 11,
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
  <div style={{ minWidth, flex: "1 1 140px" }}>{label && <FilterLabel>{label}</FilterLabel>}{children}</div>
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

const PrimaryBtn = ({ children, onClick, disabled, type = "button" }) => (
  <button
    type={type}
    onClick={onClick}
    disabled={disabled}
    style={{
      height: 38,
      padding: "0 18px",
      fontSize: 13,
      fontWeight: 600,
      borderRadius: 10,
      border: "none",
      cursor: disabled ? "not-allowed" : "pointer",
      opacity: disabled ? 0.55 : 1,
      background: C.accent,
      color: "#ffffff",
      boxShadow: "0 1px 2px rgba(37,99,235,0.2)",
      transition: "opacity 0.15s ease, background 0.15s ease",
      whiteSpace: "nowrap",
    }}
    onMouseEnter={(e) => {
      if (!disabled) e.currentTarget.style.background = "#1d4ed8";
    }}
    onMouseLeave={(e) => {
      if (!disabled) e.currentTarget.style.background = C.accent;
    }}
  >
    {children}
  </button>
);

const GhostBtn = ({ children, onClick, disabled }) => (
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
    }}
    onMouseEnter={(e) => {
      if (!disabled) e.currentTarget.style.background = "#f8fafc";
    }}
    onMouseLeave={(e) => {
      if (!disabled) e.currentTarget.style.background = "#ffffff";
    }}
  >
    {children}
  </button>
);

// ── TH (matches PbxMonitor table header) ─────────────────────────────────────
const TH = ({ children, style: extra, align = "center" }) => (
  <th
    style={{
      background: "#f8fafc",
      color: C.labelText,
      fontWeight: 700,
      fontSize: 11,
      padding: "14px 12px",
      textAlign: align,
      borderBottom: "1px solid #f1f5f9",
      whiteSpace: "nowrap",
      textTransform: "uppercase",
      letterSpacing: "0.08em",
      ...extra,
    }}
  >
    {children}
  </th>
);

// ─────────────────────────────────────────────────────────────────────────────

const CallCount = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
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
    }
  };

  useEffect(() => {
    loadCdr(1);
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

  const handleApplyFilters = useCallback(() => {
    setAppliedFilters({ ...filterDraft });
  }, [filterDraft]);

  const handleResetFilters = useCallback(() => {
    setFilterDraft({ ...DEFAULT_FILTERS });
    setAppliedFilters({ ...DEFAULT_FILTERS });
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

  return (
    <div
      style={{
        background: C.pageBg,
        minHeight: "calc(100vh - 80px)",
        padding: 24,
        fontFamily: "Inter, sans-serif",
      }}
    >
      <div style={{ maxWidth: "100%", margin: "0 auto" }}>
        {/* Error banner */}
        {error && (
          <div
            style={{
              background: "#fef2f2",
              borderLeft: `3px solid ${C.errorRed}`,
              color: "#991b1b",
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
              style={{ cursor: "pointer", fontSize: 16, color: "#991b1b" }}
            >
              ✕
            </span>
          </div>
        )}

        {/* Breadcrumb + last updated (PbxMonitor-style header) */}
        <div style={{ marginBottom: 24 }}>
          <div
            style={{
              fontSize: 12,
              color: C.mutedText,
              marginBottom: 14,
              fontWeight: 400,
              display: "flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            <span>CDR</span>
            <span>&gt;</span>
            <span>Call Detail Records</span>
            <span>&gt;</span>
            <span style={{ color: C.valueText, fontWeight: 600 }}>
              Call Count
            </span>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 12,
            }}
          >
            <div />
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              {lastUpdated && (
                <span style={{ fontSize: 12, color: C.mutedText }}>
                  Last updated: {lastUpdated.toLocaleTimeString()}
                </span>
              )}
              <span
                style={{
                  fontSize: 12,
                  color: C.errorRed,
                  fontWeight: 600,
                  background: "#fef2f2",
                  padding: "6px 12px",
                  borderRadius: 999,
                  border: "1px solid #fecaca",
                }}
              >
                Only latest 500 records shown
              </span>
            </div>
          </div>
        </div>

        {/* Filter toolbar — SaaS / telecom admin panel */}
        <div
          style={{
            background: "#ffffff",
            border: `1px solid ${C.cardBorder}`,
            borderRadius: 14,
            boxShadow: "0 2px 12px rgba(15,23,42,0.05)",
            padding: "18px 20px",
            marginBottom: 20,
          }}
        >
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "flex-end",
              gap: 14,
            }}
          >
            <FilterField label="Call Status" minWidth={150}>
              <FilterSelect
                aria-label="Call Status"
                value={filterDraft.callStatus}
                onChange={(e) =>
                  setFilterDraft((f) => ({ ...f, callStatus: e.target.value }))
                }
                options={CALL_STATUS_OPTIONS}
              />
            </FilterField>

            <FilterField label="Direction" minWidth={130}>
              <FilterSelect
                aria-label="Direction"
                value={filterDraft.direction}
                onChange={(e) =>
                  setFilterDraft((f) => ({ ...f, direction: e.target.value }))
                }
                options={DIRECTION_OPTIONS}
              />
            </FilterField>

            <FilterField label="Search" minWidth={220}>
              <FilterSearch
                value={filterDraft.search}
                onChange={(e) =>
                  setFilterDraft((f) => ({ ...f, search: e.target.value }))
                }
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
              <PrimaryBtn onClick={handleApplyFilters} disabled={loading}>
                Search
              </PrimaryBtn>
              <GhostBtn onClick={handleResetFilters} disabled={loading}>
                Reset
              </GhostBtn>
            </div>
          </div>

          {hasActiveFilters && (
            <div
              style={{
                marginTop: 14,
                paddingTop: 12,
                borderTop: `1px solid ${C.cardBorderSoft}`,
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

        {/* Main card — PbxMonitor main white shell */}
        <div
          style={{
            background: "#ffffff",
            borderRadius: 20,
            overflow: "hidden",
            border: `1px solid ${C.cardBorder}`,
            boxShadow: "0 4px 20px rgba(15,23,42,0.06)",
          }}
        >
          {/* Toolbar (tab bar–like strip) */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: 12,
              borderBottom: "1px solid #f1f5f9",
              background: "#ffffff",
              flexWrap: "wrap",
              gap: 12,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span
                style={{
                  background: "#f8fafc",
                  border: `1px solid ${C.cardBorder}`,
                  color: C.labelText,
                  fontSize: 12,
                  fontWeight: 600,
                  padding: "6px 14px",
                  borderRadius: 999,
                }}
              >
                Page {page} · {filteredData.length} records
              </span>
              {selectedIds.length > 0 && (
                <span
                  style={{
                    background: "#eff6ff",
                    color: C.accent,
                    fontSize: 12,
                    fontWeight: 600,
                    padding: "6px 12px",
                    borderRadius: 999,
                    border: `1px solid ${C.cardBorder}`,
                  }}
                >
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
                variant="default"
              >
                {loading ? (
                  <CircularProgress size={16} sx={{ color: C.accent }} />
                ) : (
                  "Refresh"
                )}
              </Btn>
              <Btn
                onClick={handleDelete}
                disabled={loading || selectedIds.length === 0}
                variant="danger"
              >
                🗑 Delete
              </Btn>
              <Btn onClick={handleDownload} disabled={loading} variant="accent">
                ⬇ Download CDR
              </Btn>
            </div>
          </div>

          {/* Table */}
          <div style={{ overflowX: "auto" }}>
            {loading ? (
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
            ) : (
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  tableLayout: "fixed",
                  minWidth: 1100,
                }}
              >
                <colgroup>
                  <col style={{ width: "36px" }} />
                  <col style={{ width: "32px" }} />
                  {columns.map((col) => (
                    <col key={col.key} style={{ width: col.width }} />
                  ))}
                </colgroup>
                <thead>
                  <tr>
                    <TH style={{ width: 36, padding: "10px 8px" }}>
                      <Checkbox
                        size="small"
                        checked={allPageSelected}
                        indeterminate={somePageSelected}
                        onChange={handleToggleAll}
                        sx={{
                          padding: "1px",
                          color: C.accent,
                          "&.Mui-checked": { color: C.accent },
                          "&.MuiCheckbox-indeterminate": { color: C.accent },
                        }}
                      />
                    </TH>
                    <TH style={{ width: 32 }}>#</TH>
                    {columns.map((col) => (
                      <TH key={col.key}>{col.label}</TH>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredData.length === 0 ? (
                    <tr>
                      <td
                        colSpan={columns.length + 2}
                        style={{
                          textAlign: "center",
                          padding: "40px 16px",
                          color: C.mutedText,
                          fontSize: 14,
                          borderBottom: "1px solid #f1f5f9",
                        }}
                      >
                        {hasActiveFilters
                          ? "No records match the current filters on this page."
                          : "No records found."}
                      </td>
                    </tr>
                  ) : (
                    filteredData.map((row, idx) => {
                      const isSelected =
                        row.uniqueid && selectedIds.includes(row.uniqueid);
                      const rowBg = isSelected
                        ? "#eff6ff"
                        : idx % 2 === 1
                          ? "#f8fafc"
                          : "#ffffff";

                      return (
                        <tr
                          key={row.uniqueid || idx}
                          style={{
                            background: rowBg,
                            borderBottom: "1px solid #f1f5f9",
                            transition: "background 0.1s ease",
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
                              textAlign: "center",
                              padding: "12px 8px",
                              borderRight: "1px solid #f1f5f9",
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
                              sx={{
                                padding: "1px",
                                color: C.accent,
                                "&.Mui-checked": { color: C.accent },
                              }}
                            />
                          </td>

                          <td
                            style={{
                              textAlign: "center",
                              padding: "12px 8px",
                              fontSize: 12,
                              color: C.mutedText,
                              borderRight: "1px solid #f1f5f9",
                            }}
                          >
                            {(page - 1) * limit + idx + 1}
                          </td>

                          <td
                            style={{
                              padding: "12px 14px",
                              fontSize: 13,
                              color: C.valueText,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                              borderRight: "1px solid #f1f5f9",
                            }}
                          >
                            {formatDate(row.calldate)}
                          </td>

                          <td
                            style={{
                              padding: "12px 14px",
                              fontSize: 13,
                              fontWeight: 500,
                              color: C.valueText,
                              textAlign: "center",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                              borderRight: "1px solid #f1f5f9",
                            }}
                          >
                            {row.src || (
                              <span style={{ color: C.mutedText }}>—</span>
                            )}
                          </td>

                          <td
                            style={{
                              padding: "12px 14px",
                              fontSize: 13,
                              color: C.accent,
                              fontFamily: "monospace, monospace",
                              textAlign: "center",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                              borderRight: "1px solid #f1f5f9",
                            }}
                          >
                            {row.src_ip || (
                              <span style={{ color: C.mutedText }}>—</span>
                            )}
                          </td>

                          <td
                            style={{
                              padding: "12px 14px",
                              fontSize: 13,
                              fontWeight: 500,
                              color: C.valueText,
                              textAlign: "center",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                              borderRight: "1px solid #f1f5f9",
                            }}
                          >
                            {row.dst || (
                              <span style={{ color: C.mutedText }}>—</span>
                            )}
                          </td>

                          <td
                            style={{
                              padding: "12px 14px",
                              fontSize: 13,
                              color: C.accent,
                              fontFamily: "monospace, monospace",
                              textAlign: "center",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                              borderRight: "1px solid #f1f5f9",
                            }}
                          >
                            {row.dst_ip || (
                              <span style={{ color: C.mutedText }}>—</span>
                            )}
                          </td>

                          <td
                            style={{
                              padding: "12px 14px",
                              textAlign: "center",
                              borderRight: "1px solid #f1f5f9",
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
                              padding: "12px 14px",
                              textAlign: "center",
                              borderRight: "1px solid #f1f5f9",
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
                              padding: "12px 14px",
                              fontSize: 13,
                              fontFamily: "monospace, monospace",
                              fontWeight: 600,
                              color: C.valueText,
                              textAlign: "center",
                              borderRight: "1px solid #f1f5f9",
                            }}
                          >
                            {formatDuration(row.billsec)}
                          </td>

                          <td
                            style={{
                              padding: "12px 14px",
                              fontSize: 13,
                              color: C.labelText,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                              borderRight: "1px solid #f1f5f9",
                            }}
                            title={row.hangup_cause || ""}
                          >
                            {row.hangup_cause || (
                              <span style={{ color: C.mutedText }}>—</span>
                            )}
                          </td>

                          <td
                            style={{
                              padding: "12px 14px",
                              fontSize: 13,
                              color: C.labelText,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                            title={row.dcontext || ""}
                          >
                            {row.dcontext || (
                              <span style={{ color: C.mutedText }}>—</span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            )}
          </div>

          {!loading && filteredData.length > 0 && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "14px 18px",
                borderTop: "1px solid #f1f5f9",
                background: "#ffffff",
              }}
            >
              <span style={{ fontSize: 12, color: C.mutedText }}>
                Showing {filteredData.length} record
                {filteredData.length !== 1 ? "s" : ""} on page {page}
                {hasActiveFilters ? ` (filtered from ${rows.length})` : ""}
              </span>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <Btn
                  onClick={handlePrev}
                  disabled={loading || page <= 1}
                  variant="outline"
                >
                  ← Prev
                </Btn>
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: C.accent,
                    background: "#eff6ff",
                    padding: "6px 14px",
                    borderRadius: 10,
                    border: `1px solid ${C.cardBorder}`,
                  }}
                >
                  Page {page}
                </span>
                <Btn
                  onClick={handleNext}
                  disabled={loading || !rows || rows.length < limit}
                  variant="outline"
                >
                  Next →
                </Btn>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CallCount;
