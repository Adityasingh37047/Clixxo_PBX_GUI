import React, { useState } from 'react';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import { Select, MenuItem, FormControl } from '@mui/material';
import { HA_DEFAULTS, HA_PRIMARY_BACKUP_OPTIONS, HA_ETH_OPTIONS, HA_LABELS } from '../constants/HaConstants';

function isValidIPv4(ip) {
  // Simple IPv4 validation
  return /^((25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)(\.|$)){4}$/.test(ip);
}

const HaPage = () => {
  const [enabled, setEnabled] = useState(HA_DEFAULTS.enabled);
  const [virtualIp, setVirtualIp] = useState(HA_DEFAULTS.virtualIp);
  const [primaryBackup, setPrimaryBackup] = useState(HA_DEFAULTS.primaryBackup);
  const [haEth, setHaEth] = useState(HA_DEFAULTS.haEth);
  const [ipTouched, setIpTouched] = useState(false);

  const handleSave = () => {
    // Check if IP is valid before saving
    if (enabled && !isValidIPv4(virtualIp)) {
      // Don't show browser alert, just return - the inline error is already showing
      return;
    }
    alert('Settings saved!');
  };

  const handleReset = () => {
    setEnabled(HA_DEFAULTS.enabled);
    setVirtualIp(HA_DEFAULTS.virtualIp);
    setPrimaryBackup(HA_DEFAULTS.primaryBackup);
    setHaEth(HA_DEFAULTS.haEth);
    setIpTouched(false);
  };

  const ipIsValid = isValidIPv4(virtualIp);

  return (
    <div className="bg-gray-50 min-h-[calc(100vh-200px)] py-0 flex flex-col items-center" style={{backgroundColor: "#dde0e4"}}>
      <div className="w-full max-w-3xl mx-auto">
        <div className="w-full h-8 bg-gradient-to-b from-[#b3e0ff] via-[#6ec1f7] to-[#3b8fd6] flex items-center justify-center font-semibold text-lg text-gray-600 shadow mb-0">
          HA
        </div>
        <div className="border-2 border-gray-400 border-t-0 shadow-sm flex flex-col" style={{backgroundColor: "#dde0e4"}}>
          <div className="flex-1 py-6 px-20">
            <div className="space-y-4">
              {/* HA Enable Row */}
              <div className="flex items-center justify-between">
                <label className="text-base text-gray-600 font-medium text-left">HA</label>
                <div className="flex items-center w-60">
                  <input
                    type="checkbox"
                    checked={enabled}
                    onChange={() => setEnabled(prev => !prev)}
                    className="w-4 h-4 mr-2 accent-blue-600"
                  />
                  <span className="text-base text-gray-600">Enable</span>
                </div>
              </div>

              {/* Public Virtual IP Row */}
              <div className="flex items-center justify-between">
                <label className="text-base text-gray-600 font-medium text-left">Public Virtual IP</label>
                <div className="flex flex-col items-end">
                  <input
                    type="text"
                    value={virtualIp}
                    onChange={e => setVirtualIp(e.target.value)}
                    onBlur={() => setIpTouched(true)}
                    className={`w-60 text-base px-3 py-2 border ${!ipIsValid && ipTouched && enabled ? 'border-red-500' : 'border-gray-400'} bg-white`}
                    style={{ height: '32px' }}
                    disabled={!enabled}
                    placeholder="e.g. 192.168.1.100"
                  />
                  {!ipIsValid && ipTouched && enabled && (
                    <div className="text-red-500 text-xs mt-1">Please enter a valid IPv4 address.</div>
                  )}
                </div>
              </div>

              {/* Primary/Backup Row */}
              <div className="flex items-center justify-between">
                <label className="text-base text-gray-600 font-medium text-left">Primary/Backup</label>
                <FormControl size="small" className="w-60">
                  <Select
                    value={primaryBackup}
                    onChange={e => setPrimaryBackup(e.target.value)}
                    variant="outlined"
                    disabled={!enabled}
                    sx={{ 
                      fontSize: 16,
                      height: 36,
                      backgroundColor: '#ffffff',
                      '& .MuiOutlinedInput-root': { 
                        backgroundColor: '#ffffff',
                        height: 36,
                        '& fieldset': {
                          borderColor: '#999999',
                        },
                        '&:hover fieldset': {
                          borderColor: '#999999',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#999999',
                        }
                      },
                      '& .MuiSelect-select': { 
                        backgroundColor: '#ffffff',
                        padding: '6px 14px',
                        height: 'auto',
                        display: 'flex',
                        alignItems: 'center'
                      }
                    }}
                  >
                    {HA_PRIMARY_BACKUP_OPTIONS.map(opt => (
                      <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </div>

              {/* HA Eth Row */}
              <div className="flex items-center justify-between">
                <label className="text-base text-gray-600 font-medium text-left">HA Eth</label>
                <FormControl size="small" className="w-60">
                  <Select
                    value={haEth}
                    onChange={e => setHaEth(e.target.value)}
                    variant="outlined"
                    disabled={!enabled}
                    sx={{ 
                      fontSize: 16,
                      height: 36,
                      backgroundColor: '#ffffff',
                      '& .MuiOutlinedInput-root': { 
                        backgroundColor: '#ffffff',
                        height: 36,
                        '& fieldset': {
                          borderColor: '#999999',
                        },
                        '&:hover fieldset': {
                          borderColor: '#999999',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#999999',
                        }
                      },
                      '& .MuiSelect-select': { 
                        backgroundColor: '#ffffff',
                        padding: '6px 14px',
                        height: 'auto',
                        display: 'flex',
                        alignItems: 'center'
                      }
                    }}
                  >
                    {HA_ETH_OPTIONS.map(opt => (
                      <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </div>
            </div>
          </div>
        </div>
        
        {/* Buttons */}
              <div className="flex justify-center gap-8 mt-6">
          <Button
            variant="contained"
            sx={{
              background: 'linear-gradient(to bottom, #3bb6f5 0%, #0e8fd6 100%)',
              color: '#fff',
              fontWeight: 600,
                  fontSize: '16px',
              minWidth: 100,
              minHeight: 42,
              px: 2,
              py: 0.5,
              boxShadow: '0 2px 8px #b3e0ff',
              textTransform: 'none',
              '&:hover': {
                background: 'linear-gradient(to bottom, #0e8fd6 0%, #3bb6f5 100%)',
                color: '#fff',
              },
            }}
            onClick={handleSave}
          >Save</Button>
          <Button
            variant="contained"
            sx={{
              background: 'linear-gradient(to bottom, #3bb6f5 0%, #0e8fd6 100%)',
              color: '#fff',
              fontWeight: 600,
              fontSize: '16px',
              minWidth: 100,
              minHeight: 42,
              px: 2,
              py: 0.5,
              boxShadow: '0 2px 8px #b3e0ff',
              textTransform: 'none',
              '&:hover': {
                background: 'linear-gradient(to bottom, #0e8fd6 0%, #3bb6f5 100%)',
                color: '#fff',
              },
            }}
            onClick={handleReset}
          >Reset</Button>
        </div>
      </div>
    </div>
  );
};

export default HaPage;
