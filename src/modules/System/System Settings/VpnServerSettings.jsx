import React, { useState } from "react";
import {
  VPN_SERVER_SETTINGS_FIELDS,
  VPN_SERVER_SETTINGS_INITIAL_FORM,
} from "../../../constants/VpnServerSettingsConstants";
import {
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Checkbox,
  FormControlLabel,
} from "@mui/material";

// ── Local field UI (inlined from maitenanceSharedUi) ──
const OUTLINED_BORDER = "rgba(0, 0, 0, 0.23)";
const OUTLINED_HOVER = "rgba(0, 0, 0, 0.87)";
const OUTLINED_FOCUS = "#1976d2";

const muiTextFieldSx = {
  "& .MuiOutlinedInput-root": {
    backgroundColor: "#fff",
    "& fieldset": {
      borderColor: OUTLINED_BORDER,
      transition: "border-color 0.2s ease",
    },
    "&:hover fieldset": { borderColor: OUTLINED_HOVER },
    "&.Mui-focused fieldset": {
      borderColor: OUTLINED_FOCUS,
      borderWidth: 2,
    },
    "&.Mui-focused:hover fieldset": {
      borderColor: OUTLINED_FOCUS,
      borderWidth: 2,
    },
  },
};

const muiSelectSx = {
  fontSize: 13,
  backgroundColor: "#fff",
  "& .MuiOutlinedInput-root": {
    minHeight: 36,
    backgroundColor: "#fff",
  },
  "& .MuiSelect-select": {
    display: "flex",
    alignItems: "center",
    padding: "7px 32px 7px 10px !important",
    lineHeight: 1.35,
    boxSizing: "border-box",
  },
  "& .MuiOutlinedInput-notchedOutline": {
    borderColor: OUTLINED_BORDER,
    transition: "border-color 0.2s ease",
  },
  "&:hover .MuiOutlinedInput-notchedOutline": {
    borderColor: OUTLINED_HOVER,
  },
  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
    borderColor: OUTLINED_FOCUS,
    borderWidth: 2,
  },
};

