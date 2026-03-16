import React, { useState } from 'react';
import { CALLERID_POOL_TABLE_COLUMNS, CALLERID_POOL_MODAL_FIELDS, CALLERID_POOL_INITIAL_FORM } from '../constants/CallerIDPoolConstants';
import EditDocumentIcon from '@mui/icons-material/EditDocument';
import { Button, TextField, Select, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions, FormControl, InputLabel } from '@mui/material';

const CallerIDPool = () => {
  // Top controls state
  const [prefix, setPrefix] = useState('');
  const [startDate, setStartDate] = useState('');
  const [usageCycle, setUsageCycle] = useState('0');
  const [outboundCallerId, setOutboundCallerId] = useState('0');
  const [designationMode, setDesignationMode] = useState('SIP Side Reject');
  const [destinationPcm, setDestinationPcm] = useState('PCM');

  // Table states
  const [rowsIpPstn, setRowsIpPstn] = useState([]);
  const [checkedIpPstn, setCheckedIpPstn] = useState([]);
  const [rowsPstnIp, setRowsPstnIp] = useState([]);
  const [checkedPstnIp, setCheckedPstnIp] = useState([]);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState(CALLERID_POOL_INITIAL_FORM);
  const [editIndex, setEditIndex] = useState(null);
  const [modalTable, setModalTable] = useState('ip_pstn'); // 'ip_pstn' or 'pstn_ip'

  // Checkbox handlers
  const handleCheck = (table, idx) => {
    if (table === 'ip_pstn') {
      setCheckedIpPstn(prev => prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]);
    } else {
      setCheckedPstnIp(prev => prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]);
    }
  };
  const handleCheckAll = (table) => {
    if (table === 'ip_pstn') {
      if (checkedIpPstn.length === rowsIpPstn.length) setCheckedIpPstn([]);
      else setCheckedIpPstn(rowsIpPstn.map((_, idx) => idx));
    } else {
      if (checkedPstnIp.length === rowsPstnIp.length) setCheckedPstnIp([]);
      else setCheckedPstnIp(rowsPstnIp.map((_, idx) => idx));
    }
  };
  const handleInverse = (table) => {
    if (table === 'ip_pstn') {
      setCheckedIpPstn(rowsIpPstn.map((_, idx) => (checkedIpPstn.includes(idx) ? null : idx)).filter(i => i !== null));
    } else {
      setCheckedPstnIp(rowsPstnIp.map((_, idx) => (checkedPstnIp.includes(idx) ? null : idx)).filter(i => i !== null));
    }
  };

  // Delete and Clear All handlers
  const handleDelete = (table) => {
    if (table === 'ip_pstn') {
      setRowsIpPstn(rows => rows.filter((_, idx) => !checkedIpPstn.includes(idx)));
      setCheckedIpPstn([]);
    } else {
      setRowsPstnIp(rows => rows.filter((_, idx) => !checkedPstnIp.includes(idx)));
      setCheckedPstnIp([]);
    }
  };
  const handleClear = (table) => {
    if (table === 'ip_pstn') {
      setRowsIpPstn([]);
      setCheckedIpPstn([]);
    } else {
      setRowsPstnIp([]);
      setCheckedPstnIp([]);
    }
  };

  // Modal handlers
  const handleAddNew = (table) => {
    setModalData(CALLERID_POOL_INITIAL_FORM);
    setEditIndex(null);
    setModalTable(table);
    setShowModal(true);
  };
  const handleEdit = (table, idx) => {
    setModalData(table === 'ip_pstn' ? rowsIpPstn[idx] : rowsPstnIp[idx]);
    setEditIndex(idx);
    setModalTable(table);
    setShowModal(true);
  };
  const handleModalChange = (key, value) => {
    setModalData(data => ({ ...data, [key]: value }));
  };
  const handleModalSave = () => {
    const dataToSave = {
      ...modalData,
      callerIdRange: `${modalData.callerIdRangeStart || ''}${modalData.callerIdRangeEnd ? '--' + modalData.callerIdRangeEnd : ''}`,
    };
    if (modalTable === 'ip_pstn') {
      if (editIndex !== null) {
        setRowsIpPstn(rows => rows.map((row, idx) => idx === editIndex ? dataToSave : row));
      } else {
        setRowsIpPstn(rows => [...rows, dataToSave]);
      }
    } else {
      if (editIndex !== null) {
        setRowsPstnIp(rows => rows.map((row, idx) => idx === editIndex ? dataToSave : row));
      } else {
        setRowsPstnIp(rows => [...rows, dataToSave]);
      }
    }
    setShowModal(false);
    setEditIndex(null);
  };
  const handleModalClose = () => {
    setShowModal(false);
    setEditIndex(null);
  };

  // Top section Set button handler (no-op for now)
  const handleSet = (e) => {
    e.preventDefault();
    // Implement logic as needed
  };

  // Table rendering helper
  const renderTable = (rows, checked, tableKey, title) => {
    const columns = tableKey === 'pstn_ip'
      ? CALLERID_POOL_TABLE_COLUMNS.map(col =>
          col.key === 'destinationPcm' ? { ...col, label: 'Source PCM' } : col
        )
      : CALLERID_POOL_TABLE_COLUMNS;
    return (
      <div className="w-full md:w-[49%] flex flex-col gap-2">
        <div className="bg-gray-200 border-b-2 border-gray-400 rounded-b-lg w-full min-h-[300px] sm:min-h-[400px] flex flex-col">
          <div className="w-full bg-gradient-to-b from-[#b3e0ff] to-[#3d92d0] text-[#222] font-semibold text-lg text-center py-1">
            {title}
          </div>
          <div className="overflow-x-auto w-full flex-1 border-l-2 border-r-2 border-gray-400" style={{ height: '300px', minHeight: '300px' }}>
            <table className="w-full min-w-[500px] border-collapse table-auto">
              <thead>
                <tr>
                  {columns.map(col => (
                    <th key={col.key} className="bg-white text-gray-600 font-semibold text-xs border border-gray-400 px-1 py-0.5 whitespace-nowrap text-center">
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #bbb' }}>
                    <td className="border border-gray-400 px-1 py-0.5 text-center bg-white"><input type="checkbox" checked={checked.includes(idx)} onChange={() => handleCheck(tableKey, idx)} className="w-4 h-4" /></td>
                    <td className="border border-gray-400 px-1 py-0.5 text-center bg-white text-xs">{row.no}</td>
                    <td className="border border-gray-400 px-1 py-0.5 text-center bg-white text-xs">{row.callerIdRange}</td>
                    <td className="border border-gray-400 px-1 py-0.5 text-center bg-white text-xs">{row.outgoingCallResource}</td>
                    <td className="border border-gray-400 px-1 py-0.5 text-center bg-white text-xs">{row.destinationPcm}</td>
                    <td className="border border-gray-400 px-1 py-0.5 text-center bg-white">
                      <EditDocumentIcon style={{ color: '#0e8fd6', cursor: 'pointer', margin: '0 auto' }} className="w-5 h-5" onClick={() => handleEdit(tableKey, idx)} />
                    </td>
                  </tr>
                ))}
                {Array.from({ length: Math.max(0, 12 - rows.length) }).map((_, idx) => (
                  <tr key={`empty-${idx}`} style={{ borderBottom: '1px solid #bbb', background: '#fff' }}> 
                    {columns.map((col, j) => (
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
              className="bg-gray-400 text-gray-700 font-semibold text-xs rounded px-2 py-0.5 min-w-[70px] shadow hover:bg-gray-500" 
              onClick={() => handleDelete(tableKey)}
            >
              Delete
            </button>
            <button 
              className="bg-gray-400 text-gray-700 font-semibold text-xs rounded px-2 py-0.5 min-w-[70px] shadow hover:bg-gray-500" 
              onClick={() => handleClear(tableKey)}
            >
              Clear All
            </button>
          </div>
          <button 
            className="bg-gray-400 text-gray-700 font-semibold text-xs rounded px-2 py-0.5 min-w-[70px] shadow hover:bg-gray-500" 
            onClick={() => handleAddNew(tableKey)}
          >
            Add New
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-gray-50 min-h-[calc(100vh-200px)] w-full p-0 m-0" style={{backgroundColor: "#dde0e4"}}>
      {/* Top controls */}
      <form onSubmit={handleSet} className=" rounded-lg p-0 md:p-6 mb-0 border-none w-full mx-auto">
        {/* First row - Manipulate IP->PSTN CallerIDs section */}
        <div className="flex flex-wrap items-center gap-4 mb-4">
          <div className="flex items-center justify-between gap-6 min-w-fit">
            <span className="font-medium text-sm whitespace-nowrap">Manipulate IP-&gt;PSTN CallerIDs with Designated Prefix:</span>
            <TextField 
              size="small" 
              value={prefix} 
              onChange={e => setPrefix(e.target.value)} 
              className="w-36" 
              variant="outlined" 
              sx={{ 
                '& .MuiInputBase-root': { 
                  backgroundColor: 'white !important',
                  '& fieldset': {
                    borderColor: '#d0d7de',
                  },
                  '&:hover fieldset': {
                    borderColor: '#8c959f',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#0969da',
                  },
                }
              }} 
            />
          </div>
          <div className="flex items-center justify-between gap-6 min-w-fit">
            <span className="font-medium text-sm whitespace-nowrap">Starting Date:</span>
            <TextField 
              type="date" 
              size="small" 
              value={startDate} 
              onChange={e => setStartDate(e.target.value)} 
              className="w-40" 
              variant="outlined" 
              sx={{ 
                '& .MuiInputBase-root': { 
                  backgroundColor: 'white !important',
                  '& fieldset': {
                    borderColor: '#d0d7de',
                  },
                  '&:hover fieldset': {
                    borderColor: '#8c959f',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#0969da',
                  },
                }
              }} 
            />
          </div>
          <div className="flex items-center justify-between gap-6 min-w-fit">
            <span className="font-medium text-sm whitespace-nowrap">Usage Cycle (Day):</span>
            <TextField 
              type="number" 
              size="small" 
              value={usageCycle} 
              onChange={e => setUsageCycle(e.target.value)} 
              className="w-28" 
              variant="outlined" 
              sx={{ 
                '& .MuiInputBase-root': { 
                  backgroundColor: 'white !important',
                  '& fieldset': {
                    borderColor: '#d0d7de',
                  },
                  '&:hover fieldset': {
                    borderColor: '#8c959f',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#0969da',
                  },
                }
              }} 
            />
          </div>
          <div className="flex items-center justify-between gap-6 min-w-fit">
            <span className="font-medium text-sm whitespace-nowrap">Destination PCM:</span>
            <FormControl size="small" className="w-32">
              <Select 
                value={destinationPcm} 
                onChange={e => setDestinationPcm(e.target.value)} 
                variant="outlined" 
                style={{ backgroundColor: 'white' }}
                sx={{ 
                  backgroundColor: 'white !important',
                  '& .MuiInputBase-root': { 
                    backgroundColor: 'white !important',
                    '& fieldset': {
                      borderColor: '#d0d7de',
                    },
                    '&:hover fieldset': {
                      borderColor: '#8c959f',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#0969da',
                    },
                  },
                  '& .MuiSelect-select': {
                    backgroundColor: 'white !important',
                  },
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#d0d7de',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#8c959f',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#0969da',
                  }
                }}
              >
                <MenuItem value="PCM">PCM</MenuItem>
                <MenuItem value="Any">PCM Group</MenuItem>
              </Select>
            </FormControl>
          </div>
        </div>
        
        {/* Second row - IP->PSTN Outbound Calls section */}
        <div className="flex flex-wrap items-center gap-15 mb-4">
          <div className="flex items-center justify-between gap-6 min-w-fit">
            <span className="font-medium text-sm whitespace-nowrap">IP-&gt;PSTN Outbound Calls with Designated CallerID:</span>
            <TextField 
              size="small" 
              value={outboundCallerId} 
              onChange={e => setOutboundCallerId(e.target.value)} 
              className="w-36" 
              variant="outlined" 
              sx={{ 
                '& .MuiInputBase-root': { 
                  backgroundColor: 'white !important',
                  '& fieldset': {
                    borderColor: '#d0d7de',
                  },
                  '&:hover fieldset': {
                    borderColor: '#8c959f',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#0969da',
                  },
                }
              }} 
            />
          </div>
          <div className="flex items-center justify-between gap-6 min-w-fit">
            <span className="font-medium text-sm whitespace-nowrap">IP-&gt;PSTN Designation Mode:</span>
            <FormControl size="small" className="w-48">
              <Select 
                value={designationMode} 
                onChange={e => setDesignationMode(e.target.value)} 
                variant="outlined" 
                style={{ backgroundColor: 'white' }}
                sx={{ 
                  backgroundColor: 'white !important',
                  '& .MuiInputBase-root': { 
                    backgroundColor: 'white !important',
                    '& fieldset': {
                      borderColor: '#d0d7de',
                    },
                    '&:hover fieldset': {
                      borderColor: '#8c959f',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#0969da',
                    },
                  },
                  '& .MuiSelect-select': {
                    backgroundColor: 'white !important',
                  },
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#d0d7de',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#8c959f',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#0969da',
                  }
                }}
              >
                <MenuItem value="SIP Side Reject">SIP Side Reject</MenuItem>
                <MenuItem value="Other">Designated CallerID</MenuItem>
              </Select>
            </FormControl>
          </div>
          <div className="flex items-center gap-6">
            <Button
              type="submit"
              className="min-w-[80px] h-9 bg-gradient-to-b from-[#3bb6f5] to-[#0e8fd6] text-white font-semibold rounded-md shadow hover:from-[#0e8fd6] hover:to-[#3bb6f5]"
            >
              <span className="text-white text-sm ">Set</span>
            </Button>
          </div>
        </div>
        
        <div className="text-red-600 font-medium text-sm text-center w-full">
          Note: IP-&gt;PSTN Outbound Calls with Designated CallerID set to 0 means the feature is disabled; Usage Cycle set to 0 means not to clear counts.
        </div>
      </form>
      {/* Dual tables */}
      <div className="flex flex-col gap-6 w-full mx-auto md:flex-row md:gap-3 md:justify-between">
        {renderTable(rowsIpPstn, checkedIpPstn, 'ip_pstn', 'IP->PSTN Manipulated CallerID Pool')}
        {renderTable(rowsPstnIp, checkedPstnIp, 'pstn_ip', 'PSTN->IP Manipulated CallerID Pool')}
      </div>
      {/* Modal */}
      <Dialog 
        open={showModal} 
        onClose={handleModalClose} 
        maxWidth={false} 
        PaperProps={{ 
          sx: { 
            maxWidth: '95vw', 
            width: { xs: '95vw', sm: 380 }, 
            background: '#f4f6fa', 
            borderRadius: 2, 
            border: '1.5px solid #888' 
          } 
        }}
      >
        <DialogTitle className="bg-gray-600 text-white text-center font-semibold text-lg">CallerID</DialogTitle>
        <DialogContent className="bg-gray-200 flex flex-col gap-3 py-4">
          {CALLERID_POOL_MODAL_FIELDS.filter(f => f.key !== 'callerIdRange').map(field => (
            <div key={field.key} className="flex flex-row items-center border border-gray-400 rounded px-2 py-1 gap-2 w-full bg-white mb-1">
              <label className="text-xs text-gray-700 font-medium whitespace-nowrap text-left min-w-[120px] mr-2">
                {field.key === 'destinationPcm' && modalTable === 'pstn_ip' ? 'Source PCM:' : field.label + ':'}
              </label>
              <div className="flex-1 min-w-0">
                {field.type === 'select' ? (
                  <FormControl size="small" className="w-full">
                    <Select
                      value={modalData[field.key]}
                      onChange={e => handleModalChange(field.key, e.target.value)}
                      variant="outlined"
                      style={{ backgroundColor: 'white' }}
                      sx={{ 
                        fontSize: '12px',
                        backgroundColor: 'white !important',
                        '& .MuiInputBase-root': { 
                          backgroundColor: 'white !important',
                          '& fieldset': {
                            borderColor: '#d0d7de',
                          },
                          '&:hover fieldset': {
                            borderColor: '#8c959f',
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#0969da',
                          },
                        },
                        '& .MuiSelect-select': {
                          backgroundColor: 'white !important',
                        },
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#d0d7de',
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#8c959f',
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#0969da',
                        }
                      }}
                    >
                      {field.options.map(opt => (
                        <MenuItem key={opt} value={opt} sx={{ fontSize: '12px' }}>{opt}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                ) : (
                  <TextField
                    size="small"
                    type={field.type}
                    value={modalData[field.key]}
                    onChange={e => handleModalChange(field.key, e.target.value)}
                    className="w-full"
                    variant="outlined"
                    sx={{ 
                      '& .MuiInputBase-input': { fontSize: '12px' }, 
                      '& .MuiInputBase-root': { 
                        backgroundColor: 'white !important',
                        '& fieldset': {
                          borderColor: '#d0d7de',
                        },
                        '&:hover fieldset': {
                          borderColor: '#8c959f',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#0969da',
                        },
                      }
                    }}
                  />
                )}
              </div>
            </div>
          ))}
          <div className="flex flex-row items-center border border-gray-400 rounded px-2 py-1 gap-2 w-full bg-white mb-1">
            <label className="text-xs text-gray-700 font-medium whitespace-nowrap text-left min-w-[120px] mr-2">CallerID:</label>
            <div className="flex gap-2 w-full">
              <TextField
                size="small"
                type="text"
                placeholder="Start"
                value={modalData.callerIdRangeStart}
                onChange={e => handleModalChange('callerIdRangeStart', e.target.value)}
                className="w-1/2"
                variant="outlined"
                sx={{ 
                  '& .MuiInputBase-input': { fontSize: '12px' }, 
                  '& .MuiInputBase-root': { 
                    backgroundColor: 'white !important',
                    '& fieldset': {
                      borderColor: '#d0d7de',
                    },
                    '&:hover fieldset': {
                      borderColor: '#8c959f',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#0969da',
                    },
                  }
                }}
              />
              <span className="self-center font-semibold text-xs">--</span>
              <TextField
                size="small"
                type="text"
                placeholder="End"
                value={modalData.callerIdRangeEnd}
                onChange={e => handleModalChange('callerIdRangeEnd', e.target.value)}
                className="w-1/2"
                variant="outlined"
                sx={{ 
                  '& .MuiInputBase-input': { fontSize: '12px' }, 
                  '& .MuiInputBase-root': { 
                    backgroundColor: 'white !important',
                    '& fieldset': {
                      borderColor: '#d0d7de',
                    },
                    '&:hover fieldset': {
                      borderColor: '#8c959f',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#0969da',
                    },
                  }
                }}
              />
            </div>
          </div>
        </DialogContent>
        <DialogActions className="flex justify-center gap-6 pb-4">
          <button 
            className="bg-gradient-to-b from-[#9ca3af] to-[#6b7280] text-white font-semibold text-xs rounded px-3 py-1 min-w-[100px] shadow hover:from-[#6b7280] hover:to-[#9ca3af]" 
            onClick={handleModalSave}
          >
            Save
          </button>
          <button 
            className="bg-gradient-to-b from-[#d1d5db] to-[#9ca3af] text-[#111827] font-semibold text-xs rounded px-3 py-1 min-w-[100px] shadow hover:from-[#9ca3af] hover:to-[#d1d5db]" 
            onClick={handleModalClose}
          >
            Close
          </button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default CallerIDPool; 