import React, { useEffect, useRef, useState } from 'react';
import EditDocumentIcon from '@mui/icons-material/EditDocument';
import { CircularProgress } from '@mui/material';
import {
  TC_TITLE, TC_TYPES, TC_DAYS_OF_WEEK, TC_MONTHS,
  TC_HOURS, TC_MINUTES, TC_DAYS_OF_MONTH, TC_TABLE_COLUMNS, TC_INITIAL_FORM,
} from '../../../constants/TimeComditionConstants.jsx';
import {
  fetchTimeConditions, createTimeCondition, updateTimeCondition,
  deleteTimeCondition, deleteAllTimeConditions,
} from '../../../api/apiService';

// ─── helpers ─────────────────────────────────────────────────────────────────
const pad = (n) => String(n ?? 0).padStart(2, '0');
const typeLabel = (v) => TC_TYPES.find((t) => t.value === v)?.label ?? v;

const settingsSummary = (row) => {
  if (row.type === 'worktime') {
    const ranges = (row.timeSlots || [])
      .map((r) => `${pad(r.start_hour)}:${pad(r.start_minute)}–${pad(r.end_hour)}:${pad(r.end_minute)}`)
      .join(', ');
    const days = (row.daysOfWeek || []).map((d) => d.charAt(0).toUpperCase() + d.slice(1)).join(', ') || '—';
    return `${ranges || '—'}  |  ${days}`;
  }
  const months = (row.months || []).map((m) => m.charAt(0).toUpperCase() + m.slice(1)).join(', ') || '—';
  const days   = (row.daysOfMonth || []).join(', ') || '—';
  return `${months}  |  Day: ${days}`;
};

// API → internal form state
const normalizeFromApi = (item) => ({
  id:          item.id,
  name:        item.name || '',
  type:        item.type === 'work_time' ? 'worktime' : (item.type || 'worktime'),
  // time_slots from API: [{start_hour, start_minute, end_hour, end_minute}] (numbers)
  timeSlots:   Array.isArray(item.time_slots) ? item.time_slots : [],
  daysOfWeek:  Array.isArray(item.days_of_week) ? item.days_of_week : [],
  months:      Array.isArray(item.months) ? item.months : [],
  daysOfMonth: Array.isArray(item.days_of_month) ? item.days_of_month : [],
});

// Internal form → time_slots for API (strings → numbers)
const formToTimeSlots = (timeRanges) =>
  timeRanges.map((r) => ({
    start_hour:   parseInt(r.startHour,   10),
    start_minute: parseInt(r.startMinute, 10),
    end_hour:     parseInt(r.endHour,     10),
    end_minute:   parseInt(r.endMinute,   10),
  }));

// API time_slots → form timeRanges (numbers → padded strings)
const apiSlotsToFormRanges = (slots) =>
  slots.map((s) => ({
    startHour:   pad(s.start_hour),
    startMinute: pad(s.start_minute),
    endHour:     pad(s.end_hour),
    endMinute:   pad(s.end_minute),
  }));

// ─── sub-components ───────────────────────────────────────────────────────────
const FieldRow = ({ label, required, children }) => (
  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 14 }}>
    <label style={{ width: 120, flexShrink: 0, fontSize: 13, fontWeight: 600, color: '#374151', paddingTop: 4 }}>
      {label}{required && <span style={{ color: '#dc2626', marginLeft: 2 }}>*</span>}
    </label>
    <div style={{ flex: 1 }}>{children}</div>
  </div>
);

