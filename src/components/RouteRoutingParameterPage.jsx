import React, { useState } from "react";
import {
  ROUTE_SETTINGS_OPTIONS,
  ROUTE_SETTINGS_DEFAULTS,
} from "../constants/RouteRoutingParameterPageConstants";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Button from "@mui/material/Button";

const RouteRoutingParameterPage = () => {
  const [settings, setSettings] = useState({ ...ROUTE_SETTINGS_DEFAULTS });
  const [saved, setSaved] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings((prev) => ({ ...prev, [name]: value }));
    setSaved(false);
  };

  const handleSave = () => {
    // Here you would typically save to backend or localStorage
    alert("Settings saved!");
  };

  return (
    <div
      className="bg-gray-50 min-h-[calc(100vh-80px)] py-6 pt-2 flex justify-center"
      style={{ backgroundColor: "#dde0e4" }}
    >
      <div style={{ width: "1000px", margin: "0 auto" }}>
        {/* Header */}
        <div
          className="rounded-t-lg h-8 flex items-center justify-center font-semibold text-[18px] text-[#ffffff] shadow-sm mt-0"
          style={{
            background: "linear-gradient(#3E5475 100%)",
            boxShadow: "0 2px 8px 0 rgba(80,160,255,0.10)",
          }}
        >
          {" "}
          Route Settings
        </div>

        {/* Content */}
        <div
          className="rounded-b-lg border-2 border-gray-400 border-t-0 shadow-sm flex flex-col"
          style={{ backgroundColor: "#dde0e4" }}
        >
          <div className="flex-1 py-6 px-55">
            <div className="space-y-4">
              {/* IP Incoming */}
              <div className="flex items-center" style={{ gap: "60px" }}>
                <label
                  className="text-base text-gray-700 font-medium text-left"
                  style={{ width: "280px" }}
                >
                  IP Incoming:
                </label>
                <Select
                  name="ipIncoming"
                  value={settings.ipIncoming}
                  onChange={handleChange}
                  variant="outlined"
                  size="small"
                  style={{ width: "280px" }}
                  sx={{
                    fontSize: 16,
                    height: 32,
                    backgroundColor: "#ffffff",
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#999999",
                    },
                    "& .MuiSelect-select": {
                      padding: "4px 10px",
                      lineHeight: "24px",
                      backgroundColor: "transparent",
                    },
                  }}
                >
                  {ROUTE_SETTINGS_OPTIONS.map((opt) => (
                    <MenuItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </MenuItem>
                  ))}
                </Select>
              </div>

              {/* PSTN Incoming */}
              <div className="flex items-center" style={{ gap: "60px" }}>
                <label
                  className="text-base text-gray-700 font-medium text-left"
                  style={{ width: "280px" }}
                >
                  PSTN Incoming:
                </label>
                <Select
                  name="pstnIncoming"
                  value={settings.pstnIncoming}
                  onChange={handleChange}
                  variant="outlined"
                  size="small"
                  style={{ width: "280px" }}
                  sx={{
                    fontSize: 16,
                    height: 32,
                    backgroundColor: "#ffffff",
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#999999",
                    },
                    "& .MuiSelect-select": {
                      padding: "4px 10px",
                      lineHeight: "24px",
                      backgroundColor: "transparent",
                    },
                  }}
                >
                  {ROUTE_SETTINGS_OPTIONS.map((opt) => (
                    <MenuItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </MenuItem>
                  ))}
                </Select>
              </div>
            </div>
          </div>
        </div>
        {/* Buttons */}
        <div className="flex justify-center gap-8 mt-6">
          <Button
            variant="contained"
            onClick={handleSave}
            sx={{
              background:
                "linear-gradient(to bottom, #5A6F8F 0%, #3E5475 100%)",
              color: "#fff",
              fontWeight: 600,
              fontSize: "16px",
              borderRadius: 1.5,
              minWidth: 120,
              minHeight: 40,
              px: 2,
              py: 0.5,
              boxShadow: "0 2px 8px rgba(62, 84, 117, 0.4)",
              textTransform: "none",

              "&:hover": {
                background:
                  "linear-gradient(to bottom, #3E5475 0%, #2f405c 100%)",
                color: "#fff",
              },

              "&:disabled": {
                background: "#cbd5e1",
                color: "#64748b",
              },
            }}
          >
            Save
          </Button>
          {/* <Button
            variant="contained"
            onClick={() => { setSettings({ ...ROUTE_SETTINGS_DEFAULTS }); setSaved(false); }}
            sx={{
              background: 'linear-gradient(to bottom, #3bb6f5 0%, #0e8fd6 100%)',
              color: '#fff',
              fontWeight: 600,
              fontSize: '18px',
              borderRadius: 2,
              minWidth: 140,
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
          >Reset</Button> */}
        </div>
      </div>
    </div>
  );
};

export default RouteRoutingParameterPage;
