import React, { useState } from 'react';
import { CDR_QUERY_INITIAL_FORM, PORT_OPTIONS, CALL_DIRECTION_OPTIONS } from './constants/CdrQueryConstants';
import { TextField, Button, Select as MuiSelect, MenuItem, FormControl } from '@mui/material';

const CdrQueryPage = () => {
  const [formData, setFormData] = useState(CDR_QUERY_INITIAL_FORM);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Date input validation: allows numbers, dash (-), colon (:), space
  const handleDateKeyPress = (e) => {
    const key = e.keyCode || e.which;
    if ((key > 47 && key < 59) || key === 45 || key === 32) {
      // Allow numbers (48-58), dash (45), space (32)
    } else if (key !== 8) {
      // Allow backspace (8)
      e.preventDefault();
    }
  };

  // String input validation: allows numbers, letters, space, dot, underscore
  const handleStringKeyPress = (e) => {
    const key = e.keyCode || e.which;
    if (
      key === 32 || // space
      key === 46 || // dot
      key === 95 || // underscore
      key === 8 || // backspace
      (key >= 48 && key <= 57) || // numbers
      (key >= 65 && key <= 90) || // uppercase letters
      (key >= 97 && key <= 122) // lowercase letters
    ) {
      // Allow
    } else {
      e.preventDefault();
    }
  };

  // Number input validation: allows only numbers
  const handleNumberKeyPress = (e) => {
    const key = e.keyCode || e.which;
    if (key > 47 && key < 58) {
      // Allow numbers
    } else if (key !== 8) {
      // Allow backspace (8)
      e.preventDefault();
    }
  };

  const handleQuery = () => {
    // Validate: ending date should not be earlier than starting date
    if (formData.startdate && formData.enddate && formData.startdate > formData.enddate) {
      alert('The Ending Date should not be earlier than the Starting Date!');
      return;
    }

    // Validate: max talk duration should not be smaller than min talk duration
    const minTalkTime = Number(formData.mintalktime);
    const maxTalkTime = Number(formData.maxtalktime);
    if (formData.mintalktime && formData.maxtalktime && minTalkTime > maxTalkTime) {
      alert('The max talk duration should not be smaller than the min talk duration!');
      return;
    }

    // Here you would typically submit the query
    alert('Query submitted successfully!');
  };

  return (
    <div className="bg-gray-50 min-h-[calc(100vh-128px)] py-2 px-2 sm:px-4" style={{backgroundColor: "#dde0e4"}}>
      <div style={{ width: '950px', maxWidth: '95%', margin: '0 auto' }}>
        {/* Blue header bar */}
        <div className="w-full h-8 bg-gradient-to-b from-[#b3e0ff] via-[#6ec1f7] to-[#3b8fd6] flex items-center justify-center font-semibold text-lg text-gray-600 shadow mb-0">
          CDR Inquire
        </div>

        <div className="bg-white border-2 border-gray-400 border-t-0 shadow-sm p-4">
          <table className="w-full" style={{ tableLayout: 'auto' }}>
            <colgroup>
              <col style={{ width: '15%' }} />
              <col style={{ width: '45%' }} />
              <col style={{ width: '40%' }} />
            </colgroup>
            <tbody>
              {/* Starting Date */}
              <tr style={{ height: '22px' }}>
                <td></td>
                <td style={{ fontSize: '14px', color: '#333' }}>Starting Date</td>
                <td>
                  <TextField
                    id="startdate"
                    type="date"
                    value={formData.startdate || ''}
                    onChange={(e) => handleInputChange('startdate', e.target.value)}
                    size="small"
                    variant="outlined"
                    InputLabelProps={{
                      shrink: true,
                    }}
                    inputProps={{ style: { fontSize: 14, padding: '4px 8px' } }}
                    sx={{
                      width: '132px',
                      '& .MuiOutlinedInput-root': {
                        height: '28px',
                        backgroundColor: 'white',
                        '& fieldset': { borderColor: '#bbb' },
                        '&:hover fieldset': { borderColor: '#999' },
                        '&.Mui-focused fieldset': { borderColor: '#3b82f6' },
                      },
                    }}
                  />
                </td>
              </tr>
              <tr><td style={{ height: '8px' }}></td></tr>

              {/* Ending Date */}
              <tr style={{ height: '22px' }}>
                <td></td>
                <td style={{ fontSize: '14px', color: '#333' }}>Ending Date</td>
                <td>
                  <TextField
                    id="enddate"
                    type="date"
                    value={formData.enddate || ''}
                    onChange={(e) => handleInputChange('enddate', e.target.value)}
                    size="small"
                    variant="outlined"
                    InputLabelProps={{
                      shrink: true,
                    }}
                    inputProps={{ style: { fontSize: 14, padding: '4px 8px' } }}
                    sx={{
                      width: '132px',
                      '& .MuiOutlinedInput-root': {
                        height: '28px',
                        backgroundColor: 'white',
                        '& fieldset': { borderColor: '#bbb' },
                        '&:hover fieldset': { borderColor: '#999' },
                        '&.Mui-focused fieldset': { borderColor: '#3b82f6' },
                      },
                    }}
                  />
                </td>
              </tr>
              <tr><td style={{ height: '8px' }}></td></tr>

              {/* Port */}
              <tr style={{ height: '22px' }}>
                <td></td>
                <td style={{ fontSize: '14px', color: '#333' }}>Port</td>
                <td>
                  <FormControl size="small" sx={{ width: '132px' }}>
                    <MuiSelect
                      value={formData.port}
                      onChange={(e) => handleInputChange('port', e.target.value)}
                      variant="outlined"
                      sx={{
                        fontSize: 14,
                        height: 28,
                        backgroundColor: 'white',
                        '& .MuiOutlinedInput-notchedOutline': { borderColor: '#bbb' },
                        '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#999' },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#3b82f6' },
                        '& .MuiSelect-select': { padding: '4px 8px' }
                      }}
                    >
                      {PORT_OPTIONS.map(opt => (
                        <MenuItem key={opt.value} value={opt.value} sx={{ fontSize: 14 }}>
                          {opt.label}
                        </MenuItem>
                      ))}
                    </MuiSelect>
                  </FormControl>
                </td>
              </tr>
              <tr><td style={{ height: '8px' }}></td></tr>

              {/* Call Direction */}
              <tr style={{ height: '22px' }}>
                <td></td>
                <td style={{ fontSize: '14px', color: '#333' }}>Call Direction</td>
                <td>
                  <FormControl size="small" sx={{ width: '132px' }}>
                    <MuiSelect
                      value={formData.billtype}
                      onChange={(e) => handleInputChange('billtype', e.target.value)}
                      variant="outlined"
                      sx={{
                        fontSize: 14,
                        height: 28,
                        backgroundColor: 'white',
                        '& .MuiOutlinedInput-notchedOutline': { borderColor: '#bbb' },
                        '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#999' },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#3b82f6' },
                        '& .MuiSelect-select': { padding: '4px 8px' }
                      }}
                    >
                      {CALL_DIRECTION_OPTIONS.map(opt => (
                        <MenuItem key={opt.value} value={opt.value} sx={{ fontSize: 14 }}>
                          {opt.label}
                        </MenuItem>
                      ))}
                    </MuiSelect>
                  </FormControl>
                </td>
              </tr>
              <tr><td style={{ height: '8px' }}></td></tr>

              {/* CallerID */}
              <tr style={{ height: '22px' }}>
                <td></td>
                <td style={{ fontSize: '14px', color: '#333' }}>CallerID</td>
                <td>
                  <TextField
                    id="callingnum"
                    value={formData.callingnum || ''}
                    onChange={(e) => handleInputChange('callingnum', e.target.value)}
                    onKeyPress={handleStringKeyPress}
                    size="small"
                    variant="outlined"
                    inputProps={{ style: { fontSize: 14, padding: '4px 8px' } }}
                    sx={{
                      width: '132px',
                      '& .MuiOutlinedInput-root': {
                        height: '28px',
                        backgroundColor: 'white',
                        '& fieldset': { borderColor: '#bbb' },
                        '&:hover fieldset': { borderColor: '#999' },
                        '&.Mui-focused fieldset': { borderColor: '#3b82f6' },
                      },
                    }}
                  />
                </td>
              </tr>
              <tr><td style={{ height: '8px' }}></td></tr>

              {/* CalleeID */}
              <tr style={{ height: '22px' }}>
                <td></td>
                <td style={{ fontSize: '14px', color: '#333' }}>CalleeID</td>
                <td>
                  <TextField
                    id="callednum"
                    value={formData.callednum || ''}
                    onChange={(e) => handleInputChange('callednum', e.target.value)}
                    onKeyPress={handleStringKeyPress}
                    size="small"
                    variant="outlined"
                    inputProps={{ style: { fontSize: 14, padding: '4px 8px' } }}
                    sx={{
                      width: '132px',
                      '& .MuiOutlinedInput-root': {
                        height: '28px',
                        backgroundColor: 'white',
                        '& fieldset': { borderColor: '#bbb' },
                        '&:hover fieldset': { borderColor: '#999' },
                        '&.Mui-focused fieldset': { borderColor: '#3b82f6' },
                      },
                    }}
                  />
                </td>
              </tr>
              <tr><td style={{ height: '8px' }}></td></tr>

              {/* Call Duration(s) */}
              <tr style={{ height: '22px' }}>
                <td></td>
                <td style={{ fontSize: '14px', color: '#333' }}>Call Duration(s)</td>
                <td style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <TextField
                    id="mintalktime"
                    value={formData.mintalktime || ''}
                    onChange={(e) => handleInputChange('mintalktime', e.target.value)}
                    onKeyPress={handleNumberKeyPress}
                    size="small"
                    variant="outlined"
                    inputProps={{ style: { fontSize: 14, padding: '4px 8px' } }}
                    sx={{
                      width: '55px',
                      '& .MuiOutlinedInput-root': {
                        height: '28px',
                        backgroundColor: 'white',
                        '& fieldset': { borderColor: '#bbb' },
                        '&:hover fieldset': { borderColor: '#999' },
                        '&.Mui-focused fieldset': { borderColor: '#3b82f6' },
                      },
                    }}
                  />
                  <span style={{ fontSize: '14px', color: '#333' }}>---</span>
                  <TextField
                    id="maxtalktime"
                    value={formData.maxtalktime || ''}
                    onChange={(e) => handleInputChange('maxtalktime', e.target.value)}
                    onKeyPress={handleNumberKeyPress}
                    size="small"
                    variant="outlined"
                    inputProps={{ style: { fontSize: 14, padding: '4px 8px' } }}
                    sx={{
                      width: '55px',
                      '& .MuiOutlinedInput-root': {
                        height: '28px',
                        backgroundColor: 'white',
                        '& fieldset': { borderColor: '#bbb' },
                        '&:hover fieldset': { borderColor: '#999' },
                        '&.Mui-focused fieldset': { borderColor: '#3b82f6' },
                      },
                    }}
                  />
                </td>
              </tr>
              <tr><td style={{ height: '8px' }}></td></tr>

              {/* Keyword */}
              <tr style={{ height: '22px' }}>
                <td></td>
                <td style={{ fontSize: '14px', color: '#333' }}>Keyword</td>
                <td>
                  <TextField
                    id="keyword"
                    value={formData.keyword || ''}
                    onChange={(e) => handleInputChange('keyword', e.target.value)}
                    onKeyPress={handleStringKeyPress}
                    size="small"
                    variant="outlined"
                    inputProps={{ style: { fontSize: 14, padding: '4px 8px' } }}
                    sx={{
                      width: '132px',
                      '& .MuiOutlinedInput-root': {
                        height: '28px',
                        backgroundColor: 'white',
                        '& fieldset': { borderColor: '#bbb' },
                        '&:hover fieldset': { borderColor: '#999' },
                        '&.Mui-focused fieldset': { borderColor: '#3b82f6' },
                      },
                    }}
                  />
                </td>
              </tr>
              <tr><td style={{ height: '8px' }}></td></tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Query Button */}
      <div className="flex justify-center" style={{ marginTop: '24px', marginBottom: '16px' }}>
        <Button
          variant="contained"
          sx={{
            background: 'linear-gradient(to bottom, #3bb6f5 0%, #0e8fd6 100%)',
            color: '#fff',
            fontWeight: 600,
            fontSize: '14px',
            borderRadius: 1.5,
            minWidth: 100,
            px: 3,
            py: 1,
            boxShadow: '0 2px 8px #b3e0ff',
            textTransform: 'none',
            '&:hover': {
              background: 'linear-gradient(to bottom, #0e8fd6 0%, #3bb6f5 100%)',
              color: '#fff',
            },
          }}
          onClick={handleQuery}
        >
          Query
        </Button>
      </div>
    </div>
  );
};

export default CdrQueryPage;

