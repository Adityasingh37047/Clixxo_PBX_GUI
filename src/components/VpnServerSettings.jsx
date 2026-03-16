import React, { useState } from 'react';
import { VPN_SERVER_SETTINGS_FIELDS, VPN_SERVER_SETTINGS_INITIAL_FORM } from '../constants/VpnServerSettingsConstants';
import { Button, TextField, Select, MenuItem, FormControl, InputLabel, Checkbox, FormControlLabel } from '@mui/material';

const VpnServerSettings = () => {
  const [form, setForm] = useState(VPN_SERVER_SETTINGS_INITIAL_FORM);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleReset = () => {
    setForm(VPN_SERVER_SETTINGS_INITIAL_FORM);
  };

  const handleSave = (e) => {
    e.preventDefault();
    alert('Settings saved!');
  };

  return (
    <div className="bg-gray-50 min-h-[calc(100vh-200px)] py-0 flex flex-col items-center">
      <div className="w-full max-w-4xl mx-auto flex flex-col items-center">
        <div className="w-full bg-gradient-to-b from-[#b3e0ff] via-[#6ec1f7] to-[#3b8fd6] h-12 flex items-center justify-center font-semibold text-lg text-gray-600 shadow mb-0 border-t-2 border-x-2 border-gray-400">
          VPN Server Settings
        </div>
        <form className="w-full bg-gray-50 border-x-2 border-b-2 border-gray-400 flex flex-col gap-0 px-2 md:px-8 py-6" onSubmit={handleSave}>
          <div className="flex flex-col gap-6 w-full">
            <div className="flex flex-col md:flex-row md:items-center gap-2 w-full">
              <div className="md:w-1/2 w-full text-[17px] font-medium text-gray-600 text-left mb-1 md:mb-0">VPN Server:</div>
              <div className="md:w-1/2 w-full flex items-center">
                <FormControlLabel
                  control={<Checkbox checked={form.enabled} onChange={handleChange} name="enabled" sx={{ p: 0.5 }} />}
                  label={<span className="text-[16px]">Enable</span>}
                  className="pl-1"
                />
              </div>
            </div>
            <div className="flex flex-col md:flex-row md:items-center gap-2 w-full ">
              <div className="md:w-1/2 w-full text-[17px] font-medium text-gray-600 text-left mb-1 md:mb-0">VPN Type:</div>
              <div className="md:w-1/2 w-full">
                <FormControl size="small" className="w-full">
                  <Select
                    name="vpnType"
                    value={form.vpnType}
                    onChange={handleChange}
                    // fullWidth
                    variant="outlined"
                  >
                    {VPN_SERVER_SETTINGS_FIELDS.find(f => f.name === 'vpnType').options.map(opt => (
                      <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </div>
            </div>
            <div className="flex flex-col md:flex-row md:items-center gap-2 w-full">
              <div className="md:w-1/2 w-full text-[17px] font-medium text-gray-600 text-left mb-1 md:mb-0">Identity Verification Protocol:</div>
              <div className="md:w-1/2 w-full">
                <FormControl size="small" className="w-full">
                  <Select
                    name="identityProtocol"
                    value={form.identityProtocol}
                    onChange={handleChange}
                    // fullWidth
                    variant="outlined"
                  >
                    {VPN_SERVER_SETTINGS_FIELDS.find(f => f.name === 'identityProtocol').options.map(opt => (
                      <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </div>
            </div>
            <div className="flex flex-col md:flex-row md:items-center gap-2 w-full">
              <div className="md:w-1/2 w-full text-[17px] font-medium text-gray-600 text-left mb-1 md:mb-0">Client IP Range:</div>
              <div className="md:w-1/2 w-full">
                <TextField
                  type="text"
                  name="clientIpRange"
                  value={form.clientIpRange}
                  onChange={handleChange}
                  size="small"
                  // fullWidth
                  variant="outlined"
                />
              </div>
            </div>
            <div className="flex flex-col md:flex-row md:items-center gap-2 w-full">
              <div className="md:w-1/2 w-full text-[17px] font-medium text-gray-600 text-left mb-1 md:mb-0">Preferred WINS Address (Optional):</div>
              <div className="md:w-1/2 w-full">
                <TextField
                  type="text"
                  name="preferredWINS"
                  value={form.preferredWINS}
                  onChange={handleChange}
                  size="small"
                  // fullWidth
                  variant="outlined"
                />
              </div>
            </div>
            <div className="flex flex-col md:flex-row md:items-center gap-2 w-full">
              <div className="md:w-1/2 w-full text-[17px] font-medium text-gray-600 text-left mb-1 md:mb-0">Spare WINS Address (Optional):</div>
              <div className="md:w-1/2 w-full">
                <TextField
                  type="text"
                  name="spareWINS"
                  value={form.spareWINS}
                  onChange={handleChange}
                  size="small"
                  // fullWidth
                  variant="outlined"
                />
              </div>
            </div>
          </div>
        </form>
        <div className="flex flex-col md:flex-row justify-center gap-8 mt-8 w-full">
          <Button
            type="submit"
            variant="contained"
            sx={{
              background: 'linear-gradient(to bottom, #3bb6f5 0%, #0e8fd6 100%)',
              color: '#fff',
              fontWeight: 600,
              fontSize: 18,
              borderRadius: 2,
              minWidth: 120,
              minHeight: 48,
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
          >
            Save
          </Button>
          <Button
            type="button"
            variant="contained"
            onClick={handleReset}
            sx={{
              background: 'linear-gradient(to bottom, #3bb6f5 0%, #0e8fd6 100%)',
              color: '#fff',
              fontWeight: 600,
              fontSize: 18,
              borderRadius: 2,
              minWidth: 120,
              minHeight: 48,
              px: 2,
              py: 0.5,
              boxShadow: '0 2px 8px #b3e0ff',
              textTransform: 'none',
              '&:hover': {
                background: 'linear-gradient(to bottom, #0e8fd6 0%, #3bb6f5 100%)',
                color: '#fff',
              },
            }}
          >
            Reset
          </Button>
        </div>
      </div>
    </div>
  );
};

export default VpnServerSettings; 