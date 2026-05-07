import React, { useEffect, useState } from "react";
import { CircularProgress, Checkbox } from "@mui/material";
import { fetchCdr, deleteCdr, downloadCdr } from "../api/apiService";

// ── Column definitions ────────────────────────────────────────────────────────
const columns = [
  { key: "calldate",        label: "Start",         width: "130px" },
  { key: "src",             label: "Call From",     width: "110px" },
  { key: "src_ip",          label: "Call From IP",  width: "110px" },
  { key: "dst",             label: "Call To",       width: "110px" },
  { key: "dst_ip",          label: "Call To IP",    width: "120px" },
  { key: "call_direction",  label: "Direction",     width: "90px"  },
  { key: "disposition",     label: "Call Status",   width: "100px" },
  { key: "billsec",         label: "Talk Duration", width: "90px"  },
  { key: "hangup_cause",    label: "Hangup Cause",  width: "120px" },
  { key: "dcontext",        label: "Context",       width: "110px" },
];

// ── Color palette (matches SystemInfo / PBX Monitor) ─────────────────────────
const C = {
  pageBg:       '#eef2f7',
  cardBg:       '#ffffff',
  cardBorder:   '#dde4ed',
  labelText:    '#64748b',
  valueText:    '#1e293b',
  mutedText:    '#94a3b8',
  accent:       '#29a8e0',
  successGreen: '#16a34a',
  errorRed:     '#dc2626',
  amber:        '#d97706',
};

// ── Helpers ───────────────────────────────────────────────────────────────────
const getDirection = (row) =>
  row.call_direction || row.direction || row.dcontext || "";

const directionStyle = (d) => {
  const v = String(d).toLowerCase();
  if (v === "outbound") return { bg: "#dbeafe", color: "#1d4ed8" };
  if (v === "inbound")  return { bg: "#dcfce7", color: "#15803d" };
  if (v === "local")    return { bg: "#f1f5f9", color: "#475569" };
  return { bg: "#f1f5f9", color: "#475569" };
};

const statusStyle = (s) => {
  const v = String(s || "").toLowerCase();
  if (v === "answered")                   return { bg: "#dcfce7", color: "#15803d" };
  if (v === "failed")                     return { bg: "#fef2f2", color: "#dc2626" };
  if (v === "busy")                       return { bg: "#fef9c3", color: "#92400e" };
  if (v === "no answer" || v === "cancelled") return { bg: "#fff7ed", color: "#c2410c" };
  return { bg: "#f1f5f9", color: "#475569" };
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

// ── Shared: action button ────────────────────────────────────────────────────
const Btn = ({ children, onClick, disabled, variant = "default", style: extraStyle }) => {
  const variants = {
    default: { background: '#1e2d42', color: '#fff', border: '1px solid #162233' },
    outline: { background: C.cardBg,  color: C.labelText, border: `0.5px solid ${C.cardBorder}` },
    danger:  { background: '#fef2f2', color: C.errorRed,  border: `0.5px solid #fecaca` },
    accent:  { background: C.cardBg,  color: C.accent,    border: `0.5px solid ${C.accent}` },
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
        padding: '5px 14px',
        borderRadius: 6,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        display: 'flex',
        alignItems: 'center',
        gap: 5,
        transition: 'opacity 0.15s ease',
        whiteSpace: 'nowrap',
        ...extraStyle,
      }}
      onMouseEnter={e => { if (!disabled) e.currentTarget.style.opacity = '0.82'; }}
      onMouseLeave={e => { if (!disabled) e.currentTarget.style.opacity = '1'; }}
    >
      {children}
    </button>
  );
};

// ── Pill badge ────────────────────────────────────────────────────────────────
const Pill = ({ text, bg, color }) => (
  <span style={{
    background: bg,
    color,
    padding: '2px 9px',
    borderRadius: 10,
    fontSize: 10.5,
    fontWeight: 600,
    whiteSpace: 'nowrap',
    display: 'inline-block',
  }}>
    {text}
  </span>
);

// ── TH ───────────────────────────────────────────────────────────────────────
const TH = ({ children, style: extra }) => (
  <th style={{
    background: '#f8fafc',
    color: C.labelText,
    fontWeight: 700,
    fontSize: 10.5,
    padding: '9px 8px',
    textAlign: 'center',
    borderBottom: `1px solid ${C.cardBorder}`,
    borderRight: `0.5px solid #edf2f7`,
    whiteSpace: 'nowrap',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
    ...extra,
  }}>
    {children}
  </th>
);

