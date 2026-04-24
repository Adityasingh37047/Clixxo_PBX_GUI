import React, { useEffect, useState } from 'react';
import { Button, CircularProgress, Alert, Checkbox } from '@mui/material';
import { fetchCdr, deleteCdr, downloadCdr } from '../api/apiService';

const columns = [
  { key: 'calldate',      label: 'Start' },
  { key: 'src',           label: 'Call From' },
  { key: 'src_ip',        label: 'Call From IP' },
  { key: 'dst',           label: 'Call To' },
  { key: 'dst_ip',        label: 'Call To IP' },
  { key: 'call_direction',label: 'Direction' },
  { key: 'disposition',   label: 'Call Status' },
  { key: 'billsec',       label: 'Talk Duration' },
  { key: 'hangup_cause',  label: 'Hangup Cause' },
  { key: 'dcontext',      label: 'Context' },
];

const getDirection = (row) =>
  row.call_direction || row.direction || row.dcontext || '';

const directionBadge = (d) => {
  const v = String(d).toLowerCase();
  if (v === 'outbound') return { bg: '#dbeafe', color: '#1d4ed8', border: '#93c5fd' };
  if (v === 'inbound')  return { bg: '#dcfce7', color: '#15803d', border: '#86efac' };
  if (v === 'local')    return { bg: '#f3f4f6', color: '#374151', border: '#d1d5db' };
  return { bg: '#f3f4f6', color: '#374151', border: '#d1d5db' };
};

const statusBadge = (s) => {
  const v = String(s || '').toLowerCase();
  if (v === 'answered')  return { bg: '#dcfce7', color: '#15803d', border: '#86efac' };
  if (v === 'failed')    return { bg: '#fee2e2', color: '#b91c1c', border: '#fca5a5' };
  if (v === 'busy')      return { bg: '#fef9c3', color: '#92400e', border: '#fde047' };
  if (v === 'cancelled' || v === 'no answer') return { bg: '#fff7ed', color: '#c2410c', border: '#fdba74' };
  return { bg: '#f3f4f6', color: '#374151', border: '#d1d5db' };
};

const formatDuration = (secs) => {
  const s = Number(secs) || 0;
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const pad = (n) => String(n).padStart(2, '0');
  return `${h}:${pad(m)}:${pad(sec)}`;
};

const headerBarStyle = {
  background: 'linear-gradient(to bottom, #b3e0ff 0%, #6ec1f7 50%, #3b8fd6 100%)',
  boxShadow: '0 2px 8px 0 rgba(80,160,255,0.10)',
};

