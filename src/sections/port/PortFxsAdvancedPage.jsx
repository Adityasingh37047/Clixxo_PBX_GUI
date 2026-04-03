import React, { useState } from 'react';
import {
  PORT_FXS_ADVANCED_TABLE_COLUMNS,
  PORT_FXS_ADVANCED_ITEMS_PER_PAGE,
  PORT_FXS_ADVANCED_TOTAL_PORTS,
  PORT_FXS_ADVANCED_INITIAL_DATA,
  PORT_FXS_ADVANCED_BATCH_MODIFY_FIELDS,
  PORT_FXS_ADVANCED_BATCH_MODIFY_NOTES,
  PORT_FXS_ADVANCED_PAGE_TITLE,
  PORT_FXS_ADVANCED_BATCH_MODIFY_TITLE,
  WEEK_DAYS,
} from './constants/PortFxsAdvancedPageConstants';
import EditDocumentIcon from '@mui/icons-material/EditDocument';

// Styles
const blueBarStyle = {
  width: '100%',
  height: 32,
  background: 'linear-gradient(to bottom, #b3e0ff 0%, #6ec1f7 50%, #3b8fd6 100%)',
  borderTopLeftRadius: 8,
  borderTopRightRadius: 8,
  marginBottom: 0,
  display: 'flex',
  alignItems: 'center',
  fontWeight: 600,
  fontSize: 16,
  color: '#000',
  justifyContent: 'center',
  boxShadow: '0 2px 8px 0 rgba(80,160,255,0.10)',
  position: 'relative',
};

const batchModifyButtonStyle = {
  position: 'absolute',
  left: 8,
  background: 'linear-gradient(to bottom, #e3e7ef 0%, #bfc6d1 100%)',
  color: '#000',
  fontSize: 12,
  padding: '3px 12px',
  border: '1px solid #999',
  borderRadius: 3,
  boxShadow: '0 1px 2px rgba(0,0,0,0.15)',
  cursor: 'pointer',
  fontWeight: 500,
  height: 24,
};

const thStyle = {
  background: '#fff',
  color: '#222',
  fontWeight: 600,
  fontSize: 12,
  border: '1px solid #bbb',
  padding: '3px 4px',
  whiteSpace: 'nowrap',
  textAlign: 'center',
  height: '24px',
  lineHeight: '18px',
};

const tdStyle = {
  border: '1px solid #bbb',
  padding: '3px 4px',
  fontSize: 12,
  background: '#f8fafd',
  textAlign: 'center',
  whiteSpace: 'nowrap',
  height: '24px',
  lineHeight: '18px',
};

const paginationStyle = {
  width: '100%',
  maxWidth: '100%',
  margin: '4px auto 0',
  background: '#e3e7ef',
  borderRadius: 8,
  border: '1px solid #ccc',
  borderTop: 'none',
  padding: '4px 8px',
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: 6,
  minHeight: 28,
  fontSize: 12,
  justifyContent: 'flex-start',
};

const paginationButtonStyle = {
  background: 'transparent',
  color: '#222',
  fontSize: 12,
  padding: '2px 4px',
  border: 'none',
  borderRadius: 0,
  cursor: 'pointer',
  fontWeight: 400,
  minWidth: 'auto',
  textDecoration: 'none',
};

const paginationLinkStyle = {
  ...paginationButtonStyle,
  color: '#0066cc',
  textDecoration: 'underline',
};

// Initialize port data
const initializePortData = () => {
  return Array.from({ length: PORT_FXS_ADVANCED_TOTAL_PORTS }, (_, i) => ({
    ...PORT_FXS_ADVANCED_INITIAL_DATA,
    port: i + 1,
  }));
};

// Initialize batch modify form
const getInitialBatchForm = () => {
  const form = {
    port: '1',
    type: 'FXS',
    forbidOutgoingCall: false,
    wayOfForbidOutgoingCall: 'All time',
    blacklistOfFxsOutCalls: '',
    prohibitLimitCount: 1,
  };
  
  // Initialize period fields for up to 5 periods
  for (let i = 1; i <= 5; i++) {
    form[`period${i}Start1`] = '00:00:00';
    form[`period${i}End1`] = '00:00:00';
    form[`period${i}Start2`] = '00:00:00';
    form[`period${i}End2`] = '00:00:00';
    form[`period${i}Start3`] = '00:00:00';
    form[`period${i}End3`] = '00:00:00';
    WEEK_DAYS.forEach((day, idx) => {
      form[`period${i}Week${idx}`] = false;
    });
  }
  
  return form;
};

