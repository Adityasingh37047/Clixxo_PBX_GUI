import React, { useState, useEffect } from "react";
import {
  ROUTE_SETTINGS_OPTIONS,
  ROUTE_SETTINGS_DEFAULTS,
} from "../constants/RouteRoutingParameterPageConstants";
import {
  Select,
  MenuItem,
  FormControl,
  Button,
  CircularProgress,
} from "@mui/material";

// ── Color Palette ─────────────────────────────────────────────────────────────
const C = {
  pageBg: "#eef2f7",
  cardBg: "#ffffff",
  cardBorder: "#9ca3af",
  labelText: "#1e293b",
  valueText: "#1e293b",
  mutedText: "#94a3b8",
  accent: "#1e293b",
  errorRed: "#dc2626",
};

const RouteRoutingParameterPage = () => {
  const [settings, setSettings] = useState({ ...ROUTE_SETTINGS_DEFAULTS });
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  const SectionHeading = ({ title }) => (
    <div style={{ margin: "16px 0 24px 0", position: "relative" }}>
      <div style={{ borderTop: `1px solid ${C.cardBorder}` }} />
      <span
        style={{
          position: "absolute",
          top: -10,
          left: 0,
          background: "#fff",
          paddingRight: 8,
          fontSize: 13,
          fontWeight: 600,
          color: C.mutedText,
        }}
      >
        {title}
      </span>
    </div>
  );

  const handleSave = () => {
    setLoading(true);
    // Simulate save logic
    setTimeout(() => {
      setSaved(true);
      setLoading(false);
      alert("Settings Saved Successfully!");
    }, 800);
  };

  const handleChange = (name, value) => {
    setSettings((prev) => ({ ...prev, [name]: value }));
    setSaved(false);
  };

  return (
    <div
      style={{
        backgroundColor: C.pageBg,
        minHeight: "calc(100vh - 80px)",
        padding: 16,
      }}
    >
      <div style={{ width: "100%", maxWidth: 1000, margin: "0 auto" }}>
        {/* Breadcrumb */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 12,
          }}
        >
          <div style={{ fontSize: 11, color: C.mutedText }}>
            E1-PRI &rsaquo; Route &rsaquo;{" "}
            <span style={{ color: C.valueText, fontWeight: 600 }}>
              Route Settings
            </span>
          </div>
        </div>

        {/* Main Card */}
        <div
          style={{
            background: C.cardBg,
            border: `1px solid ${C.cardBorder}`,
            borderRadius: 8,
            overflow: "hidden",
            boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
          }}
        >
          <div style={{ padding: "24px 28px" }}>
            <SectionHeading title="Route Settings" />

            <div style={{ padding: "24px 32px" }}>
              <div className="flex-1 py-4 px-16">
                <div className="space-y-6">
                  {/* IP Incoming */}
                  <div className="flex items-center justify-between">
                    <label
                      className="text-sm text-gray-600 font-semibold text-left whitespace-nowrap"
                      style={{
                        width: "320px",
                        marginRight: "10px",
                        lineHeight: "1.4",
                      }}
                    >
                      IP Incoming
                    </label>
                    <FormControl size="small">
                      <Select
                        name="ipIncoming"
                        value={settings.ipIncoming}
                        onChange={(e) =>
                          handleChange("ipIncoming", e.target.value)
                        }
                        variant="outlined"
                        style={{ width: "240px", height: "36px" }}
                        sx={{
                          fontSize: 14,
                          height: 36,
                          backgroundColor: "#ffffff",
                          "& .MuiOutlinedInput-root": {
                            backgroundColor: "#ffffff",
                            height: 36,
                            "& fieldset": { borderColor: "#9ca3af" },
                            "&:hover fieldset": { borderColor: "#1e293b" },
                            "&.Mui-focused fieldset": {
                              borderColor: "#1e293b",
                            },
                          },
                          "& .MuiSelect-select": {
                            backgroundColor: "#ffffff",
                            padding: "6px 12px",
                            height: "auto",
                            display: "flex",
                            alignItems: "center",
                            fontSize: "14px",
                            fontWeight: 500,
                          },
                        }}
                      >
                        {ROUTE_SETTINGS_OPTIONS.map((opt) => (
                          <MenuItem
                            key={opt.value}
                            value={opt.value}
                            sx={{ fontSize: 14 }}
                          >
                            {opt.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </div>

                  {/* PSTN Incoming */}
                  <div className="flex items-center justify-between">
                    <label
                      className="text-sm text-gray-600 font-semibold text-left whitespace-nowrap"
                      style={{
                        width: "320px",
                        marginRight: "10px",
                        lineHeight: "1.4",
                      }}
                    >
                      PSTN Incoming
                    </label>
                    <FormControl size="small">
                      <Select
                        name="pstnIncoming"
                        value={settings.pstnIncoming}
                        onChange={(e) =>
                          handleChange("pstnIncoming", e.target.value)
                        }
                        variant="outlined"
                        style={{ width: "240px", height: "36px" }}
                        sx={{
                          fontSize: 14,
                          height: 36,
                          backgroundColor: "#ffffff",
                          "& .MuiOutlinedInput-root": {
                            backgroundColor: "#ffffff",
                            height: 36,
                            "& fieldset": { borderColor: "#9ca3af" },
                            "&:hover fieldset": { borderColor: "#1e293b" },
                            "&.Mui-focused fieldset": {
                              borderColor: "#1e293b",
                            },
                          },
                          "& .MuiSelect-select": {
                            backgroundColor: "#ffffff",
                            padding: "6px 12px",
                            height: "auto",
                            display: "flex",
                            alignItems: "center",
                            fontSize: "14px",
                            fontWeight: 500,
                          },
                        }}
                      >
                        {ROUTE_SETTINGS_OPTIONS.map((opt) => (
                          <MenuItem
                            key={opt.value}
                            value={opt.value}
                            sx={{ fontSize: 14 }}
                          >
                            {opt.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Actions Footer */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 16,
              padding: "16px 24px",
              borderTop: `1px solid ${C.cardBorder}`,
              background: "#f8fafc",
            }}
          >
            <Button
              variant="contained"
              onClick={handleSave}
              disabled={loading}
              startIcon={
                loading && <CircularProgress size={16} color="inherit" />
              }
              sx={{
                background: "#1e2d42",
                color: "#fff",
                fontWeight: 600,
                fontSize: 13,
                textTransform: "none",
                padding: "8px 40px",
                minWidth: 140,
                borderRadius: 1.5,
                "&:hover": { background: "#0f172a" },
              }}
            >
              {loading ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RouteRoutingParameterPage;
