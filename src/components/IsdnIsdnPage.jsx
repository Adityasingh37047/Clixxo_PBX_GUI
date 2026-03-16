import React, { useState } from 'react';
import { ISDN_FORM_FIELDS, ISDN_FORM_INITIAL_VALUES } from '../constants/IsdnIsdnConstants';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Checkbox from '@mui/material/Checkbox';
import Button from '@mui/material/Button';

const IsdnIsdnPage = () => {
  const [form, setForm] = useState(ISDN_FORM_INITIAL_VALUES);

  const handleChange = (name, value, type) => {
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? !prev[name] : value
    }));
  };

  const handleReset = () => {
    setForm(ISDN_FORM_INITIAL_VALUES);
  };
  const handleSave = () => {
    alert('Settings saved!');
  };

  // Shared styles for consistent input field alignment
  const textFieldStyle = {
    '& .MuiOutlinedInput-root': {
      backgroundColor: 'white',
      height: '28px',
      fontSize: '12px',
      '& fieldset': {
        borderColor: '#d1d5db',
        borderRadius: '4px'
      },
      '&:hover fieldset': {
        borderColor: '#d1d5db',
      },
      '&.Mui-focused fieldset': {
        borderColor: '#3b82f6',
      }
    },
    '& .MuiOutlinedInput-input': {
      padding: '4px 8px',
      fontSize: '12px',
      height: '20px',
      boxSizing: 'border-box'
    }
  };

  const selectStyle = {
    backgroundColor: 'white',
    height: '28px',
    fontSize: '12px',
    '& .MuiOutlinedInput-notchedOutline': {
      borderColor: '#d1d5db',
      borderRadius: '4px'
    },
    '&:hover .MuiOutlinedInput-notchedOutline': {
      borderColor: '#d1d5db',
    },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderColor: '#3b82f6',
    },
    '& .MuiSelect-select': {
      padding: '4px 8px',
      fontSize: '12px',
      height: '20px',
      boxSizing: 'border-box',
      display: 'flex',
      alignItems: 'center'
    }
  };

  const smallTextFieldStyle = {
    '& .MuiOutlinedInput-root': {
      backgroundColor: 'white',
      height: '28px',
      fontSize: '12px',
      '& fieldset': {
        borderColor: '#d1d5db',
        borderRadius: '4px'
      },
      '&:hover fieldset': {
        borderColor: '#d1d5db',
      },
      '&.Mui-focused fieldset': {
        borderColor: '#3b82f6',
      }
    },
    '& .MuiOutlinedInput-input': {
      padding: '4px 8px',
      fontSize: '12px',
      height: '20px',
      boxSizing: 'border-box'
    }
  };

  const smallSelectStyle = {
    backgroundColor: 'white',
    height: '28px',
    fontSize: '12px',
    '& .MuiOutlinedInput-notchedOutline': {
      borderColor: '#d1d5db',
      borderRadius: '4px'
    },
    '&:hover .MuiOutlinedInput-notchedOutline': {
      borderColor: '#d1d5db',
    },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderColor: '#3b82f6',
    },
    '& .MuiSelect-select': {
      padding: '4px 8px',
      fontSize: '12px',
      height: '20px',
      boxSizing: 'border-box',
      display: 'flex',
      alignItems: 'center'
    }
  };

  return (
    <div className="w-full py-6" style={{backgroundColor: "#dde0e4"}}>
      {/* Main Container with Dark Gray Border */}
      <div style={{ width: '1400px', margin: '0 auto' }}>
        {/* Header (blue bar) - extends to full width */}
        <div className="w-full flex items-center justify-center font-semibold text-[22px] text-[#444] shadow-sm"
          style={{
            height: 36,
            background: 'linear-gradient(to bottom, #b3e0ff 0%, #6ec1f7 50%, #3b8fd6 100%)',
            borderTop: '1px solid #3b8fd6',
            borderLeft: '1px solid #3b8fd6',
            borderRight: '1px solid #3b8fd6',
            borderTopLeftRadius: '4px',
            borderTopRightRadius: '4px'
          }}
        >
          ISDN Settings
        </div>
        
        {/* Content Container with borders */}
        <div style={{ 
          border: '1px solid #444444', 
          borderTop: 'none', 
          backgroundColor: '#dde0e4',
          borderBottomLeftRadius: '4px',
          borderBottomRightRadius: '4px'
        }}>
          {/* Main Table Container */}
          <div className="p-4" style={{ backgroundColor: '#dde0e4' }}>
          {/* First Row - Main Settings */}
          <table className="w-full border-collapse mb-2">
            <tbody>
              <tr style={{ padding: '1px 0' }}>
                <td className="text-center px-3 py-1 text-xs font-medium text-gray-700 min-w-[100px]">
                  Link No.<br />
                  <span className="text-xs">User Side: 0</span>
                </td>
                <td className="text-center px-3 py-1 text-xs font-medium text-gray-700 min-w-[100px]">
                  Logical PCM No.<br />
                  <span className="text-xs">0</span>
                </td>
                <td className="text-center px-3 py-1 text-xs font-medium text-gray-700 min-w-[80px]">
                  TEI
                </td>
                <td className="text-center px-3 py-1 text-xs font-medium text-gray-700 min-w-[140px]">
                  Ch Identification
                </td>
                <td className="text-center px-3 py-1 text-xs font-medium text-gray-700 min-w-[160px]">
                  Default Callee Type
                </td>
                <td className="text-center px-3 py-1 text-xs font-medium text-gray-700 min-w-[160px]">
                  Default Caller Type
                </td>
                <td className="text-center px-3 py-1 text-xs font-medium text-gray-700 min-w-[100px]">
                  CODEC
                </td>
                <td className="text-center px-3 py-1 text-xs font-medium text-gray-700 min-w-[140px]">
                  Auto Link Building
                </td>
                <td className="text-center px-3 py-1 text-xs font-medium text-gray-700 min-w-[100px]">
                  CRC Check
                </td>
              </tr>
              <tr style={{ padding: '1px 0' }}>
                <td className="text-center px-3 py-1">
                  <span className="text-xs text-gray-600"> </span>
                </td>
                <td className="text-center px-3 py-1">
                  <span className="text-xs text-gray-600"></span>
                </td>
                <td className="text-center px-3 py-1">
              <TextField
                size="small"
                value={form.tei}
                onChange={e => handleChange('tei', e.target.value, 'text')}
                    sx={{
                      ...textFieldStyle,
                      width: '60px'
                    }}
                  />
                </td>
                <td className="text-center px-3 py-1">
  <Select
    size="small"
    value={form.chIdentification}
    onChange={e => handleChange('chIdentification', e.target.value, 'select')}
                    sx={{
                      ...selectStyle,
                      minWidth: '120px'
                    }}
  >
    {ISDN_FORM_FIELDS
      .find(f => f.name === 'chIdentification')
      .options.map(opt => (
        <MenuItem key={opt} value={opt}>{opt}</MenuItem>
      ))}
  </Select>
                </td>
                <td className="text-center px-3 py-1">
              <Select
                size="small"
                value={form.defaultCalleeType}
                onChange={e => handleChange('defaultCalleeType', e.target.value, 'select')}
                    sx={{
                      ...selectStyle,
                      minWidth: '160px'
                    }}
              >
                {ISDN_FORM_FIELDS
                      .find(f => f.name === 'defaultCalleeType')
                      .options.map(opt => (
                  <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                ))}
              </Select>
                </td>
                <td className="text-center px-3 py-1">
              <Select
                size="small"
                value={form.defaultCallerType}
                onChange={e => handleChange('defaultCallerType', e.target.value, 'select')}
                    sx={{
                      ...selectStyle,
                      minWidth: '160px'
                    }}
              >
                {ISDN_FORM_FIELDS
                      .find(f => f.name === 'defaultCallerType')
                      .options.map(opt => (
                  <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                ))}
              </Select>
                </td>
                <td className="text-center px-3 py-1">
              <Select
                size="small"
                value={form.codec}
                onChange={e => handleChange('codec', e.target.value, 'select')}
                    sx={{
                      ...selectStyle,
                      minWidth: '100px'
                    }}
              >
                {ISDN_FORM_FIELDS
                .find(f => f.name === 'codec')
                      .options.map(opt => (
                    <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                      ))}
              </Select>
                </td>
                <td className="text-center px-3 py-1">
              <Select
                size="small"
                value={form.autoLinkBuilding}
                onChange={e => handleChange('autoLinkBuilding', e.target.value, 'select')}
                    sx={{
                      ...selectStyle,
                      minWidth: '120px'
                    }}
              >
                <MenuItem value="Enable">Enable</MenuItem>
                <MenuItem value="Disable">Disable</MenuItem>
              </Select>
                </td>
                <td className="text-center px-3 py-1">
              <Checkbox
                checked={form.crcCheck}
                onChange={() => handleChange('crcCheck', !form.crcCheck, 'checkbox')}
                    sx={{ p: 0.2 }}
                  />
                </td>
              </tr>
            </tbody>
          </table>

          {/* Second Row - Redirecting Settings */}
          <table className="w-full border-collapse mb-2">
            <tbody>
              <tr style={{ padding: '1px 0' }}>
                <td className="text-center px-3 py-1 text-xs font-medium text-gray-700 min-w-[100px]">
                  Link No.<br />
                  <span className="text-xs">User Side: 0</span>
                </td>
                <td className="text-center px-3 py-1 text-xs font-medium text-gray-700 min-w-[100px]">
                  Logical PCM No.<br />
                  <span className="text-xs">0</span>
                </td>
                <td className="text-center px-3 py-1 text-xs font-medium text-gray-700 min-w-[220px]">
                  Set Caller/Callee Type in case of Redirecting Num
                </td>
                <td className="text-center px-3 py-1 text-xs font-medium text-gray-700 min-w-[200px]">
                  Callee Type (with Redirecting Num)
                </td>
                <td className="text-center px-3 py-1 text-xs font-medium text-gray-700 min-w-[200px]">
                  Caller Type (with Redirecting Num)
                </td>
                <td className="text-center px-3 py-1 text-xs font-medium text-gray-700 min-w-[180px]">
                  Synchronize Modification
                </td>
              </tr>
              <tr style={{ padding: '1px 0' }}>
                <td className="text-center px-3 py-1">
                  <span className="text-xs text-gray-600"> </span>
                </td>
                <td className="text-center px-3 py-1">
                  <span className="text-xs text-gray-600"></span>
                </td>
                <td className="text-center px-3 py-1">
              <Checkbox
                checked={form.setCallerCalleeTypeRedirectingNum || false}
                onChange={() => handleChange('setCallerCalleeTypeRedirectingNum', !form.setCallerCalleeTypeRedirectingNum, 'checkbox')}
                    sx={{ p: 0.2 }}
                  />
                </td>
                <td className="text-center px-3 py-1">
              <Select
                size="small"
                value={form.calleeTypeWithRedirectingNum || 'National number'}
                onChange={e => handleChange('calleeTypeWithRedirectingNum', e.target.value, 'select')}
                disabled={!form.setCallerCalleeTypeRedirectingNum}
                    sx={{
                      ...selectStyle,
                      minWidth: '160px'
                    }}
              >
                <MenuItem value="National number">National number</MenuItem>
                <MenuItem value="International number">International number</MenuItem>
                    <MenuItem value="Network number">Network number</MenuItem>
                    <MenuItem value="Subscriber number">Subscriber number</MenuItem>
                <MenuItem value="Unknown">Unknown</MenuItem>
              </Select>
                </td>
                <td className="text-center px-3 py-1">
              <Select
                size="small"
                value={form.callerTypeWithRedirectingNum || 'National number'}
                onChange={e => handleChange('callerTypeWithRedirectingNum', e.target.value, 'select')}
                disabled={!form.setCallerCalleeTypeRedirectingNum}
                    sx={{
                      ...selectStyle,
                      minWidth: '160px'
                    }}
              >
                <MenuItem value="National number">National number</MenuItem>
                <MenuItem value="International number">International number</MenuItem>
                <MenuItem value="Network number">Network number</MenuItem>
                <MenuItem value="Subscriber number">Subscriber number</MenuItem>
                <MenuItem value="Unknown">Unknown</MenuItem>
              </Select>
                </td>
                <td className="text-center px-3 py-1">
              <Checkbox
                checked={form.synchronizeModification}
                onChange={() => handleChange('synchronizeModification', !form.synchronizeModification, 'checkbox')}
                    sx={{ p: 0.2 }}
                  />
                </td>
              </tr>
            </tbody>
          </table>

        {/* ISDN Global Settings */}
          <div className="text-gray-700 font-semibold text-sm mb-2 mt-3 px-3">ISDN Global Settings</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 w-full max-w-full px-3">
          {/* Left column: labels and checkboxes */}
          <div className="flex flex-col flex-1 w-full">
              <div className="flex items-center min-h-[28px] mb-1 w-full">
                <span className="text-xs text-gray-700 break-words whitespace-normal w-full">Transfer Capability</span>
              </div>
              <div className="flex items-center min-h-[28px] mb-1 w-full">
                <Checkbox
                  checked={form.enterAutoAlertCallProceeding}
                  onChange={() => handleChange('enterAutoAlertCallProceeding', !form.enterAutoAlertCallProceeding, 'checkbox')}
                  sx={{ p: 0.2, mr: 0.5 }}
                />
                <span className="text-xs text-gray-700 break-words whitespace-normal w-full">Enter Auto Alert State upon Reception of 'CALL PROCEEDING' Message</span>
              </div>
              <div className="flex items-center min-h-[28px] mb-1 w-full">
                <Checkbox
                  checked={form.enterAutoAlertProgress}
                  onChange={() => handleChange('enterAutoAlertProgress', !form.enterAutoAlertProgress, 'checkbox')}
                  sx={{ p: 0.2, mr: 0.5 }}
                />
                <span className="text-xs text-gray-700 break-words whitespace-normal w-full">Enter Auto Alert State upon Reception of 'PROGRESS' Message</span>
              </div>
              <div className="flex items-center min-h-[28px] mb-1 w-full">
                    <Checkbox
                  checked={form.decodeIsdnDebug}
                  onChange={() => handleChange('decodeIsdnDebug', !form.decodeIsdnDebug, 'checkbox')}
                  sx={{ p: 0.2, mr: 0.5 }}
                />
                <span className="text-xs text-gray-700 break-words whitespace-normal w-full">Decode ISDN Debugging Message before Outputting</span>
              </div>
              <div className="flex items-center min-h-[28px] mb-1 w-full">
                <span className="text-xs text-gray-700 break-words whitespace-normal w-full">Maximum Wait Time for Called Party's Pick up(s)</span>
              </div>
              <div className="flex items-center min-h-[28px] mb-1 w-full">
                <span className="text-xs text-gray-700 break-words whitespace-normal w-full">Minimum Length of the CalledID of an Incoming Call</span>
              </div>
              <div className="flex items-center min-h-[28px] mb-1 w-full">
                <span className="text-xs text-gray-700 break-words whitespace-normal w-full">Calling Party Property Present Indicator</span>
              </div>
              <div className="flex items-center min-h-[28px] mb-1 w-full">
                <span className="text-xs text-gray-700 break-words whitespace-normal w-full">Calling Party Property Shielding Indicator</span>
              </div>
              <div className="flex items-center min-h-[28px] mb-1 w-full">
                <span className="text-xs text-gray-700 break-words whitespace-normal w-full">Default Redirecting Number Type</span>
              </div>
              <div className="flex items-center min-h-[28px] mb-1 w-full">
                <span className="text-xs text-gray-700 break-words whitespace-normal w-full">Collect Call</span>
              </div>
            </div>
            {/* Right column: input/select fields */}
            <div className="flex flex-col flex-1 ml-0 sm:ml-4 w-full">
              <div className="min-h-[28px] mb-1 flex items-center w-full">
                <Select
                  size="small"
                  value={form.transferCapability}
                  onChange={e => handleChange('transferCapability', e.target.value, 'select')}
                  sx={{
                    ...smallSelectStyle,
                    minWidth: '180px'
                  }}
                >
                  {ISDN_FORM_FIELDS
                    .find(f => f.name === 'transferCapability')
                    .options.map(opt => (
                    <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                  ))}
                </Select>
              </div>
              <div className="min-h-[28px] mb-1 flex items-center w-full"></div>
              <div className="min-h-[28px] mb-1 flex items-center w-full"></div>
              <div className="min-h-[28px] mb-1 flex items-center w-full"></div>
              <div className="min-h-[28px] mb-1 flex items-center w-full">
                <TextField
                  size="small"
                  value={form.maxWaitTime}
                  onChange={e => handleChange('maxWaitTime', e.target.value, 'text')}
                  sx={{
                    ...smallTextFieldStyle,
                    width: '80px'
                  }}
                />
              </div>
              <div className="min-h-[28px] mb-1 flex items-center w-full">
                <TextField
                  size="small"
                  value={form.minCalleeLength}
                  onChange={e => handleChange('minCalleeLength', e.target.value, 'text')}
                  sx={{
                    ...smallTextFieldStyle,
                    width: '80px'
                  }}
                />
              </div>
              <div className="min-h-[28px] mb-1 flex items-center w-full">
                <Select
                  size="small"
                  value={form.callingPartyPresent}
                  onChange={e => handleChange('callingPartyPresent', e.target.value, 'select')}
                  sx={{
                    ...smallSelectStyle,
                    minWidth: '180px'
                  }}
                >
                  {ISDN_FORM_FIELDS
                    .find(f => f.name === 'callingPartyPresent')
                    .options.map(opt => (
                      <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                    ))}
                </Select>
          </div>
              <div className="min-h-[28px] mb-1 flex items-center w-full">
                  <Select
                    size="small"
                  value={form.callingPartyShielding}
                  onChange={e => handleChange('callingPartyShielding', e.target.value, 'select')}
                  sx={{
                    ...smallSelectStyle,
                    minWidth: '180px'
                  }}
                >
                  {ISDN_FORM_FIELDS
                    .find(f => f.name === 'callingPartyShielding')
                    .options.map(opt => (
                      <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                    ))}
                  </Select>
              </div>
              <div className="min-h-[28px] mb-1 flex items-center w-full">
                <Select
                    size="small"
                  value={form.defaultRedirectingType}
                  onChange={e => handleChange('defaultRedirectingType', e.target.value, 'select')}
                  sx={{
                    ...smallSelectStyle,
                    minWidth: '180px'
                  }}
                >
                  {ISDN_FORM_FIELDS
                    .find(f => f.name === 'defaultRedirectingType')
                    .options.map(opt => (
                      <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                    ))}
                </Select>
              </div>
              <div className="min-h-[28px] mb-1 flex items-center w-full">
                <Select
                  size="small"
                  value={form.collectCall}
                  onChange={e => handleChange('collectCall', e.target.value, 'select')}
                  sx={{
                    ...smallSelectStyle,
                    minWidth: '180px'
                  }}
                >
                  {ISDN_FORM_FIELDS
                    .find(f => f.name === 'collectCall')
                    .options.map(opt => (
                      <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                    ))}
                </Select>
              </div>
          </div>
        </div>

        {/* ISDN User Side */}
          <div className="text-gray-700 font-semibold text-sm mb-2 mt-3 px-3">ISDN User Side</div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-8 gap-y-4 mb-8 items-start w-full max-w-full px-3">
          {/* Column 1: Two checkboxes stacked vertically */}
          <div className="flex flex-col min-w-0 gap-2 w-full">
            <div className="flex items-center">
              <Checkbox
                checked={form.userSendCalledPartyNumberComplete}
                onChange={() => handleChange('userSendCalledPartyNumberComplete', !form.userSendCalledPartyNumberComplete, 'checkbox')}
                  sx={{ p: 0.2, mr: 0.5 }}
              />
                <span className="text-xs text-gray-700 break-words whitespace-normal w-full">Send the 'Called Party Number Complete' Parameter</span>
            </div>
            <div className="flex items-center">
              <Checkbox
                checked={form.userSendChannelIdentification}
                onChange={() => handleChange('userSendChannelIdentification', !form.userSendChannelIdentification, 'checkbox')}
                  sx={{ p: 0.2, mr: 0.5 }}
              />
                <span className="text-xs text-gray-700 break-words whitespace-normal w-full">Send Channel Identification Message</span>
            </div>
          </div>
          {/* Column 2: Wait Confirm Time (T310) (s) and Set Cause Value Length to 2 bytes */}
          <div className="flex flex-col min-w-0 gap-2 w-full">
            <div className="flex items-center">
                <span className="text-xs text-gray-700 mr-2 break-words whitespace-normal">Wait Confirm Time (T310) (s)</span>
              <TextField
                size="small"
                value={form.userWaitConfirmTime}
                onChange={e => handleChange('userWaitConfirmTime', e.target.value, 'text')}
                  sx={{
                    ...smallTextFieldStyle,
                    width: '60px'
                  }}
              />
            </div>
            <div className="flex items-center mt-0">
              <Checkbox
                checked={form.userSetCauseValueLength}
                onChange={() => handleChange('userSetCauseValueLength', !form.userSetCauseValueLength, 'checkbox')}
                  sx={{ p: 0.2, mr: 0.5 }}
              />
                <span className="text-xs text-gray-700 break-words whitespace-normal w-full">Set Cause Value Length to 2 bytes</span>
            </div>
          </div>
          {/* Column 3: Allow the Preferential Channel Selection, vertically centered */}
          <div className="flex items-center min-w-0 h-[76px] w-full">
            <Checkbox
              checked={form.userAllowPreferentialChannel}
              onChange={() => handleChange('userAllowPreferentialChannel', !form.userAllowPreferentialChannel, 'checkbox')}
                sx={{ p: 0.2, mr: 0.5 }}
            />
              <span className="text-xs text-gray-700 break-words whitespace-normal w-full">Allow the Preferential Channel Selection</span>
          </div>
        </div>

        {/* ISDN Network Side */}
          <div className="text-gray-700 font-semibold text-sm mb-2 mt-3 px-3">ISDN Network Side</div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-8 gap-y-4 mb-4 items-center w-full max-w-full px-3">
          {/* Row 1 */}
          <div className="flex items-center min-w-0 w-full">
            <Checkbox
              checked={form.networkSendCalledPartyNumberComplete}
              onChange={() => handleChange('networkSendCalledPartyNumberComplete', !form.networkSendCalledPartyNumberComplete, 'checkbox')}
                sx={{ p: 0.2, mr: 0.5 }}
            />
              <span className="text-xs text-gray-700 break-words whitespace-normal w-full">Send the 'Called Party Number Complete' Parameter</span>
          </div>
          <div className="flex items-center min-w-0 w-full">
              <span className="text-xs text-gray-700 mr-2 break-words whitespace-normal">Wait Confirm Time (T310) (s)</span>
            <TextField
              size="small"
              value={form.networkWaitConfirmTime}
              onChange={e => handleChange('networkWaitConfirmTime', e.target.value, 'text')}
                sx={{
                  ...smallTextFieldStyle,
                  width: '60px'
                }}
            />
          </div>
          <div className="flex flex-col items-start min-h-[76px] min-w-0 w-full">
            <div className="flex items-center">
              <Checkbox
                checked={form.networkAllowPreferentialChannel}
                onChange={() => handleChange('networkAllowPreferentialChannel', !form.networkAllowPreferentialChannel, 'checkbox')}
                  sx={{ p: 0.2, mr: 0.5 }}
              />
                <span className="text-xs text-gray-700 break-words whitespace-normal w-full">Allow the Preferential Channel Selection</span>
            </div>
            <div className="flex items-center mt-3">
              <Checkbox
                checked={form.networkEnable || false}
                onChange={() => handleChange('networkEnable', !form.networkEnable, 'checkbox')}
                  sx={{ p: 0.2, mr: 0.5 }}
              />
                <span className="text-xs text-gray-700 break-words whitespace-normal w-full">Enable</span>
            </div>
          </div>
          {/* Row 2 */}
          <div className="flex items-center min-w-0 w-full">
            <Checkbox
              checked={form.networkSendChannelIdentification}
              onChange={() => handleChange('networkSendChannelIdentification', !form.networkSendChannelIdentification, 'checkbox')}
                sx={{ p: 0.2, mr: 0.5 }}
            />
              <span className="text-xs text-gray-700 break-words whitespace-normal w-full">Send Channel Identification Message</span>
          </div>
          <div className="flex items-center min-w-0 w-full">
            <Checkbox
              checked={form.networkSetCauseValueLength}
              onChange={() => handleChange('networkSetCauseValueLength', !form.networkSetCauseValueLength, 'checkbox')}
                sx={{ p: 0.2, mr: 0.5 }}
              />
              <span className="text-xs text-gray-700 break-words whitespace-normal w-full">Set Cause Value Length to 2 bytes</span>
            </div>
            <div /> {/* Empty cell */}
          </div>

          {/* Send ISDN Redirecting Number */}
          <div className="text-gray-700 text-xs mb-2 px-3">
            Send ISDN Redirecting Number &nbsp;
            <Checkbox
              checked={form.networkEnable || false}
              onChange={() => handleChange('networkEnable', !form.networkEnable, 'checkbox')}
              sx={{ p: 0.2 }}
            />
            Enable
          </div>
        </div>

        {/* Save and Reset buttons */}
        <div className="flex justify-center gap-4 mt-4 mb-3 px-3">
        <Button
          variant="contained"
          sx={{
            background: 'linear-gradient(to bottom, #3bb6f5 0%, #0e8fd6 100%)',
            color: '#fff',
            fontWeight: 600,
              fontSize: '13px',
            borderRadius: 1.5,
              minWidth: 100,
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
              fontSize: '13px',
            borderRadius: 1.5,
              minWidth: 100,
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

        <div className="text-red-600 text-center text-xs mb-3">
        Note 1: You shall restart the service to validate the settings on this page!
        </div>
        </div>
      </div>
    </div>
  );
};

export default IsdnIsdnPage;
