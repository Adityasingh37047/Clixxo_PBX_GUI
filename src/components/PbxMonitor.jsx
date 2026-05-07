import React, { useEffect, useState, useCallback } from "react";
import { CircularProgress } from "@mui/material";
import { monitorBoth } from "../api/apiService";

// ── Color palette (matches SystemInfo) ───────────────────────────────────────
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
  purple:       '#8b5cf6',
};

// ── Stat card (matches SystemInfo style) ─────────────────────────────────────
const StatCard = ({ label, value, accent, loading }) => (
  <div style={{
    background: C.cardBg,
    border: '0.5px solid #dde6f0',
    borderLeft: `3px solid ${accent}`,
    borderRadius: 8,
    padding: '16px 18px',
    minHeight: 80,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
  }}>
    <div style={{
      fontSize: 10,
      fontWeight: 700,
      color: C.mutedText,
      letterSpacing: '0.06em',
      textTransform: 'uppercase',
      marginBottom: 8,
    }}>
      {label}
    </div>
    {loading
      ? <CircularProgress size={18} style={{ color: accent }} />
      : <span style={{ fontSize: 20, fontWeight: 700, color: accent }}>
          {value ?? '—'}
        </span>
    }
  </div>
);

// ── Status badge ──────────────────────────────────────────────────────────────
const StatusBadge = ({ tone, text }) => {
  const colors = {
    ok:      { bg: '#f0fdf4', color: C.successGreen, dot: C.successGreen },
    bad:     { bg: '#fef2f2', color: C.errorRed,     dot: C.errorRed     },
    neutral: { bg: '#f1f5f9', color: C.mutedText,    dot: C.mutedText    },
  };
  const s = colors[tone] || colors.neutral;
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 5,
      background: s.bg,
      color: s.color,
      padding: '3px 10px',
      borderRadius: 10,
      fontSize: 11.5,
      fontWeight: 600,
      whiteSpace: 'nowrap',
    }}>
      <span style={{
        width: 6,
        height: 6,
        borderRadius: '50%',
        background: s.dot,
        flexShrink: 0,
      }} />
      {text}
    </span>
  );
};

// ── Type pill ─────────────────────────────────────────────────────────────────
const TypePill = ({ text }) => (
  <span style={{
    background: '#e0f2fe',
    color: '#0369a1',
    padding: '2px 9px',
    borderRadius: 10,
    fontSize: 11,
    fontWeight: 600,
  }}>
    {text || 'SIP'}
  </span>
);

// ── Table header cell ─────────────────────────────────────────────────────────
const TH = ({ children, width, align = 'left' }) => (
  <th style={{
    background: '#f8fafc',
    color: C.labelText,
    fontWeight: 700,
    fontSize: 11,
    padding: '9px 14px',
    textAlign: align,
    borderBottom: `1px solid ${C.cardBorder}`,
    whiteSpace: 'nowrap',
    width: width || 'auto',
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
  }}>
    {children}
  </th>
);

// ── Table data cell ───────────────────────────────────────────────────────────
const TD = ({ children, align = 'left', mono }) => (
  <td style={{
    padding: '8px 14px',
    fontSize: 12,
    color: mono ? C.accent : C.valueText,
    textAlign: align,
    fontFamily: mono ? 'monospace, monospace' : 'inherit',
    fontWeight: mono ? 600 : 400,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  }}>
    {children || <span style={{ color: C.mutedText }}>—</span>}
  </td>
);

// ─────────────────────────────────────────────────────────────────────────────