const PortFxsAdvancedPage = () => {
  const [ports, setPorts] = useState(initializePortData());
  const [page, setPage] = useState(1);
  const [showBatchModify, setShowBatchModify] = useState(false);
  const [batchForm, setBatchForm] = useState(getInitialBatchForm());
  const [prohibitLimitCount, setProhibitLimitCount] = useState(1);

  const totalPages = Math.max(1, Math.ceil(ports.length / PORT_FXS_ADVANCED_ITEMS_PER_PAGE));
  const pagedPorts = ports.slice(
    (page - 1) * PORT_FXS_ADVANCED_ITEMS_PER_PAGE,
    page * PORT_FXS_ADVANCED_ITEMS_PER_PAGE
  );

  // Handle page change
  const handlePageChange = (newPage) => {
    setPage(Math.max(1, Math.min(totalPages, newPage)));
  };

  // Handle batch modify button click - show form in same page
  const handleBatchModify = () => {
    setShowBatchModify(true);
    setBatchForm(getInitialBatchForm());
  };

  // Handle form changes
  const handleFormChange = (key, value) => {
    setBatchForm(prev => ({ ...prev, [key]: value }));
  };

  const handleCheckbox = (key) => {
    setBatchForm(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Handle period count changes
  const handlePeriodCountChange = (action) => {
    if (action === 'plus' && prohibitLimitCount < 5) {
      setProhibitLimitCount(prev => prev + 1);
    } else if (action === 'minus' && prohibitLimitCount > 1) {
      setProhibitLimitCount(prev => prev - 1);
    }
  };

  // Check if field should be shown
  const shouldShowField = (field) => {
    if (!field.conditional) return true;
    return !!batchForm[field.conditional];
  };

  // Handle form submission
  const handleSave = (e) => {
    e.preventDefault();
    
    // Validation
    if (batchForm.forbidOutgoingCall && batchForm.wayOfForbidOutgoingCall === 'Select time') {
      // Validate time periods
      for (let i = 1; i <= prohibitLimitCount; i++) {
        const start1 = batchForm[`period${i}Start1`];
        const end1 = batchForm[`period${i}End1`];
        if (!start1 || !end1) {
          alert(`Please input the start and end time for period ${i}!`);
          return;
        }
        // Time format validation (hh:mm:ss)
        const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/;
        if (!timeRegex.test(start1) || !timeRegex.test(end1)) {
          alert(`Please input the time in the right format (hh:mm:ss) for period ${i}!`);
          return;
        }
      }
    }

    // Save logic here (API call)
    alert('Batch modify settings saved successfully!');
    setShowBatchModify(false);
  };

  const handleCancel = () => {
    setShowBatchModify(false);
    setBatchForm(getInitialBatchForm());
    setProhibitLimitCount(1);
  };

  const handleReset = () => {
    setBatchForm(getInitialBatchForm());
    setProhibitLimitCount(1);
  };

  // Render time period rows
  const renderTimePeriods = () => {
    if (!batchForm.forbidOutgoingCall || batchForm.wayOfForbidOutgoingCall !== 'Select time') {
      return null;
    }

    const periods = [];
    // Show periods 1 through prohibitLimitCount
    for (let i = 1; i <= prohibitLimitCount; i++) {
      periods.push(
        <React.Fragment key={i}>
          <tr>
            <td style={{ height: '22px' }}>&nbsp;</td>
            <td>&nbsp;</td>
            <td colSpan="1" style={{ fontSize: '12px' }}>Period(hh:mm:ss)：</td>
            <td>
              <input
                type="text"
                value={batchForm[`period${i}Start1`] || '00:00:00'}
                onChange={e => handleFormChange(`period${i}Start1`, e.target.value)}
                className="border border-gray-400 rounded-sm px-1 bg-white"
                style={{ height: '22px', width: '80px', fontSize: '12px' }}
                maxLength={8}
                placeholder="00:00:00"
              />
              <span style={{ margin: '0 4px' }}>-</span>
              <input
                type="text"
                value={batchForm[`period${i}End1`] || '00:00:00'}
                onChange={e => handleFormChange(`period${i}End1`, e.target.value)}
                className="border border-gray-400 rounded-sm px-1 bg-white"
                style={{ height: '22px', width: '80px', fontSize: '12px' }}
                maxLength={8}
                placeholder="00:00:00"
              />
            </td>
          </tr>
          <tr>
            <td style={{ height: '22px' }}>&nbsp;</td>
            <td>&nbsp;</td>
            <td colSpan="1" style={{ fontSize: '12px' }}>Period(hh:mm:ss)：</td>
            <td>
              <input
                type="text"
                value={batchForm[`period${i}Start2`] || '00:00:00'}
                onChange={e => handleFormChange(`period${i}Start2`, e.target.value)}
                className="border border-gray-400 rounded-sm px-1 bg-white"
                style={{ height: '22px', width: '80px', fontSize: '12px' }}
                maxLength={8}
                placeholder="00:00:00"
              />
              <span style={{ margin: '0 4px' }}>-</span>
              <input
                type="text"
                value={batchForm[`period${i}End2`] || '00:00:00'}
                onChange={e => handleFormChange(`period${i}End2`, e.target.value)}
                className="border border-gray-400 rounded-sm px-1 bg-white"
                style={{ height: '22px', width: '80px', fontSize: '12px' }}
                maxLength={8}
                placeholder="00:00:00"
              />
            </td>
          </tr>
          <tr>
            <td style={{ height: '22px' }}>&nbsp;</td>
            <td>&nbsp;</td>
            <td colSpan="1" style={{ fontSize: '12px' }}>Period(hh:mm:ss)：</td>
            <td>
              <input
                type="text"
                value={batchForm[`period${i}Start3`] || '00:00:00'}
                onChange={e => handleFormChange(`period${i}Start3`, e.target.value)}
                className="border border-gray-400 rounded-sm px-1 bg-white"
                style={{ height: '22px', width: '80px', fontSize: '12px' }}
                maxLength={8}
                placeholder="00:00:00"
              />
              <span style={{ margin: '0 4px' }}>-</span>
              <input
                type="text"
                value={batchForm[`period${i}End3`] || '00:00:00'}
                onChange={e => handleFormChange(`period${i}End3`, e.target.value)}
                className="border border-gray-400 rounded-sm px-1 bg-white"
                style={{ height: '22px', width: '80px', fontSize: '12px' }}
                maxLength={8}
                placeholder="00:00:00"
              />
            </td>
          </tr>
          <tr>
            <td>&nbsp;</td>
            <td>&nbsp;</td>
            <td colSpan="1" style={{ fontSize: '12px' }}>Week：</td>
            <td>
              <table style={{ width: '400px' }}>
                <colgroup>
                  {WEEK_DAYS.map(() => <col key={Math.random()} style={{ width: '10%' }} />)}
                </colgroup>
                <tr>
                  {WEEK_DAYS.map((day, idx) => (
                    <td key={day}>
                      <input
                        type="checkbox"
                        checked={!!batchForm[`period${i}Week${idx}`]}
                        onChange={() => handleFormChange(`period${i}Week${idx}`, !batchForm[`period${i}Week${idx}`])}
                        style={{ marginRight: '4px' }}
                      />
                      {day}
                    </td>
                  ))}
                </tr>
              </table>
            </td>
          </tr>
        </React.Fragment>
      );
    }
    return periods;
  };

  return (
    <div className="bg-gray-50 min-h-[calc(100vh-80px)] flex flex-col items-center box-border" style={{ backgroundColor: '#dde0e4', padding: '8px' }}>
      <div className="w-full max-w-full mx-auto">
        {!showBatchModify ? (
          <>
            {/* Blue bar + table view */}
            <div style={blueBarStyle}>
              <button
                style={batchModifyButtonStyle}
                onClick={handleBatchModify}
              >
                Batch Modify
              </button>
              <span>{PORT_FXS_ADVANCED_PAGE_TITLE}</span>
            </div>

            <div className="w-full bg-white border-2 border-gray-400 border-t-0 rounded-b-lg" style={{ overflowX: 'auto', overflowY: 'visible' }}>
              <table className="w-full" style={{ backgroundColor: '#f8fafd', tableLayout: 'auto', borderCollapse: 'collapse', width: '100%', minWidth: '600px' }}>
                <thead>
                  <tr>
                    {PORT_FXS_ADVANCED_TABLE_COLUMNS.map((col) => (
                      <th key={col.key} style={thStyle}>
                        {col.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {pagedPorts.map((port, idx) => (
                    <tr key={port.port}>
                      <td style={tdStyle}>
                        <button
                          onClick={() => {
                            const portNumber = String(port.port);
                            setBatchForm(prev => ({
                              ...prev,
                              port: portNumber,
                              type: 'FXS',
                            }));
                            setShowBatchModify(true);
                          }}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                        >
                          <EditDocumentIcon style={{ fontSize: 16, color: '#0e8fd6' }} />
                        </button>
                      </td>
                      <td style={tdStyle}>{port.port}</td>
                      <td style={tdStyle}>{port.type}</td>
                      <td style={tdStyle}>{port.forbidOutgoingCall}</td>
                      <td style={tdStyle}>{port.blacklistOfOutCalls}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={paginationStyle}>
              <span>{ports.length} Items Total&nbsp;&nbsp; {PORT_FXS_ADVANCED_ITEMS_PER_PAGE} Items/Page</span>
              <span>&nbsp;&nbsp; {page}/{totalPages}&nbsp;&nbsp;</span>
              {page > 1 ? (
                <button
                  style={paginationLinkStyle}
                  onClick={() => handlePageChange(1)}
                >
                  First
                </button>
              ) : (
                <span>First</span>
              )}
              <span>&nbsp;&nbsp;</span>
              {page > 1 ? (
                <button
                  style={paginationLinkStyle}
                  onClick={() => handlePageChange(page - 1)}
                >
                  Previous
                </button>
              ) : (
                <span>Previous</span>
              )}
              <span>&nbsp;&nbsp;</span>
              {page < totalPages ? (
                <button
                  style={paginationLinkStyle}
                  onClick={() => handlePageChange(page + 1)}
                >
                  Next
                </button>
              ) : (
                <span>Next</span>
              )}
              <span>&nbsp;&nbsp;</span>
              {page < totalPages ? (
                <button
                  style={paginationLinkStyle}
                  onClick={() => handlePageChange(totalPages)}
                >
                  Last
                </button>
              ) : (
                <span>Last</span>
              )}
              <span>&nbsp;&nbsp; Go to Page </span>
              <select
                style={{
                  fontSize: 12,
                  padding: '1px 4px',
                  borderRadius: 2,
                  border: '1px solid #bbb',
                  background: '#fff',
                }}
                value={page}
                onChange={(e) => handlePageChange(Number(e.target.value))}
              >
                {Array.from({ length: totalPages }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {i + 1}
                  </option>
                ))}
              </select>
              <span>&nbsp;&nbsp; {totalPages} Pages Total</span>
            </div>
          </>
        ) : (
          <div className="flex justify-center">
            <div style={{ width: '62%', maxWidth: '800px', minWidth: '500px' }}>
              <div
                style={{
                  ...blueBarStyle,
                  width: '100%',
                  borderTopLeftRadius: 8,
                  borderTopRightRadius: 8,
                  borderBottomLeftRadius: 0,
                  borderBottomRightRadius: 0,
                }}
              >
                <span>{PORT_FXS_ADVANCED_BATCH_MODIFY_TITLE}</span>
              </div>

              {/* Form Content - grey like outer, only inputs/controls are white */}
              <div style={{ border: '1px solid #444444', borderTop: 'none', backgroundColor: '#dde0e4', padding: '8px 0' }}>
                <form onSubmit={handleSave} style={{ width: '100%' }}>
                  <table cellPadding="0" cellSpacing="0" width="100%" style={{ margin: '0 auto' }}>
                    <tr>
                      <td width="5%">&nbsp;</td>
                      <td width="95%">
                        <table width="100%" cellSpacing="0" cellPadding="0">
                            <colgroup>
                              <col style={{ width: '10%' }} />
                              <col style={{ width: '3%' }} />
                              <col style={{ width: '37%' }} />
                              <col style={{ width: '50%' }} />
                            </colgroup>
                            <tbody>
                      {/* Port */}
                      <tr>
                        <td style={{ height: '22px' }}>&nbsp;</td>
                        <td colSpan="2" style={{ fontSize: '12px' }}>Port</td>
                        <td>
                          <select
                            value={batchForm.port}
                            onChange={e => handleFormChange('port', e.target.value)}
                            className="border border-gray-400 rounded-sm px-1 bg-white"
                            style={{ height: '22px', width: '228px', fontSize: '12px' }}
                          >
                            {Array.from({ length: PORT_FXS_ADVANCED_TOTAL_PORTS }, (_, i) => (
                              <option key={i + 1} value={String(i + 1)}>
                                {i + 1}
                              </option>
                            ))}
                          </select>
                        </td>
                      </tr>

                      {/* Type */}
                      <tr>
                        <td style={{ height: '22px' }}>&nbsp;</td>
                        <td colSpan="2" style={{ fontSize: '12px' }}>Type</td>
                        <td>
                          <input
                            type="text"
                            value={batchForm.type || 'FXS'}
                            onChange={e => handleFormChange('type', e.target.value)}
                            className="border border-gray-400 rounded-sm px-1 bg-white"
                            style={{ height: '22px', width: '228px', fontSize: '12px' }}
                          />
                        </td>
                      </tr>

                      {/* Spacer */}
                      <tr>
                        <td>&nbsp;</td>
                        <td>&nbsp;</td>
                        <td>&nbsp;</td>
                        <td>&nbsp;</td>
                      </tr>
                      <tr>
                        <td>&nbsp;</td>
                        <td>&nbsp;</td>
                        <td>&nbsp;</td>
                        <td>&nbsp;</td>
                      </tr>

                      {/* Forbid Outgoing Call */}
                      <tr>
                        <td style={{ height: '22px' }}>&nbsp;</td>
                        <td colSpan="2" style={{ fontSize: '12px' }}>Forbid Outgoing Call</td>
                        <td style={{ fontSize: '12px' }}>
                          <input
                            type="checkbox"
                            checked={!!batchForm.forbidOutgoingCall}
                            onChange={() => handleCheckbox('forbidOutgoingCall')}
                            style={{ marginRight: '4px' }}
                          />
                          Enable
                        </td>
                      </tr>

                      {/* Way Of Forbid Outgoing Call */}
                      {shouldShowField({ conditional: 'forbidOutgoingCall' }) && (
                        <tr>
                          <td style={{ height: '22px' }}>&nbsp;</td>
                          <td>&nbsp;</td>
                          <td colSpan="1" style={{ fontSize: '12px' }}>Way Of Forbid Outgoing Call</td>
                          <td>
                            <select
                              value={batchForm.wayOfForbidOutgoingCall}
                              onChange={e => handleFormChange('wayOfForbidOutgoingCall', e.target.value)}
                              className="border border-gray-400 rounded-sm px-1 bg-white"
                              style={{ height: '22px', width: '228px', fontSize: '12px' }}
                            >
                              <option value="All time">All time</option>
                              <option value="Select time">Select time</option>
                            </select>
                          </td>
                        </tr>
                      )}

                      {/* Time Periods */}
                      {batchForm.forbidOutgoingCall && batchForm.wayOfForbidOutgoingCall === 'Select time' && renderTimePeriods()}

                      {/* Period Count Controls */}
                      {batchForm.forbidOutgoingCall && batchForm.wayOfForbidOutgoingCall === 'Select time' && (
                        <tr>
                          <td>&nbsp;</td>
                          <td>&nbsp;</td>
                          <td width="30%">
                            <input type="hidden" id="IdProhibitLimit_cnt" value={prohibitLimitCount} />
                          </td>
                          <td width="50%">
                            {prohibitLimitCount < 5 && (
                              <button
                                type="button"
                                onClick={() => handlePeriodCountChange('plus')}
                                style={{
                                  background: 'linear-gradient(to bottom, #e3e7ef 0%, #bfc6d1 100%)',
                                  color: '#000',
                                  fontSize: '14px',
                                  padding: '2px 8px',
                                  border: '1px solid #999',
                                  borderRadius: 3,
                                  cursor: 'pointer',
                                  marginRight: '4px',
                                }}
                              >
                                +
                              </button>
                            )}
                            {prohibitLimitCount > 1 && (
                              <button
                                type="button"
                                onClick={() => handlePeriodCountChange('minus')}
                                style={{
                                  background: 'linear-gradient(to bottom, #e3e7ef 0%, #bfc6d1 100%)',
                                  color: '#000',
                                  fontSize: '14px',
                                  padding: '2px 8px',
                                  border: '1px solid #999',
                                  borderRadius: 3,
                                  cursor: 'pointer',
                                }}
                              >
                                -
                              </button>
                            )}
                          </td>
                        </tr>
                      )}

                      {/* Spacer */}
                      <tr>
                        <td>&nbsp;</td>
                        <td>&nbsp;</td>
                        <td>&nbsp;</td>
                        <td>&nbsp;</td>
                      </tr>

                      {/* Blacklist of FXS Out Calls */}
                      <tr>
                        <td style={{ height: '22px' }}>&nbsp;</td>
                        <td colSpan="2" style={{ fontSize: '12px' }}>Blacklist of FXS Out Calls</td>
                        <td>
                          <textarea
                            value={batchForm.blacklistOfFxsOutCalls}
                            onChange={e => handleFormChange('blacklistOfFxsOutCalls', e.target.value)}
                            className="border border-gray-400 rounded-sm px-1 bg-white"
                            style={{ width: '300px', height: '50px', fontSize: '12px', resize: 'none' }}
                            maxLength={1000}
                          />
                        </td>
                      </tr>

                      {/* Spacer */}
                      <tr>
                        <td>&nbsp;</td>
                        <td>&nbsp;</td>
                        <td>&nbsp;</td>
                        <td>&nbsp;</td>
                      </tr>
                            </tbody>
                          </table>
                        </td>
                        <td width="5%">&nbsp;</td>
                      </tr>
                    </table>

                    {/* Notes */}
                    <table width="100%" cellSpacing="0" cellPadding="0" style={{ marginTop: '8px' }}>
                      <tr>
                        <td width="20%"></td>
                        <td width="50%"></td>
                        <td width="5%"></td>
                      </tr>
                      {PORT_FXS_ADVANCED_BATCH_MODIFY_NOTES.map((note, idx) => (
                        <tr key={idx}>
                          <td>&nbsp;</td>
                          <td style={{ fontSize: '12px', color: 'red' }}>{note}</td>
                          <td>&nbsp;</td>
                        </tr>
                      ))}
                    </table>
                  </form>
                </div>

                {/* Buttons outside border */}
                <div style={{ textAlign: 'center', padding: '16px 0 0 0' }}>
                  <input
                    type="button"
                    value="Modify"
                    onClick={handleSave}
                    style={{
                      background: 'linear-gradient(to bottom, #3bb6f5 0%, #0e8fd6 100%)',
                      color: '#fff',
                      fontWeight: 600,
                      fontSize: '14px',
                      borderRadius: '4px',
                      minWidth: '90px',
                      height: '32px',
                      padding: '4px 24px',
                      boxShadow: '0 2px 4px #b3e0ff',
                      border: '1px solid #0e8fd6',
                      cursor: 'pointer',
                      marginRight: '40px',
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = 'linear-gradient(to bottom, #0e8fd6 0%, #3bb6f5 100%)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = 'linear-gradient(to bottom, #3bb6f5 0%, #0e8fd6 100%)';
                    }}
                  />
                  <input
                    type="button"
                    value="Reset"
                    onClick={handleReset}
                    style={{
                      background: 'linear-gradient(to bottom, #3bb6f5 0%, #0e8fd6 100%)',
                      color: '#fff',
                      fontWeight: 600,
                      fontSize: '14px',
                      borderRadius: '4px',
                      minWidth: '90px',
                      height: '32px',
                      padding: '4px 24px',
                      boxShadow: '0 2px 4px #b3e0ff',
                      border: '1px solid #0e8fd6',
                      cursor: 'pointer',
                      marginRight: '40px',
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = 'linear-gradient(to bottom, #0e8fd6 0%, #3bb6f5 100%)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = 'linear-gradient(to bottom, #3bb6f5 0%, #0e8fd6 100%)';
                    }}
                  />
                  <input
                    type="button"
                    value="Cancel"
                    onClick={handleCancel}
                    style={{
                      background: 'linear-gradient(to bottom, #3bb6f5 0%, #0e8fd6 100%)',
                      color: '#fff',
                      fontWeight: 600,
                      fontSize: '14px',
                      borderRadius: '4px',
                      minWidth: '90px',
                      height: '32px',
                      padding: '4px 24px',
                      boxShadow: '0 2px 4px #b3e0ff',
                      border: '1px solid #0e8fd6',
                      cursor: 'pointer',
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = 'linear-gradient(to bottom, #0e8fd6 0%, #3bb6f5 100%)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = 'linear-gradient(to bottom, #3bb6f5 0%, #0e8fd6 100%)';
                    }}
                  />
                </div>
              </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default PortFxsAdvancedPage;