const systemToolsMuiSelectSx = {
  ...muiSelectSx,
  backgroundColor: "#f8fafc",
  borderRadius: "6px",
  fontSize: 14,
};
const VpnServerSettings = () => {
  const [form, setForm] = useState(VPN_SERVER_SETTINGS_INITIAL_FORM);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleReset = () => {
    setForm(VPN_SERVER_SETTINGS_INITIAL_FORM);
  };

  const handleSave = (e) => {
    e.preventDefault();
    alert("Settings saved!");
  };

  return (
    <div className="bg-gray-50 min-h-[calc(100vh-200px)] py-0 flex flex-col items-center">
      <div className="w-full max-w-4xl mx-auto flex flex-col items-center">
        <div className="w-full bg-gradient-to-b from-[#b3e0ff] via-[#6ec1f7] to-[#3b8fd6] h-12 flex items-center justify-center font-semibold text-lg text-gray-600 shadow mb-0 border-t-2 border-x-2 border-gray-400">
          VPN Server Settings
        </div>
        <form
          className="w-full bg-gray-50 border-x-2 border-b-2 border-gray-400 flex flex-col gap-0 px-2 md:px-8 py-6"
          onSubmit={handleSave}
        >
          <div className="flex flex-col gap-6 w-full">
            <div className="flex flex-col md:flex-row md:items-center gap-2 w-full">
              <div className="md:w-1/2 w-full text-[17px] font-medium text-gray-600 text-left mb-1 md:mb-0">
                VPN Server:
              </div>
              <div className="md:w-1/2 w-full flex items-center">
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={form.enabled}
                      onChange={handleChange}
                      name="enabled"
                      sx={{ p: 0.5 }}
                    />
                  }
                  label={<span className="text-[16px]">Enable</span>}
                  className="pl-1"
                />
              </div>
            </div>
            <div className="flex flex-col md:flex-row md:items-center gap-2 w-full ">
              <div className="md:w-1/2 w-full text-[17px] font-medium text-gray-600 text-left mb-1 md:mb-0">
                VPN Type:
              </div>
              <div className="md:w-1/2 w-full">
                <FormControl size="small" className="w-full">
                  <Select
                    name="vpnType"
                    value={form.vpnType}
                    onChange={handleChange}
                    variant="outlined"
                    sx={systemToolsMuiSelectSx}
                  >
                    {VPN_SERVER_SETTINGS_FIELDS.find(
                      (f) => f.name === "vpnType",
                    ).options.map((opt) => (
                      <MenuItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </div>
            </div>
            <div className="flex flex-col md:flex-row md:items-center gap-2 w-full">
              <div className="md:w-1/2 w-full text-[17px] font-medium text-gray-600 text-left mb-1 md:mb-0">
                Identity Verification Protocol:
              </div>
              <div className="md:w-1/2 w-full">
                <FormControl size="small" className="w-full">
                  <Select
                    name="identityProtocol"
                    value={form.identityProtocol}
                    onChange={handleChange}
                    variant="outlined"
                    sx={systemToolsMuiSelectSx}
                  >
                    {VPN_SERVER_SETTINGS_FIELDS.find(
                      (f) => f.name === "identityProtocol",
                    ).options.map((opt) => (
                      <MenuItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </div>
            </div>
            <div className="flex flex-col md:flex-row md:items-center gap-2 w-full">
              <div className="md:w-1/2 w-full text-[17px] font-medium text-gray-600 text-left mb-1 md:mb-0">
                Client IP Range:
              </div>
              <div className="md:w-1/2 w-full">
                <TextField
                  type="text"
                  name="clientIpRange"
                  value={form.clientIpRange}
                  onChange={handleChange}
                  size="small"
                  variant="outlined"
                  sx={muiTextFieldSx}
                />
              </div>
            </div>
            <div className="flex flex-col md:flex-row md:items-center gap-2 w-full">
              <div className="md:w-1/2 w-full text-[17px] font-medium text-gray-600 text-left mb-1 md:mb-0">
                Preferred WINS Address (Optional):
              </div>
              <div className="md:w-1/2 w-full">
                <TextField
                  type="text"
                  name="preferredWINS"
                  value={form.preferredWINS}
                  onChange={handleChange}
                  size="small"
                  variant="outlined"
                  sx={muiTextFieldSx}
                />
              </div>
            </div>
            <div className="flex flex-col md:flex-row md:items-center gap-2 w-full">
              <div className="md:w-1/2 w-full text-[17px] font-medium text-gray-600 text-left mb-1 md:mb-0">
                Spare WINS Address (Optional):
              </div>
              <div className="md:w-1/2 w-full">
                <TextField
                  type="text"
                  name="spareWINS"
                  value={form.spareWINS}
                  onChange={handleChange}
                  size="small"
                  variant="outlined"
                  sx={muiTextFieldSx}
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
              background:
                "linear-gradient(to bottom, #3bb6f5 0%, #0e8fd6 100%)",
              color: "#fff",
              fontWeight: 600,
              fontSize: 18,
              borderRadius: 2,
              minWidth: 120,
              minHeight: 48,
              px: 2,
              py: 0.5,
              boxShadow: "0 2px 8px #b3e0ff",
              textTransform: "none",
              "&:hover": {
                background:
                  "linear-gradient(to bottom, #0e8fd6 0%, #3bb6f5 100%)",
                color: "#fff",
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
              background:
                "linear-gradient(to bottom, #3bb6f5 0%, #0e8fd6 100%)",
              color: "#fff",
              fontWeight: 600,
              fontSize: 18,
              borderRadius: 2,
              minWidth: 120,
              minHeight: 48,
              px: 2,
              py: 0.5,
              boxShadow: "0 2px 8px #b3e0ff",
              textTransform: "none",
              "&:hover": {
                background:
                  "linear-gradient(to bottom, #0e8fd6 0%, #3bb6f5 100%)",
                color: "#fff",
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
