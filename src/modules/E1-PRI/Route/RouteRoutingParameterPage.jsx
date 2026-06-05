import React, { useState } from "react";
import {
  ROUTE_SETTINGS_OPTIONS,
  ROUTE_SETTINGS_DEFAULTS,
} from "../../../constants/RouteRoutingParameterPageConstants";
import { Select, MenuItem, FormControl, CircularProgress } from "@mui/material";
import {
  C,
  Btn,
  CARD_RADIUS,
  muiSelectSx,
} from "../../../sections/route/routeSharedUi";
import {
  advancedFormBtnStyle,
  advancedFormInlineFooterStyle,
} from "../../../sections/advanced/advancedSharedUi";

const cardStyle = {
  background: C.cardBg,
  border: `1.5px solid ${C.cardBorder}`,
  borderRadius: 10,
  overflow: "hidden",
  boxShadow: "0 10px 30px rgba(15,23,42,0.06)",
};

const cardHeaderStyle = {
  width: "100%",
  minHeight: 44,
  background: C.cardBg,
  borderTopLeftRadius: CARD_RADIUS,
  borderTopRightRadius: CARD_RADIUS,
  display: "flex",
  alignItems: "center",
  padding: "7px 14px",
  fontWeight: 700,
  fontSize: 13,
  color: C.labelText,
  borderBottom: `1px solid ${C.cardBorder}`,
};

const labelStyle = {
  width: 320,
  marginRight: 10,
  lineHeight: 1.4,
  fontSize: 13,
  fontWeight: 600,
  color: C.labelText,
  textAlign: "left",
  whiteSpace: "nowrap",
  flexShrink: 0,
};

const RouteRoutingParameterPage = () => {
  const [settings, setSettings] = useState({ ...ROUTE_SETTINGS_DEFAULTS });
  const [loading, setLoading] = useState(false);

  const handleSave = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      alert("Settings Saved Successfully!");
    }, 800);
  };

  const handleChange = (name, value) => {
    setSettings((prev) => ({ ...prev, [name]: value }));
  };

  const renderSelect = (name) => (
    <FormControl size="small">
      <Select
        name={name}
        value={settings[name]}
        onChange={(e) => handleChange(name, e.target.value)}
        variant="outlined"
        sx={{ ...muiSelectSx, width: 240 }}
      >
        {ROUTE_SETTINGS_OPTIONS.map((opt) => (
          <MenuItem key={opt.value} value={opt.value} sx={{ fontSize: 13 }}>
            {opt.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );

  return (
    <div
      style={{
        backgroundColor: C.pageBg,
        minHeight: "calc(100vh - 80px)",
        padding: 16,
      }}
    >
      <div style={{ width: "100%", maxWidth: 1000, margin: "0 auto" }}>
        <div
          style={{
            fontSize: 12,
            color: C.mutedText,
            marginBottom: 16,
            fontWeight: 400,
            display: "flex",
            alignItems: "center",
            gap: 4,
          }}
        >
          <span>E1-PRI</span>
          <span>&gt;</span>
          <span>Route</span>
          <span>&gt;</span>
          <span style={{ color: C.strongText, fontWeight: 600 }}>
            Route Settings
          </span>
        </div>

        <div style={cardStyle}>
          <div style={cardHeaderStyle}>Route Settings</div>

          <div style={{ padding: "24px 32px 0" }}>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 24,
                maxWidth: 640,
                margin: "0 auto",
                marginBottom: 12,
              }}
            >
              <div className="flex items-center justify-between">
                <label style={labelStyle}>IP Incoming</label>
                {renderSelect("ipIncoming")}
              </div>

              <div className="flex items-center justify-between">
                <label style={labelStyle}>PSTN Incoming</label>
                {renderSelect("pstnIncoming")}
              </div>
            </div>
          </div>

          <div
            style={{
              ...advancedFormInlineFooterStyle,
              width: "100%",
              marginLeft: 0,
              marginRight: 0,
            }}
          >
            <Btn
              variant="primary"
              onClick={handleSave}
              disabled={loading}
              style={advancedFormBtnStyle}
            >
              {loading ? (
                <>
                  <CircularProgress size={16} sx={{ color: "inherit" }} />
                  Saving...
                </>
              ) : (
                "Save"
              )}
            </Btn>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RouteRoutingParameterPage;
