import React, { useState } from 'react';
import {
  NUMBER_TYPE_TABLE_COLUMNS,
  NUMBER_TYPE_OPTIONS,
  NUMBER_TYPE_MODAL_FIELDS,
  NUMBER_TYPE_MODAL_INITIAL_FORM
} from '../constants/IsdnNumberParamaterConstants';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Checkbox from '@mui/material/Checkbox';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import EditDocumentIcon from '@mui/icons-material/EditDocument';

function NumberTypeTable({ title, data, setData, modalState, setModalState }) {
  const [selected, setSelected] = useState([]);
  const handleSelectRow = idx => setSelected(sel => sel.includes(idx) ? sel.filter(i => i !== idx) : [...sel, idx]);
  const handleDelete = () => {
    const newData = data.filter((_, idx) => !selected.includes(idx));
    setData(newData);
    setSelected([]);
  };
  const handleClearAll = () => {
    setData([]);
    setSelected([]);
  };
  return (
    <div className="min-w-0 w-full flex flex-col">
      <div className="w-full bg-gradient-to-b from-[#b3e0ff] to-[#3d92d0] text-[#222] font-semibold text-lg text-center py-1">
        {title}
      </div>
      <div className="bg-gray-200 border-2 border-gray-400 border-t-0 rounded-b-lg">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[430px] border-collapse table-auto">
          <colgroup>
            <col className="w-[90px]" />
            <col className="w-[80px]" />
            <col className="min-w-[120px] w-[1fr]" />
            <col className="min-w-[120px] w-[1fr]" />
            <col className="w-[130px]" />
            <col className="w-[180px] text-center" />
            <col className="w-[90px]" />
          </colgroup>
          <thead>
            <tr>
              {NUMBER_TYPE_TABLE_COLUMNS.map(col => (
                <th
                  key={col.key}
                  className={`bg-white text-gray-800 font-semibold text-xs border border-gray-400 px-1 py-0.5 whitespace-nowrap ${col.key === 'setRedirecting' ? 'whitespace-normal text-center' : ''}`}
                  style={{ fontSize: col.key === 'setRedirecting' ? 11 : 12 }}
                >
                  {col.key === 'setRedirecting'
                    ? (<span>Set if Redirecting<br />Number Available</span>)
                    : col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, idx) => (
              <tr key={idx} style={{ borderBottom: '1px solid #bbb' }}>
                  <td className="border border-gray-400 px-1 py-0.5 text-center bg-gray-200"><Checkbox checked={selected.includes(idx)} onChange={() => handleSelectRow(idx)} size="small" /></td>
                <td className="border border-gray-400 px-1 py-0.5 text-center bg-gray-200 text-xs">{row.no}</td>
                <td className="border border-gray-400 px-1 py-0.5 text-center bg-gray-200 text-xs">{row.callerIdPrefix}</td>
                <td className="border border-gray-400 px-1 py-0.5 text-center bg-gray-200 text-xs">{row.calleeIdPrefix}</td>
                <td className="border border-gray-400 px-1 py-0.5 text-center bg-gray-200 text-xs">{NUMBER_TYPE_OPTIONS.find(opt => opt.value === row.type)?.label || ''}</td>
                <td className="border border-gray-400 px-1 py-0.5 text-center bg-gray-200 text-xs">{row.setRedirecting ? 'Yes' : 'No'}</td>
                <td className="border border-gray-400 px-1 py-0.5 text-center bg-gray-200">
                  <Button onClick={() => setModalState({ open: true, editIdx: idx, form: row })} sx={{ minWidth: 0, p: 0, borderRadius: 1 }}>
                    <EditDocumentIcon style={{ fontSize: 24, color: '#0e8fd6', transition: 'color 0.2s, transform 0.2s' }} />
                  </Button>
                </td>
              </tr>
            ))}
            {Array.from({ length: Math.max(0, 12 - data.length) }).map((_, i) => (
                <tr key={`empty-${i}`} style={{ borderBottom: '1px solid #bbb', background: '#fff' }}>
                {NUMBER_TYPE_TABLE_COLUMNS.map((col, j) => (
                  <td key={j} className="border border-gray-400 px-1 py-0.5 text-center bg-white" style={{ color: '#aaa' }}>&nbsp;</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>
      <div className="flex justify-between items-center bg-gray-300 rounded-b-lg px-1 py-0.5 mt-1">
        <div className="flex gap-1">
          <button
            className="bg-gray-400 text-gray-700 font-semibold text-xs rounded px-2 py-0.5 min-w-[70px] shadow hover:bg-gray-500 disabled:bg-gray-200 disabled:text-gray-400"
            onClick={handleDelete}
          >Delete</button>
          <button
            className="bg-gray-400 text-gray-700 font-semibold text-xs rounded px-2 py-0.5 min-w-[70px] shadow hover:bg-gray-500 disabled:bg-gray-200 disabled:text-gray-400"
            onClick={handleClearAll}
          >Clear All</button>
        </div>
        <button
          className="bg-gray-400 text-gray-700 font-semibold text-xs rounded px-2 py-0.5 min-w-[70px] shadow hover:bg-gray-500 disabled:bg-gray-200 disabled:text-gray-400"
          onClick={() => setModalState({ open: true, editIdx: -1, form: NUMBER_TYPE_MODAL_INITIAL_FORM })}
        >Add New</button>
      </div>
    </div>
  );
}

function NumberTypeModal({ open, form, setForm, onSave, onClose }) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle className="bg-gray-600 text-white text-center font-semibold text-lg">Calling Party Number Type</DialogTitle>
      <DialogContent className="bg-gray-200 flex flex-col gap-3 py-4">
          {NUMBER_TYPE_MODAL_FIELDS.map(field => (
          <div key={field.name} className="flex flex-row items-center border border-gray-400 rounded px-2 py-1 gap-2 w-full bg-white mb-1">
            <label className="text-xs text-gray-700 font-medium whitespace-nowrap text-left min-w-[120px] mr-2">{field.label}</label>
            <div className="flex-1 min-w-0">
              {field.type === 'select' ? (
                <Select
                  size="small"
                  value={form[field.name]}
                  onChange={e => setForm(f => ({ ...f, [field.name]: e.target.value }))}
                  fullWidth
                  sx={{ fontSize: '12px' }}
                >
                  {field.options.map(opt => <MenuItem key={opt.value} value={opt.value} sx={{ fontSize: '12px' }}>{opt.label}</MenuItem>)}
                </Select>
              ) : field.type === 'checkbox' ? (
                <Checkbox checked={form[field.name]} onChange={e => setForm(f => ({ ...f, [field.name]: e.target.checked }))} />
              ) : (
                <TextField
                  type={field.type}
                  size="small"
                  value={form[field.name]}
                  onChange={e => setForm(f => ({ ...f, [field.name]: e.target.value }))}
                  fullWidth
                  sx={{ '& .MuiInputBase-input': { fontSize: '12px' } }}
                />
              )}
            </div>
            </div>
          ))}
      </DialogContent>
      <DialogActions className="flex justify-center gap-6 pb-4">
        <Button
          variant="contained"
          sx={{ background: 'linear-gradient(to bottom, #9ca3af 0%, #6b7280 100%)', color: '#fff', fontWeight: 600, fontSize: '12px', borderRadius: 1, minWidth: 100, textTransform: 'none', '&:hover': { background: 'linear-gradient(to bottom, #6b7280 0%, #9ca3af 100%)', color: '#fff', }, }}
          onClick={onSave}
        >
          Save
        </Button>
        <Button
          variant="contained"
          sx={{ background: 'linear-gradient(to bottom, #d1d5db 0%, #9ca3af 100%)', color: '#111827', fontWeight: 600, fontSize: '12px', borderRadius: 1, minWidth: 100, textTransform: 'none', '&:hover': { background: 'linear-gradient(to bottom, #9ca3af 0%, #d1d5db 100%)', color: '#111827', }, }}
          onClick={onClose}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}

const IsdnNumberParameterPage = () => {
  const [enabled, setEnabled] = useState(false);
  const [callingData, setCallingData] = useState([]);
  const [calledData, setCalledData] = useState([]);
  // Modal state for both tables
  const [callingModal, setCallingModal] = useState({ open: false, editIdx: -1, form: NUMBER_TYPE_MODAL_INITIAL_FORM });
  const [calledModal, setCalledModal] = useState({ open: false, editIdx: -1, form: NUMBER_TYPE_MODAL_INITIAL_FORM });

  // Modal handlers
  const handleModalSave = (which) => {
    if (which === 'calling') {
      setCallingData(prev => {
        let updated;
        if (callingModal.editIdx > -1) {
          updated = [...prev];
          updated[callingModal.editIdx] = callingModal.form;
        } else {
          updated = [...prev, callingModal.form];
        }
        return updated;
      });
      setCallingModal({ open: false, editIdx: -1, form: NUMBER_TYPE_MODAL_INITIAL_FORM });
    } else {
      setCalledData(prev => {
        let updated;
        if (calledModal.editIdx > -1) {
          updated = [...prev];
          updated[calledModal.editIdx] = calledModal.form;
        } else {
          updated = [...prev, calledModal.form];
        }
        return updated;
      });
      setCalledModal({ open: false, editIdx: -1, form: NUMBER_TYPE_MODAL_INITIAL_FORM });
    }
  };

  // Modal close
  const handleModalClose = (which) => {
    if (which === 'calling') setCallingModal({ open: false, editIdx: -1, form: NUMBER_TYPE_MODAL_INITIAL_FORM });
    else setCalledModal({ open: false, editIdx: -1, form: NUMBER_TYPE_MODAL_INITIAL_FORM });
  };

  return (
    <div className="bg-gray-100 min-h-[calc(100vh-80px)] p-1 m-0 w-full">
      <div className="w-full pt-2 px-2">
        <div className="flex flex-wrap items-center mb-2 gap-2 px-2">
          <span className="font-semibold text-sm mr-2">Judge CallerID/CalleeID Prefix before Number Manipulation:</span>
          <Checkbox checked={enabled} onChange={e => setEnabled(e.target.checked)} size="small" />
          <span className="font-medium text-xs mr-4">Enable</span>
          <Button variant="contained" sx={{ background: 'linear-gradient(to bottom, #3bb6f5 0%, #0e8fd6 100%)', color: '#fff', fontWeight: 600, fontSize: '12px', borderRadius: 1.5, minWidth: 100, textTransform: 'none', '&:hover': { background: 'linear-gradient(to bottom, #0e8fd6 0%, #3bb6f5 100%)', color: '#fff', }, }}>Set</Button>
        </div>
        <div className="flex flex-col lg:flex-row justify-center gap-2 px-0">
          <NumberTypeTable title="Calling Party Number Type" data={callingData} setData={setCallingData} modalState={callingModal} setModalState={setCallingModal} />
          <NumberTypeTable title="Called Party Number Type" data={calledData} setData={setCalledData} modalState={calledModal} setModalState={setCalledModal} />
        </div>
        <NumberTypeModal open={callingModal.open} form={callingModal.form} setForm={f => setCallingModal(m => ({ ...m, form: typeof f === 'function' ? f(m.form) : f }))} onSave={() => handleModalSave('calling')} onClose={() => handleModalClose('calling')} />
        <NumberTypeModal open={calledModal.open} form={calledModal.form} setForm={f => setCalledModal(m => ({ ...m, form: typeof f === 'function' ? f(m.form) : f }))} onSave={() => handleModalSave('called')} onClose={() => handleModalClose('called')} />
      </div>
    </div>
  );
};

export default IsdnNumberParameterPage;
