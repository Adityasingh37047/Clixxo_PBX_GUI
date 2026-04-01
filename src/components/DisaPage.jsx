import React, { useEffect, useMemo, useState } from 'react';
import EditDocumentIcon from '@mui/icons-material/EditDocument';
import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  MenuItem,
  Select,
} from '@mui/material';
import { createDisa, deleteDisa, getDisa, listDisa, listOutboundRoutes, updateDisa } from '../api/apiService';

const SECOND_DIAL_OPTIONS = ['Enable', 'Disable'];
const TRANSPARENT_OPTIONS = ['Enable', 'Disable'];

const INITIAL_FORM = {
  name: '',
  responseTimeout: '10',
  digitTimeout: '5',
  secondDial: 'Enable',
  transparent: 'Disable',
  pinType: 'None',
  pin: '',
  outboundRoutes: [],
  enabled: true,
};

const normalizeList = (raw) => {
  const list = raw?.message ?? raw?.data ?? raw;
  return Array.isArray(list) ? list : [];
};

const asBool = (value, fallback = false) => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value === 1;
  if (typeof value === 'string') {
    const v = value.toLowerCase().trim();
    if (['true', '1', 'yes', 'enable', 'enabled'].includes(v)) return true;
    if (['false', '0', 'no', 'disable', 'disabled'].includes(v)) return false;
  }
  return fallback;
};

const normalizePinType = (value) => {
  if (String(value || '').toLowerCase() === 'single_pin') return 'Single Pin';
  return 'None';
};

const mapDisaFromApi = (item) => {
  const outboundIdsRaw = Array.isArray(item?.outbound_routes)
    ? item.outbound_routes
    : Array.isArray(item?.outboundRoutes)
    ? item.outboundRoutes
    : [];
  const outboundRoutes = outboundIdsRaw
    .map((id) => Number(id))
    .filter((id) => Number.isFinite(id));

  return {
    id: item?.id,
    name: String(item?.name || ''),
    responseTimeout: String(item?.response_timeout ?? item?.responseTimeout ?? 10),
    digitTimeout: String(item?.digit_timeout ?? item?.digitTimeout ?? 5),
    secondDial: asBool(item?.second_dial ?? item?.secondDial, true) ? 'Enable' : 'Disable',
    transparent: asBool(item?.transparent, false) ? 'Enable' : 'Disable',
    pinType: normalizePinType(item?.pin_type ?? item?.pinType),
    pin: String(item?.pin_number ?? item?.pin ?? ''),
    outboundRoutes,
    enabled: asBool(item?.enabled, true),
  };
};