const PbxMonitor = () => {
  const [activeTab, setActiveTab]       = useState('extension');
  const [loading, setLoading]           = useState(true);
  const [extensionRows, setExtensionRows] = useState([]);
  const [trunkRows, setTrunkRows]       = useState([]);
  const [lastUpdated, setLastUpdated]   = useState(null);
  const [searchQuery, setSearchQuery]   = useState('');

  const normalizeStatus = (v) => (v == null ? '' : String(v)).toLowerCase().trim();

  const getExtensionStatus = (row) => {
    const s = normalizeStatus(row?.status || row?.registration_status || row?.register_status);
    if (s === 'registered')   return { text: 'Registered',   tone: 'ok'      };
    if (s === 'unregistered') return { text: 'Unregistered', tone: 'bad'     };
    if (s === 'rejected')     return { text: 'Rejected',     tone: 'bad'     };
    return { text: row?.status || 'Unknown', tone: 'neutral' };
  };

  const getTrunkStatus = (row) => {
    const s = normalizeStatus(row?.trunk_status || row?.status || row?.registration_status);
    if (s === 'registered')   return { text: 'Registered',   tone: 'ok'      };
    if (s === 'unregistered') return { text: 'Unregistered', tone: 'bad'     };
    if (s === 'rejected')     return { text: 'Rejected',     tone: 'bad'     };
    return { text: row?.trunk_status || row?.status || 'Unknown', tone: 'neutral' };
  };

  const getExtensionType = (row) => {
    const t = (row?.type || '').toLowerCase();
    return t.includes('fxs') ? 'FXS' : 'SIP';
  };

  const transformExtensions = (list) =>
    (Array.isArray(list) ? list : []).map((item, idx) => ({
      id:        item?.extension ?? item?.id ?? idx,
      status:    item?.status ?? '',
      extension: item?.extension ?? '',
      name:      item?.name ?? '',
      type:      item?.type ?? '',
      ipPort:    item?.ip_port ?? '',
    }));

  const transformTrunks = (list) =>
    (Array.isArray(list) ? list : []).map((item, idx) => ({
      id:           item?.trunk_id ?? item?.id ?? idx,
      trunkName:    item?.trunk_name ?? '',
      type:         item?.type ?? '',
      trunk_status: item?.status ?? '',
      status:       item?.status ?? '',
      host:         item?.host_ip_port ?? '',
    }));

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await monitorBoth();
      const msg = res?.message ?? {};
      setExtensionRows(transformExtensions(msg?.extensions ?? []));
      setTrunkRows(transformTrunks(msg?.trunks ?? []));
      setLastUpdated(new Date());
    } catch {
      setExtensionRows([]);
      setTrunkRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    // Auto-refresh every 30 seconds
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, [loadData]);

  // Reset search when tab changes
  useEffect(() => { setSearchQuery(''); }, [activeTab]);

  // Derived stats
  const extRegistered   = extensionRows.filter(r => normalizeStatus(r.status) === 'registered').length;
  const extUnregistered = extensionRows.filter(r => normalizeStatus(r.status) !== 'registered').length;
  const trkRegistered   = trunkRows.filter(r => normalizeStatus(r.status) === 'registered').length;

  // Filtered rows based on search
  const filteredExtensions = extensionRows.filter(r =>
    !searchQuery ||
    String(r.extension).includes(searchQuery) ||
    (r.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (r.ipPort || '').includes(searchQuery)
  );

  const filteredTrunks = trunkRows.filter(r =>
    !searchQuery ||
    (r.trunkName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (r.host || '').includes(searchQuery)
  );

  const currentRows = activeTab === 'extension' ? filteredExtensions : filteredTrunks;
  const totalRows   = activeTab === 'extension' ? extensionRows.length : trunkRows.length;

  return (
    <div style={{ backgroundColor: C.pageBg, minHeight: 'calc(100vh - 80px)', padding: 16 }}>
      <div style={{ maxWidth: '100%', margin: '0 auto' }}>

        {/* Breadcrumb + last updated */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 12,
        }}>
          <div style={{ fontSize: 11, color: C.mutedText }}>
            Status &rsaquo; PBX Status &rsaquo;{' '}
            <span style={{ color: C.valueText, fontWeight: 600 }}>PBX Monitor</span>
          </div>
          {lastUpdated && (
            <span style={{ fontSize: 10, color: C.mutedText }}>
              Last updated: {lastUpdated.toLocaleTimeString()}
            </span>
          )}
        </div>

        {/* Stat cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 12,
          marginBottom: 16,
          alignItems: 'stretch',
        }}>
          <StatCard label="Total Extensions"  value={extensionRows.length} accent={C.accent}        loading={loading} />
          <StatCard label="Registered"         value={extRegistered}        accent={C.successGreen}  loading={loading} />
          <StatCard label="Unregistered"       value={extUnregistered}      accent={C.errorRed}      loading={loading} />
          <StatCard label="Registered Trunks"  value={trkRegistered}        accent={C.purple}        loading={loading} />
        </div>

        {/* Main card — NO dark header bar */}
        <div style={{
          background: C.cardBg,
          border: `1px solid ${C.cardBorder}`,
          borderRadius: 8,
          overflow: 'hidden',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        }}>

          {/* Tab bar */}
          <div style={{
            display: 'flex',
            borderBottom: `1px solid ${C.cardBorder}`,
            background: '#f8fafc',
          }}>
            {['extension', 'trunk'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: '10px 24px',
                  fontSize: 12,
                  fontWeight: 700,
                  color: activeTab === tab ? C.accent : C.labelText,
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  borderBottom: activeTab === tab
                    ? `2px solid ${C.accent}`
                    : '2px solid transparent',
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                  transition: 'color 0.15s ease',
                }}
              >
                {tab === 'extension' ? 'Extension' : 'Trunk'}
              </button>
            ))}

            {/* Refresh button in tab bar right side */}
            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', paddingRight: 14 }}>
              <button
                onClick={loadData}
                disabled={loading}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                  background: 'transparent',
                  border: `1px solid ${C.cardBorder}`,
                  borderRadius: 20,
                  padding: '4px 12px',
                  fontSize: 11,
                  color: loading ? C.mutedText : C.accent,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontWeight: 600,
                  transition: 'all 0.15s ease',
                }}
              >
                {loading
                  ? <CircularProgress size={11} style={{ color: C.mutedText }} />
                  : <span style={{ fontSize: 13 }}>↻</span>
                }
                {loading ? 'Refreshing...' : 'Refresh'}
              </button>
            </div>
          </div>

          {/* Toolbar — total pill + search */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '8px 14px',
            borderBottom: `0.5px solid #f1f5f9`,
            background: '#ffffff',
          }}>
            <span style={{
              background: '#f1f5f9',
              border: `0.5px solid ${C.cardBorder}`,
              color: '#475569',
              fontSize: 11,
              fontWeight: 600,
              padding: '3px 12px',
              borderRadius: 20,
            }}>
              Total: {totalRows} {activeTab === 'extension' ? 'Extensions' : 'Trunks'}
            </span>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              background: '#f8fafc',
              border: `0.5px solid ${C.cardBorder}`,
              borderRadius: 6,
              padding: '5px 10px',
            }}>
              <span style={{ fontSize: 12, color: C.mutedText }}>🔍</span>
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder={activeTab === 'extension' ? 'Search extension, name, IP...' : 'Search trunk, host...'}
                style={{
                  border: 'none',
                  background: 'transparent',
                  fontSize: 11,
                  color: C.valueText,
                  outline: 'none',
                  width: 180,
                }}
              />
              {searchQuery && (
                <span
                  onClick={() => setSearchQuery('')}
                  style={{ fontSize: 12, color: C.mutedText, cursor: 'pointer' }}
                >
                  ✕
                </span>
              )}
            </div>
          </div>

          {/* Table */}
          <div style={{ overflowX: 'auto' }}>
            {loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 48 }}>
                <CircularProgress size={28} style={{ color: C.accent }} />
              </div>
            ) : activeTab === 'extension' ? (

              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 600 }}>
                <thead>
                  <tr>
                    <TH width="155px">Status</TH>
                    <TH width="110px" align="center">Extension</TH>
                    <TH width="180px">Name</TH>
                    <TH width="90px"  align="center">Type</TH>
                    <TH width="200px">IP and Port</TH>
                  </tr>
                </thead>
                <tbody>
                  {filteredExtensions.length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{
                        textAlign: 'center',
                        padding: '32px 0',
                        color: C.mutedText,
                        fontSize: 13,
                      }}>
                        {searchQuery ? `No results for "${searchQuery}"` : 'No extension data available'}
                      </td>
                    </tr>
                  ) : filteredExtensions.map((row, idx) => {
                    const status = getExtensionStatus(row);
                    const isRegistered = status.tone === 'ok';
                    return (
                      <tr
                        key={row.id}
                        style={{
                          background: isRegistered
                            ? '#f0fdf4'
                            : idx % 2 === 1 ? '#f8fafc' : '#ffffff',
                          borderBottom: '0.5px solid #f1f5f9',
                          transition: 'background 0.1s ease',
                        }}
                        onMouseEnter={e => { if (!isRegistered) e.currentTarget.style.background = '#f0f9ff'; }}
                        onMouseLeave={e => { if (!isRegistered) e.currentTarget.style.background = idx % 2 === 1 ? '#f8fafc' : '#ffffff'; }}
                      >
                        <TD><StatusBadge tone={status.tone} text={status.text} /></TD>
                        <TD align="center">{row.extension || null}</TD>
                        <TD>{row.name || null}</TD>
                        <TD align="center"><TypePill text={getExtensionType(row)} /></TD>
                        <TD mono>{row.ipPort || null}</TD>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

            ) : (

              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 500 }}>
                <thead>
                  <tr>
                    <TH width="155px">Trunk Status</TH>
                    <TH>Trunk Name</TH>
                    <TH width="90px" align="center">Type</TH>
                    <TH width="240px">Hostname / IP:Port</TH>
                  </tr>
                </thead>
                <tbody>
                  {filteredTrunks.length === 0 ? (
                    <tr>
                      <td colSpan={4} style={{
                        textAlign: 'center',
                        padding: '32px 0',
                        color: C.mutedText,
                        fontSize: 13,
                      }}>
                        {searchQuery ? `No results for "${searchQuery}"` : 'No trunk data available'}
                      </td>
                    </tr>
                  ) : filteredTrunks.map((row, idx) => {
                    const status = getTrunkStatus(row);
                    const isRegistered = status.tone === 'ok';
                    return (
                      <tr
                        key={row.id}
                        style={{
                          background: isRegistered
                            ? '#f0fdf4'
                            : idx % 2 === 1 ? '#f8fafc' : '#ffffff',
                          borderBottom: '0.5px solid #f1f5f9',
                          transition: 'background 0.1s ease',
                        }}
                        onMouseEnter={e => { if (!isRegistered) e.currentTarget.style.background = '#f0f9ff'; }}
                        onMouseLeave={e => { if (!isRegistered) e.currentTarget.style.background = idx % 2 === 1 ? '#f8fafc' : '#ffffff'; }}
                      >
                        <TD><StatusBadge tone={status.tone} text={status.text} /></TD>
                        <TD>{row.trunkName || null}</TD>
                        <TD align="center"><TypePill text={row.type || 'SIP'} /></TD>
                        <TD mono>{row.host || null}</TD>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default PbxMonitor;