const CheckGroup = ({ items, checked, onChange, cols = 7 }) => {
  const allValues = items.map((item) => (typeof item === 'object' ? item.value : item));
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, auto)`, gap: '4px 12px', justifyContent: 'start' }}>
      {items.map((item) => {
        const val = typeof item === 'object' ? item.value : item;
        const lbl = typeof item === 'object' ? item.label : item;
        return (
          <label key={val} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap' }}>
            <input
              type="checkbox"
              checked={checked.includes(val)}
              onChange={() => onChange(val)}
              style={{ accentColor: '#3b82f6', width: 14, height: 14 }}
            />
            {lbl}
          </label>
        );
      })}
      {/* All checkbox */}
      <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, cursor: 'pointer', userSelect: 'none', color: '#2563eb', fontWeight: 600 }}>
        <input
          type="checkbox"
          checked={checked.length === allValues.length && allValues.length > 0}
          onChange={() => onChange('__ALL__')}
          style={{ accentColor: '#3b82f6', width: 14, height: 14 }}
        />
        All
      </label>
    </div>
  );
};

const TimeSelect = ({ value, onChange, options }) => (
  <select
    value={value}
    onChange={(e) => onChange(e.target.value)}
    style={{ border: '1px solid #cbd5e1', borderRadius: 4, fontSize: 12, padding: '2px 4px', background: '#fff' }}
  >
    {options.map((o) => <option key={o} value={o}>{o}</option>)}
  </select>
);

// ─── main component ──────────────────────────────────────────────────────────
const TimeCondition = () => {
  const [rows, setRows]         = useState([]);
  const [selected, setSelected] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId]     = useState(null);
  const [form, setForm]         = useState({ ...TC_INITIAL_FORM });
  const [loading, setLoading]   = useState({ fetch: false, save: false, delete: false });
  const [toast, setToast]       = useState({ msg: '', type: '' });
  const hasLoaded               = useRef(false);

  const itemsPerPage = 20;
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(rows.length / itemsPerPage));
  const pagedRows  = rows.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: '', type: '' }), 4000);
  };

  // ── load ──────────────────────────────────────────────────────────────────
  const loadRows = async () => {
    setLoading((p) => ({ ...p, fetch: true }));
    try {
      const res  = await fetchTimeConditions();
      const list = Array.isArray(res?.message) ? res.message
                 : Array.isArray(res?.data)    ? res.data : [];
      setRows(list.map(normalizeFromApi));
    } catch (e) {
      showToast(e?.message || 'Failed to load time conditions', 'error');
    } finally {
      setLoading((p) => ({ ...p, fetch: false }));
    }
  };

  useEffect(() => {
    if (!hasLoaded.current) { hasLoaded.current = true; loadRows(); }
  }, []);

  // ── select helpers ────────────────────────────────────────────────────────
  const handleSelectRow  = (idx) => setSelected((s) => s.includes(idx) ? s.filter((i) => i !== idx) : [...s, idx]);
  const handleCheckAll   = () => setSelected(rows.map((_, i) => i));
  const handleUncheckAll = () => setSelected([]);

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
      showToast('Deleted successfully');
    } catch (e) {
      showToast(e?.message || 'Delete failed', 'error');
    } finally {
      setLoading((p) => ({ ...p, delete: false }));
    }
  };

  // ── modal ─────────────────────────────────────────────────────────────────
  const openAdd = () => {
    setForm({
      ...TC_INITIAL_FORM,
      timeRanges: [{ startHour: '09', startMinute: '00', endHour: '18', endMinute: '00' }],
    });
    setEditId(null);
    setShowModal(true);
  };

  const openEdit = (row) => {
    setForm({
      name:        row.name,
      type:        row.type,
      timeRanges:  row.timeSlots.length ? apiSlotsToFormRanges(row.timeSlots)
                                        : [{ startHour: '09', startMinute: '00', endHour: '18', endMinute: '00' }],
      daysOfWeek:  row.daysOfWeek,
      months:      row.months,
      daysOfMonth: row.daysOfMonth,
    });
    setEditId(row.id);
    setShowModal(true);
  };

  const closeModal = () => { setShowModal(false); setEditId(null); };

  // ── form helpers ──────────────────────────────────────────────────────────
  const allDayValues   = TC_DAYS_OF_WEEK.map((d) => d.value);
  const allMonthValues = TC_MONTHS.map((m) => m.value);
  const allDomValues   = TC_DAYS_OF_MONTH.map(String);

  const toggleCheck = (key, value, allValues) => {
    setForm((prev) => {
      const list = prev[key];
      if (value === '__ALL__') {
        return { ...prev, [key]: list.length === allValues.length ? [] : [...allValues] };
      }
      return { ...prev, [key]: list.includes(value) ? list.filter((v) => v !== value) : [...list, value] };
    });
  };

  const addTimeRange = () =>
    setForm((p) => ({ ...p, timeRanges: [...p.timeRanges, { startHour: '00', startMinute: '00', endHour: '00', endMinute: '00' }] }));

  const removeTimeRange = (idx) =>
    setForm((p) => ({ ...p, timeRanges: p.timeRanges.filter((_, i) => i !== idx) }));

  const updateTimeRange = (idx, field, val) =>
    setForm((p) => {
      const tr = [...p.timeRanges];
      tr[idx] = { ...tr[idx], [field]: val };
      return { ...p, timeRanges: tr };
    });

  // ── save ──────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!form.name.trim()) { showToast('Name is required', 'error'); return; }
    if (form.type === 'worktime' && !form.daysOfWeek.length)
      { showToast('Select at least one Day of Week', 'error'); return; }
    if (form.type === 'worktime' && !form.timeRanges.length)
      { showToast('Add at least one time range', 'error'); return; }
    if (form.type === 'holiday' && !form.months.length)
      { showToast('Select at least one Month', 'error'); return; }
    if (form.type === 'holiday' && !form.daysOfMonth.length)
      { showToast('Select at least one Day of Month', 'error'); return; }

    setLoading((p) => ({ ...p, save: true }));
    try {
      const common = {
        name:           form.name.trim(),
        condition_type: form.type,
      };

      const typeFields = form.type === 'worktime'
        ? {
            time_slots:   formToTimeSlots(form.timeRanges),
            days_of_week: form.daysOfWeek,
          }
        : {
            months:        form.months,
            days_of_month: form.daysOfMonth.map(Number),
          };

      const payload = editId !== null
        ? { id: editId, ...common, ...typeFields }
        : { ...common, ...typeFields };

      const res = editId !== null
        ? await updateTimeCondition(payload)
        : await createTimeCondition(payload);

      if (res?.response === false) { showToast(res.message || 'Save failed', 'error'); return; }
      showToast(editId !== null ? 'Updated successfully' : 'Created successfully');
      closeModal();
      await loadRows();
    } catch (e) {
      showToast(e?.message || 'Save failed', 'error');
    } finally {
      setLoading((p) => ({ ...p, save: false }));
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div style={{ backgroundColor: '#eef2f7', minHeight: 'calc(100vh - 80px)', padding: 16 }}>

      {/* Toast */}
      {toast.msg && (
        <div style={{
          position: 'fixed', top: 20, right: 20, zIndex: 9999, minWidth: 280,
          background: toast.type === 'error' ? '#fef2f2' : '#f0fdf4',
          border: `1px solid ${toast.type === 'error' ? '#fca5a5' : '#86efac'}`,
          color: toast.type === 'error' ? '#b91c1c' : '#15803d',
          borderRadius: 6, padding: '10px 16px', fontSize: 13, fontWeight: 600,
          boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
        }}>
          {toast.msg}
        </div>
      )}

      {/* Breadcrumb */}
      <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 12 }}>
        PBX &rsaquo; Call Features &rsaquo; <span style={{ color: '#1e293b', fontWeight: 600 }}>{TC_TITLE}</span>
      </div>

      <div className="w-full max-w-full mx-auto">
        {/* Blue header bar */}
        <div style={{
          borderRadius: '8px 8px 0 0', height: 36,
          background: 'linear-gradient(to bottom, #5A6F8F 0%, #3E5475 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 700, fontSize: 15, color: '#fff',
          boxShadow: '0 2px 8px rgba(80,160,255,0.10)',
        }}>
          {TC_TITLE}
        </div>

        {/* Table */}
        <div className="overflow-x-auto w-full">
          <table className="w-full min-w-175 bg-white border-2 border-t-0 border-gray-400">
            <thead>
              <tr>
                <th className="bg-white text-gray-800 font-semibold text-sm border border-gray-300 px-3 py-2 w-10 text-center"></th>
                <th className="bg-white text-gray-800 font-semibold text-sm border border-gray-300 px-3 py-2 w-10 text-center">#</th>
                {TC_TABLE_COLUMNS.map((c) => (
                  <th key={c.key} className="bg-white text-gray-800 font-semibold text-sm border border-gray-300 px-3 py-2 text-center">
                    {c.label}
                  </th>
                ))}
                <th className="bg-white text-gray-800 font-semibold text-sm border border-gray-300 px-3 py-2 w-16 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading.fetch ? (
                <tr>
                  <td colSpan={6} className="border border-gray-300 px-2 py-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <CircularProgress size={20} /><span>Loading...</span>
                    </div>
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="border border-gray-300 px-2 py-4 text-center text-gray-500">
                    No time conditions yet. Click &quot;Add New&quot; to create one.
                  </td>
                </tr>
              ) : (
                pagedRows.map((row, idx) => {
                  const realIdx = (page - 1) * itemsPerPage + idx;
                  return (
                    <tr key={row.id} style={{ background: realIdx % 2 === 0 ? '#ffffff' : '#f8fafc' }}>
                      <td className="border border-gray-300 px-2 py-1 text-center">
                        <input type="checkbox" checked={selected.includes(realIdx)} onChange={() => handleSelectRow(realIdx)} disabled={loading.delete} />
                      </td>
                      <td className="border border-gray-300 px-2 py-1 text-center text-sm">{realIdx + 1}</td>
                      <td className="border border-gray-300 px-2 py-1 text-center text-sm font-medium">{row.name}</td>
                      <td className="border border-gray-300 px-2 py-1 text-center text-sm">{typeLabel(row.type)}</td>
                      <td className="border border-gray-300 px-2 py-1 text-sm" style={{ maxWidth: 320 }}>{settingsSummary(row)}</td>
                      <td className="border border-gray-300 px-2 py-1 text-center">
                        <EditDocumentIcon
                          className="cursor-pointer text-blue-600 mx-auto opacity-70 hover:opacity-100"
                          titleAccess="Edit"
                          onClick={() => openEdit(row)}
                        />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Controls bar */}
        <div className="flex flex-wrap justify-between items-center bg-[#e3e7ef] rounded-b-lg border border-t-0 border-gray-300 px-2 py-2 gap-2">
          <div className="flex flex-wrap gap-2">
            <button
              className={`bg-gray-300 text-gray-700 cursor-pointer font-semibold text-xs rounded px-3 py-1 min-w-20 shadow hover:bg-gray-400 ${loading.delete || loading.fetch ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={handleCheckAll}
              disabled={loading.delete || loading.fetch}
            >
              Check All
            </button>
            <button
              className={`bg-gray-300 text-gray-700 font-semibold cursor-pointer text-xs rounded px-3 py-1 min-w-20 shadow hover:bg-gray-400 ${loading.delete || loading.fetch ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={handleUncheckAll}
              disabled={loading.delete || loading.fetch}
            >
              Uncheck All
            </button>
            <button
              className={`bg-gray-300 text-gray-700 font-semibold text-xs cursor-pointer rounded px-3 py-1 min-w-20 shadow hover:bg-gray-400 flex items-center gap-1 ${loading.delete || loading.fetch ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={handleDelete}
              disabled={loading.delete || loading.fetch}
            >
              {loading.delete && <CircularProgress size={12} />}
              Delete
            </button>
          </div>
          <div className="flex gap-2">
            <button
              className={`bg-gray-300 text-gray-700 font-semibold text-xs cursor-pointer rounded px-3 py-1 min-w-20 shadow hover:bg-gray-400 ${loading.save || loading.fetch ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={openAdd}
              disabled={loading.save || loading.fetch}
            >
              Add New
            </button>
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex flex-wrap items-center gap-2 w-full bg-gray-200 rounded-lg border border-gray-300 border-t-0 mt-1 p-1 text-xs text-gray-700">
            <span>{rows.length} items</span>
            <span>{page}/{totalPages}</span>
            {[['First', 1], ['Prev', page - 1], ['Next', page + 1], ['Last', totalPages]].map(([lbl, p]) => (
              <button key={lbl} onClick={() => setPage(Math.max(1, Math.min(totalPages, p)))}
                disabled={(lbl === 'First' || lbl === 'Prev') ? page === 1 : page === totalPages}
                className="bg-gray-300 text-gray-700 font-semibold rounded px-2 py-0.5 min-w-11.5 shadow hover:bg-gray-400 disabled:opacity-40">
                {lbl}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Modal ─────────────────────────────────────────────────────────── */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 1200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', borderRadius: 8, width: 680, maxWidth: '96vw', display: 'flex', flexDirection: 'column', boxShadow: '0 8px 32px rgba(0,0,0,0.22)' }}>

            {/* Modal header */}
            <div style={{ background: 'linear-gradient(to bottom, #5A6F8F, #3E5475)', color: '#fff', padding: '12px 20px', fontWeight: 700, fontSize: 15, textAlign: 'center' }}>
              {editId !== null ? 'Edit Time Condition' : 'Add Time Condition'}
            </div>

            {/* Modal body */}
            <div style={{ padding: '20px 24px', background: '#f8fafc' }}>

              {/* Name */}
              <FieldRow label="Name" required>
                <input
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  placeholder="Enter name"
                  style={{ width: '100%', height: 34, padding: '0 10px', border: '1px solid #cbd5e1', borderRadius: 4, fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
                />
              </FieldRow>

              {/* Type */}
              <FieldRow label="Type" required>
                <div style={{ display: 'flex', gap: 20 }}>
                  {TC_TYPES.map((t) => (
                    <label key={t.value} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer', fontWeight: form.type === t.value ? 600 : 400 }}>
                      <input type="radio" name="tc_type" value={t.value}
                        checked={form.type === t.value}
                        onChange={() => setForm((p) => ({ ...p, type: t.value }))}
                        style={{ accentColor: '#3b82f6' }}
                      />
                      {t.label}
                    </label>
                  ))}
                </div>
              </FieldRow>

              {/* ── WorkTime fields ── */}
              {form.type === 'worktime' && (
                <>
                  <FieldRow label="Settings" required>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 11, color: '#64748b', fontWeight: 600, paddingLeft: 70 }}>
                        <span style={{ width: 80, textAlign: 'center' }}>Hour</span>
                        <span style={{ width: 60, textAlign: 'center' }}>Minute</span>
                        <span style={{ width: 16 }} />
                        <span style={{ width: 80, textAlign: 'center' }}>Hour</span>
                        <span style={{ width: 60, textAlign: 'center' }}>Minute</span>
                      </div>
                      {form.timeRanges.map((tr, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontSize: 12, color: '#374151', width: 70, flexShrink: 0 }}>StartTime</span>
                          <TimeSelect value={tr.startHour}   onChange={(v) => updateTimeRange(i, 'startHour',   v)} options={TC_HOURS}   />
                          <span style={{ fontSize: 12 }}>:</span>
                          <TimeSelect value={tr.startMinute} onChange={(v) => updateTimeRange(i, 'startMinute', v)} options={TC_MINUTES} />
                          <span style={{ fontSize: 12, color: '#374151', marginLeft: 4 }}>EndTime</span>
                          <TimeSelect value={tr.endHour}     onChange={(v) => updateTimeRange(i, 'endHour',     v)} options={TC_HOURS}   />
                          <span style={{ fontSize: 12 }}>:</span>
                          <TimeSelect value={tr.endMinute}   onChange={(v) => updateTimeRange(i, 'endMinute',   v)} options={TC_MINUTES} />
                          {i === form.timeRanges.length - 1 ? (
                            <button onClick={addTimeRange}
                              style={{ width: 24, height: 24, borderRadius: 4, background: '#64748b', color: '#fff', border: 'none', fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
                          ) : (
                            <button onClick={() => removeTimeRange(i)}
                              style={{ width: 24, height: 24, borderRadius: 4, background: '#e2e8f0', color: '#64748b', border: 'none', fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
                          )}
                        </div>
                      ))}
                    </div>
                  </FieldRow>

                  <FieldRow label="Day of Week" required>
                    <CheckGroup
                      items={TC_DAYS_OF_WEEK}
                      checked={form.daysOfWeek}
                      onChange={(v) => toggleCheck('daysOfWeek', v, allDayValues)}
                      cols={4}
                    />
                  </FieldRow>
                </>
              )}

              {/* ── Holiday fields ── */}
              {form.type === 'holiday' && (
                <>
                  <FieldRow label="Month" required>
                    <CheckGroup
                      items={TC_MONTHS}
                      checked={form.months}
                      onChange={(v) => toggleCheck('months', v, allMonthValues)}
                      cols={6}
                    />
                  </FieldRow>

                  <FieldRow label="Day of Month" required>
                    <CheckGroup
                      items={TC_DAYS_OF_MONTH.map(String)}
                      checked={form.daysOfMonth.map(String)}
                      onChange={(v) => {
                        if (v === '__ALL__') {
                          setForm((p) => ({ ...p, daysOfMonth: p.daysOfMonth.length === allDomValues.length ? [] : allDomValues }));
                        } else {
                          setForm((p) => {
                            const cur = p.daysOfMonth.map(String);
                            return { ...p, daysOfMonth: cur.includes(v) ? cur.filter((d) => d !== v) : [...cur, v] };
                          });
                        }
                      }}
                      cols={7}
                    />
                  </FieldRow>
                </>
              )}
            </div>

            {/* Modal footer */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 16, padding: '12px 24px', borderTop: '1px solid #e2e8f0', background: '#fff' }}>
              <button
                onClick={handleSave}
                disabled={loading.save}
                style={{ background: 'linear-gradient(to bottom, #5A6F8F, #3E5475)', color: '#fff', border: 'none', borderRadius: 4, padding: '7px 28px', fontSize: 13, fontWeight: 600, cursor: 'pointer', minWidth: 100, display: 'flex', alignItems: 'center', gap: 6 }}
              >
                {loading.save && <CircularProgress size={14} style={{ color: '#fff' }} />}
                Save
              </button>
              <button
                onClick={closeModal}
                disabled={loading.save}
                style={{ background: '#f1f5f9', color: '#374151', border: '1px solid #cbd5e1', borderRadius: 4, padding: '7px 28px', fontSize: 13, fontWeight: 600, cursor: 'pointer', minWidth: 100 }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimeCondition;