const CallCount = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(50);
  const [selectedIds, setSelectedIds] = useState([]);

  const formatDate = (value) => {
    if (!value) return '';
    try {
      const d = new Date(value);
      if (Number.isNaN(d.getTime())) return value;
      // Keep API time semantics (UTC) so UI matches backend timestamps.
      const pad = (n) => String(n).padStart(2, '0');
      const yyyy = d.getUTCFullYear();
      const mm = pad(d.getUTCMonth() + 1);
      const dd = pad(d.getUTCDate());
      const hh = pad(d.getUTCHours());
      const mi = pad(d.getUTCMinutes());
      const ss = pad(d.getUTCSeconds());
      return `${yyyy}-${mm}-${dd} ${hh}:${mi}:${ss}`;
    } catch {
      return value;
    }
  };

  const loadCdr = async (pageToLoad = page) => {
    try {
      setLoading(true);
      setError('');
      const data = await fetchCdr(pageToLoad, limit);
      if (data && data.success && Array.isArray(data.data)) {
        setRows(data.data);
      } else {
        setRows([]);
      }
    } catch (e) {
      console.error('Failed to load CDR:', e);
      setError('Failed to load call records. Please try again.');
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCdr(1);
  }, []);

  const handleRefresh = () => {
    loadCdr(page);
  };

  const handlePrev = () => {
    if (page <= 1) return;
    const newPage = page - 1;
    setPage(newPage);
    loadCdr(newPage);
  };

  const handleNext = () => {
    if (loading) return;
    if (!rows || rows.length < limit) return;
    const newPage = page + 1;
    setPage(newPage);
    loadCdr(newPage);
  };

  const handleToggleRow = (uniqueid) => {
    if (!uniqueid) return;
    setSelectedIds(prev => {
      if (prev.includes(uniqueid)) {
        return prev.filter(id => id !== uniqueid);
      }
      return [...prev, uniqueid];
    });
  };

  const handleToggleAllCurrentPage = () => {
    const pageIds = rows.map(r => r.uniqueid).filter(Boolean);
    if (pageIds.length === 0) return;
    const allSelected = pageIds.every(id => selectedIds.includes(id));
    if (allSelected) {
      // Unselect all page ids
      setSelectedIds(prev => prev.filter(id => !pageIds.includes(id)));
    } else {
      // Select all page ids
      setSelectedIds(prev => Array.from(new Set([...prev, ...pageIds])));
    }
  };

  const handleDeleteSelected = async () => {
    if (!selectedIds.length) {
      window.alert('Please select at least one record to delete.');
      return;
    }
    const confirmMsg =
      selectedIds.length === 1
        ? 'Are you sure you want to delete this record?'
        : `Are you sure you want to delete ${selectedIds.length} records?`;
    if (!window.confirm(confirmMsg)) return;

    try {
      setLoading(true);
      setError('');
      // Delete all selected uniqueids
      for (const id of selectedIds) {
        try {
          await deleteCdr(id);
        } catch (e) {
          console.error('Failed to delete CDR record', id, e);
        }
      }
      setSelectedIds([]);
      await loadCdr(page);
    } catch (e) {
      console.error('Failed to delete CDR records:', e);
      setError('Failed to delete some call records. Please refresh and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadCdr = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await downloadCdr(); // axios response with blob
      const blob = response.data;
      const contentDisposition = response.headers?.['content-disposition'] || '';
      let fileName = 'cdr.csv';
      const match = /filename\*=UTF-8''([^;]+)|filename="?([^";]+)"?/i.exec(contentDisposition);
      if (match) {
        fileName = decodeURIComponent(match[1] || match[2] || fileName);
      }
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Failed to download CDR:', e);
      setError('Failed to download CDR file. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-[calc(100vh-120px)] flex flex-col items-center pt-[4px]" style={{ backgroundColor: '#dde0e4' }}>
      {error && (
        <Alert
          severity="error"
          onClose={() => setError('')}
          sx={{
            position: 'fixed',
            top: 20,
            right: 20,
            zIndex: 9999,
            minWidth: 300,
            boxShadow: 3,
          }}
        >
          {error}
        </Alert>
      )}

      <div className="w-full max-w-[1380px] mx-auto">
        {/* Header bar */}
        <div
          className="rounded-t-lg h-8 flex items-center justify-center font-semibold text-[18px] text-[#444] shadow-sm"
          style={headerBarStyle}
        >
          Call Detail Records (CDR)
        </div>

        {/* Main content */}
        <div className="w-full border-2 border-gray-400 border-t-0 shadow-sm flex flex-col bg-white">
          {/* Toolbar */}
          <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 bg-[#f5f7fb]">
            <div className="text-sm text-gray-700">
              Page {page}, showing up to {limit} records
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="small"
                variant="contained"
                onClick={handlePrev}
                disabled={loading || page <= 1}
                sx={{
                  textTransform: 'none',
                  fontSize: 12,
                  padding: '2px 12px',
                  minWidth: 60,
                }}
              >
                Prev
              </Button>
              <Button
                size="small"
                variant="contained"
                onClick={handleNext}
                disabled={loading || !rows || rows.length < limit}
                sx={{
                  textTransform: 'none',
                  fontSize: 12,
                  padding: '2px 12px',
                  minWidth: 60,
                }}
              >
                Next
              </Button>
              <Button
                size="small"
                variant="contained"
                onClick={handleRefresh}
                disabled={loading}
                sx={{
                  textTransform: 'none',
                  fontSize: 12,
                  padding: '2px 12px',
                  minWidth: 80,
                }}
              >
                Refresh
              </Button>
              <Button
                size="small"
                variant="contained"
                onClick={handleDeleteSelected}
                disabled={loading || selectedIds.length === 0}
                sx={{
                  textTransform: 'none',
                  fontSize: 12,
                  padding: '2px 12px',
                  minWidth: 80,
                  backgroundColor: '#e53935',
                  '&:hover': { backgroundColor: '#c62828' },
                }}
              >
                Delete
              </Button>
              <Button
                size="small"
                variant="contained"
                onClick={handleDownloadCdr}
                disabled={loading}
                sx={{
                  textTransform: 'none',
                  fontSize: 12,
                  padding: '2px 12px',
                  minWidth: 110,
                }}
              >
                Download CDR
              </Button>
            </div>
          </div>

          {/* Table */}
          <div className="w-full">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <CircularProgress size={40} sx={{ color: '#0e8fd6' }} />
              </div>
            ) : (
              <table className="w-full bg-white border-collapse" style={{ tableLayout: 'fixed' }}>
                <colgroup>
                  <col style={{ width: '38px' }} />
                  <col style={{ width: '30px' }} />
                  <col style={{ width: '130px' }} />
                  <col style={{ width: '118px' }} />
                  <col style={{ width: '105px' }} />
                  <col style={{ width: '100px' }} />
                  <col style={{ width: '135px' }} />
                  <col style={{ width: '74px' }} />
                  <col style={{ width: '92px' }} />
                  <col style={{ width: '76px' }} />
                  <col style={{ width: '120px' }} />
                  <col style={{ width: '95px' }} />
                </colgroup>
                <thead>
                  <tr style={{ background: 'linear-gradient(to bottom, #e8f0fe, #d0e4f7)' }}>
                    <th className="border border-blue-200 py-2 px-0 text-center" style={{ width: 38 }}>
                      <Checkbox
                        size="small"
                        checked={
                          rows.length > 0 &&
                          rows.map(r => r.uniqueid).filter(Boolean).every(id => selectedIds.includes(id))
                        }
                        indeterminate={
                          rows.some(r => r.uniqueid && selectedIds.includes(r.uniqueid)) &&
                          !rows.map(r => r.uniqueid).filter(Boolean).every(id => selectedIds.includes(id))
                        }
                        onChange={handleToggleAllCurrentPage}
                        sx={{ padding: '1px' }}
                      />
                    </th>
                    <th className="border border-blue-200 py-2 px-1 text-center text-[11px] font-semibold text-[#1e3a5f]" style={{ width: 36 }}>
                      #
                    </th>
                    {columns.map(col => (
                      <th
                        key={col.key}
                        className="border border-blue-200 py-2 px-2 text-center text-[12px] font-semibold text-[#1e3a5f] leading-tight"
                      >
                        {col.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.length === 0 ? (
                    <tr>
                      <td
                        colSpan={columns.length + 2}
                        className="text-center text-sm py-8 text-gray-400"
                      >
                        No records found.
                      </td>
                    </tr>
                  ) : (
                    rows.map((row, idx) => (
                      <tr
                        key={row.uniqueid || idx}
                        style={{ background: idx % 2 === 0 ? '#ffffff' : '#f5f8ff' }}
                        className="hover:bg-blue-50 transition-colors duration-100"
                      >
                        <td className="border border-gray-100 py-1 px-0 text-center" style={{ width: 38 }}>
                          <Checkbox
                            size="small"
                            disabled={!row.uniqueid}
                            checked={row.uniqueid ? selectedIds.includes(row.uniqueid) : false}
                            onChange={() => handleToggleRow(row.uniqueid)}
                            sx={{ padding: '1px' }}
                          />
                        </td>
                        <td className="border border-gray-100 py-2 px-1 text-center text-[11px] text-gray-600" style={{ width: 36 }}>
                          {(page - 1) * limit + idx + 1}
                        </td>
                        {columns.map(col => {
                          const trunc = { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' };
                          const cellBase = "border border-gray-100 py-2 px-2 text-center text-[12px]";
                          if (col.key === 'calldate') {
                            const v = formatDate(row.calldate);
                            return (
                              <td key={col.key} className={`${cellBase} text-gray-700`} style={trunc} title={v}>
                                {v}
                              </td>
                            );
                          }
                          if (col.key === 'src' || col.key === 'dst') {
                            const v = row[col.key] ?? '';
                            return (
                              <td key={col.key} className={`${cellBase} font-semibold text-[#1976d2]`} style={trunc} title={v}>
                                {v}
                              </td>
                            );
                          }
                          if (col.key === 'src_ip' || col.key === 'dst_ip') {
                            const v = row[col.key] ?? '';
                            return (
                              <td key={col.key} className={`${cellBase} text-gray-600 font-mono`} style={trunc} title={v}>
                                {v}
                              </td>
                            );
                          }
                          if (col.key === 'call_direction') {
                            const dir = getDirection(row);
                            const s = directionBadge(dir);
                            return (
                              <td key={col.key} className={cellBase}>
                                {dir ? (
                                  <span style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}`, borderRadius: 10, padding: '2px 9px', fontSize: 11, fontWeight: 600, whiteSpace: 'nowrap', display: 'inline-block' }}>
                                    {dir}
                                  </span>
                                ) : ''}
                              </td>
                            );
                          }
                          if (col.key === 'disposition') {
                            const s = statusBadge(row.disposition);
                            return (
                              <td key={col.key} className={cellBase}>
                                {row.disposition ? (
                                  <span style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}`, borderRadius: 10, padding: '2px 9px', fontSize: 11, fontWeight: 600, whiteSpace: 'nowrap', display: 'inline-block' }}>
                                    {row.disposition}
                                  </span>
                                ) : ''}
                              </td>
                            );
                          }
                          if (col.key === 'billsec') {
                            return (
                              <td key={col.key} className={`${cellBase} text-gray-700 font-mono`}>
                                {formatDuration(row.billsec)}
                              </td>
                            );
                          }
                          if (col.key === 'hangup_cause') {
                            const v = row.hangup_cause ?? '';
                            return (
                              <td key={col.key} className={`${cellBase} text-gray-800`} style={trunc} title={v}>
                                {v}
                              </td>
                            );
                          }
                          const v = row[col.key] ?? '';
                          return (
                            <td key={col.key} className={`${cellBase} text-gray-800`} style={trunc} title={String(v)}>
                              {v}
                            </td>
                          );
                        })}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
      <div className="mt-3 mb-4 text-center text-xs text-red-600">
        Only latest 500 call detail records are shown in this table.
      </div>
    </div>
  );
};

export default CallCount;