const DisaPage = () => {
  const [rows, setRows] = useState([]);
  const [selected, setSelected] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState({ list: false, save: false, delete: false, get: false });
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(INITIAL_FORM);

  // Outbound routes state: [{id, name}]
  const [allOutboundRoutes, setAllOutboundRoutes] = useState([]);
  const [availableSelected, setAvailableSelected] = useState([]);
  const [chosenSelected, setChosenSelected] = useState([]);

  const routeNameById = useMemo(() => {
    const map = new Map();
    allOutboundRoutes.forEach((route) => map.set(route.id, route.name));
    return map;
  }, [allOutboundRoutes]);

  const itemsPerPage = 20;
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(rows.length / itemsPerPage));
  const pagedRows = rows.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  useEffect(() => {
    setPage((p) => Math.min(Math.max(1, p), Math.max(1, Math.ceil(rows.length / itemsPerPage))));
  }, [rows]);

  const showAlert = (text) => window.alert(text);

  const fetchRows = async () => {
    setLoading((p) => ({ ...p, list: true }));
    try {
      const res = await listDisa();
      if (!res?.response) {
        setRows([]);
        return;
      }
      setRows(normalizeList(res).map(mapDisaFromApi));
    } catch {
      setRows([]);
    } finally {
      setLoading((p) => ({ ...p, list: false }));
    }
  };

  const fetchOutboundRoutes = async () => {
    try {
      const res = await listOutboundRoutes();
      const list = normalizeList(res);
      const routes = list
        .map((r) => ({
          id: Number(r?.id),
          name: String(r?.name || r?.route_name || ''),
        }))
        .filter((r) => Number.isFinite(r.id) && r.name);
      setAllOutboundRoutes(routes);
    } catch {
      setAllOutboundRoutes([]);
    }
  };

  useEffect(() => {
    fetchRows();
    fetchOutboundRoutes();
  }, []);

  const resetForm = () => {
    setEditId(null);
    setForm(INITIAL_FORM);
    setAvailableSelected([]);
    setChosenSelected([]);
  };

  const handleOpenAddModal = () => {
    resetForm();
    setShowModal(true);
  };

  const handleOpenEditModal = async (row) => {
    setEditId(row.id);
    setShowModal(true);
    setAvailableSelected([]);
    setChosenSelected([]);
    setLoading((p) => ({ ...p, get: true }));
    try {
      const res = await getDisa(row.id);
      if (res?.response === false) {
        showAlert(res?.message || 'Failed to load DISA details.');
        setForm({
          name: row.name,
          responseTimeout: row.responseTimeout,
          digitTimeout: row.digitTimeout,
          secondDial: row.secondDial,
          transparent: row.transparent,
          pinType: row.pinType,
          pin: row.pin,
          outboundRoutes: row.outboundRoutes,
          enabled: row.enabled,
        });
        return;
      }
      const detail = Array.isArray(res?.message) ? res.message[0] : res?.message || res?.data || row;
      setForm(mapDisaFromApi(detail));
    } catch {
      setForm({
        name: row.name,
        responseTimeout: row.responseTimeout,
        digitTimeout: row.digitTimeout,
        secondDial: row.secondDial,
        transparent: row.transparent,
        pinType: row.pinType,
        pin: row.pin,
        outboundRoutes: row.outboundRoutes,
        enabled: row.enabled,
      });
    } finally {
      setLoading((p) => ({ ...p, get: false }));
    }
  };

  const handleCloseModal = () => {
    if (loading.save || loading.get) return;
    setShowModal(false);
    resetForm();
  };

  const handleCheckAll = () => setSelected(rows.map((_, i) => i));
  const handleUncheckAll = () => setSelected([]);
  const handleSelectRow = (idx) =>
    setSelected((prev) => (prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]));

  const handleDelete = async () => {
    if (selected.length === 0) {
      showAlert('Please select at least one row to delete.');
      return;
    }
    setLoading((p) => ({ ...p, delete: true }));
    try {
      const ids = selected.map((idx) => rows[idx]?.id).filter((id) => id != null);
      const results = await Promise.all(ids.map((id) => deleteDisa(id)));
      const failed = results.find((r) => !r?.response);
      if (failed) showAlert(failed?.message || 'Failed to delete.');
      else showAlert('DISA deleted successfully.');
      await fetchRows();
      setSelected([]);
      setPage(1);
    } catch (err) {
      showAlert(err?.message || 'Failed to delete.');
    } finally {
      setLoading((p) => ({ ...p, delete: false }));
    }
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      showAlert('Name is required.');
      return;
    }
    if (!form.responseTimeout.trim()) {
      showAlert('Response Timeout is required.');
      return;
    }
    if (!form.digitTimeout.trim()) {
      showAlert('Digit Timeout is required.');
      return;
    }
    if (form.pinType === 'Single Pin' && !form.pin.trim()) {
      showAlert('Pin number is required.');
      return;
    }

    const payload = {
      name: form.name.trim(),
      response_timeout: Number(form.responseTimeout),
      digit_timeout: Number(form.digitTimeout),
      second_dial: form.secondDial === 'Enable',
      transparent: form.transparent === 'Enable',
      pin_type: form.pinType === 'Single Pin' ? 'single_pin' : 'none',
      pin_number: form.pinType === 'Single Pin' ? form.pin.trim() : '',
      outbound_routes: form.outboundRoutes,
      enabled: !!form.enabled,
    };

    setLoading((p) => ({ ...p, save: true }));
    try {
      const res = editId != null ? await updateDisa(editId, payload) : await createDisa(payload);
      if (!res?.response) {
        showAlert(res?.message || 'Failed to save DISA.');
        return;
      }
      showAlert(editId != null ? 'DISA updated successfully.' : 'DISA created successfully.');
      await fetchRows();
      handleCloseModal();
    } catch (err) {
      showAlert(err?.message || 'Failed to save DISA.');
    } finally {
      setLoading((p) => ({ ...p, save: false }));
    }
  };

  // Dual-list computed (IDs)
  const availableRoutes = allOutboundRoutes.filter((r) => !form.outboundRoutes.includes(r.id));
  const chosenRoutes = form.outboundRoutes;

  const addSelectedToChosen = () => {
    if (!availableSelected.length) return;
    setForm((f) => ({
      ...f,
      outboundRoutes: [...f.outboundRoutes, ...availableSelected.filter((id) => !f.outboundRoutes.includes(id))],
    }));
    setAvailableSelected([]);
  };

  const addAllToChosen = () => {
    setForm((f) => ({ ...f, outboundRoutes: [...f.outboundRoutes, ...availableRoutes.map((r) => r.id)] }));
    setAvailableSelected([]);
  };

  const removeSelectedFromChosen = () => {
    if (!chosenSelected.length) return;
    setForm((f) => ({ ...f, outboundRoutes: f.outboundRoutes.filter((id) => !chosenSelected.includes(id)) }));
    setChosenSelected([]);
  };

  const removeAllFromChosen = () => {
    setForm((f) => ({ ...f, outboundRoutes: [] }));
    setChosenSelected([]);
  };

  const moveChosenUp = () => {
    if (!chosenSelected.length) return;
    const routes = [...chosenRoutes];
    chosenSelected.forEach((id) => {
      const idx = routes.indexOf(id);
      if (idx > 0) [routes[idx - 1], routes[idx]] = [routes[idx], routes[idx - 1]];
    });
    setForm((f) => ({ ...f, outboundRoutes: routes }));
  };

  const moveChosenDown = () => {
    if (!chosenSelected.length) return;
    const routes = [...chosenRoutes];
    [...chosenSelected].reverse().forEach((id) => {
      const idx = routes.indexOf(id);
      if (idx < routes.length - 1) [routes[idx], routes[idx + 1]] = [routes[idx + 1], routes[idx]];
    });
    setForm((f) => ({ ...f, outboundRoutes: routes }));
  };

  const moveChosenTop = () => {
    if (!chosenSelected.length) return;
    const sel = chosenRoutes.filter((id) => chosenSelected.includes(id));
    const rest = chosenRoutes.filter((id) => !chosenSelected.includes(id));
    setForm((f) => ({ ...f, outboundRoutes: [...sel, ...rest] }));
  };

  const moveChosenBottom = () => {
    if (!chosenSelected.length) return;
    const sel = chosenRoutes.filter((id) => chosenSelected.includes(id));
    const rest = chosenRoutes.filter((id) => !chosenSelected.includes(id));
    setForm((f) => ({ ...f, outboundRoutes: [...rest, ...sel] }));
  };

  const arrowBtn =
    'h-8 w-full border border-gray-500 bg-[#d9dde3] text-sm font-semibold hover:bg-[#c5cbd3] cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed';

  return (
    <div className="w-full max-w-full mx-auto p-2">
      <div className="w-full max-w-full mx-auto">
        <div
          className="rounded-t-lg h-8 flex items-center justify-center font-semibold text-[18px] text-[#444] shadow-sm mt-0"
          style={{ background: 'linear-gradient(to bottom, #b3e0ff 0%, #6ec1f7 50%, #3b8fd6 100%)', boxShadow: '0 2px 8px 0 rgba(80,160,255,0.10)' }}
        >
          DISA
        </div>

        <div className="overflow-x-auto w-full">
          <table className="w-full min-w-[800px] bg-[#f8fafd] border-2 border-t-0 border-gray-400 rounded-b-lg shadow-sm">
            <thead>
              <tr>
                <th className="bg-white text-gray-800 font-semibold text-sm border border-gray-300 px-3 py-2 w-10 text-center" />
                <th className="bg-white text-gray-800 font-semibold text-sm border border-gray-300 px-3 py-2 w-10 text-center">#</th>
                <th className="bg-white text-gray-800 font-semibold text-sm border border-gray-300 px-3 py-2 text-center">Name</th>
                <th className="bg-white text-gray-800 font-semibold text-sm border border-gray-300 px-3 py-2 text-center">Response Timeout (s)</th>
                <th className="bg-white text-gray-800 font-semibold text-sm border border-gray-300 px-3 py-2 text-center">Digit Timeout (s)</th>
                <th className="bg-white text-gray-800 font-semibold text-sm border border-gray-300 px-3 py-2 text-center">Second Dial</th>
                <th className="bg-white text-gray-800 font-semibold text-sm border border-gray-300 px-3 py-2 text-center">Transparent</th>
                <th className="bg-white text-gray-800 font-semibold text-sm border border-gray-300 px-3 py-2 text-center">Pin Type</th>
                <th className="bg-white text-gray-800 font-semibold text-sm border border-gray-300 px-3 py-2 text-center">Outbound Routes</th>
                <th className="bg-white text-gray-800 font-semibold text-sm border border-gray-300 px-3 py-2 w-16 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading.list ? (
                <tr>
                  <td colSpan={10} className="border border-gray-300 px-2 py-4 text-center">
                    <CircularProgress size={20} />
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={10} className="border border-gray-300 px-2 py-4 text-center text-gray-500">
                    No DISA entries yet. Click &quot;Add New&quot; to create one.
                  </td>
                </tr>
              ) : (
                pagedRows.map((row, idx) => {
                  const realIdx = (page - 1) * itemsPerPage + idx;
                  const routeNames = row.outboundRoutes.map((id) => routeNameById.get(id) || `ID:${id}`);
                  return (
                    <tr key={row.id}>
                      <td className="border border-gray-300 px-2 py-1 text-center">
                        <input type="checkbox" checked={selected.includes(realIdx)} onChange={() => handleSelectRow(realIdx)} disabled={loading.delete} />
                      </td>
                      <td className="border border-gray-300 px-2 py-1 text-center">{realIdx + 1}</td>
                      <td className="border border-gray-300 px-2 py-1 text-center font-medium">{row.name}</td>
                      <td className="border border-gray-300 px-2 py-1 text-center">{row.responseTimeout}</td>
                      <td className="border border-gray-300 px-2 py-1 text-center">{row.digitTimeout}</td>
                      <td className="border border-gray-300 px-2 py-1 text-center">{row.secondDial}</td>
                      <td className="border border-gray-300 px-2 py-1 text-center">{row.transparent}</td>
                      <td className="border border-gray-300 px-2 py-1 text-center">{row.pinType}</td>
                      <td className="border border-gray-300 px-2 py-1 text-center">{routeNames.slice(0, 3).join(', ')}{routeNames.length > 3 ? ` +${routeNames.length - 3}` : ''}</td>
                      <td className="border border-gray-300 px-2 py-1 text-center">
                        <EditDocumentIcon className="cursor-pointer text-blue-600 mx-auto opacity-70 hover:opacity-100" titleAccess="Edit" onClick={() => handleOpenEditModal(row)} />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap justify-between items-center bg-[#e3e7ef] rounded-b-lg border border-t-0 border-gray-300 px-2 py-2 gap-2">
          <div className="flex flex-wrap gap-2">
            <button className={`bg-gray-300 text-gray-700 cursor-pointer font-semibold text-xs rounded px-3 py-1 min-w-[80px] shadow hover:bg-gray-400 ${loading.delete ? 'opacity-50 cursor-not-allowed' : ''}`} onClick={handleCheckAll} disabled={loading.delete}>Check All</button>
            <button className={`bg-gray-300 text-gray-700 font-semibold cursor-pointer text-xs rounded px-3 py-1 min-w-[80px] shadow hover:bg-gray-400 ${loading.delete ? 'opacity-50 cursor-not-allowed' : ''}`} onClick={handleUncheckAll} disabled={loading.delete}>Uncheck All</button>
            <button className={`bg-gray-300 text-gray-700 font-semibold text-xs cursor-pointer rounded px-3 py-1 min-w-[80px] shadow hover:bg-gray-400 flex items-center gap-1 ${loading.delete ? 'opacity-50 cursor-not-allowed' : ''}`} onClick={handleDelete} disabled={loading.delete}>
              {loading.delete && <CircularProgress size={12} />}Delete
            </button>
          </div>
          <div className="flex gap-2">
            <button className={`bg-gray-300 text-gray-700 font-semibold text-xs cursor-pointer rounded px-3 py-1 min-w-[80px] shadow hover:bg-gray-400 ${loading.save ? 'opacity-50 cursor-not-allowed' : ''}`} onClick={handleOpenAddModal} disabled={loading.save}>Add New</button>
          </div>
        </div>

        {totalPages > 1 && (
          <div className="flex flex-wrap items-center gap-2 w-full max-w-full mx-auto bg-gray-200 rounded-lg border border-gray-300 border-t-0 mt-1 p-1 text-xs text-gray-700">
            <span>{rows.length} items Total</span>
            <span>{itemsPerPage} Items/Page</span>
            <span>{page}/{totalPages}</span>
            <button className="bg-gray-300 text-gray-700 font-semibold text-xs rounded px-2 py-0.5 min-w-[50px] shadow hover:bg-gray-400 disabled:bg-gray-100 disabled:text-gray-400" onClick={() => setPage(1)} disabled={page === 1}>First</button>
            <button className="bg-gray-300 text-gray-700 font-semibold text-xs rounded px-2 py-0.5 min-w-[50px] shadow hover:bg-gray-400 disabled:bg-gray-100 disabled:text-gray-400" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>Previous</button>
            <button className="bg-gray-300 text-gray-700 font-semibold text-xs rounded px-2 py-0.5 min-w-[50px] shadow hover:bg-gray-400 disabled:bg-gray-100 disabled:text-gray-400" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Next</button>
            <button className="bg-gray-300 text-gray-700 font-semibold text-xs rounded px-2 py-0.5 min-w-[50px] shadow hover:bg-gray-400 disabled:bg-gray-100 disabled:text-gray-400" onClick={() => setPage(totalPages)} disabled={page === totalPages}>Last</button>
            <select className="text-xs rounded border border-gray-300 px-1 py-0.5 min-w-[40px]" value={page} onChange={(e) => setPage(Number(e.target.value))}>
              {Array.from({ length: totalPages }, (_, i) => (<option key={i + 1} value={i + 1}>{i + 1}</option>))}
            </select>
            <span>{totalPages} Pages Total</span>
          </div>
        )}
      </div>

      <Dialog
        open={showModal}
        onClose={loading.save || loading.get ? null : handleCloseModal}
        maxWidth={false}
        className="z-50"
        PaperProps={{ sx: { width: 980, maxWidth: '96vw', mx: 'auto', p: 0 } }}
      >
        <DialogTitle
          className="text-white text-center font-semibold p-2 text-base"
          style={{ background: 'linear-gradient(to bottom, #4a5568 0%, #2d3748 50%, #1a202c 100%)', borderBottom: '1px solid #444444' }}
        >
          {editId != null ? 'Edit DISA' : 'Add DISA'}
        </DialogTitle>

        <DialogContent className="pt-0 pb-0 px-0" style={{ backgroundColor: '#dde0e4', border: '1px solid #444444', borderTop: 'none' }}>
          <div className="pt-4 pb-4 px-4 bg-white">
            <div className="border border-gray-300 rounded-md overflow-hidden">
              <div className="px-4 py-4">
                {loading.get ? (
                  <div className="py-12 text-center">
                    <CircularProgress size={24} />
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-2">
                      <div className="flex items-center gap-2" style={{ minHeight: 30 }}>
                        <label className="text-[14px] text-gray-700 font-medium whitespace-nowrap" style={{ width: 170, marginRight: 8 }}>
                          Name <span className="text-red-500">*</span>
                        </label>
                        <input className="border border-gray-300 rounded px-2 py-1 text-[14px] outline-none w-full max-w-[240px]" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
                      </div>

                      <div className="flex items-center gap-2" style={{ minHeight: 30 }}>
                        <label className="text-[14px] text-gray-700 font-medium whitespace-nowrap" style={{ width: 170, marginRight: 8 }}>
                          Response Timeout (s) <span className="text-red-500">*</span>
                        </label>
                        <input className="border border-gray-300 rounded px-2 py-1 text-[14px] outline-none w-full max-w-[240px]" value={form.responseTimeout} onChange={(e) => setForm((f) => ({ ...f, responseTimeout: e.target.value }))} type="number" min="1" />
                      </div>

                      <div className="flex items-center gap-2" style={{ minHeight: 30 }}>
                        <label className="text-[14px] text-gray-700 font-medium whitespace-nowrap" style={{ width: 170, marginRight: 8 }}>
                          Digit Timeout (s) <span className="text-red-500">*</span>
                        </label>
                        <input className="border border-gray-300 rounded px-2 py-1 text-[14px] outline-none w-full max-w-[240px]" value={form.digitTimeout} onChange={(e) => setForm((f) => ({ ...f, digitTimeout: e.target.value }))} type="number" min="1" />
                      </div>

                      <div className="flex items-center gap-2" style={{ minHeight: 30 }}>
                        <label className="text-[14px] text-gray-700 font-medium whitespace-nowrap" style={{ width: 170, marginRight: 8 }}>
                          Second Dial
                        </label>
                        <div className="w-full max-w-[240px]">
                          <FormControl size="small" fullWidth>
                            <Select value={form.secondDial} onChange={(e) => setForm((f) => ({ ...f, secondDial: e.target.value }))}>
                              {SECOND_DIAL_OPTIONS.map((o) => (
                                <MenuItem key={o} value={o}>
                                  {o}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </div>
                      </div>

                      <div className="flex items-center gap-2" style={{ minHeight: 30 }}>
                        <label className="text-[14px] text-gray-700 font-medium whitespace-nowrap" style={{ width: 170, marginRight: 8 }}>
                          Transparent
                        </label>
                        <div className="w-full max-w-[240px]">
                          <FormControl size="small" fullWidth>
                            <Select value={form.transparent} onChange={(e) => setForm((f) => ({ ...f, transparent: e.target.value }))}>
                              {TRANSPARENT_OPTIONS.map((o) => (
                                <MenuItem key={o} value={o}>
                                  {o}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </div>
                      </div>

                      <div className="flex items-start gap-2" style={{ minHeight: 30 }}>
                        <label className="text-[14px] text-gray-700 font-medium whitespace-nowrap pt-1" style={{ width: 170, marginRight: 8 }}>
                          Pin Type
                        </label>
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center gap-4">
                            <label className="flex items-center gap-1 text-[14px] text-gray-700 cursor-pointer">
                              <input type="radio" name="pinType" value="None" checked={form.pinType === 'None'} onChange={() => setForm((f) => ({ ...f, pinType: 'None', pin: '' }))} />
                              None
                            </label>
                            <label className="flex items-center gap-1 text-[14px] text-gray-700 cursor-pointer">
                              <input type="radio" name="pinType" value="Single Pin" checked={form.pinType === 'Single Pin'} onChange={() => setForm((f) => ({ ...f, pinType: 'Single Pin' }))} />
                              Single Pin
                            </label>
                          </div>
                          {form.pinType === 'Single Pin' && (
                            <div className="flex items-center gap-2">
                              <label className="text-[13px] text-gray-600 whitespace-nowrap">Enter Pin:</label>
                              <input className="border border-gray-300 rounded px-2 py-1 text-[14px] outline-none" style={{ width: 160 }} value={form.pin} onChange={(e) => setForm((f) => ({ ...f, pin: e.target.value }))} placeholder="Enter pin number" />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4">
                      <div className="text-[14px] text-gray-700 font-medium mb-2">
                        Outbound Routes <span className="text-red-500">*</span>
                      </div>
                      <div className="grid grid-cols-[1fr_48px_1fr_48px] gap-3 items-start">
                        <div>
                          <div className="text-[13px] font-semibold text-[#325a84] text-center mb-2">Available</div>
                          <select multiple value={availableSelected.map(String)} onChange={(e) => setAvailableSelected(Array.from(e.target.selectedOptions, (opt) => Number(opt.value)).filter((v) => Number.isFinite(v)))} className="w-full h-32 border border-gray-300 bg-white rounded px-2 py-1 text-[14px] outline-none">
                            {availableRoutes.length === 0 ? (
                              <option disabled>No routes available</option>
                            ) : (
                              availableRoutes.map((route) => (
                                <option key={route.id} value={route.id}>
                                  {route.name}
                                </option>
                              ))
                            )}
                          </select>
                        </div>

                        <div className="flex flex-col gap-1 pt-7">
                          <button type="button" className={arrowBtn} onClick={addSelectedToChosen}>
                            &gt;
                          </button>
                          <button type="button" className={arrowBtn} onClick={addAllToChosen}>
                            &gt;&gt;
                          </button>
                          <button type="button" className={arrowBtn} onClick={removeSelectedFromChosen}>
                            &lt;
                          </button>
                          <button type="button" className={arrowBtn} onClick={removeAllFromChosen}>
                            &lt;&lt;
                          </button>
                        </div>

                        <div>
                          <div className="text-[13px] font-semibold text-[#325a84] text-center mb-2">Selected</div>
                          <select multiple value={chosenSelected.map(String)} onChange={(e) => setChosenSelected(Array.from(e.target.selectedOptions, (opt) => Number(opt.value)).filter((v) => Number.isFinite(v)))} className="w-full h-32 border border-gray-300 bg-white rounded px-2 py-1 text-[14px] outline-none">
                            {chosenRoutes.length === 0 ? (
                              <option disabled>No selected routes</option>
                            ) : (
                              chosenRoutes.map((routeId) => (
                                <option key={routeId} value={routeId}>
                                  {routeNameById.get(routeId) || `ID:${routeId}`}
                                </option>
                              ))
                            )}
                          </select>
                        </div>

                        <div className="flex flex-col gap-1 pt-7">
                          <button type="button" className={arrowBtn} onClick={moveChosenTop}>
                            &#8679;
                          </button>
                          <button type="button" className={arrowBtn} onClick={moveChosenUp}>
                            &#8593;
                          </button>
                          <button type="button" className={arrowBtn} onClick={moveChosenDown}>
                            &#8595;
                          </button>
                          <button type="button" className={arrowBtn} onClick={moveChosenBottom}>
                            &#8681;
                          </button>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </DialogContent>

        <DialogActions className="p-4 justify-center gap-6">
          <Button
            variant="contained"
            sx={{
              background: 'linear-gradient(to bottom, #3bb6f5 0%, #0e8fd6 100%)',
              color: '#fff',
              fontWeight: 600,
              fontSize: '16px',
              borderRadius: 2,
              minWidth: 120,
              minHeight: 40,
              px: 2,
              py: 0.5,
              boxShadow: '0 2px 8px #b3e0ff',
              textTransform: 'none',
              '&:hover': { background: 'linear-gradient(to bottom, #0e8fd6 0%, #3bb6f5 100%)', color: '#fff' },
              '&:disabled': { background: '#ccc', color: '#666' },
            }}
            onClick={handleSave}
            disabled={loading.save || loading.get}
            startIcon={loading.save && <CircularProgress size={20} color="inherit" />}
          >
            {loading.save ? 'Saving...' : 'Save'}
          </Button>
          <Button
            variant="contained"
            sx={{
              background: 'linear-gradient(to bottom, #e5e7eb 0%, #d1d5db 100%)',
              color: '#374151',
              fontWeight: 600,
              fontSize: '16px',
              borderRadius: 2,
              minWidth: 120,
              minHeight: 40,
              px: 2,
              py: 0.5,
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              textTransform: 'none',
              '&:hover': { background: 'linear-gradient(to bottom, #d1d5db 0%, #e5e7eb 100%)', color: '#374151' },
              '&:disabled': { background: '#f3f4f6', color: '#9ca3af' },
            }}
            onClick={handleCloseModal}
            disabled={loading.save || loading.get}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default DisaPage;