// ─────────────────────────────────────────────────────────────────────────────

const CallCount = () => {
  const [rows, setRows]             = useState([]);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState("");
  const [page, setPage]             = useState(1);
  const [limit]                     = useState(50);
  const [selectedIds, setSelectedIds] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

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

  useEffect(() => { loadCdr(1); }, []);

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
    setSelectedIds(prev =>
      prev.includes(uniqueid) ? prev.filter(id => id !== uniqueid) : [...prev, uniqueid]
    );
  };

  const handleToggleAll = () => {
    const pageIds = rows.map(r => r.uniqueid).filter(Boolean);
    if (!pageIds.length) return;
    const allSelected = pageIds.every(id => selectedIds.includes(id));
    setSelectedIds(prev =>
      allSelected
        ? prev.filter(id => !pageIds.includes(id))
        : Array.from(new Set([...prev, ...pageIds]))
    );
  };

  const handleDelete = async () => {
    if (!selectedIds.length) { window.alert("Please select at least one record to delete."); return; }
    const msg = selectedIds.length === 1
      ? "Are you sure you want to delete this record?"
      : `Are you sure you want to delete ${selectedIds.length} records?`;
    if (!window.confirm(msg)) return;
    try {
      setLoading(true);
      for (const id of selectedIds) {
        try { await deleteCdr(id); } catch { /**/ }
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
      if (match) fileName = decodeURIComponent(match[1] || match[2] || fileName);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = fileName; a.click();
      URL.revokeObjectURL(url);
    } catch {
      setError("Failed to download CDR file. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Filter rows by search
  const filteredRows = searchQuery.trim()
    ? rows.filter(r =>
        [r.src, r.dst, r.src_ip, r.dst_ip, r.call_direction, r.disposition, r.hangup_cause, r.dcontext]
          .some(v => String(v || "").toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : rows;

  const allPageSelected =
    filteredRows.length > 0 &&
    filteredRows.map(r => r.uniqueid).filter(Boolean).every(id => selectedIds.includes(id));

  const somePageSelected =
    filteredRows.some(r => r.uniqueid && selectedIds.includes(r.uniqueid)) && !allPageSelected;

  return (
    <div style={{ backgroundColor: C.pageBg, minHeight: 'calc(100vh - 80px)', padding: 16 }}>
      <div style={{ maxWidth: '100%', margin: '0 auto' }}>

        {/* Error banner */}
        {error && (
          <div style={{
            background: '#fef2f2',
            borderLeft: `3px solid #f87171`,
            color: '#b91c1c',
            padding: '10px 14px',
            borderRadius: 6,
            marginBottom: 12,
            fontSize: 13,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <span>{error}</span>
            <span
              onClick={() => setError("")}
              style={{ cursor: 'pointer', fontSize: 16, color: '#b91c1c' }}
            >✕</span>
          </div>
        )}

        {/* Breadcrumb + last updated */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{ fontSize: 11, color: C.mutedText }}>
            CDR &rsaquo;{' '}
            <span style={{ color: C.valueText, fontWeight: 600 }}>Call Detail Records</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {lastUpdated && (
              <span style={{ fontSize: 10, color: C.mutedText }}>
                Last updated: {lastUpdated.toLocaleTimeString()}
              </span>
            )}
            <span style={{
              fontSize: 10,
              color: C.errorRed,
              fontWeight: 500,
              background: '#fef2f2',
              padding: '2px 10px',
              borderRadius: 10,
              border: '0.5px solid #fecaca',
            }}>
              Only latest 500 records shown
            </span>
          </div>
        </div>

        {/* Main card */}
        <div style={{
          background: C.cardBg,
          border: `1px solid ${C.cardBorder}`,
          borderRadius: 8,
          overflow: 'hidden',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        }}>

          {/* Toolbar */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 14px',
            borderBottom: `1px solid ${C.cardBorder}`,
            background: '#f8fafc',
            flexWrap: 'wrap',
            gap: 8,
          }}>
            {/* Left: page info + count */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{
                background: '#f1f5f9',
                border: `0.5px solid ${C.cardBorder}`,
                color: '#475569',
                fontSize: 11,
                fontWeight: 600,
                padding: '3px 12px',
                borderRadius: 20,
              }}>
                Page {page} · {filteredRows.length} records
              </span>
              {selectedIds.length > 0 && (
                <span style={{
                  background: '#e0f2fe',
                  color: C.accent,
                  fontSize: 11,
                  fontWeight: 600,
                  padding: '3px 10px',
                  borderRadius: 20,
                  border: `0.5px solid ${C.accent}`,
                }}>
                  {selectedIds.length} selected
                </span>
              )}
            </div>

            {/* Right: search + action buttons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>

              {/* Search */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                background: '#ffffff',
                border: `0.5px solid ${searchFocused ? C.accent : C.cardBorder}`,
                borderRadius: 6,
                padding: '5px 10px',
                transition: 'border-color 0.15s ease',
              }}>
                <span style={{ fontSize: 12, color: searchFocused ? C.accent : C.mutedText }}>🔍</span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setSearchFocused(false)}
                  placeholder="Search src, dst, status, context..."
                  style={{
                    border: 'none',
                    background: 'transparent',
                    fontSize: 11,
                    color: C.valueText,
                    outline: 'none',
                    width: 200,
                  }}
                />
                {searchQuery && (
                  <span onClick={() => setSearchQuery('')} style={{ fontSize: 11, color: C.mutedText, cursor: 'pointer' }}>✕</span>
                )}
              </div>

              {/* Pagination */}
              <Btn onClick={handlePrev} disabled={loading || page <= 1} variant="outline">← Prev</Btn>
              <Btn onClick={handleNext} disabled={loading || !rows || rows.length < limit} variant="outline">Next →</Btn>

              {/* Actions */}
              <Btn onClick={() => loadCdr(page)} disabled={loading} variant="default">
                {loading ? <CircularProgress size={11} style={{ color: '#fff' }} /> : '↻'}
                Refresh
              </Btn>
              <Btn onClick={handleDelete} disabled={loading || selectedIds.length === 0} variant="danger">
                🗑 Delete
              </Btn>
              <Btn onClick={handleDownload} disabled={loading} variant="accent">
                ⬇ Download CDR
              </Btn>
            </div>
          </div>

          {/* Table */}
          <div style={{ overflowX: 'auto' }}>
            {loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 48 }}>
                <CircularProgress size={28} style={{ color: C.accent }} />
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed', minWidth: 1100 }}>
                <colgroup>
                  <col style={{ width: '36px' }} />
                  <col style={{ width: '32px' }} />
                  {columns.map(col => <col key={col.key} style={{ width: col.width }} />)}
                </colgroup>
                <thead>
                  <tr>
                    {/* Select all checkbox */}
                    <TH style={{ width: 36 }}>
                      <Checkbox
                        size="small"
                        checked={allPageSelected}
                        indeterminate={somePageSelected}
                        onChange={handleToggleAll}
                        sx={{ padding: '1px', color: C.accent, '&.Mui-checked': { color: C.accent }, '&.MuiCheckbox-indeterminate': { color: C.accent } }}
                      />
                    </TH>
                    <TH style={{ width: 32 }}>#</TH>
                    {columns.map(col => <TH key={col.key}>{col.label}</TH>)}
                  </tr>
                </thead>
                <tbody>
                  {filteredRows.length === 0 ? (
                    <tr>
                      <td
                        colSpan={columns.length + 2}
                        style={{ textAlign: 'center', padding: '36px 0', color: C.mutedText, fontSize: 13 }}
                      >
                        {searchQuery ? `No results for "${searchQuery}"` : 'No records found.'}
                      </td>
                    </tr>
                  ) : (
                    filteredRows.map((row, idx) => {
                      const isSelected = row.uniqueid && selectedIds.includes(row.uniqueid);
                      const rowBg = isSelected
                        ? '#f0f9ff'
                        : idx % 2 === 1 ? '#f8fafc' : '#ffffff';

                      return (
                        <tr
                          key={row.uniqueid || idx}
                          style={{ background: rowBg, borderBottom: '0.5px solid #f1f5f9', transition: 'background 0.1s ease' }}
                          onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = '#f0f9ff'; }}
                          onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = rowBg; }}
                        >
                          {/* Checkbox */}
                          <td style={{ textAlign: 'center', padding: '4px 0', borderRight: '0.5px solid #edf2f7' }}>
                            <Checkbox
                              size="small"
                              disabled={!row.uniqueid}
                              checked={!!row.uniqueid && selectedIds.includes(row.uniqueid)}
                              onChange={() => handleToggleRow(row.uniqueid)}
                              sx={{ padding: '1px', color: C.accent, '&.Mui-checked': { color: C.accent } }}
                            />
                          </td>

                          {/* Row number */}
                          <td style={{ textAlign: 'center', padding: '7px 4px', fontSize: 11, color: C.mutedText, borderRight: '0.5px solid #edf2f7' }}>
                            {(page - 1) * limit + idx + 1}
                          </td>

                          {/* Start date */}
                          <td style={{ padding: '7px 8px', fontSize: 11, color: C.labelText, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', borderRight: '0.5px solid #edf2f7' }}>
                            {formatDate(row.calldate)}
                          </td>

                          {/* Call From */}
                          <td style={{ padding: '7px 8px', fontSize: 12, fontWeight: 700, color: C.valueText, textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', borderRight: '0.5px solid #edf2f7' }}>
                            {row.src || <span style={{ color: C.mutedText }}>—</span>}
                          </td>

                          {/* Call From IP */}
                          <td style={{ padding: '7px 8px', fontSize: 11, color: C.accent, fontFamily: 'monospace', textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', borderRight: '0.5px solid #edf2f7' }}>
                            {row.src_ip || <span style={{ color: C.mutedText }}>—</span>}
                          </td>

                          {/* Call To */}
                          <td style={{ padding: '7px 8px', fontSize: 12, fontWeight: 700, color: C.valueText, textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', borderRight: '0.5px solid #edf2f7' }}>
                            {row.dst || <span style={{ color: C.mutedText }}>—</span>}
                          </td>

                          {/* Call To IP */}
                          <td style={{ padding: '7px 8px', fontSize: 11, color: C.accent, fontFamily: 'monospace', textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', borderRight: '0.5px solid #edf2f7' }}>
                            {row.dst_ip || <span style={{ color: C.mutedText }}>—</span>}
                          </td>

                          {/* Direction */}
                          <td style={{ padding: '7px 8px', textAlign: 'center', borderRight: '0.5px solid #edf2f7' }}>
                            {(() => {
                              const dir = getDirection(row);
                              if (!dir) return <span style={{ color: C.mutedText }}>—</span>;
                              const s = directionStyle(dir);
                              return <Pill text={dir} bg={s.bg} color={s.color} />;
                            })()}
                          </td>

                          {/* Call Status */}
                          <td style={{ padding: '7px 8px', textAlign: 'center', borderRight: '0.5px solid #edf2f7' }}>
                            {row.disposition ? (() => {
                              const s = statusStyle(row.disposition);
                              return <Pill text={row.disposition} bg={s.bg} color={s.color} />;
                            })() : <span style={{ color: C.mutedText }}>—</span>}
                          </td>

                          {/* Talk Duration */}
                          <td style={{ padding: '7px 8px', fontSize: 12, fontFamily: 'monospace', fontWeight: 600, color: C.valueText, textAlign: 'center', borderRight: '0.5px solid #edf2f7' }}>
                            {formatDuration(row.billsec)}
                          </td>

                          {/* Hangup Cause */}
                          <td style={{ padding: '7px 8px', fontSize: 11, color: C.labelText, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', borderRight: '0.5px solid #edf2f7' }}
                            title={row.hangup_cause || ''}>
                            {row.hangup_cause || <span style={{ color: C.mutedText }}>—</span>}
                          </td>

                          {/* Context */}
                          <td style={{ padding: '7px 8px', fontSize: 11, color: C.labelText, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                            title={row.dcontext || ''}>
                            {row.dcontext || <span style={{ color: C.mutedText }}>—</span>}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            )}
          </div>

          {/* Bottom pagination */}
          {!loading && filteredRows.length > 0 && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 14px',
              borderTop: `0.5px solid ${C.cardBorder}`,
              background: '#f8fafc',
            }}>
              <span style={{ fontSize: 11, color: C.mutedText }}>
                Showing {filteredRows.length} record{filteredRows.length !== 1 ? 's' : ''} on page {page}
              </span>
              <div style={{ display: 'flex', gap: 8 }}>
                <Btn onClick={handlePrev} disabled={loading || page <= 1} variant="outline">← Prev</Btn>
                <span style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: C.accent,
                  background: '#e0f2fe',
                  padding: '5px 14px',
                  borderRadius: 6,
                  border: `0.5px solid ${C.accent}`,
                }}>
                  Page {page}
                </span>
                <Btn onClick={handleNext} disabled={loading || !rows || rows.length < limit} variant="outline">Next →</Btn>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default CallCount;