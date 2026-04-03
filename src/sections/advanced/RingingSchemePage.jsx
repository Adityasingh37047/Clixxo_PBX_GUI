import React, { useState } from 'react';
import { RINGING_SCHEME_INITIAL_FORM } from './constants/RingingSchemeConstants';
import { TextField, Button } from '@mui/material';

const RingingSchemePage = () => {
  const [formData, setFormData] = useState(RINGING_SCHEME_INITIAL_FORM);
  const [changeTime, setChangeTime] = useState(0);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSchemeChange = (value) => {
    const newData = { ...formData, ringScheme: value };
    
    // Swap values between CallerID/Alert-Info fields if switching schemes
    if (changeTime > 0) {
      for (let i = 1; i <= 4; i++) {
        const tempMode = newData[`ringMode${i}`];
        newData[`ringMode${i}`] = newData[`ringMode${i}bak`];
        newData[`ringMode${i}bak`] = tempMode;
      }
    } else {
      // Initial load: clear opposite fields if mode is empty
      for (let i = 1; i <= 4; i++) {
        if (value === '0') {
          if (newData[`ringMode${i}`] === '') {
            newData[`ringAlertInfo${i}`] = '';
          } else if (newData[`ringAlertInfo${i}`] === '') {
            newData[`ringMode${i}bak`] = '';
          }
        } else {
          if (newData[`ringMode${i}`] === '') {
            newData[`ringCallerId${i}`] = '';
          } else if (newData[`ringCallerId${i}`] === '') {
            newData[`ringMode${i}bak`] = '';
          }
        }
      }
    }
    
    setFormData(newData);
    setChangeTime(prev => prev + 1);
  };

  const handleKeyPress = (e) => {
    const key = e.keyCode || e.which;
    // Allow: numbers (48-57), comma (44), backspace (8)
    if (!((key >= 48 && key <= 57) || key === 44 || key === 8)) {
      e.preventDefault();
    }
  };

  const handleKeyPress1 = (e) => {
    const key = e.keyCode || e.which;
    // Block: space (32), ! (33), " (34), & (38), ' (39), ( (40), ) (41), ; (59), = (61), \ (92), | (124), ~ (126)
    // Allow all others except these specific keys
    if (key === 32 || key === 33 || key === 34 || key === 38 || key === 39 || key === 40 || key === 41 || key === 59 || key === 61 || key === 92 || key === 124 || key === 126) {
      if (key !== 8) {
        e.preventDefault();
      }
    }
  };

  const handleSave = () => {
    const minKeepTime = 50;
    const minSendCidLowTime = 1700;
    const CIDstyle = 1;
    const FskPos = 1;

    for (let i = 1; i <= 4; i++) {
      const ringCallerIdObj = formData[`ringCallerId${i}`];
      const ringModeObj = formData[`ringMode${i}`];
      const ringAlertInfoObj = formData[`ringAlertInfo${i}`];
      const ringNumInfo = String(i);

      if (formData.ringScheme === '0') {
        const reg = /^[0-9A-Za-z.*\[\]\-,]{1,128}$/;
        if (ringCallerIdObj !== '') {
          if (!reg.test(ringCallerIdObj)) {
            alert("The CallerID can consist only of 0~9, A~Z, a~z, '.' '[' ']' '-' ',' and '*'!");
            document.getElementById(`ringCallerId${i}`)?.focus();
            return;
          }

          if (ringModeObj === '') {
            alert(`Please input a ringing mode for Scheme ${ringNumInfo}!`);
            document.getElementById(`ringMode${i}`)?.focus();
            return;
          } else {
            const strArr = ringModeObj.split(',');
            if (strArr[0] === '1') {
              if (strArr.length !== 3) {
                alert(`Please input a ringing mode in the right format for Scheme ${ringNumInfo}!`);
                document.getElementById(`ringMode${i}`)?.focus();
                return;
              }
              if (parseInt(strArr[1]) < minKeepTime || parseInt(strArr[2]) < minKeepTime || (CIDstyle === 1 && FskPos === 1 && parseInt(strArr[2]) < minSendCidLowTime)) {
                if (parseInt(strArr[1]) < minKeepTime) {
                  alert(`The duration at ON/OFF state for ringing scheme ${ringNumInfo} cannot be less than 50ms!`);
                } else {
                  alert(`The duration at OFF state for the last ringing scheme ${ringNumInfo} cannot be less than 1700ms!`);
                }
                document.getElementById(`ringMode${i}`)?.focus();
                return;
              }
            } else if (strArr[0] === '2') {
              if (strArr.length !== 5) {
                alert(`Please input a ringing mode in the right format for Scheme ${ringNumInfo}!`);
                document.getElementById(`ringMode${i}`)?.focus();
                return;
              }
              if (parseInt(strArr[1]) < minKeepTime || parseInt(strArr[2]) < minKeepTime || parseInt(strArr[3]) < minKeepTime || parseInt(strArr[4]) < minKeepTime || (CIDstyle === 1 && FskPos === 1 && parseInt(strArr[4]) < minSendCidLowTime)) {
                if (parseInt(strArr[1]) < minKeepTime || parseInt(strArr[2]) < minKeepTime || parseInt(strArr[3]) < minKeepTime) {
                  alert(`The duration at ON/OFF state for ringing scheme ${ringNumInfo} cannot be less than 50ms!`);
                } else {
                  alert(`The duration at OFF state for the last ringing scheme ${ringNumInfo} cannot be less than 1700ms!`);
                }
                document.getElementById(`ringMode${i}`)?.focus();
                return;
              }
            } else {
              alert(`Please input a ringing mode in the right format for Scheme ${ringNumInfo}!`);
              document.getElementById(`ringMode${i}`)?.focus();
              return;
            }
          }
        } else {
          if (ringModeObj !== '') {
            alert(`Please input the CallerID for Scheme ${ringNumInfo}!`);
            document.getElementById(`ringCallerId${i}`)?.focus();
            return;
          }
        }
      } else {
        if (ringAlertInfoObj !== '') {
          if (ringModeObj === '') {
            alert(`Please input a ringing mode for Scheme ${ringNumInfo}!`);
            document.getElementById(`ringMode${i}`)?.focus();
            return;
          } else {
            const strArr = ringModeObj.split(',');
            if (strArr[0] === '1') {
              if (strArr.length !== 3) {
                alert(`Please input a ringing mode in the right format for Scheme ${ringNumInfo}!`);
                document.getElementById(`ringMode${i}`)?.focus();
                return;
              }
              if (parseInt(strArr[1]) < minKeepTime || parseInt(strArr[2]) < minKeepTime || (CIDstyle === 1 && FskPos === 1 && parseInt(strArr[2]) < minSendCidLowTime)) {
                if (parseInt(strArr[1]) < minKeepTime) {
                  alert(`The duration at ON/OFF state for ringing scheme ${ringNumInfo} cannot be less than 50ms!`);
                } else {
                  alert(`The duration at OFF state for the last ringing scheme ${ringNumInfo} cannot be less than 1700ms!`);
                }
                document.getElementById(`ringMode${i}`)?.focus();
                return;
              }
            } else if (strArr[0] === '2') {
              if (strArr.length !== 5) {
                alert(`Please input a ringing mode in the right format for Scheme ${ringNumInfo}!`);
                document.getElementById(`ringMode${i}`)?.focus();
                return;
              }
              if (parseInt(strArr[1]) < minKeepTime || parseInt(strArr[2]) < minKeepTime || parseInt(strArr[3]) < minKeepTime || parseInt(strArr[4]) < minKeepTime || (CIDstyle === 1 && FskPos === 1 && parseInt(strArr[4]) < minSendCidLowTime)) {
                if (parseInt(strArr[1]) < minKeepTime || parseInt(strArr[2]) < minKeepTime || parseInt(strArr[3]) < minKeepTime) {
                  alert(`The duration at ON/OFF state for ringing scheme ${ringNumInfo} cannot be less than 50ms!`);
                } else {
                  alert(`The duration at OFF state for the last ringing scheme ${ringNumInfo} cannot be less than 1700ms!`);
                }
                document.getElementById(`ringMode${i}`)?.focus();
                return;
              }
            } else {
              alert(`Please input a ringing mode in the right format for Scheme ${ringNumInfo}!`);
              document.getElementById(`ringMode${i}`)?.focus();
              return;
            }
          }
        } else {
          if (ringModeObj !== '') {
            alert(`Please input the Alert-Info Value for Scheme ${ringNumInfo}!`);
            document.getElementById(`ringAlertInfo${i}`)?.focus();
            return;
          }
        }
      }
    }

    // Check for duplicate CallerID or Alert-Info
    const ringCallerIdArr = [
      formData.ringCallerId1,
      formData.ringCallerId2,
      formData.ringCallerId3,
      formData.ringCallerId4
    ];
    const ringAlertInfoArr = [
      formData.ringAlertInfo1,
      formData.ringAlertInfo2,
      formData.ringAlertInfo3,
      formData.ringAlertInfo4
    ];

    for (let i = 0; i < 3; i++) {
      if (formData.ringScheme === '0') {
        if (ringCallerIdArr[i] === '') continue;
        for (let j = i + 1; j < 4; j++) {
          if (ringCallerIdArr[j] === '') continue;
          if (ringCallerIdArr[i] === ringCallerIdArr[j]) {
            alert("The callerID has already existed!");
            document.getElementById(`ringCallerId${j + 1}`)?.focus();
            return;
          }
        }
      } else {
        if (ringAlertInfoArr[i] === '') continue;
        for (let j = i + 1; j < 4; j++) {
          if (ringAlertInfoArr[j] === '') continue;
          if (ringAlertInfoArr[i] === ringAlertInfoArr[j]) {
            alert("The Alter-Info has already existed!");
            document.getElementById(`ringAlertInfo${j + 1}`)?.focus();
            return;
          }
        }
      }
    }

    alert('Settings saved successfully!');
  };

  const handleReset = () => {
    setFormData(RINGING_SCHEME_INITIAL_FORM);
    setChangeTime(0);
  };

  const renderSchemeRow = (schemeNum) => {
    const showCallerId = formData.ringScheme === '0';
    const showAlertInfo = formData.ringScheme === '1';

    return (
      <React.Fragment key={schemeNum}>
        <tr style={{ height: '22px' }}>
          <td style={{ width: '20%' }}></td>
          <td colSpan={2} style={{ fontSize: '14px', color: '#333' }}>
            Scheme {schemeNum}
          </td>
          <td style={{ width: '45%' }}></td>
        </tr>

        {/* CallerID or Alert-Info field */}
        {showCallerId && (
          <tr style={{ height: '22px' }}>
            <td></td>
            <td style={{ width: '5%' }}></td>
            <td style={{ width: '30%', fontSize: '14px', color: '#333' }}>CallerID</td>
            <td style={{ width: '45%' }}>
              <TextField
                id={`ringCallerId${schemeNum}`}
                value={formData[`ringCallerId${schemeNum}`]}
                onChange={(e) => handleInputChange(`ringCallerId${schemeNum}`, e.target.value)}
                onKeyPress={handleKeyPress1}
                inputProps={{ maxLength: 128, style: { fontSize: 14, padding: '4px 8px' } }}
                sx={{
                  width: '100%',
                  maxWidth: '300px',
                  '& .MuiOutlinedInput-root': {
                    height: '28px',
                    backgroundColor: 'white',
                    '& fieldset': {
                      borderColor: '#999',
                    },
                    '&:hover fieldset': {
                      borderColor: '#666',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#3b82f6',
                    },
                  },
                }}
                variant="outlined"
                size="small"
              />
            </td>
          </tr>
        )}

        {showAlertInfo && (
          <tr style={{ height: '22px' }}>
            <td></td>
            <td style={{ width: '5%' }}></td>
            <td style={{ width: '30%', fontSize: '14px', color: '#333' }}>Alert-Info Value</td>
            <td style={{ width: '45%' }}>
              <TextField
                id={`ringAlertInfo${schemeNum}`}
                value={formData[`ringAlertInfo${schemeNum}`]}
                onChange={(e) => handleInputChange(`ringAlertInfo${schemeNum}`, e.target.value)}
                onKeyPress={handleKeyPress1}
                inputProps={{ maxLength: 128, style: { fontSize: 14, padding: '4px 8px' } }}
                sx={{
                  width: '100%',
                  maxWidth: '300px',
                  '& .MuiOutlinedInput-root': {
                    height: '28px',
                    backgroundColor: 'white',
                    '& fieldset': {
                      borderColor: '#999',
                    },
                    '&:hover fieldset': {
                      borderColor: '#666',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#3b82f6',
                    },
                  },
                }}
                variant="outlined"
                size="small"
              />
            </td>
          </tr>
        )}

        {/* Ringing Mode field */}
        <tr style={{ height: '22px' }}>
          <td></td>
          <td style={{ width: '5%' }}></td>
          <td style={{ width: '30%', fontSize: '14px', color: '#333' }}>Ringing Mode</td>
          <td style={{ width: '45%' }}>
            <TextField
              id={`ringMode${schemeNum}`}
              value={formData[`ringMode${schemeNum}`]}
              onChange={(e) => handleInputChange(`ringMode${schemeNum}`, e.target.value)}
              onKeyPress={handleKeyPress}
              inputProps={{ maxLength: 128, style: { fontSize: 14, padding: '4px 8px' } }}
              sx={{
                width: '100%',
                maxWidth: '300px',
                '& .MuiOutlinedInput-root': {
                  height: '28px',
                  backgroundColor: 'white',
                  '& fieldset': {
                    borderColor: '#999',
                  },
                  '&:hover fieldset': {
                    borderColor: '#666',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#3b82f6',
                  },
                },
              }}
              variant="outlined"
              size="small"
            />
          </td>
        </tr>

        <tr><td style={{ height: '8px' }}></td></tr>
      </React.Fragment>
    );
  };

  return (
    <div
      className="bg-gray-50 min-h-[calc(100vh-128px)] py-2"
      style={{ backgroundColor: '#dde0e4' }}
    >
      <div className="flex justify-center">
        <div className="w-full" style={{ maxWidth: '1024px' }}>
          {/* Page Title Bar */}
          <div className="w-full h-8 bg-gradient-to-b from-[#b3e0ff] via-[#6ec1f7] to-[#3b8fd6] flex items-center justify-center font-semibold text-lg text-gray-700 shadow mb-0">
            <span>Ringing Scheme</span>
          </div>
        
          {/* Main Card */}
          <div className="bg-[#dde0e4] border-2 border-gray-400 border-t-0 shadow-sm py-6 text-sm">
            <div className="flex justify-center pl-8">
              <table className="text-sm" style={{ tableLayout: 'fixed', width: '500px' }}>
                <colgroup>
                  <col style={{ width: '20%' }} />
                  <col style={{ width: '5%' }} />
                  <col style={{ width: '30%' }} />
                  <col style={{ width: '45%' }} />
                </colgroup>
                <tbody>
                  <tr style={{ height: '22px' }}>
                    <td></td>
                    <td colSpan={2} style={{ fontSize: '14px', color: '#333' }}>Matching Scheme</td>
                    <td>
                      <select
                        value={formData.ringScheme}
                        onChange={(e) => handleSchemeChange(e.target.value)}
                        className="border border-gray-400 rounded-sm px-1 bg-white"
                        style={{ height: '28px', width: '155px', fontSize: '14px' }}
                      >
                        <option value="0">CallerID Matching</option>
                        <option value="1">Alert-Info Matching</option>
                      </select>
                    </td>
                  </tr>
                  <tr><td style={{ height: '8px' }}></td></tr>

                  {[1, 2, 3, 4].map(num => renderSchemeRow(num))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Save and Reset Buttons */}
          <div className="flex justify-center gap-4 mt-6 mb-4">
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
              onClick={handleSave}
            >
              Save
            </Button>
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
              onClick={handleReset}
            >
              Reset
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RingingSchemePage;

