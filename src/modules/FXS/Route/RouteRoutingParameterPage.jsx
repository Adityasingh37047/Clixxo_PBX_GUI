import React, { useState } from "react";
import {
  ROUTE_MODE_OPTIONS,
  ROUTE_ROUTING_PARAMETER_INITIAL_FORM,
} from "../../../sections/route/constants/RouteRoutingParameterPageConstants";
import {
  Select,
  MenuItem,
  FormControl,
  TextField,
  Alert,
  CircularProgress,
} from "@mui/material";
import {
  C,
  Btn,
  muiSelectSx,
  muiTextFieldSx,
} from "../../../shared/fxsSharedUi";
import {
  advancedFormInlineFooterStyle,
  advancedFormBtnStyle,
} from "../../../shared/fxsSharedUi";

/** Match E1-PRI Route Routing Parameters card radii (10px, not table 20px kit). */
const ROUTE_CARD_RADIUS = 10;

const cardStyle = {
  background: C.cardBg,
  border: `1.5px solid ${C.cardBorder}`,
  borderRadius: ROUTE_CARD_RADIUS,
  overflow: "hidden",
  boxShadow: "0 10px 30px rgba(15,23,42,0.06)",
};

const cardHeaderStyle = {
  width: "100%",
  minHeight: 44,
  background: C.cardBg,
  borderTopLeftRadius: ROUTE_CARD_RADIUS,
  borderTopRightRadius: ROUTE_CARD_RADIUS,
  display: "flex",
  alignItems: "center",
  padding: "7px 14px",
  fontWeight: 700,
  fontSize: 13,
  color: C.labelText,
  borderBottom: `1px solid ${C.cardBorder}`,
};

const fieldLabelStyle = {
  width: "auto",
  minWidth: 130,
  fontSize: 13,
  fontWeight: 600,
  color: C.labelText,
  textAlign: "left",
  marginRight: 10,
  whiteSpace: "nowrap",
  flexShrink: 0,
};

const fieldControlSx = {
  ...muiSelectSx,
  width: 240,
};

const routeCheckPeriodFieldSx = {
  ...muiTextFieldSx,
  width: 240,
  "& .MuiOutlinedInput-root": {
    ...muiTextFieldSx["& .MuiOutlinedInput-root"],
    height: 32,
  },
  "& .MuiInputBase-input": {
    fontSize: 13,
    padding: "6px 10px",
    height: "auto",
    boxSizing: "border-box",
  },
};

const RouteRoutingParameterPage = () => {
  const [formData, setFormData] = useState(
    ROUTE_ROUTING_PARAMETER_INITIAL_FORM,
  );
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ msg: "", type: "success" });

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "success" }), 3500);
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNumberKeyPress = (e) => {
    const key = e.keyCode || e.which;
    if (key > 47 && key < 58) {
      // Allow numbers
    } else if (key !== 8) {
      e.preventDefault();
    }
  };

  const handleSave = () => {
    setLoading(true);
    try {
      showToast("Routing parameters saved successfully.");
    } catch {
      showToast(
        "Failed to save routing parameters. Please try again.",
        "error",
      );
    } finally {
      setTimeout(() => setLoading(false), 800);
    }
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
        {toast.msg && (
          <Alert
            severity={toast.type}
            onClose={() => setToast({ msg: "", type: "success" })}
            sx={{
              position: "fixed",
              top: 16,
              right: 16,
              zIndex: 9999,
              boxShadow: "0 10px 30px rgba(15,23,42,0.06)",
            }}
          >
            {toast.msg}
          </Alert>
        )}

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
          <span>FXS</span>
          <span>&gt;</span>
          <span>Route</span>
          <span>&gt;</span>
          <span style={{ color: C.strongText, fontWeight: 600 }}>
            Routing Parameters
          </span>
        </div>

        <div style={cardStyle}>
          <div style={cardHeaderStyle}>Routing Parameters</div>

          <div className="w-full px-5 pt-3 pb-0">
            <div
              className="space-y-4 w-full max-w-[500px] mx-auto"
              style={{ marginBottom: 12 }}
            >
              <div className="flex items-center justify-between">
                <label style={fieldLabelStyle}>IP-&gt;TEL</label>
                <FormControl size="small">
                  <Select
                    name="ipInRouteMode"
                    value={formData.ipInRouteMode}
                    onChange={(e) =>
                      handleInputChange("ipInRouteMode", e.target.value)
                    }
                    variant="outlined"
                    sx={fieldControlSx}
                  >
                    {ROUTE_MODE_OPTIONS.map((opt) => (
                      <MenuItem
                        key={opt.value}
                        value={opt.value}
                        sx={{ fontSize: 13 }}
                      >
                        {opt.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </div>

              <div className="flex items-center justify-between">
                <label style={fieldLabelStyle}>TEL-&gt;IP</label>
                <FormControl size="small">
                  <Select
                    name="pstnToIPRouteMode"
                    value={formData.pstnToIPRouteMode}
                    onChange={(e) =>
                      handleInputChange("pstnToIPRouteMode", e.target.value)
                    }
                    variant="outlined"
                    sx={fieldControlSx}
                  >
                    {ROUTE_MODE_OPTIONS.map((opt) => (
                      <MenuItem
                        key={opt.value}
                        value={opt.value}
                        sx={{ fontSize: 13 }}
                      >
                        {opt.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </div>

              <div className="flex items-center justify-between">
                <label style={fieldLabelStyle}>Route Detection Cycle (s)</label>
                <TextField
                  id="RouteCheckPeriod"
                  value={formData.routeCheckPeriod || ""}
                  onChange={(e) =>
                    handleInputChange("routeCheckPeriod", e.target.value)
                  }
                  onKeyPress={handleNumberKeyPress}
                  inputProps={{ maxLength: 31 }}
                  variant="outlined"
                  size="small"
                  sx={routeCheckPeriodFieldSx}
                  autoComplete="off"
                />
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
